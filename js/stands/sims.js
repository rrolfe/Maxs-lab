// Pure simulation rules for the tiny businesses (easy to test and tune).
export const WEATHER = {
  sunny:  { icon: '☀️', base: { lemonade: 20, icecream: 24 }, bonus: 0 },
  hot:    { icon: '🔥', base: { lemonade: 30, icecream: 36 }, bonus: 0.1 },
  cloudy: { icon: '⛅', base: { lemonade: 12, icecream: 12 }, bonus: 0 },
  rainy:  { icon: '🌧️', base: { lemonade: 6, icecream: 4 }, bonus: -0.1 },
};
export const EVENTS = { game: { mult: 1.5 }, roadwork: { mult: 0.7 } };

export function rollDay(r = Math.random) {
  const x = r();
  const weather = x < 0.35 ? 'sunny' : x < 0.55 ? 'hot' : x < 0.85 ? 'cloudy' : 'rainy';
  const y = r();
  const event = y < 0.12 ? 'game' : y < 0.22 ? 'roadwork' : null;
  return { weather, event };
}

/** Piecewise-linear lookup. table: [[price, rate], ...] sorted by price. */
function interp(table, p) {
  if (p <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    if (p <= table[i][0]) { const [x0, y0] = table[i - 1], [x1, y1] = table[i]; return y0 + ((p - x0) / (x1 - x0)) * (y1 - y0); }
  }
  return table[table.length - 1][1];
}
const LEMON_RATE = [[0.25, 1], [0.5, 1], [0.75, 0.85], [1, 0.7], [1.25, 0.5], [1.5, 0.3], [2, 0.1], [3, 0.02]];
const CREAM_RATE = [[1, 1], [1.5, 0.85], [2, 0.65], [2.5, 0.45], [3, 0.25], [4, 0.08], [5, 0.02]];

const upMult = (up) => (up.sign ? 1.15 : 1) * (up.table ? 1.25 : 1);

export const LEMONADE = {
  id: 'lemonade', cupCost: (up) => (up.cooler ? 0.2 : 0.25), unit: 'cups', startBank: 20,
  stockStep: 10, stockMax: (up) => (up.table ? 80 : 60), priceMin: 0.25, priceMax: 3, priceStep: 0.25, defaultPrice: 1,
  costOf: (stock, up) => stock * (up.cooler ? 0.2 : 0.25),
  sim({ price, stock }, { weather, event, up }, r = Math.random) {
    const w = WEATHER[weather];
    const n = Math.round(w.base.lemonade * (event ? EVENTS[event].mult : 1) * upMult(up) * (0.85 + 0.3 * r()));
    const rate = Math.min(1, Math.max(0, interp(LEMON_RATE, price) + w.bonus));
    let left = stock, sold = 0, pricey = 0, soldout = 0;
    const customers = [];
    for (let i = 0; i < n; i++) {
      if (r() >= rate) { pricey++; customers.push({ res: 'pricey' }); }
      else if (left <= 0) { soldout++; customers.push({ res: 'soldout' }); }
      else { left--; sold++; customers.push({ res: 'buy', paid: price }); }
    }
    const revenue = sold * price, cost = LEMONADE.costOf(stock, up);
    return { customers, sold, pricey, soldout, leftover: left, revenue, cost, profit: revenue - cost, n };
  },
};

export const ICECREAM = {
  id: 'icecream', unit: 'tubs', startBank: 30, tubCost: 6, scoopsPerTub: 12,
  stockStep: 1, stockMax: (up) => (up.freezer ? 8 : 6), priceMin: 1, priceMax: 4, priceStep: 0.5, defaultPrice: 1.5, doubleExtra: 1,
  costOf: (tubs) => tubs * 6,
  sim({ price, stock, deal }, { weather, event, up }, r = Math.random) {
    const w = WEATHER[weather];
    const n = Math.round(w.base.icecream * (event ? EVENTS[event].mult : 1) * (up.sign ? 1.15 : 1) * (up.table ? 1.25 : 1) * (0.85 + 0.3 * r()));
    let left = stock * 12, sold = 0, pricey = 0, soldout = 0, revenue = 0, doubles = 0;
    const customers = [];
    for (let i = 0; i < n; i++) {
      const wantsDouble = r() < 1 / 3;
      const p = price + (wantsDouble ? 1 : 0);
      let rate = interp(CREAM_RATE, p) + w.bonus + (deal ? 0.12 : 0);
      rate = Math.min(1, Math.max(0, rate));
      if (r() >= rate) { pricey++; customers.push({ res: 'pricey' }); continue; }
      const need = wantsDouble ? 2 : 1;
      if (left <= 0) { soldout++; customers.push({ res: 'soldout' }); continue; }
      const got = Math.min(need, left); left -= got; sold += got;
      let paid = got === 2 ? price + 1 : price;
      if (deal && r() < 0.33) paid *= 0.8;            // a friend joins and gets the deal price
      revenue += paid; if (got === 2) doubles++;
      customers.push({ res: 'buy', paid, double: got === 2 });
    }
    const cost = ICECREAM.costOf(stock);
    return { customers, sold, pricey, soldout, leftover: left, revenue, cost, profit: revenue - cost, n, doubles };
  },
};

export const SIMS = { lemonade: LEMONADE, icecream: ICECREAM };
