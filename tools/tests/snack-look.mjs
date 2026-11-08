// Sports venues, the 3-level Stadium (triples the crowd, new look), night games, huge-crowd sim, and the surprises / Easter eggs (Rob, Nov 8 2026).
import { open } from './lib.mjs';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land';
const { page, browser, errors } = await open({ lang, device });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);
const F = { field2: 1, field3: 1, field4: 1, fields56: 1 };
const base = { sign: 1, grill: 1, fryer: 1, ...F };

// 1. numbers: sports are one more field each, the stadium triples per level
const n = await page.evaluate(async (base) => {
  const m = await import('./js/stands/sims.js');
  const mid = (up) => { const c = { weather: 'cloudy', event: null, up }; return m.SNACK.trafficOf(c); };
  const o = { f6: mid(base), bb: mid({ ...base, basketball: 1 }), bbsoc: mid({ ...base, basketball: 1, soccer: 1 }), st1: mid({ ...base, stadium: 1 }), st2: mid({ ...base, stadium: 1, stadium2: 1 }), st3: mid({ ...base, stadium: 1, stadium2: 1, stadium3: 1 }) };
  o.fields = { bb: m.fieldsOwned({ ...base, basketball: 1 }), all4: m.fieldsOwned({ ...base, basketball: 1, soccer: 1, football: 1, tennis: 1 }) };
  o.looks = [{}, { field2: 1, field3: 1 }, { stadium: 1 }, { stadium: 1, stadium2: 1 }, { stadium: 1, stadium2: 1, stadium3: 1 }].map((u) => m.lookOf(u)).join(',');
  const none = (up) => m.menuAvail(up).map((x) => x.id).filter((i) => ['pretzel', 'orange', 'nachos', 'berries', 'cocoa'].includes(i)).join(',');
  o.menu = [none(base), none({ ...base, basketball: 1, soccer: 1, football: 1, tennis: 1 }), none({ ...base, stadium2: 1 })];
  // night games only with floodlights
  let sNo = 0, sYes = 0, k = 0; const rnd = () => { k = (k * 1664525 + 1013904223) >>> 0; return k / 4294967296; };
  for (let i = 0; i < 400; i++) { if (m.rollDay(rnd, base, 'snack').event === 'nightGame') sNo++; if (m.rollDay(rnd, { ...base, stadium2: 1 }, 'snack').event === 'nightGame') sYes++; }
  o.night = { sNo, sYes };
  return o;
}, base);
console.log('  ', JSON.stringify(n));
ok(Math.abs(n.bb / n.f6 - 2) < 0.01 && Math.abs(n.bbsoc / n.bb - 2) < 0.01, 'each sports court / pitch doubles the crowd');
ok(n.fields.bb === 7 && n.fields.all4 === 10, 'sports count as fields: ' + JSON.stringify(n.fields));
ok(Math.abs(n.st1 / n.f6 - 3) < 0.01 && Math.abs(n.st2 / n.st1 - 3) < 0.01 && Math.abs(n.st3 / n.st2 - 3) < 0.01, 'every stadium level triples the crowd');
ok(n.looks === 'sandlot,park,stadium,lights,legend', 'looks: ' + n.looks);
ok(n.menu[0] === '' && n.menu[1] === 'pretzel,orange,nachos,berries' && n.menu[2] === 'cocoa', 'sports snacks and hot cocoa unlock with their upgrades: ' + n.menu.join(' | '));
ok(n.night.sNo === 0 && n.night.sYes > 40 && n.night.sYes < 160, 'night games only with the floodlights (' + n.night.sNo + ' / ' + n.night.sYes + ' of 400)');

// 2. a huge stadium day: the group-simulation keeps the books straight
const big = await page.evaluate(async (base) => {
  const m = await import('./js/stands/sims.js');
  const up = { ...base, field2: 1, fields78: 1, fields910: 1, basketball: 1, soccer: 1, stadium: 1, stadium2: 1, stadium3: 1, merch: 1, merch2: 1, grill: 1, fryer: 1, candy: 1 };
  const ctx = { weather: 'sunny', event: 'nightGame', up };
  const weights = m.snackWeights(ctx), tot = weights.reduce((a, b) => a + b.k, 0), exp = m.SNACK.trafficOf(ctx);
  const stock = {}; for (const x of weights) stock[x.id] = Math.round(exp * 1.1 * x.k / tot);
  const res = m.SNACK.sim({ stock, level: 'normal' }, ctx);
  const sums = Object.keys(res.bySold).every((k) => res.bySold[k] <= stock[k] + res.scale + 1);
  return { n: res.n, exp: Math.round(exp), scale: res.scale, sold: res.sold, stock: Object.values(stock).reduce((a, b) => a + b, 0), sums, profit: res.profit, cost: res.cost, revenue: res.revenue, cust: res.customers.length, finite: Number.isFinite(res.profit) };
}, base);
console.log('  ', JSON.stringify(big));
ok(big.finite && big.revenue > 0 && big.profit > 0, 'a giant stadium night makes money (' + Math.round(big.profit).toLocaleString('en-US') + ')');
ok(big.sums && big.sold <= big.stock + big.scale * 2, 'never sells more than the stock (sold ' + big.sold + ' of ' + big.stock + ')');
ok(big.cust <= 4000 && big.scale > 100, 'only 4,000 stand-ins are simulated for ' + big.n.toLocaleString('en-US') + ' fans');

// 3. the screens
const seed = (up, perks = {}) => page.evaluate(async ({ up, perks }) => { const st = await import('./js/core/store.js'); st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; st.S.unlocked.snack = true; st.S.stands.snack = { tickets: 1, bank: 90000, up, perks, season: { no: 2, day: 3 }, seasons: 2 }; st.flush && st.flush(); }, { up, perks });
const open2 = async () => { await page.reload(); await w(500); await page.evaluate(() => { location.hash = '#/stands/snack'; }); await w(800); };
const info = () => page.evaluate(() => ({ cls: document.querySelector('.stand')?.className, look: document.documentElement.dataset.look || '', sb: !!document.querySelector('.scoreboard'), title: document.querySelector('.stand h1')?.textContent, banner: document.querySelector('.perknew')?.textContent || '', tiles: document.querySelectorAll('.perk').length, got: document.querySelectorAll('.perk.got').length, chompy: !!document.querySelector('.chompy'), horn: !!document.querySelector('.sbhorn') }));

await seed({ sign: 1, grill: 1 }); await open2(); let i = await info();
ok(i.cls.includes('look-sandlot') && !i.sb && !i.banner && !i.chompy, 'few fields: plain sandlot look, no scoreboard, no surprises (' + i.cls + ')');
ok(i.tiles === 7 && i.got === 0, 'the surprise shelf shows 7 mystery tiles');

await seed({ ...base, field2: 1 }); await open2(); i = await info();
ok(i.cls.includes('look-park') && i.chompy && /Chompy|Chompy/.test(i.banner), 'six fields: park look, Chompy shows up and a surprise banner is shown: ' + i.banner.slice(0, 70));
await page.locator('.chompy').click(); await w(200);
ok(await page.locator('.chompysay').isVisible(), 'tapping Chompy shows a fun fact: ' + (await page.locator('.chompysay').innerText()).slice(0, 60));
await page.reload(); await w(600); await page.evaluate(() => { location.hash = '#/stands/snack'; }); await w(800); i = await info();
ok(i.banner === '', 'the surprise banner is shown once only');

await seed({ ...base, stadium: 1, basketball: 1, soccer: 1 }); await open2(); i = await info();
ok(i.cls.includes('look-stadium') && i.look === 'stadium' && i.sb && i.horn, 'stadium: new look, scoreboard and the horn (' + i.cls + ')');
ok(/STADIUM|Stadium|Estadio/i.test(i.title), 'the title becomes "' + i.title + '"');
await page.locator('.sbhorn').click(); await w(200);
await page.locator('.mrow').first().waitFor();
await page.evaluate(() => { document.querySelector('.openrow .btn.go').scrollIntoView(); });
await page.locator('.openrow .btn.go').click(); await w(400);
await page.locator('button', { hasText: /Skip to the end|Saltar al final/ }).click(); await w(900);
const rc = await page.evaluate(() => document.querySelector('.receipt')?.innerText || '');
ok(/,\d{3}/.test(rc), 'receipt shows big numbers with commas');

await seed({ ...base, stadium: 1, stadium2: 1, stadium3: 1, basketball: 1, soccer: 1, merch: 1, merch2: 1 }); await open2(); i = await info();
ok(i.cls.includes('look-legend') && i.sb, 'mega stadium: legend look');
await page.locator('.openrow .btn.go').click(); await w(500);
await page.locator('button', { hasText: /Skip to the end|Saltar al final/ }).click(); await w(1200);
ok((await page.evaluate(() => document.querySelector('.receipt')?.innerText || '')).length > 50, 'a mega-stadium day plays and ends with a receipt');
await page.evaluate(() => { location.hash = '#/home'; }); await w(500);
ok((await page.evaluate(() => document.documentElement.dataset.look || '')) === '', 'the stadium look is removed when leaving the stand');

// 4. the secret golden hot dog: tap the title 7 times
await seed({ sign: 1, grill: 1 }); await open2();
for (let k = 0; k < 7; k++) { await page.locator('.stand h1').click({ force: true }); await w(80); }
await w(500);
const gold = await page.evaluate(() => ({ perk: window.__lab.S.stands.snack.perks.goldendog, golden: !!document.querySelector('.memo.golden'), got: document.querySelectorAll('.perk.got').length }));
ok(gold.perk === 1 && gold.golden && gold.got === 1, 'tapping the title 7 times finds the golden hot dog ' + JSON.stringify(gold));
ok(errors.length === 0, 'console clean ' + errors.join('/'));
await browser.close(); process.exit(fails ? 1 : 0);
