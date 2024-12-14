from flask import Flask, send_from_directory, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_mail import Mail
import os

app = Flask(__name__)

# Enable sessions for login/logout functionality
app.config["SECRET_KEY"] = "supersecretkey"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///friends.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Configure Flask-Mail
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = "ktalha4053@gmail.com"
app.config["MAIL_PASSWORD"] = "mwta vfqa vzmw jywm"
app.config["MAIL_DEFAULT_SENDER"] = "ktalha4053@gmail.com"

mail = Mail(app)
db = SQLAlchemy(app)

# Enable CORS for API calls
CORS(app)

# Define folder paths (frontend is a sibling of backend)
current_directory = os.path.abspath(os.getcwd())
frontend_folder = os.path.abspath(os.path.join(current_directory, "..", "frontend"))
dist_folder = os.path.join(frontend_folder, "dist")
uploads_folder = os.path.join(frontend_folder, "public", "uploads")

# Debug: Print folder paths for verification
print("Frontend folder:", frontend_folder)
print("Dist folder:", dist_folder)
print("Uploads folder:", uploads_folder)

# Ensure the uploads folder exists
if not os.path.exists(uploads_folder):
    os.makedirs(uploads_folder, exist_ok=True)

# Serve React app files
@app.route("/", defaults={"filename": ""})
@app.route("/<path:filename>")
def index(filename):
    """Serve React app static files."""
    if not filename:
        filename = "index.html"
    try:
        return send_from_directory(dist_folder, filename)
    except FileNotFoundError:
        return "React build not found. Please build the frontend using `npm run build`.", 404

# Serve uploaded images
@app.route("/uploads/<path:filename>")
def serve_uploaded_file(filename):
    """Serve uploaded images from the uploads folder."""
    try:
        return send_from_directory(uploads_folder, filename)
    except FileNotFoundError:
        return "File not found in uploads folder.", 404

# Handle 404 errors for React Router
@app.errorhandler(404)
def not_found(e):
    """Redirect all 404s to React's index.html for frontend routing."""
    try:
        return send_from_directory(dist_folder, "index.html")
    except FileNotFoundError:
        return "React build not found. Please build the frontend using `npm run build`.", 404

# Import API routes
import routes

def initialize_predefined_users():
    """Initialize predefined users for the app."""
    from models import User
    predefined_users = [
        {"username": "admin", "password": "admin123", "email": "ktalha4053@gmail.com", "role": "admin"},
        {"username": "user", "password": "user123", "email": "user@example.com", "role": "user"},
    ]
    for user_data in predefined_users:
        if not User.query.filter_by(username=user_data["username"]).first():
            user = User(
                username=user_data["username"],
                email=user_data["email"]
            )
            user.set_password(user_data["password"])
            user.role = user_data["role"]
            db.session.add(user)
    db.session.commit()

# Initialize database and predefined users
with app.app_context():
    db.drop_all()  # Drop existing tables
    db.create_all()  # Create new tables
    initialize_predefined_users()  # Add predefined users

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
