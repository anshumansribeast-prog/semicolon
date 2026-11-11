/* ===================================================================
   js/screen-studio.js — Ada's Interactive Screen Demonstration Engine
   Simulates a live computer screen with typing, line-by-line execution,
   synchronized Ada narration, and terminal output.
   =================================================================== */

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.AdaScreenStudio = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Lightweight syntax highlighter for screen demonstration
  function highlightCode(code, lang) {
    var escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Comments
    escaped = escaped.replace(/(#.*$|\/\/.*$)/gm, '<span class="studio-comment">$1</span>');

    // Strings
    escaped = escaped.replace(/(["'`].*?["'`])/g, '<span class="studio-string">$1</span>');

    // Keywords
    var keywords = [
      "def", "return", "if", "elif", "else", "for", "while", "in", "import", "from",
      "as", "class", "try", "except", "with", "const", "let", "var", "function", "async", "await"
    ];
    var kwRegex = new RegExp("\\b(" + keywords.join("|") + ")\\b", "g");
    escaped = escaped.replace(kwRegex, '<span class="studio-keyword">$1</span>');

    // Builtins
    var builtins = ["print", "input", "range", "len", "console", "log", "document", "querySelector", "Math"];
    var biRegex = new RegExp("\\b(" + builtins.join("|") + ")\\b", "g");
    escaped = escaped.replace(biRegex, '<span class="studio-builtin">$1</span>');

    // Numbers
    escaped = escaped.replace(/\b(\d+)\b/g, '<span class="studio-number">$1</span>');

    return escaped;
  }

  function AdaScreenStudio(container, options) {
    this.container = typeof container === "string" ? document.querySelector(container) : container;
    this.options = options || {};
    this.demo = null;
    this.currentStep = 0;
    this.isPlaying = false;
    this.timer = null;
    this.speed = 1.0; // 0.5, 1.0, 1.5, 2.0
    this.elements = {};

    if (this.options.demo) {
      this.load(this.options.demo);
    }
  }

  AdaScreenStudio.prototype.load = function (demo) {
    this.stop();
    this.demo = demo;
    this.currentStep = 0;
    this.render();
    this.updateStep(0);
  };

  AdaScreenStudio.prototype.render = function () {
    if (!this.container) return;
    var demo = this.demo || {};
    var filename = demo.filename || (demo.lang === "html" ? "index.html" : "main.py");
    var langTag = (demo.lang || "python").toUpperCase();

    var codeLines = (demo.code || "").split("\n");
    var linesHtml = codeLines.map(function (line, idx) {
      var highlighted = highlightCode(line, demo.lang || "python");
      return (
        '<div class="studio-line" data-line="' + (idx + 1) + '">' +
          '<span class="studio-line-number">' + (idx + 1) + '</span>' +
          '<span class="studio-code-text">' + (highlighted || "&nbsp;") + '</span>' +
        '</div>'
      );
    }).join("");

    this.container.innerHTML =
      '<div class="screen-studio">' +
        '<!-- Chrome Header -->' +
        '<div class="studio-titlebar">' +
          '<div class="studio-dots">' +
            '<span class="studio-dot studio-dot--red"></span>' +
            '<span class="studio-dot studio-dot--yellow"></span>' +
            '<span class="studio-dot studio-dot--green"></span>' +
          '</div>' +
          '<div class="studio-tab-bar">' +
            '<span class="studio-tab">📄 ' + filename + '</span>' +
            '<span class="studio-tab" style="opacity:0.65">' + langTag + '</span>' +
          '</div>' +
          '<div>' +
            '<span class="studio-badge studio-badge--live">LIVE DEMO</span>' +
          '</div>' +
        '</div>' +

        '<!-- Synchronized Ada Narration -->' +
        '<div class="studio-narration">' +
          '<div class="studio-ada-avatar">Ada</div>' +
          '<div class="studio-narration-body">' +
            '<div class="studio-narration-title">Ada\'s Explanation</div>' +
            '<div class="studio-narration-text" id="studioNarrationText">Initializing demonstration...</div>' +
          '</div>' +
        '</div>' +

        '<!-- Progress Scrubber -->' +
        '<div class="studio-progress-wrap" title="Execution progress">' +
          '<div class="studio-progress-bar" id="studioProgressBar"></div>' +
        '</div>' +

        '<!-- Main Split Workspace -->' +
        '<div class="studio-workspace studio-workspace--split">' +
          '<div class="studio-editor" id="studioEditor">' +
            linesHtml +
          '</div>' +
          '<div class="studio-terminal">' +
            '<div class="studio-term-head">' +
              '<span>' + (demo.lang === "html" ? "Browser Preview" : "Terminal — Output") + '</span>' +
              '<span class="studio-term-prompt">$ python ' + filename + '</span>' +
            '</div>' +
            '<div class="studio-term-output" id="studioTermOutput"></div>' +
            '<div class="studio-vars" id="studioVars"></div>' +
          '</div>' +
        '</div>' +

        '<!-- Control Bar -->' +
        '<div class="studio-controls">' +
          '<div class="studio-ctrl-group">' +
            '<button type="button" class="studio-btn studio-btn--primary" id="studioPlayBtn">▶ Play</button>' +
            '<button type="button" class="studio-btn" id="studioPrevBtn" title="Previous step">⏮ Step</button>' +
            '<button type="button" class="studio-btn" id="studioNextBtn" title="Next step">⏭ Step</button>' +
            '<button type="button" class="studio-btn" id="studioReplayBtn" title="Replay from start">↺ Replay</button>' +
          '</div>' +
          '<div class="studio-ctrl-group">' +
            '<label style="font-size:0.75rem; color:#8b949e">Speed:</label>' +
            '<select class="studio-speed-select" id="studioSpeedSelect">' +
              '<option value="0.75">0.75x</option>' +
              '<option value="1.0" selected>1.0x</option>' +
              '<option value="1.5">1.5x</option>' +
              '<option value="2.0">2.0x</option>' +
            '</select>' +
            '<button type="button" class="studio-btn" id="studioPlaygroundBtn" style="color:#38bdf8; border-color:rgba(56,189,248,0.3)">' +
              '🚀 Try in Playground' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    this.bindEvents();
  };

  AdaScreenStudio.prototype.bindEvents = function () {
    var self = this;
    var c = this.container;

    var playBtn = c.querySelector("#studioPlayBtn");
    var prevBtn = c.querySelector("#studioPrevBtn");
    var nextBtn = c.querySelector("#studioNextBtn");
    var replayBtn = c.querySelector("#studioReplayBtn");
    var speedSelect = c.querySelector("#studioSpeedSelect");
    var playgroundBtn = c.querySelector("#studioPlaygroundBtn");

    if (playBtn) playBtn.addEventListener("click", function () { self.togglePlay(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { self.prevStep(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { self.nextStep(); });
    if (replayBtn) replayBtn.addEventListener("click", function () { self.replay(); });
    if (speedSelect) speedSelect.addEventListener("change", function (e) {
      self.speed = parseFloat(e.target.value) || 1.0;
    });

    if (playgroundBtn) {
      playgroundBtn.addEventListener("click", function () {
        if (!self.demo || !self.demo.code) return;
        try {
          sessionStorage.setItem("semicolon_playground_code", self.demo.code);
          sessionStorage.setItem("semicolon_playground_lang", self.demo.lang || "python");
        } catch (e) {}
        window.location.href = "playground.html?code=" + encodeURIComponent(self.demo.code);
      });
    }
  };

  AdaScreenStudio.prototype.updateStep = function (stepIdx) {
    if (!this.demo) return;
    var steps = this.demo.steps || [];
    if (steps.length === 0) return;

    if (stepIdx < 0) stepIdx = 0;
    if (stepIdx >= steps.length) {
      this.pause();
      stepIdx = steps.length - 1;
    }
    this.currentStep = stepIdx;
    var current = steps[stepIdx] || {};

    // 1. Highlight line in editor
    var lineEls = this.container.querySelectorAll(".studio-line");
    lineEls.forEach(function (el) {
      el.classList.remove("is-active");
    });
    if (current.line) {
      var targetLine = this.container.querySelector('.studio-line[data-line="' + current.line + '"]');
      if (targetLine) {
        targetLine.classList.add("is-active");
        targetLine.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }

    // 2. Narration text
    var narrationEl = this.container.querySelector("#studioNarrationText");
    if (narrationEl) {
      narrationEl.textContent = current.narration || (this.demo.title + " (Step " + (stepIdx + 1) + ")");
    }

    // 3. Terminal Output cumulative up to this step
    var termEl = this.container.querySelector("#studioTermOutput");
    if (termEl) {
      var outputText = "";
      for (var i = 0; i <= stepIdx; i++) {
        if (steps[i].output) {
          outputText += steps[i].output + "\n";
        }
      }
      termEl.textContent = outputText.trim() || "(Running script...)";
      termEl.scrollTop = termEl.scrollHeight;
    }

    // 4. Variables state watcher
    var varsEl = this.container.querySelector("#studioVars");
    if (varsEl) {
      var vars = current.vars || {};
      var keys = Object.keys(vars);
      if (keys.length > 0) {
        varsEl.innerHTML = keys.map(function (k) {
          return '<span class="studio-var-pill"><strong>' + k + '</strong> = ' + vars[k] + '</span>';
        }).join(" ");
        varsEl.style.display = "flex";
      } else {
        varsEl.style.display = "none";
      }
    }

    // 5. Scrubber bar
    var progressEl = this.container.querySelector("#studioProgressBar");
    if (progressEl) {
      var pct = steps.length > 1 ? ((stepIdx) / (steps.length - 1)) * 100 : 100;
      progressEl.style.width = pct + "%";
    }
  };

  AdaScreenStudio.prototype.play = function () {
    var self = this;
    if (!this.demo || !this.demo.steps || this.demo.steps.length === 0) return;
    this.isPlaying = true;
    var playBtn = this.container.querySelector("#studioPlayBtn");
    if (playBtn) playBtn.textContent = "⏸ Pause";

    if (this.currentStep >= this.demo.steps.length - 1) {
      this.currentStep = 0;
    }

    function scheduleNext() {
      if (!self.isPlaying) return;
      var delay = 2200 / self.speed;
      self.timer = setTimeout(function () {
        if (!self.isPlaying) return;
        if (self.currentStep < self.demo.steps.length - 1) {
          self.updateStep(self.currentStep + 1);
          scheduleNext();
        } else {
          self.pause();
        }
      }, delay);
    }

    this.updateStep(this.currentStep);
    scheduleNext();
  };

  AdaScreenStudio.prototype.pause = function () {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    var playBtn = this.container.querySelector("#studioPlayBtn");
    if (playBtn) playBtn.textContent = "▶ Play";
  };

  AdaScreenStudio.prototype.togglePlay = function () {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  };

  AdaScreenStudio.prototype.stop = function () {
    this.pause();
    this.currentStep = 0;
  };

  AdaScreenStudio.prototype.nextStep = function () {
    this.pause();
    if (this.demo && this.demo.steps && this.currentStep < this.demo.steps.length - 1) {
      this.updateStep(this.currentStep + 1);
    }
  };

  AdaScreenStudio.prototype.prevStep = function () {
    this.pause();
    if (this.currentStep > 0) {
      this.updateStep(this.currentStep - 1);
    }
  };

  AdaScreenStudio.prototype.replay = function () {
    this.stop();
    this.updateStep(0);
    this.play();
  };

  // Turn any custom raw code snippet into an interactive demonstration
  AdaScreenStudio.fromCode = function (code, title, lang) {
    lang = lang || "python";
    var lines = code.trim().split("\n");
    var steps = [];

    lines.forEach(function (line, idx) {
      var trimmed = line.trim();
      var narration = "Executing line " + (idx + 1) + ": " + trimmed;
      var output = "";
      var vars = {};

      if (trimmed.startsWith("print(")) {
        var inside = trimmed.substring(6, trimmed.length - 1);
        narration = "Printing output to the terminal: " + inside;
        output = inside.replace(/['"]/g, "");
      } else if (trimmed.includes(" = ")) {
        var parts = trimmed.split(" = ");
        narration = "Storing value in variable '" + parts[0].trim() + "'";
        vars[parts[0].trim()] = parts[1].trim();
      } else if (trimmed.startsWith("for ") || trimmed.startsWith("while ")) {
        narration = "Beginning loop condition: " + trimmed;
      } else if (trimmed.startsWith("def ")) {
        narration = "Defining a reusable function";
      }

      steps.push({
        line: idx + 1,
        narration: narration,
        output: output,
        vars: vars
      });
    });

    return {
      title: title || "Code Walkthrough",
      filename: lang === "html" ? "index.html" : "main.py",
      lang: lang,
      code: code,
      steps: steps
    };
  };

  return AdaScreenStudio;
});
