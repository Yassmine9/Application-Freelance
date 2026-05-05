from models.base_user import BaseUser


class Client(BaseUser):
    """Modèle Client – collection 'client'"""
    _collection_name = "client"

    @classmethod
    def create(cls, email, password, name, company_name="", phone="", is_blocked=False):
        return super().create(
            email, password, name,
            role="client",
            company_name=company_name,
            phone=phone,
            is_blocked=is_blocked,
            projects_posted=[]
        )