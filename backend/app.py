from flask import Flask
from flask_cors import CORS
from routes import legal_routes

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Register Blueprints (API routes)
app.register_blueprint(legal_routes, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)
