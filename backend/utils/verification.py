from models.gig import Gig
from models.freelancer import Freelancer
from models.admin import Admin
from models.client import Client

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
def verify_client(user_id):
    client = Client.find_by_id(user_id)
    if not user:
         return None, ("Client Not Found", 404)
    return user, None
