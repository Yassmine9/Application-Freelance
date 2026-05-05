from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from models.admin import Admin
from models.product import Product
from models.purchase import Purchase

product_bp = Blueprint("products", __name__)

@product_bp.route("/", methods=["GET"])
def get_products():
    category_id = request.args.get("category")
    search = request.args.get("search")
    products = Product.get_all(category_id=category_id, search=search)
    
    return jsonify(products), 200

@product_bp.route("/<product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.get_by_id(product_id)

    if not product:
        return {"error": "Product not found"}, 404

    return jsonify(product), 200

@product_bp.route("/", methods=["POST"])
@jwt_required()
def create_product():
    admin_id = get_jwt_identity()
    if not Admin.find_by_id(admin_id):
        return jsonify({"error": "Access denied"}), 403

    data = request.json or {}
    required = ["creator_id", "title", "description", "version", "license", "price", "file_path", "category_id"]
    missing = [field for field in required if data.get(field) in (None, "")]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    product = Product.create(
        creator_id=data["creator_id"],
        title=data["title"],
        description=data["description"],
        version=data["version"],
        license=data["license"],
        price=data["price"],
        file_path=data["file_path"],
        category_id=data["category_id"]
    )

    return jsonify(product), 201

@product_bp.route("/purchase", methods=["POST"])
def purchase_product():
    data = request.json

    product = Product.get_by_id(data["productId"])
    if not product:
        return {"error": "Product not found"}, 404

    Purchase.create(
        buyer_id=data["buyerId"],
        product_id=data["productId"]
    )

    return {
        "message": "Purchase successful",
        "download_link": product["filePath"]
    }, 201

@product_bp.route("/download/<product_id>", methods=["GET"])
def download_product(product_id):
    product = Product.get_by_id(product_id)

    if not product:
        return {"error": "Product not found"}, 404

    return {
        "download": product["filePath"]
    }

@product_bp.route("/<product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    admin_id = get_jwt_identity()
    if not Admin.find_by_id(admin_id):
        return jsonify({"error": "Access denied"}), 403

    success = Product.delete(product_id)

    if success:
        return jsonify({"message": "Product deleted successfully"}), 200
    else:
        return jsonify({"error": "Product not found"}), 404
