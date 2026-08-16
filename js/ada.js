/* ===================================================================
   js/ada.js — Ada, Semicolon's tutor chat.

   Talks to /api/ada on the same host that served this page
   (ada_server.py). Same-origin, so it works when the site is opened
   through that server rather than as a raw file.
   =================================================================== */
(function () {
  const ADA_URL = "/api/ada";
  const HISTORY_LIMIT = 6;

  const log = document.getElementById("adaLog");
  const form = document.getElementById("adaForm");
  const input = document.getElementById("adaInput");
  const sendBtn = document.getElementById("adaSend");
  const chips = document.getElementById("adaChips");
  const statusEl = document.getElementById("adaStatus");
  if (!form) return;

  const history = [];

  const SUGGESTIONS = [
    "What is a variable?",
    "How do loops work?",
    "How do I read an error?",
    "Python or JavaScript?",
    "What is a Caesar cipher?",
    "How do I use Git?",
  ];

  function addBubble(text, kind) {
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
    el.textContent = text;
    row.appendChild(el);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  async function send(text) {
    if (!text) return;
    addBubble(text, "user");
    history.push({ role: "user", content: text });
    input.value = "";
    input.disabled = true;
    sendBtn.disabled = true;
    const thinking = addBubble("…", "bot");
    thinking.classList.add("is-thinking");

    try {
      const resp = await fetch(ADA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.slice(-HISTORY_LIMIT) }),
      });
      const data = await resp.json().catch(function () { return {}; });
      thinking.classList.remove("is-thinking");
      if (!resp.ok) {
        thinking.textContent = data.reply || data.error ||
          "Ada is offline right now. The tutor server isn't running — try again in a bit.";
        thinking.className = "ada-bubble ada-bubble--" + (data.reply ? "bot" : "error");
        if (data.reply) history.push({ role: "assistant", content: data.reply });
        return;
      }
      thinking.textContent = data.reply || "I didn't get that — try asking again?";
      thinking.className = "ada-bubble ada-bubble--bot";
      history.push({ role: "assistant", content: data.reply || "" });
    } catch (err) {
      thinking.classList.remove("is-thinking");
      thinking.textContent =
        "Ada is offline right now. The tutor server isn't running — try again in a bit.";
      thinking.className = "ada-bubble ada-bubble--error";
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
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

  fetch(ADA_URL).then(function (r) { return r.json(); }).then(function (data) {
    if (!statusEl || !data) return;
    const notes = data.notes ? data.notes + " notes" : "notes";
    if (data.ollama) {
      statusEl.textContent = notes + " · model ready";
      statusEl.classList.remove("is-model-off");
    } else {
      statusEl.textContent = notes + " · model offline, notes still work";
      statusEl.classList.add("is-model-off");
    }
  }).catch(function () {
    if (statusEl) {
      statusEl.textContent = "Could not reach Ada — refresh in a moment";
      statusEl.classList.add("is-model-off");
    }
  });
})();
