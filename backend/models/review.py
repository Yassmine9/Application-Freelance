from db.mongo import db
from bson import ObjectId
from datetime import datetime
from models.freelancer import Freelancer

class Review:
    collection = db["review"] if db is not None else None

    # ── Helpers ─────────────────────────────────────────────

    @staticmethod
    def _serialize(review):
        if review:
            review["_id"] = str(review["_id"])
        return review

    # ── Create ──────────────────────────────────────────────

    @classmethod
    def create(cls, order_id, gig_id, freelancer_id, client_id, client_name, rating, comment):
        review = {
            "order_id":         order_id,
            "gig_id":           gig_id,
            "freelancer_id":    freelancer_id,
            "client_id":        client_id,
            "client_name":      client_name,
            "rating":           rating,
            "comment":          comment,
            "freelancer_reply": None,
            "status":           "visible",
            "created_at":       datetime.utcnow()
        }
        result = cls.collection.insert_one(review)
        review["_id"] = str(result.inserted_id)
        return review

    # ── Read ────────────────────────────────────────────────

    @classmethod
    def find_by_id(cls, review_id):
        try:
            return cls._serialize(
                cls.collection.find_one({"_id": ObjectId(review_id)})
            )
        except Exception:
            return None

    @classmethod
    def find_by_freelancer(cls, freelancer_id):
        return [
            cls._serialize(r)
            for r in cls.collection.find({
                "freelancer_id": freelancer_id,
                "status":        "visible"
            }).sort("created_at", -1)
        ]

    @classmethod
    def find_by_order(cls, order_id):
        return cls._serialize(
            cls.collection.find_one({"order_id": order_id})
        )

    @classmethod
    def find_by_client(cls, client_id):
        return [
            cls._serialize(r)
            for r in cls.collection.find(
                {"client_id": client_id}
            ).sort("created_at", -1)
        ]

    @classmethod
    def already_reviewed(cls, order_id):
        """Check if a review already exists for this order"""
        return cls.collection.find_one({"order_id": order_id}) is not None

    # ── Update ──────────────────────────────────────────────

    @classmethod
    def add_reply(cls, review_id, reply):
        """Freelancer replies to a review — only once"""
        cls.collection.update_one(
            {"_id": ObjectId(review_id)},
            {"$set": {"freelancer_reply": reply}}
        )
        return cls.find_by_id(review_id)

    # ── Admin ────────────────────────────────────────────────

    @classmethod
    def hide(cls, review_id):
        """Admin hides an abusive review"""
        cls.collection.update_one(
            {"_id": ObjectId(review_id)},
            {"$set": {"status": "hidden"}}
        )
        return cls.find_by_id(review_id)

    # ── Stats ────────────────────────────────────────────────


    @classmethod
    def update_freelancer_stats(cls, freelancer_id):
        reviews = list(cls.collection.find({
            "freelancer_id": freelancer_id,
            "status": "visible"
        }))

        total = len(reviews)

        if total == 0:
            Freelancer.get_collection().update_one(
                {"_id": ObjectId(freelancer_id)},
                {"$set": {
                    "client_rating": 0,
                    "success_rate": 0
                }}
            )
            return

        avg_rating = round(
            sum(r["rating"] for r in reviews) / total,
            1
        )

        positive = sum(
            1 for r in reviews if r["rating"] >= 4
        )

        success_rate = round((positive / total) * 100)

        Freelancer.get_collection().update_one(
            {"_id": ObjectId(freelancer_id)},
            {"$set": {
                "client_rating": avg_rating,
                "success_rate": success_rate
            }}
        )