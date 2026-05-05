from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from db.mongo import db


class BaseUser:
    """Classe de base avec les méthodes CRUD partagées"""
    _collection_name = None  # override in subclasses

    @classmethod
    def get_collection(cls):
        if cls._collection_name is None:
            raise RuntimeError(f"{cls.__name__}._collection_name is not set")
        if db is None:
            raise RuntimeError("Database connection (db) is None")
        return db[cls._collection_name]

    @classmethod
    def _serialize(cls, doc):
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    @classmethod
    def create(cls, email, password, name, role, **extra_fields):
        """Crée et enregistre automatiquement dans la collection dédiée"""
        if cls.collection is None:
            print(f"[ERROR] Collection is None for {cls.__name__}")
            return {"error": f"Collection not initialized for {cls.__name__}"}
        coll = cls.get_collection()

        if coll.find_one({"email": email}):
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
        try:
            result = cls.collection.insert_one(doc)
            doc["_id"] = str(result.inserted_id)
            doc.pop("password")
            print(f"[SUCCESS] Created {role} user: {email}")
            return doc
        except Exception as e:
            print(f"[ERROR] Failed to create user: {e}")
            return {"error": str(e)}

    @classmethod
    def find_by_email(cls, email):
        return cls._serialize(cls.get_collection().find_one({"email": email}))

    @classmethod
    def find_by_name(cls, name):
        return cls._serialize(cls.get_collection().find_one({"name": name}))

    @classmethod
    def find_by_id(cls, user_id):
        from bson import ObjectId
        try:
            object_id = ObjectId(user_id)
        except Exception:
            return None
        return cls._serialize(cls.get_collection().find_one({"_id": object_id}))

    @classmethod
    def get_all(cls):
        return [cls._serialize(u) for u in cls.get_collection().find()]

    @classmethod
    def authenticate(cls, email, password):
        user = cls.get_collection().find_one({"email": email})
        if user and check_password_hash(user["password"], password):
            user["_id"] = str(user["_id"])
            user.pop("password")
            return user
        return None

    @classmethod
    def update(cls, email, **fields):
        fields["updated_at"] = datetime.now()
        cls.get_collection().update_one({"email": email}, {"$set": fields})
        return cls.find_by_email(email)

    @classmethod
    def delete(cls, email):
        result = cls.get_collection().delete_one({"email": email})
        return result.deleted_count > 0