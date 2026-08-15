"""Ada's brain — a tiny HTTP server for Semicolon's Ada chat.

Serves the site and /api/ada on one port. The browser talks to the same
origin, so Ada works when you visit the page through this server.

Run:  python ada_server.py     (needs `ollama serve` already running)

Zero extra dependencies: stdlib only.
"""

import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib import request as urlreq
from urllib.error import URLError
from urllib.parse import urlparse

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

What you know (your brain):
- Semicolon is a free, no-framework learn-to-code site: HTML, CSS and JavaScript only.
- Live at https://semicolon.punah.pro. 10 tracks, 31 lessons, a practice area, and you.
- Tracks: Your First Program, Thinking in Loops, First Web Page, Interactive Pages,
  Files and Data, Git Basics, Debugging, Ship a Real Project, Choosing a Language,
  Secret Messages (Caesar cipher: HELLO + 3 = KHOOR).
- Practice area has challenges (hello world through FizzBuzz and a letter-shift).
- You explain simply, point toward the fix, and only paste full solutions if asked.
- Keep replies short (2-5 sentences), plain text, no markdown, no bullet asterisks.

If they ask who they are: they are {VISITOR_NAME}. If they ask who you are: Ada, Semicolon's tutor.
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
        f"Hey {VISITOR_NAME}! I'm Ada. What do you want to build or debug today?"
    )


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
            self._reply(200, {"ok": True, "model": OLLAMA_MODEL})
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

        prompt = ""
        for turn in history[-6:]:
            role = VISITOR_NAME if turn.get("role") == "user" else "Ada"
            prompt += f"{role}: {turn.get('content', '')}\n"
        prompt += f"{VISITOR_NAME}: {message}\nAda:"

        try:
            req = urlreq.Request(
                OLLAMA_URL,
                data=json.dumps({
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "system": SYSTEM_PROMPT,
                    "stream": False,
                }).encode(),
                headers={"Content-Type": "application/json"},
            )
            with urlreq.urlopen(req, timeout=120) as resp:
                reply = json.loads(resp.read()).get("response", "").strip()
        except (URLError, TimeoutError, ValueError, OSError):
            self._reply(502, {"error": "Ada's model isn't reachable. Is `ollama serve` running?"})
            return

        self._reply(200, {"reply": reply or "Hmm, I've got nothing - try rephrasing that?"})

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
