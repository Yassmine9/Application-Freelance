from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from models.admin import Admin
from models.freelancer import Freelancer
from models.client import Client
from models.product import Product
from models.purchase import Purchase

admin_bp = Blueprint("admin", __name__)


def _require_admin():
    admin_id = get_jwt_identity()
    admin = Admin.find_by_id(admin_id)
    if not admin or admin.get("role") != "admin":
        return None
    return admin


@admin_bp.route("/freelancers", methods=["GET"])
@jwt_required()
def get_pending_freelancers():
    if not _require_admin():
        return jsonify({"error": "Access denied"}), 403

    pending = Admin.get_pending_users()
    freelancers = [u for u in pending if u.get("role") == "freelancer"]
    return jsonify(freelancers), 200
@admin_bp.route("/clients", methods=["GET"])
@jwt_required()
def get_pending_clients():
    if not _require_admin():
        return jsonify({"error": "Access denied"}), 403

    pending = Admin.get_pending_users()
    clients = [u for u in pending if u.get("role") == "client"]
    return jsonify(clients), 200

@admin_bp.route("/approve/<user_id>", methods=["PATCH"])
@jwt_required()
def approve_freelancer(user_id):
    if not _require_admin():
        return jsonify({"error": "Access denied"}), 403

    # Search both client and freelancer collections
    user = Freelancer.find_by_id(user_id) or Client.find_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    updated = Admin.validate_user(user["email"])
    if updated:
        return jsonify({"message": "User approved", "user": updated}), 200
    return jsonify({"error": "Could not approve"}), 400


@admin_bp.route("/reject/<user_id>", methods=["PATCH"])
@jwt_required()
def reject_freelancer(user_id):
    if not _require_admin():
        return jsonify({"error": "Access denied"}), 403

    # Search both client and freelancer collections
    user = Freelancer.find_by_id(user_id) or Client.find_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    updated = Admin.reject_user(user["email"])
    if updated:
        return jsonify({"message": "User rejected", "user": updated}), 200
    return jsonify({"error": "Could not reject"}), 400


@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    if not _require_admin():
        return jsonify({"error": "Access denied"}), 403

    try:
        total_users = (
            Client.get_collection().count_documents({}) +
            Freelancer.get_collection().count_documents({})
        )
        total_freelancers = Freelancer.get_collection().count_documents({})
        total_products = Product.get_collection().count_documents({}) if hasattr(Product, 'get_collection') else 0
        total_purchases = Purchase.get_collection().count_documents({}) if hasattr(Purchase, 'get_collection') else 0
    except Exception as e:
        return jsonify({"error": f"Stats error: {str(e)}"}), 500

    return jsonify({
        "total_users": total_users,
        "total_freelancers": total_freelancers,
        "total_products": total_products,
        "total_purchases": total_purchases,
    }), 200


@admin_bp.route("/block/<user_id>", methods=["PATCH"])
@jwt_required()
def block_user(user_id):
    if not _require_admin():
        return jsonify({"error": "Access denied"}), 403

    user = Client.find_by_id(user_id) or Freelancer.find_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    updated = Admin.block_user(user.get("email", ""))
    if not updated:
        return jsonify({"error": "Could not block user"}), 400

    return jsonify({"message": "User blocked", "user": updated}), 200


@admin_bp.route("/unblock/<user_id>", methods=["PATCH"])
@jwt_required()
def unblock_user(user_id):
    if not _require_admin():
        return jsonify({"error": "Access denied"}), 403

    user = Client.find_by_id(user_id) or Freelancer.find_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    updated = Admin.unblock_user(user.get("email", ""))
    if not updated:
        return jsonify({"error": "Could not unblock user"}), 400

    return jsonify({"message": "User unblocked", "user": updated}), 200