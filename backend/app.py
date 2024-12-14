from flask import Flask, send_from_directory, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_mail import Mail, Message  # Import Flask-Mail for email functionality
import os

app = Flask(__name__)

# Enable sessions for login/logout functionality
app.config["SECRET_KEY"] = "supersecretkey"  # Use a secure key in production
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///friends.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Configure Flask-Mail
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = "ktalha4053@gmail.com"  # Your email address
app.config["MAIL_PASSWORD"] = "mwta vfqa vzmw jywm"  # Your app-specific password
app.config["MAIL_DEFAULT_SENDER"] = "ktalha4053@gmail.com"  # Default sender

mail = Mail(app)

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

def initialize_predefined_users():
    from models import User
    predefined_users = [
        {"username": "admin", "password": "admin123", "email": "ktalha4053@gmail.com", "role": "admin"},
        {"username": "user", "password": "user123", "email": "user@example.com", "role": "user"},
    ]
    for user_data in predefined_users:
        # Check if the user already exists
        if not User.query.filter_by(username=user_data["username"]).first():
            user = User(
                username=user_data["username"],
                email=user_data["email"]
            )
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
