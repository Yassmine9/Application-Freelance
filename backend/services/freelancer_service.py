from models.freelancer import Freelancer


def get_my_profile(user_id):
    """
    Owner view — the freelancer accessing his own profile.
    Returns full data including private fields.
    
    Returns: (profile_dict, error_tuple)
    """
    user = Freelancer.find_by_id(user_id)

    if not user:
        return None, ("Utilisateur introuvable", 404)
    if user.get("role") != "freelancer":
        return None, ("Accès refusé", 403)

    profile = {
        # private — only owner sees these
        "email":              user.get("email", ""),
        "phone":              user.get("phone", ""),
        "status":             user.get("status", "draft"),
        "cv_filename":        user.get("cv_filename", ""),
        # public fields
        "id":                 user["_id"],
        "name":               user.get("name", ""),
        "title":              user.get("title", ""),
        "avatar_filename":    user.get("avatar_filename", ""),
        "bio":                user.get("bio", ""),
        "skills":             user.get("skills", []),
        "hourly_rate":        user.get("hourly_rate", 0),
        "portfolio":          user.get("portfolio", []),
        "projects_completed": user.get("projects_completed", 0),
        "client_rating":      user.get("client_rating", 0.0),
        "experience_years":   user.get("experience_years", 0),
        "success_rate":       user.get("success_rate", 0),
    }

    return profile, None


def get_public_profile(freelancer_id):
    """
    Visitor view — a logged-in user visiting someone else's profile.
    Returns only public fields. CV is included since clients can see it.
    Private fields like email, phone, status are excluded.

    Returns: (profile_dict, error_tuple)
    """
    user = Freelancer.find_by_id(freelancer_id)

    if not user:
        return None, ("freelancer introuvable", 404)

    """# only approved freelancers are visible to others
    if user.get("status") != "approved":
        return None, ("Ce profil n'est pas disponible", 403)"""

    profile = {
        "id":                 user["_id"],
        "name":               user.get("name", ""),
        "title":              user.get("title", ""),
        "avatar_filename":    user.get("avatar_filename", ""),
        "bio":                user.get("bio", ""),
        "skills":             user.get("skills", []),
        "hourly_rate":        user.get("hourly_rate", 0),
        "portfolio":          user.get("portfolio", []),
        "cv_filename":        user.get("cv_filename", ""),   # ✅ client can see CV
        "projects_completed": user.get("projects_completed", 0),
        "client_rating":      user.get("client_rating", 0.0),
        "experience_years":   user.get("experience_years", 0),
        "success_rate":       user.get("success_rate", 0),
        "status":             user.get("status", "draft"),
        "gigs":               [],  # Will be populated by the route handler
        # ❌ no email, no phone
    }

    return profile, None