from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from db.mongo import db


class BaseUser:
    """Classe de base avec les méthodes CRUD partagées"""
    collection = None

    @classmethod
    def _serialize(cls, doc):
        """Convertit un document MongoDB en dict sérialisable"""
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    @classmethod
    def create(cls, email, password, name, role, **extra_fields):
        """Crée et enregistre automatiquement dans la collection dédiée"""
        if cls.collection is None:
            return None

        if cls.collection.find_one({"email": email}):
            return {"error": "Un utilisateur avec cet email existe déjà"}

        doc = {
            "email": email,
            "password": generate_password_hash(password),
            "name": name,
            "role": role,
            "status": extra_fields.pop("status", "pending"),
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            **extra_fields
        }
        result = cls.collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        doc.pop("password")
        return doc

    @classmethod
    def find_by_email(cls, email):
        if cls.collection is None:
            return None
        return cls._serialize(cls.collection.find_one({"email": email}))

    @classmethod
    def find_by_id(cls, user_id):
        from bson import ObjectId
        if cls.collection is None:
            return None
        return cls._serialize(cls.collection.find_one({"_id": ObjectId(user_id)}))

    @classmethod
    def get_all(cls):
        if cls.collection is None:
            return []
        return [cls._serialize(u) for u in cls.collection.find()]

    @classmethod
    def authenticate(cls, email, password):
        if cls.collection is None:
            return None
        user = cls.collection.find_one({"email": email})
        if user and check_password_hash(user["password"], password):
            user["_id"] = str(user["_id"])
            user.pop("password")
            return user
        return None

    @classmethod
    def update(cls, email, **fields):
        if cls.collection is None:
            return None
        fields["updated_at"] = datetime.now()
        cls.collection.update_one({"email": email}, {"$set": fields})
        return cls.find_by_email(email)

    @classmethod
    def delete(cls, email):
        if cls.collection is None:
            return False
        result = cls.collection.delete_one({"email": email})
        return result.deleted_count > 0
