/* ===================================================================
   js/ada.js — Ada, Semicolon's tutor chat.

   Talks to /api/ada on the same host that served this page
   (ada_server.py). Same-origin, so it works when the site is opened
   through that server rather than as a raw file.
   =================================================================== */
(function () {
  const ADA_URL = "/api/ada";
  const HISTORY_LIMIT = 6; // last N messages sent as context, so replies don't explode the prompt

  const log = document.getElementById("adaLog");
  const form = document.getElementById("adaForm");
  const input = document.getElementById("adaInput");
  const sendBtn = document.getElementById("adaSend");
  if (!form) return; // not on the Ada page

  const history = [];

  function addBubble(text, kind) {
    const el = document.createElement("div");
    el.className = "ada-bubble ada-bubble--" + kind;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addBubble(text, "user");
    history.push({ role: "user", content: text });
    input.value = "";
    input.disabled = true;
    sendBtn.disabled = true;
    const thinking = addBubble("…", "bot");

    try {
      const resp = await fetch(ADA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.slice(-HISTORY_LIMIT) }),
      });
      if (!resp.ok) throw new Error("bad status " + resp.status);
      const data = await resp.json();
      thinking.textContent = data.reply || "I didn't get that — try asking again?";
      thinking.className = "ada-bubble ada-bubble--bot";
      history.push({ role: "assistant", content: data.reply || "" });
    } catch (err) {
      thinking.textContent =
        "Ada is offline right now. The tutor server isn't running — try again in a bit.";
      thinking.className = "ada-bubble ada-bubble--error";
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  });

  // Enter sends, Shift+Enter makes a new line — the usual chat convention.
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
})();
