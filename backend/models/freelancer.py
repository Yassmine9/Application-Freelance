from db.mongo import db
from models.base_user import BaseUser


class Freelancer(BaseUser):
    """Modèle Freelancer – collection 'freelancer_profile'"""
    collection = db["freelancer"] if db is not None else None

    @classmethod
    def create(cls, email, password, name, skills=None, hourly_rate=0, bio="", phone=""):
        return super().create(
            email, password, name,
            role="freelancer",
            skills=skills or [],
            hourly_rate=hourly_rate,
            bio=bio,
            phone=phone,
            portfolio=[],
            proposals_sent=[]
        )

    @classmethod
    def find_by_skill(cls, skill):
        if cls.collection is None:
            return []
        return [cls._serialize(u) for u in cls.collection.find({
            "skills": {"$in": [skill]}
        })]
