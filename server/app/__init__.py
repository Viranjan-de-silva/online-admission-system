# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app) # Allow CORS for all domains
    db.init_app(app)
    
    from app.blueprints.students import students_bp
    from app.blueprints.documents import documents_bp
    
    # Register the blueprints
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(documents_bp, url_prefix='/api/documents')
    
    return app