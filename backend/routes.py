from app import app, db, mail
from flask import request, jsonify, session
from models import Friend, User
from functools import wraps
import os
from werkzeug.utils import secure_filename

# Configure file upload
UPLOAD_FOLDER = os.path.abspath(r"C:\xampp\htdocs\FSW\frontend\public\uploads")
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


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
    email = data.get("email")

    if not username or not password or not email:
        return jsonify({"error": "Username, email, and password are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "User already exists"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

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
        user_id = session["user_id"]
        data = request.form

        # Required fields
        required_fields = ["name", "role", "description", "gender"]
        for field in required_fields:
            if field not in data or not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400

        name = data.get("name")
        role = data.get("role")
        description = data.get("description")
        gender = data.get("gender")

        # Handle image upload
        img_url = None
        if 'image' in request.files:
            file = request.files['image']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                img_url = f"/uploads/{filename}"  # Relative path for serving in the frontend

        # Default image logic
        if not img_url:
            img_url = (
                f"https://avatar.iran.liara.run/public/boy?username={name}"
                if gender == "male"
                else f"https://avatar.iran.liara.run/public/girl?username={name}"
            )

        new_friend = Friend(
            name=name, role=role, description=description, gender=gender, img_url=img_url, user_id=user_id
        )

        db.session.add(new_friend)
        db.session.commit()

        return jsonify(new_friend.to_json()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Update a friend's details
@app.route("/api/friends/<int:id>", methods=["PUT"])
@login_required
def update_friend(id):
    try:
        user_id = session["user_id"]
        friend = Friend.query.filter_by(id=id, user_id=user_id).first()

        if not friend:
            return jsonify({"error": "Friend not found"}), 404

        data = request.form

        # Update fields
        friend.name = data.get("name", friend.name)
        friend.role = data.get("role", friend.role)
        friend.description = data.get("description", friend.description)
        friend.gender = data.get("gender", friend.gender)

        # Handle image upload
        if 'image' in request.files:
            file = request.files['image']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                friend.img_url = f"/uploads/{filename}"  # Update the image URL

        db.session.commit()

        return jsonify(friend.to_json()), 200

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

        if not friend:
            return jsonify({"error": "Friend not found"}), 404

        db.session.delete(friend)
        db.session.commit()
        return jsonify({"msg": "Friend deleted"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
