import sys
import os
import datetime

# Ensure the root of the project is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.database.connection import engine, Base, SessionLocal
from backend.models.schemas import (
    User,
    ResearchProject,
    ResearchPlanItem,
    ResearchSource,
    ResearchDocument,
    Keyword,
    Theme,
    Finding,
    ResearchReport
)

def main():
    print("Re-creating all tables...")
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    print("Tables created successfully!")

    # Connect and seed mock data
    db = SessionLocal()
    try:
        # Create Demo User
        demo_user = User(
            email="student@astraq.edu",
            username="student_researcher",
            password_hash="$2b$12$eImiTXuWVxfM37uY4JANjO5E.5R9aPz1zF1k2c3d4e5f6g7h8i9j0",
            auth_provider="local"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        print(f"Created user: {demo_user.username} (ID: {demo_user.id})")

        # Create Project 1 (Completed) linked to demo_user
        project1 = ResearchProject(
            user_id=demo_user.id,
            title="Healthcare SaaS Market Research",
            question="Should AstraQ target healthcare SaaS companies?",
            description="Analysis of healthcare software-as-a-service companies, regulatory landscape, compliance barriers, and software quality testing demand.",
            research_type="Market Research",
            status="Completed",
            opportunity_score=78,
            recommendation="Yes, but validate further."
        )
        db.add(project1)
        db.commit()
        db.refresh(project1)
        print(f"Created project: {project1.title} (ID: {project1.id})")

        # Plan items
        plan_items = [
            ResearchPlanItem(project_id=project1.id, category="Market size", description="Analyze total addressable market (TAM) of healthcare SaaS."),
            ResearchPlanItem(project_id=project1.id, category="Customer pain points", description="Compliance burdens, security testing, and rapid deployment challenges."),
            ResearchPlanItem(project_id=project1.id, category="Competitors", description="Analyze existing test automation players in the healthcare SaaS space."),
            ResearchPlanItem(project_id=project1.id, category="Technology trends", description="Transition to cloud, AI diagnostics tools, and EMR integrations."),
            ResearchPlanItem(project_id=project1.id, category="Buyer personas", description="Heads of Quality, CTOs, and Compliance Officers at healthcare SaaS startups."),
            ResearchPlanItem(project_id=project1.id, category="Risks", description="Heavy regulations (HIPAA, FDA rules) limiting external testing tools access.")
        ]
        db.add_all(plan_items)

        # Sources
        source_a = ResearchSource(
            project_id=project1.id,
            url="https://www.hhs.gov/hipaa/index.html",
            title="HIPAA Rules and Compliance Guidelines",
            domain="hhs.gov",
            source_type="Government website",
            credibility_score=100,
            relevance_score=92,
            status="Cleaned"
        )
        source_b = ResearchSource(
            project_id=project1.id,
            url="https://www.modernhealthcare.com/report2026",
            title="State of Healthcare SaaS 2026 Annual Report",
            domain="modernhealthcare.com",
            source_type="Research report",
            credibility_score=85,
            relevance_score=88,
            status="Cleaned"
        )
        source_c = ResearchSource(
            project_id=project1.id,
            url="https://www.securityblog.org/hipaa-basics",
            title="HIPAA Security Rule Best Practices for App Developers",
            domain="securityblog.org",
            source_type="Blog",
            credibility_score=50,
            relevance_score=68,
            status="Cleaned"
        )
        db.add_all([source_a, source_b, source_c])
        db.commit()
        db.refresh(source_a)
        db.refresh(source_b)
        db.refresh(source_c)

        # Documents
        doc_a = ResearchDocument(
            source_id=source_a.id,
            raw_text="Health Insurance Portability and Accountability Act (HIPAA) national standards are required for sensitive patient data protection. Electronic Protected Health Information (ePHI) requires specific security safeguards including access control, audits, integrity, and transmission security.",
            cleaned_text="health insurance portability accountability act hipaa national standards required sensitive patient data protection electronic protected health information ephi requires specific security safeguards access control audits integrity transmission security",
            word_count=29,
            extracted_at=datetime.datetime.utcnow()
        )
        doc_b = ResearchDocument(
            source_id=source_b.id,
            raw_text="The market size of Healthcare SaaS is growing at an annual rate of 15% from 2025 to 2030, driven by remote patient monitoring and telemedicine integrations. Compliance with HIPAA, GDPR, and SOC2 is the primary challenge faced by developers, leading to longer development cycles and high quality assurance costs.",
            cleaned_text="market size healthcare saas growing annual rate 15 2025 2030 driven remote patient monitoring telemedicine integrations compliance hipaa gdpr soc2 primary challenge faced developers leading longer development cycles high quality assurance costs",
            word_count=37,
            extracted_at=datetime.datetime.utcnow()
        )
        doc_c = ResearchDocument(
            source_id=source_c.id,
            raw_text="For app developers, securing database connections and establishing detailed access logs is crucial for HIPAA compliance. Any test automation tools used must be heavily audited and sign Business Associate Agreements (BAAs) to ensure security standards are strictly enforced.",
            cleaned_text="app developers securing database connections establishing detailed access logs crucial hipaa compliance test automation tools used heavily audited sign business associate agreements baas ensure security standards strictly enforced",
            word_count=29,
            extracted_at=datetime.datetime.utcnow()
        )
        db.add_all([doc_a, doc_b, doc_c])

        # Keywords
        kw_a = [
            Keyword(source_id=source_a.id, keyword="hipaa", score=0.85, frequency=2),
            Keyword(source_id=source_a.id, keyword="security", score=0.72, frequency=2),
            Keyword(source_id=source_a.id, keyword="compliance", score=0.65, frequency=1)
        ]
        kw_b = [
            Keyword(source_id=source_b.id, keyword="healthcare", score=0.88, frequency=2),
            Keyword(source_id=source_b.id, keyword="saas", score=0.82, frequency=2),
            Keyword(source_id=source_b.id, keyword="compliance", score=0.68, frequency=1)
        ]
        kw_c = [
            Keyword(source_id=source_c.id, keyword="hipaa", score=0.79, frequency=2),
            Keyword(source_id=source_c.id, keyword="developers", score=0.64, frequency=1),
            Keyword(source_id=source_c.id, keyword="security", score=0.58, frequency=1)
        ]
        db.add_all(kw_a + kw_b + kw_c)
        db.commit()

        # Themes
        theme1 = Theme(project_id=project1.id, name="Compliance and Security", description="Regulatory restrictions, HIPAA requirements, and secure audit logging standards.", source_count=2)
        theme2 = Theme(project_id=project1.id, name="Healthcare SaaS Growth", description="Increasing adoption of SaaS in clinics, driving the demand for rapid testing cycles.", source_count=1)
        db.add_all([theme1, theme2])
        db.commit()
        db.refresh(theme1)
        db.refresh(theme2)

        # Findings
        finding1 = Finding(
            project_id=project1.id,
            theme_id=theme1.id,
            finding_text="HIPAA regulations require strict data access controls, audit logs, and signed BAAs for any testing tools that touch protected patient data (ePHI).",
            supporting_source_count=2,
            confidence_score=90.0
        )
        finding2 = Finding(
            project_id=project1.id,
            theme_id=theme2.id,
            finding_text="Healthcare SaaS is expanding at 15% annually, but strict QA standards are delaying code releases due to manual compliance checks.",
            supporting_source_count=1,
            confidence_score=85.0
        )
        db.add_all([finding1, finding2])

        # Report
        report1 = ResearchReport(
            project_id=project1.id,
            executive_summary="The healthcare SaaS sector represents a massive and rapidly growing market ($$$). However, the barrier to entry for third-party AI-native testing tools is exceptionally high due to strict regulatory frameworks such as HIPAA, SOC2, and GDPR.",
            recommendation="Yes, but validate further. Focus first on non-clinical software providers or build a self-hosted, BAA-compliant instance to ease privacy friction.",
            risks='["Strict HIPAA compliance requirements for testing tools", "Reluctance to share source code or data due to patient privacy rules", "Existing enterprise QA workflows are heavily gatekeeped by compliance officers"]',
            open_questions='["Will target SaaS CTOs sign BAAs for cloud-based testing tools?", "What is the average length of sales cycles for compliance-sensitive SaaS vendors?", "Is self-hosting a prerequisite for clinical-grade clients?"]'
        )
        db.add(report1)

        # Project 2 (Draft)
        project2 = ResearchProject(
            title="AI Code Assistants in Finance",
            question="What is the adoption rate of GitHub Copilot in fintech companies?",
            description="Investigate developers' efficiency gains vs security concerns in financial technology companies.",
            research_type="Technology Evaluation",
            status="Draft"
        )
        db.add(project2)
        db.commit()

        print("Mock data seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    main()
