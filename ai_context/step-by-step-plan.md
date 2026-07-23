# Step-by-Step Plan

This document outlines the sequential steps required to build and deploy the AstraQ Internship Project.

## Phase 1: Environment Setup & Infrastructure
- [x] Initialize project repository with `frontend` and `backend` directories.
- [x] Define infrastructure in `docker-compose.yml` (PostgreSQL and MinIO).
- [x] Resolve local environment issues (e.g., ensuring Docker Desktop is installed and `docker`/`docker-compose` commands are available).
- [x] Add health checks to Postgres and MinIO services.
- [x] Add `createbuckets` init container to auto-create MinIO `profile-pictures` bucket.
- [ ] Successfully spin up the Docker containers (`docker compose up -d`).
- [ ] Verify connections to PostgreSQL (port 5432) and MinIO (ports 9000/9001).

## Phase 2: Backend Development
- [x] Create `requirements.txt` with FastAPI, SQLAlchemy, bcrypt, python-jose, minio, etc.
- [x] Switch database connection from SQLite to PostgreSQL (`backend/database/connection.py`).
- [x] Add `User` model to `backend/models/schemas.py` (email, username, password_hash, profile_picture_url).
- [x] Create `backend/services/auth_service.py` — bcrypt password hashing, JWT token creation/validation.
- [x] Create `backend/services/minio_service.py` — profile picture upload/retrieval with presigned URLs.
- [x] Create `backend/routes/auth_routes.py` — `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.
- [x] Create `backend/routes/profile_routes.py` — `/api/profile/picture` (upload and get).
- [x] Create `backend/main.py` — FastAPI app with CORS, router mounting, and table creation on startup.
- [ ] Install Python dependencies (`pip install -r backend/requirements.txt`).
- [ ] Implement and integrate any specific algorithms (`backend/algorithms`).
- [ ] Create additional API endpoints (`backend/routes`) for research features.
- [ ] Write unit and integration tests (`backend/tests`).

## Phase 3: Frontend Development
- [x] Initialize the Vite + TypeScript frontend application.
- [x] Create `AuthContext` with login/register/logout functions and JWT management.
- [x] Create `LoginPage` with sign-in/sign-up toggle, form validation, and error handling.
- [x] Create `ProfilePictureUpload` component with click-to-upload and instant preview.
- [x] Add auth gate to `App.tsx` — shows LoginPage when not authenticated.
- [x] Add profile avatar + sign-out button in the app header.
- [x] Configure Vite proxy to forward `/api` requests to the FastAPI backend.
- [ ] Add Google OAuth sign-in (deferred).
- [ ] Integrate frontend with additional backend API endpoints.
- [ ] Implement state management and handle loading/error states for research features.

## Phase 4: Integration & Testing
- [ ] Perform end-to-end testing of the complete application flow.
- [ ] Refine the UI/UX based on feedback.
- [ ] Optimize backend queries and algorithm performance.
- [ ] Ensure seamless file handling with MinIO.

## Phase 5: Deployment
- [ ] Prepare Dockerfiles for the `frontend` and `backend` services.
- [ ] Update `docker-compose.yml` (or create a production version) to include the app services.
- [ ] Deploy the application to a staging/production environment.
- [ ] Finalize documentation and handover.
