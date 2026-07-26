/* ============================================================
   EID PICNIC 2027 — COUNTDOWN.JS
   Drives any element set with #cd-days / #cd-hours / #cd-mins / #cd-secs
   Runs on every page that includes these elements (home + tickets).
   ============================================================ */
(function () {
  'use strict';

  // Provisional date — final date confirmed after moon sighting, Insha'Allah.
  var EVENT_DATE = new Date('2027-04-19T09:00:00+01:00').getTime();

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function parts(dist) {
    var clamped = Math.max(dist, 0);
    return {
      days: pad(Math.floor(clamped / 86400000)),
      hours: pad(Math.floor((clamped % 86400000) / 3600000)),
      mins: pad(Math.floor((clamped % 3600000) / 60000)),
      secs: pad(Math.floor((clamped % 60000) / 1000))
    };
  }

  function init(options) {
    options = options || {};
    var eventDate = options.eventDate == null ? EVENT_DATE : options.eventDate;

    var daysEl = document.getElementById('cd-days');
    var hoursEl = document.getElementById('cd-hours');
    var minsEl = document.getElementById('cd-mins');
    var secsEl = document.getElementById('cd-secs');

    if (!daysEl && !hoursEl && !minsEl && !secsEl) return null;

    function tick() {
      var p = parts(eventDate - Date.now());
      if (daysEl) daysEl.textContent = p.days;
      if (hoursEl) hoursEl.textContent = p.hours;
      if (minsEl) minsEl.textContent = p.mins;
      if (secsEl) secsEl.textContent = p.secs;
    }

    tick();
    var timer = setInterval(tick, 1000);
    return { tick: tick, stop: function () { clearInterval(timer); } };
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = { init: init, pad: pad, parts: parts, EVENT_DATE: EVENT_DATE };
  } else {
    init();
  }
})();
