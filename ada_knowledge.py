"""Ada's written notes — scored keyword lookup, same idea as js/helper.js.

Plain text (no HTML). Used when a question matches well, and as backup
when Ollama is unreachable.
"""

VISITOR = None  # set by ada_server after env is loaded


def _v():
    return VISITOR or "AnshX"


# (keywords, answer). Longer / more specific phrases score higher.
TOPICS = [
    (
        ["variable", "variables", "labelled box", "assign a value"],
        "A variable is a labelled box you put a value in. "
        "name = \"AnshX\" means put that text in the box called name. "
        "In maths, x = 5 states a fact. In code it is an instruction — the next line "
        "can put something different in the same box. That is why score = score + 10 "
        "makes sense in code. Try Your First Program on Semicolon.",
    ),
    (
        ["infinite loop", "never stops", "ctrl+c", "ctrl c", "frozen loop"],
        "An infinite loop means the thing you are testing never changes, so the "
        "condition stays true. Press Ctrl+C to stop it. Before a while loop, ask: "
        "what inside this loop will eventually make the test false? If you cannot "
        "answer, you have an infinite loop. Lesson: while loops in Thinking in Loops.",
    ),
    (
        ["loop", "loops", "for loop", "while loop", "iterate", "repeat work"],
        "A loop makes the computer repeat work. for — when you know how many times: "
        "for i in range(5). while — until something stops being true. "
        "range(1, 11) never includes the end number, so you get 1 to 10. "
        "Open Thinking in Loops on Semicolon.",
    ),
    (
        ["nameerror", "not defined", "is not defined"],
        "NameError: name 'x' is not defined means Python has never heard of that name. "
        "Almost always a typo (prnt instead of print), you used it before creating it, "
        "or it was created inside a function and you used it outside.",
    ),
    (
        ["typeerror", "type error", "nonetype", "cannot concatenate"],
        "A TypeError means you did something a type does not allow — like adding text "
        "to a number. \"5\" + 2 fails in Python. input() always gives text, even when "
        "they typed digits, so wrap it: int(input(...)). If you see NoneType, something "
        "returned nothing when you expected a value.",
    ),
    (
        ["indentationerror", "indentation", "indent", "tabs and spaces"],
        "In Python the spaces at the start of a line are part of the language. "
        "Indented lines are inside the loop, the if, or the function. Pick 4 spaces "
        "and never mix tabs and spaces in one file — they look the same and Python "
        "treats them differently.",
    ),
    (
        ["traceback", "stack trace", "error message", "read the error", "exception", "crashed", "error", "errors"],
        "Read an error from the bottom up. Last line: what kind of problem. Line above: "
        "the exact code. Above that: file and line. The line number is where it fell over, "
        "not always where the mistake is. If line 20 breaks because line 4 set a bad value, "
        "Python points at 20. See the Debugging track.",
    ),
    (
        ["which language", "first language", "python or javascript", "best language", "what language"],
        "It matters far less than you have been told. Languages are the easy part; concepts "
        "are the hard part. Python is the best default here — readable, useful the same day. "
        "JavaScript is the only option for things in a browser. Better question: what do you "
        "want to make? Then pick the one that makes that. Track: Choosing a Language.",
    ),
    (
        ["install python", "download python", "add python to path", "python.org"],
        "Download from python.org and run the installer. On Windows, tick Add Python to PATH "
        "on the first screen. Miss it and Python installs, then the computer claims it cannot "
        "find it. Verify with: python --version. Then Your First Program, lesson 1.",
    ),
    (
        ["not recognized", "command not found", "python is not", "not recognised"],
        "That means the program is not on your PATH. On Windows this is nearly always the "
        "missed Add Python to PATH checkbox. Reinstall and tick it. Do not start writing "
        "code until python --version prints a version number.",
    ),
    (
        ["function", "functions", "def ", "return", "parameter", "argument"],
        "A function is a named chunk of work you can reuse. def greet(name): return \"Hello \" + name. "
        "print shows something to a human. return hands a value back to your code. A function "
        "that prints but does not return gives you None.",
    ),
    (
        ["html", "markup", "tags", "element"],
        "HTML describes structure — this is a heading, this is a list. Choose tags for meaning, "
        "not looks. <h1> means main heading, not big text. HTML cannot decide or repeat; that "
        "is fine. First Web Page on Semicolon walks through a real file.",
    ),
    (
        ["css", "stylesheet", "flexbox", "grid", "styling"],
        "CSS describes appearance. One direction (row or column) → flexbox. Two directions → grid. "
        "Put colours in variables at the top, then change the whole site from one line. That is "
        "how dark mode works here. Lesson: CSS in First Web Page.",
    ),
    (
        ["python", "py "],
        "Python is the default first language on Semicolon: readable, useful the same day. "
        "Install from python.org, tick Add Python to PATH on Windows, then python --version. "
        "Start with print, variables, input/int, then loops. Your First Program is the first track.",
    ),
    (
        ["javascript", "js ", "addEventListener", "getElementById", "dom"],
        "JavaScript makes a page react. Three ideas: find it (document.getElementById), listen "
        "(addEventListener), change it (textContent). Put <script> just before </body> or it "
        "runs before the page exists. Interactive Pages track.",
    ),
    (
        ["gitignore", "git init", "git add", "git commit", "version control", "github", "repository", "git"],
        "Git remembers every version you save. git init, git add ., git commit -m \"why\". "
        "Write .gitignore before your first commit. Once something is committed it is in "
        "history — deleting the file later does not remove it. Git Basics on Semicolon.",
    ),
    (
        ["git restore", "undo", "revert", "lost work"],
        "If the project is in Git: git restore thefile.py takes you back to the last commit. "
        "Try it on purpose while nothing is at stake — break a file, then restore it. "
        "Lesson: Undoing things in Git Basics.",
    ),
    (
        ["debug", "debugging", "not working", "rubber duck"],
        "Change one thing at a time and check after each change. Then halve: print halfway. "
        "Still correct? The bug is later. Already wrong? It is earlier. Say the code out loud "
        "line by line — rubber-duck debugging. Debugging track on Semicolon.",
    ),
    (
        ["console.log", "print(", "f-string"],
        "Print the value, not a vague message. print(\"here\") tells you almost nothing. "
        "print(f\"{files=}\") prints the name and the value. In a browser use console.log "
        "and press F12 → Console. If a page seems to do nothing, the reason is often in red there.",
    ),
    (
        ["deploy", "publish", "hosting", "netlify", "github pages", "vercel", "punah.pro"],
        "Static sites host free on Netlify, GitHub Pages, Vercel, or Cloudflare Pages. "
        "Static hosting serves files — it never runs a program. HTML/CSS/JS works anywhere free. "
        "A database or real accounts needs a server that runs something. Semicolon itself is live "
        "at https://semicolon.punah.pro. Track: Ship a Real Project.",
    ),
    (
        ["array", "list", "append", "index 0", "off-by-one"],
        "A list holds many things in order. Python: planets = [\"Mercury\", \"Venus\"]. "
        "JavaScript uses the same square brackets. Counting starts at 0. The first item is "
        "planets[0]. A 4-item list's last index is 3 — asking for 4 is the classic off-by-one.",
    ),
    (
        ["elif", "else if", "condition", "if statement", "==", "equals equals"],
        "if chooses between paths. = stores: score = 10. == asks: if score == 10. "
        "One equals sign puts a value in a box. Two asks whether they match.",
    ),
    (
        ["int(input", "user input", "input()"],
        "input() stops and waits for someone to type. It always gives you text, even if they "
        "typed digits. To do maths: age = int(input(\"Age? \")). Forgetting int() is why "
        "comparisons mysteriously never match. Your First Program has a temperature converter.",
    ),
    (
        ["open(", "read file", "write file", "with open"],
        "with open(\"notes.txt\") as f: — with closes the file even if your code crashes. "
        "Mode \"w\" wipes the file the instant you open it. No warning. Use \"a\" to add to "
        "the end. Always dry-run scripts that move or delete things. Files and Data track.",
    ),
    (
        ["localstorage", "json.stringify", "json.parse", "persist"],
        "localStorage keeps small bits of text in the visitor's browser across a refresh. "
        "It only stores text, so objects need JSON.stringify going in and JSON.parse coming out. "
        "It lives in one browser on one device — not a database, not an account. "
        "Interactive Pages, lesson 3.",
    ),
    (
        ["playground", "practice", "fizzbuzz", "challenge"],
        "The Practice area has challenges you can run in the browser — from printing your name "
        "up to FizzBuzz and a Caesar cipher. Each has a hint and a worked solution. "
        "https://semicolon.punah.pro/pages/playground.html",
    ),
    (
        ["stuck", "too hard", "confused", "give up"],
        "Being stuck is the normal state of programming. Three things that help: "
        "1) read the error's last line properly, 2) explain the code out loud line by line, "
        "3) walk away for ten minutes. Then cut the problem to the smallest example that still "
        "breaks. That often solves it before you ask anyone.",
    ),
    (
        ["caesar", "cipher", "secret message", "khoor", "shift letter"],
        "A Caesar cipher slides every letter along the alphabet. HELLO shifted by 3 becomes KHOOR. "
        "Decode by sliding the same amount backwards. It is a toy — only 26 shifts — but it shows "
        "that computers treat letters as numbers. Track 10: Secret Messages.",
    ),
    (
        ["semicolon", "this site", "who made", "anshuman"],
        "Semicolon is a free learn-to-code site built by Anshuman Srivastava — 10 tracks, "
        "31 lessons, a practice area, and me (Ada). Plain HTML, CSS and JavaScript, no frameworks. "
        "Live at https://semicolon.punah.pro. You are talking as %(name)s.",
    ),
    (
        ["who am i", "my name", "who i am", "what's my name"],
        "You are %(name)s. I am Ada, your tutor on Semicolon.",
    ),
    (
        ["who are you", "what are you", "are you ai", "chatgpt"],
        "I am Ada, Semicolon's coding tutor. I use written notes for common beginner questions "
        "and a local model (llama3.2) when it is running. I explain the idea and point at the "
        "fix rather than dumping finished homework. Ask one stuck thing at a time.",
    ),
    (
        ["dict", "dictionary", "object {}", "key value"],
        "A dictionary (Python) or object (JavaScript) maps names to values. "
        "person = {\"name\": \"AnshX\", \"age\": 1} then person[\"name\"]. "
        "Lists are ordered by number. Dicts are looked up by a key.",
    ),
    (
        ["string", "concatenat", "f\"", "template literal"],
        "A string is text in quotes. Glue with + or, in Python, an f-string: f\"Hello {name}\". "
        "In JavaScript, backticks: `Hello ${name}`. Mixing a number and a string without converting "
        "is a common TypeError (Python) or silent concat (JavaScript).",
    ),
    (
        ["boolean", "true false", "truthy"],
        "Booleans are True/False (Python) or true/false (JavaScript). if uses them. "
        "Empty string, 0, None/null, and empty list are treated as false-ish. "
        "A non-empty string is true even if it says \"false\".",
    ),
    (
        ["comment", "comments", "# ", "// "],
        "Comments are notes for humans. Python: # this. JavaScript: // this or /* block */. "
        "The computer ignores them. Explain why, not what — the code already shows what.",
    ),
    (
        ["modulo", "remainder", "fizzbuzz", "% "],
        "n % 3 is the remainder after dividing by 3. If it is 0, n is a multiple of 3. "
        "That is the whole trick behind FizzBuzz. Try it in the Practice area.",
    ),
    (
        ["json", "parse json"],
        "JSON is text that looks like JavaScript objects. In Python: json.loads / json.dumps. "
        "In the browser: JSON.parse / JSON.stringify. Trailing commas are illegal in JSON. "
        "Files and Data covers saving structured data.",
    ),
    (
        ["fetch", "api request", "http get"],
        "fetch(url) asks another server for data, then you .then or await the response. "
        "It is asynchronous — the next line runs before the answer arrives unless you wait. "
        "Semicolon's Ada chat uses fetch to POST /api/ada.",
    ),
    (
        ["undefined", "null", "none"],
        "None (Python) / null (JS) means \"no value on purpose\". undefined (JS) means "
        "\"nobody set this\". Mixing them with numbers causes TypeError or NaN. Check with "
        "is None in Python, == null or === undefined in JavaScript.",
    ),
    (
        ["scope", "global", "local variable"],
        "A name created inside a function lives only there. Outside, Python has never heard of it "
        "(NameError). That is scope. Prefer passing values in and returning values out instead of "
        "reaching for globals.",
    ),
    (
        ["temperature", "celsius", "fahrenheit", "converter"],
        "Your First Program has a temperature converter: C = (F - 32) * 5 / 9. "
        "Remember int() or float() on input() or you are doing maths on text.",
    ),
    (
        ["web builder", "html editor", "preview"],
        "Web Builder on Semicolon lets you type HTML/CSS/JS and see it live. There is a "
        "Secret message template for the cipher project. Practice → Web Builder.",
    ),
    (
        ["what can you", "help me", "what do you know"],
        "Ask about variables, loops, errors, Python install, HTML/CSS/JS, Git, files, "
        "localStorage, functions, lists, if vs ==, input/int, indent, deploy, JSON, "
        "the Caesar cipher, or any Semicolon lesson. One stuck thing at a time.",
    ),
]


def _fill(text):
    return text.replace("%(name)s", _v())


def score_question(message):
    q = " " + "".join(ch.lower() if ch.isalnum() else " " for ch in message) + " "
    q = " ".join(q.split())
    q = " " + q + " "
    best = None
    best_score = 0
    for keys, answer in TOPICS:
        score = 0
        for word in keys:
            w = word.lower()
            padded = " " + w + " "
            if padded in q:
                score += 4 if " " in w.strip() else 3
            elif w in q:
                score += 1
        if score > best_score:
            best_score = score
            best = _fill(answer)
    return best, best_score


def lookup(message, min_score=2):
    answer, score = score_question(message)
    if answer and score >= min_score:
        return answer, score
    return None, score


def generic_fallback():
    return (
        "Hey %s. I heard you. From my Semicolon notes: pick one stuck thing — "
        "a variable, a loop, an error, Python, HTML, Git, files, or the Secret Messages cipher. "
        "Or open https://semicolon.punah.pro/pages/learn.html and paste the line that broke."
        % _v()
    )
