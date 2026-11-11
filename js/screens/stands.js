import { S, save, spendPearls } from '../core/store.js';
import { h, money, confetti } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx } from '../core/audio.js';
import { COST } from '../core/economy.js';
import { standState } from '../stands/runner.js';
import { seasonDays } from '../stands/sims.js';

addStrings({
  en: {
    stTitle: 'My Stands', stIntro: 'Earn pearls in any game, then open a stand and run it your way.',
    stUnlockFor: 'Open for {n} pearls', stNeed: '{n} more pearls to go', stSoon: 'Coming soon', stGo: 'Go to the stand', stEarn: 'Earn pearls',
    stConfirm: 'Open the {name} for {n} pearls?', stNotYet: 'Not yet', stReady: 'New season ready', stSeasonOver: 'Next season: {c} pearls', stOpenedN: '{name} is open!', stDaysRun: '{n} days run',
    sd_lemonade: 'Pick a price, watch the weather, and grow a cart into a lemonade empire.', sd_icecream: 'Sprinkles, sauces, sundaes, trucks and a castle. Grow a cart into Sundae Island!', sd_pizza: 'Fill orders with halves, quarters and eighths.',
    sd_snack: 'Baseball fans are hungry! Sell hot dogs, burgers, fries and candy on game day. Home runs and rain delays change what they want.', sd_sanctuary: 'Care for rescued sea animals.',
    sn_lemonade: 'Lemonade Stand', sn_icecream: 'Ice Cream Stand', sn_pizza: 'Pizza Shop', sn_snack: 'Ballpark Snack Shack', sn_sanctuary: 'Shark Sanctuary',
  },
  es: {
    stTitle: 'Mis puestos', stIntro: 'Gana perlas en cualquier juego, luego abre un puesto y dirígelo a tu manera.',
    stUnlockFor: 'Abrir por {n} perlas', stNeed: 'Faltan {n} perlas', stSoon: 'Próximamente', stGo: 'Ir al puesto', stEarn: 'Ganar perlas',
    stConfirm: '¿Abrir {name} por {n} perlas?', stNotYet: 'Todavía no', stReady: 'Temporada nueva lista', stSeasonOver: 'Próxima temporada: {c} perlas', stOpenedN: '¡{name} está abierto!', stDaysRun: '{n} días atendidos',
    sd_lemonade: 'Elige un precio, mira el clima y convierte un carrito en un imperio de limonada.', sd_icecream: 'Chispas, salsas, helados especiales, camiones y un castillo. ¡Convierte un carrito en la Isla Sundae!', sd_pizza: 'Completa pedidos con mitades, cuartos y octavos.',
    sd_snack: '¡Los fans del béisbol tienen hambre! Vende hot dogs, hamburguesas, papas y dulces el día del juego. Los jonrones y las pausas por lluvia cambian lo que quieren.', sd_sanctuary: 'Cuida animales marinos rescatados.',
    sn_lemonade: 'Puesto de limonada', sn_icecream: 'Puesto de helados', sn_pizza: 'Pizzería', sn_snack: 'Puesto de botanas del estadio', sn_sanctuary: 'Santuario de tiburones',
  },
});

export const STANDS = [
  { id: 'lemonade', cost: COST.stands.lemonade.unlock }, { id: 'snack', cost: COST.stands.snack.unlock, icon: 'ballpark' },
  { id: 'icecream', cost: COST.stands.icecream.unlock }, { id: 'pizza', cost: COST.stands.pizza.unlock },
];

export async function mount(el, { parts }) {
  const id = parts[0];
  if (id === 'lemonade' || id === 'icecream' || id === 'snack') {
    if (!S.unlocked[id]) { go('/stands'); return () => {}; }
    const m = await import('../stands/runner.js'); return m.mount(el, { id });
  }
  if (id === 'pizza') {
    if (!S.unlocked.pizza) { go('/stands'); return () => {}; }
    const m = await import('../stands/pizza.js'); return m.mount(el);
  }
  return hub(el);
}

function hub(el) {
  const root = h('div'); el.append(root);
  function draw() {
    const cards = STANDS.map((s) => {
      const name = t('sn_' + s.id), desc = t('sd_' + s.id);
      const icon = s.icon || s.id;
      if (s.soon) return h('div', { class: 'stcard soon' }, h('div', { class: 'sti', html: icons[icon](80) }), h('div', { class: 'stb' }, h('strong', {}, name), h('small', {}, desc)), h('span', { class: 'tag' }, t('stSoon')));
      const open = !!S.unlocked[s.id], st = open && s.id !== 'pizza' ? standState(s.id) : S.stands[s.id];
      if (open) {
        return h('div', { class: 'stcard open' }, h('div', { class: 'sti', html: icons[icon](80) }),
          h('div', { class: 'stb' }, h('strong', {}, name), h('small', {}, desc), st && (st.days || st.season) ? h('small', { class: 'meta' }, (st.season ? t('stSeasonN', { n: st.seasons }) + ' · ' + t('stDayOf', { d: Math.min(st.season.day + 1, seasonDays(s.id)), m: seasonDays(s.id) }) : (st.tickets > 0 ? t('stReady') : t('stSeasonOver', { c: COST.stands[s.id].season }))) + ' · ' + money(st.bank)) : null),
          h('a', { class: 'btn gold', href: '#/stands/' + s.id, onclick: () => sfx.pop() }, t('stGo')));
      }
      const need = s.cost - S.pearls.balance, can = need <= 0;
      const pct = Math.min(100, Math.round((S.pearls.balance / s.cost) * 100));
      return h('div', { class: 'stcard locked' }, h('div', { class: 'sti', html: icons[icon](80) }, h('span', { class: 'lk', html: icons.lock(32) })),
        h('div', { class: 'stb' }, h('strong', {}, name), h('small', {}, desc), h('div', { class: 'meter', role: 'img', 'aria-label': pct + '%' }, h('i', { style: { width: pct + '%' } })), h('small', { class: 'meta' }, can ? '' : t('stNeed', { n: need }))),
        can ? h('button', { class: 'btn gold', onclick: () => confirmUnlock(s, name) }, h('span', { html: icons.pearl(30) }), t('stUnlockFor', { n: s.cost }))
          : h('a', { class: 'btn ghost small', href: '#/quiz' }, t('stEarn')));
    });
    root.replaceChildren(h('div', { class: 'screen-head' }, h('h1', {}, t('stTitle'))), h('p', { class: 'muted' }, t('stIntro')), h('div', { class: 'stlist' }, cards));
  }
  function confirmUnlock(s, name) {
    const ov = h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'dialog center' },
      h('div', { html: icons[s.icon || s.id](96) }), h('h2', {}, t('stConfirm', { name, n: s.cost })),
      h('div', { class: 'row', style: { justifyContent: 'center' } },
        h('button', { class: 'btn gold', onclick: () => { if (!spendPearls(s.cost)) { ov.remove(); return; } S.unlocked[s.id] = true; (S.stands[s.id] ||= {}).tickets = 1; save(); ov.remove(); sfx.levelUp(); confetti(); go('/stands/' + s.id); } }, t('stUnlockFor', { n: s.cost })),
        h('button', { class: 'btn ghost', onclick: () => ov.remove() }, t('stNotYet')))));
    document.body.append(ov);
  }
  draw();
  return () => {};
}
