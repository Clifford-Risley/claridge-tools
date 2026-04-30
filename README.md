# Claridge Tools

> **Living document.** This project is early and actively changing. Things described here may not exist yet.

A neighborhood tool-sharing app for the Claridge Farm HOA community in Carmel, IN. Members can list tools they own — drills, tile saws, ladders, pressure washers — and search what neighbors have available to borrow. The goal is to reduce duplicate purchases, get more use out of equipment that sits in a garage 98% of the year, and give neighbors a low-friction reason to talk to each other. It's not trying to be a marketplace; there's no payment, no ratings, no social feed. Just "who has a drain snake I can borrow Saturday."

---

## Target users

- Homeowners in the Claridge Farm HOA who already know their neighbors or are willing to
- People comfortable borrowing and returning things without a formal contract
- Not the general public — this is intentionally a closed, invite-only community app

---

## Architecture (rough sketch)

```
  Browser / Mobile
       │
       │  HTTPS via Cloudflare Zero Trust tunnel
       ▼
  ┌─────────────┐
  │  Next.js 15 │  ← not built yet
  │  (frontend) │
  └──────┬──────┘
         │  REST / JSON
         ▼
  ┌─────────────┐
  │  FastAPI    │
  │  (backend)  │
  └──────┬──────┘
         │  asyncpg
         ▼
  ┌─────────────┐
  │  PostgreSQL │
  │  16         │
  └─────────────┘

  Auth: Clerk (JWT verification in FastAPI middleware — not wired yet)
  Hosting: Asustor NAS, Docker Compose, Cloudflare Zero Trust for external access
```

---

## Stack

| Layer    | Technology                                | Status      |
|----------|-------------------------------------------|-------------|
| Backend  | Python 3.13, FastAPI, SQLAlchemy 2 async  | Done        |
| Database | PostgreSQL 16                             | Done        |
| Frontend | Next.js 15                                | Not started |
| Auth     | Clerk                                     | Not started |
| Hosting  | Asustor NAS + Cloudflare Zero Trust       | Not started |

---

## Local dev quickstart (API only)

### Prerequisites

- Docker Desktop
- Python 3.13
- A `.env` file in the repo root (see `api/.env.example`)

### 1. Copy the example env file

```bash
cp api/.env.example .env
```

Edit `.env` and set real values for `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`. The defaults in the example file work fine for local dev.

> **Note:** There are two env files. `.env` (repo root) is read by Docker Compose. `api/.env` is read by the Python app when running `uvicorn` or `alembic` directly on the host. If you change the database credentials, update both files — `DATABASE_URL` in `api/.env` must match `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` in `.env`.

### 2. Start the database

```bash
docker compose -f docker-compose.dev.yml up db -d
```

This starts only the Postgres container on host port **5433** (to avoid conflicts with any existing local Postgres on 5432). Data is persisted in a named Docker volume.

### 3. Install Python dependencies

```bash
cd api
pip install -e ".[dev]"
```

### 4. Run the API

```bash
cd api
uvicorn main:app --reload
```

The API is now running at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 5. Verify it's working

```bash
curl http://localhost:8000/health
# {"status":"ok"}

curl http://localhost:8000/health/db
# {"status":"ok"}  ← only if the db container is running
```

### Run the test suite

```bash
cd api
pytest
```

---

## Project layout

```
claridge-tools/
├── api/                  # FastAPI backend
│   ├── main.py
│   ├── config.py
│   ├── db.py
│   ├── models/
│   ├── routes/
│   └── tests/
├── web/                  # Next.js frontend (not started)
├── infra/                # Deployment config (not started)
├── docs/                 # ADRs and notes
└── docker-compose.dev.yml
```

---

## What's not here yet

- Frontend (Next.js)
- Clerk auth integration
- Any actual data models (tools, users, borrowing requests)
- Alembic migrations
- Deployment to the NAS
- Any form of admin or moderation tooling
