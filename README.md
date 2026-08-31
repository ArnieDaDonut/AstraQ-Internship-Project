# AstraResearch

**An AI Business & Technical Research Platform**

## Overview

AstraResearch is an AI powered research platform designed to make deep research, market analysis, finding resources, and publication easily ready. It is powered by Google Gemini models, AstraResearch can decompose complex research questions into structured plans, crawls primary web sources, synthesizes data, assesses risks, and generates multi-sectional research.



## Key Features

**Research Planning**: Takes high-level research questions and makes specific categories and execution plans.

**Web Intelligence** : Crawls live search results through DuckDuckGo and deep-fetches any URLs and web articles provided by the user, then leverages Gemini with Pydantic schemas to provide highly-detailed research papers.

**Export**: Download your reports in PDF, DOCX, and HTML formats.

**Authentication**: Secure JWT authentication, password hashing, and user-isolated workspaces.

**Data Stack**: PostgreSQL with pgvector extension for semantic search, with MinIO object storage for avatars and PDFs provided.

## Tech Stack

**Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS, Motion, Lucide Icons, jsPDF

**Backend**: FastAPI, Python 3.11+, SQLAlchemy 2.0, Pydantic v@, Uvicorn, Python-Jose (JWT)

**AI Search**: Google GenAI SDK, Gemini 3.5/3.6/3.7, DuckDuckGo

**Databases/Storage**: PostgreSQL 15 (pgvector), MinIO Object Storage

**Deployment**: Docker, Docker Compose, Vercel, Render


## How to Launch

### Prerequisites

- Docker & Docker Compose
- Node.js (v18+)
- Python (v3.10+)
- Google Gemini API Key

### How to start:

1. Clone the repository
git clone https://github.com/ArnieDaDonut/AstraQ-Internship-Project.git
cd AstraQ-Internship-Project

2. Configure your own environment variables for:

Postgres User
Postgres Password
Postgres DB
Minio User
Minio Password
Gemini API Key


3. Start all services

docker-compose up --build


4. Access the application through localhost!