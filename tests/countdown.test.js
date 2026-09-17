import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadModule, setBody } from './helpers.js';

const COUNTDOWN_MARKUP = `
  <span id="cd-days"></span>
  <span id="cd-hours"></span>
  <span id="cd-mins"></span>
  <span id="cd-secs"></span>
`;

function readDisplay() {
  return {
    days: document.getElementById('cd-days').textContent,
    hours: document.getElementById('cd-hours').textContent,
    mins: document.getElementById('cd-mins').textContent,
    secs: document.getElementById('cd-secs').textContent
  };
}

describe('countdown.pad', () => {
  const { pad } = loadModule('countdown');

  it('pads single digits to two characters', () => {
    expect(pad(0)).toBe('00');
    expect(pad(9)).toBe('09');
  });

  it('leaves values of two or more digits alone', () => {
    expect(pad(10)).toBe('10');
    expect(pad(365)).toBe('365');
  });
});

describe('countdown.parts', () => {
  const { parts } = loadModule('countdown');

  it('splits a distance into padded days/hours/mins/secs', () => {
    const dist = (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000;
    expect(parts(dist)).toEqual({ days: '02', hours: '03', mins: '04', secs: '05' });
  });

  it('ignores sub-second remainders', () => {
    expect(parts(1999)).toEqual({ days: '00', hours: '00', mins: '00', secs: '01' });
  });

  it('clamps past distances to zero instead of counting negative', () => {
    expect(parts(-100000)).toEqual({ days: '00', hours: '00', mins: '00', secs: '00' });
  });
});

describe('countdown.init', () => {
  let countdown;
  let handle;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-01-01T00:00:00Z'));
    countdown = loadModule('countdown');
    handle = null;
  });

  afterEach(() => {
    if (handle) handle.stop();
    vi.useRealTimers();
  });

  it('returns null when no countdown elements are on the page', () => {
    setBody('<div id="unrelated"></div>');
    expect(countdown.init()).toBeNull();
  });

  it('renders the remaining time immediately', () => {
    setBody(COUNTDOWN_MARKUP);
    handle = countdown.init({ eventDate: Date.now() + (86400 + 7200 + 180 + 4) * 1000 });
    expect(readDisplay()).toEqual({ days: '01', hours: '02', mins: '03', secs: '04' });
  });

  it('updates once per second', () => {
    setBody(COUNTDOWN_MARKUP);
    handle = countdown.init({ eventDate: Date.now() + 10000 });
    expect(readDisplay().secs).toBe('10');
    vi.advanceTimersByTime(3000);
    expect(readDisplay().secs).toBe('07');
  });

  it('stops updating once the handle is stopped', () => {
    setBody(COUNTDOWN_MARKUP);
    handle = countdown.init({ eventDate: Date.now() + 10000 });
    handle.stop();
    vi.advanceTimersByTime(5000);
    expect(readDisplay().secs).toBe('10');
  });

  it('shows zeros after the event date has passed', () => {
    setBody(COUNTDOWN_MARKUP);
    handle = countdown.init({ eventDate: Date.now() - 60000 });
    expect(readDisplay()).toEqual({ days: '00', hours: '00', mins: '00', secs: '00' });
  });

  it('works when only some countdown elements exist', () => {
    setBody('<span id="cd-days"></span>');
    handle = countdown.init({ eventDate: Date.now() + 5 * 86400000 });
    expect(document.getElementById('cd-days').textContent).toBe('05');
  });

  it('defaults to the provisional event date', () => {
    setBody(COUNTDOWN_MARKUP);
    handle = countdown.init();
    expect(countdown.EVENT_DATE).toBe(new Date('2027-04-19T09:00:00+01:00').getTime());
    expect(readDisplay()).toEqual(countdown.parts(countdown.EVENT_DATE - Date.now()));
  });
});
