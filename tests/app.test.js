import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadModule, setBody, click } from './helpers.js';

function scrollTo(y) {
  window.scrollY = y;
  window.dispatchEvent(new window.Event('scroll'));
}

describe('app.initPreloader', () => {
  let app;

  beforeEach(() => {
    vi.useFakeTimers();
    app = loadModule('app');
  });

  afterEach(() => vi.useRealTimers());

  it('hides the preloader shortly after load', () => {
    setBody('<div id="preloader"></div>');
    app.initPreloader();
    window.dispatchEvent(new window.Event('load'));
    expect(document.getElementById('preloader').classList.contains('hide')).toBe(false);
    vi.advanceTimersByTime(400);
    expect(document.getElementById('preloader').classList.contains('hide')).toBe(true);
  });

  it('does nothing when the page has no preloader', () => {
    setBody('<main></main>');
    app.initPreloader();
    expect(() => {
      window.dispatchEvent(new window.Event('load'));
      vi.advanceTimersByTime(400);
    }).not.toThrow();
  });
});

describe('app.initScrollState', () => {
  let app;

  beforeEach(() => {
    app = loadModule('app');
    setBody('<nav id="navbar"></nav><div id="stickyCta"></div>');
    window.scrollY = 0;
  });

  const navbar = () => document.getElementById('navbar').classList.contains('scrolled');
  const cta = () => document.getElementById('stickyCta').classList.contains('show');

  it('starts unstyled at the top of the page', () => {
    app.initScrollState();
    expect(navbar()).toBe(false);
    expect(cta()).toBe(false);
  });

  it('marks the navbar scrolled past 40px but leaves the CTA hidden', () => {
    app.initScrollState();
    scrollTo(41);
    expect(navbar()).toBe(true);
    expect(cta()).toBe(false);
  });

  it('shows the sticky CTA past 700px', () => {
    app.initScrollState();
    scrollTo(701);
    expect(cta()).toBe(true);
  });

  it('reverts both when scrolling back to the top', () => {
    app.initScrollState();
    scrollTo(900);
    scrollTo(0);
    expect(navbar()).toBe(false);
    expect(cta()).toBe(false);
  });

  it('applies the current scroll position immediately on init', () => {
    window.scrollY = 800;
    app.initScrollState();
    expect(navbar()).toBe(true);
    expect(cta()).toBe(true);
  });

  it('tolerates pages without a navbar or sticky CTA', () => {
    setBody('<main></main>');
    app.initScrollState();
    expect(() => scrollTo(800)).not.toThrow();
  });
});

describe('app.initNavToggle', () => {
  let app;

  const NAV_MARKUP = `
    <button id="navToggle" aria-expanded="false"></button>
    <ul id="navLinks" class="nav-links">
      <li><a href="#about" data-page="about">About</a></li>
      <li><a href="#faq" data-page="faq">FAQ</a></li>
    </ul>
  `;

  beforeEach(() => {
    app = loadModule('app');
    setBody(NAV_MARKUP);
    app.initNavToggle();
  });

  const links = () => document.getElementById('navLinks');
  const toggle = () => document.getElementById('navToggle');

  it('opens the menu and reflects state in aria-expanded', () => {
    click(toggle());
    expect(links().classList.contains('open')).toBe(true);
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
  });

  it('closes the menu on a second toggle', () => {
    click(toggle());
    click(toggle());
    expect(links().classList.contains('open')).toBe(false);
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the menu when a nav link is followed', () => {
    click(toggle());
    click(links().querySelector('a'));
    expect(links().classList.contains('open')).toBe(false);
  });

  it('does nothing when the nav markup is incomplete', () => {
    setBody('<button id="navToggle"></button>');
    expect(() => app.initNavToggle()).not.toThrow();
  });
});

describe('app.initActiveNavLink', () => {
  let app;

  beforeEach(() => {
    app = loadModule('app');
  });

  function render(page) {
    setBody('<ul class="nav-links"><li><a data-page="about">About</a></li><li><a data-page="faq">FAQ</a></li></ul>');
    document.body.setAttribute('data-page', page);
    app.initActiveNavLink();
    return Array.from(document.querySelectorAll('.nav-links a')).map((a) => a.classList.contains('active'));
  }

  it('marks the link matching the current page', () => {
    expect(render('faq')).toEqual([false, true]);
  });

  it('matches case-insensitively', () => {
    expect(render('FAQ')).toEqual([false, true]);
  });

  it('marks nothing for an unknown or missing page', () => {
    expect(render('')).toEqual([false, false]);
    expect(render('sponsors')).toEqual([false, false]);
  });
});

describe('app.initScrollReveal', () => {
  let app;
  let observed;
  let unobserved;
  let capturedCallback;
  const originalIO = window.IntersectionObserver;

  beforeEach(() => {
    app = loadModule('app');
    observed = [];
    unobserved = [];
    capturedCallback = null;
    window.IntersectionObserver = class {
      constructor(cb) {
        capturedCallback = cb;
      }
      observe(el) { observed.push(el); }
      unobserve(el) { unobserved.push(el); }
    };
    setBody('<div data-aos="fade-up"></div><div data-aos="fade-up" data-aos-delay="200"></div>');
  });

  afterEach(() => {
    if (originalIO) {
      window.IntersectionObserver = originalIO;
    } else {
      delete window.IntersectionObserver;
    }
  });

  it('observes every element marked for reveal', () => {
    app.initScrollReveal();
    expect(observed).toHaveLength(2);
  });

  it('animates elements as they intersect and stops observing them', () => {
    app.initScrollReveal();
    const els = Array.from(document.querySelectorAll('[data-aos]'));
    capturedCallback([{ isIntersecting: true, target: els[0] }, { isIntersecting: false, target: els[1] }]);
    expect(els[0].classList.contains('aos-animate')).toBe(true);
    expect(els[1].classList.contains('aos-animate')).toBe(false);
    expect(unobserved).toEqual([els[0]]);
  });

  it('converts the delay attribute into a CSS transition delay', () => {
    app.initScrollReveal();
    const el = document.querySelectorAll('[data-aos]')[1];
    capturedCallback([{ isIntersecting: true, target: el }]);
    expect(el.style.transitionDelay).toBe('0.2s');
  });

  it('reveals everything immediately when IntersectionObserver is unavailable', () => {
    delete window.IntersectionObserver;
    app.initScrollReveal();
    const revealed = Array.from(document.querySelectorAll('[data-aos]')).map((el) => el.classList.contains('aos-animate'));
    expect(revealed).toEqual([true, true]);
  });

  it('does not construct an observer when nothing is marked for reveal', () => {
    setBody('<main></main>');
    app.initScrollReveal();
    expect(capturedCallback).toBeNull();
  });
});

describe('app.initFooterYear', () => {
  it('stamps the current year into every year placeholder', () => {
    const app = loadModule('app');
    setBody('<span data-year></span><span data-year></span>');
    app.initFooterYear();
    const year = String(new Date().getFullYear());
    Array.from(document.querySelectorAll('[data-year]')).forEach((el) => {
      expect(el.textContent).toBe(year);
    });
  });
});

describe('app.initExternalLinks', () => {
  it('adds noopener/noreferrer to new-tab links that lack a rel', () => {
    const app = loadModule('app');
    setBody('<a href="https://x.test" target="_blank">x</a>');
    app.initExternalLinks();
    expect(document.querySelector('a').getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('leaves an existing rel untouched', () => {
    const app = loadModule('app');
    setBody('<a href="https://x.test" target="_blank" rel="external">x</a>');
    app.initExternalLinks();
    expect(document.querySelector('a').getAttribute('rel')).toBe('external');
  });

  it('ignores same-tab links', () => {
    const app = loadModule('app');
    setBody('<a href="about.html">about</a>');
    app.initExternalLinks();
    expect(document.querySelector('a').getAttribute('rel')).toBeNull();
  });
});

describe('app.init', () => {
  it('wires up every page behavior together', () => {
    const app = loadModule('app');
    setBody(`
      <nav id="navbar"></nav>
      <button id="navToggle" aria-expanded="false"></button>
      <ul id="navLinks" class="nav-links"><li><a href="#faq" data-page="faq">FAQ</a></li></ul>
      <div data-aos="fade-up"></div>
      <span data-year></span>
      <a href="https://x.test" target="_blank">x</a>
    `);
    document.body.setAttribute('data-page', 'faq');

    app.init();

    click(document.getElementById('navToggle'));
    expect(document.getElementById('navLinks').classList.contains('open')).toBe(true);
    expect(document.querySelector('.nav-links a').classList.contains('active')).toBe(true);
    expect(document.querySelector('[data-year]').textContent).toBe(String(new Date().getFullYear()));
    expect(document.querySelector('a[target="_blank"]').getAttribute('rel')).toBe('noopener noreferrer');
  });
});
