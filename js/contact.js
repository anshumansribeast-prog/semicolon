/* ===================================================================
   contact.js — the contact form.

   Validation happens on three events, on purpose:
     - on submit        (catches everything)
     - on blur          (tells you as you leave a field, not at the end)
     - on input, but only after a field has already failed once
       (so it can turn green again as you fix it, without shouting at
        you while you're still typing the first character)

   ⚠ IMPORTANT: this is FRONT-END validation only. It is a courtesy to
   the person filling the form, NOT a security control. Anyone can
   bypass it with the browser's dev tools in about four seconds. Real
   validation has to happen again on the server. See README.md.
   =================================================================== */

(function () {
  "use strict";

  const form = document.getElementById("contactForm");
  if (!form) return;

  const { icon, escapeHtml, toast } = window.UI;
  const msgBox = document.getElementById("contactMsg");
  const submitBtn = form.querySelector('button[type="submit"]');

  /* Each rule returns an error string, or "" when the value is fine. */
  const RULES = {
    name: function (v) {
      if (!v) return "Please tell us your name.";
      if (v.length < 2) return "That looks too short — at least 2 characters.";
      if (v.length > 80) return "Please keep it under 80 characters.";
      return "";
    },
    email: function (v) {
      if (!v) return "We need an email address to reply to.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "That doesn't look like an email address.";
      return "";
    },
    subject: function (v) {
      if (!v) return "Please choose what this is about.";
      return "";
    },
    message: function (v) {
      if (!v) return "Please write your message.";
      if (v.length < 10) return "A little more detail would help — at least 10 characters.";
      if (v.length > 2000) return "Please keep it under 2000 characters.";
      return "";
    }
  };

  const touched = {};      // which fields have already been validated once

  function fieldOf(name) { return form.querySelector("#" + name); }
  function errorOf(name) { return form.querySelector('[data-error-for="' + name + '"]'); }

  function validateField(name) {
    const input = fieldOf(name);
    const errEl = errorOf(name);
    if (!input || !RULES[name]) return true;

    const error = RULES[name](input.value.trim());

    if (error) {
      input.setAttribute("aria-invalid", "true");
      if (errEl) {
        errEl.innerHTML = icon("alert", 14) + "<span>" + escapeHtml(error) + "</span>";
        errEl.classList.add("is-shown");
      }
      return false;
    }

    input.setAttribute("aria-invalid", "false");
    if (errEl) { errEl.classList.remove("is-shown"); errEl.innerHTML = ""; }
    return true;
  }

  function validateAll() {
    // Note: .filter() then check, NOT .every() — .every() stops at the
    // first failure, so only one error message would appear.
    const results = Object.keys(RULES).map(function (n) {
      touched[n] = true;
      return validateField(n);
    });
    return results.indexOf(false) === -1;
  }

  /* ---- live feedback ---- */
  Object.keys(RULES).forEach(function (name) {
    const input = fieldOf(name);
    if (!input) return;

    input.addEventListener("blur", function () {
      touched[name] = true;
      validateField(name);
    });

    input.addEventListener("input", function () {
      if (touched[name]) validateField(name);     // only re-check after a first failure
      updateCounter();
    });
  });

  /* ---- character counter on the message ---- */
  const counter = document.getElementById("message-count");
  function updateCounter() {
    const message = fieldOf("message");
    if (!counter || !message) return;
    const n = message.value.length;
    counter.textContent = n + " / 2000";
    counter.style.color = n > 2000 ? "var(--danger)" : "var(--text-subtle)";
  }
  updateCounter();

  /* ---- submit ---- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();                 // stop the browser reloading the page

    // Honeypot: a field hidden from people but visible to simple bots.
    // If it's filled in, it was almost certainly a bot — pretend it
    // worked and quietly throw it away.
    const trap = form.querySelector("#website");
    if (trap && trap.value) {
      showMessage("success", "Thanks — your message has been received.");
      form.reset();
      return;
    }

    if (!validateAll()) {
      showMessage("error", "Please fix the highlighted fields and try again.");
      // Move focus to the first problem so keyboard users aren't lost
      const firstBad = form.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      return;
    }

    const data = {
      name:    fieldOf("name").value.trim(),
      email:   fieldOf("email").value.trim(),
      subject: fieldOf("subject").value,
      message: fieldOf("message").value.trim()
    };

    const mail = CONFIG.integrations.email;
    const notSet = !mail.to || mail.to === "your.email@example.com";

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    /* ---- mode: "mailto" — open the visitor's own email app --------
       No account and no service needed. We build a mailto: link with
       the subject and body already written, and the browser hands it
       to whatever email program they use. They press send; it arrives
       from their address, so you can just hit reply.              */
    if (mail.mode === "mailto") {
      if (notSet) {
        showMessage("error",
          "This form has no destination address yet. Open js/config.js and put a real " +
          "address in integrations.email.to — it's the only line you need to change.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Send message";
        return;
      }

      const subjectText = "[" + CONFIG.site.name + "] " + labelFor(data.subject);

      // encodeURIComponent escapes line breaks, & and ? so they survive
      // the trip through the URL. Without it the body gets truncated at
      // the first & the visitor happens to type.
      const body =
        "From: " + data.name + "\n" +
        "Email: " + data.email + "\n" +
        "Topic: " + labelFor(data.subject) + "\n\n" +
        data.message + "\n\n" +
        "— sent from " + CONFIG.site.name;

      const href = "mailto:" + encodeURIComponent(mail.to) +
                   "?subject=" + encodeURIComponent(subjectText) +
                   "&body=" + encodeURIComponent(body);

      window.location.href = href;

      showMessage("success",
        "Your email app should now be opening with the message ready to go — " +
        "press send there to deliver it. If nothing opened, you can email " +
        mail.to + " directly.");
      toast("Opening your email app…", "success");

      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
      return;
    }

    /* ---- mode: "off" — validate only, and say so ------------------ */
    if (mail.mode !== "endpoint" || !mail.endpoint) {
      setTimeout(function () {
        showMessage("success",
          "Your message passed validation — but it was not sent. No email service is " +
          "connected yet. Open README.md for the setup, or email " +
          CONFIG.contact.email + " directly.");
        console.info("Contact form payload (not sent):", data);
        toast("Validated. Email sending isn't connected yet.", "success");
        submitBtn.disabled = false;
        submitBtn.textContent = "Send message";
        form.reset();
        updateCounter();
      }, 600);
      return;
    }

    /* ---- mode: "endpoint" — a real service is configured ---------- */
    fetch(mail.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        // fetch does NOT throw on 404 or 500 — you have to check res.ok
        if (!res.ok) throw new Error("Server responded " + res.status);
        showMessage("success", "Thanks — your message is on its way. We usually reply within two days.");
        toast("Message sent.", "success");
        form.reset();
        updateCounter();
      })
      .catch(function (err) {
        console.error("Contact form failed:", err);
        showMessage("error",
          "Something went wrong sending that. Please try again, or email " +
          CONFIG.contact.email + " directly.");
        toast("Message could not be sent.", "error");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send message";
      });
  });

  /* Turn the <select> value into the human-readable text, so the email
     subject reads "I'm stuck on something" rather than "question".
     Reads it straight off the option so the two can't drift apart. */
  function labelFor(value) {
    const opt = form.querySelector('#subject option[value="' + value + '"]');
    return opt ? opt.textContent.trim() : value;
  }

  function showMessage(type, text) {
    msgBox.className = "form-msg form-msg--" + type + " is-shown";
    msgBox.innerHTML = icon(type === "error" ? "alert" : "checkCircle", 18) +
                       "<span>" + escapeHtml(text) + "</span>";
    msgBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
})();
