# Semicolon — Learn to code from zero

A free, plain-English introduction to programming, built as a static website with
**no frameworks, no build step and no dependencies**.

Open `index.html` in a browser and it runs. That's the whole install process.

---

## Quick start

```bash
# Option 1 — just open it
Double-click index.html

# Option 2 — run a local server (needed for share links and clean URLs)
python -m http.server 8000
# then visit http://localhost:8000

# Option 3 — Ada (the coding tutor) needs this server, plus Ollama
python ada_server.py
# then visit http://localhost:8420/pages/ada.html
```

> **Why a server helps:** opening files directly uses the `file://` protocol, where the
> clipboard API is blocked and some browsers restrict scripts. Everything still works,
> but "Copy link" on a blog post will fail. A one-line Python server fixes it.

---

## What's in the folder

```
semicolon/
├── index.html                 Homepage
├── pages/
│   ├── about.html             Story, values, timeline, honest limitations
│   ├── learn.html             10 tracks — search, filter, sort, detail modal
│   ├── blog.html              Post list — search, categories, pagination
│   ├── post.html              Any single post, chosen by ?slug=
│   └── contact.html           Validated contact form
├── css/
│   └── style.css              Entire design system, 18 numbered sections
├── js/
│   ├── config.js              Every site-wide setting — START HERE
│   ├── data.js                All content: tracks, posts, quotes, FAQ
│   ├── main.js                Theme, nav, carousel, FAQ, newsletter, back-to-top
│   ├── learn.js               Tracks page
│   ├── blog.js                Blog index
│   ├── post.js                Single post, comments, sharing
│   └── contact.js             Form validation
├── components/
│   └── ui.js                  Icons, escaping, toasts, shared card renderers
├── pages/ada.html             Ada — coding tutor chat
├── js/ada.js                  Ada chat widget
├── ada_server.py              Serves the site + /api/ada (needs Ollama)
├── tools/
│   └── set-site-url.py         Points all 15 URL references at your domain
├── .env.example               Template for secrets (never commit the real .env)
├── robots.txt                 Search engine instructions
├── sitemap.xml                Page list for search engines
└── README.md
```

**There is no `images/` folder, and that's deliberate.** Every icon is inline SVG and
every "photo" is a CSS gradient. Nothing is downloaded, so the site works offline and
loads instantly.

---

## Making it yours

Almost everything is changed from two files.

### 1. Site settings — `js/config.js`

Name, tagline, contact details, social links, posts-per-page, feature switches.

### 2. Content — `js/data.js`

Add a ninth track by adding one object to the `TRACKS` array. Add a blog post by adding
one to `POSTS`. The pages regenerate themselves — you never touch the HTML.

### 3. Colours — `css/style.css`

All colours are CSS variables in section 1. Change `--primary` and the whole site
follows: buttons, links, focus rings, the active nav item, gradients.

```css
:root {
  --primary: #1d4ed8;      /* ← change this one line */
}
```

Dark mode works by redefining those same variables. You don't restyle anything twice.

---

## ⚠️ What is NOT connected

This is a static site, so three things in the original spec need an account and a key
that this project doesn't have. Rather than fake them, they're switched off and clearly
labelled on the page.

| Feature | Status | To switch on |
|---|---|---|
| **Contact form** | ✅ Works — opens your email app | Set your address (below) |
| **Newsletter signup** | ✅ Works — opens your email app | Same address |
| **Google Analytics** | Off | Add your `G-XXXXXXXXXX` ID to `config.js` |
| **Google Maps embed** | Off — and removed from the page | Only useful with a real address; see `integrations.maps` |
| **Blog comments** | Saved in your browser only | Needs a server + database |

---

## 📬 Receiving messages

**A web browser cannot send email by itself.** That's not a missing feature, it's a
deliberate security rule — if it could, any page you visited could send mail pretending
to be you. So there are exactly two ways to make a contact form reach you.

### Step 1 — set your address (required for both)

Open `js/config.js` and change **one line**:

```js
email: {
  mode: "mailto",
  to: "your.email@example.com",     // ← put YOUR address here
  endpoint: ""
}
```

That address then appears in the footer, on the contact card, and as the form's
destination — all from this one line.

> ⚠️ **Use an address you control**, and think before using a personal one. Any email
> address written into a public web page will eventually be found by spam bots. A free
> address made just for this is a sensible move.

### Option A — `mode: "mailto"` (the default, works right now)

The form opens the visitor's own email app with the subject and message already written.
They press send, and it arrives in your inbox **from their address**, so you can just hit
reply.

- ✅ No account, no signup, no service that can expire
- ✅ Works offline and costs nothing, forever
- ❌ Needs them to have an email app set up
- ❌ Your address is visible in the page

### Option B — `mode: "endpoint"` (the automatic version)

A free service catches the form and forwards it to you. The visitor never leaves the page
and never sees your address.

1. Sign up free at [formspree.io](https://formspree.io)
2. Create a form using the address you want messages delivered to
3. Copy the endpoint it gives you — looks like `https://formspree.io/f/abcdwxyz`
4. In `js/config.js`:

```js
email: {
  mode: "endpoint",                              // ← was "mailto"
  to: "you@example.com",
  endpoint: "https://formspree.io/f/abcdwxyz"    // ← paste it here
}
```

Free tier is 50 messages a month. The sending code in `js/contact.js` is already written
and waiting — you only change config.

### Option C — `mode: "off"`

Validates the form and honestly reports that nothing was sent. Useful while building.

---

## 🔒 Security notes

Worth reading even for a static site.

**What this site does right:**
- Every piece of user input is escaped before it touches `innerHTML` (`escapeHtml()` in
  `components/ui.js`). This is what stops **XSS** — someone typing `<script>` into the
  comment box and having it run for everyone.
- A **honeypot** field on the contact form catches simple bots without a CAPTCHA.
- Length limits on every input, applied both when validating and when saving.
- All external links use `rel="noopener"`, so the page they open can't reach back into
  this one.

**What you must add if you connect a backend:**
- **Validate everything again on the server.** The front-end validation in `contact.js`
  is a courtesy to the person filling the form, *not* a security control — anyone can
  bypass it with dev tools in seconds.
- **CSRF tokens** on any form that changes data.
- **Rate limiting**, so one person can't submit the form ten thousand times.
- **Parameterised database queries** — never build SQL by joining strings together.

**Never put secrets in `js/config.js`.** Every visitor's browser downloads that file, so
anything in it is public. API keys and passwords belong in a `.env` file on a server —
see `.env.example`, and make sure `.env` is in your `.gitignore` **before** your first
commit. Once a secret is in Git history, the only real fix is to change the secret.

---

## ♿ Accessibility

Built in, not bolted on:

- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`)
- One `<h1>` per page, headings in order with no levels skipped
- Skip-to-content link as the first focusable element
- Visible focus rings — never removed
- `aria-expanded`, `aria-pressed`, `aria-current` on every stateful control
- Modals trap focus and return it where it was when closed
- Escape closes menus and modals
- Live regions so screen readers hear form errors and toasts
- `prefers-reduced-motion` respected — all animation stops
- Colour contrast meets WCAG AA in both themes

**Test it yourself:** unplug your mouse and try to reach every part of the site with
`Tab`, `Enter` and `Escape`. If you get stuck anywhere, that's a real bug.

---

## Performance

| | |
|---|---|
| Total size | ~130 KB, everything included |
| Network requests | 4–5 local files, **zero external** |
| Images to download | none |
| Fonts to download | none — uses your system's fonts |
| Frameworks | none |

Already fast. If you want it faster: minify the CSS and JS for production, and add
`loading="lazy"` to any real images you add later.

---

## Deploying

### Main server (Ada + the site)

The published image is `ghcr.io/anshumansribeast-prog/semicolon:latest`.
On the server that should actually run Ada:

```bash
docker compose up -d --build
docker compose exec ollama ollama pull llama3.2:3b   # first time only
```

nginx serves the pages on port 80 and proxies `/api/ada` to Ada. Ollama
is the model. Open `http://YOUR-SERVER/pages/ada.html`.

### Static hosts (no Ada)

Any static host still works for the pages, but Ada will show as offline
because those hosts cannot run Python or Ollama:

- **Netlify** — drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop). Live in ten seconds.
- **GitHub Pages** — push to GitHub, Settings → Pages → deploy from `main`.
- **Vercel** — `vercel` in the project folder.
- **Cloudflare Pages** — connect the repo, no build command needed.

Before you deploy:

```bash
python tools/set-site-url.py https://yoursite.com --dry-run   # check first
python tools/set-site-url.py https://yoursite.com             # then apply
```

That one command updates all 15 places your address appears — `config.js`, the canonical
link, all 11 sitemap entries and `robots.txt`. Doing it by hand means missing one, and a
sitemap pointing at the wrong domain is worse than no sitemap.

Then set `integrations.email.to` in `js/config.js` — that one is still manual, because
only you know the address.

---

## Troubleshooting

**The page is unstyled / everything is plain text**
The CSS isn't loading. Check you opened the file from the extracted folder, not from
inside a `.zip` preview window. Windows extracts only the file you clicked and leaves
the `css/` folder behind.

**Blog posts open blank**
`post.html` needs a `?slug=` in the address. Reach it by clicking a post from
`blog.html`, not by opening the file directly.

**Ada says it's offline**
Ada only answers while `python ada_server.py` is running and Ollama is up
(`ollama serve`, with model `llama3.2:3b`). Open the page through that server
(`http://localhost:8420/pages/ada.html`), not as a raw file.

**"Copy link" says the clipboard isn't available**
The clipboard API needs `https://` or `localhost`. Run `python -m http.server 8000`
and use that address instead of opening the file directly.

**Dark mode resets when I refresh**
Your browser is blocking `localStorage` — usually private browsing mode.

**My changes to `data.js` don't show up**
Hard refresh: `Ctrl + F5`. The browser cached the old version.

---

## Credits

The homepage carousel quotes are real and sourced — Kernighan (1978), Fowler (1999),
Dijkstra (1969), Hopper, Knuth (1974). They replaced a set of invented testimonials,
because a brand-new site has no users and therefore has no reviews. Making some up is a
fast way to deserve losing someone's trust.

Built as a learning project. The code is meant to be read: every file is commented, and
the comments explain *why*, not just *what*.
