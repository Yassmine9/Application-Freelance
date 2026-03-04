from datetime import datetime
from db.mongo import db

class AdminStat:
    """Model AdminStat – collection 'admin_stats'"""
    
    collection = db["admin_stat"] if db is not None else None

    @classmethod
    def create(cls, total_users=0, total_gigs=0, total_products=0, total_offers=0):
        if cls.collection is None:
            return None

        doc = {
            "totalUsers": total_users,
            "totalGigs": total_gigs,
            "totalProducts": total_products,
            "totalOffers": total_offers,
            "updatedAt": datetime.now()
        }
        result = cls.collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return doc

    @classmethod
    def get_latest(cls):
        if cls.collection is None:
            return None
        doc = cls.collection.find_one(sort=[("updatedAt", -1)])
        return cls._serialize(doc)

    @classmethod
    def _serialize(cls, doc):
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc