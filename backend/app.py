from flask import Flask, jsonify, send_from_directory
import os
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from config import Config
from db.mongo import db

from routes.auth import auth_bp
from routes.offers import offers_bp
from routes.proposals import proposals_bp
from routes.messages import messages_bp
from routes.admin_routes import admin_bp
from routes.category_routes import category_bp
from routes.freelancer_routes import freelancer_routes
from routes.gig_routes import gig_routes
from routes.product_routes import product_bp
from socketio_events import init_socketio

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False

jwt = JWTManager(app)

socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")
init_socketio(socketio)


@jwt.unauthorized_loader
def unauthorized_callback(error):
    return jsonify({"error": "Missing or invalid token"}), 401


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_data):
    return jsonify({"error": "Token expired"}), 401


@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"error": "Invalid token"}), 401


app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(offers_bp, url_prefix="/api/offers")
app.register_blueprint(proposals_bp, url_prefix="/api/proposals")
app.register_blueprint(messages_bp, url_prefix="/api/messages")

# Additional modules
app.register_blueprint(admin_bp, url_prefix="/admin")
app.register_blueprint(category_bp, url_prefix="/categories")
app.register_blueprint(product_bp, url_prefix="/products")
app.register_blueprint(freelancer_routes, url_prefix="/api")
app.register_blueprint(gig_routes, url_prefix="/api")

UPLOAD_ROOT = os.path.join(os.path.abspath(os.path.dirname(__file__)), "uploads")


@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_ROOT, filename)


@app.route("/health")
def health():
    return jsonify({"status": "ok"}), 200


def init_indexes():
    if db is None:
        return

    db.offers.create_index("clientId")
    db.offers.create_index("status")
    db.offers.create_index("category")
    db.proposals.create_index("offerId")
    db.proposals.create_index("freelancerId")
    db.messages.create_index([("offerId", 1), ("createdAt", 1)])
    db.messages.create_index("offerIdStr")


with app.app_context():
    init_indexes()


if __name__ == "__main__":
    socketio.run(app, debug=Config.DEBUG, allow_unsafe_werkzeug=True)
