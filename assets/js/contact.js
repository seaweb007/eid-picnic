/* ============================================================
   EID PICNIC 2027 — CONTACT.JS
   Builds a pre-filled WhatsApp message from the contact form
   instead of submitting to a server (no backend required).
   ============================================================ */
(function () {
  'use strict';

  var form = document.getElementById('contactForm');
  if (!form) return;

  var successBox = document.getElementById('formSuccess');
  var WHATSAPP_NUMBER = '2347032700697';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var LIMITS = { name: 80, email: 120, phone: 20, topic: 60, message: 1000 };

  function clean(value, limit) {
    return value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = clean(form.querySelector('#cf-name').value, LIMITS.name);
    var email = clean(form.querySelector('#cf-email').value, LIMITS.email);
    var phone = clean(form.querySelector('#cf-phone').value, LIMITS.phone);
    var topic = clean(form.querySelector('#cf-topic').value, LIMITS.topic);
    var message = form.querySelector('#cf-message').value.trim().slice(0, LIMITS.message);

    if (!name || !message || !EMAIL_RE.test(email)) {
      if (typeof form.reportValidity === 'function') form.reportValidity();
      return;
    }
    if (phone && !/^[0-9+()\-\s]{7,20}$/.test(phone)) {
      if (typeof form.reportValidity === 'function') form.reportValidity();
      return;
    }

    var lines = [
      'Hi, I\'m reaching out via the Eid Picnic 2027 website.',
      'Name: ' + name,
      'Email: ' + email
    ];
    if (phone) lines.push('Phone: ' + phone);
    lines.push('Topic: ' + topic);
    lines.push('Message: ' + message);

    var text = encodeURIComponent(lines.join('\n'));
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + text;

    if (successBox) successBox.classList.add('show');
    window.open(url, '_blank', 'noopener,noreferrer');
    form.reset();
  });
})();
