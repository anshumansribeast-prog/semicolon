/* ===================================================================
   helper.js — the Semicolon study helper.

   WHAT THIS IS, HONESTLY
   It is NOT an AI. It is a lookup table with a keyword matcher in
   front of it. Every answer below was written by a human and is
   always the same. It cannot understand a question it has no entry
   for, and when that happens it says so instead of inventing
   something.

   That last part is the whole design. A helper that confidently makes
   up an answer is worse than one that admits it does not know,
   because a beginner has no way to tell the difference.

   WHY NOT A REAL AI?
   A real chatbot needs an API key, and an API key cannot live in a
   static website — every visitor downloads the JavaScript, so the key
   would be public within minutes. Doing it properly needs a server
   holding the key out of sight. That is a real project, and it is on
   the roadmap.

   HOW MATCHING WORKS
   Each topic lists keywords. A question scores a point per keyword it
   contains, with a bonus for exact phrase matches. Highest score wins,
   and if nothing scores at all, we say we don't know.
   =================================================================== */

var HELP_TOPICS = [
  {
    k: ["variable", "variables", "store", "box", "assign"],
    a: "A variable is a labelled box you put a value in.<br><br><code>name = \"Anshuman\"</code> means <em>put that text in the box called name</em>.<br><br>The big trap: in maths <code>x = 5</code> states a fact. In code it's an <strong>instruction</strong> — and the next line can put something different in the same box. That's why <code>score = score + 10</code> makes sense in code and looks like nonsense in maths.",
    link: { href: "post.html?slug=variables-are-boxes", text: "Read: Variables are boxes, not equations" }
  },
  {
    k: ["loop", "loops", "repeat", "for loop", "while loop", "iterate"],
    a: "A loop makes the computer repeat work.<br><br><strong>for</strong> — when you know how many times:<br><code>for i in range(5):</code><br><br><strong>while</strong> — when you don't, and it runs until something stops being true.<br><br>Watch out for <code>range(1, 11)</code> — the end number is <em>never included</em>, so that gives you 1 to 10.",
    link: { href: "lesson.html?track=thinking-in-loops&n=1", text: "Lesson: Why loops are the real beginning" }
  },
  {
    k: ["infinite loop", "never stops", "stuck", "freeze", "frozen", "ctrl c"],
    a: "An infinite loop means the thing you're testing never changes, so the condition is always true.<br><br><strong>Press Ctrl + C to stop it.</strong> Learn that now, before you need it in a panic.<br><br>Before writing a while loop, ask: <em>what inside this loop will eventually make the test false?</em> If you can't answer, you have an infinite loop.",
    link: { href: "lesson.html?track=thinking-in-loops&n=2", text: "Lesson: while loops and the infinite loop trap" }
  },
  {
    k: ["error", "errors", "traceback", "stack trace", "red text", "crashed", "exception"],
    a: "Read it from the <strong>bottom up</strong>.<br><br>• <strong>Last line</strong> — what kind of problem<br>• <strong>Line above</strong> — the exact code<br>• <strong>Above that</strong> — which file and line<br><br>Careful: the line number is where it <em>fell over</em>, not always where the mistake <em>is</em>. If line 20 breaks because line 4 set a bad value, Python points at 20.",
    link: { href: "post.html?slug=read-the-error-message", text: "Read: Read the error message. Actually read it." }
  },
  {
    k: ["nameerror", "not defined", "undefined variable"],
    a: "<code>NameError: name 'x' is not defined</code> means Python has never heard of that name.<br><br>Almost always one of:<br>• a typo (<code>prnt</code> instead of <code>print</code>)<br>• you used it before creating it<br>• it was created inside a function and you're using it outside",
    link: null
  },
  {
    k: ["typeerror", "type error", "cannot", "nonetype"],
    a: "A TypeError means you did something to a value that its type doesn't allow — like adding text to a number.<br><br><code>\"5\" + 2</code> fails in Python. <code>input()</code> always gives you <strong>text</strong>, even when the person typed digits, so wrap it: <code>int(input(...))</code>.<br><br>If you see <code>NoneType</code>, something returned nothing when you expected a value.",
    link: null
  },
  {
    k: ["indentation", "indent", "spaces", "indentationerror", "tab"],
    a: "In Python the spaces at the start of a line are part of the language, not decoration. The indented lines are what's inside the loop, the if, or the function.<br><br>Pick <strong>4 spaces</strong> and never mix tabs and spaces in one file — they look identical and Python treats them differently.",
    link: null
  },
  {
    k: ["which language", "what language", "start with", "first language", "python or javascript", "best language"],
    a: "Honest answer: <strong>it matters far less than you've been told.</strong> Languages are the easy part; concepts are the hard part.<br><br>• <strong>Python</strong> — the best default. Readable, useful the same day.<br>• <strong>JavaScript</strong> — the only option for things in a browser.<br><br>Better question than <em>which language</em>: <strong>what do I want to make?</strong> Then pick the one that makes that.",
    link: { href: "post.html?slug=which-language-first", text: "Read: Python, JavaScript, or something else?" }
  },
  {
    k: ["install python", "download python", "python install", "get python", "path"],
    a: "Download from <strong>python.org</strong> and run the installer.<br><br>On Windows, one checkbox matters more than the rest: <strong>tick \"Add Python to PATH\"</strong> on the first screen. Miss it and Python installs perfectly, then your computer claims it can't find it.<br><br>Then verify before writing any code:<br><code>python --version</code>",
    link: { href: "lesson.html?track=first-program&n=1", text: "Lesson: Installing Python and proving it worked" }
  },
  {
    k: ["not recognized", "not recognised", "command not found", "python is not"],
    a: "That means the program isn't on your PATH — your computer doesn't know where to find it.<br><br>On Windows this is nearly always the missed <strong>\"Add Python to PATH\"</strong> checkbox. Reinstall and tick it.<br><br>Don't start writing code until <code>python --version</code> prints a version number.",
    link: null
  },
  {
    k: ["function", "functions", "def", "return", "parameter", "argument"],
    a: "A function is a named chunk of work you can reuse.<br><br><code>def greet(name):<br>&nbsp;&nbsp;&nbsp;&nbsp;return \"Hello \" + name</code><br><br><strong>print vs return</strong> catches everyone: <code>print</code> shows something to a human, <code>return</code> hands a value back to your code. A function that prints but doesn't return gives you <code>None</code>.",
    link: null
  },
  {
    k: ["html", "tag", "tags", "element", "markup"],
    a: "HTML describes <strong>structure</strong> — this is a heading, this is a list.<br><br>Choose tags for <em>meaning</em>, not looks. <code>&lt;h1&gt;</code> doesn't mean \"big text\", it means \"main heading\". Screen readers and Google both rely on that.<br><br>HTML is not a programming language — it can't decide or repeat anything. That's fine; that's not its job.",
    link: { href: "lesson.html?track=first-web-page&n=1", text: "Lesson: HTML is structure, not decoration" }
  },
  {
    k: ["css", "style", "styling", "colour", "color", "layout", "flexbox", "grid"],
    a: "CSS describes <strong>appearance</strong>.<br><br>Rule of thumb for layout: one direction (a row or a column) → <strong>flexbox</strong>. Two directions at once → <strong>grid</strong>.<br><br>Best trick to learn early: put colours in variables at the top, then change your whole site from one line. That's exactly how dark mode works here.",
    link: { href: "lesson.html?track=first-web-page&n=2", text: "Lesson: CSS — the same page, different clothes" }
  },
  {
    k: ["javascript", "js", "interactive", "click", "button", "event"],
    a: "JavaScript is what makes a page <em>react</em>.<br><br>Three ideas cover a lot:<br>• <strong>find it</strong> — <code>document.getElementById</code><br>• <strong>listen</strong> — <code>addEventListener</code><br>• <strong>change it</strong> — <code>textContent</code><br><br>Put your <code>&lt;script&gt;</code> just before <code>&lt;/body&gt;</code>, or it runs before the page exists.",
    link: { href: "lesson.html?track=interactive-pages&n=1", text: "Lesson: Finding things on the page" }
  },
  {
    k: ["git", "commit", "version control", "github", "repository", "repo"],
    a: "Git remembers every version you save, so you can experiment without fear.<br><br><code>git init</code><br><code>git add .</code><br><code>git commit -m \"message\"</code><br><br><strong>Write .gitignore before your first commit.</strong> Once something is committed it's in the history permanently — deleting the file later doesn't remove it.",
    link: { href: "lesson.html?track=git-basics&n=1", text: "Lesson: Why Git, and the file you write first" }
  },
  {
    k: ["undo", "restore", "revert", "lost work", "deleted", "broke it"],
    a: "If the project is in Git:<br><br><code>git restore thefile.py</code><br><br>Back to your last commit, instantly.<br><br>Try it on purpose today, while nothing's at stake — break a file, then restore it. You won't trust the safety net until you've fallen into it once.",
    link: { href: "lesson.html?track=git-basics&n=3", text: "Lesson: Undoing things" }
  },
  {
    k: ["debug", "debugging", "not working", "broken", "why doesn't", "fix"],
    a: "One rule: <strong>change one thing at a time, and check after each change.</strong><br><br>Then narrow it down by halving — put a print halfway through. Still correct there? The bug is later. Already wrong? It's earlier. Seven checks finds a bug in a thousand lines.<br><br>And say the code out loud, line by line. That's rubber-duck debugging, and it genuinely works.",
    link: { href: "lesson.html?track=debugging&n=1", text: "Lesson: Debugging is a method, not a talent" }
  },
  {
    k: ["print", "console.log", "output", "show"],
    a: "Print the <em>value</em>, not a message.<br><br><code>print(\"here\")</code> tells you almost nothing.<br><code>print(f\"{files=}\")</code> prints the name AND the value.<br><br>In a browser it's <code>console.log(...)</code> — press <strong>F12</strong> and open Console to see it. If a page seems to do nothing, the reason is usually sitting there in red.",
    link: null
  },
  {
    k: ["deploy", "publish", "online", "host", "hosting", "netlify", "live", "website live"],
    a: "Static sites host free on Netlify, GitHub Pages, Vercel or Cloudflare Pages.<br><br>The line that decides everything: <strong>static hosting serves files, it never runs a program.</strong> HTML/CSS/JS works anywhere free. A database or real accounts needs a server that <em>runs</em> something.<br><br>And always check the live URL afterwards — \"it ran\" and \"it worked\" are different claims.",
    link: { href: "lesson.html?track=ship-a-project&n=3", text: "Lesson: Getting it online" }
  },
  {
    k: ["list", "array", "append", "index"],
    a: "A list holds many things in order.<br><br>Python: <code>planets = [\"Mercury\", \"Venus\"]</code><br>JavaScript: same square brackets.<br><br><strong>Counting starts at 0.</strong> The first item is <code>planets[0]</code>. The last item of a 4-item list is index 3 — asking for index 4 is the classic off-by-one error.",
    link: null
  },
  {
    k: ["if", "else", "condition", "decision", "elif", "compare"],
    a: "<code>if</code> chooses between paths.<br><br>The symbol people mix up:<br>• <code>=</code> <strong>stores</strong> — <code>score = 10</code><br>• <code>==</code> <strong>asks</strong> — <code>if score == 10</code><br><br>One equals sign puts a value in a box. Two asks whether they match.",
    link: null
  },
  {
    k: ["input", "user input", "ask", "type in"],
    a: "<code>input()</code> stops and waits for someone to type.<br><br><strong>It always gives you text</strong>, even if they typed digits. To do maths with it you must convert:<br><code>age = int(input(\"Age? \"))</code><br><br>Forgetting <code>int()</code> is why comparisons mysteriously never match.",
    link: null
  },
  {
    k: ["file", "files", "open", "read file", "write file", "folder"],
    a: "<code>with open(\"notes.txt\") as f:</code> — the <code>with</code> closes the file automatically, even if your code crashes.<br><br><strong>Danger:</strong> mode <code>\"w\"</code> wipes the file the instant you open it. No warning, no undo. Use <code>\"a\"</code> to add to the end.<br><br>And always dry-run scripts that move or delete things.",
    link: { href: "lesson.html?track=files-and-data&n=1", text: "Lesson: Reading and writing files" }
  },
  {
    k: ["localstorage", "save", "remember", "persist"],
    a: "<code>localStorage</code> keeps small bits of text in the visitor's browser, surviving a refresh.<br><br>It only stores <strong>text</strong>, so objects need <code>JSON.stringify</code> going in and <code>JSON.parse</code> coming out.<br><br>It lives in one browser on one device — it's not a database and not an account.",
    link: { href: "lesson.html?track=interactive-pages&n=3", text: "Lesson: Remembering things with localStorage" }
  },
  {
    k: ["practice", "exercise", "challenge", "try", "playground", "write code"],
    a: "The Practice area has ten challenges you can run right in your browser — from printing your name up to FizzBuzz. Each has a hint and a worked solution.<br><br>Reading about code and writing code are different skills, and only one makes you a programmer.",
    link: { href: "playground.html", text: "Go to the Practice area" }
  },
  {
    k: ["stuck", "give up", "too hard", "confused", "difficult", "hard"],
    a: "Being stuck is the normal state of programming, not a sign you're bad at it. People who've done this for thirty years are stuck most days.<br><br>Three things that reliably help:<br>1. Read the error's last line properly<br>2. Explain the code out loud, line by line<br>3. Walk away for ten minutes — genuinely works<br><br>Then cut the problem down to the smallest example that still breaks. That often solves it before you ask anyone.",
    link: { href: "post.html?slug=why-your-code-breaks", text: "Read: Why your code breaks, and why that's normal" }
  },
  {
    k: ["ai", "are you ai", "chatgpt", "robot", "real person", "who are you", "bot"],
    a: "I'm not an AI — I'm a lookup table with a keyword matcher in front of it. Every answer here was written by hand and is always the same.<br><br>That means I can't understand a question I don't have an entry for. When that happens I'll say so rather than invent something, because a made-up answer is worse than no answer when you can't tell the difference.<br><br>A real AI helper needs a server to hold an API key safely. It's on the roadmap.",
    link: null
  },
  {
    k: ["semicolon", "this site", "who made", "about"],
    a: "Semicolon is a free learn-to-code site built by <strong>Anshuman Srivastava</strong> — 9 tracks, 27 lessons, 7 articles and a practice area.<br><br>It's built with no frameworks and no build step: plain HTML, CSS and JavaScript. The whole thing is about 130 KB and works offline.",
    link: { href: "about.html", text: "About Semicolon" }
  }
];

(function () {
  "use strict";

  /* Pages sit at the root or in /pages/, so links need the right prefix. */
  var inPages = /\/pages\//.test(window.location.pathname);
  var prefix = inPages ? "" : "pages/";

  function findAnswer(question) {
    var q = " " + question.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ") + " ";
    var best = null, bestScore = 0;

    HELP_TOPICS.forEach(function (topic) {
      var score = 0;
      topic.k.forEach(function (word) {
        if (q.indexOf(" " + word + " ") !== -1) score += 3;      // whole word
        else if (q.indexOf(word) !== -1) score += 1;             // inside a word
      });
      if (score > bestScore) { bestScore = score; best = topic; }
    });

    return bestScore > 0 ? best : null;
  }

  var SUGGESTIONS = [
    "What is a variable?",
    "How do loops work?",
    "Which language should I learn first?",
    "How do I read an error?",
    "How do I install Python?",
    "I'm stuck"
  ];

  /* ---- build the widget ---- */
  var root = document.createElement("div");
  root.id = "helperRoot";
  root.innerHTML =
    '<button class="helper-fab" id="helperFab" type="button" aria-expanded="false" ' +
        'aria-controls="helperPanel" aria-label="Open the study helper">?</button>' +
    '<div class="helper-panel" id="helperPanel" role="dialog" aria-label="Study helper" hidden>' +
      '<div class="helper-head">' +
        '<div><strong>Study helper</strong>' +
        '<span class="helper-sub">Not an AI — a written answer bank</span></div>' +
        '<button class="helper-x" id="helperClose" type="button" aria-label="Close">×</button>' +
      '</div>' +
      '<div class="helper-log" id="helperLog" aria-live="polite"></div>' +
      '<div class="helper-chips" id="helperChips"></div>' +
      '<form class="helper-form" id="helperForm">' +
        '<label class="sr-only" for="helperInput">Ask a question</label>' +
        '<input id="helperInput" type="text" autocomplete="off" ' +
               'placeholder="Ask about loops, errors, Git…">' +
        '<button class="btn btn--primary btn--sm" type="submit">Ask</button>' +
      '</form>' +
    '</div>';
  document.body.appendChild(root);

  var fab    = document.getElementById("helperFab");
  var panel  = document.getElementById("helperPanel");
  var log    = document.getElementById("helperLog");
  var chips  = document.getElementById("helperChips");
  var form   = document.getElementById("helperForm");
  var input  = document.getElementById("helperInput");

  function say(who, html) {
    var d = document.createElement("div");
    d.className = "helper-msg helper-msg--" + who;
    d.innerHTML = html;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }

  function ask(question) {
    /* The visitor's own words go in as TEXT, never as HTML — otherwise
       typing a script tag into the box would run it. */
    var safe = document.createElement("div");
    safe.textContent = question;
    say("you", safe.innerHTML);

    var topic = findAnswer(question);

    if (!topic) {
      say("bot",
        "I don't have an answer written for that one — I'm a fixed answer bank, not " +
        "an AI, so I'd rather say so than make something up.<br><br>Try one of the " +
        "buttons above, or search the <a href=\"" + prefix + "blog.html\">blog</a>.");
      return;
    }

    var html = topic.a;
    if (topic.link) {
      html += '<br><br><a class="helper-link" href="' + prefix + topic.link.href + '">' +
              topic.link.text + " →</a>";
    }
    say("bot", html);
  }

  SUGGESTIONS.forEach(function (s) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "helper-chip";
    b.textContent = s;
    b.addEventListener("click", function () { ask(s); });
    chips.appendChild(b);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) return;
    ask(q);
    input.value = "";
  });

  function open() {
    panel.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    if (!log.childElementCount) {
      say("bot",
        "Hello. I answer common questions about programming and about this site.<br><br>" +
        "<strong>I'm not an AI</strong> — I'm a set of written answers with a keyword " +
        "matcher. If I don't know something, I'll tell you rather than guess.");
    }
    input.focus();
  }
  function close() {
    panel.hidden = true;
    fab.setAttribute("aria-expanded", "false");
    fab.focus();
  }

  fab.addEventListener("click", function () { panel.hidden ? open() : close(); });
  document.getElementById("helperClose").addEventListener("click", close);

  /* Escape closes it — expected behaviour for anything overlay-shaped. */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) close();
  });
})();
