# Semicolon — Roadmap

**Owner:** Anshuman Srivastava
**Live at:** https://roaring-selkie-cbdd4b.netlify.app
**Written:** 28 July 2026
**Status:** shipped and public — now the interesting part starts

---

## How to read this document

A roadmap is **not** a to-do list. A to-do list is flat: everything on it is
equally urgent and you can do it in any order. A roadmap has **shape**.

Three things make it a roadmap:

1. **Phases, in order.** Some work has to happen before other work, or the
   later work gets harder or has to be redone. The order here is deliberate,
   and each phase says *why it comes when it does*.
2. **Done-means.** Every phase ends with a sentence describing what has to be
   true to call it finished. Without this, "improve the blog" is never done.
   With it, you know exactly when to stop and move on.
3. **Honest current state.** A roadmap that pretends the project is further
   along than it is will send you in the wrong direction. The inventory below
   lists the placeholders and gaps, not just the wins.

> **The single most useful habit here:** finish a phase before starting the
> next one. Half-finished phases are how projects die. Three things at 90% is
> worth less than one thing at 100%, because nothing at 90% can be used.

---

## Where Semicolon stands today

### What genuinely works

| Thing | State |
|---|---|
| 6 pages | Home, About, Learn, Blog, Post, Contact — all built |
| Hosting | Live on Netlify, publicly reachable |
| Contact form | Real — Formspree endpoint wired, messages arrive |
| Dark mode | Works, remembered between visits |
| Accessibility | Keyboard nav, focus rings, ARIA, reduced-motion |
| Security basics | HTML escaping, honeypot, length limits, `rel="noopener"` |
| Content system | 9 tracks + posts, all driven from `js/data.js` |
| Size | ~130 KB total, zero external requests |
| Deploy tool | `tools/set-site-url.py` updates all 15 URL references |

That is a real website. Most people who say they "want to build a site" never
get here.

### What is still pretend

These are not failures — every project has them. They are the roadmap's fuel.

| Thing | Reality | Where |
|---|---|---|
| **No version control** | One copy, no history, no undo | no `.git` folder |
| GitHub link | Points at `github.com`, not your profile | `js/config.js` line 34 |
| YouTube link | Points at `youtube.com` | `js/config.js` line 35 |
| Discord link | Points at `discord.com` | `js/config.js` line 36 |
| Phone number | `+44 20 7946 0000` is a fake UK test number | `js/config.js` line 28 |
| Domain | Random Netlify name — `roaring-selkie-cbdd4b` | `js/config.js` line 21 |
| Comments | Saved in the visitor's own browser only. Nobody else sees them | `js/post.js` |
| Analytics | Off — you have no idea if anyone visits | `js/config.js` line 93 |
| Tests | None | — |

---

## Phase 1 — Put it in Git

**Why this is first:** everything below this line is a change to working code.
Right now a bad edit at 11pm has no undo. Git is the safety net that makes
every later phase safe to attempt, so it cannot come second.

It is also the single most important thing a developer knows how to do, and
your brother's stated goal is that you understand the development lifecycle.
Git *is* that lifecycle's spine.

### Tasks

- [ ] Write a `.gitignore` — must include `.env` **before** the first commit
- [ ] `git init` in `semicolon/`
- [ ] First commit: everything as it stands today
- [ ] Create the GitHub repo, push
- [ ] Make one small change, commit it separately, look at `git log`
- [ ] Deliberately break a file, then `git restore` it — feel the safety net work
- [ ] Point the GitHub social link at your real profile

### Done-means

`git log` shows at least three commits with messages you'd understand in six
months, the repo is on GitHub, and you have recovered a file you broke on
purpose.

### What you'll learn

Commits, staging, history, remotes — and *why* `.env` must be ignored before
the first commit rather than after. Once a secret is in Git history, removing
it from the current files does nothing; the secret is still in the history and
the only real fix is to change the secret itself.

---

## Phase 2 — The truth pass

**Why now:** placeholder data on a live public site is the one flaw that costs
you credibility. A fake phone number is worse than no phone number. Do this
before you drive any traffic to the site.

Small phase. Probably one evening. Do it anyway.

### Tasks

- [ ] Remove the fake phone number, or replace it with nothing
- [ ] Point YouTube and Discord at real accounts, or delete those entries
- [ ] Reread the About page — is every claim on it actually true today?
- [ ] Check the Learn tracks: do all 9 have real content behind them?

### Done-means

Every clickable thing goes somewhere real, and there is no sentence on the
site you would be embarrassed to defend.

### What you'll learn

The habit of auditing your own work for claims rather than bugs. Bugs announce
themselves. False claims sit there quietly looking fine.

---

## Phase 3 — A real domain

**Why now:** `roaring-selkie-cbdd4b.netlify.app` is not a name you can say out
loud to someone. This phase is genuinely blocked on someone else, so start the
conversation early and do other phases while you wait.

**Abhishek has offered a domain and server space.** That offer is on the
record. Ask him — this phase is the reason to.

### Tasks

- [ ] Ask Abhishek about the domain (this is the blocker — do it first)
- [ ] Point DNS at Netlify
- [ ] Run `python tools/set-site-url.py https://yourdomain.com --dry-run`
- [ ] Check the dry-run output carefully, then run it for real
- [ ] Confirm HTTPS works and the padlock shows
- [ ] Resubmit `sitemap.xml` now that URLs changed
- [ ] Turn analytics on so you can finally see visitors

### Done-means

The site loads over HTTPS on a domain you chose, and all 15 URL references
agree with each other.

### What you'll learn

DNS, what a domain actually *is* (a rented name pointed at a number), HTTPS
certificates, and why that little Python tool exists — doing 15 edits by hand
means missing one, and a sitemap pointing at the wrong domain is worse than no
sitemap at all.

---

## Phase 4 — Content

**Why now:** the machinery is finished. A learning site with thin content is
just a nice-looking shell, and no amount of extra features fixes that.

This is also the cheapest phase — `js/data.js` is designed so adding a post is
adding one object to an array. You never touch HTML. That was the whole point
of building it that way.

### Tasks

- [ ] Write 3 more blog posts on things you have actually learned
- [ ] Fill out any Learn track that is currently thin
- [ ] Add a 9th track — something you want to learn next, written as you learn it
- [ ] Reread your oldest post. Would 13-year-old-you-a-month-ago have understood it?

### Done-means

Enough real content that a stranger landing on the site could learn something
useful and come back for more.

### What you'll learn

That the hard part of a content site is the content, not the code. Also: that
building the data layer properly in phase one pays you back every single time
you add something.

---

## Phase 5 — Real comments (static → dynamic)

**Why now:** this is the biggest conceptual leap in the whole roadmap, and it
needs everything above it to be solid first. Do not attempt it before Git.

Right now comments save to `localStorage` — the visitor's own browser. Two
people on the same post cannot see each other. That is not a bug; a static site
genuinely cannot do more. To fix it you need a **server** and a **database**,
which means leaving static hosting behind.

**Abhishek's offer of server space is what unlocks this.**

### Tasks

- [ ] Understand the shape first: browser → API → database → back
- [ ] Pick a stack (start small — a tiny Node or Python API is plenty)
- [ ] Design the comments table: post slug, name, body, timestamp
- [ ] Build the API: one endpoint to read comments, one to add one
- [ ] Move `js/post.js` from `localStorage` to `fetch()`
- [ ] **Validate on the server too** — front-end validation is a courtesy, not
      a security control. Anyone can bypass `contact.js` with dev tools in
      about ten seconds
- [ ] Rate-limit it, or the first bot that finds it will post 10,000 times
- [ ] Parameterised queries only — never build SQL by joining strings
- [ ] Keep real secrets in `.env` on the server, never in `config.js`

### Done-means

You post a comment on your laptop, and it is visible from a different device
on a different network.

### What you'll learn

The client/server split — the concept the entire web rests on. Why the browser
can never be trusted. What a database is for. And the reason your README
already warns about all of this: the warnings were written for the day you
reached this phase.

---

## Phase 6 — Make it professional

**Why last:** optimising and testing code that is still changing shape is
wasted effort. Once the site stops moving, harden it.

### Tasks

- [ ] Run Lighthouse in Chrome DevTools — record the four scores
- [ ] Fix whatever it flags, re-run, compare
- [ ] Write tests for the things most likely to break silently
- [ ] Unplug your mouse. Reach every part of the site with Tab, Enter, Escape
- [ ] Test on a real phone, not just a narrow browser window
- [ ] Minify CSS and JS for production
- [ ] Add `loading="lazy"` if you ever add real images

### Done-means

Lighthouse is green across all four categories, and you completed a full
keyboard-only pass without getting stuck.

### What you'll learn

Measuring instead of guessing. "It feels fast" and "it scores 96" are very
different kinds of statement, and only one of them survives an argument.

---

## Why the order is what it is

```
  Phase 1  Git ─────────────────────┐
             │                      │  everything below is safer
             │                      │  because of this
             ▼                      │
  Phase 2  Truth pass               │
             │                      │
             ▼                      │
  Phase 3  Domain ◄── needs Abhishek│
             │                      │
             ▼                      │
  Phase 4  Content                  │
             │                      │
             ▼                      │
  Phase 5  Backend ◄── needs Abhishek's server
             │
             ▼
  Phase 6  Polish
```

Two phases depend on your brother. Both are worth asking about **early**, even
though they sit in the middle — the asking is free and the waiting is not.

Phases 2 and 4 are independent of each other and could swap. Phase 1 genuinely
must be first, and phase 6 genuinely must be last.

---

## Deliberately NOT on this roadmap

Saying no is part of a roadmap. These were considered and cut:

- **A JavaScript framework.** The site is 130 KB with zero dependencies and
  loads instantly. React would make it bigger and slower to solve a problem you
  do not have. Learn one later, on a project that needs it.
- **User accounts and logins.** Storing other people's passwords is a serious
  responsibility with real consequences when it goes wrong. Not yet.
- **A CMS.** `data.js` is your CMS. It works.
- **Redesigning the look.** The design is finished and consistent. Redesigning
  is the most tempting form of procrastination, because it feels productive.

---

## Tracking progress

Tick boxes in this file as you go, and commit the change — then `git log`
becomes a record of the project's history *and* your own.

When a phase is done, write one honest sentence about what actually happened
versus what you expected. That gap is where most of the learning is.
