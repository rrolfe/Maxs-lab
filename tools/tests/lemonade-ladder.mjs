// The Lemonade Stand ladder (Nov 10 2026): ~65 extras in eight paths. Do the numbers hold up?
//  - every upgrade has a path, a price, English and Spanish words, and only asks for things that exist (no loops)
//  - the old ids keep their old effects (nobody's saved game may change)
//  - a sensible bot that buys the cheapest thing it can afford keeps growing, never stalls for long, and the dream shop (Lemon Town) is a long way off but reachable
//  Run with `node tools/tests/lemonade-ladder.mjs` (add --table to print the whole timeline).
import { UPGRADES, upgradeList, visibleUpgrades, canBuy, effects, rollDay, botDay, SPOTS, SPOT_IDS, fixLegacyUp, tierSeason, stockStepOf, traffic, LEMON_ORDERS } from '../../js/stands/sims.js';
import { UP_TEXT } from '../../js/stands/upgrade-text.js';
const mk = (s) => { let a = s; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const L = upgradeList('lemonade'), ids = new Set(L.map((u) => u.id));
const PATHS = ['look', 'gear', 'menu', 'crew', 'promo', 'spots', 'wheels', 'shop'];

// ---------- structure ----------
ok(L.length >= 55, `a ton of extras (${L.length})`);
ok(new Set(L.map((u) => u.id)).size === L.length, 'no duplicate ids');
ok(L.every((u) => PATHS.includes(u.path)), 'every extra lives in a path');
ok(L.every((u) => u.price > 0 && Number.isFinite(u.price) && u.tier >= 1 && u.tier <= 6), 'prices and tiers are sane');
ok(L.every((u) => (u.req || []).every((r) => ids.has(r) && r !== u.id)), 'every requirement exists');
{ // no loops: walk requirements
  const seen = new Set(), stack = new Set(); let loop = false;
  const walk = (id) => { if (stack.has(id)) { loop = true; return; } if (seen.has(id)) return; seen.add(id); stack.add(id); (L.find((u) => u.id === id).req || []).forEach(walk); stack.delete(id); };
  L.forEach((u) => walk(u.id)); ok(!loop, 'no requirement loops');
}
{ // a requirement is never from a later chapter than the thing that needs it
  const bad = L.filter((u) => (u.req || []).some((r) => tierSeason('lemonade', L.find((x) => x.id === r).tier) > tierSeason('lemonade', u.tier)));
  ok(!bad.length, 'requirements never come from a later chapter ' + bad.map((u) => u.id).join(','));
}
const missing = []; for (const u of L) for (const lang of ['en', 'es']) { const x = UP_TEXT.lemonade[u.id]?.[lang]; if (!x || !x[0] || !x[1]) missing.push(u.id + ':' + lang); }
ok(!missing.length, 'English and Spanish names and descriptions for all extras ' + missing.slice(0, 6).join(','));
ok(PATHS.every((p) => L.filter((u) => u.path === p).length >= 7), 'every path has at least 7 extras');
ok(SPOT_IDS.every((s) => ids.has(s) && L.find((u) => u.id === s).path === 'spots'), 'every pop-up place is an extra in the Places path');

// ---------- old ids keep working ----------
const OLD = { sign: { traffic: 0.15 }, table: { traffic: 0.15, stock: 20 }, cooler: { cost: 0.8 }, squeezer: { ptol: 0.3 }, nugget: { hot: 0.2, ptol: 0.05 }, umbrella: { rain: 0.4, hot: 0.1 }, cups: { ptol: 0.1, cost: 1.1 }, flyers: { traffic: 0.2 }, speaker: { traffic: 0.15, flat: 3 }, helper: { serve: 40 }, flake: { hot: 0.3, ptol: 0.08 }, spinner: { flat: 18, traffic: 0.1 }, table2: { traffic: 0.2, serve: 40, stock: 60 }, wagon: { flat: 10, stock: 60 }, store: { traffic: 0.5, flat: 25, serve: 120, stock: 200, ptol: 0.1 } };
for (const [id, fx] of Object.entries(OLD)) { const u = L.find((x) => x.id === id); ok(!!u && JSON.stringify(u.fx) === JSON.stringify(fx), `old extra "${id}" keeps its effects`); }
ok(L.find((u) => u.id === 'catering').fx.order === 1 && LEMON_ORDERS[1].need === 50 && LEMON_ORDERS[1].price === 1.5, 'old catering contract is still 50 cups at $1.50');
{ const up = { store: 1, sign: 1 }; fixLegacyUp(up); ok(up.shoprent && up.counter && up.store && up.sign, 'an old save with the store owns the shop steps before it'); }
{ const e = effects('lemonade', { catering: 1, partypacks: 1 }); ok(e.order === 2, 'bigger catering orders replace smaller ones'); }

// ---------- a spot changes the crowd ----------
{
  const up = { park: 1, beach: 1, dinomuseum: 1 };
  const hot = { weather: 'hot', event: null, up }, rain = { weather: 'rainy', event: null, up };
  const home = traffic('lemonade', hot), beach = traffic('lemonade', { ...hot, spot: 'beach' }), museum = traffic('lemonade', { ...rain, spot: 'dinomuseum' }), rainHome = traffic('lemonade', rain), rainBeach = traffic('lemonade', { ...rain, spot: 'beach' });
  ok(beach > home, `the beach beats home on a hot day (${beach.toFixed(0)} vs ${home.toFixed(0)})`);
  ok(museum > rainHome && rainBeach < museum, `the museum steps beat the beach on a rainy day (${museum.toFixed(0)} vs ${rainBeach.toFixed(0)})`);
  ok(traffic('lemonade', { weather: 'sunny', event: null, up, spot: 'beach' }) === traffic('lemonade', { weather: 'sunny', event: null, up: { beach: 1 }, spot: 'beach' }), 'a spot you do not own does nothing');
  ok(traffic('lemonade', { weather: 'sunny', event: null, up: {}, spot: 'beach' }) === traffic('lemonade', { weather: 'sunny', event: null, up: {} }), 'an unowned place is ignored');
}

// ---------- how fast does a sensible player climb? ----------
/** A kid who buys the cheapest thing he can afford (keeping a little cash for the next batch). Returns the timeline. */
function play(seed, seasons, { skill = 0.85, mode = 'cheapest' } = {}) {
  const r = mk(seed); const up = {}; let bank = 20, day = 0; const bought = []; const rows = []; let last = null, stall = 0, maxStall = 0, stallAt = 0, loans = 0;
  for (let s = 1; s <= seasons; s++) {
    let prof = 0, cust = 0;
    for (let d = 0; d < 10; d++) {
      const ctx = { ...rollDay(r, up, 'lemonade'), up };
      if (bank < 8) { bank = 20; loans++; }
      const res = botDay('lemonade', ctx, skill, r);
      bank += res.profit; prof += res.profit; cust += res.n; day++; last = res;
      const floatCash = 20 + res.cost * 0.6;
      const list = visibleUpgrades('lemonade', s).filter((u) => canBuy('lemonade', u.id, up) && u.price + floatCash <= bank);
      if (mode === 'cheapest') list.sort((a, b) => a.price - b.price); else list.sort((a, b) => b.price - a.price);
      let boughtToday = 0;
      for (const u of list) if (u.price + floatCash <= bank && boughtToday < 3) { bank -= u.price; up[u.id] = 1; bought.push({ id: u.id, day, season: s, price: u.price }); boughtToday++; }
      if (boughtToday) stall = 0; else if (Object.keys(up).length < L.length) { stall++; if (stall > maxStall) { maxStall = stall; stallAt = s; } }
    }
    rows.push({ s, day, perDay: Math.round(prof / 10), cust: Math.round(cust / 10), bank: Math.round(bank), owned: Object.keys(up).length });
  }
  return { rows, bought, up, maxStall, stallAt, loans };
}
const SEASONS = 40, SEEDS = [1, 2, 3, 4, 5];
const runs = SEEDS.map((sd) => play(sd * 101, SEASONS));
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
const firstDay = (id) => med(runs.map((x) => (x.bought.find((b) => b.id === id) || { season: 99 }).season));
const timeline = {};
for (const sn of [1, 2, 3, 4, 6, 9, 12, 16, 20, 25, 30, 40]) timeline['season ' + sn] = { perDay: med(runs.map((x) => x.rows[sn - 1].perDay)), customers: med(runs.map((x) => x.rows[sn - 1].cust)), owned: med(runs.map((x) => x.rows[sn - 1].owned)), bank: med(runs.map((x) => x.rows[sn - 1].bank)) };
console.table(timeline);
const key = ['awning', 'wooden', 'shoprent', 'store', 'bakery', 'shop2', 'factory', 'franchise', 'lemontown', 'park', 'beach', 'spacecenter', 'van', 'office', 'tv', 'manager'];
console.table(Object.fromEntries(key.map((k) => [k, { season: firstDay(k) }])));
if (process.argv.includes('--table')) console.log(runs[0].bought.map((b) => `s${b.season} d${b.day} ${b.id} $${b.price}`).join('\n'));
const finished = runs.map((x) => x.up.lemontown ? x.bought.find((b) => b.id === 'lemontown').season : 99);
console.log('season Lemon Town is bought, per seed:', finished.join(', '), '| longest dry spell (days with no purchase):', runs.map((x) => x.maxStall + '@s' + x.stallAt).join(', '));
const s1 = med(runs.map((x) => x.rows[0].perDay)), s6 = med(runs.map((x) => x.rows[5].perDay)), s12 = med(runs.map((x) => x.rows[11].perDay)), s24 = med(runs.map((x) => x.rows[23].perDay));
ok(s1 >= 6 && s1 <= 25, `season 1 stays small and happy (about $${s1} a day)`);
ok(s6 >= s1 * 3, `by season 6 he earns far more (${s1} -> ${s6} a day)`);
ok(s12 > s6 * 1.5 && s24 > s12 * 1.5, `and keeps growing (${s6} -> ${s12} -> ${s24} a day)`);
ok(runs.every((x) => x.loans <= 2), 'a sensible bot never needs rescue loans');
ok(runs.every((x) => x.maxStall <= 40), `no more than 40 days in a row with nothing affordable (worst ${Math.max(...runs.map((x) => x.maxStall))})`);
ok(firstDay('store') >= 8 && firstDay('store') <= 16, `the brick-and-mortar store is a goal for a while (season ${firstDay('store')})`);
ok(Math.max(...finished) <= SEASONS && Math.min(...finished) >= 20, `Lemon Town is the very long goal (seasons ${finished.join(', ')}; want 20 to 40)`);
ok(runs.every((x) => stockStepOf('lemonade', x.up) >= 100), 'the cup stepper takes big steps once the stand is big');
process.exit(fails ? 1 : 0);
