from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import json
import datetime

from backend.database.connection import get_db
from backend.models.schemas import Prompt
from backend.services.agent_service import generate_final_report

router = APIRouter(prefix="/api/research-projects", tags=["Report Generation"])

class SavePreferenceRequest(BaseModel):
    research_type: str
    preference: str

class GenerateReportRequest(BaseModel):
    research_type: str
    question: str

class ReportResponse(BaseModel):
    executive_summary: str
    recommendation: str
    risks: List[str]
    open_questions: List[str]

@router.post("/save-preference")
def save_preference(req: SavePreferenceRequest, db: Session = Depends(get_db)):
    # Upsert preference in the Prompt table mapped to the research_type
    prompt_obj = db.query(Prompt).filter(Prompt.research_type == req.research_type).first()
    if prompt_obj:
        prompt_obj.prompt_text = req.preference
    else:
        new_prompt = Prompt(
            research_type=req.research_type,
            prompt_text=req.preference,
            description="User Report Formatting Preferences"
        )
        db.add(new_prompt)
    db.commit()
    return {"status": "success"}

@router.post("/generate-report", response_model=ReportResponse)
def generate_report_endpoint(req: GenerateReportRequest, db: Session = Depends(get_db)):
    # Fetch preference from DB
    prompt_obj = db.query(Prompt).filter(Prompt.research_type == req.research_type).first()
    preferences = prompt_obj.prompt_text if prompt_obj else "Professional business format."

    try:
        # Call agent
        report_data = generate_final_report(
            question=req.question,
            research_type=req.research_type,
            preferences=preferences
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent report generation failed: {str(e)}")

    # Return directly, skipping DB persistence to be stateless with the mock frontend
    return ReportResponse(
        executive_summary=report_data["executive_summary"],
        recommendation=report_data["recommendation"],
        risks=report_data["risks"],
        open_questions=report_data["open_questions"]
    )
