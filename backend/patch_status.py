"""Ajoute le champ 'status' aux documents existants qui ne l'ont pas"""
from db.mongo import db

for col_name, default_status in [("client", "pending"), ("freelancer", "pending"), ("admins", "active")]:
    col = db[col_name]
    result = col.update_many(
        {"status": {"$exists": False}},
        {"$set": {"status": default_status}}
    )
    print(f"{col_name}: {result.modified_count} documents mis à jour avec status={default_status}")

print("Done!")
