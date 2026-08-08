from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from backend.database.connection import get_db
from backend.models.schemas import ResearchProject, ResearchPlanItem, Prompt, User
from backend.routes.auth_routes import get_authenticated_user
from backend.services.agent_service import generate_research_plan

router = APIRouter(prefix="/api/research-projects", tags=["Research Plan"])

class PlanGenerationRequest(BaseModel):
    question: str
    research_type: str

class MasterPromptResponse(BaseModel):
    prompt_text: str
    workflow_summary: str

class PlanItemResponse(BaseModel):
    id: int
    project_id: int
    category: str
    description: str

    class Config:
        from_attributes = True

DEFAULT_MASTER_PROMPT = """You are an elite AI Business Analyst. Your task is to act as an agentic AI system that generates a structured research plan. You must strictly adhere to the provided JSON schema to ensure zero formatting errors.

Break down the user's research question into highly targeted research categories (vectors). Each category should focus on a specific aspect of the problem (e.g., Market Size, Competitor Pricing, Regulatory Risks) and include a detailed description of what data points are needed to validate it.

Your output must be structured, logical, and Mutually Exclusive, Collectively Exhaustive (MECE)."""

@router.get("/master-prompt", response_model=MasterPromptResponse)
def get_master_prompt(research_type: str = "Market Research", db: Session = Depends(get_db)):
    # Try to find a custom prompt for this research type
    prompt_obj = db.query(Prompt).filter(Prompt.research_type == research_type).first()
    prompt_text = prompt_obj.prompt_text if prompt_obj else DEFAULT_MASTER_PROMPT

    workflow_summary = (
        "The Agentic AI will take your query and research type, inject them into this master prompt, "
        "and use structured outputs (JSON enforcement) to guarantee exactly 5 categories are generated "
        "without formatting errors. It operates autonomously to break down the query."
    )

    return MasterPromptResponse(
        prompt_text=prompt_text,
        workflow_summary=workflow_summary
    )

@router.post("/generate-plan", response_model=List[PlanItemResponse])
def generate_plan_endpoint(req: PlanGenerationRequest, db: Session = Depends(get_db)):
    # Get master prompt
    prompt_obj = db.query(Prompt).filter(Prompt.research_type == req.research_type).first()
    master_prompt = prompt_obj.prompt_text if prompt_obj else DEFAULT_MASTER_PROMPT

    try:
        # Call the agent service
        plan_items_data = generate_research_plan(
            question=req.question,
            research_type=req.research_type,
            master_prompt=master_prompt
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent generation failed: {str(e)}")

    # Return items (frontend will save them to its local state)
    result = []
    for i, item_data in enumerate(plan_items_data):
        result.append(PlanItemResponse(
            id=i + 1,
            project_id=0, # Placeholder
            category=item_data["category"],
            description=item_data["description"]
        ))
        
    return result
