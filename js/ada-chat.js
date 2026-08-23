/* Ada chat — a tutor conversation, nothing more.

   The project generator was removed: Ada explains, debugs and teaches
   instead of writing whole websites. Code blocks in answers still get
   copy buttons; they just stay as code blocks. Nothing here needs a
   backend beyond /api/ada. */
(function () {
  "use strict";

  var api = window.AdaAPI;
  var log = document.getElementById("adaLog");
  var form = document.getElementById("adaForm");
  var input = document.getElementById("adaInput");
  var sendBtn = document.getElementById("adaSend");
  var stopBtn = document.getElementById("adaStop");
  var clearBtn = document.getElementById("adaClear");
  var statusEl = document.getElementById("adaStatus");

  if (!log || !form || !input) return;

  var history = [];
  var controller = null;

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

  function setBusy(on) {
    sendBtn.disabled = on;
    stopBtn.hidden = !on;
  }

  function send(message) {
    if (!message.trim()) return;
    bubble("user", api.escapeHtml(message));
    input.value = "";
    setBusy(true);
    stopBtn.disabled = false;
    var thinking = bubble("bot", "<em>Ada is thinking…</em>");
    thinking.classList.add("is-thinking");

    controller = new AbortController();
    api.ask({
      abort: controller,
      mode: "chat",
      message: message,
      history: history.slice(-30)
    }).then(function (data) {
      thinking.classList.remove("is-thinking");
      var reply = data.reply || api.FAIL;
      thinking.innerHTML = api.renderMarkdown(reply);
      addCopyHandlers(thinking);
      if (!data.aborted) {
        history.push({ role: "user", content: message });
        history.push({ role: "assistant", content: reply });
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
  clearBtn.addEventListener("click", function () {
    history = [];
    log.innerHTML = "";
    bubble("bot", "Cleared. What are we looking at next?");
    input.focus();
  });

  document.querySelectorAll("[data-ada-prompt]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      input.value = btn.getAttribute("data-ada-prompt");
      form.requestSubmit();
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
