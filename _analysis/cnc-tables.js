const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE' });
  const page = await ctx.newPage();
  await page.goto('https://cnc-schoebel.de/maschinenpark/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  try { await page.waitForLoadState('networkidle', { timeout: 25000 }); } catch (e) {}
  await page.waitForTimeout(3000);
  const data = await page.evaluate(() => {
    const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim();
    const out = [];
    document.querySelectorAll('table').forEach(tb => {
      const cap = tb.querySelector('caption');
      out.push({
        caption: cap ? t(cap) : '',
        rows: [...tb.querySelectorAll('tr')].map(tr => [...tr.querySelectorAll('td,th')].map(t))
      });
    });
    // Elementor tabs / accordion / slider titles
    const tabs = [...document.querySelectorAll('.elementor-tab-title,.elementor-accordion-title,.elementor-toggle-title,.e-n-tab-title,.elementor-tab-content h4,.elementor-widget-table-of-contents')].map(t);
    // slider / swiper slide contents
    const slides = [...document.querySelectorAll('.swiper-slide')].map(s => ({ cls: (s.className || '').toString().slice(0, 90), txt: t(s).slice(0, 200), bg: getComputedStyle(s.querySelector('.swiper-slide-bg') || s).backgroundImage.slice(0, 200) }));
    return { tables: out, tabs, slides };
  });
  fs.writeFileSync(path.join(__dirname, 'cnc-data', 'maschinenpark-tables.json'), JSON.stringify(data, null, 2));
  data.tables.forEach((tb, i) => {
    console.log('\n===== TABLE ' + (i + 1) + (tb.caption ? ' [' + tb.caption + ']' : ''));
    tb.rows.forEach(r => console.log('  ' + r.join('  ||  ')));
  });
  console.log('\n===== TAB/ACCORDION TITLES'); data.tabs.forEach(x => console.log('  ' + x));
  console.log('\n===== SLIDES (' + data.slides.length + ')'); data.slides.forEach(s => console.log('  ' + s.cls + ' | ' + s.txt + ' | ' + s.bg));
  await browser.close();
})();
