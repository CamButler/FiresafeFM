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
      if (window.matchMedia("(max-width:960px)").matches) {
        e.preventDefault();
        var li = a.parentElement;
        var wasOpen = li.classList.contains("open");
        document.querySelectorAll(".has-dropdown.open").forEach(function (el) { el.classList.remove("open"); });
        if (!wasOpen) li.classList.add("open");
      }
    });
  });

  /* ---- Dimmed backdrop behind an open mega-menu (desktop hover + mobile
     tap), so the dropdown reads as a deliberate overlay rather than a
     layout glitch. ---- */
  var dropdownItems = document.querySelectorAll(".has-dropdown");
  var navBackdrop = document.querySelector(".nav-backdrop");
  if (dropdownItems.length && navBackdrop) {
    dropdownItems.forEach(function (li) {
      li.addEventListener("mouseenter", function () {
        if (!window.matchMedia("(max-width:960px)").matches) document.body.classList.add("dropdown-open");
      });
      li.addEventListener("mouseleave", function () {
        if (!window.matchMedia("(max-width:960px)").matches) document.body.classList.remove("dropdown-open");
      });
    });
    var mo = new MutationObserver(function () {
      var anyOpen = document.querySelector(".has-dropdown.open");
      document.body.classList.toggle("dropdown-open", !!anyOpen);
    });
    dropdownItems.forEach(function (li) { mo.observe(li, { attributes: true, attributeFilter: ["class"] }); });
    navBackdrop.addEventListener("click", function () {
      document.querySelectorAll(".has-dropdown.open").forEach(function (el) { el.classList.remove("open"); });
      document.body.classList.remove("dropdown-open");
    });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    if (!q) return;
    q.addEventListener("click", function () {
      var wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (el) {
        el.classList.remove("open");
        el.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.classList.add("open");
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---- Site inspection request form ---- */
  var form = document.getElementById("inspection-form");
  if (form) {
    var statusEl = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.company_website && form.company_website.value) {
        // Honeypot triggered — silently pretend success, no request sent on.
        statusEl.textContent = "Thank you. Your inspection request has been received. We'll contact you to discuss next steps.";
        statusEl.className = "form-status ok";
        form.reset();
        return;
      }
      var endpoint = form.getAttribute("data-endpoint") || "/api/inspection-request";
      var submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      statusEl.textContent = "";
      statusEl.className = "form-status";
      fetch(endpoint, { method: "POST", body: new FormData(form) })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (result.ok) {
            statusEl.textContent = "Thank you. Your inspection request has been received. We'll contact you to discuss next steps.";
            statusEl.className = "form-status ok";
            form.reset();
          } else {
            statusEl.textContent = (result.data && result.data.error) || "Something went wrong — please call or email us directly.";
            statusEl.className = "form-status err";
          }
        })
        .catch(function () {
          statusEl.textContent = "Couldn't send your request — please call or email us directly.";
          statusEl.className = "form-status err";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Request an Inspection";
        });
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
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
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }
})();
