"""
Run this ONCE to delete the duplicate collections created by the old broken code.
Usage:  python cleanup_collections.py
"""
from pymongo import MongoClient

MONGO_URI = "mongodb+srv://asmaabdedaiem_db_user:projetmobile@cluster0.wyxarhx.mongodb.net/freelancehub_db?retryWrites=true&w=majority"

client = MongoClient(MONGO_URI)
db = client["freelancehub_db"]

# Collections that should NOT exist (created by the old broken code)
TO_DELETE = ["message", "proposal", "connection", "connections"]

existing = db.list_collection_names()
print(f"Collections currently in freelancehub_db: {existing}\n")

for name in TO_DELETE:
    if name in existing:
        db.drop_collection(name)
        print(f"Dropped:  {name}")
    else:
        print(f"⏭  Skipped:  {name}  (doesn't exist)")

print(f"\nRemaining collections: {db.list_collection_names()}")
client.close()