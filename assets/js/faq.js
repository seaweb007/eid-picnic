/* ============================================================
   EID PICNIC 2027 — FAQ.JS
   Accordion behavior + live search filtering with an empty state.
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

  // ===== ACCORDION =====
  run('faq accordion', function () {
    document.querySelectorAll('.faq-q').forEach(function (q) {
      var item = q.closest('.faq-item');
      if (!item) {
        reportError('faq accordion', new Error('.faq-q is not inside a .faq-item; question left inert'));
        return;
      }
      q.setAttribute('role', 'button');
      q.setAttribute('tabindex', '0');
      function toggle() {
        var wasActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('active'); });
        if (!wasActive) item.classList.add('active');
      }
      q.addEventListener('click', function () { run('faq toggle', toggle); });
      q.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run('faq toggle', toggle); }
      });
    });
  });

  // ===== SEARCH =====
  var searchInput = document.getElementById('faqSearch');
  if (!searchInput) return;

  var faqItems = document.querySelectorAll('.faq-item');
  var emptyState = document.getElementById('faqEmpty');

  searchInput.addEventListener('input', function () {
    run('faq search', function () {
      var query = searchInput.value.toLowerCase().trim();
      var visibleCount = 0;
      faqItems.forEach(function (item) {
        var matches = query === '' || item.textContent.toLowerCase().indexOf(query) !== -1;
        item.classList.toggle('hidden', !matches);
        if (matches) visibleCount++;
      });
      if (emptyState) emptyState.classList.toggle('show', visibleCount === 0);
    });
  });
})();
