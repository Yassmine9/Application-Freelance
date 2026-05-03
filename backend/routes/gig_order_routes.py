from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.gig_order_service import place_order,accept_order,deliver_order,complete_order,request_revision,cancel_order,get_client_orders,get_freelancer_orders,get_order_by_id
from models.base_user import BaseUser

gig_order_bp = Blueprint('gig_order_bp', __name__)


# ─────────────────────────────────────────────────────────────────────
# Client order actions
# ─────────────────────────────────────────────────────────────────────

@gig_order_bp.route('/gigorders', methods=['POST'])
@jwt_required()
def create_order():
    """Place a new order on a gig."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON received"}), 400

    result, err = place_order(
        client_id=current_user_id,
        gig_id=data.get('gig_id'),
        requirements=data.get('requirements', '')
    )
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify({"message": "Order placed", "order_id": result}), 201


@gig_order_bp.route('/gigorders/<order_id>/complete', methods=['PATCH'])
@jwt_required()
def complete_order_route(order_id):
    """Client marks order as completed after accepting delivery."""
    current_user_id = get_jwt_identity()
    success, err = complete_order(order_id, current_user_id)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify({"message": "Order completed, you can now leave a review"}), 200


@gig_order_bp.route('/gigorders/<order_id>/revision', methods=['PATCH'])
@jwt_required()
def revision_request(order_id):
    """Client requests changes on a delivered order."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON received"}), 400

    success, err = request_revision(
        order_id=order_id,
        client_id=current_user_id,
        note=data.get('note', '')
    )
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify({"message": "Revision requested"}), 200


# ─────────────────────────────────────────────────────────────────────
# Freelancer order actions
# ─────────────────────────────────────────────────────────────────────

@gig_order_bp.route('/gigorders/<order_id>/accept', methods=['PATCH'])
@jwt_required()
def accept_order_route(order_id):
    """Freelancer accepts a pending order."""
    current_user_id = get_jwt_identity()
    success, err = accept_order(order_id, current_user_id)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify({"message": "Order accepted"}), 200


@gig_order_bp.route('/gigorders/<order_id>/deliver', methods=['PATCH'])
@jwt_required()
def deliver_order_route(order_id):
    """Freelancer submits completed work."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON received"}), 400

    success, err = deliver_order(
        order_id=order_id,
        freelancer_id=current_user_id,
        message=data.get('message', ''),
        file_url=data.get('file_url')
    )
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify({"message": "Work delivered"}), 200


# ─────────────────────────────────────────────────────────────────────
# Cancel order (both roles)
# ─────────────────────────────────────────────────────────────────────

@gig_order_bp.route('/gigorders/<order_id>/cancel', methods=['PATCH'])
@jwt_required()
def cancel_order_route(order_id):
    """Client or freelancer cancels the order."""
    current_user_id = get_jwt_identity()
    user = BaseUser.find_by_id(user_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON received"}), 400

    success, err = cancel_order(
        order_id=order_id,
        user_id=current_user_id,
        user_role=user['role'],
        reason=data.get('reason', '')
    )
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify({"message": "Order cancelled"}), 200


# ─────────────────────────────────────────────────────────────────────
# Get orders (client / freelancer views)
# ─────────────────────────────────────────────────────────────────────

@gig_order_bp.route('/client/gigorders', methods=['GET'])
@jwt_required()
def client_orders():
    """List all orders for the authenticated client, optionally filtered by status."""
    current_user_id = get_jwt_identity()
    status = request.args.get('status')
    orders, err = get_client_orders(current_user_id, status)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify(orders), 200


@gig_order_bp.route('/freelancer/gigorders', methods=['GET'])
@jwt_required()
def freelancer_orders():
    """List all orders for the authenticated freelancer, optionally filtered by status."""
    current_user_id = get_jwt_identity()
    status = request.args.get('status')
    orders, err = get_freelancer_orders(current_user_id, status)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify(orders), 200


@gig_order_bp.route('/gigorders/<order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Get a single order – only if user is client or freelancer."""
    current_user_id = get_jwt_identity()
    order, err = get_order_by_id(order_id, current_user_id)
    if err:
        return jsonify({"error": err[0]}), err[1]
    return jsonify(order), 200