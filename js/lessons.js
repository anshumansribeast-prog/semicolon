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

      <h3>Example</h3>
      <p>A good install looks like this in the terminal:</p>
      <pre><code>python --version
Python 3.12.3

python -c "print(2 + 2)"
4</code></pre>
      <p>You asked two questions: is Python there, and can it run a line of code. Both
      answers came back. If either command fails, stop and fix the install before you
      write a file.</p>
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
      the reply. You already know everything you need. One finished example:</p>
      <pre><code>name = input("What's your name? ")
age = input("How old are you? ")
colour = input("What's your favourite colour? ")
print(f"Hello {name}, you are {age} years old and you like {colour}.")</code></pre>
      <p>If you type <code>Ada</code>, <code>13</code> and <code>blue</code>, it prints
      <code>Hello Ada, you are 13 years old and you like blue.</code> Same three ideas
      as before — ask, store, print — just one extra box.</p>
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

      <h3>Example</h3>
      <p>A different error, same method. This file:</p>
      <pre><code>age = input("How old are you? ")
print(age + 1)</code></pre>
      <p>prints:</p>
      <pre><code>TypeError: can only concatenate str (not "int") to str</code></pre>
      <p>Last line first: you tried to join text and a number. The fix is
      <code>print(int(age) + 1)</code> — turn the text into a number before adding.
      Same three questions: what, which line, why.</p>
    `
  },
  {
    title: "A tiny program that actually helps",
    minutes: 10,
    body: `
      <p>Hello-world is how you prove the machine listens. The next step is a program
      that does a job a person would otherwise do with a calculator.</p>
      <p>Here is a Celsius-to-Fahrenheit converter, complete:</p>
      <pre><code>celsius = float(input("Temperature in Celsius: "))
fahrenheit = celsius * 9 / 5 + 32
print(f"{celsius} C is {fahrenheit} F")</code></pre>
      <p>Type <code>0</code> and you should see <code>0.0 C is 32.0 F</code>. Type
      <code>100</code> and you should see <code>100.0 C is 212.0 F</code>. Those two
      checks prove the formula is the real one, not a guess.</p>

      <h3>What float() is for</h3>
      <p><code>input()</code> always gives you text. You cannot multiply the text
      <code>"21.5"</code> by 9. <code>float()</code> turns that text into a number that
      can have a decimal point. <code>int()</code> would work for whole numbers, and
      would crash on <code>21.5</code>.</p>

      <h3>The other direction</h3>
      <pre><code>fahrenheit = float(input("Temperature in Fahrenheit: "))
celsius = (fahrenheit - 32) * 5 / 9
print(f"{fahrenheit} F is {celsius} C")</code></pre>
      <p>32 F should come back as 0 C. If it does not, the brackets are in the wrong
      place — subtraction has to happen before multiplying.</p>

      <h3>Try this</h3>
      <p>Ask which way they want to convert, then pick the formula with
      <code>if</code>. A finished example:</p>
      <pre><code>direction = input("Type C to convert from Celsius, F from Fahrenheit: ")

if direction == "C":
    celsius = float(input("Temperature in Celsius: "))
    print(f"{celsius} C is {celsius * 9 / 5 + 32} F")
elif direction == "F":
    fahrenheit = float(input("Temperature in Fahrenheit: "))
    print(f"{fahrenheit} F is {(fahrenheit - 32) * 5 / 9} C")
else:
    print("Please type C or F.")</code></pre>
      <p>That is a real tool. Put it in a file called <code>convert.py</code> and you
      can run it whenever you need it — which is the point of writing programs.</p>
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

      <h3>Example</h3>
      <p>This prints the five times table from 1 to 5:</p>
      <pre><code>for i in range(1, 6):
    print(f"{i} x 5 = {i * 5}")</code></pre>
      <pre><code>1 x 5 = 5
2 x 5 = 10
3 x 5 = 15
4 x 5 = 20
5 x 5 = 25</code></pre>
      <p><code>range(1, 6)</code> is 1, 2, 3, 4, 5. Change <code>6</code> to
      <code>11</code> when you want 1 to 10.</p>
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

      <h3>Example</h3>
      <p>A countdown that actually stops — <code>count</code> gets smaller each time:</p>
      <pre><code>count = 3
while count &gt; 0:
    print(count)
    count = count - 1
print("Go!")</code></pre>
      <pre><code>3
2
1
Go!</code></pre>
      <p>If you delete <code>count = count - 1</code>, it prints 3 forever. That missing
      line is the thing that makes the test false.</p>
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
      <code>random.randint(1, 50)</code>, and tells you higher or lower each go. Here
      is a complete example you can type in and run:</p>
      <pre><code>import random

secret = random.randint(1, 50)
guess = 0

while guess != secret:
    guess = int(input("Guess a number from 1 to 50: "))
    if guess &lt; secret:
        print("Higher")
    elif guess &gt; secret:
        print("Lower")

print("Got it!")</code></pre>
      <p>The new piece is <code>import random</code> — that loads Python's random-number
      tools so <code>randint</code> exists. Everything else you have already used:
      a while loop, <code>int()</code>, and <code>if</code>.</p>
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

      <h3>Example</h3>
      <p>A tiny profile page — heading, paragraph, and a list. Meaning first, looks
      later:</p>
      <pre><code>&lt;h1&gt;Ada Lovelace&lt;/h1&gt;
&lt;p&gt;Wrote the first computer program, in 1843.&lt;/p&gt;
&lt;ul&gt;
  &lt;li&gt;Mathematician&lt;/li&gt;
  &lt;li&gt;Writer&lt;/li&gt;
&lt;/ul&gt;</code></pre>
      <p>The browser knows <code>Ada Lovelace</code> is the title of the page, not just
      big text. That is the whole point of picking <code>&lt;h1&gt;</code>.</p>
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

      <h3>Example</h3>
      <p>Give a warning paragraph a class, then style only that class:</p>
      <pre><code>&lt;p class="warning"&gt;Tick Add Python to PATH.&lt;/p&gt;</code></pre>
      <pre><code>.warning {
  color: #9f1239;
  background: #fff1f2;
  padding: 0.75rem 1rem;
  border-radius: 8px;
}</code></pre>
      <p>Other paragraphs stay normal. That is why classes exist — so you can dress one
      thing differently without changing the HTML of everything else.</p>
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

      <h3>Example</h3>
      <p>Three cards in a row on a laptop, stacked on a phone — one grid rule:</p>
      <pre><code>&lt;div class="cards"&gt;
  &lt;article&gt;Python&lt;/article&gt;
  &lt;article&gt;HTML&lt;/article&gt;
  &lt;article&gt;Git&lt;/article&gt;
&lt;/div&gt;</code></pre>
      <pre><code>.cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}
article {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}</code></pre>
      <p>Shrink the window. The third card drops down by itself. No extra CSS for
      phones.</p>
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

      <h3>Example</h3>
      <p>A click counter — each press adds one:</p>
      <pre><code>&lt;p&gt;Clicks: &lt;span id="n"&gt;0&lt;/span&gt;&lt;/p&gt;
&lt;button id="plus"&gt;+1&lt;/button&gt;</code></pre>
      <pre><code>let count = 0;
const n = document.getElementById("n");
document.getElementById("plus").addEventListener("click", function () {
  count = count + 1;
  n.textContent = count;
});</code></pre>
      <p>Find the button, listen for a click, change the number. Those three steps are
      most of the JavaScript you will write in a browser.</p>
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
      <p>This is exactly how Semicolon works. Its tracks and blog posts all
      live in <code>js/data.js</code>, and every page is generated from them. Adding a
      track means adding one object — the HTML never gets touched.</p>

      <h3>The bug this design cannot save you from</h3>
      <p>When a ninth track was added to Semicolon, the cards appeared automatically —
      but five places in the site still said "eight tracks" in hand-written English.
      The data built the cards. It could not rewrite the sentences <em>about</em> the
      cards.</p>
      <p>Generating from data is powerful and it has an edge. Know where the edge is.</p>

      <h3>Example</h3>
      <p>Start with this HTML, then run the planet script above:</p>
      <pre><code>&lt;ul id="planetList"&gt;&lt;/ul&gt;</code></pre>
      <p>The page shows:</p>
      <pre><code>Mercury - 0 moons
Earth - 1 moons
Mars - 2 moons</code></pre>
      <p>Add <code>{ name: "Jupiter", moons: 95 }</code> to the list and reload. A fourth
      line appears. You did not touch the HTML.</p>
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

      <h3>Example</h3>
      <p>Remember a name across refresh:</p>
      <pre><code>const box = document.getElementById("name");

box.value = localStorage.getItem("name") || "";

box.addEventListener("input", function () {
  try {
    localStorage.setItem("name", box.value);
  } catch (e) { /* private mode — skip saving */ }
});</code></pre>
      <p>Type a name, refresh the page, and it is still there. That is all dark mode
      on this site is doing, with the word <code>"dark"</code> instead of a name.</p>
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

      <h3>Example</h3>
      <p>Write a file, then read it back in the same program:</p>
      <pre><code>with open("hello.txt", "w") as f:
    f.write("Hello, Ada\\n")

with open("hello.txt", "r") as f:
    print(f.read())</code></pre>
      <pre><code>Hello, Ada
</code></pre>
      <p>If the second <code>open</code> used <code>"w"</code> instead of <code>"r"</code>,
      the file would be wiped before you could read it. Mode is not a detail.</p>
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

      <h3>Example</h3>
      <p>List every Python file in the current folder:</p>
      <pre><code>from pathlib import Path

for f in Path(".").glob("*.py"):
    print(f.name)</code></pre>
      <p>If you run it in Semicolon's folder you would see names like
      <code>ada_server.py</code>. Same loop, swap <code>*.py</code> for
      <code>*.txt</code> when you want notes instead of programs.</p>
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

      <h3>Example</h3>
      <p>A scores file called <code>scores.csv</code>:</p>
      <pre><code>name,score
Ada,12
Anshu,9</code></pre>
      <p>The DictReader loop prints:</p>
      <pre><code>Ada 12
Anshu 9</code></pre>
      <p>The same data as JSON would look like
      <code>[{"name": "Ada", "score": 12}, {"name": "Anshu", "score": 9}]</code> —
      nested, not flat. That is the shape difference in one glance.</p>
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

      <h3>Example</h3>
      <p>In an empty folder:</p>
      <pre><code>git init
git add .gitignore
git commit -m "Start with a gitignore, before any secrets exist"</code></pre>
      <p>Then <code>git log --oneline</code> shows one line — that commit. You now have
      undo. The next file you add is a choice, not a one-way door.</p>
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

      <h3>Example</h3>
      <p>You fixed the heading on the Ada page and nothing else. Stage just that file:</p>
      <pre><code>git status
git add pages/ada.html
git commit -m "Fix Ada page intro copy"</code></pre>
      <p>The CSS you were still fiddling with stays unstaged. Two jobs, two commits,
      and <code>git restore</code> can undo one without touching the other.</p>
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

      <h3>Example</h3>
      <p>Break a file on purpose, then put it back:</p>
      <pre><code>git status
git diff js/config.js
git restore js/config.js
git status</code></pre>
      <p>The last <code>status</code> should say there is nothing to commit. You deleted
      half a file and the project did not notice, because Git still had the last good
      copy.</p>
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

      <h3>Example</h3>
      <p>This program is supposed to add 1 to 5. It prints 10. One change at a time:</p>
      <pre><code>total = 0
for i in range(1, 6):
    total = i + i
print(total)</code></pre>
      <p>Guess: <code>total = i + i</code> is replacing the total instead of adding to
      it. Test by printing inside the loop:</p>
      <pre><code>total = 0
for i in range(1, 6):
    total = i + i
    print(f"i={i}, total={total}")
print(total)</code></pre>
      <pre><code>i=1, total=2
i=2, total=4
i=3, total=6
i=4, total=8
i=5, total=10
10</code></pre>
      <p>The print proves the guess. The fix is one line:
      <code>total = total + i</code>. Then it prints 15, which is 1+2+3+4+5.</p>
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

      <h3>Example</h3>
      <p>A function that should greet someone, but prints <code>Hello None</code>:</p>
      <pre><code>def greet(name):
    print("Hello", name)

result = greet("Ada")
print("returned:", result)</code></pre>
      <pre><code>Hello Ada
returned: None</code></pre>
      <p>The guess: <code>greet</code> prints but does not <code>return</code> anything.
      Python then stores <code>None</code> in <code>result</code>. Add
      <code>return f"Hello {name}"</code> and print that instead. One print found it.</p>
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

      <h3>Example</h3>
      <p>A question that actually gets answered:</p>
      <pre><code>Trying to add one to an age from input().

age = input("How old are you? ")
print(age + 1)

TypeError: can only concatenate str (not "int") to str

Already tried: print(age) — it prints 13, so the value is there.</code></pre>
      <p>What you wanted, the smallest code, the full error, what you already know.
      Someone (or you, five minutes later) can see the fix is <code>int(age)</code>.</p>
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

      <h3>Example</h3>
      <p>A first version of a cipher page — ugly, but it runs end to end:</p>
      <pre><code>&lt;input id="msg" value="HELLO"&gt;
&lt;button id="go"&gt;Encode&lt;/button&gt;
&lt;p id="out"&gt;&lt;/p&gt;
&lt;script&gt;
document.getElementById("go").addEventListener("click", function () {
  var t = document.getElementById("msg").value;
  document.getElementById("out").textContent = t + " -&gt; (encode next)";
});
&lt;/script&gt;</code></pre>
      <p>One box, one button, one result. Style it after that path works. That is the
      skeleton for the Secret Messages track.</p>
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

      <h3>Example</h3>
      <p>The start of a README for a cipher page:</p>
      <pre><code># Secret Messages

A Caesar cipher you can run in a browser. Type a sentence, pick a
shift, see the encoded text.

## Run it
Open index.html, or: python -m http.server 8000

## Layout
index.html   the page
js/cipher.js the encode/decode functions

## Not done yet
Spaces and punctuation stay as they are. This is a toy, not a lock.</code></pre>
      <p>A stranger can run it, see the folders, and know what is still fake. That is
      a finished README, even if the project is small.</p>
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

      <h3>Example</h3>
      <p>GitHub Pages, for a repo already on GitHub:</p>
      <pre><code># Settings → Pages → Deploy from branch: main
# Then wait a minute and open:
https://YOUR-USERNAME.github.io/YOUR-REPO/</code></pre>
      <p>If that URL 404s, the site is not live yet — even if the settings page said
      saved. Refresh until you see your heading. Then send that link, not the folder
      on your laptop.</p>
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

      <h3>Example</h3>
      <p>Add the numbers 1 to 3. Python:</p>
      <pre><code>total = 0
for i in range(1, 4):
    total = total + i
print(total)          # 6</code></pre>
      <p>JavaScript:</p>
      <pre><code>let total = 0;
for (let i = 1; i &lt; 4; i++) {
  total = total + i;
}
console.log(total);   // 6</code></pre>
      <p>Same boxes, same loop, same answer. The spelling changed. The idea did not.</p>
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

      <h3>Example</h3>
      <p>A page that says hello — HTML cannot decide; JavaScript can:</p>
      <pre><code>&lt;!-- HTML: this is a button. That is all it can say. --&gt;
&lt;button id="hi"&gt;Say hello&lt;/button&gt;

&lt;script&gt;
document.getElementById("hi").addEventListener("click", function () {
  alert("Hello");
});
&lt;/script&gt;</code></pre>
      <p>Without the script, the button is a labelled rectangle. With it, the page
      makes a decision when you click. That is the line between description and
      programming.</p>
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

      <h3>Example</h3>
      <p>Right now, with nothing installed:</p>
      <pre><code>Press F12 → Console → type:

2 + 2
"Ada".toUpperCase()
for (let i = 1; i &lt;= 3; i++) { console.log(i); }</code></pre>
      <pre><code>4
ADA
1
2
3</code></pre>
      <p>That is JavaScript, in the browser you already have. Pick one language, finish
      one small project in it — the converter in Your First Program, or Secret Messages
      — before you install a second one.</p>
    `
  }
];

/* ================================================================
   10 · SECRET MESSAGES
   ================================================================ */
LESSONS["secret-messages"] = [
  {
    title: "Sliding the alphabet",
    minutes: 9,
    body: `
      <p>A Caesar cipher hides a sentence by sliding every letter along the alphabet.
      Julius Caesar used a slide of 3. It is not a real lock — anyone who knows the
      trick can undo it — but it is the clearest way to see how a computer treats
      letters as numbers.</p>

      <h3>Example</h3>
      <p>Shift <code>HELLO</code> by 3. Each letter moves three places forward:</p>
      <pre><code>H -&gt; K
E -&gt; H
L -&gt; O
L -&gt; O
O -&gt; R

HELLO + 3 = KHOOR</code></pre>
      <p>To decode, slide the same amount backwards: <code>KHOOR - 3 = HELLO</code>.</p>

      <h3>Wrapping past Z</h3>
      <p>What about <code>Z</code> plus 1? It has to become <code>A</code>, not some
      symbol after Z. Think of the alphabet as a loop of 26 letters.</p>

      <h3>Example</h3>
      <p><code>XYZ</code> shifted by 2:</p>
      <pre><code>X -&gt; Z
Y -&gt; A
Z -&gt; B

XYZ + 2 = ZAB</code></pre>
      <p>If your program prints leftover symbols instead of <code>A</code>, you forgot
      to wrap. The remainder after dividing by 26 is how programs do that wrap — next
      lesson.</p>
    `
  },
  {
    title: "Encode and decode in Python",
    minutes: 12,
    body: `
      <p>Letters already have numbers inside the computer. Python will show you them:</p>
      <pre><code>print(ord("A"))   # 65
print(chr(65))    # A
print(ord("B"))   # 66</code></pre>
      <p><code>ord</code> turns a letter into its number. <code>chr</code> turns a
      number back into a letter. A shift is just adding, then wrapping.</p>

      <h3>Example</h3>
      <p>Shift one capital letter, wrapping with <code>%</code> (the remainder):</p>
      <pre><code>def shift_letter(letter, amount):
    if letter &lt; "A" or letter &gt; "Z":
        return letter
    number = ord(letter) - ord("A")
    number = (number + amount) % 26
    return chr(number + ord("A"))

print(shift_letter("H", 3))   # K
print(shift_letter("Z", 1))   # A
print(shift_letter(" ", 3))   # a space stays a space</code></pre>
      <p><code>(number + amount) % 26</code> is the wrap. 25 + 1 is 26, 26 remainder
      26 is 0, and 0 is A.</p>

      <h3>Example</h3>
      <p>A whole sentence:</p>
      <pre><code>def encode(text, amount):
    out = ""
    for letter in text.upper():
        out = out + shift_letter(letter, amount)
    return out

print(encode("HELLO ADA", 3))
print(encode("KHOOR DGD", -3))</code></pre>
      <pre><code>KHOOR DGD
HELLO ADA</code></pre>
      <p>Decode is the same function with a negative shift. One idea, two directions.</p>
    `
  },
  {
    title: "Put the cipher on a web page",
    minutes: 12,
    body: `
      <p>Same idea, in the browser, so you can show someone without asking them to
      install Python. Open the Practice area's Web Builder if you want to try it
      without making files.</p>

      <h3>Example</h3>
      <p>The whole page — HTML, then the script:</p>
      <pre><code>&lt;h1&gt;Secret Messages&lt;/h1&gt;
&lt;label&gt;Message &lt;input id="msg" value="HELLO ADA"&gt;&lt;/label&gt;
&lt;label&gt;Shift &lt;input id="shift" type="number" value="3"&gt;&lt;/label&gt;
&lt;button id="enc"&gt;Encode&lt;/button&gt;
&lt;button id="dec"&gt;Decode&lt;/button&gt;
&lt;p id="out"&gt;&lt;/p&gt;</code></pre>
      <pre><code>function shiftLetter(letter, amount) {
  if (letter &lt; "A" || letter &gt; "Z") return letter;
  var n = letter.charCodeAt(0) - 65;
  n = (n + amount % 26 + 26) % 26;
  return String.fromCharCode(n + 65);
}

function encode(text, amount) {
  var out = "";
  for (var i = 0; i &lt; text.length; i++) {
    out += shiftLetter(text[i].toUpperCase(), amount);
  }
  return out;
}

document.getElementById("enc").addEventListener("click", function () {
  var t = document.getElementById("msg").value;
  var s = Number(document.getElementById("shift").value);
  document.getElementById("out").textContent = encode(t, s);
});

document.getElementById("dec").addEventListener("click", function () {
  var t = document.getElementById("msg").value;
  var s = Number(document.getElementById("shift").value);
  document.getElementById("out").textContent = encode(t, -s);
});</code></pre>
      <p>Type <code>HELLO ADA</code>, shift 3, press Encode. You should see
      <code>KHOOR DGD</code>. Press Decode on that and you get the original back.</p>

      <h3>What this is not</h3>
      <p>There are only 26 possible shifts. A person (or a loop) can try all of them
      in a second. Real secrets need real cryptography, which you do not invent
      yourself. This project is for explaining the idea — and you can now explain it
      with a page that runs.</p>
    `
  }
];

/* Publish to the page, the same way data.js does, so every script
   reaches it the same way rather than relying on a top-level var. */
window.LESSONS = LESSONS;
