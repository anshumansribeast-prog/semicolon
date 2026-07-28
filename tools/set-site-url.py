"""
set-site-url.py — point the whole site at your real domain.

WHY THIS EXISTS
Your site's address appears in four places, and three of them are easy
to forget:

  1. js/config.js        site.url
  2. index.html          <link rel="canonical">
  3. sitemap.xml         every <loc> (11 of them)
  4. robots.txt          the Sitemap: line

Miss one and search engines get pointed at a site that isn't yours.
This does all four at once so they can't drift apart.

USAGE
    python tools/set-site-url.py https://yoursite.com
    python tools/set-site-url.py https://yoursite.com --dry-run

Run it from the project root (the folder with index.html in it).
Always dry-run first — that habit is worth more than this script is.
"""

import re
import sys
from pathlib import Path

PLACEHOLDER = "https://example.com"


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry_run = "--dry-run" in sys.argv

    if not args:
        print(__doc__)
        print("ERROR: no URL given.\n")
        print("  python tools/set-site-url.py https://yoursite.com --dry-run")
        return 1

    new_url = args[0].rstrip("/")

    # Catch the mistakes that produce a broken sitemap rather than an error
    if not re.match(r"^https?://[^/\s]+\.[^/\s]+$", new_url):
        print(f"ERROR: '{new_url}' doesn't look like a site address.")
        print("       Expected something like https://yoursite.com")
        print("       (include https://, no trailing path)")
        return 1

    if new_url.startswith("http://"):
        print("WARNING: http:// is unencrypted. Nearly every free host gives")
        print("         you https:// for nothing. Continuing anyway.\n")

    root = Path(__file__).resolve().parent.parent
    if not (root / "index.html").exists():
        print(f"ERROR: can't find index.html in {root}")
        print("       Run this from the project root.")
        return 1

    targets = [
        root / "js" / "config.js",
        root / "index.html",
        root / "sitemap.xml",
        root / "robots.txt",
    ]

    print(f"{'DRY RUN — ' if dry_run else ''}setting site URL to: {new_url}\n")

    total = 0
    for path in targets:
        if not path.exists():
            print(f"  SKIP    {path.name} (not found)")
            continue

        text = path.read_text(encoding="utf-8")
        count = text.count(PLACEHOLDER)

        if count == 0:
            print(f"  no-op   {path.name} — already changed, or no placeholder in it")
            continue

        if not dry_run:
            path.write_text(text.replace(PLACEHOLDER, new_url), encoding="utf-8")

        print(f"  {'would update' if dry_run else 'updated'}  {path.name}"
              f" — {count} occurrence{'s' if count != 1 else ''}")
        total += count

    print()
    if dry_run:
        print(f"Dry run complete. {total} replacement(s) would be made.")
        print("Run again without --dry-run to apply.")
    else:
        print(f"Done. {total} replacement(s) made.")
        print("\nStill to do by hand:")
        print("  - set integrations.email.to in js/config.js")
        print("  - update contact.email in js/config.js if it changed")

    return 0


if __name__ == "__main__":
    sys.exit(main())
