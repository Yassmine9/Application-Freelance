from db.mongo import db
from models.base_user import BaseUser


class Client(BaseUser):
    """Modèle Client – collection 'clients'"""
    collection = db["clients"] if db is not None else None

    @classmethod
    def create(cls, email, password, name, company_name="", phone=""):
        return super().create(
            email, password, name,
            role="client",
            company_name=company_name,
            phone=phone,
            projects_posted=[]
        )
