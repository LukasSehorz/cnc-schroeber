# uptivemfg.com — Animation & Motion Design Reverse-Engineering

Captured 2026-08-05. Viewport 1600×900, Chromium 131 (Playwright 1.62.1).
Screenshots: `_analysis/shots/uptive-motion/`
Raw dumps: `stack-report.json`, `dom-report.json`, `scroll-log.json`, `theme-app.js`, `theme-site.css`, `theme-site.pretty.css`, `home.html`

---

## 0. TL;DR — the honest headline

**There is no GSAP, no Lenis, no ScrollTrigger, no SplitType, no pinning, no parallax, no scrub, no page transitions on this site.**

The entire "premium" feel comes from **four CSS classes toggled by one 30-line IntersectionObserver**, plus solid art direction (big Kallisto display type, alternating full-bleed image break-outs, a consistent navy/sky-blue palette). The motion vocabulary is deliberately tiny and consistent:

| What | Motion |
|---|---|
| Everything that enters on scroll | `opacity 0→1` (+ optional `translateX ±100px→0`) |
| Duration | **0.5 s** (side entrances) or **1.3 s** (pure fades) |
| Easing | CSS default `ease` = `cubic-bezier(0.25, 0.1, 0.25, 1)` — *measured and confirmed*, no custom curves |
| Trigger | IntersectionObserver `threshold: 0.2`, **fires once**, then `unobserve()` |
| Direction | Horizontal only. **Zero vertical movement anywhere on the site.** |
| Stagger | **None.** Grouped elements fire simultaneously. |

If you're rebuilding with GSAP you can (and should) *exceed* this — see §7 "Upgrade path". But if the client says "make it exactly like Uptive", the recipe in §6 is 40 lines of code.

---

## 1. Animation stack detection

### 1.1 `window` globals

```
Filtered against: gsap, ScrollTrigger, ScrollSmoother, Lenis, locomotive, barba,
Swiper, Splitting, SplitType, framer, Motion, AOS, ScrollMagic, THREE, lottie,
bodymovin, anime, TweenMax, TimelineMax, Observer, CustomEase, ScrollReveal, Rellax…

FOUND: ["jQuery", "wp"]      ← that's it
```

`gsap` → **undefined**. `ScrollTrigger.getAll()` → not available. No animation library is loaded.

### 1.2 All `<script src>` on the homepage

**First-party (the only ones that matter):**
```
https://uptivemfg.com/wp-content/themes/industrial/resources/js/app.js?v=52cbac6   ← ALL custom behaviour, 116 KB
https://uptivemfg.com/wp-includes/js/jquery/jquery.min.js
https://uptivemfg.com/wp-includes/js/jquery/jquery-migrate.min.js
```

**Bundled inside `app.js`** (concatenated, not separate requests):
- **Splide.js 4.1.4** (MIT, © 2022 Naotoshi Fujita) — the only 3rd-party UI lib. Used for a 2-per-page testimonial/card carousel on solution pages. `speed: 800`, `perPage: 2`, `breakpoints: {1024: {perPage: 1}}`, `padding: {left: '1rem', right: '1rem'}`.
- **GLightbox** — image lightbox.
- Custom modules: search toggle, nav/offcanvas toggle, submenu injection, `[data-equalize]` height matching, `IndustrialLeadSource` tracking, GA4 `metrics.track` wrapper.

**Third-party (analytics/forms only, no motion):**
```
googletagmanager.com/gtm.js?id=GTM-KLZ3KK5J          gtag AW-855404720 + G-SXX02M9P28
clarity.ms/tag/x831l23j1b                            bat.bing.com/bat.js
snap.licdn.com/li.lms-analytics/insight.min.js       cdn.callrail.com/.../swap.js
js.hsforms.net/forms/embed/v2.js                     assets.trendemon.com/tag/trends.min.js
google.com/recaptcha/enterprise.js                   ZoomInfo (obfuscated inline loader)
use.typekit.net/pgd8wll.js                           ← Adobe Fonts (Kallisto)
+ gravityforms/* (7 files), plupload, jquery-ui datepicker
```

### 1.3 Stylesheets

```
https://uptivemfg.com/wp-content/themes/industrial/resources/css/site.css?v=52cbac6   ← 63.7 KB, 735 rules, ALL site styling
+ WordPress core/block-editor CSS, Gravity Forms CSS, Font Awesome, dashicons
```

`site.css` is a **Tailwind build** (tell-tale `--tw-bg-opacity`, `.ease-in-out`, `.transition` utility classes) with a custom layer on top.

**Fonts:** Adobe Typekit kit `pgd8wll` → **Kallisto** (weights n3/n5/n8) for display headings, `Raleway` for buttons/labels/nav, `Roboto` for body. Note `html.wf-inactive` in the capture — Typekit timed out in headless; live the class is `wf-active`.

### 1.4 Smooth scrolling — NOT hijacked

- `html` classes: `wf-inactive wf-kallisto-*` (Typekit only, no `lenis`/`has-scroll-smooth`)
- `body` classes: `home wp-singular page-template-default page page-id-3700 wp-theme-industrial`
- `getComputedStyle(html).scrollBehavior` → `auto`
- `body.transform` → `none`; `body.position` → `static`; no `overflow: hidden` on html/body
- **No transformed wrapper element anywhere.** `main#content` is `position: static`.
- Native browser scroll. Scroll position maps 1:1 to page geometry.

### 1.5 CSS motion inventory

**`@keyframes` in `site.css` (11 total — 10 are vendor, 1 is the theme's):**
```css
/* THEME — the only custom keyframe on the site */
@keyframes submenuAnimation { 0% {opacity:0; transform:scaleY(0)} 80% {opacity:1} to {transform:scaleY(1)} }

/* Splide */    @keyframes splide-loading  { 0%{transform:rotate(0)} to{transform:rotate(1turn)} }
/* GLightbox */ @keyframes lightboxLoader, gfadeIn, gfadeOut, gslideInLeft, gslideOutLeft,
                           gslideInRight, gslideOutRight, gzoomIn, gzoomOut
```

**Every `cubic-bezier()` in `site.css` — all four occurrences:**
```css
cubic-bezier(.16, 1, .3, 1)   /* ═ "easeOutExpo" — .faq-icon rotate + .faq-item::details-content block-size */
cubic-bezier(.4, 0, .2, 1)    /* ═ Tailwind default / Material standard — .transition + .ease-in-out utilities */
```
That's the complete list. **Both are used only on the FAQ accordion and Tailwind utility classes.** None of the scroll-reveal animations use a custom curve — they all inherit CSS default `ease` = `cubic-bezier(0.25, 0.1, 0.25, 1)`.

**Every `transition` declaration in `site.css` (complete, deduped):**
```css
.on-view-ready.fade-in            { opacity:0; transition: all 1.3s }            /* ease (default) */
.on-view-ready.fade-in-left       { opacity:0; transform:translateX(-100px); transition: all .5s }
.on-view-ready.fade-in-right      { opacity:0; transform:translateX(100px);  transition: all .5s }
#hero-img                         { transition: opacity 1.3s ease }
.btn, .btn .btn-arrow             { transition: all .3s }
main a:link:not(.btn), main a:not(.btn) { transition: all .3s }
.section-nav-link                 { transition: color .3s ease-in-out, background-color .2s }
.section-nav-link svg             { transition: filter 10ms, transform .5s }
.flip-card-inner                  { transition: transform .8s }
[data-nav-toggle] span            { transition: all .3s ease }
[data-nav-state]                  { transition: all .3s ease }
.offcanvas                        { transition: all .25s ease-out }   /* → none ≥640px */
#search-form                      { transition: all .3s }
.faq-question                     { transition: color .25s ease }
.faq-icon                         { transition: transform .3s cubic-bezier(.16,1,.3,1) }
.faq-item::details-content        { transition: block-size .35s cubic-bezier(.16,1,.3,1),
                                                opacity .3s ease,
                                                content-visibility allow-discrete .35s }
.toc-toggle-icon                  { transition: transform .2s ease }
.splide__pagination__page         { transition: transform .2s linear }
.pagination .page-numbers         { transition: all .35s }
.greset                           { transition: all .3s ease }
.glightbox-container .gslider     { transition: transform .4s ease }
.transition (Tailwind)            { transition-duration:.15s; timing-function: cubic-bezier(.4,0,.2,1) }
```

**`will-change`:** exactly one occurrence, `.goverlay { will-change: opacity }` — GLightbox vendor CSS. **Zero `will-change` on any theme element.**

**`clip-path`:** exactly two rules, both `.screen-reader-text { clip-path: inset(50%) }` a11y utility. **No mask/wipe reveals anywhere.**

**`prefers-reduced-motion`:** one media query, only killing the FAQ accordion transitions. Scroll reveals are **not** reduced-motion-aware (a real bug you should fix in your rebuild).

---

## 2. The scroll-reveal engine (the whole system)

Located in `theme-app.js`, an IIFE. De-minified:

```js
(function () {
  let debug = false;
  const urlParams = new URLSearchParams(location.search);
  const options = { threshold: 0.2 };                      // ← no root, no rootMargin

  if (urlParams.get('test')) {                             // ?test=1 → red dashed outlines
    debug = true;
    document.body.classList.add('onview-debug');
  }

  const targets = document.querySelectorAll('[data-on-view]');

  document.querySelectorAll('[data-css-duration]').forEach(el => {
    const d = el.dataset.cssDuration;
    if (d) el.style.setProperty('--duration', d);           // per-element override hook (UNUSED on live site)
  });

  const callback = entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    if (entry.target.dataset.cssRemove) removeClasses(entry.target.dataset.cssRemove, entry.target);
    if (entry.target.dataset.cssAdd)    addClasses(entry.target.dataset.cssAdd, entry.target);
    if (entry.target.dataset.js && window[entry.target.dataset.js]) window[entry.target.dataset.js]();
    if (entry.target.dataset.play && isVisible(entry.target)) {
      document.querySelector(entry.target.dataset.play).play();   // lazy video start
    }
    observer.unobserve(entry.target);                       // ← ONCE. Never reverses.
  });

  const observer = new IntersectionObserver(callback, options);

  targets.forEach(t => {
    if (t.dataset.cssRemove) addClasses(t.dataset.cssRemove, t);
    t.classList.add(t.dataset.onView || 'on-view-ready');   // ← hidden state applied BY JS
    observer.observe(t);
  });
})();
```

### Why this matters for your rebuild

1. **Progressive enhancement is baked in.** `opacity: 0` lives on `.on-view-ready.fade-in`, and `.on-view-ready` is added *by JavaScript at boot*. JS off / JS error → everything is visible. **Replicate this** (`gsap.set()` inside your init, or a `js-enabled` class on `<html>`).
2. **`unobserve()` = `once: true`.** Nothing re-animates on scroll-up.
3. **`threshold: 0.2` is area-based, not edge-based.** Exact ScrollTrigger equivalent:
   ```js
   start: () => `top ${window.innerHeight - 0.2 * el.offsetHeight}px`
   ```
   For a 300 px block in a 900 px viewport → `top 840px` ≈ `"top 93%"` (quite late).
   For a 1035 px block → `top 693px` ≈ `"top 77%"`.
   ⚠️ Elements taller than `5 × viewportHeight` **never fire** (0.2·H can never be visible). A latent bug in the original.
4. **Unused capability hooks** you can ignore for the homepage but which exist in the theme: `data-css-remove`, `data-css-duration` (→ `--duration` CSS var), `data-js="globalFnName"`, `data-play="#videoSelector"`.

### The four reveal classes — complete CSS

```css
.onview-debug [data-on-view]        { border: 1px dashed rgba(255,0,0,.75) }

.on-view-ready.fade-in              { opacity: 0; transition: all 1.3s }
.on-view-ready.fade-in.active       { opacity: 1 }

.on-view-ready.fade-in-left         { opacity: 0; transform: translateX(-100px); transition: all .5s }
.on-view-ready.fade-in-left.active  { opacity: 1; transform: translateX(0) }

.on-view-ready.fade-in-right        { opacity: 0; transform: translateX(100px);  transition: all .5s }
.on-view-ready.fade-in-right.active { opacity: 1; transform: translateX(0) }
```

### Measured easing curve — proof it's plain `ease`

Recorded via `requestAnimationFrame` sampling of `getComputedStyle` on a live `.fade-in-right` element (500 ms transition):

| t (ms) | progress | opacity | translateX |
|---|---|---|---|
| 0 | 0.000 | 0.019 | 98.1 px |
| 49 | 0.099 | 0.153 | 84.75 |
| 98 | 0.197 | 0.371 | 62.87 |
| 139 | 0.278 | 0.514 | 48.64 |
| 236 | **0.473** | **0.8024** | 19.76 |
| 335 | 0.669 | 0.941 | 5.93 |
| 437 | 0.874 | 0.994 | 0.57 |
| 486 | 0.971 | 1.000 | 0 |

`cubic-bezier(0.25, 0.1, 0.25, 1)` evaluated at x=0.5 → y = **0.8022**. Match confirmed to 3 decimals. It is the CSS default `ease`, nothing custom.

**GSAP equivalents:**
```js
// Exact:
CustomEase.create("cssEase", "M0,0 C0.25,0.1 0.25,1 1,1");
// Nearest built-in (sits between): power1.out is slightly slower, power2.out slightly snappier.
// If you can't load CustomEase, use "power2.out" — it reads better anyway.
```

---

## 3. Scroll behaviour, frame by frame (homepage, 0 → 4200 px in 150 px steps)

Homepage geometry at 1600×900: total `scrollHeight` **7988 px**.

| docY | Section | Height |
|---|---|---|
| 0 | `header#site-header` (sticky) | 178 |
| 178 | `section#hero` | 648 |
| 866 | Intro + `.gallery.home-grid` (4-image bento) | 593 |
| 1459 | "The UPTIVE Way" | 272 |
| 1731 | "OUR PROCESS" + 4 flip cards | 612 |
| 2344 | "Our Partnership…" + "TRUSTED BY THE BEST" logo wall | 1131 |
| 3474 | "What Drives Us to be Different" (image right) | 481 |
| 3955 | "What We Do" (image left) | 481 |
| 4436 | "Why We Educate" (image right) | 481 |
| 4917 | "Why It Matters" (image left) | 481 |
| 5398 | comparison-table intro | 366 |
| 5765 | UPTIVE-vs-Others comparison rows | 1330 |
| 7095 | CTA band (`bg-brand-accent`) | 110 |
| 7205 | footer | 782 |

### 3.1 Hero — what it does on scroll

**Nothing. It scrolls at exactly 1:1 with the page.**

Measured `#hero-img.getBoundingClientRect().top` vs `scrollY`:

| scrollY | 0 | 200 | 400 | 800 | 1500 | 3000 | 6000 |
|---|---|---|---|---|---|---|---|
| hero img rect.top | 178 | −22 | −222 | −622 | −1322 | −2822 | −5822 |
| hero img transform | none | none | none | none | none | none | none |

Delta is exactly −1 px per scrolled px. **No pin, no scale, no fade-out, no parallax, no differential speed between text and image.** The headline, copy and CTAs sit in a normal `position: relative; z-index: 20` flow container and move with the image.

Hero structure:
```html
<section id="hero" class="relative overlay bg-black text-white py-20 flex flex-col
                          justify-center lg:min-h-[425px] overflow-hidden">
  <aside class="hidden lg:flex absolute flex-col justify-center right-0 z-30">
    <ul class="section-nav anchor-r rounded-md"> … 6 solution links … </ul>
  </aside>
  <div class="p-container w-full relative z-20">
    <div class="hero-content">     <!-- max-width 578px on .home -->
      <h1 id="hero-headline" class="text-white font-semibold text-r-44">…</h1>
      <div id="hero-copy" class="py-3">…</div>
      <div class="hero-cta"><a class="btn">…</a><a class="btn">…</a></div>
    </div>
  </div>
  <img id="hero-img" class="loading object-cover object-left h-full w-full absolute top-0 left-0 z-10"
       onload="this.classList.remove('loading')" fetchpriority="high" decoding="async">
</section>
```
```css
.home #hero            { min-height: 648px }        /* ≥1170px */
.home #hero .hero-content { max-width: 578px }
#hero.overlay:after    { content:""; position:absolute; inset:0; z-index:15;
                         background: linear-gradient(90deg, rgba(0,0,0,.7), transparent 75%) }
#hero-img.loading      { opacity: 0 }
#hero-img              { transition: opacity 1.3s ease }
```

**The only hero animation is a load-in crossfade:** the `<img>` ships with `class="loading"` (opacity 0) in the server HTML; the inline `onload` handler strips it, and the 1.3 s `ease` opacity transition runs. Confirmed visually on `/materials/` where the hero was still black at capture time. The headline/copy/CTA do **not** animate in — they are painted immediately at full opacity.

### 3.2 How sections enter the viewport

**Fade + horizontal slide. That's the entire vocabulary.**
- **Distance travelled: 100 px horizontal.** Never vertical. Never scale. Never clip-path/mask.
- **Duration: 0.5 s** (`fade-in-left` / `fade-in-right`), **1.3 s** (`fade-in`).
- **Easing: `ease`** (`cubic-bezier(.25,.1,.25,1)`).
- **Once, forward only.**

The homepage's 30 `[data-on-view]` elements, in document order, exactly as authored:

| docY | h | Class | Content |
|---|---|---|---|
| 866 | 545 | `fade-in` | `.gallery.img-4.gallery-grid.home-grid` — the whole 4-image bento fades as **one unit**, no per-image stagger |
| 1768 | 26 | `fade-in-left` | `<h3>` "OUR PROCESS" eyebrow |
| 1839 | 100 | `fade-in-right` | intro paragraph under it |
| 1939 | 324 | `fade-in` ×4 | the four numbered flip cards — **all four fire simultaneously** (measured: identical opacity 0.746 → 0.998 across all 4 at the same frame) |
| 2392 | 1035 | `fade-in-left` | "Our Partnership Doesn't End There" copy column |
| 2392 | 1035 | `fade-in-right` | "TRUSTED BY THE BEST" logo wall column |
| 3522 | 385 | `fade-in-right` | `.break-out.break-out-right` image — "What Drives Us" |
| 3549 | 331 | `fade-in-right` | its text column |
| 4003 | 385 | `fade-in-left` | `.break-out.break-out-left` image — "What We Do" |
| 4069 | 254 | `fade-in-right` | its text column |
| 4484 | 385 | `fade-in-right` | image — "Why We Educate" |
| 4550 | 254 | `fade-in-right` | its text column |
| 4965 | 385 | `fade-in-left` | image — "Why It Matters" |
| 5044 | 228 | `fade-in-right` | its text column |
| 5980–6802 | 127–156 | `fade-in-left` / `fade-in-right` ×10 | comparison table rows, alternating left/right per column (`[data-comparison]`) |
| 6968 | 46 | `fade-in` | final `a.btn` "Experience The Difference" |

Raw markup pattern:
```html
<div class="break-out md:order-2 break-out-right fade-in-right" data-on-view data-css-add="active">
<h3 data-on-view data-css-add="active" class="fade-in-left text-r-22 …">OUR PROCESS</h3>
<div class="text-r-18 … text-brand-primary-1 fade-in-left" data-on-view data-css-add="active" data-comparison>
```
Note the attribute is bare (`data-on-view` with no value) → the JS falls back to the `on-view-ready` default class.

**The pairing pattern worth stealing:** the eyebrow enters from the left while its paragraph enters from the right; the copy column enters from the left while the image column enters from the right. Two 100 px vectors converging on the centre line, same 0.5 s, same easing, no delay offset. On the comparison table the "UPTIVE" column always comes from the left and the "Others" column always from the right, on all 5 rows.

### 3.3 Headings — no text splitting at all

**No `SplitType`, no `Splitting.js`, no per-word / per-line / per-character animation, no line masks, no `overflow: hidden` wrappers.** Headings are plain `<h1>/<h2>/<h3>` elements. On the homepage most section headings (e.g. "The UPTIVE Way", "Customer-Centric Service, Cutting-Edge Technology", "What Drives Us to be Different") are **not `[data-on-view]` targets at all** — they either animate as part of a parent `fade-in-right` block or don't animate whatsoever. On solution pages `h2.headline` gets a plain `fade-in` (1.3 s opacity, no movement).

Type scale (fluid, `clamp()`):
```css
.text-r-44 { font-size: clamp(32px, 5vw, 44px) }   /* h1 hero  */
.text-r-42 { font-size: clamp(30px, 5vw, 42px) }
.text-r-32 { font-size: clamp(21px, 4vw, 32px) }
.text-r-24 { font-size: clamp(17px, 4vw, 24px) }
.text-r-22 { font-size: clamp(18px, 4vw, 22px) }
.text-r-20 { font-size: clamp(18px, 2vw, 20px) }
.text-r-18 { font-size: clamp(14px, 2vw, 18px) }
.text-r-16 { font-size: clamp(14px, 2vw, 16px) }
.text-r-12 { font-size: clamp(10px, 2vw, 12px) }
```

### 3.4 Images — no parallax, no scale-on-scroll, no wipe

Images are static inside their containers. The only image motion is the container's `fade-in-*`. What *reads* as sophistication is a pure-CSS layout trick, not motion:

```css
/* full-bleed "break-out" images that overhang the 1170px container */
.break-out                        { margin-left:-1rem; margin-right:-1rem }
@media (min-width:1024px) { .break-out { margin-left:unset; margin-right:unset } }
@media (min-width:1170px) {
  .break-out-left, .break-out-right { --w: 13vw; --min: -160px;
                                      width: calc(100% + var(--w)) }
  .break-out-left                 { left: calc(var(--w) * -1); position: relative }
}
```
So the image is 13 vw wider than its column and bleeds off the left or right edge, alternating down the page — then slides in 100 px from that same edge. That directional agreement (image bleeds right → enters from right) is what sells it.

Homepage bento grid (the 4-image block at docY 866):
```css
.gallery-grid           { display:grid; gap:5px; grid-template-columns:1fr 1fr 1fr }
.gallery-grid.home-grid { grid-template-columns: 1fr 1fr 1fr 1fr;
                          grid-template-rows: 25% 1fr 1fr 1fr }
.gallery-grid.home-grid :first-child   { grid-column:1/2; grid-row:1/3 }
.gallery-grid.home-grid :nth-child(2)  { grid-column:2/5; grid-row:1/2 }
.gallery-grid.home-grid :nth-child(3)  { grid-column:1/2; grid-row:3/5 }
.gallery-grid.home-grid :nth-child(4)  { grid-column:2/5; grid-row:2/5 }
/* two of the four get a static brand-blue duotone wash */
.home .home-grid :nth-child(2):after,
.home .home-grid :nth-child(3):after   { content:""; position:absolute; inset:0; z-index:99;
                                          background: linear-gradient(90deg,
                                            rgba(221,241,253,.5), rgba(141,199,233,.5)) }
.gallery-grid img       { border: 1px solid #f0f0f0; object-fit: cover }
```

### 3.5 Pinned / horizontal / sticky / counters / marquees

| Feature | Present? |
|---|---|
| Pinned sections | **No** |
| Horizontal scroll sections | **No** |
| Scroll-scrubbed animation | **No** |
| Counters / number odometers | **No** |
| Marquees / infinite tickers | **No** — the "TRUSTED BY THE BEST" logo wall is a static CSS grid |
| Lottie / SVG path draw | **No** |
| Video backgrounds | **No** on homepage (`document.querySelectorAll('video').length === 0`). The theme *supports* it via `data-play="#selector"`, unused here. |
| Sticky elements | **Yes, 3** (below) |

**Sticky elements (`position: sticky`) site-wide:**
```css
#site-header          { position: sticky; top: 0; z-index: 99999; background:#fff;
                        border-bottom: 1px solid #f1f1f1 }              /* every page */
.section-nav-container{ position: sticky; top: 190px }                  /* ≥1280px, solution pages */
.toc-rail             { position: sticky; top: 190px }                  /* ≥1024px, blog/KB pages */
.prose h2.wp-block-heading, .prose h3.wp-block-heading { scroll-margin-top: 180px }
```

**Scroll-spy for the sticky section nav** (2nd IntersectionObserver in `app.js`):
```js
document.addEventListener('DOMContentLoaded', () => {
  const options = { rootMargin: '-49%' };          // ← activates as a section crosses the viewport mid-line
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    const id = entry.target.dataset.section;
    document.querySelector(`.section-nav-link-${id}`)
            .classList[entry.isIntersecting ? 'add' : 'remove']('active');
  }), options);
  document.querySelectorAll('[data-section]').forEach(s => { if (s.dataset.section) observer.observe(s); });
});
```
This one **does** toggle both ways (no `unobserve`). Active link styling = the same as `:hover` (see §4).

### 3.6 Navbar behaviour on scroll — **it does nothing**

Measured at scrollY = 0 / 200 / 400 / 800 / 1500 / 3000 / 6000. Every single sample:

```
position: sticky   top: 0px   transform: none   height: 178px   rectTop: 0
background: rgb(255,255,255)   box-shadow: none   class: " announcement-active"
announcement banner height: 60px   banner rectTop: 0
```

- **No hide-on-scroll-down / show-on-scroll-up.**
- **No background change** (already opaque white at rest).
- **No shrink** — the 60 px announcement bar with the four sub-brand logos stays stuck at the top forever, 178 px of chrome permanently occupying 20 % of a 900 px viewport.
- **No shadow-on-scroll** — just a static 1 px `#f1f1f1` bottom border.
- The only scroll-related class change anywhere is `crjs` appearing on `<html>` around y≈800 — that's the CallRail number-swap script, not motion.

> This is the site's weakest point and the easiest place for your rebuild to beat it. See §7.

---

## 4. Hover & micro-interactions (measured from computed styles)

### 4.1 Primary button `.btn` — the signature interaction

```css
.btn {
  --pv: 10px; --r: 8px;
  display: inline-block; position: relative;
  padding: var(--pv) 65px var(--pv) 30px;          /* 65px right pad reserves the arrow slot */
  background-color: #193768;                        /* rgb(25 55 104) */
  color: #fff !important;
  border-radius: var(--r);
  font-family: Raleway, Helvetica, sans-serif; font-weight: 700; letter-spacing: .025em;
}
.btn, .btn .btn-arrow            { align-items: center; transition: all .3s }   /* ease (default) */
.btn .btn-arrow {
  position: absolute; right: -1px; top: 0; height: 100%;
  display: flex; justify-content: center; padding: .25rem .75rem;
  border-radius: 0 var(--r) var(--r) 0;
  background-color: #98CBEB;                        /* rgb(152 203 235) */
}
.btn:hover:not([disabled])           { background-color: #98CBEB; color: #193768 !important }
.btn:hover:not([disabled]) .btn-arrow{ right: -8px }               /* ← slides 7px further right */
#hero .btn                           { max-width: 370px }
#hero .btn span                      { color: #98CBEB }
#hero .btn:hover span                { color: #000 }
```

**Measured hover diff:** `background rgb(25,55,104) → rgb(152,203,235)`, `color rgb(255,255,255) → rgb(25,55,104)`, arrow block `right: -1px → -8px`. All three on one `transition: all .3s` with default `ease`. Net effect: the button inverts to the sky-blue of its own arrow chip (so the chip visually *merges* into the button) while the chip pokes 7 px further out. Verified in `hover-btn-primary-before.jpg` / `-after.jpg`.

**GSAP:**
```js
const tl = gsap.timeline({ paused: true, defaults: { duration: 0.3, ease: "power1.inOut" } })
  .to(btn,   { backgroundColor: "#98CBEB", color: "#193768" }, 0)
  .to(arrow, { x: 7 }, 0);                            // use x, not `right`, for GPU compositing
btn.addEventListener("pointerenter", () => tl.play());
btn.addEventListener("pointerleave", () => tl.reverse());
```

### 4.2 Body links `main a:not(.btn)`
```css
main a:link:not(.btn), main a:not(.btn)        { color:#193768; transition: all .3s }
main a:link:not(.btn):hover, main a:not(.btn):hover { color:#3A8DDE; text-decoration-line: underline }
```
Measured: `rgb(25,55,104) → rgb(58,141,222)` + underline appears. ⚠️ `text-decoration-line` is not interpolatable — the underline snaps instantly while the colour tweens over 300 ms. Fix in your rebuild with an animated `background-image` underline or a `::after` scaleX.

### 4.3 Section nav rail `.section-nav-link` (hero right rail + sticky sidebar)
```css
.section-nav-link {
  display:inline-flex; align-items:center; width:100%;
  padding: 1rem 1.25rem 1rem 1.75rem;
  background-color:#98CBEB; color:#193768;
  font-family: Raleway; font-size:14px; font-weight:700;
  transition: color .3s ease-in-out, background-color .2s;     /* note: DIFFERENT durations */
}
.section-nav-link svg { height:14px; transition: filter 10ms, transform .5s }
.section-nav-link.active,
.section-nav-link:hover      { background-color:#193768; color:#fff !important }
.section-nav-link.active svg,
.section-nav-link:hover svg  { filter: brightness(10); transform: translateX(3px) }
.section-nav li:after        { content:""; position:absolute; bottom:0; right:0; width:82%;
                               border-bottom: 1px solid #00498722 }
```
Measured hover: bg `rgb(152,203,235) → rgb(25,55,104)` over **0.2 s**, text `rgb(25,55,104) → rgb(255,255,255)` over **0.3 s ease-in-out** (`cubic-bezier(.4,0,.2,1)`), chevron `translateX(0 → 3px)` over **0.5 s** and `filter: brightness(10)` over **10 ms** (instant white). Four different durations on one hover — deliberate: the plate flips fast, the label catches up, the arrow drifts.

### 4.4 Process flip cards (`.flip-card`) — 3D Y-flip, **desktop ≥1024px only**
```css
.flip-card       { background-color: transparent; border-radius: 8px;
                   perspective: 1000px; transform-style: preserve-3d }
.flip-card-inner { background: linear-gradient(0deg, #ddf1fd, #8dc7e9);
                   transform-style: preserve-3d; transition: transform .8s; width:100% }
.tz-30           { transform: translateZ(30px) }
.tz-10           { transform: translateZ(10px) }
@media (min-width:1024px) {
  .flip-card                    { height: 324px }
  .flip-card:hover .flip-card-inner { transform: rotateY(180deg) }
  .flip-card-inner              { height:100%; position:relative }
  .flip-card-front,
  .flip-card-back               { position:absolute; width:100%; height:100%;
                                  backface-visibility: hidden; transform-style: preserve-3d }
  .flip-card-back               { transform: rotateY(180deg) }
  .step-num                     { position:absolute; transform: translateZ(25px) }
}
.card-bottom { position:absolute; top:100%; width:100%; background:#193768; color:#fff;
               border-radius: 0 0 .375rem .375rem; padding:.75rem 2.5rem;
               font-family:Raleway; font-weight:700; font-size:clamp(14px,2vw,18px) }
```
Measured post-hover matrix3d ≈ `rotateY(180deg)` (`m11 = -0.9998`), `transition: transform 0.8s`, default `ease`. Front = light-blue gradient with the step title; back = navy `#193768` with the detail copy. The big step number sits at `translateZ(25px)` and the sub-label at `translateZ(30px)` so they float above the card face inside the 1000 px perspective — a genuinely nice touch. Verified in `hover-flip-card-after.jpg`.

### 4.5 Nav dropdown (`.sub-menu.lv-1`) — the only `@keyframes` the theme owns
```css
#nav .sub-menu.lv-1 { display:none; position:absolute; padding:1.5rem; background:#fff;
                      filter: drop-shadow(0 4px 3px rgba(0,0,0,.07))
                              drop-shadow(0 2px 2px rgba(0,0,0,.06)) }
#nav .item-container:hover .sub-menu.lv-1,
#nav .item-container.active .sub-menu.lv-1 {
  display: flex;
  transform-origin: top center;
  animation: submenuAnimation .22s ease-in-out forwards;
}
@keyframes submenuAnimation {
  0%   { opacity: 0; transform: scaleY(0) }
  80%  { opacity: 1 }
  100% { transform: scaleY(1) }
}
```
Measured after hover: `display: none → flex`, `animation: 0.22s ease-in-out forwards submenuAnimation`, panel height 300 px. A vertical unfurl from the top edge, opacity reaching 1 at 80 % of the way (i.e. at ~176 ms) so the panel is solid before it finishes expanding. `ease-in-out` here = `cubic-bezier(.42,0,.58,1)` (the CSS keyword, **not** the Tailwind `.ease-in-out` class).

⚠️ **Text distortion caveat:** `scaleY` on the container squashes the link text vertically during the 220 ms. Cheap and mostly unnoticeable at that speed, but in a GSAP rebuild prefer animating `height` (or `clip-path: inset(0 0 100% 0) → inset(0)`) with the children counter-scaled.

The "Solutions" dropdown gets a CTA injected by JS at runtime:
```js
const el = document.querySelector('.nav-solutions .sub-menu.lv-1');
const ctaContainer = document.createElement('li');
ctaContainer.classList.add('inav-cta-container');
const cta = document.createElement('a');
cta.classList.add('inav-cta','hidden','md:block');
cta.href = '/get-quote/';
cta.innerText = 'Upload Your Design File';
ctaContainer.appendChild(cta); el.appendChild(ctaContainer);
```
```css
.inav-cta-container { position:absolute; bottom:-20px; left:0; width:100%; z-index:10;
                      background:#193768; color:#fff; text-align:center;
                      border-radius: 0 0 8px 8px; padding: .5rem 0;
                      font-family:Raleway; font-weight:700 }
```
See `nav-submenu-open.jpg`.

### 4.6 Search overlay — slide-down from above the fold
```css
#search-form { position: fixed; top: 0; right: 0; width: 100%; z-index: 999;
               display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
               gap: .5rem; padding: .75rem; background: #fff;
               filter: drop-shadow(0 4px 3px rgba(0,0,0,.07)) drop-shadow(0 2px 2px rgba(0,0,0,.06));
               transform: translateY(-100px); transition: all .3s }
#search-form.active { transform: translateY(0) }
```
Measured: click `[data-search-trigger]` → `matrix(1,0,0,1,0,-100) → matrix(1,0,0,1,0,0)`, class `"" → "active"`, 60 px tall. JS:
```js
const toggleSearch = () => {
  searchForm.classList.toggle('active');
  if (searchForm.classList.contains('active')) document.getElementById('search-field').focus();
};
```
(Focus management on open — keep this.)

### 4.7 Mobile off-canvas nav + hamburger
```css
.offcanvas { position: fixed; top: 0; left: 0; width: 100%; z-index: 999; background: #fff;
             box-shadow: 1px 1px 10px 7px rgba(0,0,0,.3);
             transform: translateX(130vw); transition: all .25s ease-out }
body.nav-active .offcanvas { transform: translateX(0); overflow: scroll }
@media (min-width:640px)  { .offcanvas { transition: none } }
@media (min-width:1024px) { .offcanvas { position:static; transform:none; transition:none;
                                          background:transparent; box-shadow:none; width:auto; height:auto } }

[data-nav-toggle]        { display:flex; flex-direction:column; gap:8px; --s:3px; z-index:9999; border:0 }
[data-nav-toggle] span   { display:block; width:26px; height:var(--s); border-radius:10px;
                           background-color:#5c8097; transition: all .3s ease }
[data-nav-toggle].active { position:absolute; right:0 }
[data-nav-toggle].active span                { background-color:#000 }
[data-nav-toggle].active span:first-child    { transform: rotate(45deg)  translate(8px, 7px) }
[data-nav-toggle].active span:nth-child(2)   { transform: rotate(-45deg) }
[data-nav-toggle].active span:nth-child(3)   { opacity: 0 }
@media (min-width:1024px) { [data-nav-toggle] { display:none } }
```
Slide in from `130vw` (off right) in **0.25 s ease-out**, classic 3-bar → X morph in **0.3 s ease**. JS toggles `.active` on the button and `body.nav-active`. The offcanvas `top` is set at runtime to the announcement banner height:
```js
function adjustNavPosition() {
  const announcement = document.getElementById('announcment-banner');   // [sic] typo in source
  if (announcement) document.getElementById('offcanvas').style.top = announcement.clientHeight + 'px';
}
window.addEventListener('resize', adjustNavPosition);
```

### 4.8 Announcement-bar logo swap — instant, no transition
Inline `<style>` in `<head>`:
```css
.banner-logos     { display:flex; justify-content:center; align-items:center; gap:30px }
.banner-logo-item { padding:10px; height:60px; display:flex; justify-content:center; align-items:center }
.banner-logo-item:nth-child(3) a { transform: scale(0.8)  }
.banner-logo-item:nth-child(4) a { transform: scale(1.15) }
#announcment-banner { padding:0; background-color: rgb(0 73 135) }

.hover-show { display: none }
.banner-logo-item:hover .hover-show { display: block }
.banner-logo-item:hover .hover-hide { display: none }
```
Two stacked `<img>` per brand (white version / full-colour version) swapped with `display`. **No transition** — a hard cut. Trivial to improve with a crossfade.

### 4.9 FAQ accordion — native `<details>`, the only modern-CSS flourish
```css
.faq-section  { interpolate-size: allow-keywords }
.faq-question { display:flex; justify-content:space-between; align-items:center; gap:1.5rem;
                padding:1.25rem .25rem; cursor:pointer; list-style:none;
                color:#193768; font-family:Raleway; font-weight:600;
                font-size: clamp(18px,2vw,20px); transition: color .25s ease }
.faq-question::-webkit-details-marker { display:none }
.faq-question::marker                 { content: "" }
.faq-question:hover                   { color:#3A8DDE }
.faq-question:focus-visible           { outline:2px solid #3A8DDE; outline-offset:3px; border-radius:2px }
.faq-icon                     { fill: currentColor; color:#3A8DDE; flex:none;
                                transition: transform .3s cubic-bezier(.16,1,.3,1) }
.faq-item[open] > .faq-question .faq-icon { transform: rotate(180deg) }
.faq-item::details-content    { block-size: 0; opacity: 0; overflow: hidden;
                                transition: block-size .35s cubic-bezier(.16,1,.3,1),
                                            opacity .3s ease,
                                            content-visibility allow-discrete .35s }
.faq-item[open]::details-content { block-size: auto; opacity: 1 }
.faq-list { border-top:1px solid #a5bac9 }  .faq-item { border-bottom:1px solid #a5bac9 }
@media (prefers-reduced-motion: reduce) { .faq-icon, .faq-item::details-content { transition:none } }
```
Uses `interpolate-size: allow-keywords` + `::details-content` + `transition-behavior: allow-discrete` — animating to `height: auto` with zero JS. **`cubic-bezier(.16, 1, .3, 1)` is easeOutExpo** — the one genuinely premium curve on the site. Steal it for your whole rebuild.

### 4.10 Splide carousel (solution pages)
```js
if (document.querySelector('.splide')) {
  const splide = new Splide('.splide', {
    perPage: 2,
    padding: { left: '1rem', right: '1rem' },
    speed: 800,
    breakpoints: { 1024: { perPage: 1 } }
  });
  splide.mount();
}
```
```css
.splide-custom .splide__pagination__page { width:50px; border-radius:5px; background-color:#193768; opacity:1 }
.splide-custom .splide__pagination__page.is-active { background-color:#98CBEB; transform: scale(1.1) }
.splide__pagination__page { transition: transform .2s linear }
.splide-custom .splide__pagination { bottom:-2.5rem; gap:25px }
.splide-custom .splide__arrow:disabled { opacity:0 }
```
Slide transition **800 ms** (Splide's default `cubic-bezier(0.25, 0.725, 0.5, 1)`). Pagination = 50 px wide navy bars that go sky-blue and `scale(1.1)` over 200 ms linear when active.

### 4.11 No hover effect at all on
`.nav-link` (top-level nav items — measured hover diff `{}`, literally nothing), `[data-search-trigger]`, images/cards in the bento grid (no zoom, no overlay), the logo-wall logos.

---

## 5. Page transitions

**None.** Measured by clicking "Materials" in the nav:

```
framenavigated -> https://uptivemfg.com/materials/       (full document navigation, count: 1)
window.barba  : undefined
window.Turbo  : undefined
window.Swup   : undefined
CSS @view-transition / view-transition-name : none in any theme stylesheet
```

Standard browser hard navigation. There is **no overlay, no fade-out, no curtain, no wipe**. The only perceived smoothing comes from a WordPress **speculation-rules prefetch** in the document head:

```json
{"prefetch":[{"source":"document","eagerness":"conservative",
  "where":{"and":[{"href_matches":"/*"},
    {"not":{"href_matches":["/wp-*.php","/wp-admin/*","/wp-content/uploads/*","/wp-content/*",
                            "/wp-content/plugins/*","/wp-content/themes/industrial/*","/*\\?(.+)"]}},
    {"not":{"selector_matches":"a[rel~=\"nofollow\"]"}},
    {"not":{"selector_matches":".no-prefetch, .no-prefetch a"}}]}}]}
```

Then on the new page the hero image fades up over 1.3 s from `opacity: 0` (captured in `pagetrans-2.jpg`: `/materials/` hero rendered as a black block with the text already visible, image mid-fade). **That hero crossfade is what covers the navigation seam** — it's the closest thing to a page transition on the site, and it's an accident of the lazy-load pattern.

---

## 6. Rebuild recipe

Numbers below are **exact** unless flagged `[est]`.

### 6.1 Design tokens

```css
:root {
  /* colour */
  --navy:        #193768;   /* rgb(25 55 104)   brand-primary-1, buttons, dark cards */
  --navy-deep:   #004987;   /* announcement bar */
  --sky:         #98CBEB;   /* rgb(152 203 235) brand-accent, button hover, arrow chip */
  --sky-pale:    #DDF1FD;   /* gradient top */
  --sky-mid:     #8DC7E9;   /* gradient bottom */
  --link-hover:  #3A8DDE;   /* rgb(58 141 222) */
  --body:        #505050;   /* rgb(80 80 80) */
  --hair:        #F1F1F1;   /* header bottom border */
  --hair-blue:   #A5BAC9;   /* faq rules */
  --grey-bar:    #5C8097;   /* hamburger bars */

  /* motion — the entire system */
  --ease:        cubic-bezier(0.25, 0.1, 0.25, 1);   /* CSS default `ease` — used by every reveal */
  --ease-expo:   cubic-bezier(0.16, 1, 0.3, 1);      /* easeOutExpo — FAQ only. USE THIS MORE. */
  --ease-std:    cubic-bezier(0.4, 0, 0.2, 1);       /* Tailwind/Material standard */
  --d-reveal-x:  0.5s;    /* horizontal entrances */
  --d-reveal:    1.3s;    /* pure fades + hero image */
  --d-ui:        0.3s;    /* buttons, links, nav */
  --d-flip:      0.8s;    /* 3D card flip + Splide slide */
  --d-menu:      0.22s;   /* dropdown unfurl */
  --d-offcanvas: 0.25s;
  --travel:      100px;   /* the ONLY distance value in the whole system */
}
```

Fonts: Kallisto (display, weights 300/500/800) via Adobe Fonts kit; Raleway 700 (buttons, nav, labels, eyebrows); Roboto 400 (body).

### 6.2 Faithful 1:1 rebuild — GSAP

```js
gsap.registerPlugin(ScrollTrigger, CustomEase);

// exact CSS `ease`
CustomEase.create("cssEase", "M0,0 C0.25,0.1 0.25,1 1,1");

document.documentElement.classList.add("js");   // progressive enhancement, mirrors .on-view-ready

// ── SCROLL REVEALS ────────────────────────────────────────────────────────────
// Reproduces IntersectionObserver { threshold: 0.2 } + unobserve() exactly.
const startAt = el => () => `top ${window.innerHeight - 0.2 * el.offsetHeight}px`;

gsap.utils.toArray(".fade-in").forEach(el => {
  gsap.fromTo(el, { autoAlpha: 0 }, {
    autoAlpha: 1,
    duration: 1.3,
    ease: "cssEase",
    scrollTrigger: { trigger: el, start: startAt(el), once: true }
  });
});

[["-left", -100], ["-right", 100]].forEach(([suffix, x]) => {
  gsap.utils.toArray(`.fade-in${suffix}`).forEach(el => {
    gsap.fromTo(el, { autoAlpha: 0, x }, {
      autoAlpha: 1, x: 0,
      duration: 0.5,
      ease: "cssEase",
      scrollTrigger: { trigger: el, start: startAt(el), once: true }
    });
  });
});
// NOTE: no stagger anywhere. Sibling cards in a row all fire at once.
//       No y-movement anywhere. No scale. No clip-path.

// ── HERO IMAGE LOAD FADE ─────────────────────────────────────────────────────
const heroImg = document.querySelector("#hero-img");
gsap.set(heroImg, { autoAlpha: 0 });
const revealHero = () => gsap.to(heroImg, { autoAlpha: 1, duration: 1.3, ease: "cssEase" });
heroImg.complete ? revealHero() : heroImg.addEventListener("load", revealHero, { once: true });
// Hero text/CTA: NO animation. Painted at full opacity immediately.
// Hero section: NO pin, NO parallax, NO scale, NO fade-out. Scrolls 1:1.

// ── BUTTON HOVER ─────────────────────────────────────────────────────────────
document.querySelectorAll(".btn").forEach(btn => {
  const arrow = btn.querySelector(".btn-arrow");
  const tl = gsap.timeline({ paused: true, defaults: { duration: 0.3, ease: "cssEase" } })
    .to(btn,   { backgroundColor: "#98CBEB", color: "#193768" }, 0)
    .to(arrow, { x: 7 }, 0);
  btn.addEventListener("pointerenter", () => tl.play());
  btn.addEventListener("pointerleave", () => tl.reverse());
});

// ── SECTION-NAV SCROLL SPY (2-way, no once) ──────────────────────────────────
gsap.utils.toArray("[data-section]").forEach(sec => {
  const link = document.querySelector(`.section-nav-link-${sec.dataset.section}`);
  if (!link) return;
  ScrollTrigger.create({
    trigger: sec,
    start: "top 51%", end: "bottom 49%",      // ≡ IntersectionObserver rootMargin: '-49%'
    onToggle: self => link.classList.toggle("active", self.isActive)
  });
});

// ── REDUCED MOTION (the original omits this — do NOT omit it) ────────────────
ScrollTrigger.matchMedia?.({ "(prefers-reduced-motion: reduce)": () => {
  gsap.set(".fade-in, .fade-in-left, .fade-in-right", { clearProps: "all", autoAlpha: 1, x: 0 });
}});
```

### 6.3 Faithful 1:1 rebuild — pure CSS + IntersectionObserver (what the original actually does)

```css
.js .on-view-ready.fade-in              { opacity: 0; transition: all 1.3s var(--ease) }
.js .on-view-ready.fade-in.active       { opacity: 1 }
.js .on-view-ready.fade-in-left         { opacity: 0; transform: translateX(-100px); transition: all .5s var(--ease) }
.js .on-view-ready.fade-in-left.active  { opacity: 1; transform: translateX(0) }
.js .on-view-ready.fade-in-right        { opacity: 0; transform: translateX(100px);  transition: all .5s var(--ease) }
.js .on-view-ready.fade-in-right.active { opacity: 1; transform: translateX(0) }

@media (prefers-reduced-motion: reduce) {
  .js .on-view-ready { opacity: 1 !important; transform: none !important; transition: none !important }
}
```
```js
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add(e.target.dataset.cssAdd || "active");
  io.unobserve(e.target);
}), { threshold: 0.2 });

document.querySelectorAll("[data-on-view]").forEach(el => {
  el.classList.add(el.dataset.onView || "on-view-ready");
  io.observe(el);
});
```

### 6.4 Complete per-element table

| # | Element | Animation | Exact values |
|---|---|---|---|
| 1 | `#hero-img` | opacity fade on `load` | `0 → 1`, **1.3 s**, `ease`. Class `.loading` set server-side, removed by inline `onload`. |
| 2 | `#hero` section | **none** | no pin/scale/parallax/fade. 1:1 scroll. |
| 3 | `#hero-headline`, `#hero-copy`, `.hero-cta` | **none** | full opacity on paint. |
| 4 | `.gallery.home-grid` (4-image bento) | `.fade-in` | opacity `0 → 1`, **1.3 s**, `ease`, whole grid as one unit, no per-image stagger |
| 5 | `h3` "OUR PROCESS" eyebrow | `.fade-in-left` | `x −100 → 0` + opacity `0 → 1`, **0.5 s**, `ease` |
| 6 | intro `<p>` under it | `.fade-in-right` | `x +100 → 0` + opacity, **0.5 s**, `ease`, **no delay** (converges with #5) |
| 7 | 4 process flip cards | `.fade-in` ×4 | opacity **1.3 s** `ease`, **all four simultaneous, stagger = 0** |
| 8 | flip card hover (≥1024px) | `rotateY(180deg)` | **0.8 s**, `ease`, `perspective: 1000px`, `backface-visibility: hidden`, faces at `translateZ(25px)`/`(30px)` |
| 9 | "Our Partnership" copy col | `.fade-in-left` | `x −100 → 0`, **0.5 s**, `ease` |
| 10 | "TRUSTED BY THE BEST" logo col | `.fade-in-right` | `x +100 → 0`, **0.5 s**, `ease`, static grid (no marquee) |
| 11 | 4 alternating break-out image blocks | `.fade-in-right` / `-left` (alternating) | `x ±100 → 0`, **0.5 s**, `ease`. Direction matches which edge the image bleeds off (`width: calc(100% + 13vw)`) |
| 12 | their text columns | always `.fade-in-right` | `x +100 → 0`, **0.5 s**, `ease` |
| 13 | 10 comparison rows (5 pairs) | `.fade-in-left` (UPTIVE col) / `.fade-in-right` (Others col) | `x ±100 → 0`, **0.5 s**, `ease`. Pairs converge; **no stagger between rows** |
| 14 | final `a.btn` CTA | `.fade-in` | opacity, **1.3 s**, `ease` |
| 15 | `#site-header` | **none** | `sticky; top:0; z-index:99999`, 178 px (60 px banner + 118 px bar), always white, no shadow, no shrink, no hide |
| 16 | `.section-nav-container` | sticky only | `top: 190px`, ≥1280px |
| 17 | `.section-nav-link` hover/`.active` | bg + colour + chevron | bg **0.2 s** (linear-ish), colour **0.3 s** `ease-in-out`, `svg translateX(0→3px)` **0.5 s**, `filter: brightness(10)` **10 ms** |
| 18 | `.btn` hover | invert + arrow slide | bg `#193768→#98CBEB`, colour `#fff→#193768`, `.btn-arrow right −1px→−8px`. All **0.3 s**, `ease` |
| 19 | `main a:not(.btn)` hover | colour + underline | `#193768 → #3A8DDE`, **0.3 s** `ease`; underline snaps (not interpolatable) |
| 20 | `.sub-menu.lv-1` on `:hover` | `submenuAnimation` | `scaleY(0)→(1)` + `opacity 0→1@80%`, **0.22 s** `ease-in-out`, `transform-origin: top center`, `forwards` |
| 21 | `#search-form` on toggle | slide down | `translateY(−100px) → 0`, **0.3 s**, `ease`; focuses `#search-field` on open |
| 22 | `.offcanvas` (<1024px) | slide in | `translateX(130vw) → 0`, **0.25 s**, `ease-out`; `transition: none` ≥640px |
| 23 | hamburger `[data-nav-toggle] span` | 3-bar → X | span1 `rotate(45deg) translate(8px,7px)`, span2 `rotate(-45deg)`, span3 `opacity: 0`. **0.3 s** `ease` |
| 24 | `.faq-icon` | chevron flip | `rotate(0→180deg)`, **0.3 s**, `cubic-bezier(.16,1,.3,1)` |
| 25 | `.faq-item::details-content` | height auto | `block-size 0→auto` **0.35 s** `cubic-bezier(.16,1,.3,1)`, `opacity` **0.3 s** `ease`, `content-visibility allow-discrete .35s`, `interpolate-size: allow-keywords` |
| 26 | `.faq-question` hover | colour | `#193768 → #3A8DDE`, **0.25 s**, `ease` |
| 27 | Splide carousel | slide | **800 ms**, Splide default `cubic-bezier(.25,.725,.5,1)`, `perPage: 2` (1 below 1024px), `padding: 1rem` |
| 28 | `.splide__pagination__page.is-active` | bar highlight | `#193768 → #98CBEB` + `scale(1.1)`, **0.2 s** `linear`, 50 px wide |
| 29 | `.banner-logo-item` hover | logo swap | `display: none/block`, **0 s** — instant cut |
| 30 | `[data-section]` scroll spy | link `.active` | IO `rootMargin: -49%` ⇒ ScrollTrigger `start "top 51%" end "bottom 49%"`, **two-way** |
| 31 | Page navigation | **none** | hard load + WP speculation-rules `prefetch` (`eagerness: conservative`) |

### 6.5 Section rhythm (for pacing your own build)

Alternating break-out blocks are **481 px** apart on a 1600×900 viewport (`3474 → 3955 → 4436 → 4917`), each 385 px image + 228–331 px text. The container is `max-width: 1170px; padding-inline: 1rem` (`.p-container`), with images overhanging by `13vw` (min `−160px`).

---

## 7. Upgrade path — where a GSAP rebuild should beat the original

Everything above is faithful. These are the gaps, ranked by impact-per-effort:

1. **Give the hero something to do.** It currently sits inert. A `scrub: true` ScrollTrigger with `yPercent: 15` on the image + `yPercent: 40, autoAlpha: 0` on `.hero-content` over `start: "top top", end: "bottom top"` adds depth for ~8 lines and matches the site's restraint.
2. **Fix the 178 px header.** Shrink the announcement bar away past ~200 px scroll (`gsap.to(banner, { height: 0, duration: 0.4, ease: "power2.inOut" })`) and/or hide-on-scroll-down / show-on-scroll-up with `ScrollTrigger.create({ onUpdate: self => … self.direction })`. Reclaiming 60 px of a 900 px viewport is the single biggest UX win available.
3. **Add stagger.** The 4 process cards and the 10 comparison rows currently all fire at once — the most obviously "unfinished" moment. `stagger: 0.08` with `ScrollTrigger` on the parent container is a 2-line change with an outsized payoff.
4. **Add vertical motion.** 100 % of the movement is horizontal. A `y: 40 → 0` on headings and `y: 24 → 0` on body blocks reads far more contemporary than sideways slides — and sideways slides on `.break-out` elements are also a horizontal-overflow risk on narrow viewports.
5. **Adopt `--ease-expo` (`cubic-bezier(.16,1,.3,1)`) globally.** It's already in their CSS, used on one accordion. GSAP: `"expo.out"` / `CustomEase.create("expo","M0,0 C0.16,1 0.3,1 1,1")`. Instantly upgrades the feel over the default `ease`.
6. **Split headings.** `SplitText` by line, wrap in `overflow: hidden`, `yPercent: 110 → 0`, `stagger: 0.08`, `duration: 0.9`, `ease: "power3.out"`, `start: "top 80%"`, `once: true`. The site has 44 px Kallisto display type that is doing nothing — this is the highest-leverage addition available.
7. **Mask-reveal the break-out images.** `clip-path: inset(0 100% 0 0) → inset(0 0 0 0)` (direction matching the bleed) with `scale: 1.08 → 1` on an inner `<img>`, **1.1 s**, `expo.out`. Currently zero images use a mask anywhere on the site.
8. **Reduced motion.** The original only honours it on the FAQ. Wrap all reveals in `gsap.matchMedia()`.
9. **`will-change`.** Zero theme elements declare it. Add `will-change: transform, opacity` on reveal targets and clear it via `onComplete`.
10. **Fix the untweenable underline** on body links (`background-image` gradient underline or a `::after` `scaleX` with `transform-origin` swap).
11. **Guard the `threshold: 0.2` bug.** Any block taller than 5× viewport never reveals. ScrollTrigger's `start` string avoids this class of bug entirely.

---

## Appendix — files produced

| File | Contents |
|---|---|
| `detect-stack.js` | window-globals sweep, script/stylesheet inventory, CSS keyframe/bezier/transition extraction, GSAP-internals probe → `stack-report.json` |
| `dom-inspect.js` | `[data-on-view]` census with computed styles + doc offsets, section geometry, sticky/fixed census → `dom-report.json` |
| `hero-header.js` | inline-script dump, hero/header markup, header state at 7 scroll positions, hero-image cycle sampling |
| `scroll-capture.js` | 29 frames at 150 px steps, 0→4200 px, with per-frame in-flight opacity/transform log → `scroll-log.json` |
| `micro-capture.js` | hover before/after pairs, nav submenu, search overlay, sub-frame entrance sampling |
| `curve-record.js` | rAF-sampled opacity/translateX timeline → easing-curve identification |
| `transition-subpage.js` | page-transition probe, `/solutions/cnc-machining/`, `/solutions/`, `/about/` animation census |
| `theme-app.js`, `theme-site.css`, `theme-site.pretty.css`, `home.html` | raw source |
| `shots/uptive-motion/scroll-*.jpg` | 29 scroll frames |
| `shots/uptive-motion/hover-*-before/after.jpg` | 8 hover pairs |
| `shots/uptive-motion/nav-submenu-open.jpg`, `submenu-*.jpg`, `search-open.jpg`, `pagetrans-*.jpg` | UI states |
