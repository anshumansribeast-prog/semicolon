/* Semicolon Learning API.
   The server uses an HttpOnly, same-site cookie for this browser profile.
   No account, email, or personal identity is collected by this feature.
*/
(function (window) {
  "use strict";

  var ready = null;
  var base = "/api/learning";

  function ensureSession() {
    if (ready) return ready;
    ready = fetch(base + "/session", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: "{}"
    }).then(function (response) {
      if (!response.ok) throw new Error("Learning session unavailable (" + response.status + ")");
      return response.json();
    }).catch(function (error) {
      ready = null;
      throw error;
    });
    return ready;
  }

  function request(path, method, payload) {
    return ensureSession().then(function () {
      return fetch(base + path, {
        method: method || "GET",
        credentials: "same-origin",
        headers: payload ? { "Content-Type": "application/json" } : {},
        body: payload ? JSON.stringify(payload) : undefined
      });
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) throw new Error(data.error || "Learning API error (" + response.status + ")");
        return data;
      });
    });
  }

  function getProgress() {
    return request("/progress", "GET");
  }

  function saveProgress(progress) {
    return request("/progress", "PUT", progress);
  }

  function markLesson(slug, number) {
    var lessonId = String(slug || "").toLowerCase() + "#" + Number(number);
    return getProgress().then(function (progress) {
      var completed = Array.isArray(progress.completed_lessons)
        ? progress.completed_lessons.slice() : [];
      if (completed.indexOf(lessonId) === -1) completed.push(lessonId);
      return saveProgress({
        goals: Array.isArray(progress.goals) ? progress.goals : [],
        completed_lessons: completed
      });
    });
  }

  window.SemicolonLearning = {
    ensureSession: ensureSession,
    getProgress: getProgress,
    saveProgress: saveProgress,
    markLesson: markLesson
  };
})(window);
