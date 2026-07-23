import os
import datetime
from typing import Optional

import bcrypt
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from backend.models.schemas import User

# JWT configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "astraq-dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


def register_user(db: Session, email: str, username: str, password: str) -> User:
    """
    Register a new local user.
    Raises ValueError if email or username already taken.
    """
    if db.query(User).filter(User.email == email).first():
        raise ValueError("Email already registered")
    if db.query(User).filter(User.username == username).first():
        raise ValueError("Username already taken")

    user = User(
        email=email.lower().strip(),
        username=username.strip(),
        password_hash=hash_password(password),
        auth_provider="local",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user with email + password.
    Returns the User if credentials are valid, None otherwise.
    """
    user = db.query(User).filter(User.email == email.lower().strip()).first()
    if not user or not user.password_hash:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_jwt_token(user_id: int) -> str:
    """Create a JWT access token for the given user ID."""
    expire = datetime.datetime.utcnow() + datetime.timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": str(user_id),
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_user_id_from_token(token: str) -> Optional[int]:
    """Decode a JWT token and return the user ID, or None if invalid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            return None
        return int(user_id_str)
    except (JWTError, ValueError):
        return None


def get_current_user(db: Session, token: str) -> Optional[User]:
    """Retrieve the User object from a JWT token."""
    user_id = get_user_id_from_token(token)
    if user_id is None:
        return None
    return db.query(User).filter(User.id == user_id).first()
