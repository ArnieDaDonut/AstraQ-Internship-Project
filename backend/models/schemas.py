import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # Null for OAuth-only users
    auth_provider = Column(String(50), default="local")  # "local" or "google"
    google_id = Column(String(255), unique=True, nullable=True)
    profile_picture_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Link user to their research projects (one user has many projects)
    projects = relationship("ResearchProject", back_populates="user", cascade="all, delete-orphan")


class ResearchProject(Base):
    __tablename__ = "research_projects"

    id = Column(Integer, primary_key=True, index=True)
    # Foreign key linking project to owner user
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title = Column(String, nullable=False)
    question = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    research_type = Column(String, nullable=False)
    status = Column(String, default="Draft") # Draft, Planning, Sources Added, Analysis In Progress, Report Ready, Completed
    opportunity_score = Column(Integer, nullable=True)
    recommendation = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationship back to User
    user = relationship("User", back_populates="projects")

    plan_items = relationship("ResearchPlanItem", back_populates="project", cascade="all, delete-orphan")
    sources = relationship("ResearchSource", back_populates="project", cascade="all, delete-orphan")
    themes = relationship("Theme", back_populates="project", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="project", cascade="all, delete-orphan")
    reports = relationship("ResearchReport", back_populates="project", cascade="all, delete-orphan")


class ResearchPlanItem(Base):
    __tablename__ = "research_plan_items"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=True)


    project = relationship("ResearchProject", back_populates="plan_items")


class ResearchSource(Base):
    __tablename__ = "research_sources"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False)
    url = Column(String, nullable=False)
    title = Column(String, nullable=True)
    domain = Column(String, nullable=True)
    source_type = Column(String, nullable=True)
    credibility_score = Column(Integer, nullable=True)
    relevance_score = Column(Integer, nullable=True)
    status = Column(String, default="Pending")


    project = relationship("ResearchProject", back_populates="sources")
    document = relationship("ResearchDocument", back_populates="source", uselist=False, cascade="all, delete-orphan")
    keywords = relationship("Keyword", back_populates="source", cascade="all, delete-orphan")


class ResearchDocument(Base):
    __tablename__ = "research_documents"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("research_sources.id", ondelete="CASCADE"), nullable=False, unique=True)
    raw_text = Column(Text, nullable=False)
    cleaned_text = Column(Text, nullable=False)
    word_count = Column(Integer, nullable=False)
    extracted_at = Column(DateTime, default=datetime.datetime.utcnow)


    source = relationship("ResearchSource", back_populates="document")


class Keyword(Base):
    __tablename__ = "keywords"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("research_sources.id", ondelete="CASCADE"), nullable=False)
    keyword = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    frequency = Column(Integer, nullable=False)


    source = relationship("ResearchSource", back_populates="keywords")


class Theme(Base):
    __tablename__ = "themes"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    source_count = Column(Integer, default=0)


    project = relationship("ResearchProject", back_populates="themes")
    findings = relationship("Finding", back_populates="theme")


class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False)
    theme_id = Column(Integer, ForeignKey("themes.id", ondelete="SET NULL"), nullable=True)
    finding_text = Column(Text, nullable=False)
    supporting_source_count = Column(Integer, default=0)
    confidence_score = Column(Float, nullable=True)


    project = relationship("ResearchProject", back_populates="findings")
    theme = relationship("Theme", back_populates="findings")


class ResearchReport(Base):
    __tablename__ = "research_reports"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False)
    executive_summary = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    risks = Column(Text, nullable=True)
    open_questions = Column(Text, nullable=True)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)


    project = relationship("ResearchProject", back_populates="reports")
