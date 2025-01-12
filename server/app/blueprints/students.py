from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app.models import Student, Document
from app import db
import os
import json
from datetime import datetime

students_bp = Blueprint('students', __name__)

def allowed_file(filename, allowed_extensions=None):
    if allowed_extensions is None:
        allowed_extensions = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def validate_file_size(file):
    file_data = file.read()
    file.seek(0)  # Reset file pointer
    return len(file_data) <= current_app.config['MAX_CONTENT_LENGTH']

@students_bp.route('/create', methods=['POST'])
def create_student():
    try:
        # Validate required fields
        required_fields = ['firstname', 'lastname', 'email', 'grade']
        for field in required_fields:
            if not request.form.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400

        # Validate profile image
        if 'profile_image' in request.files:
            profile_image = request.files['profile_image']
            if profile_image:
                if not allowed_file(profile_image.filename, {'jpg', 'jpeg', 'png'}):
                    return jsonify({
                        'success': False,
                        'message': 'Invalid profile image format. Allowed formats: jpg, jpeg, png'
                    }), 400
                if not validate_file_size(profile_image):
                    return jsonify({
                        'success': False,
                        'message': f'Profile image exceeds maximum size of {current_app.config["MAX_CONTENT_LENGTH"] // (1024*1024)}MB'
                    }), 400

        # Validate documents
        if 'documents' in request.files:
            documents = request.files.getlist('documents')
            for doc in documents:
                if doc:
                    if not allowed_file(doc.filename, {'pdf', 'doc', 'docx'}):
                        return jsonify({
                            'success': False,
                            'message': f'Invalid document format for {doc.filename}. Allowed formats: pdf, doc, docx'
                        }), 400
                    if not validate_file_size(doc):
                        return jsonify({
                            'success': False,
                            'message': f'Document {doc.filename} exceeds maximum size of {current_app.config["MAX_CONTENT_LENGTH"] // (1024*1024)}MB'
                        }), 400

        # Create student record
        student = Student(
            firstname=request.form.get('firstname'),
            lastname=request.form.get('lastname'),
            email=request.form.get('email'),
            grade=request.form.get('grade'),
            gender=request.form.get('gender'),
            birthday=datetime.strptime(request.form.get('birthday'), '%Y-%m-%d').date() if request.form.get('birthday') else None,
            activities=json.loads(request.form.get('activities', '[]'))
        )
        
        # Handle profile image
        if 'profile_image' in request.files:
            file = request.files['profile_image']
            if file:
                filename = secure_filename(file.filename)
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'profile_images', filename)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                file.save(file_path)
                student.profile_image = file_path

        db.session.add(student)
        db.session.commit()

        # Handle documents
        if 'documents' in request.files:
            for file in request.files.getlist('documents'):
                if file:
                    filename = secure_filename(file.filename)
                    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'documents', str(student.id), filename)
                    os.makedirs(os.path.dirname(file_path), exist_ok=True)
                    file.save(file_path)
                    
                    document = Document(
                        filename=filename,
                        file_path=file_path,
                        file_type=file.content_type,
                        student_id=student.id
                    )
                    db.session.add(document)
            
            db.session.commit()

        return jsonify({'success': True, 'message': 'Student created successfully'})

    except ValueError as ve:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Invalid data format: {str(ve)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500