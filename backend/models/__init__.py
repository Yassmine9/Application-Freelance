from models.base_user import BaseUser
from models.client import Client
from models.freelancer import Freelancer
from models.admin import Admin


# ─── Fonctions utilitaires pour chercher dans toutes les collections ─────────

def find_user_by_email(email):
    """Cherche un utilisateur dans les 3 collections"""
    for model in (Client, Freelancer, Admin):
        user = model.find_by_email(email)
        if user:
            return user
    return None


def find_user_by_id(user_id):
    """Cherche un utilisateur par id dans les 3 collections"""
    for model in (Client, Freelancer, Admin):
        user = model.find_by_id(user_id)
        if user:
            return user
    return None


def authenticate_user(email, password):
    """Authentifie un utilisateur depuis n'importe quelle collection"""
    for model in (Client, Freelancer, Admin):
        user = model.authenticate(email, password)
        if user:
            return user
    return None
