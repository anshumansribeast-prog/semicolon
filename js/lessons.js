/* ===================================================================
   lessons.js — the actual teaching content.

   WHY THIS IS A SEPARATE FILE FROM data.js
   data.js holds metadata: titles, blurbs, how many lessons a track
   has. This file holds the lessons themselves, which are much longer.
   Splitting them means the Learn page can list every track without
   downloading thousands of words of lesson text it is not going to
   show. Only lesson.html loads this file.

   SHAPE
     LESSONS["track-slug"] = [ { title, minutes, body }, ... ]

   Each body is plain HTML. Written as separate assignments rather
   than one giant object so a track can be added or edited without
   touching any other track.
   =================================================================== */

var LESSONS = {};

/* ================================================================
   1 · YOUR FIRST PROGRAM
   ================================================================ */
LESSONS["first-program"] = [
  {
    title: "Installing Python and proving it worked",
    minutes: 8,
    body: `
      <p>Before you write a single line of code, you need the thing that <em>runs</em>
      code. For Python that is the Python interpreter, and it is free.</p>

      <h3>Getting it</h3>
      <p>Go to <strong>python.org</strong>, download the latest version for your system,
      and run the installer. On Windows there is one checkbox that matters more than
      all the others:</p>
      <blockquote><p><strong>Tick "Add Python to PATH"</strong> on the very first
      installer screen. If you miss it, your computer installs Python perfectly and
      then claims it cannot find it — which is the single most common way beginners
      lose an hour.</p></blockquote>

      <h3>Now prove it worked</h3>
      <p>Open a terminal — PowerShell on Windows, Terminal on Mac — and type:</p>
      <pre><code>python --version</code></pre>
      <p>You want to see something like <code>Python 3.14.6</code>. A version number
      means you are ready.</p>
      <p>If instead you see <em>"not recognised"</em> or <em>"command not found"</em>,
      the install did not finish properly. Do not start writing code yet. Reinstall
      and watch for that checkbox.</p>

      <h3>The habit worth building right now</h3>
      <p>Notice what we just did: we installed something, then <strong>checked it
      worked before relying on it.</strong> That sounds obvious and almost nobody does
      it. An enormous amount of beginner frustration is writing fifty lines of code
      against a broken install, then hunting for a bug in code that was fine all along.</p>
      <p><strong>Verify first. Always.</strong> It costs five seconds and saves hours.</p>
    `
  },
  {
    title: "Your first five lines",
    minutes: 10,
    body: `
      <p>Make a new file called <code>hello.py</code>. The <code>.py</code> ending is
      how your computer knows it is Python. Put this inside:</p>
      <pre><code>print("Hello, world!")</code></pre>
      <p>Save it. In your terminal, move to the folder it is in, and run:</p>
      <pre><code>python hello.py</code></pre>
      <p>Your computer just did exactly what you told it. That is the entire job.</p>

      <h3>Making it talk back</h3>
      <pre><code>name = input("What's your name? ")
print("Hello, " + name + "!")</code></pre>
      <p>Three new ideas in two lines:</p>
      <ul>
        <li><code>input()</code> stops and waits for you to type something</li>
        <li><code>name =</code> stores what you typed in a labelled box called
        <code>name</code></li>
        <li><code>+</code> joins pieces of text together</li>
      </ul>

      <h3>A neater way to join text</h3>
      <p>That <code>+</code> gets ugly fast. Python has a better way — an f-string:</p>
      <pre><code>name = input("What's your name? ")
age = input("How old are you? ")
print(f"Hello {name}, you are {age} years old.")</code></pre>
      <p>The <code>f</code> before the quote mark means "look inside this text for
      curly brackets and swap in the values." Much easier to read, and much harder to
      get wrong.</p>

      <h3>Try this</h3>
      <p>Change the program so it also asks for your favourite colour and uses it in
      the reply. You already know everything you need.</p>
    `
  },
  {
    title: "Reading your first error without panicking",
    minutes: 9,
    body: `
      <p>Your program is going to break. Not might — will, today, probably in the next
      ten minutes. That is completely normal and it happens to people who have been
      doing this for thirty years.</p>
      <p>Break it on purpose right now. Change <code>print</code> to <code>prnt</code>
      and run it.</p>
      <pre><code>Traceback (most recent call last):
  File "hello.py", line 2, in &lt;module&gt;
    prnt(f"Hello {name}")
NameError: name 'prnt' is not defined</code></pre>

      <h3>Read it from the bottom up</h3>
      <p>That wall of text looks angry. It is not — it is being extremely helpful, and
      it tells you three things:</p>
      <ul>
        <li><strong>Last line — what went wrong.</strong>
        <code>NameError: name 'prnt' is not defined</code>. Python does not know what
        <code>prnt</code> means.</li>
        <li><strong>Line above — the exact code.</strong> You can see the typo sitting
        right there.</li>
        <li><strong>Line above that — where.</strong> File <code>hello.py</code>,
        line 2.</li>
      </ul>
      <p>What went wrong, which line, and why — in about eight seconds.</p>

      <h3>The trap</h3>
      <p>The line number tells you where the program <em>fell over</em>, which is not
      always where the mistake <em>is</em>. If line 20 crashes because a value set on
      line 4 was wrong, Python points at line 20. Your job is to walk backwards from
      the symptom to the cause.</p>

      <h3>Three habits</h3>
      <ol>
        <li><strong>Read the last line first.</strong> It names the problem in almost
        plain English.</li>
        <li><strong>When asking for help, paste the error, not your whole file.</strong>
        People can diagnose from an error. Nobody reads 300 lines.</li>
        <li><strong>Search the error type, not your filenames.</strong> Searching
        <code>NameError is not defined python</code> finds thousands of answers.
        Searching <code>my_hello_script.py line 2</code> finds nothing, because nobody
        else has your file.</li>
      </ol>
      <p>Every calm-looking programmer you have ever seen is just doing this. There is
      no other trick.</p>
    `
  }
];

/* ================================================================
   2 · THINKING IN LOOPS
   ================================================================ */
LESSONS["thinking-in-loops"] = [
  {
    title: "Why loops are the real beginning",
    minutes: 7,
    body: `
      <p>Everything up to now has been giving a computer instructions one at a time.
      Useful, but a human could have done it. Loops are where the computer starts
      being genuinely better than you at something.</p>
      <p>Print the seven times table without a loop:</p>
      <pre><code>print(7)
print(14)
print(21)
print(28)</code></pre>
      <p>Boring, and wrong the moment you want it to go to 100. With a loop:</p>
      <pre><code>for i in range(1, 11):
    print(i * 7)</code></pre>
      <p>Two lines. Change <code>11</code> to <code>1001</code> and it does a thousand.
      That is the difference between typing instructions and programming.</p>

      <h3>What range() actually gives you</h3>
      <pre><code>range(5)        # 0, 1, 2, 3, 4     - starts at 0, five numbers
range(1, 6)     # 1, 2, 3, 4, 5     - from 1, stops BEFORE 6
range(0, 10, 2) # 0, 2, 4, 6, 8     - every 2nd number</code></pre>
      <p><strong>The end number is never included.</strong> This catches everyone. If
      you want 1 to 10, you write <code>range(1, 11)</code>. It looks wrong and it is
      correct.</p>

      <h3>The indentation is not decoration</h3>
      <p>In Python, the spaces at the start of a line are part of the language. The
      indented lines are what repeats:</p>
      <pre><code>for i in range(3):
    print("inside the loop")
print("outside - runs once")</code></pre>
      <p>Move that last line four spaces right and it runs three times instead of once.
      Nothing else changed.</p>
    `
  },
  {
    title: "while loops, and the infinite loop trap",
    minutes: 9,
    body: `
      <p>A <code>for</code> loop runs a known number of times. A <code>while</code>
      loop runs until something stops being true — which is what you want when you do
      not know how many goes it will take.</p>
      <pre><code>secret = 7
guess = 0

while guess != secret:
    guess = int(input("Guess a number: "))

print("Got it!")</code></pre>
      <p>The player might take one guess or fifty. A <code>for</code> loop cannot
      express that. A <code>while</code> loop can.</p>

      <h3>int() and why it is there</h3>
      <p><code>input()</code> always gives you <strong>text</strong>, even when the
      person typed a number. The text <code>"7"</code> and the number <code>7</code>
      are different things to Python, and comparing them is always false. That is why
      the guess is wrapped in <code>int()</code> — it converts text into a whole number.</p>
      <p>Leave <code>int()</code> out and the loop never ends, because a piece of text
      will never equal a number. Which brings us to:</p>

      <h3>The infinite loop</h3>
      <pre><code>count = 10
while count &gt; 0:
    print(count)
    # forgot to make count smaller!</code></pre>
      <p>This prints 10 forever. Your terminal fills up, your fan spins, nothing stops.</p>
      <p><strong>Press Ctrl + C to kill it.</strong> Learn that now, before you need it
      in a panic. It is the universal "stop this program" key.</p>
      <p>Every infinite loop has the same cause: <strong>the thing being tested never
      changes.</strong> Before you write a while loop, ask yourself one question — what
      inside this loop will eventually make the test false? If you cannot answer, you
      have an infinite loop.</p>
    `
  },
  {
    title: "Making decisions inside a loop",
    minutes: 10,
    body: `
      <p>Loops repeat. <code>if</code> chooses. Together they cover an enormous amount
      of real programming.</p>
      <pre><code>for number in range(1, 21):
    if number % 2 == 0:
        print(f"{number} is even")
    else:
        print(f"{number} is odd")</code></pre>

      <h3>The two symbols people mix up</h3>
      <ul>
        <li><code>=</code> means <strong>put this value in that box</strong>.
        <code>score = 10</code></li>
        <li><code>==</code> means <strong>are these the same?</strong>
        <code>if score == 10</code></li>
      </ul>
      <p>One equals sign stores. Two equals signs ask. Using <code>=</code> where you
      meant <code>==</code> is a rite of passage.</p>

      <h3>What % does</h3>
      <p><code>%</code> is the remainder after dividing. <code>7 % 2</code> is
      <code>1</code>, because 7 divided by 2 is 3 with 1 left over. So
      <code>number % 2 == 0</code> means "divides by 2 with nothing left over" — which
      is exactly what even means.</p>
      <p>It looks like a niche maths trick and it is genuinely everywhere: every other
      row striped, every third item, is this a leap year.</p>

      <h3>Breaking out early</h3>
      <pre><code>for guess in range(1, 6):
    answer = input("Guess: ")
    if answer == "python":
        print("Correct!")
        break
    print("Nope, try again")
else:
    print("Out of guesses.")</code></pre>
      <p><code>break</code> leaves the loop immediately. And that <code>else</code> is
      a genuinely odd Python feature: attached to a loop, it runs <em>only if the loop
      finished without breaking</em>. Perfect for "they used all their guesses".</p>

      <h3>Build this</h3>
      <p>A number-guessing game: the computer picks a number between 1 and 50 with
      <code>random.randint(1, 50)</code>, and tells you higher or lower each go. You
      now know every piece you need.</p>
    `
  }
];

/* ================================================================
   3 · BUILD YOUR FIRST WEB PAGE
   ================================================================ */
LESSONS["first-web-page"] = [
  {
    title: "HTML is structure, not decoration",
    minutes: 8,
    body: `
      <p>A web page is just a text file your browser knows how to draw. Make one called
      <code>index.html</code> and put this in it:</p>
      <pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
  &lt;title&gt;My first page&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;h1&gt;Hello&lt;/h1&gt;
  &lt;p&gt;This is a real web page.&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>
      <p>Double-click it. That is a website. No install, no account, no build step.</p>

      <h3>Tags come in pairs</h3>
      <p><code>&lt;p&gt;</code> opens a paragraph and <code>&lt;/p&gt;</code> closes it.
      The slash means closing. Forget it and the browser guesses where the paragraph
      ends, usually wrongly, and usually somewhere confusing.</p>

      <h3>head and body do different jobs</h3>
      <ul>
        <li><strong>head</strong> — information <em>about</em> the page. The title, the
        description, links to stylesheets. None of it appears on the page itself.</li>
        <li><strong>body</strong> — everything people actually see.</li>
      </ul>

      <h3>Choose tags for meaning, not looks</h3>
      <p>This is the idea most beginners miss. <code>&lt;h1&gt;</code> does not mean
      "big bold text" — it means "this is the main heading of the page". It happens to
      look big, and you can change that in one line of CSS.</p>
      <p>Why it matters: a screen reader used by a blind visitor announces headings so
      they can jump around the page. Google reads them to understand what your page is
      about. Both of those depend on you using <code>&lt;h1&gt;</code> because it is
      the heading — not because you wanted big text.</p>
      <blockquote><p><strong>HTML describes what something IS. CSS describes what it
      LOOKS LIKE.</strong> Keep those two jobs separate and everything downstream gets
      easier.</p></blockquote>
    `
  },
  {
    title: "CSS: the same page, wearing different clothes",
    minutes: 10,
    body: `
      <p>Make a file called <code>style.css</code> next to your HTML, and link it from
      inside <code>&lt;head&gt;</code>:</p>
      <pre><code>&lt;link rel="stylesheet" href="style.css"&gt;</code></pre>
      <p>Then in the CSS file:</p>
      <pre><code>body {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 0 auto;
  padding: 2rem;
  line-height: 1.6;
}

h1 { color: #1d4ed8; }</code></pre>
      <p>Reload. Same HTML, completely different page.</p>

      <h3>How a rule is built</h3>
      <pre><code>h1      { color: blue; }
 ^         ^      ^
 |         |      value
 |         property
 selector - which elements this applies to</code></pre>

      <h3>Three ways to select things</h3>
      <pre><code>p          { }   /* every paragraph            */
.warning   { }   /* anything with class="warning" */
#header    { }   /* the one thing with id="header" */</code></pre>
      <p>Use classes for almost everything. Ids are for the single unique thing on a
      page, and you need them far less often than you would think.</p>

      <h3>The one trick worth learning early</h3>
      <p>Put your colours in variables at the top, and change your whole site from one
      line:</p>
      <pre><code>:root {
  --brand: #1d4ed8;
}

h1     { color: var(--brand); }
a      { color: var(--brand); }
button { background: var(--brand); }</code></pre>
      <p>Change <code>--brand</code> once and every one of those follows. This exact
      technique is how Semicolon's dark mode works — the same variables, given
      different values.</p>
    `
  },
  {
    title: "Layout without the pain",
    minutes: 12,
    body: `
      <p>Layout used to be genuinely horrible. It is not any more, because of two tools:
      flexbox and grid. You can build almost anything with these.</p>

      <h3>Flexbox — things in a row or a column</h3>
      <pre><code>.nav {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}</code></pre>
      <ul>
        <li><code>display: flex</code> — children line up in a row</li>
        <li><code>gap</code> — space between them, without fiddly margins</li>
        <li><code>align-items: center</code> — line them up vertically</li>
        <li><code>justify-content: space-between</code> — push them to the ends</li>
      </ul>
      <p>That is a navigation bar. Four lines.</p>

      <h3>Grid — rows and columns together</h3>
      <pre><code>.cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}</code></pre>
      <p>Read that last line as: <em>fit as many columns as you can, each at least
      220px wide, sharing the leftover space equally.</em></p>
      <p>On a wide screen you get four columns. On a phone, one. <strong>You did not
      write a single media query.</strong> The layout responds by itself.</p>

      <h3>Rule of thumb</h3>
      <blockquote><p>One direction — a row or a column — use <strong>flex</strong>.
      Two directions at once — use <strong>grid</strong>.</p></blockquote>

      <h3>Your browser is the best CSS teacher you have</h3>
      <p>Press <strong>F12</strong> and click the arrow icon, then click anything on any
      website. You will see its exact CSS, and you can edit it live. Nothing you change
      is saved — refresh and it is back. Go and take a real site apart.</p>
    `
  }
];

/* ================================================================
   4 · MAKING PAGES INTERACTIVE
   ================================================================ */
LESSONS["interactive-pages"] = [
  {
    title: "Finding things on the page and changing them",
    minutes: 9,
    body: `
      <p>HTML builds the page. CSS styles it. Neither can <em>react</em> to anything.
      The moment you want a button to do something, that is JavaScript.</p>
      <pre><code>&lt;h1 id="greeting"&gt;Hello&lt;/h1&gt;
&lt;button id="btn"&gt;Change it&lt;/button&gt;

&lt;script src="app.js"&gt;&lt;/script&gt;</code></pre>
      <p>And in <code>app.js</code>:</p>
      <pre><code>const heading = document.getElementById("greeting");
const button  = document.getElementById("btn");

button.addEventListener("click", function () {
  heading.textContent = "You clicked it!";
});</code></pre>

      <h3>Three ideas, and they carry you a long way</h3>
      <ul>
        <li><strong>Find it</strong> — <code>document.getElementById</code> hands you an
        element you can work with</li>
        <li><strong>Listen</strong> — <code>addEventListener</code> says "when this
        happens, run that"</li>
        <li><strong>Change it</strong> — <code>textContent</code> swaps the text inside</li>
      </ul>

      <h3>Put the script at the bottom</h3>
      <p>The browser reads your page top to bottom. If your script runs before the
      <code>&lt;h1&gt;</code> exists, <code>getElementById</code> returns
      <code>null</code> and you get <em>"Cannot read properties of null"</em> — one of
      the most common errors there is.</p>
      <p>Putting <code>&lt;script&gt;</code> just before <code>&lt;/body&gt;</code>
      fixes it, because by then everything above it exists.</p>

      <h3>textContent, not innerHTML</h3>
      <p>Both change what is inside an element. But <code>innerHTML</code> treats the
      text as HTML, so if it came from a visitor, they can inject tags — including
      <code>&lt;script&gt;</code>. That attack is called XSS, and it is one of the most
      common holes on the web.</p>
      <blockquote><p><strong>Use textContent unless you specifically need HTML.</strong>
      When you do need HTML from a person, you have to escape it first.</p></blockquote>
    `
  },
  {
    title: "Building the page from data",
    minutes: 11,
    body: `
      <p>Here is the shift that makes real sites possible. Instead of writing twenty
      near-identical blocks of HTML by hand, you keep a list of data and let JavaScript
      build the HTML for you.</p>
      <pre><code>const planets = [
  { name: "Mercury", moons: 0 },
  { name: "Earth",   moons: 1 },
  { name: "Mars",    moons: 2 }
];

const list = document.getElementById("planetList");

planets.forEach(function (p) {
  const li = document.createElement("li");
  li.textContent = p.name + " - " + p.moons + " moons";
  list.appendChild(li);
});</code></pre>

      <h3>Why this matters more than it looks</h3>
      <p>Adding a planet is now <strong>one line of data</strong>, not a new block of
      HTML. Changing how every planet is displayed is <strong>one change</strong>, not
      twenty.</p>
      <p>This is exactly how Semicolon works. Its nine tracks and seven blog posts all
      live in <code>js/data.js</code>, and every page is generated from them. Adding a
      track means adding one object — the HTML never gets touched.</p>

      <h3>The bug this design cannot save you from</h3>
      <p>When a ninth track was added to Semicolon, the cards appeared automatically —
      but five places in the site still said "eight tracks" in hand-written English.
      The data built the cards. It could not rewrite the sentences <em>about</em> the
      cards.</p>
      <p>Generating from data is powerful and it has an edge. Know where the edge is.</p>
    `
  },
  {
    title: "Remembering things with localStorage",
    minutes: 8,
    body: `
      <p>Refresh the page and everything resets. Sometimes that is fine. Often it is
      not — nobody wants to pick dark mode every single visit.</p>
      <pre><code>// save
localStorage.setItem("theme", "dark");

// read it back, even after a refresh
const theme = localStorage.getItem("theme");

// forget it
localStorage.removeItem("theme");</code></pre>

      <h3>It only stores text</h3>
      <p>Numbers and objects have to be converted:</p>
      <pre><code>const progress = { level: 3, score: 24 };
localStorage.setItem("progress", JSON.stringify(progress));

const saved = JSON.parse(localStorage.getItem("progress"));</code></pre>
      <p><code>JSON.stringify</code> turns an object into text.
      <code>JSON.parse</code> turns it back. Forget them and you get the useless string
      <code>"[object Object]"</code>.</p>

      <h3>Always wrap it in try/catch</h3>
      <pre><code>try {
  localStorage.setItem("theme", "dark");
} catch (e) {
  // private browsing can block this - carry on without saving
}</code></pre>
      <p>Some browsers block localStorage in private mode, and the failure throws. A
      site that crashes because someone opened an incognito window is a worse bug than
      a site that forgets their theme.</p>

      <h3>What it cannot do</h3>
      <p>localStorage lives in <strong>one browser on one device</strong>. Open your
      site on a phone and none of it is there. It is not a database and it is not an
      account — it is a small box of text your browser keeps for your site.</p>
      <p>Sharing data between people or devices needs a server. That is a genuinely
      different kind of project.</p>
    `
  }
];

/* ================================================================
   5 · FILES, FOLDERS AND DATA
   ================================================================ */
LESSONS["files-and-data"] = [
  {
    title: "Reading and writing files in Python",
    minutes: 9,
    body: `
      <p>This is where programming starts saving you real time. A computer can rename
      four hundred files while you make a sandwich.</p>
      <pre><code>with open("notes.txt", "r") as f:
    contents = f.read()
    print(contents)</code></pre>

      <h3>What "with" is doing</h3>
      <p>An open file is a resource your operating system is holding for you, and it has
      to be closed again. <code>with</code> closes it automatically — even if your code
      crashes halfway through.</p>
      <p>You can open files without it. Don't. Forgetting to close files is how you end
      up with half-written data and files the system says are locked.</p>

      <h3>The modes, and the dangerous one</h3>
      <pre><code>"r"   read   - fails if the file is missing
"w"   write  - CREATES the file, or WIPES IT COMPLETELY
"a"   append - adds to the end, keeps what is there
"x"   create - fails if the file already exists</code></pre>
      <blockquote><p><strong>"w" destroys the file instantly.</strong> Not when you
      write — the moment you open it. Open the wrong filename in "w" mode and it is
      gone, with no warning and no undo.</p></blockquote>

      <h3>Writing</h3>
      <pre><code>lines = ["first", "second", "third"]

with open("out.txt", "w") as f:
    for line in lines:
        f.write(line + "\\n")</code></pre>
      <p>That <code>\\n</code> is a newline. Leave it out and everything runs together
      on one line — a surprisingly confusing bug the first time you hit it.</p>
    `
  },
  {
    title: "Walking through folders",
    minutes: 10,
    body: `
      <p>Python's <code>pathlib</code> handles folders, and it works the same on
      Windows, Mac and Linux — which matters more than it sounds, because Windows uses
      backslashes in paths and everyone else uses forward slashes.</p>
      <pre><code>from pathlib import Path

folder = Path("C:/Users/Anshu/Downloads")

for item in folder.iterdir():
    if item.is_file():
        print(item.name, item.stat().st_size, "bytes")</code></pre>

      <h3>Finding only what you want</h3>
      <pre><code>for txt in folder.glob("*.txt"):     # this folder only
    print(txt.name)

for py in folder.rglob("*.py"):      # this folder AND everything inside
    print(py)</code></pre>
      <p><code>glob</code> looks in one folder. <code>rglob</code> is recursive — it
      goes all the way down. That one letter is the difference between checking a
      drawer and searching the whole house.</p>

      <h3>The rule that saves you</h3>
      <p>When you write a script that moves, renames or deletes files, <strong>make it
      print what it would do before it does anything</strong>:</p>
      <pre><code>DRY_RUN = True

for f in folder.glob("*.txt"):
    target = folder / "text-files" / f.name
    if DRY_RUN:
        print("would move", f.name, "->", target)
    else:
        f.rename(target)</code></pre>
      <p>Run it with <code>DRY_RUN = True</code>, read the output carefully, and only
      then flip it to False. Moving four hundred files correctly and moving four hundred
      files by accident look identical while the script is running.</p>
    `
  },
  {
    title: "CSV and JSON: the two formats you will actually meet",
    minutes: 10,
    body: `
      <p>Almost all the data you handle early on is one of these two.</p>

      <h3>CSV — a spreadsheet as plain text</h3>
      <pre><code>import csv

with open("scores.csv", newline="") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["name"], row["score"])</code></pre>
      <p><code>DictReader</code> uses the first line as column names, so you write
      <code>row["name"]</code> instead of <code>row[0]</code>. Far easier to read, and
      it does not break when someone adds a column.</p>
      <p>That <code>newline=""</code> looks like noise. Leave it out on Windows and you
      get a blank line between every row — a classic.</p>

      <h3>JSON — nested data</h3>
      <pre><code>import json

with open("config.json") as f:
    config = json.load(f)

print(config["site"]["name"])

with open("out.json", "w") as f:
    json.dump(config, f, indent=2)</code></pre>
      <p><code>indent=2</code> makes the saved file readable by a human instead of one
      enormous line. Always worth it.</p>

      <h3>Which to use</h3>
      <ul>
        <li><strong>CSV</strong> — flat rows and columns. Opens in Excel. No nesting.</li>
        <li><strong>JSON</strong> — nested structures, lists inside objects inside
        lists. What almost every web API speaks.</li>
      </ul>
      <p>If your data would fit in a spreadsheet, CSV. If it has shape, JSON.</p>
    `
  }
];

/* ================================================================
   6 · VERSION CONTROL WITH GIT
   ================================================================ */
LESSONS["git-basics"] = [
  {
    title: "Why Git, and the file you write first",
    minutes: 8,
    body: `
      <p>Without Git, your project exists in exactly one state: however you last left
      it. A bad edit at 11pm has no undo. Git remembers every version you ever saved,
      so you can experiment without fear.</p>

      <h3>Write .gitignore BEFORE anything else</h3>
      <p>This is not a detail. Make a file called <code>.gitignore</code> in your
      project:</p>
      <pre><code># Secrets - never commit these
.env

# Dependencies
node_modules/

# OS junk
.DS_Store
Thumbs.db</code></pre>
      <blockquote><p><strong>Once something is committed, it is in the history
      permanently.</strong> Deleting the file later does not remove it — it still sits
      in every past commit. If a password lands in Git, the only real fix is to change
      the password.</p></blockquote>
      <p>That is why this file comes first, not later.</p>

      <h3>Starting</h3>
      <pre><code>git init
git add .
git commit -m "Initial commit"</code></pre>
      <p>Three commands and your project has history.</p>

      <h3>Set your name once</h3>
      <pre><code>git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main</code></pre>
      <p>Every commit records who made it. That last line makes new repositories start
      on a branch called <code>main</code>, which is what almost everyone uses now.</p>
    `
  },
  {
    title: "The three places your work lives",
    minutes: 9,
    body: `
      <p>This is the idea that makes Git click. Your work sits in one of three places:</p>
      <pre><code>working directory  ->  staging area  ->  repository
   (your edits)         (git add)        (git commit)</code></pre>

      <h3>Why bother with the middle one?</h3>
      <p>Because you often change five things and only two of them belong together.
      Staging lets you commit those two, then commit the rest separately.</p>
      <pre><code>git status              # what has changed?
git add index.html      # stage just this one
git add .               # stage everything
git diff                # changed, not yet staged
git diff --staged       # staged, about to be committed
git commit -m "Fix nav"</code></pre>
      <p><code>git status</code> is the command you will run most. Run it constantly.
      It is never wrong and it usually tells you exactly what to do next.</p>

      <h3>Writing a message worth reading</h3>
      <p>You are writing to yourself in six months, when you have forgotten everything.</p>
      <pre><code>BAD:   "update"    "fixes"    "asdf"

GOOD:  "Fix nav overlapping the logo on phones"
       "Add moon phase API endpoint"</code></pre>
      <p>Say <strong>what changed and why</strong>. The code already shows how.</p>
    `
  },
  {
    title: "Undoing things — the actual point of Git",
    minutes: 9,
    body: `
      <p>Everything above is setup. This is the payoff.</p>

      <h3>Throw away changes to one file</h3>
      <pre><code>git restore js/config.js</code></pre>
      <p>Back to the last commit, instantly. This is the one you will use most.</p>

      <h3>See the history</h3>
      <pre><code>git log --oneline       # one line per commit
git show 2eba6dd        # everything a commit changed</code></pre>

      <h3>Try it right now</h3>
      <p>Do not just read this. Genuinely break something:</p>
      <ol>
        <li>Open any file in your project and delete half of it</li>
        <li>Save it. Panic slightly.</li>
        <li><code>git status</code> — Git already knows</li>
        <li><code>git diff</code> — see exactly what you destroyed</li>
        <li><code>git restore thatfile</code> — it is back</li>
      </ol>
      <p>You will not trust the safety net until you have fallen into it once. Do it
      today, on purpose, while nothing is at stake.</p>

      <h3>A true story from this project</h3>
      <p>Semicolon's files were once corrupted by a bad text-encoding conversion — every
      em-dash in four files turned into unreadable symbols. Recovery depended on a build
      folder happening to hold clean copies. Pure luck.</p>
      <p>With Git committed, that is <code>git restore</code>. One command instead of
      luck. That is the entire argument.</p>
    `
  }
];

/* ================================================================
   7 · DEBUGGING
   ================================================================ */
LESSONS["debugging"] = [
  {
    title: "Debugging is a method, not a talent",
    minutes: 8,
    body: `
      <p>Working programmers spend more time reading broken code than writing new code.
      Nobody tells beginners this, so when your program breaks it feels like evidence
      you are bad at this. It is not. It is the job.</p>

      <h3>The one rule</h3>
      <blockquote><p><strong>Change one thing at a time, and check after each change.</strong></p></blockquote>
      <p>When something breaks, the temptation is to change five things at once hoping
      one helps. If it then works, you do not know which change fixed it — or whether
      you introduced two new bugs that cancel out. You have traded one mystery for a
      worse one.</p>

      <h3>The method</h3>
      <ol>
        <li><strong>Reproduce it reliably.</strong> If it only breaks sometimes, find
        the exact steps first. A bug you cannot trigger is a bug you cannot fix.</li>
        <li><strong>Read the error properly.</strong> Bottom line first — it names the
        problem.</li>
        <li><strong>Find where it actually goes wrong.</strong> Not where it crashed —
        where the value first became wrong.</li>
        <li><strong>Form one guess.</strong> "I think x is empty here."</li>
        <li><strong>Test that one guess.</strong> Print it. Were you right?</li>
        <li><strong>Fix, then check the fix.</strong> Re-run the exact steps from step 1.</li>
      </ol>

      <h3>Say it out loud</h3>
      <p>Explain the broken code, line by line, to a person, a pet, or an object on your
      desk. This is genuinely called <strong>rubber duck debugging</strong> and it is a
      real technique used by professionals.</p>
      <p>It works because explaining forces you to say what each line <em>should</em> do.
      Somewhere in the middle you stop and go "…oh." That moment is the bug.</p>
    `
  },
  {
    title: "print() and console.log() are real tools",
    minutes: 9,
    body: `
      <p>Experienced developers use debuggers with breakpoints. They also use print
      statements constantly, because print is fast and always available.</p>

      <h3>Print the thing, not a message</h3>
      <pre><code>print("here")            # tells you almost nothing
print(f"{files=}")       # tells you what files IS</code></pre>
      <p>In Python, <code>f"{files=}"</code> prints both the name and the value:
      <code>files=['a.txt', 'b.txt']</code>. Enormously useful, barely known.</p>

      <h3>Narrow it down by halving</h3>
      <p>A 200-line script breaks somewhere. Do not read all 200 lines. Put a print
      halfway:</p>
      <ul>
        <li>Value still correct at line 100? The bug is in the second half.</li>
        <li>Already wrong? It is in the first half.</li>
      </ul>
      <p>Repeat. Seven or eight checks finds a bug in a thousand lines. This is called a
      <strong>binary search</strong>, and it is the single most efficient debugging
      technique there is.</p>

      <h3>In the browser</h3>
      <pre><code>console.log("value:", thing);
console.table(arrayOfObjects);   // a real table
console.error("this went wrong");</code></pre>
      <p>Press <strong>F12</strong> and open the Console tab. If a page "does nothing",
      the reason is almost always sitting there in red.</p>

      <h3>Check your assumptions, not your logic</h3>
      <p>Most bugs are not clever. They are:</p>
      <ul>
        <li>The variable is <code>None</code> and you assumed it had a value</li>
        <li>It is the text <code>"5"</code>, not the number <code>5</code></li>
        <li>The list is empty</li>
        <li>The file path is wrong</li>
        <li>You are editing a different file from the one running</li>
      </ul>
      <p>That last one has cost everyone an afternoon at some point.</p>
    `
  },
  {
    title: "Getting help without wasting anyone's time",
    minutes: 7,
    body: `
      <p>Sometimes you are genuinely stuck. Asking well is a skill, and it gets you
      answers in minutes instead of silence.</p>

      <h3>Search the error, not your code</h3>
      <pre><code>GOOD:  TypeError: cannot unpack non-iterable NoneType object
BAD:   my_script.py line 42 not working</code></pre>
      <p>Strip out your own filenames and variable names. What is left is what thousands
      of other people also hit — and already solved.</p>

      <h3>A good question has four parts</h3>
      <ol>
        <li><strong>What you are trying to do</strong> — one sentence</li>
        <li><strong>The smallest code that shows the problem</strong> — not your whole
        file</li>
        <li><strong>The full error message</strong> — pasted as text, not a screenshot</li>
        <li><strong>What you already tried</strong> — so nobody repeats it</li>
      </ol>

      <h3>The thing that happens surprisingly often</h3>
      <p>Cutting your code down to the smallest example that still breaks <em>solves the
      bug</em> before you ever send it. Each piece you remove is a piece you had to check
      — and one of those checks finds it.</p>
      <p>You will write out a question, delete it, and fix the problem yourself. That
      still counts as the technique working.</p>

      <h3>When an AI helps you</h3>
      <p>Give it the error and the actual code, not a description. And read the answer
      properly rather than pasting it in — an explanation you did not understand becomes
      a bug you cannot fix next week.</p>
    `
  }
];

/* ================================================================
   8 · SHIP A REAL PROJECT
   ================================================================ */
LESSONS["ship-a-project"] = [
  {
    title: "Scoping something you will actually finish",
    minutes: 9,
    body: `
      <p>Most beginner projects die at about 70%. Not from difficulty — from scope. The
      project quietly grew until finishing became impossible.</p>

      <h3>Write down what it does NOT do</h3>
      <p>Before writing code, list the features you are deliberately leaving out. It
      feels strange and it is the most useful thing on the page. When you think of
      something mid-build, it goes on <em>that</em> list, not into the code.</p>
      <pre><code>Quiz site v1

DOES:
  - four levels of questions
  - shows your score
  - remembers your rank

DOES NOT (v2 maybe):
  - user accounts
  - a leaderboard
  - a timer</code></pre>

      <h3>Build the skeleton first</h3>
      <p>Get the ugliest possible version working end to end before you make anything
      nice. One question, one button, one result — unstyled.</p>
      <p>Why: a rough version that <em>works</em> tells you what you actually got wrong.
      A beautiful version of half the app tells you nothing, and it is much harder to
      change.</p>

      <h3>The number that matters</h3>
      <blockquote><p>Weeks since you last had something you could show someone. If that
      hits three, stop adding features and ship <em>anything</em>.</p></blockquote>
      <p>Momentum is a resource. Spend it carefully.</p>
    `
  },
  {
    title: "Structure, and a README someone can follow",
    minutes: 9,
    body: `
      <p>Future you is a stranger. Write for them.</p>
      <pre><code>my-project/
  index.html
  css/style.css
  js/
    config.js     every setting, in one place
    data.js       the content
    main.js       the behaviour
  README.md
  .gitignore</code></pre>

      <h3>One place for settings</h3>
      <p>Site name, contact email, feature switches — all in one file. When something
      needs changing you edit one line, not fourteen scattered through the HTML.</p>
      <blockquote><p><strong>Nothing secret goes in a config file the browser
      downloads.</strong> Every visitor can read it. API keys belong in a
      <code>.env</code> on a server.</p></blockquote>

      <h3>The README</h3>
      <p>Answer four questions:</p>
      <ol>
        <li><strong>What is this?</strong> One paragraph.</li>
        <li><strong>How do I run it?</strong> Exact commands, copy-pasteable.</li>
        <li><strong>How is it laid out?</strong> The folder tree above.</li>
        <li><strong>What does not work yet?</strong> Be honest.</li>
      </ol>
      <p>That fourth one is what separates a real README from marketing. Saying "comments
      are stored in your browser only, they are not shared" tells a reader more than any
      feature list.</p>

      <h3>Comment the why</h3>
      <pre><code>// BAD - says what the code already says
// add 1 to count
count = count + 1

// GOOD - says why
// Start at 1, not 0: this number is shown to people,
// and "question 0 of 8" reads as a bug.
count = count + 1</code></pre>
    `
  },
  {
    title: "Getting it online",
    minutes: 10,
    body: `
      <p>A link you can send someone feels completely different from a file on your
      laptop. It is also the step most people never take.</p>

      <h3>Static hosting is free</h3>
      <p>Netlify, GitHub Pages, Vercel and Cloudflare Pages all host static sites for
      nothing. A static site is one made of files — HTML, CSS, JavaScript, images.</p>
      <pre><code>npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=. --site=your-site-name</code></pre>

      <h3>The line that decides where you can host</h3>
      <blockquote><p><strong>Static hosting serves files. It never runs a program.</strong></p></blockquote>
      <p>So a site made of HTML and JavaScript works anywhere, free, forever. But the
      moment you need a database, real user accounts, or comments that other people can
      see, you need a server that <em>runs</em> something — and that is a different kind
      of hosting.</p>
      <p>Knowing which side of that line your project sits on saves an enormous amount
      of confusion.</p>

      <h3>Before you deploy</h3>
      <ul>
        <li>Ship only what belongs public — not your planning notes or your
        <code>.env</code></li>
        <li>Check every URL in your config and sitemap points at the real domain</li>
        <li>Open it on a phone</li>
        <li>Click every link</li>
      </ul>

      <h3>Then check the live site, not the command</h3>
      <p>A deploy command can report success while nothing actually changed — a cached
      build, a wrong folder, a silent failure. <strong>"It ran" and "it worked" are
      different claims.</strong> Only opening the real URL proves the second one.</p>
    `
  }
];

/* ================================================================
   9 · CHOOSING YOUR FIRST LANGUAGE
   ================================================================ */
LESSONS["choosing-a-language"] = [
  {
    title: "Why the question matters less than you think",
    minutes: 8,
    body: `
      <p>Everyone asks this first, and gets loud contradictory answers. Here is the
      honest one:</p>
      <blockquote><p><strong>Languages are the easy part. Concepts are the hard
      part.</strong></p></blockquote>
      <p>The same program, four ways:</p>
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
      <p>Different punctuation. Identical idea. If you understand the first, you can
      read all four — and you just did.</p>

      <h3>What actually transfers</h3>
      <p>About 20% of learning your first language is that language's spelling. The
      other 80% is programming itself: variables, loops, conditions, functions, lists,
      debugging. You learn those <strong>once</strong>.</p>
      <p>That is why your second language takes a fraction of the time, and your fourth
      takes a weekend.</p>

      <h3>So ask a better question</h3>
      <p>Not "which language is best?" but <strong>"what do I want to make?"</strong>
      Then pick the language that makes that thing.</p>
    `
  },
  {
    title: "What each language is actually for",
    minutes: 10,
    body: `
      <ul>
        <li><strong>Python</strong> — automation, data, AI, science, backends. Reads
        almost like English. The best default.</li>
        <li><strong>JavaScript</strong> — anything inside a browser. Not a choice, the
        only option, if you want a page that reacts.</li>
        <li><strong>SQL</strong> — asking questions of a database. Small and strange;
        the useful 80% takes a weekend.</li>
        <li><strong>C</strong> — operating systems, anything that must be fast. Hides
        nothing, which is why it teaches you what a computer really does.</li>
        <li><strong>C++</strong> — big games and browsers. Hugely powerful, hugely
        complicated.</li>
        <li><strong>C#</strong> — Windows apps and Unity. The realistic route into games.</li>
        <li><strong>Java</strong> — large company systems, Android. Wordy, runs
        everywhere.</li>
        <li><strong>Go</strong> — servers. Deliberately small enough to hold in your head.</li>
        <li><strong>Rust</strong> — like C, but the compiler refuses to let you make the
        dangerous mistakes. Famously hard, famously loved.</li>
        <li><strong>Swift / Kotlin</strong> — iPhone and Android apps. Swift needs a
        Mac, and that is a wall you cannot code around.</li>
      </ul>

      <h3>HTML and CSS are not programming languages</h3>
      <p><strong>HTML describes structure.</strong> <strong>CSS describes
      appearance.</strong> Neither can make a decision, repeat something, or store a
      value. There is no <code>if</code> in CSS and no loop in HTML.</p>
      <p>That is not an insult — you cannot build for the web without both, and good CSS
      takes years. They are simply a different kind of thing: description, not
      instruction. The moment a page needs to <em>decide</em>, that is JavaScript.</p>

      <h3>Compiled and interpreted</h3>
      <pre><code>python hello.py        # interpreted - runs your file directly

gcc hello.c -o hello   # compiled - translate first...
./hello                # ...then run the result</code></pre>
      <p>Interpreted is faster to experiment with. Compiled runs faster and catches
      whole categories of mistake before the program ever starts. Neither is better —
      they are different trades.</p>
    `
  },
  {
    title: "What you need, and the trap to avoid",
    minutes: 8,
    body: `
      <h3>The requirements are almost nothing</h3>
      <p>Any laptop from the last ten years runs every language on this page. Programming
      is one of very few serious hobbies where the equipment you already own is genuinely
      enough. You do not need a gaming PC, and anyone saying otherwise is selling
      something.</p>

      <h3>Five tools, and you have most already</h3>
      <ol>
        <li><strong>An editor</strong> — VS Code, free</li>
        <li><strong>A terminal</strong> — already installed</li>
        <li><strong>A runtime</strong> — Python from python.org; JavaScript is already
        in your browser</li>
        <li><strong>A browser</strong> — press F12 for a free JavaScript console</li>
        <li><strong>Git</strong> — so you never lose work</li>
      </ol>
      <p>Cheapest possible start: press <strong>F12</strong> right now, click Console,
      type <code>2 + 2</code>, press Enter. You just programmed. Nothing installed.</p>

      <h3>Verify before you write</h3>
      <pre><code>python --version</code></pre>
      <p>A version number means ready. "Not recognised" means the install failed, and no
      amount of clever code fixes that.</p>

      <h3>The real trap: language tourism</h3>
      <p>The danger is not picking the "wrong" language. It is installing a new one every
      week, writing hello-world, feeling productive, and learning almost nothing.</p>
      <p>Ten hello-worlds in ten languages teaches you ten ways to print a word. One
      finished project in one language teaches you how software actually gets built —
      including the unglamorous parts no tutorial covers, like what to do when it breaks
      at 11pm.</p>
      <blockquote><p>Choose the language your <strong>project</strong> needs. If no
      project needs a language yet, the problem is not which language to pick — it is
      that you need a project.</p></blockquote>
    `
  }
];

/* Publish to the page, the same way data.js does, so every script
   reaches it the same way rather than relying on a top-level var. */
window.LESSONS = LESSONS;
