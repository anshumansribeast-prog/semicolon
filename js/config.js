/* ===================================================================
   config.js — every site-wide setting in one place.

   Change things HERE, not scattered through the HTML. If you rename
   the site or change the contact email, this is the only file you
   should have to touch.

   ⚠ NOTHING SECRET GOES IN THIS FILE.
   This file is downloaded by every visitor's browser, so anyone can
   read it. API keys, passwords and tokens belong in a .env file on a
   server — see .env.example and README.md.
   =================================================================== */

const CONFIG = {
  site: {
    name:    "Semicolon",
    tagline: "Learn to code from zero",
    description:
      "A free, plain-English introduction to programming — what code is, " +
      "what it's used for, and how to write your first working program.",
    url:     "https://semicolon-anshuman.netlify.app",     // live site
    author:  "Anshuman Srivastava",
    founded: 2026
  },

  contact: {
    email:    "semlihelp@gmail.com",
    phone:    "+44 20 7946 0000",
    address:  "Remote — replies within two days",
    hours:    "Monday–Friday, 9am–5pm"
  },

  social: [
    { name: "GitHub",  url: "https://github.com",  icon: "github"  },
    { name: "YouTube", url: "https://youtube.com", icon: "youtube" },
    { name: "Discord", url: "https://discord.com", icon: "discord" },
    { name: "Email",   url: "mailto:semlihelp@gmail.com", icon: "mail" }
  ],

  blog: {
    postsPerPage: 4
  },

  /* ------------------------------------------------------------------
     INTEGRATIONS — all off by default.

     Each of these needs an account and a key you don't have yet.
     Rather than pretend they work, the site runs fully without them
     and tells you exactly what to do when you're ready. See README.
     ------------------------------------------------------------------ */
  integrations: {
    /* ================================================================
       EMAIL — how messages from the contact form reach you.

       A browser cannot send email by itself. That is a deliberate
       security rule: if it could, any web page you visited could send
       mail pretending to be you. So there are exactly two options.

       ── mode: "mailto" ───────────────────────────────────────────
       Works right now. No account, no signup, no internet needed.
       The form opens the visitor's own email app with everything
       already filled in; they press send, and it arrives from THEIR
       address in YOUR inbox.
         + Nothing to set up beyond the address below
         + Free forever, nothing can break or expire
         − Only works if they have an email app set up
         − Puts your address in the page, where spam bots can find it

       ── mode: "endpoint" ─────────────────────────────────────────
       The proper version. A free service receives the form and
       forwards it to you. The visitor never leaves the page.
         1. Sign up free at https://formspree.io
         2. Create a form using the address you want messages sent to
         3. Paste the endpoint it gives you into `endpoint` below
         4. Change mode to "endpoint"
       Free tier is 50 messages a month, which is plenty.

       ── mode: "off" ──────────────────────────────────────────────
       Validates the form, sends nothing, says so honestly.
       ================================================================ */
    email: {
      mode: "endpoint",                 // "mailto" | "endpoint" | "off"

      /* ⬇⬇ PUT YOUR OWN EMAIL ADDRESS HERE ⬇⬇
         This is the only line you need to change to start receiving
         messages. Use an address YOU control.                       */
      to: "semlihelp@gmail.com",

      // Only used when mode is "endpoint"
      endpoint: "https://formspree.io/f/mgogrbve"
    },
    // Google Analytics. Needs a measurement ID (G-XXXXXXXXXX).
    analytics: {
      enabled: false,
      id:      ""
    },
    // Google Maps embed on the contact page. Needs an API key.
    maps: {
      enabled: false,
      embedUrl: ""
    }
  },

  features: {
    darkMode:      true,
    backToTop:     true,
    revealOnScroll:true,
    comments:      true          // stored in this browser only, see js/post.js
  }
};

/* Make it available to every other script on the page. */
window.CONFIG = CONFIG;
