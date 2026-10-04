// Fire Safe FM — shared front-end behaviour

document.addEventListener('DOMContentLoaded', function () {

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Quote / contact form submission
  var form = document.getElementById('quote-form');
  if (form) {
    var statusEl = document.getElementById('form-status');
    // Point this at your deployed backend, e.g. https://api.firesafefm.uk/api/contact
    var ENDPOINT = form.getAttribute('data-endpoint') || '/api/contact';

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot spam check — real users never fill this hidden field
      if (form.querySelector('[name="company_website"]').value) {
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      statusEl.textContent = '';
      statusEl.className = 'form-status';

      // Uses FormData (not JSON) so file attachments under "photos" travel with it
      var formData = new FormData(form);

      fetch(ENDPOINT, {
        method: 'POST',
        body: formData
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          return res.json();
        })
        .then(function () {
          statusEl.textContent = "Thanks — your enquiry has been sent. We'll be in touch shortly.";
          statusEl.className = 'form-status ok';
          form.reset();
        })
        .catch(function () {
          statusEl.textContent = 'Something went wrong sending your enquiry. Please call us on 07427 606 008 or email info@firesafefm.uk directly.';
          statusEl.className = 'form-status err';
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        });
    });
  }

  // Mega-menu dropdowns: hover on desktop (CSS handles it), tap-to-toggle on mobile
  document.querySelectorAll('.has-dropdown > a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (window.matchMedia('(max-width: 900px)').matches) {
        e.preventDefault();
        var parent = link.parentElement;
        var wasOpen = parent.classList.contains('open');
        document.querySelectorAll('.has-dropdown.open').forEach(function (el) { el.classList.remove('open'); });
        if (!wasOpen) parent.classList.add('open');
      }
    });
  });

  // ---- Scroll-reveal + animated counters (lightweight, no dependencies) ----
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = prefix + target + suffix; return; }
    var start = null;
    var duration = 1200;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var value = Math.round(target * eased);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) {
      revealObserver.observe(el);
    });

    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    document.querySelectorAll('.num[data-count]').forEach(function (el) {
      countObserver.observe(el);
    });
  } else {
    // Fallback: no IntersectionObserver support — just show everything immediately
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) { el.classList.add('visible'); });
    document.querySelectorAll('.num[data-count]').forEach(function (el) {
      el.textContent = (el.getAttribute('data-prefix') || '') + el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
    });
  }

  // ---- Floating "Contact Us" button — appears after scrolling past the hero ----
  var floatingCta = document.getElementById('floating-cta');
  if (floatingCta) {
    var heroEl = document.querySelector('.hero, .page-hero');
    var threshold = heroEl ? heroEl.offsetTop + heroEl.offsetHeight * 0.6 : 400;
    var ticking = false;
    function updateFloatingCta() {
      if (window.scrollY > threshold) {
        floatingCta.classList.add('show');
      } else {
        floatingCta.classList.remove('show');
      }
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateFloatingCta);
        ticking = true;
      }
    });
    updateFloatingCta();
  }
});
