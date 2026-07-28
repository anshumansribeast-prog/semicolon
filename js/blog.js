/* ===================================================================
   blog.js — the blog index: search, category filter, pagination.

   Pagination sounds complicated and isn't. If you're on page 3 with
   4 posts per page, you want items 8 to 11 — that's slice(8, 12).
   The whole feature is one slice() and some button states.
   =================================================================== */

(function () {
  "use strict";

  const list = document.getElementById("postList");
  if (!list) return;

  const { icon, escapeHtml, postCardHTML } = window.UI;

  const search   = document.getElementById("postSearch");
  const chipBox  = document.getElementById("postChips");
  const countEl  = document.getElementById("postCount");
  const emptyEl  = document.getElementById("postEmpty");
  const pagerEl  = document.getElementById("pagination");

  const PER_PAGE = CONFIG.blog.postsPerPage;
  let category = "All";
  let page = 1;
  let matches = POSTS.slice();

  /* categories derived from the posts themselves */
  const categories = ["All"].concat(
    POSTS.map(p => p.category).filter((c, i, a) => a.indexOf(c) === i)
  );

  chipBox.innerHTML = categories.map(function (c) {
    return '<button class="chip" data-cat="' + escapeHtml(c) + '" aria-pressed="' +
           (c === "All") + '">' + escapeHtml(c) + "</button>";
  }).join("");

  function refine(resetPage) {
    if (resetPage !== false) page = 1;     // a new search starts at page 1

    const q = (search.value || "").trim().toLowerCase();

    matches = POSTS.filter(function (p) {
      const haystack = (p.title + " " + p.excerpt + " " + p.category + " " +
                        p.tags.join(" ") + " " + p.author).toLowerCase();
      const okText = q === "" || haystack.indexOf(q) !== -1;
      const okCat = category === "All" || p.category === category;
      return okText && okCat;
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });   // newest first

    render();
  }

  function render() {
    const total = matches.length;
    const pages = Math.max(1, Math.ceil(total / PER_PAGE));
    if (page > pages) page = pages;

    const start = (page - 1) * PER_PAGE;
    const slice = matches.slice(start, start + PER_PAGE);

    list.innerHTML = slice.map(function (p) { return postCardHTML(p, ""); }).join("");
    emptyEl.classList.toggle("is-shown", total === 0);

    countEl.textContent = total === 0
      ? "No posts found"
      : "Showing " + (start + 1) + "–" + Math.min(start + PER_PAGE, total) +
        " of " + total + " post" + (total === 1 ? "" : "s");

    renderPager(pages);
  }

  function renderPager(pages) {
    if (pages <= 1) { pagerEl.innerHTML = ""; return; }

    let html = '<button class="page-btn" data-go="prev"' + (page === 1 ? " disabled" : "") +
               ' aria-label="Previous page">‹</button>';

    for (let i = 1; i <= pages; i++) {
      html += '<button class="page-btn" data-go="' + i + '"' +
              (i === page ? ' aria-current="true"' : "") +
              ' aria-label="Page ' + i + '">' + i + "</button>";
    }

    html += '<button class="page-btn" data-go="next"' + (page === pages ? " disabled" : "") +
            ' aria-label="Next page">›</button>';

    pagerEl.innerHTML = html;
  }

  /* ---- events ---- */
  search.addEventListener("input", function () { refine(); });

  chipBox.addEventListener("click", function (e) {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    chipBox.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
    chip.setAttribute("aria-pressed", "true");
    category = chip.dataset.cat;
    refine();
  });

  pagerEl.addEventListener("click", function (e) {
    const btn = e.target.closest(".page-btn");
    if (!btn || btn.disabled) return;

    const go = btn.dataset.go;
    if (go === "prev") page--;
    else if (go === "next") page++;
    else page = Number(go);

    render();
    // Send the reader back to the top of the list, not the top of the
    // page — they were already reading, don't make them scroll again.
    list.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  refine();
})();
