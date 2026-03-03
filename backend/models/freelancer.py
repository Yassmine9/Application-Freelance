from db.mongo import db
from models.base_user import BaseUser


class Freelancer(BaseUser):
<<<<<<< HEAD
    """Modèle Freelancer – collection 'freelancer'"""
=======
>>>>>>> origin/YassmineA
    collection = db["freelancer"] if db is not None else None

    @classmethod
    def create(cls, email, password, name, phone):
        return super().create(
            email, password, name,
            role="freelancer",
            phone=phone,
<<<<<<< HEAD
            # filled later by freelancer
            title="",
            bio="",
            skills=[],
            hourly_rate=0,
            experience_years=0,
            projects_completed=0,
            avatar_filename="",
            cv_filename="",
=======
            is_blocked=False,
>>>>>>> origin/YassmineA
            portfolio=[],
            # calculated automatically
            client_rating=0.0,
            success_rate=0,
            # auto
            status="draft",
            proposals_sent=[]
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
        return [cls._serialize(u) for u in cls.collection.find(
            {"status": "approved"},
            {"password": 0}
        )]

    @classmethod
    def recalculate_stats(cls, freelancer_email, reviews: list):
        """Recalculates client_rating and success_rate from reviews list"""
        if not reviews:
            return
        total = len(reviews)
        avg_rating = round(sum(r["rating"] for r in reviews) / total, 1)
        positive = sum(1 for r in reviews if r["rating"] >= 4)
        success = round((positive / total) * 100)
        cls.update(freelancer_email,
                   client_rating=avg_rating,
                   success_rate=success)