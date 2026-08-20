#!/usr/bin/env python3
"""Fast static checks for Semicolon pages.

The site has no build step, so this script catches the mistakes a build would
usually catch: missing linked assets, broken same-page anchors, duplicate IDs,
and JavaScript/Python syntax errors. It intentionally avoids network checks so
it is safe in CI and works offline.
"""

from __future__ import annotations

import html.parser
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_PREFIXES = ("http://", "https://", "mailto:", "tel:", "data:", "javascript:")


class PageParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.refs: list[tuple[str, str, str]] = []
        self.ids: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {name: value for name, value in attrs if value is not None}
        if "id" in data:
            self.ids.append(data["id"])
        for attr in ("href", "src"):
            if attr in data:
                self.refs.append((tag, attr, data[attr]))


def html_files() -> list[Path]:
    return sorted([ROOT / "index.html", ROOT / "404.html", *(ROOT / "pages").glob("*.html")])


def page_path(page: Path, raw_url: str) -> tuple[Path | None, str | None]:
    path, _, fragment = raw_url.partition("#")
    path = path.split("?", 1)[0]
    if not path and fragment:
        return page, fragment
    if not path or raw_url.startswith(SKIP_PREFIXES):
        return None, fragment or None
    if path.startswith("/"):
        target = ROOT / path.lstrip("/")
    else:
        target = page.parent / path
    return target.resolve(), fragment or None


def check_html() -> list[str]:
    errors: list[str] = []
    for page in html_files():
        parser = PageParser()
        text = page.read_text(encoding="utf-8")
        parser.feed(text)
        rel = page.relative_to(ROOT)

        seen: set[str] = set()
        for id_value in parser.ids:
            if id_value in seen:
                errors.append(f"{rel}: duplicate id #{id_value}")
            seen.add(id_value)

        ids = set(parser.ids) | {"top"}
        for tag, attr, raw_url in parser.refs:
            if raw_url.startswith(SKIP_PREFIXES):
                continue
            target, fragment = page_path(page, raw_url)
            if target and not target.exists():
                errors.append(f"{rel}: missing {tag}[{attr}] {raw_url!r} -> {target.relative_to(ROOT) if target.is_relative_to(ROOT) else target}")
                continue
            if fragment and target == page.resolve() and fragment not in ids:
                errors.append(f"{rel}: missing same-page anchor #{fragment}")
    return errors


def run(cmd: list[str]) -> tuple[int, str]:
    proc = subprocess.run(cmd, cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    return proc.returncode, proc.stdout.strip()


def check_syntax() -> list[str]:
    errors: list[str] = []
    js_files = ["components/ui.js", *[str(p.relative_to(ROOT)) for p in sorted((ROOT / "js").glob("*.js"))]]
    code, out = run(["node", "--check", *js_files])
    if code:
        errors.append("JavaScript syntax check failed:\n" + out)

    py_files = [str(p.relative_to(ROOT)) for p in [ROOT / "ada_server.py", ROOT / "ada_knowledge.py", ROOT / "tools" / "set-site-url.py"]]
    code, out = run([sys.executable, "-m", "py_compile", *py_files])
    if code:
        errors.append("Python syntax check failed:\n" + out)
    return errors


def main() -> int:
    errors = check_html() + check_syntax()
    if errors:
        print("Site check failed:")
        for error in errors:
            print("- " + error)
        return 1
    print("Site check passed: HTML references, anchors, duplicate IDs, JS syntax, and Python syntax are OK.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
