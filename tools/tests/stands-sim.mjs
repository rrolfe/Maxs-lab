// Bot simulation: do the three stands progress (not stuck, not trivially broken) for different skill levels?
import { SIMS, rollDay, botDay, SEASON_DAYS, visibleUpgrades, canBuy, upgradeList, traffic, effects } from '../../js/stands/sims.js';
let seed = 7; const mk = (s) => { let a = s; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
function run(id, skill, seasons, rs) {
  const r = mk(rs), sim = SIMS[id]; let bank = sim.startBank; const up = {}; const rows = []; let loans = 0, maxCust = 0, boughtStore = null;
  for (let s = 1; s <= seasons; s++) {
    let profit = 0, cust = 0, daysNeg = 0, maxDay = 0;
    for (let d = 0; d < SEASON_DAYS; d++) {
      const ctx = { ...rollDay(r, up, id), up };
      if (bank < 10) { bank = sim.startBank; loans++; }
      const res = botDay(id, { ...ctx }, skill, r);
      // bank must cover the stock cost: the real UI trims stock, the bot is capped here
      const c = res.cost; if (c > bank) { /* rescue as the app does */ bank = Math.max(bank, sim.startBank); loans++; }
      bank += res.profit; profit += res.profit; cust += res.n; maxDay = Math.max(maxDay, res.n); if (res.profit < 0) daysNeg++;
      // shop (end of day): buy cheapest-first with skill-dependent patience, keep a float
      const list = visibleUpgrades(id, s).filter((u) => canBuy(id, u.id, up)).sort((a, b) => (skill > 0.8 ? a.price / (1 + (a.fx.traffic || 0) * 10 + (a.fx.flat || 0) / 10 + (a.fx.ptol || 0) * 10) - b.price / (1 + (b.fx.traffic || 0) * 10 + (b.fx.flat || 0) / 10 + (b.fx.ptol || 0) * 10) : a.price - b.price));
      for (const u of list) if (bank - u.price >= (id === 'icecream' ? 40 : id === 'snack' ? 40 : 25) && r() < 0.3 + skill * 0.7) { bank -= u.price; up[u.id] = 1; if (u.id === 'store' || u.id === 'shop' || u.id === 'suites') boughtStore ??= s; break; }
    }
    maxCust = Math.max(maxCust, maxDay);
    rows.push({ s, profit: Math.round(profit), avgCust: Math.round(cust / SEASON_DAYS), maxDay, bank: Math.round(bank), ups: Object.keys(up).length, daysNeg });
  }
  return { rows, loans, maxCust, boughtStore, up };
}
const summary = {};
for (const id of ['lemonade', 'icecream', 'snack']) for (const [name, skill] of [['low', 0.3], ['mid', 0.65], ['high', 0.95]]) {
  const runs = Array.from({ length: 8 }, (_, k) => run(id, skill, 14, 100 + k * 17));
  const avg = (f) => runs.reduce((a, x) => a + f(x), 0) / runs.length;
  summary[id + ':' + name] = {
    s1profit: Math.round(avg((x) => x.rows[0].profit)), s3profit: Math.round(avg((x) => x.rows[2].profit)), s6profit: Math.round(avg((x) => x.rows[5].profit)), s14profit: Math.round(avg((x) => x.rows[13].profit)),
    s14custPerDay: Math.round(avg((x) => x.rows[13].avgCust)), maxCust: Math.round(avg((x) => x.maxCust)), loans: +avg((x) => x.loans).toFixed(1), ups14: +avg((x) => x.rows[13].ups).toFixed(1),
    seasonsToStore: runs.map((x) => x.boughtStore).filter(Boolean).length ? Math.round(avg((x) => x.boughtStore || 15)) : 'never',
  };
}
console.table(summary);
// assertions
for (const id of ['lemonade', 'icecream', 'snack']) {
  const mid = summary[id + ':mid'], low = summary[id + ':low'], high = summary[id + ':high'];
  ok(mid.s1profit > 20, `${id}: a sensible player makes money in season 1 (${mid.s1profit})`);
  ok(mid.s6profit > mid.s1profit * 1.8, `${id}: profits grow with upgrades (${mid.s1profit} -> ${mid.s6profit})`);
  ok(low.s14profit > 0, `${id}: even a careless player is never stuck (season-14 profit ${low.s14profit})`);
  ok(high.s14profit >= mid.s14profit * 0.9, `${id}: skill is rewarded (${high.s14profit} vs ${mid.s14profit})`);
  ok(low.loans < 14, `${id}: rescue loans stay rare for a careless bot (${low.loans} in 14 seasons)`);
}
ok(summary['lemonade:high'].maxCust >= 100, `lemonade can reach 100+ customers in a day (${summary['lemonade:high'].maxCust})`);
ok(summary['lemonade:mid'].s1profit < 150, 'lemonade season 1 stays modest');
// the demand curve: 100 customers with everything bought
{ const up = {}; for (const u of upgradeList('lemonade')) up[u.id] = 1; const t = traffic('lemonade', { weather: 'sunny', event: null, up }); ok(t >= 100, `fully upgraded lemonade stand expects ${Math.round(t)} customers on a plain sunny day`); }
process.exit(fails ? 1 : 0);
