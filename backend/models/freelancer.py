from models.base_user import BaseUser


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
            client_rating=0.0,
            success_rate=0,
            status="pending",  # <-- CHANGED from "draft"
            proposals_sent=[]
        )

    @classmethod
    def find_by_skill(cls, skill):
        return [cls._serialize(u) for u in cls.get_collection().find({
            "skills": {"$in": [skill]}
        })]

    @classmethod
    def find_approved(cls):
        return [cls._serialize(u) for u in cls.get_collection().find(
            {"status": "approved"},
            {"password": 0}
        )]

    @classmethod
    def recalculate_stats(cls, freelancer_email, reviews: list):
        if not reviews:
            return
        total = len(reviews)
        avg_rating = round(sum(r["rating"] for r in reviews) / total, 1)
        positive = sum(1 for r in reviews if r["rating"] >= 4)
        success = round((positive / total) * 100)
        cls.update(freelancers_email,
                   client_rating=avg_rating,
                   success_rate=success)
