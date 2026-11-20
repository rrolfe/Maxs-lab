// Offline: load the lab once online (so the service worker can save it), then turn the network OFF and check that every screen still opens,
// every picture and data file loads, the pearls keep adding up and they are still there after a reload and a restart.
// Usage: node tools/tests/offline.mjs [device]   (LAB_URL must be an address the service worker can run on: localhost or https)
import { createRequire } from 'module';
import { execSync } from 'child_process';
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW_PATH || require('path').join(execSync('npm root -g').toString().trim(), 'playwright'));
const BASE = process.env.LAB_URL || 'http://127.0.0.1:8767/';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const device = process.argv[2] || 'ipad';
const ROUTES = ['home', 'quiz', 'patterns', 'read', 'boise', 'words', 'hangman', 'baseball', 'chores', 'checkin', 'stands', 'stands/lemonade', 'stands/icecream', 'stands/snack', 'world', 'passport', 'grownup', 'credits'];

const browser = await chromium.launch();
const ctx = await browser.newContext(device === 'phone' ? { ...devices['iPhone 13'] } : { ...devices['iPad Pro 11 landscape'] });
const page = await ctx.newPage();
const errors = [], failed = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' && /module|import|Failed to fetch/i.test(m.text())) errors.push('console: ' + m.text().slice(0, 120)); });
page.on('requestfailed', (r) => { const u = r.url(); if (!/tiles?\.|arcgis|earthdata|eox\.at/.test(u)) failed.push(u.replace(BASE, '')); });
await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); if (!localStorage.getItem('mll2:v1:state')) localStorage.setItem('mll2:v1:state', JSON.stringify({ lang: 'en', theme: 'day' })); } });

// ---- online: the first visit
await page.goto(BASE + '#/home'); await page.waitForSelector('.hud');
await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload(); await page.waitForSelector('.hud');
ok(await page.evaluate(() => !!navigator.serviceWorker.controller), 'the service worker is running');
// give the saved copy a moment to finish (this is what happens while he plays before the trip)
await page.waitForTimeout(6000);
const cached = await page.evaluate(async () => { const ks = await caches.keys(); let n = 0; for (const k of ks) n += (await (await caches.open(k)).keys()).length; return n; });
console.log('saved files after the first visit:', cached);

// ---- offline from here on
await ctx.setOffline(true);
await page.reload(); await page.waitForSelector('.hud', { timeout: 8000 }).catch(() => {});
ok(await page.locator('.hud').count() === 1, 'the lab opens with no internet');
const bad = [];
for (const r of ROUTES) {
  const before = errors.length;
  await page.evaluate((r) => { location.hash = '#/' + r; }, r); await page.waitForTimeout(700);
  const st = await page.evaluate(() => { const h = document.querySelector('[data-screen]'); return { screen: h && h.dataset.screen, broke: /Something went wrong/.test(document.body.innerText) }; });
  if (st.broke || st.screen !== r.split('/')[0] || errors.length > before) bad.push(r + (st.broke ? ' (error screen)' : errors.length > before ? ' (' + errors[errors.length - 1].slice(0, 70) + ')' : ' (not shown)'));
}
ok(bad.length === 0, 'every screen opens offline' + (bad.length ? ': ' + bad.join(' | ') : ` (${ROUTES.length} screens)`));
// pictures: the hero photos, the Boise pictures, the world's places
await page.evaluate(() => { location.hash = '#/passport'; }); await page.waitForTimeout(800);
const imgs = await page.evaluate(async () => { const out = { ok: 0, bad: 0 }; for (const im of document.images) { if (!im.complete) await new Promise((r) => { im.onload = im.onerror = r; setTimeout(r, 2500); }); (im.naturalWidth ? out.ok++ : out.bad++); } return out; });
ok(imgs.bad === 0, `passport pictures all load offline (${imgs.ok} ok, ${imgs.bad} missing)`);
// a sample of every kind of file the lab uses
const files = await page.evaluate(async () => { const all = ['data/boise.js', 'data/people.js', 'data/places.js', 'data/facts.js', 'data/questions.en.js', 'data/questions.es.js', 'data/land.js', 'data/packs.js', 'data/placeqs.js', 'img/people/' + 'x', 'icons/icon-192.png', 'manifest.webmanifest']; const res = []; for (const f of all) { if (f.endsWith('/x')) continue; try { const r = await fetch(f); res.push([f, r.ok]); } catch { res.push([f, false]); } } return res; });
ok(files.every(([, k]) => k), 'data files load offline' + (files.some(([, k]) => !k) ? ': missing ' + files.filter(([, k]) => !k).map(([f]) => f).join(', ') : ` (${files.length} checked)`));

// every single file the service worker is told to save must really be saved (this is the whole lab, not a sample)
const ALLFILES = JSON.parse(execSync(`node -e "const s=require('fs').readFileSync('sw.js','utf8');console.log(JSON.stringify(JSON.parse(s.match(/const ALL = (\\[[\\s\\S]*?\\]);/)[1])))"`, { cwd: new URL('../../', import.meta.url).pathname }).toString());
const missing = await page.evaluate(async (list) => { const bad = []; for (const f of list) { const r = await fetch(f).catch(() => null); if (!r || !r.ok) bad.push(f); } return bad; }, ALLFILES);
ok(missing.length === 0, `all ${ALLFILES.length} files are saved on the device` + (missing.length ? ': missing ' + missing.slice(0, 5).join(', ') : ''));
// real pictures on screen: Boise places and the people photos
for (const r of ['boise', 'passport', 'chores']) {
  await page.evaluate((r) => { location.hash = '#/' + r; }, r); await page.waitForTimeout(900);
  const pics = await page.evaluate(async () => { const out = { ok: 0, bad: 0 }; for (const im of document.images) { if (!im.complete) await new Promise((r) => { im.onload = im.onerror = r; setTimeout(r, 2500); }); if (im.naturalWidth > 0) out.ok++; else out.bad++; } return out; });
  ok(pics.bad === 0, `${r}: pictures on screen load offline (${pics.ok} ok, ${pics.bad} broken)`);
}
// the Grown-up corner says the lab is saved and that it is offline right now
await page.evaluate(() => { location.hash = '#/grownup'; }); await page.waitForTimeout(1200);
const gtxt = await page.evaluate(() => document.body.innerText);
ok(/Ready for no internet/.test(gtxt) && /Everything is saved/.test(gtxt), 'Grown-up corner: "Ready for no internet" says everything is saved');
ok(/Right now: offline/.test(gtxt), 'Grown-up corner: knows it is offline right now');
ok(await page.locator('.offsteps').count() >= 2, 'Grown-up corner: tips are shown');

// ---- play offline: earn pearls, check they stay
await page.evaluate(() => { location.hash = '#/home'; }); await page.waitForTimeout(400);
const p0 = await page.evaluate(() => window.__lab.S.pearls.balance);
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; st.addPearls(7); st.save(); });
const p1 = await page.evaluate(() => window.__lab.S.pearls.balance);
ok(p1 > p0, `pearls go up while offline (${p0} → ${p1})`);
await page.reload(); await page.waitForSelector('.hud', { timeout: 8000 });
ok(await page.evaluate(() => window.__lab.S.pearls.balance) === p1, 'the pearls are still there after a reload, offline');
// a real quiz answer, offline
await page.evaluate(() => { location.hash = '#/quiz'; }); await page.waitForTimeout(900);
const opt = page.locator('.opt, .answer, [data-opt], .qopt').first();
if (await opt.count()) { await opt.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(500); }
ok(errors.length === 0, 'no errors while offline' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
if (failed.length) console.log('requests that failed offline:', [...new Set(failed)].slice(0, 25).join(', '), failed.length > 25 ? `… (${failed.length})` : '');
ok(failed.length === 0, 'nothing the lab needs was missing offline (' + new Set(failed).size + ' different files)');

// ---- back online: nothing was lost
await ctx.setOffline(false); await page.reload(); await page.waitForSelector('.hud');
ok(await page.evaluate(() => window.__lab.S.pearls.balance) >= p1, 'back online, the pearls are all still there');
await browser.close();
console.log(fails ? `\n${fails} FAILED` : '\nALL OK'); process.exit(fails ? 1 : 0);
