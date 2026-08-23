"""Small, provider-agnostic model router for Ada.

Primary provider is configured with AI_API_URL/AI_API_KEY/AI_MODEL.
Optional fallback uses OPENAI_API_URL/OPENAI_API_KEY/OPENAI_MODEL.
Secrets are read only from environment variables.
"""
import json
import os
from urllib import request as urlreq
from urllib.error import HTTPError, URLError

UNCERTAINTY_MARKER = "[OUT_OF_KNOWLEDGE]"


def should_fallback(text):
    value = (text or "").strip().lower()
    if not value:
        return True
    if UNCERTAINTY_MARKER.lower() in value:
        return True
    phrases = (
        "i don't know enough to answer",
        "i do not know enough to answer",
        "outside my knowledge",
        "i can't verify that",
        "i cannot verify that",
        "i'm not sure enough to answer",
        "i am not sure enough to answer",
    )
    return any(p in value for p in phrases)


def _call(base_url, api_key, model, messages, temperature=0.4):
    if not base_url or not api_key or not model:
        return None
    url = base_url.rstrip("/")
    if not url.endswith("/chat/completions"):
        url += "/chat/completions"
    payload = json.dumps({"model": model, "messages": messages, "temperature": temperature}).encode()
    req = urlreq.Request(url, data=payload, headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer " + api_key,
    })
    with urlreq.urlopen(req, timeout=90) as resp:
        data = json.loads(resp.read())
    choices = data.get("choices") or []
    if not choices:
        return None
    return ((choices[0].get("message") or {}).get("content") or "").strip() or None


def fallback(system, prompt, history):
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    base_url = os.environ.get("OPENAI_API_URL", "https://api.openai.com/v1").strip()
    model = os.environ.get("OPENAI_MODEL", "").strip()
    if not (api_key and model):
        return None
    messages = [{"role": "system", "content": system}]
    messages.extend(history or [])
    messages.append({"role": "user", "content": prompt})
    return _call(base_url, api_key, model, messages, 0.4)
