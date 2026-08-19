const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const URL = "https://www.wendt-maschinenbau.de/ueber-uns/";
const OUT = __dirname;

async function killCookies(page) {
  const texts = ["Alle akzeptieren", "Akzeptieren", "Zustimmen", "Accept all"];
  for (const t of texts) {
    try {
      const btn = page.getByRole("button", { name: new RegExp("^\\s*" + t + "\\s*$", "i") }).first();
      if (await btn.isVisible({ timeout: 700 }).catch(() => false)) {
        await btn.click({ timeout: 1500 }).catch(() => {});
        await page.waitForTimeout(800);
      }
    } catch (e) {}
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "de-DE",
  });
  const page = await ctx.newPage();

  const requests = [];
  page.on("request", (r) => requests.push(r.url()));

  await page.goto(URL, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(2500);
  await killCookies(page);
  await page.waitForTimeout(1000);

  // scroll to trigger
  await page.evaluate(async () => {
    const h = () => document.documentElement.scrollHeight;
    for (let y = 0; y < h(); y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, h());
    await new Promise((r) => setTimeout(r, 1000));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 800));
  });
  await page.waitForTimeout(1200);

  // ---- 1. LIBRARY DETECTION ----
  const libs = await page.evaluate(() => {
    const w = window;
    return {
      gsap: !!w.gsap ? (w.gsap.version || true) : false,
      ScrollTrigger: !!(w.ScrollTrigger || (w.gsap && w.gsap.plugins && w.gsap.plugins.ScrollTrigger)),
      AOS: !!w.AOS,
      Swiper: !!w.Swiper,
      Lenis: !!(w.Lenis || w.lenis),
      Framer: !!w.Motion || !!w.framerMotion,
      jQuery: w.jQuery ? w.jQuery.fn.jquery : false,
      Alpine: !!w.Alpine,
      Barba: !!w.barba,
      locomotive: !!w.LocomotiveScroll,
      Splide: !!w.Splide,
      tinySlider: !!w.tns,
      ScrollReveal: !!w.ScrollReveal,
      anime: !!w.anime,
      lottie: !!w.lottie,
      wow: !!w.WOW,
      elementorFrontend: !!w.elementorFrontend,
      wp: !!w.wp,
      vue: !!w.Vue || !!document.querySelector("[data-v-app],#__nuxt"),
      next: !!document.querySelector("#__next"),
      generator: (document.querySelector('meta[name="generator"]') || {}).content || null,
    };
  });

  const scripts = await page.evaluate(() =>
    Array.from(document.querySelectorAll("script[src]")).map((s) => s.src)
  );
  const stylesheets = await page.evaluate(() =>
    Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((s) => s.href)
  );

  // ---- 2. FULL OUTLINE OF BODY-LEVEL BLOCKS ----
  const outline = await page.evaluate(() => {
    const px = (v) => Math.round(parseFloat(v) * 100) / 100;
    function describe(el, depth) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        depth,
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        cls: el.className && typeof el.className === "string" ? el.className : null,
        top: Math.round(r.top + window.scrollY),
        bottom: Math.round(r.bottom + window.scrollY),
        h: Math.round(r.height),
        w: Math.round(r.width),
        left: Math.round(r.left),
        bg: cs.backgroundColor,
        bgImage: cs.backgroundImage !== "none" ? cs.backgroundImage.slice(0, 160) : null,
        pt: px(cs.paddingTop),
        pb: px(cs.paddingBottom),
        pl: px(cs.paddingLeft),
        pr: px(cs.paddingRight),
        mt: px(cs.marginTop),
        mb: px(cs.marginBottom),
        display: cs.display,
        gridCols: cs.gridTemplateColumns !== "none" ? cs.gridTemplateColumns : null,
        gap: cs.gap !== "normal" ? cs.gap : null,
        pos: cs.position,
        overflow: cs.overflow,
        maxW: cs.maxWidth,
        text: (el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 110),
      };
    }
    const out = [];
    function walk(el, depth) {
      if (depth > 5) return;
      for (const c of el.children) {
        if (!c.tagName) continue;
        if (["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "LINK"].includes(c.tagName)) continue;
        const r = c.getBoundingClientRect();
        if (r.height < 2) continue;
        out.push(describe(c, depth));
        walk(c, depth + 1);
      }
    }
    walk(document.body, 0);
    return out;
  });

  // ---- 3. SEARCH FOR TIMELINE-ISH THINGS ----
  const timelineHunt = await page.evaluate(() => {
    const kw = /timeline|zeitstrahl|zeitleiste|historie|history|meilenstein|milestone|jahr|chrono|slider|swiper|splide|carousel|tns-|glide/i;
    const hits = [];
    document.querySelectorAll("*").forEach((el) => {
      const cn = typeof el.className === "string" ? el.className : "";
      const id = el.id || "";
      if (kw.test(cn) || kw.test(id)) {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        hits.push({
          tag: el.tagName.toLowerCase(),
          id: id || null,
          cls: cn || null,
          top: Math.round(r.top + window.scrollY),
          h: Math.round(r.height),
          w: Math.round(r.width),
          display: cs.display,
          visibility: cs.visibility,
          text: (el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 120),
        });
      }
    });
    // years in text
    const yearNodes = [];
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) {
      const t = (n.textContent || "").trim();
      if (/^(19|20)\d{2}$/.test(t)) {
        const p = n.parentElement;
        const r = p.getBoundingClientRect();
        yearNodes.push({
          year: t,
          parentTag: p.tagName.toLowerCase(),
          parentCls: typeof p.className === "string" ? p.className : null,
          top: Math.round(r.top + window.scrollY),
        });
      }
    }
    return { hits, yearNodes, htmlLen: document.documentElement.outerHTML.length };
  });

  // ---- 4. ALL TEXT ELEMENTS WITH TYPOGRAPHY ----
  const typo = await page.evaluate(() => {
    const sel = "h1,h2,h3,h4,h5,h6,p,li,a.btn,button,span,strong,em,label,figcaption,blockquote";
    const out = [];
    document.querySelectorAll(sel).forEach((el) => {
      const t = (el.innerText || "").trim();
      if (!t || t.length > 200) return;
      // only leaf-ish
      if (el.querySelector("h1,h2,h3,h4,h5,h6,p,li")) return;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.height < 1) return;
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: typeof el.className === "string" ? el.className.slice(0, 90) : null,
        top: Math.round(r.top + window.scrollY),
        left: Math.round(r.left),
        w: Math.round(r.width),
        fs: cs.fontSize,
        fw: cs.fontWeight,
        lh: cs.lineHeight,
        ls: cs.letterSpacing,
        tt: cs.textTransform,
        color: cs.color,
        ff: cs.fontFamily.split(",")[0].replace(/["']/g, ""),
        text: t.replace(/\s+/g, " ").slice(0, 70),
      });
    });
    return out.sort((a, b) => a.top - b.top);
  });

  // ---- 5. CSS CUSTOM PROPERTIES / ROOT ----
  const cssVars = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const out = {};
    for (let i = 0; i < cs.length; i++) {
      const p = cs[i];
      if (p.startsWith("--")) out[p] = cs.getPropertyValue(p).trim();
    }
    return out;
  });

  // ---- 6. CONTAINER MEASUREMENT ----
  const containers = await page.evaluate(() => {
    const out = [];
    const seen = new Set();
    document.querySelectorAll("div,section,main,article,header,footer").forEach((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width < 200) return;
      const key = Math.round(r.width) + ":" + Math.round(r.left) + ":" + cs.paddingLeft + ":" + cs.maxWidth;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: typeof el.className === "string" ? el.className.slice(0, 80) : null,
        w: Math.round(r.width),
        left: Math.round(r.left),
        maxW: cs.maxWidth,
        pl: cs.paddingLeft,
        pr: cs.paddingRight,
        ml: cs.marginLeft,
        mr: cs.marginRight,
      });
    });
    return out.sort((a, b) => b.w - a.w).slice(0, 60);
  });

  // ---- 7. ANIMATION / TRANSITION detection ----
  const anims = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("*").forEach((el) => {
      const cs = getComputedStyle(el);
      const hasT = cs.transitionDuration !== "0s" && cs.transitionProperty !== "none" && cs.transitionProperty !== "all 0s";
      const hasA = cs.animationName !== "none";
      const hasTr = cs.transform !== "none" && cs.transform !== "matrix(1, 0, 0, 1, 0, 0)";
      const op = parseFloat(cs.opacity);
      if (hasT || hasA || (hasTr && op < 1)) {
        const cn = typeof el.className === "string" ? el.className : "";
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: cn.slice(0, 80) || null,
          transProp: cs.transitionProperty,
          transDur: cs.transitionDuration,
          transEase: cs.transitionTimingFunction,
          transDelay: cs.transitionDelay,
          animName: cs.animationName,
          animDur: cs.animationDuration,
          animEase: cs.animationTimingFunction,
          transform: cs.transform.slice(0, 60),
          opacity: cs.opacity,
        });
      }
    });
    // dedupe
    const seen = new Set();
    return out.filter((o) => {
      const k = JSON.stringify(o).replace(/"cls":"[^"]*",/, "");
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, 120);
  });

  // ---- 8. data-* attributes used across the page ----
  const dataAttrs = await page.evaluate(() => {
    const counts = {};
    document.querySelectorAll("*").forEach((el) => {
      for (const a of el.attributes) {
        if (a.name.startsWith("data-") || a.name === "aos" || a.name.startsWith("aos-")) {
          counts[a.name] = counts[a.name] || { n: 0, samples: new Set() };
          counts[a.name].n++;
          if (counts[a.name].samples.size < 5) counts[a.name].samples.add(a.value.slice(0, 60));
        }
      }
    });
    const out = {};
    Object.keys(counts).forEach((k) => (out[k] = { n: counts[k].n, samples: [...counts[k].samples] }));
    return out;
  });

  // ---- 9. IMAGES ----
  const images = await page.evaluate(() =>
    Array.from(document.querySelectorAll("img")).map((im) => {
      const r = im.getBoundingClientRect();
      return {
        top: Math.round(r.top + window.scrollY),
        left: Math.round(r.left),
        w: Math.round(r.width),
        h: Math.round(r.height),
        src: (im.currentSrc || im.src || "").split("/").pop().slice(0, 70),
        alt: (im.alt || "").slice(0, 50),
        objectFit: getComputedStyle(im).objectFit,
        cls: typeof im.className === "string" ? im.className.slice(0, 60) : null,
      };
    })
  );

  // ---- 10. FULL HTML DUMP ----
  const html = await page.content();
  fs.writeFileSync(path.join(OUT, "wendt-ueber-uns.html"), html, "utf8");

  const result = { libs, scripts, stylesheets, timelineHunt, cssVars, containers, dataAttrs, images, outline, typo, anims };
  fs.writeFileSync(path.join(OUT, "wendt-measure.json"), JSON.stringify(result, null, 1), "utf8");

  console.log("LIBS:", JSON.stringify(libs, null, 1));
  console.log("\nSCRIPTS:");
  scripts.forEach((s) => console.log("  " + s));
  console.log("\nTIMELINE HITS:", timelineHunt.hits.length);
  timelineHunt.hits.slice(0, 40).forEach((h) => console.log("  ", JSON.stringify(h)));
  console.log("\nYEAR NODES:", JSON.stringify(timelineHunt.yearNodes.slice(0, 40)));
  console.log("\nDATA ATTRS:", JSON.stringify(dataAttrs, null, 1).slice(0, 3000));

  await browser.close();
})();
