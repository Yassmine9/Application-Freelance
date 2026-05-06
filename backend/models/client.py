from models.base_user import BaseUser
from db.mongo import db


class Client(BaseUser):
    _collection_name = "client"
    collection = db["client"] if db is not None else None

    @classmethod
    def create(cls, email, password, name, company_name="", phone="", is_blocked=False):
        return super().create(
            email=email,
            password=password,
            name=name,
            role="client",
            company_name=company_name,
            phone=phone,
            is_blocked=is_blocked,
            projects_posted=[]
        )