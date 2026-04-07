from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import db, init_indexes

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "super-secret-key"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False   # dev: never expire

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

from routes.auth      import auth_bp
from routes.offers    import offers_bp
from routes.proposals import proposals_bp
from routes.messages  import messages_bp

app.register_blueprint(auth_bp,      url_prefix="/auth")
app.register_blueprint(offers_bp,    url_prefix="/offers")
app.register_blueprint(proposals_bp, url_prefix="/proposals")
app.register_blueprint(messages_bp,  url_prefix="/messages")

@app.route("/health")
def health():
    return jsonify({"status": "ok"}), 200

with app.app_context():
    init_indexes()

if __name__ == "__main__":
    app.run(debug=True)