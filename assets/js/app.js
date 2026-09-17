/* ============================================================
   EID PICNIC 2027 — APP.JS
   Shared behavior across every page: preloader, navigation,
   scroll reveal animations, sticky CTA, footer year.
   Also exposes the shared error reporting helpers on
   window.EidPicnic, used by the other page scripts.
   ============================================================ */
(function () {
  'use strict';

  var PRELOADER_FALLBACK_MS = 5000;

  // ===== SHARED ERROR REPORTING =====
  // Every failure gets a context label so a broken feature is visible in the
  // console instead of disappearing, and one broken block never prevents the
  // remaining blocks from initializing.
  function reportError(context, err) {
    var error = err instanceof Error ? err : new Error(String(err));
    if (window.console && console.error) {
      console.error('[Eid Picnic] ' + context + ':', error);
    }
    return error;
  }

  function run(context, fn) {
    try {
      fn();
      return true;
    } catch (err) {
      reportError(context, err);
      return false;
    }
  }

  var api = window.EidPicnic || (window.EidPicnic = {});
  api.reportError = reportError;
  api.run = run;

  window.addEventListener('error', function (e) {
    reportError('uncaught error', e.error || e.message);
  });

  window.addEventListener('unhandledrejection', function (e) {
    reportError('unhandled promise rejection', e.reason);
  });

  // ===== PRELOADER =====
  // The overlay covers the whole viewport, so it must come down even if `load`
  // never fires (a hanging image, iframe or font would otherwise leave the page
  // permanently blank).
  run('preloader', function () {
    var preloader = document.getElementById('preloader');
    if (!preloader) return;

    var hidden = false;
    function hide() {
      if (hidden) return;
      hidden = true;
      preloader.classList.add('hide');
    }

    window.addEventListener('load', function () {
      setTimeout(hide, 350);
    });
    setTimeout(hide, PRELOADER_FALLBACK_MS);
    if (document.readyState === 'complete') setTimeout(hide, 350);
  });

  // ===== NAVBAR SCROLL STATE =====
  run('navbar scroll state', function () {
    var navbar = document.getElementById('navbar');
    var stickyCta = document.getElementById('stickyCta');
    function onScroll() {
      var y = window.scrollY;
      if (navbar) navbar.classList.toggle('scrolled', y > 40);
      if (stickyCta) stickyCta.classList.toggle('show', y > 700);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });

  // ===== MOBILE NAV TOGGLE =====
  run('mobile nav toggle', function () {
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    if (!navToggle || !navLinks) return;

    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      var expanded = navLinks.classList.contains('open');
      navToggle.setAttribute('aria-expanded', expanded);
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { navLinks.classList.remove('open'); });
    });
  });

  // ===== ACTIVE NAV LINK (based on current page) =====
  run('active nav link', function () {
    var currentPage = (document.body.getAttribute('data-page') || '').toLowerCase();
    document.querySelectorAll('.nav-links a[data-page]').forEach(function (link) {
      if (link.getAttribute('data-page') === currentPage) {
        link.classList.add('active');
      }
    });
  });

  // ===== SCROLL REVEAL (lightweight AOS-style) =====
  var revealEls = document.querySelectorAll('[data-aos]');
  function revealAll() {
    revealEls.forEach(function (el) { el.classList.add('aos-animate'); });
  }
  var revealed = run('scroll reveal', function () {
    if (!('IntersectionObserver' in window) || !revealEls.length) {
      revealAll();
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-aos-delay'), 10);
        if (!isNaN(delay)) el.style.transitionDelay = (delay / 1000) + 's';
        el.classList.add('aos-animate');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  });
  // Content is hidden until revealed, so a failing observer must not leave the
  // page blank.
  if (!revealed) revealAll();

  // ===== FOOTER YEAR =====
  run('footer year', function () {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  });

  // ===== EXTERNAL LINKS: force new tab safety =====
  run('external link hardening', function () {
    document.querySelectorAll('a[target="_blank"]').forEach(function (a) {
      if (!a.getAttribute('rel')) a.setAttribute('rel', 'noopener noreferrer');
    });
  });
})();
