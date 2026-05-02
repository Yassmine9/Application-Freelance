from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.gig_service import fetch_gigs , fetch_my_gigs , create_new_gig , update_existing_gig , delete_existing_gig , get_gig_details , get_my_gig_details, fetch_pending_gigs,approve_existing_gig,reject_existing_gig, fetch_gigs_query
from services.freelancer_service import get_my_profile
gig_routes = Blueprint('gig_routes',__name__)



# get All gigs

@gig_routes.route("/gigs", methods=['GET'])
#@jwt_required()
def get_gigs():
    return fetch_gigs()

# get a gig's details :
@gig_routes.route("/gigs/<gig_id>", methods=['GET'])
#@jwt_required()
def get_gig(gig_id):
    result , err =  get_gig_details(gig_id)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify(result) , 200

@gig_routes.route("/gigs/search", methods=['GET'])
#@jwt_required()
def search_gig():
    query = request.args.get("query", "").strip() 
    if not query:
        return jsonify({"error": "No JSON received"}), 400
    result , err =  fetch_gigs_query(query)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify(result) , 200
# ---- gigs endpoints related to freelancers (get,create,put,delete) ----

# Get all gigs related to a freelancers by id 
@gig_routes.route("/freelancers/gigs" , methods=['GET'])
@jwt_required()
def get_my_gigs():
    user_id = get_jwt_identity()
    result,err =  fetch_my_gigs(user_id)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify(result),200
# get my gig's details 
@gig_routes.route("/freelancers/gigs/<gig_id>" , methods=['GET'])
@jwt_required()
def get_my_gig(gig_id):
    user_id = get_jwt_identity()
    result , err = get_my_gig_details(gig_id, user_id)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify(result), 200

# Create A gig
@gig_routes.route("/freelancers/gigs" , methods=['POST'])
@jwt_required()
def create_gig():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON received"}), 400
    result , err = create_new_gig(user_id,data)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify(result), 201


# Update a gig
@gig_routes.route("/freelancers/gigs/<gig_id>" , methods=['PUT'])
@jwt_required()
def update_gig(gig_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON received"}), 400
    result , err = update_existing_gig(gig_id, user_id, data)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify(result), 200

# delete a gig
@gig_routes.route("/freelancers/gigs/<gig_id>" , methods=['DELETE'])
@jwt_required()
def delete_gig(gig_id):
    user_id = get_jwt_identity()
    result = delete_existing_gig(gig_id, user_id)
    return jsonify(result), 200


# ---- gigs endpoints related to Admin actions (get,create,put,delete) ---
"""def get_pending_gigs():   # GET    /admin/gigs/pending
def approve_gig():        # PUT    /admin/gigs/<id>/approve
def reject_gig():         # PUT    /admin/gigs/<id>/reject"""

@gig_routes.route("/admin/gigs/pending" , methods=['GET'])
@jwt_required()
def get_pending_gigs():
    user_id = get_jwt_identity()
    result = fetch_pending_gigs(user_id)
    return jsonify(result), 200

@gig_routes.route("/admin/gigs/<gig_id>/approve" , methods=['PUT'])
@jwt_required()
def approve_gig(gig_id):
    user_id = get_jwt_identity()
    result = approve_existing_gig(gig_id, user_id)
    return jsonify(result), 200

@gig_routes.route("/admin/gigs/<gig_id>/reject" , methods=['PUT'])
@jwt_required()
def reject_gig(gig_id):
    user_id = get_jwt_identity()
    result = reject_existing_gig(gig_id, user_id)
    return jsonify(result), 200

"""
@gig_routes.route("/client/gigs/<gig_id>/order" , methods=['PUT'])
@jwt_required()
def order_gig(gig_id):
    user_id = get_jwt_identity()
    result = order_existing_gig(gig_id, user_id)
    return jsonify(result), 200"""