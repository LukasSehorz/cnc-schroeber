const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const URL = "https://www.wendt-maschinenbau.de/ueber-uns/";
const OUT = path.join(__dirname, "shots", "wendt");
fs.mkdirSync(OUT, { recursive: true });

async function killCookies(page) {
  for (const t of ["Alle akzeptieren", "Akzeptieren"]) {
    const btn = page.getByRole("button", { name: new RegExp("^\\s*" + t + "\\s*$", "i") }).first();
    if (await btn.isVisible({ timeout: 700 }).catch(() => false)) { await btn.click().catch(() => {}); await page.waitForTimeout(700); }
  }
  await page.evaluate(() => { const c = document.querySelector("#t4mConsentOpener"); if (c) c.style.display = "none"; });
}
async function prep(page) {
  await page.goto(URL, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(2500);
  await killCookies(page);
  await page.evaluate(async () => {
    const h = () => document.documentElement.scrollHeight;
    for (let y = 0; y < h(); y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); }
    window.scrollTo(0, h()); await new Promise(r => setTimeout(r, 900));
    window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 700));
  });
  await killCookies(page);
  await page.waitForTimeout(1200);
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ---- desktop crops ----
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "de-DE" });
  const page = await ctx.newPage();
  await prep(page);

  const crops = [
    ["wendt-sec-1-hero.png", "figure.banner", 0, 60],
    ["wendt-sec-2-intro.png", "#item-66", 40, 60],
    ["wendt-timeline-1.png", "#item-206", 60, 60],           // Story-/Historien-Sektion (kein echter Zeitstrahl vorhanden)
    ["wendt-sec-4-cards.png", "#item-72,#item-73,#item-74", 60, 60],
    ["wendt-sec-5-kontakt.png", "#item-465", 60, 60],
    ["wendt-sec-6-footer.png", "footer.page-footer", 130, 0],
  ];
  for (const [file, sel, padT, padB] of crops) {
    const box = await page.evaluate((s) => {
      const els = s.split(",").map(x => document.querySelector(x.trim())).filter(Boolean);
      if (!els.length) return null;
      let t = 1e9, b = -1e9;
      els.forEach(e => { const r = e.getBoundingClientRect(); t = Math.min(t, r.top + scrollY); b = Math.max(b, r.bottom + scrollY); });
      return { t, b };
    }, sel);
    if (!box) { console.log("skip " + file); continue; }
    const y = Math.max(0, Math.round(box.t - padT));
    const h = Math.round(box.b - box.t + padT + padB);
    await page.evaluate((yy) => window.scrollTo(0, 0), 0);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, file), clip: { x: 0, y, width: 1440, height: h }, fullPage: true });
    console.log("saved", file, "y" + y, "h" + h);
  }

  // ---- mobile crop of the same story section ----
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "de-DE" });
  const mp = await mctx.newPage();
  await prep(mp);
  const mbox = await mp.evaluate(() => { const e = document.querySelector("#item-206"); const r = e.getBoundingClientRect(); return { t: r.top + scrollY, b: r.bottom + scrollY }; });
  await mp.screenshot({ path: path.join(OUT, "wendt-timeline-2-mobil.png"), clip: { x: 0, y: Math.max(0, mbox.t - 40), width: 390, height: Math.round(mbox.b - mbox.t + 80) }, fullPage: true });
  console.log("saved wendt-timeline-2-mobil.png");

  const mbox2 = await mp.evaluate(() => { const e = document.querySelector("#item-72"); const r = e.getBoundingClientRect(); return { t: r.top + scrollY, b: r.bottom + scrollY }; });
  await mp.screenshot({ path: path.join(OUT, "wendt-m-card.png"), clip: { x: 0, y: Math.max(0, mbox2.t - 30), width: 390, height: Math.round(mbox2.b - mbox2.t + 60) }, fullPage: true });
  console.log("saved wendt-m-card.png");

  // mobile hero
  await mp.screenshot({ path: path.join(OUT, "wendt-m-hero.png"), clip: { x: 0, y: 0, width: 390, height: 800 }, fullPage: true });
  console.log("saved wendt-m-hero.png");

  await browser.close();
})();
