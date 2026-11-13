"""Privacy-conscious, per-browser learning progress for Semicolon.

The opaque browser token is a capability for one browser profile, not a login.
Only its SHA-256 digest is stored. No name, email, IP address, or lesson text is
stored here. Account-based cross-device sync requires real authentication and
is intentionally not implied by this module.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import threading
import time
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
DB_PATH = Path(os.getenv("LEARNING_DB", str(ROOT / "data" / "learning.db")))
_LOCK = threading.RLock()
_TOKEN_RE = re.compile(r"^[A-Za-z0-9_-]{40,100}$")
_LESSON_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,79}#[1-9][0-9]{0,2}$")


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS learning_sessions (
            token_hash TEXT PRIMARY KEY,
            created_at INTEGER NOT NULL,
            last_seen INTEGER NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS learning_progress (
            token_hash TEXT PRIMARY KEY,
            payload TEXT NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY(token_hash) REFERENCES learning_sessions(token_hash)
                ON DELETE CASCADE
        )
    """)
    conn.commit()
    return conn


def _digest(token: str) -> str | None:
    token = str(token or "").strip()
    if not _TOKEN_RE.fullmatch(token):
        return None
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_session() -> dict[str, Any]:
    """Create a new browser capability token. The raw token is returned once."""
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    now = int(time.time())
    with _LOCK:
        conn = _connect()
        try:
            conn.execute(
                "INSERT INTO learning_sessions(token_hash, created_at, last_seen) VALUES(?,?,?)",
                (token_hash, now, now),
            )
            # Expire abandoned browser profiles after 180 days.
            conn.execute(
                "DELETE FROM learning_sessions WHERE last_seen < ?",
                (now - 180 * 24 * 60 * 60,),
            )
            conn.commit()
        finally:
            conn.close()
    return {"token": token, "created_at": now}


def _session_hash(token: str) -> str | None:
    token_hash = _digest(token)
    if not token_hash:
        return None
    with _LOCK:
        conn = _connect()
        try:
            row = conn.execute(
                "SELECT token_hash FROM learning_sessions WHERE token_hash = ?",
                (token_hash,),
            ).fetchone()
            if not row:
                return None
            conn.execute(
                "UPDATE learning_sessions SET last_seen = ? WHERE token_hash = ?",
                (int(time.time()), token_hash),
            )
            conn.commit()
            return token_hash
        finally:
            conn.close()


def _empty_progress() -> dict[str, Any]:
    return {"goals": [], "completed_lessons": [], "updated_at": None}


def read_progress(token: str) -> dict[str, Any] | None:
    token_hash = _session_hash(token)
    if not token_hash:
        return None
    with _LOCK:
        conn = _connect()
        try:
            row = conn.execute(
                "SELECT payload, updated_at FROM learning_progress WHERE token_hash = ?",
                (token_hash,),
            ).fetchone()
            if not row:
                return _empty_progress()
            try:
                payload = json.loads(row["payload"])
            except (TypeError, ValueError):
                payload = {}
            return {
                "goals": payload.get("goals", []),
                "completed_lessons": payload.get("completed_lessons", []),
                "updated_at": row["updated_at"],
            }
        finally:
            conn.close()


def _clean_payload(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError("progress must be an object")

    raw_goals = payload.get("goals", [])
    raw_lessons = payload.get("completed_lessons", [])
    if not isinstance(raw_goals, list) or len(raw_goals) > 100:
        raise ValueError("goals must be a list of at most 100 items")
    if not isinstance(raw_lessons, list) or len(raw_lessons) > 500:
        raise ValueError("completed_lessons must be a list of at most 500 items")

    goals = []
    seen_goal_ids = set()
    for item in raw_goals:
        if not isinstance(item, dict):
            continue
        goal_id = str(item.get("id", ""))[:64]
        text = str(item.get("text", "")).strip()[:90]
        if not goal_id or not text or goal_id in seen_goal_ids:
            continue
        seen_goal_ids.add(goal_id)
        goals.append({
            "id": goal_id,
            "text": text,
            "done": bool(item.get("done")),
            "created_at": int(item.get("created_at") or int(time.time())),
        })

    lessons = []
    for item in raw_lessons:
        lesson_id = str(item or "").strip().lower()
        if _LESSON_RE.fullmatch(lesson_id) and lesson_id not in lessons:
            lessons.append(lesson_id)
    return {"goals": goals, "completed_lessons": lessons}


def write_progress(token: str, payload: Any) -> dict[str, Any] | None:
    token_hash = _session_hash(token)
    if not token_hash:
        return None
    clean = _clean_payload(payload)
    now = int(time.time())
    with _LOCK:
        conn = _connect()
        try:
            conn.execute(
                """INSERT INTO learning_progress(token_hash, payload, updated_at)
                   VALUES(?,?,?)
                   ON CONFLICT(token_hash) DO UPDATE SET
                     payload=excluded.payload, updated_at=excluded.updated_at""",
                (token_hash, json.dumps(clean, ensure_ascii=False), now),
            )
            conn.commit()
        finally:
            conn.close()
    return {
        "goals": clean["goals"],
        "completed_lessons": clean["completed_lessons"],
        "updated_at": now,
    }


def context_for_token(token: str) -> str:
    """Return a short, safe learning summary for Ada's private prompt context."""
    progress = read_progress(token)
    if not progress:
        return ""
    completed = progress.get("completed_lessons", [])
    goals = progress.get("goals", [])
    active_goals = [g["text"] for g in goals if not g.get("done")][:5]
    done_goals = sum(1 for g in goals if g.get("done"))
    if not completed and not goals:
        return ""
    lines = [
        "Verified Semicolon learning context for this browser profile (not an account):",
        "- Completed lessons: %d" % len(completed),
        "- Goals completed: %d of %d" % (done_goals, len(goals)),
    ]
    if active_goals:
        lines.append("- Active learning goals: " + "; ".join(active_goals))
    if completed:
        lines.append("- Recently completed lesson IDs: " + ", ".join(completed[-8:]))
    return "\n\n[Private learning context]\n" + "\n".join(lines)
