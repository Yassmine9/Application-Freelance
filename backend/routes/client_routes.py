from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.client import Client
from models.gig import Gig
from models.purchase import Purchase
from models.proposal import Proposal
from bson import ObjectId
from datetime import datetime
from werkzeug.utils import secure_filename
import os

client_routes = Blueprint('client_routes', __name__)

AVATAR_FOLDER = os.path.join(os.getcwd(), 'uploads', 'avatars')
ALLOWED_IMG = {'jpg', 'jpeg', 'png'}

def allowed_file(filename, allowed):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


# ── GET Client Profile ──────────────────────────────────────────
@client_routes.route('/client/profile', methods=['GET'])
@jwt_required()
def get_client_profile():
    """Get the current client's profile with stats"""
    user_id = get_jwt_identity()
    user = Client.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "Client not found"}), 404
    if user.get("role") != "client":
        return jsonify({"error": "Access denied"}), 403
    
    # Calculate stats
    total_projects = len(user.get("projects_posted", []))
    
    # Get purchase history for total spent
    purchases = []
    if Purchase.collection:
        purchases_data = list(Purchase.collection.find({"buyerId": ObjectId(user_id)}))
        purchases = purchases_data
    
    # Calculate total spent by getting gig prices for purchased items
    total_spent = 0
    for purchase in purchases:
        if purchase.get("productId"):
            # Try to find the gig/product price
            if Gig.collection:
                gig = Gig.collection.find_one({"_id": purchase["productId"]})
                if gig:
                    total_spent += gig.get("price", 0)
    
    # Count active vs completed
    active_count = sum(1 for p in user.get("projects_posted", []) if p.get("status") == "open")
    completed_count = sum(1 for p in user.get("projects_posted", []) if p.get("status") == "completed")
    
    return jsonify({
        "user": {
            "id": user["_id"],
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "phone": user.get("phone", ""),
            "company": user.get("company_name", ""),
            "website": user.get("website", ""),
            "bio": user.get("bio", ""),
            "avatar": user.get("avatar_filename", "default-avatar.png"),
            "status": user.get("status", "pending"),
            "stats": {
                "totalSpent": total_spent,
                "activeProjects": active_count,
                "completedProjects": completed_count,
                "freelancersRating": user.get("rating", 0.0)
            }
        }
    }), 200


# ── UPDATE Client Profile ────────────────────────────────────────
@client_routes.route('/client/profile', methods=['PUT'])
@jwt_required()
def update_client_profile():
    """Update the current client's profile"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    user = Client.find_by_id(user_id)
    if not user:
        return jsonify({"error": "Client not found"}), 404
    if user.get("role") != "client":
        return jsonify({"error": "Access denied"}), 403
    
    # Allowed fields to update
    allowed_fields = ["name", "phone", "company_name", "website", "bio"]
    
    update_data = {}
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]
    
    update_data["updated_at"] = datetime.now()
    
    if Client.collection:
        Client.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
    
    return jsonify({"message": "Profile updated", "updated_fields": update_data}), 200


# ── GET Client Project Offers ────────────────────────────────────────
@client_routes.route('/client/projects', methods=['GET'])
@jwt_required()
def get_client_projects():
    """Get all projects posted by the client"""
    user_id = get_jwt_identity()
    user = Client.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "Client not found"}), 404
    if user.get("role") != "client":
        return jsonify({"error": "Access denied"}), 403
    
    projects = user.get("projects_posted", [])
    
    return jsonify({
        "projects": projects,
        "count": len(projects)
    }), 200


# ── CREATE Project Offer ────────────────────────────────────────
@client_routes.route('/client/projects', methods=['POST'])
@jwt_required()
def create_project():
    """Create a new project offer"""
    user_id = get_jwt_identity()
    user = Client.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "Client not found"}), 404
    if user.get("role") != "client":
        return jsonify({"error": "Access denied"}), 403
    
    data = request.get_json()
    
    new_project = {
        "id": str(ObjectId()),
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "budget": data.get("budget", 0),
        "deadline": data.get("deadline", ""),
        "skills": data.get("skills", []),
        "status": "open",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    if Client.collection:
        Client.collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$push": {"projects_posted": new_project},
                "$set": {"updated_at": datetime.now()}
            }
        )
    
    return jsonify({
        "message": "Project created successfully",
        "project": new_project
    }), 201


# ── UPDATE Project Offer ────────────────────────────────────────
@client_routes.route('/client/projects/<project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    """Update an existing project offer"""
    user_id = get_jwt_identity()
    user = Client.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "Client not found"}), 404
    if user.get("role") != "client":
        return jsonify({"error": "Access denied"}), 403
    
    data = request.get_json()
    
    # Find and update the project
    projects = user.get("projects_posted", [])
    for project in projects:
        if project.get("id") == project_id:
            if project.get("status") != "open":
                return jsonify({"error": "Can only edit open projects"}), 403
            
            project["title"] = data.get("title", project.get("title"))
            project["description"] = data.get("description", project.get("description"))
            project["budget"] = data.get("budget", project.get("budget"))
            project["deadline"] = data.get("deadline", project.get("deadline"))
            project["skills"] = data.get("skills", project.get("skills"))
            project["updated_at"] = datetime.now().isoformat()
            
            if Client.collection:
                Client.collection.update_one(
                    {"_id": ObjectId(user_id)},
                    {
                        "$set": {
                            "projects_posted": projects,
                            "updated_at": datetime.now()
                        }
                    }
                )
            
            return jsonify({
                "message": "Project updated successfully",
                "project": project
            }), 200
    
    return jsonify({"error": "Project not found"}), 404


# ── CLOSE Project Offer ────────────────────────────────────────
@client_routes.route('/client/projects/<project_id>/close', methods=['PATCH'])
@jwt_required()
def close_project(project_id):
    """Close a project offer"""
    user_id = get_jwt_identity()
    user = Client.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "Client not found"}), 404
    if user.get("role") != "client":
        return jsonify({"error": "Access denied"}), 403
    
    projects = user.get("projects_posted", [])
    for project in projects:
        if project.get("id") == project_id:
            project["status"] = "closed"
            project["updated_at"] = datetime.now().isoformat()
            
            if Client.collection:
                Client.collection.update_one(
                    {"_id": ObjectId(user_id)},
                    {
                        "$set": {
                            "projects_posted": projects,
                            "updated_at": datetime.now()
                        }
                    }
                )
            
            return jsonify({
                "message": "Project closed successfully",
                "project": project
            }), 200
    
    return jsonify({"error": "Project not found"}), 404


# ── GET freelancers Requests (Proposals) ────────────────────────────────────────
@client_routes.route('/client/requests', methods=['GET'])
@jwt_required()
def get_freelancers_requests():
    """Get all freelancers requests/proposals for the client's projects"""
    user_id = get_jwt_identity()
    user = Client.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "Client not found"}), 404
    if user.get("role") != "client":
        return jsonify({"error": "Access denied"}), 403
    
    # Get proposals from database
    proposals = []
    
    if Proposal.collection:
        # Find proposals for projects owned by this client
        project_ids = [p.get("id") for p in user.get("projects_posted", [])]
        proposals_data = list(Proposal.collection.find({"project_id": {"$in": project_ids}}))
        
        for proposal in proposals_data:
            proposals.append({
                "id": str(proposal.get("_id", "")),
                "projectId": proposal.get("project_id", ""),
                "projectTitle": proposal.get("project_title", ""),
                "freelancersId": str(proposal.get("freelancers_id", "")),
                "freelancersName": proposal.get("freelancers_name", ""),
                "freelancersAvatar": proposal.get("freelancers_avatar", ""),
                "proposalText": proposal.get("proposal_text", ""),
                "proposalBudget": proposal.get("budget", 0),
                "status": proposal.get("status", "pending"),
                "createdAt": proposal.get("created_at", "").isoformat() if hasattr(proposal.get("created_at"), "isoformat") else str(proposal.get("created_at", ""))
            })
    
    return jsonify(proposals), 200


# ── ACCEPT freelancers Request ────────────────────────────────────────
@client_routes.route('/client/requests/<request_id>/accept', methods=['PATCH'])
@jwt_required()
def accept_request(request_id):
    """Accept a freelancers's proposal"""
    user_id = get_jwt_identity()
    user = Client.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "Client not found"}), 404
    if user.get("role") != "client":
        return jsonify({"error": "Access denied"}), 403
    
    from models.proposal import Proposal
    
    if Proposal.collection:
        proposal = Proposal.collection.find_one({"_id": ObjectId(request_id)})
        
        if not proposal:
            return jsonify({"error": "Proposal not found"}), 404
        
        Proposal.collection.update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"status": "accepted", "updated_at": datetime.now()}}
        )
        
        return jsonify({
            "message": "Proposal accepted successfully",
            "requestId": request_id,
            "status": "accepted"
        }), 200
    
    return jsonify({"error": "Cannot accept proposal"}), 500


# ── REJECT freelancers Request ────────────────────────────────────────
@client_routes.route('/client/requests/<request_id>/reject', methods=['PATCH'])
@jwt_required()
def reject_request(request_id):
    """Reject a freelancers's proposal"""
    user_id = get_jwt_identity()
    user = Client.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "Client not found"}), 404
    if user.get("role") != "client":
        return jsonify({"error": "Access denied"}), 403
    
    from models.proposal import Proposal
    
    if Proposal.collection:
        proposal = Proposal.collection.find_one({"_id": ObjectId(request_id)})
        
        if not proposal:
            return jsonify({"error": "Proposal not found"}), 404
        
        Proposal.collection.update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"status": "rejected", "updated_at": datetime.now()}}
        )
        
        return jsonify({
            "message": "Proposal rejected successfully",
            "requestId": request_id,
            "status": "rejected"
        }), 200
    
    return jsonify({"error": "Cannot reject proposal"}), 500


# ── GET Unread Messages Count ────────────────────────────────────────
@client_routes.route('/client/messages/unread-count', methods=['GET'])
@jwt_required()
def get_unread_messages():
    """Get count of unread messages"""
    user_id = get_jwt_identity()
    user = Client.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "Client not found"}), 404
    if user.get("role") != "client":
        return jsonify({"error": "Access denied"}), 403
    
    # Count unread messages from database
    count = 0
    from db.mongo import db
    if db:
        messages_collection = db["messages"]
        count = messages_collection.count_documents({
            "receiverId": user_id,
            "is_read": False
        })
    
    return jsonify({
        "count": count
    }), 200


# ── UPLOAD Avatar ────────────────────────────────────────────────────────────────
@client_routes.route('/client/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    """Upload client avatar"""
    user_id = get_jwt_identity()
    user = Client.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "Client not found"}), 404
    if user.get("role") != "client":
        return jsonify({"error": "Access denied"}), 403
    
    if 'avatar' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['avatar']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not allowed_file(file.filename, ALLOWED_IMG):
        return jsonify({"error": "Invalid file type. Allowed: jpg, jpeg, png"}), 400
    
    # Create filename
    filename = secure_filename(f"client_{user_id}_{file.filename}")
    
    # Create directory if not exists
    os.makedirs(AVATAR_FOLDER, exist_ok=True)
    
    # Save file
    filepath = os.path.join(AVATAR_FOLDER, filename)
    file.save(filepath)
    
    # Update user
    if Client.collection:
        Client.collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "avatar_filename": filename,
                    "updated_at": datetime.now()
                }
            }
        )
    
    return jsonify({
        "avatar": f"/uploads/avatars/{filename}"
    }), 200


# ── GET Avatar ────────────────────────────────────────────────────────────────
@client_routes.route('/avatars/<filename>', methods=['GET'])
def get_avatar(filename):
    """Serve uploaded avatar"""
    try:
        return send_from_directory(AVATAR_FOLDER, filename)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
