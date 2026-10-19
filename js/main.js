(function () {
  "use strict";

  /* ---- Mobile nav toggle ---- */
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.querySelector(".main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---- Mega-menu tap-toggle on mobile ---- */
  document.querySelectorAll(".has-dropdown > a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (window.matchMedia("(max-width:900px)").matches) {
        e.preventDefault();
        var li = a.parentElement;
        var wasOpen = li.classList.contains("open");
        document.querySelectorAll(".has-dropdown.open").forEach(function (el) { el.classList.remove("open"); });
        if (!wasOpen) li.classList.add("open");
      }
    });
  });

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    if (!q) return;
    q.addEventListener("click", function () {
      var wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (el) { el.classList.remove("open"); el.querySelector(".faq-q").setAttribute("aria-expanded", "false"); });
      if (!wasOpen) {
        item.classList.add("open");
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---- Contact form ---- */
  var form = document.getElementById("quote-form");
  if (form) {
    var statusEl = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.company_website && form.company_website.value) {
        // Honeypot triggered — silently pretend success.
        statusEl.textContent = "Thanks — we'll be in touch shortly.";
        statusEl.className = "form-status ok";
        form.reset();
        return;
      }
      var endpoint = form.getAttribute("data-endpoint") || "/api/contact";
      var submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      statusEl.textContent = "";
      statusEl.className = "form-status";
      fetch(endpoint, { method: "POST", body: new FormData(form) })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (result.ok) {
            statusEl.textContent = "Thanks — your enquiry has been sent. We'll be in touch shortly.";
            statusEl.className = "form-status ok";
            form.reset();
          } else {
            statusEl.textContent = (result.data && result.data.error) || "Something went wrong — please call or email us directly.";
            statusEl.className = "form-status err";
          }
        })
        .catch(function () {
          statusEl.textContent = "Couldn't send your enquiry — please call " + "us or email us directly.";
          statusEl.className = "form-status err";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Enquiry";
        });
    });
  }

  /* ---- Count-up stat animation ---- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = prefix + target + suffix;
      return;
    }
    var duration = 1200;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
  var numEls = document.querySelectorAll(".num[data-count]");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });

    var numObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    numEls.forEach(function (el) { numObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
    numEls.forEach(animateCount);
  }

  /* ---- Floating CTA show/hide ---- */
  var floatingCta = document.getElementById("floating-cta");
  var heroEl = document.querySelector(".hero, .page-hero");
  if (floatingCta && heroEl) {
    var threshold = heroEl.offsetTop + heroEl.offsetHeight * 0.6;
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          if (window.scrollY > threshold) {
            floatingCta.classList.add("show");
          } else {
            floatingCta.classList.remove("show");
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }
})();
