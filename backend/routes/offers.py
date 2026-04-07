from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId
from datetime import datetime
from database import db

offers_bp = Blueprint("offers", __name__)

def serialize_offer(offer):
    offer["_id"] = str(offer["_id"])
    if "deadline" in offer and offer["deadline"]:
        offer["deadline"] = offer["deadline"].isoformat()
    if "createdAt" in offer and offer["createdAt"]:
        offer["createdAt"] = offer["createdAt"].isoformat()
    # include category if present
    if "category" in offer:
        offer["category"] = offer["category"]
    return offer


# ─── Create Offer (Client only) ──────────────────────────────────────────────
@offers_bp.route("/", methods=["POST"])
@jwt_required()
def create_offer():
    claims = get_jwt()
    if claims.get("role") != "client":
        return jsonify({"error": "Only clients can create offers"}), 403

    data = request.json
    required = ["title", "description", "budget"]
    if not all(field in data for field in required):
        return jsonify({"error": "Missing required fields: title, description, budget"}), 400

    if not isinstance(data["budget"], (int, float)) or data["budget"] <= 0:
        return jsonify({"error": "Budget must be a positive number"}), 400

    offer = {
        "title": data["title"].strip(),
        "description": data["description"].strip(),
        "budget": data["budget"],
        "deadline": datetime.fromisoformat(data["deadline"]) if data.get("deadline") else None,
        "category": data.get("category") or None,
        "clientId": get_jwt_identity(),
        "status": "open",   # open | in_progress | closed
        "createdAt": datetime.utcnow()
    }
    result = db.offers.insert_one(offer)
    offer["_id"] = str(result.inserted_id)
    return jsonify({"message": "Offer created", "offer": serialize_offer(offer)}), 201


# ─── Get All Open Offers ──────────────────────────────────────────────────────
@offers_bp.route("/", methods=["GET"])
@jwt_required()
def get_offers():
    status_filter = request.args.get("status")         # ?status=open
    client_filter = request.args.get("clientId")       # ?clientId=...
    category_filter = request.args.get("category")     # ?category=Design

    query = {}
    if status_filter:
        query["status"] = status_filter
    if client_filter:
        query["clientId"] = client_filter
    if category_filter:
        query["category"] = category_filter

    offers = [serialize_offer(o) for o in db.offers.find(query).sort("createdAt", -1)]
    return jsonify(offers), 200


# ─── Get Single Offer ─────────────────────────────────────────────────────────
@offers_bp.route("/<offer_id>", methods=["GET"])
@jwt_required()
def get_offer(offer_id):
    try:
        offer = db.offers.find_one({"_id": ObjectId(offer_id)})
    except Exception:
        return jsonify({"error": "Invalid offer ID"}), 400

    if not offer:
        return jsonify({"error": "Offer not found"}), 404

    return jsonify(serialize_offer(offer)), 200


# ─── Update Offer (Client who owns it) ───────────────────────────────────────
@offers_bp.route("/<offer_id>", methods=["PUT"])
@jwt_required()
def update_offer(offer_id):
    current_user = get_jwt_identity()
    claims = get_jwt()

    try:
        offer = db.offers.find_one({"_id": ObjectId(offer_id)})
    except Exception:
        return jsonify({"error": "Invalid offer ID"}), 400

    if not offer:
        return jsonify({"error": "Offer not found"}), 404

    # Only the owner or admin can update
    if offer["clientId"] != current_user and claims.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json
    allowed = ["title", "description", "budget", "deadline", "status", "category"]
    updates = {k: v for k, v in data.items() if k in allowed}

    if "deadline" in updates:
        updates["deadline"] = datetime.fromisoformat(updates["deadline"])

    db.offers.update_one({"_id": ObjectId(offer_id)}, {"$set": updates})
    updated = db.offers.find_one({"_id": ObjectId(offer_id)})
    return jsonify(serialize_offer(updated)), 200


# ─── Delete Offer (Admin or Owner) ───────────────────────────────────────────
@offers_bp.route("/<offer_id>", methods=["DELETE"])
@jwt_required()
def delete_offer(offer_id):
    current_user = get_jwt_identity()
    claims = get_jwt()

    try:
        offer = db.offers.find_one({"_id": ObjectId(offer_id)})
    except Exception:
        return jsonify({"error": "Invalid offer ID"}), 400

    if not offer:
        return jsonify({"error": "Offer not found"}), 404

    if offer["clientId"] != current_user and claims.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    db.offers.delete_one({"_id": ObjectId(offer_id)})
    # Also remove related proposals and messages
    db.proposals.delete_many({"offerId": ObjectId(offer_id)})
    db.messages.delete_many({"offerId": ObjectId(offer_id)})

    return jsonify({"message": "Offer deleted"}), 200


# ─── Get My Offers (Client dashboard) ────────────────────────────────────────
@offers_bp.route("/my/offers", methods=["GET"])
@jwt_required()
def get_my_offers():
    current_user = get_jwt_identity()
    offers = [serialize_offer(o) for o in db.offers.find({"clientId": current_user}).sort("createdAt", -1)]
    return jsonify(offers), 200