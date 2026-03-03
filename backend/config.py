import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configuration de l'application"""
    MONGO_URI = os.getenv("MONGO_URI")
    MONGO_DB = os.getenv("MONGO_DB", "freelancehub_db")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1")
