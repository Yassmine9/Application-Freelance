from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import Client, Freelancer, Admin, find_user_by_email, find_user_by_id, authenticate_user

auth_bp = Blueprint("auth", __name__)

MOCK_USERS = {
    "client": {
        "userId": "aaa000000000000000000001",
        "role": "client",
        "name": "Demo Client",
        "email": "client@demo.com"
    },
    "freelancer": {
        "userId": "aaa000000000000000000002",
        "role": "freelancer",
        "name": "Demo Freelancer",
        "email": "freelancer@demo.com",
        "skills": ["React", "Node.js", "Python", "UI Design"]
    }
}

MOCK_BY_ID = {v["userId"]: v for v in MOCK_USERS.values()}


@auth_bp.route("/mock-login", methods=["POST"])
def mock_login():
    data = request.get_json() or {}
    role = data.get("role", "freelancer")

    if role not in MOCK_USERS:
        return jsonify({"error": "role must be 'client' or 'freelancer'"}), 400

    user = MOCK_USERS[role]
    token = create_access_token(
        identity=user["userId"],
        additional_claims={"role": role}
    )
    return jsonify({"token": token, "userId": user["userId"], "role": role}), 200


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = authenticate_user(email, password)
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    if user.get("is_blocked"):
        return jsonify({"error": "User account is blocked"}), 403

    token = create_access_token(identity=user["_id"], additional_claims={"role": user.get("role")})
    return jsonify({
        "token": token,
        "user": user,
        "status": user.get("status", "active")
    })


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    role = data.get("role", "client")

    if not email or not password or not name:
        return jsonify({"error": "Email, password, and name are required"}), 400

    existing_user = find_user_by_email(email)
    if existing_user:
        return jsonify({"error": "User with this email already exists"}), 400

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
        new_user = Admin.create(email=email, password=password, name=name)
    else:
        return jsonify({"error": f"Unknown role: {role}"}), 400

    if new_user and "error" not in new_user:
        return jsonify({
            "message": "Account created. Pending admin approval.",
            "status": "pending",
            "user": new_user
        }), 201

    if new_user and "error" in new_user:
        return jsonify(new_user), 400

    return jsonify({"error": "Database error"}), 500


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = find_user_by_id(user_id)
    if user:
        user.pop("password", None)
        return jsonify({"user": user})
    return jsonify({"error": "User not found"}), 404


@auth_bp.route("/profile/<user_id>", methods=["GET"])
@jwt_required()
def get_profile_by_id(user_id):
    if user_id in MOCK_BY_ID:
        return jsonify(MOCK_BY_ID[user_id]), 200

    user = find_user_by_id(user_id)
    if user:
        user.pop("password", None)
        return jsonify(user)
    return jsonify({"error": "User not found"}), 404


@auth_bp.route("/admin/pending", methods=["GET"])
@jwt_required()
def get_pending_users():
    admin_id = get_jwt_identity()
    admin = Admin.find_by_id(admin_id)
    if not admin:
        return jsonify({"error": "Admin access required"}), 403

    pending = Admin.get_pending_users()
    return jsonify({"pending_users": pending, "count": len(pending)})


@auth_bp.route("/admin/validate", methods=["POST"])
@jwt_required()
def validate_user():
    admin_id = get_jwt_identity()
    admin = Admin.find_by_id(admin_id)
    if not admin:
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json() or {}
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400

    user = Admin.validate_user(email)
    if user:
        user.pop("password", None)
        return jsonify({"message": f"Account {email} validated", "user": user})
    return jsonify({"error": "User not found"}), 404


@auth_bp.route("/admin/reject", methods=["POST"])
@jwt_required()
def reject_user():
    admin_id = get_jwt_identity()
    admin = Admin.find_by_id(admin_id)
    if not admin:
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json() or {}
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400

    user = Admin.reject_user(email)
    if user:
        user.pop("password", None)
        return jsonify({"message": f"Account {email} rejected", "user": user})
    return jsonify({"error": "User not found"}), 404


@auth_bp.route("/admin/block", methods=["POST"])
@jwt_required()
def block_user():
    admin_id = get_jwt_identity()
    admin = Admin.find_by_id(admin_id)
    if not admin:
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json() or {}
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400

    user = Admin.block_user(email)
    if user:
        user.pop("password", None)
        return jsonify({"message": f"Account {email} blocked", "user": user})
    return jsonify({"error": "User not found"}), 404


@auth_bp.route("/admin/unblock", methods=["POST"])
@jwt_required()
def unblock_user():
    admin_id = get_jwt_identity()
    admin = Admin.find_by_id(admin_id)
    if not admin:
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json() or {}
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400

    user = Admin.unblock_user(email)
    if user:
        user.pop("password", None)
        return jsonify({"message": f"Account {email} unblocked", "user": user})
    return jsonify({"error": "User not found"}), 404
