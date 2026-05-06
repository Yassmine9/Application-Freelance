from datetime import datetime
from bson import ObjectId
from db.mongo import db

class Category:
    collection = db["category"]

    @classmethod
    def _serialize(cls, doc):
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    @classmethod
    def create(cls, name, type_="product"):
        category = {
            "name": name,
            "type": type_,
            "created_at": datetime.utcnow()
        }

        result = cls.collection.insert_one(category)
        category["_id"] = str(result.inserted_id)
        return category

    @classmethod
    def get_all(cls):
        categories = cls.collection.find()
        return [cls._serialize(c) for c in categories]

    @classmethod
    def get_by_id(cls, category_id):
        category = cls.collection.find_one({"_id": ObjectId(category_id)})
        return cls._serialize(category)