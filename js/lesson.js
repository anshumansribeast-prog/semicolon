/* ===================================================================
   lesson.js — renders one lesson from one track.

   The whole page is driven by the address bar:

     lesson.html?track=first-program&n=2

   That matters more than it looks. Because the state lives in the URL
   rather than in a variable, every lesson has its own link that can be
   bookmarked, shared, or opened in a new tab. If we had stored "which
   lesson" in a JavaScript variable instead, every lesson would share
   one address and none of that would work.

   The same trick runs post.html, with ?slug=.
   =================================================================== */

(function () {
  "use strict";

  var bodyEl = document.getElementById("lessonBody");
  if (!bodyEl) return;                    // not the lesson page

  var params = new URLSearchParams(window.location.search);
  var slug = params.get("track");
  var n = parseInt(params.get("n"), 10);
  if (isNaN(n) || n < 1) n = 1;

  var track = (window.TRACKS || TRACKS).filter(function (t) { return t.slug === slug; })[0];
  var lessons = (window.LESSONS || LESSONS)[slug];

  /* ---- nothing to show: say so usefully, don't render a blank page ---- */
  if (!track || !lessons || !lessons.length) {
    document.getElementById("lessonTitle").textContent = "Lesson not found";
    document.getElementById("lessonMeta").textContent =
      "That track doesn't exist, or its lessons haven't been written yet.";
    bodyEl.innerHTML =
      '<p>Pick a track from the <a href="learn.html">Learn page</a> and start from ' +
      'lesson one.</p>';
    document.getElementById("prevLesson").style.display = "none";
    document.getElementById("nextLesson").style.display = "none";
    return;
  }

  /* Asking for lesson 99 of a 3-lesson track should land on 3, not break. */
  if (n > lessons.length) n = lessons.length;

  var lesson = lessons[n - 1];

  /* ---- header ---- */
  document.title = lesson.title + " — " + track.title + " — Semicolon";
  document.getElementById("crumbTrack").textContent = track.title;
  document.getElementById("lessonEyebrow").textContent =
    track.title + " · Lesson " + n + " of " + lessons.length;
  document.getElementById("lessonTitle").textContent = lesson.title;
  document.getElementById("lessonMeta").textContent =
    lesson.minutes + " min read · " + track.level + " · " + track.category;

  /* ---- the lesson ----

     This is trusted content that we wrote ourselves in lessons.js, so
     innerHTML is correct here. It would NOT be safe for anything a
     visitor typed — that has to be escaped first, or a comment box
     becomes a way to run scripts on everyone else's browser.          */
  bodyEl.innerHTML = lesson.body;

  /* ---- the list of lessons in this track ---- */
  var listEl = document.getElementById("lessonList");
  lessons.forEach(function (l, i) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "lesson.html?track=" + encodeURIComponent(slug) + "&n=" + (i + 1);
    a.textContent = l.title;
    if (i + 1 === n) {
      li.className = "is-current";
      a.setAttribute("aria-current", "true");
    }
    li.appendChild(a);
    listEl.appendChild(li);
  });

  /* ---- previous / next ---- */
  var prev = document.getElementById("prevLesson");
  var next = document.getElementById("nextLesson");

  document.getElementById("lessonCounter").textContent = n + " / " + lessons.length;

  if (n > 1) {
    prev.href = "lesson.html?track=" + encodeURIComponent(slug) + "&n=" + (n - 1);
  } else {
    prev.href = "learn.html";
    prev.textContent = "← Back to tracks";
  }

  if (n < lessons.length) {
    next.href = "lesson.html?track=" + encodeURIComponent(slug) + "&n=" + (n + 1);
  } else {
    next.href = "playground.html";
    next.textContent = "Track finished — go practise →";
  }

  /* ---- remember where they got to ----

     Purely a convenience: the Learn page can show "resume". Wrapped in
     try/catch because private browsing blocks localStorage, and a
     lesson that refuses to display because it could not save a
     bookmark would be a ridiculous failure.                            */
  try {
    var seen = JSON.parse(localStorage.getItem("semicolon_progress") || "{}");
    if (!seen[slug] || seen[slug] < n) seen[slug] = n;
    localStorage.setItem("semicolon_progress", JSON.stringify(seen));
  } catch (e) { /* fine */ }
})();
