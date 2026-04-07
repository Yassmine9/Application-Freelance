from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from db.mongo import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from db.mongo import test_connection
from models import Client, Freelancer, Admin, find_user_by_email, find_user_by_id, authenticate_user

auth_routes = Blueprint("auth_routes", __name__)


if test_connection():
    print(" Succès de la connexion ")
else:
    print(" échec de la connexion ")



@auth_routes.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON received"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password or user.is_blocked:
        return jsonify({"error": "Email and password are required"}), 400

    user = authenticate_user(email, password)

    if user:
        token = create_access_token(identity=user["_id"])
        return jsonify({
            "token": token,
            "user": user,
            "status": user.get("status", "active")
        })

    return jsonify({"error": "Email or password is incorrect"}), 401


@auth_routes.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON received"}), 400

    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    role = data.get("role", "client")

    if not email or not password or not name:
        return jsonify({"error": "Email, password and name are required"}), 400

    # Vérifier si l'email existe dans n'importe quelle collection
    existing_user = find_user_by_email(email)
    if existing_user:
        return jsonify({"error": "A user with this email already exists"}), 400

    new_user = None

    if role == "client":
        new_user = Client.create(
            email=email,
            password=password,
            name=name,
            company_name=data.get("company_name", ""),
            phone=data.get("phone", "")
        )
    elif role == "freelancer":
        new_user = Freelancer.create(
            email=email,
            password=password,
            name=name,
            skills=data.get("skills", []),
            hourly_rate=data.get("hourly_rate", 0),
            bio=data.get("bio", ""),
            phone=data.get("phone", "")
        )
    elif role == "admin":
        new_user = Admin.create(
            email=email,
            password=password,
            name=name
        )
    else:
        return jsonify({"error": f"Rôle inconnu: {role}"}), 400

    if new_user and "error" not in new_user:
        return jsonify({
            "message": "Compte créé avec succès. En attente de validation par l'admin.",
            "status": "pending",
            "user": new_user
        }), 201
    elif new_user and "error" in new_user:
        return jsonify(new_user), 400
    else:
        return jsonify({"error": "Erreur base de données"}), 500


@auth_routes.route("/feedback", methods=["POST"])
def create_feedback():
    if db is None:
        return jsonify({"error": "Database unavailable"}), 503

    data = request.get_json() or {}
    subject = (data.get("subject") or "").strip()
    message = (data.get("message") or "").strip()
    contact_email = (data.get("contactEmail") or "").strip()

    if not subject or not message:
        return jsonify({"error": "Subject and message are required"}), 400

    feedback_doc = {
        "subject": subject,
        "message": message,
        "contact_email": contact_email or None,
        "recipient_role": "admin",
        "status": "new",
        "created_at": datetime.now(timezone.utc),
    }

    inserted = db["feedback"].insert_one(feedback_doc)

    return jsonify({
        "message": "Feedback sent to admin",
        "feedbackId": str(inserted.inserted_id)
    }), 201


# ─── PROFIL ───────────────────────────────────────────────────────────────────

@auth_routes.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = find_user_by_id(user_id)
    if user:
        user.pop("password", None)
        return jsonify({"user": user})
    return jsonify({"error": "Utilisateur non trouvé"}), 404


# ─── ADMIN : Comptes en attente ────────────────────────────────────────────────

@auth_routes.route("/admin/pending", methods=["GET"])
@jwt_required()
def get_pending_users():
    admin_id = get_jwt_identity()
    admin = Admin.find_by_id(admin_id)
    if not admin:
        return jsonify({"error": "Accès réservé aux admins"}), 403

    pending = Admin.get_pending_users()
    return jsonify({"pending_users": pending, "count": len(pending)})


@auth_routes.route("/admin/validate", methods=["POST"])
@jwt_required()
def validate_user():
    admin_id = get_jwt_identity()
    admin = Admin.find_by_id(admin_id)
    if not admin:
        return jsonify({"error": "Accès réservé aux admins"}), 403

    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email requis"}), 400

    user = Admin.validate_user(email)
    if user:
        user.pop("password", None)
        return jsonify({"message": f"Compte {email} validé", "user": user})
    return jsonify({"error": "Utilisateur non trouvé"}), 404


@auth_routes.route("/admin/reject", methods=["POST"])
@jwt_required()
def reject_user():
    admin_id = get_jwt_identity()
    admin = Admin.find_by_id(admin_id)
    if not admin:
        return jsonify({"error": "Accès réservé aux admins"}), 403

    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email requis"}), 400

    user = Admin.reject_user(email)
    if user:
        user.pop("password", None)
        return jsonify({"message": f"Compte {email} refusé", "user": user})
    return jsonify({"error": "Utilisateur non trouvé"}), 404