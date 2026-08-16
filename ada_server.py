"""Ada's brain — a tiny HTTP server for Semicolon's Ada chat.

Serves the site and /api/ada on one port. The browser talks to the same
origin, so Ada works when you visit the page through this server.

Run:  python ada_server.py     (needs `ollama serve` already running)

Zero extra dependencies: stdlib only.
"""

import json
import os
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
VISITOR_NAME = os.environ.get("ADA_VISITOR_NAME", "AnshX")
SYSTEM_PROMPT = f"""You are Ada, the coding tutor on Semicolon (https://semicolon.punah.pro).

Who you are talking to:
The person chatting is {VISITOR_NAME} (Anshuman Srivastava), who built this site.
When they say hi, hello, hey, or similar, greet them by name: "Hey {VISITOR_NAME}!"
Never call them Student. Always use {VISITOR_NAME}.

What Semicolon is:
Free, no-framework learn-to-code site: HTML, CSS and JavaScript only. About 130 KB.
Live at https://semicolon.punah.pro. 10 tracks, 31 lessons, a practice area, Web Builder, and you.

Tracks (teach these by name when relevant):
1. Your First Program — install Python, PATH, print, variables, input/int, temperature converter.
2. Thinking in Loops — for, while, range end excluded, infinite loops, Ctrl+C.
3. First Web Page — HTML structure vs CSS looks, flexbox vs grid.
4. Interactive Pages — getElementById, addEventListener, textContent, localStorage + JSON.
5. Files and Data — with open, mode w wipes, JSON.
6. Git Basics — .gitignore first, add, commit, git restore.
7. Debugging — read errors bottom-up, one change at a time, rubber duck.
8. Ship a Real Project — static hosting serves files, it never runs a program.
9. Choosing a Language — Python default, JS for the browser, concepts over brands.
10. Secret Messages — Caesar cipher, HELLO + 3 = KHOOR, letters as numbers.

Core teaching (keep these accurate):
- Variable = labelled box. = stores, == asks.
- input() is always text; int() for maths.
- Python indent is 4 spaces, never mix tabs.
- NameError = unknown name. TypeError = wrong type. NoneType = something returned nothing.
- Lists/arrays index from 0.
- print vs return. console.log in the browser (F12).
- You explain simply, point toward the fix, and only paste full solutions if asked.
- Keep replies short (2-5 sentences), plain text, no markdown, no bullet asterisks.

If they ask who they are: they are {VISITOR_NAME}. If they ask who you are: Ada, Semicolon's tutor.
"""

ada_knowledge.VISITOR = VISITOR_NAME


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
        f"Hey {VISITOR_NAME}! I'm Ada. What do you want to build or debug today?"
    )


def docker_gateway_url():
    """Host IP as seen from inside a Docker bridge network."""
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
    """DNS can hang on names like ollama inside a lone container. Cap it."""
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


def ask_ollama(prompt):
    payload = json.dumps({
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "system": SYSTEM_PROMPT,
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


def fallback_tutor(message):
    """Answer from Ada's written notes (scored keyword bank)."""
    note, score = ada_knowledge.lookup(message, min_score=2)
    if note:
        return "Hey %s — %s" % (VISITOR_NAME, note)
    return ada_knowledge.generic_fallback()


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
            ollama_ok = False
            for url in ollama_candidates():
                if not tcp_open(url, timeout=0.8):
                    continue
                tags = url.replace("/api/generate", "/api/tags")
                try:
                    with urlreq.urlopen(tags, timeout=2) as resp:
                        if resp.status == 200:
                            ollama_ok = True
                            break
                except (URLError, TimeoutError, OSError, ValueError):
                    continue
            self._reply(200, {
                "ok": True,
                "model": OLLAMA_MODEL,
                "ollama": ollama_ok,
                "visitor": VISITOR_NAME,
                "notes": len(ada_knowledge.TOPICS),
            })
            return
        super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path != "/api/ada":
            self.send_response(404)
            self._cors()
            self.end_headers()
            return

        length = int(self.headers.get("Content-Length", 0))
        try:
            body = json.loads(self.rfile.read(length) or b"{}")
        except ValueError:
            body = {}
        message = (body.get("message") or "").strip()
        history = body.get("history") or []

        if not message:
            self._reply(400, {"error": "empty message"})
            return

        if looks_like_greeting(message):
            self._reply(200, {"reply": greeting_reply()})
            return

        note, note_score = ada_knowledge.lookup(message, min_score=2)
        # Strong match: use the written notes so beginners get a stable, accurate answer.
        if note and note_score >= 3:
            self._reply(200, {"reply": "Hey %s — %s" % (VISITOR_NAME, note), "source": "notes"})
            return

        prompt = ""
        for turn in history[-6:]:
            role = VISITOR_NAME if turn.get("role") == "user" else "Ada"
            prompt += f"{role}: {turn.get('content', '')}\n"
        prompt += f"{VISITOR_NAME}: {message}\nAda:"

        try:
            reply = ask_ollama(prompt)
            source = "ollama"
        except (URLError, TimeoutError, ValueError, OSError, HTTPError):
            reply = fallback_tutor(message)
            source = "notes"

        self._reply(200, {
            "reply": reply or "Hmm, I've got nothing - try rephrasing that?",
            "source": source,
        })

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
    print(f"Ada server listening on http://{HOST}:{PORT} (Ollama model: {OLLAMA_MODEL})")
    print(f"Open http://127.0.0.1:{PORT}/pages/ada.html")
    server.serve_forever()
