/* ============================================================
   EID PICNIC 2027 — CONTACT.JS
   Builds a pre-filled WhatsApp message from the contact form
   instead of submitting to a server (no backend required).
   ============================================================ */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '2347032700697';

  function buildWhatsAppUrl(fields) {
    var lines = [
      'Hi, I\'m reaching out via the Eid Picnic 2027 website.',
      'Name: ' + fields.name,
      'Email: ' + fields.email
    ];
    if (fields.phone) lines.push('Phone: ' + fields.phone);
    lines.push('Topic: ' + fields.topic);
    lines.push('Message: ' + fields.message);

    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' +
      encodeURIComponent(lines.join('\n'));
  }

  function readFields(form) {
    return {
      name: form.querySelector('#cf-name').value.trim(),
      email: form.querySelector('#cf-email').value.trim(),
      phone: form.querySelector('#cf-phone').value.trim(),
      topic: form.querySelector('#cf-topic').value,
      message: form.querySelector('#cf-message').value.trim()
    };
  }

  function init() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var successBox = document.getElementById('formSuccess');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var fields = readFields(form);
      if (!fields.name || !fields.email || !fields.message) return;

      if (successBox) successBox.classList.add('show');
      window.open(buildWhatsAppUrl(fields), '_blank', 'noopener');
      form.reset();
    });
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = {
      init: init,
      readFields: readFields,
      buildWhatsAppUrl: buildWhatsAppUrl,
      WHATSAPP_NUMBER: WHATSAPP_NUMBER
    };
  } else {
    init();
  }
})();
