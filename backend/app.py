from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from db.mongo import db
from routes.auth import auth_bp
from routes.offers import offers_bp
from routes.proposals import proposals_bp
from routes.messages import messages_bp

app = Flask(__name__)
CORS(app)

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

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(offers_bp, url_prefix="/api/offers")
app.register_blueprint(proposals_bp, url_prefix="/api/proposals")
app.register_blueprint(messages_bp, url_prefix="/api/messages")

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


with app.app_context():
    init_indexes()

if __name__ == "__main__":
    app.run(debug=Config.DEBUG)
