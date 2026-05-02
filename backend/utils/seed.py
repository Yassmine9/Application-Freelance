import sys, os

# Permet de lancer le fichier directement ou en module
if __package__ is None or __package__ == "":
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from db.mongo import test_connection
from models import Client, Freelancer, Admin


def seed_database():

    if not test_connection():
        print(" Impossible de se connecter à MongoDB")
        return

    Client.create(
        email="client@test.com",
        password="1234",
        name="Ahmed Client",
        company_name="TechCorp",
        phone="0600000001"
    )
    Client.create(
        email="client2@test.com",
        password="1234",
        name="Sara Client",
        company_name="DesignStudio",
        phone="0600000002"
    )

    Freelancer.create(
        email="freelancers@test.com",
        password="1234",
        name="Youssef Dev",
        skills=["Python", "Flask", "MongoDB"],
        hourly_rate=50,
        bio="Développeur full-stack avec 5 ans d'expérience",
        phone="0600000003"
    )
    Freelancer.create(
        email="freelancers2@test.com",
        password="1234",
        name="Fatima Designer",
        skills=["UI/UX", "Figma", "React"],
        hourly_rate=40,
        bio="Designer UI/UX passionnée",
        phone="0600000004"
    )

    Admin.create(
        email="admin@test.com",
        password="admin1234",
        name="Super Admin"
    )


if __name__ == "__main__":
    seed_database()
