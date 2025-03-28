from flask import Blueprint, request, jsonify
from database import documents_collection
from gemini_service import analyze_legal_text

legal_routes = Blueprint("legal_routes", __name__)

# Upload legal document
@legal_routes.route("/upload", methods=["POST"])
def upload_document():
    data = request.json
    document_text = data.get("text")
    if not document_text:
        return jsonify({"error": "No text provided"}), 400

    # Store document in MongoDB
    doc_id = documents_collection.insert_one({"text": document_text}).inserted_id

    return jsonify({"message": "Document uploaded", "document_id": str(doc_id)})

# Analyze document
@legal_routes.route("/analyze", methods=["POST"])
def analyze_document():
    data = request.json
    document_text = data.get("text")

    if not document_text:
        return jsonify({"error": "No text provided"}), 400

    analysis_result = analyze_legal_text(document_text)

    return jsonify({"analysis": analysis_result})
