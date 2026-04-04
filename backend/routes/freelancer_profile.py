from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.freelancer import Freelancer
import os
from werkzeug.utils import secure_filename

freelancer_profile_bp = Blueprint('freelancer_profile', __name__)

CV_FOLDER     = 'uploads/cv'
AVATAR_FOLDER = 'uploads/avatars'
ALLOWED_CV     = {'pdf', 'doc', 'docx'}
ALLOWED_IMG    = {'jpg', 'jpeg', 'png'}

def allowed_file(filename, allowed):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


# ── GET my profile ──────────────────────────────────────────
@freelancer_profile_bp.route('/freelancer/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = Freelancer.find_by_id(user_id)

    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    if user.get("role") != "freelancer":
        return jsonify({"error": "Accès refusé"}), 403

    return jsonify({
        "user": {
        "id":                 user["_id"],
        "name":               user.get("name", ""),
        "email":              user.get("email", ""),
        "phone":              user.get("phone", ""),
        # hero
        "title":              user.get("title", ""),
        "avatar_filename":    user.get("avatar_filename", ""),
        "success_rate":       user.get("success_rate", 0),
        # bio & skills
        "bio":                user.get("bio", ""),
        "skills":             user.get("skills", []),
        "hourly_rate":        user.get("hourly_rate", 0),
        # cv
        "cv_filename":        user.get("cv_filename", ""),
        # portfolio
        "portfolio":          user.get("portfolio", []),
        # stats
        "projects_completed": user.get("projects_completed", 0),
        "client_rating":      user.get("client_rating", 0.0),
        "experience_years":   user.get("experience_years", 0),
        # status
        "status":             user.get("status", "draft"),
    }}), 200


# ── UPDATE my profile ────────────────────────────────────────
@freelancer_profile_bp.route('/freelancer/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()

    user = Freelancer.find_by_id(user_id)
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    if user.get("role") != "freelancer":
        return jsonify({"error": "Accès refusé"}), 403

    # freelancer can only update these fields
    allowed_fields = [
        "title", "bio", "skills",
        "hourly_rate", "phone",
        "experience_years", "projects_completed",
        "portfolio"
    ]
    updates = {k: v for k, v in data.items() if k in allowed_fields}

    if not updates:
        return jsonify({"error": "Aucun champ valide à mettre à jour"}), 400

    # auto move to pending when freelancer saves
    current_status = user.get("status", "draft")
    if current_status in ["draft", "rejected"]:
        updates["status"] = "pending"

    Freelancer.update(user["email"], **updates)

    return jsonify({
        "message": "Profil mis à jour avec succès",
        "status": updates.get("status", current_status)
    }), 200


# ── UPLOAD AVATAR ────────────────────────────────────────────
@freelancer_profile_bp.route('/freelancer/profile/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    user_id = get_jwt_identity()
    user = Freelancer.find_by_id(user_id)

    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    if 'avatar' not in request.files:
        return jsonify({"error": "Aucun fichier fourni"}), 400

    file = request.files['avatar']
    if not allowed_file(file.filename, ALLOWED_IMG):
        return jsonify({"error": "Seulement JPG, JPEG, PNG acceptés"}), 400

    os.makedirs(AVATAR_FOLDER, exist_ok=True)
    filename = secure_filename(f"{user_id}_avatar.{file.filename.rsplit('.', 1)[1].lower()}")
    file.save(os.path.join(AVATAR_FOLDER, filename))

    Freelancer.update(user["email"], avatar_filename=filename)

    return jsonify({"message": "Avatar uploadé", "avatar_filename": filename}), 200


# ── UPLOAD CV ────────────────────────────────────────────────
@freelancer_profile_bp.route('/freelancer/profile/cv', methods=['POST'])
@jwt_required()
def upload_cv():
    user_id = get_jwt_identity()
    user = Freelancer.find_by_id(user_id)

    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    if 'cv' not in request.files:
        return jsonify({"error": "Aucun fichier fourni"}), 400

    file = request.files['cv']
    if not allowed_file(file.filename, ALLOWED_CV):
        return jsonify({"error": "Seulement PDF, DOC, DOCX acceptés"}), 400

    os.makedirs(CV_FOLDER, exist_ok=True)
    filename = secure_filename(f"{user_id}_cv.{file.filename.rsplit('.', 1)[1].lower()}")
    file.save(os.path.join(CV_FOLDER, filename))

    Freelancer.update(user["email"], cv_filename=filename)

    return jsonify({"message": "CV uploadé", "cv_filename": filename}), 200


# ── DOWNLOAD CV ──────────────────────────────────────────────
@freelancer_profile_bp.route('/freelancer/profile/cv/download', methods=['GET'])
@jwt_required()
def download_cv():
    user_id = get_jwt_identity()
    user = Freelancer.find_by_id(user_id)

    if not user or not user.get("cv_filename"):
        return jsonify({"error": "Aucun CV trouvé"}), 404

    return send_from_directory(CV_FOLDER, user["cv_filename"])


# ── GET all approved freelancers (public) ───────────────────
@freelancer_profile_bp.route('/freelancers', methods=['GET'])
def get_all_freelancers():
    freelancers = Freelancer.find_approved()
    return jsonify(freelancers), 200