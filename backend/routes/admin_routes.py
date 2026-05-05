from bson import ObjectId
from flask import Blueprint, jsonify, request
from models.admin import Admin
from models.freelancer import Freelancer
from models.client import Client
from models.product import Product
from models.purchase import Purchase
from models.gig import Gig 
from db.mongo import db         # add this model if not yet created
#from models.feedback import Feedback  # add this model if not yet created
#from models.review import Review
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
        #"total_gigs":        Gig.collection.count_documents({}) if Gig.collection is not None else 0,
        #"total_feedback":    Feedback.collection.count_documents({}) if Feedback.collection is not None else 0,
        #"total_reviews":     Review.collection.count_documents({}) if Review.collection is not None else 0,
    }), 200
# ── GIGS ─────────────────────────────────────────────────────────────────────

@admin_bp.route("/gigs", methods=["GET"])
def get_gigs():
    try:
        gigs = list(Gig.collection.find({}))
        for g in gigs:
            g["_id"] = str(g["_id"])
        return jsonify(gigs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/gigs/<gig_id>/approve", methods=["PATCH"])
def approve_gig(gig_id):
    try:
        result = Gig.collection.update_one(
            {"_id": ObjectId(gig_id)},
            {"$set": {"status": "approved"}}
        )
        if result.modified_count == 0:
            return jsonify({"error": "Gig not found"}), 404
        return jsonify({"message": "Gig approved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/gigs/<gig_id>/reject", methods=["PATCH"])
def reject_gig(gig_id):
    try:
        result = Gig.collection.update_one(
            {"_id": ObjectId(gig_id)},
            {"$set": {"status": "rejected"}}
        )
        if result.modified_count == 0:
            return jsonify({"error": "Gig not found"}), 404
        return jsonify({"message": "Gig rejected"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── FEEDBACK ──────────────────────────────────────────────────────────────────
"""
@admin_bp.route("/feedback", methods=["GET"])
def get_feedback():
    try:
        feedbacks = list(Feedback.collection.find({}))
        for f in feedbacks:
            f["_id"] = str(f["_id"])
        return jsonify(feedbacks), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/feedback/<feedback_id>", methods=["DELETE"])
def delete_feedback(feedback_id):
    try:
        result = Feedback.collection.delete_one({"_id": ObjectId(feedback_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Feedback not found"}), 404
        return jsonify({"message": "Feedback deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
"""
# ── REVIEWS ───────────────────────────────────────────────────────────────────
"""
@admin_bp.route("/reviews", methods=["GET"])
def get_reviews():
    try:
        reviews = list(Review.collection.find({}))
        for r in reviews:
            r["_id"] = str(r["_id"])
        return jsonify(reviews), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/reviews/<review_id>", methods=["DELETE"])
def delete_review(review_id):
    try:
        result = Review.collection.delete_one({"_id": ObjectId(review_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Review not found"}), 404
        return jsonify({"message": "Review deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
"""

# ── PRODUCTS ────────────────────────────────────────────────────────────────

@admin_bp.route("/products", methods=["GET"])
def get_products():
    """
    Query params:
    ?search=abc
    ?category=<category_id>
    """
    try:
        search = request.args.get("search")
        category_id = request.args.get("category")

        products = Product.get_all(
            category_id=category_id,
            search=search
        )

        return jsonify(products), 200

    except Exception as e:
        print(f"[ADMIN ERROR] Products fetch error: {e}")
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/products/<product_id>", methods=["GET"])
def get_product(product_id):
    try:
        product = Product.get_by_id(product_id)

        if not product:
            return jsonify({"error": "Product not found"}), 404

        return jsonify(product), 200

    except Exception as e:
        print(f"[ADMIN ERROR] Product fetch error: {e}")
        return jsonify({"error": str(e)}), 500

# ── OFFERS ─────────────────────────────────────────────────────────────────

def serialize_admin_offer(offer):
    offer["_id"] = str(offer["_id"])

    if offer.get("deadline"):
        offer["deadline"] = offer["deadline"].isoformat()

    if offer.get("createdAt"):
        offer["createdAt"] = offer["createdAt"].isoformat()

    return offer


@admin_bp.route("/offers", methods=["GET"])
def get_all_offers():
    """
    Optional filters:
    ?status=pending
    ?category=Design
    """

    try:
        status = request.args.get("status")
        category = request.args.get("category")

        query = {}

        if status:
            query["status"] = status

        if category:
            query["category"] = category

        offers = [
            serialize_admin_offer(o)
            for o in db.offers.find(query).sort("createdAt", -1)
        ]

        return jsonify(offers), 200

    except Exception as e:
        print(f"[ADMIN ERROR] Offers fetch error: {e}")
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/offers/<offer_id>/approve", methods=["PATCH"])
def approve_offer(offer_id):
    try:
        result = db.offers.update_one(
            {"_id": ObjectId(offer_id)},
            {
                "$set": {
                    "status": "approved"
                }
            }
        )

        if result.modified_count == 0:
            return jsonify({"error": "Offer not found"}), 404

        return jsonify({
            "message": "Offer approved"
        }), 200

    except Exception as e:
        print(f"[ADMIN ERROR] Offer approval error: {e}")
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/offers/<offer_id>/reject", methods=["PATCH"])
def reject_offer(offer_id):
    try:
        result = db.offers.update_one(
            {"_id": ObjectId(offer_id)},
            {
                "$set": {
                    "status": "rejected"
                }
            }
        )

        if result.modified_count == 0:
            return jsonify({"error": "Offer not found"}), 404

        return jsonify({
            "message": "Offer rejected"
        }), 200

    except Exception as e:
        print(f"[ADMIN ERROR] Offer rejection error: {e}")
        return jsonify({"error": str(e)}), 500

# ── PURCHASES ──────────────────────────────────────────────────────────────

@admin_bp.route("/purchases", methods=["GET"])
def get_all_purchases():
    try:
        purchases = list(Purchase.collection.find({}).sort("purchaseDate", -1))

        for purchase in purchases:
            purchase["_id"] = str(purchase["_id"])
            purchase["productId"] = str(purchase["productId"])

            if purchase.get("purchaseDate"):
                purchase["purchaseDate"] = purchase["purchaseDate"].isoformat()

        return jsonify(purchases), 200

    except Exception as e:
        print(f"[ADMIN ERROR] Purchases fetch error: {e}")
        return jsonify({"error": str(e)}), 500