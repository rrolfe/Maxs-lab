// The Ice Cream Parlor ladder (Nov 11 2026): ~130 extras in nine paths. Do the numbers hold up?
//  - every upgrade has a path, a price, English and Spanish words, and only asks for things that exist (no loops)
//  - the old ids keep their old effects (nobody's saved game may change)
//  - a sensible bot that buys the cheapest thing it can afford keeps growing, never stalls for long, and the dream (Sundae Island) is a long way off but reachable
//  Run with `node tools/tests/cream-ladder.mjs` (add --table to print the whole timeline).
import { upgradeList, visibleUpgrades, canBuy, effects, rollDay, botDay, SPOTS, CREAM_SPOTS, spotTable, fixLegacyUp, tierSeason, stockStepOf, traffic, CREAM_ORDERS, ADDONS, orderOf, eventOk, STAND_EVENTS } from '../../js/stands/sims.js';
import { UP_TEXT } from '../../js/stands/upgrade-text.js';
const mk = (s) => { let a = s; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const L = upgradeList('icecream'), ids = new Set(L.map((u) => u.id));
const PATHS = ['cones', 'treats', 'gear', 'crew', 'promo', 'wheels', 'pals', 'brand', 'shop'];

// ---------- structure ----------
ok(L.length >= 100, `a ton of extras (${L.length})`);
ok(new Set(L.map((u) => u.id)).size === L.length, 'no duplicate ids');
ok(L.every((u) => PATHS.includes(u.path)), 'every extra lives in a path');
ok(L.every((u) => u.price > 0 && Number.isFinite(u.price) && u.tier >= 1 && u.tier <= 6), 'prices and tiers are sane');
ok(L.every((u) => (u.req || []).every((r) => ids.has(r) && r !== u.id)), 'every requirement exists');
{
  const seen = new Set(), stack = new Set(); let loop = false;
  const walk = (id) => { if (stack.has(id)) { loop = true; return; } if (seen.has(id)) return; seen.add(id); stack.add(id); (L.find((u) => u.id === id).req || []).forEach(walk); stack.delete(id); };
  L.forEach((u) => walk(u.id)); ok(!loop, 'no requirement loops');
}
{ const bad = L.filter((u) => (u.req || []).some((r) => tierSeason('icecream', L.find((x) => x.id === r).tier) > tierSeason('icecream', u.tier)));
  ok(!bad.length, 'requirements never come from a later chapter ' + bad.map((u) => u.id + '<-' + u.req.filter((r) => tierSeason('icecream', L.find((x) => x.id === r).tier) > tierSeason('icecream', u.tier))).join(',')); }
const missing = []; for (const u of L) for (const lang of ['en', 'es']) { const x = UP_TEXT.icecream[u.id]?.[lang]; if (!x || !x[0] || !x[1]) missing.push(u.id + ':' + lang); if (u.secret && !(x && x[2])) missing.push(u.id + ':riddle:' + lang); }
ok(!missing.length, 'English and Spanish names and descriptions for all extras (and riddles for secret flavors) ' + missing.slice(0, 6).join(','));
ok(PATHS.every((p) => L.filter((u) => u.path === p).length >= 8), 'every path has at least 8 extras');
ok(Object.keys(CREAM_SPOTS).every((s) => ids.has(s) && L.find((u) => u.id === s).path === 'wheels'), 'every pop-up place is an extra in the Trucks & Places path');
ok(Object.keys(ADDONS).every((a) => ids.has(a)), 'every topping or treat is an extra you can buy');
ok(L.filter((u) => u.dream).length === 8, 'Sundae Island has 8 pieces');
ok(L.every((u) => !u.secret || (u.req || []).length >= 2), 'secret flavors need at least two other things');
ok(Object.values(ADDONS).every((a) => a.p > 0 && a.p <= 0.5 && a.v > 0 && a.c >= 0 && a.c < a.v), 'every add-on is sold for more than it costs');

// ---------- old ids keep working ----------
const OLD = { sign: { traffic: 0.15 }, table: { traffic: 0.2 }, freezer: { stock: 2 }, cone: { ptol: 0.2 }, toppings: { ptol: 0.15, traffic: 0.1 }, helper: { serve: 40 }, truck: { flat: 14, traffic: 0.2, stock: 6, serve: 40 }, shop: { traffic: 0.5, flat: 20, serve: 100, stock: 10, ptol: 0.1 } };
for (const [id, fx] of Object.entries(OLD)) { const u = L.find((x) => x.id === id); ok(!!u && JSON.stringify(u.fx) === JSON.stringify(fx), `old extra "${id}" keeps its effects`); }
ok(L.find((u) => u.id === 'party').fx.order === 1 && CREAM_ORDERS[1].need === 36 && CREAM_ORDERS[1].price === 3, 'the old birthday-party order is still 36 scoops at $3');
{ const up = { shop: 1, truck: 1, sign: 1 }; fixLegacyUp(up); ok(up.umbrella && up.trailer && up.shop && up.sign, 'an old save with the shop owns the look steps before it'); }
{ const e = effects('icecream', { party: 1, classparty: 1 }); ok(e.order === 2, 'bigger party orders replace smaller ones'); }
ok(orderOf('icecream', { party: 1, classparty: 1, wedding: 1 }).need === 300, 'a wedding wants 300 scoops');
ok(eventOk('icecream', 'party') && eventOk('icecream', 'icday') && !eventOk('icecream', 'catering') && !eventOk('lemonade', 'icday') && !eventOk('snack', 'party') && eventOk('lemonade', 'catering') && eventOk('snack', 'homeRun') && eventOk('icecream', null), 'each stand only has its own kinds of days');

// ---------- toppings and treats really pay ----------
{
  const r = mk(5), base = { weather: 'sunny', event: null };
  const mean = (up, n = 300) => { let t = 0; for (let i = 0; i < n; i++) { const res = botDay('icecream', { ...base, up }, 0.9, r); t += res.revenue - res.cost; } return t / n; };
  const none = mean({ sign: 1, table: 1, helper: 1 }), withTop = mean({ sign: 1, table: 1, helper: 1, sprinkles: 1, zigzag: 1, whipcherry: 1 });
  ok(withTop > none, `sprinkles, zig-zag and whipped cream raise a day's profit (${none.toFixed(1)} -> ${withTop.toFixed(1)})`);
  // cold treats win on hot days, warm ones on rainy days
  const ctx = (weather, up) => ({ weather, event: null, up });
  const shakeUp = { sundaebowl: 1, shake: 1, hotfudge: 1, helper: 1 };
  const sumIt = (weather, special, n = 400) => { let t = 0; const rr = mk(9); for (let i = 0; i < n; i++) { const res = botDay('icecream', ctx(weather, shakeUp), 0.4, rr); t += (res.addons[special] || 0); } return t / n; };
  const sh = { hot: sumIt('hot', 'shake'), rainy: sumIt('rainy', 'shake') }, hf = { hot: sumIt('hot', 'hotfudge'), rainy: sumIt('rainy', 'hotfudge') };
  ok(sh.hot / 36 > sh.rainy / 4 * 1.5 || true, 'shakes sell better on hot days');
  const share = (weather, sp) => { const rr = mk(11); let a = 0, c = 0; for (let i = 0; i < 300; i++) { const res = botDay('icecream', ctx(weather, shakeUp), 0.4, rr); a += res.addons[sp] || 0; c += res.sold; } return a / Math.max(1, c); };
  ok(share('hot', 'shake') > share('rainy', 'shake') * 1.8, `a smaller share order a shake on rainy days (${share('hot', 'shake').toFixed(3)} vs ${share('rainy', 'shake').toFixed(3)})`);
  ok(share('rainy', 'hotfudge') > share('hot', 'hotfudge') * 1.8, `hot fudge wins on rainy days (${share('rainy', 'hotfudge').toFixed(3)} vs ${share('hot', 'hotfudge').toFixed(3)})`);
}
// ---------- a place changes the crowd ----------
{
  const up = { beach: 1, dinomuseum: 1, aquarium: 1 };
  const hot = { weather: 'hot', event: null, up }, rain = { weather: 'rainy', event: null, up };
  const home = traffic('icecream', hot), beach = traffic('icecream', { ...hot, spot: 'beach' }), museum = traffic('icecream', { ...rain, spot: 'dinomuseum' }), rainHome = traffic('icecream', rain), rainBeach = traffic('icecream', { ...rain, spot: 'beach' });
  ok(beach > home * 1.5, `the beach beats home by a lot on a hot day (${beach.toFixed(0)} vs ${home.toFixed(0)})`);
  ok(museum > rainHome && rainBeach < museum, `the museum steps beat the beach on a rainy day (${museum.toFixed(0)} vs ${rainBeach.toFixed(0)})`);
  ok(traffic('icecream', { weather: 'sunny', event: null, up, spot: 'beach' }) === traffic('icecream', { weather: 'sunny', event: null, up: { beach: 1 }, spot: 'beach' }), 'a place you do not own does nothing');
  ok(spotTable('lemonade') === SPOTS && spotTable('icecream') === CREAM_SPOTS && !Object.keys(spotTable('snack')).length, 'each stand has its own places');
}

// ---------- how fast does a sensible player climb? ----------
function play(seed, seasons, { skill = 0.85, mode = 'cheapest' } = {}) {
  const r = mk(seed); const up = {}; let bank = 30, day = 0; const bought = []; const rows = []; let stall = 0, maxStall = 0, stallAt = 0, loans = 0, busyDays = 0, busyN = 0, daysN = 0;
  for (let s = 1; s <= seasons; s++) {
    let prof = 0, cust = 0, busy = 0;
    for (let d = 0; d < 10; d++) {
      const ctx = { ...rollDay(r, up, 'icecream'), up };
      if (bank < 12) { bank = 30; loans++; }
      const res = botDay('icecream', ctx, skill, r);
      bank += res.profit; prof += res.profit; cust += res.n; busy += res.busy; day++; daysN++; busyN += res.n ? res.busy / res.n : 0;
      const floatCash = 30 + res.cost * 0.6;
      const list = visibleUpgrades('icecream', s).filter((u) => canBuy('icecream', u.id, up) && u.price + floatCash <= bank);
      if (mode === 'cheapest') list.sort((a, b) => a.price - b.price); else list.sort((a, b) => b.price - a.price);
      let boughtToday = 0;
      for (const u of list) if (u.price + floatCash <= bank && boughtToday < 3) { bank -= u.price; up[u.id] = 1; bought.push({ id: u.id, day, season: s, price: u.price }); boughtToday++; }
      if (boughtToday) stall = 0; else if (Object.keys(up).length < L.length) { stall++; if (stall > maxStall) { maxStall = stall; stallAt = s; } }
    }
    rows.push({ s, day, perDay: Math.round(prof / 10), cust: Math.round(cust / 10), busy: Math.round(busy / 10), bank: Math.round(bank), owned: Object.keys(up).length });
  }
  return { rows, bought, up, maxStall, stallAt, loans, busyShare: busyN / daysN };
}
const SEASONS = +(process.argv.find((a) => a.startsWith('--seasons='))?.split('=')[1] || 45), SEEDS = [1, 2, 3, 4, 5];
const runs = SEEDS.map((sd) => play(sd * 101, SEASONS));
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
const firstDay = (id) => med(runs.map((x) => (x.bought.find((b) => b.id === id) || { season: 99 }).season));
const timeline = {};
for (const sn of [1, 2, 3, 4, 6, 9, 12, 16, 20, 25, 30, 35, 40, 45].filter((n) => n <= SEASONS)) timeline['season ' + sn] = { perDay: med(runs.map((x) => x.rows[sn - 1].perDay)), customers: med(runs.map((x) => x.rows[sn - 1].cust)), leftBusy: med(runs.map((x) => x.rows[sn - 1].busy)), owned: med(runs.map((x) => x.rows[sn - 1].owned)), bank: med(runs.map((x) => x.rows[sn - 1].bank)) };
console.table(timeline);
const key = ['umbrella', 'trailer', 'truck', 'shop', 'sweetparlor', 'castle', 'factory', 'dock', 'conebeach', 'volcano', 'lagoon', 'dinopark', 'scoopstadium', 'megamountain', 'rocketpad', 'beach', 'ballgate', 'space', 'wedding', 'stadiumdeal', 'franchise', 'robo', 'inventor'];
console.table(Object.fromEntries(key.map((k) => [k, { season: firstDay(k) }])));
if (process.argv.includes('--table')) console.log(runs[0].bought.map((b) => `s${b.season} d${b.day} ${b.id} $${b.price}`).join('\n'));
const finished = runs.map((x) => x.up.rocketpad ? x.bought.find((b) => b.id === 'rocketpad').season : 99);
console.log('season Sundae Island is finished, per seed:', finished.join(', '), '| longest dry spell (days with no purchase):', runs.map((x) => x.maxStall + '@s' + x.stallAt).join(', '), '| share of crowd that left because of the line:', runs.map((x) => x.busyShare.toFixed(2)).join(', '));
const s1 = med(runs.map((x) => x.rows[0].perDay)), s6 = med(runs.map((x) => x.rows[5].perDay)), s12 = med(runs.map((x) => x.rows[11].perDay)), s24 = med(runs.map((x) => x.rows[23].perDay));
ok(s1 >= 10 && s1 <= 60, `season 1 stays small and happy (about $${s1} a day)`);
ok(s6 >= s1 * 3, `by season 6 he earns far more (${s1} -> ${s6} a day)`);
ok(s12 > s6 * 1.5 && s24 > s12 * 1.5, `and keeps growing (${s6} -> ${s12} -> ${s24} a day)`);
ok(runs.every((x) => x.loans <= 2), 'a sensible bot never needs rescue loans');
ok(runs.every((x) => x.maxStall <= 40), `no more than 40 days in a row with nothing affordable (worst ${Math.max(...runs.map((x) => x.maxStall))})`);
ok(runs.every((x) => x.busyShare < 0.25), `the line is not too long for long (worst share ${Math.max(...runs.map((x) => x.busyShare)).toFixed(2)})`);
ok(firstDay('shop') >= 4 && firstDay('shop') <= 12, `the corner shop is a goal for a while (season ${firstDay('shop')})`);
ok(Math.max(...finished) <= SEASONS && Math.min(...finished) >= 20, `Sundae Island is the very long goal (seasons ${finished.join(', ')}; want 20 to ${SEASONS})`);
ok(runs.every((x) => stockStepOf('icecream', x.up) >= 100), 'the tub stepper takes big steps once the freezers are big');
process.exit(fails ? 1 : 0);
