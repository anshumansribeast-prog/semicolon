# Programming Languages — a field guide

**Written for:** Anshuman Srivastava, 28 July 2026
**Machine this was written against:** Windows 11, Python 3.14.6, Node v24.16.0, Git, VS Code — all already installed

---

## Read this first

You are going to be told, many times, that some language is "the best one."
Ignore all of it. Here is the thing nobody says clearly enough:

> **Languages are the easy part. Concepts are the hard part.**

Loops, variables, conditions, functions, arrays, debugging — you learn those
*once*. Every language afterwards is mostly new spelling for ideas you already
have. Your second language takes a fraction of the time your first one did, and
your fourth takes a weekend.

So the real question is not "which language is best?" It is **"what do I want
to make?"** Pick the language that makes that thing, and the rest follows.

Here is the same program in four languages. Look at how little actually differs:

```python
# Python
for i in range(5):
    print("Hello")
```
```javascript
// JavaScript
for (let i = 0; i < 5; i++) {
  console.log("Hello");
}
```
```java
// Java
for (int i = 0; i < 5; i++) {
    System.out.println("Hello");
}
```
```go
// Go
for i := 0; i < 5; i++ {
    fmt.Println("Hello")
}
```

Different punctuation. Same idea. You already understand all four.

---

## What you actually need — the requirements

You asked what's *required*. Less than you'd think.

### Hardware

Essentially nothing. Any laptop from the last ten years runs every language
here. Programming is one of the very few serious hobbies where the equipment
you already own is genuinely enough. You do **not** need a gaming PC, and
anyone who tells you otherwise is selling something.

The exceptions are narrow and you'll know when you hit them: training AI models
wants a good graphics card, and building iPhone apps legally requires a Mac.
Neither is where you are.

### The universal toolkit

These five things serve every language. You have all five already.

| Tool | What it's for | Yours |
|---|---|---|
| **A text editor** | Writing the code | VS Code ✓ |
| **A terminal** | Running the code | PowerShell ✓ |
| **A runtime** | The thing that actually executes it | Python + Node ✓ |
| **A browser** | Testing web things, plus its DevTools | Chrome ✓ |
| **Git** | Remembering every version | ✓ (now use it — Phase 1) |

### The one habit that matters more than the tools

After installing anything, **verify it before you write a single line**:

```powershell
python --version
```

If that prints a version number, it worked. If it says "not recognised," it
didn't, and no amount of code will fix that. Most beginner rage comes from
writing fifty lines against an install that was broken the whole time.

Verify first. Always.

---

# The languages

Ordered by how useful they are *to you, right now*. Not by popularity.

---

## 1. Python — your main language

**What it's for:** automation, data, AI and machine learning, science, scripting,
backends, teaching. The most flexible general-purpose language there is.

**Why it's first:** it reads almost like English, and it does the most for the
least typing. Your `move_text_files.py` is proof — a real, useful program in a
few dozen lines.

**What it's bad at:** speed (it's slower than C by a lot), and you can't build a
website's front-end with it or ship a phone app in it.

**Install:** already done — **Python 3.14.6**.

**Verify:**
```powershell
python --version
```

**Your first file** — save as `hello.py`, run with `python hello.py`:
```python
name = input("What's your name? ")
print(f"Hello, {name}!")

for i in range(1, 6):
    print(f"{i} times 7 is {i * 7}")
```

**Verdict:** this is your language. Get genuinely good at it before adding
another. Depth beats breadth for at least your first year.

---

## 2. JavaScript — the language of the web

**What it's for:** anything that happens inside a browser. Also servers (via
Node), and it can reach into desktop and mobile apps.

**Why it matters to you:** you have already written a lot of it. `main.js`,
`data.js`, `contact.js`, `post.js` — all JavaScript. Semicolon runs on it. You
are further along here than you probably realise.

**What it's bad at:** it has genuinely strange corners, inherited from being
designed in about ten days in 1995 and then never being allowed to break the
websites already using it. `0.1 + 0.2` does not equal `0.3`. `"5" - 2` is `3`
but `"5" + 2` is `"52"`. These are real, and they are not your fault.

**Install:** nothing. **It is already inside Chrome.** Press `F12`, click
Console, type `2 + 2`, press Enter. That's it — you're programming.

For running it outside a browser you have **Node v24.16.0** already.

**Verify:**
```powershell
node --version
```

**Your first file** — save as `hello.js`, run with `node hello.js`:
```javascript
const name = "Anshuman";
console.log(`Hello, ${name}!`);

for (let i = 1; i <= 5; i++) {
  console.log(`${i} times 7 is ${i * 7}`);
}
```

**Verdict:** you're already using it. Keep going. Python and JavaScript together
cover an enormous amount of ground, and honestly that pair alone could carry you
for years.

---

## 3. HTML and CSS — not programming, and that's fine

An honest note, because this confuses almost everyone at the start.

**HTML and CSS are not programming languages.** HTML *describes structure* —
this is a heading, this is a list. CSS *describes appearance* — headings are
blue. Neither can make a decision, repeat something, or store a value. There is
no `if` in CSS. There is no loop in HTML.

That's not an insult to them. They are essential, you cannot build for the web
without them, and your `style.css` is 45 KB of real skill. They are just a
different *kind* of thing — description rather than instruction.

The moment a page needs to *decide* or *react*, that's JavaScript. That's the
line between them.

**Install:** nothing. Notepad and a browser is a complete setup.

---

## 4. SQL — how data is actually stored

**What it's for:** talking to databases. Asking questions of data.

**Why you'll need it soon:** Phase 5 of your roadmap — real comments — needs a
database. This is the language you'll ask it questions in.

**What's unusual about it:** you don't tell it *how* to do things, you describe
*what you want* and it works out the how. That's a genuinely different way of
thinking, and it's small enough to learn the useful 80% in a weekend.

```sql
SELECT name, body FROM comments
WHERE post_slug = 'read-the-error'
ORDER BY created_at DESC
LIMIT 10;
```

You can almost read that as a sentence. That's the point.

**Install:** nothing — **Python already includes SQLite**, a complete database
in a single file:

```python
import sqlite3
db = sqlite3.connect("test.db")
db.execute("CREATE TABLE friends (name TEXT, age INTEGER)")
db.execute("INSERT INTO friends VALUES ('Sam', 13)")
print(db.execute("SELECT * FROM friends").fetchall())
```

**Verdict:** learn this when you start Phase 5, not before. It'll make sense
then, because you'll have an actual reason to want it.

---

## 5. C — how computers really work

**What it's for:** operating systems, embedded devices, anything that must be
fast. Windows, Linux and macOS are all largely built in C.

**Why it's worth learning eventually:** C hides nothing. Python quietly manages
memory for you; C hands you the raw memory and expects you to manage it
yourself. That's painful — and it's exactly why it teaches you what "memory"
actually means. After C, Python stops feeling like magic and starts feeling like
convenience, which is a real upgrade in understanding.

**What it's bad at:** everything to do with convenience. No safety net. A small
mistake crashes the whole program, or worse, doesn't crash it and quietly
corrupts something.

**Install on Windows** (this is the fiddly one, be warned):
1. Install MSYS2 from [msys2.org](https://www.msys2.org)
2. In its terminal: `pacman -S mingw-w64-ucrt-x86_64-gcc`
3. Add the `ucrt64\bin` folder to your PATH
4. Verify with `gcc --version`

**Your first file** — `hello.c`, compiled with `gcc hello.c -o hello`:
```c
#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 5; i++) {
        printf("%d times 7 is %d\n", i, i * 7);
    }
    return 0;
}
```

Notice: you must *compile* first, then run. Python and JavaScript skip that
step. That difference — compiled versus interpreted — is one of the genuinely
important ideas in programming.

**Verdict:** not yet. Maybe in a year or two. Powerful teacher, frustrating
first language.

---

## 6. C++ — C plus forty years of additions

Games (most large ones), browsers, high-performance software. Everything C does,
plus vastly more — which is also its problem: it's one of the most complicated
languages in wide use, and nobody knows all of it. Not an exaggeration.

**Install:** same MSYS2 setup as C, then use `g++` instead of `gcc`.

**Verdict:** only if you get serious about game engines. Skip for now.

---

## 7. C# — the comfortable Windows one

Made by Microsoft. Windows apps, and **Unity**, which is the most popular game
engine for people starting out. If "I want to make a game" is the goal, this is
the realistic route.

Pleasant to write — much of Java's structure with fewer sharp edges.

**Install:** the .NET SDK from
[dotnet.microsoft.com](https://dotnet.microsoft.com/download). Easy on Windows.
```powershell
dotnet --version
dotnet new console -o hello
cd hello
dotnet run
```

**Verdict:** the one to pick if games pull at you.

---

## 8. Java — the one schools and companies use

Big business systems, and **Android apps**. Famously verbose — printing one line
needs `System.out.println()`. But it runs everywhere and there are more Java jobs
than almost anything else.

You'll probably meet this in school eventually.

**Install:** Temurin JDK from [adoptium.net](https://adoptium.net), then
`java --version`.

**Verdict:** learn it when something makes you, not before.

---

## 9. Go — small, fast, and refreshingly boring

Servers and web backends. Designed deliberately to be *small* — you can hold the
whole language in your head, which is rare. Compiles to a single file you can
just hand to someone.

"Boring" is a compliment here. Boring means predictable, and predictable means
you spend your time on your problem instead of on the language.

**Install:** [go.dev/dl](https://go.dev/dl) → `go version`

**Verdict:** a strong choice for the Phase 5 backend, once you get there.

---

## 10. Rust — the strict one

Systems programming, where C would be used but safely. The compiler refuses to
build code that could corrupt memory. It is famous for being hard to learn and
famous for being loved by the people who learned it.

The learning curve is real. Beginners routinely fight the compiler for days.

**Install:** [rustup.rs](https://rustup.rs) → `rustc --version`

**Verdict:** not now. Genuinely brilliant, genuinely steep. Come back in a few
years.

---

## 11. Swift and Kotlin — the phone ones

| | Swift | Kotlin |
|---|---|---|
| Makes | iPhone / iPad apps | Android apps |
| Needs | **A Mac.** Not optional | Android Studio, works on Windows |
| Free? | Yes, but $99/yr to publish | Yes, one-off $25 to publish |

**Verdict:** Swift is closed to you on a Windows laptop — that's a hardware wall,
not a skill one. Kotlin is open if Android apps appeal.

---

## What to ignore, honestly

You'll see these names constantly. Skip them for now, and here's the real reason:

- **PHP** — runs a huge share of the existing web, but almost nothing new starts
  in it. Learn it if a specific project demands it.
- **Ruby** — lovely language, shrinking world. Same advice.
- **R** — statistics only. Python does most of it and does other things too.
- **Assembly** — one instruction at a time, closer to the metal than C. Fascinating,
  and useful to about 0.1% of programmers.
- **Scratch** — genuinely good at teaching logic, but you're past it. You write
  real code already.
- **"AI will write all the code soon, why learn this?"** — you're using an AI right
  now, and notice that it still needed *you* to know what a roadmap is, that Git
  matters, and that a fake phone number on a live site is a problem. The value
  moves toward judgement, not away from it. Judgement comes from having built things.

---

## So what should you actually do?

A clear answer, since you asked for one:

1. **Go deeper in Python.** You have it installed and you've written real
   programs. Depth in one language beats a shallow tour of six.
2. **Keep using JavaScript through Semicolon.** You're learning it by shipping,
   which is the best way there is.
3. **Add SQL when you reach Phase 5.** It'll have a purpose then.
4. **Then pick a fourth based on what you want to build** — C# for games, Go for
   servers, C if you want to understand the machine underneath.

> **The trap to avoid:** "language tourism" — installing a new language every
> week and writing hello-world in each. It feels productive and teaches almost
> nothing. One finished project in one language is worth more than ten
> hello-worlds in ten languages. You already know this, because Semicolon is a
> finished project and it taught you more than any tutorial did.

---

## A rule of thumb worth keeping

> Choose the language your **project** needs. If no project needs a language
> yet, the problem isn't which language to pick — it's that you need a project.
