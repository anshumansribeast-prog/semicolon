/* ===================================================================
   main.js — behaviour shared by every page.

     1  theme (dark / light)        6  reveal on scroll
     2  mobile navigation            7  quotes carousel
     3  active page in the nav       8  FAQ accordion
     4  back-to-top button           9  newsletter form
     5  footer year                 10  home page content
   =================================================================== */

(function () {
  "use strict";

  const { icon, escapeHtml, toast } = window.UI;
  const root = document.documentElement;

  // Pages inside /pages/ need different relative links than index.html
  const inPages = window.location.pathname.indexOf("/pages/") !== -1 ||
                  window.location.pathname.indexOf("\\pages\\") !== -1;
  const P = inPages ? "" : "pages/";      // prefix for links to pages/

  /* ---- 1. THEME ---------------------------------------------------
     Order of preference: what you chose last time → your operating
     system setting → light. Saved in localStorage so it survives a
     refresh.                                                        */
  const THEME_KEY = "semicolon-theme";

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");   // fall back to the OS setting
    }
  }

  function currentTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  applyTheme(localStorage.getItem(THEME_KEY));

  const themeBtn = document.querySelector("[data-theme-toggle]");
  if (themeBtn && CONFIG.features.darkMode) {
    themeBtn.innerHTML =
      '<span class="icon-sun">' + icon("sun", 19) + "</span>" +
      '<span class="icon-moon">' + icon("moon", 19) + "</span>";
    themeBtn.setAttribute("aria-label", "Switch between light and dark theme");

    themeBtn.addEventListener("click", function () {
      const next = currentTheme() === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
      themeBtn.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
    });
  }

  /* ---- 2. MOBILE NAVIGATION ---------------------------------------- */
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (navToggle && navMenu) {
    navToggle.innerHTML = icon("menu", 20);

    navToggle.addEventListener("click", function () {
      const open = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.innerHTML = icon(open ? "close" : "menu", 20);
    });

    // On mobile the dropdown becomes a tap-to-expand sub-list
    navMenu.querySelectorAll(".has-dropdown > .nav-link").forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (window.innerWidth > 780) return;      // desktop uses hover
        e.preventDefault();
        link.parentElement.classList.toggle("is-open");
      });
    });

    // Close the menu when a real link is followed
    navMenu.addEventListener("click", function (e) {
      const a = e.target.closest("a");
      if (a && !a.parentElement.classList.contains("has-dropdown")) {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.innerHTML = icon("menu", 20);
      }
    });

    // Escape closes it, and returns focus to the button
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navMenu.classList.contains("is-open")) {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.innerHTML = icon("menu", 20);
        navToggle.focus();
      }
    });
  }

  /* ---- 3. ACTIVE PAGE ---------------------------------------------- */
  const here = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav-menu a").forEach(function (a) {
    const target = (a.getAttribute("href") || "").split("/").pop().split("?")[0].toLowerCase();
    // post.html is part of the blog section, so highlight Blog for it
    const match = target === here || (here === "post.html" && target === "blog.html");
    if (match) a.setAttribute("aria-current", "page");
  });

  /* ---- 4. BACK TO TOP ---------------------------------------------- */
  if (CONFIG.features.backToTop) {
    const btn = document.createElement("button");
    btn.className = "to-top";
    btn.type = "button";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = icon("arrowUp", 19);
    document.body.appendChild(btn);

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    let ticking = false;
    window.addEventListener("scroll", function () {
      // Scroll fires very often. requestAnimationFrame keeps us from
      // doing work more than once per frame.
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        btn.classList.toggle("is-visible", window.scrollY > 500);
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- 5. FOOTER YEAR + CONTACT DETAILS ------------------------------
     The email address is written in ONE place (config.js) and filled in
     everywhere it appears. Change it once, and the footer link, the
     contact card and the form destination all follow. Hard-coding it
     into six HTML files is how sites end up with a stale address in
     the footer that nobody notices for a year.                      */
  document.querySelectorAll(".js-year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  const mailTo = CONFIG.integrations.email.to;
  const addressIsSet = mailTo && mailTo !== "your.email@example.com";
  const shownAddress = addressIsSet ? mailTo : CONFIG.contact.email;

  document.querySelectorAll("[data-config-mailto]").forEach(function (el) {
    el.setAttribute("href", "mailto:" + shownAddress);
    if (el.hasAttribute("data-config-mailto-text")) el.textContent = shownAddress;
  });

  /* ---- 6. REVEAL ON SCROLL ------------------------------------------ */
  if (CONFIG.features.revealOnScroll && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);       // animate once, then stop watching
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- 7. QUOTES CAROUSEL --------------------------------------------
     Was a testimonials carousel with invented reviews in it. Now it
     carries real, sourced quotes — same component, honest content. */
  const carousel = document.getElementById("quotes");
  if (carousel && window.QUOTES) {
    const slides = QUOTES.map(function (t) {
      return '' +
      '<div class="carousel-slide" role="group" aria-roledescription="slide">' +
        '<figure class="quote">' +
          '<blockquote>&ldquo;' + escapeHtml(t.quote) + '&rdquo;</blockquote>' +
          '<figcaption class="quote-person">' +
            '<span class="avatar" aria-hidden="true">' + window.UI.initials(t.name) + '</span>' +
            '<span class="who">' +
              '<span class="name">' + escapeHtml(t.name) + '</span><br>' +
              '<span class="role">' + escapeHtml(t.role) + '</span>' +
            '</span>' +
          '</figcaption>' +
        '</figure>' +
      '</div>';
    }).join("");

    carousel.innerHTML =
      '<div class="carousel-track"><div class="carousel-slides" id="carouselSlides">' + slides + '</div></div>' +
      '<div class="carousel-nav">' +
        '<button class="icon-btn" id="carPrev" aria-label="Previous quote">' + icon("chevron", 18) + '</button>' +
        '<div class="carousel-dots" id="carDots" role="tablist" aria-label="Choose quote"></div>' +
        '<button class="icon-btn" id="carNext" aria-label="Next quote">' + icon("chevron", 18) + '</button>' +
      '</div>';

    // point the arrows left and right
    document.querySelector("#carPrev svg").style.transform = "rotate(90deg)";
    document.querySelector("#carNext svg").style.transform = "rotate(-90deg)";

    const slidesEl = document.getElementById("carouselSlides");
    const dotsEl = document.getElementById("carDots");
    let index = 0;

    dotsEl.innerHTML = QUOTES.map(function (_, i) {
      return '<button class="carousel-dot" role="tab" data-i="' + i + '" ' +
             'aria-selected="' + (i === 0) + '" aria-label="Quote ' + (i + 1) + '"></button>';
    }).join("");

    function go(i) {
      index = (i + QUOTES.length) % QUOTES.length;   // wrap around
      slidesEl.style.transform = "translateX(-" + (index * 100) + "%)";
      dotsEl.querySelectorAll(".carousel-dot").forEach(function (d, di) {
        d.setAttribute("aria-selected", di === index ? "true" : "false");
      });
    }

    document.getElementById("carPrev").addEventListener("click", function () { go(index - 1); });
    document.getElementById("carNext").addEventListener("click", function () { go(index + 1); });
    dotsEl.addEventListener("click", function (e) {
      const dot = e.target.closest(".carousel-dot");
      if (dot) go(Number(dot.dataset.i));
    });

    // Auto-advance, but pause on hover and for anyone who has asked
    // their system for reduced motion.
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!calm) {
      let timer = setInterval(function () { go(index + 1); }, 7000);
      carousel.addEventListener("mouseenter", function () { clearInterval(timer); });
      carousel.addEventListener("mouseleave", function () {
        timer = setInterval(function () { go(index + 1); }, 7000);
      });
    }
  }

  /* ---- 8. FAQ ACCORDION ---------------------------------------------- */
  const faqBox = document.getElementById("faq");
  if (faqBox && window.FAQS) {
    faqBox.innerHTML = FAQS.map(function (f, i) {
      return '' +
      '<div class="faq-item">' +
        '<button class="faq-q" aria-expanded="false" aria-controls="faq-a-' + i + '" id="faq-q-' + i + '">' +
          '<span>' + escapeHtml(f.q) + '</span>' + icon("chevron", 18) +
        '</button>' +
        '<div class="faq-a" id="faq-a-' + i + '" role="region" aria-labelledby="faq-q-' + i + '">' +
          '<div><p>' + escapeHtml(f.a) + '</p></div>' +
        '</div>' +
      '</div>';
    }).join("");

    faqBox.addEventListener("click", function (e) {
      const q = e.target.closest(".faq-q");
      if (!q) return;
      const open = q.getAttribute("aria-expanded") === "true";
      // close the others so only one is open at a time
      faqBox.querySelectorAll(".faq-q").forEach(function (other) {
        other.setAttribute("aria-expanded", "false");
      });
      q.setAttribute("aria-expanded", open ? "false" : "true");
    });
  }

  /* ---- 9. NEWSLETTER -------------------------------------------------- */
  document.querySelectorAll("[data-newsletter]").forEach(function (form) {
    const input = form.querySelector('input[type="email"]');
    const msg = form.parentElement.querySelector(".form-msg");

    form.addEventListener("submit", function (e) {
      e.preventDefault();                       // don't reload the page
      const email = input.value.trim();

      if (!isValidEmail(email)) {
        showMessage(msg, "error", "That doesn't look like an email address. Check for a typo?");
        input.focus();
        return;
      }

      const mail = CONFIG.integrations.email;
      const notSet = !mail.to || mail.to === "your.email@example.com";

      if (mail.mode === "mailto" && !notSet) {
        // Open the visitor's email app with a subscribe request ready
        const body = "Please add this address to the " + CONFIG.site.name +
                     " mailing list:\n\n" + email + "\n";
        window.location.href = "mailto:" + encodeURIComponent(mail.to) +
          "?subject=" + encodeURIComponent("[" + CONFIG.site.name + "] Newsletter signup") +
          "&body=" + encodeURIComponent(body);
        showMessage(msg, "success",
          "Your email app is opening with a signup request ready — press send there.");
        toast("Opening your email app…", "success");
      } else if (mail.mode === "endpoint" && mail.endpoint) {
        /* Actually send it. An earlier version of this branch showed a
           success message without posting anything — a form that lies
           about succeeding is worse than one that admits it can't. */
        const btn = form.querySelector('button[type="submit"]');
        const label = btn ? btn.textContent : "";
        if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

        fetch(mail.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ email: email, _subject: "Newsletter signup" })
        })
          .then(function (res) {
            // fetch does NOT throw on 404 or 500 — check res.ok yourself
            if (!res.ok) throw new Error("Server responded " + res.status);
            showMessage(msg, "success", "Thanks — you're on the list.");
            toast("Subscribed.", "success");
            form.reset();
          })
          .catch(function (err) {
            console.error("Newsletter signup failed:", err);
            showMessage(msg, "error",
              "That didn't go through. Please try again, or email " + mail.to + " directly.");
            toast("Signup failed.", "error");
          })
          .finally(function () {
            if (btn) { btn.disabled = false; btn.textContent = label; }
          });
        return;      // don't fall through to the reset below
      } else {
        // Being honest beats a fake "Subscribed!" that does nothing.
        showMessage(msg, "success",
          "Validated — but not sent. No destination address is set yet: see README.md.");
        toast("Form validated. Email sending isn't connected yet.", "success");
      }
      form.reset();
    });
  });

  function isValidEmail(v) {
    // Deliberately simple. Email validation by regex is famously
    // impossible to get perfect; the real check is sending a
    // confirmation message to the address.
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  function showMessage(el, type, text) {
    if (!el) return;
    el.className = "form-msg form-msg--" + type + " is-shown";
    el.innerHTML = icon(type === "error" ? "alert" : "checkCircle", 18) +
                   "<span>" + escapeHtml(text) + "</span>";
  }

  /* ---- 10. HOME PAGE CONTENT ------------------------------------------ */
  const recent = document.getElementById("recentPosts");
  if (recent && window.POSTS) {
    const newest = POSTS.slice()
      .sort(function (a, b) { return b.date.localeCompare(a.date); })
      .slice(0, 3);
    recent.innerHTML = newest.map(function (p) { return window.UI.postCardHTML(p, P); }).join("");
  }

  const popular = document.getElementById("popularTracks");
  if (popular && window.TRACKS) {
    popular.innerHTML = TRACKS.slice(0, 3).map(function (t) {
      return '' +
      '<a class="card card--hover" href="' + P + 'learn.html" style="display:block">' +
        '<div class="feature-icon" style="background:' + t.c1 + '22;color:' + t.c1 + '">' +
          '<strong style="font-family:var(--mono);font-size:.95rem">' + t.initials + '</strong>' +
        '</div>' +
        '<h3>' + escapeHtml(t.title) + '</h3>' +
        '<p>' + escapeHtml(t.blurb) + '</p>' +
        '<div class="track-meta" style="margin-top:1rem">' +
          '<span>' + icon("clock", 14) + t.hours + ' hrs</span>' +
          '<span>' + icon("book", 14) + t.lessons + ' lessons</span>' +
        '</div>' +
      '</a>';
    }).join("");
  }

  /* ---- 11. ANALYTICS (off unless you configure it) --------------------- */
  if (CONFIG.integrations.analytics.enabled && CONFIG.integrations.analytics.id) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + CONFIG.integrations.analytics.id;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", CONFIG.integrations.analytics.id);
  }
})();
