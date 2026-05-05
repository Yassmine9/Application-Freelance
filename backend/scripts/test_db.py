import sys
sys.path.insert(0, '.')

print("Importing db...")
from db.mongo import db
print(f"db is None: {db is None}")

print("\nImporting Freelancer...")
from models.freelancer import Freelancer
print(f"Freelancer._collection_name: {Freelancer._collection_name}")

print("\nTrying Freelancer.create()...")
try:
    result = Freelancer.create(
        email="test@example.com",
        password="password123",
        name="Test User",
        phone="12345678",
        skills=["React"],
        hourly_rate=50,
        bio="Test bio"
    )
    print(f"Result: {result}")
except Exception as e:
    import traceback
    print("EXCEPTION:")
    traceback.print_exc()