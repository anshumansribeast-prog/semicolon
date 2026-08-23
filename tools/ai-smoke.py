#!/usr/bin/env python3
"""Safe CI smoke tests for Ada. No provider key is stored here."""
import json
import sys
from urllib.request import Request, urlopen

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080").rstrip("/")


def get(path):
    with urlopen(BASE + path, timeout=10) as r:
        return json.loads(r.read().decode())


def ask(message, history=None):
    body = {"mode": "chat", "message": message, "history": history or []}
    req = Request(BASE + "/api/ada", data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    with urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())

status = get("/api/ada")
assert status.get("ok") is True, status

if status.get("api"):
    # When the real model is configured, verify broad chatbot coverage and memory.
    questions = [
        "Explain Python dictionaries to a beginner.",
        "What is photosynthesis?",
        "What caused the French Revolution?",
        "What is the capital of Japan?",
        "What is 17 times 23?",
        "What is a black hole?",
        "What is an HTTP request?",
    ]
    for q in questions:
        result = ask(q)
        reply = (result.get("reply") or "").strip()
        assert result.get("ok", True) is not False and len(reply) >= 20, (q, result)
    first = ask("Remember this test word: NEBULA-42.")
    second = ask("What test word did I just ask you to remember?", [{"role":"user","content":"Remember this test word: NEBULA-42."},{"role":"assistant","content":first.get("reply","")}])
    assert "nebula-42" in (second.get("reply") or "").lower(), second
else:
    # CI normally has no secret provider key, so verify the offline contract
    # instead of pretending the live model was tested.
    for q in ["hello", "python print", "git", "HTML"]:
        result = ask(q)
        assert (result.get("reply") or "").strip(), (q, result)

print("Ada AI smoke tests: PASS")
