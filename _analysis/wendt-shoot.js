const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const URL = "https://www.wendt-maschinenbau.de/ueber-uns/";
const OUT = path.join(__dirname, "shots", "wendt");
fs.mkdirSync(OUT, { recursive: true });

async function killCookies(page) {
  const clicked = [];
  // Try common consent frameworks + generic text buttons
  const selectors = [
    "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll",
    "#CybotCookiebotDialogBodyButtonAccept",
    "#onetrust-accept-btn-handler",
    ".cmplz-accept",
    "#cmplz-cookiebanner-container .cmplz-btn.cmplz-accept",
    "[data-cky-tag='accept-button']",
    ".cc-allow",
    "#usercentrics-root",
    ".borlabs-cookie-accept-all",
    "#BorlabsCookieBox a[data-cookie-accept-all]",
    "button#acceptAll",
    ".js-cookie-accept",
  ];
  for (const s of selectors) {
    try {
      const el = await page.$(s);
      if (el && (await el.isVisible().catch(() => false))) {
        await el.click({ timeout: 2000 }).catch(() => {});
        clicked.push(s);
        await page.waitForTimeout(600);
      }
    } catch (e) {}
  }
  const texts = [
    "Alle akzeptieren",
    "Alle Cookies akzeptieren",
    "Akzeptieren",
    "Zustimmen",
    "Einverstanden",
    "Alle erlauben",
    "Accept all",
    "OK",
  ];
  for (const t of texts) {
    try {
      const btn = page.getByRole("button", { name: new RegExp("^\\s*" + t + "\\s*$", "i") }).first();
      if (await btn.isVisible({ timeout: 700 }).catch(() => false)) {
        await btn.click({ timeout: 1500 }).catch(() => {});
        clicked.push("text:" + t);
        await page.waitForTimeout(800);
      }
    } catch (e) {}
  }
  // shadow DOM (usercentrics)
  try {
    const r = await page.evaluate(() => {
      const hits = [];
      const walk = (root) => {
        root.querySelectorAll("*").forEach((el) => {
          if (el.shadowRoot) {
            el.shadowRoot.querySelectorAll("button").forEach((b) => {
              if (/akzeptier|accept|zustimm|einverstanden/i.test(b.textContent || "")) {
                b.click();
                hits.push(b.textContent.trim());
              }
            });
            walk(el.shadowRoot);
          }
        });
      };
      walk(document);
      return hits;
    });
    if (r && r.length) clicked.push("shadow:" + r.join("|"));
  } catch (e) {}
  return clicked;
}

async function fullScroll(page) {
  await page.evaluate(async () => {
    const step = 400;
    const h = () => document.documentElement.scrollHeight;
    for (let y = 0; y < h(); y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, h());
    await new Promise((r) => setTimeout(r, 1200));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 900));
  });
  // force-load lazy images
  await page.evaluate(() => {
    document.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
      if (img.dataset.src && !img.src) img.src = img.dataset.src;
      if (img.dataset.srcset && !img.srcset) img.srcset = img.dataset.srcset;
    });
  });
  await page.waitForTimeout(1500);
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ---------- DESKTOP ----------
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "de-DE",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(2500);

  const cookieHits = await killCookies(page);
  console.log("COOKIE CLICKS:", JSON.stringify(cookieHits));
  await page.waitForTimeout(1200);

  await fullScroll(page);
  await killCookies(page);
  await page.waitForTimeout(800);

  const dims = await page.evaluate(() => ({
    sh: document.documentElement.scrollHeight,
    bw: document.body.scrollWidth,
    title: document.title,
  }));
  console.log("DIMS:", JSON.stringify(dims));

  await page.screenshot({ path: path.join(OUT, "wendt-full.png"), fullPage: true });
  console.log("saved wendt-full.png");

  // Section shots in 900px steps
  const total = dims.sh;
  const steps = Math.ceil(total / 900);
  for (let i = 0; i < steps; i++) {
    const y = i * 900;
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(900);
    const n = String(i + 1).padStart(2, "0");
    await page.screenshot({ path: path.join(OUT, `wendt-${n}.png`) });
  }
  console.log("saved", steps, "section shots");

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  // ---------- MOBILE ----------
  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: "de-DE",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const mpage = await mctx.newPage();
  await mpage.goto(URL, { waitUntil: "load", timeout: 90000 });
  await mpage.waitForTimeout(2500);
  await killCookies(mpage);
  await mpage.waitForTimeout(1000);
  await fullScroll(mpage);
  await killCookies(mpage);
  await mpage.waitForTimeout(800);
  const mdims = await mpage.evaluate(() => ({ sh: document.documentElement.scrollHeight }));
  console.log("MOBILE DIMS:", JSON.stringify(mdims));
  await mpage.screenshot({ path: path.join(OUT, "wendt-m-full.png"), fullPage: true });
  console.log("saved wendt-m-full.png");

  await browser.close();
})();
