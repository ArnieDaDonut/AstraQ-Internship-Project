from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.services.auth_service import (
    register_user,
    authenticate_user,
    create_jwt_token,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()


# ---------- Request / Response Schemas ----------

class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    auth_provider: str
    profile_picture_url: Optional[str]


# ---------- Dependency ----------

def get_authenticated_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """Extract and validate the current user from the Authorization header."""
    user = get_current_user(db, credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return user


# ---------- Routes ----------

@router.post("/register", response_model=AuthResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user with email, username, and password."""
    if len(body.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters",
        )

    try:
        user = register_user(db, body.email, body.username, body.password)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )

    token = create_jwt_token(user.id)
    return AuthResponse(
        token=token,
        user={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "auth_provider": user.auth_provider,
            "profile_picture_url": user.profile_picture_url,
        },
    )


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password."""
    user = authenticate_user(db, body.email, body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_jwt_token(user.id)
    return AuthResponse(
        token=token,
        user={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "auth_provider": user.auth_provider,
            "profile_picture_url": user.profile_picture_url,
        },
    )


@router.get("/me", response_model=UserResponse)
def me(user=Depends(get_authenticated_user)):
    """Get the current authenticated user's profile."""
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        auth_provider=user.auth_provider,
        profile_picture_url=user.profile_picture_url,
    )
