from flask import Blueprint, request, jsonify
from gemini_ai import analyze_document
import os
import PyPDF2
import docx

routes = Blueprint("routes", __name__)

def extract_text_from_file(file):
    """Extracts text from uploaded files based on file type."""
    try:
        filename = file.filename.lower()

        # Handle PDF files
        if filename.endswith(".pdf"):
            reader = PyPDF2.PdfReader(file)
            text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
            return text

        # Handle DOCX (Word) files
        elif filename.endswith(".docx"):
            doc = docx.Document(file)
            text = "\n".join([para.text for para in doc.paragraphs])
            return text

        # Handle TXT files
        elif filename.endswith(".txt"):
            return file.read().decode("utf-8", errors="ignore")

        else:
            return None  # Unsupported format

    except Exception as e:
        print("Error extracting file text:", str(e))
        return None

@routes.route("/analyze", methods=["POST"])
def analyze():
    try:
        content = ""

        # Handle file upload
        if "file" in request.files and request.files["file"].filename:
            file = request.files["file"]
            content = extract_text_from_file(file)

            if not content:
                return jsonify({"error": "Unsupported file format or empty document."}), 400

        # Handle pasted text input
        elif request.json and "text" in request.json:
            content = request.json["text"]

        else:
            return jsonify({"error": "No input provided!"}), 400

        print(f"Processing content: {content[:200]}...")  # Debugging print

        # Analyze with Gemini AI
        result = analyze_document(content)

        return jsonify({"message": "Analysis complete!", "data": result}), 200

    except Exception as e:
        print("Error:", str(e))  # Log errors
        return jsonify({"error": str(e)}), 500
