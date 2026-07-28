/* ===================================================================
   webbuilder.js — the Web Builder and Free Build modes.

   THE ANSWER TO "CAN WE RUN A SERVER SO PEOPLE SEE THEIR PAGE?"
   We don't need one. An <iframe> with a srcdoc attribute renders a
   complete web page from a string, instantly, inside this page. That
   is exactly what every code-preview site does. No server, no upload,
   no account, no cost.

   WHY THE IFRAME IS SANDBOXED
   The iframe has sandbox="allow-scripts" and deliberately NOT
   allow-same-origin. Scripts run, so the visitor's page really works
   — but the iframe is treated as a foreign origin, so code inside it
   cannot reach out and touch this page, read its storage, or rewrite
   its DOM. Leaving allow-same-origin on alongside allow-scripts would
   undo the sandbox almost entirely, which is a genuinely common
   mistake.

   HOW WE SHOW THEIR console.log
   Because the iframe is a foreign origin we cannot read into it. So
   we inject a small script that replaces console.log inside the frame
   and posts each line out with postMessage. The parent listens and
   prints it. Messages are filtered by a tag so nothing else on the
   page can spoof them.
   =================================================================== */

var WEB_TEMPLATES = [
  {
    id: "blank",
    name: "Blank page",
    html: '<h1>Hello</h1>\n<p>Start typing. The preview updates as you go.</p>\n',
    css:  'body {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n  line-height: 1.6;\n}\n',
    js:   '// Your JavaScript runs here.\nconsole.log("page loaded");\n'
  },
  {
    id: "card",
    name: "Profile card",
    html: '<div class="card">\n  <div class="avatar">A</div>\n  <h2>Anshuman</h2>\n  <p>Learning to code, one broken program at a time.</p>\n  <button id="wave">Say hello</button>\n</div>\n',
    css:  'body {\n  font-family: system-ui, sans-serif;\n  display: grid;\n  place-items: center;\n  min-height: 100vh;\n  margin: 0;\n  background: #0f172a;\n}\n\n.card {\n  background: #fff;\n  padding: 2rem;\n  border-radius: 16px;\n  text-align: center;\n  max-width: 260px;\n  box-shadow: 0 20px 40px rgba(0,0,0,.35);\n}\n\n.avatar {\n  width: 64px;\n  height: 64px;\n  margin: 0 auto 1rem;\n  border-radius: 50%;\n  display: grid;\n  place-items: center;\n  font-size: 1.6rem;\n  font-weight: 700;\n  color: #fff;\n  background: linear-gradient(135deg, #1d4ed8, #4f46e5);\n}\n\nbutton {\n  margin-top: 1rem;\n  padding: .5rem 1.1rem;\n  border: 0;\n  border-radius: 999px;\n  background: #1d4ed8;\n  color: #fff;\n  cursor: pointer;\n  font: inherit;\n}\n',
    js:   'document.getElementById("wave").addEventListener("click", function () {\n  alert("Hello!");\n  console.log("button clicked");\n});\n'
  },
  {
    id: "counter",
    name: "Click counter",
    html: '<h1>Clicks: <span id="count">0</span></h1>\n<button id="up">+1</button>\n<button id="reset">Reset</button>\n',
    css:  'body {\n  font-family: system-ui, sans-serif;\n  text-align: center;\n  padding: 3rem 1rem;\n}\n\nbutton {\n  font-size: 1.1rem;\n  padding: .6rem 1.4rem;\n  margin: .3rem;\n  border-radius: 10px;\n  border: 1px solid #cbd5e1;\n  background: #fff;\n  cursor: pointer;\n}\n\n#count { color: #1d4ed8; }\n',
    js:   'let n = 0;\nconst out = document.getElementById("count");\n\ndocument.getElementById("up").addEventListener("click", function () {\n  n = n + 1;\n  out.textContent = n;\n  console.log("count is now", n);\n});\n\ndocument.getElementById("reset").addEventListener("click", function () {\n  n = 0;\n  out.textContent = n;\n});\n'
  },
  {
    id: "list",
    name: "To-do list",
    html: '<h1>To do</h1>\n<form id="add">\n  <input id="task" placeholder="What needs doing?" autocomplete="off">\n  <button>Add</button>\n</form>\n<ul id="list"></ul>\n',
    css:  'body {\n  font-family: system-ui, sans-serif;\n  max-width: 26rem;\n  margin: 2rem auto;\n  padding: 0 1rem;\n}\n\nform { display: flex; gap: .5rem; }\ninput { flex: 1; padding: .5rem; border: 1px solid #cbd5e1; border-radius: 8px; }\nbutton { padding: .5rem 1rem; border: 0; border-radius: 8px; background: #1d4ed8; color: #fff; cursor: pointer; }\nli { padding: .4rem 0; border-bottom: 1px solid #e2e8f0; cursor: pointer; }\nli.done { text-decoration: line-through; opacity: .5; }\n',
    js:   'const form = document.getElementById("add");\nconst input = document.getElementById("task");\nconst list = document.getElementById("list");\n\nform.addEventListener("submit", function (e) {\n  e.preventDefault();\n  if (!input.value.trim()) return;\n\n  const li = document.createElement("li");\n  li.textContent = input.value;\n  li.addEventListener("click", function () {\n    li.classList.toggle("done");\n  });\n  list.appendChild(li);\n\n  console.log("added:", input.value);\n  input.value = "";\n});\n'
  }
];

(function () {
  "use strict";

  var tabJs  = document.getElementById("tabJs");
  if (!tabJs) return;                       // not the practice page

  var tabWeb = document.getElementById("tabWeb");
  var tabPro = document.getElementById("tabPro");
  var panes  = {
    tabJs:  document.getElementById("modeJs"),
    tabWeb: document.getElementById("modeWeb"),
    tabPro: document.getElementById("modePro")
  };

  /* -------------------------------------------------------------------
     Mode switching, with the mode kept in the URL.

       playground.html?mode=web   opens straight into the Web Builder
       playground.html?mode=pro   opens straight into Free Build
       playground.html            opens the challenges, as before

     Putting the mode in the address means you can bookmark the builder,
     send someone a link straight to it, and refresh without being
     dumped back to the first tab. Same reasoning as lesson.html?n= —
     state that belongs to "where am I" belongs in the URL, not in a
     variable nobody else can see.

     replaceState rather than pushState: switching tabs shouldn't stack
     up ten entries you have to press Back through.
     ------------------------------------------------------------------- */
  var MODES = { js: "tabJs", web: "tabWeb", pro: "tabPro" };
  var TAB_TO_MODE = { tabJs: "js", tabWeb: "web", tabPro: "pro" };

  function show(which, updateUrl) {
    [tabJs, tabWeb, tabPro].forEach(function (t) {
      var on = t.id === which;
      t.setAttribute("aria-selected", on ? "true" : "false");
      panes[t.id].hidden = !on;
    });

    if (updateUrl !== false && window.history && window.history.replaceState) {
      var mode = TAB_TO_MODE[which];
      var url = window.location.pathname + (mode === "js" ? "" : "?mode=" + mode);
      window.history.replaceState(null, "", url);
    }
  }

  tabJs.addEventListener("click",  function () { show("tabJs"); });
  tabWeb.addEventListener("click", function () { show("tabWeb"); buildRun(); });
  tabPro.addEventListener("click", function () { show("tabPro"); proRun(); });

  /* -------------------------------------------------------------------
     Assemble three files into one complete HTML document.

     The injected script does two jobs: forwards console output to the
     parent, and catches uncaught errors so a typo shows up in the
     console panel instead of vanishing silently.
     ------------------------------------------------------------------- */
  function assemble(files, tag) {
    var bridge =
      "<script>(function(){" +
      "var send=function(kind,args){try{parent.postMessage({__semi:'" + tag + "'," +
        "kind:kind,text:Array.prototype.map.call(args,function(a){" +
        "if(typeof a==='object'&&a!==null){try{return JSON.stringify(a)}catch(e){return String(a)}}" +
        "return String(a)}).join(' ')},'*')}catch(e){}};" +
      "var l=console.log;console.log=function(){send('log',arguments);l.apply(console,arguments)};" +
      "var w=console.warn;console.warn=function(){send('log',arguments);w.apply(console,arguments)};" +
      "var er=console.error;console.error=function(){send('err',arguments);er.apply(console,arguments)};" +
      "window.onerror=function(m,s,ln,c){send('err',[m+'  (line '+ln+')']);return false};" +
      "})()<\/script>";

    return "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n" +
           "<style>\n" + files.css + "\n</style>\n" + bridge + "\n</head>\n<body>\n" +
           files.html + "\n<script>\n" + files.js + "\n<\/script>\n</body>\n</html>";
  }

  /* A downloadable file is the same document without our console bridge —
     they should get their page, not our plumbing. */
  function assembleClean(files) {
    return "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n" +
           "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" +
           "<title>My page</title>\n<style>\n" + files.css + "\n</style>\n</head>\n<body>\n" +
           files.html + "\n<script>\n" + files.js + "\n<\/script>\n</body>\n</html>\n";
  }

  function download(text, name) {
    var blob = new Blob([text], { type: "text/html" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* One listener for both preview frames, told apart by their tag. */
  var consoles = {};
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || typeof d !== "object") return;
    var box = consoles[d.__semi];
    if (!box) return;                       // not one of ours
    if (box.textContent.indexOf("appears here") !== -1) box.textContent = "";
    box.textContent += (d.kind === "err" ? "⚠ " : "") + d.text + "\n";
    box.scrollTop = box.scrollHeight;
  });

  /* ================= MODE 2 · WEB BUILDER ================= */
  var webFiles = { html: "", css: "", js: "" };
  var webCurrent = "html";
  var webInput = document.getElementById("webInput");
  var preview  = document.getElementById("preview");
  var webCons  = document.getElementById("webConsole");
  consoles["web"] = webCons;

  document.querySelectorAll(".file-tab[data-file]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      webFiles[webCurrent] = webInput.value;          // keep what they typed
      webCurrent = btn.dataset.file;
      webInput.value = webFiles[webCurrent];
      document.querySelectorAll(".file-tab[data-file]").forEach(function (b) {
        b.classList.toggle("is-on", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      webInput.focus();
    });
  });

  function loadTemplate(t) {
    webFiles = { html: t.html, css: t.css, js: t.js };
    webInput.value = webFiles[webCurrent];
    buildRun();
  }

  var tplBar = document.getElementById("templateBar");
  WEB_TEMPLATES.forEach(function (t, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = t.name;
    b.addEventListener("click", function () { loadTemplate(t); });
    tplBar.appendChild(b);
    if (i === 0) setTimeout(function () { loadTemplate(t); }, 0);
  });

  function buildRun() {
    webFiles[webCurrent] = webInput.value;
    webCons.textContent = "";
    preview.srcdoc = assemble(webFiles, "web");
  }

  document.getElementById("webRun").addEventListener("click", buildRun);

  /* Auto-run is debounced. Re-rendering on every keystroke would reload
     the frame mid-word and make typing feel broken. */
  var webTimer = null;
  webInput.addEventListener("input", function () {
    if (!document.getElementById("webAuto").checked) return;
    clearTimeout(webTimer);
    webTimer = setTimeout(buildRun, 700);
  });

  document.getElementById("webDownload").addEventListener("click", function () {
    webFiles[webCurrent] = webInput.value;
    download(assembleClean(webFiles), "my-page.html");
  });

  /* ================= MODE 3 · FREE BUILD ================= */
  var PRO_KEY = "semicolon_pro_slots_v1";
  var proFiles = { html: "", css: "", js: "" };
  var proCurrent = "html";
  var proSlot = "1";

  var proInput = document.getElementById("proInput");
  var proPrev  = document.getElementById("proPreview");
  var proCons  = document.getElementById("proConsole");
  var saveState = document.getElementById("saveState");
  consoles["pro"] = proCons;

  function loadSlots() {
    try { return JSON.parse(localStorage.getItem(PRO_KEY) || "{}"); }
    catch (e) { return {}; }
  }
  function saveSlots(all) {
    try { localStorage.setItem(PRO_KEY, JSON.stringify(all)); return true; }
    catch (e) { return false; }
  }

  var EMPTY = {
    html: '<!-- Your page. Nothing here but what you write. -->\n<h1>Free build</h1>\n',
    css:  '/* Your styles. */\nbody { font-family: system-ui, sans-serif; padding: 2rem; }\n',
    js:   '// Your JavaScript.\n'
  };

  function openSlot(n) {
    proSlot = n;
    var all = loadSlots();
    proFiles = all[n] ? { html: all[n].html, css: all[n].css, js: all[n].js }
                      : { html: EMPTY.html, css: EMPTY.css, js: EMPTY.js };
    proInput.value = proFiles[proCurrent];
    saveState.textContent = all[n] ? "saved slot " + n : "slot " + n + " is empty";
    document.querySelectorAll("[data-slot]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.slot === n ? "true" : "false");
    });
    proRun();
  }

  document.querySelectorAll("[data-slot]").forEach(function (b) {
    b.addEventListener("click", function () {
      proFiles[proCurrent] = proInput.value;
      openSlot(b.dataset.slot);
    });
  });

  document.querySelectorAll(".file-tab[data-pfile]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      proFiles[proCurrent] = proInput.value;
      proCurrent = btn.dataset.pfile;
      proInput.value = proFiles[proCurrent];
      document.querySelectorAll(".file-tab[data-pfile]").forEach(function (b) {
        b.classList.toggle("is-on", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      proInput.focus();
    });
  });

  function proRun() {
    proFiles[proCurrent] = proInput.value;
    proCons.textContent = "";
    proPrev.srcdoc = assemble(proFiles, "pro");
  }

  document.getElementById("proRun").addEventListener("click", proRun);

  document.getElementById("proSave").addEventListener("click", function () {
    proFiles[proCurrent] = proInput.value;
    var all = loadSlots();
    all[proSlot] = { html: proFiles.html, css: proFiles.css, js: proFiles.js };
    if (saveSlots(all)) {
      saveState.textContent = "saved slot " + proSlot;
    } else {
      saveState.textContent = "could not save — storage is blocked in this browser";
    }
  });

  document.getElementById("proClear").addEventListener("click", function () {
    if (!window.confirm("Empty slot " + proSlot + "? This cannot be undone.")) return;
    var all = loadSlots();
    delete all[proSlot];
    saveSlots(all);
    openSlot(proSlot);
  });

  document.getElementById("proDownload").addEventListener("click", function () {
    proFiles[proCurrent] = proInput.value;
    download(assembleClean(proFiles), "my-project.html");
  });

  openSlot("1");

  /* ---- honour ?mode= on arrival ----

     Runs last, after both builders have loaded their starting content,
     so opening ?mode=web lands on a preview that is already rendered
     rather than an empty frame that fills in a moment later. */
  var wanted = new URLSearchParams(window.location.search).get("mode");
  if (wanted && MODES[wanted]) {
    show(MODES[wanted], false);
    if (wanted === "web") buildRun();
    if (wanted === "pro") proRun();
  }
})();
