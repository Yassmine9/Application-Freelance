from db.mongo import db
from models.base_user import BaseUser


class Freelancer(BaseUser):

    """Modèle Freelancer – collection 'freelancer'"""

    collection = db["freelancer"] if db is not None else None

    @classmethod
    def create(cls, email, password, name, phone="", **kwargs):
        # Default fields to ensure they exist even if not provided in kwargs
        freelancer_data = {
            "title": kwargs.get("title", ""),
            "bio": kwargs.get("bio", ""),
            "skills": kwargs.get("skills", []),
            "hourly_rate": kwargs.get("hourly_rate", 0),
            "experience_years": kwargs.get("experience_years", 0),
            "projects_completed": kwargs.get("projects_completed", 0),
            "avatar_filename": kwargs.get("avatar_filename", ""),
            "cv_filename": kwargs.get("cv_filename", ""),
            "portfolio": kwargs.get("portfolio", []),
            "client_rating": 0.0,
            "success_rate": 0,
            "status": kwargs.get("status", "pending"),
            "proposals_sent": [],
            "phone": phone
        }
        
        # Overlay any other fields passed through kwargs
        freelancer_data.update(kwargs)

        return super().create(
            email, password, name,
            role="freelancer",
            **freelancer_data
        )

    @classmethod
    def find_by_skill(cls, skill):
        if cls.collection is None:
            return []
        return [cls._serialize(u) for u in cls.collection.find({
            "skills": {"$in": [skill]}
        })]

    @classmethod
    def find_approved(cls):
        """Returns all approved freelancers (visible to clients)"""
        if cls.collection is None:
            return []
        # On cherche status 'active' car c'est celui mis par l'admin après validation
        return [cls._serialize(u) for u in cls.collection.find(
            {"status": "active"},
            {"password": 0}
        )]

    @classmethod
    def recalculate_stats(cls, freelancers_email, reviews: list):
        """Recalculates client_rating and success_rate from reviews list"""
        if not reviews:
            return
        total = len(reviews)
        avg_rating = round(sum(r["rating"] for r in reviews) / total, 1)
        positive = sum(1 for r in reviews if r["rating"] >= 4)
        success = round((positive / total) * 100)
        cls.update(freelancers_email,
                   client_rating=avg_rating,
                   success_rate=success)
