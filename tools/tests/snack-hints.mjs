// "How did I do last time?" hints on the Snack Shack menu (Rob, Nov 9 2026; UX designer + 1st-grade teacher).
import { open } from './lib.mjs';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land';
const { page, browser, errors } = await open({ lang, device });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);

// 1. the rules
const r = await page.evaluate(async () => {
  const h = await import('./js/stands/hints.js'), s = await import('./js/stands/sims.js');
  const v = (made, sold, out) => h.verdictOf({ made, sold, out }).kind;
  const b = (x) => h.bucketOf(x)?.key;
  const dem = s.SNACK.demand({ weather: 'sunny', event: null, up: { field2: 1 } }, 'normal');
  return { v: [v(100, 100, 40), v(100, 100, 0), v(100, 60, 0), v(100, 95, 3), v(0, 0, 0), v(5, 5, 1), v(10, 7, 0)], b: [3, 2, 1.4, 1, 0.7, 0.5, 0.1].map(b), a: [7, 340, 1234, 12400, 100000, 2400000, 5e9].map((n) => h.about(n)), dem: Object.keys(dem).length >= 3 && Object.values(dem).every((x) => x > 0) };
});
console.log('  ', JSON.stringify(r));
ok(r.v.join() === 'short,right,extra,right,none,right,extra', 'verdicts: ' + r.v.join());
ok(r.b.join() === 'up3,up2,up1,same,dn1,dn2,dn3', 'crowd buckets: ' + r.b.join());
ok(r.dem, 'expected demand per item exists');
if (lang === 'en') ok(r.a.join(' | ') === '7 | about 340 | about 1,200 | about 12 thousand | about 100 thousand | about 2.4 million | about 5 billion', 'numbers in words: ' + r.a.join(' | '));
else ok(/unos 340/.test(r.a[1]) && /mil/.test(r.a[3]) && /millones/.test(r.a[5]), 'numbers in Spanish words: ' + r.a.join(' | '));

// 2. first day: no chips, one dashed line
const seed = (extra = {}) => page.evaluate(async (extra) => { const st = await import('./js/core/store.js'); st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; st.S.unlocked.snack = true;
  st.S.stands.snack = { tickets: 1, bank: 90000, up: { sign: 1, grill: 1, fryer: 1, field2: 1, field3: 1 }, perks: {}, season: { no: 1, day: 3 }, seasons: 1, level: 'normal', next: { weather: 'sunny', event: null }, mstock: { hotdog: 100, drink: 100, chips: 100, burger: 100 }, ...extra }; st.flush && st.flush(); }, extra);
const open2 = async () => { await page.reload(); await w(500); await page.evaluate(() => { location.hash = '#/stands/snack'; }); await w(800); };
await seed(); await open2();
ok((await page.$$('.hint')).length === 0 && !!(await page.$('.hintnone')), 'first day: no chips, one line saying they will appear after today');

// 3. with history
const items = { hotdog: { made: 250, sold: 120, out: 0, dem: 40 }, drink: { made: 60, sold: 60, out: 1450, dem: 150 }, chips: { made: 40, sold: 40, out: 1, dem: 30 } };
await seed({ lastItems: items, lastCtx: { exp: 100, level: 'normal', fields: 3, stadium: 0 } }); await open2();
const kinds = await page.evaluate(() => [...document.querySelectorAll('.mrow')].map((r) => [r.querySelector('.mname strong')?.textContent, [...r.querySelectorAll('.hint')].map((x) => x.className.replace('hint ', '')).join('|')]));
console.log('  ', JSON.stringify(kinds));
const byName = Object.fromEntries(kinds.map(([n, c]) => [n, c]));
const rows = kinds.map((k) => k[1]);
ok(rows[0].startsWith('last extra') && rows[1].startsWith('last short') && rows[2].startsWith('last right'), 'last-time chips: left over / ran out / just right');
ok(rows[3].startsWith('last new'), 'an item with no history says New!');
ok(rows[0].includes('fans ') && !rows[3].includes('fans up'), 'every item with history also gets a Fans today chip');
ok(!(await page.$('.mrow.dim')), 'not dimmed when the park is the same size');
ok(!!(await page.$('.crowdcmp')), 'the forecast card compares today with last time');
// tap the ran-out chip: exact numbers and "use again"
await page.locator('.mrow').nth(1).locator('.hint.last').click(); await w(200);
const det = await page.locator('.mdetail:visible').innerText();
ok(/60/.test(det) && /1,510/.test(det), 'tapping shows exact numbers: ' + det.replace(/\n/g, ' '));
await page.locator('.mdetail:visible button').click(); await w(200);
ok((await page.evaluate(() => window.__lab.S.stands.snack.mstock.drink)) === 60, '"use again" puts last time\'s amount back');
// dim when the park got bigger
await seed({ lastItems: items, lastCtx: { exp: 100, level: 'normal', fields: 1, stadium: 0 } }); await open2();
ok(!!(await page.$('.mrow.dim')), 'chips are dimmed when the park is bigger than last time');

// 4. play a day: the receipt lists every item, and tomorrow's plan has chips
await seed(); await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.stands.snack.mstock = { hotdog: 20, drink: 10, chips: 400, burger: 20 }; st.flush && st.flush(); }); await open2();
await page.locator('.openrow .btn.go').click(); await w(400);
await page.locator('button', { hasText: /Skip to the end|Saltar al final/ }).click(); await w(900);
const rc = await page.evaluate(() => ({ items: document.querySelectorAll('.itemsdone .irow').length, chips: document.querySelectorAll('.itemsdone .hint').length, saved: Object.keys(window.__lab.S.stands.snack.lastItems || {}).length, ctx: !!window.__lab.S.stands.snack.lastCtx?.exp }));
ok(rc.items >= 3 && rc.chips === rc.items && rc.saved >= 3 && rc.ctx, 'the receipt shows how each item did (' + JSON.stringify(rc) + ')');
await page.locator('.openrow .btn.go').click(); await w(700);
ok((await page.$$('.mrow .hint.last')).length >= 3, 'the next plan shows last-time chips');
ok(errors.length === 0, 'console clean ' + errors.join('/'));
await browser.close(); process.exit(fails ? 1 : 0);
