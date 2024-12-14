from app import app, db, mail
from flask import request, jsonify, session
from models import Friend, User
from functools import wraps
import uuid  # For generating unique reset tokens
import datetime
from flask_mail import Message  # Import Flask-Mail

# Decorator to ensure user is logged in
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

# Register a new user
@app.route("/api/register", methods=["POST"])
def register_user():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")  # Added email field

    if not username or not password or not email:
        return jsonify({"error": "Username, email, and password are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "User already exists"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    # Create a new user with the default 'user' role
    new_user = User(username=username, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.to_json()), 201

# Login a user
@app.route("/api/login", methods=["POST"])
def login_user():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        session["user_id"] = user.id
        return jsonify({"message": "Login successful", "user": user.to_json()}), 200

    return jsonify({"error": "Invalid credentials"}), 401

# Logout a user
@app.route("/api/logout", methods=["POST"])
@login_required
def logout_user():
    session.pop("user_id", None)
    return jsonify({"message": "Logout successful"}), 200

# Get friends for the logged-in user
@app.route("/api/friends", methods=["GET"])
@login_required
def get_friends():
    user_id = session["user_id"]
    friends = Friend.query.filter_by(user_id=user_id).all()
    result = [friend.to_json() for friend in friends]
    return jsonify(result)

# Create a new friend
@app.route("/api/friends", methods=["POST"])
@login_required
def create_friend():
    try:
        data = request.json
        user_id = session["user_id"]

        # Validations
        required_fields = ["name", "role", "description", "gender"]
        for field in required_fields:
            if field not in data or not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400

        name = data.get("name")
        role = data.get("role")
        description = data.get("description")
        gender = data.get("gender")

        # Fetch avatar image based on gender
        if gender == "male":
            img_url = f"https://avatar.iran.liara.run/public/boy?username={name}"
        elif gender == "female":
            img_url = f"https://avatar.iran.liara.run/public/girl?username={name}"
        else:
            img_url = None

        new_friend = Friend(
            name=name, role=role, description=description, gender=gender, img_url=img_url, user_id=user_id
        )

        db.session.add(new_friend)
        db.session.commit()

        return jsonify(new_friend.to_json()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Delete a friend
@app.route("/api/friends/<int:id>", methods=["DELETE"])
@login_required
def delete_friend(id):
    try:
        user_id = session["user_id"]
        friend = Friend.query.filter_by(id=id, user_id=user_id).first()
        if friend is None:
            return jsonify({"error": "Friend not found"}), 404

        db.session.delete(friend)
        db.session.commit()
        return jsonify({"msg": "Friend deleted"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Request password reset
@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    email = data.get("email")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Email not found"}), 404

    # Generate a unique token and set expiry
    reset_token = str(uuid.uuid4())
    user.set_reset_token(reset_token)
    db.session.commit()

    # Send the reset token via email
    try:
        msg = Message("Password Reset Request", recipients=[email])
        msg.body = f"""
        Hi {user.username},

        Use the following token to reset your password:

        {reset_token}

        This token will expire in 15 minutes.
        """
        mail.send(msg)
        return jsonify({"message": "Reset token sent to your email."}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500

# Confirm password reset
@app.route("/api/confirm-reset-password", methods=["POST"])
def confirm_reset_password():
    data = request.json
    email = data.get("email")
    token = data.get("token")
    new_password = data.get("new_password")

    user = User.query.filter_by(email=email).first()
    if not user or user.reset_token != token:
        return jsonify({"error": "Invalid token or email"}), 400

    # Check token expiry
    if datetime.datetime.utcnow() > user.reset_token_expiry:
        return jsonify({"error": "Reset token expired"}), 400

    # Reset password
    user.set_password(new_password)
    user.clear_reset_token()
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200
