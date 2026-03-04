from datetime import datetime
from bson import ObjectId
from db.mongo import db


class Product:
    """Modèle Product – collection 'products'"""

    collection = db["product"] if db is not None else None

    @classmethod
    def _serialize(cls, doc):
        if doc:
            doc["_id"] = str(doc["_id"])
            doc["category_id"] = str(doc["category_id"])
        return doc

    @classmethod
    def create(cls, creator_id, title, description,
               version, license, price, file_path, category_id):

        if cls.collection is None:
            return None

        product = {
            "creatorId": creator_id,
            "title": title,
            "description": description,
            "version": version,
            "license": license,
            "price": price,
            "filePath": file_path,
            "status": "active",
            "downloadCount": 0,
            "category_id": ObjectId(category_id),
            "createdAt": datetime.now()
        }

        result = cls.collection.insert_one(product)
        product["_id"] = str(result.inserted_id)
        product["category_id"] = str(product["category_id"])
        return product

    @classmethod
    def get_all(cls, category_id=None, search=None):
        query = {}
        if category_id:
            query["category_id"] = ObjectId(category_id)
        if search:
            query["title"] = {"$regex": search, "$options": "i"}

        products = cls.collection.find(query)
        return [cls._serialize(p) for p in products]


    @classmethod
    def get_by_id(cls, product_id):
        if cls.collection is None:
            return None
        return cls._serialize(
            cls.collection.find_one({"_id": ObjectId(product_id)})
        )

    @classmethod
    def increment_download(cls, product_id):
        cls.collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$inc": {"downloadCount": 1}}
        )