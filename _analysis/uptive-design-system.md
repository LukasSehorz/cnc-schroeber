# UPTIVE (uptivemfg.com) — Design System Extraction

Reference site for 1:1 visual rebuild. All values pulled from `getComputedStyle` on live elements
at 1440×900 and 390×844, plus the compiled theme stylesheet
`https://uptivemfg.com/wp-content/themes/industrial/resources/css/site.css?v=52cbac6`
(local copy: `_analysis/site.css`).

**Stack:** WordPress, custom theme `industrial`, **Tailwind CSS v3.2.4** with a custom token config.
Forms = Gravity Forms + HubSpot embeds. Slider = Splide. Lightbox = GLightbox.

**Overall character:** Clean, bright, corporate-industrial. White canvas, deep navy as the single
dominant brand color, light "sky" blue as the accent/highlight. Zero dark sections except the
photo heroes. Almost no shadows. Small radii (6–8px). Photography is documentary/real-workplace,
never rounded, often bleeding past the container edge. Type is a two-family system:
**Raleway** for headings/buttons/labels, **Roboto** for body.

---

## 1. SITE MAP (every URL found)

### Primary nav (5 top-level items + search + CTA)
| Label | URL |
|---|---|
| Solutions | `https://uptivemfg.com/solutions` |
| Materials | `https://uptivemfg.com/materials` |
| Knowledge Base | `https://uptivemfg.com/knowledge-base` |
| Industries | `https://uptivemfg.com/industries-served` |
| About | `https://uptivemfg.com/about-uptive-manufacturing` |
| *(CTA button)* Get a Quote | `https://uptivemfg.com/get-quote` |

### Dropdown children
**Solutions →**
- `/solutions/rapid-prototyping`
- `/solutions/additive-manufacturing-services`
- `/solutions/cnc-machining`
- `/solutions/sheet-metal-fabrication`
- `/solutions/injection-tooling-and-molding`
- `/solutions/post-processing-finishing`
- `/solutions/urethane-casting`

**Materials →**
- `/materials/metal-prototyping` (Metals)
- `/materials/polymer-prototyping` (Polymers)
- `/materials/composite-prototyping` (Composites)

**Knowledge Base →**
- `/faq`, `/case-studies`, `/videos`, `/spec-sheets`, `/guides`, `/webinars`, `/blog`

**Industries →**
- `/industries-served/aerospace-manufacturing`
- `/industries-served/automotive-manufacturing`
- `/industries-served/custom-drone-parts`
- `/industries-served/electronics-manufacturing`
- `/industries-served/industrial-equipment-manufacturing`
- `/industries-served/medical-device-manufacturing`

**About →**
- `/about-uptive-manufacturing/quality-control`
- `/our-brands`
- `/contact`
- `/about-uptive-manufacturing/careers`

### Footer-only
- `mailto:hello@uptivemfg.com`, `tel:(888) 467-7686`
- `/privacy-policy-2`
- Footer repeats the whole nav tree in 3 columns + a separate brand/address column.

### Top announcement bar (above header)
4 sub-brand logo links: GOPROTO / RE3DTECH / PHOENIX Tooling & Molding / STANFORDVILLE Precision Machining
(each "an UPTIVE Company").

---

## 2. COLORS

All values verified via computed styles. Tailwind token names in the left column are the
theme's own names (usable 1:1 in a Tailwind rebuild).

### Brand palette
| Token | Hex | RGB | Where it is used |
|---|---|---|---|
| `brand-primary-1` | **#193768** | 25,55,104 | **The** brand navy. All headings, all nav links, primary button fill, footer bottom bar, footer column headers, table header row, comparison-table header, card-bottom labels, active section-nav item, testimonial card bg, breadcrumb text, `main a` link color |
| `brand-primary-2` | **#8dc6e8** | 141,198,232 | Eyebrow/kicker text on dark heroes, footer copyright text + Privacy Policy link, `::marker` bullet color in prose lists, testimonial attribution text, TOC sub-list left border |
| `brand-primary-3` | **#5b7e96** | 91,126,150 | Search submit button fill; hamburger bar color is the closely related **#5c8097** |
| `brand-accent` | **#98cbeb** | 152,203,235 | **Second most important color.** Button arrow tab, hero section-nav (right rail) fill, sidebar section-nav fill, newsletter band background |
| `brand-accent-2` | **#3a8dde** | 58,141,222 | Table borders (`table, table td`), gradient overlay base |
| `brand-secondary` | **#a5bac9** | 165,186,201 | TOC item divider borders |
| `brand-secondary-2` | **#a5d1ec** | 165,209,236 | 1px card outline on the "OUR PROCESS" panel; the vertical center divider in the comparison table |
| `brand-black` | **#3d3d3d** | 61,61,61 | **Default body text color** (`html`/`body`), card titles, nav-link level-3 |
| `brand-copy` | **#505050** | 80,80,80 | Secondary/muted body text, eyebrow H3 labels, footer sub-links, TOC links |

### Neutrals & UI
| Purpose | Hex | Notes |
|---|---|---|
| Page background | **#ffffff** | Every section. There are **no** tinted section backgrounds on the homepage. |
| Header background | **#ffffff** | opaque, always |
| Header bottom border | **#f1f1f1** | 1px solid |
| Announcement bar bg | **#004987** | inline/CMS override on `#announcment-banner` (deeper than brand navy) |
| Hero base bg | **#000000** | behind the cover photo |
| Image placeholder / `neutral-50` | **#eaeaea** | `bg-neutral-50` behind card images while loading |
| `neutral-100` | **#737373** | footer address block text |
| `neutral-400` | **#a3a3a3** | light borders |
| Gallery image border | **#f0f0f0** | 1px around every gallery/grid image |
| Certification panel bg | **#e7e5e1** | warm light gray (`bg-[#E7E5E1]`), verified by pixel sample |
| Generic Tailwind border | **#e5e7eb** | default `border` color (comparison card outline) |
| Input border | **#9ca3af** | search field |
| Mobile menu level-1 panel bg | **#ebebeb** | `.sub-menu.lv-1`, `.nav-link.lv-3` |
| Mobile menu level-2 panel bg | **#e0e0e0** | `.sub-menu.lv-2` |
| Flip-card gradient | `linear-gradient(0deg, #ddf1fd, #8dc7e9)` | bottom→top light-blue wash |
| Section-nav hairline | `#00498722` (i.e. #004987 @ 13%) | 1px bottom border, 82% width |

### Overlays
```css
/* #hero.overlay::after — darkens the left side so white type stays legible */
background: linear-gradient(90deg, rgba(0,0,0,.7), transparent 75%);
z-index: 15;   /* image is z-10, content is z-20 */
```

---

## 3. TYPOGRAPHY

### Families (self-hosted woff2/woff, `font-display: swap`)
```
Display / headings / buttons / labels:  Raleway, Helvetica, sans-serif   (400, 600, 700)
Body / nav / UI:                        Roboto, Helvetica, sans-serif    (300, 400, 500, 700)
Mono:                                   "Courier New", Courier, monospace
```
Files live at `/wp-content/themes/industrial/resources/fonts/` — `raleway-v28-latin-{regular,600,700}`,
`roboto-v30-latin-{300,regular,500,700}`. **No Google Fonts CDN link** — fully self-hosted.

### Base
```css
html, body {
  font-family: Roboto, Helvetica, sans-serif;
  font-size: 16px;
  line-height: 26px;   /* 1.625 */
  font-weight: 400;
  color: #3d3d3d;
}
```

### The responsive size scale (`.text-r-*` utility classes)
These are the theme's whole type scale. Every heading uses one.
```css
.text-r-12 { font-size: clamp(10px, 2vw, 12px) }
.text-r-16 { font-size: clamp(14px, 2vw, 16px) }
.text-r-18 { font-size: clamp(14px, 2vw, 18px) }
.text-r-20 { font-size: clamp(18px, 2vw, 20px) }
.text-r-22 { font-size: clamp(18px, 4vw, 22px) }
.text-r-24 { font-size: clamp(17px, 4vw, 24px) }
.text-r-32 { font-size: clamp(21px, 4vw, 32px) }
.text-r-42 { font-size: clamp(30px, 5vw, 42px) }
.text-r-44 { font-size: clamp(32px, 5vw, 44px) }
.text-p-14{ font-size: 14px }   /* fixed */
```

### Full type scale — measured at 1440px, with mobile (390px) value in brackets

| Role | Family | Size | Weight | Line-height | Letter-spacing | Transform | Color |
|---|---|---|---|---|---|---|---|
| **H1 hero** (`#hero-headline.text-r-44`) | Raleway | **44px** [32px] | **600** | **52.8px (1.2)** | normal (0) | none | #ffffff |
| **H2 section** (`.headline` / `.text-r-42`) | Raleway | **42px** [30px] | **500** | **50.4px (1.2)** | **1.05px (0.025em)** | none | #193768 |
| **H2 default** (bare `h2` without `.headline`) | Raleway | 24px (1.5rem) | 500 | 32px (2rem) | normal | none | #193768 |
| **H3 eyebrow / label** (`.text-r-22`) | Raleway | **22px** [18px] | **600** | **26.4px (1.2)** | 0 or 0.55px (`tracking-wide` = .025em) | **UPPERCASE** | #505050 |
| **H3 card-title** (`.card-title.text-r-22`) | Raleway | **22px** | **600** | 26.4px | normal | **UPPERCASE** | #3d3d3d |
| **H3 in prose** | Raleway | clamp(18,2vw,20) → **20px** | **600** | 1.2 | normal | **UPPERCASE** | #3d3d3d |
| **Hero eyebrow** (`.eyebrow.text-r-16.tracking-wider`) | Roboto | **16px** | **400** | 26px | **0.8px (0.05em)** | **UPPERCASE** | #8dc6e8 |
| **Hero sub-copy, subpage** (`#hero-copy`) | Roboto | **18px** | 400 | **29.25px (1.625)** | normal | none | #ffffff |
| **Hero sub-copy, homepage** (`.home #hero-copy`) | Roboto | **24px** [17px] `clamp(17px,4vw,24px)` | 400 | **39px (1.625)** | normal | none | #ffffff |
| **Body paragraph** | Roboto | **16px** | 400 | **26px (1.625)** | normal | none | #3d3d3d (or #505050 muted) |
| **List item** | Roboto | 16px | 400 | 26px | normal | none | #3d3d3d |
| **Button label** (`.btn`) | Raleway | **16px** | **700** | 26px | **0.4px (0.025em)** | none | #ffffff |
| **Nav link L1** (`#nav .nav-link`) | Roboto | **16px** | **700** | 26px | normal | **none** (uppercase declared then reset) | #193768 |
| **Nav link L3** (dropdown items) | Raleway | **15px** | **400** | — | normal | none | #3d3d3d |
| **Mobile nav link** | Raleway | **13px** | **700** | 21.125px | normal | **UPPERCASE** | #3d3d3d |
| **Breadcrumbs** (`.breadcrumbs`) | Raleway | **14px** | 700 (links 400) | 22.75px | **0.35px (0.025em)** | none | #193768; first link #505050 |
| **Sidebar section-nav link** | Raleway | **14px** | **700** | 22.75px | normal | none | #193768 (active → #ffffff) |
| **Footer column header** (`#footer-nav a`) | Raleway | **18px** `clamp(14,2vw,18)` | **700** | 29.25px | **0.9px (0.05em)** | **UPPERCASE** | #193768 |
| **Footer sub-link** (`#footer-nav .sub-menu a`) | Roboto | **14px** | **400** | 22.75px | 0 | none | #505050 → hover #193768 |
| **Footer address text** (`.text-p-14`) | Roboto | 14px | 400 | 22.75px | normal | none | #737373 |
| **Footer bottom bar** | Roboto | **13px** | **700** | 21.125px | **0.65px (0.05em)** | none | #8dc6e8 |
| **"TRUSTED BY THE BEST"** | Roboto | **22px** (`.text-r-22`) | **400** | 35.75px | **1.1px (`tracking-wider`, .05em)** | **UPPERCASE** | #3d3d3d |
| **Comparison table header** | Raleway | **22px** | **600** | 35.75px | normal | **UPPERCASE** | #ffffff |
| **Table cell** | Roboto | **14px** | 400 | — | normal | none | #193768 |
| **`.more-link`** (text arrow CTA) | Roboto | **16px** | **700** | 26px | normal | **UPPERCASE** | #193768 |
| **Flip-card step number** | Roboto | **42px** | **700** | 68.25px | normal | none | #ffffff |
| **Flip-card bottom label** | Raleway | **18px** `clamp(14,2vw,18)` | **700** | 22.5px (1.25) | normal | none | #ffffff |
| **TOC title** | Raleway | 18px `clamp(14,2vw,18)` | 700 | — | normal | **UPPERCASE** | #193768 |

### Global heading rule (important)
```css
.headline, h1, h2, h3, h4, h5 {
  color: #193768;
  font-family: Raleway, Helvetica, sans-serif;
  font-weight: 500;
  line-height: 1.2 !important;   /* forced on every heading */
}
.headline {
  font-size: clamp(30px, 5vw, 42px);
  font-weight: 500;
  letter-spacing: .025em;
}
h2, .h2 { padding-bottom: 2rem; }   /* 32px — the standard heading→body gap */
```

**Notes on character:** headings are NOT uppercase and NOT condensed. They are a light-medium
weight (500) Raleway at a very tight 1.2 line-height with a hair of positive tracking — which is
what gives the site its airy, engineered look. Uppercase is reserved strictly for **eyebrows,
labels, card titles, footer column headers and table headers**, always at 22px/600 (Raleway)
or 16px/400 (Roboto, `tracking-wider`).

### Prose block (`.prose`)
```css
.prose p  { padding-bottom: 1rem; }              /* 16px between paragraphs */
.prose ul { margin-left: .5rem; padding-top: .7rem; }
.prose ul li { list-style: disc; margin-left: .5rem; padding-bottom: .75rem; }
.prose ul li::marker { color: #8dc6e8; font-size: 1.2em; }   /* light-blue bullets */
.prose h3 { font-size: clamp(18px,2vw,20px); font-weight:600; text-transform:uppercase; color:#3d3d3d; }
.prose.no-ul-tp ul { padding-top: 0; }
```

---

## 4. LAYOUT

### Breakpoints (custom — note `md` and `lg` are NOT Tailwind defaults)
```
sm   : 640px
md   : 1024px     ← the main mobile/desktop switch
lg   : 1170px
xl   : 1280px
2xl  : 1366px
(also declared: 480px, 1500px)
```

### Container
```css
.p-container {           /* the universal container */
  max-width: 1170px;
  margin: auto;
  padding-left: 1rem;    /* 16px */
  padding-right: 1rem;
}
.p-container .p-container { padding: 0; }   /* nested containers lose padding */
```
- At 1440px viewport: container box = **1170px**, content column = **1138px**, left edge at **x=151**.
- Header uses a **wider** wrapper: `mx-auto max-w-[1275px]` (content starts x=83, logo left edge).
- Tailwind's own `.container` is also present with max-widths 480/640/1024/1170/1280/1366/**1500**.
- Special wider panels: `max-w-[1248px]` (OUR PROCESS panel), `max-w-[1045px]` (comparison card).

### Section vertical rhythm
| Element | Padding |
|---|---|
| Standard `<section>` | **`py-12` = 48px top / 48px bottom** (this is the site's default and is used for almost every homepage section, desktop AND mobile — no responsive change) |
| First section after hero | `padding: 0 0 48px` (no top padding) |
| Hero | **`py-20` = 80px top/bottom**, `min-height: 648px` on home, `lg:min-h-[425px]` elsewhere (renders 502–555px depending on copy) |
| Footer main | `py-8` mobile / **`md:py-20` = 80px** desktop |
| Footer bottom bar | `py-5` = 20px |
| Newsletter band | `py-8` = 32px (total band height 110px) |
| Utility scale seen | `md:py-16` = 64px, `md:py-20` = 80px, `pb-10` = 40px, `pb-8` = 32px, `py-3` = 12px |

### Grid systems
```css
.grid-cols-40-60 { grid-template-columns: 40% 1fr }   /* text left,  image right */
.grid-cols-60-40 { grid-template-columns: 1fr 40% }   /* image left, text right  */
```
Measured on a 1138px content column with `gap-16` (64px): **455px / 619px**.

Other grids in use:
| Pattern | Columns | Gap |
|---|---|---|
| Intro text + photo collage | `md:grid grid-cols-2 gap-14` | **56px**, two 541px columns |
| 4-step process cards | `sm:grid-cols-2 md:grid-cols-4 md:gap-8` | **32px**, 270px cards |
| Logo wall | `grid-cols-2 md:grid-cols-3 gap-8` | 32px |
| Solution/industry cards | `grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-20 py-4` | **24px column / 80px row**, 363px cards |
| Comparison table | `grid grid-cols-2 gap-8` | 32px |
| Subpage sidebar + content | `md:grid-cols-[25%_1fr] gap-6` | **24px** → 284.5px / 829.5px |
| Footer | `md:grid grid-cols-2` then inner `columns-2 gap-8` | 32px |

Also declared: `md:grid-cols-[78%_1fr]`, `md:grid-cols-[65%_1fr]`.

### The "break-out" image trick (signature move)
Alternating feature rows push their photo **past the container edge** to the viewport edge:
```css
.break-out-left, .break-out-right { --w: 13vw; --min: -160px; width: calc(100% + var(--w)); }
.break-out-left { left: calc(var(--w) * -1); position: relative; }
```
Measured at 1440px: the 619px grid cell becomes an **806px image** that starts at `x = -136`
(left variant) or extends to `x = 1576` (right variant). Image height fixed at
`max-h-[385px]` with `.fill-img { width:100%; height:100%; object-fit:cover }`.

---

## 5. COMPONENTS

### Primary button `.btn` — the site's most distinctive component
A navy pill with a **separate light-blue arrow tab welded to its right edge**.
```css
.btn {
  --pv: 10px;  --r: 8px;
  display: inline-block;
  position: relative;
  background-color: #193768;
  color: #ffffff !important;
  border-radius: 8px;
  font-family: Raleway, Helvetica, sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 26px;
  letter-spacing: .025em;          /* 0.4px */
  padding: 10px 65px 10px 30px;    /* NOTE the huge right padding = room for the arrow */
}
.btn .btn-arrow {
  position: absolute; right: -1px; top: 0;
  height: 100%;                    /* 46px */
  width: 42px;
  display: flex; justify-content: center;
  padding: .25rem .75rem;          /* 4px 12px */
  background: #98cbeb;
  border-radius: 0 8px 8px 0;
}
.btn:hover:not([disabled]) { color: #193768 !important; }   /* text goes navy on hover */
#hero .btn span      { color: #98cbeb; }
#hero .btn:hover span{ color: #000000; }
#hero .btn { max-width: 370px; }
```
- Rendered height **46px**. Widths are content-driven (191px "Get A Quote", 268px "Request Consultation", 186px "Learn More").
- Nav CTA variant `#nav-rfq-btn`: `padding: clamp(5px,10px,4vw) clamp(14px,55px,10vw) … 12px` → **163×46px**.
- Mobile `.btn` padding: `10px 39px 10px 12px`.
- Hero CTAs sit in `.hero-cta { display:flex; gap:16px }`.

### Text link CTA `.more-link`
`LEARN MORE ››` — Roboto 16px, weight 700, UPPERCASE, `#193768`,
`display:inline-flex; gap:4px; align-items:center`, followed by a light-blue double-chevron SVG.
Used instead of a button in the alternating feature rows.

### Search button
```css
.btn-search { background:#5b7e96; color:#fff; border-radius:.375rem; padding:.25rem 1rem;
              font-size: clamp(14px,2vw,16px); font-weight:400; letter-spacing:.025em; }
```

### Flip cards (homepage 4-step process)
```css
.flip-card       { height: 324px; width: 270px; border-radius: 8px; perspective: 1000px; }
.flip-card-inner { border-radius: 6px; height:100%; position:relative;
                   background: linear-gradient(0deg, #ddf1fd, #8dc7e9);
                   transform-style: preserve-3d; transition: transform .8s; }
.flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
.flip-card-front, .flip-card-back { position:absolute; inset:0; backface-visibility:hidden; }
.flip-card-back  { transform: rotateY(180deg); }
```
- Step number badge `.step-num`: **58×70px**, `bg #193768`, white **Roboto 42px/700**, radius `0 0 6px 6px` — hangs off the top edge of the card.
- Front body copy: Raleway, uppercase, centered, `#505050`.
- `.card-bottom`: absolute bottom bar, `bg #193768`, white **Raleway 18px/700**, `line-height:1.25`,
  `padding: .75rem 2.5rem` (12px 40px), `border-radius: 0 0 6px 6px`, width 97%, `transform: translateZ(27px)`.

### Content cards (`.card` — solutions / industries grids)
Not a boxed card — a bare stacked column, `display:flex; flex-direction:column`, 363px wide, 488px tall:
1. `h3.card-title` — Raleway **22px/600 UPPERCASE #3d3d3d**, `padding-bottom: 12px`
2. `<a><img></a>` — **363×250px**, **`border-radius: 0`**, `object-fit: cover` (~1.45:1), `bg-neutral-50` (#eaeaea) placeholder
3. `div.card-copy` — `padding: 12px 0`, Roboto 16px/26px #3d3d3d
4. `a.btn.self-start.mt-auto` — "Learn More", pinned to the bottom of the column

### Sidebar / hero anchor nav (`.section-nav`)
```css
.section-nav-link {
  display:inline-flex; align-items:center; width:100%;
  background:#98cbeb; color:#193768;
  font-family: Raleway; font-size:14px; font-weight:700;
  padding: 1rem 1.25rem 1rem 1.75rem;      /* 16px 20px 16px 28px */
  transition: color .3s ease-in-out, background-color .2s;
}
.section-nav-link.active, .section-nav-link:hover { background:#193768; color:#fff !important; }
.section-nav-link.active svg, :hover svg { filter: brightness(10); transform: translateX(3px); }
.section-nav li::after { border-bottom:1px solid #00498722; width:82%; right:0; }   /* inset hairline */
.section-nav-container { position: sticky; top: 190px; margin-bottom: 3px; }
.section-nav.anchor-r li:first-child .section-nav-link { border-top-left-radius:.375rem }
.section-nav.anchor-r li:last-child  .section-nav-link { border-bottom-left-radius:.375rem }
.section-nav.anchor-l li:first-child .section-nav-link { border-top-right-radius:.375rem }
.section-nav.anchor-l li:last-child  .section-nav-link { border-bottom-right-radius:.375rem }
.section-nav.anchor-l:not(.static) { position:relative; left:-3vw; margin-left:-3vw; }
```
- Hero variant (`anchor-r`): fixed to the right viewport edge, **239px wide**, rows **55px** tall,
  rounded only on the left side so it looks tabbed into the screen edge.
- Sidebar variant (`anchor-l`): 285px column, pushed 3vw left of the container, sticky at `top: 190px`
  (clears the 178px header).

### Image treatments
| Context | Radius | Fit | Notes |
|---|---|---|---|
| Hero cover | 0 | `object-cover object-left`, absolute inset, z-10 | + gradient overlay |
| Feature-row photo | **0** | `object-cover`, `max-h-[385px]`, `.fill-img` | breaks out of container |
| Card image | **0** | `object-cover`, 363×250 | `bg-neutral-50` placeholder |
| Gallery / collage | **0** | `object-cover`, `height:100%` | **1px solid #f0f0f0 border**, `bg #f0f0f0` |
| Logo wall | 0 | contain | on white |

**Everything is square-cornered. There is not one rounded photo on the site.**

### Gallery grid presets
```css
.gallery-grid { display:grid; gap:5px; grid-template-columns:1fr 1fr 1fr; }
.gallery-grid.img-3 :first-child { grid-column: span 2; grid-row: span 2 }
.gallery-grid.img-4 :first-child { grid-column: span 2; grid-row: span 3 }
.gallery-grid.img-5 :first-child { grid-column: span 2 }
.gallery-grid.home-grid { grid-template-columns:1fr 1fr 1fr 1fr; grid-template-rows:25% 1fr 1fr 1fr }
  .home-grid :first-child  { grid-column:1/2; grid-row:1/3 }
  .home-grid :nth-child(2) { grid-column:2/5; grid-row:1/2 }
  .home-grid :nth-child(3) { grid-column:1/2; grid-row:3/5 }
  .home-grid :nth-child(4) { grid-column:2/5; grid-row:2/5 }
.gallery-grid.masonry { /* 4-col, rows 25% 1fr 1fr 1fr, 5 children */ }
.gallery-grid.reverse { direction: rtl }
```
**Gap is only 5px** — the collages read as one tight mosaic block.

### Eyebrow "notch" label (OUR PROCESS pattern)
An uppercase H3 that sits **on top of** a bordered panel's top edge, with a white background
punching a hole in the border:
```css
/* h3: .text-r-22 .text-center .font-semibold .uppercase .text-brand-copy
       .relative .md:-top-11 .mx-auto .w-56 .bg-white .px-5 */
position: relative; top: -2.75rem;   /* md:-top-11 */
width: 14rem;                        /* w-56 = 224px */
margin-inline: auto;
background: #ffffff;
padding: 0 20px;
```
Panel: `md:border border-brand-secondary-2 rounded-md py-8 px-8 max-w-[1248px] mx-auto`
→ **1px solid #a5d1ec, radius 6px, padding 32px**.

### Comparison table (UPTIVE vs Competitors)
- Outer: `border bg-white rounded-lg max-w-[1045px] mx-auto` → 1px #e5e7eb, **radius 8px**, white
- Header row: `grid grid-cols-2 p-4 bg-brand-primary-1 text-white uppercase font-semibold text-r-22`
  → **#193768**, 16px padding, `border-radius: 8px 8px 0 0`, mb-8
- Body: `grid grid-cols-2 gap-8 text-r-18 font-medium text-center`
- Center divider: `div.absolute.abs-h-center` — a **1px × full-height** bar of **#a5d1ec**
  (`.abs-h-center { left:50%; position:absolute; transform:translateX(-50%) }`)
- Row icons: circular ⊕ in #3a8dde-ish blue (left) / ⊖ in gray (right)

### Data tables
```css
table, table td { border-color: #3a8dde; }
table td { border-width: 1px; color: #193768; font-size: 14px; padding: .25rem; }
table td, th { text-align: center; }
.table-container { overflow-x: auto; }
```
Header row: navy #193768 fill, white bold text.

### Form fields
| Field | Style |
|---|---|
| Search input | `padding: 4px`, `border-radius: 6px`, `1px solid #9ca3af`, white, 192×36 |
| Newsletter email (HubSpot) | 250×46, `padding: 10px 30px`, **`border-radius: 5px`**, white, **no border** |
| Newsletter submit | `bg #193768`, white, Raleway 16/700, `padding: 10px 20px`, **radius 8px**, 120×46 |
| Contact form panel | 1px light-blue (#a5d1ec-family) border, rounded, white |
| Contact inputs | full-width, very light gray fill (~#f6f8fa), 1px light border, small radius, ~46px tall |
| Labels | Roboto ~14px, `#3d3d3d`, red `*` for required |
| Contact submit | navy `#193768`, white, radius ~6px, **no arrow tab** |

### Testimonial slide (Splide)
`div.bg-brand-primary-1.text-white.rounded-lg.p-12.py-14`
→ **#193768**, `padding: 56px 48px`, **radius 8px**, white quote text,
attribution line in **#8dc6e8**. Slide 521px wide inside a 553px track cell.

### Background pattern
```css
.bg-uptive-pattern {
  background-image: url(/…/img/uptive-pattern-lighter.png);
  background-position: bottom; background-repeat: no-repeat; background-size: contain;
}
.bg-gradient-accent-2 {
  background-image: url(/…/uptive-pattern-lighter.png),
                    linear-gradient(0deg, #3a8dde, rgba(58,141,222,0) 62%);
}
```
A very faint tiled hexagon/logo motif used behind the comparison section only.

---

## 6. RADIUS / SHADOW / BORDER INVENTORY

### Border radius (there are only four values)
| Value | Used on |
|---|---|
| **0** | all photos, gallery images, card images, hero |
| **5px** | HubSpot newsletter input |
| **6px** (`rounded-md`, `.375rem`) | bordered panels, section-nav corners, search field/button, flip-card inner, card-bottom |
| **8px** (`rounded-lg`, `.5rem`) | `.btn` + `.btn-arrow`, flip-card outer, comparison card, testimonial card |

### Shadows — almost none
| Where | Value |
|---|---|
| Header | **none** (relies on the 1px #f1f1f1 bottom border) |
| Cards | **none** |
| Desktop dropdown | `drop-shadow(0 4px 3px rgba(0,0,0,.07)) drop-shadow(0 2px 2px rgba(0,0,0,.06))` (a *filter*, not box-shadow) |
| Mobile offcanvas | `box-shadow: 1px 1px 10px 7px rgba(0,0,0,.3)` |

### Borders
| Where | Value |
|---|---|
| Header bottom | `1px solid #f1f1f1` |
| Gallery images | `1px solid #f0f0f0` |
| OUR PROCESS panel | `1px solid #a5d1ec` |
| Comparison card | `1px solid #e5e7eb` |
| Tables | `1px solid #3a8dde` |
| Section-nav rows | `1px solid #00498722`, 82% width, right-aligned |
| TOC items | `1px solid #a5bac9` top border |
| TOC sub-list | `2px solid #8dc6e8` left border |
| Search input | `1px solid #9ca3af` |

---

## 7. NAVBAR

### Desktop (≥1024px) — total height **178px**, two stacked rows
```
┌──────────────────────────────────────────────────────────────────┐
│ ANNOUNCEMENT BAR   #004987, 60px tall, full width                │
│   4 sub-brand logo links, flex, gap 30px, centered, p-2          │
│   each .banner-logo-item = 120×60, padding 10px, white logos     │
├──────────────────────────────────────────────────────────────────┤
│ MAIN BAR  #ffffff, 117px tall, border-bottom 1px #f1f1f1         │
│   wrapper: mx-auto max-w-[1275px], inner flex py-6 (24px)        │
│   [LOGO 275×69 @x83]   [NAV …]   [🔍]  [Get a Quote btn 163×46]  │
└──────────────────────────────────────────────────────────────────┘
```
```css
#site-header {
  position: sticky; top: 0; z-index: 99999;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f1f1;
}
#site-logo { height: 50px; width: auto; }   /* renders 275×69 with the wrapper */
```
- **Behavior on scroll: nothing changes.** No shrink, no color change, no shadow, no hide-on-scroll.
  The full 178px stack (announcement bar included) stays pinned. This is why anchors use
  `scroll-margin-top: 180px` and the sidebar sticks at `top: 190px`.
- Nav item spacing: links at x = 484, 600, 716, 883, 1004 → **~48px gaps**, `text-align:center`.
- Right cluster: `.items-center.gap-11` → **44px gap** between search icon and CTA.
- Nav links: Roboto **16px / 700 / #193768**, no underline, no uppercase.

### Dropdowns
```css
#nav .item-container.lv-1 { position: relative; }
#nav .item-container.lv-1::after { content:""; height:20px; bottom:-20px; width:100%; }  /* hover bridge */
#nav .sub-menu.lv-1 {
  position: absolute; display: none; flex-direction: column;
  background: #ffffff; padding: 1.5rem;    /* 24px */
  filter: drop-shadow(0 4px 3px rgba(0,0,0,.07)) drop-shadow(0 2px 2px rgba(0,0,0,.06));
}
#nav .item-container:hover .sub-menu.lv-1,
#nav .item-container.active .sub-menu.lv-1 {
  display: flex;
  animation: submenuAnimation .22s ease-in-out forwards;
  transform-origin: top center;
}
@keyframes submenuAnimation { 0%{opacity:0;transform:scaleY(0)} 80%{opacity:1} to{transform:scaleY(1)} }
#nav .sub-menu .nav-link { white-space: nowrap; }
#nav .nav-link.lv-3 { font-family: Raleway; font-size: 15px; font-weight: 400; color: #3d3d3d !important; }
#nav .dropdown-arrow { display: none; }   /* no caret icons on desktop */
```

### Search
A full-width white bar (`#search-form`, `padding:12px`, flex, gap 8px) that slides down from
`top:-100px` when the magnifier is clicked. Input 192×36 (radius 6px, 1px #9ca3af) +
`.btn-search` 82×34 (#5b7e96, radius 6px) + a close ✕ button at the far right.

### Mobile (<1024px) — header **107px**
- Announcement bar `display: none` (`hidden md:block`).
- Logo 200×50 at x=0; hamburger at x=348, **42×41px**.
- Hamburger `[data-nav-toggle]`: `display:flex; flex-direction:column; gap:8px; padding:.5rem`.
  Bars: `26px × 3px`, `border-radius: 10px`, **`background: #5c8097`**.
  Active state → bars turn `#000`, bar 3 `opacity:0`, bar 1 `rotate(45deg) translate(8px,7px)`,
  bar 2 `rotate(-45deg)`; the toggle goes `position:absolute; right:0`.
```css
.offcanvas {
  position: fixed; top: 0; left: 0; width: 100%; z-index: 999;
  background: #fff;
  box-shadow: 1px 1px 10px 7px rgba(0,0,0,.3);
  transform: translateX(130vw);
  transition: all .25s ease-out;
}
body.nav-active .offcanvas { transform: translateX(0); overflow: scroll; }
```
- Panel drops from the top, ~244px tall (grows as accordions open), **NOT** a full-screen overlay.
- L1 rows: bg `#ebebeb`, **Raleway 13px / 700 / UPPERCASE / #3d3d3d**, `padding: 8px 16px 8px 32px`,
  height 37px, with a chevron-down toggle on the left.
- L2 panel bg `#e0e0e0`; sub-menus animate open (`.sub-menu.active { display:flex; flex-direction:column }`).
- Below the list: a full-width **#193768** row with white "Upload Your Design File".
- `#nav-rfq-btn` on mobile: `padding: 10px 39px 10px 12px`, radius 8px, #193768.

---

## 8. FOOTER

Total height **782px** at 1440px. All on **white**, except the final bar.

```
┌─ NEWSLETTER BAND ───────────────────────────────────────────────────┐
│ .bg-brand-accent.py-8  →  #98cbeb, padding 32px 0, height 110px     │
│ [ "Stay Up to Date on the Latest News, Events, and More" ]  … right:│
│ [ email input 250×46 white r5 ] [ Subscribe #193768 120×46 r8 ]     │
└─────────────────────────────────────────────────────────────────────┘
┌─ MAIN FOOTER  .p-container.py-8.md:py-20  (80px top/bottom) ────────┐
│ md:grid grid-cols-2 (569px | 569px)                                 │
│                                                                     │
│ LEFT 569px:                          RIGHT 569px: nav#footer-nav    │
│   UPTIVE logo (~250×?)                 3 columns, ~171px each       │
│   then .columns-2.gap-8 (32px):          SOLUTIONS   MATERIALS   KNOWLEDGE BASE
│     General Inquiries                    Rapid Proto.  Metals      FAQ
│     hello@uptivemfg.com  (underlined)    Additive      Polymers    Case Studies
│     (888) 467-7686       (underlined)    CNC Machining Composites  Videos
│     ─ UPTIVE ADDITIVE MFG logo           Sheet Metal               Spec Sheets
│       2441 Commerce Drive                Injection Molding         Guides
│       Libertyville, IL 60048             Post Processing           Webinars
│     ─ GOPROTO logo                       Urethane Casting          Blog
│       2441 Commerce Drive
│       Libertyville, IL 60048           INDUSTRIES     ABOUT
│     ─ STANFORDVILLE logo                 Aerospace…     Quality Control
│       29 Victory Lane                    Automotive…    ITAR Registration
│       Poughkeepsie, NY 12603             Drones         Our Brands
│     ─ PHOENIX logo                       Electronics…   Contact
│       688 E Main Street                  Industrial…    Careers
│       Centreville, MI 49032              Medical
│                                                                     │
│                                        social row (bottom-right):   │
│                                        f  in  ▶  ☎  (navy icons)    │
└─────────────────────────────────────────────────────────────────────┘
┌─ BOTTOM BAR  .bg-brand-primary-1.py-5 → #193768, 61px ──────────────┐
│ © 2026 UPTIVE. All Rights Reserved.              Privacy Policy     │
│ Roboto 13px/700, ls .05em, color #8dc6e8, both sides justified      │
└─────────────────────────────────────────────────────────────────────┘
```
```css
#footer-nav a {                       /* column headers */
  color: #193768; display: block;
  font-family: Raleway; font-size: clamp(14px,2vw,18px); font-weight: 700;
  letter-spacing: .05em; text-transform: uppercase;
}
#footer-nav .sub-menu { padding-top: .5rem; }
#footer-nav .sub-menu a {
  color: #505050; font-family: Roboto; font-size: 14px; font-weight: 400;
  letter-spacing: 0; text-transform: none; padding-bottom: 4px;
}
#footer-nav .sub-menu a:hover { color: #193768; }
```
Address block: `.columns-2.gap-8.text-neutral-100.text-p-14` → **CSS multi-column**, 14px, #737373.

---

## 9. MOTION

```css
.on-view-ready.fade-in        { opacity:0; transition: all 1.3s }
.on-view-ready.fade-in.active { opacity:1 }
.on-view-ready.fade-in-left        { opacity:0; transform: translateX(-100px); transition: all .5s }
.on-view-ready.fade-in-left.active { opacity:1; transform: translateX(0) }
.on-view-ready.fade-in-right        { opacity:0; transform: translateX(100px); transition: all .5s }
.on-view-ready.fade-in-right.active { opacity:1; transform: translateX(0) }
```
Applied per-section via `data-on-view`; an `.active` class is added by IntersectionObserver.
Left column gets `fade-in-left`, right column `fade-in-right` → content slides in from both sides.

Other transitions: `main a:not(.btn) { transition: all .3s }`, `#hero-img { transition: opacity 1.3s ease }`
with `#hero-img.loading { opacity: 0 }` (hero photo fades in on load),
`.flip-card-inner { transition: transform .8s }`, `.section-nav-link { transition: color .3s, background-color .2s }`.

---

## 10. HOMEPAGE — SECTION-BY-SECTION BREAKDOWN

Document height **7988px** at 1440×900. Header 178px, hero 648px, footer 782px.
**Every section background is #ffffff** — there is not a single tinted band on the page
except the newsletter strip (#98cbeb) and the footer bottom bar (#193768).

---

### S0 · Announcement bar — y 0–60 · **60px** · `#004987`
Full-bleed deep blue strip. 4 sub-brand wordmark logos (GOPROTO, RE3DTECH, PHOENIX, STANFORDVILLE),
white, centered as a flex row with **gap 30px**, each item 120×60 with 10px padding.
Hidden below 1024px. *Distinctive: it makes the header read as a 2-tier corporate group header.*

### S1 · Header — y 60–178 · **117px** · `#ffffff`
See §7. Logo left, 5 nav links centered, search icon + navy "Get a Quote" button right.
1px `#f1f1f1` bottom border, sticky.

### S2 · HERO — y 178–826 · **648px** · black + photo
- `section#hero.relative.overlay.bg-black.text-white.py-20`, `min-height: 648px`, `overflow:hidden`,
  `display:flex; flex-direction:column; justify-content:center`.
- **Background:** `img#hero-img` absolute inset, `object-cover object-left`, z-10 — a photo of an
  engineer at dual monitors reviewing a 3D part.
- **Overlay:** `::after` `linear-gradient(90deg, rgba(0,0,0,.7), transparent 75%)`, z-15 — darkens
  the left 3/4 only, so the right side of the photo stays bright.
- **Content** (z-20), inside `.p-container` → `.hero-content { max-width: 578px }` at x=151:
  - H1 "Rapid, Reliable, Predictable Custom Manufacturing" — Raleway **44px/52.8px, w600, white**, 2 lines
  - `#hero-copy` (py-3): two lines, Roboto **24px/39px** white — "Custom Parts, Any Quantity." /
    "ISO 9001:2015 | AS9100D | ITAR"
  - `.hero-cta` flex gap 16px: **"Get A Quote"** (191×46) + **"Request Consultation"** (268×46),
    both navy with the light-blue arrow tab
- **Right rail** (`aside.hidden.lg:flex.absolute.right-0`, z-30): a **239px wide** anchor nav of
  6 rows × **55px**, background `#98cbeb`, Raleway 14px/700 `#193768`, rounded only top-left and
  bottom-left (6px) so it tabs into the right edge of the viewport. Items: Rapid Prototyping /
  Additive Manufacturing / CNC Machining / Sheet Metal Fabrication / Tooling & Molding /
  Post Processing & Finishing. Hairline dividers `#00498722` at 82% width.
- *Distinctive: the flush-right blue service rail + the left-only darkening gradient.*

### S3 · "Customer-Centric Service, Cutting-Edge Technology" — y 866–1459 · **593px** · white
`padding: 0 0 48px` (no top pad). `.images_section.p-container.md:grid.grid-cols-2.gap-14`
→ **two 541px columns, 56px gap**.
- **Left:** H2 42px/50.4px navy (pb-32px) → paragraph 16/26 → a 4-item `<ul>` with **light-blue disc
  bullets (#8dc6e8, 1.2em)**, 12px between items → **"Learn More"** `.btn`
- **Right:** a `.gallery-grid.img-4.home-grid` photo mosaic — **4 columns, rows `25% 1fr 1fr 1fr`,
  gap 5px**, 541×545. Child 1 spans col 1 / rows 1-3 (tall narrow left strip), child 2 spans
  cols 2-5 / row 1 (wide top banner), child 3 col 1 / rows 3-5, child 4 cols 2-5 / rows 2-5 (big hero tile).
  Every tile: `object-fit:cover`, `1px solid #f0f0f0`.
- *Distinctive: the asymmetric tight-gap collage is the site's photo signature.*

### S4 · "The UPTIVE Way" intro — y 1459–1731 · **272px** · white
`py-12`. Centered, single column. H2 42px navy centered (pb-32px), then
`.prose.mx-auto.max-w-md` — but `max-w-md` is overridden to **870px** — one paragraph,
Roboto 16/26, **`#505050`**, centered, ~134px side inset from the content column.

### S5 · "OUR PROCESS" 4-step panel — y 1731–2344 · **612px** · white
`py-12`. A bordered panel, `max-w-[1248px] mx-auto`, `padding: 32px`, **1px solid #a5d1ec,
radius 6px**.
- **Notch label:** H3 "OUR PROCESS" sits **on** the top border — Raleway 22px/600 UPPERCASE `#505050`,
  `width:224px`, `background:#ffffff`, `padding: 0 20px`, `position:relative; top:-44px`, centered.
- Intro paragraph, centered, 870px, `pb-32px`.
- **4 flip cards**, `md:grid-cols-4 gap-8` → **270×324px each, 32px gap**:
  - Light-blue gradient face (`linear-gradient(0deg, #ddf1fd, #8dc7e9)`), radius 6px inner / 8px outer
  - A navy **58×70px** number badge hanging from the top edge (radius `0 0 6px 6px`, Roboto 42px/700 white)
  - Uppercase centered body text in `#505050`
  - A navy **bottom bar** (`.card-bottom`, 97% wide, `padding: 12px 40px`, radius `0 0 6px 6px`,
    Raleway 18px/700 white, lh 1.25) with the action label
  - `:hover` → `rotateY(180deg)` over `.8s`
- *Distinctive: the notch-label bordered panel + numbered flip cards.*

### S6 · "Our Partnership Doesn't End There" + logo wall — y 2344–3474 · **1131px** · white
`py-12`. `.md:grid.grid-cols-40-60.gap-16` → **455px / 619px, 64px gap**.
- **Left (455px):** H2 42px navy 2 lines (pb-32) → paragraph → `.btn` "Lets Get to Work"
- **Right (619px):**
  - `<strong>` "TRUSTED BY THE BEST" — Roboto **22px/400 UPPERCASE**, `tracking-wider (1.1px)`,
    `#3d3d3d`, centered, `pb-32px`
  - Logo wall `grid grid-cols-2 md:grid-cols-3 gap-8` → 3 × ~185px cells, 32px gap, 769px tall:
    **amazon, BMW, stryker, intel, BOSE, Baxter, 3M, Steelcase, hp, Under Armour, Boeing** — original
    brand colors, centered, on white
  - Certification panel: **619×198px, background #e7e5e1** (warm light gray, `bg-[#E7E5E1]`),
    **`padding: 40px` (`p-10`), radius 0**, `mt-8`. Inside: `grid grid-cols-2 md:grid-cols-4
    items-center gap-8` (4 × 110.7px cells, 32px gap) holding ISO 9001:2015 / ITAR / AS9100 badges
    (`max-h-[60px] max-w-[100px]`, `mx-auto`), then a centered footnote
    `*Please note that each of our locations may only hold specific certifications.`
    in `.text-neutral-100` (#737373) with `pt-8` (32px).
- *Distinctive: the logo wall is deliberately left un-greyscaled — full brand color.*

### S7 · "What Drives Us to be Different" — y 3474–3955 · **481px** · white
`py-12`. The first of **four identical alternating feature rows**.
`.p-container > .md:grid.items-center.gap-16.grid-cols-40-60` (455 / 619, gap 64px).
- Image cell has `md:order-2` → **image right**, `.break-out-right` → grows to **806×385px**
  and runs off the right viewport edge (x 770 → 1576). `object-fit:cover`, radius 0.
- Text left at x=251 (indented from the container edge because the text cell is column 1 of a
  40/60 grid): H2 42px navy (pb-32) → prose paragraph → **`LEARN MORE ››`** `.more-link`
  (Roboto 16/700 UPPERCASE #193768 + light-blue double chevron).
- Animation: `fade-in-right` on both cells.

### S8 · "What We Do" — y 3955–4436 · **481px** · white
Identical, mirrored: `grid-cols-60-40` (619 / 455), image cell first with `.break-out-left`
→ **806×385 at x = -136**, bleeding off the **left** edge. Text right at x=934.

### S9 · "Why We Educate" — y 4436–4917 · **481px** · white
Same as S7 (image right, break-out-right, text left at x=251).

### S10 · "Why It Matters" — y 4917–5398 · **481px** · white
Same as S8 (image left, break-out-left, text right at x=934). **No CTA link** on this one —
paragraph only.

### S11 · "How We Define \"Disruptive\"" — y 5398–5765 · **366px** · white
`py-12`. Centered single column. H2 42px navy centered — with `<strong class="uptive">uptive</strong>`
**bolded to weight 700** inside the word "Disr*uptive*" (same size/color, just heavier).
Then `.prose.max-w-md` (→870px) with two centered paragraphs in `#505050`, 16/26.
- *Distinctive: the inline bold-weight wordplay on the brand name.*

### S12 · "THE UPTIVE WAY VS. THE OTHER WAY" comparison — y 5765–7095 · **1330px** · white + pattern
`padding: 48px 0 0`. Wrapped in `.bg-uptive-pattern` (faint tiled hexagon PNG,
`background-position:bottom; background-size:contain; no-repeat`) spanning the full 1440px width,
1282px tall.
- H3 label, Raleway 22px/600 UPPERCASE `#505050`, centered, `tracking-wide`, `pb-40px`
- Card: `border bg-white rounded-lg max-w-[1045px] mx-auto` → **1045×1176px**, white,
  1px #e5e7eb, radius 8px
  - Header row: `grid-cols-2 p-4 bg-brand-primary-1 text-white uppercase text-r-22 font-semibold`
    → **navy #193768, 68px tall, radius 8px 8px 0 0**, "UPTIVE" | "COMPETITORS", `mb-8`
  - Body: `grid grid-cols-2 gap-8 text-r-18 font-medium text-center`, 948px tall, 5 rows each side.
    Left rows: a **blue circular ⊕ icon** then navy-ish centered text.
    Right rows: a **gray circular ⊖ icon** then gray centered text.
  - A **1px × 939px vertical divider in `#a5d1ec`** absolutely centered (`.abs-h-center`)
  - Footer of the card: `text-center py-10` (40px) with the **"Experience The Difference"** `.btn`
- *Distinctive: the pattern background is the only non-flat surface on the page.*

### S13 · Newsletter band — y 7095–7205 · **110px** · **#98cbeb**
`.bg-brand-accent.py-8` full-bleed light blue. Inside the container, a flex row:
- Inner row: `flex flex-wrap justify-between items-center text-center md:text-left`, 1138px wide
- Left: `<strong class="block font-display text-r-22 text-brand-primary-1">` "Stay Up to Date on the
  Latest News, Events, and More" — **Raleway 22px / 35.75px, w700, `#193768`**, 560px wide
- Right: HubSpot form — email input **250×46, white, radius 5px, no border** + **"Subscribe"**
  button (#193768, white, Raleway 16/700, `padding: 10px 20px`, radius 8px, 120×46)
- *Distinctive: the only saturated color band on the whole page.*

### S14 · Footer — y 7205–7926 · **721px** · white → see §8

### S15 · Bottom bar — y 7926–7988 · **61px** · **#193768**
`py-5`, flex justify-between inside `.p-container`. Roboto 13px/700, `letter-spacing .05em`,
color **#8dc6e8**. Left: `© 2026 UPTIVE. All Rights Reserved.` Right: `Privacy Policy`.

---

## 11. SUBPAGE TEMPLATE A — Solution detail (`/solutions/cnc-machining`)

Document height 7897px. **This is the template to copy for service/capability pages.**

### Hero — **502px** (`lg:min-h-[425px]`, `py-20`)
Same construction as the homepage hero but **without** the right rail and with an added eyebrow.
`.hero-content { max-width: 540px }` (narrower than home's 578px):
1. `.eyebrow.uppercase.text-r-16.tracking-wider.text-brand-primary-2` — Roboto **16px/26px, w400,
   UPPERCASE, ls 0.8px, `#8dc6e8`** → "CNC MACHINING"
2. `h1#hero-headline.text-r-44` — Raleway **44px/52.8px, w600, white**, 3 lines
3. `#hero-copy.py-3` — Roboto **18px/29.25px** white
4. `.hero-cta` — single "Get A Quote" `.btn` (191×46)

Full-bleed cover photo + the same 90° black→transparent-at-75% gradient.

### Body — one `.p-container` (1170px), single `<div>`, no `<main>` sections
1. **Breadcrumbs** — `padding: 12px 0 40px`, Raleway 14px, ls .025em.
   First crumb `#505050` w400, separator `/` in Roboto with 4px side padding, current crumb `#193768` w700.
2. **`md:grid grid-cols-[25%_1fr] gap-6`** → **284.5px sidebar / 829.5px content, 24px gap**
   - `aside.hidden.md:block.md:order-1` — the sticky anchor nav (`.section-nav.anchor-l`),
     **328px wide**, pushed **-43px (−3vw)** left of the container so it hangs into the margin.
     Rows: `#98cbeb` bg, Raleway 14/700 `#193768`, `padding 16px 20px 16px 28px`, `>` chevron,
     hairline dividers. **Active row inverts to `#193768` bg + white text** and the chevron
     shifts 3px right. `position: sticky; top: 190px`.
   - `div.md:order-2` — content column of stacked `<section>`s, each **`py-12` (48px)**:
     - `.page-cards` sections (intro / service cards / related posts)
     - 2-column text blocks
     - Full-width inline images (radius 0, `bg-neutral-50` placeholder)
     - Uppercase Raleway 22px/600 sub-headings
     - Data table: `1px #3a8dde` borders, **navy header row**, 14px centered cells, `overflow-x:auto`
     - H2 `.headline` 42px navy for major sections
     - A "See All Posts" `.btn`
     - **Gallery** — `.gallery-grid` mosaic, 5px gaps, 1px `#f0f0f0` borders, GLightbox-enabled
3. Newsletter band + footer (identical to homepage).

---

## 12. SUBPAGE TEMPLATE B — Index page (`/solutions`, `/industries-served`)

Document height 4999px (solutions).

### Hero — **555px**, same as Template A (eyebrow + H1 + copy + one CTA).

### Body
1. `section.page-cards` (`padding: 0 0 48px`):
   - `.text-center`: H2 `.headline` 42px navy centered (pb-32) + centered `.prose` intro
   - **Card grid** `grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-20 py-4`
     → **3 × 363px, column gap 24px, ROW GAP 80px**. Each `.card` is 363×488, `flex-col`:
     | 1 | `h3.card-title` Raleway **22px/600 UPPERCASE #3d3d3d**, `pb-12px` |
     | 2 | `<a><img></a>` **363×250 (≈1.45:1), radius 0**, cover, `bg #eaeaea` |
     | 3 | `.card-copy` `py-3`, Roboto 16/26 `#3d3d3d` |
     | 4 | `a.btn.self-start.mt-auto` "Learn More" (186×46) — pinned to bottom so all CTAs align |
2. `section py-12` — centered `max-w-sm` (→615px) block:
   H3 "NOT SURE WHAT YOU'RE LOOKING FOR?" Raleway 22/600 UPPERCASE `#505050` (pb-16) + prose.
3. `section py-12` — H2 "Why Customers Choose UPTIVE" centered, then a **Splide carousel** of
   testimonial cards: `bg-brand-primary-1 rounded-lg p-12 py-14` → **#193768, padding 56px 48px,
   radius 8px**, white quote, attribution in **#8dc6e8**.
4. Newsletter band + footer.

---

## 13. SUBPAGE TEMPLATE C — Contact (`/contact`)

**No hero image at all.** Content starts immediately under the 178px header on white.
Two-column split inside the container:
- **Left:** H2 `.headline` "Let's Start Your Project" 42px navy, paragraphs, then a `.prose ul`
  with **light-blue disc bullets**, each item `<strong>Label</strong> – description` (label in
  bold navy-ish, rest in body gray).
- **Right:** the form panel — 1px light-blue border, rounded, white. Stacked fields, each with a
  small label above (`Email*` with a red asterisk), inputs full-width ~46px tall with a very light
  gray fill and a light 1px border, small radius. Country = `<select>`. Message = `<textarea>`.
  **"Submit"** button centered at the bottom: navy `#193768`, white, small radius, **no arrow tab**.
- Then newsletter band + footer.

---

## 14. QUICK-START TOKENS (Tailwind config for the rebuild)

```js
theme: {
  screens: { sm:'640px', md:'1024px', lg:'1170px', xl:'1280px', '2xl':'1366px' },
  extend: {
    colors: {
      'brand-primary-1': '#193768',   // navy — the brand
      'brand-primary-2': '#8dc6e8',   // sky — eyebrows, footer bar text, bullets
      'brand-primary-3': '#5b7e96',   // steel — secondary buttons
      'brand-accent':    '#98cbeb',   // light blue — arrow tabs, rails, newsletter band
      'brand-accent-2':  '#3a8dde',   // bright blue — table borders
      'brand-secondary': '#a5bac9',
      'brand-secondary-2':'#a5d1ec',  // panel outlines, dividers
      'brand-black':     '#3d3d3d',   // body text
      'brand-copy':      '#505050',   // muted text
      'announce':        '#004987',   // top bar
      'panel':           '#e7e5e1',   // warm gray certification panel
      'imgph':           '#eaeaea',   // image placeholder (neutral-50)
      'hairline':        '#f1f1f1',   // header bottom border
      'imgborder':       '#f0f0f0',   // 1px border on gallery images
    },
    fontFamily: {
      display: ['Raleway','Helvetica','sans-serif'],
      sans:    ['Roboto','Helvetica','sans-serif'],
    },
    maxWidth: { container: '1170px', header: '1275px', panel: '1248px', card: '1045px' },
    borderRadius: { md: '6px', lg: '8px' },
  }
}
```

```css
/* the five rules that carry the whole look */
.p-container { max-width:1170px; margin:auto; padding-inline:1rem; }
section      { padding-block: 48px; }
.headline    { font-family:Raleway; font-size:clamp(30px,5vw,42px); font-weight:500;
               line-height:1.2; letter-spacing:.025em; color:#193768; padding-bottom:2rem; }
body         { font-family:Roboto; font-size:16px; line-height:26px; color:#3d3d3d; }
.btn         { background:#193768; color:#fff; border-radius:8px; font-family:Raleway;
               font-weight:700; letter-spacing:.025em; padding:10px 65px 10px 30px; position:relative; }
.btn-arrow   { position:absolute; right:-1px; top:0; height:100%; width:42px;
               background:#98cbeb; border-radius:0 8px 8px 0; display:flex;
               justify-content:center; padding:4px 12px; }
```

---

## 15. SCREENSHOT INDEX

All in `_analysis/shots/uptive/` — 74 files.
Desktop segments are 1440×900 viewport shots taken in 850px scroll steps (`-01`, `-02`, …).
Full-page shots are 1440-wide `fullPage:true`. Mobile is 390×844 @2x.

| Page | URL | Full | Segments | Mobile |
|---|---|---|---|---|
| Home | `/` | `uptive-home-full.png` | `uptive-home-01…10.png` | `uptive-home-mobile-full.png`, `-mobile-top.png`, **`uptive-home-mobile-menu.png`** |
| CNC Machining (detail) | `/solutions/cnc-machining` | `uptive-cnc-full.png` | `uptive-cnc-01…10.png` | `uptive-cnc-mobile-full.png`, `-mobile-top.png` |
| Solutions (index) | `/solutions` | `uptive-solutions-full.png` | `uptive-solutions-01…05.png` | `uptive-solutions-mobile-full.png`, `-mobile-top.png` |
| About | `/about-uptive-manufacturing` | `uptive-about-full.png` | `uptive-about-01…06.png` | `uptive-about-mobile-full.png`, `-mobile-top.png` |
| Industries (index) | `/industries-served` | `uptive-industries-full.png` | `uptive-industries-01…05.png` | `uptive-industries-mobile-full.png`, `-mobile-top.png` |
| Aerospace (industry detail) | `/industries-served/aerospace-manufacturing` | `uptive-aerospace-full.png` | `uptive-aerospace-01…06.png` | `uptive-aerospace-mobile-full.png`, `-mobile-top.png` |
| Materials | `/materials` | `uptive-materials-full.png` | `uptive-materials-01…04.png` | `uptive-materials-mobile-full.png`, `-mobile-top.png` |
| Contact | `/contact` | `uptive-contact-full.png` | `uptive-contact-01…03.png` | `uptive-contact-mobile-full.png`, `-mobile-top.png` |

### Supporting data files (`_analysis/`)
| File | Contents |
|---|---|
| `site.css` | the complete compiled theme stylesheet (63 KB) |
| `map.json` | all discovered URLs + stylesheet list |
| `sitemap.xml` | site's own sitemap |
| `structure-home.txt` | annotated DOM tree of the homepage w/ box, color, font per node |
| `structure-cnc.txt` | same for the CNC detail page |
| `structure-solutions.txt` | same for the Solutions index |
| `measure-home.json` | computed-style probes for every typographic role |
| `measure2.json` | component-level probes (buttons, cards, bands, nav) |
| `measure-mobile.json` | mobile header/menu/hero measurements |
