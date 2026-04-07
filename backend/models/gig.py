from db.mongo import db
from bson import ObjectId
from datetime import datetime


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
    def create(cls, freelancer_id, freelancer_name, title, description, price, tags):
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
        cls.collection.update_one(
            {"_id": ObjectId(gig_id)},
            {"$set": fields}
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