from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from models.admin import Admin
from models.category import Category

category_bp = Blueprint("categories", __name__)

@category_bp.route("/", methods=["GET"])
def get_categories():
    return jsonify(Category.get_all()), 200

@category_bp.route("/", methods=["POST"])
@jwt_required()
def create_category():
    admin_id = get_jwt_identity()
    if not Admin.find_by_id(admin_id):
        return jsonify({"error": "Access denied"}), 403

    data = request.json or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Category name is required"}), 400

    category = Category.create(
        name=name,
        type_=data.get("type_", "product")
    )

    return jsonify(category), 201
