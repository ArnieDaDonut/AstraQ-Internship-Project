import os
import json
import re
import time
import urllib.request
import urllib.error
from typing import List, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from ddgs import DDGS

# ─── Model Configuration ─────────────────────────────────────────────────────
# Ordered by preference: best first. Falls through on 503/429 errors.
MODEL_FALLBACK_CHAIN = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.7-flash"]
PLAN_MODEL = "gemini-3.5-flash"


def get_agent_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")
    return genai.Client(api_key=api_key)


def _generate_with_retry(client, contents: str, config, max_retries: int = 3) -> object:
    """
    Call Gemini with automatic retries, thinking-level degradation, and model fallback.
    Handles 503 (high demand) by dropping thinking_config or waiting with backoff, 
    and falls through the MODEL_FALLBACK_CHAIN if needed.
    """
    last_error = None
    for model in MODEL_FALLBACK_CHAIN:
        # First attempt with original config
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=contents,
                    config=config,
                )
                print(f"[Model] Successfully generated with {model}")
                return response
            except Exception as e:
                last_error = e
                err_str = str(e)
                if "503" in err_str or "UNAVAILABLE" in err_str:
                    wait = 2 ** attempt
                    print(f"[Retry] {model} 503, waiting {wait}s (attempt {attempt+1}/{max_retries})...")
                    time.sleep(wait)
                    continue
                elif "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    print(f"[Retry] {model} rate-limited (429), waiting 10s for RPM window reset (attempt {attempt+1}/{max_retries})...")
                    time.sleep(10)
                    continue
                else:
                    raise

        # If thinking config was used and hit 503/429 across retries, try WITHOUT thinking config
        if config and hasattr(config, "thinking_config") and config.thinking_config:
            print(f"[Retry] {model} failed with thinking config. Retrying WITHOUT thinking config...")
            try:
                no_think_config = types.GenerateContentConfig(
                    response_mime_type=getattr(config, "response_mime_type", None),
                    response_schema=getattr(config, "response_schema", None),
                )
                response = client.models.generate_content(
                    model=model,
                    contents=contents,
                    config=no_think_config,
                )
                print(f"[Model] Successfully generated with {model} (no thinking)")
                return response
            except Exception as e:
                print(f"[Retry] {model} without thinking also failed: {e}")
                last_error = e

        print(f"[Retry] {model} exhausted, moving to next model...")

    # If all models failed (e.g. rate limits), sleep 8s and do one final emergency attempt on primary model
    if last_error and ("429" in str(last_error) or "RESOURCE_EXHAUSTED" in str(last_error)):
        print("[Retry] Rate limit hit on all models. Waiting 8s for RPM window to reset for final attempt...")
        time.sleep(8)
        try:
            response = client.models.generate_content(
                model=MODEL_FALLBACK_CHAIN[0],
                contents=contents,
                config=config,
            )
            print(f"[Model] Emergency retry succeeded with {MODEL_FALLBACK_CHAIN[0]}")
            return response
        except Exception as e:
            last_error = e

    raise last_error




# ─── Research Plan ────────────────────────────────────────────────────────────

class ResearchPlanItemSchema(BaseModel):
    category: str = Field(description="The short title of the research category/vector")
    description: str = Field(description="A detailed description of what to look for and validate for this category")

class ResearchPlanSchema(BaseModel):
    items: List[ResearchPlanItemSchema] = Field(description="A list of 5 or more research plan categories")

def generate_research_plan(question: str, research_type: str, master_prompt: str) -> List[dict]:
    """Generates a structured research plan using Gemini."""
    client = get_agent_client()
    full_prompt = (
        f"{master_prompt}\n\n"
        f"Research Type: {research_type}\n"
        f"Research Question: {question}\n\n"
        "Please provide exactly 5 specific, distinct categories to structure the research."
    )
    response = _generate_with_retry(
        client,
        contents=full_prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ResearchPlanSchema,
        ),
    )
    data = json.loads(response.text)
    return data.get("items", [])


# ─── Web Search (DuckDuckGo — free, no API key) ─────────────────────────────

def _search_web(query: str, max_results: int = 8) -> List[dict]:
    """
    Search the web using DuckDuckGo. Returns list of {title, url, snippet}.
    Completely free, no API key needed.
    """
    results = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(query, backend="html", max_results=max_results):
                results.append({
                    "title": r.get("title", ""),
                    "url": r.get("href", ""),
                    "snippet": r.get("body", ""),
                })
        print(f"[Search] '{query}' → {len(results)} results")
    except Exception as e:
        print(f"[Search] Failed for '{query}': {e}")
    return results


def _fetch_url_text(url: str, max_chars: int = 12000) -> str:
    """Fetch text content from a URL. Strips HTML tags."""
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (compatible; AstraQ-ResearchBot/1.0)'
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='replace')
        text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text[:max_chars]
    except Exception as e:
        return f"[Could not fetch: {e}]"


# ─── Report Schemas ──────────────────────────────────────────────────────────

class DetailedFindingSchema(BaseModel):
    title: str = Field(description="Title of the research finding")
    explanation: str = Field(description="Multi-paragraph academic explanation with data points. At least 200 words.")
    impact_score: int = Field(description="Impact score from 1 to 100")

class DetailedRiskSchema(BaseModel):
    category: str = Field(description="Category: Technical, Regulatory, Financial, or Execution")
    risk_title: str = Field(description="Title of the risk factor")
    description: str = Field(description="Comprehensive explanation with mitigation strategies. At least 150 words.")
    severity: str = Field(description="Severity level: High, Medium, or Low")

class PhasedRoadmapSchema(BaseModel):
    phase: str = Field(description="Phase name e.g. Phase 1: Foundation & Validation (0-3 Months)")
    objective: str = Field(description="Primary strategic objective")
    key_actions: List[str] = Field(description="5-6 specific actionable steps")

class ReferenceSchema(BaseModel):
    title: str = Field(description="Descriptive title of the reference")
    url: str = Field(description="Real URL from the research material. NEVER fabricate URLs.")

class FinalReportSchema(BaseModel):
    title: str = Field(description="Formal research paper title")
    subtitle: str = Field(description="Descriptive academic subtitle")
    abstract: str = Field(description="Executive abstract: problem, methodology, findings, conclusion. Minimum 300 words across multiple paragraphs.")
    introduction: str = Field(description="Deep background, industry landscape, market drivers, problem statement with statistics. Minimum 600 words across multiple paragraphs.")
    market_and_technical_analysis: str = Field(description="Strategic methodology, technical evaluation, competitive landscape, quantitative market data. Minimum 800 words across multiple paragraphs.")
    key_findings: List[DetailedFindingSchema] = Field(description="5-6 evidence-backed findings with 200+ word explanations each.")
    risk_assessment: List[DetailedRiskSchema] = Field(description="5-6 risks across Technical, Regulatory, Financial, Execution categories.")
    phased_roadmap: List[PhasedRoadmapSchema] = Field(description="3-phase roadmap with 5-6 actions per phase.")
    conclusion: str = Field(description="Strategic synthesis, recommendations, future outlook. Minimum 400 words.")
    references: List[ReferenceSchema] = Field(description="6-10 references. ONLY use real URLs from the research material. NEVER fabricate.")


# ─── Pass 1: Web Research ────────────────────────────────────────────────────

def _pass1_research(question: str, research_type: str, context_links: list, context_file_contents: list) -> tuple:
    """
    Pass 1: Search the web + fetch URL content to build a comprehensive research dossier.
    Returns (research_dossier_text, all_source_urls).
    No AI call needed — this is pure data gathering.
    """
    all_sources = []  # List of {title, url, content}
    all_urls = []     # List of {title, url} for the references

    # ── Step 1: Fetch user-provided URLs ──
    for link in context_links:
        link = link.strip()
        if not link:
            continue
        print(f"[Pass 1] Fetching user URL: {link}")
        content = _fetch_url_text(link)
        domain = link.split('/')[2] if len(link.split('/')) > 2 else link
        all_sources.append({"title": f"User-provided: {domain}", "url": link, "content": content})
        all_urls.append({"title": f"User-provided: {domain}", "url": link})

    # ── Step 2: Search the web from multiple angles ──
    search_queries = [
        f"{question} market size statistics {research_type}",
        f"{question} top companies competitors",
        f"{question} challenges risks regulations",
        f"{question} recent developments trends 2024 2025",
    ]

    seen_urls = set(link.strip() for link in context_links if link.strip())
    for query in search_queries:
        results = _search_web(query, max_results=5)
        for r in results:
            url = r["url"]
            if url in seen_urls:
                continue
            seen_urls.add(url)
            all_urls.append({"title": r["title"], "url": url})
            all_sources.append({"title": r["title"], "url": url, "content": r["snippet"]})

    # ── Step 3: Fetch full content from top search results ──
    # Fetch the top 5 most promising URLs for deeper content
    urls_to_fetch = [s for s in all_sources if len(s["content"]) < 500 and s["url"].startswith("http")][:5]
    for source in urls_to_fetch:
        print(f"[Pass 1] Deep-fetching: {source['url']}")
        full_content = _fetch_url_text(source["url"], max_chars=8000)
        if not full_content.startswith("[Could not"):
            source["content"] = full_content

    # ── Step 4: Include uploaded documents ──
    if context_file_contents:
        for i, content in enumerate(context_file_contents):
            all_sources.append({
                "title": f"Uploaded Document {i+1}",
                "url": "user-upload",
                "content": content[:8000]
            })

    # ── Build the research dossier ──
    dossier_parts = []
    for i, src in enumerate(all_sources):
        dossier_parts.append(
            f"══ SOURCE {i+1}: {src['title']} ══\n"
            f"URL: {src['url']}\n"
            f"Content:\n{src['content'][:6000]}\n"
        )

    research_dossier = "\n\n".join(dossier_parts)
    print(f"[Pass 1] Complete: {len(all_sources)} sources, {len(research_dossier)} chars of research material")

    return research_dossier, all_urls


# ─── Pass 2: AI Report Generation ────────────────────────────────────────────

def _pass2_report(client, question: str, research_type: str, preferences: str, research_dossier: str, all_urls: list) -> dict:
    """Pass 2: Generate the structured report from research dossier using Gemini."""

    # Build numbered URL reference list
    url_list = "\n".join([f"  {i+1}. [{ref['title']}] {ref['url']}" for i, ref in enumerate(all_urls)])
    if not url_list:
        url_list = "  (No sources found)"

    report_prompt = f"""You are an elite research analyst writing a formal, publication-grade Research Whitepaper.
You have been given a comprehensive research dossier containing real data gathered from web sources.

RESEARCH TYPE: {research_type}
TOPIC: {question}
USER PREFERENCES: {preferences}

════════════════════════════════════════════════════════════
RESEARCH DOSSIER (real data from web sources):
════════════════════════════════════════════════════════════
{research_dossier}

════════════════════════════════════════════════════════════
VERIFIED SOURCE URLS (use ONLY these for references):
════════════════════════════════════════════════════════════
{url_list}

════════════════════════════════════════════════════════════
CRITICAL REQUIREMENTS:
════════════════════════════════════════════════════════════

SECTION LENGTH MINIMUMS (write MORE than these):
• abstract: 300+ words across multiple paragraphs
• introduction: 600+ words. Rich context, history, market drivers, statistics from the dossier
• market_and_technical_analysis: 800+ words. Competitive analysis, market sizing, technical evaluation
• Each key_finding explanation: 200+ words per finding with specific data
• Each risk description: 150+ words per risk with mitigation strategies
• conclusion: 400+ words. Strategic synthesis and forward outlook

STRUCTURE:
• key_findings: Exactly 5-6 findings with multi-paragraph explanations
• risk_assessment: Exactly 5-6 risks (Technical, Regulatory, Financial, Execution)
• phased_roadmap: 3 phases with 5-6 action items each
• references: 6-10 references. ONLY use URLs from the VERIFIED SOURCE URLS list above. NEVER invent URLs.

QUALITY:
• Extract and cite specific numbers from the dossier: dollar amounts, %, CAGRs, user counts
• Write in formal academic/consulting tone for C-suite executives
• Each section should read like a McKinsey or BCG whitepaper
• Dense, analytical paragraphs — no filler or fluff
"""

    response = _generate_with_retry(
        client,
        contents=report_prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=FinalReportSchema,
            thinking_config=types.ThinkingConfig(
                thinking_budget=4096
            ),
        ),
    )

    data = json.loads(response.text)
    return data


# ─── Main Entry Point ────────────────────────────────────────────────────────

def generate_final_report(question: str, research_type: str, preferences: str, context_links: list = [], context_file_contents: list = []) -> dict:
    """
    Generates a comprehensive research whitepaper:
      Pass 1: DuckDuckGo web search + URL content fetching (no AI needed)
      Pass 2: Gemini report generation with thinking enabled
    """
    client = get_agent_client()

    # ── Pass 1: Gather real research data ──
    print(f"[Report] ═══ Pass 1: Web Research ═══")
    print(f"[Report] Topic: {question} | Type: {research_type}")
    print(f"[Report] User links: {len(context_links)}, Files: {len(context_file_contents)}")

    research_dossier, all_urls = _pass1_research(
        question, research_type, context_links, context_file_contents
    )

    # ── Pass 2: Generate report ──
    print(f"[Report] ═══ Pass 2: AI Report Generation ═══")
    report_data = _pass2_report(
        client, question, research_type, preferences, research_dossier, all_urls
    )

    print(f"[Report] ═══ Complete ═══")
    print(f"[Report] Title: {report_data.get('title', 'N/A')}")
    print(f"[Report] References: {len(report_data.get('references', []))}")

    return report_data
