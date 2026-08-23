"""Runtime wrapper for Ada.

Keeps the existing Ada server intact while adding a conditional second-model
fallback. The fallback is used only for a genuine uncertainty marker or an
explicit uncertainty response, never for every normal question.
"""
import os
from http.server import ThreadingHTTPServer
from urllib import request as urlreq
from urllib.error import HTTPError, URLError
import json

import ada_server

FALLBACK_URL = os.environ.get("ADA_FALLBACK_API_URL", "").strip()
FALLBACK_KEY = os.environ.get("ADA_FALLBACK_API_KEY", "").strip()
FALLBACK_MODEL = os.environ.get("ADA_FALLBACK_MODEL", "").strip()

_original_ask_model = ada_server.ask_model


def _call_fallback(messages):
    if not (FALLBACK_URL and FALLBACK_KEY and FALLBACK_MODEL):
        return None
    url = FALLBACK_URL.rstrip("/")
    if not url.endswith("/chat/completions"):
        url += "/chat/completions"
    payload = json.dumps({
        "model": FALLBACK_MODEL,
        "messages": messages,
        "temperature": 0.4,
    }).encode()
    req = urlreq.Request(url, data=payload, headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer " + FALLBACK_KEY,
    })
    with urlreq.urlopen(req, timeout=90) as resp:
        data = json.loads(resp.read())
    choices = data.get("choices") or []
    if not choices:
        return None
    return ((choices[0].get("message") or {}).get("content") or "").strip() or None


def _needs_fallback(reply):
    if not reply:
        return True
    text = reply.lower().strip()
    if "[out_of_knowledge]" in text:
        return True
    return any(x in text for x in (
        "i don't know",
        "i do not know",
        "i can't answer that",
        "i cannot answer that",
        "i'm not sure",
        "i am not sure",
    ))


def routed_ask_model(system, prompt, history=None):
    try:
        reply, source = _original_ask_model(system, prompt, history)
    except Exception:
        # Preserve Ada's existing exception contract for its local fallback.
        raise

    if not _needs_fallback(reply):
        return reply, source

    if not (FALLBACK_URL and FALLBACK_KEY and FALLBACK_MODEL):
        return reply, source

    messages = ada_server.build_messages(system, prompt, history)
    try:
        fallback = _call_fallback(messages)
    except (URLError, HTTPError, TimeoutError, ValueError, OSError):
        fallback = None
    if fallback:
        return fallback, "fallback"
    return reply, source


ada_server.ask_model = routed_ask_model


if __name__ == "__main__":
    server = ThreadingHTTPServer((ada_server.HOST, ada_server.PORT), ada_server.AdaHandler)
    print("Ada runtime listening on http://%s:%s" % (ada_server.HOST, ada_server.PORT))
    print("Conditional fallback configured: %s" % bool(FALLBACK_URL and FALLBACK_KEY and FALLBACK_MODEL))
    server.serve_forever()
