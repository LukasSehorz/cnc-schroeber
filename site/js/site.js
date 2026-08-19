/* ==========================================================================
   Schöbel CNC — Bewegung

   Der inszenierte Moment: Das Wortzeichen steht randbreit über dem Video und
   schrumpft beim Scrollen in die Navigationsleiste. Es ist ein einziges
   Element, kein Überblenden zweier Logos. Anders als in der Vorlage läuft es
   scroll-gebunden und nicht als einmalig ausgelöste Sequenz.
   ========================================================================== */

(function () {
  "use strict";

  var html = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  /* Ohne GSAP bleibt die Seite in ihrem sichtbaren Grundzustand. */
  if (!hasGSAP) {
    document.querySelectorAll(".hdr__bg").forEach(function (el) { el.style.transform = "none"; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  html.dataset.motion = "on";

  var LOGO_RATIO = 3.2405; /* 2560 × 790 */
  var lenis = null;

  /* ------------------------------------------------------------------ Lenis */

  if (!reduced && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ------------------------------------------------- Wortzeichen-Mechanik */

  var hero = document.getElementById("hero");
  var hdr = document.getElementById("hdr");
  var brand = document.getElementById("brand");
  var chip = document.getElementById("brandChip");
  var hdrBg = document.getElementById("hdrBg");
  var labels = document.getElementById("heroLabels");
  var hdrNav = document.querySelector(".hdr__nav");
  var hdrEnd = document.querySelector(".hdr__end");
  var brandImg = brand ? brand.querySelector("img") : null;

  var M = {};

  function measure() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    M.hdrH = vw < 640 ? 62 : 72;
    M.gutter = vw < 640 ? 24 : 40;
    M.ratio = brandImg && brandImg.naturalWidth
      ? brandImg.naturalWidth / brandImg.naturalHeight
      : LOGO_RATIO;

    /* Grossformat: randbreit, aber gedeckelt, damit es auf breiten
       Schirmen nicht die halbe Höhe frisst. */
    M.startW = Math.min(vw - M.gutter * 2, 1240);
    M.startH = M.startW / M.ratio;

    M.endW = vw < 640 ? 116 : 152;
    M.endH = M.endW / M.ratio;

    M.startTop = Math.max(24, Math.min(vh * 0.05, 56));
    M.endTop = (M.hdrH - M.endH) / 2;
    M.scale = M.endW / M.startW;

    /* Scrolllänge des Übergangs. Kürzer als eine Bildschirmhöhe, damit die
       Leiste zu Beginn der zweiten Sektion steht. */
    M.dist = Math.max(300, Math.min(vh * 0.52, 520));

    html.style.setProperty("--hdr-h", M.hdrH + "px");
    html.style.setProperty("--logo-w", M.startW + "px");
    html.style.setProperty("--logo-top", M.startTop + "px");
    html.style.setProperty("--labels-top", Math.round(M.startTop + M.startH + 10) + "px");
  }

  function buildHeroTimeline() {
    /* Unterseiten tragen das Wortzeichen fest in der Leiste, brauchen aber
       dieselben Messwerte für Ankersprünge. */
    if (!hero || !brand || hdr.classList.contains("hdr--static")) return;

    /* Reduzierte Bewegung: Endzustand ohne Übergang. */
    if (reduced) {
      gsap.set(brand, { y: M.endTop, scale: M.scale });
      gsap.set(hdrBg, { yPercent: 0 });
      gsap.set([chip, hdrNav, hdrEnd], { opacity: 1 });
      gsap.set(labels, { opacity: 0 });
      return;
    }

    gsap.set(brand, { y: M.startTop, scale: 1 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: function () { return "+=" + M.dist; },
        scrub: 0.55,
        invalidateOnRefresh: true
      }
    });

    tl.fromTo(brand,
      { y: M.startTop, scale: 1 },
      { y: M.endTop, scale: M.scale, ease: "none", duration: 1 }, 0);

    /* Die Labels sitzen an den Aussenkanten des Grossformats und gehen
       früh, damit sie nicht mit der Überschrift kollidieren. */
    tl.to(labels, { opacity: 0, y: -14, ease: "none", duration: 0.4 }, 0);

    /* Die Leiste schnappt ein, sobald das Wortzeichen fast angekommen ist.
       Sie hängt bewusst nicht am Scrub: ein halb eingefahrener Balken lässt
       die Navigation über dem Video stehen und wird unlesbar. Geschaltet
       wird über eine Klasse, damit keine Inline-Transforms von GSAP mit den
       Ausgangswerten aus dem Stylesheet kollidieren. */
    ScrollTrigger.create({
      trigger: hero,
      start: function () { return "top top-=" + Math.round(M.dist * 0.6); },
      onEnter: function () { html.classList.add("is-pinned"); },
      onLeaveBack: function () { html.classList.remove("is-pinned"); }
    });

    /* Dezenter Versatz des Videos gegen die Scrollrichtung. */
    var media = document.getElementById("heroMedia");
    if (media) {
      gsap.fromTo(media, { yPercent: -4 }, {
        yPercent: 5, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
      });
    }
  }

  /* --------------------------------------------------------- Einblendungen

     Jede Sektion bekommt eine eigene kleine Choreografie statt eines
     einheitlichen Einblendens: der Kicker wischt auf, die Überschrift steigt
     wortweise aus ihrer Grundlinie, Bilder ziehen sich von unten auf, Listen
     und Kacheln laufen gestaffelt nach. Die Reihenfolge folgt der Leserichtung.
     -------------------------------------------------------------------- */

  /* Zerlegt eine Überschrift in maskierte Wörter und gibt die inneren
     Hüllen zurück. Zeilenumbrüche und Auszeichnungen bleiben erhalten. */
  function splitWords(el) {
    if (!el || el.dataset.split === "1") return [];

    var frag = document.createDocumentFragment();
    var inners = [];

    function wrap(content) {
      var mask = document.createElement("span");
      mask.className = "w";
      var inner = document.createElement("span");
      inner.className = "w__i";
      if (typeof content === "string") inner.textContent = content;
      else inner.appendChild(content);
      mask.appendChild(inner);
      frag.appendChild(mask);
      inners.push(inner);
    }

    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (part === "") return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else wrap(part);
        });
      } else if (node.nodeName === "BR") {
        frag.appendChild(node.cloneNode());
      } else {
        wrap(node.cloneNode(true));
      }
    });

    if (!inners.length) return [];
    el.innerHTML = "";
    el.appendChild(frag);
    el.dataset.split = "1";
    return inners;
  }

  var CLIP_HIDDEN = "inset(0% 0% 100% 0%)";
  var CLIP_SHOWN = "inset(0% 0% 0% 0%)";

  function animateSection(section) {
    function q(sel) {
      return Array.prototype.slice.call(section.querySelectorAll(sel));
    }

    var tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top 78%", once: true }
    });

    /* Die Träger werden nur aufgedeckt, die Bewegung machen ihre Kinder. */
    var holders = q("[data-reveal]");
    if (holders.length) {
      tl.to(holders, { opacity: 1, duration: 0.5, ease: "none", stagger: 0.06 }, 0);
    }

    var at = 0;

    /* Kicker wischt von links auf. */
    var kickers = q(".kicker");
    if (kickers.length) {
      tl.fromTo(kickers,
        { clipPath: "inset(0% 100% 0% 0%)", opacity: 0 },
        { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 0.65, ease: "power3.out", stagger: 0.1 },
        at);
      at += 0.14;
    }

    /* Überschriften steigen wortweise auf. */
    var heads = q("h1, h2, .quote p");
    var headStart = at;
    heads.forEach(function (h, i) {
      var words = splitWords(h);
      if (!words.length) return;
      tl.fromTo(words,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.95, ease: "power4.out", stagger: 0.042 },
        headStart + i * 0.09);
    });
    if (heads.length) at += 0.2;

    /* Fließtext und Aktionen folgen. */
    var body = q(".prose, .lead, .hero__sub, .quote cite, .contact-list, .form, .form__note");
    if (body.length) {
      tl.fromTo(body,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.08 },
        at);
      at += 0.1;
    }

    /* Bilder ziehen sich von unten auf und lösen den Zoom auf. */
    var media = q("figure img, .offer__sign, .pagehead__media img");
    if (media.length) {
      tl.fromTo(media,
        { clipPath: CLIP_HIDDEN, scale: 1.1 },
        { clipPath: CLIP_SHOWN, scale: 1, duration: 1.15, ease: "power3.out", stagger: 0.09 },
        Math.max(0, at - 0.35));
    }

    /* Kacheln decken sich nacheinander auf. */
    var tiles = q(".tile");
    if (tiles.length) {
      tl.fromTo(tiles,
        { clipPath: CLIP_HIDDEN, opacity: 0 },
        { clipPath: CLIP_SHOWN, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.1 },
        at);
    }

    /* Kennzahlen, Prozessschritte und Personen steigen gestaffelt auf. */
    var risers = q(".stat, .step, .person, .block");
    if (risers.length) {
      tl.fromTo(risers,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, ease: "power3.out", stagger: 0.08 },
        at);
    }

    /* Listenzeilen und Datenblätter laufen von links ein. Die Sprungnavigation
       bleibt aussen vor, ihr Inline-Transform würde den Hover-Versatz aus dem
       Stylesheet blockieren. */
    var rows = q(".ticks li, .spec tr, .contact-list > div");
    if (rows.length) {
      tl.fromTo(rows,
        { x: -14, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.035, clearProps: "transform" },
        at + 0.1);
    }

    /* Galeriebilder erscheinen in der Fläche. */
    var cells = q(".gallery figure");
    if (cells.length) {
      tl.fromTo(cells,
        { scale: 0.92, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.045 },
        at);
    }

    /* Trennlinien und der Panelrahmen zeichnen sich. */
    var lines = q("hr.rule, .stats, .panel");
    if (lines.length) {
      tl.fromTo(lines,
        { scaleX: 0.965, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.9, ease: "power3.out", transformOrigin: "left center" },
        at);
    }
  }

  function buildReveals() {
    if (reduced) {
      gsap.set("[data-reveal]", { opacity: 1, y: 0 });
      return;
    }

    var sections = Array.prototype.slice.call(
      document.querySelectorAll("main > section, footer.foot")
    );
    sections.forEach(function (s) {
      if (s.classList.contains("hero")) return; /* eigener Auftakt */
      animateSection(s);
    });

    /* Alles ausserhalb einer Sektion sicherheitshalber aufdecken. */
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 92%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, duration: 0.5, ease: "none", overwrite: "auto" });
      }
    });
  }

  /* ------------------------------------------------------- Auftakt Hero */

  function buildIntro() {
    var h1 = document.querySelector(".hero h1");
    if (!h1 || reduced) return;

    var words = splitWords(h1);
    var sub = document.querySelector(".hero__sub");
    var cta = document.querySelector(".hero__grid .act");
    var labels = document.querySelectorAll(".hero__labels span");
    var scroll = document.querySelector(".hero__scroll");

    var tl = gsap.timeline({ delay: 0.25 });

    if (labels.length) {
      tl.fromTo(labels,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 }, 0);
    }
    if (words.length) {
      tl.fromTo(words,
        { yPercent: 112 },
        { yPercent: 0, duration: 1.05, ease: "power4.out", stagger: 0.06 }, 0.15);
    }
    if (sub) {
      tl.fromTo(sub, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.55);
    }
    if (cta) {
      tl.fromTo(cta, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }, 0.65);
    }
    if (scroll) {
      tl.fromTo(scroll, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "none" }, 0.9);
    }
  }

  /* -------------------------------------------------------------- Zähler */

  function buildCounters() {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;
      var final = target.toLocaleString("de-DE");

      if (reduced) { el.textContent = final; return; }

      var box = { v: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 92%",
        once: true,
        onEnter: function () {
          gsap.to(box, {
            v: target,
            duration: 2,
            ease: "power2.out",
            onUpdate: function () {
              el.textContent = Math.round(box.v).toLocaleString("de-DE");
            },
            onComplete: function () { el.textContent = final; }
          });
        }
      });
    });
  }

  /* ----------------------------------------------------------- Mobilmenü */

  function buildMenu() {
    var burger = document.getElementById("burger");
    var nav = document.getElementById("mobileNav");
    if (!burger || !nav) return;

    function setOpen(open) {
      burger.setAttribute("aria-expanded", String(open));
      nav.dataset.open = String(open);
      if (lenis) { open ? lenis.stop() : lenis.start(); }
    }

    burger.addEventListener("click", function () {
      setOpen(burger.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        burger.focus();
      }
    });
  }

  /* ------------------------------------------------------- Sprungmarken */

  function buildAnchors() {
    document.querySelectorAll('a[href*="#"]').forEach(function (a) {
      var href = a.getAttribute("href");
      var hash = href.slice(href.indexOf("#"));
      if (hash.length < 2) return;

      /* Nur seiteninterne Ziele abfangen. */
      var path = href.slice(0, href.indexOf("#"));
      if (path && path.replace(/^\.\//, "") !== location.pathname.split("/").pop()) return;

      a.addEventListener("click", function (e) {
        var t = document.querySelector(hash);
        if (!t) return;
        e.preventDefault();
        var off = M.hdrH + 24;
        if (lenis) lenis.scrollTo(t, { offset: -off, duration: 1.15 });
        else window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - off, behavior: "smooth" });
      });
    });
  }

  /* ------------------------------------------------ Aktive Sprungnavigation */

  function buildScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".jump a"));
    if (!links.length) return;

    links.forEach(function (link) {
      var id = link.getAttribute("href");
      if (!id || id.charAt(0) !== "#") return;
      var section = document.querySelector(id);
      if (!section) return;

      ScrollTrigger.create({
        trigger: section,
        start: "top 40%",
        end: "bottom 40%",
        onToggle: function (self) {
          if (self.isActive) {
            links.forEach(function (l) { l.removeAttribute("aria-current"); });
            link.setAttribute("aria-current", "true");
          }
        }
      });
    });
  }

  /* ---------------------------------------------------------- Zeitstrahl */

  function buildTimeline() {
    var tl = document.querySelector(".tl");
    if (!tl) return;
    var items = Array.prototype.slice.call(tl.querySelectorAll(".tl-item"));
    if (!items.length) return;

    if (reduced) {
      items.forEach(function (i) { i.setAttribute("data-on", "true"); });
      return;
    }

    /* Die Achse wächst mit dem Scrollfortschritt durch die Liste. */
    ScrollTrigger.create({
      trigger: tl,
      start: "top 72%",
      end: "bottom 78%",
      scrub: 0.5,
      onUpdate: function (self) {
        tl.style.setProperty("--tl-progress", self.progress.toFixed(4));
      }
    });

    /* Jeder Eintrag schaltet sich, sobald die Achse ihn erreicht hat. */
    items.forEach(function (item) {
      ScrollTrigger.create({
        trigger: item,
        start: "top 76%",
        onEnter: function () { item.setAttribute("data-on", "true"); },
        onLeaveBack: function () { item.setAttribute("data-on", "false"); }
      });
    });
  }

  /* ------------------------------------------------------------ Formular */

  function buildForm() {
    var form = document.getElementById("anfrageForm");
    var wrap = document.getElementById("formWrap");
    if (!form || !wrap) return;

    function check(el) {
      var ok = el.checkValidity();
      el.setAttribute("aria-invalid", ok ? "false" : "true");
      return ok;
    }

    /* Erst prüfen, wenn das Feld einmal verlassen wurde. Sofortiges Meckern
       beim Tippen ist lästig. */
    form.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("blur", function () {
        if (el.value !== "" || el.required) check(el);
      });
      el.addEventListener("input", function () {
        if (el.getAttribute("aria-invalid") === "true") check(el);
      });
    });

    /* Gewählte Dateien benennen, der Systemtext trägt die Browsersprache. */
    var file = form.querySelector('input[type="file"]');
    var fileOut = form.querySelector("[data-filelist]");
    if (file && fileOut) {
      var hint = fileOut.textContent;
      file.addEventListener("change", function () {
        var n = file.files.length;
        if (!n) { fileOut.textContent = hint; return; }
        fileOut.textContent = n === 1
          ? file.files[0].name
          : n + " Dateien gewählt";
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var fields = Array.prototype.slice.call(form.querySelectorAll("input, textarea"));
      var bad = fields.filter(function (el) { return !check(el); });

      if (bad.length) {
        bad[0].focus();
        if (lenis) lenis.scrollTo(bad[0], { offset: -(M.hdrH + 40), duration: 0.8 });
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = "Wird gesendet"; }

      /* Demofassung ohne Serveranbindung. Für den Livebetrieb hier den
         Versand an das Postfach der Firma einhängen. */
      setTimeout(function () {
        wrap.setAttribute("data-sent", "true");
        var done = wrap.querySelector(".form-done");
        if (done) {
          done.setAttribute("tabindex", "-1");
          done.focus({ preventScroll: true });
        }
        ScrollTrigger.refresh();
      }, 700);
    });
  }

  /* -------------------------------------------------------------- Start */

  function init() {
    measure();
    buildHeroTimeline();
    buildIntro();
    buildTimeline();
    buildForm();
    buildReveals();
    buildCounters();
    buildMenu();
    buildAnchors();
    buildScrollSpy();
    ScrollTrigger.refresh();
  }

  if (brandImg && !brandImg.complete) {
    brandImg.addEventListener("load", function () { measure(); ScrollTrigger.refresh(); });
  }

  init();

  /* Neu vermessen, wenn sich die Breite ändert. Die Höhenänderung durch die
     ein- und ausfahrende Adressleiste auf Mobilgeräten wird ignoriert. */
  var lastW = window.innerWidth;
  var t;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(t);
    t = setTimeout(function () {
      measure();
      ScrollTrigger.refresh();
    }, 160);
  });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
