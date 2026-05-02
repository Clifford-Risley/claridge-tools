# draft-004-mcp-rest-colocation.md

**Status:** Draft — Sprint 07 pre-work  
**Formalized:** Sprint 09, Session 1  
**Decision area:** API architecture / MCP hosting

---

## Context

Sprint 10 Feature 1 is an MCP server allowing neighbors to connect their Claude.ai to the Claridge Farm tool inventory. The MCP client (Claude.ai / Anthropic infrastructure) needs a publicly addressable HTTP endpoint. This forced an architectural decision about where the MCP server lives and how it is exposed.

Two sub-decisions were entangled:
1. Where does the MCP server process live? (separate service vs. co-located on FastAPI)
2. How is the FastAPI backend publicly exposed? (Next.js proxy vs. direct CF route)

---

## Decision

**MCP server co-located on FastAPI at `api.crisley.net`.**

FastAPI serves both REST (neighbors via browser / React Query) and MCP (neighbors via Claude.ai). `api.crisley.net` is a real Cloudflare Tunnel route pointing directly at `api:8000`. One Access application covers both `tools.crisley.net` and `api.crisley.net`.

---

## Rationale

**Co-location over separate service:** FastAPI already owns the SQLAlchemy data layer. MCP tool handlers are effectively thin wrappers over the same queries the REST endpoints use — duplicating that in a second process adds operational overhead (fifth Docker service, second thing to deploy/monitor/restart/debug) for no architectural benefit. The Asustor N5105 has limited headroom; keeping it to four services is the right call.

**Direct CF route over Next.js proxy:** MCP clients originate from Anthropic's infrastructure, not from a neighbor's browser. They cannot route through `tools.crisley.net` and be proxied by Next.js to `api:8000` internally — the connection is external and needs a directly addressable public URL. Next.js proxy would work for browser clients but would silently break MCP entirely.

**Auth separation:** REST endpoints use Clerk JWT (validated via PyJWT + JWKS). MCP endpoints require OAuth — Claude.ai expects an OAuth server at the MCP endpoint. FastAPI will implement both auth paths in `deps.py`: Clerk JWT for REST routes, OAuth token validation for MCP routes. Auth complexity is isolated to one file; the data layer is shared.

---

## Alternatives considered

**Separate MCP container (`mcp` service in docker-compose):**  
Rejected. Would require a fifth service, a third subdomain (e.g. `mcp.crisley.net`), and duplication of SQLAlchemy queries. No meaningful isolation benefit for this workload.

**Next.js proxy only (no `api.crisley.net` CF route):**  
Rejected. Browser clients work fine with this pattern, but MCP clients cannot proxy through Next.js. Would block MCP feature entirely. Discovered during Sprint 07 pre-planning; resolved before any implementation.

**Separate OAuth service:**  
Rejected. FastAPI is capable of implementing an OAuth server. Adding a dedicated service (Keycloak, etc.) is extreme over-engineering for a feature serving a neighborhood app.

---

## Consequences

- Two public subdomains: `tools.crisley.net` and `api.crisley.net`. One CF tunnel (`crisley-nas`), one Access application covering both.
- Sprint 07 CF config includes both ingress routes. Done.
- Sprint 10 scope: MCP endpoint handlers + OAuth server on FastAPI + tool-query MCP tools + `deps.py` auth path for MCP tokens. OAuth server implementation is the hardest part; scope carefully in task brief.
- Architecture diagram (`/docs/architecture.md`, Sprint 09) must show both paths: REST (browser → Next.js → FastAPI) and MCP (Claude.ai → `api.crisley.net` → FastAPI MCP endpoints).
- ADR-002 (auth &amp; edge) should cross-reference this ADR for the CF routing rationale.

---

## Notes for Sprint 09 formalization

- Pull in actual MCP OAuth implementation notes from journey.md (Sprint 10).
- Confirm whether FastAPI's OAuth implementation used a library (e.g. `authlib`) or was hand-rolled — document the choice.
- Add observed complexity notes from Sprint 10 execution to the Consequences section.
