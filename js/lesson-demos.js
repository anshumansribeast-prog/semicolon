/* ===================================================================
   js/lesson-demos.js — Pre-crafted Screen Demonstrations for Every Lesson
   Curated by Ada for Semicolon's curriculum tracks.
   =================================================================== */

var LESSON_DEMOS = {
  // 1 · YOUR FIRST PROGRAM
  "first-program": [
    {
      title: "Installing Python and Proving It Worked",
      filename: "terminal.sh",
      lang: "bash",
      code: "# Check if Python is installed and added to PATH\npython --version\n\n# Open the interactive Python shell\npython\n>>> print('Ready to code!')\nReady to code!",
      steps: [
        { line: 1, narration: "First, let's open the terminal to test if Python is on your system.", output: "$ terminal opened", vars: { status: "'checking'" } },
        { line: 2, narration: "We run 'python --version' to ask the computer which Python it sees.", output: "Python 3.12.2", vars: { python: "'3.12.2'" } },
        { line: 4, narration: "A version number appeared! That confirms Python is installed and on your PATH.", output: "", vars: { verified: "True" } },
        { line: 5, narration: "Now we test a one-line print statement directly in the interactive prompt.", output: ">>> print('Ready to code!')", vars: { mode: "'interactive'" } },
        { line: 6, narration: "The computer immediately obeyed and printed our text. Your environment is 100% ready!", output: "Ready to code!", vars: { ready: "True" } }
      ]
    },
    {
      title: "Your First Five Lines: Variables & Input",
      filename: "hello.py",
      lang: "python",
      code: "print('Welcome to Semicolon!')\nname = input(\"What's your name? \")\nprint(f\"Hello, {name}!\")\nage = 14\nprint(f\"Next year you will be {age + 1}.\")",
      steps: [
        { line: 1, narration: "Line 1: print() outputs text directly to your screen.", output: "Welcome to Semicolon!", vars: {} },
        { line: 2, narration: "Line 2: input() pauses and asks the user for text, then stores it in 'name'.", output: "What's your name? Anshuman", vars: { name: "'Anshuman'" } },
        { line: 3, narration: "Line 3: An f-string lets us inject the 'name' variable straight into the greeting.", output: "Hello, Anshuman!", vars: { name: "'Anshuman'" } },
        { line: 4, narration: "Line 4: We store a number 14 into a new variable called 'age'.", output: "", vars: { name: "'Anshuman'", age: "14" } },
        { line: 5, narration: "Line 5: Python computes {age + 1} live and prints the result. You just wrote your first program!", output: "Next year you will be 15.", vars: { next_age: "15" } }
      ]
    },
    {
      title: "Reading Your First Error Without Fear",
      filename: "fix_error.py",
      lang: "python",
      code: "# Common beginner bug: missing closing quotation mark\n# print(\"Hello world)\n\n# The fix:\nprint(\"Hello world!\")\nprint(\"SyntaxError solved!\")",
      steps: [
        { line: 1, narration: "Errors are just your computer being specific, not angry.", output: "$ python fix_error.py", vars: {} },
        { line: 2, narration: "Notice how an unclosed string causes: SyntaxError: unterminated string literal.", output: "SyntaxError: unterminated string literal (line 2)", vars: { error: "'SyntaxError'" } },
        { line: 5, narration: "Line 5: We add the closing double quote '\"' so Python knows where the text ends.", output: "Hello world!", vars: { fixed: "True" } },
        { line: 6, narration: "Line 6: Run again — error vanished and both lines execute cleanly! Verify first, always.", output: "SyntaxError solved!", vars: { status: "'clean'" } }
      ]
    }
  ],

  // 2 · THINKING IN LOOPS
  "thinking-in-loops": [
    {
      title: "For Loops & Times Tables",
      filename: "multiplication.py",
      lang: "python",
      code: "table = 7\nprint(f\"=== Times Table for {table} ===\")\nfor i in range(1, 6):\n    result = i * table\n    print(f\"{i} x {table} = {result}\")\nprint(\"Loop completed!\")",
      steps: [
        { line: 1, narration: "We choose 7 as our multiplier variable.", output: "", vars: { table: "7" } },
        { line: 2, narration: "Print the header for our table.", output: "=== Times Table for 7 ===", vars: { table: "7" } },
        { line: 3, narration: "The for-loop starts with i = 1, repeating for each number up to 5.", output: "", vars: { i: "1", table: "7" } },
        { line: 4, narration: "Calculate 1 * 7 = 7 and print the line.", output: "1 x 7 = 7", vars: { i: "1", result: "7" } },
        { line: 3, narration: "Iteration 2: i becomes 2.", output: "", vars: { i: "2", table: "7" } },
        { line: 5, narration: "Calculate 2 * 7 = 14.", output: "2 x 7 = 14", vars: { i: "2", result: "14" } },
        { line: 5, narration: "Python repeats this automatically until i reaches 5!", output: "3 x 7 = 21\n4 x 7 = 28\n5 x 7 = 35", vars: { i: "5", result: "35" } },
        { line: 6, narration: "Line 6 is unindented, so it runs only once the loop has finished.", output: "Loop completed!", vars: { status: "'done'" } }
      ]
    },
    {
      title: "While Loops & Condition Testing",
      filename: "guess_game.py",
      lang: "python",
      code: "secret_number = 42\nguess = 10\nattempts = 1\nwhile guess != secret_number:\n    print(f\"Attempt {attempts}: {guess} is too low!\")\n    guess = 42\n    attempts += 1\nprint(f\"Correct! You got it in {attempts} attempts!\")",
      steps: [
        { line: 1, narration: "The secret number is set to 42.", output: "", vars: { secret: "42" } },
        { line: 4, narration: "The while-loop checks: is 10 != 42? Yes, so it enters the loop body.", output: "", vars: { guess: "10" } },
        { line: 5, narration: "Tells the user that 10 is too low.", output: "Attempt 1: 10 is too low!", vars: { attempts: "1" } },
        { line: 6, narration: "Next guess updates to 42.", output: "", vars: { guess: "42" } },
        { line: 4, narration: "The while loop re-checks: 42 != 42 is False, so the loop exits immediately!", output: "", vars: { loop: "'exited'" } },
        { line: 8, narration: "Success message displays! You controlled the loop with a condition.", output: "Correct! You got it in 2 attempts!", vars: { won: "True" } }
      ]
    },
    {
      title: "Escaping an Infinite Loop with Break",
      filename: "safe_loop.py",
      lang: "python",
      code: "count = 0\nwhile True:\n    count += 1\n    print(f\"Processing item #{count}\")\n    if count >= 3:\n        print(\"Target reached! Breaking out.\")\n        break\nprint(\"Program finished safely.\")",
      steps: [
        { line: 1, narration: "We initialize count = 0.", output: "", vars: { count: "0" } },
        { line: 2, narration: "'while True' creates a loop that runs continuously until explicitly stopped.", output: "", vars: {} },
        { line: 3, narration: "Increment count to 1, 2, then 3.", output: "Processing item #1\nProcessing item #2\nProcessing item #3", vars: { count: "3" } },
        { line: 5, narration: "The if-statement detects count is 3 and triggers the exit condition.", output: "Target reached! Breaking out.", vars: { condition: "True" } },
        { line: 7, narration: "The 'break' keyword immediately stops the infinite loop.", output: "", vars: { loop: "'broken'" } },
        { line: 8, narration: "Control safely returns to the main script. No frozen computer!", output: "Program finished safely.", vars: { status: "'safe'" } }
      ]
    }
  ],

  // 3 · BUILD YOUR FIRST WEB PAGE
  "first-web-page": [
    {
      title: "Building Clean Semantic HTML",
      filename: "index.html",
      lang: "html",
      code: "<article class=\"profile-card\">\n  <header>\n    <h1>Ada Lovelace</h1>\n    <p class=\"tagline\">First Computer Programmer</p>\n  </header>\n  <main>\n    <p>Writing algorithms before computers were even built.</p>\n    <a href=\"#learn\" class=\"btn\">Explore her work</a>\n  </main>\n</article>",
      steps: [
        { line: 1, narration: "<article> groups self-contained information that makes sense on its own.", output: "DOM: <article.profile-card>", vars: { tag: "'article'" } },
        { line: 3, narration: "<h1> provides the main heading. Browsers and screen readers rely on this.", output: "Rendered: Ada Lovelace (H1)", vars: { heading: "'Ada Lovelace'" } },
        { line: 4, narration: "A descriptive subtitle inside a <p> tag with a semantic class.", output: "Rendered: First Computer Programmer", vars: {} },
        { line: 8, narration: "The <a> anchor tag provides an accessible clickable link to learn more.", output: "Rendered: [Explore her work] (Button Link)", vars: { interactive: "True" } }
      ]
    },
    {
      title: "Styling with the CSS Box Model",
      filename: "style.css",
      lang: "css",
      code: ".profile-card {\n  background: #1e293b;\n  color: #f8fafc;\n  padding: 1.5rem;\n  border-radius: 12px;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.3);\n  border: 1px solid rgba(255,255,255,0.1);\n}",
      steps: [
        { line: 1, narration: "Target our .profile-card class selector.", output: "Targeting .profile-card", vars: {} },
        { line: 2, narration: "Set a dark slate background color (#1e293b) and bright text.", output: "Background applied: #1e293b", vars: { theme: "'dark-slate'" } },
        { line: 4, narration: "Padding adds internal breathing room between the text and the card edge.", output: "Padding: 24px (1.5rem)", vars: { padding: "'1.5rem'" } },
        { line: 5, narration: "Border-radius rounds the sharp corners into modern smooth curves.", output: "Corners rounded: 12px", vars: { radius: "'12px'" } },
        { line: 6, narration: "Box-shadow elevates the card off the screen with depth.", output: "Drop shadow rendered!", vars: { elevation: "'high'" } }
      ]
    },
    {
      title: "Responsive Flexbox Layouts",
      filename: "navbar.css",
      lang: "css",
      code: ".site-nav {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1rem;\n}\n\n.nav-links {\n  display: flex;\n  gap: 1.5rem;\n}",
      steps: [
        { line: 2, narration: "'display: flex' turns the container into an automatic one-dimensional layout engine.", output: "Flex layout activated", vars: { display: "'flex'" } },
        { line: 3, narration: "'justify-content: space-between' pushes the logo to the left and links to the right.", output: "Logo ← [space] → Links", vars: { alignment: "'spaced'" } },
        { line: 4, narration: "'align-items: center' centers both items vertically on the same baseline.", output: "Vertically centered", vars: { baseline: "'centered'" } },
        { line: 9, narration: "'gap: 1.5rem' cleanly spaces navigation items without fragile margins.", output: "Equal 24px spacing applied between all nav links", vars: { gap: "'1.5rem'" } }
      ]
    }
  ],

  // 4 · MAKING PAGES INTERACTIVE (JAVASCRIPT)
  "interactive-pages": [
    {
      title: "Selecting Elements and Handling Clicks",
      filename: "counter.js",
      lang: "javascript",
      code: "let count = 0;\nconst countDisplay = document.querySelector('#counter');\nconst button = document.querySelector('#btnClick');\n\nbutton.addEventListener('click', () => {\n  count += 1;\n  countDisplay.textContent = `Clicks: ${count}`;\n});",
      steps: [
        { line: 1, narration: "We initialize our click counter state to 0.", output: "State: count = 0", vars: { count: "0" } },
        { line: 2, narration: "document.querySelector finds the exact HTML element on the page.", output: "Connected to DOM: #counter and #btnClick", vars: {} },
        { line: 5, narration: "addEventListener listens for user interaction without freezing the page.", output: "Listening for 'click' event...", vars: { listener: "'active'" } },
        { line: 6, narration: "[User clicks button] The callback runs and increments count to 1.", output: "User Clicked!", vars: { count: "1" } },
        { line: 7, narration: "The DOM updates dynamically on screen without reloading!", output: "Updated text: Clicks: 1", vars: { display: "'Clicks: 1'" } }
      ]
    },
    {
      title: "Dynamic Lists and DOM Creation",
      filename: "todo.js",
      lang: "javascript",
      code: "function addTask(text) {\n  const list = document.querySelector('#todoList');\n  const item = document.createElement('li');\n  item.className = 'todo-item';\n  item.textContent = text;\n  list.appendChild(item);\n}\naddTask('Finish Semicolon lesson');",
      steps: [
        { line: 1, narration: "Define a reusable function that creates a task item.", output: "", vars: {} },
        { line: 3, narration: "document.createElement('li') builds a new element entirely in memory.", output: "Created <li> element in memory", vars: { tag: "'li'" } },
        { line: 5, narration: "Fill the text content with our task string.", output: "Content set to 'Finish Semicolon lesson'", vars: { text: "'Finish Semicolon lesson'" } },
        { line: 6, narration: "list.appendChild(item) inserts the element directly into the live webpage!", output: "Rendered to page: • Finish Semicolon lesson", vars: { live: "True" } }
      ]
    },
    {
      title: "Saving Data in LocalStorage",
      filename: "storage.js",
      lang: "javascript",
      code: "const userSettings = { theme: 'dark', sound: false };\n\n// Save to browser memory\nlocalStorage.setItem('settings', JSON.stringify(userSettings));\n\n// Read it back even after tab closes\nconst saved = JSON.parse(localStorage.getItem('settings'));\nconsole.log('Restored theme:', saved.theme);",
      steps: [
        { line: 1, narration: "Create a settings object with the user's preferences.", output: "", vars: { theme: "'dark'" } },
        { line: 4, narration: "localStorage.setItem saves data into the visitor's browser permanently.", output: "Saved to browser storage: {\"theme\":\"dark\",\"sound\":false}", vars: { saved: "True" } },
        { line: 7, narration: "JSON.parse converts the stored string back into a usable JavaScript object.", output: "Parsed object successfully", vars: {} },
        { line: 8, narration: "Theme restored instantly! The user never loses their preferences.", output: "Restored theme: dark", vars: { restoredTheme: "'dark'" } }
      ]
    }
  ],

  // 6 · VERSION CONTROL WITH GIT
  "git-basics": [
    {
      title: "Your First Git Commit",
      filename: "git_workflow.sh",
      lang: "bash",
      code: "git init\necho \"print('v1')\" > main.py\ngit status\ngit add main.py\ngit commit -m \"Initial commit: added main.py\"\ngit log --oneline",
      steps: [
        { line: 1, narration: "'git init' creates a hidden .git folder that tracks your project history.", output: "Initialized empty Git repository in /project/.git/", vars: {} },
        { line: 3, narration: "'git status' shows untracked files in red.", output: "Untracked files: main.py", vars: { status: "'untracked'" } },
        { line: 4, narration: "'git add' stages the file, preparing it for the snapshot.", output: "Changes to be committed: main.py", vars: { staged: "'main.py'" } },
        { line: 5, narration: "'git commit' takes a permanent snapshot with an informative message.", output: "[main (root-commit) 7a4b2c1] Initial commit: added main.py", vars: { commit: "'7a4b2c1'" } },
        { line: 6, narration: "'git log' shows your saved timeline. You can now travel back anytime!", output: "7a4b2c1 (HEAD -> main) Initial commit: added main.py", vars: {} }
      ]
    },
    {
      title: "Branching Safely Without Fear",
      filename: "branching.sh",
      lang: "bash",
      code: "git checkout -b feature-darkmode\n# Edit styles safely...\necho \".dark { bg: #000; }\" >> style.css\ngit add style.css\ngit commit -m \"Add dark mode palette\"\ngit checkout main",
      steps: [
        { line: 1, narration: "Creates a parallel universe branch called 'feature-darkmode'.", output: "Switched to a new branch 'feature-darkmode'", vars: { branch: "'feature-darkmode'" } },
        { line: 3, narration: "Make experimental changes without altering production code.", output: "Added dark styles", vars: {} },
        { line: 5, narration: "Commit the new feature to this branch.", output: "[feature-darkmode 9f2c3b] Add dark mode palette", vars: {} },
        { line: 6, narration: "Switching back to 'main' restores your clean original code completely intact!", output: "Switched to branch 'main'. Working tree clean.", vars: { branch: "'main'" } }
      ]
    },
    {
      title: "Pushing to GitHub",
      filename: "push_remote.sh",
      lang: "bash",
      code: "git remote add origin https://github.com/anshumansribeast-prog/semicolon.git\ngit branch -M main\ngit push -u origin main",
      steps: [
        { line: 1, narration: "Connect your local repository to your GitHub remote URL.", output: "Remote 'origin' linked", vars: {} },
        { line: 2, narration: "Ensure the default branch is named 'main'.", output: "Branch verified as 'main'", vars: {} },
        { line: 3, narration: "Upload your code to GitHub with secure verification.", output: "Enumerating objects: 5, done.\nWriting objects: 100% (5/5), done.\nTo https://github.com/anshumansribeast-prog/semicolon.git\n * [new branch] main -> main", vars: { deployed: "True" } }
      ]
    }
  ]
};

// Fallback generator for any track/lesson without specific pre-baked demo
function getDemoForLesson(trackSlug, lessonNumber) {
  if (LESSON_DEMOS[trackSlug] && LESSON_DEMOS[trackSlug][lessonNumber - 1]) {
    return LESSON_DEMOS[trackSlug][lessonNumber - 1];
  }

  // Sensible default generic demo based on track
  if (trackSlug === "debugging") {
    return {
      title: "Debugging & Stack Traces",
      filename: "debug.py",
      lang: "python",
      code: "def calculate_average(numbers):\n    assert len(numbers) > 0, 'Cannot average empty list'\n    return sum(numbers) / len(numbers)\n\ntest_scores = [85, 92, 78]\nprint('Average:', calculate_average(test_scores))",
      steps: [
        { line: 1, narration: "Define function to calculate average.", output: "", vars: {} },
        { line: 2, narration: "Use an assertion to catch zero-division bugs before they cause a crash.", output: "", vars: { guard: "'active'" } },
        { line: 5, narration: "Provide test data with 3 test scores.", output: "", vars: { count: "3" } },
        { line: 6, narration: "Run calculation and print average score cleanly.", output: "Average: 85.0", vars: { average: "85.0" } }
      ]
    };
  }

  return {
    title: "Lesson Code Demonstration",
    filename: "example.py",
    lang: "python",
    code: "# Welcome to this lesson demo\nprint('Analyzing lesson concept...')\nresult = 42\nprint(f'Execution verified: {result}')",
    steps: [
      { line: 1, narration: "Ada is walking you through this lesson's core concept.", output: "", vars: {} },
      { line: 2, narration: "Printing verification message to console.", output: "Analyzing lesson concept...", vars: {} },
      { line: 3, narration: "Setting up test variable.", output: "", vars: { result: "42" } },
      { line: 4, narration: "Finished! Try modifying this in the playground.", output: "Execution verified: 42", vars: { verified: "True" } }
    ]
  };
}

if (typeof window !== "undefined") {
  window.LESSON_DEMOS = LESSON_DEMOS;
  window.getDemoForLesson = getDemoForLesson;
}
