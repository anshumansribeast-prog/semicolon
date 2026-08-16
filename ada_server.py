"""Ada's brain — HTTP API for Semicolon chat, code generation, and practice.

Stdlib only. Talks to Ollama on the server, or an OpenAI-compatible API
when AI_API_KEY is set. Keys never go to the browser.
"""

import json
import os
import re
import socket
import struct
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib import request as urlreq
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse

import ada_knowledge

HOST = os.environ.get("ADA_HOST", "0.0.0.0")
PORT = int(os.environ.get("ADA_PORT", "8420"))
ROOT = os.path.dirname(os.path.abspath(__file__))
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434/api/generate")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:3b")
AI_API_URL = os.environ.get("AI_API_URL", "").strip()
AI_API_KEY = os.environ.get("AI_API_KEY", "").strip()
AI_MODEL = os.environ.get("AI_MODEL", "").strip() or OLLAMA_MODEL
VISITOR_NAME = os.environ.get("ADA_VISITOR_NAME", "AnshX")
FAIL_MSG = "ADA couldn't complete that request. Please try again."
HISTORY_TURNS = 16
TURN_CHARS = 4000

ada_knowledge.VISITOR = VISITOR_NAME

MENTOR_PROMPT = f"""You are Ada, the AI coding mentor inside Semicolon (https://semicolon.punah.pro).

Semicolon is a learn-to-code platform. Tagline: Learn. Code. Build.
You are NOT a generic chatbot. Coding is your main job. You may answer ordinary
questions briefly, then steer back to building or learning.

Who you are talking to: {VISITOR_NAME}. Greet them by that name. Never say Student.

You help with: Python, JavaScript, HTML, CSS, C, C++, Java, SQL, TypeScript, React,
Git, GitHub, algorithms, data structures, debugging, web development, and beginner
computer science. You know Semicolon's 10 tracks and 31 lessons.

When they ask for code:
1. Understand the requirement.
2. Pick a sensible language if they did not.
3. Produce working code in markdown fenced blocks with a language tag.
4. Explain the important parts in plain English.
5. Say how to run it when useful.
6. Warn about real mistakes or limits. Do not invent errors.

When they paste broken code:
1. Name the actual problem.
2. Explain the cause.
3. Show corrected code.
4. Explain the fix.

Follow-ups modify the previous example — do not start from zero.
Use markdown. Keep explanations clear. Prefer complete small examples over essays.
If you are unsure, say so. Never reveal API keys, stack traces, or server paths.
"""

GENERATE_PROMPT = """You are Ada generating code for Semicolon's Code Generator.

Return ONLY valid JSON (no markdown wrapper) with this shape:
{
  "title": "short project name",
  "summary": "one or two sentences",
  "files": [
    {"path": "index.html", "content": "full file contents"},
    {"path": "style.css", "content": "..."},
    {"path": "script.js", "content": "..."},
    {"path": "README.md", "content": "how to run it"}
  ]
}

Rules:
- Working code only. Match the requested language and difficulty.
- If output is "single", one main file plus README.md.
- If output is "project" or the user asked for a website, use multiple files
  (index.html, style.css, script.js, README.md) unless another language was chosen.
- Python/C/Java/SQL: one or two source files plus README.md. Do not invent a server.
- HTML/CSS/JS may be previewed in a browser. Other languages are shown, not executed.
- Escape JSON strings correctly.
"""

CHALLENGE_PROMPT = """You are Ada writing a coding challenge for Semicolon Practice.

Return ONLY valid JSON:
{
  "title": "short title",
  "language": "javascript or python etc",
  "difficulty": "beginner",
  "topic": "loops",
  "description": "what to build, 2-4 sentences",
  "example_in": "example input",
  "example_out": "example output",
  "starter": "starter code as a string",
  "hints": ["small clue 1", "small clue 2"],
  "solution": "working solution code"
}

Keep it solvable. Do not contradict the examples. Beginner challenges stay small.
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


def looks_like_code_task(message):
    q = message.lower()
    keys = (
        "write ", "write a", "create a", "generate", "function", "class ",
        "debug", "fix ", "traceback", "```", "make it", "add ", "implement",
        "code for", "html", "css", "javascript", "python", "sql", "react",
        "compile", "algorithm", "sort ", "loop", "array", "refactor",
        "improve", "explain this code", "how do i", "how to",
    )
    return any(k in q for k in keys) or "\n" in message


def greeting_reply():
    return (
        "Hey %s — I'm Ada, Semicolon's coding mentor. Ask me to explain an idea, "
        "debug a snippet, or generate a small project. Follow-ups stay in context."
        % VISITOR_NAME
    )


def docker_gateway_url():
    try:
        with open("/proc/net/route") as fh:
            for line in fh:
                parts = line.split()
                if len(parts) > 2 and parts[1] == "00000000":
                    packed = struct.pack("<L", int(parts[2], 16))
                    ip = socket.inet_ntoa(packed)
                    return "http://%s:11434/api/generate" % ip
    except (OSError, ValueError, IndexError):
        return None
    return None


def ollama_candidates():
    urls = []
    env = os.environ.get("OLLAMA_URL")
    for item in (
        env,
        "http://127.0.0.1:11434/api/generate",
        "http://localhost:11434/api/generate",
        "http://ollama:11434/api/generate",
        "http://host.docker.internal:11434/api/generate",
        docker_gateway_url(),
    ):
        if item and item not in urls:
            urls.append(item)
    return urls


def resolve_host(host, timeout=0.4):
    box = []

    def run():
        try:
            box.append(socket.getaddrinfo(host, None)[0][4][0])
        except OSError:
            box.append(None)

    t = threading.Thread(target=run)
    t.daemon = True
    t.start()
    t.join(timeout)
    if t.is_alive() or not box:
        return None
    return box[0]


def tcp_open(url, timeout=1.2):
    parsed = urlparse(url)
    host = parsed.hostname
    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    if not host:
        return False
    ip = resolve_host(host, timeout=0.4)
    if not ip:
        return False
    try:
        with socket.create_connection((ip, port), timeout=timeout):
            return True
    except OSError:
        return False


def clip_history(history):
    out = []
    for turn in (history or [])[-HISTORY_TURNS:]:
        role = turn.get("role") or "user"
        content = (turn.get("content") or "")[:TURN_CHARS]
        out.append({"role": role, "content": content})
    return out


def history_prompt(history, message):
    prompt = ""
    for turn in clip_history(history):
        who = VISITOR_NAME if turn["role"] == "user" else "Ada"
        prompt += "%s: %s\n" % (who, turn["content"])
    prompt += "%s: %s\nAda:" % (VISITOR_NAME, message)
    return prompt


def ask_openai_compatible(system, prompt):
    if not AI_API_KEY or not AI_API_URL:
        return None
    url = AI_API_URL
    if not url.endswith("/chat/completions") and not url.endswith("/v1/chat/completions"):
        url = url.rstrip("/") + "/chat/completions"
    payload = json.dumps({
        "model": AI_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.4,
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


def ask_ollama(system, prompt):
    payload = json.dumps({
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "system": system,
        "stream": False,
    }).encode()
    last_error = None
    for url in ollama_candidates():
        if not tcp_open(url, timeout=1.2):
            continue
        try:
            req = urlreq.Request(
                url,
                data=payload,
                headers={"Content-Type": "application/json"},
            )
            with urlreq.urlopen(req, timeout=90) as resp:
                reply = json.loads(resp.read()).get("response", "").strip()
                if reply:
                    return reply
        except (URLError, TimeoutError, ValueError, OSError, HTTPError) as err:
            last_error = err
            continue
    raise last_error or URLError("no Ollama URL to try")


def ask_model(system, prompt):
    if AI_API_KEY:
        try:
            reply = ask_openai_compatible(system, prompt)
            if reply:
                return reply, "api"
        except (URLError, TimeoutError, ValueError, OSError, HTTPError, KeyError):
            pass
    reply = ask_ollama(system, prompt)
    return reply, "ollama"


def fallback_tutor(message):
    note, score = ada_knowledge.lookup(message, min_score=2)
    if note:
        return "Hey %s — %s" % (VISITOR_NAME, note)
    return ada_knowledge.generic_fallback()


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


def files_from_markdown(text):
    files = []
    pattern = re.compile(r"```(\w+)?\n(.*?)```", re.DOTALL)
    n = 0
    for lang, body in pattern.findall(text or ""):
        n += 1
        ext = {
            "html": "html", "css": "css", "javascript": "js", "js": "js",
            "python": "py", "py": "py", "c": "c", "cpp": "cpp", "java": "java",
            "sql": "sql", "ts": "ts", "typescript": "ts", "json": "json",
            "md": "md", "markdown": "md",
        }.get((lang or "").lower(), "txt")
        files.append({"path": "file-%s.%s" % (n, ext), "content": body.strip("\n")})
    return files


def normalize_files(obj, fallback_text, language):
    files = []
    if isinstance(obj, dict):
        raw = obj.get("files") or []
        for item in raw:
            if not isinstance(item, dict):
                continue
            path = (item.get("path") or item.get("name") or "").strip() or "main.txt"
            content = item.get("content")
            if content is None:
                continue
            files.append({"path": path.replace("..", ""), "content": str(content)})
        if not files and obj.get("code"):
            files.append({"path": default_name(language), "content": str(obj.get("code"))})
    if not files:
        md = files_from_markdown(fallback_text)
        if md:
            files = md
        else:
            files = [{"path": default_name(language), "content": fallback_text or ""}]
    return files


def default_name(language):
    return {
        "html": "index.html", "css": "style.css", "javascript": "script.js",
        "python": "main.py", "c": "main.c", "c++": "main.cpp", "java": "Main.java",
        "sql": "query.sql", "typescript": "main.ts",
    }.get((language or "txt").lower(), "main.txt")


def ollama_up():
    for url in ollama_candidates():
        if not tcp_open(url, timeout=0.8):
            continue
        tags = url.replace("/api/generate", "/api/tags")
        try:
            with urlreq.urlopen(tags, timeout=2) as resp:
                if resp.status == 200:
                    return True
        except (URLError, TimeoutError, OSError, ValueError):
            continue
    return False


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
        if urlparse(self.path).path == "/api/ada":
            self._reply(200, {
                "ok": True,
                "model": AI_MODEL if AI_API_KEY else OLLAMA_MODEL,
                "ollama": ollama_up(),
                "api": bool(AI_API_KEY),
                "visitor": VISITOR_NAME,
                "notes": len(ada_knowledge.TOPICS),
            })
            return
        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path not in ("/api/ada", "/api/ada/generate"):
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

        mode = (body.get("mode") or "chat").strip().lower()
        if path.endswith("/generate"):
            mode = "generate"
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

        try:
            result = self._handle(mode, message, history, language, framework, difficulty, output, files)
            self._reply(200, result)
        except (URLError, TimeoutError, ValueError, OSError, HTTPError):
            self._reply(200, {"reply": FAIL_MSG, "source": "error", "ok": False})
        except Exception:
            self._reply(200, {"reply": FAIL_MSG, "source": "error", "ok": False})

    def _handle(self, mode, message, history, language, framework, difficulty, output, files):
        extra = ""
        if files:
            extra = "\n\nProject files currently open:\n"
            for item in files[:12]:
                path = (item.get("path") or "file")[:80]
                content = (item.get("content") or "")[:6000]
                extra += "\n--- %s ---\n%s\n" % (path, content)

        if mode == "generate":
            spec = (
                "Build this:\n%s\n\nLanguage: %s\nFramework: %s\n"
                "Difficulty: %s\nOutput: %s%s"
                % (message, language, framework, difficulty, output, extra)
            )
            reply, source = ask_model(GENERATE_PROMPT, spec)
            parsed = extract_json(reply)
            out_files = normalize_files(parsed, reply, language)
            title = (parsed or {}).get("title") if isinstance(parsed, dict) else ""
            summary = (parsed or {}).get("summary") if isinstance(parsed, dict) else ""
            return {
                "ok": True,
                "reply": summary or "Here is a first version. Edit it, then ask me to improve it.",
                "title": title or "Generated project",
                "files": out_files,
                "source": source,
            }

        if mode == "challenge":
            spec = "Language: %s\nDifficulty: %s\nTopic: %s" % (language, difficulty, message)
            reply, source = ask_model(CHALLENGE_PROMPT, spec)
            parsed = extract_json(reply) or {}
            if not parsed.get("title"):
                parsed = {
                    "title": "Practice: " + message[:40],
                    "description": reply[:800],
                    "starter": "// write your solution\n",
                    "hints": ["Read the description twice.", "Print a small example first."],
                    "solution": "",
                    "language": language,
                    "difficulty": difficulty,
                    "topic": message,
                }
            parsed["source"] = source
            parsed["ok"] = True
            parsed["reply"] = parsed.get("description") or "Challenge ready."
            return parsed

        if mode in ("explain", "improve", "debug", "hint"):
            jobs = {
                "explain": "Explain this code clearly for a beginner. Use markdown. Do not dump a full rewrite unless needed.",
                "improve": "Improve this code. Show the improved version in a fenced block, then list what changed.",
                "debug": "Find real bugs. Explain the cause, then show corrected code. Do not invent errors.",
                "hint": "Give a small hint only. Do not reveal the full solution.",
            }
            prompt = jobs[mode] + "\n\nUser:\n" + message + extra
            reply, source = ask_model(MENTOR_PROMPT, history_prompt(history, prompt))
            return {"ok": True, "reply": reply, "source": source}

        if looks_like_greeting(message) and not looks_like_code_task(message):
            return {"ok": True, "reply": greeting_reply(), "source": "greeting"}

        note, note_score = ada_knowledge.lookup(message, min_score=2)
        use_notes = (
            note and note_score >= 5
            and not looks_like_code_task(message)
            and mode == "chat"
        )
        if use_notes:
            return {"ok": True, "reply": "Hey %s — %s" % (VISITOR_NAME, note), "source": "notes"}

        try:
            reply, source = ask_model(MENTOR_PROMPT, history_prompt(history, message + extra))
            return {"ok": True, "reply": reply, "source": source}
        except (URLError, TimeoutError, ValueError, OSError, HTTPError):
            return {"ok": True, "reply": fallback_tutor(message), "source": "notes"}

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
    print("Ada server listening on http://%s:%s (model: %s)" % (HOST, PORT, AI_MODEL if AI_API_KEY else OLLAMA_MODEL))
    print("Open http://127.0.0.1:%s/pages/ada.html" % PORT)
    server.serve_forever()
