/* ===================================================================
   playground.js — a JavaScript editor that actually runs your code.

   HOW THE CODE IS RUN
   With `new Function(...)`, not with `eval`. The difference matters:
   eval runs code in the scope it was called from, so the visitor's
   code could reach in and change this file's variables. new Function
   builds a function whose scope is the global one, so it cannot see
   anything in here.

   Neither is a security boundary. It is fine here because the only
   person whose code runs is the person typing it — they could open
   the console and do the same thing anyway. It would NOT be fine for
   running code written by someone else.

   CAPTURING OUTPUT
   console.log normally writes to the browser's dev console, which
   most beginners never open. So while the code runs we temporarily
   replace console.log with our own function that collects the output,
   then put the real one back in a `finally` block — so it is restored
   even if the code throws.
   =================================================================== */

var CHALLENGES = [
  {
    id: "free",
    title: "Free play",
    task: "No goal here — type anything and press Run. Try 2 + 2, or console.log(\"hi\").",
    start: "console.log(\"Hello!\");\nconsole.log(2 + 2);\n",
    hint: "console.log() prints something to the Output panel.",
    solution: null,
    check: null
  },
  {
    id: "greet",
    title: "1 · Say hello",
    task: "Print exactly: Hello, world!",
    start: "// Use console.log to print the message\n\n",
    hint: "console.log(\"Hello, world!\") — the quote marks matter, and so does the capital H.",
    solution: 'console.log("Hello, world!");',
    check: function (out) { return out.trim() === "Hello, world!"; }
  },
  {
    id: "variable",
    title: "2 · Use a variable",
    task: "Store your name in a variable called name, then print: Hi, <your name>!",
    start: "const name = \"\";\n\n",
    hint: "Join text with + , like console.log(\"Hi, \" + name + \"!\")",
    solution: 'const name = "Anshuman";\nconsole.log("Hi, " + name + "!");',
    check: function (out) { return /^Hi, .+!$/.test(out.trim()) && out.trim() !== "Hi, !"; }
  },
  {
    id: "count",
    title: "3 · Count to five",
    task: "Print the numbers 1 to 5, each on its own line.",
    start: "for (let i = 1; i <= 5; i++) {\n  // print i here\n}\n",
    hint: "Inside the loop: console.log(i)",
    solution: "for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}",
    check: function (out) { return out.trim().split(/\s*\n\s*/).join(",") === "1,2,3,4,5"; }
  },
  {
    id: "times",
    title: "4 · Seven times table",
    task: "Print the 7 times table from 1 to 10, as lines like: 1 x 7 = 7",
    start: "for (let i = 1; i <= 10; i++) {\n  \n}\n",
    hint: "console.log(i + \" x 7 = \" + (i * 7)) — the brackets round i * 7 matter, or it joins as text.",
    solution: 'for (let i = 1; i <= 10; i++) {\n  console.log(i + " x 7 = " + (i * 7));\n}',
    check: function (out) {
      var lines = out.trim().split(/\n/);
      if (lines.length !== 10) return false;
      return lines[0].replace(/\s/g, "") === "1x7=7" &&
             lines[9].replace(/\s/g, "") === "10x7=70";
    }
  },
  {
    id: "evens",
    title: "5 · Odd or even",
    task: "For numbers 1 to 10, print lines like: 1 is odd  /  2 is even",
    start: "for (let i = 1; i <= 10; i++) {\n  // if (i % 2 === 0) ...\n}\n",
    hint: "i % 2 gives the remainder. If it is 0, the number is even.",
    solution: 'for (let i = 1; i <= 10; i++) {\n  if (i % 2 === 0) {\n    console.log(i + " is even");\n  } else {\n    console.log(i + " is odd");\n  }\n}',
    check: function (out) {
      var lines = out.trim().split(/\n/).map(function (l) { return l.trim(); });
      return lines.length === 10 && lines[0] === "1 is odd" && lines[1] === "2 is even" &&
             lines[9] === "10 is even";
    }
  },
  {
    id: "sum",
    title: "6 · Add them up",
    task: "Add every number from 1 to 100 and print just the total.",
    start: "let total = 0;\n\n\nconsole.log(total);\n",
    hint: "Loop from 1 to 100 and do total = total + i each time.",
    solution: "let total = 0;\nfor (let i = 1; i <= 100; i++) {\n  total = total + i;\n}\nconsole.log(total);",
    check: function (out) { return out.trim() === "5050"; }
  },
  {
    id: "list",
    title: "7 · Loop a list",
    task: "Print each planet from the list on its own line.",
    start: 'const planets = ["Mercury", "Venus", "Earth", "Mars"];\n\n',
    hint: "planets.forEach(function (p) { console.log(p); })  — or use a for loop.",
    solution: 'const planets = ["Mercury", "Venus", "Earth", "Mars"];\nplanets.forEach(function (p) {\n  console.log(p);\n});',
    check: function (out) {
      return out.trim().split(/\s*\n\s*/).join(",") === "Mercury,Venus,Earth,Mars";
    }
  },
  {
    id: "longest",
    title: "8 · Find the longest word",
    task: "Print the longest word in the list.",
    start: 'const words = ["cat", "elephant", "dog", "hippopotamus", "ant"];\n\n',
    hint: "Keep a variable holding the best so far, and replace it whenever you find something longer.",
    solution: 'const words = ["cat", "elephant", "dog", "hippopotamus", "ant"];\nlet longest = "";\nwords.forEach(function (w) {\n  if (w.length > longest.length) {\n    longest = w;\n  }\n});\nconsole.log(longest);',
    check: function (out) { return out.trim() === "hippopotamus"; }
  },
  {
    id: "reverse",
    title: "9 · Backwards",
    task: 'Print the word "Semicolon" reversed.',
    start: 'const word = "Semicolon";\n\n',
    hint: "One way: split it into letters, reverse the array, join it back up.",
    solution: 'const word = "Semicolon";\nconsole.log(word.split("").reverse().join(""));',
    check: function (out) { return out.trim() === "nolocimeS"; }
  },
  {
    id: "fizz",
    title: "10 · FizzBuzz",
    task: "1 to 15. Multiples of 3 print Fizz, of 5 print Buzz, of both print FizzBuzz, otherwise the number.",
    start: "for (let i = 1; i <= 15; i++) {\n  \n}\n",
    hint: "Check the both case FIRST. If you check 3 before 15, then 15 prints Fizz and never reaches FizzBuzz.",
    solution: 'for (let i = 1; i <= 15; i++) {\n  if (i % 15 === 0) {\n    console.log("FizzBuzz");\n  } else if (i % 3 === 0) {\n    console.log("Fizz");\n  } else if (i % 5 === 0) {\n    console.log("Buzz");\n  } else {\n    console.log(i);\n  }\n}',
    check: function (out) {
      var want = ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"];
      return out.trim().split(/\s*\n\s*/).join(",") === want.join(",");
    }
  },
  {
    id: "cipher",
    title: "11 · Shift a word",
    task: "Print HELLO shifted forward by 1 letter: IFMMP",
    start: 'const word = "HELLO";\nlet out = "";\n\n',
    hint: "Loop each letter, add 1 to its char code with String.fromCharCode(ch.charCodeAt(0) + 1), and join them.",
    solution: 'const word = "HELLO";\nlet out = "";\nfor (const ch of word) {\n  out += String.fromCharCode(ch.charCodeAt(0) + 1);\n}\nconsole.log(out);',
    check: function (out) { return out.trim() === "IFMMP"; }
  }
];

(function () {
  "use strict";

  var editor = document.getElementById("codeInput");
  if (!editor) return;                  // not the playground page

  var outputEl  = document.getElementById("output");
  var titleEl   = document.getElementById("challengeTitle");
  var taskEl    = document.getElementById("challengeTask");
  var hintBox   = document.getElementById("hintBox");
  var checkEl   = document.getElementById("checkResult");
  var barEl     = document.getElementById("challengeBar");

  var currentIndex = 0;

  /* ---- challenge buttons ---- */
  CHALLENGES.forEach(function (c, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = c.title;
    b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
    b.addEventListener("click", function () { load(i); });
    barEl.appendChild(b);
  });

  function load(i) {
    currentIndex = i;
    var c = CHALLENGES[i];

    titleEl.textContent = c.title;
    taskEl.textContent = c.task;
    editor.value = c.start;
    hintBox.classList.remove("show");
    hintBox.textContent = "";
    checkEl.className = "check-result";
    checkEl.textContent = "";
    outputEl.textContent = "Press Run and your output appears here.";

    var chips = barEl.querySelectorAll(".chip");
    for (var k = 0; k < chips.length; k++) {
      chips[k].setAttribute("aria-pressed", k === i ? "true" : "false");
    }
    editor.focus();
  }

  /* ---- running the code ---- */
  function run() {
    var lines = [];
    var realLog = console.log;
    var realErr = console.error;

    function capture() {
      var parts = [];
      for (var i = 0; i < arguments.length; i++) {
        var a = arguments[i];
        if (typeof a === "object" && a !== null) {
          try { parts.push(JSON.stringify(a)); } catch (e) { parts.push(String(a)); }
        } else {
          parts.push(String(a));
        }
      }
      lines.push(parts.join(" "));
    }

    console.log = capture;
    console.error = capture;

    var failed = false;
    try {
      /* new Function, not eval — the code cannot see this scope. */
      new Function(editor.value)();
    } catch (err) {
      failed = true;
      lines.push("");
      lines.push("⚠ " + err.name + ": " + err.message);
      lines.push("");
      lines.push("Read that from the bottom up. The name says what kind of");
      lines.push("problem it is; the message says which bit went wrong.");
    } finally {
      /* Always restore, even if the code threw. Without this, a single
         crash would leave console.log broken for the rest of the page. */
      console.log = realLog;
      console.error = realErr;
    }

    var out = lines.join("\n");
    outputEl.textContent = out.length ? out :
      "(the code ran, but printed nothing — did you forget console.log?)";

    grade(out, failed);
  }

  /* ---- checking the answer ---- */
  function grade(out, failed) {
    var c = CHALLENGES[currentIndex];
    if (!c.check) { checkEl.className = "check-result"; checkEl.textContent = ""; return; }

    if (failed) {
      checkEl.className = "check-result is-fail";
      checkEl.textContent = "Your code stopped with an error before it finished. Fix that first.";
      return;
    }

    if (c.check(out)) {
      checkEl.className = "check-result is-pass";
      checkEl.textContent = "✓ Correct. That is exactly right.";
    } else {
      checkEl.className = "check-result is-fail";
      checkEl.textContent = "Not quite — compare your output with what the task asks for, " +
                            "character by character. Capitals and spaces count.";
    }
  }

  document.getElementById("runBtn").addEventListener("click", run);

  /* Ctrl+Enter runs, the way most real editors do. */
  editor.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); }

    /* Tab should indent, not jump to the next control. Escape first so
       keyboard users are never trapped in the box. */
    if (e.key === "Tab") {
      e.preventDefault();
      var s = editor.selectionStart, en = editor.selectionEnd;
      editor.value = editor.value.slice(0, s) + "  " + editor.value.slice(en);
      editor.selectionStart = editor.selectionEnd = s + 2;
    }
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    load(currentIndex);
  });

  document.getElementById("clearBtn").addEventListener("click", function () {
    outputEl.textContent = "Press Run and your output appears here.";
    checkEl.className = "check-result";
    checkEl.textContent = "";
  });

  document.getElementById("hintBtn").addEventListener("click", function () {
    hintBox.textContent = "💡 " + CHALLENGES[currentIndex].hint;
    hintBox.classList.add("show");
  });

  document.getElementById("solveBtn").addEventListener("click", function () {
    var c = CHALLENGES[currentIndex];
    if (!c.solution) {
      hintBox.textContent = "Free play has no solution — it's yours to mess about in.";
      hintBox.classList.add("show");
      return;
    }
    if (!window.confirm("Show the answer? Try the hint first — you learn far more from " +
                        "an answer you nearly reached.")) return;
    editor.value = c.solution;
    hintBox.textContent = "Solution loaded. Now read it line by line and make sure you " +
                          "understand WHY it works, then press Run.";
    hintBox.classList.add("show");
  });

  load(0);
})();
