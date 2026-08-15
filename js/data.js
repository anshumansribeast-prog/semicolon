/* ===================================================================
   data.js — all the site's content.

   Content lives here as plain data. The pages are GENERATED from it.
   That means adding a ninth track or a seventh post is one object in
   an array, not a new block of copy-pasted HTML.

   On a bigger site this would come from a database over an API. The
   shape of the data would be identical — only where it's fetched from
   changes. That's why it's worth doing it this way now.
   =================================================================== */

/* ---------- LEARNING TRACKS ---------------------------------------- */
const TRACKS = [
  {
    id: 1,
    slug: "first-program",
    title: "Your First Program",
    blurb: "Install Python, write five lines, and watch a computer do exactly what you told it. The whole loop, start to finish.",
    level: "Beginner",
    category: "Python",
    hours: 2,
    lessons: 4,
    price: "Free",
    initials: "01",
    c1: "#1d4ed8", c2: "#4f46e5",
    build: "A greeting program that asks your name and answers you.",
    prereq: "None. This is the true starting point.",
    outcomes: [
      "Install Python and run a file from the terminal",
      "Understand what an interpreter actually does",
      "Use print(), input() and variables",
      "Read your first error message without panicking"
    ]
  },
  {
    id: 2,
    slug: "thinking-in-loops",
    title: "Thinking in Loops",
    blurb: "The single idea that separates 'typing instructions' from programming: making the computer repeat work so you don't have to.",
    level: "Beginner",
    category: "Python",
    hours: 3,
    lessons: 3,
    price: "Free",
    initials: "02",
    c1: "#0369a1", c2: "#0891b2",
    build: "A times-table generator and a number-guessing game.",
    prereq: "Your First Program",
    outcomes: [
      "Write for loops and while loops, and know when to use which",
      "Use conditions to make decisions inside a loop",
      "Spot and escape an infinite loop",
      "Break a problem into repeatable steps"
    ]
  },
  {
    id: 3,
    slug: "first-web-page",
    title: "Build Your First Web Page",
    blurb: "HTML for structure, CSS for looks. By the end you'll have a real page in a real browser that you built line by line.",
    level: "Beginner",
    category: "Web",
    hours: 5,
    lessons: 3,
    price: "Free",
    initials: "03",
    c1: "#c2410c", c2: "#ea580c",
    build: "A personal profile page with a photo, links and a proper layout.",
    prereq: "None — this track is independent of the Python ones.",
    outcomes: [
      "Write semantic HTML that screen readers can follow",
      "Style with CSS using classes and the box model",
      "Lay pages out with flexbox and grid",
      "Make it work on a phone as well as a laptop"
    ]
  },
  {
    id: 4,
    slug: "interactive-pages",
    title: "Making Pages Interactive",
    blurb: "JavaScript in the browser: reacting to clicks, changing the page as it runs, and storing what the visitor did.",
    level: "Intermediate",
    category: "Web",
    hours: 8,
    lessons: 3,
    price: "Free",
    initials: "04",
    c1: "#a16207", c2: "#ca8a04",
    build: "A to-do list that survives closing the tab.",
    prereq: "Build Your First Web Page",
    outcomes: [
      "Select and change elements on the page with JavaScript",
      "Handle events like clicks, typing and form submits",
      "Store data in the browser with localStorage",
      "Debug using the browser's developer tools"
    ]
  },
  {
    id: 5,
    slug: "files-and-data",
    title: "Files, Folders and Data",
    blurb: "Get a computer to do the boring jobs — sorting, renaming and tidying hundreds of files while you do something else.",
    level: "Beginner",
    category: "Python",
    hours: 4,
    lessons: 3,
    price: "Free",
    initials: "05",
    c1: "#15803d", c2: "#059669",
    build: "A script that sorts your Downloads folder by file type.",
    prereq: "Thinking in Loops",
    outcomes: [
      "Read and write files safely",
      "Use pathlib instead of fragile text paths",
      "Preview destructive actions before running them",
      "Handle the file that's locked, missing or already there"
    ]
  },
  {
    id: 6,
    slug: "git-basics",
    title: "Version Control with Git",
    blurb: "Stop naming files final_v2_REAL_final.py. Git remembers every version so you can experiment without fear.",
    level: "Beginner",
    category: "Tools",
    hours: 3,
    lessons: 3,
    price: "Free",
    initials: "06",
    c1: "#7c2d12", c2: "#b45309",
    build: "A repository with a real history, pushed to GitHub.",
    prereq: "Any one of the beginner tracks.",
    outcomes: [
      "Understand what a commit actually is",
      "Use branches to try something risky safely",
      "Undo a mistake without losing your work",
      "Push to GitHub and read someone else's repo"
    ]
  },
  {
    id: 7,
    slug: "debugging",
    title: "Debugging: Finding Why It Broke",
    blurb: "The skill nobody teaches and everybody needs. Working programmers spend more time reading broken code than writing new code.",
    level: "Intermediate",
    category: "Core Skills",
    hours: 4,
    lessons: 3,
    price: "Free",
    initials: "07",
    c1: "#9f1239", c2: "#be123c",
    build: "Five deliberately broken programs, and the habit of fixing them.",
    prereq: "Thinking in Loops",
    outcomes: [
      "Read a stack trace from the bottom up",
      "Narrow a bug down by halving the search space",
      "Use print debugging and a real debugger",
      "Write a failing test before you fix anything"
    ]
  },
  {
    id: 8,
    slug: "ship-a-project",
    title: "Ship a Real Project",
    blurb: "Take one idea from empty folder to a link you can send someone. Planning, building, testing, deploying — the whole arc.",
    level: "Intermediate",
    category: "Projects",
    hours: 12,
    lessons: 3,
    price: "Free",
    initials: "08",
    c1: "#5b21b6", c2: "#7c3aed",
    build: "Your own project, live on the internet with a real URL.",
    prereq: "Two other tracks, in any order.",
    outcomes: [
      "Scope a project small enough to actually finish",
      "Structure a codebase someone else could read",
      "Write a README that lets a stranger run your code",
      "Deploy for free and keep it running"
    ]
  },
  {
    id: 9,
    slug: "choosing-a-language",
    title: "Choosing Your First Language",
    blurb: "Python, JavaScript, C++, Java — which one to start with, what each is actually for, and why the answer matters far less than you've been told.",
    level: "Beginner",
    category: "Core Skills",
    hours: 2,
    lessons: 3,
    price: "Free",
    initials: "09",
    c1: "#0f766e", c2: "#14b8a6",
    build: "The same small program written in four languages, so you can see how little really changes.",
    prereq: "None. Read this before you install anything.",
    outcomes: [
      "Match a language to what you want to build, instead of picking by popularity",
      "Set up Python, Node or a compiler on Windows — and verify it before writing code",
      "Explain why HTML and CSS aren't programming languages, and why that's fine",
      "Tell compiled and interpreted languages apart, and know why the difference matters",
      "Avoid language tourism — why one finished project beats ten hello-worlds"
    ]
  },
  {
    id: 10,
    slug: "secret-messages",
    title: "Secret Messages",
    blurb: "How a Caesar cipher hides a sentence by sliding the alphabet. A small project you can explain to anyone — and then put on a web page.",
    level: "Beginner",
    category: "Projects",
    hours: 3,
    lessons: 3,
    price: "Free",
    initials: "10",
    c1: "#4338ca", c2: "#7c3aed",
    build: "A cipher page that encodes and decodes a message in the browser.",
    prereq: "Your First Program, or the Practice area loops.",
    outcomes: [
      "Explain a Caesar cipher with a real worked example, not a metaphor",
      "Encode and decode text in Python, including wrapping past Z",
      "Put the same idea on a web page people can type into",
      "See why this is a toy, not a real password locker"
    ]
  }
];

/* ---------- BLOG POSTS ---------------------------------------------- */
const POSTS = [
  {
    id: 7,
    slug: "which-language-first",
    title: "Python, JavaScript, or something else? Start here.",
    excerpt: "Everyone's first question is which language to learn. It's the wrong question, and the right one is easier to answer than you think.",
    category: "Fundamentals",
    tags: ["python", "javascript", "beginners", "languages"],
    author: "Anshuman Srivastava",
    date: "2026-07-28",
    readTime: 8,
    initials: "LNG",
    c1: "#0f766e", c2: "#14b8a6",
    body: `
      <p>Every single person who decides to learn programming asks the same thing first: <strong>which language should I start with?</strong></p>
      <p>You will get loud, confident, contradictory answers. Python. No, JavaScript. No, start with C so you understand what's really happening. No, C is far too hard, start with Scratch.</p>
      <p>Here is the honest answer, and it's going to sound like a dodge until you see why it isn't:</p>
      <blockquote><p>It matters much less than you have been told. Languages are the easy part. Concepts are the hard part.</p></blockquote>

      <h2>The same program, four times</h2>
      <p>This program counts to five and says hello each time. Here it is in four completely different languages.</p>
      <pre><code># Python
for i in range(5):
    print("Hello")</code></pre>
      <pre><code>// JavaScript
for (let i = 0; i &lt; 5; i++) {
  console.log("Hello");
}</code></pre>
      <pre><code>// Java
for (int i = 0; i &lt; 5; i++) {
    System.out.println("Hello");
}</code></pre>
      <pre><code>// Go
for i := 0; i &lt; 5; i++ {
    fmt.Println("Hello")
}</code></pre>
      <p>Different brackets. Different words for "print". Different amounts of punctuation. <em>Identical idea.</em></p>
      <p>If you understand the first one, you can read all four. You just did. That's the whole point.</p>

      <h2>What actually transfers</h2>
      <p>When you learn your first language, maybe 20% of the effort is learning that language's spelling. The other 80% is learning ideas that belong to programming itself:</p>
      <ul>
        <li>Variables — storing something and using it later</li>
        <li>Loops — making the computer repeat work</li>
        <li>Conditions — making a decision</li>
        <li>Functions — naming a chunk of work so you can reuse it</li>
        <li>Lists — holding many things at once</li>
        <li>Debugging — working out why it broke</li>
      </ul>
      <p>You learn those <strong>once</strong>. Every language after your first is mostly new spelling for ideas you already own, which is why your second language takes a fraction of the time and your fourth takes about a weekend.</p>
      <p>So the real question isn't "which language is best?" It's <strong>"what do I want to make?"</strong> Pick the language that makes that thing.</p>

      <h2>What each one is actually for</h2>
      <ul>
        <li><strong>Python</strong> — automation, data, AI, science, backends. Reads almost like English. Does the most for the least typing. The best default.</li>
        <li><strong>JavaScript</strong> — anything that happens inside a browser. If you want a website that reacts to people, this is not optional, it's the only choice.</li>
        <li><strong>SQL</strong> — asking questions of a database. Small, strange, and you can learn the useful 80% in a weekend.</li>
        <li><strong>C</strong> — operating systems and anything that must be fast. Hides nothing, which is exactly why it teaches you what a computer really does.</li>
        <li><strong>C++</strong> — big games and browsers. Enormously powerful, enormously complicated.</li>
        <li><strong>C#</strong> — Windows apps, and Unity, which is the realistic route into making games.</li>
        <li><strong>Java</strong> — big company systems and Android apps. Wordy, but it runs everywhere.</li>
        <li><strong>Go</strong> — servers. Deliberately small enough to fit in your head.</li>
        <li><strong>Rust</strong> — like C, but the compiler refuses to let you make the dangerous mistakes. Famously hard, famously loved.</li>
        <li><strong>Swift and Kotlin</strong> — iPhone and Android apps. Swift needs a Mac, and that's a wall you can't code your way around.</li>
      </ul>

      <h2>HTML and CSS are not programming languages</h2>
      <p>This confuses almost everyone, so let's be clear about it.</p>
      <p><strong>HTML describes structure</strong> — this is a heading, this is a list. <strong>CSS describes appearance</strong> — headings are blue. Neither one can make a decision, repeat something, or remember a value. There is no <code>if</code> in CSS. There is no loop in HTML.</p>
      <p>That's not an insult to them. You cannot build anything for the web without both, and writing good CSS is a genuine skill that takes years. They're simply a different <em>kind</em> of thing: description, not instruction.</p>
      <p>The moment your page needs to <em>decide</em> or <em>react</em>, that's JavaScript. That's the line.</p>

      <h2>Two families: compiled and interpreted</h2>
      <p>One real difference worth knowing early, because it explains why some languages feel so different to use.</p>
      <p><strong>Interpreted</strong> languages — Python, JavaScript — run your file directly. Write, save, run, see the result. Fast to experiment with.</p>
      <pre><code>python hello.py</code></pre>
      <p><strong>Compiled</strong> languages — C, C++, Go, Rust, Java — must first be translated into machine code by a program called a compiler. Only then can you run the result. Two steps, not one.</p>
      <pre><code>gcc hello.c -o hello
./hello</code></pre>
      <p>Compiling is slower to work with, and in exchange the finished program runs much faster and the compiler catches whole categories of mistake before your program ever runs. Neither approach is better. They're different trades, and now you know which trade you're making.</p>

      <h2>What you actually need</h2>
      <p>Less than you think. Programming is one of the very few serious hobbies where the equipment you already own is genuinely enough. Any laptop from the last ten years runs every language on this page. You do not need a gaming PC, and anyone telling you otherwise is selling something.</p>
      <p>You need five things, and two of them you already have:</p>
      <ol>
        <li><strong>A text editor</strong> — VS Code, free</li>
        <li><strong>A terminal</strong> — already on your computer</li>
        <li><strong>A runtime</strong> — the thing that runs your code. Python from python.org; JavaScript is already inside your browser</li>
        <li><strong>A browser</strong> — you're using one now, and its DevTools are a free JavaScript console</li>
        <li><strong>Git</strong> — so you never lose work</li>
      </ol>
      <p>Genuinely, the cheapest possible start: press <code>F12</code> in your browser right now, click Console, type <code>2 + 2</code> and press Enter. You just programmed. Nothing installed, nothing paid for.</p>

      <h2>The habit that saves you hours</h2>
      <p>After you install anything, <strong>check that it worked before writing a single line of code</strong>:</p>
      <pre><code>python --version</code></pre>
      <p>A version number means you're ready. "Not recognised" means the install didn't work, and no amount of clever code will fix that.</p>
      <p>An enormous share of beginner frustration is writing fifty lines against a broken install, then hunting for a bug in code that was fine all along. Verify first. Always.</p>

      <h2>What to skip for now</h2>
      <p>You'll see these names constantly. They aren't bad, they're just not where you should be:</p>
      <ul>
        <li><strong>PHP</strong> — runs a lot of the existing web, but very little new work starts in it</li>
        <li><strong>Ruby</strong> — a lovely language with a shrinking world</li>
        <li><strong>R</strong> — statistics only, and Python does most of it</li>
        <li><strong>Assembly</strong> — fascinating, and useful to a tiny fraction of programmers</li>
      </ul>

      <h2>The trap</h2>
      <p>The real danger isn't picking the "wrong" language. It's <strong>language tourism</strong>: installing a new one every week, writing hello-world, feeling productive, and learning almost nothing.</p>
      <p>Ten hello-worlds in ten languages teaches you ten ways to print a word. One finished project in one language teaches you how software actually gets built — including all the unglamorous parts nobody puts in a tutorial, like what to do when it breaks at 11pm.</p>
      <blockquote><p>Depth in one language beats a shallow tour of six. Every time.</p></blockquote>

      <h2>So: what should you do?</h2>
      <p>A clear answer, since the whole point of this post was to give you one.</p>
      <ol>
        <li><strong>Start with Python.</strong> It's forgiving, readable, and useful the same day you learn it.</li>
        <li><strong>Add JavaScript when you want to build for the web</strong> — and you will, because being able to send someone a link is a genuinely different feeling to running a file on your own machine.</li>
        <li><strong>Add SQL when you have data worth storing.</strong> Not before. It'll make sense when you have a reason.</li>
        <li><strong>Then choose a fourth based on what you want to build</strong> — C# for games, Go for servers, C if you want to understand the machine underneath it all.</li>
      </ol>
      <p>And if you're still stuck choosing after reading all that, here's the rule that cuts through it:</p>
      <blockquote><p>Choose the language your project needs. If no project needs a language yet, the problem isn't which language to pick — it's that you need a project.</p></blockquote>
    `
  },
  {
    id: 1,
    slug: "read-the-error-message",
    title: "Read the error message. Actually read it.",
    excerpt: "Beginners see a wall of red text and scroll past it. That wall usually contains the file, the line number and the exact problem.",
    category: "Debugging",
    tags: ["errors", "python", "habits"],
    author: "Anshuman Srivastava",
    date: "2026-07-18",
    readTime: 4,
    initials: "ERR",
    c1: "#9f1239", c2: "#be123c",
    body: `
      <p>Here is the single fastest way to get better at programming, and it costs nothing: when your program crashes, <strong>read what it says</strong>.</p>
      <p>I know. The text is red, there's a lot of it, and it looks like the computer is angry at you. It isn't. It's trying to help, and it's usually being very specific.</p>

      <h2>What's actually in there</h2>
      <p>A Python error has three useful parts, and you should read them from the <em>bottom up</em>:</p>
      <pre><code>Traceback (most recent call last):
  File "sort_files.py", line 14, in &lt;module&gt;
    total = count / len(files)
ZeroDivisionError: division by zero</code></pre>
      <ul>
        <li><strong>Last line — the type of problem.</strong> <code>ZeroDivisionError: division by zero</code>. You divided by zero.</li>
        <li><strong>Second-to-last — the exact code.</strong> <code>total = count / len(files)</code>. So <code>len(files)</code> was zero.</li>
        <li><strong>The line above that — where.</strong> File <code>sort_files.py</code>, line 14.</li>
      </ul>
      <p>You now know what went wrong, which line it happened on, and why. That took eight seconds. The list of files was empty — probably the folder was empty, or the filter matched nothing.</p>

      <h2>The bit that trips everyone up</h2>
      <p>The line number tells you where the program <em>fell over</em>, which is not always where the mistake <em>is</em>. If line 14 divides by <code>len(files)</code>, the actual bug might be on line 6 where <code>files</code> was filled in.</p>
      <blockquote><p>The error tells you where the symptom appeared. Your job is to walk backwards to the cause.</p></blockquote>

      <h2>Three habits worth building</h2>
      <ol>
        <li><strong>Read the last line first.</strong> It names the problem in plain-ish English.</li>
        <li><strong>Paste the error, not your whole file, when asking for help.</strong> People can diagnose from an error. They can't read 300 lines.</li>
        <li><strong>Search the exact error type, minus your own filenames.</strong> Searching <code>ZeroDivisionError division by zero</code> gets useful results. Searching <code>my_sort_script.py line 14</code> gets nothing, because nobody else has your file.</li>
      </ol>
      <p>Every experienced programmer you've ever seen looking calm about a crash is just doing this. There's no other trick.</p>
    `
  },
  {
    id: 2,
    slug: "variables-are-boxes",
    title: "Variables are boxes, not equations",
    excerpt: "In maths, x = 5 states a fact. In code, it's an instruction: put 5 in the box called x. That difference explains a lot of early confusion.",
    category: "Fundamentals",
    tags: ["variables", "basics", "mental-models"],
    author: "Anshuman Srivastava",
    date: "2026-07-11",
    readTime: 5,
    initials: "VAR",
    c1: "#1d4ed8", c2: "#4f46e5",
    body: `
      <p>In maths class, <code>x = 5</code> is a statement of fact. It's true now, it was true a second ago, and it'll be true at the end of the page.</p>
      <p>In code, <code>x = 5</code> is a <em>command</em>. It means: <strong>put the value 5 into the box labelled x.</strong> And the very next line is free to put something completely different in that box.</p>
      <pre><code>score = 0
score = score + 10
score = score + 5
print(score)   # 15</code></pre>
      <p>Look at line 2 with your maths hat on and it's nonsense — <code>score</code> can't equal itself plus ten. With your code hat on it's obvious: work out what's in the box, add ten, put the result back.</p>

      <h2>Why this matters more than it sounds</h2>
      <p>Almost every confusing beginner bug comes from forgetting that the box's contents change over time. Consider:</p>
      <pre><code>total = 0
prices = [3, 7, 5]

for price in prices:
    total = total + price

print(total)   # 15</code></pre>
      <p>Nothing here is true "in general". The value in <code>total</code> is 0, then 3, then 10, then 15. If you try to reason about it as a fixed fact you'll tie yourself in knots. If you picture a box being emptied and refilled four times, it's easy.</p>

      <h2>The name is a label, not the thing</h2>
      <p>A second idea that saves pain later: the name isn't the value, it's a label stuck onto it. Two labels can point at the same thing:</p>
      <pre><code>a = [1, 2, 3]
b = a          # not a copy — a second label on the same list
b.append(4)
print(a)       # [1, 2, 3, 4]  ← surprise!</code></pre>
      <p>People lose entire evenings to that one. <code>b = a</code> didn't make a new list; it stuck a second label on the existing one. Change it through either name and both "see" the change, because there was only ever one list.</p>
      <blockquote><p>Variables are labels on boxes. Assignment moves the label or refills the box — it never states a permanent truth.</p></blockquote>
      <p>Hold that picture and a surprising amount of programming stops being mysterious.</p>
    `
  },
  {
    id: 3,
    slug: "three-loops",
    title: "The three loops you'll actually use",
    excerpt: "Textbooks list five kinds of loop. In real code you'll reach for three, and one of them far more than the others.",
    category: "Fundamentals",
    tags: ["loops", "python", "basics"],
    author: "Anshuman Srivastava",
    date: "2026-07-04",
    readTime: 6,
    initials: "FOR",
    c1: "#0369a1", c2: "#0891b2",
    body: `
      <p>Loops are where programming starts being worth the effort. Up to that point you're just typing instructions one at a time — which a computer does faster than you, but you still had to write them all.</p>

      <h2>1. For each thing in this collection</h2>
      <p>By far the most common. You have a list of things and want to do something to every one:</p>
      <pre><code>for file in downloads:
    print(file.name)</code></pre>
      <p>Read it out loud: "for each file in downloads, print its name." If you can say the sentence, you can write the loop. You'll use this more than the other two combined.</p>

      <h2>2. Do this a set number of times</h2>
      <pre><code>for i in range(5):
    print("Attempt", i + 1)</code></pre>
      <p><code>range(5)</code> gives you 0, 1, 2, 3, 4 — five numbers, starting at zero. Starting at zero feels wrong for about a week and then feels normal forever. Note the <code>i + 1</code> when printing: the computer counts from 0, humans count from 1.</p>

      <h2>3. Keep going until something changes</h2>
      <pre><code>guess = ""
while guess != "blue":
    guess = input("What colour am I thinking of? ")
print("Correct.")</code></pre>
      <p>Use <code>while</code> when you genuinely don't know how many repeats you need. Waiting for correct input, retrying a download, running a game until someone wins.</p>

      <h2>The one trap</h2>
      <p>A <code>while</code> loop that never becomes false runs forever:</p>
      <pre><code>count = 10
while count > 0:
    print(count)
    # forgot to decrease count — this never ends</code></pre>
      <p>Every <code>while</code> loop needs something inside it that eventually makes the condition false. Before you run one, find that line with your finger. If you can't find it, you've got an infinite loop.</p>
      <p><strong>Escape hatch:</strong> <code>Ctrl + C</code> in the terminal stops a runaway program. Learn it now, not at 11pm.</p>

      <h2>Which to reach for</h2>
      <ul>
        <li>Got a collection? <code>for x in things</code></li>
        <li>Know the count? <code>for i in range(n)</code></li>
        <li>Neither? <code>while condition</code></li>
      </ul>
      <p>That's it. That covers the overwhelming majority of loops in real code.</p>
    `
  },
  {
    id: 4,
    slug: "eight-planets-no-images",
    title: "How I drew eight planets with zero image files",
    excerpt: "A project write-up: building an offline astronomy site where Jupiter's bands, Saturn's rings and the Moon's phases are all code, not pictures.",
    category: "Projects",
    tags: ["css", "svg", "project", "offline"],
    author: "Anshuman Srivastava",
    date: "2026-06-27",
    readTime: 7,
    initials: "CSS",
    c1: "#5b21b6", c2: "#7c3aed",
    body: `
      <p>I wanted an astronomy site that worked with no internet — on a plane, on school wifi, anywhere. That ruled out downloading NASA photos. So every planet on it is drawn with CSS instead.</p>
      <p>It turned out better than the photos would have been. Here's how the pieces work.</p>

      <h2>A sphere is a circle with the right shadow</h2>
      <p>A <code>div</code> with <code>border-radius: 50%</code> is a flat disc. What makes it look like a ball is an <em>inset</em> shadow pushed to one side — that's the planet's night side:</p>
      <pre><code>.planet {
  width: 120px; height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fb923c, #b4442a 62%, #601f14);
  box-shadow: inset -16px -12px 38px rgba(0,0,0,.72);
}</code></pre>
      <p>The gradient is offset to 35% 30% so the "sun" appears to be up and to the left. The inset shadow darkens the opposite corner. Two lines, and it reads as a sphere.</p>

      <h2>Jupiter's bands are a repeating gradient</h2>
      <pre><code>background:
  repeating-linear-gradient(180deg,
    rgba(255,241,214,.55) 0 7px,
    rgba(190,130,80,.5)   7px 14px,
    rgba(245,222,179,.4)  14px 20px),
  radial-gradient(circle at 35% 30%, #f5deb3, #b57a45 66%);</code></pre>
      <p>Backgrounds stack, first on top. The stripes sit over the sphere gradient. The Great Red Spot is one more small elliptical gradient layered above both.</p>

      <h2>Saturn's rings are a rotated border</h2>
      <p>This is my favourite trick. Take a pseudo-element, make it a circle bigger than the planet, give it a thick border and no fill, then squash it flat and tilt it:</p>
      <pre><code>.saturn::after {
  content: "";
  width: 195%; aspect-ratio: 1;
  border-radius: 50%;
  border: 11px solid rgba(226,200,150,.5);
  transform: translate(-50%,-50%) rotate(-19deg) scaleY(.2);
}</code></pre>
      <p><code>scaleY(.2)</code> is what turns a circle into an ellipse seen edge-on. Rotate it and you have rings.</p>

      <h2>The moon phase is arithmetic</h2>
      <p>The harder problem was the Moon. Its phase on any date comes from two numbers: one known new moon (6 January 2000) and the length of the lunar cycle (29.530589 days). Everything else is division.</p>
      <p>Drawing it needs one insight: the boundary between light and dark is a circle seen at an angle, so it looks like an <em>ellipse</em>. The lit shape is half a circle joined to half an ellipse, and the ellipse's width shrinks to zero at the quarters — which is exactly why a half moon has a straight edge.</p>

      <h2>What I'd tell you before you try it</h2>
      <ul>
        <li><strong>Test the maths against something real.</strong> Solar eclipses only happen at new moon; lunar eclipses only at full. I checked five real eclipse dates and all five landed correctly. That's proof, not a vibe.</li>
        <li><strong>Layering order in CSS is first-on-top.</strong> I got this backwards twice.</li>
        <li><strong>Drawing beats downloading more often than you'd think.</strong> The whole site is 127 KB — smaller than one photo of Jupiter.</li>
      </ul>
    `
  },
  {
    id: 5,
    slug: "first-ten-git-commands",
    title: "Your first ten Git commands",
    excerpt: "Git has hundreds of commands. You need about ten, and you'll use five of them ninety percent of the time.",
    category: "Tools",
    tags: ["git", "tools", "workflow"],
    author: "Anshuman Srivastava",
    date: "2026-06-20",
    readTime: 5,
    initials: "GIT",
    c1: "#7c2d12", c2: "#b45309",
    body: `
      <p>Git looks intimidating because the documentation describes all of it. In daily use it's a very short list.</p>

      <h2>The five you'll use constantly</h2>
      <pre><code>git status              # what has changed? run this constantly
git add .               # stage everything for the next save
git commit -m "message" # save a snapshot, with a note
git push                # send your commits to GitHub
git pull                # get other people's commits</code></pre>
      <p><code>git status</code> is the one to over-use. It's free, it's read-only, and it tells you exactly where you are. Run it before and after everything until you stop needing to.</p>

      <h2>The three for looking around</h2>
      <pre><code>git log --oneline       # your history, one line per commit
git diff                # what exactly did I change?
git show HEAD           # what was in my last commit?</code></pre>

      <h2>The two for branching</h2>
      <pre><code>git switch -c my-idea   # make a branch and move to it
git switch main         # go back to the main branch</code></pre>
      <p>A branch is a safe sandbox. Try the risky change on a branch; if it works, merge it, and if it doesn't, delete the branch and nothing was lost.</p>

      <h2>What a commit actually is</h2>
      <p>Not a backup of a file. A commit is a snapshot of the <em>whole project</em> at one moment, plus a note about why. That's why "fixed stuff" is a bad message and "fix crash when Downloads folder is empty" is a good one — in six months, the message is the only thing you'll have.</p>
      <blockquote><p>Commit when something works, not when you finish for the day. A commit is a save point in a game, and you want the save point just after you beat something, not at a random moment.</p></blockquote>

      <h2>The rule that saves you</h2>
      <p>Write a <code>.gitignore</code> file <strong>before your first commit</strong>. It lists things Git should never track:</p>
      <pre><code>node_modules/
.env
*.db
dist/</code></pre>
      <p>Especially <code>.env</code>. If a password or API key ever lands in a commit, it is in the history permanently — even if you delete it later. The only real fix at that point is to change the password. Getting <code>.gitignore</code> right first costs you two minutes.</p>
    `
  },
  {
    id: 6,
    slug: "why-your-code-breaks",
    title: "Why your code breaks, and why that's completely normal",
    excerpt: "Nobody writes working code first time. The difference between a beginner and a professional isn't fewer bugs — it's a faster route out of them.",
    category: "Fundamentals",
    tags: ["mindset", "debugging", "habits"],
    author: "Anshuman Srivastava",
    date: "2026-06-13",
    readTime: 4,
    initials: "WHY",
    c1: "#15803d", c2: "#059669",
    body: `
      <p>Something worth knowing early, because it saves a lot of unnecessary discouragement: <strong>professional programmers write broken code all day long.</strong></p>
      <p>The code that ends up in a finished app has usually failed many times before it worked. You just never see that part. You see the finished tutorial where everything runs first time, which is a bit like watching a cooking programme and concluding that nobody ever burns anything.</p>

      <h2>The three kinds of broken</h2>
      <ol>
        <li><strong>It won't run at all.</strong> A typo, a missing bracket, a misspelt name. The computer tells you the line. These are the easy ones, and they feel the worst because they stop you dead.</li>
        <li><strong>It runs and crashes partway.</strong> Something was empty, or missing, or the wrong type. The error names the problem. Still fairly easy.</li>
        <li><strong>It runs perfectly and gives the wrong answer.</strong> No error at all. This is the genuinely hard kind, and it's why testing exists.</li>
      </ol>

      <h2>The one technique that works on all three</h2>
      <p>Cut the problem in half. If a 40-line program does the wrong thing, don't stare at all 40 lines. Print something out at line 20. Is it correct there? Then the bug is in the second half. Not correct? First half. Do it again on that half.</p>
      <p>Forty lines becomes twenty, then ten, then five, then one. Six checks, worst case. This works no matter how big the program is, and it's what people mean when they say they're "good at debugging" — not intuition, just refusing to search the whole thing at once.</p>

      <h2>Things that are not evidence you're bad at this</h2>
      <ul>
        <li>Spending an hour on something that turns out to be a missing colon</li>
        <li>Having to look up the same syntax for the fifth time</li>
        <li>Copying an error message into a search engine</li>
        <li>Not understanding someone else's code immediately</li>
      </ul>
      <p>All four of those describe a normal working day for people who do this professionally. The looking-things-up never stops; you just get faster at knowing what to look up.</p>
      <blockquote><p>The goal isn't to stop writing bugs. It's to shorten the distance between writing one and finding it.</p></blockquote>
    `
  }
];

/* ---------- QUOTES --------------------------------------------------
   These replaced a set of invented testimonials.

   A brand-new site has no users, so it has no reviews. Writing fake
   ones and putting names to them is dishonest, and it's the single
   most common way otherwise-decent sites lose trust. Real quotes from
   people who actually built this field are more useful anyway — and
   every one below is checkable, with a source and a year.        */
const QUOTES = [
  {
    quote: "Everyone knows that debugging is twice as hard as writing a program in the first place. So if you're as clever as you can be when you write it, how will you ever debug it?",
    name: "Brian Kernighan",
    role: "The Elements of Programming Style, 1978"
  },
  {
    quote: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    name: "Martin Fowler",
    role: "Refactoring, 1999"
  },
  {
    quote: "Testing shows the presence, not the absence of bugs.",
    name: "Edsger W. Dijkstra",
    role: "NATO Software Engineering Conference, 1969"
  },
  {
    quote: "The most damaging phrase in the language is: we've always done it this way.",
    name: "Grace Hopper",
    role: "US Navy Rear Admiral, computing pioneer"
  },
  {
    quote: "We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil.",
    name: "Donald Knuth",
    role: "Structured Programming with go to Statements, 1974"
  }
];

/* ---------- FAQ ------------------------------------------------------ */
const FAQS = [
  {
    q: "Do I need to know any maths?",
    a: "Almost none. Basic arithmetic covers the great majority of everyday programming. Some specific fields — 3D graphics, machine learning, physics simulation — need more, but you can go a very long way without meeting anything harder than a percentage."
  },
  {
    q: "Which language should I start with?",
    a: "Python if you want to automate things, work with data, or just get something working quickly. HTML, CSS and JavaScript if you want to build things people can visit in a browser. Both are good starting points and neither is a wasted choice — the underlying ideas transfer completely."
  },
  {
    q: "How long until I can build something real?",
    a: "A useful script that saves you a real task: a few weeks of occasional practice. Something you'd show other people: a few months. Confidently building whatever you can imagine: years — and everyone who does this is still learning. The first milestone comes much sooner than people expect."
  },
  {
    q: "Do I need an expensive computer?",
    a: "No. Anything made in the last decade will run everything on this site. Programming tools are unusually light — the editors and languages used professionally are free and run comfortably on modest hardware."
  },
  {
    q: "Is it too late to start?",
    a: "No. People start at 12 and people start at 50. The only thing that meaningfully predicts progress is doing a little regularly rather than a lot occasionally — twenty minutes most days beats six hours one Saturday."
  },
  {
    q: "What if I get stuck?",
    a: "You will — that's the job, not a sign of failure. Read the error message properly, cut the problem in half to find where it goes wrong, then search the exact error text. If that fails, ask somewhere like Stack Overflow with your error message and the smallest piece of code that reproduces it."
  }
];

/* Publish to the page for the other scripts. */
window.TRACKS = TRACKS;
window.POSTS = POSTS;
window.QUOTES = QUOTES;
window.FAQS = FAQS;
