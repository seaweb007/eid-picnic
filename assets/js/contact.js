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

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = form.querySelector('#cf-name').value.trim();
    var email = form.querySelector('#cf-email').value.trim();
    var phone = form.querySelector('#cf-phone').value.trim();
    var topic = form.querySelector('#cf-topic').value;
    var message = form.querySelector('#cf-message').value.trim();

    if (!name || !email || !message) return;

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
    window.open(url, '_blank', 'noopener');
    form.reset();
  });
})();
