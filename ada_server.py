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
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib import request as urlreq
from urllib.error import HTTPError, URLError
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


def ask_ollama(prompt):
    payload = json.dumps({
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "system": SYSTEM_PROMPT,
        "stream": False,
    }).encode()
    last_error = None
    for url in ollama_candidates():
        try:
            req = urlreq.Request(
                url,
                data=payload,
                headers={"Content-Type": "application/json"},
            )
            with urlreq.urlopen(req, timeout=120) as resp:
                reply = json.loads(resp.read()).get("response", "").strip()
                if reply:
                    return reply
        except (URLError, TimeoutError, ValueError, OSError, HTTPError) as err:
            last_error = err
            continue
    raise last_error or URLError("no Ollama URL to try")


def fallback_tutor(message):
    """Answer from Ada's built-in notes when Ollama is not reachable."""
    q = " " + message.lower() + " "
    topics = [
        (["variable", "variables"],
         "A variable is a labelled box. name = \"AnshX\" puts that text in the box called name. "
         "In code, = is an instruction, not a maths fact — the next line can put something else in the same box. "
         "Try the First Program track if you want to type one."),
        (["loop", "loops", "repeat", "for "],
         "A loop makes the computer repeat work. for i in range(1, 11) prints 1 to 10 — the end number is never included. "
         "Use while when you do not know how many times. See Thinking in Loops on Semicolon."),
        (["error", "traceback", "crash", "broke"],
         "Read the error from the bottom up: last line is what went wrong, above that is the code, above that is the file and line. "
         "The line number is where it fell over, not always where the mistake started."),
        (["python"],
         "Python is the best default first language here. Install from python.org, tick Add Python to PATH on Windows, then run python --version before you write a file."),
        (["html", "css", "web page"],
         "HTML is structure (what something IS). CSS is looks. JavaScript is decisions. Build Your First Web Page on Semicolon walks through a real file you can open in a browser."),
        (["git", "commit"],
         "Git remembers every version you save. Write .gitignore first so secrets never get committed. git add then git commit -m \"why you changed it\"."),
        (["cipher", "secret", "caesar"],
         "A Caesar cipher slides letters: HELLO + 3 = KHOOR. Decode by sliding back. Secret Messages is track 10 — there is a full Python example and a web page."),
        (["javascript", "js "],
         "JavaScript is what makes a page react. Find an element, listen for a click, change the text. The Practice area and Interactive Pages track cover that."),
        (["who am i", "my name", "who i am"],
         "You are %s. I am Ada, your tutor on Semicolon." % VISITOR_NAME),
        (["what can you", "help me", "what do you"],
         "Ask me about a lesson, an error, Python, HTML, Git, or the Secret Messages project. Keep it to one stuck thing at a time and I will point you at the fix."),
    ]
    for keys, answer in topics:
        if any(k in q for k in keys):
            return "Hey %s — %s" % (VISITOR_NAME, answer)
    return (
        "Hey %s. I heard you. From my Semicolon notes: start with one stuck thing — "
        "a variable, a loop, an error message, Python, HTML, Git, or the Secret Messages cipher. "
        "Or open https://semicolon.punah.pro/pages/learn.html and paste the line that broke."
        % VISITOR_NAME
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
            ollama_ok = False
            for url in ollama_candidates():
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

        prompt = ""
        for turn in history[-6:]:
            role = VISITOR_NAME if turn.get("role") == "user" else "Ada"
            prompt += f"{role}: {turn.get('content', '')}\n"
        prompt += f"{VISITOR_NAME}: {message}\nAda:"

        try:
            reply = ask_ollama(prompt)
        except (URLError, TimeoutError, ValueError, OSError, HTTPError):
            reply = fallback_tutor(message)

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
