from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from backend.database.connection import engine, Base
from backend.routes.auth_routes import router as auth_router
from backend.routes.profile_routes import router as profile_router
from backend.routes.research_type_routes import router as research_type_router
from backend.routes.plan_routes import router as plan_router
from backend.routes.report_routes import router as report_router
from backend.routes.sync_routes import router as sync_router

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AstraQ API",
    description="Backend API for AstraQ Research Agent — Auth, Profiles, and Research.",
    version="1.0.0",
)

# CORS — allow the Vite dev server and any localhost origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(research_type_router)
app.include_router(plan_router)
app.include_router(report_router)
app.include_router(sync_router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
