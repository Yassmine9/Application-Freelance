from flask import Blueprint, request, jsonify
from models.category import Category

category_bp = Blueprint("categories", __name__)

@category_bp.route("/", methods=["GET"])
def get_categories():
    return jsonify(Category.get_all()), 200

@category_bp.route("/", methods=["POST"])
def create_category():
    data = request.json

    category = Category.create(
        name=data["name"],
        type_=data.get("type_", "product")
    )

    return jsonify(category), 201
