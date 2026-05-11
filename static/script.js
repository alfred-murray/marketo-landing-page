/*
 * Vanilla JS that replaces the previous React behaviour:
 *   1. Munchkin loader (mirrors components/MunchkinScript.tsx).
 *   2. Sticky-navbar scroll state (was Navbar.tsx + useEffect).
 *   3. Reveal animation on hero (was framer-motion in Hero.tsx).
 *   4. Animated stat counters (was Stats.tsx + framer-motion `animate`).
 *   5. Lead form submit (was MarketoForm.tsx) — POSTs to /api/marketo/submit.
 *
 * Server-side env (MUNCHKIN_ID, MARKETO_*) is exposed at build/serve time via
 * a small JSON blob injected by server.js at /config.json. We fetch it once.
 */

(function () {
  "use strict";

  /* ---------------------------- 1. Munchkin ----------------------------- */

  function initMunchkin(munchkinId) {
    if (!munchkinId) {
      console.warn("[Munchkin] munchkin id not configured; tracking disabled.");
      return;
    }
    const s = document.createElement("script");
    s.src = "https://munchkin.marketo.net/munchkin.js";
    s.async = true;
    s.onload = function () {
      if (!window.Munchkin) return;
      window.Munchkin.init(munchkinId, {
        cookieAnon: true,
        domainLevel: 2,
        clickTime: 0,
        asyncOnly: true,
      });
    };
    document.head.appendChild(s);
  }

  /* ----------------------- 2. Navbar scroll state ----------------------- */

  function bindNavbarScroll() {
    const header = document.getElementById("site-header");
    if (!header) return;
    const apply = function () {
      const scrolled = window.scrollY > 8;
      header.classList.toggle("border-border", scrolled);
      header.classList.toggle("bg-bg/70", scrolled);
      header.classList.toggle("backdrop-blur-xl", scrolled);
      header.classList.toggle("border-transparent", !scrolled);
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
  }

  /* --------------------------- 3. Reveal-in --------------------------- */

  function bindReveal() {
    const els = document.querySelectorAll(".reveal");
    requestAnimationFrame(function () {
      els.forEach(function (el) {
        el.classList.add("is-in");
      });
    });
  }

  /* -------------------------- 4. Stat counters -------------------------- */

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const v = target * easeOut(t);
      el.textContent = prefix + v.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }

  function bindCounters() {
    const counters = document.querySelectorAll(".counter");
    if (!counters.length) return;
    if (typeof IntersectionObserver === "undefined") {
      counters.forEach(animateCounter);
      return;
    }
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "-80px" },
    );
    counters.forEach(function (c) {
      io.observe(c);
    });
  }

  /* --------------------------- 5. Lead form --------------------------- */

  function bindLeadForm() {
    const form = document.getElementById("lead-form");
    if (!form) return;
    const submitBtn = document.getElementById("lead-submit");
    const idleSpan = submitBtn.querySelector('[data-state="idle"]');
    const submittingSpan = submitBtn.querySelector('[data-state="submitting"]');
    const errorBox = document.getElementById("lead-error");
    const errorMsg = document.getElementById("lead-error-message");
    const successBox = document.getElementById("lead-success");
    const successMsg = document.getElementById("lead-success-message");

    function setSubmitting(submitting) {
      submitBtn.disabled = submitting;
      idleSpan.classList.toggle("hidden", submitting);
      idleSpan.classList.toggle("inline-flex", !submitting);
      submittingSpan.classList.toggle("hidden", !submitting);
      submittingSpan.classList.toggle("inline-flex", submitting);
    }

    function showError(message) {
      errorMsg.textContent = message;
      errorBox.classList.remove("hidden");
      errorBox.classList.add("flex");
    }

    function clearError() {
      errorBox.classList.add("hidden");
      errorBox.classList.remove("flex");
      errorMsg.textContent = "";
    }

    function showSuccess(message) {
      successMsg.textContent = message;
      form.classList.add("hidden");
      successBox.classList.remove("hidden");
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearError();
      const fd = new FormData(form);
      const payload = {};
      fd.forEach(function (v, k) {
        payload[k] = v;
      });

      setSubmitting(true);
      try {
        const res = await fetch("/api/marketo/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });
        const data = await res.json().catch(function () {
          return {};
        });
        if (!res.ok || !data.ok) {
          showError(data.error || "Submission failed (" + res.status + ")");
          return;
        }
        showSuccess(
          data.status === "created"
            ? "New lead #" + data.leadId + " created and stitched to your visitor cookie."
            : "Lead #" + data.leadId + " was updated and re-stitched to your visitor cookie.",
        );
      } catch (err) {
        showError(err && err.message ? err.message : "Network error");
      } finally {
        setSubmitting(false);
      }
    });
  }

  /* --------------------------- Footer year --------------------------- */

  function setFooterYear() {
    const el = document.getElementById("footer-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------ Boot ------------------------------ */

  async function loadConfig() {
    try {
      const res = await fetch("/config.json", { cache: "no-store" });
      if (!res.ok) return {};
      return await res.json();
    } catch {
      return {};
    }
  }

  document.addEventListener("DOMContentLoaded", async function () {
    setFooterYear();
    bindNavbarScroll();
    bindReveal();
    bindCounters();
    bindLeadForm();
    const config = await loadConfig();
    initMunchkin(config.munchkinId);
  });
})();
