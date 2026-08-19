const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, 'assets', 'cnc');
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'https://cnc-schoebel.de/wp-content/uploads/';
const FILES = [
  // logo + icon + favicon + fonts
  '2024/05/Schoebel-CNC_Logo.png',
  '2024/06/Schoebel_Icon.png',
  '2024/06/cropped-Favicon_Schoebel.jpg',
  '2024/05/Prompt-Bold.ttf',
  '2024/05/Prompt-Light.ttf',
  // hero / section images
  '2024/06/Schoebel_Zerspanung_Start.jpg',
  '2024/05/Schoebel_Bauteile_Fertigung.jpg',
  '2024/05/Schoebel_Fertigung_Kontakt.jpg',
  '2024/08/Hermle_Automation_Kontakt.jpg',
  '2024/06/Schoebel_Automation.jpg',
  '2024/06/Schoebel_Hermle_Aluminium.jpg',
  '2024/05/Schoebel_Oberflaechenbearbeitung.jpg',
  '2024/06/Schoebel_CNC_Baugruppenmontage.jpg',
  '2024/06/Schoebel_Service.jpg',
  // produktion cards
  '2024/06/Schoebel_CNC-Fraesen.png',
  '2024/06/Schoebel_CAM-Programmierung.png',
  '2024/07/Schoebel_CNC-Drehen.jpg',
  '2024/06/Schoebel_Serienfertigung.jpg',
  '2024/06/Schoebel_Lager.png',
  '2024/06/Schoebel_Zuschnitt.png',
  '2024/07/Schoebel_Gleitschleifen_Aluminium.jpg',
  '2024/07/Schoebel_chemische_Oberflaechenbearbeitung.jpg',
  // fertigungsteile gallery
  '2024/07/Schoebel_Baugruppe_Getriebe.jpg',
  '2024/07/Schoebel_Lagerblock.jpg',
  '2024/07/Schoebel_Pnaumatikanlage.jpg',
  '2024/07/Schoebel_Vorrichtungsbau.jpg',
  // projekte slider
  '2024/06/Schoebel_Projekte1.jpg',
  '2024/06/Schoebel_Projekte2.jpg',
  '2024/06/Schoebel_Projekte3.jpg',
  '2024/06/Schoebel_Projekte4.jpg',
  '2024/06/Schoebel_Projekte5.jpg',
  '2024/06/Schoebel_Projekte6.jpg',
  '2024/06/Schoebel_Projekte7.jpg',
  '2024/06/Schoebel_Projekte8.jpg',
  '2024/06/Schoebel_Projekte9.jpg',
  // team + cert
  '2024/07/Geschaeftsfuehrung-Schoebel_Martin-Herzog.jpg',
  '2024/07/Geschaeftsfuehrung-Schoebel_Johannes-Seilbeck.jpg',
  '2024/08/Schoebel-Zertifikat-2024-1.png',
];

function get(url, dest, redirects = 0) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Referer': 'https://cnc-schoebel.de/' }
    }, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 5) {
        res.resume(); return resolve(get(new URL(res.headers.location, url).href, dest, redirects + 1));
      }
      if (res.statusCode !== 200) { res.resume(); return resolve({ url, status: res.statusCode, size: 0 }); }
      const ws = fs.createWriteStream(dest);
      res.pipe(ws);
      ws.on('finish', () => ws.close(() => resolve({ url, status: 200, size: fs.statSync(dest).size, file: path.basename(dest) })));
    });
    req.on('error', e => resolve({ url, status: 'ERR ' + e.message, size: 0 }));
    req.setTimeout(45000, () => { req.destroy(); resolve({ url, status: 'TIMEOUT', size: 0 }); });
  });
}

(async () => {
  const report = [];
  for (const f of FILES) {
    const url = BASE + f;
    const name = f.split('/').pop();
    const r = await get(url, path.join(OUT, name));
    report.push(r);
    console.log((r.status === 200 ? 'OK  ' : 'FAIL') + ' ' + String(r.size).padStart(9) + '  ' + name + '  ' + (r.status !== 200 ? r.status : ''));
  }
  fs.writeFileSync(path.join(OUT, '_download-report.json'), JSON.stringify(report, null, 2));
  const total = report.reduce((a, b) => a + (b.size || 0), 0);
  console.log('TOTAL BYTES', total);
})();
