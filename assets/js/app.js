/* ============================================================
   EID PICNIC 2027 — APP.JS
   Shared behavior across every page: preloader, navigation,
   scroll reveal animations, sticky CTA, footer year.
   ============================================================ */
(function () {
  'use strict';

  // ===== PRELOADER =====
  window.addEventListener('load', function () {
    var preloader = document.getElementById('preloader');
    if (!preloader) return;
    setTimeout(function () {
      preloader.classList.add('hide');
    }, 350);
  });

  // ===== NAVBAR SCROLL STATE =====
  var navbar = document.getElementById('navbar');
  var stickyCta = document.getElementById('stickyCta');
  function onScroll() {
    var y = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', y > 40);
    if (stickyCta) stickyCta.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== MOBILE NAV TOGGLE =====
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      var expanded = navLinks.classList.contains('open');
      navToggle.setAttribute('aria-expanded', expanded);
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { navLinks.classList.remove('open'); });
    });
  }

  // ===== ACTIVE NAV LINK (based on current page) =====
  var currentPage = (document.body.getAttribute('data-page') || '').toLowerCase();
  document.querySelectorAll('.nav-links a[data-page]').forEach(function (link) {
    if (link.getAttribute('data-page') === currentPage) {
      link.classList.add('active');
    }
  });

  // ===== SCROLL REVEAL (lightweight AOS-style) =====
  var revealEls = document.querySelectorAll('[data-aos]');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = el.getAttribute('data-aos-delay');
          if (delay) {
            el.style.transitionDelay = (parseInt(delay, 10) / 1000) + 's';
          }
          el.classList.add('aos-animate');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('aos-animate'); });
  }

  // ===== FOOTER YEAR =====
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // ===== EXTERNAL LINKS: force new tab safety =====
  document.querySelectorAll('a[target="_blank"]').forEach(function (a) {
    if (!a.getAttribute('rel')) a.setAttribute('rel', 'noopener noreferrer');
  });
})();
