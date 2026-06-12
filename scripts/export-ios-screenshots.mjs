/**
 * Export Ask Quran iOS App Store screenshots to AllAssets/
 * Renders the design canvas via HTTP + Puppeteer, clips each dc-card at native size.
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SERVE_DIR = path.join(ROOT, 'StoreAssets', 'design-kit');
const OUT_DIR = path.join(ROOT, 'AllAssets');
fs.mkdirSync(OUT_DIR, { recursive: true });

const MIME = { '.html':'text/html', '.jsx':'application/javascript', '.js':'application/javascript', '.css':'text/css' };
function startServer(dir, port) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const file = path.join(dir, decodeURIComponent(req.url.split('?')[0]));
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' });
        res.end(data);
      });
    });
    srv.listen(port, () => resolve(srv));
  });
}

const SCREENS = ['ask','names','recite','browse','facts'];
const NAMES   = { ask:'Ask', names:'99Names', recite:'Recite', browse:'Browse', facts:'Facts' };

const ARTBOARDS = [
  ...SCREENS.map((k,i) => ({ slot:`d69-${k}`,  file:`iPhone-6.9-dark-${i+1}-${NAMES[k]}.png` })),
  ...SCREENS.map((k,i) => ({ slot:`p65-${k}`,  file:`iPhone-6.5-${i+1}-${NAMES[k]}.png` })),
  ...SCREENS.map((k,i) => ({ slot:`ipad-${k}`, file:`iPad-13-${i+1}-${NAMES[k]}.png` })),
  { slot:'ic-master', file:'AppStore-Icon-1024.png' },
];

async function run() {
  const srv = await startServer(SERVE_DIR, 7790);
  console.log('Server started');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  const page = await browser.newPage();
  // Wide viewport so the canvas can lay out; we'll clip each artboard
  await page.setViewport({ width: 1800, height: 900, deviceScaleFactor: 1 });

  console.log('Loading design…');
  await page.goto('http://localhost:7790/Ask%20Quran%20-%20iOS%20Store%20Assets.html', {
    waitUntil: 'networkidle0', timeout: 60000,
  });
  console.log('Waiting for React + Babel…');
  await new Promise(r => setTimeout(r, 7000));

  const count = await page.evaluate(() => document.querySelectorAll('[data-dc-slot]').length);
  console.log(`Found ${count} artboard slots\n`);

  let done = 0;
  for (const ab of ARTBOARDS) {
    console.log(`[${++done}/${ARTBOARDS.length}] ${ab.file}`);

    // Get the bounding rect of the .dc-card (the native-size artboard element)
    const rect = await page.evaluate((slot) => {
      const wrapper = document.querySelector(`[data-dc-slot="${slot}"]`);
      if (!wrapper) return null;
      const card = wrapper.querySelector('.dc-card') || wrapper.firstElementChild;
      if (!card) return null;
      const r = card.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    }, ab.slot);

    if (!rect || rect.w < 10) {
      console.warn(`  ⚠ Slot "${ab.slot}" not found — skipping\n`);
      continue;
    }

    // Expand viewport to encompass the artboard (it may be far down the page)
    await page.setViewport({
      width: Math.ceil(rect.x + rect.w) + 20,
      height: Math.ceil(rect.y + rect.h) + 20,
      deviceScaleFactor: 1,
    });
    await new Promise(r => setTimeout(r, 200));

    const outPath = path.join(OUT_DIR, ab.file);
    await page.screenshot({
      path: outPath,
      clip: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.w), height: Math.round(rect.h) },
    });
    console.log(`  ✔ ${Math.round(rect.w)}×${Math.round(rect.h)}\n`);
  }

  await browser.close();
  srv.close();

  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png'));
  console.log(`\n✅ AllAssets/ now has ${files.length} PNG files total`);
}

run().catch(e => { console.error(e); process.exit(1); });
