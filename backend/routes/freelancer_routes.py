from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.freelancer import Freelancer
from services.freelancer_service import get_public_profile
from services.gig_service import fetch_my_gigs
import os
from werkzeug.utils import secure_filename

freelancer_routes = Blueprint('freelancer_routes', __name__)

CV_FOLDER     = os.path.join(os.getcwd(), 'uploads', 'cv')
AVATAR_FOLDER = os.path.join(os.getcwd(), 'uploads', 'avatars')

ALLOWED_CV     = {'pdf', 'doc', 'docx'}
ALLOWED_IMG    = {'jpg', 'jpeg', 'png'}

def allowed_file(filename, allowed):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


# ── GET my profile ──────────────────────────────────────────
@freelancer_routes.route('/freelancer/myprofile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = Freelancer.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    if user.get("role") != "freelancer":
        return jsonify({"error": "Accès refusé"}), 403
    gigs = fetch_my_gigs(user_id)
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
        "gigs": gigs,
    }}), 200

# ── GET public profile ──────────────────────────────────────────
@freelancer_routes.route('/freelancer/<freelancer_id>', methods=['GET'])
def get_public_profile_route(freelancer_id):

    """
    Anyone viewing another freelancer's profile.
    Returns only public fields.
    """
    profile, err = get_public_profile(freelancer_id)
    if err:
        return jsonify({"error": err[0]}), err[1]
    
    # Add gigs to the profile
    gigs = fetch_my_gigs(freelancer_id)
    profile["gigs"] = gigs
    
    return jsonify({"user": profile}), 200







# ── UPDATE my profile ────────────────────────────────────────
@freelancer_routes.route('/freelancer/profile', methods=['PUT'])
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


    Freelancer.update(user["email"], **updates)

    return jsonify({
        "message": "Profil mis à jour avec succès",
    }), 200


# ── UPLOAD AVATAR ────────────────────────────────────────────
@freelancer_routes.route('/freelancer/profile/avatar', methods=['POST'])
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
@freelancer_routes.route('/freelancer/profile/cv', methods=['POST'])
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
@freelancer_routes.route('/freelancer/profile/cv/download', methods=['GET'])
@jwt_required()
def download_cv():
    user_id = get_jwt_identity()
    user = Freelancer.find_by_id(user_id)
    if not user or not user.get("cv_filename"):
        return jsonify({"error": "No CV available"}), 404
    cv_filename = user.get("cv_filename")
    print(f"[DEBUG] CV filename: {cv_filename}")  # check if None or empty

    if not cv_filename:
        return jsonify({"error": "No CV filename in user profile"}), 404

    # Print the full expected path
    full_path = os.path.join(CV_FOLDER, cv_filename)
    print(f"[DEBUG] Looking for file at: {full_path}")
    print(f"[DEBUG] Does file exist? {os.path.exists(full_path)}")

    try:
        return send_from_directory(CV_FOLDER, cv_filename, as_attachment=True)
    except Exception as e:
        print(f"[ERROR] send_from_directory failed: {e}")
        return jsonify({"error": str(e)}), 500

# ── GET all approved freelancers (public) ───────────────────
@freelancer_routes.route('/freelancers', methods=['GET'])
def get_all_freelancers():
    freelancers = Freelancer.find_approved()
    return jsonify(freelancers), 200
    
    
@freelancer_routes.route('/uploads/avatars/<filename>', methods=['GET'])
def serve_avatar(filename):
    try:
        print(filename)
        return send_from_directory(AVATAR_FOLDER, filename)
    except FileNotFoundError:
        return jsonify({"error": "Image introuvable"}), 404