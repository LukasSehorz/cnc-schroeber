# Struktur- und Layoutanalyse: wendt-maschinenbau.de/ueber-uns/

Aufgenommen am 19.08.2026, Chromium headless, Viewport 1440x900 (Desktop) und 390x844 (Mobil).
Cookie-Banner ("Alle akzeptieren") wurde vor allen Aufnahmen weggeklickt.
Gesamthöhe Desktop: **4375 px**. Gesamthöhe Mobil: **5525 px**.

---

## 0. Wichtiger Vorbefund: Es gibt keinen Zeitstrahl

Die Seite enthält **keinen Zeitstrahl / keine Zeitleiste / keine Meilenstein-Sektion**. Belege:

- Suche im gesamten DOM nach `timeline|zeitstrahl|zeitleiste|historie|meilenstein|milestone|chrono|slider|swiper|splide|carousel` in Klassen und IDs: **0 Treffer**.
- Suche nach Textknoten, die nur aus einer Jahreszahl bestehen (`^(19|20)\d{2}$`): **0 Treffer**. Die einzige Jahreszahl auf der Seite ist "Seit 1991", eingebettet als `<strong>` im Fließtext.
- Alle 30 Seiten der Sitemap wurden abgerufen und auf Zeitstrahl-Muster geprüft. Kein einziges TYPO3-Element vom Typ Zeitstrahl existiert auf der ganzen Domain. Die vorhandenen Inhaltstypen sind: `t4m_textteaser`, `t4m_textpic50`, `t4m_imageteaser`, `t4m_image`, `t4m_headlinebox`, `t4m_mediaslider`, `t4m_pages`, `t4m_subtextpic`, `t4mblog_main`, `t4mjobs_jobs`, `form_formframework`, `uploads`, `text`, `image`, `textpic`, `menu_subpages`, `t4msocials_socials`.
- Es gibt auch keine Unterseite "Historie" oder "Geschichte". Die Unterseiten von "Über uns" sind nur: `/unsere-werte/`, `/engagement/`, `/downloads/`.

**Was an der Stelle steht, wo ein Zeitstrahl vermutet wurde:** Sektion 3 ("Wie alles bei uns begann", `#item-206`). Das ist ein Zweispalter mit Bild links und Textblock rechts. Die "Geschichte" wird dort als ein einziger Fließtextabsatz erzählt, nicht als Stationen. Diese Sektion ist als `wendt-timeline-1.png` (Desktop) und `wendt-timeline-2-mobil.png` (Mobil) freigestellt aufgenommen. Details in Abschnitt 3.

---

## 1. Technischer Unterbau

| Merkmal | Wert |
|---|---|
| CMS | TYPO3, Agentur-Theme `t4m_*` (t4m_base, t4m_theme, t4m_maps) |
| JS-Bibliotheken | **nur jQuery 3.2.1** |
| Kein GSAP, kein ScrollTrigger, kein AOS, kein Swiper, kein Lenis, kein Framer Motion, kein Locomotive, kein ScrollReveal, kein Splide, kein WOW, kein Lottie | geprüft, alle negativ |
| Schrift | **Rajdhani**, self-hosted, Schnitte 300 / 400 / 500 / 600 / 700 |
| Root-Schriftgröße | `html { font-size: 10px }` -> 1rem = 10px |
| Drittanbieter | Google Tag Manager, gtag, leadinfo, Leaflet (auf dieser Seite ungenutzt) |

### Farbpalette (exakt gemessen)

| Rolle | Hex | RGB |
|---|---|---|
| Primärgrün dunkel | `#0F8246` | rgb(15, 130, 70) |
| Akzentgrün hell | `#46D23C` | rgb(70, 210, 60) |
| Flächengrau (blaustichig) | `#EDF1F3` | rgb(237, 241, 243) |
| Fließtext-Grau | `#343434` | rgb(52, 52, 52) |
| Weiß | `#FFFFFF` | rgb(255, 255, 255) |
| Grau für Menü-Kacheln | `#575757` | rgb(87, 87, 87) |

### Die zwei Design-Tokens, aus denen alles abgeleitet ist

```css
:root {
  --referenceValue: 2rem;    /*  20px  — unter 768px  */
  --referenceLine:  10px;    /*  konstant, alle Breakpoints */
}
@media (min-width: 768px)  { :root { --referenceValue: 3.5rem; } }  /* 35px */
@media (min-width: 1124px) { :root { --referenceValue: 5rem;   } }  /* 50px */
```

`--referenceValue` (im Folgenden **RV**) ist gleichzeitig Spaltenabstand, Innenabstand, Abstandsraster und Bausteingröße. `--referenceLine` (**RL** = 10px) ist die Strichstärke jeder grünen Linie auf der Seite. Das ganze Layout ist auf diese zwei Werte gebaut.

**Breakpoints:** `s` = unter 768px, `m` = ab 768px, `l` = ab 1124px. Zusätzlich gibt es einen Zusatzbreakpoint ab 1600px (nur für die Bannerhöhe).

---

## 2. Raster und Abstände (alles gemessen)

### Container

```css
.page-wrapper { width: 100%; max-width: 100svw; margin: 0 auto; display: flex; flex-flow: column; }
```

**Es gibt keine feste Container-Maximalbreite und keinen seitlichen Innenabstand.** Der Inhalt läuft bis an beide Viewportkanten. Bei 1440px Viewport ist die Inhaltsbreite 1440px, bei 1920px sind es 1920px. Die optisch sichtbaren "Ränder" entstehen ausschließlich durch Innenabstände einzelner Sektionen (siehe `.frame-indented-*` und `.inner`-Padding weiter unten).

### Das 12-Spalten-Raster

```css
.grid, .row {
  display: grid;
  grid-template-columns: repeat(12, calc(8.333% - var(--referenceValue)));
  column-gap: var(--referenceValue);
  margin: 0 calc(var(--referenceValue) / -2);
  justify-content: center;
  align-items: center;      /* !! zentriert vertikal, kein stretch */
}
.grid > * { grid-column-end: span 12; align-content: start; }
```

Gemessene Werte:

| Viewport | Grid-Boxbreite | Spaltenbreite | Spaltenabstand | Inhaltsband |
|---|---|---|---|---|
| 1920 | 1970 px (x = -25) | 114,16 px | 50 px | 1920 px ab x=0 |
| 1440 | 1490 px (x = -25) | 74,16 px | 50 px | 1440 px ab x=0 |
| 1200 | 1250 px (x = -25) | 54,16 px | 50 px | 1200 px ab x=0 |
| 1024 | 1059 px (x = -17) | 53,23 px | 35 px | 1024 px ab x=0 |
| 768  | -                 | -         | 35 px | 768 px  ab x=0 |
| 390  | 410 px (x = -10)  | 14,16 px  | 20 px | 390 px  ab x=0 |

Der negative Außenabstand von `RV/-2` schiebt die Rasterbox über die Kante hinaus, `justify-content: center` schiebt den Spalteninhalt wieder auf x=0 zurück. Nettoeffekt: bündig, halbe Gutter außen entfallen.

> **Achtung, Fehler im Original:** Bei 1440px Viewport ist `document.body.scrollWidth` = **1465px**, also 25px horizontaler Überlauf nach rechts. Das ist ein Bug der negativen Außenabstände. Beim Nachbau `overflow-x: clip` auf den Wrapper setzen oder das Raster mit `padding` statt negativem `margin` bauen.

### Spaltenklassen

| Klasse | Spannweite | ab Breakpoint |
|---|---|---|
| `col-s-100` / Standard | span 12 | immer |
| `col-m-50` | span 6 | ab 768 |
| `col-l-33` | span 4 | ab 1124 |
| `col-l-50` | span 6 | ab 1124 |
| `col-full-width` | span 12 | immer |

Weitere existierende Klassen: `-75` = span 9, `-66` = span 8, `-25` = span 3, `-16` = span 2, `-hidden` = display none.

### Vertikaler Grundabstand zwischen Sektionen

Jede Sektion trägt Abstandsklassen, die als `margin-top` / `margin-bottom` aufgelöst werden:

| Klasse | Formel | Desktop (>=1124) | Tablet (>=768) | Mobil |
|---|---|---|---|---|
| `frame-space-*-extra-small` | RV / 2 | 25 px | 17,5 px | 10 px |
| `frame-space-*-small` | RV | **50 px** | 35 px | 20 px |
| `frame-space-*-medium` | RV × 2 | **100 px** | 70 px | 40 px |
| `frame-space-*-large` | RV × 3 | **150 px** | 105 px | 60 px |
| `frame-space-*-extra-large` | RV × 4 | **200 px** | 140 px | 80 px |

Der vertikale Grundtakt ist also **50 px auf Desktop, 20 px auf Mobil**. Alle Abstände sind ganzzahlige Vielfache davon.

### Seitliche Einrückung einzelner Sektionen

```css
.frame-indented-left  { padding-left:  288px; }   /* = 20vw bei 1440 */
.frame-indented-right { padding-right: 288px; }
.frame .inner         { padding: var(--referenceValue); }   /* 50px */
```

288px = 20% der Viewportbreite. Die Einrückung ist also viewportabhängig, nicht rasterabhängig.

---

## 3. Sektionsreihenfolge (oben nach unten, Desktop 1440x900)

Die Seite hat **6 Sektionen** plus einen fixierten Seitenkopf und einen Trennerbalken.

---

### Kopfleiste (fixiert, überlagert alles) — `header.page-header`

| Merkmal | Wert |
|---|---|
| Position | `position: fixed; top: 0; z-index: 10; transition: all .3s` |
| Höhe | **100 px** (`10rem`), Mobil 70 px (`7rem`) |
| Hintergrund | transparent — die weißen Flächen sind Einzelbausteine |
| Logo-Platte | `#logo`, weiß, **240 px breit** (16,666vw), volle Kopfhöhe, plus `::after`: weiße Fläche 240 × 25 px, die 25 px unter den Kopf hinausragt |
| Navigation | `#mainNavigation`, absolut, `right: 50px`, Höhe 50 px, **`border-right: 10px solid #46D23C`** |
| Navigationsleiste | `ul.level_1`, weiß, `box-shadow: -4px 4px 30px rgba(0,0,0,.15)`, Breite 857 px ab x=513 |
| Navigationslinks | 18 px / 700 / line-height 50 px / `#0F8246`, `padding: 0 20px` |
| Aktiver Punkt | Farbe `#46D23C` |
| Letzter Punkt "KONTAKT" | Hintergrund `#0F8246`, Schrift `#46D23C`, `text-transform: uppercase`, `letter-spacing: 1.8px` |
| Sprachwahl | `#languageSelect`, 40 × 50 px, `right: 0`, Hintergrund `#46D23C`, Text 16 px / 700 / weiß / uppercase |
| Social-Leiste rechts | absolut, rechte Kante, 4 Zeilen à 50 px Höhe / 60 px Breite; jede Zeile hat **`border-left: 10px solid #46D23C`** — das ergibt den senkrechten grünen Balken am rechten Rand. Icons: weiße Kreise Ø 32,5 px (0,65 RV), `box-shadow: -0.4rem 0.4rem 1.4rem rgba(0,0,0,.15)` |
| Zustandswechsel | beim Scrollen bekommt `header` die Klasse `.scrolled`. **Zu dieser Klasse existiert keine CSS-Regel** — visuell passiert nichts. |

Mobil: Hamburger-Öffner `a.opener` (weiß, 35 × 35 px, drei Balken je 0,5rem, mittlerer 66 % breit), Navigation als Vollbild-Overlay.

---

### Sektion 1 — Seitenkopf mit Bild (Banner) — `figure.image.cover.banner`

| Merkmal | Wert |
|---|---|
| Typ | Vollbreiter Bildkopf mit versetzter Bildunterschrift-Platte |
| Position | y 0 – 360 |
| **Höhe** | **360 px** |
| Seitenverhältnis | `::before { padding-top: 25% }` ab 1124px -> 4:1. Ab 768px: 45 %. Mobil: 66,666 % |
| Hintergrund | keiner (Seitenhintergrund weiß) — **hell** |
| Innenabstände | keine (`padding: 0`) |
| Bild | `margin-left: 16.666dvw` (240 px), `width: 83.333dvw` (1200 px), `object-fit: cover`, `position: absolute`, `height: 100%`. **Das Bild bricht rechts über die Containerkante hinaus** und lässt links exakt die Logo-Platte frei. |
| Beschriftungsplatte | `figcaption`, absolut, `left: 0; bottom: 0`, **Breite 480 px** (33,33svw), Höhe 50 px, `padding: 0 50px`, Hintergrund `#EDF1F3`, **`mix-blend-mode: multiply`**, `display: flex; flex-flow: column; justify-content: end` |
| Grüne Linie | `figcaption::before`: 480 × **10 px**, `background: #0F8246`, `top: -60px` (= −RV − RL). Liegt also 60 px über der Platte, y ≈ 250, und läuft über die volle Plattenbreite |
| Textrolle | **Kicker/Breadcrumb** `h1`: **20 px / Gewicht 100 (rendert als 300) / line-height 20 px (100 %) / letter-spacing normal / `#0F8246`** |

Mobil: Höhe 260 px, Bild `margin-left: 20px`, Platte 370 px breit mit `padding: 80px 20px 0`, ragt 80 px unter das Bild, `h1` 18 px.

---

### Sektion 2 — Intro-Zweispalter (Überschrift links, Fließtext rechts) — `#item-66`

TYPO3-Typ `t4m_textteaser`, `col-full-width` (span 12).

| Merkmal | Wert |
|---|---|
| Typ | Zweispalter, Überschrift links / Fließtext rechts, hinterlegte Farbfläche links |
| Position | y 360 – 826 |
| **Höhe** | **466 px** |
| Außenabstände | keine (`margin: 0`) |
| **Innenabstände** | `.inner`: **padding-top 200 px (4 RV), padding-bottom 50 px (1 RV), links/rechts je 287,97 px (20 vw)** |
| Layout | `.inner` ist `display: flex; justify-content: space-between; gap: 50px` |
| Spalten | 2 Spalten à **407 px**, links ab x=288, rechts ab x=745. Verhältnis **1:1**, Zwischenraum 50 px |
| Hintergrund | Sektion transparent (weiß). Dahinter `.inner::before`: absolut, `left: 0; top: 0`, **480 × 466 px**, `background: #EDF1F3`, `z-index: -1`. **Helle Sektion.** Die graue Fläche bricht links über die Textspalte hinaus bis zur Viewportkante. |
| Bilder brechen aus? | keine Bilder in dieser Sektion |

Textrollen:

| Rolle | font-size | weight | line-height | letter-spacing | color |
|---|---|---|---|---|---|
| Überschrift `h1` | **38 px** | 600 | 47,5 px (125 %) | normal | `#0F8246` |
| Fließtext `p` | **16 px** | 400 | 21,6 px (135 %) | normal | `#343434` |

Beide mit `max-width: 500px`, `h1` hat `margin-bottom: 30px`. Es gibt optional einen Kicker (`.subline`, 16 px / 400 / 100 % / `#46D23C`, `margin-bottom: 50px`) — auf dieser Seite leer und daher `display: none`.

Mobil: gestapelt, Frame 390 × 450 px, y 340 – 790.

---

### Sektion 3 — Story-Zweispalter, Bild links / Text rechts — `#item-206`

**Das ist die Sektion an der Stelle, an der ein Zeitstrahl erwartet wurde. Sie ist keiner.**
TYPO3-Typ `t4m_textpic50`, Zusatzklassen `image-left`, `col-full-width` (span 12).
Screenshots: `wendt-timeline-1.png` (Desktop), `wendt-timeline-2-mobil.png` (Mobil).

| Merkmal | Wert |
|---|---|
| Typ | Zweispalter, Bild links / Textplatte rechts, mit senkrechter grüner Trennlinie |
| Position | y 976 – 1692 |
| **Höhe** | **716 px** |
| Außenabstände | `margin-top: 150 px` (`frame-space-before-large`), `margin-bottom: 50 px` (`frame-space-after-small`) |
| Innenabstände | `.inner`: `padding: 50px 0` |
| Hintergrund | Sektion transparent (weiß) — **hell**. Die Textseite trägt eine eigene Fläche `#EDF1F3`. |
| Spaltenverhältnis | **50 : 50**, Bildseite 725 px, Textseite 715 px. Beide sind Prozentwerte von 1440, keine Rasterspalten. |

**Bildseite** (`figure.image.left`):
- `position: absolute; left: 0; top: 0`, Größe **725 × 616 px**
- **`border-right: 10px solid #0F8246`** — das ist die senkrechte dunkelgrüne Linie bei x ≈ 715–725
- Das `img` darin: `width: calc(100% - 50px)` = **665 px**, `right: 50px`, `object-fit: cover`, absolut. Zwischen Bildkante (x=665) und grüner Linie (x=715) liegen also **50 px Luft**.
- `figure.image.left::after`: `#EDF1F3`, `left: 50px; bottom: 0`, Breite `calc(100% + 50px)` = 240 px sichtbar, Höhe **100 px** (2 RV), **`mix-blend-mode: multiply`**, `z-index: 2` — das graue Band, das unten über das Bild läuft.

**Textseite** (`.bodytext`):
- `margin-left: 725px`, Breite **715 px**, `background: #EDF1F3`, `z-index: 2`
- **`padding: 100px 288px 100px 50px`** (2 RV oben/unten, 20 vw rechts, 1 RV links)
- `display: flex; flex-flow: column; justify-content: center`
- **Vertikal um +50 px gegen das Bild versetzt** (Textplatte y 1026–1642, Bild y 976–1592). Das ist der Kniff, der die Sektion versetzt wirken lässt.
- Textspaltenbreite netto: **377 px**

| Textrolle | font-size | weight | line-height | letter-spacing | color |
|---|---|---|---|---|---|
| Überschrift `h3` | **34 px** | 600 | 42,5 px (125 %) | normal | `#343434` |
| Fließtext `p` | **16 px** | 400 | 21,6 px (135 %) | normal | `#343434` |
| Hervorhebung `strong` | 16 px | 700 | 21,6 px | normal | `#343434` |

`h3` hat `margin-bottom: 30px`, Absätze `margin-bottom: 20px` (RV/2,5), `max-width: 600px`.

**Mobil (390):** Gestapelt. Bild oben, **350 px breit ab x=20**, Höhe 225 px, `border-right: 4px` grün (statt 10 px). Bild selbst 326 px, rechts 20 px Luft. Darunter die graue Textplatte, **350 px breit ab x=40** (also um 40 px nach rechts versetzt, sie überlappt die Bildunterkante nicht), `padding: 40px 20px`, `h3` **22 px / 600 / 27,5 px**, Absatzabstand 8 px. Frame-Höhe 779 px, Außenabstände 60 px oben / 20 px unten.

---

### Sektion 4 — Dreier-Kartenraster (Bild-Teaser) — `#item-72`, `#item-73`, `#item-74`

TYPO3-Typ `t4m_imageteaser`, je `col-l-33` (span 4) / `col-m-50` / `col-s-100`.

| Merkmal | Wert |
|---|---|
| Typ | Kartenraster mit vollflächigem Bild und aufliegender grüner Multiply-Platte |
| Position | y 1792 – 2591 (Karte 3: 1803 – 2580) |
| **Höhe** | **799 px** pro Karte. Achtung: die Höhe hängt von der Viewporthöhe ab, siehe unten. |
| Außenabstände | `margin-top: 50 px` (`frame-space-before-small`), unten 0 |
| Spalten | **3 Spalten à 447 px**, x = 0 / 497 / 993. **Spaltenabstand 50 px.** Verhältnis 1:1:1 |
| Hintergrund der Sektion | keiner, weiß — **hell**; die Karten selbst sind **dunkel** (grüne Multiply-Fläche über Foto) |
| Vertikale Ausrichtung | `align-items: center` des Rasters -> die kürzere dritte Karte wird vertikal zentriert (deshalb y 1803 statt 1792) |

**Aufbau einer Karte:**

```css
.frame-type-t4m_imageteaser .inner        { position: relative; padding: 0; overflow: hidden; }
.frame-type-t4m_imageteaser .inner .image { position: absolute; inset: 0 auto 0 0; width: 100%; }
.frame-type-t4m_imageteaser .inner .image img { width: calc(100% - var(--referenceValue)); }
.frame-type-t4m_imageteaser .inner::before {
  content: ""; position: absolute;
  top: 40dvh;                 /* Mobil: 30dvh */
  bottom: var(--referenceValue);
  left:   var(--referenceValue);
  width: 100%;
  background: #0F8246;
  mix-blend-mode: multiply;   /* !! */
  z-index: 2;
}
.frame-type-t4m_imageteaser .inner .bodytext {
  position: relative; z-index: 3;
  margin: 40dvh 0 var(--referenceValue) var(--referenceValue);
  padding: var(--referenceValue);
}
.frame-type-t4m_imageteaser .inner .bodytext::before {
  content: ""; position: absolute; left: 0;
  top: calc((var(--referenceValue) + var(--referenceLine)) * -1);   /* -60px */
  width: 100%; height: var(--referenceLine);                        /*  10px */
  background: #46D23C;
}
```

Gemessen bei 1440x900:
- Bild: 397 px breit (= 447 − 50), links bündig -> **rechts bleiben 50 px Karte ohne Bild**
- Grüne Multiply-Platte: y-Versatz **360 px** von oben, unten 50 px Abstand, links 50 px eingerückt, Breite 447 px -> **sie bricht 50 px über die rechte Kartenkante hinaus** und wird von `overflow: hidden` beschnitten
- Textblock: 397 px breit, x=50, `margin-top: 360px`, `padding: 50px`, Höhe 389 px
- Grüner Strich `bodytext::before`: **397 × 10 px, `#46D23C`, 60 px über dem Textblock** (bei y ≈ 2092)

> **Bauwarnung:** `40dvh` bezieht sich auf die **Viewporthöhe**, nicht auf die Kartenhöhe. Gemessen: 700px Viewport -> 280 px Versatz, Karte 719 px; 900px -> 360 px, Karte 799 px; 1200px -> 480 px, Karte 919 px. Die Karten wachsen also mit dem Browserfenster. Für einen Nachbau besser durch ein festes Seitenverhältnis oder `aspect-ratio` ersetzen.

| Textrolle | font-size | weight | line-height | letter-spacing | color |
|---|---|---|---|---|---|
| Kartenüberschrift `h3 > a` | **30 px** | 600 | 37,5 px (125 %) | normal | `#FFFFFF` |
| Fließtext `p` | **16 px** | 400 | 21,6 px (135 %) | normal | `#FFFFFF` |
| Schaltfläche `.btn span` | **16 px** | 500 | 16 px (100 %) | normal | **`#46D23C`** |

Kopfbereich `header { margin-bottom: 25px }` (RV/2), Schaltfläche `margin-top: 50px`.

**Schaltfläche im Detail** (`.btn`, Variante ohne Kasten):
- `background: none; box-shadow: none; padding-left: 0; line-height: 100%; height: auto`
- Pfeil-Icon: `span.icon`, 34 px breit, `height: 1em`, SVG absolut zentriert
- Hover: `padding-left: 1rem`, Farbe wechselt auf `#FFFFFF`, **SVG dreht sich um 45°**, `transition: .3s` bzw. `transform .3s`

**Mobil (390):** Karten untereinander, je 390 × 548 px, 20 px Außenabstand oben. Bild 370 px (= 390 − 20). Textblock 370 px ab x=20, `margin-top: 253,2 px` (= 30dvh von 844), `padding: 20px`. Überschrift **20 px / 600 / 25 px**.

---

### Sektion 5 — Kontakt: Bild-Teaser links + Formular rechts

Zwei Frames nebeneinander im selben Raster.

#### 5a) Handlungsaufforderung mit Bild — `#item-465`

TYPO3-Typ `t4m_imageteaser`, `frame-indented-left`, `col-l-50` (span 6).

| Merkmal | Wert |
|---|---|
| Position | y 2791 – 3583 |
| **Höhe** | **792 px** |
| Außenabstände | `margin: 200px 0` (`frame-space-*-extra-large`) |
| Innenabstand | **`padding-left: 288px`** (frame-indented-left, 20 vw) |
| Breite | Frame 695 px (span 6), Inhalt daher nur **407 px ab x=288** |
| Hintergrund | weiß — Karte selbst **dunkel** (grüne Multiply-Fläche) |
| Bild | 357 px breit (= 407 − 50), links bündig, `object-fit: cover`, **bricht als Vollhöhenbild über die Sektion** |
| Textplatte | 357 px breit ab x=338, `margin-top: 360px` (40dvh), `padding: 50px`, Höhe 382 px |
| Grüner Strich | `bodytext::before`, 357 × 10 px, `#46D23C`, 60 px darüber (y ≈ 3091) |

| Textrolle | font-size | weight | line-height | letter-spacing | color |
|---|---|---|---|---|---|
| Überschrift `h2` | **30 px** | 600 | 37,5 px (125 %) | normal | `#FFFFFF` |
| Fließtext `p` | **16 px** | 400 | 21,6 px (135 %) | normal | `#FFFFFF` |

#### 5b) Kontaktformular — `#item-467`

TYPO3-Typ `form_formframework`, `frame-indented-right`, `col-l-50` (span 6).

| Merkmal | Wert |
|---|---|
| Position | y 2882 – 3493 |
| **Höhe** | **611 px** |
| Außenabstände | `margin: 100px 0` (`frame-space-*-medium`) |
| Innenabstand | **`padding-right: 288px`** |
| Breite | Frame 695 px ab x=745, Kasten daher **407 px ab x=745** |
| Kasten | `.inner`: `background: #0F8246` — **dunkel**, `padding: 50px 50px 67.5px 50px` |
| Grüne Senkrechte | `.inner::after`: **10 × 611 px**, `background: #46D23C`, `left: 416,94px` -> absolut bei x ≈ 1162, also 10 px rechts neben dem Kasten |
| Vertikaler Versatz | Formular beginnt **91 px tiefer** als der Bild-Teaser links (2882 vs. 2791) und endet 90 px früher |

Formularfelder:
- `input.form-control`, `select.form-control`: Höhe **40 px**, `background: #FFFFFF`, **`border-bottom: 2px solid #46D23C`**, sonst randlos, `padding: 0 10px`, `margin-bottom: 25px`, Schrift 16 px Rajdhani, Auswahlfeld-Text `#0F8246`
- Zweispaltige Zeilen (Vorname/Nachname, E-Mail/Telefon): `div.row` als `display: flex; justify-content: space-between`, Spalten je **143 px** bei 307 px Gesamtbreite (Zwischenraum 21 px)
- Textfeld (Anfrage): volle Breite, Höhe 40 px, resizable
- Ankreuzfeld 25 × 25 px, `.form-text` 16 px / 400 / 21,6 px / weiß
- Absenden `button.btn`: 16 px / 500 / line-height 32 px, Farbe `#46D23C`, mit 34 px Pfeil-Kästchen

**Mobil:** Beide Frames untereinander über volle Breite. Bild-Teaser 390 × 426 px (Außenabstände 80 px), Formular 390 × 507 px (Außenabstände 40 px), `padding-left: 20px; padding-right: 28px`.

---

### Trennerbalken — `main.page-main::after`

| Merkmal | Wert |
|---|---|
| Position | y 3783 – 3893 |
| Gesamthöhe | **110 px** |
| Aufbau | `height: 10px; background: #46D23C; border-top: 50px solid #FFFFFF; border-bottom: 50px solid #FFFFFF` |
| Wirkung | 50 px Weiß, **10 px hellgrüne Vollbreitenlinie (1440 px)**, 50 px Weiß |

---

### Sektion 6 — Fußbereich — `footer.page-footer`

| Merkmal | Wert |
|---|---|
| Typ | Fünfspaltiger Fußbereich plus Urheberrechtszeile |
| Position | y 3893 – 4375 |
| **Höhe** | **482 px** (Raster 435 px + Urheberzeile 47 px) |
| Hintergrund | **`#0F8246` — dunkel**, Textfarbe `#FFFFFF` |
| Raster | eigenes Raster: `grid-template-columns: repeat(5, calc(20% - 50px))` -> **5 Spalten à 228 px**, `column-gap: 50px`, `row-gap: 50px`, `align-items: normal` |
| **Innenabstände** | `padding: 50px 50px 0 50px` |

Spalten (x = 50 / 328 / 606 / 884 / 1162):

1. **Logo** — SVG, 228 × 49 px
2. **Anschrift** — `strong` 16 px / 700 / weiß, `p` 16 px / 400 / 21,6 px / weiß, Links weiß
3. **Untermenü** — `.btn`-Links 16 px / 500 / line-height 32 px / weiß mit Pfeil-Icon; Hover `padding-left: 1rem`
4. **Social + Siegel** — `h2` **20 px / 400 / 20 px (100 %) / `#46D23C`**; darunter 4 Kreisknöpfe Ø 40 px (RV/1,25), `background: #0F8246`, `box-shadow: -2px 2px 5px rgba(0,0,0,.2)`, Icons weiß; darunter das runde Nachhaltigkeits-SVG über volle Spaltenbreite
5. **Auszeichnung** — `frame-type-textpic` mit **`border-left: 10px solid #46D23C`**, `padding: 0 50px 25px 50px`, Text 16 px / 400 / `#46D23C`, Bild (German Design Award) 33 % Spaltenbreite

**Urheberrechtszeile** `.copyright`:
- `background: #46D23C` — hell, Textfarbe weiß
- `padding: 12.5px 50px` (RV/4 senkrecht, RV waagerecht), Höhe **47 px**
- Schrift 16 px / 400 / 135 %

Rechts in der Zeile sitzt der Datenschutz-Öffner `#t4mConsentOpener` (fixiert, 180 × 47 px, `background: #46D23C`).

**Mobil:** Spalten stapeln auf volle Breite, `row-gap` 20 px.

---

## 4. Zusammenfassung der Sektionsreihenfolge

| # | Sektion | y (Desktop) | Höhe | Hintergrund | hell/dunkel | Spalten |
|---|---|---|---|---|---|---|
| — | Kopfleiste (fixiert) | 0 – 100 | 100 px | transparent + weiße Platten | hell | — |
| 1 | Seitenkopf mit Bild + Breadcrumb-Platte | 0 – 360 | 360 px | Bild, Platte `#EDF1F3` | hell | 1 (Bild überbreit) |
| 2 | Intro-Zweispalter (H1 links / Text rechts) | 360 – 826 | 466 px | weiß + `#EDF1F3`-Fläche links | hell | 2 × 407 px, 1:1 |
| 3 | Story-Zweispalter Bild links / Text rechts | 976 – 1692 | 716 px | weiß + `#EDF1F3`-Textplatte | hell | 725 / 715 px, 50:50 |
| 4 | Dreier-Kartenraster (Bild + grüne Platte) | 1792 – 2591 | 799 px | weiß; Karten `#0F8246` multiply | Karten dunkel | 3 × 447 px, 1:1:1 |
| 5 | Kontakt: Bild-Teaser + Formular | 2791 – 3583 | 792 px | weiß; Formular `#0F8246` | Blöcke dunkel | 2 × 695 px (span 6), Inhalt je 407 px |
| — | Trennerbalken (grüne Linie) | 3783 – 3893 | 110 px | weiß + `#46D23C` 10 px | hell | — |
| 6 | Fußbereich + Urheberzeile | 3893 – 4375 | 482 px | `#0F8246` / `#46D23C` | **dunkel** | 5 × 228 px |

Lücken zwischen den Sektionen (reiner Weißraum):
826 -> 976 = **150 px** · 1692 -> 1792 = **100 px** · 2591 -> 2791 = **200 px** · 3583 -> 3783 = **200 px**

---

## 5. Bewegung

**Es gibt auf dieser Seite keine Scroll-Animation.** Belegt durch einen MutationObserver, der während eines vollständigen Durchscrollens (200-px-Schritte) alle `class`- und `style`-Änderungen im Body protokolliert hat. Ergebnis: **genau eine einzige Mutation** auf der gesamten Seite:

```
header.page-header  class: "page-header" -> "page-header scrolled"
```

Zur Klasse `.scrolled` existiert **keine CSS-Regel** — es ändert sich also nichts sichtbar. Der Seitenkopf hat `transition: all .3s ease`, die aber ins Leere läuft.

### Die einzige tatsächliche Bewegung: Bild-Einblendung beim Laden

```css
img[loading=lazy]       { opacity: 0; transition: 1s; filter: grayscale(1); }
img[loading=lazy].ready { opacity: 1;                 filter: grayscale(0); }
```

Die Klasse `.ready` wird per jQuery im `load`-Handler jedes Bildes gesetzt (`$.fn.lazyload` in `base.js`). Also:
- **Dauer: 1 s**
- **Kurve: `ease`** (CSS-Standard, da nur `transition: 1s` angegeben ist)
- **Versatz: 0 s**
- **Eigenschaften: `opacity` 0 -> 1 UND `filter: grayscale(1)` -> `grayscale(0)`** — die Bilder blenden also von Graustufen in Farbe ein
- **Auslöser: Bild-Ladeereignis, nicht Scrollposition**

### Vorhandene, aber auf dieser Seite ungenutzte Reveal-Mechanik

`base.js` enthält einen eigenen Viewport-Checker `$.fn.fx(delay)`, der per `setInterval` alle **100 ms** prüft, ob ein Element sichtbar ist, und dann mit optionaler Verzögerung die Klasse `fx-target` setzt. In `theme.js` ist er aber nur an `.frame-type-t4m_banner_fx`, `#item-340` und `#item-341` gebunden — alles Elemente, die es auf `/ueber-uns/` nicht gibt. Verwendete Effektklassen wären `fx-slide-top`, `fx-slide-left`, `fx-slide-right`, `fx-flickering` mit Verzögerungen von 0 / 300 / 500 ms.

### Übergänge bei Interaktion (Hover)

| Element | Eigenschaft | Dauer | Kurve |
|---|---|---|---|
| `.btn` | alle (Schatten, Farbe, Padding) | **0,3 s** | `ease` |
| `.btn .icon` | `background` | 0,3 s | `ease` |
| `.btn .icon svg` | `transform` -> `rotate(45deg)` | 0,3 s | `ease` |
| `.btn2` | `padding-left` 0 -> 2rem | **0,15 s** | `ease` |
| Navigationslinks | `color` | 0,3 s | `ease` |
| Menü-Kachelbilder | alle | 0,3 s | `ease` |
| `header.page-header` | alle | 0,3 s | `ease` |
| Hamburger-Balken | alle | 0,5 s | `ease` |
| `ul.level_1` (Mobilmenü) | `margin-top` 0 s / `opacity` 0,5 s / `z-index` 0,6 s | gestaffelt | `ease` |

---

## 6. Wiederkehrende Gestaltungsmuster (das eigentliche Bauprinzip)

1. **Die 10-px-Linie (`--referenceLine`).** Sie taucht überall auf, immer 10 px stark, immer in `#46D23C` oder `#0F8246`:
   - waagerecht über jeder Text-Overlay-Platte (`bodytext::before`, 60 px darüber)
   - waagerecht über der Banner-Beschriftung (`figcaption::before`, 60 px darüber)
   - senkrecht als `border-right` der Navigation
   - senkrecht als `border-left` jeder Social-Zeile am rechten Rand
   - senkrecht als `border-right` des Story-Bildes
   - senkrecht als `::after` neben dem Formularkasten
   - senkrecht als `border-left` der letzten Fußbereichsspalte
   - waagerecht als Vollbreiten-Trenner am Ende von `main`

2. **Der 50-px-Versatz (`--referenceValue`).** Bild und Farbfläche sind nie deckungsgleich: das Bild ist immer `calc(100% - 50px)` breit, die Farbfläche immer um 50 px nach rechts (bzw. links) verschoben. Daraus entsteht die durchgehende Treppenoptik.

3. **`mix-blend-mode: multiply` statt Alpha.** Alle drei Overlay-Flächen (Banner-Beschriftung, Karten-Grünplatte, graues Band über dem Story-Bild) verwenden Multiply auf voll deckender Farbe, nicht `rgba()`. Das erhält die Bildzeichnung unter der Fläche.

4. **20-vw-Einrückung.** Wo ein Block optisch eingerückt wirkt (Intro, Kontaktbereich), sind es immer 20 % der Viewportbreite als `padding`, nicht Rasterspalten.

5. **Rasterspalten werden nur für die Aufteilung genutzt**, nie für die Einrückung. Der Inhalt läuft immer bis an die Viewportkante.

---

## 7. Typografie-Kompaktübersicht (Desktop 1440)

| Rolle | Größe | Gewicht | Zeilenhöhe | Sperrung | Farbe |
|---|---|---|---|---|---|
| Kicker im Banner (`h1` im figcaption) | 20 px | 100/300 | 20 px (100 %) | normal | `#0F8246` |
| Sektionsüberschrift Intro (`h1`) | 38 px | 600 | 47,5 px (125 %) | normal | `#0F8246` |
| Sektionsüberschrift Story (`h3`) | 34 px | 600 | 42,5 px (125 %) | normal | `#343434` |
| Kartenüberschrift / CTA (`h2`,`h3`) | 30 px | 600 | 37,5 px (125 %) | normal | `#FFFFFF` |
| Kicker/`.subline` (ungenutzt) | 16 px | 400 | 100 % | normal | `#46D23C` |
| Fließtext | 16 px | 400 | 21,6 px (135 %) | normal | `#343434` bzw. `#FFFFFF` |
| Hervorhebung `strong` | 16 px | 700 | 21,6 px | normal | wie Umgebung |
| Schaltflächentext | 16 px | 500 | 16–34 px | normal | `#46D23C` bzw. `#FFFFFF` |
| Navigation Ebene 1 | 18 px | 700 | 50 px | normal | `#0F8246` / aktiv `#46D23C` |
| Navigation "KONTAKT" | 18 px | 700 | 50 px | **1,8 px**, uppercase | `#46D23C` |
| Sprachwahl | 16 px | 700 | 37,5 px | normal, uppercase | `#FFFFFF` |
| Fußbereich-Überschrift | 20 px | 400 | 20 px (100 %) | normal | `#46D23C` |
| Fußbereich-Text | 16 px | 400 | 21,6 px | normal | `#FFFFFF` |
| Urheberzeile | 16 px | 400 | 135 % | normal | `#FFFFFF` |
| Listenpunkte | 16 px | 400 | 21,6 px | normal | wie Umgebung; `::marker { content: "›" }`, 120 % |

Mobile Abweichungen: Story-Überschrift 22 px / 27,5 px, Kartenüberschrift 20 px / 25 px, Banner-Kicker 18 px. Fließtext bleibt überall 16 px.

---

## 8. Aufgenommene Dateien

Alle unter `_analysis/shots/wendt/`:

| Datei | Inhalt |
|---|---|
| `wendt-full.png` | Vollbild Desktop 1440 × 4375 |
| `wendt-01.png` … `wendt-05.png` | Abschnitte in 900-px-Schritten |
| `wendt-m-full.png` | Vollbild Mobil 390 × 5525 |
| `wendt-sec-1-hero.png` | Sektion 1 freigestellt |
| `wendt-sec-2-intro.png` | Sektion 2 freigestellt |
| `wendt-timeline-1.png` | **Sektion 3 freigestellt** (die Story-Sektion, kein Zeitstrahl) |
| `wendt-timeline-2-mobil.png` | Sektion 3 mobil |
| `wendt-sec-4-cards.png` | Sektion 4 freigestellt |
| `wendt-sec-5-kontakt.png` | Sektion 5 freigestellt |
| `wendt-sec-6-footer.png` | Trenner + Fußbereich |
| `wendt-m-hero.png`, `wendt-m-card.png` | Mobile Detailaufnahmen |

Rohdaten im Verzeichnis `_analysis/`:
`wendt-measure.json`, `wendt-deep.json`, `wendt-trees-1440.txt`, `wendt-trees-390.txt`, `wendt-ueber-uns.html`
Skripte: `wendt-shoot.js`, `wendt-measure.js`, `wendt-deep.js`, `wendt-crops.js`, `wendt-pseudo.js`
