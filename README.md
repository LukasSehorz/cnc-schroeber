# Schöbel CNC — Relaunch-Demo

Neubau des Webauftritts der Schöbel Hermann CNC Frästechnik GmbH, Markt Schwaben.
Statisches HTML, CSS und JavaScript ohne Build-Schritt.

## Starten

```bash
cd _analysis
npm install          # nur beim ersten Mal, installiert Playwright für die Screenshots
node serve.js        # bedient ./site auf http://localhost:4321
```

Ohne Server geht es auch: `site/index.html` direkt im Browser öffnen. Das
Hintergrundvideo im Hero startet dann je nach Browser allerdings nicht automatisch.

| Seite | Pfad |
|---|---|
| Startseite | `site/index.html` |
| Produktion | `site/produktion.html` |

## Aufbau

```
site/
  index.html          Startseite
  produktion.html     Produktionsseite
  css/site.css        Vollständiges Stylesheet, Tokens am Anfang
  js/site.js          Bewegung: Wortzeichen, Einblendungen, Zähler, Menü
  vendor/             GSAP, ScrollTrigger, Lenis, lokal abgelegt
  assets/img/         Fotos aus der Fertigung, aus dem Altbestand übernommen
  assets/video/       Hero-Loop als MP4 und WebM plus Standbild
  assets/fonts/       Jost und Archivo als WOFF2, selbst gehostet
_analysis/            Bestandsaufnahme der Altseite und Referenzanalysen
DESIGN.md             Farb-, Schrift- und Rastersystem, Direction Contract
```

Die Seite lädt nichts aus dem Netz. Schriften, Skripte und Medien liegen alle im
Repository, damit die Demo auch ohne Verbindung läuft.

## Gestaltung

Der Hero übernimmt die Mechanik von barriergroup.com: Das Wortzeichen steht
randbreit über dem Fertigungsvideo und schrumpft beim Scrollen in die
Navigationsleiste. Es ist dabei ein einziges Element, kein Überblenden zweier
Logos. Anders als im Original läuft der Übergang scroll-gebunden.

Das Sektionssystem folgt uptivemfg.com: Bildausbruch über die Containerkante,
Panel mit eingekerbtem Titel, nummerierte Prozessschritte, klebende
Sprungnavigation auf der Produktionsseite.

Farben und Schriften stammen aus der eigenen Marke. Einzelheiten in `DESIGN.md`.

## Inhalte

Sämtliche Texte, Kennzahlen und Maschinendaten sind wörtlich von cnc-schoebel.de
übernommen. Die vollständige Bestandsaufnahme steht in
`_analysis/cnc-schoebel-inventory.md`.

Drei Punkte braucht der Kunde noch:

- Das ISO-9001-Zertifikat lief am 26.05.2025 ab. Die Zertifizierung wird deshalb
  ohne Gültigkeitsdatum genannt.
- Öffnungszeiten und Social-Media-Profile fehlten auf der Altseite und sind
  entfallen.
- Die Maschinentabellen der Altseite widersprechen sich beim maximalen
  Bauteilgewicht, 18 kg gegen 12 kg. Übernommen wurden 18 kg.

## Herkunft der Medien

Die Fotos stammen aus dem Bestand der bisherigen Website. Der Hero-Loop ist ein
Ausschnitt von acht Sekunden aus dem Imagefilm des Betriebs, Sekunde 11,2 bis
19,2, neu kodiert auf 1080p ohne Ton.
