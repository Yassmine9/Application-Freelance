from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from db.mongo import test_connection
from models import Client, Freelancer, Admin, find_user_by_email, authenticate_user

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

    if not email or not password:
        return jsonify({"error": "Email et mot de passe requis"}), 400

    user = authenticate_user(email, password)

    if user:
        token = create_access_token(identity=email)
        return jsonify({
            "token": token,
            "user": user,
            "status": user.get("status", "active")
        })

    return jsonify({"error": "Email ou mot de passe incorrect"}), 401


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
        return jsonify({"error": "Email, mot de passe et nom sont requis"}), 400

    # Vérifier si l'email existe dans n'importe quelle collection
    existing_user = find_user_by_email(email)
    if existing_user:
        return jsonify({"error": "Un utilisateur avec cet email existe déjà"}), 400

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


# ─── PROFIL ───────────────────────────────────────────────────────────────────

@auth_routes.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    email = get_jwt_identity()
    user = find_user_by_email(email)
    if user:
        user.pop("password", None)
        return jsonify({"user": user})
    return jsonify({"error": "Utilisateur non trouvé"}), 404


# ─── ADMIN : Comptes en attente ────────────────────────────────────────────────

@auth_routes.route("/admin/pending", methods=["GET"])
@jwt_required()
def get_pending_users():
    email = get_jwt_identity()
    admin = Admin.find_by_email(email)
    if not admin:
        return jsonify({"error": "Accès réservé aux admins"}), 403

    pending = Admin.get_pending_users()
    return jsonify({"pending_users": pending, "count": len(pending)})


@auth_routes.route("/admin/validate", methods=["POST"])
@jwt_required()
def validate_user():
    admin_email = get_jwt_identity()
    admin = Admin.find_by_email(admin_email)
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
    admin_email = get_jwt_identity()
    admin = Admin.find_by_email(admin_email)
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