import { describe, it, expect, beforeEach } from 'vitest';
import { loadModule, setBody, click, keydown, input } from './helpers.js';

const FAQ_MARKUP = `
  <input id="faqSearch" />
  <div class="faq-list">
    <div class="faq-item"><div class="faq-q">Is parking available?</div><div class="faq-a">Yes, free parking.</div></div>
    <div class="faq-item"><div class="faq-q">Can I bring children?</div><div class="faq-a">Children are welcome.</div></div>
    <div class="faq-item"><div class="faq-q">Are tickets refundable?</div><div class="faq-a">No refunds.</div></div>
  </div>
  <p id="faqEmpty">Nothing found</p>
`;

const items = () => Array.from(document.querySelectorAll('.faq-item'));
const questions = () => Array.from(document.querySelectorAll('.faq-q'));
const activeIndexes = () => items().reduce((acc, item, i) => (item.classList.contains('active') ? [...acc, i] : acc), []);
const hiddenIndexes = () => items().reduce((acc, item, i) => (item.classList.contains('hidden') ? [...acc, i] : acc), []);

describe('faq accordion', () => {
  let faq;

  beforeEach(() => {
    setBody(FAQ_MARKUP);
    faq = loadModule('faq');
    faq.initAccordion();
  });

  it('makes questions keyboard-focusable buttons', () => {
    questions().forEach((q) => {
      expect(q.getAttribute('role')).toBe('button');
      expect(q.getAttribute('tabindex')).toBe('0');
    });
  });

  it('opens the clicked item', () => {
    click(questions()[1]);
    expect(activeIndexes()).toEqual([1]);
  });

  it('collapses the item when clicked again', () => {
    click(questions()[1]);
    click(questions()[1]);
    expect(activeIndexes()).toEqual([]);
  });

  it('keeps only one item open at a time', () => {
    click(questions()[0]);
    click(questions()[2]);
    expect(activeIndexes()).toEqual([2]);
  });

  it.each(['Enter', ' '])('toggles on %s key', (key) => {
    keydown(questions()[0], key);
    expect(activeIndexes()).toEqual([0]);
  });

  it('ignores other keys', () => {
    keydown(questions()[0], 'a');
    expect(activeIndexes()).toEqual([]);
  });

  it('prevents the default action for handled keys', () => {
    const event = new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    questions()[0].dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});

describe('faq.filterItems', () => {
  let faq;

  beforeEach(() => {
    setBody(FAQ_MARKUP);
    faq = loadModule('faq');
  });

  it('hides items that do not match and reports the visible count', () => {
    const count = faq.filterItems(items(), 'parking', document.getElementById('faqEmpty'));
    expect(count).toBe(1);
    expect(hiddenIndexes()).toEqual([1, 2]);
  });

  it('matches answers as well as questions, case-insensitively', () => {
    expect(faq.filterItems(items(), 'REFUNDS', null)).toBe(1);
    expect(hiddenIndexes()).toEqual([0, 1]);
  });

  it('shows everything for an empty or whitespace-only query', () => {
    faq.filterItems(items(), 'parking', null);
    expect(faq.filterItems(items(), '   ', null)).toBe(3);
    expect(hiddenIndexes()).toEqual([]);
  });

  it('toggles the empty state only when nothing matches', () => {
    const empty = document.getElementById('faqEmpty');
    faq.filterItems(items(), 'zzz', empty);
    expect(empty.classList.contains('show')).toBe(true);
    faq.filterItems(items(), 'children', empty);
    expect(empty.classList.contains('show')).toBe(false);
  });

  it('tolerates a missing empty-state element', () => {
    expect(() => faq.filterItems(items(), 'zzz', null)).not.toThrow();
  });
});

describe('faq.initSearch', () => {
  let faq;

  beforeEach(() => {
    faq = loadModule('faq');
  });

  it('filters as the user types', () => {
    setBody(FAQ_MARKUP);
    faq.initSearch();
    input(document.getElementById('faqSearch'), 'children');
    expect(hiddenIndexes()).toEqual([0, 2]);
    expect(document.getElementById('faqEmpty').classList.contains('show')).toBe(false);
  });

  it('does nothing when the page has no search input', () => {
    setBody('<div class="faq-item"><div class="faq-q">Q</div></div>');
    expect(() => faq.initSearch()).not.toThrow();
  });

  it('init wires up both the accordion and the search box', () => {
    setBody(FAQ_MARKUP);
    faq.init();
    click(questions()[0]);
    input(document.getElementById('faqSearch'), 'zzz');
    expect(activeIndexes()).toEqual([0]);
    expect(hiddenIndexes()).toEqual([0, 1, 2]);
    expect(document.getElementById('faqEmpty').classList.contains('show')).toBe(true);
  });
});
