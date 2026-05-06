from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from db.mongo import db, test_connection
from models import Client, Freelancer, Admin, find_user_by_email, find_user_by_id, authenticate_user

auth_bp = Blueprint("auth_bp", __name__)

if test_connection():
    print(" Succès de la connexion ")
else:
    print(" échec de la connexion ")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON received"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email et mot de passe requis"}), 400

    user = authenticate_user(email, password)

    if user and user.get("is_blocked"):
        return jsonify({"error": "Compte bloque"}), 403

    if user:
        token = create_access_token(
            identity=user["_id"],
            additional_claims={"role": user.get("role")}
        )
        return jsonify({
            "token": token,
            "user": user,
            "status": user.get("status", "active")
        })

    return jsonify({"error": "Email ou mot de passe incorrect"}), 401

@auth_bp.route("/register", methods=["POST"])
def register():
    import sys
    try:
        print("=" * 50, flush=True)
        print("DEBUG: /register hit", flush=True)
        sys.stdout.flush()

        data = request.get_json(force=True)
        print("DEBUG: data =", data, flush=True)
        sys.stdout.flush()

        if not data:
            return jsonify({"error": "No JSON received"}), 400

        email = data.get("email")
        password = data.get("password")
        name = data.get("name")
        role = data.get("role", "client")

        print(f"DEBUG: role={role}", flush=True)
        sys.stdout.flush()

        if not email or not password or not name:
            return jsonify({"error": "Email, mot de passe et nom sont requis"}), 400

        existing_user = find_user_by_email(email)
        if existing_user:
            return jsonify({"error": "Un utilisateur avec cet email existe déjà"}), 400

        new_user = None

        if role == "client":
            new_user = Client.create(
                email=email, password=password, name=name,
                company_name=data.get("company_name", ""),
                phone=data.get("phone", "")
            )
        elif role == "freelancer":
            print("DEBUG: About to call Freelancer.create", flush=True)
            sys.stdout.flush()
            print("DEBUG: collection =", getattr(Freelancer, 'collection', 'NO ATTR'), flush=True)
            sys.stdout.flush()
            new_user = Freelancer.create(
                email=email,
                password=password,
                name=name,
                skills=data.get("skills", []),
                hourly_rate=data.get("hourly_rate", 0),
                bio=data.get("bio", ""),
                phone=data.get("phone", "")
            )
            print("DEBUG: create returned", new_user, flush=True)
            sys.stdout.flush()
        elif role == "admin":
            new_user = Admin.create(email=email, password=password, name=name)
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

    except Exception as e:
        import traceback
        print("DEBUG: UNCAUGHT EXCEPTION IN /register:", flush=True)
        traceback.print_exc()
        sys.stdout.flush()
        return jsonify({"error": "Server error: " + str(e)}), 500

@auth_bp.route("/feedback", methods=["POST"])
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


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = find_user_by_id(user_id)
    if user:
        user.pop("password", None)
        return jsonify({"user": user})
    return jsonify({"error": "Utilisateur non trouvé"}), 404


@auth_bp.route("/profile/<user_id>", methods=["GET"])
@jwt_required()
def get_profile_by_id(user_id):
    user = find_user_by_id(user_id)
    if user:
        user.pop("password", None)
        return jsonify(user)
    return jsonify({"error": "Utilisateur non trouvé"}), 404


@auth_bp.route("/freelancers/profile", methods=["GET"])
@jwt_required()
def get_freelancers_profile_alias():
    return get_profile()


@auth_bp.route("/freelancers", methods=["GET"])
def get_freelancers():
    freelancers_list = Freelancer.get_all()
    status_filter = (request.args.get("status") or "all").strip().lower()

    filtered = []
    for f in freelancers_list:
        if status_filter != "all" and f.get("status", "").lower() != status_filter:
            continue
        f.pop("password", None)
        filtered.append(f)

    return jsonify({"freelancers": filtered, "count": len(filtered)})


@auth_bp.route("/admin/pending", methods=["GET"])
@jwt_required()
def get_pending_users():
    admin_id = get_jwt_identity()
    admin = Admin.find_by_id(admin_id)
    if not admin:
        return jsonify({"error": "Accès réservé aux admins"}), 403

    pending = Admin.get_pending_users()
    return jsonify({"pending_users": pending, "count": len(pending)})


@auth_bp.route("/admin/validate", methods=["POST"])
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


@auth_bp.route("/admin/reject", methods=["POST"])
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
@auth_bp.route("/ping", methods=["GET"])
def ping():
    try:
        return jsonify({
            "db_type": str(type(db)),
            "db_is_none": db is None,
            "freelancer_collection": str(Freelancer.collection) if hasattr(Freelancer, 'collection') else "MISSING",
            "freelancer_class": str(Freelancer)
        })
    except Exception as e:
        import traceback, sys
        traceback.print_exc()
        sys.stdout.flush()
        return jsonify({"error": str(e)}), 500