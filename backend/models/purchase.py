from datetime import datetime
from bson import ObjectId
from db.mongo import db


class Purchase:
    """Modèle Purchase – collection 'purchases'"""

    collection = db["purchase"] if db is not None else None

    @classmethod
    def _serialize(cls, doc):
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    @classmethod
    def create(cls, buyer_id, product_id):

        if cls.collection is None:
            return None

        purchase = {
            "buyerId": buyer_id,
            "productId": ObjectId(product_id),
            "purchaseDate": datetime.now(),
            "downloaded": False
        }

        result = cls.collection.insert_one(purchase)
        purchase["_id"] = str(result.inserted_id)
        return purchase

    @classmethod
    def mark_downloaded(cls, purchase_id):
        cls.collection.update_one(
            {"_id": ObjectId(purchase_id)},
            {"$set": {"downloaded": True}}
        )