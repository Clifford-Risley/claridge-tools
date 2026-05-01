# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claridge Tools is a closed, invite-only neighborhood tool-sharing app for the Claridge Farm HOA in Carmel, IN. Neighbors catalog tools they own and search what's available to borrow. No payments, ratings, or social features.

**Status:** Backend API is functional. Frontend (Next.js), real Clerk JWT auth, and deployment are not started.

## Commands

All commands run from `api/` unless noted.

```bash
# Install deps (includes dev extras)
pip install -e ".[dev]"

# Start Postgres (from repo root)
docker compose -f docker-compose.dev.yml up db -d

# Run API server
uvicorn main:app --reload

# Run all tests
pytest

# Run a single test
pytest tests/test_tools.py::test_search_tools_by_query

# Lint
ruff check .
ruff format --check .    # add --diff to preview; omit --check to auto-fix

# Type check
mypy .

# Apply migrations
alembic upgrade head

# Seed dev data (10 users, 30 tools)
python seed.py
```

CI runs ruff, mypy, and pytest in that order on every push touching `api/**`.

## Architecture

```
api/
  main.py          # FastAPI app, router includes
  config.py        # Pydantic Settings (DATABASE_URL)
  db.py            # Async SQLAlchemy engine, Base, session factory
  deps.py          # get_current_user dependency (stub → Clerk JWT in Sprint 6)
  seed.py          # Idempotent dev seed (truncate-then-insert)
  models/          # SQLAlchemy ORM: User, Tool (one-to-many)
  schemas/         # Pydantic v2 request/response: ToolCreate, ToolUpdate, ToolRead, UserRead
  routes/          # health.py, tools.py, users.py
  alembic/         # Migrations; env.py imports models for autogenerate
  tests/           # conftest.py fixtures + test_health.py + test_tools.py
web/               # Next.js 15 (placeholder only)
infra/             # Deployment config (placeholder)
adr/               # Architectural Decision Records
```

## Key Patterns

**Auth separation:** `get_current_user` in `deps.py` resolves *who* the user is. Ownership checks (403 if `owner_id != current_user.id`) live in the route handler, not the dependency.

**PATCH updates:** Use `model.model_dump(exclude_unset=True)` so only fields actually sent by the client are written to the DB.

**Tests use no real DB:** `conftest.py` overrides `get_db` and `get_current_user` via `app.dependency_overrides`. ORM model objects are created as transient instances (no session needed). The `_mock_execute_returning` helper produces consistent mock return shapes for list endpoints.

**Async throughout:** SQLAlchemy 2 async + asyncpg. All DB calls use `await session.execute(...)`.

**Strict types:** mypy strict mode is enforced in CI. All functions must be annotated. Ruff rules include ANN (annotations), B (bugbear), UP (pyupgrade), I (isort).

**Ruff B008:** `Depends()` calls in FastAPI default args are intentional; B008 is suppressed project-wide in `pyproject.toml`.

## Configuration

Two separate `.env` files must stay in sync:
- **Repo root `.env`** — read by `docker-compose.dev.yml`: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- **`api/.env`** — read by uvicorn and alembic: `DATABASE_URL` (must match above creds)

Postgres runs on host port **5433** (not 5432) to avoid conflicts. API runs on port **8000**. Swagger UI at `http://localhost:8000/docs`.

## What's Not Here Yet

- Clerk JWT verification (middleware stub exists in `deps.py`; Sprint 6)
- Next.js frontend
- User registration endpoint (`/users/register`)
- NAS + Cloudflare Zero Trust deployment
