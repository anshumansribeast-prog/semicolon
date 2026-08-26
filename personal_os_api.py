"""AnshuX Personal OS backend API.

Small, dependency-light FastAPI service backed by SQLite. It provides real
state for the dashboard instead of mock arrays. Secrets are never stored in
this database; use credential references only.
"""
from __future__ import annotations

import os
import secrets
import sqlite3
import time
import uuid
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from pydantic import BaseModel, Field

DB_PATH = Path(os.getenv("PERSONAL_OS_DB", "personal_os.db"))
ADMIN_TOKEN = os.getenv("SEMICOLON_ADMIN_TOKEN", "").strip()

app = FastAPI(title="AnshuX Personal OS API", version="1.0.0")


def db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    conn = db()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
      model TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'offline',
      capabilities TEXT NOT NULL DEFAULT '[]', memory_namespace TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
      agent_id TEXT, state TEXT NOT NULL DEFAULT 'Pending', progress INTEGER,
      requires_approval INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL, FOREIGN KEY(agent_id) REFERENCES agents(id)
    );
    CREATE TABLE IF NOT EXISTS memory_nodes (
      id TEXT PRIMARY KEY, type TEXT NOT NULL, label TEXT NOT NULL,
      data TEXT NOT NULL DEFAULT '{}', provenance TEXT NOT NULL DEFAULT '',
      confidence REAL NOT NULL DEFAULT 1.0, pinned INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS memory_edges (
      id TEXT PRIMARY KEY, source_id TEXT NOT NULL, target_id TEXT NOT NULL,
      relation TEXT NOT NULL, provenance TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL,
      FOREIGN KEY(source_id) REFERENCES memory_nodes(id) ON DELETE CASCADE,
      FOREIGN KEY(target_id) REFERENCES memory_nodes(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'unknown',
      status TEXT NOT NULL DEFAULT 'offline', last_seen INTEGER
    );
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL,
      resource_type TEXT NOT NULL, resource_id TEXT, details TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER NOT NULL
    );
    """)
    now = int(time.time())
    seed = [
      ("personal-os", "AnshuX", "Core personal orchestrator", "orchestrator", "online"),
      ("ada", "Ada", "AI assistant and coding agent", "", "online"),
      ("beast", "Beast", "Development and technical agent", "", "online"),
      ("researcher", "Researcher", "Web and data research agent", "", "online"),
      ("security", "Security", "Security review agent", "", "offline"),
      ("writer", "Writer", "Writing agent", "", "offline"),
    ]
    for agent in seed:
        conn.execute("INSERT OR IGNORE INTO agents(id,name,description,model,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",
                     (*agent, now, now))
    for device in [("laptop", "Laptop", "computer", "online"), ("android", "Android", "mobile", "online"), ("server", "Server", "server", "online"), ("iphone", "iPhone", "mobile", "offline")]:
        conn.execute("INSERT OR IGNORE INTO devices(id,name,kind,status,last_seen) VALUES(?,?,?,?,?)", (*device, now))
    conn.commit(); conn.close()


@app.on_event("startup")
def startup() -> None:
    init_db()


def auth(x_admin_token: str | None = Header(default=None)) -> None:
    if not ADMIN_TOKEN:
        raise HTTPException(503, "SEMICOLON_ADMIN_TOKEN is not configured")
    if not x_admin_token or not secrets.compare_digest(x_admin_token, ADMIN_TOKEN):
        raise HTTPException(401, "Invalid admin token")


class AgentIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = ""
    model: str = ""
    status: str = "offline"
    capabilities: list[str] = []
    memory_namespace: str = ""

class TaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    agent_id: str | None = None
    requires_approval: bool = False

class MemoryNodeIn(BaseModel):
    type: str
    label: str = Field(min_length=1, max_length=200)
    data: dict[str, Any] = {}
    provenance: str = "user"
    confidence: float = Field(default=1.0, ge=0, le=1)
    pinned: bool = False

class MemoryEdgeIn(BaseModel):
    source_id: str
    target_id: str
    relation: str = Field(min_length=1, max_length=80)
    provenance: str = "user"


def audit(conn: sqlite3.Connection, actor: str, action: str, resource_type: str, resource_id: str | None = None, details: str = "{}") -> None:
    conn.execute("INSERT INTO audit_events VALUES(?,?,?,?,?,?,?)", (str(uuid.uuid4()), actor, action, resource_type, resource_id, details, int(time.time())))


@app.get("/api/personal-os/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "personal-os", "version": app.version}


@app.get("/api/personal-os/overview")
def overview(_: None = Depends(auth)) -> dict[str, Any]:
    conn = db()
    agents = conn.execute("SELECT status,COUNT(*) n FROM agents GROUP BY status").fetchall()
    tasks = conn.execute("SELECT state,COUNT(*) n FROM tasks GROUP BY state").fetchall()
    memory = conn.execute("SELECT COUNT(*) n FROM memory_nodes").fetchone()["n"]
    events = conn.execute("SELECT COUNT(*) n FROM audit_events WHERE created_at >= ?", (int(time.time()) - 86400,)).fetchone()["n"]
    projects = conn.execute("SELECT COUNT(*) n FROM projects").fetchone()["n"]
    conn.close()
    counts = {r["state"]: r["n"] for r in tasks}
    online = sum(r["n"] for r in agents if r["status"] == "online")
    total = sum(r["n"] for r in agents)
    return {"active_tasks": counts.get("Running", 0), "waiting_approval": counts.get("Waiting", 0),
            "agents_online": online, "agents_total": total, "memory_nodes": memory,
            "events_24h": events, "projects": projects, "system_health": "online"}


@app.get("/api/agents")
def agents(_: None = Depends(auth)):
    conn = db(); rows = conn.execute("SELECT * FROM agents ORDER BY name").fetchall(); conn.close()
    return [dict(r) for r in rows]

@app.post("/api/agents")
def create_agent(body: AgentIn, _: None = Depends(auth)):
    conn = db(); now = int(time.time()); aid = str(uuid.uuid4())
    conn.execute("INSERT INTO agents VALUES(?,?,?,?,?,?,?,?)", (aid, body.name, body.description, body.model, body.status, str(body.capabilities), body.memory_namespace, now, now)); audit(conn,"admin","agent.created","agent",aid); conn.commit(); conn.close()
    return {"id": aid, **body.model_dump()}

@app.get("/api/tasks")
def tasks(_: None = Depends(auth)):
    conn = db(); rows = conn.execute("SELECT t.*,a.name agent_name FROM tasks t LEFT JOIN agents a ON a.id=t.agent_id ORDER BY t.created_at DESC").fetchall(); conn.close(); return [dict(r) for r in rows]

@app.post("/api/tasks")
def create_task(body: TaskIn, _: None = Depends(auth)):
    conn = db(); now = int(time.time()); tid = str(uuid.uuid4()); state = "Waiting" if body.requires_approval else "Pending"
    conn.execute("INSERT INTO tasks VALUES(?,?,?,?,?,?,?,?,?)", (tid,body.title,body.description,body.agent_id,state,None,int(body.requires_approval),now,now)); audit(conn,"admin","task.created","task",tid); conn.commit(); conn.close()
    return {"id":tid,"state":state,**body.model_dump()}

@app.get("/api/memory/nodes")
def memory_nodes(_: None = Depends(auth)):
    conn=db(); rows=conn.execute("SELECT * FROM memory_nodes ORDER BY updated_at DESC").fetchall(); conn.close(); return [dict(r) for r in rows]

@app.post("/api/memory/nodes")
def create_memory_node(body: MemoryNodeIn, _: None = Depends(auth)):
    conn=db(); now=int(time.time()); nid=str(uuid.uuid4())
    import json
    conn.execute("INSERT INTO memory_nodes VALUES(?,?,?,?,?,?,?,?)",(nid,body.type,body.label,json.dumps(body.data),body.provenance,body.confidence,int(body.pinned),now,now)); audit(conn,"admin","memory.created","memory_node",nid); conn.commit(); conn.close(); return {"id":nid,**body.model_dump()}

@app.get("/api/memory/edges")
def memory_edges(_: None = Depends(auth)):
    conn=db(); rows=conn.execute("SELECT * FROM memory_edges ORDER BY created_at DESC").fetchall(); conn.close(); return [dict(r) for r in rows]

@app.post("/api/memory/edges")
def create_memory_edge(body: MemoryEdgeIn, _: None = Depends(auth)):
    conn=db(); eid=str(uuid.uuid4())
    try:
        conn.execute("INSERT INTO memory_edges VALUES(?,?,?,?,?,?)",(eid,body.source_id,body.target_id,body.relation,body.provenance,int(time.time())))
    except sqlite3.IntegrityError: conn.close(); raise HTTPException(400,"Unknown memory node")
    audit(conn,"admin","memory.edge_created","memory_edge",eid); conn.commit(); conn.close(); return {"id":eid,**body.model_dump()}

@app.get("/api/projects")
def projects(_: None = Depends(auth)):
    conn=db(); rows=conn.execute("SELECT p.*, (SELECT COUNT(*) FROM memory_nodes n WHERE n.data LIKE '%' || p.id || '%') nodes FROM projects p ORDER BY p.updated_at DESC").fetchall(); conn.close(); return [dict(r) for r in rows]

@app.get("/api/devices")
def devices(_: None = Depends(auth)):
    conn=db(); rows=conn.execute("SELECT * FROM devices ORDER BY name").fetchall(); conn.close(); return [dict(r) for r in rows]

@app.get("/api/permissions")
def permissions(_: None = Depends(auth)):
    conn=db(); rows=conn.execute("SELECT action,COUNT(*) n FROM audit_events GROUP BY action ORDER BY n DESC").fetchall(); conn.close(); return [dict(r) for r in rows]

@app.get("/api/activity")
def activity(limit: int = 20, _: None = Depends(auth)):
    limit=max(1,min(limit,100)); conn=db(); rows=conn.execute("SELECT * FROM audit_events ORDER BY created_at DESC LIMIT ?",(limit,)).fetchall(); conn.close(); return [dict(r) for r in rows]

@app.get("/api/audit")
def audit_log(limit: int = 100, _: None = Depends(auth)):
    return activity(limit, _)

@app.post("/api/approvals/{task_id}/approve")
def approve(task_id: str, _: None = Depends(auth)):
    conn=db(); now=int(time.time()); cur=conn.execute("UPDATE tasks SET state='Pending',requires_approval=0,updated_at=? WHERE id=? AND state='Waiting'",(now,task_id))
    if cur.rowcount == 0: conn.close(); raise HTTPException(404,"Approval task not found")
    audit(conn,"admin","task.approved","task",task_id); conn.commit(); conn.close(); return {"ok":True,"task_id":task_id,"state":"Pending"}

@app.post("/api/approvals/{task_id}/reject")
def reject(task_id: str, _: None = Depends(auth)):
    conn=db(); now=int(time.time()); cur=conn.execute("UPDATE tasks SET state='Failed',updated_at=? WHERE id=? AND state='Waiting'",(now,task_id))
    if cur.rowcount == 0: conn.close(); raise HTTPException(404,"Approval task not found")
    audit(conn,"admin","task.rejected","task",task_id); conn.commit(); conn.close(); return {"ok":True,"task_id":task_id,"state":"Failed"}
