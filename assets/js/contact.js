/* ============================================================
   EID PICNIC 2027 — CONTACT.JS
   Saves contact form submissions to a Google Sheet
   (via Google Apps Script). Optionally also opens WhatsApp.
   ============================================================ */
(function () {
  'use strict';

  var form = document.getElementById('contactForm');
  if (!form) return;

  var SHEET_URL = 'https://script.google.com/macros/s/AKfycbwEBZmi--YdcR7z1kCXs6QmsMdQeWu2xeHEIEbg8MExg9W-W6Mi4SRVx8gYsf4mzq7xuw/exec';
  var OPEN_WHATSAPP = false;            // set true to also open WhatsApp after saving
  var WHATSAPP_NUMBER = '2347032700697';

  var successBox = document.getElementById('formSuccess');
  var submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = form.querySelector('#cf-name').value.trim();
    var email = form.querySelector('#cf-email').value.trim();
    var phone = form.querySelector('#cf-phone').value.trim();
    var topic = form.querySelector('#cf-topic').value;
    var message = form.querySelector('#cf-message').value.trim();

    if (!name || !email || !message) return;

    var originalLabel = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    var body = new URLSearchParams({
      name: name, email: email, phone: phone, topic: topic, message: message
    });

    fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', body: body })
      .then(function () {
        if (successBox) {
          successBox.textContent = "Thanks! Your message has been received. We'll get back to you soon.";
          successBox.classList.add('show');
        }
        if (OPEN_WHATSAPP) {
          var text = encodeURIComponent(
            'Hi, I\'m reaching out via the Eid Picnic 2027 website.\nName: ' + name +
            '\nTopic: ' + topic + '\nMessage: ' + message
          );
          window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + text, '_blank', 'noopener');
        }
        form.reset();
      })
      .catch(function () {
        if (successBox) {
          successBox.textContent = 'Sorry, something went wrong. Please message us on WhatsApp instead.';
          successBox.classList.add('show');
        }
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalLabel;
      });
  });
})();
