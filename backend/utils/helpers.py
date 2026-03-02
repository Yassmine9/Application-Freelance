"""Fonctions utilitaires"""


def format_user(user):
    """Retire le mot de passe d'un utilisateur avant de le renvoyer"""
    if user:
        user.pop("password", None)
    return user
