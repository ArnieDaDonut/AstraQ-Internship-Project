from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any

from backend.database.connection import get_db
from backend.models.schemas import (
    ResearchProject, ResearchPlanItem, ResearchSource, ResearchDocument,
    Keyword, Theme, Finding, ResearchReport
)
from backend.routes.auth_routes import get_authenticated_user

router = APIRouter(prefix="/api/sync", tags=["Sync"])

# --- Pydantic Models for Sync Payload ---
class ProjectSync(BaseModel):
    id: str
    title: str
    question: str
    description: str
    research_type: str
    status: str
    opportunity_score: Optional[int]
    recommendation: Optional[str]
    created_at: str
    updated_at: str

class PlanItemSync(BaseModel):
    id: str
    project_id: str
    category: str
    description: str

class SourceSync(BaseModel):
    id: str
    project_id: str
    url: str
    title: str
    domain: str
    source_type: str
    credibility_score: int
    relevance_score: int
    status: str

class DocumentSync(BaseModel):
    id: str
    source_id: str
    raw_text: str
    cleaned_text: str
    word_count: int
    extracted_at: str

class KeywordSync(BaseModel):
    id: str
    source_id: str
    keyword: str
    score: float
    frequency: int

class ThemeSync(BaseModel):
    id: str
    project_id: str
    name: str
    description: str
    source_count: int

class ReportSync(BaseModel):
    id: str
    project_id: str
    executive_summary: Optional[str] = ""
    recommendation: Optional[str] = ""
    risks: Optional[Any] = None
    open_questions: Optional[Any] = None
    generated_at: str

class SyncPayload(BaseModel):
    projects: List[ProjectSync]
    planItems: List[PlanItemSync]
    sources: List[SourceSync]
    documents: List[DocumentSync]
    keywords: List[KeywordSync]
    themes: List[ThemeSync]
    reports: List[ReportSync]

# --- Endpoints ---

@router.get("")
def pull_sync(user=Depends(get_authenticated_user), db: Session = Depends(get_db)):
    """Pull the full workspace state for the authenticated user."""
    projects = db.query(ResearchProject).filter(ResearchProject.user_id == user.id).all()
    
    # We will just fetch all related objects for these projects
    project_ids = [p.id for p in projects]
    if not project_ids:
        return {
            "projects": [], "planItems": [], "sources": [],
            "documents": [], "keywords": [], "themes": [], "reports": []
        }

    plan_items = db.query(ResearchPlanItem).filter(ResearchPlanItem.project_id.in_(project_ids)).all()
    sources = db.query(ResearchSource).filter(ResearchSource.project_id.in_(project_ids)).all()
    source_ids = [s.id for s in sources]
    
    documents = db.query(ResearchDocument).filter(ResearchDocument.source_id.in_(source_ids)).all() if source_ids else []
    keywords = db.query(Keyword).filter(Keyword.source_id.in_(source_ids)).all() if source_ids else []
    themes = db.query(Theme).filter(Theme.project_id.in_(project_ids)).all()
    reports = db.query(ResearchReport).filter(ResearchReport.project_id.in_(project_ids)).all()

    # Convert to dicts for frontend
    def to_dict(items):
        return [{c.name: getattr(item, c.name) for c in item.__table__.columns} for item in items]

    return {
        "projects": to_dict(projects),
        "planItems": to_dict(plan_items),
        "sources": to_dict(sources),
        "documents": to_dict(documents),
        "keywords": to_dict(keywords),
        "themes": to_dict(themes),
        "reports": to_dict(reports),
    }


@router.post("")
def push_sync(payload: SyncPayload, user=Depends(get_authenticated_user), db: Session = Depends(get_db)):
    """Upsert the frontend state into the DB."""
    
    # First, delete all projects for this user (which cascades and deletes everything else)
    # This is a brute-force sync but perfectly guarantees no orphaned records for prototyping.
    db.query(ResearchProject).filter(ResearchProject.user_id == user.id).delete(synchronize_session=False)
    db.commit()

    # Insert Projects
    for p in payload.projects:
        db.add(ResearchProject(
            id=p.id, user_id=user.id, title=p.title, question=p.question,
            description=p.description, research_type=p.research_type,
            status=p.status, opportunity_score=p.opportunity_score,
            recommendation=p.recommendation
        ))
    db.commit()

    # Insert Plan Items
    for i in payload.planItems:
        db.add(ResearchPlanItem(
            id=i.id, project_id=i.project_id, category=i.category, description=i.description
        ))

    # Insert Sources
    for s in payload.sources:
        db.add(ResearchSource(
            id=s.id, project_id=s.project_id, url=s.url, title=s.title,
            domain=s.domain, source_type=s.source_type,
            credibility_score=s.credibility_score, relevance_score=s.relevance_score,
            status=s.status
        ))
    db.commit()

    # Insert Documents & Keywords (depend on Sources)
    for d in payload.documents:
        db.add(ResearchDocument(
            id=d.id, source_id=d.source_id, raw_text=d.raw_text,
            cleaned_text=d.cleaned_text, word_count=d.word_count
        ))
    for k in payload.keywords:
        db.add(Keyword(
            id=k.id, source_id=k.source_id, keyword=k.keyword,
            score=k.score, frequency=k.frequency
        ))
    db.commit()

    # Insert Themes
    for t in payload.themes:
        db.add(Theme(
            id=t.id, project_id=t.project_id, name=t.name,
            description=t.description, source_count=t.source_count
        ))

    # Insert Reports
    import json
    for r in payload.reports:
        # Convert lists to JSON strings for risks/open_questions if needed, or if schemas.py is Text
        risks_str = json.dumps(r.risks) if isinstance(r.risks, (list, dict)) else str(r.risks)
        questions_str = json.dumps(r.open_questions) if isinstance(r.open_questions, (list, dict)) else str(r.open_questions)
        
        db.add(ResearchReport(
            id=r.id, project_id=r.project_id, executive_summary=r.executive_summary or "",
            recommendation=r.recommendation or "", risks=risks_str, open_questions=questions_str
        ))
        
    db.commit()
    
    return {"status": "success"}
