# app/blueprints/documents.py
from flask import Blueprint, request, jsonify, send_file
from app.models import Document
from app import db
import os

documents_bp = Blueprint('documents', __name__)

@documents_bp.route('/<int:document_id>', methods=['GET'])
def get_document(document_id):
    document = Document.query.get_or_404(document_id)
    return send_file(document.file_path)

@documents_bp.route('/<int:document_id>', methods=['DELETE'])
def delete_document(document_id):
    try:
        document = Document.query.get_or_404(document_id)
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
        db.session.delete(document)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Document deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500