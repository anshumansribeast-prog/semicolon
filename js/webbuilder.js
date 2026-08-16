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
    name: "Blank",
    html: '<main>\n  <p class="kicker">Your page</p>\n  <h1>Hello</h1>\n  <p>Edit the HTML, CSS and JS tabs. The preview follows.</p>\n</main>\n',
    css:  ':root {\n  --ink: #1e1b4b;\n  --mist: #f4f6ff;\n  --accent: #4f46e5;\n}\n* { box-sizing: border-box; }\nbody {\n  margin: 0;\n  min-height: 100vh;\n  font-family: system-ui, sans-serif;\n  background:\n    radial-gradient(40rem 20rem at 100% 0%, #fce7f3, transparent),\n    radial-gradient(36rem 18rem at 0% 100%, #ccfbf1, transparent),\n    var(--mist);\n  color: var(--ink);\n  display: grid;\n  place-items: center;\n}\nmain {\n  width: min(28rem, 92vw);\n  padding: 2rem;\n  background: #fff;\n  border-radius: 20px;\n  box-shadow: 0 18px 40px rgba(30, 27, 75, .12);\n}\n.kicker {\n  margin: 0 0 .4rem;\n  font-size: .72rem;\n  letter-spacing: .16em;\n  text-transform: uppercase;\n  color: var(--accent);\n  font-weight: 700;\n}\nh1 { margin: 0 0 .5rem; font-size: 2rem; }\np { margin: 0; line-height: 1.6; color: #4c4870; }\n',
    js:   'console.log("blank template ready");\n'
  },
  {
    id: "card",
    name: "Profile",
    html: '<article class="card">\n  <div class="bar"></div>\n  <div class="avatar">A</div>\n  <h2>Anshuman</h2>\n  <p>Learning to code, one broken program at a time.</p>\n  <button id="wave">Say hello</button>\n</article>\n',
    css:  'body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: linear-gradient(145deg, #312e81, #9d174d 55%, #0f766e);\n}\n.card {\n  width: min(16.5rem, 90vw);\n  background: #fff;\n  border-radius: 22px;\n  padding: 0 1.6rem 1.6rem;\n  text-align: center;\n  overflow: hidden;\n  box-shadow: 0 24px 50px rgba(0,0,0,.28);\n}\n.bar {\n  height: 8px;\n  margin: 0 -1.6rem 1.2rem;\n  background: linear-gradient(90deg, #4f46e5, #e11d48, #d97706, #0d9488);\n}\n.avatar {\n  width: 68px; height: 68px; margin: 0 auto .8rem;\n  border-radius: 50%;\n  display: grid; place-items: center;\n  font-size: 1.7rem; font-weight: 800; color: #fff;\n  background: linear-gradient(135deg, #4f46e5, #e11d48);\n}\nh2 { margin: 0 .2rem; }\np { color: #4c4870; line-height: 1.5; }\nbutton {\n  margin-top: .4rem;\n  padding: .55rem 1.2rem;\n  border: 0; border-radius: 999px;\n  background: #4f46e5; color: #fff;\n  font: inherit; cursor: pointer;\n}\nbutton:hover { background: #4338ca; }\n',
    js:   'document.getElementById("wave").addEventListener("click", function () {\n  alert("Hello!");\n  console.log("button clicked");\n});\n'
  },
  {
    id: "counter",
    name: "Counter",
    html: '<section class="wrap">\n  <p class="kicker">Practice</p>\n  <h1>Clicks</h1>\n  <p class="num" id="count">0</p>\n  <div class="row">\n    <button id="up">+1</button>\n    <button id="reset" class="ghost">Reset</button>\n  </div>\n</section>\n',
    css:  'body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: #0f172a;\n  color: #e2e8f0;\n}\n.wrap { text-align: center; }\n.kicker {\n  letter-spacing: .18em; text-transform: uppercase;\n  font-size: .7rem; color: #2dd4bf; margin: 0 0 .4rem;\n}\nh1 { margin: 0; font-weight: 650; }\n.num {\n  font-size: 5rem; font-weight: 800; margin: .2rem 0 1rem;\n  background: linear-gradient(90deg, #a5b4fc, #fb7185, #fbbf24);\n  -webkit-background-clip: text; background-clip: text; color: transparent;\n}\n.row { display: flex; gap: .6rem; justify-content: center; }\nbutton {\n  font: inherit; cursor: pointer;\n  padding: .6rem 1.3rem; border-radius: 999px; border: 0;\n  background: #4f46e5; color: #fff;\n}\nbutton.ghost {\n  background: transparent; color: #e2e8f0;\n  border: 1px solid #334155;\n}\n',
    js:   'let n = 0;\nconst out = document.getElementById("count");\ndocument.getElementById("up").addEventListener("click", function () {\n  n = n + 1;\n  out.textContent = n;\n  console.log("count is now", n);\n});\ndocument.getElementById("reset").addEventListener("click", function () {\n  n = 0;\n  out.textContent = n;\n});\n'
  },
  {
    id: "list",
    name: "To-do",
    html: '<section class="app">\n  <h1>To do</h1>\n  <form id="add">\n    <input id="task" placeholder="What needs doing?" autocomplete="off">\n    <button>Add</button>\n  </form>\n  <ul id="list"></ul>\n</section>\n',
    css:  'body {\n  margin: 0;\n  min-height: 100vh;\n  font-family: system-ui, sans-serif;\n  background: #fff7ed;\n  color: #1e1b4b;\n}\n.app {\n  max-width: 24rem;\n  margin: 2.4rem auto;\n  padding: 1.4rem;\n  background: #fff;\n  border-radius: 18px;\n  border: 1px solid #fed7aa;\n  box-shadow: 0 12px 30px rgba(217, 119, 6, .12);\n}\nh1 { margin: 0 0 1rem; }\nform { display: flex; gap: .5rem; }\ninput {\n  flex: 1; padding: .6rem .75rem;\n  border: 1px solid #e7e5e4; border-radius: 10px; font: inherit;\n}\nbutton {\n  padding: .6rem 1rem; border: 0; border-radius: 10px;\n  background: #d97706; color: #fff; font: inherit; cursor: pointer;\n}\nli {\n  list-style: none; margin-left: 0;\n  padding: .55rem 0;\n  border-bottom: 1px dashed #fed7aa;\n  cursor: pointer;\n}\nul { padding: 0; margin: 1rem 0 0; }\nli.done { text-decoration: line-through; opacity: .45; }\n',
    js:   'const form = document.getElementById("add");\nconst input = document.getElementById("task");\nconst list = document.getElementById("list");\nform.addEventListener("submit", function (e) {\n  e.preventDefault();\n  if (!input.value.trim()) return;\n  const li = document.createElement("li");\n  li.textContent = input.value;\n  li.addEventListener("click", function () { li.classList.toggle("done"); });\n  list.appendChild(li);\n  console.log("added:", input.value);\n  input.value = "";\n});\n'
  },
  {
    id: "cipher",
    name: "Cipher",
    html: '<section class="panel">\n  <h1>Secret message</h1>\n  <label>Message<input id="msg" value="HELLO ADA"></label>\n  <label>Shift<input id="shift" type="number" value="3"></label>\n  <div class="row">\n    <button id="enc">Encode</button>\n    <button id="dec" class="ghost">Decode</button>\n  </div>\n  <p id="out"></p>\n</section>\n',
    css:  'body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: #0b1020;\n  color: #f5f3ff;\n}\n.panel {\n  width: min(22rem, 92vw);\n  padding: 1.5rem;\n  border-radius: 20px;\n  background: #1a1833;\n  border: 1px solid #3b3470;\n}\nh1 { margin: 0 0 1rem; font-size: 1.4rem; }\nlabel { display: grid; gap: .3rem; font-size: .85rem; margin-bottom: .8rem; color: #c4b5fd; }\ninput {\n  padding: .55rem .7rem; border-radius: 10px; border: 1px solid #3b3470;\n  background: #0b1020; color: #fff; font: inherit;\n}\n.row { display: flex; gap: .5rem; }\nbutton {\n  flex: 1; padding: .6rem; border: 0; border-radius: 10px;\n  background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff;\n  font: inherit; cursor: pointer;\n}\nbutton.ghost { background: transparent; border: 1px solid #3b3470; }\n#out {\n  min-height: 2.4rem; margin: 1rem 0 0; font-size: 1.25rem;\n  letter-spacing: .08em; color: #fbbf24;\n}\n',
    js:   'function shiftLetter(letter, amount) {\n  if (letter < "A" || letter > "Z") return letter;\n  var n = letter.charCodeAt(0) - 65;\n  n = (n + amount % 26 + 26) % 26;\n  return String.fromCharCode(n + 65);\n}\nfunction encode(text, amount) {\n  var out = "";\n  for (var i = 0; i < text.length; i++) {\n    out += shiftLetter(text[i].toUpperCase(), amount);\n  }\n  return out;\n}\nfunction run(dir) {\n  var t = document.getElementById("msg").value;\n  var s = Number(document.getElementById("shift").value);\n  var result = encode(t, dir * s);\n  document.getElementById("out").textContent = result;\n  console.log(result);\n}\ndocument.getElementById("enc").addEventListener("click", function () { run(1); });\ndocument.getElementById("dec").addEventListener("click", function () { run(-1); });\n'
  }
];

(function () {
  "use strict";

  var tabJs  = document.getElementById("tabJs");
  if (!tabJs) return;                       // not the practice page

  var tabWeb = document.getElementById("tabWeb");
  var tabPro = document.getElementById("tabPro");
  var tabPy  = document.getElementById("tabPy");
  var tabGen = document.getElementById("tabGen");
  var panes  = {
    tabJs:  document.getElementById("modeJs"),
    tabWeb: document.getElementById("modeWeb"),
    tabPro: document.getElementById("modePro"),
    tabPy:  document.getElementById("modePy"),
    tabGen: document.getElementById("modeGen")
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
  var MODES = { js: "tabJs", web: "tabWeb", pro: "tabPro", py: "tabPy", gen: "tabGen" };
  var TAB_TO_MODE = { tabJs: "js", tabWeb: "web", tabPro: "pro", tabPy: "py", tabGen: "gen" };

  function show(which, updateUrl) {
    [tabJs, tabWeb, tabPro, tabPy, tabGen].forEach(function (t) {
      if (!t || !panes[t.id]) return;
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
  if (tabPy) tabPy.addEventListener("click", function () { show("tabPy"); });
  if (tabGen) tabGen.addEventListener("click", function () { show("tabGen"); genRun(); });

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
    b.className = "tpl-pick";
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

  /* -------------------------------------------------------------------
     Preview size controls and fullscreen.

     Phone and Tablet do NOT shrink the page — they narrow the frame,
     which is a real responsive test. A page that looks fine at full
     width and breaks at 390px has a genuine bug, and this is how you
     find it without owning a phone.

     Fullscreen uses the browser's own Fullscreen API where available
     and falls back to a fixed-position class where it is not, so the
     button always does something rather than failing silently.
     ------------------------------------------------------------------- */
  var SIZES = { phone: "390px", tablet: "820px", full: "100%" };

  document.querySelectorAll(".size-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var which = btn.dataset.for;
      var wrap = document.getElementById(which === "web" ? "webFrameWrap" : "proFrameWrap");
      var frame = document.getElementById(which === "web" ? "preview" : "proPreview");

      frame.style.width = SIZES[btn.dataset.size];
      wrap.classList.toggle("is-narrow", btn.dataset.size !== "full");

      document.querySelectorAll('.size-btn[data-for="' + which + '"]').forEach(function (b) {
        b.classList.toggle("is-on", b === btn);
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
    });
  });

  function wireExpand(btnId, paneId) {
    var btn = document.getElementById(btnId);
    var pane = document.getElementById(paneId);
    if (!btn || !pane) return;

    btn.addEventListener("click", function () {
      var isFs = document.fullscreenElement === pane || pane.classList.contains("is-faux-fs");

      if (isFs) {
        if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
        pane.classList.remove("is-faux-fs");
        btn.textContent = "⛶ Fullscreen";
        return;
      }

      if (pane.requestFullscreen) {
        pane.requestFullscreen().catch(function () {
          pane.classList.add("is-faux-fs");     // blocked - fall back
        });
      } else {
        pane.classList.add("is-faux-fs");
      }
      btn.textContent = "✕ Exit fullscreen";
    });
  }
  wireExpand("webExpand", "webPreviewPane");
  wireExpand("proExpand", "proPreviewPane");

  /* Pressing Escape leaves real fullscreen by itself, but the button
     label would be left lying. Keep it honest. */
  document.addEventListener("fullscreenchange", function () {
    if (document.fullscreenElement) return;
    var w = document.getElementById("webExpand");
    var p = document.getElementById("proExpand");
    if (w) w.textContent = "⛶ Fullscreen";
    if (p) p.textContent = "⛶ Fullscreen";
  });

  /* Escape also leaves the fallback version. */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".is-faux-fs").forEach(function (el) {
      el.classList.remove("is-faux-fs");
    });
    var w = document.getElementById("webExpand");
    var p = document.getElementById("proExpand");
    if (w) w.textContent = "⛶ Fullscreen";
    if (p) p.textContent = "⛶ Fullscreen";
  });

  openSlot("1");

  /* ================= RUN GENERATED ================= */
  var genFiles = { html: "", css: "", js: "" };
  var genCurrent = "html";
  var runInput = document.getElementById("runInput");
  var runPrev = document.getElementById("runPreview");
  var runCons = document.getElementById("runConsole");
  var runPrompt = document.getElementById("runPrompt");
  var runMsg = document.getElementById("runGenMsg");
  var runTitle = document.getElementById("runGenTitle");
  consoles["gen"] = runCons;

  function genApply(web) {
    genFiles = { html: web.html || "", css: web.css || "", js: web.js || "" };
    if (runInput) runInput.value = genFiles[genCurrent];
  }

  function genRun() {
    if (!runInput || !runPrev) return;
    genFiles[genCurrent] = runInput.value;
    if (runCons) runCons.textContent = "";
    runPrev.srcdoc = assemble(genFiles, "gen");
  }

  function genFromPayload(payload) {
    if (!payload || !window.SemiGen) return;
    var web = window.SemiGen.toWeb(payload.files || []);
    genApply(web);
    if (runPrompt && payload.prompt) runPrompt.value = payload.prompt;
    if (runTitle) runTitle.textContent = payload.prompt ? String(payload.prompt).slice(0, 48) : "generated";
    if (runMsg) {
      runMsg.textContent = "Code loaded. Press Run to see it.";
      runMsg.className = "form-msg is-shown";
    }
    genRun();
  }

  if (runInput) {
    document.querySelectorAll(".file-tab[data-gfile]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        genFiles[genCurrent] = runInput.value;
        genCurrent = btn.getAttribute("data-gfile");
        runInput.value = genFiles[genCurrent];
        document.querySelectorAll(".file-tab[data-gfile]").forEach(function (b) {
          b.classList.toggle("is-on", b === btn);
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });
      });
    });
    var makeBtn = document.getElementById("runGenMake");
    if (makeBtn) {
      makeBtn.addEventListener("click", function () {
        var prompt = (runPrompt && runPrompt.value.trim()) || "";
        if (!prompt) {
          if (runMsg) {
            runMsg.textContent = "Type what you want to build, then Generate.";
            runMsg.className = "form-msg is-shown form-msg--error";
          }
          return;
        }
        var files = window.SemiGen.build(prompt, "HTML", "None", "Beginner", "project");
        window.SemiGen.save({ prompt: prompt, language: "HTML", files: files });
        genFromPayload({ prompt: prompt, files: files });
        if (runMsg) {
          runMsg.textContent = "Generated. Check the files, then press Run.";
          runMsg.className = "form-msg is-shown";
        }
      });
    }
    var runBtn = document.getElementById("runGenRun");
    if (runBtn) runBtn.addEventListener("click", genRun);
    var jsBtn = document.getElementById("runJsOnly");
    if (jsBtn) {
      jsBtn.addEventListener("click", function () {
        genFiles[genCurrent] = runInput.value;
        if (runCons) runCons.textContent = "";
        var lines = [];
        var realLog = console.log, realErr = console.error;
        console.log = function () {
          lines.push(Array.prototype.join.call(arguments, " "));
        };
        console.error = console.log;
        try {
          new Function(genFiles.js || "")();
          runCons.textContent = lines.join("\n") || "(ran, no console output)";
        } catch (err) {
          runCons.textContent = "⚠ " + err.name + ": " + err.message;
        } finally {
          console.log = realLog;
          console.error = realErr;
        }
      });
    }
    var clr = document.getElementById("runConsClear");
    if (clr) clr.addEventListener("click", function () {
      if (runCons) runCons.textContent = "Press Run. console.log from your page appears here.";
    });
    var saved = window.SemiGen && window.SemiGen.load && window.SemiGen.load();
    if (saved && saved.files && saved.files.length) genFromPayload(saved);
  }

  /* ---- honour ?mode= on arrival ----

     Runs last, after both builders have loaded their starting content,
     so opening ?mode=web lands on a preview that is already rendered
     rather than an empty frame that fills in a moment later. */
  var wanted = new URLSearchParams(window.location.search).get("mode");
  if (wanted && MODES[wanted]) {
    show(MODES[wanted], false);
    if (wanted === "web") buildRun();
    if (wanted === "pro") proRun();
    if (wanted === "gen") genRun();
  }
})();
