"""Ada's brain — a tiny local HTTP server bridging Semicolon's Ada
chat widget (js/ada.js) to Ollama, the same local AI model Jarvis
uses. A static site's browser JS can't reach Ollama directly (it only
listens on localhost with no CORS headers), so this fills that gap.

Run:  python ada_server.py     (needs `ollama serve` already running)

This only serves localhost. Ada only answers while THIS machine is
running this script — it does not make Ada work for a real visitor
on the deployed site unless this computer is itself the public server.
Zero extra dependencies: stdlib only, same spirit as Cosmos v2's server.
"""

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib import request as urlreq
from urllib.error import URLError

PORT = 8420
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2:3b"
SYSTEM_PROMPT = (
    "You are Ada, a friendly coding tutor on Semicolon, a free learn-to-code "
    "site for a complete beginner (a class 8 student). When they're stuck, "
    "explain the concept simply and point them toward the fix rather than just "
    "handing over a finished solution, unless they clearly ask for the actual "
    "code. Keep replies short (3-5 sentences), plain text, no markdown."
)


class AdaHandler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path != "/api/ada":
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
        except (URLError, TimeoutError, ValueError):
            self._reply(502, {"error": "Ollama isn't reachable - is `ollama serve` running?"})
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
    server = ThreadingHTTPServer(("localhost", PORT), AdaHandler)
    print(f"Ada server listening on http://localhost:{PORT} (Ollama model: {OLLAMA_MODEL})")
    server.serve_forever()
