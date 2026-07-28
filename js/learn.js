/* ===================================================================
   learn.js — the tracks page: search, filter, sort, detail modal.

   The pattern used here works for any filterable grid:
     1. keep the full list of data untouched
     2. derive a filtered copy from the current controls
     3. re-render from the filtered copy
   Never delete from the original array — you can't get it back.
   =================================================================== */

(function () {
  "use strict";

  const grid = document.getElementById("trackGrid");
  if (!grid) return;

  const { icon, escapeHtml, trackCardHTML } = window.UI;

  const search  = document.getElementById("trackSearch");
  const sortSel = document.getElementById("trackSort");
  const levelSel= document.getElementById("trackLevel");
  const chipBox = document.getElementById("trackChips");
  const countEl = document.getElementById("trackCount");
  const emptyEl = document.getElementById("trackEmpty");
  const modal   = document.getElementById("trackModal");
  const modalBody = document.getElementById("trackModalBody");

  let category = "All";
  let visible = TRACKS.slice();      // what's currently on screen

  /* ---- build the category chips from the data itself ----
     Doing it this way means adding a track in a new category
     automatically adds the chip. No second list to keep in sync. */
  const categories = ["All"].concat(
    TRACKS.map(t => t.category).filter((c, i, arr) => arr.indexOf(c) === i)
  );

  /* A category can be pre-selected from the address bar:
     learn.html?cat=Python  — that's what the nav dropdown links use.
     Only accept it if it's a real category, so a made-up value in the
     URL can't put the page into a state with nothing in it. */
  const wanted = new URLSearchParams(window.location.search).get("cat");
  if (wanted && categories.indexOf(wanted) !== -1) category = wanted;

  chipBox.innerHTML = categories.map(function (c) {
    return '<button class="chip" data-cat="' + escapeHtml(c) + '" aria-pressed="' +
           (c === category) + '">' + escapeHtml(c) + "</button>";
  }).join("");

  /* ---- filtering + sorting ---- */
  function refine() {
    const q = (search.value || "").trim().toLowerCase();
    const level = levelSel.value;

    visible = TRACKS.filter(function (t) {
      const haystack = (t.title + " " + t.blurb + " " + t.category + " " +
                        t.level + " " + t.build).toLowerCase();
      const okText  = q === "" || haystack.indexOf(q) !== -1;
      const okCat   = category === "All" || t.category === category;
      const okLevel = level === "All" || t.level === level;
      return okText && okCat && okLevel;
    });

    const sort = sortSel.value;
    visible.sort(function (a, b) {
      if (sort === "shortest") return a.hours - b.hours;
      if (sort === "longest")  return b.hours - a.hours;
      if (sort === "az")       return a.title.localeCompare(b.title);
      return a.id - b.id;                    // "recommended" = author's order
    });

    render();
  }

  function render() {
    grid.innerHTML = visible.map(function (t, i) { return trackCardHTML(t, i); }).join("");
    countEl.textContent = visible.length === TRACKS.length
      ? "Showing all " + TRACKS.length + " tracks"
      : "Showing " + visible.length + " of " + TRACKS.length + " tracks";
    emptyEl.classList.toggle("is-shown", visible.length === 0);
  }

  /* ---- the detail modal ---- */
  let lastFocused = null;

  function openModal(i) {
    const t = visible[i];
    if (!t) return;
    lastFocused = document.activeElement;

    modalBody.innerHTML =
      '<div class="track-cover" style="--c1:' + t.c1 + ';--c2:' + t.c2 +
      ';height:150px;border-radius:0"><span>' + escapeHtml(t.initials) + '</span></div>' +
      '<div class="modal-body">' +
        '<div class="tag-row" style="margin-bottom:.8rem">' +
          '<span class="tag tag--primary">' + escapeHtml(t.category) + '</span>' +
          '<span class="tag' + (t.level === "Beginner" ? " tag--success" : " tag--accent") + '">' +
            escapeHtml(t.level) + '</span>' +
          '<span class="tag">' + escapeHtml(t.price) + '</span>' +
        '</div>' +
        '<h2 id="trackModalTitle" style="margin-bottom:.4rem">' + escapeHtml(t.title) + '</h2>' +
        '<p>' + escapeHtml(t.blurb) + '</p>' +

        '<h3 style="margin-top:1.6rem">What you\'ll build</h3>' +
        '<p>' + escapeHtml(t.build) + '</p>' +

        '<h3 style="margin-top:1.6rem">By the end you can</h3>' +
        '<ul class="check-list">' +
          t.outcomes.map(function (o) {
            return "<li>" + icon("check", 17) + "<span>" + escapeHtml(o) + "</span></li>";
          }).join("") +
        '</ul>' +

        '<ul class="spec-list">' +
          row("Level", t.level) +
          row("Time needed", t.hours + " hours") +
          row("Lessons", String(t.lessons)) +
          row("Prerequisites", t.prereq) +
          row("Cost", t.price) +
        '</ul>' +

        '<div class="btn-row" style="margin-top:1.6rem">' +
          '<a class="btn btn--primary" href="contact.html">Ask about this track</a>' +
          '<button class="btn btn--ghost" data-close-modal>Close</button>' +
        '</div>' +
      '</div>';

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";     // stop the page behind scrolling
    modal.querySelector(".modal-close").focus();
  }

  function row(k, v) {
    return '<li><span class="k">' + escapeHtml(k) + '</span><span class="v">' +
           escapeHtml(v) + "</span></li>";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();        // put focus back where it was
  }

  /* ---- events ---- */
  grid.addEventListener("click", function (e) {
    const card = e.target.closest(".track-card");
    if (card) openModal(Number(card.dataset.index));
  });

  grid.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".track-card");
    if (!card) return;
    e.preventDefault();                          // stop Space scrolling the page
    openModal(Number(card.dataset.index));
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal || e.target.closest(".modal-close") || e.target.closest("[data-close-modal]")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  chipBox.addEventListener("click", function (e) {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    chipBox.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
    chip.setAttribute("aria-pressed", "true");
    category = chip.dataset.cat;
    refine();
  });

  search.addEventListener("input", refine);
  sortSel.addEventListener("change", refine);
  levelSel.addEventListener("change", refine);

  refine();
})();
