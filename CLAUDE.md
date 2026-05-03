# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claridge Tools is a closed, invite-only neighborhood tool-sharing app for the Claridge Farm HOA in Carmel, IN. Neighbors catalog tools they own and search what's available to borrow. No payments, ratings, or social features.

**Status:** Backend API functional and tested. Frontend (Next.js 16) scaffolded and wired to FastAPI via React Query. Clerk auth integrated end-to-end. Production deployment in progress (Sprint 07).

## Shell Environment

**Use PowerShell 7 (PS7) for all shell commands. Do not attempt bash.** This repo is developed on Windows with PS7 as the primary terminal. Claude Code must not fall back to bash.

Before running any task that requires `gh`, verify it is on PATH:
```powershell
Get-Command gh
```
If missing, resolve before proceeding with gh-dependent steps.

After completing any task, confirm CI is passing:
```powershell
gh run list --limit 3
```
Report the result before closing the task.

## Commands

All commands run from `api/` unless noted.

```powershell
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

CI runs ruff, ruff format, mypy, and pytest in that order on every push touching `api/**`. The `api-ci` sentinel job gates branch protection; frontend-only PRs are not blocked by pytest.

## Architecture

```
api/
  main.py          # FastAPI app, router includes, CORS config
  config.py        # Pydantic Settings (DATABASE_URL, admin_clerk_user_id, Clerk keys)
  db.py            # Async SQLAlchemy engine, Base, session factory
  deps.py          # get_current_user: PyJWT RS256 JWKS verification, 5min cache
  seed.py          # Idempotent dev seed (truncate-then-insert, 10 users / 30 tools)
  models/          # SQLAlchemy ORM: User, Tool (one-to-many)
  schemas/         # Pydantic v2 request/response schemas
  routes/
    health.py      # GET /health, GET /health/db
    tools.py       # CRUD with ownership checks
    users.py       # GET /users/me, PATCH /users/me
    admin.py       # Admin-only: invite, delete user, list all tools/users
    webhooks.py    # POST /webhooks/clerk (svix-signed, handles user.created)
  alembic/         # Migrations; env.py imports models for autogenerate
  tests/
    conftest.py          # Fixtures, dependency overrides
    test_health.py
    test_tools.py
    test_admin.py
    test_deps.py
    test_webhooks.py
web/
  src/
    app/           # Next.js 16 App Router pages and layouts
    components/    # shadcn/ui components, React Query providers
    lib/           # API client (api.ts), React Query hooks
  proxy.ts         # Clerk middleware (project-level filename, not a Next.js convention)
infra/             # cloudflared config (in progress Sprint 07)
adr/               # Three draft ADRs: stack, auth+edge, hosting
docs/              # Architecture, operations, retrospective (Sprint 09)
```

## Key Patterns

**Auth separation:** `deps.py` resolves *who* the user is (returns `User` or 401). Ownership checks (403 if `owner_id != current_user.id`) and admin checks (403 if not admin) live in route handlers, never in `deps.py`. `deps.py` never returns 403.

**Admin check:** `routes/admin.py` checks `current_user.clerk_id == settings.admin_clerk_user_id`. Env var pattern — intentional for single-admin phase. Do not refactor to metadata-role without explicit instruction.

**User provisioning:** `POST /admin/invite` sends the Clerk-side invitation. The local `User` row is created by the webhook handler (`POST /webhooks/clerk`) when Clerk fires `user.created` after the invited user signs up. Do not create local rows in the invite route.

**PATCH updates:** Use `model.model_dump(exclude_unset=True)` so only fields sent by the client are written to DB.

**Tests use no real DB:** `conftest.py` overrides `get_db` and `get_current_user` via `app.dependency_overrides`. ORM objects are transient instances (no session needed). `_mock_execute_returning` produces consistent mock return shapes for list endpoints.

**Async throughout:** SQLAlchemy 2 async + asyncpg. All DB calls use `await session.execute(...)`.

**Strict types:** mypy strict enforced in CI. All functions annotated. Ruff rules: ANN, B, UP, I. Ruff B008 suppressed project-wide (`pyproject.toml`) — `Depends()` in FastAPI default args is intentional.

**Next.js 16:** Has breaking changes from 15. Consult `node_modules/next/dist/docs/` before writing Next-specific code. Do not rely on training-data conventions. Middleware file is `proxy.ts` (project-level choice).

**React Query:** Owns all server state in the frontend. Do not reach for `useState` to store API responses.

**Server vs Client Components:** Push `"use client"` as far down the component tree as possible. FastAPI calls and Clerk auth checks live in server components or React Query hooks, not in client components.

## Configuration

Two separate `.env` files must stay in sync:
- **Repo root `.env`** — read by `docker-compose.dev.yml`: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- **`api/.env`** — read by uvicorn and alembic: `DATABASE_URL`, `CLERK_JWKS_URL`, `CLERK_ISSUER`, `CLERK_SECRET_KEY`, `ADMIN_CLERK_USER_ID`, `CLERK_WEBHOOK_SECRET`

Postgres runs on host port **5433** (not 5432). API on port **8000**. Swagger UI at `http://localhost:8000/docs`.

Claude Code reads `.env` files during task execution to check variable names — expected behavior. Ensure values do not echo into committed files or logs.

## What's In Progress

- **Sprint 07 Sessions 2–5:** `cloudflared` Docker service, `cloudflared/config.yml` (ingress: tools → web:3000, api → api:8000), Cloudflare Zero Trust Access app covering both subdomains, Playwright e2e hardening against deployed environment.
- **Branch state:** Working on `feature/edit-profile-modal`. `main` is behind Sprint 06–07 feature branches. Do not assume `main` reflects current state.
- **Clerk webhook end-to-end:** Handler implemented and tested; live wiring (Clerk dashboard → public endpoint) deferred to Sprint 08 Session 1 after cloudflared is live.
