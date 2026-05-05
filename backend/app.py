from flask import Flask, jsonify, send_from_directory, request
import os
import logging
import sys
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO

from config import Config
from db.mongo import db
from routes.admin_routes import admin_bp
from routes.auth import auth_bp
from routes.category_routes import category_bp
from routes.freelancer_routes import freelancer_routes
from routes.gig_routes import gig_routes
from routes.messages import messages_bp
from routes.offers import offers_bp
from routes.product_routes import product_bp
from routes.proposals import proposals_bp
from routes.client_routes import client_routes
from socketio_events import init_socketio

# Force log to file so we capture everything even if terminal is silent
logging.basicConfig(
    filename='backend_debug.log',
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(message)s',
    force=True
)
logger = logging.getLogger(__name__)
app.register_blueprint(client_routes, url_prefix="/api")

# Also log to console
console = logging.StreamHandler(sys.stdout)
console.setLevel(logging.DEBUG)
logger.addHandler(console)

UPLOAD_ROOT = os.path.join(os.path.abspath(os.path.dirname(__file__)), "uploads")


def init_indexes():
    if db is None:
        return
    db.offers.create_index("clientId")
    db.offers.create_index("status")
    db.offers.create_index("category")
    db.proposals.create_index("offerId")
    db.proposals.create_index("freelancersId")
    db.messages.create_index([("offerId", 1), ("createdAt", 1)])
    db.messages.create_index("offerIdStr")


def create_app() -> Flask:
    app = Flask(__name__)
    app.url_map.strict_slashes = False   
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:4200", "http://127.0.0.1:4200"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
            "supports_credentials": True
        }
    })

    app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False

    jwt = JWTManager(app)

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return jsonify({"error": "Missing or invalid token"}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({"error": "Token expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Invalid token"}), 401

    # TEST ROUTE: visit this in browser to prove you're hitting the right server
    @app.route("/api/test", methods=["GET"])
    def test_route():
        logger.info("TEST ROUTE WAS HIT")
        return jsonify({"msg": "You are hitting the correct Flask server", "timestamp": str(__import__('datetime').datetime.now())})

    # TEMPORARY: direct register route that logs to file
    @app.route("/api/auth/register", methods=["POST"])
    def direct_register():
        logger.info("=" * 50)
        logger.info("DIRECT_REGISTER ENDPOINT HIT")
        try:
            data = request.get_json(force=True)
            logger.info(f"REQUEST DATA: {data}")

            from models.freelancer import Freelancer
            from models.client import Client
            from models import find_user_by_email

            email = data.get("email")
            password = data.get("password")
            name = data.get("name")
            role = data.get("role", "client")

            if not email or not password or not name:
                return jsonify({"error": "Missing fields"}), 400

            if find_user_by_email(email):
                return jsonify({"error": "Email exists"}), 400

            if role == "freelancer":
                logger.info("About to call Freelancer.create")
                new_user = Freelancer.create(
                    email=email, password=password, name=name,
                    skills=data.get("skills", []),
                    hourly_rate=data.get("hourly_rate", 0),
                    bio=data.get("bio", ""),
                    phone=data.get("phone", "")
                )
                logger.info(f"Freelancer.create returned: {new_user}")
            elif role == "client":
                new_user = Client.create(
                    email=email, password=password, name=name,
                    company_name=data.get("company_name", ""),
                    phone=data.get("phone", "")
                )
            else:
                return jsonify({"error": f"Bad role: {role}"}), 400

            if new_user and "error" not in new_user:
                return jsonify({"message": "OK", "user": new_user}), 201
            elif new_user and "error" in new_user:
                return jsonify(new_user), 400
            else:
                logger.error("new_user is None!")
                return jsonify({"error": "DB error"}), 500

        except Exception as e:
            logger.exception("EXCEPTION IN DIRECT_REGISTER")
            return jsonify({"error": "Server crash: " + str(e)}), 500

    # Keep blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(offers_bp, url_prefix="/api/offers")
    app.register_blueprint(proposals_bp, url_prefix="/api/proposals")
    app.register_blueprint(messages_bp, url_prefix="/api/messages")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(category_bp, url_prefix="/categories", strict_slashes=False)
    app.register_blueprint(product_bp, url_prefix="/products", strict_slashes=False)
    app.register_blueprint(freelancer_routes, url_prefix="/api")
    app.register_blueprint(gig_routes, url_prefix="/api")

    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(UPLOAD_ROOT, filename)

    @app.route("/health")
    def health():
        return jsonify({"status": "ok"}), 200

    with app.app_context():
        init_indexes()

    return app


app = create_app()
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")
init_socketio(socketio)


if __name__ == "__main__":
    socketio.run(app, debug=Config.DEBUG, allow_unsafe_werkzeug=True)