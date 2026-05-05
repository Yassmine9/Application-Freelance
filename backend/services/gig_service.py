from models.gig import Gig
from models.freelancer import Freelancer
from models.admin import Admin
from datetime import datetime

def verify_freelancers(user_id):
    user = Freelancer.find_by_id(user_id)
    if not user:
        return None, ("freelancer Not Found", 404)
    return user, None

def verify_admin(user_id):
    user = Admin.find_by_id(user_id)
    if not user:
        return None, ("Admin Not Found", 404)
    return user, None

def verify_gig(gig_id,user_id):
    gig = Gig.find_by_id(gig_id)
    if not gig:
        return None, ("Gig Not Found" , 404)
    if gig["freelancer_id"] != user_id:       
        return None, ("Acces Denied", 403)
    return gig , None

"""def gig_approved(gig_id):
    gig = Gig.find_by_id(gig_id)
    if gig in Gig.find_approved():
        return True
    else:
        return False"""

def fetch_gigs():
    return Gig.find_approved()

def fetch_my_gigs(user_id):
    user , err = verify_freelancers(user_id)
    if err:
        return None , err
    my_gigs = Gig.find_by_freelancer(user_id)
    return my_gigs , None

def create_new_gig(user_id,data):
    user , err = verify_freelancers(user_id)
    if err:
        return None,err
    required = ["title", "description", "price", "tags"]
    missing = [f for f in required if f not in data]
    if missing:
        return None, (f"Missing Fields: {missing}", 400)
    gig = Gig.create(user_id,user["name"],data["title"],data["description"],data["price"],data["tags"],data["duration"])
    return gig , None


def update_existing_gig(gig_id,user_id,data):
    print("DATA RECEIVED:", data)
    print("TAGS TYPE:", type(data.get("tags")))
    print("Updating Gig:", gig_id, "with data:", data)
    user , err = verify_freelancer(user_id)
    if err:
        return None,err
    gig , err = verify_gig(gig_id,user_id)
    if err:
        return None,err
    updated_gig = Gig.update(gig_id,**data)
    return updated_gig,None

def delete_existing_gig(gig_id,user_id):
    user , err = verify_freelancers(user_id)
    if err:
        return None,err
    gig , err = verify_gig(gig_id,user_id)
    if err:
        return None,err
    Gig.delete(gig_id)
    return {"message": "Gig Deleted Successfully"}, None

def get_gig_details(gig_id):
    gig = Gig.find_by_id(gig_id)
    if gig:
        return gig,None
    return None, ("Gig Not Found" , 404)

def get_my_gig_details(gig_id,user_id):
    user , err = verify_freelancers(user_id)
    if err:
        return None,err
    gig , err = verify_gig(gig_id,user_id)
    if err:
        return None,err
    return gig , None


# Admin Actions

def fetch_pending_gigs(user_id):
    user , err = verify_admin(user_id)
    if err:
        return None,err
    pending_gigs = Gig.find_pending()
    return pending_gigs,None

def approve_existing_gig(gig_id,user_id):
    user , err = verify_admin(user_id)
    if err:
        return None,err
    gig = Gig.find_by_id(gig_id)
    if not gig:
        return None, ("Gig Not Found" , 404)
    Gig.approve(gig_id)
    return Gig.find_by_id(gig_id), None

def reject_existing_gig(gig_id,user_id):
    user , err = verify_admin(user_id)
    if err:
        return None,err
    gig = Gig.find_by_id(gig_id)
    if not gig:
        return None, ("Gig Not Found" , 404)
    Gig.reject(gig_id)
    return Gig.find_by_id(gig_id), None

def fetch_gigs_query(query):
    gigs = Gig.search(query)
    if not gigs:
        return None, ("No match found", 404)
    return gigs , None

# ── Promotion plans ───────────────────────────────────────

PROMOTION_PLANS = {
    "basic":    {"price": 5,  "duration_days": 7,  "label": "Basic Boost"},
    "featured": {"price": 10, "duration_days": 7,  "label": "Featured"},
    "premium":  {"price": 20, "duration_days": 7,  "label": "Premium Spot"}
}

# ── Promote a gig (Freelancer) ────────────────────────────

def promote_gig(gig_id, user_id, data):
    user, err = verify_freelancer(user_id)
    if err:
        return None, err

    gig, err = verify_gig(gig_id, user_id)
    if err:
        return None, err

    # Gig must be approved to be promoted
    if gig["status"] != "approved":
        return None, ("Only approved gigs can be promoted", 400)

    # Already active promotion
    if gig.get("promotion", {}).get("status") == "active":
        return None, ("This gig already has an active promotion", 409)

    # Validate plan
    plan = data.get("plan")
    if not plan or plan not in PROMOTION_PLANS:
        return None, (f"Invalid plan. Choose from: {list(PROMOTION_PLANS.keys())}", 400)

    plan_details   = PROMOTION_PLANS[plan]
    amount_paid    = plan_details["price"]
    duration_days  = plan_details["duration_days"]

    # Simulated payment — just save it
    # Replace this with Stripe/Flouci later
    updated_gig = Gig.set_promotion(
        gig_id       = gig_id,
        plan         = plan,
        amount_paid  = amount_paid,
        duration_days= duration_days
    )

    return {
        "message":    f"Gig promoted successfully with '{plan}' plan",
        "gig":        updated_gig,
        "plan":       plan_details["label"],
        "amount_paid": amount_paid,
        "expires_in": f"{duration_days} days"
    }, None


# ── Cancel promotion (Freelancer) ─────────────────────────

def cancel_gig_promotion(gig_id, user_id):
    user, err = verify_freelancer(user_id)
    if err:
        return None, err

    gig, err = verify_gig(gig_id, user_id)
    if err:
        return None, err

    if gig.get("promotion", {}).get("status") != "active":
        return None, ("No active promotion found for this gig", 400)

    Gig.disable_promotion(gig_id)
    return {"message": "Promotion cancelled successfully"}, None


# ── Expire promotions (called by scheduler) ───────────────

def expire_old_promotions():
    """
    Check all gigs with active promotions.
    Expire ones that have passed their end_date.
    """
    expirable = Gig.find_expirable_promotions()
    count     = 0

    for gig in expirable:
        Gig.expire_promotion(gig["_id"])
        count += 1

    return {"message": f"{count} promotion(s) expired"}


# ── Get gigs with promoted first ─────────────────────────

def fetch_gigs_promoted():
    """Returns approved gigs — promoted ones at the top."""
    return Gig.find_approved_with_promotion()


# ── Admin disables promotion ──────────────────────────────

def admin_disable_promotion(gig_id, user_id):
    user, err = verify_admin(user_id)
    if err:
        return None, err

    gig = Gig.find_by_id(gig_id)
    if not gig:
        return None, ("Gig Not Found", 404)

    Gig.disable_promotion(gig_id)
    return {"message": "Promotion disabled by admin"}, None