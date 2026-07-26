/* ============================================================
   EID PICNIC 2027 — COUNTDOWN.JS
   Drives any element set with #cd-days / #cd-hours / #cd-mins / #cd-secs
   Runs on every page that includes these elements (home + tickets).
   ============================================================ */
(function () {
  'use strict';

  var reportError = (window.EidPicnic && window.EidPicnic.reportError) || function (context, err) {
    if (window.console && console.error) console.error('[Eid Picnic] ' + context + ':', err);
  };

  // Provisional date — final date confirmed after moon sighting, Insha'Allah.
  var EVENT_DATE = new Date('2027-04-19T09:00:00+01:00').getTime();

  var daysEl = document.getElementById('cd-days');
  var hoursEl = document.getElementById('cd-hours');
  var minsEl = document.getElementById('cd-mins');
  var secsEl = document.getElementById('cd-secs');

  var cells = [daysEl, hoursEl, minsEl, secsEl].filter(Boolean);
  if (!cells.length) return;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  // An unparseable date would otherwise render "NaN" in every cell once a second.
  if (isNaN(EVENT_DATE)) {
    reportError('countdown', new Error('event date could not be parsed'));
    cells.forEach(function (el) { el.textContent = '--'; });
    return;
  }

  function tick() {
    var clamped = Math.max(EVENT_DATE - Date.now(), 0);
    if (daysEl) daysEl.textContent = pad(Math.floor(clamped / 86400000));
    if (hoursEl) hoursEl.textContent = pad(Math.floor((clamped % 86400000) / 3600000));
    if (minsEl) minsEl.textContent = pad(Math.floor((clamped % 3600000) / 60000));
    if (secsEl) secsEl.textContent = pad(Math.floor((clamped % 60000) / 1000));
  }

  var timer = null;
  function safeTick() {
    try {
      tick();
    } catch (err) {
      reportError('countdown tick', err);
      if (timer !== null) clearInterval(timer);
    }
  }

  safeTick();
  timer = setInterval(safeTick, 1000);
})();
