import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Use PostgreSQL via Docker; fall back to SQLite for quick local testing
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://astraq:password@localhost:5432/astraq_db"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency helper to yield active DB sessions and clean them up after use."""
    db = SessionLocal()
    try:    
        yield db
    finally:
        db.close()
