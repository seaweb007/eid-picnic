/* ============================================================
   EID PICNIC 2027 — FAQ.JS
   Accordion behavior + live search filtering with an empty state.
   ============================================================ */
(function () {
  'use strict';

  function initAccordion() {
    document.querySelectorAll('.faq-q').forEach(function (q) {
      q.setAttribute('role', 'button');
      q.setAttribute('tabindex', '0');
      function toggle() {
        var item = q.parentElement;
        var wasActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('active'); });
        if (!wasActive) item.classList.add('active');
      }
      q.addEventListener('click', toggle);
      q.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }

  function filterItems(items, query, emptyState) {
    var needle = query.toLowerCase().trim();
    var visibleCount = 0;
    items.forEach(function (item) {
      var matches = needle === '' || item.textContent.toLowerCase().includes(needle);
      item.classList.toggle('hidden', !matches);
      if (matches) visibleCount++;
    });
    if (emptyState) emptyState.classList.toggle('show', visibleCount === 0);
    return visibleCount;
  }

  function initSearch() {
    var searchInput = document.getElementById('faqSearch');
    if (!searchInput) return;

    var faqItems = document.querySelectorAll('.faq-item');
    var emptyState = document.getElementById('faqEmpty');

    searchInput.addEventListener('input', function () {
      filterItems(faqItems, this.value, emptyState);
    });
  }

  function init() {
    initAccordion();
    initSearch();
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = {
      init: init,
      initAccordion: initAccordion,
      initSearch: initSearch,
      filterItems: filterItems
    };
  } else {
    init();
  }
})();
