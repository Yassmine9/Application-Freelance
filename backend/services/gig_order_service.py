from datetime import datetime, timedelta
from bson import ObjectId
from models.gig_order import GigOrderModel
from models.gig import Gig
from models.client import Client
from models.freelancer import Freelancer


# ── Verification Helpers ──────────────────────────────────────────────

def verify_client(user_id):
    """Ensure user exists and is a client (or just exists)."""
    user = Client.find_by_id(user_id)
    if not user:
        return None, ("Client not found", 404)
    return user, None


def verify_freelancer(user_id):
    user = Freelancer.find_by_id(user_id)
    if not user:
        return None, ("Freelancer not found", 404)
    # Optionally check role: if user['role'] != 'freelancer': return None, ("Not a freelancer", 403)
    return user, None


def verify_order(order_id, user_id, required_role=None):
    """Fetch order and check if user is allowed to access it."""
    order = GigOrderModel.find_by_id(order_id)
    if not order:
        return None, ("Order not found", 404)

    is_client = str(order.get('client_id')) == user_id
    is_freelancer = str(order.get('freelancer_id')) == user_id

    if required_role == 'client' and not is_client:
        return None, ("Only the client can perform this action", 403)
    if required_role == 'freelancer' and not is_freelancer:
        return None, ("Only the freelancer can perform this action", 403)
    if not required_role and not (is_client or is_freelancer):
        return None, ("Unauthorized", 403)

    return order, None


# ── Order Actions ─────────────────────────────────────────────────────

def place_order(client_id, gig_id, requirements):
    """
    Client places an order on a gig.
    Returns (order_id, error_message)
    """
    # Verify client exists
    client, err = verify_client(client_id)
    if err:
        return None, err

    # Verify gig exists and is approved
    gig = Gig.find_by_id(gig_id)
    if not gig:
        return None, ("Gig not found", 404)
    if gig.get('status') != 'approved':
        return None, ("This gig is not available", 400)

    # Prevent ordering own gig
    if str(gig.get('freelancer_id')) == client_id:
        return None, ("You cannot order your own gig", 400)

    # Validate requirements
    requirements = (requirements or "").strip()
    if not requirements:
        return None, ("Requirements are required", 400)
    if len(requirements) < 20:
        return None, ("Requirements must be at least 20 characters", 400)
    if len(requirements) > 1000:
        return None, ("Requirements must be under 1000 characters", 400)

    # Create order (model handles generation)
    order = GigOrderModel.create_order(gig, client)
    order['requirements'] = requirements

    result = GigOrderModel.collection.insert_one(order)
    order_id = str(result.inserted_id)

    # Increment stats
    #User.increment_total_orders(client_id)        # you may need to add this helper
    Gig.increment_order_count(gig_id)

    return order_id, None


def accept_order(order_id, freelancer_id):
    """
    Freelancer accepts a pending order, sets deadline based on gig duration.
    Returns (success, error_message)
    """
    freelancer, err = verify_freelancer(freelancer_id)
    if err:
        return False, err

    order, err = verify_order(order_id, freelancer_id, required_role='freelancer')
    if err:
        return False, err

    if order['status'] != 'pending':
        return False, ("Order is not pending", 400)

    # Get delivery days from gig
    gig = Gig.find_by_id(order['gig_id'])
    delivery_days = int(gig.get('duration', 7).split()[0]) if gig and gig.get('duration') else 7
    deadline = datetime.utcnow() + timedelta(days=delivery_days)

    GigOrderModel.update_status(
        order_id,
        "in_progress",
        extra_fields={"deadline": deadline},
        history_entry={"status": "in_progress"}
    )
    return True, None


def deliver_order(order_id, freelancer_id, message, file_url=None):
    """
    Freelancer submits the completed work.
    Returns (success, error_message)
    """
    freelancer, err = verify_freelancer(freelancer_id)
    if err:
        return False, err

    order, err = verify_order(order_id, freelancer_id, required_role='freelancer')
    if err:
        return False, err

    if order['status'] != 'in_progress':
        return False, ("Order must be in progress to deliver", 400)

    message = (message or "").strip()
    if not message:
        return False, ("Delivery message is required", 400)
    if len(message) < 10:
        return False, ("Message must be at least 10 characters", 400)

    now = datetime.utcnow()
    extra = {
        "delivered_at": now,
        "delivery": {
            "message": message,
            "file_url": file_url,
            "delivered_at": now
        }
    }
    GigOrderModel.update_status(
        order_id,
        "delivered",
        extra_fields=extra,
        history_entry={"status": "delivered", "note": message}
    )
    return True, None


def complete_order(order_id, client_id):
    """
    Client marks the order as completed after accepting delivery.
    Returns (success, error_message)
    """
    client, err = verify_client(client_id)
    if err:
        return False, err

    order, err = verify_order(order_id, client_id, required_role='client')
    if err:
        return False, err

    if order['status'] != 'delivered':
        return False, ("Order must be delivered before completing", 400)

    now = datetime.utcnow()
    GigOrderModel.update_status(
        order_id,
        "completed",
        extra_fields={"completed_at": now},
        history_entry={"status": "completed"}
    )

    # Update freelancer stats and success rate
    User.increment_completed_projects(order['freelancer_id'])
    _update_success_rate(order['freelancer_id'])

    return True, None


def request_revision(order_id, client_id, note):
    """
    Client asks for changes on a delivered order.
    Returns (success, error_message)
    """
    client, err = verify_client(client_id)
    if err:
        return False, err

    order, err = verify_order(order_id, client_id, required_role='client')
    if err:
        return False, err

    if order['status'] != 'delivered':
        return False, ("Can only request revision on delivered orders", 400)

    note = (note or "").strip()
    if not note:
        return False, ("Please explain what needs to be revised", 400)
    if len(note) < 10:
        return False, ("Revision note must be at least 10 characters", 400)

    GigOrderModel.update_status(
        order_id,
        "in_progress",
        extra_fields={"revision_count": order.get('revision_count', 0) + 1},
        history_entry={"status": "revision_requested", "note": note}
    )
    return True, None


def cancel_order(order_id, user_id, user_role, reason):
    """
    Either client or freelancer cancels the order.
    Returns (success, error_message)
    """
    # Verify the user exists (role not strictly enforced for cancel)
    user = User.find_by_id(user_id)
    if not user:
        return False, ("User not found", 404)

    order, err = verify_order(order_id, user_id)  # no role restriction yet
    if err:
        return False, err

    # Check if cancellation is allowed (status and who can cancel)
    allowed, error = GigOrderModel.can_cancel(order, user_id, user_role)
    if not allowed:
        return False, (error, 400)

    reason = (reason or "").strip()
    if not reason:
        return False, ("Cancellation reason is required", 400)

    GigOrderModel.cancel_order(order_id, user_role, reason)

    # Update success rate if order was in progress
    if order['status'] == 'in_progress':
        _update_success_rate(order['freelancer_id'])

    return True, None


# ── Query Helpers ─────────────────────────────────────────────────────

def get_client_orders(client_id, status=None):
    """Get orders for a client, optionally filtered by status."""
    client, err = verify_client(client_id)
    if err:
        return None, err
    query = {"client_id": client_id}
    if status:
        query["status"] = status
    orders = list(GigOrderModel.collection.find(query).sort("created_at", -1))
    return [GigOrderModel.format_order(o) for o in orders], None


def get_freelancer_orders(freelancer_id, status=None):
    """Get orders for a freelancer, optionally filtered by status."""
    freelancer, err = verify_freelancer(freelancer_id)
    if err:
        return None, err
    query = {"freelancer_id": freelancer_id}
    if status:
        query["status"] = status
    orders = list(GigOrderModel.collection.find(query).sort("created_at", -1))
    return [GigOrderModel.format_order(o) for o in orders], None


def get_order_by_id(order_id, user_id):
    """
    Fetch a single order – only if user is client or freelancer.
    Returns (order_dict, error_message)
    """
    order, err = verify_order(order_id, user_id)
    if err:
        return None, err
    return GigOrderModel.format_order(order), None


# ── Private Helpers ──────────────────────────────────────────────────

def _update_success_rate(freelancer_id):
    """
    success_rate = completed / (completed + cancelled) * 100
    Only counts orders that reached 'in_progress' or beyond.
    """
    total = GigOrderModel.collection.count_documents({
        "freelancer_id": freelancer_id,
        "status": {"$in": ["completed", "cancelled"]}
    })
    completed = GigOrderModel.collection.count_documents({
        "freelancer_id": freelancer_id,
        "status": "completed"
    })
    rate = round((completed / total) * 100, 1) if total > 0 else 0
    User.update_stats(freelancer_id, {"success_rate": rate})