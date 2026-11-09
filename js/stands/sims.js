// Pure simulation rules for the tiny businesses (no DOM: easy to test and tune with bots, see tools/tests/stands-sim.mjs).
// A SEASON is 10 selling days (the Snack Shack runs 15: Rob's choice, Nov 2026). Upgrades are kept between seasons and are what lets a stand grow from ~20 customers a day to 100+.
export const SEASON_DAYS = 10;
export const seasonDays = (id) => (id === 'snack' ? 15 : SEASON_DAYS);

export const WEATHER = {
  sunny:  { icon: '☀️', base: { lemonade: 20, icecream: 24, snack: 14 }, bonus: 0, hot: 1, rain: 0 },
  hot:    { icon: '🔥', base: { lemonade: 30, icecream: 36, snack: 16 }, bonus: 0.1, hot: 1, rain: 0 },
  cloudy: { icon: '⛅', base: { lemonade: 12, icecream: 12, snack: 12 }, bonus: 0, hot: 0, rain: 1 },
  rainy:  { icon: '🌧️', base: { lemonade: 6, icecream: 4, snack: 6 }, bonus: -0.1, hot: 0, rain: 1 },
};
export const EVENTS = { game: { mult: 1.5 }, roadwork: { mult: 0.7 }, catering: { mult: 1 }, party: { mult: 1 } };

export function rollDay(r = Math.random, up = {}, stand = 'lemonade') {
  const x = r();
  const weather = x < 0.35 ? 'sunny' : x < 0.55 ? 'hot' : x < 0.85 ? 'cloudy' : 'rainy';
  const y = r();
  let event = null;
  if (stand === 'snack') {
    // ballpark game-day stories: they change what people want (see SNACK_STORY)
    event = y < 0.22 ? 'closeGame' : y < 0.42 ? 'homeRun' : y < 0.56 ? 'rainDelay' : y < 0.7 ? 'bigCrowd' : null;
    if (weather === 'rainy' && y >= 0.56 && y < 0.7) event = 'rainDelay';
    if (up.stadium2 && r() < 0.25) event = 'nightGame';        // floodlights: a quarter of the days are night games
    return { weather, event };
  }
  event = y < 0.12 ? 'game' : y < 0.22 ? 'roadwork' : null;
  const z = r();
  if (up.catering && z < 0.22) event = 'catering';
  if (up.party && z < 0.22) event = 'party';
  return { weather, event };
}

/** Piecewise-linear lookup. table: [[price, rate], ...] sorted by price. */
export function interp(table, p) {
  if (p <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    if (p <= table[i][0]) { const [x0, y0] = table[i - 1], [x1, y1] = table[i]; return y0 + ((p - x0) / (x1 - x0)) * (y1 - y0); }
  }
  return table[table.length - 1][1];
}
const LEMON_RATE = [[0.25, 1], [0.5, 1], [0.75, 0.85], [1, 0.7], [1.25, 0.5], [1.5, 0.3], [2, 0.1], [3, 0.02]];
const CREAM_RATE = [[1, 1], [1.5, 0.85], [2, 0.65], [2.5, 0.45], [3, 0.25], [4, 0.08], [5, 0.02]];

// ---------- upgrade trees ----------
// effects: traffic (+% customers), flat (+customers/day), ptol (+% price people accept), serve (+customers served/day),
// stock (+max stock), cost (x unit cost), hot (+% on sunny/hot days), rain (+% on cloudy/rainy days), unlock (menu items)
// tier decides when it appears in the shop: tier N shows from season N, so the first seasons stay simple.
export const UPGRADES = {
  lemonade: [
    { id: 'sign', tier: 1, price: 15, fx: { traffic: 0.15 } },
    { id: 'table', tier: 1, price: 30, fx: { traffic: 0.15, stock: 20 } },
    { id: 'cooler', tier: 1, price: 25, fx: { cost: 0.8 } },
    { id: 'squeezer', tier: 2, price: 60, fx: { ptol: 0.3 } },
    { id: 'nugget', tier: 2, price: 70, fx: { hot: 0.2, ptol: 0.05 } },
    { id: 'umbrella', tier: 2, price: 40, fx: { rain: 0.4, hot: 0.1 } },
    { id: 'cups', tier: 2, price: 35, fx: { ptol: 0.1, cost: 1.1 } },
    { id: 'flyers', tier: 2, price: 45, fx: { traffic: 0.2 } },
    { id: 'speaker', tier: 2, price: 55, fx: { traffic: 0.15, flat: 3 } },
    { id: 'helper', tier: 2, price: 90, fx: { serve: 40 } },
    { id: 'flake', tier: 3, price: 160, req: ['nugget'], fx: { hot: 0.3, ptol: 0.08 } },
    { id: 'spinner', tier: 3, price: 120, fx: { flat: 18, traffic: 0.1 } },
    { id: 'table2', tier: 3, price: 150, req: ['table'], fx: { traffic: 0.2, serve: 40, stock: 60 } },
    { id: 'wagon', tier: 3, price: 200, fx: { flat: 10, stock: 60 } },
    { id: 'catering', tier: 4, price: 300, req: ['wagon'], fx: {} },
    { id: 'store', tier: 4, price: 1500, req: ['table2'], fx: { traffic: 0.5, flat: 25, serve: 120, stock: 200, ptol: 0.1 } },
  ],
  icecream: [
    { id: 'sign', tier: 1, price: 40, fx: { traffic: 0.15 } },
    { id: 'table', tier: 1, price: 70, fx: { traffic: 0.2 } },
    { id: 'freezer', tier: 1, price: 90, fx: { stock: 2 } },
    { id: 'cone', tier: 2, price: 120, fx: { ptol: 0.2 } },
    { id: 'toppings', tier: 2, price: 150, fx: { ptol: 0.15, traffic: 0.1 } },
    { id: 'helper', tier: 2, price: 200, fx: { serve: 40 } },
    { id: 'truck', tier: 3, price: 650, req: ['freezer'], fx: { flat: 14, traffic: 0.2, stock: 6, serve: 40 } },
    { id: 'party', tier: 3, price: 450, req: ['cone'], fx: {} },
    { id: 'shop', tier: 4, price: 2600, req: ['truck'], fx: { traffic: 0.5, flat: 20, serve: 100, stock: 10, ptol: 0.1 } },
  ],
  snack: [
    { id: 'sign', tier: 1, price: 60, fx: { traffic: 0.2 } },
    { id: 'grill', tier: 1, price: 120, fx: { serve: 12 }, unlock: ['burger'] },
    { id: 'fryer', tier: 1, price: 90, fx: {}, unlock: ['fries'] },
    { id: 'cooler', tier: 2, price: 140, fx: { stock: 20 }, unlock: ['icecream'] },
    { id: 'candy', tier: 1, price: 100, fx: { flat: 2 }, unlock: ['popcandy', 'choc'] },
    { id: 'cones', tier: 2, price: 160, fx: {}, unlock: ['cone'] },
    { id: 'slush', tier: 2, price: 220, fx: { hot: 0.1 }, unlock: ['slush', 'froslem'] },
    // More ball fields: each one moves the crowd up a band (1 field 10-50 fans a day, 2: 50-100, 3: 100-200, 4: 200-400). From the 4th on they come TWO AT A TIME
    // and every pair multiplies the crowd by 4: 6 fields 800-1,600, 8 fields 3,200-6,400, 10 fields 12,800-25,600, 12 fields 51,200-102,400 (Rob, Nov 8 2026).
    // Prices: 90, 220, 500, then 4,000 / 20,000 / 100,000 / 500,000 for the pairs (each pays for itself in about 3-5 days). serve/stock add up to 320, 1,280, 5,120, 20,480, 102,400.
    { id: 'field2', tier: 1, price: 90, fx: { serve: 40, stock: 40 } },
    { id: 'field3', tier: 1, price: 220, req: ['field2'], fx: { serve: 80, stock: 80 } },
    { id: 'field4', tier: 1, price: 500, req: ['field3'], fx: { serve: 160, stock: 160 } },
    { id: 'fields56', tier: 1, price: 4000, req: ['field4'], fx: { serve: 960, stock: 960 } },
    { id: 'fields78', tier: 2, price: 20000, req: ['fields56'], fx: { serve: 3840, stock: 3840 } },
    { id: 'fields910', tier: 3, price: 100000, req: ['fields78'], fx: { serve: 15360, stock: 15360 } },
    { id: 'fields1112', tier: 4, price: 500000, req: ['fields910'], fx: { serve: 81920, stock: 81920 } },
    // Merch: caps, pennants and foam fingers sell for a lot more than they cost; the big store adds team shirts and plush sharks. Fans buy more of it after a home run.
    { id: 'merch', tier: 1, price: 150, fx: {}, unlock: ['cap', 'pennant', 'finger'] },
    { id: 'merch2', tier: 2, price: 600, req: ['merch'], fx: {}, unlock: ['shirt', 'plush'] },
    // Other sports: every court or pitch counts as one more field (the crowd doubles) and its fans bring a favorite snack. Rob, Nov 8 2026.
    { id: 'basketball', tier: 1, price: 20000, req: ['field4'], fx: {}, unlock: ['pretzel'] },
    { id: 'soccer', tier: 1, price: 100000, req: ['field4'], fx: {}, unlock: ['orange'] },
    { id: 'football', tier: 2, price: 1000000, req: ['fields56'], fx: {}, unlock: ['nachos'] },
    { id: 'tennis', tier: 2, price: 4000000, req: ['fields56'], fx: {}, unlock: ['berries'] },
    // The stadium: three levels, every one TRIPLES the crowd (x3, x9, x27) and changes how the whole Snack Shack looks (see css "looks"). Level 2 adds floodlights and night games.
    { id: 'stadium', tier: 1, price: 75000, req: ['fields56'], fx: {} },
    { id: 'stadium2', tier: 2, price: 3000000, req: ['stadium', 'fields78'], fx: {}, unlock: ['cocoa'] },
    { id: 'stadium3', tier: 3, price: 100000000, req: ['stadium2', 'fields910'], fx: {} },
    { id: 'jerseys', tier: 2, price: 110, fx: { ptol: 0.12 } },
    // Windows and workers: each one lets the stand serve more fans before the line gets too long (staff = +20% of the serving capacity, which grows with the crowd). Rob, Nov 9 2026.
    { id: 'window2', tier: 1, price: 240, fx: { staff: 0.2, traffic: 0.25 } },
    { id: 'cook', tier: 1, price: 200, fx: { staff: 0.1, cost: 0.9 } },
    { id: 'cashier', tier: 1, price: 1500, req: ['cook'], fx: { staff: 0.1 } },
    { id: 'window3', tier: 1, price: 2500, req: ['window2'], fx: { staff: 0.2 } },
    { id: 'window4', tier: 1, price: 30000, req: ['window3'], fx: { staff: 0.2 } },
    { id: 'crew', tier: 1, price: 60000, req: ['cashier'], fx: { staff: 0.15 } },
    { id: 'manager', tier: 2, price: 250000, req: ['crew'], fx: { staff: 0.1, cost: 0.95 } },
    { id: 'window5', tier: 2, price: 1200000, req: ['window4'], fx: { staff: 0.2 } },
    { id: 'mascot', tier: 3, price: 330, fx: { flat: 5, traffic: 0.2 } },
    { id: 'suites', tier: 4, price: 700, req: ['window2'], fx: { flat: 8, ptol: 0.1 } },
  ],
};
export const upgradeList = (stand) => UPGRADES[stand] || [];
/** Adds up everything the owned upgrades do. */
export function fixLegacyUp(up) {      // before pairs existed there were separate 5th and 6th fields: whoever owned them now owns the first pair
  if (up && (up.field5 || up.field6)) { up.fields56 = 1; delete up.field5; delete up.field6; }
  return up;
}
export function effects(stand, up = {}) {
  if (up && (up.field5 || up.field6)) up = { ...up, fields56: 1 };
  const e = { traffic: 0, flat: 0, ptol: 0, serve: 0, staff: 0, stock: 0, cost: 1, crowd: 1, hot: 0, rain: 0, unlock: new Set() };
  for (const u of upgradeList(stand)) if (up[u.id]) {
    for (const [k, v] of Object.entries(u.fx)) { if (k === 'cost') e.cost *= v; else if (k === 'crowd') e.crowd *= v; else e[k] += v; }
    (u.unlock || []).forEach((x) => e.unlock.add(x));
  }
  return e;
}
export const visibleUpgrades = (stand, seasonNo) => upgradeList(stand).filter((u) => u.tier <= Math.max(1, seasonNo));
export const canBuy = (stand, id, up) => { const u = upgradeList(stand).find((x) => x.id === id); return !!u && !up[id] && (u.req || []).every((r) => up[r]); };

// ---------- single-product stands (lemonade, ice cream) ----------
const SINGLE = {
  lemonade: { id: 'lemonade', unit: 'cups', startBank: 20, unitCost: 0.25, perStock: 1, baseStockMax: 60, priceMin: 0.25, priceMax: 4, priceStep: 0.25, defaultPrice: 1, rate: LEMON_RATE, cater: { need: 50, price: 1.5, event: 'catering' } },
  icecream: { id: 'icecream', unit: 'tubs', startBank: 30, unitCost: 6, perStock: 12, baseStockMax: 6, priceMin: 1, priceMax: 6, priceStep: 0.5, defaultPrice: 1.5, rate: CREAM_RATE, doubles: true, cater: { need: 36, price: 3, event: 'party' } },
};
export const stockStepOf = (id, up) => { const d = SINGLE[id]; if (id === 'icecream') return 1; return d.baseStockMax + effects(id, up).stock >= 200 ? 25 : 10; };
const single = (id) => {
  const d = SINGLE[id];
  return {
    ...d,
    stockStep: (up) => stockStepOf(id, up),
    stockMax: (up) => d.baseStockMax + effects(id, up).stock,
    unitCostOf: (up) => d.unitCost * effects(id, up).cost,
    costOf(stock, up) { return stock * this.unitCostOf(up); },
    sim(plan, ctx, r) { return simSingle(d, plan, ctx, r); },
  };
};
export const LEMONADE = single('lemonade');
export const ICECREAM = single('icecream');

/** Expected customers walking up on a day, before price decides who buys. */
export function traffic(id, ctx) {
  const e = effects(id, ctx.up), w = WEATHER[ctx.weather];
  const ev = ctx.event && EVENTS[ctx.event] ? EVENTS[ctx.event].mult : 1;
  const pct = 1 + e.traffic + e.hot * w.hot + e.rain * w.rain;
  return w.base[id] * ev * pct + e.flat;
}
export const serveCap = (id, up) => 40 + effects(id, up).serve;

function simSingle(d, { price, stock, deal }, { weather, event, up }, r = Math.random) {
  const e = effects(d.id, up), w = WEATHER[weather];
  const n = Math.max(0, Math.round(traffic(d.id, { weather, event, up }) * (0.85 + 0.3 * r())));
  const qMult = 1 + e.ptol;
  const cap = serveCap(d.id, up);
  let left = stock * d.perStock, sold = 0, pricey = 0, soldout = 0, busy = 0, revenue = 0, doubles = 0;
  const customers = [];
  // a catering / party order is delivered first and paid up front: it needs the full amount in stock
  let order = null;
  if (event === d.cater.event && up[event === 'party' ? 'party' : 'catering']) {
    if (left >= d.cater.need) { left -= d.cater.need; revenue += d.cater.need * d.cater.price; order = { ok: true, units: d.cater.need, pay: d.cater.need * d.cater.price }; }
    else order = { ok: false, units: d.cater.need, pay: d.cater.need * d.cater.price };
  }
  let served = 0;
  for (let i = 0; i < n; i++) {
    const wantsDouble = d.doubles && r() < 1 / 3;
    const p = price + (wantsDouble ? 1 : 0);
    let rate = interp(d.rate, p / qMult) + w.bonus + (deal ? 0.12 : 0);
    rate = Math.min(1, Math.max(0, rate));
    if (r() >= rate) { pricey++; customers.push({ res: 'pricey' }); continue; }
    if (served >= cap) { busy++; customers.push({ res: 'busy' }); continue; }
    const need = wantsDouble ? 2 : 1;
    if (left <= 0) { soldout++; customers.push({ res: 'soldout' }); continue; }
    const got = Math.min(need, left); left -= got; sold += got; served++;
    let paid = got === 2 ? price + 1 : price;
    if (deal && r() < 0.33) paid *= 0.8;
    revenue += paid; if (got === 2) doubles++;
    customers.push({ res: 'buy', paid, double: got === 2 });
  }
  const cost = stock * d.unitCost * e.cost;
  return { customers, sold, pricey, soldout, busy, leftover: left, revenue, cost, profit: revenue - cost, n, doubles, order };
}

// ---------- the ballpark snack shack: a menu of items ----------
export const MENU = [
  { id: 'hotdog', cost: 1, price: 3, base: 1.6, start: true },
  { id: 'drink', cost: 0.4, price: 2.5, base: 1.6, start: true },
  { id: 'chips', cost: 0.5, price: 2, base: 1.0, start: true },
  { id: 'burger', cost: 1.5, price: 4, base: 1.2 },
  { id: 'fries', cost: 0.75, price: 2.5, base: 1.2 },
  { id: 'icecream', cost: 1, price: 3.5, base: 0.9 },
  { id: 'popcandy', cost: 0.5, price: 1.5, base: 0.8 },
  { id: 'choc', cost: 0.6, price: 2, base: 0.9 },
  { id: 'cone', cost: 0.7, price: 3, base: 1.0 },
  { id: 'slush', cost: 0.4, price: 3, base: 1.0 },
  { id: 'froslem', cost: 0.45, price: 3, base: 0.8 },
  // sports snacks (unlocked with each venue) and hot cocoa for night games
  { id: 'pretzel', cost: 0.8, price: 3.5, base: 1.0 },
  { id: 'orange', cost: 0.35, price: 2, base: 0.9 },
  { id: 'nachos', cost: 1.2, price: 4.5, base: 1.0 },
  { id: 'berries', cost: 1.4, price: 5, base: 0.8 },
  { id: 'cocoa', cost: 0.5, price: 3, base: 1.1 },
  // merch: a few sales bring a lot of money (the margin on a cap is $9; on a hot dog $2)
  { id: 'pennant', cost: 1.5, price: 6, base: 0.8, merch: true },
  { id: 'finger', cost: 2.5, price: 9, base: 0.7, merch: true },
  { id: 'cap', cost: 6, price: 15, base: 0.6, merch: true },
  { id: 'plush', cost: 5, price: 14, base: 0.55, merch: true },
  { id: 'shirt', cost: 12, price: 30, base: 0.5, merch: true },
];
export const PRICE_LEVELS = { cheap: { mult: 0.8, accept: 0.97 }, normal: { mult: 1, accept: 0.85 }, fancy: { mult: 1.3, accept: 0.6 } };
// what the day's story does to traffic and to what people crave
export const SNACK_STORY = {
  closeGame: { traffic: 1.25, w: { hotdog: 1.2, drink: 1.1 }, merch: 1.3 },
  homeRun: { traffic: 1.15, w: { popcandy: 1.8, choc: 1.6, chips: 1.2, slush: 1.3 }, merch: 1.8 },
  rainDelay: { traffic: 0.8, w: { hotdog: 1.5, fries: 1.5, burger: 1.3, icecream: 0.5, cone: 0.5 }, merch: 0.5 },
  bigCrowd: { traffic: 1.5, w: {}, merch: 1.2 },
  nightGame: { traffic: 1.35, w: { cocoa: 1.8, hotdog: 1.2, fries: 1.3 }, merch: 1.3 },
};
export const menuAvail = (up) => { const e = effects('snack', up); return MENU.filter((m) => m.start || e.unlock.has(m.id)); };
export function snackWeights(ctx) {
  const w = WEATHER[ctx.weather], e = effects('snack', ctx.up), story = SNACK_STORY[ctx.event]?.w || {};
  return menuAvail(ctx.up).map((m) => {
    let k = m.base * (story[m.id] || 1);
    if (m.id === 'cocoa') { k *= w.hot ? 0.3 : ctx.weather === 'rainy' ? 1.8 : 1.4; return { ...m, k }; }
    if (m.merch) { k *= SNACK_STORY[ctx.event]?.merch || 1; if (ctx.weather === 'rainy') k *= 0.6; return { ...m, k }; }
    if (w.hot) { if (m.id === 'drink') k *= 2; if (m.id === 'icecream' || m.id === 'cone') k *= 2.2; if (m.id === 'slush' || m.id === 'froslem') k *= 2.6; if (m.id === 'hotdog') k *= 0.8; }
    else if (ctx.weather === 'rainy') { if (m.id === 'icecream' || m.id === 'cone' || m.id === 'slush' || m.id === 'froslem') k *= 0.4; if (m.id === 'hotdog' || m.id === 'fries') k *= 1.4; }
    else if (ctx.weather === 'cloudy' && (m.id === 'hotdog' || m.id === 'fries')) k *= 1.25;
    return { ...m, k };
  });
}
// how many fields: 1 + ball fields 2-4 + two for every pair bought + one for every other sport (basketball, soccer, football, tennis)
const FIELD_PAIRS = ['fields56', 'fields78', 'fields910', 'fields1112'];
export const SPORTS = ['basketball', 'soccer', 'football', 'tennis'];
export const fieldsOwned = (up = {}) => {
  const legacy = up.field5 || up.field6;
  return 1 + ['field2', 'field3', 'field4'].filter((id) => up[id]).length + 2 * FIELD_PAIRS.filter((id, i) => up[id] || (i === 0 && legacy)).length + SPORTS.filter((id) => up[id]).length;
};
export const stadiumLevel = (up = {}) => ['stadium', 'stadium2', 'stadium3'].filter((id) => up[id]).length;
export const stadiumMult = (up = {}) => Math.pow(3, stadiumLevel(up));
/** How the Snack Shack looks: it grows up as the ballpark does. */
export const lookOf = (up = {}) => { const L = stadiumLevel(up); return L >= 3 ? 'legend' : L === 2 ? 'lights' : L === 1 ? 'stadium' : fieldsOwned(up) >= 3 ? 'park' : 'sandlot'; };
/** [fewest, most] fans a day for this many ball fields. Up to 4 fields it is 10-50, 50-100, 100-200, 200-400; every two more fields makes it 4 times bigger. */
export const crowdBand = (n) => {
  n = Math.max(1, Math.floor(n));
  if (n <= 4) return [[10, 50], [50, 100], [100, 200], [200, 400]][n - 1];
  const k = Math.pow(4, (n - 4) / 2);
  return [Math.round(200 * k), Math.round(400 * k)];
};
// how much the stand can serve and store: four fifths of the biggest crowd for the fields owned (the window and cook upgrades cover the rest)
const bigScale = (up) => Math.round(0.8 * crowdBand(fieldsOwned(up))[1] * stadiumMult(up));
export const SNACK = {
  id: 'snack', unit: 'portions', startBank: 40, stockStep: (up) => { const m = SNACK.stockMax(up || {}); return m >= 5e6 ? 250000 : m >= 1e6 ? 50000 : m >= 250000 ? 10000 : m >= 60000 ? 2500 : m >= 15000 ? 1000 : m >= 4000 ? 250 : m >= 1000 ? 100 : m >= 300 ? 25 : m >= 120 ? 10 : 5; },
  /** Expected buyers per menu item for a day (before luck): the same number is compared between two days to say "more fans today" or "fewer". */
  demand(ctx, level = 'normal') {
    const e = effects('snack', ctx.up), lvl = PRICE_LEVELS[level] || PRICE_LEVELS.normal;
    const ws = snackWeights(ctx), tot = ws.reduce((a, b) => a + b.k, 0) || 1;
    const accept = Math.min(1, lvl.accept + e.ptol * (lvl.mult > 1 ? 1 : 0.4) + WEATHER[ctx.weather].bonus * 0.5), n = SNACK.trafficOf(ctx);
    return Object.fromEntries(ws.map((w) => [w.id, n * (w.k / tot) * accept]));
  },
  stockMax: (up) => Math.max(40 + effects('snack', up).stock, bigScale(up)),
  unitCostOf: (m, up) => m.cost * effects('snack', up).cost,
  costOf(plan, up) { return Object.entries(plan.stock).reduce((a, [id, n]) => a + n * MENU.find((m) => m.id === id).cost * effects('snack', up).cost, 0); },
  trafficOf(ctx) {
    const e = effects('snack', ctx.up), w = WEATHER[ctx.weather];
    const st = SNACK_STORY[ctx.event]?.traffic || 1;
    // The crowd comes in bands that depend on how many ball fields he owns (Rob, Nov 8): 1 field 10-50 people a day, 2 fields 50-100,
    // 3 fields 100-200, 4 fields 200-400, then two fields at a time, 4 times bigger each pair (see crowdBand). Weather, game-day stories and the shop upgrades decide where in the band.
    const score = w.base.snack * st * (1 + e.traffic) + e.flat;           // about 6 (rainy, bare stand) up to about 25 (hot game day, every upgrade bought)
    const q = Math.max(0, Math.min(1.05, (score - 6) / 20));
    const [lo, hi] = crowdBand(fieldsOwned(ctx.up));
    return (lo + (hi - lo) * q) * stadiumMult(ctx.up);        // each stadium level triples the crowd
  },
  // how many fans the windows can serve in a day before people give up on the line: the stand's size, plus the windows and workers he bought
  serveCap: (up) => { const e = effects('snack', up); return Math.round(Math.max(40 + e.serve, bigScale(up)) * (1 + e.staff)); },
  sim(plan, ctx, r = Math.random) {
    const e = effects('snack', ctx.up), lvl = PRICE_LEVELS[plan.level || 'normal'];
    const n = Math.max(0, Math.round(SNACK.trafficOf(ctx) * (0.85 + 0.3 * r())));
    // A huge crowd (thousands and thousands of fans) is played with 4,000 stand-ins that each stand for G fans; every count and every dollar is multiplied back by G.
    const G = Math.max(1, n / 4000), m = G > 1 ? 4000 : n;
    const weights = snackWeights(ctx), total = weights.reduce((a, b) => a + b.k, 0);
    const left = {}; for (const [k, v] of Object.entries(plan.stock)) left[k] = v / G;
    const bySold = {}, byOut = {};
    let sold = 0, revenue = 0, pricey = 0, soldout = 0, busy = 0, served = 0;
    const customers = [];
    const cap = SNACK.serveCap(ctx.up) / G;
    const p2 = 0.22 + 0.07 * (weights.filter((w) => !w.merch).length - 3);
    const accept = Math.min(1, lvl.accept + e.ptol * (lvl.mult > 1 ? 1 : 0.4) + WEATHER[ctx.weather].bonus * 0.5);
    for (let i = 0; i < m; i++) {
      if (served >= cap) { busy++; customers.push({ res: 'busy' }); continue; }
      const items = 1 + (r() < p2 ? 1 : 0) + (r() < p2 * 0.4 ? 1 : 0);   // a bigger menu tempts fans to grab more
      let any = false, paid = 0, wasOut = false, refused = false;
      for (let j = 0; j < items; j++) {
        let x = r() * total, pick = weights[0];
        for (const w of weights) { x -= w.k; if (x <= 0) { pick = w; break; } }
        if (r() >= accept) { refused = true; continue; }
        if ((left[pick.id] || 0) < 0.5) { wasOut = true; byOut[pick.id] = (byOut[pick.id] || 0) + 1; continue; }
        left[pick.id]--; bySold[pick.id] = (bySold[pick.id] || 0) + 1; sold++; any = true; paid += pick.price * lvl.mult;
      }
      if (any) { served++; revenue += paid; customers.push({ res: 'buy', paid }); }
      else if (wasOut) { soldout++; customers.push({ res: 'soldout' }); }
      else { pricey++; customers.push({ res: 'pricey' }); }
      void refused;
    }
    const cost = SNACK.costOf(plan, ctx.up);
    const R = (x) => Math.round(x * G);
    const leftover = R(Object.values(left).reduce((a, b) => a + Math.max(0, b), 0));
    const scaled = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, R(v)]));
    revenue = G > 1 ? Math.round(revenue * G * 100) / 100 : revenue;
    return { customers, scale: G, sold: R(sold), pricey: R(pricey), soldout: R(soldout), busy: R(busy), leftover, revenue, cost, profit: revenue - cost, n, bySold: scaled(bySold), byOut: scaled(byOut) };
  },
};

export const SIMS = { lemonade: LEMONADE, icecream: ICECREAM, snack: SNACK };

/** What a sensible player earns over one season with these upgrades (used to hand out stars fairly). */
export function parProfit(id, up, runs = 6) {
  if (id === 'snack' && (fieldsOwned(up) >= 8 || stadiumLevel(up) >= 1)) runs = 1;      // thousands of fans a day: one season is enough
  let seed = 12345; const r = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  let total = 0;
  for (let k = 0; k < runs; k++) for (let d = 0; d < seasonDays(id); d++) {
    const ctx = { ...rollDay(r, up, id), up };
    total += botDay(id, ctx, 0.9, r).profit;
  }
  return total / runs;
}

/** A competent player: picks a fair price for the quality, stocks what the weather suggests. skill 0..1 adds noise. */
export function botDay(id, ctx, skill = 1, r = Math.random) {
  const sim = SIMS[id], up = ctx.up;
  if (id === 'snack') {
    const weights = snackWeights(ctx); const tot = weights.reduce((a, b) => a + b.k, 0);
    const exp = SNACK.trafficOf(ctx) * 1.35;
    const stock = {};
    for (const w of weights) stock[w.id] = Math.min(SNACK.stockMax(up), Math.max(w.merch ? 5 : 0, Math.round((exp * (w.k / tot) * (1.1 + (1 - skill) * (r() - 0.5))) / 5) * 5));
    return sim.sim({ stock, level: skill > 0.6 ? 'normal' : ['cheap', 'normal', 'fancy'][Math.floor(r() * 3)] }, ctx, r);
  }
  const d = SINGLE[id], qM = 1 + effects(id, up).ptol;
  const fair = id === 'lemonade' ? 1 : 1.75;
  let price = Math.round((fair * qM) / d.priceStep) * d.priceStep + (skill < 0.6 ? (r() - 0.5) * 2 : 0);
  price = Math.min(d.priceMax, Math.max(d.priceMin, Math.round(price / d.priceStep) * d.priceStep));
  const exp = traffic(id, ctx) * 0.85 * (id === 'icecream' ? 1.2 : 1);
  const catNeed = ctx.event === d.cater.event ? d.cater.need : 0;
  let units = (exp + catNeed) * (1.1 + (1 - skill) * (r() - 0.3));
  const maxStock = single(id).stockMax(up);
  let stock = id === 'icecream' ? Math.ceil(units / 12) : Math.round(units / 10) * 10;
  stock = Math.max(id === 'icecream' ? 1 : 10, Math.min(maxStock, stock));
  return sim.sim({ price, stock }, ctx, r);
}
