# Eid Picnic 2027 — Website

A production-ready, multi-page website for **Eid Picnic 2027**, Akure's largest
community Eid celebration, organized by **Jannah Immigrants**.

This rebuild takes the original single-file prototype and turns it into a real
static site: one HTML file per page, shared CSS/JS assets, and real URLs
(`about.html`, `tickets.html`, etc.) instead of a JavaScript router — so every
page works with the browser's back button, can be bookmarked, and is
indexable by search engines.

## Structure

```
eid-picnic-2027/
├── index.html          Home — hero, countdown, highlights, previews
├── about.html           Story, mission/vision, timeline, team
├── gallery.html          Filterable photo gallery + lightbox
├── activities.html       All 11 activity zones
├── schedule.html         Full day-of timeline
├── tickets.html          Ticket tiers (General / Family / VIP) + countdown
├── sponsors.html         Sponsor tiers & benefits
├── vendors.html          Vendor opportunities & registration process
├── volunteers.html       Volunteer roles, responsibilities, benefits
├── faq.html              Searchable FAQ accordion
├── contact.html          Contact details, map, and a contact form
├── 404.html              Custom not-found page
├── assets/
│   ├── css/
│   │   ├── style.css        Design tokens, typography, components
│   │   ├── responsive.css   All @media breakpoints
│   │   └── animations.css   Keyframes + scroll-reveal
│   ├── js/
│   │   ├── app.js           Nav, preloader, scroll reveal, sticky CTA
│   │   ├── gallery.js        Year filter + accessible lightbox
│   │   ├── countdown.js      Countdown timer (home + tickets)
│   │   ├── faq.js            Accordion + live search
│   │   └── contact.js        Builds a pre-filled WhatsApp message
│   └── images/
│       ├── gallery/          Drop in real event photos here
│       ├── sponsors/         Sponsor logos
│       ├── activities/       Activity photos/icons
│       └── team/             Team headshots
└── README.md
```

## What changed from the original prototype

- **Real multi-page navigation.** The original was a single HTML file with a
  JS router (`navigateTo()`) toggling `<div class="page">` blocks. Every page
  is now its own file with its own `<title>`, meta description, and URL.
- **Shared design system extracted to `assets/css/`.** Same brand colors,
  fonts (Fraunces + Inter), buttons, cards, and layout patterns — just split
  into `style.css` (components), `responsive.css` (breakpoints), and
  `animations.css` (motion) so they're easy to find and edit.
  - No visual changes: gold/emerald/ivory palette, rounded cards, the
    crescent-and-countdown hero motif, and the gold marquee are all intact.
- **Self-contained scroll animations.** The prototype loaded the AOS library
  from a CDN. This build replaces it with a small `IntersectionObserver` in
  `app.js` that respects the same `data-aos` / `data-aos-delay` attributes
  already in the markup — one fewer external dependency, and it honors
  `prefers-reduced-motion`.
- **New pages split out for clarity:**
  - `tickets.html` replaces the old "Reserve" page and adds three real ticket
    tiers (General / Family / VIP) plus its own countdown, while keeping the
    WhatsApp-only checkout flow (no prices are ever displayed — enquiries go
    straight to WhatsApp, exactly like the original).
  - `sponsors.html` now shows Gold/Silver/Bronze tier badges instead of plain
    text.
  - `faq.html` gained an empty-state message when a search returns nothing.
  - `contact.html` gained a real contact form. It has no backend — submitting
    it opens WhatsApp with the message pre-filled, so no server or database
    is required to launch this site.
- **Accessibility passes:** skip-to-content link, `aria-label`s on icon-only
  buttons/links, keyboard support for the FAQ accordion and lightbox (arrow
  keys + Escape), and `rel="noopener noreferrer"` on external links.
- **Images stay as hosted placeholders** (Unsplash / pravatar URLs), matching
  the original prototype. Folders under `assets/images/` are ready for real
  photos — see "Replacing placeholder images" below.

## Running the site locally

No build step or server is required — it's plain HTML/CSS/JS. Two options:

1. **Just open it.** Double-click `index.html` (works, but a few features
   like `fetch`-based embeds may be more reliable served over HTTP).
2. **Serve it locally** (recommended):
   ```bash
   cd eid-picnic-2027
   python3 -m http.server 8000
   # then open http://localhost:8000
   ```

## Deploying

This is a static site, so it works on any static host: GitHub Pages, Netlify,
Vercel, Cloudflare Pages, or a plain Apache/Nginx server. Just upload the
contents of `eid-picnic-2027/` as-is. Set `404.html` as the custom error page
in your host's settings if it supports one (Netlify and GitHub Pages both do
automatically by filename).

## Replacing placeholder images

Photos currently point to Unsplash/pravatar URLs so the site looks complete
out of the box. To use real photos:

1. Drop files into the matching folder (`assets/images/gallery/`,
   `assets/images/team/`, etc.).
2. Update the `src="..."` attribute on the relevant `<img>` tag in the HTML
   file (e.g. gallery photos are in `gallery.html`, team photos in
   `about.html`).
3. Keep `alt` text descriptive — it's used for accessibility and is what
   shows in the lightbox caption on the gallery page.

## Editing content

- **Text content** lives directly in each page's HTML — search for the
  relevant heading text to find the section quickly.
- **Colors, fonts, spacing** are CSS custom properties at the top of
  `assets/css/style.css` (`:root { --gold: ...; --ink: ...; }`). Changing a
  variable there updates it site-wide.
- **WhatsApp numbers** appear as `wa.me/234...` links throughout. Search and
  replace to update them everywhere at once.
- **Event date** for the countdown lives in `assets/js/countdown.js`
  (`EVENT_DATE`) — update it once the date is confirmed after moon sighting.
- **Nav links / footer links** are generated per page from the same list in
  each page's `<head>`/`<nav>` markup — if you add a new page, copy the
  `<li>` pattern into every page's nav and footer.

## Browser support

Built with standard CSS (custom properties, grid, flexbox) and vanilla JS
(`IntersectionObserver`, `fetch`-free). Works in all evergreen browsers
(Chrome, Firefox, Safari, Edge). No IE11 support.

---

*Celebrate Together. Connect Forever.* — Eid Picnic 2027, Jannah Immigrants.
