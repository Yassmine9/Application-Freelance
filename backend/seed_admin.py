import sys
sys.path.insert(0, '.')

from models.admin import Admin

# Check if admin already exists
existing = Admin.find_by_email("admin@freelance.com")
if existing:
    print("Admin already exists:", existing["email"])
else:
    admin = Admin.create(
        email="admin@freelance.com",
        password="admin123",
        name="Super Admin"
    )
    if admin and "error" not in admin:
        print("Admin created successfully!")
        print("Email: admin@freelance.com")
        print("Password: admin123")
    else:
        print("Failed to create admin:", admin)