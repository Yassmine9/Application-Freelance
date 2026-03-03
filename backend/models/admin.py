from db.mongo import db
from models.base_user import BaseUser
from models.client import Client
from models.freelancer import Freelancer


class Admin(BaseUser):
    """Modèle Admin – collection 'admins'"""
    collection = db["admins"] if db is not None else None

    @classmethod
    def create(cls, email, password, name):
        return super().create(
            email, password, name,
            role="admin",
            status="active",
            permissions=["manage_users", "manage_projects", "manage_proposals", "view_stats"]
        )

    @classmethod
    def validate_user(cls, email):
        """Valide un compte utilisateur (status → active)"""
        for model in (Client, Freelancer):
            user = model.find_by_email(email)
            if user:
                return model.update(email, status="active")
        return None

    @classmethod
    def reject_user(cls, email):
        """Refuse un compte utilisateur (status → rejected)"""
        for model in (Client, Freelancer):
            user = model.find_by_email(email)
            if user:
                return model.update(email, status="rejected")
        return None

    @classmethod
    def get_pending_users(cls):
        """Récupère tous les comptes en attente de validation"""
        pending = []
        for model in (Client, Freelancer):
            if model.collection is not None:
                pending += [model._serialize(u) for u in model.collection.find({"status": "pending"})]
        for u in pending:
            u.pop("password", None)
        return pending
