from models.base_user import BaseUser
from models.client import Client
from models.freelancer import Freelancer


class Admin(BaseUser):
    """Modèle Admin – collection 'admin'"""
    _collection_name = "admin"

    @classmethod
    def create(cls, email, password, name):
        return super().create(
            email, password, name,
            role="admin",
            status="active",
            permissions=["manage_users", "manage_projects", "manage_proposals", "manage_gigs"]
        )

    @classmethod
    def validate_user(cls, email):
        """Valide un compte utilisateur (client → active, freelancer → approved)"""
        user = Client.find_by_email(email)
        if user:
            return Client.update(email, status="active")

        user = Freelancer.find_by_email(email)
        if user:
            return Freelancer.update(email, status="approved")
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
            coll = model.get_collection()
            pending += [model._serialize(u) for u in coll.find({"status": "pending"})]
        for u in pending:
            u.pop("password", None)
        return pending

    @classmethod
    def block_user(cls, email):
        for model in (Client, Freelancer):
            user = model.find_by_email(email)
            if user:
                return model.update(email, is_blocked=True)
        return None

    @classmethod
    def unblock_user(cls, email):
        for model in (Client, Freelancer):
            user = model.find_by_email(email)
            if user:
                return model.update(email, is_blocked=False)
        return None