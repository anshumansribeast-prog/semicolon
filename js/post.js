/* ===================================================================
   post.js — a single blog post.

   Which post to show comes from the URL:  post.html?slug=three-loops
   That's a "query string". Reading it is how one page can serve any
   number of articles without needing a file each.
   =================================================================== */

(function () {
  "use strict";

  const mount = document.getElementById("article");
  if (!mount) return;

  const { icon, escapeHtml, formatDate, initials, toast } = window.UI;

  /* URLSearchParams does the parsing for you — don't split the string
     by hand, it goes wrong the moment a value contains & or =. */
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const post = POSTS.find(function (p) { return p.slug === slug; });

  /* ---- not found -------------------------------------------------- */
  if (!post) {
    mount.innerHTML =
      '<div class="empty is-shown">' + icon("alert", 42) +
        "<h2>Post not found</h2>" +
        "<p>There's no article at that address. It may have been renamed.</p>" +
        '<div class="btn-row btn-row--center" style="margin-top:1.2rem">' +
          '<a class="btn btn--primary" href="blog.html">Back to all posts</a>' +
        "</div>" +
      "</div>";
    document.title = "Post not found — Semicolon";
    return;
  }

  /* ---- SEO / sharing metadata --------------------------------------
     Set per post, since one HTML file serves them all. Without this
     every article would share the same title in search results.    */
  document.title = post.title + " — Semicolon";
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", post.excerpt);

  /* ---- the article -------------------------------------------------- */
  mount.innerHTML =
    '<nav class="breadcrumb" aria-label="Breadcrumb">' +
      '<a href="../index.html">Home</a> / <a href="blog.html">Blog</a> / ' +
      escapeHtml(post.category) +
    "</nav>" +

    '<header class="article-hero">' +
      '<div class="tag-row" style="margin-bottom:.8rem">' +
        '<span class="tag tag--primary">' + escapeHtml(post.category) + "</span>" +
        post.tags.map(function (t) {
          return '<span class="tag">#' + escapeHtml(t) + "</span>";
        }).join("") +
      "</div>" +
      "<h1>" + escapeHtml(post.title) + "</h1>" +
      '<div class="post-meta" style="margin-top:1rem">' +
        '<span class="avatar" style="width:32px;height:32px;font-size:.78rem">' +
          initials(post.author) + "</span>" +
        "<span>" + escapeHtml(post.author) + "</span>" +
        '<span class="dot"></span>' +
        '<time datetime="' + post.date + '">' + formatDate(post.date) + "</time>" +
        '<span class="dot"></span>' +
        "<span>" + post.readTime + " min read</span>" +
      "</div>" +
    "</header>" +

    '<div class="article-cover" style="--c1:' + post.c1 + ";--c2:" + post.c2 + '">' +
      "<span>" + escapeHtml(post.initials) + "</span>" +
    "</div>" +

    // post.body is OUR content from data.js, not anything a visitor
    // typed, so inserting it as HTML is safe. Never do this with
    // text that came from a form — see the comment handler below.
    '<div class="prose">' + post.body + "</div>" +

    '<div class="share">' +
      "<span>" + icon("share", 17) + " Share this</span>" +
      '<button class="btn btn--ghost btn--sm" data-share="x">X / Twitter</button>' +
      '<button class="btn btn--ghost btn--sm" data-share="facebook">Facebook</button>' +
      '<button class="btn btn--ghost btn--sm" data-share="linkedin">LinkedIn</button>' +
      '<button class="btn btn--ghost btn--sm" data-share="copy">' + icon("link", 15) + " Copy link</button>" +
    "</div>";

  /* ---- share buttons ------------------------------------------------- */
  const shareUrl = window.location.href;
  const shareText = post.title;

  mount.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-share]");
    if (!btn) return;

    const kind = btn.dataset.share;

    if (kind === "copy") {
      // The clipboard API only works over https:// or on localhost.
      // Opening the file directly with file:// will fall into catch.
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl)
          .then(function () { toast("Link copied to clipboard.", "success"); })
          .catch(function () { toast("Couldn't copy — the clipboard needs https.", "error"); });
      } else {
        toast("Clipboard isn't available in this browser.", "error");
      }
      return;
    }

    const targets = {
      x: "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText) +
         "&url=" + encodeURIComponent(shareUrl),
      facebook: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(shareUrl),
      linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(shareUrl)
    };
    window.open(targets[kind], "_blank", "noopener,width=600,height=520");
  });

  /* ---- related posts --------------------------------------------------
     Same category first, then anything else, never the post itself. */
  const relatedBox = document.getElementById("relatedPosts");
  if (relatedBox) {
    const sameCat = POSTS.filter(function (p) {
      return p.slug !== post.slug && p.category === post.category;
    });
    const others = POSTS.filter(function (p) {
      return p.slug !== post.slug && p.category !== post.category;
    });
    const related = sameCat.concat(others).slice(0, 3);

    relatedBox.innerHTML = related.map(function (p) {
      return '' +
      '<a class="card card--hover" href="post.html?slug=' + encodeURIComponent(p.slug) + '">' +
        '<div class="tag-row" style="margin-bottom:.6rem">' +
          '<span class="tag tag--primary">' + escapeHtml(p.category) + "</span></div>" +
        "<h3>" + escapeHtml(p.title) + "</h3>" +
        "<p>" + escapeHtml(p.excerpt) + "</p>" +
      "</a>";
    }).join("");
  }

  /* ---- comments -------------------------------------------------------
     Stored in this browser only (localStorage). There is no server, so
     nobody else can see them and they don't leave this device. That's
     a real limitation, and the page says so rather than pretending. */
  if (!CONFIG.features.comments) return;

  const listEl = document.getElementById("commentList");
  const formEl = document.getElementById("commentForm");
  if (!listEl || !formEl) return;

  const KEY = "semicolon-comments-" + post.slug;

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (err) {
      // Corrupted data shouldn't take the whole page down
      console.warn("Could not read stored comments:", err);
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function renderComments() {
    const items = load();
    const countEl = document.getElementById("commentCount");
    if (countEl) {
      countEl.textContent = items.length === 0
        ? "No comments yet"
        : items.length + " comment" + (items.length === 1 ? "" : "s");
    }

    if (items.length === 0) {
      listEl.innerHTML = '<p style="color:var(--text-subtle);font-size:.92rem">' +
                         "Be the first to leave a note.</p>";
      return;
    }

    // EVERY piece of this came from a text box, so EVERY piece is
    // escaped. This is the line that stops someone storing
    // <script>...</script> as their name and having it run.
    listEl.innerHTML = items.map(function (c) {
      return '' +
      '<div class="comment">' +
        '<span class="avatar" aria-hidden="true">' + escapeHtml(initials(c.name)) + "</span>" +
        '<div class="comment-body">' +
          '<span class="name">' + escapeHtml(c.name) + "</span>" +
          '<span class="when">' + escapeHtml(c.when) + "</span>" +
          "<p>" + escapeHtml(c.text) + "</p>" +
        "</div>" +
      "</div>";
    }).join("");
  }

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();

    const nameEl = formEl.querySelector("#commentName");
    const textEl = formEl.querySelector("#commentText");
    const name = nameEl.value.trim();
    const text = textEl.value.trim();

    if (name.length < 2) { toast("Please enter a name of at least 2 characters.", "error"); nameEl.focus(); return; }
    if (text.length < 4) { toast("Your comment is a little short.", "error"); textEl.focus(); return; }
    if (text.length > 1000) { toast("Comments are limited to 1000 characters.", "error"); return; }

    const items = load();
    items.unshift({
      name: name.slice(0, 60),
      text: text.slice(0, 1000),
      when: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    });
    save(items);

    formEl.reset();
    renderComments();
    toast("Comment saved — in this browser only.", "success");
  });

  renderComments();
})();
