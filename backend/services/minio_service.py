import os
import uuid
from typing import Optional

from minio import Minio
from minio.error import S3Error

# MinIO connection configuration (matches docker-compose.yml)
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ROOT_USER", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_ROOT_PASSWORD", "minioadminpassword")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"
BUCKET_NAME = "profile-pictures"


def get_minio_client() -> Minio:
    """Create and return a MinIO client."""
    return Minio(
        MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=MINIO_SECURE,
    )


def ensure_bucket_exists(client: Minio) -> None:
    """Create the profile-pictures bucket if it doesn't exist."""
    if not client.bucket_exists(BUCKET_NAME):
        client.make_bucket(BUCKET_NAME)


def upload_profile_picture(
    user_id: int,
    file_data: bytes,
    filename: str,
    content_type: str = "image/png",
) -> str:
    """
    Upload a profile picture to MinIO.
    Returns the object path (e.g. 'profile-pictures/42/avatar.png').
    """
    client = get_minio_client()
    ensure_bucket_exists(client)

    # Generate a unique filename to avoid collisions
    ext = os.path.splitext(filename)[1] if "." in filename else ".png"
    object_name = f"{user_id}/avatar{ext}"

    from io import BytesIO
    data_stream = BytesIO(file_data)

    client.put_object(
        BUCKET_NAME,
        object_name,
        data_stream,
        length=len(file_data),
        content_type=content_type,
    )

    return f"{BUCKET_NAME}/{object_name}"


def get_profile_picture_url(user_id: int) -> Optional[str]:
    """
    Get a presigned URL for the user's profile picture.
    Returns None if no picture exists.
    """
    client = get_minio_client()

    # Try common extensions
    for ext in [".png", ".jpg", ".jpeg", ".gif", ".webp"]:
        object_name = f"{user_id}/avatar{ext}"
        try:
            # Check if the object exists
            client.stat_object(BUCKET_NAME, object_name)
            # Generate a presigned URL valid for 1 hour
            from datetime import timedelta
            url = client.presigned_get_object(
                BUCKET_NAME,
                object_name,
                expires=timedelta(hours=1),
            )
            return url
        except S3Error:
            continue

    return None
