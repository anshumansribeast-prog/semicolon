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
SYSTEM_PROMPT = (
    "You are Ada, a friendly coding tutor on Semicolon, a free learn-to-code "
    "site for a complete beginner (a class 8 student). When they're stuck, "
    "explain the concept simply and point them toward the fix rather than just "
    "handing over a finished solution, unless they clearly ask for the actual "
    "code. Keep replies short (3-5 sentences), plain text, no markdown."
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

        prompt = ""
        for turn in history[-6:]:
            role = "Student" if turn.get("role") == "user" else "Ada"
            prompt += f"{role}: {turn.get('content', '')}\n"
        prompt += f"Student: {message}\nAda:"

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
