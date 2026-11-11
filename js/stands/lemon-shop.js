// The Lemonade Stand's big shop (Rob, Nov 10 2026): about 65 extras in eight paths, the stand that grows up as you buy, the place picker, and the dream of Lemon Town.
// Only a few cards show at a time per path (what to buy next, and a mystery), so it never feels like a wall of 65 things.
import { h, money } from '../core/dom.js';
import { t, addStrings } from '../core/i18n.js';
import { S } from '../core/store.js';
import { icons } from '../core/icons.js';
import { upgradeList, visibleUpgrades, canBuy, tierSeason, SPOTS, SPOT_IDS, spotsOwned, spotTable } from './sims.js';
import { UP_TEXT } from './upgrade-text.js';
import { CREAM_UI } from './cream-shop.js';

export const PATHS = [
  { id: 'look', emoji: '🪧' }, { id: 'gear', emoji: '🧊' }, { id: 'menu', emoji: '🍓' }, { id: 'crew', emoji: '🧒' },
  { id: 'promo', emoji: '📢' }, { id: 'spots', emoji: '📍' }, { id: 'wheels', emoji: '🚲' }, { id: 'shop', emoji: '🏪' },
];
export const UP_EMOJI = {
  sign: '🪧', chalk: '📝', table: '🪑', umbrella: '⛱️', awning: '🎪', table2: '🍽️', wooden: '🛖', lights: '✨', goldsign: '🌟',
  cooler: '🧊', cups: '🥤', squeezer: '🍋', nugget: '❄️', flake: '🌨️', bulk: '📦', fridge: '🥶', juicer: '⚙️', walkin: '🚪',
  pink: '🌸', mint: '🌿', strawberry: '🍓', cookies: '🍪', lavender: '💜', popsicles: '🍧', slush: '🧋', secret: '📜',
  helper: '🧒', cashier: '💰', cousins: '👫', aprons: '👨‍🍳', lead: '⭐', crew5: '🖐️', manager: '👔',
  flyers: '📄', speaker: '📢', samples: '🥄', spinner: '🕺', jingle: '🎵', newspaper: '📰', sponsor: '🏷️', radio: '📻', billboard: '🛣️', tv: '📺',
  ...Object.fromEntries(SPOT_IDS.map((s) => [s, SPOTS[s].emoji])),
  wagon: '🛒', catering: '🥂', bike: '🚲', partypacks: '🎉', scooter: '🛴', van: '🚐', office: '🏢', drone: '🚁',
  shoprent: '🔑', counter: '🛋️', store: '🏪', bakery: '🧁', shop2: '🏬', factory: '🏭', franchise: '🌎', lemontown: '🏙️',
};
/** The dream path, piece by piece: it lights up as he buys. */
export const DREAM = ['shoprent', 'counter', 'store', 'bakery', 'shop2', 'factory', 'franchise', 'lemontown'];
/** How the stand looks: it grows up with the big buys. */
export function lemonLook(up = {}) {
  return up.lemontown ? 'town' : up.factory ? 'factory' : up.store ? 'shop' : up.shoprent ? 'soon' : up.goldsign ? 'gold' : up.wooden ? 'wood' : up.awning ? 'awning' : 'cart';
}
const LOOK_GLYPH = { awning: '🎪', wood: '🛖', gold: '🍋', soon: '🚧', shop: '🏪', factory: '🏭', town: '🏙️' };
export const lemonGlyph = (up, stand = 'lemonade') => (stand === 'icecream' ? CREAM_UI.glyph[CREAM_UI.look(up)] : LOOK_GLYPH[lemonLook(up)]) || null;
// Both big shops (lemonade and ice cream) run on this one engine; each has its own paths, emoji, dream and look. `k` is the prefix of that stand's strings.
const UI = {
  lemonade: { k: '', paths: PATHS, emoji: UP_EMOJI, dream: DREAM, look: lemonLook, glyph: LOOK_GLYPH, home: '🍋', icon: 'lemonade' },
  icecream: CREAM_UI,
};

addStrings({
  en: {
    pth_look: 'Look & Signs', pth_gear: 'Gear & Ice', pth_menu: 'Flavors & Treats', pth_crew: 'Helpers', pth_promo: 'Shout It Out', pth_spots: 'Pop-up Places', pth_wheels: 'Wheels & Orders', pth_shop: 'The Shop',
    pthd_look: 'Make your stand look amazing.', pthd_gear: 'Better lemonade and colder ice.', pthd_menu: 'New flavors and treats people love.', pthd_crew: 'Friends who help you serve a bigger line.', pthd_promo: 'Tell the whole town about your stand.',
    pthd_spots: 'Open somewhere new every morning. Match the place to the weather!', pthd_wheels: 'Deliveries and big catering orders.', pthd_shop: 'Your dream: a real lemonade shop… and beyond!',
    stSaving: 'Saving for: {x}', stToGo: '{n} to go', stAboutDays: 'about {d} days', stAboutDay: 'about 1 day', stCanBuy: '🎉 You can buy something! Pick one below.', stAllBought: 'You bought everything! You are a lemonade legend.', stNothingNow: 'More things show up in season {n}.',
    stSaveThis: '⭐ Save for this', stSavingThis: '⭐ Saving for this', stBookOf: '{a} of {b} extras', stMore: '{n} more to discover', stMoreNew: '{n} more to discover. New things show up in season {s}.', stDreamT: 'Your dream: Lemon Town', stDreamOf: '{a} of {b}',
    stSecretName: 'Secret flavor', stYourStand: 'Your stand', lk_cart: 'Lemonade cart', lk_awning: 'Striped-awning stand', lk_wood: 'Wooden stand', lk_gold: 'Golden lemon stand', lk_soon: 'Shop coming soon…', lk_shop: 'Lemonade shop', lk_factory: 'Lemonade factory', lk_town: 'Lemon Town',
    stMilestone: '🎉 {n}! Look at your stand now!', stOpenAt: 'Where will you open today?', stSpotTip: 'The crowd changes with the weather. Compare the numbers and pick the best place!', stHome: 'Home corner', stHomeSub: 'Your usual spot',
    stBranch: 'Your other shops paid you', stTip: 'Mystery shopper tip', stPay: '{n} paid',
    e_adday: 'Your newspaper ad came out today! Extra people!', e_dinoParade: 'Dino parade down the street! Everybody is out!', e_rocketParty: 'A rocket-launch party! Space fans everywhere!', e_sharkWeek: 'Shark Week! Everyone wants blue lemonade!', e_freeLemons: 'A neighbor gave you free lemons! Cups cost half today.', e_rainbow: 'A rainbow after the rain! People come out to look.', e_shopper: 'A mystery shopper is in town. Big tips today!',
  },
  es: {
    pth_look: 'Aspecto y letreros', pth_gear: 'Equipo y hielo', pth_menu: 'Sabores y antojos', pth_crew: 'Ayudantes', pth_promo: 'Publicidad', pth_spots: 'Lugares nuevos', pth_wheels: 'Ruedas y pedidos', pth_shop: 'La tienda',
    pthd_look: 'Haz que tu puesto se vea increíble.', pthd_gear: 'Mejor limonada y hielo más frío.', pthd_menu: 'Sabores y antojos nuevos que encantan.', pthd_crew: 'Amigos que te ayudan a atender una fila más grande.', pthd_promo: 'Cuéntale a todo el pueblo de tu puesto.',
    pthd_spots: 'Abre en un lugar nuevo cada mañana. ¡Combina el lugar con el clima!', pthd_wheels: 'Entregas y grandes pedidos de banquete.', pthd_shop: 'Tu sueño: una tienda de limonada de verdad… ¡y más!',
    stSaving: 'Ahorrando para: {x}', stToGo: 'faltan {n}', stAboutDays: 'unos {d} días', stAboutDay: 'como 1 día', stCanBuy: '🎉 ¡Puedes comprar algo! Elige una abajo.', stAllBought: '¡Compraste todo! Eres una leyenda de la limonada.', stNothingNow: 'Más cosas aparecen en la temporada {n}.',
    stSaveThis: '⭐ Ahorrar para esto', stSavingThis: '⭐ Ahorrando para esto', stBookOf: '{a} de {b} extras', stMore: '{n} más por descubrir', stMoreNew: '{n} más por descubrir. Cosas nuevas aparecen en la temporada {s}.', stDreamT: 'Tu sueño: Ciudad Limón', stDreamOf: '{a} de {b}',
    stSecretName: 'Sabor secreto', stYourStand: 'Tu puesto', lk_cart: 'Carrito de limonada', lk_awning: 'Puesto con toldo de rayas', lk_wood: 'Puesto de madera', lk_gold: 'Puesto del limón dorado', lk_soon: 'Tienda próximamente…', lk_shop: 'Tienda de limonada', lk_factory: 'Fábrica de limonada', lk_town: 'Ciudad Limón',
    stMilestone: '🎉 ¡{n}! ¡Mira cómo se ve tu puesto!', stOpenAt: '¿Dónde abrirás hoy?', stSpotTip: 'La multitud cambia con el clima. ¡Compara los números y elige el mejor lugar!', stHome: 'Esquina de casa', stHomeSub: 'Tu lugar de siempre',
    stBranch: 'Tus otras tiendas te pagaron', stTip: 'Propina del cliente misterioso', stPay: '{n} pagó',
    e_adday: '¡Hoy salió tu anuncio en el periódico! ¡Más gente!', e_dinoParade: '¡Desfile de dinosaurios por la calle! ¡Todos salieron!', e_rocketParty: '¡Fiesta de lanzamiento de cohetes! ¡Fans del espacio por todas partes!', e_sharkWeek: '¡Semana del Tiburón! ¡Todos quieren limonada azul!', e_freeLemons: '¡Un vecino te regaló limones! Los vasos cuestan la mitad hoy.', e_rainbow: '¡Un arcoíris después de la lluvia! La gente sale a verlo.', e_shopper: 'Hay un cliente misterioso en el pueblo. ¡Hoy hay buenas propinas!',
  },
});

const tabs_ = {};      // which path is open (for each stand): stays the same from one day to the next

/** The stand, as it looks right now: a big building that grows up, and a sticker for everything he owns. */
export function sceneEl(up, lang, stand = 'lemonade') {
  const U = UI[stand], look = U.look(up), glyph = U.glyph[look];
  const owned = upgradeList(stand).filter((u) => up[u.id] && !U.dream.includes(u.id));
  return h('div', { class: 'scene card look-' + look, 'aria-label': t('stYourStand') },
    h('div', { class: 'sbuild' }, glyph ? h('span', { class: 'sglyph' }, glyph) : h('span', { class: 'sglyph svg', html: icons[U.icon](104) })),
    h('div', { class: 'sinfo' }, h('small', {}, t('stYourStand')), h('strong', {}, t(U.k + 'lk_' + look)),
      h('div', { class: 'props', role: 'img', 'aria-label': owned.length + ' / ' + upgradeList(stand).length }, owned.slice(-18).map((u) => h('span', { title: UP_TEXT[stand][u.id][lang === 'es' ? 'es' : 'en'][0] }, U.emoji[u.id])))));
}

/** The place picker: the crowd you can expect at each place today, so he can compare and choose. */
export function spotRow({ up, spot, expFor, onPick, lang, stand = 'lemonade' }) {
  const owned = spotsOwned(up, stand); if (!owned.length) return null; const tbl = spotTable(stand), U = UI[stand];
  const chip = (id, emoji, name, sub) => h('button', { class: 'spotchip' + ((spot || 'home') === id ? ' on' : ''), 'aria-pressed': String((spot || 'home') === id), 'data-spot': id, onclick: () => onPick(id === 'home' ? null : id) },
    h('span', { class: 'se' }, emoji), h('strong', {}, name), h('small', {}, '👥 ~' + Math.round(expFor(id === 'home' ? null : id)).toLocaleString('en-US')), sub ? h('small', { class: 'ssub' }, sub) : null);
  return h('div', { class: 'card spotsel' }, h('h3', {}, '📍 ' + t('stOpenAt')), h('p', { class: 'muted small' }, t('stSpotTip')),
    h('div', { class: 'spots' }, chip('home', U.home, t(U.k + 'stHome')), owned.map((id) => chip(id, tbl[id].emoji, (UP_TEXT[stand][id][lang === 'es' ? 'es' : 'en'])[0]))));
}

/**
 * The shop. ctx: { st, seasons, upName, upSub, onBuy(u), onGoal(id), avgDaily }.
 * Shows the "saving for" banner, the dream strip, a tab for each path, and the next few things in the open path.
 */
export function lemonShop({ stand = 'lemonade', st, seasons, upName, upSub, onBuy, onGoal, avgDaily, rerender }) {
  const U = UI[stand], PATHS = U.paths, DREAM = U.dream, UP_EMOJI = U.emoji;
  const all = upgradeList(stand), vis = visibleUpgrades(stand, seasons), up = st.up, bank = st.bank;
  const unowned = vis.filter((u) => !up[u.id]);
  const buyable = unowned.filter((u) => canBuy(stand, u.id, up));
  const goalU = (st.goal && buyable.find((u) => u.id === st.goal)) || buyable.slice().sort((a, b) => a.price - b.price)[0] || null;
  const canNow = buyable.some((u) => bank >= u.price);
  const days = (need) => { if (!(avgDaily > 0)) return ''; const d = Math.max(1, Math.ceil(need / avgDaily)); return ' · ' + (d === 1 ? t('stAboutDay') : t('stAboutDays', { d: d.toLocaleString('en-US') })); };

  // 1. banner
  let banner;
  if (up[DREAM[DREAM.length - 1]] && !unowned.length) banner = h('div', { class: 'saving done' }, t(U.k + 'stAllBought'));
  else if (canNow && !(st.goal && goalU && bank < goalU.price)) banner = h('div', { class: 'saving can' }, t('stCanBuy'));
  else if (goalU) {
    const need = Math.max(0, Math.round((goalU.price - bank) * 100) / 100), pct = Math.min(100, Math.round((bank / goalU.price) * 100));
    banner = h('div', { class: 'saving' }, h('div', { class: 'srow2' }, h('span', { class: 'se' }, UP_EMOJI[goalU.id]), h('strong', {}, t('stSaving', { x: upName(stand, goalU.id) })), h('span', { class: 'togo' }, t('stToGo', { n: money(need) }) + days(need))),
      h('div', { class: 'meter', role: 'img', 'aria-label': pct + '%' }, h('i', { style: { width: pct + '%' } })));
  } else {
    const nextS = Math.min(...all.filter((u) => !up[u.id] && tierSeason(stand, u.tier) > seasons).map((u) => tierSeason(stand, u.tier)), 99);
    banner = h('div', { class: 'saving' }, nextS < 99 ? t('stNothingNow', { n: nextS }) : t(U.k + 'stAllBought'));
  }

  // 2. the dream strip: the shop path lights up piece by piece
  const dreamN = DREAM.filter((id) => up[id]).length;
  const dream = h('div', { class: 'dream card', 'aria-label': t(U.k + 'stDreamT') }, h('div', { class: 'dhead' }, h('strong', {}, U.dreamEmoji ? U.dreamEmoji + ' ' + t(U.k + 'stDreamT') : '🏙️ ' + t('stDreamT')), h('small', {}, t('stDreamOf', { a: dreamN, b: DREAM.length }))),
    h('div', { class: 'dsteps' }, DREAM.map((id) => h('span', { class: 'dstep' + (up[id] ? ' lit' : ''), title: up[id] ? upName(stand, id) : '?' }, UP_EMOJI[id]))));

  // 3. tabs
  const pathItems = (p) => all.filter((u) => u.path === p);
  const firstWithBuy = PATHS.find((p) => buyable.some((u) => u.path === p.id && bank >= u.price));
  let tab = tabs_[stand];
  if (!tab || !PATHS.some((p) => p.id === tab)) tab = (firstWithBuy || PATHS.find((p) => goalU && goalU.path === p.id) || PATHS[0]).id;
  tabs_[stand] = tab;
  const tabs = h('div', { class: 'ptabs', role: 'tablist' }, PATHS.map((p) => {
    const items = pathItems(p.id), got = items.filter((u) => up[u.id]).length, ready = buyable.some((u) => u.path === p.id && bank >= u.price);
    return h('button', { class: 'ptab' + (ready ? ' ready' : ''), role: 'tab', 'aria-selected': String(tab === p.id), 'data-path': p.id, onclick: () => { tabs_[stand] = p.id; rerender(); } },
      h('span', { class: 'pe' }, p.emoji), h('strong', {}, t(U.k + 'pth_' + p.id)), h('small', {}, got + '/' + items.length), ready ? h('i', { class: 'pdot', 'aria-hidden': 'true' }) : null);
  }));

  // 4. the open path: stickers for what he owns, the next few things, and a mystery
  const items = pathItems(tab), mine = items.filter((u) => up[u.id]), visUn = items.filter((u) => vis.includes(u) && !up[u.id]);
  const ok = (u) => canBuy(stand, u.id, up);
  const ordered = [...visUn.filter(ok).sort((a, b) => a.price - b.price), ...visUn.filter((u) => !ok(u)).sort((a, b) => a.price - b.price)];
  const shown = ordered.slice(0, 3), hidden = items.filter((u) => !up[u.id]).length - shown.length;
  const hiddenNew = items.filter((u) => !up[u.id] && !vis.includes(u)).map((u) => tierSeason(stand, u.tier));
  const card = (u) => {
    const reqOk = ok(u), afford = bank >= u.price, miss = (u.req || []).filter((r) => !up[r]);
    const pct = Math.min(100, Math.round((bank / u.price) * 100)), isGoal = reqOk && !afford && goalU && goalU.id === u.id && st.goal === u.id;
    const hidden = u.secret && !reqOk;      // a secret flavor shows a riddle until what it needs is owned
    const riddle = hidden ? (UP_TEXT[stand][u.id][S.lang === 'es' ? 'es' : 'en'][2] || '') : null;
    return h('div', { class: 'upgcell' },
      h('button', { class: 'upg' + (reqOk && !afford ? ' save' : '') + (hidden ? ' secret' : ''), disabled: !reqOk || !afford, 'data-up': u.id, onclick: () => onBuy(u) },
        h('span', { class: 'ue' }, hidden ? '❓' : UP_EMOJI[u.id]), h('strong', {}, hidden ? t('stSecretName') : upName(stand, u.id)), h('small', {}, hidden ? riddle : upSub(stand, u.id)),
        !reqOk && !hidden ? h('small', { class: 'need' }, t('stNeeds', { x: miss.map((r) => upName(stand, r)).join(', ') })) : null,
        reqOk && !afford ? h('span', { class: 'fillbar', role: 'img', 'aria-label': pct + '%' }, h('i', { style: { width: pct + '%' } })) : null,
        h('span', { class: 'tag' }, money(u.price))),
      reqOk && !afford ? h('button', { class: 'goalbtn' + (isGoal ? ' on' : ''), 'data-goal': u.id, onclick: () => onGoal(u.id) }, isGoal ? t('stSavingThis') : t('stSaveThis')) : null);
  };
  const book = mine.length ? h('div', { class: 'book', 'aria-label': t('stBookOf', { a: mine.length, b: items.length }) }, mine.map((u) => h('span', { class: 'sticker', title: upName(stand, u.id) }, UP_EMOJI[u.id]))) : null;
  const mystery = hidden > 0 ? h('div', { class: 'upg mystery', 'aria-label': t('stMore', { n: hidden }) }, h('span', { class: 'ue' }, '❓'), h('strong', {}, hiddenNew.length && !shown.length ? t('stMoreNew', { n: hidden, s: Math.min(...hiddenNew) }) : t('stMore', { n: hidden }))) : null;
  const panel = h('div', { class: 'ppanel', role: 'tabpanel' },
    h('div', { class: 'phead' }, h('h3', {}, PATHS.find((p) => p.id === tab).emoji + ' ' + t(U.k + 'pth_' + tab)), h('small', {}, t(U.k + 'pthd_' + tab) + ' · ' + t('stBookOf', { a: mine.length, b: items.length }))),
    book, h('div', { class: 'ups' }, shown.map(card), mystery));
  return h('div', { class: 'lemonshop' }, banner, dream, tabs, panel);
}
