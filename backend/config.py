import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configuration de l'application"""
    DEFAULT_MONGO_URI = "mongodb+srv://asmaabdedaiem_db_user:projetmobile@cluster0.wyxarhx.mongodb.net/freelancehub_db?retryWrites=true&w=majority"
    MONGO_URI = os.getenv("MONGO_URI", DEFAULT_MONGO_URI)
    MONGO_DB = os.getenv("MONGO_DB", "freelancehub_db")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1")
