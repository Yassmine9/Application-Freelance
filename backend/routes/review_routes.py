from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.review_service import (
    submit_new_review,
    check_can_review,
    get_freelancer_reviews,
    reply_to_existing_review,
    hide_existing_review
)

review_routes = Blueprint('review_routes', __name__)


# ── Submit Review (Client only) ───────────────────────────
@review_routes.route("/reviews", methods=['POST'])
@jwt_required()
def submit_review():
    user_id = get_jwt_identity()
    data    = request.get_json()
    if not data:
        return jsonify({"error": "No JSON received"}), 400
    result, err = submit_new_review(user_id, data)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify(result), 201


# ── Can Review Check (Client only) ───────────────────────
@review_routes.route("/reviews/can-review/<freelancer_id>", methods=['GET'])
@jwt_required()
def can_review(freelancer_id):
    user_id = get_jwt_identity()
    result, err = check_can_review(user_id, freelancer_id)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify(result), 200


# ── Get All Reviews for a Freelancer (Public) ────────────
@review_routes.route("/reviews/freelancer/<freelancer_id>", methods=['GET'])
def get_reviews(freelancer_id):
    result, err = get_freelancer_reviews(freelancer_id)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify(result), 200


# ── Freelancer Replies to a Review ───────────────────────
@review_routes.route("/reviews/<review_id>/reply", methods=['PATCH'])
@jwt_required()
def reply_review(review_id):
    user_id = get_jwt_identity()
    data    = request.get_json()
    if not data:
        return jsonify({"error": "No JSON received"}), 400
    result, err = reply_to_existing_review(review_id, user_id, data)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify(result), 200


# ── Admin Hides a Review ─────────────────────────────────
@review_routes.route("/reviews/<review_id>/hide", methods=['PATCH'])
@jwt_required()
def hide_review(review_id):
    user_id = get_jwt_identity()
    result, err = hide_existing_review(review_id, user_id)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify(result), 200
