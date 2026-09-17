import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadModule, setBody } from './helpers.js';

const FORM_MARKUP = `
  <form id="contactForm">
    <input id="cf-name" />
    <input id="cf-email" />
    <input id="cf-phone" />
    <select id="cf-topic"><option value="General">General</option><option value="Sponsorship">Sponsorship</option></select>
    <textarea id="cf-message"></textarea>
    <button type="submit">Send</button>
  </form>
  <div id="formSuccess"></div>
`;

function fill({ name = '', email = '', phone = '', topic = 'General', message = '' } = {}) {
  document.getElementById('cf-name').value = name;
  document.getElementById('cf-email').value = email;
  document.getElementById('cf-phone').value = phone;
  document.getElementById('cf-topic').value = topic;
  document.getElementById('cf-message').value = message;
}

function submit() {
  const event = new window.Event('submit', { bubbles: true, cancelable: true });
  document.getElementById('contactForm').dispatchEvent(event);
  return event;
}

describe('contact.buildWhatsAppUrl', () => {
  const { buildWhatsAppUrl, WHATSAPP_NUMBER } = loadModule('contact');

  const fields = { name: 'Aisha', email: 'a@example.com', phone: '', topic: 'General', message: 'Salaam' };

  it('targets the event WhatsApp number', () => {
    expect(buildWhatsAppUrl(fields)).toContain(`https://wa.me/${WHATSAPP_NUMBER}?text=`);
  });

  it('includes every provided field in the message body', () => {
    const text = decodeURIComponent(buildWhatsAppUrl(fields).split('?text=')[1]);
    expect(text).toContain('Name: Aisha');
    expect(text).toContain('Email: a@example.com');
    expect(text).toContain('Topic: General');
    expect(text).toContain('Message: Salaam');
  });

  it('omits the phone line when no phone is given', () => {
    const text = decodeURIComponent(buildWhatsAppUrl(fields).split('?text=')[1]);
    expect(text).not.toContain('Phone:');
  });

  it('includes the phone line when a phone is given', () => {
    const text = decodeURIComponent(
      buildWhatsAppUrl({ ...fields, phone: '08012345678' }).split('?text=')[1]
    );
    expect(text).toContain('Phone: 08012345678');
  });

  it('url-encodes newlines and special characters', () => {
    const url = buildWhatsAppUrl({ ...fields, message: 'Cost & date?' });
    expect(url).toContain('%0A');
    expect(url).toContain('%26');
    expect(url).not.toContain(' ');
  });
});

describe('contact.readFields', () => {
  const { readFields } = loadModule('contact');

  it('trims whitespace from text inputs but keeps the select value as-is', () => {
    setBody(FORM_MARKUP);
    fill({ name: '  Aisha  ', email: ' a@example.com ', phone: ' 0801 ', topic: 'Sponsorship', message: '  hi  ' });
    expect(readFields(document.getElementById('contactForm'))).toEqual({
      name: 'Aisha',
      email: 'a@example.com',
      phone: '0801',
      topic: 'Sponsorship',
      message: 'hi'
    });
  });
});

describe('contact.init', () => {
  let contact;
  let openSpy;

  beforeEach(() => {
    contact = loadModule('contact');
    openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  it('does nothing when the contact form is absent', () => {
    setBody('<div id="not-a-form"></div>');
    expect(() => contact.init()).not.toThrow();
  });

  it('opens WhatsApp, shows the success box and resets the form on valid submit', () => {
    setBody(FORM_MARKUP);
    contact.init();
    fill({ name: 'Aisha', email: 'a@example.com', message: 'Salaam' });

    const event = submit();

    expect(event.defaultPrevented).toBe(true);
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy.mock.calls[0][0]).toContain('https://wa.me/');
    expect(openSpy.mock.calls[0][1]).toBe('_blank');
    expect(document.getElementById('formSuccess').classList.contains('show')).toBe(true);
    expect(document.getElementById('cf-name').value).toBe('');
  });

  it.each([
    ['name', { email: 'a@example.com', message: 'Salaam' }],
    ['email', { name: 'Aisha', message: 'Salaam' }],
    ['message', { name: 'Aisha', email: 'a@example.com' }]
  ])('does not submit when %s is missing', (_field, values) => {
    setBody(FORM_MARKUP);
    contact.init();
    fill(values);

    submit();

    expect(openSpy).not.toHaveBeenCalled();
    expect(document.getElementById('formSuccess').classList.contains('show')).toBe(false);
  });

  it('treats whitespace-only required fields as empty', () => {
    setBody(FORM_MARKUP);
    contact.init();
    fill({ name: '   ', email: 'a@example.com', message: 'Salaam' });

    submit();

    expect(openSpy).not.toHaveBeenCalled();
  });

  it('still submits when the success box is missing from the page', () => {
    setBody('<form id="contactForm"><input id="cf-name" /><input id="cf-email" /><input id="cf-phone" /><select id="cf-topic"><option value="General">General</option></select><textarea id="cf-message"></textarea></form>');
    contact.init();
    fill({ name: 'Aisha', email: 'a@example.com', message: 'Salaam' });

    expect(() => submit()).not.toThrow();
    expect(openSpy).toHaveBeenCalledTimes(1);
  });
});
