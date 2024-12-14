from app import db
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

class Friend(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    img_url = db.Column(db.String(200), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "role": self.role,
            "description": self.description,
            "gender": self.gender,
            "imgUrl": self.img_url,
        }


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)  # Email field added
    password_hash = db.Column(db.String(200), nullable=False)
    reset_token = db.Column(db.String(100), nullable=True)  # For password reset
    reset_token_expiry = db.Column(db.DateTime, nullable=True)  # Token expiry time
    role = db.Column(db.String(20), default="user")
    friends = db.relationship('Friend', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def set_reset_token(self, token):
        self.reset_token = token
        self.reset_token_expiry = datetime.datetime.now() + datetime.timedelta(hours=1)

    def clear_reset_token(self):
        self.reset_token = None
        self.reset_token_expiry = None

    def to_json(self):
        return {"id": self.id, "username": self.username, "email": self.email, "role": self.role}
