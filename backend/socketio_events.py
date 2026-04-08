from collections import defaultdict
from datetime import datetime

from bson import ObjectId
from flask import request, session
from flask_jwt_extended import decode_token
from flask_socketio import emit, join_room, leave_room

from db.mongo import db
from routes.messages import serialize_message

_offer_members = defaultdict(set)
_user_rooms = defaultdict(set)


def _offer_room(offer_id: str) -> str:
    return f"offer:{offer_id}"


def _find_offer(offer_id: str):
    try:
        return db.offers.find_one({"_id": ObjectId(offer_id)})
    except Exception:
        return None


def _is_participant(user_id: str, offer: dict) -> bool:
    return offer.get("clientId") == user_id or offer.get("acceptedFreelancerId") == user_id


def _other_user(offer: dict, user_id: str) -> tuple[str, str]:
    if offer.get("clientId") == user_id:
        return offer.get("acceptedFreelancerId") or "", "freelancer"
    return offer.get("clientId") or "", "client"


def _build_conversation(offer: dict, user_id: str, last_message: dict) -> dict | None:
    other_user_id, other_role = _other_user(offer, user_id)
    if not other_user_id:
        return None

    unread_count = db.messages.count_documents({
        "offerId": offer["_id"],
        "receiverId": user_id,
        "read": False
    })

    return {
        "offerId": str(offer["_id"]),
        "offerTitle": offer.get("title"),
        "offerStatus": offer.get("status"),
        "lastMessage": last_message,
        "unreadCount": unread_count,
        "otherUserId": str(other_user_id),
        "otherRole": other_role
    }


def init_socketio(socketio) -> None:
    @socketio.on("connect")
    def on_connect(auth):
        token = None
        if isinstance(auth, dict):
            token = auth.get("token")
        if not token:
            token = request.args.get("token")
        if not token:
            return False

        try:
            decoded = decode_token(token)
        except Exception:
            return False

        user_id = decoded.get("sub")
        if not user_id:
            return False

        session["user_id"] = user_id
        join_room(f"user:{user_id}")
        emit("connected", {"userId": user_id})

    @socketio.on("disconnect")
    def on_disconnect():
        user_id = session.get("user_id")
        if not user_id:
            return
        for offer_id in list(_user_rooms.get(user_id, set())):
            _offer_members[offer_id].discard(user_id)
        _user_rooms.pop(user_id, None)

    @socketio.on("join_offer")
    def on_join_offer(data):
        user_id = session.get("user_id")
        offer_id = (data or {}).get("offerId")
        if not user_id or not offer_id:
            emit("error", {"error": "Missing offerId"})
            return

        offer = _find_offer(offer_id)
        if not offer or not _is_participant(user_id, offer):
            emit("error", {"error": "Unauthorized"})
            return

        join_room(_offer_room(offer_id))
        _offer_members[offer_id].add(user_id)
        _user_rooms[user_id].add(offer_id)
        emit("joined", {"offerId": offer_id})

    @socketio.on("leave_offer")
    def on_leave_offer(data):
        user_id = session.get("user_id")
        offer_id = (data or {}).get("offerId")
        if not user_id or not offer_id:
            return

        leave_room(_offer_room(offer_id))
        _offer_members[offer_id].discard(user_id)
        _user_rooms[user_id].discard(offer_id)

    @socketio.on("message:send")
    def on_message_send(data):
        user_id = session.get("user_id")
        if not user_id:
            return {"error": "Unauthorized"}

        offer_id = (data or {}).get("offerId")
        receiver_id = (data or {}).get("receiverId")
        content = (data or {}).get("content", "").strip()
        if not offer_id or not receiver_id or not content:
            return {"error": "Missing offerId, receiverId, or content"}

        offer = _find_offer(offer_id)
        if not offer:
            return {"error": "Offer not found"}
        if not _is_participant(user_id, offer):
            return {"error": "Unauthorized"}

        expected_receiver, _ = _other_user(offer, user_id)
        if not expected_receiver or receiver_id != expected_receiver:
            return {"error": "Invalid receiver"}

        is_read = receiver_id in _offer_members.get(offer_id, set())

        message = {
            "senderId": user_id,
            "receiverId": receiver_id,
            "offerId": ObjectId(offer_id),
            "offerIdStr": str(offer_id),
            "content": content,
            "createdAt": datetime.utcnow(),
            "read": is_read
        }
        result = db.messages.insert_one(message)
        message["_id"] = str(result.inserted_id)
        payload = serialize_message(message)

        emit("message:new", payload, room=_offer_room(offer_id))

        sender_convo = _build_conversation(offer, user_id, payload)
        receiver_convo = _build_conversation(offer, receiver_id, payload)
        if sender_convo:
            emit("conversation:update", sender_convo, room=f"user:{user_id}")
        if receiver_convo:
            emit("conversation:update", receiver_convo, room=f"user:{receiver_id}")

        return {"ok": True, "message": payload}
