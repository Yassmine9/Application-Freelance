from flask import Blueprint, jsonify
from models.admin import Admin
from models.freelancer import Freelancer
from models.client import Client
from models.product import Product
from models.purchase import Purchase

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/freelancers", methods=["GET"])
def get_pending_freelancers():
    # Already built in Admin model
    pending = Admin.get_pending_users()
    # Filter only freelancers if you want just them
    freelancers = [u for u in pending if u.get("role") == "freelancer"]
    return jsonify(freelancers), 200

@admin_bp.route("/approve/<user_id>", methods=["PATCH"])
def approve_freelancer(user_id):
    # Find the freelancer first to get their email
    user = Freelancer.find_by_id(user_id)
    if not user:
        return jsonify({"error": "Freelancer not found"}), 404

    updated = Admin.validate_user(user["email"])
    if updated:
        return jsonify({"message": "Freelancer approved", "user": updated}), 200
    return jsonify({"error": "Could not approve"}), 400

@admin_bp.route("/reject/<user_id>", methods=["PATCH"])
def reject_freelancer(user_id):
    user = Freelancer.find_by_id(user_id)
    if not user:
        return jsonify({"error": "Freelancer not found"}), 404

    updated = Admin.reject_user(user["email"])
    if updated:
        return jsonify({"message": "Freelancer rejected", "user": updated}), 200
    return jsonify({"error": "Could not reject"}), 400

@admin_bp.route("/stats", methods=["GET"])
def get_stats():
    return jsonify({
        "total_users":       (Client.collection.count_documents({}) if Client.collection is not None else 0) +
                             (Freelancer.collection.count_documents({}) if Freelancer.collection is not None else 0),
        "total_freelancers": Freelancer.collection.count_documents({}) if Freelancer.collection is not None else 0,
        "total_products":    Product.collection.count_documents({}) if Product.collection is not None else 0,
        "total_purchases":   Purchase.collection.count_documents({}) if Purchase.collection is not None else 0,
    }), 200