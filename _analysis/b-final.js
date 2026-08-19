const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('https://barriergroup.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForTimeout(6500);
  const r = await p.evaluate(() => {
    const svg = document.querySelector('.header__logo svg');
    const bb = svg.getBBox();
    const paths = [...svg.querySelectorAll('path')].map(x => { const b = x.getBBox(); return { x: +b.x.toFixed(1), w: +b.width.toFixed(1) }; });
    // hero bg image + video poster
    const hero = document.querySelector('.primary-hero');
    const cs = getComputedStyle(hero);
    // section 2
    const s2 = document.querySelector('.two-col-with-stats');
    const s2r = s2.getBoundingClientRect();
    return {
      svgBBox: { x: +bb.x.toFixed(2), y: +bb.y.toFixed(2), w: +bb.width.toFixed(2), h: +bb.height.toFixed(2) },
      viewBox: svg.getAttribute('viewBox'), pathBoxes: paths, pathCount: paths.length,
      heroBgImage: cs.backgroundImage, heroBgSize: cs.backgroundSize, heroBgPos: cs.backgroundPosition,
      section2: { top: +(s2r.top + scrollY).toFixed(0), cls: s2.className, bg: getComputedStyle(s2).backgroundColor },
      heroBottomDoc: +(hero.getBoundingClientRect().bottom + scrollY).toFixed(0),
      // effective ::after overlay
      afterBg: getComputedStyle(hero, '::after').backgroundColor,
      // reduced motion?
      prefersReduced: matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
