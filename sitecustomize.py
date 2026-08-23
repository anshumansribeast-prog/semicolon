"""Ada process bootstrap: preserves visitor config and adds a conditional OpenAI fallback."""
import json
import os
import re
from urllib import request as _request

# Preserve existing behavior: only use a configured visitor name.
if not os.environ.get("ADA_VISITOR_NAME"):
    os.environ["ADA_VISITOR_NAME"] = ""

MARKER = "[OUT_OF_KNOWLEDGE]"
UNCERTAIN_RE = re.compile(
    r"(?:^|\s)(?:i\s+(?:don't|do not)\s+know|i\s+(?:cannot|can't)\s+answer|"
    r"i\s+(?:cannot|can't)\s+verify|not\s+enough\s+information|"
    r"outside\s+my\s+knowledge|unknown\s+to\s+me)(?:\s|[.!?,]|$)", re.I)
_original_urlopen = _request.urlopen


def should_fallback(text):
    value = str(text or "").strip()
    return MARKER in value or bool(UNCERTAIN_RE.search(value))


def _openai_answer(messages):
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not key:
        return None
    url = os.environ.get("OPENAI_API_URL", "https://api.openai.com/v1/responses").strip()
    model = os.environ.get("OPENAI_MODEL", "gpt-5.6-luna").strip()
    parts = []
    for item in messages:
        role = item.get("role", "user")
        content = str(item.get("content", ""))
        if role == "system":
            content += "\nFallback: answer only when you genuinely know enough; never invent facts."
        parts.append(f"{role.upper()}: {content}")
    payload = json.dumps({"model": model, "input": "\n\n".join(parts), "temperature": 0.2}).encode()
    req = _request.Request(url, data=payload, headers={
        "Content-Type": "application/json", "Authorization": "Bearer " + key,
    })
    try:
        with _original_urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read())
        return str(data.get("output_text") or "").strip() or None
    except Exception as exc:
        print("[ada] OpenAI fallback unavailable:", type(exc).__name__)
        return None


def _memory_response(payload):
    data = json.dumps(payload).encode("utf-8")
    class MemoryResponse:
        def read(self): return data
        def __enter__(self): return self
        def __exit__(self, *exc): return False
    return MemoryResponse()


def _patched_urlopen(req, *args, **kwargs):
    try:
        url = getattr(req, "full_url", "")
        raw = getattr(req, "data", None)
        if raw and url.endswith("/chat/completions"):
            body = json.loads(raw.decode("utf-8"))
            messages = body.get("messages") or []
            system = next((m for m in messages if m.get("role") == "system"), None)
            if system:
                system["content"] = str(system.get("content", "")) + (
                    "\n\nWhen you genuinely do not know enough to answer, begin with [OUT_OF_KNOWLEDGE]. "
                    "Do not use this marker for normal questions you can answer."
                )
                req.data = json.dumps(body).encode("utf-8")
            try:
                response = _original_urlopen(req, *args, **kwargs)
                data = json.loads(response.read())
                if hasattr(response, "close"): response.close()
                answer = str((((data.get("choices") or [{}])[0]).get("message") or {}).get("content") or "").strip()
                if should_fallback(answer):
                    fallback = _openai_answer(messages)
                    if fallback:
                        data = {"choices": [{"message": {"role": "assistant", "content": "That's a good one — let me check that for you.\n\n" + fallback}}]}
                return _memory_response(data)
            except Exception:
                fallback = _openai_answer(messages)
                if fallback:
                    return _memory_response({"choices": [{"message": {"role": "assistant", "content": "That's a good one — let me check that for you.\n\n" + fallback}}]})
    except Exception:
        pass
    return _original_urlopen(req, *args, **kwargs)


_request.urlopen = _patched_urlopen
