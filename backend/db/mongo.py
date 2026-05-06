from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from config import Config

try:
    client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print(f"Connexion MongoDB réussie à {Config.MONGO_URI}")
    db = client[Config.MONGO_DB]

except ConnectionFailure as e:
    print(f" Erreur de connexion MongoDB: {e}")
    print("  L'application fonctionnera sans base de données")
    client = None
    db = None


def test_connection():
    if client is None:
        return False
    try:
        client.admin.command('ping')
        return True
    except:
        return False


def get_db():
    return db


def close_connection():
    if client:
        client.close()
        print("Connexion MongoDB fermée")
