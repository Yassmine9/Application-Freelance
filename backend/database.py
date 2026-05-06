from pymongo import MongoClient
import os

MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://asmaabdedaiem_db_user:projetmobile@cluster0.wyxarhx.mongodb.net/freelancehub_db?retryWrites=true&w=majority"
)

client = MongoClient(MONGO_URI)
db = client["freelancehub_db"]   

def init_indexes():
    db.offers.create_index("clientId")
    db.offers.create_index("status")
    db.offers.create_index("category")
    db.proposals.create_index("offerId")
    db.proposals.create_index("freelancersId")
    db.messages.create_index([("offerId", 1), ("createdAt", 1)])