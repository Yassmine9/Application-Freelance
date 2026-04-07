from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config

from db.mongo import client  

#import blueprints
from routes.auth import auth_routes
from routes.product_routes import product_bp
from routes.category_routes import category_bp
from routes.admin_routes import admin_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    jwt = JWTManager(app)
    app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY

    # Register blueprints
    app.register_blueprint(product_bp, url_prefix="/products")
    app.register_blueprint(auth_routes, url_prefix="/api")
    app.register_blueprint(category_bp, url_prefix="/categories")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    
    @app.route("/")
    def home():
        return {"message": "API running"}
    return app


if __name__ == "__main__":
    app=create_app()
    app.run(debug=True)