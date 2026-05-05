from models.review import Review
from models.gig import Gig
from models.freelancer import Freelancer
from models.client import Client
from models.admin import Admin
from models.gig_order import GigOrderModel
from db.mongo import db
from bson import ObjectId


# ── Verify Helpers ────────────────────────────────────────

def verify_client(user_id):
    user = Client.find_by_id(user_id)
    if not user:
        return None, ("Client Not Found", 404)
    return user, None

def verify_freelancer(user_id):
    user = Freelancer.find_by_id(user_id)
    if not user:
        return None, ("Freelancer Not Found", 404)
    return user, None

def verify_admin(user_id):
    user = Admin.find_by_id(user_id)
    if not user:
        return None, ("Admin Not Found", 404)
    return user, None

def verify_review(review_id):
    review = Review.find_by_id(review_id)
    if not review:
        return None, ("Review Not Found", 404)
    return review, None


def _id_candidates(value):
    candidates = [str(value)]
    try:
        candidates.append(ObjectId(str(value)))
    except Exception:
        pass
    return candidates


def _find_accepted_offer(client_id, freelancer_id):
    if db is None:
        return None
    query = {
        "clientId": {"$in": _id_candidates(client_id)},
        "acceptedFreelancerId": {"$in": _id_candidates(freelancer_id)},
        "status": {"$in": ["in_progress", "closed"]}
    }
    return db.offers.find_one(query)


def _offer_review_key(offer_id):
    return f"offer:{offer_id}"


# ── Submit Review ─────────────────────────────────────────

def submit_new_review(user_id, data):
    # Must be a client
    client, err = verify_client(user_id)
    if err:
        return None, err

    # Validate rating
    rating = data.get("rating")
    if not rating:
        return None, ("Star rating is required", 400)
    if not isinstance(rating, int) or rating not in [1, 2, 3, 4, 5]:
        return None, ("Rating must be between 1 and 5 stars", 400)

    # Validate comment
    comment = data.get("comment", "").strip()
    if not comment:
        return None, ("Written review is required", 400)
    if len(comment) < 20:
        return None, ("Review must be at least 20 characters", 400)
    if len(comment) > 500:
        return None, ("Review must be under 500 characters", 400)

    # Freelancer ID required
    freelancer_id = data.get("freelancer_id")
    if not freelancer_id:
        return None, ("Freelancer ID is required", 400)

    # Freelancer must exist
    freelancer, err = verify_freelancer(freelancer_id)
    if err:
        return None, err

    # Check client worked with this freelancer (gig orders or accepted offers)
    order = GigOrderModel.get_unreviewed_order(user_id, freelancer_id)
    if not order:
        any_order = GigOrderModel.client_worked_with_freelancer(user_id, freelancer_id)
        offer = _find_accepted_offer(user_id, freelancer_id)
        if offer:
            offer_id = str(offer.get("_id"))
            offer_key = _offer_review_key(offer_id)
            if Review.already_reviewed(offer_key):
                return None, ("You already reviewed this freelancer", 409)

            review = Review.create(
                order_id=offer_key,
                gig_id=None,
                freelancer_id=freelancer_id,
                client_id=user_id,
                client_name=client.get("name", ""),
                rating=rating,
                comment=comment
            )

            Review.update_freelancer_stats(freelancer_id)
            return {"message": "Review submitted successfully", "review": review}, None

        if not any_order:
            return None, ("You have not worked with this freelancer", 403)
        return None, ("You already reviewed this freelancer", 409)

    order_id = str(order["_id"])
    gig_id = str(order["gig_id"])

    # No duplicate review for same order
    if Review.already_reviewed(order_id):
        return None, ("You already reviewed this order", 409)

    # Save review
    review = Review.create(
        order_id=order_id,
        gig_id=gig_id,
        freelancer_id=freelancer_id,
        client_id=user_id,
        client_name=client.get("name", ""),
        rating=rating,
        comment=comment
    )

    # Mark order as reviewed
    GigOrderModel.mark_order_reviewed(order_id)

    # ── FIX: use the existing Review method ─────────────────
    Review.update_freelancer_stats(freelancer_id)

    # Update gig rating
    Gig.update_rating(gig_id, rating)

    return {"message": "Review submitted successfully", "review": review}, None


# ── Can Review Check ──────────────────────────────────────

def check_can_review(user_id, freelancer_id):
    # Must be a client
    client, err = verify_client(user_id)
    if err:
        return None, err

    # Freelancer must exist
    freelancer, err = verify_freelancer(freelancer_id)
    if err:
        return None, err

    # Check for unreviewed order
    order = GigOrderModel.get_unreviewed_order(user_id, freelancer_id)
    if order:
        return {
            "can_review": True,
            "order_id": str(order["_id"]),
            "gig_id": str(order["gig_id"]),
            "reason": None
        }, None

    # Check if they worked together at all (gig orders or accepted offers)
    any_order = GigOrderModel.client_worked_with_freelancer(user_id, freelancer_id)
    offer = _find_accepted_offer(user_id, freelancer_id)
    if offer:
        offer_id = str(offer.get("_id"))
        offer_key = _offer_review_key(offer_id)
        if not Review.already_reviewed(offer_key):
            return {
                "can_review": True,
                "offer_id": offer_id,
                "reason": None
            }, None

    if not any_order and not offer:
        return {
            "can_review": False,
            "reason": "You have not worked with this freelancer"
        }, None

    return {
        "can_review": False,
        "reason": "You already reviewed this freelancer"
    }, None


# ── Get Freelancer Reviews ────────────────────────────────

def get_freelancer_reviews(freelancer_id):
    freelancer, err = verify_freelancer(freelancer_id)
    if err:
        return None, err
    reviews = Review.find_by_freelancer(freelancer_id)
    # ── FIX: removed side-effect; don't update stats on every fetch ──
    return reviews, None


# ── Freelancer Reply ──────────────────────────────────────

def reply_to_existing_review(review_id, user_id, data):
    freelancer, err = verify_freelancer(user_id)
    if err:
        return None, err

    review, err = verify_review(review_id)
    if err:
        return None, err

    # Only the reviewed freelancer can reply
    if review["freelancer_id"] != user_id:
        return None, ("Access Denied", 403)

    # Can only reply once
    if review.get("freelancer_reply"):
        return None, ("You already replied to this review", 409)

    reply = data.get("reply", "").strip()
    if not reply:
        return None, ("Reply cannot be empty", 400)
    if len(reply) > 500:
        return None, ("Reply must be under 500 characters", 400)

    updated = Review.add_reply(review_id, reply)
    return {"message": "Reply added", "review": updated}, None


# ── Admin Hide Review ─────────────────────────────────────

def hide_existing_review(review_id, user_id):
    admin, err = verify_admin(user_id)
    if err:
        return None, err

    review, err = verify_review(review_id)
    if err:
        return None, err

    Review.hide(review_id)
    return {"message": "Review hidden successfully"}, None