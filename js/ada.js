/* ===================================================================
   js/ada.js — Ada chat on Semicolon.
   =================================================================== */
(function () {
  const api = window.AdaAPI;
  if (!api) return;

  const log = document.getElementById("adaLog");
  const form = document.getElementById("adaForm");
  const input = document.getElementById("adaInput");
  const sendBtn = document.getElementById("adaSend");
  const stopBtn = document.getElementById("adaStop");
  const clearBtn = document.getElementById("adaClear");
  const regenBtn = document.getElementById("adaRegen");
  const chips = document.getElementById("adaChips");
  const statusEl = document.getElementById("adaStatus");
  if (!form) return;

  const HISTORY_LIMIT = 20;
  const STORE = "semicolon-ada-chat";
  const history = [];
  let lastUser = "";
  let abort = null;

  const SUGGESTIONS = [
    "Write a Python function that scores a cricket innings",
    "Make a bakery homepage in HTML",
    "Explain black holes like I'm 15, then show a tiny sim in JS",
    "Debug this: print('hi'",
    "Plan a study timetable, then turn it into a page"
  ];

  function addRow(kind) {
    const row = document.createElement("div");
    row.className = "ada-row ada-row--" + (kind === "user" ? "user" : "bot");
    if (kind !== "user") {
      const mini = document.createElement("div");
      mini.className = "ada-mini";
      mini.setAttribute("aria-hidden", "true");
      mini.textContent = "A";
      row.appendChild(mini);
    }
    const el = document.createElement("div");
    el.className = "ada-bubble ada-bubble--" + kind;
    row.appendChild(el);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function wireCopy(root) {
    root.querySelectorAll(".ada-copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-copy");
        const code = root.querySelector('code[data-copy-src="' + id + '"]');
        if (!code) return;
        navigator.clipboard.writeText(code.textContent || "").then(function () {
          btn.textContent = "Copied";
          setTimeout(function () { btn.textContent = "Copy"; }, 1200);
        });
      });
    });
  }

  function setBusy(on) {
    input.disabled = on;
    sendBtn.disabled = on;
    if (stopBtn) stopBtn.hidden = !on;
    if (regenBtn) regenBtn.disabled = on || !lastUser;
  }

  async function send(text, asFollowup) {
    if (!text) return;
    lastUser = text;
    if (!asFollowup) {
      const userEl = addRow("user");
      userEl.textContent = text;
      history.push({ role: "user", content: text });
    }
    input.value = "";
    setBusy(true);
    const thinking = addRow("bot");
    thinking.classList.add("is-thinking");
    thinking.textContent = "Ada is writing…";
    abort = new AbortController();

    const data = await api.ask({
      mode: "chat",
      message: text,
      history: history.slice(-HISTORY_LIMIT),
      abort: abort
    });
    abort = null;
    thinking.classList.remove("is-thinking");
    if (data.aborted) {
      thinking.textContent = "Stopped.";
      setBusy(false);
      input.focus();
      return;
    }
    if (!data._okHttp && data.source === "error") {
      thinking.className = "ada-bubble ada-bubble--error";
      thinking.textContent = data.reply || api.FAIL;
      setBusy(false);
      input.focus();
      return;
    }
    thinking.innerHTML = api.renderMarkdown(data.reply || api.FAIL);
    wireCopy(thinking);
    if (window.hljs) {
      thinking.querySelectorAll("pre code").forEach(function (el) {
        window.hljs.highlightElement(el);
      });
    }
    history.push({ role: "assistant", content: data.reply || "" });
    try { localStorage.setItem(STORE, JSON.stringify(history.slice(-HISTORY_LIMIT))); } catch (e) {}
    setBusy(false);
    input.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    send(input.value.trim());
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  if (stopBtn) {
    stopBtn.addEventListener("click", function () {
      if (abort) abort.abort();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      history.length = 0;
      lastUser = "";
      log.innerHTML = "";
      try { localStorage.removeItem(STORE); } catch (e) {}
      const el = addRow("bot");
      el.textContent = "New chat. Ask anything — code, a project on any topic, or a normal question.";
      if (regenBtn) regenBtn.disabled = true;
    });
  }

  if (regenBtn) {
    regenBtn.disabled = true;
    regenBtn.addEventListener("click", function () {
      if (!lastUser) return;
      if (history.length && history[history.length - 1].role === "assistant") history.pop();
      send(lastUser, true);
    });
  }

  if (chips) {
    SUGGESTIONS.forEach(function (s) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ada-chip";
      b.textContent = s;
      b.addEventListener("click", function () { send(s); });
      chips.appendChild(b);
    });
  }

  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || "[]");
    if (Array.isArray(saved) && saved.length) {
      log.innerHTML = "";
      saved.forEach(function (turn) {
        if (!turn || !turn.content) return;
        history.push({ role: turn.role === "assistant" ? "assistant" : "user", content: turn.content });
        const el = addRow(turn.role === "assistant" ? "bot" : "user");
        if (turn.role === "assistant") {
          el.innerHTML = api.renderMarkdown(turn.content);
          wireCopy(el);
        } else {
          el.textContent = turn.content;
          lastUser = turn.content;
        }
      });
      if (regenBtn && lastUser) regenBtn.disabled = false;
    }
  } catch (e) {}

  fetch(api.URL).then(function (r) { return r.json(); }).then(function (data) {
    if (!statusEl || !data) return;
    const bits = [];
    if (data.api) bits.push("API ready");
    else if (data.ollama) bits.push("model ready");
    else bits.push("notes ready — live model still connecting");
    statusEl.textContent = bits.join(" · ");
    statusEl.classList.toggle("is-model-off", !data.ollama && !data.api);
  }).catch(function () {
    if (statusEl) {
      statusEl.textContent = "Could not reach Ada";
      statusEl.classList.add("is-model-off");
    }
  });
})();
