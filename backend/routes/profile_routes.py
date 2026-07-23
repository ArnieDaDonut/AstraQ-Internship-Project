from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.routes.auth_routes import get_authenticated_user
from backend.services.minio_service import upload_profile_picture, get_profile_picture_url

router = APIRouter(prefix="/api/profile", tags=["profile"])

ALLOWED_CONTENT_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/picture")
async def upload_picture(
    file: UploadFile = File(...),
    user=Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    """Upload or replace the authenticated user's profile picture."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{file.content_type}' not allowed. Use PNG, JPEG, GIF, or WebP.",
        )

    file_data = await file.read()
    if len(file_data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 5 MB.",
        )

    object_path = upload_profile_picture(
        user_id=user.id,
        file_data=file_data,
        filename=file.filename or "avatar.png",
        content_type=file.content_type,
    )

    # Update the user's profile_picture_url in the database
    user.profile_picture_url = object_path
    db.commit()

    return {"message": "Profile picture uploaded", "path": object_path}


@router.get("/picture")
def get_picture(user=Depends(get_authenticated_user)):
    """Get a presigned URL for the authenticated user's profile picture."""
    url = get_profile_picture_url(user.id)
    if not url:
        return {"url": None}
    return {"url": url}
