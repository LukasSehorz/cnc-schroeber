const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join(__dirname, 'shots', 'barrier');

// ease-in-out (Motion One 'ease-in-out' == cubic-bezier(0.42,0,0.58,1))
function cubicBezier(p1x, p1y, p2x, p2y) {
  const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
  const cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
  const X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t;
  return x => { let t = x; for (let i = 0; i < 12; i++) { const e = X(t) - x; if (Math.abs(e) < 1e-6) break; const d = (3 * ax * t + 2 * bx) * t + cx; if (Math.abs(d) < 1e-6) break; t -= e / d; } return Y(t); };
}
const easeInOut = cubicBezier(0.42, 0, 0.58, 1);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto('https://barriergroup.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.addStyleTag({ content: '.cmplz-cookiebanner,#cmplz-cookiebanner-container,.grecaptcha-badge{display:none!important}' });
  await page.waitForTimeout(4500);
  await page.evaluate(() => { const v = document.querySelector('video'); if (v) { v.pause(); v.currentTime = 2.0; } });

  // Settle past scroll_range so showNavigation() has finished and nothing else writes to logo.style
  await page.evaluate(() => { if (window.lenis) window.lenis.scrollTo(200, { immediate: true, force: true }); else window.scrollTo(0, 200); });
  await page.waitForTimeout(1500);

  // Freeze the site's own animation loop, then paint exact interpolated frames.
  for (const pct of [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1]) {
    await page.evaluate(({ pct, ez }) => {
      // stop the site's motion by neutralising the scroll handler effects
      const logo = document.querySelector('.header__logo');
      const header = document.querySelector('.header');
      const sub = document.querySelector('.header__logo__subtext');
      const bez = new Function('x', ez + '; return f(x);');
      const e = bez(pct);                 // 600ms ease-in-out progress
      const eh = bez(Math.min(pct / (400 / 600), 1)); // header finishes at 400ms
      logo.style.width = (1400 + (114 - 1400) * e) + 'px';
      logo.style.top = (82 + (19 - 82) * e) + 'px';
      header.style.top = (-62 + (0 - -62) * eh) + 'px';
      sub.style.opacity = String(1 - e);
      sub.style.transform = `scale(${1 - e})`;
    }, { pct, ez: `function f(x){${cubicBezier.toString()}; return cubicBezier(0.42,0,0.58,1)(x);}` });
    await page.waitForTimeout(120);
    const lbl = String(Math.round(pct * 600)).padStart(3, '0');
    await page.screenshot({ path: path.join(OUT, `barrier-morph-${lbl}ms.png`) });
    const st = await page.evaluate(() => { const r = document.querySelector('.header__logo').getBoundingClientRect(); return { w: +r.width.toFixed(0), t: +r.top.toFixed(0), l: +r.left.toFixed(0) }; });
    console.log(`morph ${lbl}ms (p=${pct})  logoW=${st.w} top=${st.t} left=${st.l}`);
  }

  // hero -> section 2 boundary shot
  await page.evaluate(() => { if (window.lenis) window.lenis.scrollTo(760, { immediate: true, force: true }); else window.scrollTo(0, 760); });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, 'barrier-section2-boundary.png') });
  await browser.close();
})();
