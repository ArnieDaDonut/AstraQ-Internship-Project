import os
from typing import List
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

class ResearchPlanItemSchema(BaseModel):
    category: str = Field(description="The short title of the research category/vector")
    description: str = Field(description="A detailed description of what to look for and validate for this category")

class ResearchPlanSchema(BaseModel):
    items: List[ResearchPlanItemSchema] = Field(description="A list of 5 or more research plan categories")

def get_agent_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set. Please set it to use the AI Research Agent.")
    return genai.Client(api_key=api_key)

def generate_research_plan(question: str, research_type: str, master_prompt: str) -> List[dict]:
    """
    Generates a structured research plan using Gemini.
    """
    client = get_agent_client()
    
    # Construct the full prompt
    full_prompt = (
        f"{master_prompt}\n\n"
        f"Research Type: {research_type}\n"
        f"Research Question: {question}\n\n"
        "Please provide exactly 5 specific, distinct categories to structure the research."
    )
    
    response = client.models.generate_content(
        model='gemini-flash-latest',
        contents=full_prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ResearchPlanSchema,
        ),
    )
    
    # The response.text will be a JSON string that matches ResearchPlanSchema
    # We parse it back to a python dict
    import json
    data = json.loads(response.text)
    return data.get("items", [])


class DetailedFindingSchema(BaseModel):
    title: str = Field(description="Title of the research finding")
    explanation: str = Field(description="Detailed academic explanation and empirical evidence")
    impact_score: int = Field(description="Impact score from 1 to 100")

class DetailedRiskSchema(BaseModel):
    category: str = Field(description="Category of risk e.g., Technical, Regulatory, Financial, Execution")
    risk_title: str = Field(description="Title of the risk factor")
    description: str = Field(description="Comprehensive explanation of the risk and mitigation strategy")
    severity: str = Field(description="Severity level: High, Medium, Low")

class PhasedRoadmapSchema(BaseModel):
    phase: str = Field(description="Phase name e.g. Phase 1: Feasibility & Foundation (0-3 Months)")
    objective: str = Field(description="Primary strategic objective for this phase")
    key_actions: List[str] = Field(description="List of specific execution steps for this phase")

class FinalReportSchema(BaseModel):
    title: str = Field(description="A formal research paper title for the study")
    subtitle: str = Field(description="A descriptive academic subtitle")
    abstract: str = Field(description="A formal executive abstract summarizing the problem, analysis, and strategic conclusion.")
    introduction: str = Field(description="In-depth background, market context, current industry state, and core problem statement.")
    market_and_technical_analysis: str = Field(description="Extensive strategic methodology, technical architecture evaluation, and market dynamics analysis.")
    key_findings: List[DetailedFindingSchema] = Field(description="A list of 3-5 structured, evidence-backed findings.")
    risk_assessment: List[DetailedRiskSchema] = Field(description="Categorized risk assessment (Technical, Regulatory, Financial, Execution).")
    phased_roadmap: List[PhasedRoadmapSchema] = Field(description="A 3-phase strategic implementation roadmap.")
    conclusion: str = Field(description="Academic conclusion and final strategic synthesis.")
    references: List[str] = Field(description="List of cited academic/industry standards or references.")

def generate_final_report(question: str, research_type: str, preferences: str, context_links: list = [], context_file_contents: list = []) -> dict:
    """
    Generates a formal, highly detailed research paper using Gemini based on user preferences.
    """
    client = get_agent_client()
    
    context_section = ""
    if context_links:
        context_section += "\n\nUSER-PROVIDED CONTEXT LINKS (treat as authoritative source material for your analysis):\n"
        for link in context_links:
            context_section += f"  - {link}\n"
    if context_file_contents:
        context_section += "\n\nUSER-PROVIDED DOCUMENT CONTENT (extract key facts and reference them explicitly in the report):\n"
        for i, content in enumerate(context_file_contents):
            context_section += f"\n--- Document {i+1} ---\n{content[:5000]}\n"

    full_prompt = (
        f"You are an elite Principal AI Researcher and Senior Business Analyst writing a formal, publication-grade Research Whitepaper.\n\n"
        f"RESEARCH TYPE: {research_type}\n"
        f"PRIMARY QUESTION / TOPIC: {question}\n\n"
        f"USER CUSTOM FORMATTING & STRUCTURAL PREFERENCES:\n{preferences}\n"
        f"{context_section}\n"
        "DIRECTIVES:\n"
        "1. Produce highly detailed, comprehensive, academic-grade prose for every section. Go into extreme depth and detail (minimum 3-4 paragraphs per main section). Do NOT write short summaries.\n"
        "2. Structure the introduction, market & technical analysis, and conclusion into clear, rigorous, multi-paragraph text.\n"
        "3. Include concrete metrics, strategic frameworks, risk classifications, and actionable execution roadmaps.\n"
        "4. **CRITICAL**: Do NOT just rely on the user-provided context. You MUST actively supplement the report with your own vast knowledge base. Introduce your own real-world data points, external facts, and external references.\n"
        "5. In the `references` array, you MUST list BOTH the user-provided links AND at least 3-5 of your own independent real-world references (e.g., industry reports, academic papers, books, news sources) that you used to enrich the report.\n"
        "6. Strictly format the output to match the requested JSON schema."
    )
    
    response = client.models.generate_content(
        model='gemini-flash-latest',
        contents=full_prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=FinalReportSchema,
        ),
    )
    
    import json
    data = json.loads(response.text)
    return data
