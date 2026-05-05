from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.review import Review

admin_review_routes = Blueprint("admin_review_routes", __name__)

@admin_review_routes.route("/reviews", methods=["GET"])

def get_all_reviews():
    status = request.args.get("status")

    query = {}
    if status:
        query["status"] = status

    reviews = list(
        Review.collection.find(query).sort("created_at", -1)
    )

    for r in reviews:
        r["_id"] = str(r["_id"])

    return jsonify(reviews), 200

@admin_review_routes.route("reviews/<review_id>/hide", methods=["PATCH"])

def hide_review_admin(review_id):
    result = Review.hide(review_id)

    if not result:
        return jsonify({"error": "Review not found"}), 404

    return jsonify(result), 200

@admin_review_routes.route("reviews/<review_id>", methods=["DELETE"])

def delete_review(review_id):
    Review.collection.delete_one({"_id": ObjectId(review_id)})
    return jsonify({"message": "deleted"}), 200