/* ===================================================================
   js/ada.js — Ada, Semicolon's AI Coding Tutor & Live Screen Studio.
   Powered by the custom `ada-tutor` model and AdaScreenStudio.
   =================================================================== */

(function () {
  "use strict";

  var ADA_URL = "http://localhost:8420/api/ada";
  var HISTORY_LIMIT = 6;

  var log = document.getElementById("adaLog");
  var form = document.getElementById("adaForm");
  var input = document.getElementById("adaInput");
  var sendBtn = document.getElementById("adaSend");
  var chipContainer = document.getElementById("adaPromptChips");
  if (!form || !log) return;

  var history = [];

  function addBubble(text, kind) {
    var bubble = document.createElement("div");
    bubble.className = "ada-bubble ada-bubble--" + kind;

    var textEl = document.createElement("div");
    textEl.className = "ada-bubble-text";
    textEl.textContent = text;
    bubble.appendChild(textEl);

    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
    return bubble;
  }

  function mountScreenDemoInBubble(bubble, demoData) {
    if (!demoData || typeof AdaScreenStudio === "undefined") return;

    var wrap = document.createElement("div");
    wrap.className = "ada-bubble-studio-wrap";
    bubble.appendChild(wrap);

    var studio = new AdaScreenStudio(wrap, { demo: demoData });
    // Autoplay the demonstration smoothly
    setTimeout(function () {
      studio.play();
    }, 400);
    log.scrollTop = log.scrollHeight;
  }

  // Built-in offline fallback with rich screen walkthroughs
  function getOfflineTutorResponse(query) {
    var lower = query.toLowerCase();

    // 1. Loops
    if (lower.includes("loop") || lower.includes("for") || lower.includes("while")) {
      return {
        reply: "Loops allow computers to automate repetitive tasks instantly. A 'for' loop runs a specific number of times, while a 'while' loop runs as long as a condition stays true. Watch how this loop runs line-by-line on my screen below:",
        demo: {
          title: "For Loops & Times Tables",
          filename: "loops.py",
          lang: "python",
          code: "table = 5\nfor i in range(1, 6):\n    result = i * table\n    print(f\"{i} x {table} = {result}\")\nprint(\"Done!\")",
          steps: [
            { line: 1, narration: "Line 1: We set table = 5.", output: "", vars: { table: "5" } },
            { line: 2, narration: "Line 2: The loop starts with i = 1.", output: "", vars: { i: "1", table: "5" } },
            { line: 3, narration: "Line 3: Calculate 1 x 5 = 5.", output: "", vars: { result: "5" } },
            { line: 4, narration: "Line 4: Print the first line.", output: "1 x 5 = 5", vars: {} },
            { line: 2, narration: "Iteration 2: i advances to 2.", output: "", vars: { i: "2" } },
            { line: 4, narration: "Output repeats automatically!", output: "2 x 5 = 10\n3 x 5 = 15\n4 x 5 = 20\n5 x 5 = 25", vars: { i: "5", result: "25" } },
            { line: 5, narration: "Line 5: Loop is complete!", output: "Done!", vars: { status: "'finished'" } }
          ]
        }
      };
    }

    // 2. Reverse a string or list
    if (lower.includes("reverse") || lower.includes("list") || lower.includes("slice")) {
      return {
        reply: "In Python, the most elegant way to reverse a sequence is using slice notation `[::-1]`. The three slice numbers are [start:stop:step]. A step of -1 steps backwards from end to start! Let me demonstrate on my screen:",
        demo: {
          title: "Reversing Sequences with Slicing",
          filename: "reverse.py",
          lang: "python",
          code: "languages = ['Python', 'JavaScript', 'HTML']\nreversed_list = languages[::-1]\nprint('Original:', languages)\nprint('Reversed:', reversed_list)\n\nword = 'Semicolon'\nprint('Reversed word:', word[::-1])",
          steps: [
            { line: 1, narration: "We start with a list of three coding languages.", output: "", vars: { count: "3" } },
            { line: 2, narration: "Using slicing [::-1] creates a backwards copy of the list.", output: "", vars: { reversed: "['HTML', 'JavaScript', 'Python']" } },
            { line: 3, narration: "Print the untouched original list.", output: "Original: ['Python', 'JavaScript', 'HTML']", vars: {} },
            { line: 4, narration: "Print the reversed copy.", output: "Reversed: ['HTML', 'JavaScript', 'Python']", vars: {} },
            { line: 6, narration: "Slicing works the exact same way on strings too!", output: "", vars: { word: "'Semicolon'" } },
            { line: 7, narration: "Reversing 'Semicolon' yields 'nolocimeS'. Try it yourself!", output: "Reversed word: nolocimeS", vars: { reversed_word: "'nolocimeS'" } }
          ]
        }
      };
    }

    // 3. Functions
    if (lower.includes("function") || lower.includes("def") || lower.includes("return")) {
      return {
        reply: "Functions are reusable blocks of code. You give them inputs (arguments), they do work, and they can send back a result using `return`. Watch how execution jumps into the function and back:",
        demo: {
          title: "Defining & Calling Functions",
          filename: "functions.py",
          lang: "python",
          code: "def greet_student(name, track):\n    return f\"Welcome {name} to the {track} track!\"\n\nmessage = greet_student('Anshuman', 'Python')\nprint(message)",
          steps: [
            { line: 1, narration: "We define our reusable function 'greet_student' with two parameters.", output: "", vars: {} },
            { line: 4, narration: "We call the function, passing 'Anshuman' and 'Python'.", output: "", vars: { arg1: "'Anshuman'", arg2: "'Python'" } },
            { line: 2, narration: "Execution jumps inside the function body and evaluates the f-string return value.", output: "", vars: { returned: "'Welcome Anshuman...'" } },
            { line: 4, narration: "The returned string is saved in the 'message' variable.", output: "", vars: { message: "'Welcome Anshuman to the Python track!'" } },
            { line: 5, narration: "Line 5 prints the greeting. Now this function can be reused 1,000 times!", output: "Welcome Anshuman to the Python track!", vars: {} }
          ]
        }
      };
    }

    // 4. Variables
    if (lower.includes("variable") || lower.includes("var") || lower.includes("store")) {
      return {
        reply: "Think of a variable as a labelled storage box. You give it a name, put a value inside with the `=` sign, and can look inside or replace the contents anytime:",
        demo: {
          title: "Variables and State Changes",
          filename: "variables.py",
          lang: "python",
          code: "score = 0\nprint('Initial score:', score)\nscore = score + 10\nprint('Level 1 completed! Score:', score)\nplayer_name = 'Alex'\nprint(f'{player_name} has {score} points.')",
          steps: [
            { line: 1, narration: "Create a box named 'score' holding 0.", output: "", vars: { score: "0" } },
            { line: 2, narration: "Print the starting score.", output: "Initial score: 0", vars: { score: "0" } },
            { line: 3, narration: "Add 10 to score. 0 + 10 becomes 10.", output: "", vars: { score: "10" } },
            { line: 4, narration: "Print the updated score.", output: "Level 1 completed! Score: 10", vars: { score: "10" } },
            { line: 5, narration: "Variables can hold text (strings) as well as numbers.", output: "", vars: { player: "'Alex'", score: "10" } },
            { line: 6, narration: "Combine both variables into an informative message.", output: "Alex has 10 points.", vars: {} }
          ]
        }
      };
    }

    // 5. HTML & Web
    if (lower.includes("html") || lower.includes("css") || lower.includes("web") || lower.includes("card")) {
      return {
        reply: "Websites are built from HTML (the structure) and CSS (the style). Watch how an HTML card component is structured and styled:",
        demo: {
          title: "Building an HTML & CSS Card",
          filename: "card.html",
          lang: "html",
          code: "<div class=\"lesson-card\">\n  <h2>Python Basics</h2>\n  <p>Learn to code from zero.</p>\n  <span class=\"badge\">Beginner</span>\n</div>",
          steps: [
            { line: 1, narration: "We open a <div> container with class 'lesson-card'.", output: "Rendered: Container <div>", vars: { class: "'lesson-card'" } },
            { line: 2, narration: "<h2> adds the card heading.", output: "Rendered: Python Basics (Heading)", vars: {} },
            { line: 3, narration: "<p> adds descriptive body text.", output: "Rendered: Learn to code from zero.", vars: {} },
            { line: 4, narration: "<span> tags are inline elements, perfect for category badges.", output: "Rendered: [Beginner] Badge", vars: { badge: "'Beginner'" } }
          ]
        }
      };
    }

    // Default friendly answer with generic demo
    return {
      reply: "I am ready to help you explore any concept! Here is a live demonstration showing how Semicolon executes code line-by-line:",
      demo: {
        title: "Code Execution Walkthrough",
        filename: "demo.py",
        lang: "python",
        code: "# Welcome to Ada's Screen Studio\nconcept = 'Learning to code'\nprint(f'Starting: {concept}')\nstatus = 'Verified'\nprint(f'Result: {status}!')",
        steps: [
          { line: 1, narration: "Ada is initializing the code walkthrough.", output: "", vars: {} },
          { line: 2, narration: "Storing the concept in memory.", output: "", vars: { concept: "'Learning to code'" } },
          { line: 3, narration: "Printing execution status.", output: "Starting: Learning to code", vars: {} },
          { line: 4, narration: "Setting status to 'Verified'. Verify first, always!", output: "", vars: { status: "'Verified'" } },
          { line: 5, narration: "All steps executed cleanly.", output: "Result: Verified!", vars: { verified: "True" } }
        ]
      }
    };
  }

  async function handleSendMessage(text) {
    if (!text) return;

    addBubble(text, "user");
    history.push({ role: "user", content: text });
    input.value = "";
    input.disabled = true;
    sendBtn.disabled = true;

    var thinkingBubble = addBubble("Thinking…", "bot");

    try {
      var controller = new AbortController();
      var timeout = setTimeout(function () { controller.abort(); }, 40000);

      var resp = await fetch(ADA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.slice(-HISTORY_LIMIT) }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!resp.ok) throw new Error("HTTP " + resp.status);
      var data = await resp.json();

      var replyText = data.reply || "Here's what I found:";
      thinkingBubble.querySelector(".ada-bubble-text").textContent = replyText;
      history.push({ role: "assistant", content: replyText });

      // If backend returned a structured screen demo, mount it!
      if (data.screen_demo) {
        mountScreenDemoInBubble(thinkingBubble, data.screen_demo);
      } else if (text.toLowerCase().includes("screen") || text.toLowerCase().includes("demo") || text.toLowerCase().includes("show")) {
        // Fallback demo for explicit demo requests
        var fallback = getOfflineTutorResponse(text);
        if (fallback.demo) mountScreenDemoInBubble(thinkingBubble, fallback.demo);
      }

    } catch (err) {
      // Offline fallback: Use the built-in intelligent tutor with full screen demos
      var offlineData = getOfflineTutorResponse(text);
      thinkingBubble.querySelector(".ada-bubble-text").textContent = offlineData.reply;
      history.push({ role: "assistant", content: offlineData.reply });

      if (offlineData.demo) {
        mountScreenDemoInBubble(thinkingBubble, offlineData.demo);
      }
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    handleSendMessage(text);
  });

  // Prompt chip click handlers
  if (chipContainer) {
    chipContainer.addEventListener("click", function (e) {
      var chip = e.target.closest(".ada-chip");
      if (!chip) return;
      var prompt = chip.getAttribute("data-prompt") || chip.textContent;
      handleSendMessage(prompt);
    });
  }

  // Support URL parameters (e.g. from lesson page: ada.html?topic=Loops)
  var urlParams = new URLSearchParams(window.location.search);
  var topicParam = urlParams.get("topic");
  if (topicParam) {
    input.value = "Can you explain " + topicParam + " and demonstrate it on your screen?";
    setTimeout(function () {
      form.requestSubmit();
    }, 500);
  }

  // Enter sends, Shift+Enter makes newline
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
})();
