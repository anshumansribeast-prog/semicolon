"""Ada's brain — HTTP API for Semicolon chat, projects, and practice.

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
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:7b")
AI_API_URL = os.environ.get("AI_API_URL", "").strip()
AI_API_KEY = os.environ.get("AI_API_KEY", "").strip()
AI_MODEL = os.environ.get("AI_MODEL", "").strip() or OLLAMA_MODEL
VISITOR_NAME = os.environ.get("ADA_VISITOR_NAME", "AnshX")
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


def resolve_host(host, timeout=1.5):
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


def tcp_open(url, timeout=2.0):
    parsed = urlparse(url)
    host = parsed.hostname
    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    if not host:
        return False
    ip = resolve_host(host, timeout=min(timeout, 1.5))
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


def ask_ollama_chat(messages):
    last_error = None
    for gen_url in ollama_candidates():
        chat_url = gen_url.replace("/api/generate", "/api/chat")
        if not tcp_open(chat_url, timeout=2.0) and not tcp_open(gen_url, timeout=2.0):
            continue
        try:
            payload = json.dumps({
                "model": OLLAMA_MODEL,
                "messages": messages,
                "stream": False,
            }).encode()
            req = urlreq.Request(chat_url, data=payload, headers={"Content-Type": "application/json"})
            with urlreq.urlopen(req, timeout=90) as resp:
                data = json.loads(resp.read())
                msg = (data.get("message") or {}).get("content", "").strip()
                if msg:
                    return msg
        except (URLError, TimeoutError, ValueError, OSError, HTTPError) as err:
            last_error = err
        try:
            system = ""
            prompt = ""
            for m in messages:
                if m["role"] == "system":
                    system = m["content"]
                else:
                    prompt += "%s: %s\n" % ("Ada" if m["role"] == "assistant" else VISITOR_NAME, m["content"])
            payload = json.dumps({
                "model": OLLAMA_MODEL,
                "prompt": prompt + "Ada:",
                "system": system,
                "stream": False,
            }).encode()
            req = urlreq.Request(gen_url, data=payload, headers={"Content-Type": "application/json"})
            with urlreq.urlopen(req, timeout=90) as resp:
                reply = json.loads(resp.read()).get("response", "").strip()
                if reply:
                    return reply
        except (URLError, TimeoutError, ValueError, OSError, HTTPError) as err:
            last_error = err
            continue
    raise last_error or URLError("no Ollama URL to try")


def ask_model(system, prompt, history=None):
    messages = build_messages(system, prompt, history)
    if AI_API_KEY:
        try:
            reply = ask_openai_compatible(messages)
            if reply:
                return reply, "api"
        except (URLError, TimeoutError, ValueError, OSError, HTTPError, KeyError):
            pass
    reply = ask_ollama_chat(messages)
    return reply, "ollama"


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


def ollama_up():
    for url in ollama_candidates():
        if tcp_open(url, timeout=1.8):
            return True
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
        if path not in ("/api/ada",):
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
    print("Ada server listening on http://%s:%s (model: %s)" % (HOST, PORT, AI_MODEL if AI_API_KEY else OLLAMA_MODEL))
    print("Open http://127.0.0.1:%s/pages/ada.html" % PORT)
    server.serve_forever()
