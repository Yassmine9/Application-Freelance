from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId
from datetime import datetime
from db.mongo import db
from utils.uploads import save_upload

proposals_bp = Blueprint("proposals", __name__)

def serialize_proposal(p):
    p["_id"] = str(p["_id"])
    p["offerId"] = str(p["offerId"])
    if "createdAt" in p and p["createdAt"]:
        p["createdAt"] = p["createdAt"].isoformat()
    if p.get("coverLetterPath"):
        p["coverLetterUrl"] = f"/uploads/{p['coverLetterPath']}"
    # attach freelancers profile info if available
    try:
        user = db.users.find_one({"_id": p["freelancersId"]}) or db.users.find_one({"userId": p["freelancersId"]})
        if user:
            p["freelancersAvatar"] = user.get("avatar")
            p["avatar"] = user.get("avatar")
            p["freelancersName"] = user.get("name")
    except Exception:
        # no users collection or lookup failed — ignore
        pass
    return p


# ─── Submit Proposal (freelancer only) ───────────────────────────────────────
@proposals_bp.route("/", methods=["POST"])
@jwt_required()
def submit_proposal():
    claims = get_jwt()
    if claims.get("role") != "freelancer":
        return jsonify({"error": "Only freelancers can submit proposals"}), 403

    offer_id = request.form.get("offerId")
    amount_raw = request.form.get("amount")
    cover_letter = request.files.get("cover_letter")

    if not offer_id or not amount_raw:
        return jsonify({"error": "Missing required fields: offerId, amount"}), 400

    if not cover_letter:
        return jsonify({"error": "Cover letter file is required"}), 400

    # Validate offer exists and is open
    try:
        offer = db.offers.find_one({"_id": ObjectId(offer_id)})
    except Exception:
        return jsonify({"error": "Invalid offer ID"}), 400

    if not offer:
        return jsonify({"error": "Offer not found"}), 404

    if offer["status"] != "open":
        return jsonify({"error": "This offer is no longer accepting proposals"}), 400

    current_user = get_jwt_identity()

    # Prevent duplicate proposals from same freelancers
    existing = db.proposals.find_one({
        "offerId": ObjectId(offer_id),
        "freelancersId": current_user
    })
    if existing:
        return jsonify({"error": "You already submitted a proposal for this offer"}), 400

    try:
        amount = float(amount_raw)
    except ValueError:
        return jsonify({"error": "Amount must be a number"}), 400

    if amount <= 0:
        return jsonify({"error": "Amount must be a positive number"}), 400

    try:
        upload = save_upload(cover_letter, "cover_letters")
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    proposal = {
        "offerId": ObjectId(offer_id),
        "freelancersId": current_user,
        "amount": amount,
        "coverLetterPath": upload["relative_path"],
        "coverLetterName": upload["filename"],
        "status": "pending",   # pending | accepted | rejected
        "createdAt": datetime.utcnow()
    }
    result = db.proposals.insert_one(proposal)
    proposal["_id"] = str(result.inserted_id)
    return jsonify({"message": "Proposal submitted", "proposal": serialize_proposal(proposal)}), 201


# ─── Get Proposals for an Offer ───────────────────────────────────────────────
@proposals_bp.route("/<offer_id>", methods=["GET"])
@jwt_required()
def get_proposals(offer_id):
    current_user = get_jwt_identity()
    claims = get_jwt()

    try:
        offer = db.offers.find_one({"_id": ObjectId(offer_id)})
    except Exception:
        return jsonify({"error": "Invalid offer ID"}), 400

    if not offer:
        return jsonify({"error": "Offer not found"}), 404

    # Only the offer owner, admin, or the freelancer who submitted can see proposals
    query = {"offerId": ObjectId(offer_id)}
    if claims.get("role") == "freelancer":
        query["freelancersId"] = current_user   # freelancer sees only their own

    proposals = [serialize_proposal(p) for p in db.proposals.find(query).sort("createdAt", -1)]
    return jsonify(proposals), 200


# ─── Accept Proposal ──────────────────────────────────────────────────────────
@proposals_bp.route("/<proposal_id>/accept", methods=["PUT"])
@jwt_required()
def accept_proposal(proposal_id):
    current_user = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "client":
        return jsonify({"error": "Only clients can accept proposals"}), 403

    try:
        proposal = db.proposals.find_one({"_id": ObjectId(proposal_id)})
    except Exception:
        return jsonify({"error": "Invalid proposal ID"}), 400

    if not proposal:
        return jsonify({"error": "Proposal not found"}), 404

    # Verify the current user owns the offer
    offer = db.offers.find_one({"_id": proposal["offerId"]})
    if not offer or offer["clientId"] != current_user:
        return jsonify({"error": "Unauthorized"}), 403

    if proposal["status"] != "pending":
        return jsonify({"error": "Proposal is no longer pending"}), 400

    # Accept this proposal
    db.proposals.update_one(
        {"_id": ObjectId(proposal_id)},
        {"$set": {"status": "accepted"}}
    )

    # Reject all other proposals for this offer
    db.proposals.update_many(
        {"offerId": proposal["offerId"], "_id": {"$ne": ObjectId(proposal_id)}},
        {"$set": {"status": "rejected"}}
    )

    # Update offer status to in_progress
    db.offers.update_one(
        {"_id": proposal["offerId"]},
        {"$set": {"status": "in_progress", "acceptedfreelancersId": proposal["freelancersId"]}}
    )

    return jsonify({"message": "Proposal accepted, offer is now in progress"}), 200


# ─── Reject Proposal ──────────────────────────────────────────────────────────
@proposals_bp.route("/<proposal_id>/reject", methods=["PUT"])
@jwt_required()
def reject_proposal(proposal_id):
    current_user = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "client":
        return jsonify({"error": "Only clients can reject proposals"}), 403

    try:
        proposal = db.proposals.find_one({"_id": ObjectId(proposal_id)})
    except Exception:
        return jsonify({"error": "Invalid proposal ID"}), 400

    if not proposal:
        return jsonify({"error": "Proposal not found"}), 404

    offer = db.offers.find_one({"_id": proposal["offerId"]})
    if not offer or offer["clientId"] != current_user:
        return jsonify({"error": "Unauthorized"}), 403

    db.proposals.update_one(
        {"_id": ObjectId(proposal_id)},
        {"$set": {"status": "rejected"}}
    )
    return jsonify({"message": "Proposal rejected"}), 200


# ─── Get My Proposals (freelancer dashboard) ──────────────────────────────────
@proposals_bp.route("/my/proposals", methods=["GET"])
@jwt_required()
def get_my_proposals():
    current_user = get_jwt_identity()
    claims = get_jwt()

    if claims.get("role") != "freelancer":
        return jsonify({"error": "Only freelancers can view their proposals"}), 403

    proposals = [serialize_proposal(p) for p in
                 db.proposals.find({"freelancersId": current_user}).sort("createdAt", -1)]
    return jsonify(proposals), 200
