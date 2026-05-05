from models.base_user import BaseUser
from db.mongo import db
from bson import ObjectId


class Freelancer(BaseUser):
    """Modèle Freelancer – collection 'freelancer'"""
    _collection_name = "freelancer"

    @classmethod
    def create(cls, email, password, name, phone, skills=None, hourly_rate=0, bio=""):
        skills = skills or []
        return super().create(
            email, password, name,
            role="freelancer",
            phone=phone,
            title="",
            bio=bio,
            skills=skills,
            hourly_rate=hourly_rate,
            experience_years=0,
            projects_completed=0,
            avatar_filename="",
            cv_filename="",
            portfolio=[],
            gigs=[],                 # ← ADD THIS
            client_rating=0.0,
            success_rate=0,
            status="pending",
            proposals_sent=[]
        )

    @classmethod
    def find_by_skill(cls, skill):
        return [cls._serialize(u) for u in cls.get_collection().find(
            {"skills": {"$in": [skill]}},
            {"password": 0}          # ← ADD THIS (was leaking hashes)
        )]

    @classmethod
    def find_approved(cls):
        return [cls._serialize(u) for u in cls.get_collection().find(
            {"status": "approved"},
            {"password": 0}
        )]

    # ── ADD THIS METHOD ───────────────────────────────────
    @classmethod
    def recalculate_stats(cls, freelancer_id, reviews):
        """Recalculate client_rating & success_rate from a list of review dicts."""
        if not reviews:
            cls.get_collection().update_one(
                {"_id": ObjectId(freelancer_id)},
                {"$set": {"client_rating": 0, "success_rate": 0}}
            )
            return

        total = len(reviews)
        avg_rating = round(sum(r["rating"] for r in reviews) / total, 1)
        positive = sum(1 for r in reviews if r["rating"] >= 4)
        success_rate = round((positive / total) * 100)

        cls.get_collection().update_one(
            {"_id": ObjectId(freelancer_id)},
            {"$set": {
                "client_rating": avg_rating,
                "success_rate": success_rate
            }}
        )