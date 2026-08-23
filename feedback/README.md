# Semicolon Feedback & Bug Center

This directory defines the feedback-center contract for Semicolon.

## Purpose

Collect visitor complaints, bug reports, and feature requests without exposing secrets or personal data.

## Categories

- `bug` — broken behavior or error
- `complaint` — usability/content problem
- `feature` — requested improvement
- `ai` — Ada answer/knowledge problem
- `ui` — visual/mobile issue

## Privacy

Do not store API keys, passwords, authentication tokens, IP addresses, or unnecessary personal information.

## Suggested API contract

`POST /api/feedback`

```json
{
  "type": "bug",
  "message": "The preview does not load on mobile",
  "page": "/ada.html",
  "severity": "medium"
}
```

`GET /api/feedback` is an admin-only endpoint. It must require the existing admin authentication mechanism and must never be public.

The production implementation should persist reports in the existing server datastore and expose an authenticated admin dashboard. Do not put credentials in this repository.
