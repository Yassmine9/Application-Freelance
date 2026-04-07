from db.mongo import db
from models.base_user import BaseUser


class Client(BaseUser):
    collection = db["client"] if db is not None else None

    @classmethod
    def create(cls, email, password, name, company_name="", phone="",is_blocked=False):
        return super().create(
            email, password, name,
            role="client",
            company_name=company_name,
            phone=phone,
            is_blocked=False,
            projects_posted=[]
        )
