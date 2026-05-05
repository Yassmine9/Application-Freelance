from db.mongo import db
from bson import ObjectId
from datetime import datetime,timedelta


class Gig:
    collection = db["gig"] if db is not None else None

    # ── Helpers ─────────────────────────────────────────────

    @staticmethod
    def _serialize(gig):
        if gig :
            gig["_id"] = str(gig["_id"])
        return gig

    # ── Create ──────────────────────────────────────────────

    @classmethod
    def create(cls, freelancer_id, freelancer_name, title, description, price, tags,duration):
        gig = {
            "freelancer_id":   freelancer_id,
            "freelancer_name": freelancer_name,
            "title":           title,
            "description":     description,
            "tags":            tags,
            "price":           price,
            "image_filename":  "",
            "status":          "draft",
            "created_at":      datetime.utcnow(),
            "updated_at":      datetime.utcnow(),
            "duration":  duration,
            "stats": {
                "total_orders":    0,
                "total_reviews":   0,
                "average_rating":  0
            },
            "promotion": {
                "is_promoted":  False,
                "plan":         None,
                "amount_paid":  0,
                "start_date":   None,
                "end_date":     None,
                "status":       "inactive"
            }
        }
        result = cls.collection.insert_one(gig)
        gig["_id"] = str(result.inserted_id)
        return gig

    # ── Read ────────────────────────────────────────────────

    @classmethod
    def find_by_id(cls, gig_id):
        try:
            return cls._serialize(
                cls.collection.find_one({"_id": ObjectId(gig_id)})
            )
        except Exception:
            return None

    @classmethod
    def find_by_freelancer(cls, freelancer_id):
        return [
            cls._serialize(g)
            for g in cls.collection.find({"freelancer_id": freelancer_id})
        ]

    @classmethod
    def find_approved(cls):
        return [
            cls._serialize(g)
            for g in cls.collection.find({"status": "approved"})
        ]

    @classmethod
    def find_pending(cls):
        return [
            cls._serialize(g)
            for g in cls.collection.find({"status": "pending"})
        ]
    """
    @classmethod
    def find_by_tag(cls, tag):
        return [
            cls._serialize(g)
            for g in cls.collection.find({
                "status": "approved",
                "tags": {"$in": [tag]}
            })
        ]

    @classmethod
    def search_by_title(cls, query):
        return [
            cls._serialize(g)
            for g in cls.collection.find({
                "status": "approved",
                "title": {"$regex": query, "$options": "i"}
            })
        ]"""
    # search by title and by tag
    @classmethod
    def search(cls,query):
        return [
        cls._serialize(g)
        for g in cls.collection.find({
                "status": "approved",
                "$or" :[
                {"title": {"$regex": query, "$options": "i"}},
                {"tags" : {"$regex": query, "$options": "i"}}
                ]
            })
    ]

    @classmethod
    def find_all_gigs(cls):
        return [ cls._serialize(g) for g in cls.collection.find()]

    # ── Update ──────────────────────────────────────────────

    @classmethod
    def update(cls, gig_id, **fields):
        fields["updated_at"] = datetime.utcnow()
        fields.pop("_id", None)
        cls.collection.update_one({"_id": ObjectId(gig_id)},
            {"$set": fields},
        )
        return cls.find_by_id(gig_id)

    # ── Admin actions ───────────────────────────────────────

    @classmethod
    def approve(cls, gig_id):
        cls.update(gig_id, status="approved")

    @classmethod
    def reject(cls, gig_id):
        cls.update(gig_id, status="rejected")

    # ── Delete ──────────────────────────────────────────────

    @classmethod
    def delete(cls, gig_id):
        cls.collection.delete_one({"_id": ObjectId(gig_id)})

    # ── Stats updates ───────────────────────────────────────

    @classmethod
    def increment_order_count(cls, gig_id):
        """Call this when an order is placed for the gig."""
        cls.collection.update_one(
            {"_id": ObjectId(gig_id)},
            {
                "$inc": {"stats.total_orders": 1},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )

    @classmethod
    def update_rating(cls, gig_id, new_rating):
        """
        Update average rating after a new review.
        new_rating should be a float between 0 and 5.
        """
        gig = cls.collection.find_one({"_id": ObjectId(gig_id)})
        if not gig:
            return
        stats = gig.get("stats", {})
        total_reviews = stats.get("total_reviews", 0)
        current_avg = stats.get("average_rating", 0)

        # Calculate new average
        new_total_reviews = total_reviews + 1
        new_average = ((current_avg * total_reviews) + new_rating) / new_total_reviews

        cls.collection.update_one(
            {"_id": ObjectId(gig_id)},
            {
                "$set": {
                    "stats.total_reviews": new_total_reviews,
                    "stats.average_rating": round(new_average, 2),
                    "updated_at": datetime.utcnow()
                }
            }
        )


    # ── Promotion management ────────────────────────────────
    @classmethod
    def set_promotion(cls, gig_id, plan, amount_paid, duration_days):
        """Activate a promotion for this gig."""
        start_date = datetime.utcnow()
        end_date = start_date + timedelta(days=duration_days)
        cls.collection.update_one(
            {"_id": ObjectId(gig_id)},
            {
                "$set": {
                    "promotion.is_promoted": True,
                    "promotion.plan": plan,
                    "promotion.amount_paid": amount_paid,
                    "promotion.start_date": start_date,
                    "promotion.end_date": end_date,
                    "promotion.status": "active",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return cls.find_by_id(gig_id)

    @classmethod
    def expire_promotion(cls, gig_id):
        """Expire a promotion — called by scheduler or admin."""
        cls.collection.update_one(
            {"_id": ObjectId(gig_id)},
            {
                "$set": {
                    "promotion.is_promoted": False,
                    "promotion.status": "expired",
                    "updated_at": datetime.utcnow()
                }
            }
        )

    @classmethod
    def disable_promotion(cls, gig_id):
        """Admin manually disables a promotion."""
        cls.collection.update_one(
            {"_id": ObjectId(gig_id)},
            {
                "$set": {
                    "promotion.is_promoted": False,
                    "promotion.status": "inactive",
                    "updated_at": datetime.utcnow()
                }
            }
        )

    @classmethod
    def find_approved_with_promotion(cls):
        """Return approved gigs — promoted ones first."""
        promoted = [
            cls._serialize(g)
            for g in cls.collection.find({
                "status": "approved",
                "promotion.status": "active"
            })
        ]
        regular = [
            cls._serialize(g)
            for g in cls.collection.find({
                "status": "approved",
                "$or": [
                    {"promotion.status": {"$ne": "active"}},
                    {"promotion": {"$exists": False}}
                ]
            })
        ]
        return promoted + regular

    @classmethod
    def find_expirable_promotions(cls):
        """Find all gigs with active promotions that have passed end_date."""
        now = datetime.utcnow()
        return [
            cls._serialize(g)
            for g in cls.collection.find({
                "promotion.status": "active",
                "promotion.end_date": {"$lt": now}
            })
        ]