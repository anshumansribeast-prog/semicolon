(function () {
  "use strict";
  var grid = document.getElementById("projectGrid");
  if (!grid || !window.TRACKS || !window.UI) return;
  var list = TRACKS.filter(function (t) { return t.category === "Projects"; });
  grid.innerHTML = list.map(function (t, i) {
    return UI.trackCardHTML(t, i).replace(
      'tabindex="0" role="button"',
      ""
    );
  }).join("");
  grid.addEventListener("click", function (e) {
    var card = e.target.closest(".track-card");
    if (!card) return;
    var t = list[Number(card.getAttribute("data-index"))];
    if (t) window.location.href = "lesson.html?track=" + encodeURIComponent(t.slug) + "&n=1";
  });
})();
