from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from routes.auth import auth_routes

app = Flask(__name__)

CORS(app)

app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY

jwt = JWTManager(app)

app.register_blueprint(auth_routes, url_prefix="/api")

@app.route("/")
def home():
    return {"message": "API running"}
if __name__ == "__main__":
    app.run(debug=True)