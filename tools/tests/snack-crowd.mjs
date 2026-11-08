// Crowd size bands by ball field (Rob, Nov 8 2026): 1 field 10-50, 2 fields 50-100, 3 fields 100-200, 4 fields 200-400 (then 400-800, 800-1600).
import { open } from './lib.mjs';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land';
const { page, browser, errors } = await open({ lang, device });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);

// 1. the numbers: every weather and every upgrade mix stays inside the band, and a bigger field count is never smaller than the best of the one before
const r = await page.evaluate(async () => {
  const m = await import('./js/stands/sims.js');
  const F = ['field2', 'field3', 'field4', 'field5', 'field6'], ALL = ['sign', 'grill', 'fryer', 'cooler', 'window2', 'jerseys', 'cook'];
  const bands = [[10, 50], [50, 100], [100, 200], [200, 400], [400, 800], [800, 1600]];
  const out = [];
  for (let n = 0; n <= 5; n++) {
    let lo = 1e9, hi = 0;
    for (const extra of [[], ALL]) {
      const up = Object.fromEntries([...F.slice(0, n), ...extra].map((u) => [u, 1]));
      for (const weather of ['rainy', 'cloudy', 'sunny', 'hot']) for (const event of [null, 'game', 'party']) {
        const v = m.SNACK.trafficOf({ weather, event, up }); lo = Math.min(lo, v); hi = Math.max(hi, v);
      }
    }
    out.push({ fields: n + 1, lo: Math.round(lo), hi: Math.round(hi), band: bands[n] });
  }
  return out;
});
for (const x of r) ok(x.lo >= x.band[0] - 0.5 && x.hi <= x.band[1] * 1.1 + 0.5, `${x.fields} field(s): ${x.lo}-${x.hi} people a day fits ${x.band.join('-')}`);
for (let i = 1; i < r.length; i++) ok(r[i].lo >= r[i - 1].lo * 0.99 && r[i].lo >= r[i - 1].band[1] * 0.95, `${r[i].fields} fields, worst day (${r[i].lo}) is as big as ${r[i - 1].fields} fields' good day`);

// 2. the screen: forecast goes up as fields are bought, and the food order grows with it
const seed = (up) => page.evaluate(async (up) => { const st = await import('./js/core/store.js'); st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; st.S.unlocked.snack = true; st.S.stands.snack = { tickets: 1, bank: 5000, up, season: { no: 2, day: 0 }, seasons: 2 }; st.flush && st.flush(); }, up);
const forecast = async () => { await page.evaluate(() => { location.hash = '#/stands/snack'; }); await w(700); const tx = await page.locator('.crowdhint').first().innerText(); const n = parseInt(tx.replace(/[^0-9~]/g, '').replace('~', ''), 10);
  const stock = await page.evaluate(() => Object.values(window.__lab.S.stands.snack.mstock || {}).reduce((a, b) => a + b, 0)); return { n, stock }; };
await seed({ sign: 1, grill: 1 }); const a = await forecast();
await seed({ sign: 1, grill: 1, field2: 1 }); await page.reload(); await w(600); const b = await forecast();
await seed({ sign: 1, grill: 1, field2: 1, field3: 1 }); await page.reload(); await w(600); const c = await forecast();
console.log('  forecast / total stock:', JSON.stringify({ a, b, c }));
ok(a.n >= 10 && a.n <= 50, `1 field forecast ${a.n} is 10-50`);
ok(b.n >= 50 && b.n <= 110, `2 fields forecast ${b.n} is about 50-100`);
ok(c.n >= 100 && c.n <= 220, `3 fields forecast ${c.n} is about 100-200`);
ok(c.n > b.n && b.n > a.n, 'each extra field shows more customers');

// 3. buying a field on the plan screen lifts the food order so he does not sell out
await seed({ sign: 1, grill: 1, field2: 1 }); await page.reload(); await w(600); const before = await forecast();
await page.evaluate(() => { window.__buy = true; });
await page.locator('button.upg[data-up="field3"]').click(); await w(500);
const after = await page.evaluate(() => Object.values(window.__lab.S.stands.snack.mstock || {}).reduce((x, y) => x + y, 0));
console.log('  stock before/after buying field 3:', before.stock, after);
ok(after > before.stock, 'food order grows after buying a field');
ok(errors.length === 0, 'console clean ' + errors.join('/'));
await browser.close(); process.exit(fails ? 1 : 0);
