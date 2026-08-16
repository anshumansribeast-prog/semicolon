/* Shared Ada API — chat, generator, and practice all use /api/ada. */
(function (w) {
  "use strict";

  var ADA_URL = "/api/ada";
  var FAIL = "ADA couldn't complete that request. Please try again.";

  function askAda(opts) {
    var ctrl = opts.abort || new AbortController();
    var body = {
      mode: opts.mode || "chat",
      message: opts.message || "",
      history: opts.history || [],
      language: opts.language || "",
      framework: opts.framework || "",
      difficulty: opts.difficulty || "",
      output: opts.output || "",
      files: opts.files || []
    };
    return fetch(ADA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal
    }).then(function (resp) {
      return resp.json().then(function (data) {
        data = data || {};
        if (!data.reply && data.error) data.reply = FAIL;
        if (!data.reply && !(data.files && data.files.length)) data.reply = FAIL;
        data._okHttp = resp.ok;
        return data;
      }).catch(function () {
        return { reply: FAIL, ok: false };
      });
    }).catch(function (err) {
      if (err && err.name === "AbortError") {
        return { reply: "Stopped.", ok: false, aborted: true };
      }
      return { reply: FAIL, ok: false };
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* Small markdown: fences, inline code, bold, italics, line breaks. */
  function renderMarkdown(src) {
    var text = String(src || "");
    var parts = [];
    var re = /```(\w+)?\n([\s\S]*?)```/g;
    var last = 0;
    var m;
    var n = 0;
    while ((m = re.exec(text))) {
      parts.push(inlineMd(text.slice(last, m.index)));
      n += 1;
      var lang = escapeHtml(m[1] || "");
      var code = escapeHtml(m[2].replace(/\n$/, ""));
      parts.push(
        '<div class="ada-code"><div class="ada-code-bar"><span>' + (lang || "code") +
        '</span><button type="button" class="ada-copy" data-copy="' + n +
        '">Copy</button></div><pre><code class="language-' + (lang || "plaintext") +
        '" data-copy-src="' + n + '">' + code + "</code></pre></div>"
      );
      last = m.index + m[0].length;
    }
    parts.push(inlineMd(text.slice(last)));
    return parts.join("");
  }

  function inlineMd(chunk) {
    var s = escapeHtml(chunk);
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\n\n/g, "</p><p>");
    s = s.replace(/\n/g, "<br>");
    return "<p>" + s + "</p>";
  }

  w.AdaAPI = {
    ask: askAda,
    renderMarkdown: renderMarkdown,
    escapeHtml: escapeHtml,
    FAIL: FAIL,
    URL: ADA_URL
  };
})(window);
