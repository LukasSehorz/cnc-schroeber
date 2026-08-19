const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true,
    userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'});
  const page = await ctx.newPage();
  try { await page.goto('https://uptivemfg.com/', {waitUntil:'load',timeout:45000}); } catch(e){ await page.goto('https://uptivemfg.com/',{waitUntil:'domcontentloaded',timeout:40000}); }
  await page.waitForTimeout(3000);
  const before = await page.evaluate(() => {
    const cs=e=>getComputedStyle(e); const hx=c=>{const m=(c||'').match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s\/]+([\d.]+))?/);if(!m)return c;if(m[4]!==undefined&&+m[4]===0)return 'transparent';return '#'+[m[1],m[2],m[3]].map(x=>Math.round(+x).toString(16).padStart(2,'0')).join('');};
    const o={};
    const h=document.querySelector('#site-header'); o.header={h:Math.round(h.getBoundingClientRect().height), bg:hx(cs(h).backgroundColor), pos:cs(h).position};
    const b=document.querySelector('#announcment-banner'); o.banner={display:cs(b).display};
    const logo=document.querySelector('#site-logo'); o.logo={w:Math.round(logo.getBoundingClientRect().width),h:Math.round(logo.getBoundingClientRect().height),x:Math.round(logo.getBoundingClientRect().left)};
    const tog=document.querySelector('#nav-toggle,[class*="toggle"],header button'); if(tog){const r=tog.getBoundingClientRect();o.toggle={cls:(typeof tog.className==='string'?tog.className:''),w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.left),color:hx(cs(tog).color)};}
    const hero=document.querySelector('#hero'); o.hero={h:Math.round(hero.getBoundingClientRect().height),pad:cs(hero).padding};
    const h1=document.querySelector('h1'); const s1=cs(h1); o.h1={size:s1.fontSize,lh:s1.lineHeight,w:s1.fontWeight};
    const h2=document.querySelector('.headline'); const s2=cs(h2); o.h2={size:s2.fontSize,lh:s2.lineHeight,w:s2.fontWeight,ls:s2.letterSpacing};
    const pc=document.querySelector('.p-container'); o.pContainer={w:Math.round(pc.getBoundingClientRect().width),pad:cs(pc).padding};
    const btn=document.querySelector('.btn'); const sb=cs(btn); o.btn={pad:sb.padding,w:Math.round(btn.getBoundingClientRect().width),h:Math.round(btn.getBoundingClientRect().height),r:sb.borderRadius,size:sb.fontSize};
    const secs=[...(document.querySelector('main')||document.body).children].map(e=>({h:Math.round(e.getBoundingClientRect().height),pad:cs(e).padding}));
    o.sectionPads=secs.slice(0,8);
    const grid=document.querySelector('.md\\:grid, [class*="grid-cols"]'); if(grid) o.gridOnMobile={disp:cs(grid).display,cols:cs(grid).gridTemplateColumns};
    o.docH=document.body.scrollHeight;
    return o;
  });
  // open menu
  let menu = null;
  for (const sel of ['#nav-toggle','[aria-label*="menu" i]','button[class*="menu"]','[class*="hamburger"]','#site-header button','header button']) {
    const b = await page.$(sel); if (b) { await b.click({timeout:4000}).catch(()=>{}); await page.waitForTimeout(1000);
      menu = await page.evaluate(() => {
        const cs=e=>getComputedStyle(e); const hx=c=>{const m=(c||'').match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);return m?'#'+[m[1],m[2],m[3]].map(x=>Math.round(+x).toString(16).padStart(2,'0')).join(''):c;};
        const oc=document.querySelector('#offcanvas'); if(!oc) return null; const s=cs(oc),r=oc.getBoundingClientRect();
        const link=oc.querySelector('.nav-link.lv-1'); const ls=link?cs(link):null;
        const rfq=oc.querySelector('#nav-rfq-btn'); const rs=rfq?cs(rfq):null;
        return { offcanvas:{box:`${Math.round(r.width)}x${Math.round(r.height)}`,bg:hx(s.backgroundColor),pos:s.position,pad:s.padding,top:Math.round(r.top)},
          navLink: ls?{font:`${ls.fontFamily.split(',')[0]} ${ls.fontSize}/${ls.lineHeight} w${ls.fontWeight} ${ls.textTransform} ls:${ls.letterSpacing}`,color:hx(ls.color),pad:ls.padding,box:`${Math.round(link.getBoundingClientRect().width)}x${Math.round(link.getBoundingClientRect().height)}`}:null,
          navList: (()=>{const ul=oc.querySelector('#nav-menu, ul'); return ul?{bg:hx(cs(ul).backgroundColor),pad:cs(ul).padding}:null;})(),
          rfq: rs?{bg:hx(rs.backgroundColor),color:hx(rs.color),pad:rs.padding,r:rs.borderRadius,box:`${Math.round(rfq.getBoundingClientRect().width)}x${Math.round(rfq.getBoundingClientRect().height)}`}:null };
      });
      if (menu) break; }
  }
  fs.writeFileSync(__dirname+'/measure-mobile.json', JSON.stringify({before,menu},null,2));
  console.log(JSON.stringify({before,menu},null,2));
  await browser.close();
})();
