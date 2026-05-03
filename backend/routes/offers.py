from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId
from datetime import datetime
from db.mongo import db
from utils.uploads import save_upload

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
    if offer.get("cahierChargePath"):
        offer["cahierChargeUrl"] = f"/uploads/{offer['cahierChargePath']}"
    return offer


# ─── Create Offer (Client only) ──────────────────────────────────────────────
@offers_bp.route("/", methods=["POST"])
@jwt_required()
def create_offer():
    claims = get_jwt()
    if claims.get("role") != "client":
        return jsonify({"error": "Only clients can create offers"}), 403

    title = (request.form.get("title") or "").strip()
    budget_raw = request.form.get("budget")
    deadline_raw = request.form.get("deadline")
    category = request.form.get("category")
    cahier_charge = request.files.get("cahier_charge")

    if not title or not budget_raw:
        return jsonify({"error": "Missing required fields: title, budget"}), 400

    try:
        budget = float(budget_raw)
    except ValueError:
        return jsonify({"error": "Budget must be a number"}), 400

    if budget <= 0:
        return jsonify({"error": "Budget must be a positive number"}), 400

    if not cahier_charge:
        return jsonify({"error": "Cahier de charge file is required"}), 400

    try:
        upload = save_upload(cahier_charge, "cahier_charge")
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    offer = {
        "title": title,
        "budget": budget,
        "deadline": datetime.fromisoformat(deadline_raw) if deadline_raw else None,
        "category": category or None,
        "cahierChargePath": upload["relative_path"],
        "cahierChargeName": upload["filename"],
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
    status_filter = request.args.get("status")        
    client_filter = request.args.get("clientId")      
    category_filter = request.args.get("category")     

    query = {}
    
    # CRITICAL: If no status specified, only show open offers (available for bidding)
    if not status_filter:
        query["status"] = "open"
    elif status_filter != "all":
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


# ─── Get Offers Proposed By Freelancer ───────────────────────────────────────
@offers_bp.route("/by-freelancer/<freelancer_id>", methods=["GET"])
@jwt_required()
def get_offers_by_freelancer(freelancer_id):
    if db is None:
        return jsonify([]), 200

    status_filter = request.args.get("proposalStatus")
    proposal_query = {"freelancerId": freelancer_id}
    if status_filter:
        proposal_query["status"] = status_filter

    proposal_cursor = db.proposals.find(proposal_query).sort("createdAt", -1)
    proposals = []
    offer_ids = []
    for p in proposal_cursor:
        offer_id = p.get("offerId")
        if not offer_id:
            continue
        if not isinstance(offer_id, ObjectId):
            try:
                offer_id = ObjectId(str(offer_id))
            except Exception:
                continue

        p["_id"] = str(p["_id"])
        p["offerId"] = str(offer_id)
        if "createdAt" in p and p["createdAt"]:
            p["createdAt"] = p["createdAt"].isoformat()
        proposals.append(p)
        offer_ids.append(offer_id)

    if not offer_ids:
        return jsonify([]), 200

    offers_by_id = {}
    for offer in db.offers.find({"_id": {"$in": offer_ids}}):
        serialized = serialize_offer(offer)
        offers_by_id[serialized["_id"]] = serialized

    results = []
    for p in proposals:
        offer = offers_by_id.get(p["offerId"])
        if not offer:
            continue
        offer["proposal"] = {
            "_id": p.get("_id"),
            "status": p.get("status"),
            "amount": p.get("amount"),
            "coverLetterUrl": f"/uploads/{p['coverLetterPath']}" if p.get("coverLetterPath") else None,
            "createdAt": p.get("createdAt")
        }
        results.append(offer)

    return jsonify(results), 200


# ─── Get My Jobs (Freelancer dashboard) ──────────────────────────────────────
@offers_bp.route("/my/jobs", methods=["GET"])
@jwt_required()
def get_my_jobs():
    """Get offers where the current freelancer was accepted"""
    current_user = get_jwt_identity()
    claims = get_jwt()
    
    if claims.get("role") != "freelancer":
        return jsonify({"error": "Only freelancers can view their jobs"}), 403
    
    offers = [serialize_offer(o) for o in db.offers.find({
        "acceptedFreelancerId": current_user,
        "status": {"$in": ["in_progress", "closed"]}
    }).sort("createdAt", -1)]
    
    return jsonify(offers), 200
