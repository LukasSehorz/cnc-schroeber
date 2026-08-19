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

  /* --------------------------------------------------------- Einblendungen */

  function buildReveals() {
    if (reduced) {
      gsap.set("[data-reveal]", { opacity: 1, y: 0 });
      return;
    }
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 88%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1, y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.07,
          overwrite: true
        });
      }
    });
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

  /* -------------------------------------------------------------- Start */

  function init() {
    measure();
    buildHeroTimeline();
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
