// Pizza Shop: fill fraction orders by painting slices. Teaches halves, quarters and eighths by doing.
import { S, save } from '../core/store.js';
import { h, clamp, money, confetti, shuffle, pick, svgEl } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx, speak, canSpeak } from '../core/audio.js';
import { awardBadges } from '../core/badges.js';

addStrings({
  en: {
    pzTitle: 'Pizza Shop', stBank: 'Your money', pzOrder: 'Order {n} of {m}', pzPaint: 'Tap a topping, then tap slices to paint them.', pzCheck: 'Bake it!', pzClear: 'Start over', pzHear: 'Read the order',
    pz_pep: 'Pepperoni', pz_oli: 'Olives', pz_mush: 'Mushrooms', pz_pepper: 'Peppers', pz_cheese: 'Cheese',
    pzOf: 'of the pizza', pzSlices: '{n} of {t} slices', pzAll: 'Paint every slice first.', pzMiss: '{top}: the order says {f}, which is {n} of {t} slices. You have {have}.', pzOverLine: 'Too many', pzUnder: 'Not enough',
    pzNice: 'Perfect pizza!', pzTip: '+${n} tip for getting it right the first time!', pzPaid: 'Paid ${n}', pzNext: 'Next order', pzRound: 'Shift complete!', pzEarned: 'You earned', pzFirst: 'right the first time', pzLevelUp: 'Level up! Bigger fractions next time.', pzLevel: 'Shop level {n}', pzAgain: 'Another shift', pzHintShow: 'Show me the slices', pzHalf: 'half',
    w_1_2: 'half', w_1_4: 'one quarter', w_3_4: 'three quarters', w_1_8: 'one eighth', w_3_8: 'three eighths', w_5_8: 'five eighths', w_7_8: 'seven eighths', w_1_1: 'the whole pizza',
  },
  es: {
    pzTitle: 'Pizzería', stBank: 'Tu dinero', pzOrder: 'Pedido {n} de {m}', pzPaint: 'Toca un ingrediente y luego toca las rebanadas para pintarlas.', pzCheck: '¡Hornear!', pzClear: 'Empezar de nuevo', pzHear: 'Leer el pedido',
    pz_pep: 'Pepperoni', pz_oli: 'Aceitunas', pz_mush: 'Champiñones', pz_pepper: 'Pimientos', pz_cheese: 'Queso',
    pzOf: 'de la pizza', pzSlices: '{n} de {t} rebanadas', pzAll: 'Pinta todas las rebanadas primero.', pzMiss: '{top}: el pedido dice {f}, que son {n} de {t} rebanadas. Tú tienes {have}.', pzOverLine: 'Demasiadas', pzUnder: 'Faltan',
    pzNice: '¡Pizza perfecta!', pzTip: '¡+${n} de propina por acertar a la primera!', pzPaid: 'Pagó ${n}', pzNext: 'Siguiente pedido', pzRound: '¡Turno completo!', pzEarned: 'Ganaste', pzFirst: 'a la primera', pzLevelUp: '¡Subiste de nivel! La próxima vez habrá fracciones más grandes.', pzLevel: 'Nivel de la pizzería {n}', pzAgain: 'Otro turno', pzHintShow: 'Muéstrame las rebanadas', pzHalf: 'mitad',
    w_1_2: 'la mitad', w_1_4: 'un cuarto', w_3_4: 'tres cuartos', w_1_8: 'un octavo', w_3_8: 'tres octavos', w_5_8: 'cinco octavos', w_7_8: 'siete octavos', w_1_1: 'toda la pizza',
  },
});

const TOPS = {
  pep: { fill: '#E0553E', draw: (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="#D1432E" stroke="#10303B" stroke-width="1.6"/><circle cx="${x - 3}" cy="${y - 2}" r="1.6" fill="#8A2A1C"/><circle cx="${x + 3}" cy="${y + 3}" r="1.6" fill="#8A2A1C"/>` },
  oli: { fill: '#8E7CC3', draw: (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="#2A2342" stroke="#10303B" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="2.6" fill="#E9D8A6"/>` },
  mush: { fill: '#D9C29A', draw: (x, y) => `<path d="M${x - 9} ${y + 2}a9 8 0 0 1 18 0z" fill="#F0E2C4" stroke="#10303B" stroke-width="1.6"/><rect x="${x - 3}" y="${y + 2}" width="6" height="6" fill="#E6D6B2" stroke="#10303B" stroke-width="1.4"/>` },
  pepper: { fill: '#58B368', draw: (x, y) => `<path d="M${x - 9} ${y}q9 -10 18 0" fill="none" stroke="#2E8B45" stroke-width="5" stroke-linecap="round"/><path d="M${x - 9} ${y}q9 -10 18 0" fill="none" stroke="#10303B" stroke-width="1" stroke-linecap="round" opacity=".5"/>` },
  cheese: { fill: '#FFD166', draw: (x, y) => `<circle cx="${x - 4}" cy="${y}" r="2.5" fill="#F2B632"/><circle cx="${x + 4}" cy="${y + 3}" r="2.5" fill="#F2B632"/><circle cx="${x + 1}" cy="${y - 5}" r="2.5" fill="#F2B632"/>` },
};
const NAMES = Object.keys(TOPS);

// Slice splits per level (always sum to the number of slices)
const LEVELS = {
  1: { slices: 4, splits: [[2, 2], [2, 1, 1]] },
  2: { slices: 8, splits: [[4, 4], [4, 2, 2], [4, 2, 1, 1], [2, 2, 2, 2]] },
  3: { slices: 8, splits: [[6, 2], [3, 5], [3, 3, 2], [5, 2, 1], [4, 3, 1], [6, 1, 1], [3, 4, 1], [5, 3]] },
};
const show = (root, ...k) => root.replaceChildren(...k.flat().filter((x) => x != null && x !== false));
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const reduce = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
const fracWord = (n, d) => { const [a, b] = reduce(n, d); return t('w_' + a + '_' + b); };
const fracEl = (n, d) => { const [a, b] = reduce(n, d); return h('span', { class: 'frac', 'aria-label': fracWord(n, d) }, h('i', {}, a), h('b', {}, b)); };

function makeOrder(level) {
  const L = LEVELS[level], split = pick(L.splits);
  const names = shuffle(NAMES).slice(0, split.length);
  return { slices: L.slices, items: split.map((n, i) => ({ top: names[i], n })) };
}

export function mount(el) {
  const st = (S.stands.pizza ||= { bank: 0, days: 0, best: 0, bestRound: 0, total: 0, level: 1, up: {} });
  st.level = clamp(st.level || 1, 1, 3);
  const root = h('div', { class: 'stand pizza' }); el.append(root);
  const ROUND = 5;
  let idx = 0, earned = 0, firsts = 0;

  function round() { idx = 0; earned = 0; firsts = 0; order(); }

  function order() {
    const o = makeOrder(st.level), n = o.slices;
    const paint = Array(n).fill(null);
    let brush = o.items[0].top, tries = 0, hintOn = false;
    const orderLine = o.items.map((it) => `${fracWord(it.n, n)} ${t('pz_' + it.top)}`).join(', ');
    const svgHost = h('div', { class: 'pizzabox' }), msg = h('p', { class: 'pzmsg', role: 'status' });

    const draw = () => {
      const R = 150, cx = 170, cy = 170, parts = [`<circle cx="${cx}" cy="${cy}" r="${R + 12}" fill="#B7794A" stroke="#10303B" stroke-width="4"/>`];
      for (let i = 0; i < n; i++) {
        const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / n, a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / n;
        const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0), x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
        const top = paint[i], fill = top ? TOPS[top].fill : '#F4E3B5';
        const am = (a0 + a1) / 2, gx = cx + R * 0.62 * Math.cos(am), gy = cy + R * 0.62 * Math.sin(am);
        let glyph = '';
        if (top) { const k = n === 4 ? 3 : 2; for (let g = 0; g < k; g++) { const off = (g - (k - 1) / 2) * 22, perp = am + Math.PI / 2; glyph += TOPS[top].draw(Math.round(gx + off * Math.cos(perp) * 0.9 + (g ? 0 : 0)), Math.round(gy + off * Math.sin(perp) * 0.9)); } }
        parts.push(`<path class="sl" data-i="${i}" d="M${cx} ${cy}L${x0.toFixed(1)} ${y0.toFixed(1)}A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}z" fill="${fill}" stroke="#10303B" stroke-width="4" stroke-linejoin="round"/>${glyph}`);
      }
      const svg = svgEl(`<svg viewBox="0 0 340 340" role="img" aria-label="${t('pzTitle')}">${parts.join('')}</svg>`);
      svg.querySelectorAll('.sl').forEach((p) => p.addEventListener('pointerdown', (e) => { e.preventDefault(); const i = +p.dataset.i; paint[i] = paint[i] === brush ? null : brush; sfx.tap(); draw(); }));
      svgHost.replaceChildren(svg);
      counts();
    };
    const brushes = h('div', { class: 'brushes' });
    const counters = {};
    const counts = () => {
      for (const it of o.items) { const have = paint.filter((x) => x === it.top).length; counters[it.top].textContent = hintOn ? `${have}/${it.n}` : have; }
      brushes.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.top === brush)));
    };
    for (const it of o.items) {
      const cnt = h('span', { class: 'cnt' }, '0'); counters[it.top] = cnt;
      brushes.append(h('button', { class: 'brush', 'data-top': it.top, 'aria-pressed': String(it.top === brush), onclick: () => { brush = it.top; sfx.pop(); counts(); } },
        h('span', { class: 'sw', html: `<svg viewBox="0 0 40 40" width="44" height="44"><circle cx="20" cy="20" r="18" fill="${TOPS[it.top].fill}" stroke="#10303B" stroke-width="2.5"/>${TOPS[it.top].draw(20, 21)}</svg>` }), h('span', {}, t('pz_' + it.top)), cnt));
    }
    const who = pick(['🧑‍🍳', '👩‍🦰', '👨‍🦱', '🧓', '👧', '👦']);
    const mkTicket = () => h('div', { class: 'ticket card' },
      h('small', {}, t('pzOrder', { n: idx + 1, m: ROUND })), h('span', { class: 'who' }, who),
      h('ul', {}, o.items.map((it) => h('li', {}, fracEl(it.n, n), h('span', { class: 'iw' }, fracWord(it.n, n) + ' ' + t('pz_' + it.top)), hintOn ? h('span', { class: 'tag' }, t('pzSlices', { n: it.n, t: n })) : null))),
      canSpeak() ? h('button', { class: 'btn ghost small', onclick: () => speak(t('pzTitle') + '. ' + orderLine) }, h('span', { html: icons.speaker(30) }), t('pzHear')) : null);
    let ticket = mkTicket();

    const check = h('button', { class: 'btn gold go', onclick: () => {
      if (paint.some((x) => !x)) { msg.textContent = t('pzAll'); sfx.wrong(); return; }
      const bad = o.items.find((it) => paint.filter((x) => x === it.top).length !== it.n);
      if (!bad) return success();
      tries++; hintOn = tries >= 1; sfx.wrong();
      const have = paint.filter((x) => x === bad.top).length;
      msg.textContent = t('pzMiss', { top: t('pz_' + bad.top), f: fracWord(bad.n, n), n: bad.n, t: n, have });
      msg.classList.remove('good'); const nt = mkTicket(); ticket.replaceWith(nt); ticket = nt; counts();
    } }, h('span', { html: icons.pizza(36) }), t('pzCheck'));
    function success() {
      const first = tries === 0, pay = 4, tip = first ? 2 : 0;
      earned += pay + tip; if (first) firsts++;
      sfx.hardCorrect(); confetti();
      msg.classList.add('good'); msg.textContent = t('pzNice') + ' ' + t('pzPaid', { n: pay.toFixed(2) }) + (tip ? ' ' + t('pzTip', { n: tip.toFixed(2) }) : '');
      check.replaceWith(h('button', { class: 'btn gold go', onclick: () => { idx++; sfx.pop(); if (idx >= ROUND) summary(); else order(); } }, idx + 1 >= ROUND ? t('done') : t('pzNext')));
      svgHost.classList.add('baked');
    }
    show(root, 
      h('div', { class: 'screen-head' }, h('button', { class: 'btn ghost icon', 'aria-label': t('back'), onclick: () => go('/stands'), html: icons.back(34) }), h('h1', {}, t('pzTitle')), h('span', { class: 'chip' }, t('pzLevel', { n: st.level }))),
      h('div', { class: 'pzgrid' }, h('div', { class: 'pzleft' }, ticket, h('p', { class: 'coach' }, h('span', { html: icons.bulb(30) }), t('pzPaint')), brushes), h('div', { class: 'pzright' }, svgHost, msg, h('div', { class: 'row', style: { justifyContent: 'center' } }, check,
        h('button', { class: 'btn ghost small', onclick: () => { paint.fill(null); msg.textContent = ''; draw(); } }, t('pzClear'))))));
    draw();
  }

  function summary() {
    st.bank = Math.round((st.bank + earned) * 100) / 100; st.days++; st.total += earned; st.bestRound = Math.max(st.bestRound || 0, earned);
    let up = false; if (firsts >= 4 && st.level < 3) { st.level++; up = true; }
    save(); const fresh = awardBadges();
    show(root, 
      h('div', { class: 'screen-head' }, h('h1', {}, t('pzRound'))),
      h('div', { class: 'receipt card' },
        h('div', { class: 'rrow total good' }, h('span', {}, t('pzEarned')), h('b', {}, '+' + money(earned))),
        h('div', { class: 'rrow' }, h('span', {}, firsts + ' / ' + ROUND + ' ' + t('pzFirst')), h('b', {}, '⭐'.repeat(firsts) || '–')),
        h('div', { class: 'rrow bank' }, h('span', {}, t('stBank')), h('b', {}, money(st.bank)))),
      up ? h('p', { class: 'notice' }, t('pzLevelUp')) : null, fresh.length ? h('p', { class: 'notice' }, '🏅 ' + fresh.join(', ')) : null,
      h('div', { class: 'openrow' }, h('button', { class: 'btn gold go', onclick: round }, t('pzAgain')), h('button', { class: 'btn ghost', onclick: () => go('/stands') }, t('done'))));
    sfx.levelUp(); confetti();
  }

  round();
  return () => {};
}
