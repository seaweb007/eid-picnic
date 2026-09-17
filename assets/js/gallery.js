/* ============================================================
   EID PICNIC 2027 — GALLERY.JS
   Year filtering + accessible lightbox with keyboard navigation.
   Only runs where gallery markup exists (gallery.html, index.html preview).
   ============================================================ */
(function () {
  'use strict';

  var helpers = window.EidPicnic || {};
  var reportError = helpers.reportError || function (context, err) {
    if (window.console && console.error) console.error('[Eid Picnic] ' + context + ':', err);
  };
  var run = helpers.run || function (context, fn) {
    try { fn(); return true; } catch (err) { reportError(context, err); return false; }
  };

  var filterBtns = document.querySelectorAll('.filter-btn');
  var galleryItems = document.querySelectorAll('.g-item');

  run('gallery filters', function () {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        run('gallery filter click', function () {
          filterBtns.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          var filter = btn.dataset.filter;
          galleryItems.forEach(function (item) {
            var show = (filter === 'all' || item.dataset.year === filter);
            item.style.display = show ? 'block' : 'none';
            if (show) item.classList.add('fade-in-soft');
          });
        });
      });
    });
  });

  // A photo that fails to load is otherwise an invisible broken frame.
  run('gallery image error reporting', function () {
    document.querySelectorAll('.g-item img').forEach(function (img) {
      img.addEventListener('error', function () {
        var item = img.closest('.g-item');
        if (item) item.classList.add('g-item-broken');
        reportError('gallery image failed to load', new Error(img.currentSrc || img.src || '(no src)'));
      });
    });
  });

  // ===== LIGHTBOX =====
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var lightboxCaption = document.getElementById('lightboxCaption');

  // Without the image element the lightbox can only open onto a blank overlay,
  // so it stays disabled rather than throwing on the first click.
  if (!lightboxImg) {
    reportError('gallery lightbox', new Error('#lightboxImg is missing; lightbox disabled'));
    return;
  }

  var visibleImgs = [];
  var currentIndex = 0;

  function refreshVisibleImgs() {
    visibleImgs = Array.prototype.filter.call(
      document.querySelectorAll('.g-item img'),
      function (img) {
        var parent = img.closest('.g-item');
        return parent && parent.style.display !== 'none' && !parent.classList.contains('g-item-broken');
      }
    );
  }

  function openLightbox(img) {
    refreshVisibleImgs();
    currentIndex = visibleImgs.indexOf(img);
    if (currentIndex === -1) currentIndex = 0;
    showCurrent();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function showCurrent() {
    var img = visibleImgs[currentIndex];
    if (!img) {
      reportError('gallery lightbox', new Error('no visible image at index ' + currentIndex));
      closeLightbox();
      return;
    }
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || 'Eid Picnic gallery photo';
    if (lightboxCaption) lightboxCaption.textContent = img.alt || '';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showNext() {
    if (!visibleImgs.length) return;
    currentIndex = (currentIndex + 1) % visibleImgs.length;
    showCurrent();
  }

  function showPrev() {
    if (!visibleImgs.length) return;
    currentIndex = (currentIndex - 1 + visibleImgs.length) % visibleImgs.length;
    showCurrent();
  }

  run('gallery lightbox wiring', function () {
    document.querySelectorAll('.g-item img').forEach(function (img) {
      img.addEventListener('click', function () {
        run('gallery lightbox open', function () { openLightbox(img); });
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', function () { run('gallery next', showNext); });
    if (lightboxPrev) lightboxPrev.addEventListener('click', function () { run('gallery prev', showPrev); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      run('gallery keyboard nav', function () {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
      });
    });
  });
})();
