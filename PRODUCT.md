# PRODUCT.md — Schöbel CNC

> Erhoben aus dem Auftraggeber-Brief und einer vollständigen Analyse der Bestandsseite
> cnc-schoebel.de (7 Seiten, Inhalte verbatim in `_analysis/cnc-schoebel-inventory.md`).
> Zwei Entscheidungen wurden direkt mit dem Auftraggeber geklärt (Farbwelt, Hero-Wordmark).

## Was das ist

Neubau des Webauftritts der **Schöbel Hermann CNC Frästechnik GmbH**, einem
Zerspanungsbetrieb in Markt Schwaben bei München. Gegründet 2003, seit 2022 geführt
von Martin Herzog und Johannes Seilbeck. Lohnfertigung: CNC-Fräsen und -Drehen,
Oberflächenbearbeitung, Baugruppenmontage, Serien bis 50.000 Stück.

Dieser Durchgang liefert zwei Seiten: **Startseite** und **Produktion**.

## Zweck dieser Fassung

Demo für ein Erstgespräch. Sie muss in den ersten fünf Sekunden zeigen, dass der
Betrieb technisch auf der Höhe ist — die Bestandsseite tut das Gegenteil: auf sechs
von sieben Seiten fehlen die Stylesheets (HTTP 404), Inhalte laufen ungestylt über
die volle Fensterbreite, zwei Slider sind leer.

## Wer sie liest

Einkäufer und Konstrukteure aus Medizintechnik, Konsumgüterindustrie, Anlagen- und
Maschinenbau und optischer Industrie. Sie kommen mit einer Zeichnung und einer Frage:
Kann der das, und wie schnell höre ich etwas. Sie überfliegen zuerst die harten
Daten — Verfahrwege, Achsen, Losgrößen, Toleranzen, Zertifizierung — und lesen
Fließtext erst danach.

## Was den Ausschlag gibt

- **Angebot in unter 24 Stunden.** Das stärkste Argument des Betriebs. Auf der alten
  Seite steht es ganz unten. Hier gehört es nach oben und in die Navigation.
- **Belegbare Zahlen:** 15.073 Maschinenstunden Kapazität pro Jahr, 27.473 produzierte
  Kundenteile, 9.072 Stunden automatisierte Produktion, 4 CAM-Programmierplätze.
- **Automatisierung:** Roboterbeladung ab 12 Stück, mannlose Schichten.
- **Fertigungstiefe:** Zuschnitt, Zerspanung, Oberfläche, Montage, Lager auf Abruf.
- **ISO 9001:2015** zertifiziert.

## Inhaltliche Bindung

Sämtliche Sachaussagen, Zahlen, Maschinendaten und Formulierungen stammen wörtlich von
der Bestandsseite. Neue Behauptungen werden nicht erfunden. Korrigiert werden nur
offensichtliche Fehler des Originals (Tippfehler „Oberlächenbearbeitung", „wir sind
Stolz", Copyright 2024).

Das ISO-Zertifikat der alten Seite ist am 26.05.2025 abgelaufen. Die Zertifizierung
wird deshalb ohne Gültigkeitsdatum genannt und der Auftraggeber darauf hingewiesen.

## Stimme

Deutsch, sachlich, in ganzen Sätzen. Ein Fertigungsbetrieb, der weiß was er kann und
es nicht bewerben muss. Keine Superlative ohne Zahl dahinter, keine Marketingfloskeln,
keine Gedankenstrich-Konstruktionen, keine Doppelpunkt-Schlagzeilen, keine
Dreiwort-Sätze mit Verneinung.

## Firmendaten

| | |
|---|---|
| Firma | Schöbel Hermann CNC Frästechnik GmbH |
| Anschrift | Wiegenfeldring 4, 85570 Markt Schwaben |
| Telefon | +49 8121 93 000 |
| Telefax | +49 8121 93 008 |
| E-Mail | schoebel@cnc-schoebel.de |
| Geschäftsführung | Johannes Seilbeck, Martin Herzog |
| Handelsregister | HRB 148536, Amtsgericht München |
| USt-IdNr. | DE229129476 |
| Gegründet | 30.05.2003 durch Hermann Schöbel |

## Plattform

Statisches HTML, CSS und JavaScript. GSAP mit ScrollTrigger und Lenis liegen lokal
unter `site/vendor/`. Kein Build-Schritt, kein Framework — die Demo muss sich per
Doppelklick öffnen und beim Kunden ohne Infrastruktur laufen.

## Bildmaterial

38 Originalaufnahmen aus der eigenen Fertigung liegen in `site/assets/img/`. Das
Hero-Video ist ein 8-Sekunden-Ausschnitt (11,2–19,2 s) aus dem Imagefilm des Betriebs:
5-Achs-Simultanbearbeitung mit Späneflug, 1080p, ohne Ton. Echtes Material schlägt hier
jede Generierung.

## Angenommen, nicht bestätigt

- Öffnungszeiten sind nirgends dokumentiert und werden deshalb nicht genannt.
- Es existieren keine Social-Media-Profile (die Icons der alten Seite zeigen auf `#`).
  Sie entfallen ersatzlos.
- Kundennamen sind nicht öffentlich, nur Branchen. Es wird keine Logo-Wand gebaut.
