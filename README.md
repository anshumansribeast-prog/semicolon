# Semicolon — Learn to code from zero

A free, plain-English introduction to programming, with Ada and a new Personal OS control plane.

## Personal OS

Semicolon now includes a real **AnshuX Personal OS** foundation that sits beside the existing Ada server instead of replacing it. It provides:

- AnshuX personal-assistant registry entry
- Ada and Beast first-class agent entries
- specialist agent registry
- SQLite-backed graphical memory nodes and relationships
- task queue with approval state
- auditable agent events
- explicit permission vocabulary
- authenticated Personal OS API
- responsive command-center UI

### Run it

Set the existing Ada variables plus a strong server-side `SEMICOLON_ADMIN_TOKEN`, then start:

```bash
python personal_server.py
```

Open:

```text
http://127.0.0.1:8420/pages/personal-os.html
```

The dashboard asks for the admin token and keeps it only for the browser session. The token is never written into source code or the Personal OS database.

### Personal OS API

```text
GET  /api/personal/health
GET  /api/personal/overview
GET  /api/personal/graph
POST /api/personal/memory
POST /api/personal/relation
POST /api/personal/task
POST /api/personal/event
```

All Personal OS data endpoints require `Authorization: Bearer <SEMICOLON_ADMIN_TOKEN>`. The health endpoint is intentionally public and contains no private data.

### Architecture

```text
User
  ↓
AnshuX Personal Assistant
  ↓
Agent Registry → Ada / Beast / Research / Security
  ↓
Permission boundary
  ↓
Tasks + auditable events
  ↓
Graphical memory (SQLite)
```

The current Personal OS is deliberately a **safe foundation**, not unrestricted computer control. Laptop/mobile device control, provider adapters, semantic/vector retrieval, and richer graph layouts should be added as separate permissioned layers.

## Existing Ada server

The original Ada server remains available. It serves the static site and `/api/ada`, using the configured OpenAI-compatible provider or built-in notes when no live API key is configured.

For the normal Ada-only server:

```bash
python ada_server.py
```

The Personal OS server subclasses that handler, so Ada's existing chat and project behavior remains available when using `personal_server.py`.

## Security

Never commit `.env`, API keys, passwords, cookies, or admin tokens. Personal OS memory stores structured project information and provenance, not raw credentials. High-risk capabilities are represented by permission names and must not be granted merely because an agent asks for them.

For the rest of the original Semicolon documentation, see the existing site files and deployment configuration.
