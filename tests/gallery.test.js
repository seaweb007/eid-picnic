import { describe, it, expect, beforeEach } from 'vitest';
import { loadModule, setBody, click, keydown } from './helpers.js';

const GALLERY_MARKUP = `
  <div class="gallery-filters">
    <button class="filter-btn active" data-filter="all">All</button>
    <button class="filter-btn" data-filter="2025">2025</button>
    <button class="filter-btn" data-filter="2026">2026</button>
  </div>
  <div class="gallery-grid">
    <figure class="g-item" data-year="2025"><img src="a.jpg" alt="Kids sack race" /></figure>
    <figure class="g-item" data-year="2026"><img src="b.jpg" alt="Group prayer" /></figure>
    <figure class="g-item" data-year="2026"><img src="c.jpg" alt="" /></figure>
  </div>
  <div id="lightbox">
    <img id="lightboxImg" src="" alt="" />
    <button id="lightboxClose">x</button>
    <button id="lightboxPrev">prev</button>
    <button id="lightboxNext">next</button>
    <p id="lightboxCaption"></p>
  </div>
`;

const btns = () => Array.from(document.querySelectorAll('.filter-btn'));
const items = () => Array.from(document.querySelectorAll('.g-item'));
const imgs = () => Array.from(document.querySelectorAll('.g-item img'));
const lightbox = () => document.getElementById('lightbox');
const lightboxImg = () => document.getElementById('lightboxImg');
const isOpen = () => lightbox().classList.contains('open');
const shownSrc = () => lightboxImg().getAttribute('src').split('/').pop();

describe('gallery filters', () => {
  beforeEach(() => {
    setBody(GALLERY_MARKUP);
    loadModule('gallery').initFilters();
  });

  it('shows only items from the selected year', () => {
    click(btns()[1]);
    expect(items().map((i) => i.style.display)).toEqual(['block', 'none', 'none']);
  });

  it('shows every item for the "all" filter', () => {
    click(btns()[1]);
    click(btns()[0]);
    expect(items().map((i) => i.style.display)).toEqual(['block', 'block', 'block']);
  });

  it('moves the active class to the clicked button', () => {
    click(btns()[2]);
    expect(btns().map((b) => b.classList.contains('active'))).toEqual([false, false, true]);
  });

  it('animates items as they become visible', () => {
    click(btns()[2]);
    const faded = items().map((i) => i.classList.contains('fade-in-soft'));
    expect(faded).toEqual([false, true, true]);
  });
});

describe('gallery lightbox', () => {
  let gallery;

  beforeEach(() => {
    setBody(GALLERY_MARKUP);
    gallery = loadModule('gallery');
  });

  it('returns null when the page has no lightbox markup', () => {
    setBody('<div class="g-item"><img src="a.jpg" alt="a" /></div>');
    expect(gallery.initLightbox()).toBeNull();
  });

  it('opens with the clicked image and locks page scrolling', () => {
    gallery.initLightbox();
    click(imgs()[1]);
    expect(isOpen()).toBe(true);
    expect(shownSrc()).toBe('b.jpg');
    expect(document.getElementById('lightboxCaption').textContent).toBe('Group prayer');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('falls back to a generic alt when the image has none', () => {
    gallery.initLightbox();
    click(imgs()[2]);
    expect(lightboxImg().getAttribute('alt')).toBe('Eid Picnic gallery photo');
    expect(document.getElementById('lightboxCaption').textContent).toBe('');
  });

  it('closes via the close button and restores scrolling', () => {
    gallery.initLightbox();
    click(imgs()[0]);
    click(document.getElementById('lightboxClose'));
    expect(isOpen()).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('closes when the backdrop itself is clicked but not its children', () => {
    gallery.initLightbox();
    click(imgs()[0]);
    click(lightboxImg());
    expect(isOpen()).toBe(true);
    click(lightbox());
    expect(isOpen()).toBe(false);
  });

  it('steps forward and wraps around with the next button', () => {
    gallery.initLightbox();
    click(imgs()[2]);
    click(document.getElementById('lightboxNext'));
    expect(shownSrc()).toBe('a.jpg');
  });

  it('steps backward and wraps around with the prev button', () => {
    gallery.initLightbox();
    click(imgs()[0]);
    click(document.getElementById('lightboxPrev'));
    expect(shownSrc()).toBe('c.jpg');
  });

  it.each([
    ['ArrowRight', 'b.jpg'],
    ['ArrowLeft', 'c.jpg']
  ])('navigates with the %s key', (key, expected) => {
    gallery.initLightbox();
    click(imgs()[0]);
    keydown(document, key);
    expect(shownSrc()).toBe(expected);
  });

  it('closes on Escape', () => {
    gallery.initLightbox();
    click(imgs()[0]);
    keydown(document, 'Escape');
    expect(isOpen()).toBe(false);
  });

  it('ignores keyboard shortcuts while closed', () => {
    gallery.initLightbox();
    keydown(document, 'ArrowRight');
    expect(lightboxImg().getAttribute('src')).toBe('');
  });

  it('only navigates between images left visible by the active filter', () => {
    gallery.init();
    click(btns()[2]);
    click(imgs()[1]);
    expect(shownSrc()).toBe('b.jpg');
    click(document.getElementById('lightboxNext'));
    expect(shownSrc()).toBe('c.jpg');
    click(document.getElementById('lightboxNext'));
    expect(shownSrc()).toBe('b.jpg');
  });

  it('exposes an API that works without any gallery images', () => {
    setBody('<div id="lightbox"><img id="lightboxImg" src="" alt="" /></div>');
    const api = gallery.initLightbox();
    api.next();
    api.prev();
    api.open(null);
    expect(isOpen()).toBe(true);
    expect(lightboxImg().getAttribute('src')).toBe('');
  });
});
