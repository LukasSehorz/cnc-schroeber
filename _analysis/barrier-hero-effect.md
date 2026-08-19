# barriergroup.com — Hero wordmark → navbar morph, fully reverse-engineered

Analysed 2026-08-05 with Playwright 1.62.1 / Chromium at 1440×900, 1920×1080 and 390×844.
Source JS recovered in full from the theme (`cargopress`), so this is not inference — it is the actual implementation.

---

## 0. TL;DR — the definitive answer

**It is ONE element. No cross-fade. No `position: sticky`. No GSAP. No CSS scroll-timeline.**

The "giant wordmark" *is literally the navbar logo* — the same `<a class="header__logo">` that contains an inline `<svg viewBox="0 0 1587 242">`. It lives **inside the `<header>`** the whole time.

Two tricks make it work:

1. The `<header>` is `position: fixed` and starts at **`top: -62px`** — parked entirely above the viewport, so the white bar is invisible at scroll 0.
2. Inside that off-screen header, the logo is `position: absolute; top: 82px; left: 50%; transform: translateX(-50%)`. Header at `-62` + logo at `+82` = **viewport y = 20px**. That is how a navbar logo renders as a 1400px-wide banner over the hero video.

Then JS (**Motion One**, not GSAP) writes inline `width` / `top` on that same anchor:

| phase | scroll | what happens | how |
|---|---|---|---|
| **A. scrub** | `0 → scroll_range` (**154px** @1440, **300px** @1920) | logo `width` 1400 → 1390 (@1440) / 1600 → 1460 (@1920). `top` unchanged. | scroll-scrubbed, **linear** (`animation.time = progress`) |
| **B. snap** | crossing `scroll_range` once | logo `width → 114px`, `top → 19px`; header `top -62 → 0`; sub-labels `scale 1→0, opacity 1→0`; blue chip appears | **one-shot 600 ms `ease-in-out` tween**, NOT scrubbed |
| **C. reverse** | scrolling back below `scroll_range` | logo `width 114 → 1400`, `top 20 → 82`; header `top 0 → -57` | **400 ms LINEAR** hand-rolled `requestAnimationFrame` loop |

So the shrink you perceive is **not** scroll-scrubbed. It is a **triggered 600 ms eased tween** that fires the moment `scrollY` crosses ~154px. Lenis smooth-scroll makes it *feel* scrubbed. The genuinely scrubbed part (phase A) only changes the width by 10px at 1440 — visually imperceptible; at 1920 it is 140px and mildly visible.

**Nothing scales via `transform`.** The morph animates the CSS `width` of the anchor; the SVG inside is `width: 100%; height: auto`, so it scales by layout. Because the anchor is `left:50%; translateX(-50%)`, the shrink is symmetric about the horizontal centre — i.e. the effective transform-origin is **top-centre**.

**The video does not pin, scale or fade.** It scrolls away 1:1 with the hero.

---

## 1. Library detection

```
window.gsap            → undefined        window.ScrollTrigger  → undefined
window.ScrollSmoother  → undefined        window.LocomotiveScroll → undefined
window.Motion          → object   ← MOTION ONE (the animation engine)
window.Lenis           → function
window.lenis           → object   { smoothWheel: true, lerp: 0.1, autoRaf: true }
window.Swiper          → function (card slider only)
window.jQuery          → function (block bootstrapping only)

CSS rules using `animation-timeline` : 0
CSS rules using `view-timeline` / `scroll-timeline` : 0
```

`Motion` exports in use: `animate`, `scroll`, `stagger`, `inView`, `press`, `hover`.

Lenis init (from `theme/js/script.min.js`):
```js
new Lenis({ autoRaf: true, prevent: e => e && e.nodeType === 1 &&
  (e.classList.contains("enable-overflow") || e.classList.contains("chosen-results") || e.closest(".chosen-results") !== null) })
```

Scripts:
```
/wp-includes/js/jquery/jquery.min.js
/wp-content/themes/cargopress/theme/js/packages.min.js      ← bundles Motion One + Lenis + Swiper
/wp-content/themes/cargopress/theme/js/script.min.js        ← Lenis init, header/nav behaviour
/wp-content/themes/cargopress/theme/blocks/primary-hero/view.js  ← THE EFFECT (11.8 KB, unminified)
/wp-content/themes/cargopress/theme/blocks/{two-col-with-stats,card-slider,latest-news}/view.js
```
CSS: a single Tailwind v4 build at `/wp-content/themes/cargopress/theme/style.css` (119 KB).
Stack: WordPress 7.0.2 + ACF Pro blocks + Tailwind v4 (arbitrary-value + `group-data-[…]` variants).

---

## 2. Measurement table (1440×900, screenshots every 60px)

`scroll_range = 153.8px`. Sampled with 130 ms settle, so row 180 catches the 600 ms tween mid-flight.

```
scrollY | logoW  logoH  logoT logoL | logo.pos/top      | hdr.top  hdr.rectT h | sub.op sub.transform      | chip   | video.t  video.pos | h1.top
--------|---------------------------|-------------------|---------------------|--------------------------|--------|--------------------|-------
      0 | 1400.0 246.0   20.0  20.0 | absolute 82px     | -62px      -62.0 57 |  1.00  none              |129x35  |     0.0   static   | 563.0
     60 | 1396.1 245.4   20.0  22.0 | absolute 82px     | -62px      -62.0 57 |  1.00  none              |129x35  |   -60.0   static   | 503.0
    120 | 1392.2 244.8   20.0  23.9 | absolute 82px     | -62px      -62.0 57 |  1.00  none              |129x35  |  -120.0   static   | 443.0
    180 | 1220.1 218.5   23.8 109.9 | absolute 73.52px  | -49.70px   -49.7 57 |  0.89  scale(0.8654)     |129x35  |  -180.0   static   | 383.0   ← mid-tween
    240 |  114.0 117.4   19.0 663.0 | absolute 19px     |   0px        0.0 57 |  0.00  scale(0)          |129x35  |  -240.0   static   | 323.0   ← settled
    300 |  114.0 117.4   19.0 663.0 | absolute 19px     |   0px        0.0 57 |  0.00  scale(0)          |129x35  |  -300.0   static   | 263.0
   …600 |  114.0 117.4   19.0 663.0 | absolute 19px     |   0px        0.0 57 |  0.00  scale(0)          |129x35  |  -600.0   static   | -37.0
  …1200 |  114.0 117.4   19.0 663.0 | absolute 19px     |   0px        0.0 57 |  0.00  scale(0)          |129x35  | -1200.0   static   |-637.0
```

Notes
* `logo.transform` is **`none`** at every step except the CSS `translateX(-50%)` baked into `left:50%` positioning (computed `left: 720px` = viewport centre). No scale transform anywhere.
* Final `left 663 + width 114 → centre 720` = exact viewport centre.
* `video.rect.top` marches `0 → −1200` in lockstep with `scrollY`: **not fixed, not pinned, not parallaxed**. `position: static`, `transform: none`, `opacity: 1`, `filter: none` throughout.
* `logoH` never reaches 17.4px (the true SVG height at 114px wide) — it stays 117.4px because the `scale(0)` sub-label row still occupies ~90px of layout. Invisible, but it's there.

### 1920×1080

```
scroll_range = 300.3px      widthFrom = 1600 (header container, max-w-1600)
                            widthTo   = 1460 (hero container 1510 − 50)

scrollY | logoW  logoT logoL | hdr.top | sub.op
      0 | 1600.0  20.0 160.0 | -62px   | 1.00
     60 | 1572.0  20.0 174.0 | -62px   | 1.00     ← phase A scrub is visible here (−140px total)
    180 | 1516.1  20.0 202.0 | -62px   | 1.00
    300 | 1460.1  20.0 229.9 | -62px   | 1.00     ← end of scrub
    360 | 1010.5  28.8 454.8 | -32.2px | 0.68     ← mid-tween
    420 |  116.0  19.1 902.0 |   0px   | 0.00
    480 |  114.0  19.0 903.0 |   0px   | 0.00     ← settled (903 + 114/2 = 960 = centre)
```

### Per-frame trace of the 600 ms forward tween (`showNavigation`) @1440

```
t(ms)  logoW    logo.rectTop  logo.css.top  header.css.top  subtext.opacity  subtext.scale
    6  1400.00      20.00       82px          -62px            1.000          1.000
   24  1339.47      21.39       79.04px       -57.65px         0.963          0.953
   54  1230.22      23.77       73.68px       -49.92px         0.875          0.868
  103  1071.73      26.94       65.92px       -38.98px         0.748          0.745
  144   946.14      29.16       59.77px       -30.61px         0.669          0.647
  210   758.41      31.86       50.57px       -18.71px         0.519          0.501
  269   605.22      33.06       43.06px       -10.01px         0.384          0.382
  340   442.25      32.45       35.08px        -2.63px         0.264          0.255
  405   314.58      28.81       28.83px         0px            0.161          0.156   ← header done (400 ms)
  470   213.56      23.88       23.88px         0px            0.079          0.077
  537   141.89      20.36       20.37px         0px            0.023          0.022
  607   114.00      19.00       19px            0px            0.000          0.000   ← done (600 ms)
```

The wordmark's **viewport top traces a shallow downward arc: 20 → 33 → 19 px**, because `header.top` (400 ms) and `logo.top` (600 ms) run on different durations. Nice detail worth reproducing.

### Per-frame trace of the 400 ms reverse (`resetLogo`) @1440

```
t(ms)  logoW    logo.css.top  header.css.top  subtext.opacity
  104   114.00     19px          0px            0.00
  143   279.75     27.75px      -6.72px         0.07
  193   445.83     35.52px     -17.39px         0.20
  264   666.61     45.84px     -30.98px         0.36
  307   832.36     53.59px     -38.08px         0.47
  364   998.11     61.34px     -46.06px         0.58
  412  1163.86     69.09px     -51.57px         0.67
  462  1329.61     76.84px     -55.41px         0.76
  511  1400.00     82px        -57.00px         0.83
  763  1400.00     82px        -57px            1.00
```
Width deltas per sample are constant (~166px) ⇒ **linear**. Header ends at **−57px, not −62px** — a 5px inconsistency in their own code (CSS initial is `-62`, the JS reset target is `-57`).

---

## 3. The actual source (`blocks/primary-hero/view.js`, verbatim, trimmed)

```js
const { animate, scroll, press, hover, stagger, inView } = Motion;

let bar_top = 0, logo_top = 82;                 // 82 unless the WP admin bar is present

const header           = document.querySelector('.header');
const header_container = document.querySelector('.header__container');
const logo             = document.querySelector('.header__logo');
const logo_background   = document.querySelector('.header__logo__background');
const logo_subtext      = document.querySelector('.header__logo__subtext');
const primary_hero           = block;
const primary_hero_container = primary_hero.querySelector('.primary-hero__container');

let logo_animation, scroll_range = 0, navigation_showing = false, animation_in_progress = false;

// 1) initial sizing: the "banner" width == the header container width
logo.style.width = `${header_container.offsetWidth}px`;
logo.style.opacity = 1;
primary_hero.style.paddingTop = `${logo.offsetHeight}px`;   // hero reserves room for the banner

// 2) the SNAP-IN (fires once, when progress hits 1)
function showNavigation() {
  animate(header,          { top: bar_top },                                  { duration: 0.4, easing: 'ease-in-out' });
  animate(logo,            { width: '7.125rem', top: '1.1875rem', opacity: 1 },{ duration: 0.6, easing: 'ease-in-out' }); // 114px / 19px
  animate(logo_subtext,    { scale: 0, opacity: 0 },                          { duration: 0.6, easing: 'ease-in-out' });
  animate(logo_background, { width: '8.0625rem', height: '2.1875rem' },       { duration: 0.6, easing: 'ease-in-out' }); // 129px x 35px
  navigation_showing = true;
}

// 3) build the PAUSED scrub timeline + compute the trigger distance
function startAnimation() {
  let spacer = parseFloat(getComputedStyle(primary_hero_container).paddingTop) / 1.5;

  if (logo_animation) logo_animation.cancel();
  logo_animation = animate(
    logo,
    { width: [header_container.offsetWidth, primary_hero_container.offsetWidth - 50],
      top:   [logo_top, logo_top] },
    { duration: 1, ease: "linear" }
  );
  logo_animation.pause();                                    // ← scrubbed by hand below

  scroll_range = primary_hero.querySelector('h1').getBoundingClientRect().top
               + window.scrollY - logo.offsetHeight - spacer;

  const progress = Math.min(window.scrollY / scroll_range, 1);
  logo_animation.time = progress;
  if (progress === 1) { if (!navigation_showing) showNavigation();
                        animate(logo, { width: 114, top: 19 }, { duration: 0.6, easing: 'ease-in-out' }); }
  else { logo.style.width = `${header_container.offsetWidth}px`;
         primary_hero.style.paddingTop = `${logo.offsetHeight}px`; }
}

// 4) the REVERSE: hand-rolled 400 ms LINEAR rAF loop
function resetLogo() {
  animation_in_progress = true; navigation_showing = false;
  let startTime; const duration = 400, startWidth = 114, startTop = 20;
  function animateStep(ts) {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    const currentScroll = Math.min(window.scrollY / scroll_range, 1);
    const targetWidth = primary_hero_container.offsetWidth
                      - (header_container.offsetWidth - primary_hero_container.offsetWidth) * currentScroll;
    logo.style.width = `${startWidth + (targetWidth - startWidth) * progress}px`;
    logo.style.top   = `${startTop  + (logo_top     - startTop)   * progress}px`;
    if (progress === 0) {
      animate(header,          { top: -57 },                { duration: 0.4, easing: 'ease-in-out' });
      animate(logo_background, { width: 0, height: '2.1875rem' }, { duration: 0.4, easing: 'ease-in-out' });
      animate(logo_subtext,    { scale: 1, opacity: 1 },    { duration: 0.6, easing: 'ease-in-out' });
      /* …plus: close any open dropdown, close the mobile menu… */
    }
    if (progress < 1) requestAnimationFrame(animateStep);
    else { /* rebuild the paused scrub timeline */ animation_in_progress = false; }
  }
  requestAnimationFrame(animateStep);
}

// 5) INTRO on load, then wire the scroll listener
animate(overlay,      { opacity: [1, 0] },            { duration: 2,   easing: 'ease-in-out' });
animate(logo_subtext, { scale: [0, 1], opacity: 1 },  { duration: 1,   easing: 'ease-in-out' });
animate(logo,
  { width: [`${header_container.offsetWidth/2}px`, `${header_container.offsetWidth}px`],
    top:   [`${block.offsetHeight/2}px`, logo_top] },
  { duration: 1.2, easing: 'ease-in-out' }
).then(() => {
  startAnimation();
  window.addEventListener('resize', startAnimation);
  scroll(() => {
    if (animation_in_progress) return;
    const progress = Math.min(window.scrollY / scroll_range, 1);
    if (progress === 1) { if (!navigation_showing) showNavigation(); }
    else if (navigation_showing) resetLogo();
    else logo_animation.time = progress;
  });
});
```

### `scroll_range` formula, evaluated

```
scroll_range = h1.documentTop − logo.offsetHeight − (heroContainer.paddingTop / 1.5)
```

| viewport | h1 doc-top | logo.offsetHeight | container pt | spacer | **scroll_range** | widthFrom → widthTo |
|---|---|---|---|---|---|---|
| 1440×900  | 563 | 246 | 244.8px (`17vw`)  | 163.2  | **153.8** | 1400 → 1390 |
| 1920×1080 | 743 | 276 | 250px (clamp max) | 166.7  | **300.3** | 1600 → 1460 |
| 390×844   | —   | 83  | 100px (clamp min) | 66.7   | **373.8** | 350 → 340   |

---

## 4. Hero visual design — exact numbers (1440×900)

### The wordmark
| property | value |
|---|---|
| element | `<a class="barrier-nav-logo header__logo">` → inline `<svg viewBox="0 0 1587 242">` |
| **font** | **NONE — it's outlined SVG paths.** 7 `<path>`s = B·A·R·R·I·E·R. The Didone / high-contrast serif look is baked into the vectors. The site's *only* webfont is **DM Sans** (300/400/500/700). |
| aspect ratio | 1587 : 242 = **6.558 : 1** |
| glyph bbox in viewBox | `x 0, y 0, w 1586.22, h 241.18` → glyphs fill the box edge-to-edge, zero optical padding |
| fill | **`#FFD100`** (all 7 paths, hard-coded in the SVG) |
| rendered @scroll 0 | `1400 × 213.5px`, at viewport `x 20 … 1420`, `y 20 … 233.5` |
| **bleed** | exactly **20px** from each screen edge (`header` has `px-[20px]`; the container is `max-w-[1600px]`) |
| CSS sizing | `[&_svg]:w-full [&_svg]:h-auto` — the SVG follows the anchor's width |
| positioning | `position:absolute; top:82px; left:50%; transform:translateX(-50%); z-index:20` |
| landed size | `114 × 17.4px` at viewport `x 663 … 777`, `y 19 … 36.4` |
| scale ratio | 114 / 1400 = **0.0814** @1440 · 114 / 1600 = **0.0713** @1920 |

### Flanking labels — `.header__logo__subtext`
```html
<div class="flex justify-between w-full header__logo__subtext mt-[10px]">
  <span>Stronger together</span><span>For over 50 years</span>
</div>
```
| property | value |
|---|---|
| font | DM Sans **500** |
| size | `clamp(13px, 3vw, 15px)` → **15px** @1440, **13px** @390 |
| letter-spacing | `tracking-[0.03em]` → **0.45px** |
| transform | **uppercase** (rendered "STRONGER TOGETHER" / "FOR OVER 50 YEARS") |
| colour | **`#FFD100`** |
| layout | flex row, `justify-content: space-between`, `width: 100%`, `margin-top: 10px` — pinned to the wordmark's own left/right edges |
| measured | left span `165.5 × 22.5` @ x 20 · right span `152.3 × 22.5` @ x 1267.7 → 1420 · both at y 243.5 |
| animation | intro `scale 0→1` over 1 s; snap-out `scale 1→0, opacity 1→0` over 600 ms |

### Headline `h1.primary-hero__title`
```
"Built for safety.<br>Engineered to last."
class: text-[clamp(40px,5vw,70px)] font-light -tracking-[0.03em] leading-[1em] mb-[68px]
```
| property | value @1440 | @390 |
|---|---|---|
| font-family | DM Sans | |
| font-size | **70px** (`clamp(40px, 5vw, 70px)`) | 40px |
| font-weight | **300** | 300 |
| line-height | **70px** (= `1em`) | 40px |
| letter-spacing | **−2.1px** (`-0.03em`) | −1.2px |
| colour | **`#FFFFFF`** | |
| margin-bottom | **68px** | 68px |
| position | static, in `.primary-hero__container`; rect `1400 × 140` @ `x 20, y 563` | |

### Sub-paragraph `.primary-hero__description`
```
"Global experts in fire protection, specialist coatings, industrial services and modular construction."
class: max-w-[415px] text-[clamp(15px,3vw,17px)] -tracking-[0.01em]
```
| property | value |
|---|---|
| font-size | **17px** @1440 / 15px @390 |
| font-weight | **300** (inherited) |
| line-height | **25.5px** (1.5) |
| letter-spacing | **−0.17px** (`-0.01em`) |
| colour | **`#FFFFFF`** |
| max-width | **415px** (wraps to 2 lines) |
| rect | `415 × 51` @ `x 20, y 771` — flush with the h1's left edge |

### CTA "LEARN MORE" — `.primary-hero__button > a.barrier-box-title`
```html
<a class="barrier-box-title pr-[26px] flex items-center relative gap-[8px]
          text-[clamp(13px,3cqw,15px)] w-fit group/button font-medium uppercase
          tracking-[0.03em] hover:after:right-[-25px]
          after:absolute after:top-0 after:right-0 after:block after:w-full after:h-full"
   data-style="yellow">
  <span class="barrier-box-title__box absolute left-0 w-[16px] h-[16px] flex items-center justify-center
               group-data-[style=yellow]/button:bg-brand-yellow">
     <span class="w-[50%] group-data-[style=yellow]/button:text-brand-yellow"><svg …arrow…/></span>
  </span>
  <span class="barrier-box-title__title left-[26px] relative font-normal">Learn more</span>
</a>
```
| property | value |
|---|---|
| label font | DM Sans **500**, `clamp(13px, 3cqw, 15px)` → **15px**, `letter-spacing 0.45px`, **uppercase**, `#FFFFFF` |
| the yellow square | **16 × 16px**, `background #FFD100`, `position:absolute; left:0` |
| gap / offset | label sits at `left: 26px` (so 16px box + **10px** visual gap); anchor has `padding-right: 26px` |
| total rect | **121.8 × 22.5px**, right-aligned at `x 1298.3 … 1420`, `y 799.5` (bottom-right of the hero, baseline-aligned with the sub-paragraph) |
| arrow glyph | 8 × 8px `→` stroke SVG inside the square, `stroke-width 2`, `currentColor` = `#FFD100` (invisible on yellow at rest — it only reads after the hover colour flip) |
| **hover** | the square **slides `left: 0 → 105.75px`** (to the far right of the label) **and recolours `#FFD100 → #141429`**, while the label slides **`left: 26px → 0`**. Net effect: box and label swap sides. Duration `.15s`, `cubic-bezier(.4,0,.2,1)` (Tailwind default `transition-all`). The `::after` pseudo extends the hit area to `right:-25px` on hover. |

### Background media treatment
```html
<div class="primary-hero overflow-hidden flex bg-brand-blue min-h-screen text-white pb-[78px] relative
            bg-cover bg-center
            after:z-0 after:block after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-black/10"
     style="padding-top:246px">                      ← set by JS = logo.offsetHeight

  <div class="cwrap primary-hero__container z-10 relative pt-[clamp(100px,17vw,250px)] mt-auto w-full">…</div>

  <div class="absolute z-0 w-full h-full top-0 left-0">
    <video class="w-full h-full object-cover object-center" playsinline autoplay muted loop
           src="…/Wind_Farms_At_Sea_…_fhd_3397218.mp4"></video>
  </div>

  <div class="primary-hero__overlay w-full h-full absolute z-10 pointer-events-none select-none bg-brand-blue top-0 left-0"></div>
</div>
```

| layer | value |
|---|---|
| hero `background-color` | **`#141429`** (`bg-brand-blue`) |
| hero `background-image` | a WebP poster still, `background-size: cover; background-position: 50% 50%` — sits behind the video as an instant-paint fallback |
| `<video>` | `object-fit: cover; object-position: 50% 50%`, `autoplay muted loop playsinline`, `1440 × 900`. **`position: static` inside an `absolute inset-0` wrapper — no transform, no filter, opacity 1.** |
| **video during scroll** | **not fixed, not pinned, no scale, no fade** — `rect.top` goes `0 → −1200` in exact lockstep with `scrollY` |
| **persistent scrim** | `.primary-hero::after` → **`rgba(0,0,0,0.1)`** (Tailwind `bg-black/10`, computed `oklab(0 0 0 / 0.1)`), `z-index: 0`, full-bleed. **That is the only permanent overlay — no gradient.** |
| load-time curtain | `.primary-hero__overlay` — solid `#141429`, `z-index:10`, animated `opacity 1 → 0` over **2 s ease-in-out** on load, then parked at 0 forever |
| hero box model | `min-height: 100vh` (900px), `padding-top: 246px` (JS = logo height), `padding-bottom: 78px`, `overflow: hidden`, `display: flex` |
| content container | `.cwrap` = `max-width: 1510px; margin-inline: auto; padding-inline: 20px` — plus `mt-auto` (bottom-pins the text block) and `padding-top: clamp(100px, 17vw, 250px)` (the gap under the wordmark) |
| next section | `.two-col-with-stats` starts at document y = **990** (hero bottom 900 + `mt-[clamp(30px,8cqw,90px)]`), white background, first element is a yellow `OUR VISION` eyebrow chip |

---

## 5. The navbar

```html
<header class="px-[20px] py-[10.5px] xl:py-[16px] fixed left-0 top-0 w-full z-30
               border-b border-brand-blue group bg-white
               data-[primary-hero=true]:top-[-62px]"
        data-primary-hero="true">
  <div class="max-w-[1600px] header__container mx-auto flex justify-between items-center">
    <div class="grow basis-0 order-3 sm:order-1 flex justify-end sm:justify-normal z-40">  <!-- LEFT -->
      <ul class="hidden xl:flex gap-[40px] header__navigation">…4 links…</ul>
      <div class="header__hamburger xl:hidden flex flex-col justify-center items-center gap-[5px] h-[35px] w-[35px] bg-brand-yellow">…</div>
    </div>
    <div class="grow basis-0 order-2 h-[24px] flex justify-center items-center">           <!-- CENTRE -->
      <a class="header__logo … absolute top-[82px] left-[50%] translate-x-[-50%] z-20">…SVG + subtext…</a>
      <div class="header__logo__background bg-brand-blue z-10 absolute" style="width:129px;height:35px"></div>
    </div>
    <div class="grow basis-0 order-1 sm:order-3 relative z-20 flex justify-end">           <!-- RIGHT -->
      <span class="header__navigation__sideLine absolute bg-brand-blue left-[-35px] top-[-17px] w-px h-[calc(100%+34px)]"></span>
      <a class="barrier-box-title …" data-style="yellow">Contact us</a>
    </div>
  </div>
  <div class="header__mobileNavigation fixed top-[57px] hidden overflow-hidden left-0 bg-brand-yellow w-full h-0">…</div>
</header>
```

| property | value |
|---|---|
| **height** | **57px** = 16px padding-top + 24px content row + 16px padding-bottom + 1px border. Below `xl` (1280px): `py-[10.5px]` + a 35px hamburger = 56 + 1 = still **57px**. |
| position | `fixed; left:0; z-index:30` |
| **top at scroll 0** | **`-62px`** — the whole bar is parked above the viewport (5px past its own height, so the border doesn't peek) |
| **top after transition** | **`0`** (animated over 400 ms ease-in-out) |
| **background** | **`#FFFFFF`, opaque from the very first frame** — no transparent→solid change, no `backdrop-filter`. It simply isn't on screen until it slides down. |
| border-bottom | `1px solid #141429` |
| container | `max-width: 1600px; margin-inline: auto; display:flex; justify-content:space-between; align-items:center; height:24px` |
| **nav links** | DM Sans **400**, **15px**, `letter-spacing 0.45px` (`0.03em`), **uppercase**, colour **`#000000`**, `gap: 40px`. Items: ABOUT US · SERVICES (button, opens mega-dropdown) · INSIGHTS · HSEQ. Left-aligned starting at x = 20. Hidden below `xl` (1280px). |
| dropdown | full-width panel under the bar, `bg-brand-yellow` height 0 → auto; parent link 26px/300, child links 17px/300 `#141429`, staggered `x −20 → 0` + `opacity 0 → 1` |
| **right side** | a 1px vertical rule (`#141429`, 56.5px tall, at x ≈ 1264) then a **CONTACT US** CTA — DM Sans **500**, **15px**, `0.45px` tracking, uppercase, colour `#000000`, with the same **16 × 16px `#FFD100` square** + 10px gap + `padding-right: 26px`, right-aligned to x = 1420 |
| **logo chip** | `.header__logo__background` — **129 × 35px**, `background #141429`, `position: absolute`, `z-index: 10` (logo is z-20), `left: 655.5px` → centre 720 = viewport centre. Animated `width 0 → 129px` in. Result: the small yellow wordmark sits on a **dark navy chip** inside the white bar. Chip is 15px wider and ~18px taller than the 114 × 17.4 wordmark. |
| **mobile (< 1280px)** | nav `<ul>` → `display:none`; **35 × 35px `#FFD100` hamburger** with two `21 × 2px` `#141429` bars, `gap: 5px`, right-hand cell. Tapping animates a `position:fixed; top:57px; left:0; width:100%` **yellow** panel from `height:0` to full, staggering items in at `x −20 → 0` (50 ms stagger), and morphs the bars into an X (`rotate ±`, bars turn white, chip turns `#141429`). |
| **mobile hero morph** | identical mechanism. @390×844: wordmark starts **350px** wide (`390 − 2×20`) at `top:82px`, `scroll_range = 373.8px`, lands at the same **114px @ top 19px**, `left 138 → centre 195` = viewport centre. |

### Brand tokens (from `:root`)
```css
--barrier-blue:   #141429;   --color-brand-blue:   var(--barrier-blue);
--barrier-yellow: #ffd100;   --color-brand-yellow: var(--barrier-yellow);
--barrier-grey:   #f1efeb;   --color-brand-grey:   var(--barrier-grey);
--barrier-border-dark:  #39396a;
--barrier-border-light: #eeeae9;
--ease-in-out: cubic-bezier(.4, 0, .2, 1);
--default-transition-duration: .15s;
font-family: DMSans (300 / 400 / 500 / 700);
```

---

## 6. Rebuild recipe

### 6.0 Prerequisites
* An **SVG wordmark** with the glyphs outlined and a tight `viewBox` (Barrier: `0 0 1587 242`, ratio 6.558:1). This is *not* a webfont — do the same: set your wordmark in a high-contrast Didone (Bodoni / Playfair Display / GT Super), convert to outlines, and export with zero padding so `bbox == viewBox`.
* Lenis (optional but strongly recommended — it is what makes the triggered tween read as scrubbed).
* Choose an engine: Motion One (what Barrier uses), GSAP, or plain CSS transitions. All three configs below.

### 6.1 DOM

```html
<header class="site-header" data-hero="true">
  <div class="header__container">
    <div class="cell cell--left">
      <ul class="nav">…</ul>
      <button class="hamburger">…</button>
    </div>

    <!-- CENTRE CELL: fixed 24px tall, the logo escapes it via position:absolute -->
    <div class="cell cell--center">
      <a class="logo" href="/">
        <svg viewBox="0 0 1587 242" fill="none"><path fill="#FFD100" d="…"/></svg>
        <div class="logo__subtext">
          <span>Stronger together</span><span>For over 50 years</span>
        </div>
      </a>
      <div class="logo__chip"></div>
    </div>

    <div class="cell cell--right"><span class="rule"></span><a class="cta">Contact us</a></div>
  </div>
</header>

<section class="hero">                          <!-- padding-top set by JS = logo.offsetHeight -->
  <div class="hero__media"><video autoplay muted loop playsinline src="…"></video></div>
  <div class="hero__curtain"></div>
  <div class="hero__inner">
    <h1>Built for safety.<br>Engineered to last.</h1>
    <p class="hero__desc">…</p>
    <a class="cta cta--hero">Learn more</a>
  </div>
</section>
```

**The single most important structural decision: the giant wordmark IS the navbar logo, and it lives inside the `<header>`.** Do not build two elements.

### 6.2 CSS

```css
:root{
  --blue:#141429; --yellow:#FFD100; --grey:#F1EFEB;
  --hdr-h:57px;                 /* 16 + 24 + 16 + 1px border */
  --hdr-parked:-62px;           /* = -(hdr-h) - 5, hides the bottom border too */
  --logo-top-hero:82px;         /* banner offset INSIDE the parked header  -> 82-62 = 20px on screen */
  --logo-top-nav:19px;          /* landed offset                                                     */
  --logo-w-nav:114px;
  --ease:cubic-bezier(.42,0,.58,1);   /* Motion One 'ease-in-out' */
}

.site-header{
  position:fixed; left:0; width:100%; z-index:30;
  padding:16px 20px; background:#fff; border-bottom:1px solid var(--blue);
  top:0;
}
.site-header[data-hero="true"]{ top:var(--hdr-parked); }   /* PARKED ABOVE THE VIEWPORT */

.header__container{ max-width:1600px; margin-inline:auto; height:24px;
                    display:flex; justify-content:space-between; align-items:center; }
.cell{ flex:1 1 0; }
.cell--center{ height:24px; display:flex; justify-content:center; align-items:center; }

/* THE ONE ELEMENT */
.logo{
  position:absolute;
  top:var(--logo-top-hero);
  left:50%;
  transform:translateX(-50%);
  z-index:20;
  width:1400px;                 /* JS overwrites: = header__container.offsetWidth */
  opacity:0;                    /* JS fades in after the intro */
}
.logo svg{ width:100%; height:auto; display:block; }

.logo__subtext{
  display:flex; justify-content:space-between; width:100%; margin-top:10px;
  font-weight:500; font-size:clamp(13px,3vw,15px); letter-spacing:.03em;
  text-transform:uppercase; color:var(--yellow);
  transform-origin:50% 0;
}

.logo__chip{                    /* dark plate behind the landed wordmark */
  position:absolute; z-index:10; top:10.5px;
  width:0; height:35px; background:var(--blue);
  left:50%; transform:translateX(-50%);
}

/* HERO */
.hero{
  position:relative; display:flex; overflow:hidden;
  min-height:100vh; background:var(--blue); color:#fff;
  padding-bottom:78px;
  padding-top:246px;            /* JS overwrites: = logo.offsetHeight */
}
.hero::after{ content:""; position:absolute; inset:0; z-index:0; background:rgb(0 0 0/.10); }
.hero__media{ position:absolute; inset:0; z-index:0; }
.hero__media video{ width:100%; height:100%; object-fit:cover; object-position:center; }
.hero__curtain{ position:absolute; inset:0; z-index:10; background:var(--blue);
                pointer-events:none; user-select:none; opacity:1; }
.hero__inner{
  position:relative; z-index:10; width:100%; margin-top:auto;   /* bottom-pins the text */
  max-width:1510px; margin-inline:auto; padding-inline:20px;
  padding-top:clamp(100px,17vw,250px);                          /* gap under the wordmark */
}
.hero h1{ font-size:clamp(40px,5vw,70px); font-weight:300; line-height:1em;
          letter-spacing:-.03em; margin:0 0 68px; }
.hero__desc{ max-width:415px; font-size:clamp(15px,3vw,17px); font-weight:300;
             line-height:1.5; letter-spacing:-.01em; }

/* CTA: yellow square + label, swap on hover */
.cta{ position:relative; display:flex; align-items:center; gap:8px; width:fit-content;
      padding-right:26px; font-size:clamp(13px,3cqw,15px); font-weight:500;
      letter-spacing:.03em; text-transform:uppercase; text-decoration:none; color:#fff; }
.cta__box  { position:absolute; left:0; width:16px; height:16px; background:var(--yellow);
             display:flex; align-items:center; justify-content:center;
             transition:left .15s cubic-bezier(.4,0,.2,1), background .15s cubic-bezier(.4,0,.2,1); }
.cta__label{ position:relative; left:26px; font-weight:400;
             transition:left .15s cubic-bezier(.4,0,.2,1); }
.cta:hover .cta__box  { left:calc(100% - 16px); background:var(--blue); }
.cta:hover .cta__label{ left:0; }

@media (max-width:1279px){ .nav{display:none} .hamburger{display:flex} }
```

### 6.3 JS — faithful port (Motion One, matches Barrier 1:1)

```js
import { animate, scroll } from "motion";
import Lenis from "lenis";
new Lenis({ autoRaf: true });

const header = document.querySelector('.site-header');
const hcont  = document.querySelector('.header__container');
const logo   = document.querySelector('.logo');
const sub    = document.querySelector('.logo__subtext');
const chip   = document.querySelector('.logo__chip');
const hero   = document.querySelector('.hero');
const inner  = document.querySelector('.hero__inner');
const curtain= document.querySelector('.hero__curtain');

const LOGO_TOP = 82, LOGO_W_NAV = 114, LOGO_TOP_NAV = 19;
const HDR_PARKED = -57;                       // Barrier's reset target (CSS initial is -62)

let tl, scrollRange = 0, navShowing = false, busy = false;

// --- initial sizing -------------------------------------------------------
logo.style.width = `${hcont.offsetWidth}px`;
logo.style.opacity = 1;
hero.style.paddingTop = `${logo.offsetHeight}px`;

// --- the snap-in ----------------------------------------------------------
function showNavigation(){
  animate(header, { top: 0 },                                        { duration:.4, ease:'ease-in-out' });
  animate(logo,   { width:`${LOGO_W_NAV}px`, top:`${LOGO_TOP_NAV}px`,opacity:1 }, { duration:.6, ease:'ease-in-out' });
  animate(sub,    { scale:0, opacity:0 },                            { duration:.6, ease:'ease-in-out' });
  animate(chip,   { width:'129px', height:'35px' },                  { duration:.6, ease:'ease-in-out' });
  navShowing = true;
}

// --- build the paused scrub + compute the trigger distance ---------------
function build(){
  const spacer = parseFloat(getComputedStyle(inner).paddingTop) / 1.5;
  tl?.cancel();
  tl = animate(logo,
    { width:[hcont.offsetWidth, inner.offsetWidth - 50], top:[LOGO_TOP, LOGO_TOP] },
    { duration:1, ease:'linear' });
  tl.pause();

  scrollRange = hero.querySelector('h1').getBoundingClientRect().top
              + window.scrollY - logo.offsetHeight - spacer;

  const p = Math.min(window.scrollY / scrollRange, 1);
  tl.time = p;
  if (p === 1){ if(!navShowing) showNavigation();
                animate(logo,{width:LOGO_W_NAV, top:LOGO_TOP_NAV},{duration:.6,ease:'ease-in-out'}); }
  else { logo.style.width = `${hcont.offsetWidth}px`; hero.style.paddingTop = `${logo.offsetHeight}px`; }
}

// --- the reverse: 400 ms LINEAR rAF --------------------------------------
function resetLogo(){
  busy = true; navShowing = false;
  let t0; const D = 400, W0 = LOGO_W_NAV, T0 = 20;
  (function step(ts){
    t0 ??= ts;
    const p  = Math.min((ts - t0) / D, 1);
    const cs = Math.min(window.scrollY / scrollRange, 1);
    const targetW = inner.offsetWidth - (hcont.offsetWidth - inner.offsetWidth) * cs;
    logo.style.width = `${W0 + (targetW - W0) * p}px`;
    logo.style.top   = `${T0 + (LOGO_TOP - T0) * p}px`;
    if (p === 0){
      animate(header, { top: HDR_PARKED },        { duration:.4, ease:'ease-in-out' });
      animate(chip,   { width:0, height:'35px' }, { duration:.4, ease:'ease-in-out' });
      animate(sub,    { scale:1, opacity:1 },     { duration:.6, ease:'ease-in-out' });
    }
    if (p < 1) requestAnimationFrame(step); else { build(); busy = false; }
  })(performance.now());
}

// --- intro, then wire scroll ---------------------------------------------
animate(curtain, { opacity:[1,0] },           { duration:2, ease:'ease-in-out' });
animate(sub,     { scale:[0,1], opacity:1 },  { duration:1, ease:'ease-in-out' });
animate(logo,
  { width:[`${hcont.offsetWidth/2}px`, `${hcont.offsetWidth}px`],
    top:  [`${hero.offsetHeight/2}px`, `${LOGO_TOP}px`] },
  { duration:1.2, ease:'ease-in-out' }
).then(() => {
  build();
  window.addEventListener('resize', build);
  scroll(() => {
    if (busy) return;
    const p = Math.min(window.scrollY / scrollRange, 1);
    if (p === 1){ if (!navShowing) showNavigation(); }
    else if (navShowing) resetLogo();
    else tl.time = p;
  });
});
```

### 6.4 JS — GSAP / ScrollTrigger variant (fully scroll-scrubbed — smoother than the original)

If you want the morph *genuinely* tied to the scrollbar (which most people assume Barrier does), scrub the whole thing over a real distance instead of snapping. **Use `transform: scale()` rather than `width`** — it's GPU-composited and won't relayout every frame.

```js
gsap.registerPlugin(ScrollTrigger);

const logo = document.querySelector('.logo');
const START_W = document.querySelector('.header__container').offsetWidth;  // 1400 @1440, 1600 @1920
const END_W   = 114;
const S       = END_W / START_W;      // 0.0814 @1440 · 0.0713 @1920

gsap.set(logo, {
  width: START_W,
  top: 82,                            // inside a header parked at top:-62  → y = 20 on screen
  left: '50%',
  xPercent: -50,                      // keeps translateX(-50%) composable with scale
  transformOrigin: '50% 0%',          // TOP-CENTRE — this is the origin that makes it land right
  force3D: true
});

const DISTANCE = 420;                 // px of scroll the morph occupies. Barrier's effective
                                      // distance is ~154 + 600ms of tween; 380–480 feels equivalent.

gsap.timeline({
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: `+=${DISTANCE}`,
    scrub: 0.6,                       // slight lag; use scrub:true for 1:1
    invalidateOnRefresh: true
  }
})
  .to(logo,                 { scale: S, top: 19, ease: 'power2.inOut', duration: 1 }, 0)
  .to('.site-header',       { top: 0,             ease: 'power2.inOut', duration: 0.66 }, 0)
  .to('.logo__subtext',     { scale: 0, opacity: 0, ease: 'power2.inOut', duration: 1 }, 0)
  .fromTo('.logo__chip',    { width: 0 }, { width: 129, ease: 'power2.inOut', duration: 1 }, 0);

ScrollTrigger.addEventListener('refreshInit', () => {
  const w = document.querySelector('.header__container').offsetWidth;
  gsap.set(logo, { width: w, scale: 1 });
});
```

**Why `transform-origin: 50% 0%` (top-centre) is the correct value:** the element is already horizontally centred by `left:50%; xPercent:-50`, so the X axis needs no origin correction — scaling about the centre keeps it centred at every intermediate size. On Y, a top origin means the element's *visual* top always equals its `top` value, so animating `top: 82 → 19` alone puts the wordmark exactly where you want it in the bar. Any other origin forces you to solve a coupled equation for `top`.

**Landing maths, to verify your numbers:**
```
header.top:  -62 → 0            (bar slides down 62px)
logo.top:     82 → 19           (measured inside the header)
viewport y:   20 → 19           (net: the wordmark barely moves vertically…)
              …but it arcs to ~33px mid-flight because the two tracks have different durations.
logo.left:  always 50% / translateX(-50%)  → x-centre is a fixed 720 @1440, 960 @1920
scale:      1 → 114/START_W
```

### 6.5 Pure-CSS variant (no JS animation library)

Because Barrier's transition is a *triggered eased tween*, not a scrub, a CSS transition + one IntersectionObserver reproduces phase B almost exactly. Skip phase A (it's 10px @1440 — nobody sees it).

```css
.site-header{ transition: top .4s var(--ease); top: var(--hdr-parked); }
.logo       { transition: width .6s var(--ease), top .6s var(--ease); }
.logo__subtext{ transition: transform .6s var(--ease), opacity .6s var(--ease);
                transform: scale(1); opacity: 1; }
.logo__chip { transition: width .6s var(--ease); width: 0; }

body[data-nav="on"] .site-header   { top: 0; }
body[data-nav="on"] .logo          { width: var(--logo-w-nav); top: var(--logo-top-nav); }
body[data-nav="on"] .logo__subtext { transform: scale(0); opacity: 0; }
body[data-nav="on"] .logo__chip    { width: 129px; }
```
```js
// sentinel: a 1px element placed at scroll_range down the hero
const sentinel = document.querySelector('.hero__sentinel');   // style: position:absolute; top:154px; height:1px
new IntersectionObserver(([e]) => {
  document.body.dataset.nav = e.isIntersecting ? '' : 'on';
}, { rootMargin: '0px 0px -100% 0px' }).observe(sentinel);
```
Note the asymmetry Barrier has (600 ms eased in, 400 ms linear out) is lost here — CSS uses the same curve both ways. If you want it, add `body:not([data-nav="on"]) .logo { transition-duration:.4s; transition-timing-function:linear }`.

### 6.6 Numbers to plug in

| knob | @1440×900 | @1920×1080 | @390×844 | source |
|---|---|---|---|---|
| header height | 57px | 57px | 57px | `16+24+16+1` (`10.5+35+10.5+1` on mobile) |
| header parked `top` | −62px | −62px | −62px | CSS `data-[primary-hero=true]:top-[-62px]` |
| header reset `top` | −57px | −57px | −57px | JS `animate(header,{top:-57})` |
| logo start width | **1400** | **1600** | **350** | `header__container.offsetWidth` (`min(vw−40, 1600)`) |
| logo scrub end width | 1390 | 1460 | 340 | `heroContainer.offsetWidth − 50` |
| logo end width | **114px** (`7.125rem`) | 114px | 114px | fixed |
| logo `top` hero → nav | **82 → 19px** (`1.1875rem`) | same | same | fixed |
| effective scale | **0.0814** | 0.0713 | 0.3257 | `114 / startWidth` |
| **trigger scrollY** | **153.8** | **300.3** | **373.8** | `h1DocTop − logoH − heroPadTop/1.5` |
| forward tween | **600 ms ease-in-out** (header 400 ms) | same | same | Motion One |
| reverse tween | **400 ms linear** (header 400 ms ease-in-out) | same | same | rAF loop |
| chip | 129 × 35px `#141429` | same | same | `8.0625rem × 2.1875rem` |
| transform-origin (scale rebuild) | **`50% 0%`** | same | same | derived |
| intro | width `w/2 → w`, top `heroH/2 → 82`, 1.2 s ease-in-out; curtain `opacity 1→0` 2 s; sub `scale 0→1` 1 s | | | Motion One |

### 6.7 Gotchas found in the original — fix these in your build

1. **No `prefers-reduced-motion` guard anywhere** in `view.js`. Add one: skip the intro and set the end state immediately.
2. **`-62` vs `-57`** — the CSS parks the header at −62px but `resetLogo` returns it to −57px, so after one scroll-down/up round-trip the bar sits 5px lower and its bottom border can graze the viewport. Pick one value.
3. **The `scale(0)` sub-label row still occupies ~90px of layout** in the landed state (`.logo` measures 117.4px tall for a 17.4px wordmark). Harmless only because the anchor is `position:absolute`. Use `visibility:hidden` / `height:0` as well, or `display:none` at the end.
4. **`width` is animated, not `transform`** — that is a layout-thrashing property at 60fps. On a heavier page this would jank. The `scale()` approach in §6.4 is strictly better.
5. **Trigger is a hard equality (`progress === 1`)** with a single boolean latch. It works, but a fast flick that lands exactly on the boundary can double-fire `resetLogo`. Prefer a hysteresis band (e.g. enter at `scroll_range`, exit at `scroll_range − 40`).
6. **`scroll_range` depends on `h1.getBoundingClientRect().top`**, so it must be recomputed on resize (they do) *and* after webfont swap (they don't) — measure inside `document.fonts.ready`.

---

## 7. Artefacts produced

```
_analysis/
  barrier-hero-effect.md                  ← this file
  b-discover.js / b-discover.json         library + DOM discovery
  b-html.js  / b-header.html / b-hero.html / b-header-meta.json
  b-scroll.js / b-scroll-1440x900.json / b-scroll-1920x1080.json
  b-tween.js  / b-tween-1440.json / b-tween-rev-1440.json     per-frame tween traces
  b-design.js / b-design-1440.json        typography, colour, box metrics
  b-extra.js  / b-frames.js / b-final.js  mobile, CTA hover, morph frames, SVG bbox
  src/blocks_primary-hero_view.js         ← THE SOURCE (unminified, 234 lines)
  src/js_script.min.js / js_packages.min.js / style.css
  shots/barrier/
    barrier-scroll-0000.png … barrier-scroll-1200.png            (21 frames @1440×900, 60px steps)
    barrier-scroll-0000-1920x1080.png … -1200-1920x1080.png      (21 frames @1920×1080)
    barrier-morph-000ms.png … barrier-morph-600ms.png            (8 exact interpolated morph frames)
    barrier-tween-000ms.png … barrier-tween-700ms.png
    barrier-mobile-390-scroll0.png / -scroll400.png
    barrier-1920-hero.png / barrier-section2-boundary.png
```
