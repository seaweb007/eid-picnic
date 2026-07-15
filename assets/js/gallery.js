/* ============================================================
   EID PICNIC 2027 — GALLERY.JS
   Year filtering + accessible lightbox with keyboard navigation.
   Only runs where gallery markup exists (gallery.html, index.html preview).
   ============================================================ */
(function () {
  'use strict';

  var filterBtns = document.querySelectorAll('.filter-btn');
  var galleryItems = document.querySelectorAll('.g-item');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
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

  // ===== LIGHTBOX =====
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var lightboxCaption = document.getElementById('lightboxCaption');

  var visibleImgs = [];
  var currentIndex = 0;

  function refreshVisibleImgs() {
    visibleImgs = Array.prototype.filter.call(
      document.querySelectorAll('.g-item img'),
      function (img) {
        var parent = img.closest('.g-item');
        return parent && parent.style.display !== 'none';
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
    if (!img) return;
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

  document.querySelectorAll('.g-item img').forEach(function (img) {
    img.addEventListener('click', function () { openLightbox(img); });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', showNext);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
})();
