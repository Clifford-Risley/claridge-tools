# ADR-003: Hosting Topology

Status: Draft

Context: Needed a hosting decision that serves the app reliably while compounding 
with the broader home lab plans. Self-hosted reinforces the story; cloud hosting 
would contradict it.

Decision: Asustor AS5402T NAS, Docker Compose, Cloudflare Tunnel. No router port 
forwarding. RAID 1 for data volume. NVMe for Postgres performance.

Rejected: Fly/Vercel/Railway (correct for portfolio signal alone, loses home lab 
compounding story), main PC hosting (GPU box stays GPU box), cloud DB (negates 
self-hosted objective).