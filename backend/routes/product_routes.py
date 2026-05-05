from flask import Blueprint, request, jsonify, send_from_directory
from models.product import Product
from models.purchase import Purchase
import os

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
def create_product():
    data = request.json

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
        "download_link": f"http://localhost:5000/products/download/{product['_id']}"
    }, 201

@product_bp.route("/download/<product_id>", methods=["GET"])
def download_product(product_id):
    product = Product.get_by_id(product_id)

    if not product:
        return {"error": "Product not found"}, 404
    Product.increment_download(product_id)
    filename = product["filePath"]   # example: focuspro.zip

    uploads_folder = os.path.join(os.getcwd(), "uploads", "products")

    return send_from_directory(
        uploads_folder,
        filename,
        as_attachment=True
    )

@product_bp.route("/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    success = Product.delete(product_id)

    if success:
        return jsonify({"message": "Product deleted successfully"}), 200
    else:
        return jsonify({"error": "Product not found"}), 404