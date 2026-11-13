/* Student Learning Hub — dynamic course catalogue + server-backed progress. */
(function () {
  "use strict";
  var api = window.SemicolonLearning;
  var tracks = window.TRACKS || [];
  var lessons = window.LESSONS || {};
  var $ = function (id) { return document.getElementById(id); };
  if (!api) return;

  var state = { goals: [], completed_lessons: [] };
  var courseBox = $("courses");
  var goalBox = $("goals");
  var status = $("syncStatus");

  function text(el, value) { el.textContent = String(value); }
  function lessonCount(track) {
    return (lessons[track.slug] || []).length || Number(track.lessons) || 0;
  }
  function completedFor(track) {
    var list = state.completed_lessons || [];
    return list.filter(function (id) { return id.indexOf(track.slug + "#") === 0; }).length;
  }
  function nextLesson(track) {
    var list = lessons[track.slug] || [];
    var done = completedFor(track);
    return Math.min(done + 1, Math.max(list.length, 1));
  }
  function make(tag, className, content) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (content !== undefined) el.textContent = content;
    return el;
  }

  function renderCourses() {
    courseBox.replaceChildren();
    tracks.forEach(function (track) {
      var total = lessonCount(track);
      var done = completedFor(track);
      var card = make("article", "course");
      card.dataset.search = [track.title, track.blurb, track.category, track.level].join(" ").toLowerCase();
      var icon = make("div", "course-icon", track.initials || ";</>");
      var title = make("h3", "", track.title);
      var description = make("p", "", track.blurb || "Explore this learning track.");
      var progress = make("div", "course-progress");
      progress.setAttribute("role", "progressbar");
      progress.setAttribute("aria-label", track.title + " progress");
      progress.setAttribute("aria-valuemin", "0");
      progress.setAttribute("aria-valuemax", String(total || 1));
      progress.setAttribute("aria-valuenow", String(done));
      var bar = make("span");
      bar.style.width = (total ? Math.min(100, done / total * 100) : 0) + "%";
      progress.appendChild(bar);
      var meta = make("div", "course-meta", done + " of " + total + " lessons completed");
      var foot = make("div", "course-foot");
      var link = make("a", "", done >= total && total ? "Review track →" : "Continue learning →");
      link.href = "lesson.html?track=" + encodeURIComponent(track.slug) + "&n=" + nextLesson(track);
      var tag = make("span", "tag", track.level || "Open");
      foot.append(link, tag);
      card.append(icon, title, description, progress, meta, foot);
      courseBox.appendChild(card);
    });
    updateStats();
  }

  function updateStats() {
    var totalLessons = tracks.reduce(function (sum, track) { return sum + lessonCount(track); }, 0);
    var completed = state.completed_lessons.length;
    var activeGoals = state.goals.filter(function (goal) { return !goal.done; }).length;
    text($("trackCount"), tracks.length);
    text($("lessonCount"), totalLessons);
    text($("completedCount"), completed);
    text($("activeGoalCount"), activeGoals);
  }

  function renderGoals() {
    var done = state.goals.filter(function (goal) { return goal.done; }).length;
    text($("goalSummary"), done + " of " + state.goals.length + " completed");
    $("progressBar").style.width = (state.goals.length ? done / state.goals.length * 100 : 0) + "%";
    goalBox.replaceChildren();
    if (!state.goals.length) {
      goalBox.appendChild(make("p", "empty", "No goals yet. Add one above to get started."));
      updateStats();
      return;
    }
    state.goals.forEach(function (goal) {
      var row = make("label", "goal" + (goal.done ? " done" : ""));
      var checkbox = make("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!goal.done;
      checkbox.setAttribute("aria-label", "Mark " + goal.text + " complete");
      checkbox.addEventListener("change", function () {
        goal.done = checkbox.checked;
        persist();
      });
      var title = make("span", "", goal.text);
      var remove = make("button", "", "×");
      remove.type = "button";
      remove.setAttribute("aria-label", "Delete goal");
      remove.addEventListener("click", function () {
        state.goals = state.goals.filter(function (item) { return item.id !== goal.id; });
        persist();
      });
      row.append(checkbox, title, remove);
      goalBox.appendChild(row);
    });
    updateStats();
  }

  function persist() {
    text(status, "Saving progress…");
    api.saveProgress(state).then(function (saved) {
      state = saved;
      text(status, "Synced to this browser profile");
      renderGoals();
      renderCourses();
    }).catch(function () {
      text(status, "Could not sync. Your changes may not be saved.");
    });
  }

  $("goalForm").addEventListener("submit", function (event) {
    event.preventDefault();
    var input = $("goalInput");
    var value = input.value.trim();
    if (!value) return;
    state.goals.push({
      id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : "goal-" + Date.now() + "-" + Math.random().toString(36).slice(2),
      text: value.slice(0, 90),
      done: false,
      created_at: Math.floor(Date.now() / 1000)
    });
    input.value = "";
    persist();
  });

  $("courseSearch").addEventListener("input", function (event) {
    var query = event.target.value.toLowerCase().trim();
    courseBox.querySelectorAll(".course").forEach(function (card) {
      card.hidden = !card.dataset.search.includes(query);
    });
  });

  var date = new Date();
  text($("today"), date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }));

  api.getProgress().then(function (saved) {
    state = saved;
    // One-time migration of the previous browser-only checklist.
    try {
      var legacy = JSON.parse(localStorage.getItem("semicolon.learningHub.goals.v1") || "[]");
      if (!state.goals.length && Array.isArray(legacy) && legacy.length) {
        state.goals = legacy.slice(0, 100).map(function (goal, index) {
          return {
            id: "migrated-" + index + "-" + Date.now(),
            text: String(goal.text || "").slice(0, 90),
            done: !!goal.done,
            created_at: Math.floor(Number(goal.createdAt || Date.now()) / 1000)
          };
        });
        return api.saveProgress(state).then(function (migrated) {
          state = migrated;
          localStorage.removeItem("semicolon.learningHub.goals.v1");
        });
      }
    } catch (_) {}
  }).then(function () {
    text(status, "Synced to this browser profile");
    renderGoals();
    renderCourses();
  }).catch(function () {
    text(status, "Learning sync is unavailable right now");
    renderGoals();
    renderCourses();
  });
})();
