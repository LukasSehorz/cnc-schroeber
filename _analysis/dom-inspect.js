const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('https://uptivemfg.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);

  const info = await page.evaluate(() => {
    const desc = el => {
      if (!el) return null;
      const cls = (el.getAttribute('class') || '').trim();
      return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (cls ? '.' + cls.split(/\s+/).slice(0, 8).join('.') : '');
    };
    const out = {};

    // all data-on-view elements
    out.onView = Array.from(document.querySelectorAll('[data-on-view]')).map(el => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        sel: desc(el),
        dataOnView: el.dataset.onView,
        cssAdd: el.dataset.cssAdd,
        cssRemove: el.dataset.cssRemove,
        cssDuration: el.dataset.cssDuration,
        js: el.dataset.js,
        play: el.dataset.play,
        docY: Math.round(r.top + window.scrollY),
        h: Math.round(r.height),
        transition: cs.transition,
        opacity: cs.opacity,
        transform: cs.transform,
        text: (el.innerText || '').replace(/\s+/g, ' ').slice(0, 90)
      };
    });

    // header / nav
    const header = document.querySelector('header');
    out.header = header ? {
      sel: desc(header),
      cs: (() => { const c = getComputedStyle(header); return { position: c.position, top: c.top, transform: c.transform, transition: c.transition, background: c.backgroundColor, height: c.height, zIndex: c.zIndex }; })(),
      html: header.outerHTML.slice(0, 3000)
    } : null;

    // top-level sections structure
    out.sections = Array.from(document.querySelectorAll('body > * , main > *, #main > *, .site-main > *')).map(el => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { sel: desc(el), docY: Math.round(r.top + window.scrollY), h: Math.round(r.height), position: cs.position, overflow: cs.overflow, bg: cs.backgroundColor };
    }).filter(s => s.h > 0);

    // sticky / fixed elements
    out.stickyFixed = Array.from(document.querySelectorAll('*')).filter(el => {
      const p = getComputedStyle(el).position;
      return p === 'sticky' || p === 'fixed';
    }).slice(0, 60).map(el => {
      const cs = getComputedStyle(el);
      return { sel: desc(el), position: cs.position, top: cs.top, zIndex: cs.zIndex, h: Math.round(el.getBoundingClientRect().height) };
    });

    // videos
    out.videos = Array.from(document.querySelectorAll('video')).map(v => ({
      sel: desc(v), src: v.currentSrc || v.src || (v.querySelector('source') || {}).src,
      autoplay: v.autoplay, loop: v.loop, muted: v.muted, playsInline: v.playsInline,
      w: v.videoWidth, h: v.videoHeight, docY: Math.round(v.getBoundingClientRect().top + window.scrollY)
    }));

    // splide sliders
    out.splide = Array.from(document.querySelectorAll('.splide')).map(el => ({ sel: desc(el), docY: Math.round(el.getBoundingClientRect().top + window.scrollY), slides: el.querySelectorAll('.splide__slide').length }));

    // hero
    const hero = document.querySelector('#hero-img, .hero, [class*="hero"]');
    out.heroCandidates = Array.from(document.querySelectorAll('[id*="hero"],[class*="hero"]')).slice(0, 20).map(el => {
      const cs = getComputedStyle(el);
      return { sel: desc(el), transition: cs.transition, opacity: cs.opacity, position: cs.position, h: Math.round(el.getBoundingClientRect().height) };
    });

    // nav / header full markup
    out.bodyStart = document.body.innerHTML.slice(0, 9000);

    // Marquee / ticker candidates: elements with animation
    out.animatedEls = Array.from(document.querySelectorAll('*')).filter(el => {
      const cs = getComputedStyle(el);
      return cs.animationName && cs.animationName !== 'none';
    }).slice(0, 40).map(el => { const cs = getComputedStyle(el); return { sel: desc(el), anim: cs.animation }; });

    // all elements with a non-trivial transition
    const seen = new Set();
    out.transitionEls = Array.from(document.querySelectorAll('*')).map(el => {
      const cs = getComputedStyle(el);
      if (!cs.transitionDuration || cs.transitionDuration === '0s') return null;
      const key = desc(el).split('.').slice(0, 4).join('.') + '|' + cs.transition;
      if (seen.has(key)) return null; seen.add(key);
      return { sel: desc(el), transition: cs.transition };
    }).filter(Boolean).slice(0, 80);

    out.scrollHeight = document.documentElement.scrollHeight;
    return out;
  });

  fs.writeFileSync(path.join(__dirname, 'dom-report.json'), JSON.stringify(info, null, 2));
  console.log('ON-VIEW ELEMENTS:', info.onView.length);
  info.onView.forEach(o => console.log(JSON.stringify(o)));
  console.log('\nSECTIONS:');
  info.sections.forEach(s => console.log(JSON.stringify(s)));
  console.log('\nSTICKY/FIXED:');
  info.stickyFixed.forEach(s => console.log(JSON.stringify(s)));
  console.log('\nVIDEOS:', JSON.stringify(info.videos, null, 1));
  console.log('\nSPLIDE:', JSON.stringify(info.splide, null, 1));
  console.log('\nHERO:', JSON.stringify(info.heroCandidates, null, 1));
  console.log('\nANIMATED:', JSON.stringify(info.animatedEls, null, 1));
  console.log('\nSCROLL HEIGHT:', info.scrollHeight);
  await browser.close();
})();
