from db.mongo import db
from bson import ObjectId
from datetime import datetime


class Proposal:
    """Model for freelancers Proposals - collection 'proposals'"""
    
    collection = db["proposal"] if db is not None else None

    @classmethod
    def _serialize(cls, doc):
        """Converts MongoDB document to serializable dict"""
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    @classmethod
    def create(cls, project_id, freelancers_id, freelancers_name, freelancers_avatar, 
               proposal_text, budget, duration, cover_letter=""):
        """Create a new proposal"""
        if cls.collection is None:
            return None

        proposal = {
            "project_id": project_id,
            "freelancers_id": ObjectId(freelancers_id) if isinstance(freelancers_id, str) else freelancers_id,
            "freelancers_name": freelancers_name,
            "freelancers_avatar": freelancers_avatar,
            "proposal_text": proposal_text,
            "cover_letter": cover_letter,
            "budget": budget,
            "duration": duration,
            "status": "pending",  # pending, accepted, rejected, withdrawn
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        result = cls.collection.insert_one(proposal)
        proposal["_id"] = str(result.inserted_id)
        return cls._serialize(proposal)

    @classmethod
    def find_by_id(cls, proposal_id):
        """Find proposal by ID"""
        try:
            return cls._serialize(
                cls.collection.find_one({"_id": ObjectId(proposal_id)})
            )
        except Exception:
            return None

    @classmethod
    def find_by_project(cls, project_id):
        """Find all proposals for a project"""
        try:
            proposals = cls.collection.find({"project_id": project_id})
            return [cls._serialize(p) for p in proposals]
        except Exception:
            return []

    @classmethod
    def find_by_freelancers(cls, freelancers_id):
        """Find all proposals by a freelancers"""
        try:
            freelancers_oid = ObjectId(freelancers_id) if isinstance(freelancers_id, str) else freelancers_id
            proposals = cls.collection.find({"freelancers_id": freelancers_oid})
            return [cls._serialize(p) for p in proposals]
        except Exception:
            return []

    @classmethod
    def update_status(cls, proposal_id, status):
        """Update proposal status"""
        if cls.collection is None:
            return None
        
        result = cls.collection.update_one(
            {"_id": ObjectId(proposal_id)},
            {
                "$set": {
                    "status": status,
                    "updated_at": datetime.now()
                }
            }
        )
        return result.modified_count > 0

    @classmethod
    def get_all(cls):
        """Get all proposals"""
        if cls.collection is None:
            return []
        return [cls._serialize(p) for p in cls.collection.find()]

    @classmethod
    def delete(cls, proposal_id):
        """Delete a proposal"""
        if cls.collection is None:
            return False
        
        result = cls.collection.delete_one({"_id": ObjectId(proposal_id)})
        return result.deleted_count > 0
