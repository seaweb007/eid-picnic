/* ============================================================
   EID PICNIC 2027 — CONTACT.JS
   Builds a pre-filled WhatsApp message from the contact form
   instead of submitting to a server (no backend required).
   ============================================================ */
(function () {
  'use strict';

  var reportError = (window.EidPicnic && window.EidPicnic.reportError) || function (context, err) {
    if (window.console && console.error) console.error('[Eid Picnic] ' + context + ':', err);
  };

  var form = document.getElementById('contactForm');
  if (!form) return;

  var successBox = document.getElementById('formSuccess');
  var errorBox = document.getElementById('formError');
  var WHATSAPP_NUMBER = '2347032700697';

  function field(id) {
    var el = form.querySelector(id);
    if (!el) throw new Error('contact form is missing the ' + id + ' field');
    return el;
  }

  function showError(message) {
    if (successBox) successBox.classList.remove('show');
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.classList.add('show');
    }
  }

  function showSuccess(url) {
    if (errorBox) errorBox.classList.remove('show');
    if (!successBox) return;
    successBox.textContent = 'Thanks! We\'ve opened WhatsApp with your message ready to send. ';
    var link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Nothing happened? Open WhatsApp here.';
    successBox.appendChild(link);
    successBox.classList.add('show');
  }

  function clearMessages() {
    if (successBox) successBox.classList.remove('show');
    if (errorBox) errorBox.classList.remove('show');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearMessages();

    try {
      var nameEl = field('#cf-name');
      var emailEl = field('#cf-email');
      var phoneEl = field('#cf-phone');
      var topicEl = field('#cf-topic');
      var messageEl = field('#cf-message');

      var name = nameEl.value.trim();
      var email = emailEl.value.trim();
      var message = messageEl.value.trim();

      var missing = [
        { el: nameEl, value: name, label: 'your name' },
        { el: emailEl, value: email, label: 'your email' },
        { el: messageEl, value: message, label: 'a message' }
      ].filter(function (f) { return !f.value; });

      if (missing.length) {
        showError('Please add ' + missing.map(function (f) { return f.label; }).join(', ') + ' before sending.');
        missing[0].el.focus();
        return;
      }

      if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
        showError('Please correct the highlighted fields before sending.');
        return;
      }

      var lines = [
        'Hi, I\'m reaching out via the Eid Picnic 2027 website.',
        'Name: ' + name,
        'Email: ' + email
      ];
      var phone = phoneEl.value.trim();
      if (phone) lines.push('Phone: ' + phone);
      lines.push('Topic: ' + topicEl.value);
      lines.push('Message: ' + message);

      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));

      // `window.open` with `noopener` always resolves to null, so a blocked
      // popup is indistinguishable from a successful one: the notice carries a
      // direct link as a fallback rather than claiming the message was sent.
      window.open(url, '_blank', 'noopener');
      showSuccess(url);
      form.reset();
    } catch (err) {
      reportError('contact form submit', err);
      showError('Something went wrong preparing your message. Please message us at https://wa.me/' + WHATSAPP_NUMBER + '.');
    }
  });
})();
