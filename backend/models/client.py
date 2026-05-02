from db.mongo import db
from models.base_user import BaseUser


class Client(BaseUser):
    """Modèle Client – collection 'client'"""
    collection = db["client"] if db is not None else None

    @classmethod
    def create(cls, email, password, name, company_name="", phone="", **kwargs):
        client_data = {
            "company_name": company_name,
            "phone": phone,
            "is_blocked": False,
            "status": kwargs.get("status", "pending"),
            "projects_posted": []
        }
        
        # Overlay any other fields passed through kwargs
        client_data.update(kwargs)

        return super().create(
            email, password, name,
            role="client",
            **client_data
        )
