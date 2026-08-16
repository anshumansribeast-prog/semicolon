/* ===================================================================
   js/concepts.js — filter the coding concepts guide.
   =================================================================== */
(function () {
  "use strict";

  const grid = document.getElementById("conceptGrid");
  if (!grid || !window.CONCEPTS) return;

  const search = document.getElementById("conceptSearch");
  const chips = document.getElementById("conceptChips");
  const countEl = document.getElementById("conceptCount");
  const emptyEl = document.getElementById("conceptEmpty");
  const { escapeHtml } = window.UI;

  let category = "All";
  const cats = ["All"].concat(
    CONCEPTS.map(function (c) { return c.cat; }).filter(function (c, i, a) {
      return a.indexOf(c) === i;
    })
  );

  chips.innerHTML = cats.map(function (c) {
    return '<button class="chip" data-cat="' + escapeHtml(c) + '" aria-pressed="' +
           (c === "All") + '">' + escapeHtml(c) + "</button>";
  }).join("");

  function card(c) {
    return '' +
      '<article class="concept-card" id="' + escapeHtml(c.id) + '">' +
        '<span class="tag">' + escapeHtml(c.cat) + "</span>" +
        "<h3>" + escapeHtml(c.title) + "</h3>" +
        '<p class="lede-sm">' + escapeHtml(c.blurb) + "</p>" +
        '<p class="concept-more">' + escapeHtml(c.more) + "</p>" +
        (c.example ? "<pre><code>" + escapeHtml(c.example) + "</code></pre>" : "") +
        (c.link ? '<a href="' + escapeHtml(c.link) + '">Go deeper →</a>' : "") +
      "</article>";
  }

  function refine() {
    const q = (search.value || "").trim().toLowerCase();
    const matches = CONCEPTS.filter(function (c) {
      const hay = (c.title + " " + c.blurb + " " + c.more + " " + c.cat + " " + (c.example || "")).toLowerCase();
      const okText = !q || hay.indexOf(q) !== -1;
      const okCat = category === "All" || c.cat === category;
      return okText && okCat;
    });
    grid.innerHTML = matches.map(card).join("");
    emptyEl.classList.toggle("is-shown", matches.length === 0);
    countEl.textContent = matches.length + " concept" + (matches.length === 1 ? "" : "s");
  }

  chips.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    category = btn.getAttribute("data-cat");
    chips.querySelectorAll(".chip").forEach(function (el) {
      el.setAttribute("aria-pressed", el === btn ? "true" : "false");
    });
    refine();
  });

  search.addEventListener("input", refine);
  refine();
})();
