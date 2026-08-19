const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'shots', 'uptive-motion');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 900 },
    deviceScaleFactor: 1,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  });
  const page = await ctx.newPage();

  const requests = [];
  page.on('request', r => {
    const t = r.resourceType();
    if (t === 'script' || t === 'stylesheet' || t === 'xhr' || t === 'fetch') requests.push({ t, url: r.url() });
  });

  await page.goto('https://uptivemfg.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);

  const result = await page.evaluate(() => {
    const out = {};
    // 1. known libs on window
    const libs = ['gsap','ScrollTrigger','ScrollSmoother','ScrollToPlugin','Draggable','Flip','MotionPathPlugin','SplitText','Lenis','lenis','locomotive','LocomotiveScroll','barba','Barba','Swiper','swiper','Splitting','SplitType','framer','Motion','motion','AOS','ScrollMagic','THREE','three','lottie','bodymovin','anime','ScrollOut','Rellax','simpleParallax','Vivus','Typed','jQuery','$','Alpine','Vue','React','__NEXT_DATA__','__NUXT__','wp','elementorFrontend','Webflow','ScrollReveal','sr','tween','TweenMax','TweenLite','TimelineMax','Observer','CustomEase','InertiaPlugin','DrawSVGPlugin','MorphSVGPlugin'];
    out.windowLibs = libs.filter(l => typeof window[l] !== 'undefined');

    // fuzzy scan for anything animation-ish
    out.windowFuzzy = Object.keys(window).filter(k => /gsap|scroll|lenis|loco|barba|swiper|split|motion|anim|tween|timeline|three|lottie|aos|parallax|marquee|reveal/i.test(k)).slice(0, 120);

    // 2. scripts
    out.scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
    out.inlineScriptSnippets = Array.from(document.querySelectorAll('script:not([src])'))
      .map(s => s.textContent || '')
      .filter(t => /gsap|ScrollTrigger|lenis|observer|IntersectionObserver|animate|requestAnimationFrame/i.test(t))
      .map(t => t.slice(0, 4000));

    // 3. smooth scroll hijack detection
    const html = document.documentElement, body = document.body;
    out.htmlClass = html.className;
    out.bodyClass = body.className;
    out.htmlStyle = html.getAttribute('style');
    out.bodyStyle = body.getAttribute('style');
    out.htmlComputed = {
      scrollBehavior: getComputedStyle(html).scrollBehavior,
      overflow: getComputedStyle(html).overflow,
      height: getComputedStyle(html).height
    };
    out.bodyComputed = {
      overflow: getComputedStyle(body).overflow,
      position: getComputedStyle(body).position,
      transform: getComputedStyle(body).transform,
      height: getComputedStyle(body).height
    };
    // look for wrapper with transform
    out.transformedWrappers = Array.from(document.querySelectorAll('body > *, body > * > *')).map(el => {
      const cs = getComputedStyle(el);
      return { tag: el.tagName, id: el.id, cls: (el.className||'').toString().slice(0,120), transform: cs.transform, position: cs.position, willChange: cs.willChange };
    }).filter(o => o.transform !== 'none' || o.willChange !== 'auto');

    out.docHeight = document.documentElement.scrollHeight;
    out.title = document.title;
    return out;
  });

  // CSS analysis - fetch all stylesheets
  const cssInfo = await page.evaluate(async () => {
    const out = { keyframes: [], transitions: new Set(), cubicBeziers: new Set(), clipPaths: new Set(), willChange: new Set(), transforms: new Set(), sheets: [], errors: [] };
    for (const sheet of Array.from(document.styleSheets)) {
      let rules;
      try { rules = sheet.cssRules; } catch (e) { out.errors.push(sheet.href + ' :: CORS'); continue; }
      if (!rules) continue;
      out.sheets.push({ href: sheet.href, count: rules.length });
      const walk = (rs) => {
        for (const r of Array.from(rs)) {
          if (r.type === CSSRule.KEYFRAMES_RULE || r.constructor.name === 'CSSKeyframesRule') {
            out.keyframes.push({ name: r.name, text: r.cssText.slice(0, 900) });
          } else if (r.cssRules) {
            walk(r.cssRules);
          } else if (r.style) {
            const st = r.style;
            const tr = st.getPropertyValue('transition');
            if (tr) out.transitions.add(r.selectorText + '  ==>  ' + tr);
            const an = st.getPropertyValue('animation');
            if (an) out.transitions.add('[ANIM] ' + r.selectorText + '  ==>  ' + an);
            const wc = st.getPropertyValue('will-change');
            if (wc) out.willChange.add(r.selectorText + '  ==>  ' + wc);
            const cp = st.getPropertyValue('clip-path');
            if (cp) out.clipPaths.add(r.selectorText + '  ==>  ' + cp);
            const tf = st.getPropertyValue('transform');
            if (tf && tf !== 'none') out.transforms.add(r.selectorText + '  ==>  ' + tf);
            const ct = r.cssText || '';
            const m = ct.match(/cubic-bezier\([^)]*\)/g);
            if (m) m.forEach(x => out.cubicBeziers.add(x));
          }
        }
      };
      try { walk(rules); } catch(e) { out.errors.push('walk: ' + e.message); }
    }
    return {
      keyframes: out.keyframes,
      transitions: Array.from(out.transitions).slice(0, 400),
      cubicBeziers: Array.from(out.cubicBeziers),
      clipPaths: Array.from(out.clipPaths).slice(0, 100),
      willChange: Array.from(out.willChange).slice(0, 100),
      transforms: Array.from(out.transforms).slice(0, 100),
      sheets: out.sheets,
      errors: out.errors
    };
  });

  // GSAP internals if present
  const gsapInfo = await page.evaluate(() => {
    if (typeof window.gsap === 'undefined') return null;
    const g = window.gsap;
    const out = { version: g.version, plugins: Object.keys(g.plugins || {}), globalTimelineChildren: [] };
    try {
      const kids = g.globalTimeline.getChildren(true, true, true);
      out.count = kids.length;
      out.globalTimelineChildren = kids.slice(0, 200).map(t => {
        let targets = [];
        try { targets = (t.targets ? t.targets() : []).map(el => el && el.tagName ? (el.tagName + (el.id ? '#'+el.id : '') + (el.className ? '.'+String(el.className).trim().split(/\s+/).join('.') : '')).slice(0,140) : String(el)); } catch(e) {}
        return {
          type: t.constructor.name,
          dur: t.duration(),
          delay: t.delay ? t.delay() : null,
          vars: JSON.parse(JSON.stringify(t.vars, (k,v) => typeof v === 'function' ? '[fn]' : (v && v.nodeType ? '[node]' : v))),
          targets: targets.slice(0, 6)
        };
      });
    } catch(e) { out.err = e.message; }
    if (window.ScrollTrigger) {
      try {
        out.scrollTriggers = ScrollTrigger.getAll().map(st => ({
          trigger: st.trigger ? (st.trigger.tagName + (st.trigger.id?'#'+st.trigger.id:'') + (st.trigger.className? '.'+String(st.trigger.className).trim().split(/\s+/).join('.'):'')).slice(0,160) : null,
          start: st.vars.start, end: st.vars.end, scrub: st.vars.scrub, pin: !!st.vars.pin,
          toggleActions: st.vars.toggleActions, once: st.vars.once, markers: st.vars.markers,
          startPx: st.start, endPx: st.end, animation: !!st.animation
        }));
      } catch(e) { out.stErr = e.message; }
    }
    return out;
  });

  const bundle = { detect: result, css: cssInfo, gsap: gsapInfo, network: requests };
  fs.writeFileSync(path.join(__dirname, 'stack-report.json'), JSON.stringify(bundle, null, 2));

  console.log('=== TITLE ===', result.title);
  console.log('=== DOC HEIGHT ===', result.docHeight);
  console.log('=== WINDOW LIBS ===', JSON.stringify(result.windowLibs));
  console.log('=== HTML CLASS ===', result.htmlClass);
  console.log('=== BODY CLASS ===', result.bodyClass);
  console.log('=== SCRIPTS ===');
  result.scripts.forEach(s => console.log('  ', s));
  console.log('=== NETWORK SCRIPTS ===');
  requests.filter(r=>r.t==='script').forEach(r => console.log('  ', r.url));
  console.log('=== CSS SHEETS ===', JSON.stringify(cssInfo.sheets, null, 1));
  console.log('=== CSS ERRORS ===', JSON.stringify(cssInfo.errors));
  console.log('=== CUBIC BEZIERS ===', JSON.stringify(cssInfo.cubicBeziers, null, 1));
  console.log('=== KEYFRAME NAMES ===', JSON.stringify(cssInfo.keyframes.map(k=>k.name)));
  console.log('=== GSAP ===', JSON.stringify(gsapInfo && {v: gsapInfo.version, plugins: gsapInfo.plugins, count: gsapInfo.count, stCount: gsapInfo.scrollTriggers ? gsapInfo.scrollTriggers.length : 0}));

  await browser.close();
})();
