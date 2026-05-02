from flask import Blueprint, jsonify
from models.admin import Admin
from models.freelancer import Freelancer
from models.client import Client
from models.product import Product
from models.purchase import Purchase

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/freelancers", methods=["GET"])
def get_pending_freelancers():
    try:
        # Already built in Admin model
        pending = Admin.get_pending_users()
        print(f"[ADMIN] Found {len(pending)} pending users")
        # Return all pending users (both freelancers and clients)
        return jsonify(pending), 200
    except Exception as e:
        print(f"[ADMIN ERROR] Error fetching pending users: {e}")
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/approve/<user_id>", methods=["PATCH"])
def approve_freelancers(user_id):
    try:
        # Find the user in either Client or Freelancer collection
        user = Client.find_by_id(user_id) or Freelancer.find_by_id(user_id)
        if not user:
            print(f"[ADMIN ERROR] User not found: {user_id}")
            return jsonify({"error": "User not found"}), 404

        updated = Admin.validate_user(user["email"])
        if updated:
            print(f"[ADMIN] Approved user: {user['email']}")
            return jsonify({"message": "User approved", "user": updated}), 200
        print(f"[ADMIN ERROR] Could not approve user: {user['email']}")
        return jsonify({"error": "Could not approve"}), 400
    except Exception as e:
        print(f"[ADMIN ERROR] Error approving user: {e}")
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/reject/<user_id>", methods=["PATCH"])
def reject_freelancers(user_id):
    try:
        # Find the user in either Client or Freelancer collection
        user = Client.find_by_id(user_id) or Freelancer.find_by_id(user_id)
        if not user:
            print(f"[ADMIN ERROR] User not found: {user_id}")
            return jsonify({"error": "User not found"}), 404

        updated = Admin.reject_user(user["email"])
        if updated:
            print(f"[ADMIN] Rejected user: {user['email']}")
            return jsonify({"message": "User rejected", "user": updated}), 200
        print(f"[ADMIN ERROR] Could not reject user: {user['email']}")
        return jsonify({"error": "Could not reject"}), 400
    except Exception as e:
        print(f"[ADMIN ERROR] Error rejecting user: {e}")
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/stats", methods=["GET"])
def get_stats():
    return jsonify({
        "total_users":       (Client.collection.count_documents({}) if Client.collection is not None else 0) +
                             (Freelancer.collection.count_documents({}) if Freelancer.collection is not None else 0),
        "total_freelancers": Freelancer.collection.count_documents({}) if Freelancer.collection is not None else 0,
        "total_products":    Product.collection.count_documents({}) if Product.collection is not None else 0,
        "total_purchases":   Purchase.collection.count_documents({}) if Purchase.collection is not None else 0,
    }), 200
