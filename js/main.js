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
});
