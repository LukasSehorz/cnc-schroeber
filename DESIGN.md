# DESIGN.md — Schöbel CNC

Die visuelle Welt ist vom Auftraggeber gepinnt: Hero-Mechanik von barriergroup.com,
Sektions-Layoutsystem von uptivemfg.com, Farbwelt aus der eigenen Marke. Es wurde
deshalb kein Konzeptverfahren gefahren. Belege: `_analysis/barrier-hero-effect.md`,
`_analysis/uptive-design-system.md`, `_analysis/uptive-animations.md`.

## Direction Contract

**THESIS** — Die Seite zeigt die Fertigung bei der Arbeit, statt sie zu behaupten. Sie
verweigert die Branchenvorlage aus Stockfoto-Hero, drei Icon-Karten und Kontaktformular.

**OWN-WORLD** — Anthrazit, Papierweiß, Signalrot, kaltgraue Risslinien. Alles ist
rechtwinklig: Bilder und Flächen tragen Radius 0, Schaltflächen 2 px. Trennung entsteht
durch 1-px-Linien, nicht durch Schatten. Bilder brechen über die Containerkante hinaus
ins Randlose. Ein rotes Quadrat von 14 px markiert jede Aktion. Schrift: Jost für Display
(geometrische Moderne der Futura-Linie, dieselbe Konstruktion wie das Wortzeichen),
Archivo für Fließtext und Daten mit tabellarischen Ziffern.

**STORY** — Ein Einkäufer mit einer Zeichnung sieht in fünf Sekunden echte Maschinen
arbeiten, liest das Versprechen von 24 Stunden, findet Verfahrwege und Losgrößen ohne zu
suchen und hat aus jeder Sektion heraus einen Weg zur Anfrage.

**FIRST VIEWPORT** — Das Wortzeichen randbreit über dem Fertigungsvideo, flankiert von
zwei Kleinlabels an seinen eigenen Kanten. Unten links die Überschrift in zwei Zeilen,
darunter die Einordnung, unten rechts die Aktion. Beim Scrollen schrumpft das Wortzeichen
in die Navigationsleiste.

**FORM** — Vom Auftraggeber gepinnt, kein Roll.

## Farbe

Strategie: Restrained. Neutrale Fläche, ein einziger Akzent. Der Betrieb verkauft
Maßhaltigkeit, und die Bauteilfotos tragen bereits Farbe (Alu, Späne, Kühlmittel). Zwei
Buntfarben würden mit ihnen konkurrieren.

Die Szene: Ein Einkäufer am Arbeitsplatz, Tageslicht, Bürobildschirm. Die Fläche ist
deshalb hell. Dunkle Bänder setzen Zäsuren, sie tragen nicht die Seite.

| Token | Wert | Rolle |
|---|---|---|
| `--ink` | `#14161A` | Überschriften, Navigationschip, dunkle Bänder |
| `--ink-soft` | `#23262C` | Zweite dunkle Stufe, Tabellenköpfe |
| `--paper` | `#FFFFFF` | Grundfläche, etwa 70 % der Seite |
| `--paper-alt` | `#F4F5F6` | Abgesetzte Bänder, Tabellenzeilen |
| `--paper-deep` | `#E8EAEC` | Dritte Stufe, Bildrahmen |
| `--line` | `#D8DBDF` | Trennlinien, 1 px |
| `--line-strong` | `#AFB4BB` | Betonte Trennung, Rahmen |
| `--muted` | `#5C626B` | Fließtext sekundär, Bildunterschriften |
| `--red` | `#930000` | Akzentquadrat, Aktionsflächen, Kennzahlen, aktive Zustände |
| `--red-bright` | `#BE1212` | Hover auf roten Flächen |

Rot bleibt Akzent. Es füllt nie eine ganze Sektion.

## Schrift

| Rolle | Familie | Größe |
|---|---|---|
| Display XL | Jost 300 | `clamp(2.75rem, 6vw, 5.25rem)`, Zeilenhöhe 0.98, Laufweite −0.03em |
| Display L | Jost 300 | `clamp(2rem, 3.6vw, 3.25rem)`, Zeilenhöhe 1.04, Laufweite −0.025em |
| Display M | Jost 400 | `clamp(1.5rem, 2.2vw, 2rem)`, Zeilenhöhe 1.12 |
| Kicker | Archivo 600 | 0.75rem, Versalien, Laufweite 0.14em, rot |
| Fließtext | Archivo 400 | 1.0625rem, Zeilenhöhe 1.65, Maß 68ch |
| Fließtext groß | Archivo 400 | 1.1875rem, Zeilenhöhe 1.6 |
| Daten | Archivo 500 | 0.9375rem, `font-variant-numeric: tabular-nums` |
| Kennzahl | Jost 300 | `clamp(2.5rem, 4.5vw, 4rem)`, tabellarisch |

Der Kicker ist ein System mit fester Bedeutung, er benennt den Bereich. Er steht nicht
über jeder Sektion.

## Raster

Container 1180 px, Innenabstand 24 px, ab 640 px 40 px. Sektionsabstand
`clamp(72px, 9vw, 128px)` oben und unten. Über einer Überschrift steht mehr Raum als
darunter. Zweispalter 1fr/1fr mit 64 px Spalte, Textspalte höchstens 68ch.

Bildausbruch: `width: calc(100% + 9vw)` auf der jeweiligen Außenseite, gedeckelt bei
1560 px Gesamtbreite. Das ist die Signatur der Vorlage und bleibt erhalten.

## Bewegung

Ein einziger inszenierter Moment trägt die Seite: das Wortzeichen, das beim Scrollen in
die Navigationsleiste schrumpft. Scroll-gebunden über GSAP ScrollTrigger mit `scrub`,
nicht als ausgelöste Sequenz wie im Original. Lenis glättet den Scroll mit `lerp 0.09`.

Alles Übrige ist zurückhaltend: Inhalte erscheinen mit 24 px Versatz und
`cubic-bezier(.16,1,.3,1)` über 0.8 s, gestaffelt mit 0.07 s, einmalig. Voreinstellung ist
sichtbar, nicht unsichtbar. Bei `prefers-reduced-motion` entfallen Versatz und Schrumpfen,
das Wortzeichen springt auf seine Endgröße.

## Bauteile

- **Aktion** — Rotes Quadrat 14 px, 12 px Abstand, Label in Versalien 0.8125rem mit
  0.1em Laufweite. Auf Hover wandert das Quadrat 6 px nach rechts, die Fläche unterstreicht
  sich mit 1 px. Gefüllte Variante: Fläche `--red`, Text weiß, Radius 2 px.
- **Datenblatt** — Definitionsliste mit 1-px-Zeilentrennung, Merkmal links in `--muted`,
  Wert rechts tabellarisch. Kein Zebrastreifen, keine Karte.
- **Leistungsblock** — Bild randlos, darunter Überschrift und Strichliste. Die Liste
  trägt keine Punkte, sondern eine 1-px-Linie über jedem Eintrag.
- **Panelrahmen** — 1-px-Rahmen `--line-strong` mit eingekerbtem Titel auf der oberen
  Kante, übernommen aus der Vorlage.

## Verboten

- Runde Ecken über 2 px auf Flächen, jeder Radius auf Bildern.
- Schatten als Trennung. Tiefe entsteht durch Linien und Fläche.
- Verlaufstext, Glas, Leuchtkanten.
- Gleich große Icon-Karten als Seitenstruktur.
- Ein Kicker über jeder Sektion.
- Monospace als Kostüm für Technik. Zahlen tragen tabellarische Ziffern, das reicht.
