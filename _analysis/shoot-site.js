/* Screenshot-Runner für den Neubau.
   node shoot-site.js <seite> [tag]
   z.B. node shoot-site.js index v1                                       */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const PAGE = process.argv[2] || "index";
const TAG = process.argv[3] || "v1";
const BASE = "http://localhost:4321/" + PAGE + ".html";
const OUT = path.join(__dirname, "shots", "build", TAG);
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  /* ---------------------------------------------------------- Desktop */
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });
  const page = await ctx.newPage();

  page.on("console", m => { if (m.type() === "error") errors.push("CONSOLE " + m.text()); });
  page.on("pageerror", e => errors.push("PAGEERROR " + e.message));
  page.on("requestfailed", r => errors.push("REQFAIL " + r.url() + " :: " + (r.failure() || {}).errorText));

  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(2200);

  /* Scroll-Sequenz durch den Wortzeichen-Übergang */
  const seq = [0, 90, 180, 260, 340, 420, 520, 650];
  for (const y of seq) {
    await page.evaluate(v => window.scrollTo(0, v), y);
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(OUT, `${PAGE}-hero-${String(y).padStart(4, "0")}.png`) });
  }

  /* Ganze Seite in Abschnitten */
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  const height = await page.evaluate(() => document.body.scrollHeight);
  const step = 900;
  let i = 1;
  for (let y = 0; y < height; y += step) {
    await page.evaluate(v => window.scrollTo(0, v), y);
    await page.waitForTimeout(850);
    await page.screenshot({ path: path.join(OUT, `${PAGE}-${String(i).padStart(2, "0")}.png`) });
    i++;
    if (i > 20) break;
  }

  /* Vollbild */
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, `${PAGE}-full.png`), fullPage: true });

  /* Messwerte */
  const metrics = await page.evaluate(() => {
    const q = s => document.querySelector(s);
    const box = el => { if (!el) return null; const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    return {
      pageHeight: document.body.scrollHeight,
      brand: box(q("#brand")),
      brandImg: box(q("#brand img")),
      hdr: box(q("#hdr")),
      hero: box(q("#hero")),
      labels: box(q("#heroLabels")),
      h1: box(q("h1")),
      vars: {
        logoW: getComputedStyle(document.documentElement).getPropertyValue("--logo-w").trim(),
        logoTop: getComputedStyle(document.documentElement).getPropertyValue("--logo-top").trim(),
        labelsTop: getComputedStyle(document.documentElement).getPropertyValue("--labels-top").trim(),
        hdrH: getComputedStyle(document.documentElement).getPropertyValue("--hdr-h").trim()
      },
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth
        ? document.documentElement.scrollWidth + " > " + document.documentElement.clientWidth : "ok"
    };
  });

  await ctx.close();

  /* ----------------------------------------------------------- Mobil */
  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const mp = await mctx.newPage();
  mp.on("pageerror", e => errors.push("MOBILE PAGEERROR " + e.message));
  await mp.goto(BASE, { waitUntil: "load" });
  await mp.waitForTimeout(2200);
  await mp.screenshot({ path: path.join(OUT, `${PAGE}-m-top.png`) });
  await mp.evaluate(() => window.scrollTo(0, 700));
  await mp.waitForTimeout(900);
  await mp.screenshot({ path: path.join(OUT, `${PAGE}-m-scrolled.png`) });
  await mp.evaluate(() => window.scrollTo(0, 0));
  await mp.waitForTimeout(600);
  await mp.screenshot({ path: path.join(OUT, `${PAGE}-m-full.png`), fullPage: true });

  const mOverflow = await mp.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
      ? document.documentElement.scrollWidth + " > " + document.documentElement.clientWidth : "ok");

  await mctx.close();
  await browser.close();

  console.log(JSON.stringify({ metrics, mobileOverflowX: mOverflow, errors }, null, 2));
})();
