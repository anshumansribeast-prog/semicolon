"""Ada's brain — HTTP API for Semicolon chat, projects, and practice.

Stdlib only. Talks to an OpenAI-compatible API (Groq by default) when
AI_API_KEY is set; otherwise answers from ada_knowledge, the written
notes shipped with the site. Keys never go to the browser.
"""

import json
import os
import re
import sqlite3
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib import request as urlreq
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse

import ada_knowledge

HOST = os.environ.get("ADA_HOST", "0.0.0.0")
PORT = int(os.environ.get("ADA_PORT", "8420"))
ROOT = os.path.dirname(os.path.abspath(__file__))
AI_API_URL = os.environ.get("AI_API_URL", "").strip() or "https://api.groq.com/openai/v1"
AI_API_KEY = os.environ.get("AI_API_KEY", "").strip()
# llama-3.3-70b-versatile was retired by Groq — this is a model the
# free tier actually serves today. Env var AI_MODEL still wins.
AI_MODEL = os.environ.get("AI_MODEL", "").strip() or "openai/gpt-oss-120b"
VISITOR_NAME = os.environ.get("ADA_VISITOR_NAME", "AnshX")
ADMIN_TOKEN = os.environ.get("SEMICOLON_ADMIN_TOKEN", "").strip()

# ---- site stats store -------------------------------------------------
# One small SQLite database next to the server. Same privacy posture as
# Cosmos v2: a visit is a counter bump per (day, page); an error keeps
# only its message and location. No IPs, no cookies, nothing personal.
STATS_DB = os.path.join(ROOT, "data", "stats.db")


def _stats_conn():
    os.makedirs(os.path.dirname(STATS_DB), exist_ok=True)
    conn = sqlite3.connect(STATS_DB)
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS visit_days (
          day   TEXT NOT NULL,
          page  TEXT NOT NULL,
          views INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (day, page)
        );
        CREATE TABLE IF NOT EXISTS client_errors (
          id         INTEGER PRIMARY KEY,
          day        TEXT NOT NULL,
          page       TEXT,
          message    TEXT NOT NULL,
          source     TEXT,
          line       INTEGER,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS ada_messages (
          id      INTEGER PRIMARY KEY,
          day     TEXT NOT NULL,
          mode    TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        """
    )
    return conn


_stats_lock = threading.Lock()

# Tiny sliding-window limiter, enough for a small site.
_rate = {}


def _allowed(key, limit, window_seconds):
    now = time.time()
    with _stats_lock:
        recent = [t for t in _rate.get(key, []) if t > now - window_seconds]
        if len(recent) >= limit:
            _rate[key] = recent
            return False
        recent.append(now)
        _rate[key] = recent
        if len(_rate) > 5000:
            for k in [k for k, v in _rate.items() if not v]:
                del _rate[k]
        return True
FAIL_MSG = "ADA couldn't complete that request. Please try again."
HISTORY_TURNS = 30
TURN_CHARS = 8000

ada_knowledge.VISITOR = VISITOR_NAME

CHAT_PROMPT = f"""You are Ada, a capable AI assistant inside Semicolon (https://semicolon.punah.pro).

You are both the tutor and the workshop: conversation and project-building live
in this one chat. Talk like a real conversation with ChatGPT or Claude: warm,
clear, specific, useful. Keep the thread. A follow-up means "change what we just
did", not a brand-new start.

Capabilities (use them all):
- Long multi-turn memory of this conversation.
- Any topic — coding, school, science, writing, planning, games, business ideas.
- Coding is the strongest skill. For ANY lawful topic (a bakery site, a physics
  quiz, a cricket scoreboard, a farm inventory, a photo gallery…) write complete,
  working code.
- Debugging: when they paste broken code, name the real problem, explain why it
  happened, then show the fix.

When they ask for something to build, plan silently, then answer like an engineer:
1. Give a one-line summary of what you built.
2. Put EVERY file in its own markdown fence, each opened by a first-line comment
   like `file: index.html` (index.html, style.css, script.js, main.py, README.md).
   The site renders those fences as editable project files — so always use them,
   and never wrap them in JSON.
3. Explain the two or three important decisions, briefly.
4. Say how to run it, and one natural next step they could ask for.

Rules:
- Full, working code — no placeholders, no "TODO: you write the rest". If a
  request needs five files, write five files.
- Match the visitor's level. Beginners get plain English and small steps.
- Mention real limits only. Never invent bugs or missing features.
- Lawful requests only; no malware, exploits, or credential theft.

You are talking to {VISITOR_NAME}. Use their name naturally, not every sentence.
Never say Student. Never reveal API keys, stack traces, or server paths.
"""

CHALLENGE_PROMPT = """You are Ada writing a coding challenge for Semicolon Practice.
Any topic is fine if it makes a fair, solvable exercise.
Return markdown with title, description, example input, example output,
starter code in a fence, two small hints, and a solution fence.
Keep beginner tasks small. Do not contradict the examples.
"""


def looks_like_greeting(message):
    text = message.lower().strip()
    for ch in "!.?,":
        text = text.replace(ch, "")
    text = " ".join(text.split())
    greetings = {
        "hi", "hello", "hey", "yo", "hiya", "sup", "hola",
        "hi ada", "hello ada", "hey ada", "hi there", "hello there",
        "hey there", "good morning", "good afternoon", "good evening",
    }
    return text in greetings or text.startswith("hi ") or text.startswith("hello ") or text.startswith("hey ")


def greeting_reply():
    return (
        "Hey %s — I'm Ada. Talk to me like a normal chat: ask anything, follow up, "
        "paste code, or describe a project on any topic and I'll write it. What are we doing?"
        % VISITOR_NAME
    )


def clip_history(history):
    out = []
    for turn in (history or [])[-HISTORY_TURNS:]:
        role = turn.get("role") or "user"
        if role not in ("user", "assistant"):
            role = "assistant" if role in ("ada", "bot", "model") else "user"
        content = (turn.get("content") or "")[:TURN_CHARS]
        out.append({"role": role, "content": content})
    return out


def build_messages(system, prompt, history):
    messages = [{"role": "system", "content": system}]
    turns = clip_history(history)
    if turns and turns[-1]["role"] == "user" and turns[-1]["content"] == prompt:
        turns = turns[:-1]
    messages.extend(turns)
    messages.append({"role": "user", "content": prompt})
    return messages


def ask_openai_compatible(messages):
    if not AI_API_KEY or not AI_API_URL:
        return None
    url = AI_API_URL
    if not url.endswith("/chat/completions") and not url.endswith("/v1/chat/completions"):
        url = url.rstrip("/") + "/chat/completions"
    payload = json.dumps({
        "model": AI_MODEL,
        "messages": messages,
        "temperature": 0.5,
    }).encode()
    req = urlreq.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer " + AI_API_KEY,
        },
    )
    with urlreq.urlopen(req, timeout=90) as resp:
        data = json.loads(resp.read())
        choices = data.get("choices") or []
        if not choices:
            return None
        return (choices[0].get("message") or {}).get("content", "").strip() or None


def ask_model(system, prompt, history=None):
    if not AI_API_KEY:
        raise URLError("no AI_API_KEY configured — answering from the notes instead")
    messages = build_messages(system, prompt, history)
    reply = ask_openai_compatible(messages)
    if not reply:
        raise URLError("empty reply from the API")
    return reply, "api"


def fallback_tutor(message, history):
    if looks_like_greeting(message):
        return greeting_reply()
    q = message.lower()
    words = message.split()
    note, score = ada_knowledge.lookup(message, min_score=5)
    if note and score >= 6 and len(words) < 14 and "joke" not in q and "story" not in q:
        return (
            "The live model is busy, so this is from Semicolon's notes — still yours to use.\n\n%s"
            % note
        )
    last = ""
    for turn in reversed(clip_history(history)):
        if turn["role"] == "assistant" and turn["content"]:
            last = turn["content"][:900]
            break
    bits = [
        "I'm still here, %s. The live model is warming up, so this reply is shorter than usual."
        % VISITOR_NAME
    ]
    if "joke" in q:
        bits.append("Quick one: a SQL query walks into a bar, walks up to two tables, and asks, \"May I join you?\"")
    if any(k in q for k in ("hello", "python", "print")):
        bits.append("```python\nprint(\"Hello, %s\")\n```" % VISITOR_NAME)
    if last:
        bits.append("I still have our thread. Last thing I had:\n%s" % last)
    bits.append(
        "Ask again in a moment, or describe any topic — I can write the files right here in this chat."
    )
    return "\n\n".join(bits)


def extract_json(text):
    if not text:
        return None
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except ValueError:
        pass
    start = text.find("{")
    end = text.rfind("}")
    if start >= 0 and end > start:
        try:
            return json.loads(text[start:end + 1])
        except ValueError:
            return None
    return None


def safe_title(message):
    t = re.sub(r"\s+", " ", (message or "").strip())[:72]
    t = t.replace("%", " percent")
    return t or "My project"


class AdaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/ada":
            self._reply(200, {
                "ok": True,
                "model": AI_MODEL if AI_API_KEY else None,
                "api": bool(AI_API_KEY),
                "visitor": VISITOR_NAME,
                "notes": len(ada_knowledge.TOPICS),
            })
            return
        if path == "/api/stats/summary":
            self._stats_summary()
            return
        super().do_GET()

    def _client_key(self):
        return self.client_address[0] if self.client_address else "unknown"

    def _clean_page(self, raw):
        name = str(raw or "").strip().split("?")[0].split("/").pop()[:64]
        low = name.lower()
        return low if re.match(r"^[a-z0-9_-]+\.html$", low) else "other"

    def _today(self):
        return time.strftime("%Y-%m-%d", time.gmtime())

    def _stats_summary(self):
        # The dashboard's data source. Gated by a shared token the two
        # servers hold; without SEMICOLON_ADMIN_TOKEN set this answers
        # 403 to everyone, including the dashboard.
        auth = self.headers.get("Authorization", "")
        token = auth[7:] if auth.startswith("Bearer ") else ""
        if not ADMIN_TOKEN or token != ADMIN_TOKEN:
            self._reply(403, {"error": "admin token required"})
            return

        today = self._today()
        conn = _stats_conn()
        try:
            def one(sql, params=()):
                row = conn.execute(sql, params).fetchone()
                return row[0] if row and row[0] is not None else 0

            summary = {
                "site": "semicolon",
                "visitors": {
                    "today": one("SELECT COALESCE(SUM(views),0) FROM visit_days WHERE day=?", (today,)),
                    "total": one("SELECT COALESCE(SUM(views),0) FROM visit_days"),
                    "top_pages": [
                        {"page": r[0], "views": r[1]}
                        for r in conn.execute(
                            "SELECT page, SUM(views) FROM visit_days GROUP BY page ORDER BY SUM(views) DESC LIMIT 8")
                    ],
                },
                "ada": {
                    "messages_today": one("SELECT COUNT(*) FROM ada_messages WHERE day=?", (today,)),
                    "messages_total": one("SELECT COUNT(*) FROM ada_messages"),
                },
                "errors": {
                    "today": one("SELECT COUNT(*) FROM client_errors WHERE day=?", (today,)),
                    "recent": [
                        {"day": r[0], "page": r[1], "message": r[2], "source": r[3], "line": r[4]}
                        for r in conn.execute(
                            "SELECT day,page,message,source,line FROM client_errors ORDER BY id DESC LIMIT 10")
                    ],
                },
            }
            self._reply(200, {"data": summary})
        finally:
            conn.close()

    def _record_visit(self, body):
        if not _allowed("visit:" + self._client_key(), 60, 60):
            self._reply(429, {"error": "slow down"})
            return
        page = self._clean_page(body.get("page"))
        with _stats_lock:
            conn = _stats_conn()
            try:
                conn.execute(
                    "INSERT INTO visit_days (day, page, views) VALUES (?, ?, 1) "
                    "ON CONFLICT(day, page) DO UPDATE SET views = views + 1",
                    (self._today(), page))
                conn.commit()
            finally:
                conn.close()
        self._reply(200, {"ok": True})

    def _record_error(self, body):
        if not _allowed("error:" + self._client_key(), 20, 60):
            self._reply(429, {"error": "slow down"})
            return
        try:
            line_no = int(body.get("line"))
        except (TypeError, ValueError):
            line_no = None
        message = str(body.get("message") or "Unknown error")[:300]
        source = (str(body.get("source") or "")[:200]) or None
        page = self._clean_page(body.get("page"))
        with _stats_lock:
            conn = _stats_conn()
            try:
                conn.execute(
                    "INSERT INTO client_errors (day, page, message, source, line) VALUES (?, ?, ?, ?, ?)",
                    (self._today(), page, message, source, line_no))
                # Keep the newest errors only.
                conn.execute(
                    "DELETE FROM client_errors WHERE id NOT IN "
                    "(SELECT id FROM client_errors ORDER BY id DESC LIMIT 500)")
                conn.commit()
            finally:
                conn.close()
        self._reply(200, {"ok": True})

    def do_POST(self):
        path = urlparse(self.path).path
        if path not in ("/api/ada", "/api/stats/visit", "/api/stats/error"):
            self.send_response(404)
            self._cors()
            self.end_headers()
            return

        length = int(self.headers.get("Content-Length", 0))
        if length > 400000:
            self._reply(413, {"error": FAIL_MSG})
            return
        try:
            body = json.loads(self.rfile.read(length) or b"{}")
        except ValueError:
            body = {}

        if path == "/api/stats/visit":
            self._record_visit(body)
            return
        if path == "/api/stats/error":
            self._record_error(body)
            return

        mode = (body.get("mode") or "chat").strip().lower()
        message = (body.get("message") or body.get("prompt") or "").strip()
        history = body.get("history") or []
        language = (body.get("language") or "javascript").strip()
        framework = (body.get("framework") or "none").strip()
        difficulty = (body.get("difficulty") or "beginner").strip()
        output = (body.get("output") or "single").strip()
        files = body.get("files") or []

        if not message:
            self._reply(400, {"error": "empty message", "reply": FAIL_MSG})
            return

        # Count chat activity for the dashboard (no message content
        # stored — just that a request happened, and which kind).
        with _stats_lock:
            try:
                conn = _stats_conn()
                conn.execute(
                    "INSERT INTO ada_messages (day, mode) VALUES (?, ?)",
                    (self._today(), mode))
                conn.commit()
                conn.close()
            except Exception:
                pass

        try:
            result = self._handle(mode, message, history, language, framework, difficulty, output, files)
            self._reply(200, result)
        except (URLError, TimeoutError, ValueError, OSError, HTTPError) as err:
            # A silent catch here once hid a retired Groq model id behind
            # "the notes are fine" — log it so the next one shows up.
            print("[ada] live model unavailable (%s), answering from notes: %s" % (mode, err))
            if mode == "challenge":
                self._reply(200, self._local_challenge(message, language, difficulty))
            else:
                self._reply(200, {
                    "ok": True,
                    "reply": fallback_tutor(message, history),
                    "source": "fallback",
                })
        except Exception:
            self._reply(200, {"reply": FAIL_MSG, "source": "error", "ok": False})

    def _local_challenge(self, message, language, difficulty):
        topic = safe_title(message)
        lang = (language or "javascript").lower()
        if "python" in lang:
            starter = "def solve(items):\n    # return the answer for: %s\n    return items\n\nprint(solve([1, 2, 3]))\n" % topic
            solution = "def solve(items):\n    return max(items) if items else None\n"
        else:
            starter = "function solve(items) {\n  // %s\n  return items;\n}\nconsole.log(solve([1, 2, 3]));\n" % topic
            solution = "function solve(items) {\n  return Math.max.apply(null, items);\n}\n"
        return {
            "ok": True,
            "title": "Challenge: " + topic,
            "language": language,
            "difficulty": difficulty,
            "topic": topic,
            "description": "Use %s to work with this idea: %s. Write a small function and print a result." % (language, topic),
            "example_in": "[1, 2, 3]",
            "example_out": "3",
            "starter": starter,
            "hints": ["Start with one example.", "Print the result so you can see it."],
            "solution": solution,
            "reply": "Challenge ready.",
            "source": "local",
        }

    def _handle(self, mode, message, history, language, framework, difficulty, output, files):
        extra = ""
        if files:
            extra = "\n\nProject files currently open:\n"
            for item in files[:12]:
                path = (item.get("path") or "file")[:80]
                content = (item.get("content") or "")[:6000]
                extra += "\n--- %s ---\n%s\n" % (path, content)

        if mode == "challenge":
            spec = "Language: %s\nDifficulty: %s\nTopic (any subject is fine): %s" % (language, difficulty, message)
            try:
                reply, source = ask_model(CHALLENGE_PROMPT, spec, history)
            except (URLError, TimeoutError, ValueError, OSError, HTTPError):
                return self._local_challenge(message, language, difficulty)
            parsed = extract_json(reply) or {}
            if not parsed.get("title"):
                parsed = self._local_challenge(message, language, difficulty)
                parsed["reply"] = reply[:800] if reply else parsed["reply"]
                parsed["source"] = source
                return parsed
            parsed["source"] = source
            parsed["ok"] = True
            parsed["reply"] = parsed.get("description") or "Challenge ready."
            return parsed

        if mode in ("explain", "improve", "debug", "hint"):
            jobs = {
                "explain": "Explain this clearly, like a real chat. Use markdown. Any topic in the code is fine.",
                "improve": "Improve this for the user's topic. Show the new version in a fenced block, then list what changed.",
                "debug": "Find real bugs. Explain the cause, then show corrected code. Do not invent errors.",
                "hint": "Give a small hint only. Do not reveal the full solution.",
            }
            prompt = jobs[mode] + "\n\nUser:\n" + message + extra
            try:
                reply, source = ask_model(CHAT_PROMPT, prompt, history)
            except (URLError, TimeoutError, ValueError, OSError, HTTPError):
                return {"ok": True, "reply": fallback_tutor(message, history), "source": "fallback"}
            return {"ok": True, "reply": reply, "source": source}

        prompt = message + extra
        try:
            reply, source = ask_model(CHAT_PROMPT, prompt, history)
            return {"ok": True, "reply": reply, "source": source}
        except (URLError, TimeoutError, ValueError, OSError, HTTPError):
            return {"ok": True, "reply": fallback_tutor(message, history), "source": "fallback"}

    def _reply(self, status, payload):
        data = json.dumps(payload).encode()
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        print("[ada]", fmt % args)


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), AdaHandler)
    if AI_API_KEY:
        print("Ada server listening on http://%s:%s (live model: %s via %s)" % (HOST, PORT, AI_MODEL, AI_API_URL))
    else:
        print("Ada server listening on http://%s:%s (no AI_API_KEY — answering from the written notes)" % (HOST, PORT))
    print("Open http://127.0.0.1:%s/pages/ada.html" % PORT)
    server.serve_forever()
