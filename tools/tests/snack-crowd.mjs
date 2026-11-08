// Crowd size bands by ball field (Rob, Nov 8 2026): 1 field 10-50, 2 fields 50-100, 3 fields 100-200, 4 fields 200-400, then fields come TWO at a time
// and every pair makes the crowd 4 times bigger (6 fields 800-1,600 ... 12 fields 51,200-102,400). Also merch, legacy 5th/6th-field saves, money format.
import { open } from './lib.mjs';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land';
const { page, browser, errors } = await open({ lang, device });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);

// 1. the numbers
const r = await page.evaluate(async () => {
  const m = await import('./js/stands/sims.js');
  const STEPS = [[], ['field2'], ['field2', 'field3'], ['field2', 'field3', 'field4'], ['field2', 'field3', 'field4', 'fields56'], ['field2', 'field3', 'field4', 'fields56', 'fields78'],
    ['field2', 'field3', 'field4', 'fields56', 'fields78', 'fields910'], ['field2', 'field3', 'field4', 'fields56', 'fields78', 'fields910', 'fields1112']];
  const ALL = ['sign', 'grill', 'fryer', 'cooler', 'window2', 'jerseys', 'cook', 'mascot'];
  return STEPS.map((fields) => {
    let lo = 1e12, hi = 0;
    for (const extra of [[], ALL]) {
      const up = Object.fromEntries([...fields, ...extra].map((u) => [u, 1]));
      for (const weather of ['rainy', 'cloudy', 'sunny', 'hot']) for (const event of [null, 'closeGame', 'homeRun', 'rainDelay', 'bigCrowd']) {
        const v = m.SNACK.trafficOf({ weather, event, up }); lo = Math.min(lo, v); hi = Math.max(hi, v);
      }
    }
    const up = Object.fromEntries(fields.map((u) => [u, 1]));
    return { n: m.fieldsOwned(up), lo: Math.round(lo), hi: Math.round(hi), band: m.crowdBand(m.fieldsOwned(up)), cap: m.SNACK.serveCap(up), stock: m.SNACK.stockMax(up) };
  });
});
const want = { 1: [10, 50], 2: [50, 100], 3: [100, 200], 4: [200, 400], 6: [800, 1600], 8: [3200, 6400], 10: [12800, 25600], 12: [51200, 102400] };
for (const x of r) {
  console.log(`  ${x.n} fields: ${x.lo}-${x.hi} a day, serve cap ${x.cap}, stock max ${x.stock}`);
  ok(JSON.stringify(x.band) === JSON.stringify(want[x.n]), `${x.n} field(s): band ${x.band.join('-')} is ${want[x.n].join('-')}`);
  ok(x.lo >= x.band[0] - 0.5 && x.hi <= x.band[1] * 1.1 + 0.5, `${x.n} field(s): ${x.lo}-${x.hi} stays inside the band`);
  ok(x.cap >= x.band[1] * 0.75 && x.stock >= x.band[1] * 0.75, `${x.n} field(s): serving (${x.cap}) and storage (${x.stock}) keep up with a normal big day (the window and cook upgrades cover the rest)`);
}
for (let i = 1; i < r.length; i++) ok(r[i].lo >= r[i - 1].hi * 0.95 - 1 || r[i].lo >= r[i - 1].band[1] * 0.95, `${r[i].n} fields, worst day (${r[i].lo}) is as big as ${r[i - 1].n} fields' good day`);
ok(r[4].lo >= 4 * r[3].lo - 1, 'a pair of fields makes the crowd 4 times bigger');

// 2. old saves that had the separate 5th / 6th field are treated as owning the first pair
const old = await page.evaluate(async () => { const m = await import('./js/stands/sims.js'); const up = { field2: 1, field3: 1, field4: 1, field5: 1, field6: 1 }; const n = m.fieldsOwned(up); m.fixLegacyUp(up); return { n, up: Object.keys(up).sort().join(','), n2: m.fieldsOwned(up) }; });
ok(old.n === 6 && old.n2 === 6 && old.up === 'field2,field3,field4,fields56', 'old 5th/6th field saves become the first pair: ' + JSON.stringify(old));

// 3. merch: only on sale after the Merch stand is bought, and it earns more per customer
const m1 = await page.evaluate(async () => {
  const m = await import('./js/stands/sims.js');
  const ids = (up) => m.menuAvail(up).map((x) => x.id).filter((i) => ['pennant', 'finger', 'cap', 'plush', 'shirt'].includes(i)).join(',');
  const avg = (up) => { let s = 7; const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; let t = 0; for (let k = 0; k < 200; k++) t += m.botDay('snack', { weather: 'sunny', event: null, up }, 0.9, rnd).profit; return t / 200; };
  const base = { sign: 1, grill: 1, fryer: 1, field2: 1, field3: 1, field4: 1 };
  return { none: ids(base), one: ids({ ...base, merch: 1 }), two: ids({ ...base, merch: 1, merch2: 1 }), p0: avg(base), p1: avg({ ...base, merch: 1 }), p2: avg({ ...base, merch: 1, merch2: 1 }) };
});
console.log('  merch:', JSON.stringify(m1));
ok(m1.none === '' && m1.one === 'pennant,finger,cap' && m1.two === 'pennant,finger,cap,plush,shirt', 'merch items appear only after buying the merch stands');
ok(m1.p1 > m1.p0 * 1.15 && m1.p2 > m1.p1 * 1.1, 'merch brings clearly bigger profits (' + Math.round(m1.p0) + ' -> ' + Math.round(m1.p1) + ' -> ' + Math.round(m1.p2) + ')');

// 4. money looks right for big numbers
const mon = await page.evaluate(async () => { const d = await import('./js/core/dom.js'); return [d.money(5), d.money(1234.5), d.money(25600), d.money(1234567.891), d.money(-1200)].join(' | '); });
ok(mon === '$5.00 | $1,234.50 | $25,600.00 | $1,234,567.89 | -$1,200.00', 'money format: ' + mon);

// 5. the screen: forecast goes up as fields are bought, and the food order grows with it
const seed = (up) => page.evaluate(async (up) => { const st = await import('./js/core/store.js'); st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; st.S.unlocked.snack = true; st.S.stands.snack = { tickets: 1, bank: 5000, up, season: { no: 2, day: 0 }, seasons: 2 }; st.flush && st.flush(); }, up);
const forecast = async () => { await page.evaluate(() => { location.hash = '#/stands/snack'; }); await w(700); const tx = await page.locator('.crowdhint').first().innerText(); const n = parseInt(tx.replace(/[^0-9]/g, ''), 10);
  const stock = await page.evaluate(() => Object.values(window.__lab.S.stands.snack.mstock || {}).reduce((a, b) => a + b, 0)); return { n, stock }; };
await seed({ sign: 1, grill: 1 }); const a = await forecast();
await seed({ sign: 1, grill: 1, field2: 1 }); await page.reload(); await w(600); const b = await forecast();
await seed({ sign: 1, grill: 1, field2: 1, field3: 1 }); await page.reload(); await w(600); const c = await forecast();
console.log('  forecast / total stock:', JSON.stringify({ a, b, c }));
ok(a.n >= 10 && a.n <= 50, `1 field forecast ${a.n} is 10-50`);
ok(b.n >= 50 && b.n <= 110, `2 fields forecast ${b.n} is about 50-100`);
ok(c.n >= 100 && c.n <= 220, `3 fields forecast ${c.n} is about 100-200`);
ok(c.n > b.n && b.n > a.n, 'each extra field shows more customers');

// 6. buying a field on the plan screen lifts the food order so he does not sell out
await seed({ sign: 1, grill: 1, field2: 1 }); await page.reload(); await w(600); const before = await forecast();
await page.locator('button.upg[data-up="field3"]').click(); await w(500);
const after = await page.evaluate(() => Object.values(window.__lab.S.stands.snack.mstock || {}).reduce((x, y) => x + y, 0));
console.log('  stock before/after buying field 3:', before.stock, after);
ok(after > before.stock, 'food order grows after buying a field');

// 7. a rich player can buy the first pair and the merch stand from the shop, and a huge day plays and ends with a receipt
await seed({ sign: 1, grill: 1, fryer: 1, field2: 1, field3: 1, field4: 1 });
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.stands.snack.bank = 20000; st.flush && st.flush(); });
await page.reload(); await w(700); await page.evaluate(() => { location.hash = '#/stands/snack'; }); await w(700);
await page.locator('button.upg[data-up="merch"]').click(); await w(400);
ok((await page.evaluate(() => window.__lab.S.stands.snack.up.merch)) === 1, 'merch stand can be bought');
ok(!!(await page.$('.mrow')) && (await page.$$('.mrow')).length >= 6, 'merch items show up in the food and merch list: ' + (await page.$$('.mrow')).length);
await page.locator('button.upg[data-up="fields56"]').click(); await w(500);
const n6 = await page.evaluate(async () => { const m = await import('./js/stands/sims.js'); return m.fieldsOwned(window.__lab.S.stands.snack.up); });
ok(n6 === 6, 'the first pair gives 6 fields (' + n6 + ')');
const fc = parseInt((await page.locator('.crowdhint').first().innerText()).replace(/[^0-9]/g, ''), 10);
ok(fc >= 800 && fc <= 1700, 'forecast is now ' + fc + ' (800-1,600)');
await page.locator('.openrow .btn.go').click(); await w(400);
await page.locator('button', { hasText: /Skip to the end|Saltar al final/ }).click(); await w(700);
ok((await page.evaluate(() => document.body.innerText)).match(/profit|ganancia/i) !== null, 'a 1,000-fan day plays and shows a receipt');
ok(errors.length === 0, 'console clean ' + errors.join('/'));
await browser.close(); process.exit(fails ? 1 : 0);
