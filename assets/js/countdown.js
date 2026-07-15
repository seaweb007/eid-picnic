/* ============================================================
   EID PICNIC 2027 — COUNTDOWN.JS
   Drives any element set with #cd-days / #cd-hours / #cd-mins / #cd-secs
   Runs on every page that includes these elements (home + tickets).
   ============================================================ */
(function () {
  'use strict';

  // Provisional date — final date confirmed after moon sighting, Insha'Allah.
  var EVENT_DATE = new Date('2027-04-19T09:00:00+01:00').getTime();

  var daysEl = document.getElementById('cd-days');
  var hoursEl = document.getElementById('cd-hours');
  var minsEl = document.getElementById('cd-mins');
  var secsEl = document.getElementById('cd-secs');

  if (!daysEl && !hoursEl && !minsEl && !secsEl) return;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function tick() {
    var dist = EVENT_DATE - Date.now();
    var clamped = Math.max(dist, 0);
    if (daysEl) daysEl.textContent = pad(Math.floor(clamped / 86400000));
    if (hoursEl) hoursEl.textContent = pad(Math.floor((clamped % 86400000) / 3600000));
    if (minsEl) minsEl.textContent = pad(Math.floor((clamped % 3600000) / 60000));
    if (secsEl) secsEl.textContent = pad(Math.floor((clamped % 60000) / 1000));
  }

  tick();
  setInterval(tick, 1000);
})();
