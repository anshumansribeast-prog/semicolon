/* ===================================================================
   components/ui.js — reusable pieces used by more than one page.

   Contains: the icon set, escaping helpers, date formatting, toasts,
   and the renderers for cards that appear on several pages.

   Everything here is deliberately dependency-free. No jQuery, no
   FontAwesome, no CDN — which is why the site works with no internet.
   =================================================================== */

/* ---------- ICONS ---------------------------------------------------
   Inline SVG rather than an icon font. Icon fonts need a network
   request and read as gibberish to screen readers; inline SVG is
   instant, styleable with `color`, and can carry a label.          */
const ICON_PATHS = {
  search:    '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  sun:       '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:      '<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>',
  menu:      '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close:     '<path d="M18 6L6 18M6 6l12 12"/>',
  arrowUp:   '<path d="M12 19V5M5 12l7-7 7 7"/>',
  arrowRight:'<path d="M5 12h14M12 5l7 7-7 7"/>',
  chevron:   '<path d="M6 9l6 6 6-6"/>',
  check:     '<path d="M20 6L9 17l-5-5"/>',
  checkCircle:'<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>',
  alert:     '<circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16.5v.01"/>',
  clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  book:      '<path d="M4 5a2 2 0 012-2h13v18H6a2 2 0 01-2-2z"/><path d="M8 3v18"/>',
  layers:    '<path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 17l9 5 9-5M3 12l9 5 9-5"/>',
  code:      '<path d="M8 6l-6 6 6 6M16 6l6 6-6 6"/>',
  terminal:  '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 9l3 3-3 3M13 15h5"/>',
  compass:   '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  shield:    '<path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/>',
  wifiOff:   '<path d="M2 2l20 20"/><path d="M8.5 16.5a5 5 0 017 0"/><path d="M5 12.5a10 10 0 013.5-2.3M19 12.5a10 10 0 00-6-2.4"/><path d="M2 8.8a15 15 0 014.6-2.8M21.9 8.8a15 15 0 00-8.4-3.7"/><path d="M12 20h.01"/>',
  mail:      '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/>',
  phone:     '<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.4 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.4 1.8.6 2.8.7a2 2 0 011.7 2z"/>',
  mapPin:    '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/>',
  github:    '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 00-1-2.6c3.1-.3 6.4-1.5 6.4-7A5.4 5.4 0 0020 4.8 5 5 0 0019.9 1S18.7.6 16 2.5a13.4 13.4 0 00-7 0C6.3.6 5.1 1 5.1 1A5 5 0 005 4.8a5.4 5.4 0 00-1.4 3.8c0 5.4 3.3 6.6 6.4 7a3.4 3.4 0 00-1 2.6V22"/>',
  youtube:   '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z"/>',
  discord:   '<path d="M8 12h.01M16 12h.01"/><path d="M7.5 6.5A16 16 0 0112 6a16 16 0 014.5.5c2 3 3 6 2.7 10a13 13 0 01-4 1.8l-.9-1.5a9 9 0 004.4-2.3M5 16a13 13 0 004 1.8l.9-1.5a9 9 0 01-4.4-2.3"/>',
  link:      '<path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7L12.2 19"/>',
  share:     '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  users:     '<path d="M16 20v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 20v-2a4 4 0 00-3-3.9"/><path d="M16 3.1a4 4 0 010 7.8"/>',
  inbox:     '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.4 5.1L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.4-6.9A2 2 0 0016.8 4H7.2a2 2 0 00-1.8 1.1z"/>'
};

function icon(name, size) {
  const d = ICON_PATHS[name];
  if (!d) return "";
  const s = size || 20;
  return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" ' +
         'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
         'stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + '</svg>';
}

/* ---------- SECURITY: escaping ---------------------------------------
   Any text that came from a user must be escaped before it goes near
   innerHTML. Otherwise someone can type <script>…</script> into a
   comment box and it will RUN for everyone who reads that page.
   That attack is called XSS (cross-site scripting).

   Rule of thumb: use textContent for user data wherever you can, and
   escapeHtml() when you genuinely need to build a string of HTML.   */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ---------- FORMATTING ----------------------------------------------- */
function formatDate(iso) {
  // Split the string rather than passing it to new Date(), because
  // new Date("2026-07-18") is read as UTC and can show the day before
  // in western time zones. A classic, very annoying JavaScript trap.
  const p = String(iso).split("-");
  const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function initials(name) {
  return String(name).trim().split(/\s+/).slice(0, 2)
    .map(w => w[0]).join("").toUpperCase();
}

/* ---------- TOASTS ---------------------------------------------------- */
function toast(message, type) {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    // A live region so screen readers announce the message too —
    // otherwise the toast only exists for people who can see it.
    stack.setAttribute("role", "status");
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
  }

  const el = document.createElement("div");
  el.className = "toast" + (type ? " toast--" + type : "");
  el.innerHTML = icon(type === "error" ? "alert" : "checkCircle", 18) +
                 "<span>" + escapeHtml(message) + "</span>";
  stack.appendChild(el);

  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    setTimeout(() => el.remove(), 300);
  }, 4000);
}

/* ---------- SHARED CARD RENDERERS -------------------------------------- */

/* A blog post card. `prefix` fixes the link path: pages sitting inside
   /pages/ link to "post.html", the homepage links to "pages/post.html". */
function postCardHTML(post, prefix) {
  const p = prefix || "";
  return '' +
  '<article class="post-card">' +
    '<a class="post-thumb" style="--c1:' + post.c1 + ';--c2:' + post.c2 + '" ' +
       'href="' + p + 'post.html?slug=' + encodeURIComponent(post.slug) + '" ' +
       'aria-label="Read: ' + escapeHtml(post.title) + '">' +
      '<span>' + escapeHtml(post.initials) + '</span>' +
    '</a>' +
    '<div class="post-body">' +
      '<div class="tag-row"><span class="tag tag--primary">' + escapeHtml(post.category) + '</span></div>' +
      '<h3><a href="' + p + 'post.html?slug=' + encodeURIComponent(post.slug) + '">' +
        escapeHtml(post.title) + '</a></h3>' +
      '<p>' + escapeHtml(post.excerpt) + '</p>' +
      '<div class="post-meta">' +
        '<span>' + escapeHtml(post.author) + '</span>' +
        '<span class="dot"></span>' +
        '<time datetime="' + post.date + '">' + formatDate(post.date) + '</time>' +
        '<span class="dot"></span>' +
        '<span>' + post.readTime + ' min read</span>' +
      '</div>' +
    '</div>' +
  '</article>';
}

/* A learning-track card. */
function trackCardHTML(track, index) {
  return '' +
  '<article class="track-card" data-index="' + index + '" tabindex="0" role="button" ' +
  '         aria-label="Open details for ' + escapeHtml(track.title) + '">' +
    '<div class="track-cover" style="--c1:' + track.c1 + ';--c2:' + track.c2 + '">' +
      '<span>' + escapeHtml(track.initials) + '</span>' +
    '</div>' +
    '<div class="track-body">' +
      '<div class="tag-row">' +
        '<span class="tag tag--primary">' + escapeHtml(track.category) + '</span>' +
        '<span class="tag' + (track.level === "Beginner" ? " tag--success" : " tag--accent") + '">' +
          escapeHtml(track.level) + '</span>' +
      '</div>' +
      '<h3>' + escapeHtml(track.title) + '</h3>' +
      '<p>' + escapeHtml(track.blurb) + '</p>' +
      '<div class="track-meta">' +
        '<span>' + icon("clock", 14) + track.hours + ' hrs</span>' +
        '<span>' + icon("book", 14) + track.lessons + ' lessons</span>' +
        '<span style="margin-left:auto;font-weight:600;color:var(--success)">' +
          escapeHtml(track.price) + '</span>' +
      '</div>' +
    '</div>' +
  '</article>';
}

/* Expose to the other scripts. */
window.UI = {
  icon, escapeHtml, formatDate, initials, toast, postCardHTML, trackCardHTML
};
