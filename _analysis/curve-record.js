const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('https://uptivemfg.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);

  // park just above the "What Drives Us" block so it is still untriggered
  await page.evaluate(() => window.scrollTo(0, 2500));
  await page.waitForTimeout(2000);

  const rec = await page.evaluate(async () => {
    // pick an untriggered fade-in-right element
    const el = Array.from(document.querySelectorAll('[data-on-view].fade-in-right'))
      .find(e => !e.classList.contains('active'));
    const elFade = Array.from(document.querySelectorAll('[data-on-view].fade-in'))
      .find(e => !e.classList.contains('active'));
    if (!el) return { err: 'no target' };
    const samplesA = [], samplesB = [];
    const t0 = performance.now();
    // trigger by scrolling
    window.scrollTo(0, 3200);
    return await new Promise(res => {
      function tick() {
        const now = performance.now() - t0;
        const cs = getComputedStyle(el);
        const m = new DOMMatrixReadOnly(cs.transform === 'none' ? '' : cs.transform);
        samplesA.push({ t: +now.toFixed(1), o: +(+cs.opacity).toFixed(4), x: +m.m41.toFixed(2) });
        if (elFade) {
          const cf = getComputedStyle(elFade);
          samplesB.push({ t: +now.toFixed(1), o: +(+cf.opacity).toFixed(4) });
        }
        if (now < 1600) requestAnimationFrame(tick); else res({ samplesA, samplesB, cls: el.className, clsB: elFade && elFade.className });
      }
      requestAnimationFrame(tick);
    });
  });

  if (rec.err) { console.log(rec.err); await browser.close(); return; }
  console.log('=== fade-in-right sample (translateX 100->0, opacity 0->1) ===', rec.cls);
  // find the frame where motion starts
  const A = rec.samplesA;
  const start = A.findIndex(s => s.x < 100 - 0.01 || s.o > 0.001);
  const base = start >= 0 ? A[start].t : 0;
  A.filter(s => s.t >= base - 40).slice(0, 45).forEach(s => {
    const p = ((s.t - base) / 500);
    console.log(`  t=${(s.t - base).toFixed(0)}ms  progress=${p.toFixed(3)}  opacity=${s.o}  x=${s.x}  -> normOpacity=${s.o.toFixed(3)}`);
  });

  console.log('\n=== .fade-in (opacity only, 1.3s) ===', rec.clsB);
  const B = rec.samplesB;
  const startB = B.findIndex(s => s.o > 0.001);
  const baseB = startB >= 0 ? B[startB].t : 0;
  B.filter(s => s.t >= baseB - 40).forEach((s, i) => { if (i % 3 === 0) console.log(`  t=${(s.t - baseB).toFixed(0)}ms  opacity=${s.o}`); });

  await browser.close();
})();
