from db.mongo import db

class Report:
    """Model Report – collection 'reports'"""
    
    collection = db["report"] if db is not None else None

    @classmethod
    def create(cls, reported_by, target_type, target_id, reason, status="pending"):
        if cls.collection is None:
            return None

        doc = {
            "reportedBy": reported_by,
            "targetType": target_type,
            "targetId": target_id,
            "reason": reason,
            "status": status
        }
        result = cls.collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return doc

    @classmethod
    def get_all(cls):
        if cls.collection is None:
            return []
        return [cls._serialize(doc) for doc in cls.collection.find()]

    @classmethod
    def _serialize(cls, doc):
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc