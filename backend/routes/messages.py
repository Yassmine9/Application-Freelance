from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from db.mongo import db

messages_bp = Blueprint("messages", __name__)

def serialize_message(msg):
    msg["_id"] = str(msg["_id"])
    msg["offerId"] = str(msg["offerId"])
    if "createdAt" in msg and msg["createdAt"]:
        msg["createdAt"] = msg["createdAt"].isoformat()
    return msg


# ─── Send Message ─────────────────────────────────────────────────────────────
@messages_bp.route("/", methods=["POST"])
@jwt_required()
def send_message():
    data = request.json
    required = ["receiverId", "offerId", "content"]
    if not all(field in data for field in required):
        return jsonify({"error": "Missing required fields: receiverId, offerId, content"}), 400

    if not data["content"].strip():
        return jsonify({"error": "Message content cannot be empty"}), 400

    # Validate offer exists
    try:
        offer = db.offers.find_one({"_id": ObjectId(data["offerId"])})
    except Exception:
        return jsonify({"error": "Invalid offer ID"}), 400

    if not offer:
        return jsonify({"error": "Offer not found"}), 404

    current_user = get_jwt_identity()

    # Ensure sender is either the client or the accepted freelancer
    is_client = offer["clientId"] == current_user
    is_freelancer = offer.get("acceptedFreelancerId") == current_user

    if not is_client and not is_freelancer:
        return jsonify({"error": "You are not a participant in this conversation"}), 403

    message = {
        "senderId": current_user,
        "receiverId": data["receiverId"],
        "offerId": ObjectId(data["offerId"]),
        "content": data["content"].strip(),
        "createdAt": datetime.utcnow(),
        "read": False
    }
    result = db.messages.insert_one(message)
    message["_id"] = str(result.inserted_id)
    return jsonify({"message": "Message sent", "data": serialize_message(message)}), 201


# ─── Get Messages for Offer ───────────────────────────────────────────────────
@messages_bp.route("/<offer_id>", methods=["GET"])
@jwt_required()
def get_messages(offer_id):
    current_user = get_jwt_identity()

    try:
        offer = db.offers.find_one({"_id": ObjectId(offer_id)})
    except Exception:
        return jsonify({"error": "Invalid offer ID"}), 400

    if not offer:
        return jsonify({"error": "Offer not found"}), 404

    # Only participants can read messages
    is_client = offer["clientId"] == current_user
    is_freelancer = offer.get("acceptedFreelancerId") == current_user

    if not is_client and not is_freelancer:
        return jsonify({"error": "Unauthorized"}), 403

    messages = [serialize_message(m) for m in
                db.messages.find({"offerId": ObjectId(offer_id)}).sort("createdAt", 1)]

    # Mark received messages as read
    db.messages.update_many(
        {"offerId": ObjectId(offer_id), "receiverId": current_user, "read": False},
        {"$set": {"read": True}}
    )

    return jsonify(messages), 200


# ─── Get All Conversations for Current User ───────────────────────────────────
@messages_bp.route("/conversations", methods=["GET"])
@jwt_required()
def get_conversations():
    current_user = get_jwt_identity()

    # Find all offers where the user is client or accepted freelancer
    offers = list(db.offers.find({
        "$or": [
            {"clientId": current_user},
            {"acceptedFreelancerId": current_user}
        ]
    }))

    conversations = []
    for offer in offers:
        # Get last message
        last_msg = db.messages.find_one(
            {"offerId": offer["_id"]},
            sort=[("createdAt", -1)]
        )
        # Count unread
        unread_count = db.messages.count_documents({
            "offerId": offer["_id"],
            "receiverId": current_user,
            "read": False
        })

        conversations.append({
            "offerId": str(offer["_id"]),
            "offerTitle": offer["title"],
            "offerStatus": offer["status"],
            "lastMessage": serialize_message(last_msg) if last_msg else None,
            "unreadCount": unread_count
        })

    return jsonify(conversations), 200