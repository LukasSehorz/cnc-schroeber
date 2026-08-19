# cnc-schoebel.de — Vollständiges Website-Inventar (Analyse für Relaunch)

**Analysiert am:** 2026-08-05
**Domain:** https://cnc-schoebel.de/
**Firma:** Schöbel Hermann CNC Frästechnik GmbH, Markt Schwaben (Bayern)
**Tech-Stack:** WordPress + Elementor Pro 4.2.0 + Hello Elementor Theme 3.4.9, Rank Math SEO, Borlabs Cookie 3.4.2, WP Fastest Cache, Essential Addons for Elementor Lite, Contact Form 7 (geladen, aber nicht genutzt — Formular ist ein Elementor-Pro-Form-Widget). Hosting: **Strato AG** (laut Datenschutzerklärung).

---

## 0. KRITISCHE BEFUNDE (Stand der Live-Site heute)

### 0.1 Die Website ist auf 6 von 7 Seiten aktuell KAPUTT
Elementor lädt pro Seite eine eigene CSS-Datei. Diese Dateien **fehlen auf dem Server (HTTP 404)** — nur die Startseite funktioniert:

| Seite | CSS-Datei | Status |
|---|---|---|
| Startseite | `/wp-content/uploads/elementor/css/post-18.css` | **200 OK** |
| Produktion | `…/post-180.css` | **404** |
| Unternehmen | `…/post-26.css` | **404** |
| Maschinenpark | `…/post-409.css` | **404** |
| Kontakt | `…/post-28.css` | **404** |
| Impressum | `…/post-22.css` | **404** |
| Datenschutz | `…/post-20.css` | **404** |

Auch `post-7.css` (Elementor-Kit/Global Styles), `post-49.css` (Header) und `post-60.css` (Footer) laden — deshalb sehen Header/Footer noch richtig aus, der **gesamte Seiteninhalt darunter ist aber ungestylt**: kein Container-Limit (Text läuft randlos über 1440 px), keine Abstände, keine Spalten, keine Overlays, Elementor-Default-Lila (`#4054b2` / `#833ca3`) statt Corporate-Rot in den Tabellen-Headern des Maschinenparks.

**Folgeschäden, direkt sichtbar:**
- **Produktion → „Fertigungsteile"-Slider ist komplett leer** (Slide-Hintergrundbilder waren in post-180.css definiert).
- **Maschinenpark → „Unsere Projekte"-Slider ist komplett leer** (Bilder waren in post-409.css definiert). Die Maschinenpark-Seite lädt aktuell **überhaupt kein einziges Inhaltsbild**.
- Sektions-Hintergrundbilder auf Produktion werden nur noch als 20 px schmale Streifen am linken Rand gerendert.

> Die Screenshots in `shots/cnc/` dokumentieren diesen **Ist-Zustand**. Das Wayback-Archiv hat die fehlenden CSS-Dateien ebenfalls nicht (auch dort 404) — das intendierte Layout der Unterseiten ist nicht mehr rekonstruierbar. Für den Relaunch ist das irrelevant (Neubau), als Verkaufsargument im Erstgespräch aber Gold wert.

### 0.2 Weitere Defekte
- **Social-Icons im Footer zeigen ins Leere**: Facebook und Twitter/X verlinken beide auf `#` (kein echtes Profil). Zusätzlich sind zwei leere Icon-Slots vorhanden (`Facebook-f`, `" "`, `" "`, `Twitter`).
- **„Download"-Button beim ISO-Zertifikat (Unternehmen) verlinkt auf `#`** — kein PDF hinterlegt.
- **Alle 12 Firmenhistorie-Jahreszahlen sind `<a href="#">`** — sinnlose Links.
- **ISO-9001-Zertifikat auf der Seite ist abgelaufen**: gültig bis **26.05.2025** (Zertifikat QMS-22.12.408, DSR Certification). Heute 2026 → veraltet.
- **Tippfehler im Footer-Menü (auf allen Seiten):** „Ober**l**ächenbearbeitung" statt „Oberflächenbearbeitung".
- **Tippfehler im Dateinamen:** `Schoebel_Pnaumatikanlage.jpg` (statt Pneumatik).
- **Tippfehler im Fließtext (Unternehmen/Werte):** „wir sind **S**tolz auf unsere Produkte".
- **Copyright veraltet:** „© 2024 All Rights Reserved." — englisch auf einer deutschen Seite, Jahr 2024.
- **Zahlen im Widerspruch:** Produktion sagt „Serienfertigungen bis zu **50.000** Stück", CNC-Drehen sagt „Serienfertigung bis **10.000** Stück".
- **Alt-Texte praktisch überall leer** (`alt=""`), nur das Zertifikatsbild hat einen (`ISO 9001 Zertifikat`); 12 Icons haben `alt="\n"`.
- **Kein Impressum-/Datenschutz-Link im Hauptmenü** (nur im Footer, ok) — aber **keine Telefonnummer als klickbarer `tel:`-Link** im Header (nur Text).
- **Keine Öffnungszeiten** irgendwo auf der Website.
- **Keine Karte / kein Google-Maps-Embed** auf der Kontaktseite, obwohl die Überschrift „So kommen Sie zu uns" lautet.
- Hero-Video liegt **bei YouTube** (nicht selbst gehostet) → Cookie-Banner blockiert es bis zur Einwilligung; ohne Zustimmung sieht der Nutzer nur ein Standbild.

---

## 1. SEITENÜBERSICHT (alle gefundenen URLs)

Quelle: Navigation, Footer, `wp-sitemap.xml` / `page-sitemap.xml`, WP-REST-API (`/wp-json/wp/v2/pages`). **Es existieren genau 7 Seiten**, keine Blogbeiträge, keine Custom Post Types.

| # | URL | WP-ID | Slug | `<title>` |
|---|---|---|---|---|
| 1 | https://cnc-schoebel.de/ | 18 | startseite | Schöbel CNC - Ihr Partner für Zerspanung |
| 2 | https://cnc-schoebel.de/produktion/ | 180 | produktion | Produktion - Schöbel CNC |
| 3 | https://cnc-schoebel.de/unternehmen/ | 26 | unternehmen | Unternehmen - Schöbel CNC |
| 4 | https://cnc-schoebel.de/maschinenpark/ | 409 | maschinenpark | Maschinenpark - Schöbel CNC |
| 5 | https://cnc-schoebel.de/kontakt/ | 28 | kontakt | Kontakt - Schöbel CNC |
| 6 | https://cnc-schoebel.de/impressum/ | 22 | impressum | Impressum - Schöbel CNC |
| 7 | https://cnc-schoebel.de/datenschutz/ | 20 | datenschutz | Datenschutz - Schöbel CNC |

**Sprungmarken (Anchors), im Menü verlinkt:**
- `https://cnc-schoebel.de/produktion/#zerspanung`
- `https://cnc-schoebel.de/produktion/#oberflaechenbearbeitung`
- `https://cnc-schoebel.de/produktion/#baugruppenmontage`
- `https://cnc-schoebel.de/produktion/#service`
- `https://cnc-schoebel.de/unternehmen/#karriere`
- (interner Skiplink: `#content`)

**Sonstige URLs:** `/feed/`, `/comments/feed/`, `/xmlrpc.php`, `/wp-json/` (REST offen), externe Links nur: `mailto:schoebel@cnc-schoebel.de`, `https://borlabs.io/borlabs-cookie/` (Cookie-Banner-Branding), `https://www.strato.de/datenschutz/`, `https://www.youtube.com/embed/zeXl8Qu27fY` (Hero-Video).

---

## 2. GLOBALE ELEMENTE (auf allen Seiten identisch)

### 2.1 Top-Bar (schmaler schwarzer Balken über dem Header)
Icon-Liste, rechtsbündig:
- 📞 `+49 8121 93 000`  *(reiner Text, kein `tel:`-Link)*
- ✉ `schoebel@cnc-schoebel.de`  *(reiner Text, kein `mailto:`)*

### 2.2 Header (sticky, weiß/schwarz)
- **Logo** (links, verlinkt auf `/`): `Schoebel-CNC_Logo-1536x474.png`, dargestellt 177×54 px
- **Hauptnavigation** (rechts, Elementor Nav-Menu, Pointer „underline", Animation „fade"):

| Label | href | Untermenü |
|---|---|---|
| Produktion | `/produktion/` | ▾ |
| — Zerspanung | `/produktion/#zerspanung` | |
| — Oberflächenbearbeitung | `/produktion/#oberflaechenbearbeitung` | |
| — Baugruppenmontage | `/produktion/#baugruppenmontage` | |
| — Service | `/produktion/#service` | |
| Unternehmen | `/unternehmen/` | ▾ |
| — Karriere | `/unternehmen/#karriere` | |
| — Maschinenpark | `/maschinenpark/` | |
| Kontakt | `/kontakt/` | — |

Aktiver Menüpunkt wird **rot** (`#930000`) eingefärbt. Auf Mobile: Burger-Dropdown (Elementor `nav-menu--dropdown`).

### 2.3 Pre-Footer-CTA-Sektion („Ihr individuelles Angebot")
Erscheint auf **Startseite, Produktion und Unternehmen** (nicht auf Maschinenpark/Kontakt). Dunkler Verlauf, links Text, rechts das große Schöbel-Signet (`Schoebel_Icon.png`, 400×400).

> **Ihr individuelles Angebot** (h2)
>
> Erhalten Sie in unter 24h Ihr unverbindliches Angebot zum gewünschten Bauteil.
>
> Senden Sie uns hierzu eine Zeichnung (PDF) sowie die 3D Daten.
>
> `[ Unverbindlich anfragen ]` → `/kontakt/`

*Varianten:* Auf **Produktion** heißt es „…eine Zeichnung (**.pdf**) sowie die 3D Daten." Auf **Unternehmen** heißt es „Erhalten Sie in unter 24h **ein** unverbindliches Angebot…".

### 2.4 Footer (4 Spalten, Verlauf `linear-gradient(90deg, #000000 0%, #333333 77%)`)

**Spalte 1 — Logo + Claim**
- Bild: `Schoebel-CNC_Logo.png` (299×92)
- Text: `Ihr Partner für Zerspanung. Wir fertigen Ihre Teile.`

**Spalte 2 — „Produktion" (h6)**
| Label | href |
|---|---|
| Zerspanung | `/produktion/#zerspanung` |
| Oberlächenbearbeitung *(sic!)* | `/produktion/#oberflaechenbearbeitung` |
| Baugruppenmontage | `/produktion/#baugruppenmontage` |
| Service | `/produktion/#service` |

**Spalte 3 — „Unternehmen" (h6)**
| Label | href |
|---|---|
| Unternehmen | `/unternehmen/` |
| Maschinenpark | `/maschinenpark/` |

**Spalte 4 — „Kontaktieren Sie Uns" (h6)**
```
Wiegenfeldring 4
85570 Markt Schwaben
```
- ✉ `schoebel@cnc-schoebel.de` → `mailto:schoebel@cnc-schoebel.de`
- Social Icons: `Facebook-f` → `#`, (leer), (leer), `Twitter` → `#`  ← **alle tot**

**Footer-Unterzeile**
- `Impressum` → `/impressum/`
- `Datenschutz` → `/datenschutz/`
- `© 2024 All Rights Reserved.`

### 2.5 Cookie-Banner (Borlabs Cookie 3.4.2, modal, blockiert die Seite)
Überschrift **„Datenschutz-Präferenz"**. Buttons in dieser Reihenfolge:
`Einwilligung speichern` · `Ich akzeptiere alle` · `Nur essenzielle Cookies akzeptieren` · `Individuelle Datenschutz-Präferenzen`
Fußzeile: `Präferenzen` · `Datenschutzerklärung` · `Impressum` · `Borlabs Cookie`
Service-Gruppe: **Essenziell** — „Essenzielle Services ermöglichen grundlegende Funktionen und sind für das ordnungsgemäße Funktionieren der Website erforderlich."
*(Vollständiger Bannertext siehe `cnc-data/home.txt`.)*

---

## 3. SEITE 1 — STARTSEITE (`/`)

**Meta**
- `<title>`: `Schöbel CNC - Ihr Partner für Zerspanung`
- `description`: `Jedes Projekt ist einzigartig. Wir liefern Ihnen seit über 20 Jahren maßgeschneiderte CNC-Dienstleistungen, mit Präzision bis ins kleinste Detail.`
- `og:image`: `…/2024/06/Schoebel_Zerspanung_Start.jpg` (1920×1080)
- `article:published_time`: 2024-05-09 · `article:modified_time`: 2024-09-02
- Autor laut Twitter-Card: **Alexandra Banek**
- Seitenhöhe Desktop: **4.982 px**

### Sektionsreihenfolge

**① Hero (Vollbild, Hintergrund = YouTube-Video, dunkles Overlay)**
- h1: `Ihr Partner für`  *(weiß auf rotem Balken `#930000`)*
- h1: `Zerspanung`  *(weiß auf rotem Balken)*

**② „Präzision, Partnerschaft, Innovation" (heller Hintergrund, 2 Spalten)**
- h2: `Präzision, Partnerschaft, Innovation`
- Fließtext:
  > Wir verstehen, dass jedes Projekt einzigartig ist. Daher bieten wir seit nun mehr als 20 Jahren maßgeschneiderte CNC-Dienstleistungen, die sich exakt an Ihren Anforderungen orientieren. Von Prototypen bis zur Serienproduktion – wir liefern Präzision bis ins kleinste Detail. Dabei setzen wir auf modernste Technik, um den Anforderungen unserer Kunden bestmöglich gerecht zu werden.
- Bild rechts: `Schoebel_Automation.jpg` (400×600) — Roboterarm (Sherpa) vor der GF/Mikron HEM 500U, davor ein blauer Rollwagen mit einer Reihe Aluminium-Rohteilen.

**③ „Produktion" (dunkler Hintergrund, 2 Spalten, Bild links)**
- h2: `Produktion`
- Fließtext:
  > Bei Schöbel CNC sind wir stolz darauf, innovative CNC-Fertigung anzubieten, die Ihren individuellen Anforderungen gerecht werden. Unser erfahrenes Team und modernste Technologien ermöglichen es uns, anspruchsvolle Projekte mit höchster Effizienz und Genauigkeit umzusetzen.
  >
  > Wir legen dabei großen Wert auf Zuverlässigkeit. Termintreue ist für uns selbstverständlich, damit Sie sich auf unsere Leistungen verlassen können.
- Bild links: `Schoebel_Hermle_Aluminium.jpg` (400×600) — großes gefrästes Aluminium-Gehäuse auf blauem Lang-Nullpunktspannsystem auf dem Rundtisch der Hermle.

**④ Kennzahlen-Zeile (weißer Hintergrund, 4 animierte Counter, Zahlen in `#930000`, Bold ~69 px)**

| Zahl (Endwert) | Beschriftung | Animationsdauer |
|---|---|---|
| **15.073** | Maschinenstunden Kapazität (Jahr) | 5000 ms |
| **27.473** | Produzierte Kundenteile (Jahr) | 5000 ms |
| **9.072** | Automatisierte Produktion (h/Jahr) | 5000 ms |
| **4** | CAM Programmierplätze | 4000 ms |

**⑤ „Unsere Leistungen" (dunkler Hintergrund, 4 Bildkacheln nebeneinander)**
- h2: `Unsere Leistungen`
- Kacheln (Bild-Hintergrund + Label mittig, jeweils verlinkt):

| Label | Link | Hintergrundbild |
|---|---|---|
| Zerspanung | `/produktion/#zerspanung` | `Schoebel_Zerspanung_Start.jpg` |
| Oberflächenbearbeitung | `/produktion/#oberflaechenbearbeitung` | `Schoebel_Oberflaechenbearbeitung.jpg` |
| Baugruppenmontage | `/produktion/#baugruppenmontage` | `Schoebel_CNC_Baugruppenmontage.jpg` |
| Service | `/produktion/#service` | `Schoebel_Service.jpg` |

**⑥ „Unsere Projekte" (weißer Hintergrund, links Text, rechts Elementor-Slides-Slider mit Ken-Burns-Effekt, 9 Slides + Bullets)**
- h2: `Unsere Projekte` *(in `#930000`)*
- Fließtext:
  > Zu unseren Kunden zählen namhafte Unternehmen der verschiedensten Branchen wie z.B. der Medizintechnik, der Konsumgüterindustrie, des Anlagen- und Maschinenbau sowie der optischen Industrie.
- Slider-Bilder: `Schoebel_Projekte1.jpg` … `Schoebel_Projekte9.jpg` (470×400 dargestellt, `cover`, Ken-Burns aktiv)

**⑦ CTA „Ihr individuelles Angebot"** → siehe 2.3

**⑧ Footer** → siehe 2.4

---

## 4. SEITE 2 — PRODUKTION (`/produktion/`) ⭐

**Meta**
- `<title>`: `Produktion - Schöbel CNC`
- `description`: `Wir bieten Teilefertigung auf hochmodernen CNC-Bearbeitungszentren mit Oberflächenbehandlung, als auch das Komplettpaket von der Teilefertigung, der Teilereinigung, der Oberflächenbehandlung bis hin zur fertig montierten Baugruppe inklusive Elektronik- und Pneumatik-Komponenten.`
- `og:image`: `…/2024/06/Schoebel_Icon.png`
- Seitenhöhe Desktop: **5.163 px**
- Elementor-Widgets: 21× heading, 17× text-editor, 3× icon-list, 1× gallery, 1× slides, 1× button, 1× image-box, 5× nav-menu

### ① Hero
Hintergrund-Slideshow mit **einem** Bild: `Schoebel_Bauteile_Fertigung.jpg` (Reihen glänzender, frisch gedrehter Aluminium-Buchsen/Ringe auf Spannplatten in der Maschine).
- h1: `Höchste`
- h1: `Qualität`

### ② Intro
- h2: `Schöbel CNC steht für Produktion in Perfektion`
- Fließtext:
  > Sowohl die Teilefertigung auf unseren hochmodernen CNC-Bearbeitungszentren mit anschließender Oberflächenbehandlung als auch das Komplettpaket von der Teilefertigung, der Teilereinigung, der Oberflächenbehandlung bis hin zur fertig montierten Baugruppe inklusive Elektronik- und Pneumatik-Komponenten – ob ein Blechbiegebauteil, eine spezielle Sonderbeschichtung oder die Unterstützung in konstruktiven Produktionsoptimierungen.
  >
  > So individuell Ihr Anliegen auch ist, wir machen Ihr Projekt zu unserer nächsten Aufgabe.

### ③ `#zerspanung` — Zerspanung
- h2: `Zerspanung`
- Fließtext:
  > Als Firma verfügen wir über 20 Jahre Erfahrung in der Produktion hochwertiger Zerspanungsteile. Durch den kontinuierlichen Ausbau unserer Produktionsanlagen und den starken Fokus auf Automation sind wir in der Lage, Serienfertigungen bis zu 50.000 Stück anzubieten.
  >
  > Wir produzieren sowohl weniger aufwendige Parallelbauteile mittels 3-Achs-Bearbeitung von der Vakuumplatte, als auch hochkomplexe 5-Achs-Freiformflächen, die mithilfe von Simultanbearbeitungen abgezeilt werden. Dabei legen wir großen Wert auf kurze Rüstzeiten, innovative Bearbeitungsstrategien sowie einen möglichst hohen Grad der Automation.
  >
  > Seit mehr als zehn Jahren setzen wir daher auf den Einsatz des High-End-CAD-CAM-Systems Hypermill. Dadurch werden die Maschinenbearbeitungen softwarebasiert erstellt und vorab mittels virtueller Maschine simuliert – um eine Bearbeitung zu erhalten, die möglichst maßhaltig, prozesssicher und effizient ist.

Danach **6 Leistungsblöcke**, jeweils mit eigenem Sektions-Hintergrundbild:

#### 3a. CNC-Fräsen  *(Bild: `Schoebel_CNC-Fraesen.png` — Fräser mit starker Kühlmittelflutung)*
- 5-Achs X Y Z 550 x 450 x 400 mm
- Simultanbearbeitung
- integriertes Lasermesssystem
- 3-Achs X Y Z 1000 x 550 x 500 mm
- integrierte Werkzeugvermessung
- Gängige Materialien:
  - **NE Metalle:** Aluminium, Titan, Messing, Bronze
  - **Eisenmetalle:** Edelstahl, Automatenstahl, Einsatzstahl oder normaler Stahl
  - **Kunststoffe:** POM, PEEK, PET, PTFE, Lauramid, PA6 uvm.

#### 3b. CAM-Programmierung  *(Bild: `Schoebel_CAM-Programmierung.png` — Programmierer an Doppelmonitor-Arbeitsplatz mit hyperMILL-Simulation)*
- Erstellung des Maschinencodes „NC Programm“
- Makro-unterstützte Programmierung
- Simulation mittels virtueller Maschine
- Laufzeitoptimierung für Serienfertigung
- serverbasierte Werkzeugdatenbank
- seit mehr als 10 Jahren im Einsatz
- Datenübertragung via Netzwerk
- innovativste Frässtrategien (HSC, TPC)

#### 3c. CNC-Drehen  *(Bild: `Schoebel_CNC-Drehen.jpg` — Wabenfeld glänzender gedrehter Aluminium-Töpfe)*
- Bauteile bis Ø 250mm
- Serienfertigung bis 10.000 Stück
- Dünne Bauteile durch Langdrehen möglich
- Gängige Materialien:
  - **Eisenmetalle:** Edelstahl, Automatenstahl
  - **NE Metalle:** Aluminium, Messing
  - **Kunststoffe:** POM, PEEK, PA6 uvm.

#### 3d. Serienfertigung  *(Bild: `Schoebel_Serienfertigung.jpg` — Reihen identischer Aluminium-Winkelteile auf Palette)*
- 5-Achs-Fräsen mit Roboter-Beladung
- automatisierte Fertigung ab 12 Stück
- max. Bauteilgröße X Y Z 250 x 200 x 200 mm
- integrierte Ausrichtstation (OP20 möglich)
- automatische Bauteilreinigung
- max. Bauteilgewicht 18kg

#### 3e. Lager auf Abruf  *(Bild: `Schoebel_Lager.png` — nummerierte Lagerregale mit Sichtlagerkästen)*
- Rahmenauftrag mit Just-in-Time-Lieferungen
- Konfektionierung gewünschter Baugruppen
- Verpackung und Versand
- Produktlabels nach Kundenwunsch

#### 3f. Zuschnitt & Materiallager  *(Bild: `Schoebel_Zuschnitt.png` — CNC-Bandsäge schneidet Stahlprofil unter Kühlmittelstrahl)*
- viele Materialien wie Aluminium, Edelstahl, Stahl, Kunststoffe uvm. lagernd
- In-House-Zuschnitt mittels CNC-gesteuerter Bandsäge
- hohe Flexibilität und Geschwindigkeit
- Eilaufträge nach Rücksprache möglich
- attraktive Konditionen durch Sammelbeschaffung

### ④ `#oberflaechenbearbeitung` — Oberflächenbearbeitung
- h2: `Oberflächenbearbeitung`
- Fließtext:
  > Zu unserem Leistungsspektrum gehören ebenfalls die Oberflächenbearbeitungen wie Entgraten, Gleitschleifen, Trowalisieren, Sandstrahlen, Glasperlenstrahlen und die Bauteilreinigung. Ob Bauteil Entgraten oder das Konservieren spezieller Legierungen nach der Bearbeitung – durch unsere langjährige Erfahrung als CNC-Bauteile-Lieferant können wir auch hier auf ein reichhaltiges Erfahrungsspektrum zurückgreifen.

**Mechanische Oberflächenbearbeitung & -veredelung** *(Bild: `Schoebel_Gleitschleifen_Aluminium.jpg` — Aluminium-Bauteil mit graviertem Schöbel-Logo inmitten von Gleitschleif-Chips)*
- Glasperlenstrahlen
- Sandstrahlen
- Gleitschleifen
- Trowalisieren
- Reinigen
- Konservieren
- Laserbeschriften
- Gravieren
- Tampondruck

**Chemische Oberflächenbearbeitung** *(Bild: `Schoebel_chemische_Oberflaechenbearbeitung.jpg` — Edelstahl-Gehäuse mit perforierter Innenwanne)*
- Galvanik: natur eloxieren, schwarz eloxieren, hart eloxieren, passivieren, SurTec, uvm.
- Chemisch Nickel
- Brünieren
- Beizen
- Lackieren
- Pulverbeschichten
- Härten
- Verchromen

Abschlusstext:
> Durch eine enge Partnerschaft mit ausgewählten, zertifizierten Zulieferbetrieben ist es uns möglich, das breite Spektrum der chemischen Oberflächenbearbeitung mit anzubieten.

### ⑤ `#baugruppenmontage` — Baugruppenmontage
- h2: `Baugruppenmontage`
- Fließtext:
  > Wir verfolgen einen ganzheitlichen Ansatz zur Fertigung, indem wir nicht nur Einzelteile produzieren, sondern auch die Montage übernehmen. Von der Montage von Bohr- oder Ensat-Buchsen bis hin zur vollen Integration der Pneumatik- und Elektronik-Komponenten. Dies ermöglicht es Ihnen, alle erforderlichen Komponenten und Montageleistungen aus einer Hand zu erhalten.
- **Galerie (4 Bilder, Lightbox aktiv):**
  1. `Schoebel_Pnaumatikanlage.jpg` — Reihe blauer Pneumatikschläuche mit Filtern/Steckverbindern an einer Profilschiene
  2. `Schoebel_Vorrichtungsbau.jpg` — Aluminium-Vorrichtung mit vielen Spannpratzen/Rändelschrauben
  3. `Schoebel_Baugruppe_Getriebe.jpg` — Welle mit Messing-Schneckenrad und Lagerflansch
  4. `Schoebel_Lagerblock.jpg` — Edelstahl-Lagerblock mit eingepressten Kugellagern und Bronzebuchse

### ⑥ `#service` — Service
- h2: `Service`
- Fließtext:
  > Bei Schöbel CNC verstehen wir Service als weit mehr als nur die Fertigung einzelner Bauteile. Unser Anspruch ist es, durch unsere umfassende Erfahrung und Expertise die Projekte unserer Kunden optimal zu unterstützen und gemeinsam die bestmöglichen Ergebnisse zu erzielen.
  >
  > Durch die enge Zusammenarbeit mit unseren Kunden und die kontinuierliche Analyse der Produktionsprozesse identifizieren wir stets Potenziale zur Optimierung und Innovation. Unser Service beginnt mit einer detaillierten und individuellen Beratung. Wir nehmen uns die Zeit, die spezifischen Anforderungen und Wünsche unserer Kunden genau zu verstehen.
  >
  > Mit uns haben Sie einen Partner an Ihrer Seite, der nicht nur Bauteile fertigt, sondern Ihre Projekte mit Engagement, Fachwissen und einem Höchstmaß an Service unterstützt.
  >
  > Wir freuen uns darauf, Ihre Projekte gemeinsam zum Erfolg zu führen.

### ⑦ Fertigungsteile
- h2: `Fertigungsteile`
- Fließtext:
  > Unsere präzise gefertigten Kundenbauteile spiegeln unser Engagement für höchste Qualität und fortschrittliche Automationslösungen in der CNC-Zerspanung wider.
- **Slider mit 9 Slides + Pfeilen + Bullet-Navigation — aktuell LEER** (Bilder waren in der 404-CSS definiert)

### ⑧ CTA „Ihr individuelles Angebot" → siehe 2.3
### ⑨ Footer → siehe 2.4

---

## 5. SEITE 3 — UNTERNEHMEN (`/unternehmen/`)

**Meta**
- `<title>`: `Unternehmen - Schöbel CNC`
- `description`: `Die Firma Hermann Schöbel CNC Frästechnik GmbH wurde am 2003 durch Hermann Schöbel gegründet. Ihr zuverlässiger Partner mit höchsten Qualitätsstandards.` *(fehlerhafter Satzbau: „am 2003")*
- `og:image`: `…/2024/08/Schoebel-Zertifikat-2024-1-724x1024.png`
- Seitenhöhe Desktop: **8.586 px** (längste Inhaltsseite)

### ① Hero *(Hintergrundbild `Schoebel_Fertigung_Kontakt.jpg` — Roboterarm greift Rohteile aus einem Raster, im Hintergrund MIKRON HEM 500U)*
- h1: `Als Team`
- h1: `unschlagbar`

### ② `#karriere` — Karriere
- h2: `Karriere`
- h3: `Wir suchen Verstärkung für unser Team:`
- Button: `[ Melde dich bei uns ]` → `/kontakt/`
- Text:
  > zum nächstmöglichen Zeitpunkt
  >
  > CNC Zerspanungsmechaniker/in, Feinwerkmechaniker/in, o.ä. (Vollzeit)
  >
  > 5-Achs-Fräsen
  >
  > 3-Achs-Fräsen

**Dein Aufgabenbereich:**
- Herstellung von Präzisionsteilen an CNC Maschinen
- Programmieren von NC Programmen (mittels CAM Software (HyperMill) und/ oder Heidenhain Steuerung. Erfahrung mit einem CAM-Systemen wünschenswert, jedoch nicht erforderlich)
- Qualitätssicherung der gefertigten Bauteile
- Material Bereitstellung, Zuschnitt, Werkzeugverwaltung, Maschinenwartung
- Eigenverantwortliches Betreuen von CNC Maschine
- Einrichten von Roboteranlagen (Programmerstellung, Rüsten der Automationen)

**Benefits:**
- Hohe Eigenverantwortung
- Überdurchschnittliche Vergütung
- Sehr gutes Betriebsklima
- Abwechslungsreiche Tätigkeiten
- Stark wachsendes Unternehmen
- Freie Getränke
- Sehr flache Strukturen
- Regelmäßige freie Mittagessen
- Keine Schichtarbeit
- Urlaubs- und Weihnachtsgeld
- 30 Tage Urlaub
- Wochenendbeginn ist Freitag ab 12:00 Uhr
- Moderner Maschinenpark mit voll-automatisierten Produktionsmaschinen
- Gründliche Einarbeitung
- uvm.

Abschluss:
> Kontaktieren Sie uns unkompliziert und unverbindlich gerne per Telefon oder email.

### ③ Über uns
- h2: `Über uns`
- Text:
  > Die Firma Hermann Schöbel CNC Frästechnik GmbH wurde am 30. Mai 2003 durch Herrn Hermann Schöbel gegründet. Von Anfang an verfolgte das Unternehmen das Ziel, sich als zuverlässiger Partner zu etablieren und höchste Qualitätsstandards zu setzen. Durch kontinuierliche Investitionen in moderne Technologien und die stetige Weiterentwicklung der Fertigungsprozesse gelang es Hermann Schöbel, sich als langjähriger Partner für eine Vielzahl von Kunden zu positionieren.
  >
  > Mit einem starken Fokus auf Präzision und Effizienz hat sich das Unternehmen im Laufe der Jahre einen herausragenden Ruf in der Lohnfertigung erarbeitet und bleibt auch weiterhin stolz darauf, innovative Lösungen für die individuellen Anforderungen seiner Kunden zu bieten. 2022 wurde das Unternehmen von Herrn Martin Herzog und Johannes Seilbeck übernommen.

- h3 (Zitat): `„Allein ist man gut, als Team unschlagbar“`
- Text:
  > Unsere Mitarbeiter sind nicht nur Arbeitskräfte, sondern essentielle Mitgestalter unseres Erfolgs. Wir schaffen eine Umgebung, die Kreativität und persönliches Wachstum fördert. Die Fähigkeiten unserer hochqualifizierten Fachkräfte, ihr Engagement und ihre langjährige Erfahrung im Bereich Zerspanung sind der Schlüssel zu unserem Wettbewerbsvorteil. Gerne bieten wir Ihnen auch eine professionelle Beratung für Ihre Projekte an und garantieren durch unsere Expertise für qualitativ hochwertige Ergebnisse.

### ④ Qualität und Zertifizierung
- h2: `Qualität und Zertifizierung`
- Text:
  > Wir legen größten Wert auf Qualitätssicherung. Unsere Prozesse sind nach den neuesten Standards zertifiziert. Dadurch stellen wir sicher, dass jede Komponente, die unsere Fertigung verlässt, höchsten Qualitätsansprüchen genügt. Wir sind stolz darauf, nach ISO 9001 zertifiziert zu sein.
- Button: `[ Download ]` → **`#` (tot)**
- Bild: `Schoebel-Zertifikat-2024-1.png`, alt=`ISO 9001 Zertifikat`, dargestellt 724×1024

**Zertifikatsinhalt (aus dem Bild ausgelesen, verbatim):**
```
Zertifikat / Certificate
DSR CERTIFICATION

Schöbel Hermann CNC Frästechnik GmbH
Wiegenfeldring 4, D-85570 Markt Schwaben

wurde durch DSR-CERTIFICATION auditiert und es wird bestätigt, dass das
Qualitäts-Management-System den Erfordernissen der
is audited by DSR Certification and applied that the Quality Management System meets the requirements of

ISO 9001:2015

Norm für den nachfolgenden Umfang entspricht:
standard for the following activities:

Spanabhebende Bearbeitung von Metallen und Kunststoffen
mittels CNC gestützter Dreh- und Frästechnologie sowie Baugruppenmontage
Machining of Metals and Plastics by means of CNC-supported Turning and
Milling Technology as well as Component Assembly

Zertifikats-Nr./Certificate No: QMS-22.12.408

Zertifikats-Datum / Certificate Date:            30.05.2023
Endgültiges Ausstellungs-Datum / Last Issue Date: 27.05.2024
Zertifikat gültig bis / Certificate Expiry Date:  26.05.2025

3 Jahre/Years Zertifizierungs-Periode        EA-Code: 14/17

Siegel: DSR CERTIFICATION (ISO 9001:2015 CERTIFIED) · IAF (Member of Multilateral
Recognition Arrangement) · IAS ACCREDITED Management Systems Certification Body MSCB-134

DSR TEKNIK MUAYENE SERTIFIKASYON HIZ. LTD.ŞTI
Yesilbağlar Mah. Selvili Sk. Helis Beyaz Ofis 2/1 A Blok No:207 PENDIK/ISTANBUL/TÜRKIYE
Tel: +90 216 606 06 35 · E-mail: info@dsrbelgelendirme.com.tr · Web: www.dsrbelgelendirme.com.tr
```

### ⑤ Unsere Werte
- h2: `Unsere Werte`
- Vier Absätze (auf der Live-Seite ohne Zwischenüberschriften; inhaltlich: Innovation, Nachhaltigkeit, Flexibilität, Exzellenz):
  > Innovation und technologischer Fortschritt sind Eckpfeiler unserer Unternehmung. Wir investieren kontinuierlich in hochmoderne CNC-Technologien und Automation, um nicht nur mit der Zeit Schritt zu halten, sondern sie aktiv mitzugestalten. Unsere Fähigkeit, uns anzupassen und vorauszudenken, macht uns zu einem führenden Akteur in der Branche.
  >
  > Wir sind uns unserer Verantwortung gegenüber der Umwelt und der Gesellschaft bewusst. Nachhaltige Fertigungspraktiken und Ressourceneffizienz sind integraler Bestandteil unseres Handelns. Wir streben danach, einen positiven Einfluss auf die Welt um uns herum auszuüben.
  >
  > Die Welt verändert sich ständig, und wir passen uns an. Unsere Flexibilität ermöglicht es uns, uns schnell an neue Anforderungen, Technologien und Marktbedingungen anzupassen. Wir sehen Veränderungen nicht als Hindernisse, sondern als Chancen.
  >
  > Die ständige Suche nach Exzellenz treibt uns an. Jedes gefertigte Teil trägt die Handschrift unseres Engagements für Qualität und Präzision. – wir sind Stolz auf unsere Produkte, was uns dazu anspornt, dieses hohe Niveau aufrecht zu erhalten.

### ⑥ Geschäftsführung (2 Portraits, Bilder mit Lightbox-Link)
- h2: `Martin Herzog` — Bild `Geschaeftsfuehrung-Schoebel_Martin-Herzog.jpg` (Studioportrait, weißes Hemd, blau-grauer Hintergrund)
- h2: `Johannes Seilbeck` — Bild `Geschaeftsfuehrung-Schoebel_Johannes-Seilbeck.jpg` (Studioportrait, weißes Hemd, blau-grauer Hintergrund)

### ⑦ Firmenhistorie (Timeline, jede Jahreszahl h3, alle als `<a href="#">`)
Einleitungstext wiederholt wortgleich den „Über uns"-Text (Duplicate Content).

| Datum | Ereignis |
|---|---|
| 07.04.2025 | Neue Koordinatenmessmaschine: Mitutoyo CRYSTA-APEX |
| 01.06.2023 | Maschinenzuwachs: Hermle C22 Dynamic inkl. Roboter-Automation |
| 30.05.2023 | 20-jähriges Firmenjubiläum |
| 25.05.2023 | Einführung ISO 9001 |
| 01.10.2022 | Firmenübernahme durch Martin Herzog und Johannes Seilbeck |
| 15.10.2021 | Einführung Roboter-Automation |
| 2018 | Erweiterung der Produktionsstätte und Anschaffung Trowalisierungsanlage |
| 2014 | 5-Achs-Bearbeitungszentrum mit Simultanbearbeitung |
| 2011 | Einführung CAM-Programmierung |
| 2008 | 3-Achs-Bearbeitungszentrum |
| 2006 | Umzug in größeres Gebäude mit Erweiterung des Maschinenparks |
| 30.05.2003 | Firmengründung durch Hermann Schöbel |

*Icon je Timeline-Eintrag: `Schoebel_Icon.png` (28×24), alt=`\n`*

### ⑧ CTA „Ihr individuelles Angebot" → siehe 2.3
### ⑨ Footer → siehe 2.4

---

## 6. SEITE 4 — MASCHINENPARK (`/maschinenpark/`)

**Meta**
- `<title>`: `Maschinenpark - Schöbel CNC`
- `description`: `Mit einem fortschrittlichen Maschinenpark setzen wir auf moderne CNC-Technologie. Dies ermöglicht höchste Präzision und eine effiziente Umsetzung Ihrer Aufträge.`
- kein `og:image`
- Seitenhöhe Desktop: **5.256 px**

### ① Kopf
- h1: `Maschinenpark`
- Text:
  > Mit einem fortschrittlichen Maschinenpark setzen wir auf modernste CNC-Technologie. Dies ermöglicht nicht nur höchste Präzision, sondern auch eine effiziente Umsetzung Ihrer Aufträge.

### ② h2: `Bearbeitungszentren`

#### Maschine 1 — h3: `Hermle C22U Dynamic mit Roboter System Sherpa M25`
*(3 Tabellen in einem Slider mit Pfeilen/Bullets)*

**Tabelle „Fräsmaschine"**
| Merkmal | Wert |
|---|---|
| Baujahr | 2023 |
| Steuerung | Heidenhain TNC 640 |
| Verfahrwege X/Y/Z (mm) | 450/600/330 |
| Vorschub (m/min) | 50 |
| Spindeldrehzahl (U/min) | 18.000 |
| Werkzeugmagazin Plätze | 55 |
| Messtechnik | Blum Laser zur Werkzeugvermessung<br>Messtaster zur Bauteilvermessung |
| Sonstiges | Innere Kühlmittelzufuhr sowie innere Blasluft<br>Simultanbearbeitung möglich (Torqueantrieb in C- Achse)<br>Nullpunktspannsystem |

**Tabelle „Automation" (Slide 1)**
| Merkmal | Wert |
|---|---|
| Typ | Sherpa M25 |
| Art | Rohteilhandling |
| Bauteilgröße X/Y/Z (mm) | bis 250/200/200 |
| Max. Bauteilgewicht (kg) | 18 |
| Sonstiges | OP20 durch Ausrichtstation möglich Automatische Teilereinigung |

**Tabelle „Automation" (Slide 2)**
| Merkmal | Wert |
|---|---|
| Typ | Sherpa M25 |
| Art | Rohteilhandling |
| Bauteilgröße X/Y/Z (mm) | 250/200/200 |
| Max. Bauteilgewicht X/Y/Z (mm) *(Einheitenfehler im Original)* | 12 |
| Sonstiges | OP20 durch Ausrichtstation möglich |

#### Maschine 2 — h2: `GF HEM 500U mit Roboter System Sherpa M20`
**Tabelle „Fräsmaschine"**
| Merkmal | Wert |
|---|---|
| Baujahr | 2015 |
| Steuerung | Heidenhain iTNC 530 |
| Verfahrwege X/Y/Z (mm) | 500/450/400 |
| Vorschub (m/min) | 30 |
| Spindeldrehzahl (U/min) | 20.000 |
| Werkzeugmagazin Plätze | 60 |
| Messtechnik | Blum Laser zur Werkzeugvermessung<br>Messtaster zur Bauteilvermessung |
| Sonstiges | Innere Kühlmittelzufuhr sowie innere Blasluft<br>Simultanbearbeitung möglich (Torqueantrieb in der B- und C- Achse)<br>Nullpunktspannsystem |

#### Maschine 3 — h2: `GF VCE1000 Pro`
**Tabelle „Bearbeitungszentrum"**
| Merkmal | Wert |
|---|---|
| Baujahr | 2017 |
| Steuerung | Heidenhain TNC 620 |
| Verfahrwege X/Y/Z (mm) | 1020/560/600 |
| Vorschub (m/min) | 40 |
| Spindeldrehzahl (U/min) | 16.000 |
| Werkzeugmagazin Plätze | 40 |
| Messtechnik | Integrierte Werkzeugvermessung von Renishaw<br>Messtaster zur Bauteilvermessung |
| Sonstiges | Innere Kühlmittelzufuhr sowie innere Blasluft |

#### Maschine 4 — h2: `Mikron VCE1000 Pro-x`
**Tabelle „Bearbeitungszentrum"**
| Merkmal | Wert |
|---|---|
| Baujahr | 2008 |
| Steuerung | Heidenhain iTNC 530 |
| Verfahrwege X/Y/Z (mm) | 1020/560/600 |
| Vorschub (m/min) | 36 |
| Spindeldrehzahl (U/min) | 16.000 |
| Werkzeugmagazin Plätze | 24 |
| Messtechnik | Integrierte Werkzeugvermessung von Renishaw<br>Messtaster zur Bauteilvermessung |
| Sonstiges | Innere Kühlmittelzufuhr<br>3+2 Achsen durch Lehmann Zusatztisch |

#### Maschine 5 — h2: `Mikron VCE800W Pro`
**Tabelle „Bearbeitungszentrum"**
| Merkmal | Wert |
|---|---|
| Baujahr | 2006 |
| Steuerung | Heidenhain iTNC 530 |
| Verfahrwege X/Y/Z (mm) | 860/560/600 |
| Vorschub (m/min) | 24 |
| Spindeldrehzahl (U/min) | 14.000 |
| Werkzeugmagazin Plätze | 24 |
| Messtechnik | Integrierte Werkzeugvermessung von Renishaw<br>Messtaster zur Bauteilvermessung |
| Sonstiges | Innere Kühlmittelzufuhr sowie innere Blasluft |

### ③ h2: `Sägen`
#### h2: `Berg & Schmid GBS 230/60 VA-I`
- Vollautomatisch / CNC gesteuert
- Zuschnitt für Stahl, Edelstahl, Aluminium uvm.
- Schnittgeschwindigkeit 25 bis 120 m/min
- Stufenlose Vorschubregelung

### ④ h2: `Gleitschleifmaschinen`
#### h2: `Assfalg TV 95`
- Entgraten, Polieren und Veredeln von Oberflächen
- Füllvolumen 70l
- Inkl. Wasserfilteranlage

> **Anmerkung:** Die auf der Unternehmens-Timeline für 07.04.2025 genannte **Koordinatenmessmaschine Mitutoyo CRYSTA-APEX** fehlt im Maschinenpark komplett.

### ⑤ Unsere Projekte
- h2: `Unsere Projekte`
- Text:
  > Zu unseren Kunden zählen namhafte Unternehmen der verschiedensten Branchen wie z.B. der Medizintechnik, der Konsumgüterindustrie, des Anlagen- und Maschinenbau sowie der optischen Industrie.
- Slider — **aktuell komplett leer** (CSS 404)
- Button: `[ Unverbindlich anfragen ]` → `/kontakt/`

### ⑥ Footer → siehe 2.4

---

## 7. SEITE 5 — KONTAKT (`/kontakt/`)

**Meta**
- `<title>`: `Kontakt - Schöbel CNC`
- `description`: `Wir freuen uns darauf, mit Ihnen zusammenzuarbeiten und Ihnen hochwertige Bauteile für Ihre anspruchsvollsten Anwendungen zu liefern. Kontaktieren Sie uns gerne.`
- Seitenhöhe Desktop: **1.727 px**

### ① Hero *(Hintergrundbild `Hermle_Automation_Kontakt.jpg` — Innenraum der grünen Hermle mit Robotergreifer)*
- h1: `Ihr Partner für`
- h1: `Zerspanung`

### ② Kontakt
- h2: `Kontakt`
- Text:
  > Wir freuen uns darauf, mit Ihnen zusammenzuarbeiten und Ihnen hochwertige Bauteile für Ihre anspruchsvollsten Anwendungen zu liefern.
  >
  > Kontaktieren Sie uns gerne unkompliziert – wir stehen Ihnen mit Rat und Tat zur Seite.
  >
  > Nutzen Sie gerne das nachfolgende Kontaktformular, rufen Sie an (+49 8121 93 000) oder schreiben Sie uns eine E-Mail (schoebel@cnc-schoebel.de).
  > Wir kümmern uns umgehend um Ihr Anliegen!

- h3: `So kommen Sie zu uns`
  ```
  Schöbel Hermann CNC Frästechnik GmbH
  Wiegenfeldring 4
  85570 Markt Schwaben
  ```
  *(keine Karte, keine Anfahrtsbeschreibung, keine Öffnungszeiten)*

### ③ Kontaktformular
- h2: `Kontaktformular`
- Text:
  > In unter 24h Ihr individuelles Angebot zum gewünschten Bauteil! Senden Sie uns hierzu bitte eine Zeichnung (PDF) sowie die 3D-Daten zu, damit wir uns um Ihr Anliegen kümmern können. Wir können alle gängigen Datentypen einlesen, darunter Standards wie STEP-Dateien sowie Rohdaten aus den folgenden CAD-Programmen: CATIA V4, V5, V6 / SolidWorks / Solid Edge / Inventor / Modelldateien PTC CREO / JT / Rhino-Modelldateien / Siemens NX / Wavefront OBJ.

**Formularfelder (Elementor-Pro-Form, `method=post`):**

| Label | Placeholder | Typ | Feldname | Pflicht |
|---|---|---|---|---|
| Name | `Name*` | text | `form_fields[name]` | ja |
| E-Mail | `E-Mail*` | email | `form_fields[email]` | ja |
| Telefonnummer | `Telefonnummer` | tel | `form_fields[number]` | nein |
| Betreff | `Betreff*` | text | `form_fields[betreff]` | ja |
| Nachricht | `Nachricht*` | textarea | `form_fields[message]` | ja |
| *(ohne Label)* | — | file (Upload) | `form_fields[datei]` | nein |

- Submit-Button: `Senden`
- Hinweistext unter dem Formular:
  > Wir versichern Ihnen, dass Ihre Daten ausschließlich für die Prüfung der Machbarkeit bzw. die Kalkulation Ihres Auftrags verwendet werden. Sollte es nicht zu einer Auftragserteilung kommen, werden Ihre Daten umgehend gelöscht.
- **Keine DSGVO-Checkbox / kein Consent-Feld im Formular.**
- Hintergrund-Band unterhalb: `Schoebel_Projekte8.jpg`

### ④ Footer → siehe 2.4

---

## 8. SEITE 6 — IMPRESSUM (`/impressum/`) — Firmendaten verbatim

```
Impressum                                            (h1)

Schöbel Hermann CNC Frästechnik GmbH
Wiegenfeldring 4
85570 Markt Schwaben

Handelsregister: HRB 148536
Registergericht: Amtsgericht München

Vertreten durch:
Johannes Seilbeck
Martin Herzog

Kontakt                                              (h2)
Telefon: +49 8121 93000
Telefax: +49 8121 93008
E-Mail: schoebel@cnc-schoebel.de

Umsatzsteuer-ID                                      (h2)
Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
DE229129476

Redaktionell verantwortlich                          (h2)
Johannes Seilbeck
Martin Herzog
Wiegenfeldring 4
85570 Markt Schwaben

Verbraucherstreitbeilegung/Universalschlichtungsstelle  (h2)
Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
vor einer Verbraucherschlichtungsstelle teilzunehmen.
```

### Konsolidierte Firmendaten für den Relaunch

| Feld | Wert |
|---|---|
| **Vollständiger Firmenname** | Schöbel Hermann CNC Frästechnik GmbH |
| *Schreibvariante auf /unternehmen/* | „Hermann Schöbel CNC Frästechnik GmbH" |
| **Marke / Wortmarke** | SCHÖBEL CNC |
| **Straße** | Wiegenfeldring 4 |
| **PLZ / Ort** | 85570 Markt Schwaben |
| **Land** | Deutschland (Bayern, Lkr. Ebersberg) |
| **Telefon** | +49 8121 93 000 *(im Impressum ohne Leerzeichen: +49 8121 93000)* |
| **Telefax** | +49 8121 93008 |
| **E-Mail** | schoebel@cnc-schoebel.de |
| **Geschäftsführer** | Johannes Seilbeck, Martin Herzog (seit 01.10.2022) |
| **Gründer** | Hermann Schöbel (Gründung 30.05.2003) |
| **Handelsregister** | HRB 148536 |
| **Registergericht** | Amtsgericht München |
| **USt-IdNr.** | DE229129476 |
| **Zertifizierung** | ISO 9001:2015, Zert.-Nr. QMS-22.12.408 (DSR Certification), gültig 30.05.2023 – **26.05.2025** |
| **Öffnungszeiten** | ❌ nirgends auf der Website angegeben |
| **Social Media** | ❌ keine echten Profile (Icons zeigen auf `#`) |
| **YouTube-Kanal** | „Schoebel CNC" (Hero-Video, hochgeladen 13.08.2024) |

### Zahlen & Fakten (alle Zahlen der Website, gesammelt)
| Kennzahl | Wert | Quelle |
|---|---|---|
| Erfahrung | „seit nun mehr als 20 Jahren" / „über 20 Jahre" | Start, Produktion |
| Maschinenstunden Kapazität (Jahr) | 15.073 | Start |
| Produzierte Kundenteile (Jahr) | 27.473 | Start |
| Automatisierte Produktion | 9.072 h/Jahr | Start |
| CAM Programmierplätze | 4 | Start |
| Max. Serienlos Fräsen | bis 50.000 Stück | Produktion |
| Max. Serienlos Drehen | bis 10.000 Stück | Produktion |
| Automatisierte Fertigung ab | 12 Stück | Produktion |
| Max. Bauteilgröße Automation | 250 × 200 × 200 mm | Produktion / Maschinenpark |
| Max. Bauteilgewicht Automation | 18 kg (bzw. 12 in 2. Tabelle) | Produktion / Maschinenpark |
| 5-Achs-Verfahrweg | 550 × 450 × 400 mm | Produktion |
| 3-Achs-Verfahrweg | 1000 × 550 × 500 mm | Produktion |
| Drehteile bis | Ø 250 mm | Produktion |
| Höchste Spindeldrehzahl | 20.000 U/min (GF HEM 500U) | Maschinenpark |
| Größtes Werkzeugmagazin | 60 Plätze (GF HEM 500U) | Maschinenpark |
| Angebotszusage | „in unter 24h" | Start, Produktion, Unternehmen, Kontakt |
| CAM seit | „mehr als 10 Jahren" (hyperMILL) | Produktion |
| Gleitschleif-Füllvolumen | 70 l | Maschinenpark |
| Sägen-Schnittgeschwindigkeit | 25–120 m/min | Maschinenpark |
| Urlaubstage | 30 Tage | Unternehmen/Karriere |
| Wochenendbeginn | Freitag ab 12:00 Uhr | Unternehmen/Karriere |

### Materialien (konsolidiert)
- **NE-Metalle:** Aluminium, Titan, Messing, Bronze
- **Eisenmetalle:** Edelstahl, Automatenstahl, Einsatzstahl, normaler Stahl
- **Kunststoffe:** POM, PEEK, PET, PTFE, Lauramid, PA6 u.v.m.

### Zielbranchen (wörtlich)
> Medizintechnik, Konsumgüterindustrie, Anlagen- und Maschinenbau, optische Industrie

### Akzeptierte CAD-Formate (wörtlich)
> STEP-Dateien sowie Rohdaten aus: CATIA V4, V5, V6 / SolidWorks / Solid Edge / Inventor / Modelldateien PTC CREO / JT / Rhino-Modelldateien / Siemens NX / Wavefront OBJ

### Eingesetzte Software / Systeme
- **hyperMILL** (High-End-CAD/CAM, „Hypermill" auf der Seite geschrieben) — seit >10 Jahren
- **Heidenhain** TNC 640 / TNC 620 / iTNC 530 Steuerungen
- **Blum** Laser-Werkzeugvermessung, **Renishaw** Werkzeugvermessung, Messtaster
- **Lang** Nullpunktspannsystem (auf Fotos sichtbar)
- **Sherpa M25 / M20** Roboter-Automation
- **Mitutoyo CRYSTA-APEX** Koordinatenmessmaschine (nur in der Timeline erwähnt)
- **Lehmann** Zusatztisch (3+2 Achsen)

---

## 9. SEITE 7 — DATENSCHUTZ (`/datenschutz/`)

Standard-Datenschutzerklärung (eRecht24-Stil), **8.662 px** hoch. Vollständiger Text in `cnc-data/datenschutz.txt`.

**Struktur:**
- h1 `Datenschutz­erklärung`
- h2 `1. Datenschutz auf einen Blick` → h3 Allgemeine Hinweise · h3 Datenerfassung auf dieser Website (h4 Wer ist verantwortlich… / Wie erfassen wir… / Wofür nutzen wir… / Welche Rechte haben Sie…)
- h2 `2. Hosting` → h3 **Strato** (h4 Auftragsverarbeitung)
- h2 `3. Allgemeine Hinweise und Pflicht­informationen` → h3 Datenschutz · Hinweis zur verantwortlichen Stelle · Speicherdauer · Rechtsgrundlagen · Empfänger von personenbezogenen Daten · Widerruf · Widerspruchsrecht (Art. 21 DSGVO) · Beschwerderecht · Datenübertragbarkeit · Auskunft, Berichtigung, Löschung · Einschränkung der Verarbeitung · SSL-/TLS-Verschlüsselung
- h2 `4. Datenerfassung auf dieser Website` → h3 Cookies · **Einwilligung mit Borlabs Cookie** · Anfrage per E-Mail, Telefon oder Telefax
- h2 `5. Plugins und Tools` → h3 **YouTube mit erweitertem Datenschutz** · **Adobe Fonts**
- h2 `6. eCommerce und Zahlungs­anbieter` → h3 Verarbeiten von Kunden- und Vertragsdaten
- h2 `7. Eigene Dienste` → h3 Umgang mit Bewerberdaten (h4 Umfang und Zweck der Datenerhebung / h4 Aufbewahrungsdauer der Daten)

**Verantwortliche Stelle (verbatim):**
```
Schöbel Hermann CNC Frästechnik GmbH
Wiegenfeldring 4
85570 Markt Schwaben

Telefon: +49 8121 93 000
E-Mail: schoebel@cnc-schoebel.de
```
*(Im Quelltext fehlt der Zeilenumbruch: „…GmbHWiegenfeldring 4" — Darstellungsfehler.)*

**Hoster (verbatim):** „Anbieter ist die Strato AG, Otto-Ostrowski-Straße 7, 10249 Berlin (nachfolgend „Strato")."

> **Hinweis:** In der Datenschutzerklärung sind **Adobe Fonts** aufgeführt. Faktisch lädt die Seite aber Google Fonts (Roboto, Montserrat, Poppins, lokal gespiegelt) und die selbst gehosteten TTF-Dateien der Schrift **Prompt** — Adobe Fonts ist nicht (mehr) im Einsatz. Nicht gelistet, aber vorhanden: Elementor / WP-eigene Assets.

---

## 10. MEDIEN-INVENTAR

### 10.1 Hero-Video ✅ HERUNTERGELADEN

Auf der **Startseite** ist der Hero-Hintergrund ein **YouTube-Embed** (kein `<video>`-Tag, keine selbst gehostete MP4-Datei auf der Domain).

| Feld | Wert |
|---|---|
| Element | `<iframe class="elementor-background-video-embed">` |
| Titel | **Schöbel CNC Intro** |
| Embed-URL | `https://www.youtube.com/embed/zeXl8Qu27fY?controls=0&rel=0&playsinline=1&cc_load_policy=0&enablejsapi=1&origin=https%3A%2F%2Fcnc-schoebel.de` |
| Video-ID | `zeXl8Qu27fY` |
| Kanal | Schoebel CNC |
| Upload | 13.08.2024 |
| Parameter | `controls=0`, `rel=0`, `playsinline=1` — Elementor spielt es autoplay + loop + stummgeschaltet ab |
| Fallback-Bild | `Schoebel_Zerspanung_Start.jpg` (CSS-Background derselben Sektion, 1920×1080) |
| **Heruntergeladen als** | `_analysis/assets/cnc/cnc-hero-video-zeXl8Qu27fY.mp4` |
| **Größe** | **25.986.426 Bytes ≈ 24,8 MB** |
| **Dauer** | **49 Sekunden** |
| **Auflösung / FPS** | **1920×1080, 24 fps** (H.264 + AAC) |
| Zusatzdateien | `cnc-hero-video-zeXl8Qu27fY.webp` (Thumbnail, 55 KB), `cnc-hero-video-zeXl8Qu27fY.info.json` (Metadaten) |
| Inhalt | Fahrt durch die Fertigung: Werkzeugmagazin, Roboter-Beladung (Sherpa), Fräsbearbeitung mit Kühlmittel, fertige Bauteile |

**Keine weiteren `<video>`- oder `<iframe>`-Elemente auf irgendeiner Seite.**

### 10.2 Bilder pro Seite

Alle Assets liegen unter `https://cnc-schoebel.de/wp-content/uploads/…`. **Alt-Texte sind mit einer Ausnahme leer.**

#### Startseite
| Position | Typ | Datei | Alt | Motiv |
|---|---|---|---|---|
| Header | `<img>` | `2024/05/Schoebel-CNC_Logo-1536x474.png` | `""` | Wortmarke SCHÖBEL CNC weiß + Flammen-/Spiral-Signet |
| Hero | CSS-BG | `2024/06/Schoebel_Zerspanung_Start.jpg` (1920×1080) | – | 5-Achs-Fräsbearbeitung unter Kühlmittelschwall, Lang-Nullpunktspanner auf Rundtisch |
| §2 rechts | `<img>` 400×600 | `2024/06/Schoebel_Automation.jpg` | `""` | Sherpa-Roboter vor MIKRON HEM 500U, blauer Rollwagen mit Alu-Rohteilen |
| §3 links | `<img>` 400×600 | `2024/06/Schoebel_Hermle_Aluminium.jpg` | `""` | Großes gefrästes Alu-Gehäuse auf blauem Lang-Spannsystem, Rundtisch |
| §5 Kachel 1 | CSS-BG | `2024/06/Schoebel_Zerspanung_Start.jpg` | – | s.o. |
| §5 Kachel 2 | CSS-BG | `2024/05/Schoebel_Oberflaechenbearbeitung.jpg` | – | Vier schwarz eloxierte U-förmige Alu-Halter |
| §5 Kachel 3 | CSS-BG | `2024/06/Schoebel_CNC_Baugruppenmontage.jpg` | – | Drehmomentschlüssel + Steckschlüsseleinsätze im Schaumstoff-Inlay |
| §5 Kachel 4 | CSS-BG | `2024/06/Schoebel_Service.jpg` | – | Maschinen-Bedienpult mit Monitoring-Dashboard (Datum 2024/06/17 09:00:30) |
| §6 Slider | CSS-BG ×9 | `2024/06/Schoebel_Projekte1…9.jpg` | – | siehe Tabelle unten |
| CTA | `<img>` 400×400 | `2024/06/Schoebel_Icon.png` | `""` | Schöbel-Signet (schwarz/grau/rot geschwungene Bänder) |
| Footer | `<img>` 299×92 | `2024/05/Schoebel-CNC_Logo.png` | `""` | Logo |

**Projekte-Slider (Startseite, Ken-Burns) — Motive:**
| Datei | Motiv |
|---|---|
| `Schoebel_Projekte1.jpg` | Edelstahl-Gehäuse mit gebohrtem Lochraster-Deckel |
| `Schoebel_Projekte2.jpg` | Vier Alu-Spannbacken/Prismen-Blöcke mit V-Nut |
| `Schoebel_Projekte3.jpg` | Gruppe gefräster Alu-Gehäuseschalen mit Taschen und Rippen |
| `Schoebel_Projekte4.jpg` | Großes Alu-Rad/Sternteil mit radialen Speichen und Taschen |
| `Schoebel_Projekte5.jpg` | Zwei zylindrische Alu-Gehäuse mit Fenstern und Bohrbildern |
| `Schoebel_Projekte6.jpg` | Alu-Riemenscheibe/Rotor mit Verzahnung und vier Durchbrüchen |
| `Schoebel_Projekte7.jpg` | Vier rechteckige Alu-Formeinsätze / Werkzeugplatten |
| `Schoebel_Projekte8.jpg` | Serie gedrehter Alu-Flansche mit Lochkreis (Massenfertigung) |
| `Schoebel_Projekte9.jpg` | Edelstahl-Kettenrad (ca. 22 Zähne) |

#### Produktion
| Position | Typ | Datei | Motiv |
|---|---|---|---|
| Hero | CSS-BG-Slideshow | `2024/05/Schoebel_Bauteile_Fertigung.jpg` | Reihen glänzender gedrehter Alu-Buchsen auf Spannplatten |
| CNC-Fräsen | CSS-BG | `2024/06/Schoebel_CNC-Fraesen.png` | Fräser im Eingriff, starke Kühlmittelflutung |
| CAM | CSS-BG | `2024/06/Schoebel_CAM-Programmierung.png` | Programmierer am Doppelmonitor mit CAM-Simulation (grünes Bauteilmodell) |
| CNC-Drehen | CSS-BG | `2024/07/Schoebel_CNC-Drehen.jpg` | Wabenraster glänzender gedrehter Alu-Töpfe |
| Serienfertigung | CSS-BG | `2024/06/Schoebel_Serienfertigung.jpg` | Reihen identischer Alu-Winkelteile auf Palette |
| Lager auf Abruf | CSS-BG | `2024/06/Schoebel_Lager.png` | Nummerierte Lagerregale mit Sichtlagerkästen (25–30) |
| Zuschnitt | CSS-BG | `2024/06/Schoebel_Zuschnitt.png` | CNC-Bandsäge schneidet Stahlprofil unter Kühlmittelstrahl |
| Mech. Oberfläche | CSS-BG | `2024/07/Schoebel_Gleitschleifen_Aluminium.jpg` | Alu-Bauteil mit graviertem Schöbel-Logo in Gleitschleif-Chips |
| Chem. Oberfläche | CSS-BG | `2024/07/Schoebel_chemische_Oberflaechenbearbeitung.jpg` | Edelstahl-Gehäuse mit perforierter Innenwanne |
| Galerie 1 | `<img>` (300×200 + Lightbox) | `2024/07/Schoebel_Pnaumatikanlage.jpg` | Blaue Pneumatikschläuche mit Filtern an Profilschiene |
| Galerie 2 | `<img>` | `2024/07/Schoebel_Vorrichtungsbau.jpg` | Alu-Vorrichtung mit vielen Spannpratzen/Rändelschrauben |
| Galerie 3 | `<img>` | `2024/07/Schoebel_Baugruppe_Getriebe.jpg` | Welle mit Messing-Schneckenrad und Lagerflansch |
| Galerie 4 | `<img>` | `2024/07/Schoebel_Lagerblock.jpg` | Edelstahl-Lagerblock mit Kugellagern und Bronzebuchse |
| Fertigungsteile-Slider | – | **fehlt (CSS 404)** | – |
| CTA | `<img>` | `2024/06/Schoebel_Icon.png` | Signet |

#### Unternehmen
| Position | Typ | Datei | Alt | Motiv |
|---|---|---|---|---|
| Hero | CSS-BG | `2024/05/Schoebel_Fertigung_Kontakt.jpg` | – | Roboterarm greift Alu-Rohteile aus Raster, MIKRON HEM 500U im Hintergrund |
| Zertifikat | `<img>` 724×1024 | `2024/08/Schoebel-Zertifikat-2024-1.png` | `ISO 9001 Zertifikat` | DSR-Zertifikat (siehe §5 ④) |
| Timeline ×12 | `<img>` 28×24 | `2024/06/Schoebel_Icon.png` | `\n` | Signet als Timeline-Marker |
| Portrait 1 | `<img>` | `2024/07/Geschaeftsfuehrung-Schoebel_Martin-Herzog.jpg` | `""` | Studioportrait, weißes Hemd, blau-grauer Verlauf |
| Portrait 2 | `<img>` | `2024/07/Geschaeftsfuehrung-Schoebel_Johannes-Seilbeck.jpg` | `""` | Studioportrait, weißes Hemd, blau-grauer Verlauf |
| CTA | `<img>` 400×400 | `2024/06/Schoebel_Icon.png` | `""` | Signet |

#### Maschinenpark
**Aktuell keine Inhaltsbilder** (nur Logo im Header/Footer). Der Projekte-Slider ist wegen CSS-404 leer.

#### Kontakt
| Position | Typ | Datei | Motiv |
|---|---|---|---|
| Hero | CSS-BG | `2024/08/Hermle_Automation_Kontakt.jpg` | Innenraum der grünen Hermle mit Robotergreifer und Schlauchpaket |
| Band unten | CSS-BG | `2024/06/Schoebel_Projekte8.jpg` | Serie gedrehter Alu-Flansche |

#### Impressum / Datenschutz
Nur Logo (Header/Footer). Auf `/datenschutz/` wird das Footer-Logo als leerer SVG-Platzhalter geladen (Lazy-Load bricht ab).

### 10.3 Favicons
- `2024/06/cropped-Favicon_Schoebel-32x32.jpg` (32×32)
- `2024/06/cropped-Favicon_Schoebel-192x192.jpg` (192×192)
- `2024/06/cropped-Favicon_Schoebel-180x180.jpg` (Apple Touch Icon)
- `2024/06/cropped-Favicon_Schoebel-270x270.jpg` (msapplication-TileImage)
> ⚠️ Favicon ist ein **JPG** (kein PNG/SVG, kein transparenter Hintergrund).

### 10.4 Heruntergeladene Assets (`_analysis/assets/cnc/`)

**38 Dateien, ~4,0 MB Bilder + 24,8 MB Video = 28,8 MB gesamt**

| Datei | Bytes |
|---|---|
| cnc-hero-video-zeXl8Qu27fY.mp4 | 25.986.426 |
| cnc-hero-video-zeXl8Qu27fY.webp (Thumb) | 55.468 |
| cnc-hero-video-zeXl8Qu27fY.info.json | 50.802 |
| Schoebel-CNC_Logo.png | 55.556 |
| Schoebel_Icon.png | 4.184 |
| cropped-Favicon_Schoebel.jpg | 13.494 |
| **Prompt-Bold.ttf** | 172.528 |
| **Prompt-Light.ttf** | 155.724 |
| Schoebel_Zerspanung_Start.jpg | 258.342 |
| Schoebel_Bauteile_Fertigung.jpg | 249.415 |
| Schoebel_Fertigung_Kontakt.jpg | 255.824 |
| Hermle_Automation_Kontakt.jpg | 225.408 |
| Schoebel_Automation.jpg | 60.431 |
| Schoebel_Hermle_Aluminium.jpg | 58.080 |
| Schoebel_Oberflaechenbearbeitung.jpg | 146.026 |
| Schoebel_CNC_Baugruppenmontage.jpg | 293.829 |
| Schoebel_Service.jpg | 208.040 |
| Schoebel_CNC-Fraesen.png | 82.017 |
| Schoebel_CAM-Programmierung.png | 60.435 |
| Schoebel_CNC-Drehen.jpg | 47.824 |
| Schoebel_Serienfertigung.jpg | 34.953 |
| Schoebel_Lager.png | 120.029 |
| Schoebel_Zuschnitt.png | 85.294 |
| Schoebel_Gleitschleifen_Aluminium.jpg | 130.172 |
| Schoebel_chemische_Oberflaechenbearbeitung.jpg | 32.337 |
| Schoebel_Baugruppe_Getriebe.jpg | 37.145 |
| Schoebel_Lagerblock.jpg | 20.460 |
| Schoebel_Pnaumatikanlage.jpg | 144.156 |
| Schoebel_Vorrichtungsbau.jpg | 63.815 |
| Schoebel_Projekte1–9.jpg | 26.758 / 44.625 / 49.227 / 43.614 / 29.691 / 44.020 / 62.881 / 95.635 / 28.777 |
| Geschaeftsfuehrung-Schoebel_Martin-Herzog.jpg | 25.083 |
| Geschaeftsfuehrung-Schoebel_Johannes-Seilbeck.jpg | 23.667 |
| Schoebel-Zertifikat-2024-1.png | 494.805 |

---

## 11. DESIGN-AUDIT DER BESTEHENDEN SEITE

### 11.1 Farbpalette (aus dem Elementor-Kit `post-7.css` und den gemessenen Computed Styles)

| Rolle | Hex | Verwendung |
|---|---|---|
| **Primär / Akzent (Rot)** | `#930000` | Hero-Textbalken, Überschriften „Unsere Projekte", Counter-Zahlen, aktive Menüpunkte, Button-Text, Button-Hover-Fläche, Link-Hover, Page-Transition |
| **Schwarz** | `#000000` | Header-Leiste, Body-Verlauf-Start, Formularlabels/-text |
| **Dunkelgrau** | `#333333` | Body-Verlauf-Ende, Footer-Verlauf-Ende |
| **Weiß** | `#FFFFFF` | Standard-Textfarbe, Überschriften, Button-Fläche, helle Sektionsflächen |
| Grau | `#414141` | vereinzelt Fließtext |
| *(Elementor-Defaults, ungewollt sichtbar)* | `#4054b2`, `#833ca3`, `#1abc9c` | Tabellenkopf „Fräsmaschine/Automation" im Maschinenpark, Cookie-Banner-Buttons — **entstehen nur, weil die Seiten-CSS fehlt** |

**Globale Hintergründe:**
- Body: `linear-gradient(135deg, #000000 0%, #333333 77%)`
- Footer: `linear-gradient(90deg, #000000 0%, #333333 77%)`

**Button-Style (global):** Fläche weiß, Text `#930000`, kein Rahmen, keine Rundung; Hover invertiert (Fläche `#930000`, Text weiß).

### 11.2 Typografie
| Rolle | Schrift | Gewicht |
|---|---|---|
| Body / Fließtext | **Prompt** (selbst gehostet, TTF) | 300 Light |
| h1–h5 | **Prompt** | 800 (nur 300 + 700 sind als Font-Files vorhanden → 800 wird **faux-bold** synthetisiert) |
| Links | Prompt | 300 |
| Elementor-Accent | Roboto | 500 |
| Footer-Image-Box-Titel | **Poppins** | 600, 65 px |
| Footer-Beschreibung | Poppins | 300, 16 px |
| vereinzelt | Montserrat | — |

**Gemessene Größen (Startseite):** Body 19,2 px / 400 (dominierend), Hero-Headline 69 px / 600, Sektionsüberschriften 32 px / 800 und 40 px / 800, Kleintext 16 px / 300, Footer-Spaltenköpfe 22 px / 600.

> **Problem:** Vier Schriftfamilien (Prompt, Roboto, Poppins, Montserrat) für eine 7-Seiten-Website. Poppins + Montserrat + Roboto werden über lokal gespiegelte Google-Fonts-CSS geladen und nur an wenigen Stellen benutzt — reine Ladezeit-Verschwendung. Prompt in nur zwei Schnitten (300/700) bei deklariertem Weight 800 → unsaubere Darstellung.

### 11.3 Layout
- Elementor-Container `max-width: 1140px` (Breakpoints 1024 / 767 px)
- Widget-Abstand global `20px`
- Header sticky mit `box-shadow: 0 5px 30px rgba(0,0,0,0.1)`, Z-Index 10
- Footer-Padding `5% / 8%`
- Struktur durchweg: **Hero mit zweizeiliger h1 → Textblock → Bild-/Textwechsel → CTA → Footer**
- Kein Grid-System jenseits von Elementor-Flexboxen, keine konsistente vertikale Rhythmik (Sektionshöhen zwischen ~200 px und ~1.000 px)

### 11.4 Sektionsreihenfolge im Überblick
| Seite | Reihenfolge |
|---|---|
| Start | Hero (Video) → Über-uns-Text + Bild → Produktion-Text + Bild → 4 Counter → 4 Leistungskacheln → Projekte-Slider → CTA → Footer |
| Produktion | Hero → Intro → Zerspanung + 6 Leistungsblöcke → Oberflächenbearbeitung (mech. + chem.) → Baugruppenmontage + 4er-Galerie → Service → Fertigungsteile-Slider → CTA → Footer |
| Unternehmen | Hero → Karriere (Stellenanzeige) → Über uns → Zitat → Qualität/Zertifikat → Werte → 2 Portraits → Timeline (12 Einträge) → CTA → Footer |
| Maschinenpark | Titel → Bearbeitungszentren (5 Maschinen, Tabellen) → Sägen → Gleitschleifmaschinen → Projekte-Slider → Footer |
| Kontakt | Hero → Kontakt-Text → Adresse → Formular → Footer |

### 11.5 Was konkret veraltet / schlecht wirkt
1. **Der Bruch:** 6 von 7 Seiten sind ungestylt. Nichts wirkt „veralteter" als eine Seite ohne Layout. (§0.1)
2. **Kein Content-Rhythmus.** Riesige leere Flächen (z. B. Startseite zwischen Projekte-Slider und CTA ~350 px leer; auf Unternehmen bis zu 400 px Leerraum um die Portraits).
3. **Hero-Pattern kopiert.** Vier von fünf Seiten haben dieselbe zweizeilige h1 auf rotem Balken. „Ihr Partner für / Zerspanung" erscheint identisch auf Start **und** Kontakt.
4. **Kein sichtbarer Primär-CTA im Header.** Kein „Angebot anfragen"-Button oben rechts, kein klickbarer Telefonlink. Die 24-h-Angebotszusage — das stärkste Verkaufsargument — steht erst ganz unten auf der Seite.
5. **Duplicate Content:** „Über uns"-Text und „Firmenhistorie"-Einleitung sind wortgleich; der Projekte-Text steht identisch auf Start und Maschinenpark.
6. **Maschinenpark = reine Datentabellen.** Keine einzige Maschinen-Aufnahme, keine Bilder, kein visueller Anker — obwohl der Maschinenpark das Kernargument ist und in `assets/cnc/` reichlich passende Fotos existieren.
7. **Kein Social Proof.** Keine Kundenlogos, keine Referenzen mit Namen, keine Testimonials — nur der generische Satz über „namhafte Unternehmen".
8. **Karriere ist eine Textwüste.** 6 Aufgaben + 15 Benefits als Bullet-Listen ohne Struktur/Icons, ohne Bewerbungsformular (nur Link auf das allgemeine Kontaktformular).
9. **Bildqualität uneinheitlich.** Handy-Schnappschüsse (Lager, Zuschnitt) neben guten Produktfotos; PNG-Dateien mit Foto-Inhalt (`Schoebel_CNC-Fraesen.png` 82 KB, `Schoebel_Lager.png` 120 KB) statt WebP/JPG.
10. **Accessibility:** leere `alt`-Attribute überall, `alt="\n"` bei 12 Icons, Kontrast von grauem Text auf dunklem Verlauf grenzwertig, Cookie-Modal blockiert die gesamte Seite ohne Fokusfalle-Alternative.
11. **SEO:** kein `og:image` auf Maschinenpark/Kontakt/Impressum/Datenschutz; `description` der Unternehmensseite grammatikalisch falsch; keine strukturierten Daten (kein `LocalBusiness`/`Organization`-Schema); `wp-json` und `xmlrpc.php` offen.
12. **Performance:** 13 Stylesheets, 4 Schriftfamilien, YouTube-Iframe im Hero, unkomprimierte JPGs bis 294 KB, Ken-Burns-Slider mit 9 Vollbildern.

### 11.6 Was gut ist und übernommen werden sollte
- Fotomaterial aus der eigenen Fertigung ist **echt und ausreichend vorhanden** (28 Motive) — kein Stockfoto-Look.
- Das **Hero-Video** ist gut (49 s, 1080p, echte Maschinen, Roboter, Späne).
- Die **Farbwelt Schwarz/Anthrazit + Signalrot `#930000`** passt zur Branche und zum Logo.
- Die **Zahlenbeweise** (15.073 Maschinenstunden, 27.473 Teile, 9.072 h Automation) sind konkret und glaubwürdig.
- Der **24-h-Angebotsversprechen** ist ein starkes, klar formuliertes Alleinstellungsmerkmal.
- Die **Maschinen-Spezifikationen** sind vollständig und technisch belastbar — genau das, was Einkäufer und Konstrukteure suchen.
- **ISO 9001** (muss allerdings aktualisiert werden).

---

## 12. SCREENSHOTS

Alle unter `_analysis/shots/cnc/` — Desktop 1440×900, Mobile 390×844 @2x, jeweils nach Cookie-Zustimmung + Netzwerk-Idle + Scroll-Durchlauf aufgenommen.

| Datei | Inhalt |
|---|---|
| `cnc-home-full.png` | Startseite komplett (1440×4982) |
| `cnc-home-01.png` … `cnc-home-06.png` | Startseite in 900-px-Schritten |
| `cnc-home-mobile-full.png` | Startseite mobil (390×…) |
| `cnc-produktion-full.png` | Produktion komplett (1440×5163) |
| `cnc-produktion-01.png` … `-06.png` | Produktion in 900-px-Schritten |
| `cnc-produktion-mobile-full.png` | Produktion mobil |
| `cnc-unternehmen-full.png` | Unternehmen komplett (1440×8586) |
| `cnc-unternehmen-01.png` … `-10.png` | Unternehmen in 900-px-Schritten |
| `cnc-unternehmen-mobile-full.png` | Unternehmen mobil |
| `cnc-maschinenpark-full.png` | Maschinenpark komplett (1440×5256) |
| `cnc-maschinenpark-01.png` … `-06.png` | Maschinenpark in 900-px-Schritten |
| `cnc-maschinenpark-mobile-full.png` | Maschinenpark mobil |
| `cnc-kontakt-full.png` | Kontakt komplett (1440×1727) |
| `cnc-kontakt-01.png`, `-02.png` | Kontakt in 900-px-Schritten |
| `cnc-kontakt-mobile-full.png` | Kontakt mobil |
| `cnc-impressum-full.png` / `cnc-impressum-mobile-full.png` | Impressum |
| `cnc-datenschutz-full.png` / `cnc-datenschutz-mobile-full.png` | Datenschutz |
| `_montage-projekte.png` | Kontaktbogen der 9 Projekte-Bilder |
| `_montage-sections.png` | Kontaktbogen der 9 Sektionsbilder |
| `_montage-rest.png` | Kontaktbogen der restlichen 12 Bilder inkl. Portraits |

## 13. ROHDATEN

| Pfad | Inhalt |
|---|---|
| `_analysis/cnc-data/<seite>.json` | Strukturierte Extraktion je Seite (Headings, Absätze, Listen, Links, Buttons, Navigation, Bilder, Videos, CSS-Backgrounds, Formulare, Farben, Fonts, Sektionen) |
| `_analysis/cnc-data/<seite>.txt` | Kompletter sichtbarer Seitentext (innerText) |
| `_analysis/cnc-data/<seite>.dom.html` | Gerendertes DOM (nach JS-Ausführung) |
| `_analysis/cnc-data/maschinenpark-tables-parsed.json` | Alle 7 Maschinen-Tabellen als Arrays |
| `_analysis/cnc-data/_blocks_home-produktion.json` | Elementor-Widgets in Dokumentreihenfolge |
| `_analysis/cnc-data/_uploads_all.json` | Alle Upload-URLs je Seite |
| `_analysis/html/<seite>.html` | Roh-HTML (curl, ohne JS) |
| `_analysis/assets/cnc/` | 38 heruntergeladene Assets inkl. Hero-Video und Schriftdateien |
| `_analysis/cnc-capture.js` / `cnc-blocks.js` / `cnc-tables2.js` / `cnc-download.js` / `cnc-uploads2.js` | Verwendete Skripte (reproduzierbar) |
