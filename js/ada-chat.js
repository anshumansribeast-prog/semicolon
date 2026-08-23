/* Ada chat — conversation + project workspace in one page.

   The old Code Generator was merged into Ada: when she answers with markdown
   fences that start with `file: name`, those fences become editable project
   files in the workspace beside the chat. HTML/CSS/JS projects preview live
   in a sandboxed iframe. Nothing here needs a backend beyond /api/ada. */
(function () {
  "use strict";

  var api = window.AdaAPI;
  var log = document.getElementById("adaLog");
  var form = document.getElementById("adaForm");
  var input = document.getElementById("adaInput");
  var sendBtn = document.getElementById("adaSend");
  var stopBtn = document.getElementById("adaStop");
  var regenBtn = document.getElementById("adaRegen");
  var clearBtn = document.getElementById("adaClear");
  var statusEl = document.getElementById("adaStatus");
  var workEl = document.getElementById("adaWork");
  var workTabs = document.getElementById("adaWorkTabs");
  var workCode = document.getElementById("adaWorkCode");
  var workPrev = document.getElementById("adaWorkPrev");
  var workTitle = document.getElementById("adaWorkTitle");
  var workDownload = document.getElementById("adaWorkDownload");
  var workCopy = document.getElementById("adaWorkCopy");
  var workClose = document.getElementById("adaWorkClose");

  if (!log || !form || !input) return;

  var history = [];
  var files = [];
  var current = 0;
  var controller = null;
  var lastMessage = "";

  /* ---- file extraction: same rules the server used to enforce ---- */
  var FILE_MARK = /(?:file|path|filename)\s*[:=]\s*([A-Za-z0-9._\-/]+)/i;

  function extractFiles(text) {
    var out = [];
    var re = /```(\w+)?\n([\s\S]*?)```/g;
    var m;
    var n = 0;
    while ((m = re.exec(text || ""))) {
      n += 1;
      var lang = m[1] || "txt";
      var body = (m[2] || "").replace(/\n$/, "");
      var first = body.split("\n")[0] || "";
      var marked = first.match(FILE_MARK);
      var path = null;
      var rest = body;
      if (marked) {
        path = marked[1];
        rest = body.slice(body.indexOf("\n") + 1);
      } else if (/^[\w./-]+\.(html|css|js|py|c|cpp|java|sql|ts|jsx|md|json)$/i.test(first.trim())) {
        path = first.trim();
        rest = body.slice(body.indexOf("\n") + 1);
      }
      if (!path) {
        var ext = { js: "js", javascript: "js", py: "py", python: "py", ts: "ts" }[lang.toLowerCase()] || lang;
        path = "file-" + n + "." + ext;
      }
      path = path.replace(/^\.\//, "");
      if (path.indexOf("..") === -1) {
        out.push({ path: path, content: rest.replace(/^\n/, "") });
      }
    }
    return out;
  }

  /* ---- workspace ---- */
  function langOf(path) {
    var ext = (path.split(".").pop() || "").toLowerCase();
    return { html: "html", css: "css", js: "javascript", py: "python", md: "markdown", ts: "typescript" }[ext] || ext;
  }

  function showFile(i) {
    if (!files.length) return;
    current = Math.max(0, Math.min(i, files.length - 1));
    var f = files[current];
    workCode.textContent = f.content;
    workTitle.textContent = f.path;
    Array.prototype.forEach.call(workTabs.querySelectorAll(".file-tab"), function (b, idx) {
      b.classList.toggle("is-on", idx === current);
      b.setAttribute("aria-selected", idx === current ? "true" : "false");
    });
    renderPreview();
  }

  function renderPreview() {
    var f = files[current];
    var lower = (files.length ? f.path : "").toLowerCase();
    var hasHtml = files.some(function (x) { return /\.html?$/.test(x.path.toLowerCase()); });
    var canPreview = /\.html?$/.test(lower) || (hasHtml && current === 0);
    if (!canPreview) {
      workPrev.removeAttribute("srcdoc");
      workPrev.closest(".ada-work-preview").hidden = true;
      return;
    }
    var html = "", css = "", js = "";
    files.forEach(function (x) {
      var p = x.path.toLowerCase();
      if (/\.html?$/.test(p)) html = x.content;
      else if (/\.css$/.test(p)) css = x.content;
      else if (/\.jsx?$/.test(p)) js = x.content;
    });
    var doc = html || "<!DOCTYPE html><html><head></head><body></body></html>";
    if (css) doc = doc.replace(/<\/head>/i, "<style>" + css + "</style></head>");
    if (js) doc = doc.replace(/<\/body>/i, "<script>" + js + "<\/script></body>");
    workPrev.closest(".ada-work-preview").hidden = false;
    workPrev.srcdoc = doc;
  }

  function openWorkspace(list, title) {
    files = list;
    workTabs.innerHTML = "";
    list.forEach(function (f, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "file-tab";
      b.setAttribute("role", "tab");
      b.textContent = f.path;
      b.addEventListener("click", function () { showFile(i); });
      workTabs.appendChild(b);
    });
    workEl.hidden = false;
    workTitle.textContent = title || "project";
    showFile(0);
  }

  /* ---- chat rendering ---- */
  function bubble(role, html) {
    var row = document.createElement("div");
    row.className = "ada-row ada-row--" + (role === "user" ? "user" : "bot");
    var b = document.createElement("div");
    b.className = "ada-bubble ada-bubble--" + (role === "user" ? "user" : "bot");
    b.innerHTML = html;
    row.appendChild(b);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return b;
  }

  function addCopyHandlers(el) {
    el.querySelectorAll(".ada-copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-copy");
        var code = el.querySelector('code[data-copy-src="' + id + '"]');
        if (code && navigator.clipboard) navigator.clipboard.writeText(code.textContent || "");
      });
    });
  }

  function replyWithFiles(data) {
    var list = extractFiles(data.reply || "");
    if (list.length) {
      openWorkspace(list, data.title || "project");
    }
  }

  function setBusy(on) {
    sendBtn.disabled = on;
    stopBtn.hidden = !on;
    regenBtn.disabled = on || !lastMessage;
  }

  function send(message) {
    if (!message.trim()) return;
    lastMessage = message;
    bubble("user", api.escapeHtml(message));
    input.value = "";
    setBusy(true);
    stopBtn.disabled = false;
    var thinking = bubble("bot", "<em>Ada is thinking…</em>");
    thinking.classList.add("is-thinking");

    var hist = history.slice(-30);
    controller = new AbortController();
    api.ask({
      abort: controller,
      mode: "chat",
      message: message,
      history: hist,
      files: files.map(function (f) { return { path: f.path, content: f.content.slice(0, 6000) }; })
    }).then(function (data) {
      thinking.classList.remove("is-thinking");
      var reply = data.reply || api.FAIL;
      thinking.innerHTML = api.renderMarkdown(reply);
      addCopyHandlers(thinking);
      if (!data.aborted) {
        history.push({ role: "user", content: message });
        history.push({ role: "assistant", content: reply });
        replyWithFiles(data);
      }
    }).finally(function () {
      setBusy(false);
      log.scrollTop = log.scrollHeight;
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    send(input.value);
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
  stopBtn.addEventListener("click", function () { if (controller) controller.abort(); });
  regenBtn.addEventListener("click", function () { if (lastMessage) send(lastMessage); });
  clearBtn.addEventListener("click", function () {
    history = [];
    files = [];
    lastMessage = "";
    regenBtn.disabled = true;
    workEl.hidden = true;
    log.innerHTML = "";
    bubble("bot", "Cleared. What are we building next?");
    input.focus();
  });

  document.querySelectorAll("[data-ada-prompt]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      input.value = btn.getAttribute("data-ada-prompt");
      form.requestSubmit();
    });
  });

  /* workspace toolbar */
  workCopy.addEventListener("click", function () {
    var f = files[current];
    if (f && navigator.clipboard) navigator.clipboard.writeText(f.content || "");
  });
  workDownload.addEventListener("click", function () {
    var f = files[current];
    if (!f) return;
    var blob = new Blob([f.content], { type: "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = f.path.replace(/[^\w.\-]+/g, "_");
    a.click();
    URL.revokeObjectURL(a.href);
  });
  workClose.addEventListener("click", function () { workEl.hidden = true; });
  document.getElementById("adaWorkDownloadAll").addEventListener("click", function () {
    files.forEach(function (f, i) {
      setTimeout(function () {
        var blob = new Blob([f.content], { type: "text/plain" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = f.path.replace(/[^\w.\-]+/g, "_");
        a.click();
        URL.revokeObjectURL(a.href);
      }, i * 200);
    });
  });

  /* ---- status: which brain Ada has right now ---- */
  function refreshStatus() {
    statusEl.textContent = "checking…";
    statusEl.className = "ada-status";
    fetch("/api/ada")
      .then(function (r) { return r.json(); })
      .then(function (info) {
        if (info.model && info.api) {
          statusEl.textContent = "live model: " + info.model;
          statusEl.className = "ada-status";
        } else {
          statusEl.textContent = "offline notes — no live model yet";
          statusEl.className = "ada-status is-model-off";
        }
      })
      .catch(function () {
        statusEl.textContent = "offline notes";
        statusEl.className = "ada-status is-model-off";
      });
  }

  refreshStatus();
})();
