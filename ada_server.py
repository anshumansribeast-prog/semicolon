"""Ada's brain — HTTP API for Semicolon chat, code generation, and practice.

Stdlib only. Talks to Ollama on the server, or an OpenAI-compatible API
when AI_API_KEY is set. Keys never go to the browser.
"""

import html as htmlmod
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
HISTORY_TURNS = 20
TURN_CHARS = 5000

ada_knowledge.VISITOR = VISITOR_NAME

CHAT_PROMPT = f"""You are Ada, a capable AI assistant inside Semicolon (https://semicolon.punah.pro).

Talk like a real chat with ChatGPT or Claude: warm, clear, specific, and useful.
Keep the thread. Follow-ups mean "change what we just did", not a brand-new start.

You can discuss any topic — coding, school, science, writing, planning, hobbies,
design, data, games, business ideas. Answer the question they actually asked.

Coding is your strongest skill. If they want code for ANY subject (a bakery site,
a physics quiz, a cricket scoreboard, a song lyric helper, a farm inventory,
a photo gallery, whatever is lawful), write complete working code.

When you write code:
1. Understand the request.
2. Pick a sensible language if they did not.
3. Put each file in a markdown fence with a language tag.
4. Start a fence with a first-line comment like: file: index.html
5. Explain the important parts briefly.
6. Say how to run it when useful.
7. Mention real limits only. Do not invent bugs.

When they paste broken code: name the real problem, explain why, show the fix.

You are talking to {VISITOR_NAME}. Use their name naturally, not every sentence.
Never say Student. Never reveal API keys, stack traces, or server paths.
Do not refuse ordinary questions. Do not pretend you cannot write code for a topic.
"""

GENERATE_PROMPT = """You are Ada writing project files for Semicolon's Code Generator.

The user may ask for ANY topic — websites, games, tools, school work, data,
art, shops, dashboards, scripts. Build what they asked for.

Prefer markdown fences over JSON. For every file:

```html
<!-- file: index.html -->
...full contents...
```

```css
/* file: style.css */
...
```

```javascript
// file: script.js
...
```

```python
# file: main.py
...
```

Rules:
- Working code. Match the language, framework, difficulty, and output mode.
- Full project / website: index.html, style.css, script.js, README.md unless
  another language was chosen.
- Single file: one main file plus README.md.
- HTML/CSS/JS can be previewed in a browser. Other languages are shown, not run.
- Put the user's topic in the title, copy, and behaviour — do not emit a generic
  hello-world if they asked for something specific.
- Lawful projects only. No malware, exploits, or credential theft.
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
        "Ask again in a moment, or open the Code Generator and describe any topic — files will appear in the editor."
    )
    return "\n\n".join(bits)


FILE_MARK = re.compile(
    r"(?:file|path|filename)\s*[:=]\s*([A-Za-z0-9._\-/]+)",
    re.IGNORECASE,
)


def default_name(language):
    return {
        "html": "index.html", "css": "style.css", "javascript": "script.js",
        "python": "main.py", "c": "main.c", "c++": "main.cpp", "java": "Main.java",
        "sql": "query.sql", "typescript": "main.ts", "react": "App.jsx",
    }.get((language or "txt").lower(), "main.txt")


def ext_for_lang(lang):
    return {
        "html": "html", "css": "css", "javascript": "js", "js": "js",
        "python": "py", "py": "py", "c": "c", "cpp": "cpp", "c++": "cpp",
        "java": "java", "sql": "sql", "ts": "ts", "typescript": "ts",
        "json": "json", "md": "md", "markdown": "md", "jsx": "jsx", "tsx": "tsx",
    }.get((lang or "").lower(), "txt")


def files_from_markdown(text):
    files = []
    pattern = re.compile(r"```(\w+)?\n(.*?)```", re.DOTALL)
    n = 0
    for lang, body in pattern.findall(text or ""):
        n += 1
        raw = body.strip("\n")
        first, _, rest = raw.partition("\n")
        path = None
        marked = FILE_MARK.search(first or "")
        if marked:
            path = marked.group(1).lstrip("./")
            raw = rest
        elif re.match(r"^[\w./-]+\.(html|css|js|py|c|cpp|java|sql|ts|jsx|md|json)$", (first or "").strip(), re.I):
            path = first.strip()
            raw = rest
        if not path:
            path = "file-%s.%s" % (n, ext_for_lang(lang))
        files.append({"path": path.replace("..", ""), "content": raw.strip("\n")})
    return files


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
        files = files_from_markdown(fallback_text)
    return files


def files_are_weak(files):
    if not files:
        return True
    text = "\n".join((f.get("content") or "") for f in files).strip()
    if not text or FAIL_MSG in text:
        return True
    if len(text) < 40:
        return True
    return False


def safe_title(message):
    t = re.sub(r"\s+", " ", (message or "").strip())[:72]
    t = t.replace("%", " percent")
    return t or "My project"


def local_project(message, language, framework, difficulty, output):
    """Always-working files so Generate never leaves an empty editor."""
    title = safe_title(message)
    esc = htmlmod.escape(title)
    lang = (language or "html").lower()
    fw = (framework or "none").lower()
    out = (output or "project").lower()
    readme = (
        "# %s\n\nGenerated on Semicolon for: %s\n\n"
        "Language: %s · Difficulty: %s\n\n"
        "HTML/CSS/JS: open index.html or use Run / Preview.\n"
        "Other languages: copy the files and run them on your machine. "
        "Semicolon does not execute Python/C/Java on the server.\n"
        % (title, title, language, difficulty)
    )

    if lang in ("python", "py"):
        return [
            {"path": "main.py", "content": (
                '"""%s"""\n\n'
                "def main():\n"
                "    topic = %r\n"
                "    print(\"Semicolon ·\", topic)\n"
                "    items = [line.strip() for line in topic.replace(\".\", \",\").split(\",\") if line.strip()]\n"
                "    if not items:\n"
                "        items = [topic]\n"
                "    for i, item in enumerate(items, 1):\n"
                "        print(f\"{i}. {item}\")\n"
                "    return items\n\n"
                "if __name__ == \"__main__\":\n"
                "    main()\n"
            ) % (title, title)},
            {"path": "README.md", "content": readme + "\nRun: python3 main.py\n"},
        ]

    if lang in ("c",):
        return [
            {"path": "main.c", "content": (
                "#include <stdio.h>\n\nint main(void) {\n"
                "    printf(\"Semicolon\\n%s\\n\");\n"
                "    return 0;\n}\n"
            ) % title.replace("\\", "\\\\").replace("\"", "\\\"")},
            {"path": "README.md", "content": readme + "\nCompile: gcc main.c -o app && ./app\n"},
        ]

    if lang in ("c++", "cpp"):
        return [
            {"path": "main.cpp", "content": (
                "#include <iostream>\n#include <string>\nint main() {\n"
                "    std::cout << \"Semicolon\\n%s\\n\";\n"
                "    return 0;\n}\n"
            ) % title.replace("\\", "\\\\").replace("\"", "\\\"")},
            {"path": "README.md", "content": readme + "\nCompile: g++ main.cpp -o app && ./app\n"},
        ]

    if lang == "java":
        return [
            {"path": "Main.java", "content": (
                "public class Main {\n"
                "  public static void main(String[] args) {\n"
                "    System.out.println(\"Semicolon\");\n"
                "    System.out.println(\"%s\");\n"
                "  }\n}\n"
            ) % title.replace("\\", "\\\\").replace("\"", "\\\"")},
            {"path": "README.md", "content": readme + "\nRun: javac Main.java && java Main\n"},
        ]

    if lang == "sql":
        return [
            {"path": "query.sql", "content": (
                "-- %s\n"
                "CREATE TABLE items (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  notes TEXT\n);\n\n"
                "INSERT INTO items (name, notes) VALUES ('%s', 'generated on Semicolon');\n\n"
                "SELECT * FROM items;\n"
            ) % (title, title.replace("'", "''"))},
            {"path": "README.md", "content": readme},
        ]

    if lang in ("css",) and out == "single":
        return [
            {"path": "style.css", "content": (
                "/* %s */\n:root { --ink:#0f172a; --accent:#4f46e5; }\n"
                "body { font-family: system-ui, sans-serif; margin:0; color:var(--ink); }\n"
                "header { padding:2rem; background:linear-gradient(135deg,#4f46e5,#e11d48); color:#fff; }\n"
                "main { max-width:52rem; margin:0 auto; padding:2rem 1rem; }\n"
            ) % title},
            {"path": "README.md", "content": readme},
        ]

    js = (
        "const topic = %s;\n"
        "const app = document.getElementById(\"app\");\n"
        "document.getElementById(\"title\").textContent = topic;\n"
        "const form = document.getElementById(\"add\");\n"
        "const list = document.getElementById(\"list\");\n"
        "const saved = JSON.parse(localStorage.getItem(\"semi-\" + topic) || \"[]\");\n"
        "function draw() {\n"
        "  list.innerHTML = \"\";\n"
        "  saved.forEach(function (item, i) {\n"
        "    const li = document.createElement(\"li\");\n"
        "    li.textContent = item;\n"
        "    li.tabIndex = 0;\n"
        "    li.addEventListener(\"click\", function () {\n"
        "      saved.splice(i, 1);\n"
        "      localStorage.setItem(\"semi-\" + topic, JSON.stringify(saved));\n"
        "      draw();\n"
        "    });\n"
        "    list.appendChild(li);\n"
        "  });\n"
        "}\n"
        "form.addEventListener(\"submit\", function (e) {\n"
        "  e.preventDefault();\n"
        "  const input = document.getElementById(\"item\");\n"
        "  const v = input.value.trim();\n"
        "  if (!v) return;\n"
        "  saved.push(v);\n"
        "  localStorage.setItem(\"semi-\" + topic, JSON.stringify(saved));\n"
        "  input.value = \"\";\n"
        "  draw();\n"
        "});\n"
        "draw();\n"
        "console.log(\"Ada built:\", topic);\n"
    ) % json.dumps(title)

    css = (
        ":root { --bg:#0b1020; --card:#161b33; --ink:#f8fafc; --muted:#a5b4fc; --accent:#6366f1; }\n"
        "* { box-sizing: border-box; }\n"
        "body { margin:0; font-family: system-ui, sans-serif; background:radial-gradient(1200px 500px at 10% -10%, #312e81, var(--bg)); color:var(--ink); min-height:100vh; }\n"
        "header, main { max-width: 52rem; margin: 0 auto; padding: 1.4rem 1.1rem; }\n"
        "h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); margin: 0 0 .4rem; }\n"
        "p.lead { color: var(--muted); }\n"
        ".card { background: var(--card); border: 1px solid #312e81; border-radius: 18px; padding: 1.1rem; }\n"
        "form { display:flex; gap:.5rem; margin: 1rem 0; }\n"
        "input, button { font: inherit; padding: .7rem .85rem; border-radius: 12px; border: 1px solid #4338ca; }\n"
        "input { flex:1; background:#0b1020; color:inherit; }\n"
        "button { background: var(--accent); color:#fff; border:0; cursor:pointer; }\n"
        "ul { list-style:none; padding:0; margin:0; display:grid; gap:.45rem; }\n"
        "li { padding:.7rem .85rem; background:#0b1020; border-radius:12px; cursor:pointer; }\n"
        "footer { opacity:.7; font-size:.85rem; margin-top:1.5rem; }\n"
    )

    react_note = ""
    if "react" in fw:
        react_note = "<p class=\"lead\">React-style UI in the browser (no build step). Click a list item to remove it.</p>\n"

    page = (
        "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n"
        "  <meta charset=\"UTF-8\">\n"
        "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
        "  <title>%s</title>\n"
        "  <link rel=\"stylesheet\" href=\"style.css\">\n"
        "</head>\n<body>\n"
        "  <header>\n    <p>Semicolon · Code Generator</p>\n"
        "    <h1 id=\"title\">%s</h1>\n"
        "    <p class=\"lead\">Built from your prompt. Add notes, click a row to remove it. Saved in this browser.</p>\n"
        "    %s"
        "  </header>\n  <main class=\"card\" id=\"app\">\n"
        "    <form id=\"add\">\n"
        "      <label class=\"sr-only\" for=\"item\">Add</label>\n"
        "      <input id=\"item\" placeholder=\"Add something about this topic…\" autocomplete=\"off\">\n"
        "      <button type=\"submit\">Add</button>\n"
        "    </form>\n    <ul id=\"list\"></ul>\n"
        "  </main>\n  <footer>\n    <p>Made with Ada on Semicolon. Learn. Code. Build.</p>\n"
        "  </footer>\n  <script src=\"script.js\"></script>\n"
        "</body>\n</html>\n"
    ) % (esc, esc, react_note)

    if lang == "javascript" and out == "single":
        return [
            {"path": "script.js", "content": js},
            {"path": "README.md", "content": readme},
        ]
    if lang == "html" and out == "single":
        bundled = page.replace(
            '  <link rel="stylesheet" href="style.css">\n',
            "  <style>\n" + css + "  </style>\n",
        ).replace('  <script src="script.js"></script>\n', "  <script>\n" + js + "  </script>\n")
        return [
            {"path": "index.html", "content": bundled},
            {"path": "README.md", "content": readme},
        ]

    files = [
        {"path": "index.html", "content": page},
        {"path": "style.css", "content": css},
        {"path": "script.js", "content": js},
        {"path": "README.md", "content": readme},
    ]
    if lang == "typescript":
        files.append({"path": "main.ts", "content": "const topic: string = %s;\nconsole.log(topic);\n" % json.dumps(title)})
    return files


def merge_or_local(model_files, message, language, framework, difficulty, output):
    if files_are_weak(model_files):
        return local_project(message, language, framework, difficulty, output), True
    return model_files, False


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
            if mode == "generate":
                self._reply(200, {
                    "ok": True,
                    "reply": "Here is a working first version of **%s**. Edit it, preview HTML, or press Generate again." % safe_title(message),
                    "title": safe_title(message),
                    "files": local_project(message, language, framework, difficulty, output),
                    "source": "local",
                })
            elif mode == "challenge":
                self._reply(200, self._local_challenge(message, language, difficulty))
            else:
                self._reply(200, {
                    "ok": True,
                    "reply": fallback_tutor(message, history),
                    "source": "fallback",
                })
        except Exception:
            if mode == "generate":
                self._reply(200, {
                    "ok": True,
                    "reply": "Here is a working first version you can edit.",
                    "files": local_project(message, language, framework, difficulty, output),
                    "source": "local",
                })
            else:
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

        if mode == "generate":
            spec = (
                "Build this (any topic is allowed):\n%s\n\nLanguage: %s\nFramework: %s\n"
                "Difficulty: %s\nOutput: %s%s"
                % (message, language, framework, difficulty, output, extra)
            )
            reply = ""
            source = "local"
            try:
                reply, source = ask_model(GENERATE_PROMPT, spec, history)
            except (URLError, TimeoutError, ValueError, OSError, HTTPError):
                reply = ""
                source = "local"
            parsed = extract_json(reply) if reply else None
            out_files = normalize_files(parsed, reply, language)
            out_files, used_local = merge_or_local(out_files, message, language, framework, difficulty, output)
            if used_local:
                source = "local" if not reply else source
            summary = ""
            if isinstance(parsed, dict):
                summary = parsed.get("summary") or ""
            if not summary and reply and not files_are_weak(out_files) and source != "local":
                summary = "Here is **%s**. Files are in the editor — preview HTML, or ask me to change anything." % safe_title(message)
            if not summary:
                summary = "Here is a working first version of **%s**. Edit the files, run the preview, then tell Ada what to change." % safe_title(message)
            title = (parsed or {}).get("title") if isinstance(parsed, dict) else ""
            return {
                "ok": True,
                "reply": summary,
                "title": title or safe_title(message),
                "files": out_files,
                "source": source,
            }

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
