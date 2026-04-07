from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required
from bson import ObjectId
from database import db

auth_bp = Blueprint("auth", __name__)

MOCK_USERS = {
    "client":     {"userId": "aaa000000000000000000001", "role": "client",
                   "name": "Demo Client", "email": "client@demo.com"},
    "freelancer": {"userId": "aaa000000000000000000002", "role": "freelancer",
                   "name": "Demo Freelancer", "email": "freelancer@demo.com",
                   "skills": ["React", "Node.js", "Python", "UI Design"]}
}

MOCK_BY_ID = {v["userId"]: v for v in MOCK_USERS.values()}

@auth_bp.route("/mock-login", methods=["POST"])
def mock_login():
    data = request.json or {}
    role = data.get("role", "freelancer")

    if role not in MOCK_USERS:
        return jsonify({"error": "role must be 'client' or 'freelancer'"}), 400

    user = MOCK_USERS[role]
    token = create_access_token(
        identity=user["userId"],
        additional_claims={"role": role},
        expires_delta=False
    )
    return jsonify({"token": token, "userId": user["userId"], "role": role}), 200


@auth_bp.route("/profile/<user_id>", methods=["GET"])
@jwt_required()
def get_profile(user_id):
    # 1. Check mock users
    if user_id in MOCK_BY_ID:
        return jsonify(MOCK_BY_ID[user_id]), 200

    # 2. Try real DB
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])
            return jsonify(user), 200
    except Exception:
        pass

    return jsonify({"error": "User not found"}), 404
