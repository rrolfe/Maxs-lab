// Runner for the tiny businesses (lemonade, ice cream, ballpark snack shack).
// A stand is played in SEASONS of 10 selling days (15 for the Snack Shack): plan the day -> watch the crowd -> read the receipt -> after day 10 a season summary.
// Upgrades are kept between seasons. A new season costs pearls (see js/core/economy.js).
import { S, save, spendPearls } from '../core/store.js';
import { h, clamp, money, confetti, reduceMotion, pick, toast } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx } from '../core/audio.js';
import { awardBadges } from '../core/badges.js';
import { COST } from '../core/economy.js';
import { SIMS, fieldsOwned, lookOf, stadiumLevel, fixLegacyUp, WEATHER, rollDay, seasonDays, upgradeList, visibleUpgrades, canBuy, effects, traffic, serveCap, stockStepOf, MENU, menuAvail, PRICE_LEVELS, SNACK, snackWeights, parProfit } from './sims.js';
import { UP_TEXT } from './upgrade-text.js';
import { PERKS, newPerks, FACT_COUNT } from './perks.js';

addStrings({
  en: {
    stLemonade: 'Lemonade Stand', stIcecream: 'Ice Cream Stand', stSnack: 'Ballpark Snack Shack', stBank: 'Your money', stForecast: 'Today’s forecast',
    w_sunny: 'Sunny', w_hot: 'Hot!', w_cloudy: 'Cloudy', w_rainy: 'Rainy',
    e_game: 'Big game nearby: extra people!', e_roadwork: 'Road work: fewer people walk by.', e_catering: 'A company wants 50 cups for a meeting! Have 50 cups ready.', e_party: 'Birthday party order: 36 scoops (3 tubs)! Have 3 tubs ready.',
    e_closeGame: 'Close game! Fans are on the edge of their seats.', e_homeRun: 'Home run! Everyone wants candy and snacks.', e_rainDelay: 'Rain delay! People want something hot.', e_bigCrowd: 'Big crowd today! Sold-out stands.',
    stPrice: 'Price', stPerCup: 'per cup', stPerScoop: 'per scoop', stStock: 'Make', stCups: 'cups', stTubs: 'tubs', stCost: 'Cost to make',
    stCostLine: '{n} {u} × {p} = {c}', stTubLine: '{n} tubs × {p} = {c}', stScoops: '1 tub = 12 scoops', stOpen: 'Open the stand!', stSkip: 'Skip to the end',
    stDeal: 'Buddy deal', stDealSub: 'More people say yes, but some friends pay 20% less.',
    stUpgrades: 'Shop', stShopSub: 'Upgrades stay with you in every season.', stBuy: 'Buy', stOwned: 'Yours', stNeedMore: 'Need ${n} more', stNeeds: 'Needs: {x}', stNewShop: 'New things in the shop!',
    stReceipt: 'End of day', stSold: 'Sold', stTooPricey: 'Said “too pricey”', stSoldOut: 'Left because you ran out', stBusy: 'Left: line too long', stLeft: 'Left over', stSales: 'Money in', stSpent: 'Cost to make', stProfit: 'Profit', stLoss: 'Loss',
    stNextDay: 'Open again tomorrow', stBestDay: 'New best day!', stDayN: 'Day {n}', stSeasonN: 'Season {n}', stDayOf: 'Day {d} of {m}', stCrowd: 'Customers today', stCustomers: '{n} customers',
    stCoachFirst: 'Tip: not too cheap, not too pricey. Try a price and see who buys!',
    stCoachSoldOut: 'Last time you ran out and {n} people left. Make more today?', stCoachPricey: 'Last time {n} people said “too pricey”. Try a lower price?', stCoachLeft: 'Last time {n} were left over. Make a few fewer?', stCoachGood: 'Last time went well. Can you beat ${p} profit?', stCoachBusySnack: 'Last time {n} fans left because the line was too long. Add a window or hire a worker in the shop!', stCapLine: 'Your windows can serve about {n} fans today', stCapWarn: '⏳ The line may get too long! Add a window or hire a worker in the shop.', stCapOk: '✅ Enough windows and workers for today.', stCoachBusy: '{n} people left because the line was too long. A helper or a second table would serve more people!',
    stTipSoldOut: 'You sold out! {n} people wanted some. Make more next time.', stTipPricey: '{n} people said “too pricey”. A lower price might bring them in.', stTipLeft: '{n} {u} were left over. Make fewer to save money.', stTipGreat: 'Great day! You read the weather and the price just right.', stTipRain: 'Rain keeps people home. On rainy days, make less so nothing is wasted.', stTipOk: 'Not bad! Small changes to price and amount can make a big difference.', stTipBusy: '{n} people left because the line was too long. Hire a helper or add a table!',
    stCateredOk: 'Catering delivered! The company paid {n}.', stCateredMiss: 'The big order needed {u} but you did not have enough. Next time make extra!',
    stLoan: 'Your family lent you ${n} so you can keep going.', stNoMoney: 'Not enough money for that much.', stBoughtUp: 'New upgrade: {n}!',
    stSeasonDone: 'Season {n} complete!', stSeasonProfit: 'Season profit', stBestSeason: 'Best season ever', stNewBestSeason: 'New best season!', stStarsOf: '{n} of 3 stars', stBestDayEver: 'Best day',
    stSeasonPar: 'Stars compare you with a sensible player who has the same upgrades.', stNewSeason: 'Start a new season', stNewSeasonCost: 'Start season {n} · {c} pearls', stNeedPearls: '{n} more pearls to start a new season.', stEarnMore: 'Earn pearls',
    stSeasonWait: 'Your next season is ready when you are.', stCarryOver: 'Everything you bought and your {m} in cash carry over to the next season.', stUpgradesOwned: '{n} upgrades so far', stBackStands: 'Back to My Stands', stPause: 'Season in progress. Your stand is saved.',
    stMenu: 'Menu for today', stPortions: 'portions', stLevel: 'Price level', lvl_cheap: 'Cheap', lvl_normal: 'Normal', lvl_fancy: 'Fancy', lvl_cheap_s: 'Almost everyone buys', lvl_normal_s: 'Fair price', lvl_fancy_s: 'Bigger profit, fewer buyers',
    stEach: '{c} each → sells for {p}', stSnackCost: 'Cost to stock the menu', stSoldBy: 'Sold by item', stRanOut: 'Ran out of {x}',
    m_hotdog: 'Hot dog', m_drink: 'Drink', m_chips: 'Chips', m_burger: 'Burger', m_fries: 'Fries', m_icecream: 'Ice cream scoop', m_popcandy: 'Popping candy', m_choc: 'Chocolate bar', m_cone: 'Ice cream cone', m_slush: 'Frosty slush', m_froslem: 'Frozen lemonade', m_pretzel: 'Soft pretzel', m_orange: 'Orange slices', m_nachos: 'Nachos', m_berries: 'Strawberries & cream', m_cocoa: 'Hot cocoa', m_pennant: 'Pennant flag', m_finger: 'Foam finger', m_cap: 'Baseball cap', m_plush: 'Plush shark', m_shirt: 'Team shirt',
  },
  es: {
    stLemonade: 'Puesto de limonada', stIcecream: 'Puesto de helados', stSnack: 'Puesto de botanas del estadio', stBank: 'Tu dinero', stForecast: 'Pronóstico de hoy',
    w_sunny: 'Soleado', w_hot: '¡Calor!', w_cloudy: 'Nublado', w_rainy: 'Lluvioso',
    e_game: 'Hay un gran juego cerca: ¡más gente!', e_roadwork: 'Hay obras: pasa menos gente.', e_catering: '¡Una empresa quiere 50 vasos para una reunión! Ten 50 vasos listos.', e_party: '¡Pedido de fiesta de cumpleaños: 36 bolas (3 botes)! Ten 3 botes listos.',
    e_closeGame: '¡Juego cerrado! Los fans están al borde del asiento.', e_homeRun: '¡Jonrón! Todos quieren dulces y botanas.', e_rainDelay: '¡Pausa por lluvia! La gente quiere algo caliente.', e_bigCrowd: '¡Gran multitud hoy! Los puestos se agotan.',
    stPrice: 'Precio', stPerCup: 'por vaso', stPerScoop: 'por bola', stStock: 'Preparar', stCups: 'vasos', stTubs: 'botes', stCost: 'Costo de preparar',
    stCostLine: '{n} {u} × {p} = {c}', stTubLine: '{n} botes × {p} = {c}', stScoops: '1 bote = 12 bolas', stOpen: '¡Abrir el puesto!', stSkip: 'Saltar al final',
    stDeal: 'Oferta de amigos', stDealSub: 'Más gente dice que sí, pero algunos amigos pagan 20% menos.',
    stUpgrades: 'Tienda', stShopSub: 'Las mejoras se quedan contigo en todas las temporadas.', stBuy: 'Comprar', stOwned: 'Tuya', stNeedMore: 'Faltan ${n}', stNeeds: 'Necesita: {x}', stNewShop: '¡Hay cosas nuevas en la tienda!',
    stReceipt: 'Fin del día', stSold: 'Vendidos', stTooPricey: 'Dijeron “muy caro”', stSoldOut: 'Se fueron porque se acabó', stBusy: 'Se fueron: fila muy larga', stLeft: 'Sobraron', stSales: 'Dinero que entró', stSpent: 'Costo de preparar', stProfit: 'Ganancia', stLoss: 'Pérdida',
    stNextDay: 'Abrir de nuevo mañana', stBestDay: '¡Nuevo mejor día!', stDayN: 'Día {n}', stSeasonN: 'Temporada {n}', stDayOf: 'Día {d} de {m}', stCrowd: 'Clientes hoy', stCustomers: '{n} clientes',
    stCoachFirst: 'Consejo: ni muy barato ni muy caro. ¡Prueba un precio y mira quién compra!',
    stCoachSoldOut: 'La última vez se acabó y {n} personas se fueron. ¿Preparas más hoy?', stCoachPricey: 'La última vez {n} personas dijeron “muy caro”. ¿Pruebas un precio menor?', stCoachLeft: 'La última vez sobraron {n}. ¿Preparas un poco menos?', stCoachGood: 'La última vez salió bien. ¿Puedes superar ${p} de ganancia?', stCoachBusySnack: 'La última vez {n} fans se fueron porque la fila era muy larga. ¡Agrega una ventanilla o contrata a un trabajador en la tienda!', stCapLine: 'Tus ventanillas pueden atender a unos {n} fans hoy', stCapWarn: '⏳ ¡La fila puede ser muy larga! Agrega una ventanilla o contrata a un trabajador en la tienda.', stCapOk: '✅ Suficientes ventanillas y trabajadores para hoy.', stCoachBusy: '{n} personas se fueron porque la fila era muy larga. ¡Un ayudante o una segunda mesa atenderían a más gente!',
    stTipSoldOut: '¡Se acabó todo! {n} personas querían. Prepara más la próxima vez.', stTipPricey: '{n} personas dijeron “muy caro”. Un precio menor podría atraerlas.', stTipLeft: 'Sobraron {n} {u}. Prepara menos para ahorrar.', stTipGreat: '¡Gran día! Leíste bien el clima y el precio.', stTipRain: 'La lluvia deja a la gente en casa. En días lluviosos prepara menos para no desperdiciar.', stTipOk: '¡Nada mal! Pequeños cambios en el precio y la cantidad pueden hacer una gran diferencia.', stTipBusy: '{n} personas se fueron porque la fila era muy larga. ¡Contrata un ayudante o agrega una mesa!',
    stCateredOk: '¡Pedido entregado! La empresa pagó {n}.', stCateredMiss: 'El pedido grande necesitaba {u} pero no tenías suficiente. ¡La próxima vez prepara de más!',
    stLoan: 'Tu familia te prestó ${n} para que sigas.', stNoMoney: 'No alcanza el dinero para tanto.', stBoughtUp: '¡Nueva mejora: {n}!',
    stSeasonDone: '¡Temporada {n} completa!', stSeasonProfit: 'Ganancia de la temporada', stBestSeason: 'Mejor temporada de todas', stNewBestSeason: '¡Nueva mejor temporada!', stStarsOf: '{n} de 3 estrellas', stBestDayEver: 'Mejor día',
    stSeasonPar: 'Las estrellas te comparan con un jugador sensato que tiene las mismas mejoras.', stNewSeason: 'Empezar una temporada nueva', stNewSeasonCost: 'Empezar temporada {n} · {c} perlas', stNeedPearls: 'Faltan {n} perlas para empezar una temporada nueva.', stEarnMore: 'Ganar perlas',
    stSeasonWait: 'Tu próxima temporada está lista cuando tú quieras.', stCarryOver: 'Todo lo que compraste y tus {m} en efectivo pasan a la próxima temporada.', stUpgradesOwned: '{n} mejoras hasta ahora', stBackStands: 'Volver a Mis puestos', stPause: 'Temporada en curso. Tu puesto está guardado.',
    stMenu: 'Menú de hoy', stPortions: 'porciones', stLevel: 'Nivel de precios', lvl_cheap: 'Barato', lvl_normal: 'Normal', lvl_fancy: 'Elegante', lvl_cheap_s: 'Casi todos compran', lvl_normal_s: 'Precio justo', lvl_fancy_s: 'Más ganancia, menos compradores',
    stEach: '{c} cada uno → se vende a {p}', stSnackCost: 'Costo de surtir el menú', stSoldBy: 'Vendido por producto', stRanOut: 'Se acabó: {x}',
    m_hotdog: 'Hot dog', m_drink: 'Bebida', m_chips: 'Papitas', m_burger: 'Hamburguesa', m_fries: 'Papas fritas', m_icecream: 'Bola de helado', m_popcandy: 'Dulce explosivo', m_choc: 'Barra de chocolate', m_cone: 'Cono de helado', m_slush: 'Granizado helado', m_froslem: 'Limonada congelada', m_pretzel: 'Pretzel suave', m_orange: 'Gajos de naranja', m_nachos: 'Nachos', m_berries: 'Fresas con crema', m_cocoa: 'Chocolate caliente', m_pennant: 'Banderín', m_finger: 'Dedo de espuma', m_cap: 'Gorra de béisbol', m_plush: 'Tiburón de peluche', m_shirt: 'Camiseta del equipo',
  },
});

const FACES = {
  lemonade: ['🧒', '👧', '👦', '🧑', '👩', '👨', '🧓', '👵', '👴', '🧑‍🦱'],
  icecream: ['🧒', '👧', '👦', '🧑', '👩', '👨', '🧓', '🧑‍🦰', '👱', '🧑‍🦳'],
  snack: ['🧢', '👧', '👦', '🧑', '👩', '👨', '🧓', '🧑‍🦰', '👱', '🧑‍🦳'],
};
const CFG = {
  lemonade: { title: 'stLemonade', unit: 'stCups', per: 'stPerCup', icon: 'lemonade' },
  icecream: { title: 'stIcecream', unit: 'stTubs', per: 'stPerScoop', icon: 'icecream' },
  snack: { title: 'stSnack', unit: 'stPortions', per: 'stPerCup', icon: 'ballpark' },
};
const MENU_EMOJI = { hotdog: '🌭', drink: '🥤', chips: '🥔', burger: '🍔', fries: '🍟', icecream: '🍨', popcandy: '🍬', choc: '🍫', cone: '🍦', slush: '🧊', froslem: '🍋', pretzel: '🥨', orange: '🍊', nachos: '🧀', berries: '🍓', cocoa: '☕', pennant: '🚩', finger: '☝️', cap: '🧢', plush: '🦈', shirt: '👕' };

export function standState(id) {
  const sim = SIMS[id];
  const st = (S.stands[id] ||= {});
  const init = { bank: sim.startBank, days: 0, best: 0, total: 0, up: {}, next: null, last: null, price: sim.defaultPrice ?? 1, stock: id === 'lemonade' ? 20 : id === 'icecream' ? 2 : 0, deal: false, tickets: 0, season: null, seasons: 0, bestSeason: 0, level: 'normal', mstock: {}, perks: {} };
  for (const [k, v] of Object.entries(init)) if (st[k] == null) st[k] = v;
  if (id === 'snack' && !Object.keys(st.mstock).length) for (const m of MENU) st.mstock[m.id] = m.start ? 10 : 0;
  return st;
}
const show = (root, ...k) => root.replaceChildren(...k.flat().filter((x) => x != null && x !== false));
const wLabel = (k) => t('w_' + k);
const upName = (stand, id) => (UP_TEXT[stand]?.[id]?.[S.lang] || UP_TEXT[stand]?.[id]?.en || [id, ''])[0];
const upSub = (stand, id) => (UP_TEXT[stand]?.[id]?.[S.lang] || UP_TEXT[stand]?.[id]?.en || [id, ''])[1];

export function mount(el, { id }) {
  const sim = SIMS[id], cfg = CFG[id], st = standState(id), isSnack = id === 'snack';
  let timer = 0, alive = true;
  const root = h('div', { class: 'stand', 'data-stand': id }); el.append(root);
  // the Snack Shack grows up with the ballpark: sandlot -> park (3+ fields) -> stadium -> floodlights -> legend (see css "looks")
  const lookNow = () => (isSnack ? lookOf(st.up) : 'sandlot');
  const applyLook = () => { const lk = lookNow(); root.className = 'stand look-' + lk; if (isSnack) document.documentElement.dataset.look = lk; return lk; };
  applyLook();
  const ttl = () => { const L = isSnack ? stadiumLevel(st.up) : 0; return t(L >= 3 ? 'stSnackLegend' : L === 2 ? 'stSnackLights' : L === 1 ? 'stSnackStadium' : cfg.title); };
  let eggTaps = 0, eggAt = 0;      // tap the title 7 times quickly: the golden hot dog (a secret)
  const eggTap = () => {
    if (!isSnack) return; const now = Date.now(); eggTaps = now - eggAt < 1500 ? eggTaps + 1 : 1; eggAt = now;
    if (eggTaps >= 7 && !st.perks.goldendog) { st.perks.goldendog = 1; save(); sfx.fanfare(); confetti(); toast(t('stGoldenFound')); eggTaps = 0; if (st.season) plan(); }
  };
  const newCtx = () => (st.next = rollDay(Math.random, st.up, id));
  if (!st.next || (isSnack && !['closeGame', 'homeRun', 'rainDelay', 'bigCrowd', 'nightGame', null].includes(st.next.event)) || (!isSnack && ['closeGame', 'homeRun', 'rainDelay', 'bigCrowd', 'nightGame'].includes(st.next.event))) { newCtx(); save(); }

  const header = (title, extra) => h('div', { class: 'screen-head' },
    h('button', { class: 'btn ghost icon', 'aria-label': t('back'), onclick: () => go('/stands'), html: icons.back(34) }), h('h1', { onclick: eggTap }, title), extra);
  const bankChip = () => h('span', { class: 'chip bank' }, '💵 ', t('stBank') + ': ' + money(st.bank));
  const seasonChip = () => h('span', { class: 'chip on' }, t('stSeasonN', { n: st.seasons }) + ' · ' + t('stDayOf', { d: Math.min(st.season.day + 1, seasonDays(id)), m: seasonDays(id) }));
  const ticketCost = COST.stands[id].season;

  // ---------------- entry: a season in progress, or start a new one ----------------
  function entry() {
    if (st.season) return plan();
    if (st.tickets > 0) { st.tickets--; startSeason(); return plan(); }
    return seasonGate();
  }
  function startSeason() { st.seasons++; st.season = { day: 0, profit: 0, cust: 0, startBank: st.bank, bestDay: 0 }; newCtx(); save(); }
  function seasonGate(summary) {
    const can = S.pearls.balance >= ticketCost;
    show(root, header(ttl()), summary || null,
      h('div', { class: 'card center', style: { maxWidth: '640px', margin: '18px auto' } },
        h('div', { html: icons[cfg.icon](96) }), h('h2', {}, t('stNewSeasonCost', { n: st.seasons + 1, c: ticketCost })),
        h('p', { class: 'muted' }, t('stSeasonWait') + ' ' + t('stUpgradesOwned', { n: Object.keys(st.up).length })),
        h('p', { class: 'carry' }, t('stCarryOver', { m: money(st.bank) })),
        can ? h('button', { class: 'btn gold go', onclick: () => { if (spendPearls(ticketCost)) { sfx.levelUp(); startSeason(); plan(); } } }, h('span', { html: icons.pearl(34) }), t('stNewSeason'))
          : h('div', {}, h('p', { class: 'notice' }, t('stNeedPearls', { n: ticketCost - S.pearls.balance })), h('a', { class: 'btn gold', href: '#/quiz' }, t('stEarnMore'))),
        h('button', { class: 'btn ghost', onclick: () => go('/stands') }, t('stBackStands'))));
  }

  // ---------------- surprises: scoreboard, mascot, horn, fireworks, shelf ----------------
  const num = (n) => Number(n).toLocaleString('en-US');
  const perkName = (p) => t('p_' + p.id);
  function scoreboardEl(exp) {
    const cell = (k, v) => h('div', { class: 'sbcell' }, h('small', {}, t(k)), h('b', {}, v));
    return h('div', { class: 'scoreboard', role: 'group', 'aria-label': t('stScName') },
      h('div', { class: 'sbname' }, '🏟️ ' + t('stScName')),
      h('div', { class: 'sbrow' }, cell('stScDay', st.season ? Math.min(st.season.day + 1, seasonDays(id)) + '/' + seasonDays(id) : '–'), cell('stScFields', String(fieldsOwned(st.up))), cell('stScFans', '~' + num(Math.round(exp))), cell('stScCash', money(st.bank))),
      st.perks.horn ? h('button', { class: 'sbhorn', 'aria-label': t('p_horn'), onclick: () => { sfx.fanfare(); toast('🎺 ' + t('stHornSay')); } }, '🎺') : null);
  }
  function capHint(exp) {      // can the windows keep up with today's crowd? (a busy day can be 15% bigger than the forecast)
    const cap = SNACK.serveCap(st.up), enough = exp * 1.15 <= cap;
    return h('div', { class: 'caphint ' + (enough ? 'ok' : 'warn') }, h('span', {}, '🪟 ' + t('stCapLine', { n: num(cap) })), h('b', {}, enough ? t('stCapOk') : t('stCapWarn')));
  }
  function chompyEl() {
    const say = h('div', { class: 'chompysay', hidden: true }); let taps = 0, last = 0, hide = 0;
    const btn = h('button', { class: 'chompy', 'aria-label': t('p_chompy'), onclick: () => {
      const now = Date.now(); taps = now - last < 1200 ? taps + 1 : 1; last = now; sfx.pop();
      say.textContent = t('f_' + Math.floor(Math.random() * FACT_COUNT)); say.hidden = false; clearTimeout(hide); hide = setTimeout(() => { say.hidden = true; }, 5200);
      if (taps >= 5) { taps = 0; btn.classList.add('spin'); setTimeout(() => btn.classList.remove('spin'), 1200); sfx.cheer(); confetti(); }
    } }, '🦈');
    return h('div', { class: 'chompywrap' }, say, btn);
  }
  function fireworks() {
    if (reduceMotion()) return; sfx.cheer();
    [0, 350, 750, 1200, 1700].forEach((ms) => setTimeout(() => { if (alive) confetti(innerWidth * (0.15 + Math.random() * 0.7), innerHeight * (0.2 + Math.random() * 0.4), ['#FFD166', '#FF8A5B', '#6EC1FF', '#FF7AC6', '#FFFFFF']); }, ms));
  }
  function shelfEl() {
    const tile = (p) => {
      const got = !!st.perks[p.id];
      if (!got) return h('div', { class: 'perk locked' }, h('span', { class: 'pe' }, p.secret ? '❓' : '🔒'), h('strong', {}, t('stLockedP')), h('small', {}, p.secret ? t('stSecretP') : t('ph_' + p.id)));
      return h('div', { class: 'perk got' }, h('span', { class: 'pe' }, p.emoji), h('strong', {}, perkName(p)), h('small', {}, t('pd_' + p.id)));
    };
    return h('div', { class: 'shelf' }, h('h3', {}, '🎁 ' + t('stSurprises')), h('p', { class: 'muted small' }, t('stSurprisesSub')), h('div', { class: 'perks' }, PERKS.map(tile)));
  }

  // ---------------- the plan screen ----------------
  function plan() {
    clearTimeout(timer);
    if (isSnack) applyLook();
    const earned = isSnack ? newPerks(st) : [];
    if (earned.length) { earned.forEach((p) => { st.perks[p.id] = 1; }); save(); sfx.levelUp(); confetti(); }
    const ctxBase = st.next, { weather, event } = ctxBase;
    // first-time stock for a new menu item scales with the crowd (more ball fields = more food), so a big stand does not start nearly empty
    const startStock = (id) => { const ctx = { weather: 'sunny', event: null, up: st.up }, w = snackWeights(ctx), tot = w.reduce((a, b) => a + b.k, 0), me = w.find((x) => x.id === id); const step = SNACK.stockStep(st.up); const raw = Math.round((SNACK.trafficOf(ctx) * 1.1 * (me ? me.k / tot : 0.1)) / step) * step; return Math.max(me && me.merch ? step : 10, raw); };
    if (isSnack) fixLegacyUp(st.up);
    const stockUnitMin = isSnack ? 0 : sim.costOf(sim.stockStep(st.up), st.up);
    let loan = 0;
    if (!isSnack && st.bank < stockUnitMin) { loan = sim.startBank - st.bank; st.bank = sim.startBank; save(); }
    if (isSnack && st.bank < 5) { loan = sim.startBank - st.bank; st.bank = sim.startBank; save(); }
    if (!isSnack) {
      st.stock = clamp(st.stock, 0, sim.stockMax(st.up)); st.price = clamp(st.price, sim.priceMin, sim.priceMax);
      const step = sim.stockStep(st.up);
      while (sim.costOf(st.stock, st.up) > st.bank && st.stock > 0) st.stock -= step;
      st.stock = Math.max(0, st.stock);
    } else {
      const avail = menuAvail(st.up).map((m) => m.id);
      // buying another ball field means a bigger crowd, so lift the food to match (never lowers what he already set)
      const nf = fieldsOwned(st.up), grew = nf > (st.fieldsSeen || 1);
      for (const m of MENU) if (!avail.includes(m.id)) st.mstock[m.id] = 0; else st.mstock[m.id] = clamp(grew ? Math.max(st.mstock[m.id] || 0, startStock(m.id)) : (st.mstock[m.id] ?? startStock(m.id)), 0, SNACK.stockMax(st.up));
      st.fieldsSeen = nf;
      while (snackCost() > st.bank) { const top = Object.entries(st.mstock).sort((a, b) => b[1] - a[1])[0]; if (!top || !top[1]) break; st.mstock[top[0]] = Math.max(0, top[1] - Math.max(SNACK.stockStep(st.up), Math.round(top[1] / 40 / SNACK.stockStep(st.up)) * SNACK.stockStep(st.up))); }
    }
    const last = st.last;
    let coach = t('stCoachFirst');
    if (last) {
      coach = last.busy >= 4 ? t(isSnack ? 'stCoachBusySnack' : 'stCoachBusy', { n: num(last.busy) }) : last.soldout >= 3 ? t('stCoachSoldOut', { n: last.soldout }) : last.pricey >= 5 ? t('stCoachPricey', { n: last.pricey })
        : last.leftover >= (id === 'icecream' ? 12 : isSnack ? 12 : 5) ? t('stCoachLeft', { n: id === 'icecream' ? Math.floor(last.leftover / 12) || 1 : last.leftover })
        : t('stCoachGood', { p: Math.max(1, Math.floor(last.profit)).toFixed(0) });
    }
    function snackCost() { return SNACK.costOf({ stock: st.mstock }, st.up); }

    // --- steppers (single-product) or menu rows (snack)
    const costLine = h('p', { class: 'costline' });
    const openBtn = h('button', { class: 'btn gold go', onclick: run }, h('span', { html: icons[cfg.icon](40) }), t('stOpen'));
    let planBlock;
    const refreshers = [];
    if (!isSnack) {
      const priceVal = h('output', { class: 'big' }), stockVal = h('output', { class: 'big' });
      const unitCost = sim.unitCostOf(st.up);
      const refresh = () => {
        priceVal.textContent = money(st.price); stockVal.textContent = st.stock;
        const c = sim.costOf(st.stock, st.up);
        costLine.textContent = id === 'lemonade' ? t('stCostLine', { n: st.stock, u: t('stCups'), p: money(unitCost), c: money(c) }) : t('stTubLine', { n: st.stock, p: money(unitCost), c: money(c) });
        openBtn.disabled = st.stock <= 0;
      };
      const step = (kind, dir) => () => {
        sfx.tap();
        if (kind === 'price') st.price = clamp(Math.round((st.price + dir * sim.priceStep) * 100) / 100, sim.priceMin, sim.priceMax);
        else {
          const next = clamp(st.stock + dir * sim.stockStep(st.up), 0, sim.stockMax(st.up));
          if (sim.costOf(next, st.up) > st.bank) { toast(t('stNoMoney')); return; }
          st.stock = next;
        }
        save(); refresh();
      };
      const stepper = (label, sub, valEl, kind) => h('div', { class: 'card stepper' }, h('h3', {}, label), h('div', { class: 'srow' },
        h('button', { class: 'btn alt icon', 'aria-label': '−', onclick: step(kind, -1), html: icons.minus(34) }),
        h('div', { class: 'val' }, valEl, h('small', {}, sub)),
        h('button', { class: 'btn alt icon', 'aria-label': '+', onclick: step(kind, 1), html: icons.plus(34) })));
      const dealBtn = id === 'icecream' ? h('button', { class: 'chip big', 'aria-pressed': String(!!st.deal), onclick: (e) => { st.deal = !st.deal; e.currentTarget.setAttribute('aria-pressed', String(st.deal)); sfx.tap(); save(); } }, t('stDeal')) : null;
      planBlock = [h('div', { class: 'plan' }, stepper(t('stPrice'), t(cfg.per), priceVal, 'price'), stepper(t('stStock'), t(cfg.unit) + (id === 'icecream' ? ' · ' + t('stScoops') : ''), stockVal, 'stock')), costLine,
        dealBtn ? h('div', { class: 'dealrow' }, dealBtn, h('small', {}, t('stDealSub'))) : null];
      refreshers.push(refresh);
    } else {
      const rows = menuAvail(st.up).map((m) => {
        const val = h('output', { class: 'mval' });
        const redraw = () => { val.textContent = (st.mstock[m.id] || 0).toLocaleString('en-US'); };
        const bump = (d) => () => {
          sfx.tap(); const next = clamp((st.mstock[m.id] || 0) + d * SNACK.stockStep(st.up), 0, SNACK.stockMax(st.up));
          const before = st.mstock[m.id]; st.mstock[m.id] = next;
          if (snackCost() > st.bank) { st.mstock[m.id] = before; toast(t('stNoMoney')); return; }
          save(); redraw(); updateCost();
        };
        redraw();
        return h('div', { class: 'mrow' }, h('span', { class: 'memo' + (m.id === 'hotdog' && st.perks.goldendog ? ' golden' : '') }, MENU_EMOJI[m.id]), h('div', { class: 'mname' }, h('strong', {}, t('m_' + m.id)), h('small', {}, t('stEach', { c: money(SNACK.unitCostOf(m, st.up)), p: money(m.price * PRICE_LEVELS[st.level].mult) }))),
          h('button', { class: 'btn alt icon', 'aria-label': '−', onclick: bump(-1), html: icons.minus(30) }), val, h('button', { class: 'btn alt icon', 'aria-label': '+', onclick: bump(1), html: icons.plus(30) }));
      });
      const lvl = h('div', { class: 'row' }, Object.keys(PRICE_LEVELS).map((k) => h('button', { class: 'chip big', 'aria-pressed': String(st.level === k), onclick: () => { st.level = k; save(); plan(); } }, t('lvl_' + k))));
      const updateCost = () => { costLine.textContent = t('stSnackCost') + ': ' + money(snackCost()); openBtn.disabled = Object.values(st.mstock).every((v) => !v); };
      planBlock = [h('h3', {}, t('stMenu')), h('div', { class: 'menu card' }, rows), h('h3', {}, t('stLevel')), lvl, h('small', { class: 'muted' }, t('lvl_' + st.level + '_s')), costLine];
      refreshers.push(updateCost);
    }

    // --- the shop
    const vis = visibleUpgrades(id, st.seasons);
    const newTier = vis.some((u) => u.tier === st.seasons && st.seasons > 1) && st.season.day === 0;
    const shop = vis.map((u) => {
      const own = !!st.up[u.id], reqOk = canBuy(id, u.id, st.up) || own, afford = st.bank >= u.price;
      const needTxt = !reqOk ? t('stNeeds', { x: (u.req || []).filter((r) => !st.up[r]).map((r) => upName(id, r)).join(', ') }) : null;
      return h('button', { class: 'upg' + (own ? ' own' : ''), disabled: own || !reqOk || !afford, 'data-up': u.id, onclick: () => {
        st.bank = Math.round((st.bank - u.price) * 100) / 100; st.up[u.id] = 1; save(); sfx.coin(); toast(t('stBoughtUp', { n: upName(id, u.id) })); plan();
      } }, h('strong', {}, upName(id, u.id)), h('small', {}, upSub(id, u.id)), needTxt ? h('small', { class: 'need' }, needTxt) : null,
        h('span', { class: 'tag' }, own ? t('stOwned') : money(u.price)));
    });
    const e = effects(id, st.up);
    const exp = isSnack ? SNACK.trafficOf({ weather, event, up: st.up }) : traffic(id, { weather, event, up: st.up });

    show(root, header(ttl(), [seasonChip(), bankChip()]),
      loan ? h('p', { class: 'notice' }, t('stLoan', { n: loan.toFixed(2) })) : null,
      earned.length ? h('p', { class: 'notice perknew' }, t('stSurpriseNew', { n: earned.map((p) => p.emoji + ' ' + perkName(p)).join(', ') })) : null,
      isSnack && stadiumLevel(st.up) >= 1 ? scoreboardEl(exp) : null,
      h('div', { class: 'forecast card' },
        h('div', { class: 'wx' }, h('span', { class: 'wxi' }, WEATHER[weather].icon), h('div', {}, h('small', {}, t('stForecast') + ' · ' + t('stDayN', { n: st.season.day + 1 })), h('strong', {}, wLabel(weather)))),
        event ? h('div', { class: 'ev' }, (event === 'nightGame' ? '🌙 ' : event === 'game' || isSnack ? '⚾ ' : event === 'roadwork' ? '🚧 ' : event === 'party' ? '🎂 ' : '🏢 '), t('e_' + event)) : null,
        h('div', { class: 'crowdhint' }, '👥 ', t('stCustomers', { n: '~' + Math.round(exp).toLocaleString('en-US') })),
        isSnack ? capHint(exp) : null,
        isSnack && st.perks.chompy ? chompyEl() : null),
      h('p', { class: 'coach' }, h('span', { html: icons.bulb(30) }), coach),
      planBlock,
      h('div', { class: 'openrow' }, openBtn),
      h('h3', { class: 'uph' }, t('stUpgrades') + (newTier ? ' · ' + t('stNewShop') : '')), h('p', { class: 'muted small' }, t('stShopSub')), h('div', { class: 'ups' }, shop),
      isSnack ? shelfEl() : null);
    refreshers.forEach((f) => f());
    void e;
  }

  // ---------------- watching the crowd ----------------
  function run() {
    sfx.pop();
    const ctx = { ...st.next, up: st.up };
    const res = isSnack ? sim.sim({ stock: { ...st.mstock }, level: st.level }, ctx) : sim.sim({ price: st.price, stock: st.stock, deal: id === 'icecream' && st.deal }, ctx);
    const lane = h('div', { class: 'lane' }), tally = { sold: 0, pricey: 0, soldout: 0, busy: 0, cash: 0, seen: 0 };
    const nums = { sold: h('b', {}, '0'), pricey: h('b', {}, '0'), soldout: h('b', {}, '0'), busy: h('b', {}, '0'), cash: h('b', {}, money(0)), seen: h('b', {}, '0') };
    const skip = h('button', { class: 'btn ghost small', onclick: () => finish() }, t('stSkip'));
    show(root, header(ttl(), h('span', { class: 'chip' }, WEATHER[ctx.weather].icon + ' ' + wLabel(ctx.weather))),
      h('div', { class: 'stage card' + (ctx.event === 'nightGame' ? ' nightgame' : '') }, lane, isSnack && stadiumLevel(st.up) >= 1 ? h('div', { class: 'standface bigemo' }, '🏟️') : h('div', { class: 'standface', html: icons[cfg.icon](120) })),
      h('div', { class: 'crowdbar', role: 'status' }, h('span', {}, '👥 ' + t('stCrowd') + ': '), nums.seen, h('span', {}, ' / ' + num(res.n))),
      h('div', { class: 'tallies' },
        h('div', { class: 'tl good' }, t('stSold'), nums.sold), h('div', { class: 'tl' }, t('stSales'), nums.cash),
        h('div', { class: 'tl' }, '💭 ' + t('stTooPricey'), nums.pricey), h('div', { class: 'tl' }, '🙁 ' + t('stSoldOut'), nums.soldout),
        res.busy || ctx.up.helper || ctx.up.cook || ctx.up.window2 ? h('div', { class: 'tl' }, '⏳ ' + t('stBusy'), nums.busy) : null),
      h('div', { class: 'center' }, skip));
    // big crowds: count fast, show only the last few sprites
    const G = res.scale || 1;       // a huge crowd is played with stand-ins that each stand for G fans
    const per = Math.max(1, Math.ceil(res.customers.length / 130));     // huge crowds (many ball fields): count in batches
    const gap = clamp(5200 / Math.max(res.customers.length / per, 1), 40, 240);
    let i = 0;
    function tick() {
      if (!alive) return;
      if (i >= res.customers.length) { timer = setTimeout(finish, 500); return; }
      let c = null;
      for (let b = 0; b < per && i < res.customers.length; b++) {
        c = res.customers[i++];
        tally.seen += G;
        if (c.res === 'buy') { tally.sold += G * (c.items || 1); tally.cash += c.paid * G; if (i % 3 === 0 && b === 0) sfx.coin(); }
        else if (c.res === 'pricey') tally.pricey += G; else if (c.res === 'busy') tally.busy += G; else tally.soldout += G;
      }
      const showSprite = res.customers.length <= 40 || per > 1 || i % Math.ceil(res.customers.length / 40) === 0 || c.res === 'buy' && i % 3 === 0;
      if (showSprite) {
        const face = pick(FACES[id]);
        const bubble = c.res === 'buy' ? '+' + money(c.paid * G).replace('.00', '') : c.res === 'pricey' ? '💭' : c.res === 'busy' ? '⏳' : '🙁';
        const cust = h('div', { class: 'cust ' + c.res }, h('span', { class: 'face' }, face), h('span', { class: 'bub' }, bubble));
        lane.append(cust);
        requestAnimationFrame(() => requestAnimationFrame(() => cust.classList.add('arrive')));
        while (lane.children.length > 6) lane.firstChild.remove();
      }
      const f = (n) => num(Math.round(n)); nums.seen.textContent = f(Math.min(tally.seen, res.n)); nums.sold.textContent = f(tally.sold); nums.pricey.textContent = f(tally.pricey); nums.soldout.textContent = f(tally.soldout); nums.busy.textContent = f(tally.busy); nums.cash.textContent = money(tally.cash);
      timer = setTimeout(tick, reduceMotion() ? 5 : gap);
    }
    let finished = false;
    function finish() { if (finished) return; finished = true; clearTimeout(timer); receipt(res); }
    tick();
  }

  // ---------------- end of day ----------------
  function receipt(res) {
    const profit = res.profit;
    st.bank = Math.round((st.bank + profit) * 100) / 100; st.days++; st.total += profit;
    const newBest = profit > st.best; if (newBest) st.best = profit;
    const sea = st.season; sea.day++; sea.profit += profit; sea.cust += res.n; sea.bestDay = Math.max(sea.bestDay, profit);
    const w = st.next.weather, ev = st.next.event;
    st.last = { price: st.price, stock: st.stock, sold: res.sold, pricey: res.pricey, soldout: res.soldout, busy: res.busy || 0, leftover: res.leftover, profit, weather: w };
    const seasonOver = sea.day >= seasonDays(id);
    if (!seasonOver) newCtx();
    save();
    const unitsLeft = id === 'icecream' ? Math.floor(res.leftover / 12) : res.leftover;
    const tips = res.busy >= 4 ? t('stTipBusy', { n: res.busy }) : res.soldout >= 3 ? t('stTipSoldOut', { n: res.soldout })
      : w === 'rainy' && res.leftover > 3 ? t('stTipRain') : res.pricey >= 5 ? t('stTipPricey', { n: res.pricey })
      : res.leftover >= (id === 'icecream' ? 12 : isSnack ? 12 : 5) ? t('stTipLeft', { n: unitsLeft || 1, u: t(cfg.unit) }) : profit >= (id === 'icecream' ? 15 : isSnack ? 25 : 8) ? t('stTipGreat') : t('stTipOk');
    const order = res.order ? (res.order.ok ? t('stCateredOk', { n: money(res.order.pay) }) : t('stCateredMiss', { u: res.order.units + ' ' + (id === 'icecream' ? t('stScoops').split('=')[1].trim() : t('stCups')) })) : null;
    const row = (label, val, cls = '') => h('div', { class: 'rrow ' + cls }, h('span', {}, label), h('b', {}, val));
    const fresh = awardBadges();
    const soldBy = isSnack ? Object.entries(res.bySold).map(([k, n]) => `${MENU_EMOJI[k]} ${num(n)}`).join('  ') : null;
    show(root, header(t('stReceipt'), [seasonChip(), newBest && profit > 0 ? h('span', { class: 'chip on' }, '⭐ ' + t('stBestDay')) : null]),
      h('div', { class: 'receipt card' },
        row(t('stCrowd'), num(res.n)),
        row(t('stSold'), isSnack ? num(res.sold) : `${res.sold} × ${money(st.last.price)}`), row(t('stSales'), '+' + money(res.revenue), 'plus'),
        row(t('stSpent'), '−' + money(res.cost), 'minus'),
        row(profit >= 0 ? t('stProfit') : t('stLoss'), (profit >= 0 ? '+' : '−') + money(Math.abs(profit)), 'total ' + (profit >= 0 ? 'good' : 'bad')),
        h('hr'), row('💭 ' + t('stTooPricey'), num(res.pricey)), row('🙁 ' + t('stSoldOut'), num(res.soldout)), res.busy ? row('⏳ ' + t('stBusy'), num(res.busy)) : null,
        row(t('stLeft'), isSnack ? num(res.leftover) : unitsLeft + (id === 'icecream' ? ' ' + t('stTubs') : ' ' + t('stCups'))),
        soldBy ? row(t('stSoldBy'), soldBy) : null,
        row(t('stBank'), money(st.bank), 'bank')),
      order ? h('p', { class: 'notice' }, (res.order.ok ? '🎉 ' : '') + order) : null,
      h('p', { class: 'coach' }, h('span', { html: icons.bulb(30) }), tips),
      fresh.length ? h('p', { class: 'notice' }, '🏅 ' + fresh.join(', ')) : null,
      h('div', { class: 'openrow' }, h('button', { class: 'btn gold go', onclick: () => { sfx.pop(); if (seasonOver) endSeason(); else plan(); } }, seasonOver ? t('done') : t('stNextDay')), seasonOver ? null : h('button', { class: 'btn ghost', onclick: () => go('/stands') }, t('stPause'))));
    if (isSnack && newBest && profit > 0 && st.perks.fireworks) fireworks();
    else if (profit >= (isSnack ? 25 : 8)) { sfx.hardCorrect(); confetti(); } else if (profit > 0) sfx.correct();
  }

  // ---------------- season summary ----------------
  function endSeason() {
    const sea = st.season, p = Math.round(sea.profit);
    const par = parProfit(id, st.up);
    const stars = p >= par * 1.15 ? 3 : p >= par * 0.75 ? 2 : 1;
    const newBest = p > (st.bestSeason || 0);
    if (newBest) st.bestSeason = p;
    st.lastSeason = { no: st.seasons, profit: p, stars };
    st.season = null; newCtx(); save();
    sfx.levelUp(); if (stars === 3 || newBest) confetti();
    const summary = h('div', { class: 'card center summary', style: { maxWidth: '640px', margin: '10px auto' } },
      h('div', { html: icons.trophy(84) }), h('h1', {}, t('stSeasonDone', { n: st.seasons })),
      h('div', { class: 'stars', role: 'img', 'aria-label': t('stStarsOf', { n: stars }) }, [1, 2, 3].map((n) => h('span', { html: n <= stars ? icons.star(64) : icons.starOff(64) }))),
      h('p', { class: 'big' }, t('stSeasonProfit') + ': ' + (p >= 0 ? '+' : '−') + money(Math.abs(p))),
      newBest ? h('p', { class: 'chip on' }, '⭐ ' + t('stNewBestSeason')) : null,
      h('p', { class: 'muted' }, t('stBestSeason') + ': ' + money(st.bestSeason) + ' · ' + t('stBestDayEver') + ': ' + money(sea.bestDay) + ' · ' + t('stCustomers', { n: sea.cust })),
      h('small', { class: 'muted' }, t('stSeasonPar')));
    seasonGate(summary);
  }

  entry();
  return () => { alive = false; clearTimeout(timer); if (isSnack) delete document.documentElement.dataset.look; };
}
