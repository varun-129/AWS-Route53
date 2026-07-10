# AWS Route53 Clone

A production-grade, full-stack clone of the AWS Route53 console UI/UX and CRUD workflows.

## Architecture Overview

This project is divided into two distinct components:
- **Frontend (`frontend/`)**: Built with **Next.js (App Router)** and **TypeScript**. It utilizes CSS Modules for modular, scoped styling that strictly replicates the AWS console design system (density, colors, layouts). It features a generic API client for backend communication and a custom-built, React Context-based authentication state.
- **Backend (`backend/`)**: Built with **FastAPI (Python)**. It provides robust RESTful endpoints with Pydantic validation for cross-field consistency. It utilizes **SQLAlchemy ORM** connected to a **SQLite** database and **Alembic** for schema migrations.

## Database Schema

The SQLite database consists of four tables exactly mirroring the Phase 0 specification:

- `users`: `id` (PK, int), `username` (string, unique), `password_hash` (string), `created_at` (datetime)
- `sessions`: `id` (PK, int), `user_id` (FK -> users.id), `token` (string, unique, indexed), `expires_at` (datetime), `created_at` (datetime)
- `hosted_zones`: `id` (PK, int), `name` (string, index), `type` (string - Public/Private), `comment` (string, nullable), `created_at` (datetime)
- `dns_records`: `id` (PK, int), `zone_id` (FK -> hosted_zones.id), `name` (string, index), `type` (string), `ttl` (int), `value` (string), `priority` (int, nullable), `weight` (int, nullable), `port` (int, nullable), `created_at` (datetime)

## API Endpoints

**Auth Endpoints:**
- `POST /api/auth/login`: Authenticate and return an HttpOnly session cookie
- `POST /api/auth/logout`: Invalidate the session
- `GET /api/auth/session`: Validate the session and return the current user profile

**Hosted Zones Endpoints:**
- `GET /api/hosted-zones`: List all zones (supports `search`, `page`, `page_size` params)
- `POST /api/hosted-zones`: Create a new hosted zone
- `GET /api/hosted-zones/{id}`: Fetch details for a specific zone
- `PUT /api/hosted-zones/{id}`: Update a hosted zone
- `DELETE /api/hosted-zones/{id}`: Delete a hosted zone

**DNS Records Endpoints:**
- `GET /api/hosted-zones/{zone_id}/records`: List records for a zone (supports `search`, `type`, `page`, `page_size`, `all`)
- `POST /api/hosted-zones/{zone_id}/records`: Create a new DNS record with dynamic validation based on type
- `GET /api/hosted-zones/{zone_id}/records/{id}`: Fetch a specific DNS record
- `PUT /api/hosted-zones/{zone_id}/records/{id}`: Update a DNS record
- `DELETE /api/hosted-zones/{zone_id}/records/{id}`: Delete a DNS record
- `DELETE /api/hosted-zones/{zone_id}/records/bulk`: Bulk delete multiple DNS records atomically

---

## Setup Instructions

Ensure you have Node.js (v18+) and Python (v3.9+) installed.

### 1. Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn sqlalchemy alembic pydantic pydantic-settings passlib bcrypt pytest httpx
   ```
4. Run database migrations to construct the SQLite schema:
   ```bash
   alembic upgrade head
   ```
5. Seed the database with the default admin user (`admin` / `admin123`):
   ```bash
   python3 seed.py
   ```
6. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 2. Start the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

### 3. Usage

- Navigate to `http://localhost:3000` in your browser.
- Log in using `admin` / `admin123`.
- Explore the application, create hosted zones, add DNS records, and use the Dark Mode toggle located in the Top Bar.

---

## Deployment

The application is prepared for deployment to standard PaaS providers (e.g., Render, Railway for the backend; Vercel for the frontend).

### Backend Deployment (e.g., Render, Railway)

The backend includes a `Dockerfile` for simple containerized deployments.

1. **Create a New Web Service** pointing to the `backend/` directory of the repository.
2. **Environment Variables Required:**
   - `FRONTEND_URL`: The production URL of your deployed Next.js app (e.g., `https://my-route53-clone.vercel.app`). This is critical for CORS.
   - `DATABASE_URL`: The connection string for your database.
3. **Database Considerations (CRITICAL):**
   - By default, the app uses SQLite (`sqlite:///./route53.db`).
   - **Warning:** On most free-tier PaaS platforms (like Render or Heroku), the local file system is ephemeral. This means the SQLite database will be wiped on every redeploy or server restart.
   - **Recommendation:** Use a persistent disk volume provided by your host, or set the `DATABASE_URL` to a managed PostgreSQL/MySQL database (e.g., `postgresql://user:pass@host:port/db`) to ensure data persistence.

### Frontend Deployment (e.g., Vercel)

The frontend is a standard Next.js application and can be seamlessly deployed to Vercel.

1. **Import Project:** Create a new project in Vercel pointing to the `frontend/` directory.
2. **Configuration:** The included `vercel.json` will automatically configure Next.js settings.
3. **Environment Variables Required:**
   - `NEXT_PUBLIC_API_URL`: Set this to your deployed backend's URL (e.g., `https://my-route53-backend.up.railway.app/api`).
4. **Deploy:** Hit deploy. Vercel will automatically build the site and provide a live URL. Make sure to feed this URL back into the backend's `FRONTEND_URL` environment variable.
