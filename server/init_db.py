# backend/init_db.py

from app import create_app, db
import os

def init_database():
    app = create_app()
    
    # Create upload directories
    with app.app_context():
        upload_dirs = [
            os.path.join(app.config['UPLOAD_FOLDER'], 'profile_images'),
            os.path.join(app.config['UPLOAD_FOLDER'], 'documents')
        ]
        
        for directory in upload_dirs:
            if not os.path.exists(directory):
                os.makedirs(directory)
    
    # Create database tables
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")

if __name__ == "__main__":
    init_database()