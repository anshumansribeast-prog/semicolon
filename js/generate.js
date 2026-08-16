/* Semicolon Code Generator — same Ada backend as chat. */
(function () {
  "use strict";
  var api = window.AdaAPI;
  if (!api || !document.getElementById("genForm")) return;

  var files = [];
  var current = 0;
  var lastPrompt = "";
  var abort = null;
  var pendingApply = "";
  var genHistory = [];
  var editor = document.getElementById("genEditor");
  var tree = document.getElementById("genTree");
  var nameEl = document.getElementById("genFileName");
  var work = document.getElementById("genWork");
  var preview = document.getElementById("genPreview");
  var note = document.getElementById("genPreviewNote");
  var explain = document.getElementById("genExplain");
  var msg = document.getElementById("genMsg");
  var go = document.getElementById("genGo");
  var stop = document.getElementById("genStop");

  function lang() { return document.getElementById("genLang").value; }
  function showMsg(text, bad) {
    msg.textContent = text || "";
    msg.className = "form-msg" + (text ? " is-shown" : "") + (bad ? " form-msg--error" : "");
  }

  function extOf(path) {
    var m = /\.([a-z0-9]+)$/i.exec(path || "");
    return (m ? m[1] : "").toLowerCase();
  }

  function saveCurrent() {
    if (!files[current]) return;
    files[current].content = editor.value;
  }

  function openFile(i) {
    saveCurrent();
    current = i;
    var f = files[i];
    if (!f) return;
    editor.value = f.content || "";
    nameEl.textContent = f.path;
    [].forEach.call(tree.querySelectorAll("button"), function (b, idx) {
      b.setAttribute("aria-current", idx === i ? "true" : "false");
    });
  }

  function renderTree() {
    tree.innerHTML = "";
    files.forEach(function (f, i) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = f.path;
      b.addEventListener("click", function () { openFile(i); });
      li.appendChild(b);
      tree.appendChild(li);
    });
    openFile(0);
    work.hidden = false;
  }

  function canPreview() {
    return files.some(function (f) {
      var e = extOf(f.path);
      return e === "html" || e === "css" || e === "js";
    });
  }

  function runPreview() {
    saveCurrent();
    if (!canPreview()) {
      preview.removeAttribute("srcdoc");
      note.textContent = "This language is not run on the server. Copy it and run it on your machine.";
      return;
    }
    var html = "", css = "", js = "";
    files.forEach(function (f) {
      var e = extOf(f.path);
      if (e === "html") html += f.content + "\n";
      else if (e === "css") css += f.content + "\n";
      else if (e === "js") js += f.content + "\n";
    });
    if (!html) {
      html = "<!DOCTYPE html><html><body><div id='app'></div></body></html>";
    }
    if (html.indexOf("</head>") !== -1) {
      html = html.replace("</head>", "<style>" + css + "</style></head>");
    } else {
      html = html.replace("<body", "<head><style>" + css + "</style></head><body");
    }
    html = html.replace("</body>", "<script>" + js + "<\/script></body>");
    preview.srcdoc = html;
    note.textContent = "Sandboxed preview (scripts allowed, no same-origin).";
  }

  function downloadBlob(name, text) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 800);
  }

  async function generate() {
    var prompt = document.getElementById("genPrompt").value.trim();
    if (!prompt) return;
    lastPrompt = prompt;
    go.disabled = true;
    stop.hidden = false;
    showMsg("Ada is writing…");
    abort = new AbortController();
    var data = await api.ask({
      mode: "generate",
      message: prompt,
      language: lang(),
      framework: document.getElementById("genFw").value,
      difficulty: document.getElementById("genDiff").value,
      output: document.getElementById("genOut").value,
      history: genHistory.slice(-12),
      files: files.map(function (x) { return { path: x.path, content: (x.content || "").slice(0, 4000) }; }),
      abort: abort
    });
    abort = null;
    go.disabled = false;
    stop.hidden = true;
    if (data.aborted) { showMsg("Stopped."); return; }
    if (data.files && data.files.length) {
      files = data.files;
      genHistory.push({ role: "user", content: prompt });
      genHistory.push({ role: "assistant", content: data.reply || "Generated files." });
      renderTree();
      showMsg(data.reply || "Ready.");
      explain.hidden = true;
      runPreview();
    } else {
      showMsg(data.reply || api.FAIL, true);
    }
  }

  document.getElementById("genForm").addEventListener("submit", function (e) {
    e.preventDefault();
    generate();
  });
  stop.addEventListener("click", function () { if (abort) abort.abort(); });

  document.getElementById("actCopy").addEventListener("click", function () {
    saveCurrent();
    navigator.clipboard.writeText(editor.value || "");
  });
  document.getElementById("actDl").addEventListener("click", function () {
    saveCurrent();
    var f = files[current];
    if (f) downloadBlob(f.path.replace(/[^\w.\-]+/g, "_"), f.content || "");
  });
  document.getElementById("actAll").addEventListener("click", function () {
    saveCurrent();
    files.forEach(function (f, i) {
      setTimeout(function () { downloadBlob(f.path.replace(/[^\w.\-]+/g, "_"), f.content || ""); }, i * 200);
    });
  });
  document.getElementById("actFmt").addEventListener("click", function () {
    saveCurrent();
    var t = editor.value || "";
    try {
      if (/^\s*[\[{]/.test(t)) editor.value = JSON.stringify(JSON.parse(t), null, 2);
      else editor.value = t.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n");
    } catch (e) {
      editor.value = t.replace(/[ \t]+$/gm, "");
    }
    saveCurrent();
  });
  document.getElementById("actPreview").addEventListener("click", runPreview);

  async function assist(mode) {
    saveCurrent();
    var f = files[current];
    if (!f) return;
    showMsg("Ada is reading the project…");
    var data = await api.ask({
      mode: mode,
      message: (f.path + "\n\n" + f.content).slice(0, 12000),
      files: files.map(function (x) { return { path: x.path, content: (x.content || "").slice(0, 4000) }; }),
      language: lang()
    });
    explain.hidden = false;
    explain.innerHTML = api.renderMarkdown(data.reply || api.FAIL);
    if (window.hljs) {
      explain.querySelectorAll("pre code").forEach(function (el) {
        window.hljs.highlightElement(el);
      });
    }
    explain.querySelectorAll(".ada-copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-copy");
        var code = explain.querySelector('code[data-copy-src="' + id + '"]');
        if (code) navigator.clipboard.writeText(code.textContent || "");
      });
    });
    pendingApply = "";
    var applyBtn = document.getElementById("actApply");
    if (applyBtn) applyBtn.hidden = true;
    if (mode === "improve" || mode === "debug") {
      var block = explain.querySelector("code[data-copy-src]");
      if (block) {
        pendingApply = block.textContent;
        if (applyBtn) applyBtn.hidden = false;
        showMsg("Review Ada's change, then Apply if you want it in the editor.");
        return;
      }
    }
    showMsg("");
  }

  document.getElementById("actApply").addEventListener("click", function () {
    if (!pendingApply || !files[current]) return;
    files[current].content = pendingApply;
    editor.value = pendingApply;
    pendingApply = "";
    document.getElementById("actApply").hidden = true;
    showMsg("Applied to " + files[current].path);
  });

  document.getElementById("actExplain").addEventListener("click", function () { assist("explain"); });
  document.getElementById("actImprove").addEventListener("click", function () { assist("improve"); });
  document.getElementById("actDebug").addEventListener("click", function () { assist("debug"); });
  document.getElementById("actRegen").addEventListener("click", function () {
    if (lastPrompt) {
      document.getElementById("genPrompt").value = lastPrompt;
      generate();
    }
  });

  document.getElementById("chGo").addEventListener("click", async function () {
    var data = await api.ask({
      mode: "challenge",
      message: document.getElementById("chTopic").value.trim() || "loops",
      language: document.getElementById("chLang").value,
      difficulty: document.getElementById("chDiff").value
    });
    document.getElementById("chCard").hidden = false;
    document.getElementById("chTitle").textContent = data.title || "Challenge";
    document.getElementById("chDesc").textContent = data.description || data.reply || "";
    document.getElementById("chIn").textContent = data.example_in || "—";
    document.getElementById("chOut").textContent = data.example_out || "—";
    document.getElementById("chStart").textContent = data.starter || "";
    var ul = document.getElementById("chHints");
    ul.innerHTML = "";
    (data.hints || []).forEach(function (h) {
      var li = document.createElement("li");
      li.textContent = h;
      ul.appendChild(li);
    });
    var box = document.getElementById("chSolBox");
    box.hidden = true;
    box.textContent = data.solution || "";
  });
  document.getElementById("chSol").addEventListener("click", function () {
    document.getElementById("chSolBox").hidden = false;
  });

  var IDEAS = [
    "Responsive portfolio for a photographer",
    "To-do list with localStorage",
    "Cricket scoreboard",
    "Bakery landing page",
    "Python quiz on planets",
    "SQL table for a library",
    "Snake game in JavaScript",
    "Study timer with breaks"
  ];
  var ideas = document.getElementById("genIdeas");
  if (ideas) {
    IDEAS.forEach(function (text) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ada-chip";
      b.textContent = text;
      b.addEventListener("click", function () {
        document.getElementById("genPrompt").value = "Create: " + text;
        generate();
      });
      ideas.appendChild(b);
    });
  }

  files = [
    { path: "index.html", content: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Your project</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <h1>Code Generator</h1>\n  <p>Describe anything above, then Generate. This editor is the place the files land.</p>\n  <script src=\"script.js\"></script>\n</body>\n</html>\n" },
    { path: "style.css", content: "body { font-family: system-ui, sans-serif; margin: 2rem; }\n" },
    { path: "script.js", content: "console.log(\"Ada is ready\");\n" },
    { path: "README.md", content: "# Your project\n\nGenerate to replace these starter files.\n" }
  ];
  renderTree();
  runPreview();

  var chatLog = document.getElementById("genChatLog");
  var chatForm = document.getElementById("genChatForm");
  var chatInput = document.getElementById("genChatInput");
  var chatHistory = [];

  function chatRow(kind, html) {
    if (!chatLog) return;
    var row = document.createElement("div");
    row.className = "ada-row ada-row--" + (kind === "user" ? "user" : "bot");
    var el = document.createElement("div");
    el.className = "ada-bubble ada-bubble--" + kind;
    if (kind === "user") el.textContent = html;
    else el.innerHTML = html;
    row.appendChild(el);
    chatLog.appendChild(row);
    chatLog.scrollTop = chatLog.scrollHeight;
    return el;
  }

  if (chatForm && chatInput) {
    chatRow("bot", "<p>This chat is tied to the files on the left. Ask for a change, an explanation, or anything else.</p>");
    chatForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = "";
      chatRow("user", text);
      saveCurrent();
      var thinking = chatRow("bot", "<p>…</p>");
      var data = await api.ask({
        mode: "chat",
        message: text,
        history: chatHistory.slice(-16),
        files: files.map(function (x) { return { path: x.path, content: (x.content || "").slice(0, 4000) }; }),
        language: lang()
      });
      thinking.innerHTML = api.renderMarkdown(data.reply || api.FAIL);
      thinking.querySelectorAll(".ada-copy").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-copy");
          var code = thinking.querySelector('code[data-copy-src="' + id + '"]');
          if (code) navigator.clipboard.writeText(code.textContent || "");
        });
      });
      chatHistory.push({ role: "user", content: text });
      chatHistory.push({ role: "assistant", content: data.reply || "" });
      var block = thinking.querySelector("code[data-copy-src]");
      if (block && /```|file:/.test(data.reply || "") && files[current]) {
        pendingApply = block.textContent;
        var applyBtn = document.getElementById("actApply");
        if (applyBtn && pendingApply) {
          applyBtn.hidden = false;
          showMsg("Ada proposed an edit. Press Apply change to put it in the editor.");
        }
      }
    });
  }
})();
