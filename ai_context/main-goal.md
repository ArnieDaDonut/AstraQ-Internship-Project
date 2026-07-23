# Main Goal

The primary objective of the AstraQ Internship Project is to build a full-stack application that leverages advanced AI or algorithmic capabilities. 

## High-Level Architecture
1. **Frontend**: A modern web interface built with React/TypeScript and bundled with Vite.
2. **Backend**: A robust API (likely Python-based, given the `venv` directory) structured with dedicated modules for `algorithms`, `database`, `models`, `routes`, and `services`.
3. **Infrastructure**: Containerized using Docker Compose, orchestrating:
   - **PostgreSQL**: Relational database for persistent storage (`astraq_db`).
   - **MinIO**: S3-compatible object storage for handling assets and larger files.

## Project Scope
- Set up a reliable and reproducible local development environment using Docker.
- Develop core backend services, routes, and models to handle application logic.
- Integrate specialized algorithms or research agent capabilities (as hinted by `astraq-research-agent.zip` and `research_agent.db`).
- Create an intuitive frontend interface to interact with the backend services.

## Current State
- The foundational repository structure is in place (`frontend/`, `backend/`, and docker configurations).
- Local infrastructure is defined via `dockercompose.yml` (Postgres and MinIO).
- Work is underway to ensure all dependencies (like Docker Desktop) are correctly installed and configured to run the project.
