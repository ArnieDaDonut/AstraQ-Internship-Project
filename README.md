# AstraResearch

**An AI Business & Technical Research Platform**

## Overview

AstraResearch is an AI powered research platform designed to make deep research, market analysis, finding resources, and publication easily ready. It is powered by Google Gemini models, AstraResearch can decompose complex research questions into structured plans, crawls primary web sources, synthesizes data, assesses risks, and generates multi-sectional research.


<img width="1499" height="856" alt="Image" src="https://github.com/user-attachments/assets/925d1c60-9fe6-4587-a556-1c89bc84e3b1" />


## Key Features

**Research Planning**: Takes high-level research questions and makes specific categories and execution plans.

<img width="1496" height="852" alt="Image" src="https://github.com/user-attachments/assets/7a9fb404-f070-4ad3-9137-64edf23a8480" />

<img width="1512" height="855" alt="Image" src="https://github.com/user-attachments/assets/e1f87b35-ddb9-4c4a-8f11-9cbccf0ea473" />


**Web Intelligence** : Crawls live search results through DuckDuckGo and deep-fetches any URLs and web articles provided by the user, then leverages Gemini with Pydantic schemas to provide highly-detailed research papers.

<img width="1512" height="852" alt="Image" src="https://github.com/user-attachments/assets/fa34d3ee-f13b-438f-8cde-c70e60c44f93" />


**Export**: Download your reports in PDF, DOCX, and HTML formats.

<img width="1512" height="856" alt="Image" src="https://github.com/user-attachments/assets/dc383239-bf15-4afa-9b2e-516af2c242c9" />

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


## AI Disclosure

AI was used in this project to:
- Research how to use Docker
- Create grounding mechanisms for Gemini
- Help implement authentication
