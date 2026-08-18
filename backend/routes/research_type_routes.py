from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import uuid

from backend.database.connection import get_db
from backend.models.schemas import ResearchTypeModel, User
from backend.routes.auth_routes import get_authenticated_user

router = APIRouter(prefix="/api/research-types", tags=["Research Types"])

class ResearchTypeResponse(BaseModel):
    id: str
    name: str
    user_id: Optional[int] = None

    class Config:
        from_attributes = True
        orm_mode = True # For backwards compatibility if pydantic v1 is used

class ResearchTypeCreate(BaseModel):
    name: str

@router.get("", response_model=List[ResearchTypeResponse])
def get_research_types(db: Session = Depends(get_db), current_user: User = Depends(get_authenticated_user)):
    # Fetch default system types and custom types for this user
    types = db.query(ResearchTypeModel).filter(
        (ResearchTypeModel.user_id == None) | (ResearchTypeModel.user_id == current_user.id)
    ).all()
    
    # If the database is completely empty (no default types), create them
    if not any(t.user_id is None for t in types):
        defaults = ["Market Research", "Competitive Analysis", "Startup Validation", "Technology Trend"]
        for d in defaults:
            db_type = ResearchTypeModel(id=str(uuid.uuid4()), name=d, user_id=None)
            db.add(db_type)
        try:
            db.commit()
            # Refetch
            types = db.query(ResearchTypeModel).filter(
                (ResearchTypeModel.user_id == None) | (ResearchTypeModel.user_id == current_user.id)
            ).all()
        except Exception as e:
            print(f"Error seeding research types: {e}")
            db.rollback()
            
    return types

@router.post("", response_model=ResearchTypeResponse)
def create_research_type(data: ResearchTypeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_authenticated_user)):
    if not data.name.strip():
        raise HTTPException(status_code=400, detail="Name cannot be empty")
        
    existing = db.query(ResearchTypeModel).filter(
        ResearchTypeModel.name == data.name.strip()
    ).first()
    
    if existing:
        return existing
        
    new_type = ResearchTypeModel(id=str(uuid.uuid4()), name=data.name.strip(), user_id=current_user.id)
    db.add(new_type)
    db.commit()
    db.refresh(new_type)
    return new_type
