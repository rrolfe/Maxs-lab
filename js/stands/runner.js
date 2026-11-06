// Generic runner for the tiny businesses: plan the day -> watch the customers -> read the receipt.
import { S, save } from '../core/store.js';
import { h, clamp, money, confetti, reduceMotion, pick, toast } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx } from '../core/audio.js';
import { awardBadges } from '../core/badges.js';
import { SIMS, WEATHER, rollDay } from './sims.js';

addStrings({
  en: {
    stLemonade: 'Lemonade Stand', stIcecream: 'Ice Cream Stand', stBank: 'Your money', stForecast: 'Today’s forecast',
    w_sunny: 'Sunny', w_hot: 'Hot!', w_cloudy: 'Cloudy', w_rainy: 'Rainy',
    e_game: 'Big game nearby: extra people!', e_roadwork: 'Road work: fewer people walk by.',
    stPrice: 'Price', stPerCup: 'per cup', stPerScoop: 'per scoop', stStock: 'Make', stCups: 'cups', stTubs: 'tubs', stCost: 'Cost to make',
    stCostLine: '{n} {u} × {p} = {c}', stTubLine: '{n} tubs × $6.00 = {c}', stScoops: '1 tub = 12 scoops', stOpen: 'Open the stand!', stSkip: 'Skip to the end',
    stDeal: 'Buddy deal', stDealSub: 'More people say yes, but some friends pay 20% less.',
    stUpgrades: 'Upgrades', stBuy: 'Buy', stOwned: 'Yours', stNeedMore: 'Need ${n} more',
    up_sign: 'Bright sign', up_signSub: '15% more people stop by', up_table: 'Big table', up_tableSub: '25% more people and you can make more', up_cooler: 'Cooler box', up_coolerSub: 'Cups cost less to make', up_freezer: 'Big freezer', up_freezerSub: 'Store up to 8 tubs',
    stReceipt: 'End of day', stSold: 'Sold', stTooPricey: 'Said “too pricey”', stSoldOut: 'Left because you ran out', stLeft: 'Left over', stSales: 'Money in', stSpent: 'Cost to make', stProfit: 'Profit', stLoss: 'Loss',
    stNextDay: 'Open again tomorrow', stBestDay: 'New best day!', stDayN: 'Day {n}',
    stCoachFirst: 'Tip: not too cheap, not too pricey. Try a price and see who buys!',
    stCoachSoldOut: 'Last time you ran out and {n} people left. Make more today?', stCoachPricey: 'Last time {n} people said “too pricey”. Try a lower price?', stCoachLeft: 'Last time {n} were left over. Make a few fewer?', stCoachGood: 'Last time went well. Can you beat ${p} profit?',
    stTipSoldOut: 'You sold out! {n} people wanted some. Make more next time.', stTipPricey: '{n} people said “too pricey”. A lower price might bring them in.', stTipLeft: '{n} {u} were left over. Make fewer to save money.', stTipGreat: 'Great day! You read the weather and the price just right.', stTipRain: 'Rain keeps people home. Make less on rainy days.', stTipOk: 'Nice work. Try a different price tomorrow to see what changes.',
    stLoan: 'Your family lent you ${n} so you can keep going.', stNoMoney: 'Not enough money for that much.',
    stBoughtUp: 'New upgrade: {n}!',
  },
  es: {
    stLemonade: 'Puesto de limonada', stIcecream: 'Puesto de helados', stBank: 'Tu dinero', stForecast: 'Pronóstico de hoy',
    w_sunny: 'Soleado', w_hot: '¡Calor!', w_cloudy: 'Nublado', w_rainy: 'Lluvioso',
    e_game: 'Hay un gran juego cerca: ¡más gente!', e_roadwork: 'Hay obras: pasa menos gente.',
    stPrice: 'Precio', stPerCup: 'por vaso', stPerScoop: 'por bola', stStock: 'Preparar', stCups: 'vasos', stTubs: 'botes', stCost: 'Costo de preparar',
    stCostLine: '{n} {u} × {p} = {c}', stTubLine: '{n} botes × $6.00 = {c}', stScoops: '1 bote = 12 bolas', stOpen: '¡Abrir el puesto!', stSkip: 'Saltar al final',
    stDeal: 'Oferta de amigos', stDealSub: 'Más gente dice que sí, pero algunos amigos pagan 20% menos.',
    stUpgrades: 'Mejoras', stBuy: 'Comprar', stOwned: 'Tuya', stNeedMore: 'Faltan ${n}',
    up_sign: 'Letrero brillante', up_signSub: '15% más gente se detiene', up_table: 'Mesa grande', up_tableSub: '25% más gente y puedes preparar más', up_cooler: 'Hielera', up_coolerSub: 'Los vasos cuestan menos', up_freezer: 'Congelador grande', up_freezerSub: 'Guarda hasta 8 botes',
    stReceipt: 'Fin del día', stSold: 'Vendidos', stTooPricey: 'Dijeron “muy caro”', stSoldOut: 'Se fueron porque se acabó', stLeft: 'Sobraron', stSales: 'Dinero que entró', stSpent: 'Costo de preparar', stProfit: 'Ganancia', stLoss: 'Pérdida',
    stNextDay: 'Abrir de nuevo mañana', stBestDay: '¡Nuevo mejor día!', stDayN: 'Día {n}',
    stCoachFirst: 'Consejo: ni muy barato ni muy caro. ¡Prueba un precio y mira quién compra!',
    stCoachSoldOut: 'La última vez se acabó y {n} personas se fueron. ¿Preparas más hoy?', stCoachPricey: 'La última vez {n} personas dijeron “muy caro”. ¿Pruebas un precio menor?', stCoachLeft: 'La última vez sobraron {n}. ¿Preparas un poco menos?', stCoachGood: 'La última vez salió bien. ¿Puedes superar ${p} de ganancia?',
    stTipSoldOut: '¡Se acabó todo! {n} personas querían. Prepara más la próxima vez.', stTipPricey: '{n} personas dijeron “muy caro”. Un precio menor podría atraerlas.', stTipLeft: 'Sobraron {n} {u}. Prepara menos para ahorrar.', stTipGreat: '¡Gran día! Leíste bien el clima y el precio.', stTipRain: 'La lluvia deja a la gente en casa. Prepara menos en días de lluvia.', stTipOk: 'Buen trabajo. Mañana prueba otro precio y mira qué cambia.',
    stLoan: 'Tu familia te prestó ${n} para que sigas.', stNoMoney: 'No alcanza el dinero para tanto.',
    stBoughtUp: '¡Nueva mejora: {n}!',
  },
});

const CFG = {
  lemonade: { title: 'stLemonade', unit: 'stCups', per: 'stPerCup', ups: { sign: 15, table: 30, cooler: 25 }, face: ['🧒', '👧', '👦', '🧑', '👩', '👨', '🧓', '👵', '👴', '🧑‍🦱'] },
  icecream: { title: 'stIcecream', unit: 'stTubs', per: 'stPerScoop', ups: { sign: 20, table: 40, freezer: 45 }, face: ['🧒', '👧', '👦', '🧑', '👩', '👨', '🧓', '🧑‍🦰', '👱', '🧑‍🦳'] },
};

export function standState(id) {
  const sim = SIMS[id];
  return (S.stands[id] ||= { bank: sim.startBank, days: 0, best: 0, total: 0, up: {}, next: null, last: null, price: sim.defaultPrice, stock: id === 'lemonade' ? 20 : 2, deal: false });
}
const show = (root, ...k) => root.replaceChildren(...k.flat().filter((x) => x != null && x !== false));
const wLabel = (k) => t('w_' + k);
const stockCost = (id, st, stock) => SIMS[id].costOf(stock, st.up);

export function mount(el, { id }) {
  const sim = SIMS[id], cfg = CFG[id], st = standState(id);
  let timer = 0, alive = true;
  if (!st.next) { st.next = rollDay(); save(); }
  const root = h('div', { class: 'stand', 'data-stand': id }); el.append(root);

  function plan() {
    clearTimeout(timer);
    const { weather, event } = st.next;
    const minCost = stockCost(id, st, sim.stockStep);
    let loan = 0;
    if (st.bank < minCost) { loan = sim.startBank - st.bank; st.bank = sim.startBank; save(); }
    st.stock = clamp(st.stock, 0, sim.stockMax(st.up)); st.price = clamp(st.price, sim.priceMin, sim.priceMax);
    while (stockCost(id, st, st.stock) > st.bank && st.stock > 0) st.stock -= sim.stockStep;
    const last = st.last;
    let coach = t('stCoachFirst');
    if (last) {
      coach = last.soldout >= 3 ? t('stCoachSoldOut', { n: last.soldout }) : last.pricey >= 5 ? t('stCoachPricey', { n: last.pricey })
        : last.leftover >= (id === 'icecream' ? 12 : 5) ? t('stCoachLeft', { n: id === 'icecream' ? Math.floor(last.leftover / 12) || 1 : last.leftover })
        : t('stCoachGood', { p: Math.max(1, Math.floor(last.profit)).toFixed(0) });
    }

    const priceVal = h('output', { class: 'big', id: 'pv' }), stockVal = h('output', { class: 'big', id: 'sv' });
    const costLine = h('p', { class: 'costline' }), openBtn = h('button', { class: 'btn gold go', onclick: run }, h('span', { html: icons[id](40) }), t('stOpen'));
    const dealBtn = id === 'icecream' ? h('button', { class: 'chip big', 'aria-pressed': String(!!st.deal), onclick: (e) => { st.deal = !st.deal; e.currentTarget.setAttribute('aria-pressed', String(st.deal)); sfx.tap(); save(); } }, t('stDeal')) : null;
    function refresh() {
      priceVal.textContent = money(st.price); stockVal.textContent = st.stock;
      const c = stockCost(id, st, st.stock);
      costLine.textContent = id === 'lemonade'
        ? t('stCostLine', { n: st.stock, u: t('stCups'), p: money(st.up.cooler ? 0.2 : 0.25), c: money(c) })
        : t('stTubLine', { n: st.stock, c: money(c) });
      openBtn.disabled = st.stock <= 0;
    }
    const step = (kind, dir) => () => {
      sfx.tap();
      if (kind === 'price') st.price = clamp(Math.round((st.price + dir * sim.priceStep) * 100) / 100, sim.priceMin, sim.priceMax);
      else {
        const next = clamp(st.stock + dir * sim.stockStep, 0, sim.stockMax(st.up));
        if (stockCost(id, st, next) > st.bank) { toast(t('stNoMoney')); return; }
        st.stock = next;
      }
      save(); refresh();
    };
    const stepper = (label, sub, valEl, kind) => h('div', { class: 'card stepper' },
      h('h3', {}, label), h('div', { class: 'srow' },
        h('button', { class: 'btn alt icon', 'aria-label': '−', onclick: step(kind, -1), html: icons.minus(34) }),
        h('div', { class: 'val' }, valEl, h('small', {}, sub)),
        h('button', { class: 'btn alt icon', 'aria-label': '+', onclick: step(kind, 1), html: icons.plus(34) })));

    const ups = Object.entries(cfg.ups).map(([k, cost]) => {
      const own = !!st.up[k];
      return h('button', { class: 'upg' + (own ? ' own' : ''), disabled: own || st.bank < cost, 'data-up': k, onclick: () => { st.bank -= cost; st.up[k] = 1; save(); sfx.coin(); toast(t('stBoughtUp', { n: t('up_' + k) })); plan(); } },
        h('strong', {}, t('up_' + k)), h('small', {}, t('up_' + k + 'Sub')), h('span', { class: 'tag' }, own ? t('stOwned') : money(cost)));
    });

    show(root, 
      h('div', { class: 'screen-head' }, h('button', { class: 'btn ghost icon', 'aria-label': t('back'), onclick: () => go('/stands'), html: icons.back(34) }), h('h1', {}, t(cfg.title)),
        h('span', { class: 'chip bank' }, '💵 ', t('stBank') + ': ' + money(st.bank))),
      loan ? h('p', { class: 'notice' }, t('stLoan', { n: loan.toFixed(2) })) : null,
      h('div', { class: 'forecast card' },
        h('div', { class: 'wx' }, h('span', { class: 'wxi' }, WEATHER[weather].icon), h('div', {}, h('small', {}, t('stForecast') + ' · ' + t('stDayN', { n: st.days + 1 })), h('strong', {}, wLabel(weather)))),
        event ? h('div', { class: 'ev' }, event === 'game' ? '⚾ ' : '🚧 ', t('e_' + event)) : null),
      h('p', { class: 'coach' }, h('span', { html: icons.bulb(30) }), coach),
      h('div', { class: 'plan' },
        stepper(t('stPrice'), t(cfg.per), priceVal, 'price'),
        stepper(t('stStock'), t(cfg.unit) + (id === 'icecream' ? ' · ' + t('stScoops') : ''), stockVal, 'stock')),
      costLine, dealBtn ? h('div', { class: 'dealrow' }, dealBtn, h('small', {}, t('stDealSub'))) : null,
      h('div', { class: 'openrow' }, openBtn),
      h('h3', { class: 'uph' }, t('stUpgrades')), h('div', { class: 'ups' }, ups));
    refresh();
  }

  function run() {
    sfx.pop();
    const ctx = { ...st.next, up: st.up };
    const res = sim.sim({ price: st.price, stock: st.stock, deal: id === 'icecream' && st.deal }, ctx);
    const lane = h('div', { class: 'lane' }), tally = { sold: 0, pricey: 0, soldout: 0, cash: 0 };
    const nums = { sold: h('b', {}, '0'), pricey: h('b', {}, '0'), soldout: h('b', {}, '0'), cash: h('b', {}, money(0)) };
    const skip = h('button', { class: 'btn ghost small', onclick: () => finish() }, t('stSkip'));
    show(root, 
      h('div', { class: 'screen-head' }, h('h1', {}, t(cfg.title)), h('span', { class: 'chip' }, WEATHER[ctx.weather].icon + ' ' + wLabel(ctx.weather))),
      h('div', { class: 'stage card' }, lane, h('div', { class: 'standface', html: icons[id](120) })),
      h('div', { class: 'tallies' },
        h('div', { class: 'tl good' }, t('stSold'), nums.sold), h('div', { class: 'tl' }, t('stSales'), nums.cash),
        h('div', { class: 'tl' }, '💭 ' + t('stTooPricey'), nums.pricey), h('div', { class: 'tl' }, '🙁 ' + t('stSoldOut'), nums.soldout)),
      h('div', { class: 'center' }, skip));
    const gap = clamp(5200 / Math.max(res.customers.length, 1), 70, 240);
    let i = 0;
    function tick() {
      if (!alive) return;
      if (i >= res.customers.length) { timer = setTimeout(finish, 500); return; }
      const c = res.customers[i++];
      const face = pick(cfg.face);
      const bubble = c.res === 'buy' ? '+' + money(c.paid).replace('.00', '') : c.res === 'pricey' ? '💭' : '🙁';
      const cust = h('div', { class: 'cust ' + c.res }, h('span', { class: 'face' }, face), h('span', { class: 'bub' }, bubble));
      lane.append(cust);
      requestAnimationFrame(() => requestAnimationFrame(() => cust.classList.add('arrive')));
      while (lane.children.length > 6) lane.firstChild.remove();
      if (c.res === 'buy') { tally.sold++; tally.cash += c.paid; if (i % 2) sfx.coin(); }
      else if (c.res === 'pricey') tally.pricey++; else tally.soldout++;
      nums.sold.textContent = tally.sold; nums.pricey.textContent = tally.pricey; nums.soldout.textContent = tally.soldout; nums.cash.textContent = money(tally.cash);
      timer = setTimeout(tick, reduceMotion() ? 20 : gap);
    }
    let finished = false;
    function finish() { if (finished) return; finished = true; clearTimeout(timer); receipt(res); }
    tick();
  }

  function receipt(res) {
    const profit = res.profit;
    st.bank = Math.round((st.bank + profit) * 100) / 100; st.days++; st.total += profit;
    const newBest = profit > st.best; if (newBest) st.best = profit;
    const w = st.next.weather;
    st.last = { price: st.price, stock: st.stock, sold: res.sold, pricey: res.pricey, soldout: res.soldout, leftover: res.leftover, profit, weather: w };
    st.next = rollDay(); save();
    const unitsLeft = id === 'icecream' ? Math.floor(res.leftover / 12) : res.leftover;
    const tips = res.soldout >= 3 ? t('stTipSoldOut', { n: res.soldout })
      : w === 'rainy' && res.leftover > 3 ? t('stTipRain')
      : res.pricey >= 5 ? t('stTipPricey', { n: res.pricey })
      : res.leftover >= (id === 'icecream' ? 12 : 5) ? t('stTipLeft', { n: unitsLeft || 1, u: t(cfg.unit) })
      : profit >= (id === 'icecream' ? 15 : 8) ? t('stTipGreat') : t('stTipOk');
    const row = (label, val, cls = '') => h('div', { class: 'rrow ' + cls }, h('span', {}, label), h('b', {}, val));
    const fresh = awardBadges();
    show(root, 
      h('div', { class: 'screen-head' }, h('h1', {}, t('stReceipt')), newBest && profit > 0 ? h('span', { class: 'chip on' }, '⭐ ' + t('stBestDay')) : null),
      h('div', { class: 'receipt card' },
        row(t('stSold'), `${res.sold} × ${money(st.last.price)}`), row(t('stSales'), '+' + money(res.revenue), 'plus'),
        row(t('stSpent'), '−' + money(res.cost), 'minus'),
        row(profit >= 0 ? t('stProfit') : t('stLoss'), (profit >= 0 ? '+' : '−') + money(Math.abs(profit)), 'total ' + (profit >= 0 ? 'good' : 'bad')),
        h('hr'), row('💭 ' + t('stTooPricey'), res.pricey), row('🙁 ' + t('stSoldOut'), res.soldout), row(t('stLeft'), unitsLeft + (id === 'icecream' ? ' ' + t('stTubs') : ' ' + t('stCups'))),
        row(t('stBank'), money(st.bank), 'bank')),
      h('p', { class: 'coach' }, h('span', { html: icons.bulb(30) }), tips),
      fresh.length ? h('p', { class: 'notice' }, '🏅 ' + fresh.join(', ')) : null,
      h('div', { class: 'openrow' }, h('button', { class: 'btn gold go', onclick: () => { sfx.pop(); plan(); } }, t('stNextDay')), h('button', { class: 'btn ghost', onclick: () => go('/stands') }, t('done'))));
    if (profit >= 8) { sfx.hardCorrect(); confetti(); } else if (profit > 0) sfx.correct();
  }

  plan();
  return () => { alive = false; clearTimeout(timer); };
}
