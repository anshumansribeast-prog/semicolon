"""Ada's brain — local HTTP server bridging Semicolon's Ada tutor
and Screen Demonstration Studio (js/ada.js, js/screen-studio.js) to Ollama.
Powered by the custom trained `ada-tutor` model.

Run: py ada_server.py
"""

import json
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib import request as urlreq
from urllib.error import URLError

PORT = 8420
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "ada-tutor:latest"

SCREEN_DEMO_RE = re.compile(r"<<<SCREEN_DEMO\s*(\{.*?\})\s*>>>", re.DOTALL)


class AdaHandler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path in ("/api/health", "/api/ada/health", "/health"):
            self._reply(200, {
                "status": "online",
                "model": OLLAMA_MODEL,
                "server": "Ada Coding Tutor & Screen Studio Server",
                "capabilities": ["screen_demonstrations", "code_walkthrough", "tutoring"]
            })
            return
        self.send_response(404)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path not in ("/api/ada", "/api/chat"):
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
                    "stream": False,
                }).encode(),
                headers={"Content-Type": "application/json"},
            )
            with urlreq.urlopen(req, timeout=120) as resp:
                raw_reply = json.loads(resp.read()).get("response", "").strip()
        except (URLError, TimeoutError, ValueError) as err:
            self._reply(502, {
                "error": f"Ollama isn't reachable ({err}) - is `ollama serve` running with model '{OLLAMA_MODEL}'?"
            })
            return

        # Parse screen demonstration if emitted by the model
        screen_demo = None
        match = SCREEN_DEMO_RE.search(raw_reply)
        cleaned_text = raw_reply
        if match:
            try:
                screen_demo = json.loads(match.group(1))
                cleaned_text = SCREEN_DEMO_RE.sub("", raw_reply).strip()
            except Exception as e:
                print(f"[ada] Error parsing SCREEN_DEMO JSON: {e}")

        self._reply(200, {
            "reply": cleaned_text or raw_reply or "I'm here! Could you rephrase what you'd like to explore?",
            "screen_demo": screen_demo,
            "raw": raw_reply,
            "model": OLLAMA_MODEL
        })

    def _reply(self, status, payload):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        print("[ada]", fmt % args)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("localhost", PORT), AdaHandler)
    print(f"Ada server listening on http://localhost:{PORT} (Ollama model: {OLLAMA_MODEL})")
    server.serve_forever()
