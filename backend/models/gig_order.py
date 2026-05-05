from db.mongo import db
from bson import ObjectId
from datetime import datetime


class GigOrderModel:
    collection = db["gig_order"] if db is not None else None

    # ── Helpers ─────────────────────────────────────────────

    @staticmethod
    def _id_candidates(value):
        candidates = [str(value)]
        try:
            candidates.append(ObjectId(str(value)))
        except Exception:
            pass
        return candidates

    @classmethod
    def _worked_query(cls, client_id, freelancer_id, require_reviewable=False):
        query = {
            "$and": [
                {"$or": [
                    {"client_id": {"$in": cls._id_candidates(client_id)}},
                    {"clientId": {"$in": cls._id_candidates(client_id)}}
                ]},
                {"$or": [
                    {"freelancer_id": {"$in": cls._id_candidates(freelancer_id)}},
                    {"freelancerId": {"$in": cls._id_candidates(freelancer_id)}}
                ]}
            ]
        }
        if require_reviewable:
            query["$and"].append({"status": {"$in": ["completed", "closed"]}})
            query["$and"].append({"review_submitted": False})
        return query

    @staticmethod
    def _serialize(order):
        if order:
            order["_id"] = str(order["_id"])
        return order

    # ── Create Order (static factory) ───────────────────────

    @staticmethod
    def create_order(gig, client):
        """Build a new order document (without saving it)."""
        return {
            "gig_id":           str(gig['_id']),
            "gig_title":        gig['title'],
            "freelancer_id":    str(gig['freelancer_id']),
            "freelancer_name":  gig['freelancer_name'],
            "client_id":        str(client['_id']),
            "client_name":      client['name'],
            "price":            gig['price'],
            "requirements":     "",
            "status":           "pending",
            "review_submitted": False,
            "delivery": {
                "file_url":     None,
                "message":      None,
                "delivered_at": None
            },
            "cancellation": {
                "reason":       None,
                "cancelled_by": None,
                "cancelled_at": None
            },
            "revision_count":   0,
            "created_at":       datetime.utcnow(),
            "delivered_at":     None,
            "completed_at":     None,
            "status_history": [
                {
                    "status": "pending",
                    "date":   datetime.utcnow()
                }
            ]
        }

    # ── Read ────────────────────────────────────────────────

    @classmethod
    def find_by_id(cls, order_id):
        try:
            return cls._serialize(
                cls.collection.find_one({"_id": ObjectId(order_id)})
            )
        except Exception:
            return None

    @classmethod
    def find_by_freelancer(cls, freelancer_id, status=None):
        query = {"freelancer_id": freelancer_id}
        if status:
            query["status"] = status
        return [
            cls._serialize(o)
            for o in cls.collection.find(query).sort("created_at", -1)
        ]

    @classmethod
    def find_by_client(cls, client_id, status=None):
        query = {"client_id": client_id}
        if status:
            query["status"] = status
        return [
            cls._serialize(o)
            for o in cls.collection.find(query).sort("created_at", -1)
        ]

    @classmethod
    def find_all(cls):
        return [
            cls._serialize(o)
            for o in cls.collection.find().sort("created_at", -1)
        ]

    # ── Update Helpers (used in service) ────────────────────

    @classmethod
    def update_status(cls, order_id, new_status, extra_fields=None, history_entry=None):
        """
        Core method to update order status.
        - extra_fields: dict of additional fields to set
        - history_entry: dict (e.g. {"status": "in_progress"}) to push to status_history
        """
        update_set = {"status": new_status}
        if extra_fields:
            update_set.update(extra_fields)

        update = {"$set": update_set}
        if history_entry:
            # Ensure date exists
            if "date" not in history_entry:
                history_entry["date"] = datetime.utcnow()
            update["$push"] = {"status_history": history_entry}

        cls.collection.update_one(
            {"_id": ObjectId(order_id)},
            update
        )
        return cls.find_by_id(order_id)

    @staticmethod
    def get_status_update(new_status, extra_fields=None):
        """Return a dict suitable for $set (legacy helper)."""
        update = {"status": new_status}
        if extra_fields:
            update.update(extra_fields)
        return update

    @staticmethod
    def get_history_entry(status, note=None):
        entry = {"status": status, "date": datetime.utcnow()}
        if note:
            entry["note"] = note
        return entry

    @staticmethod
    def cancel_order(cancelled_by_role, reason):
        """
        Return a MongoDB update dict ($set + $push) for cancelling an order.
        Use as: collection.update_one({"_id": order_id}, update_dict)
        """
        now = datetime.utcnow()
        return {
            "$set": {
                "status": "cancelled",
                "cancellation.reason": reason,
                "cancellation.cancelled_by": cancelled_by_role,
                "cancellation.cancelled_at": now
            },
            "$push": {
                "status_history": {
                    "status": "cancelled",
                    "cancelled_by": cancelled_by_role,
                    "reason": reason,
                    "date": now
                }
            }
        }

    @staticmethod
    def can_cancel(order, user_id, user_role):
        """
        Check if an order can be cancelled by given user.
        Returns (allowed, error_message).
        """
        status = order["status"]
        is_client = str(order["client_id"]) == user_id
        is_freelancer = str(order["freelancer_id"]) == user_id

        if not is_client and not is_freelancer:
            return False, "Unauthorized"

        if status in ["completed", "delivered"]:
            return False, f"Cannot cancel a '{status}' order"
        if status == "cancelled":
            return False, "Order is already cancelled"

        if is_freelancer and status != "pending":
            return False, "Freelancers can only cancel pending orders"
        if is_client and status not in ["pending", "in_progress"]:
            return False, "Cannot cancel at this stage"

        return True, None

    # ── Format for API Response ─────────────────────────────

    @staticmethod
    def format_order(order):
        """Convert MongoDB document to a clean, serializable dict."""
        return {
            "_id": str(order["_id"]),
            "gig_id": str(order["gig_id"]),
            "gig_title": order["gig_title"],
            "freelancer_id": str(order["freelancer_id"]),
            "freelancer_name": order["freelancer_name"],
            "client_id": str(order["client_id"]),
            "client_name": order["client_name"],
            "price": order["price"],
            "requirements": order.get("requirements", ""),
            "status": order["status"],
            "review_submitted": order.get("review_submitted", False),
            "revision_count": order.get("revision_count", 0),
            "delivery": order.get("delivery", {
                "file_url": None,
                "message": None,
                "delivered_at": None
            }),
            "cancellation": order.get("cancellation", {
                "reason": None,
                "cancelled_by": None,
                "cancelled_at": None
            }),
            "created_at": str(order["created_at"]),
            "delivered_at": str(order["delivered_at"]) if order.get("delivered_at") else None,
            "completed_at": str(order["completed_at"]) if order.get("completed_at") else None,
            "status_history": [
                {
                    "status": h["status"],
                    "date": str(h["date"]),
                    **({"note": h["note"]} if "note" in h else {})
                }
                for h in order.get("status_history", [])
            ]
        }

    @classmethod
    def get_unreviewed_order(cls, client_id, freelancer_id):
        query = cls._worked_query(client_id, freelancer_id, require_reviewable=True)
        order = cls.collection.find_one(query, sort=[("created_at", -1)])
        return cls._serialize(order) if order else None

    @classmethod
    def client_worked_with_freelancer(cls, client_id, freelancer_id):
        query = cls._worked_query(client_id, freelancer_id, require_reviewable=False)
        order = cls.collection.find_one(query)
        return cls._serialize(order) if order else None
    @classmethod
    def mark_order_reviewed(cls, order_id):
        try:
            cls.collection.update_one(
                {"_id": ObjectId(order_id)},
                {"$set": {"review_submitted": True}}
                )
            return True
        except Exception:
            return False