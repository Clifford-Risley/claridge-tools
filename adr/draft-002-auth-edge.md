# ADR-002: Auth and Edge

Status: Draft

Context: Needed auth that ships invite-only + magic links out of the box, 
is boring enough to not distract from the app, and free at HOA scale (<50 MAU).
Edge layer needed to front both the public and private apps independently.

Decision: Clerk for auth (JWKS validation in FastAPI), Cloudflare Zero Trust 
two-layer (Access + Clerk) for defense in depth. One tunnel fronts both the 
neighborhood tool app (and future public items and a separate private family apps independently.

Rejected: Auth.js (signals senior-eng-built-from-primitives, wrong signal), 
self-hosted Authentik (ops burden too high for real users), removing CF Access 
because "Clerk is enough" (defense in depth is deliberate, ZT also fronts private apps).