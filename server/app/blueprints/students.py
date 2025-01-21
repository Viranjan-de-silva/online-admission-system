from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app.models import Student, Document
from app import db
import os
import json
from datetime import datetime

# Blueprint for student-related API routes
students_bp = Blueprint('students', __name__)

# Helper function to check if the uploaded file has an allowed extension
def allowed_file(filename, allowed_extensions=None):
    if allowed_extensions is None:
        allowed_extensions = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'}  # Default allowed extensions
    # Check if the file extension is valid
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

# Helper function to validate file size against the configured max size
def validate_file_size(file):
    file_data = file.read()
    file.seek(0)  # Reset file pointer to the beginning after reading
    return len(file_data) <= current_app.config['MAX_CONTENT_LENGTH']

# Route to create a new student record
@students_bp.route('/create', methods=['POST'])
def create_student():
    try:
        # Validate required fields from the form data
        required_fields = ['firstname', 'lastname', 'email', 'grade']
        for field in required_fields:
            if not request.form.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400  # Return an error if a required field is missing

        # Validate profile image if it is provided
        if 'profile_image' in request.files:
            profile_image = request.files['profile_image']
            if profile_image:
                # Check if the profile image format is allowed
                if not allowed_file(profile_image.filename, {'jpg', 'jpeg', 'png'}):
                    return jsonify({
                        'success': False,
                        'message': 'Invalid profile image format. Allowed formats: jpg, jpeg, png'
                    }), 400
                # Check if the file size is within the allowed limit
                if not validate_file_size(profile_image):
                    return jsonify({
                        'success': False,
                        'message': f'Profile image exceeds maximum size of {current_app.config["MAX_CONTENT_LENGTH"] // (1024*1024)}MB'
                    }), 400

        # Validate documents if they are provided
        if 'documents' in request.files:
            documents = request.files.getlist('documents')
            for doc in documents:
                if doc:
                    # Check if document format is allowed
                    if not allowed_file(doc.filename, {'pdf', 'doc', 'docx'}):
                        return jsonify({
                            'success': False,
                            'message': f'Invalid document format for {doc.filename}. Allowed formats: pdf, doc, docx'
                        }), 400
                    # Check if document size is within the allowed limit
                    if not validate_file_size(doc):
                        return jsonify({
                            'success': False,
                            'message': f'Document {doc.filename} exceeds maximum size of {current_app.config["MAX_CONTENT_LENGTH"] // (1024*1024)}MB'
                        }), 400

        # Create new student record from form data
        student = Student(
            firstname=request.form.get('firstname'),
            lastname=request.form.get('lastname'),
            email=request.form.get('email'),
            grade=request.form.get('grade'),
            gender=request.form.get('gender'),
            birthday=datetime.strptime(request.form.get('birthday'), '%Y-%m-%d').date() if request.form.get('birthday') else None,
            activities=json.loads(request.form.get('activities', '[]'))  # Convert activities to JSON format
        )
        
        # Handle profile image file upload
        if 'profile_image' in request.files:
            file = request.files['profile_image']
            if file:
                filename = secure_filename(file.filename)
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'profile_images', filename)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)  # Ensure the directory exists
                file.save(file_path)  # Save the file to the directory
                student.profile_image = file_path  # Store the file path in the student's profile

        # Add the new student record to the database
        db.session.add(student)
        db.session.commit()

        # Handle document uploads (optional)
        if 'documents' in request.files:
            for file in request.files.getlist('documents'):
                if file:
                    filename = secure_filename(file.filename)
                    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'documents', str(student.id), filename)
                    os.makedirs(os.path.dirname(file_path), exist_ok=True)  # Ensure the directory exists for each document
                    file.save(file_path)  # Save the file to the directory
                    
                    # Create document record for each uploaded file
                    document = Document(
                        filename=filename,
                        file_path=file_path,
                        file_type=file.content_type,
                        student_id=student.id
                    )
                    db.session.add(document)  # Add the document record to the database
            
            db.session.commit()  # Commit the changes for documents

        # Return success response
        return jsonify({'success': True, 'message': 'Student created successfully'})

    except ValueError as ve:
        db.session.rollback()  # Rollback transaction if any error occurs
        return jsonify({'success': False, 'message': f'Invalid data format: {str(ve)}'}), 400
    except Exception as e:
        db.session.rollback()  # Rollback transaction if any unexpected error occurs
        return jsonify({'success': False, 'message': str(e)}), 500  # Return error response if any exception occurs


# Route to get all student records
@students_bp.route('/all', methods=['GET'])
def get_students():
    try:
        students = Student.query.all()  # Fetch all students from the database
        student_list = []
        
        # Prepare each student's data for the response
        for student in students:
            student_dict = {
                'id': student.id,
                'firstname': student.firstname,
                'lastname': student.lastname,
                'email': student.email,
                'grade': student.grade,
                'gender': student.gender,
                'birthday': student.birthday,  # Add birthday information
            }
            student_list.append(student_dict)  # Append student data to the list
        
        # Return the list of students in JSON format
        return jsonify(student_list), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500  # Return error response if fetching students fails


# Route to delete a student record by ID
@students_bp.route('/delete/<int:id>', methods=['DELETE'])
def delete_student(id):
    try:
        student = Student.query.get(id)  # Find student by ID
        
        if student:
            # First, delete associated documents before deleting the student
            for doc in student.documents:
                db.session.delete(doc)
            db.session.commit()  # Commit the document deletions
            
            # Now delete the student record
            db.session.delete(student)
            db.session.commit()  # Commit the student deletion
            
            return jsonify({'success': True, 'message': 'Student deleted successfully'}), 200
        else:
            return jsonify({'success': False, 'message': 'Student not found'}), 404  # Student not found

    except Exception as e:
        db.session.rollback()  # Rollback transaction in case of error
        return jsonify({'success': False, 'message': str(e)}), 500  # Return error response if deletion fails


# Route to get a specific student's details by ID
@students_bp.route('/all/<int:student_id>', methods=['PUT'])
def get_student(student_id):
    """
    Fetch a single student's data by ID.
    """
    try:
        student = Student.query.get(student_id)  # Fetch student by ID
        if not student:
            return jsonify({'success': False, 'message': 'Student not found'}), 404  # Return error if student not found

        # Prepare the student's data for response
        student_data = {
            'id': student.id,
            'firstname': student.firstname,
            'lastname': student.lastname,
            'email': student.email,
            'grade': student.grade,
            'gender': student.gender,
            'birthday': student.birthday.isoformat() if student.birthday else None,  # Convert date to ISO format
            'activities': student.activities,  # Activities are stored in JSON format
            'profile_image': student.profile_image,  # Include profile image path if available
        }

        return jsonify({'success': True, 'student': student_data}), 200  # Return the student's data as JSON

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500  # Return error if fetching student fails
