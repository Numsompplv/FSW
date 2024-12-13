from flask import Flask, send_from_directory, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)

# Enable sessions for login/logout functionality
app.config["SECRET_KEY"] = "supersecretkey"  # Use a secure key in production
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///friends.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Serve static files from the "dist" folder under the "frontend" directory
frontend_folder = os.path.join(os.getcwd(), "..", "frontend")
dist_folder = os.path.join(frontend_folder, "dist")

@app.route("/", defaults={"filename": ""})
@app.route("/<path:filename>")
def index(filename):
    if not filename:
        filename = "index.html"
    return send_from_directory(dist_folder, filename)

# Import API routes
import routes

# Initialize database and predefined users
def initialize_predefined_users():
    from models import User
    predefined_users = [
        {"username": "admin", "password": "admin123", "role": "admin"},
        {"username": "user", "password": "user123", "role": "user"},
    ]
    for user_data in predefined_users:
        if not User.query.filter_by(username=user_data["username"]).first():
            user = User(username=user_data["username"])
            user.set_password(user_data["password"])
            user.role = user_data["role"]
            db.session.add(user)
    db.session.commit()

with app.app_context():
    db.drop_all()  # Drop existing tables
    db.create_all()  # Create new tables
    initialize_predefined_users()  # Add predefined users

if __name__ == "__main__":
    app.run(debug=True)
