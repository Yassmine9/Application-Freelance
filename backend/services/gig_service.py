from models.gig import Gig
from models.freelancer import Freelancer
from models.admin import Admin

def verify_freelancer(user_id):
    user = Freelancer.find_by_id(user_id)
    if not user:
        return None, ("Freelancer Not Found", 404)
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
    user , err = verify_freelancer(user_id)
    if err:
        return None , err
    my_gigs = Gig.find_by_freelancer(user_id)
    return my_gigs , None

def create_new_gig(user_id,data):
    user , err = verify_freelancer(user_id)
    if err:
        return None,err
    required = ["title", "description", "price", "tags"]
    missing = [f for f in required if f not in data]
    if missing:
        return None, (f"Missing Fields: {missing}", 400)
    gig = Gig.create(user_id,user["name"],data["title"],data["description"],data["price"],data["tags"])
    return gig , None


def update_existing_gig(gig_id,user_id,data):
    user , err = verify_freelancer(user_id)
    if err:
        return None,err
    gig , err = verify_gig(gig_id,user_id)
    if err:
        return None,err
    updated_gig = Gig.update(gig_id,**data)
    return updated_gig,None

def delete_existing_gig(gig_id,user_id):
    user , err = verify_freelancer(user_id)
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
    user , err = verify_freelancer(user_id)
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