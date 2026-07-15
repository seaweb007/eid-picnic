/* ============================================================
   EID PICNIC 2027 — FAQ.JS
   Accordion behavior + live search filtering with an empty state.
   ============================================================ */
(function () {
  'use strict';

  // ===== ACCORDION =====
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

  // ===== SEARCH =====
  var searchInput = document.getElementById('faqSearch');
  if (!searchInput) return;

  var faqItems = document.querySelectorAll('.faq-item');
  var emptyState = document.getElementById('faqEmpty');

  searchInput.addEventListener('input', function () {
    var query = this.value.toLowerCase().trim();
    var visibleCount = 0;
    faqItems.forEach(function (item) {
      var text = item.textContent.toLowerCase();
      var matches = query === '' || text.includes(query);
      item.classList.toggle('hidden', !matches);
      if (matches) visibleCount++;
    });
    if (emptyState) emptyState.classList.toggle('show', visibleCount === 0);
  });
})();
