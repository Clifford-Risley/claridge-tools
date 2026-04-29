# ADR-001: Stack Selection

Status: Draft

Context: Needed a backend language/framework where bugs are easiest to catch, 
Claude Code performs well, and the choice reads as current-gen to a senior reviewer.
Frontend needed to match industry default expectations for a 2026 React app.

Decision: Python 3.13 + FastAPI + SQLAlchemy 2 async + PostgreSQL 16 + Next.js 15 
+ TypeScript + Tailwind + shadcn/ui.

Rejected: TypeScript/Node backend (learning curve on the most bug-prone layer), 
SQLite (signal cost outweighs simplicity gain), Supabase (negates FastAPI value 
and undermines self-hosted objective), HTMX (interesting but wrong signal vector 
for VP positioning), untyped JS (reads as 2018 codebase).

Notes: Ruff B008 suppressed project-wide — FastAPI's Depends() pattern is a 
deliberate exception to the "no function calls in default arguments" rule. 
Discovered and resolved Sprint 4 Session 2.