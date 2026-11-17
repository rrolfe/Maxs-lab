// How every Number Patterns puzzle LOOKS. Each builder returns
//   { el, inline, select(k), mark(k, cls), right(value, index), reveal(value, index), hint(), start(), cleanup() }
// "inline" means the answer choices are drawn inside the picture (frog pads, tappable numbers) instead of in the answer grid.
import { h, svgEl, shuffle, hashStr, rng, reduceMotion } from '../core/dom.js';
import { t, addStrings } from '../core/i18n.js';
import { fmt } from '../quiz/patterns.js';
import { CRITTERS } from '../progress/newgames.js';

addStrings({
  en: { patIn: 'IN', patOut: 'OUT', patRare: 'RARE', patRegular: 'REGULAR', patPackOf: 'pack', patHidden: 'Hidden!', patPeek: 'Peek again', patHungry: 'Feed me!', patStart: 'start', patPeekNote: 'Peeking counts like a hint.' },
  es: { patIn: 'ENTRA', patOut: 'SALE', patRare: 'RARAS', patRegular: 'COMUNES', patPackOf: 'paquete', patHidden: '¡Escondidos!', patPeek: 'Mirar otra vez', patHungry: '¡Dame de comer!', patStart: 'inicio', patPeekNote: 'Mirar otra vez cuenta como una pista.' },
});

const OPS = new Set(['+', '−', '×', '÷', '=']);
const isNum = (p) => /^[−-]?[\d,]+$/.test(p);
const noop = () => {};
const base = (el, more = {}) => ({ el, inline: false, select: noop, mark: noop, right: noop, reveal: noop, hint: noop, start: noop, cleanup: noop, ...more });
const fill = (el, v, cls = 'right') => { if (!el) return; el.textContent = fmt(v); el.classList.add(cls); el.classList.remove('blank'); };

function eqRow(parts, cls = '') {
  const blanks = [];
  const row = h('div', { class: 'eqrow ' + cls }, parts.map((p) => {
    if (p === '?') { const b = h('span', { class: 'eqb' }, '?'); blanks.push(b); return b; }
    if (OPS.has(p)) return h('span', { class: 'eqo' }, p);
    return h('span', { class: isNum(p) ? 'eqn' : 'eqw' }, p);
  }));
  return { row, blanks };
}

// ---------------------------------------------------------------- sequences
function seq(q) {
  const items = q.show.items;
  const tiles = items.map((n) => (n == null ? h('div', { class: 'nt blank' }, '?') : h('div', { class: 'nt' }, fmt(n))));
  const long = items.some((n) => n != null && String(Math.abs(n)).length >= 4);
  const el = h('div', { class: 'seqrow' + (long || items.length > 5 ? ' tight' : '') }, tiles);
  const b = tiles.find((x) => x.classList.contains('blank'));
  return base(el, { right: (v) => fill(b, v), reveal: (v) => fill(b, v, 'shown') });
}
const MONSTER = `<svg viewBox="0 0 120 120" width="124" height="124" aria-hidden="true">
<path d="M16 74a44 44 0 1 1 88 0v20a10 10 0 0 1-10 10H26a10 10 0 0 1-10-10z" fill="var(--teal)" stroke="var(--ink)" stroke-width="3.5"/>
<circle cx="42" cy="42" r="13" fill="#fff" stroke="var(--ink)" stroke-width="3"/><circle cx="78" cy="42" r="13" fill="#fff" stroke="var(--ink)" stroke-width="3"/>
<circle cx="45" cy="44" r="5.5" fill="var(--ink)"/><circle cx="75" cy="44" r="5.5" fill="var(--ink)"/>
<path d="M28 70h64v12a32 24 0 0 1-64 0z" fill="#10303B" stroke="var(--ink)" stroke-width="3"/>
<path d="M34 70l7 11 7-11M52 70l7 11 7-11M70 70l7 11 7-11" fill="#fff" stroke="var(--ink)" stroke-width="2.2" stroke-linejoin="round"/>
<ellipse cx="60" cy="96" rx="15" ry="7" fill="var(--coral)"/></svg>`;
function chomp(q) {
  const s = seq(q);
  const mon = h('div', { class: 'chomper', html: MONSTER }), say = h('small', { class: 'chsay' }, t('patHungry'));
  const el = h('div', { class: 'chompbox' }, s.el, h('div', { class: 'chcol' }, mon, say));
  return base(el, { right: (v) => { s.right(v); mon.classList.add('go'); say.textContent = '😋'; }, reveal: (v) => s.reveal(v) });
}

// ---------------------------------------------------------------- equations
function eq(q) {
  const { row, blanks } = eqRow(q.show.parts);
  return base(h('div', { class: 'eqwrap' }, row), { right: (v) => fill(blanks[0], v), reveal: (v) => fill(blanks[0], v, 'shown') });
}
function eqs(q) {
  const rows = q.show.rows.map((r) => eqRow(r.split(' '), 'stackrow'));
  const b = rows[rows.length - 1].blanks[0];
  return base(h('div', { class: 'eqstack' }, rows.map((x) => x.row)), { right: (v) => fill(b, v), reveal: (v) => fill(b, v, 'shown') });
}
function table(q) {
  let blank;
  const el = h('div', { class: 'rtable' },
    h('div', { class: 'rhead' }, h('span', {}, t('patIn')), h('span', {}), h('span', {}, t('patOut'))),
    q.show.rows.map(([i, o]) => h('div', { class: 'rrow' }, h('span', { class: 'nt sm' }, fmt(i)), h('span', { class: 'rarrow' }, '→'), o == null ? (blank = h('span', { class: 'eqb sm' }, '?')) : h('span', { class: 'nt sm' }, fmt(o)))));
  return base(el, { right: (v) => fill(blank, v), reveal: (v) => fill(blank, v, 'shown') });
}
function machine(q) {
  const rows = q.show.rows;
  let blank;
  const cells = [h('div', { class: 'mh', style: { gridColumn: 1, gridRow: 1 } }, t('patIn')), h('div', { class: 'mh', style: { gridColumn: 3, gridRow: 1 } }, t('patOut'))];
  const box = h('div', { class: 'mbox', style: { gridColumn: 2, gridRow: `2 / span ${rows.length}` } }, h('span', { html: '⚙️' }), h('b', {}, '?'), h('span', { html: '⚙️' }));
  cells.push(box);
  rows.forEach(([i, o], k) => {
    cells.push(h('span', { class: 'nt sm', style: { gridColumn: 1, gridRow: k + 2 } }, fmt(i)));
    cells.push(o == null ? (blank = h('span', { class: 'eqb sm', style: { gridColumn: 3, gridRow: k + 2 } }, '?')) : h('span', { class: 'nt sm', style: { gridColumn: 3, gridRow: k + 2 } }, fmt(o)));
  });
  return base(h('div', { class: 'mach' }, cells), { right: (v) => { fill(blank, v); box.classList.add('run'); }, reveal: (v) => fill(blank, v, 'shown') });
}
function hops(q) {
  const s = q.show;
  const end = h('div', { class: 'nt blank' }, '?');
  const el = h('div', { class: 'hoprow' }, h('div', { class: 'nt' }, fmt(s.start)),
    s.hops.map((x) => h('div', { class: 'hopstep' }, h('b', {}, (x > 0 ? '+' : '−') + fmt(Math.abs(x))), h('span', {}, '⟶'))), end);
  return base(el, { right: (v) => fill(end, v), reveal: (v) => fill(end, v, 'shown') });
}

// ---------------------------------------------------------------- critter cards ("12 rare cards minus 8 regular cards")
function cards(q) {
  const s = q.show, { op, A, B } = s;
  const rnd = rng(hashStr(q.id));
  const emoji = shuffle(CRITTERS.filter((c) => !c.rare).map((c) => c.e), rnd);
  let ei = 0;
  const one = (rare, cls = '') => h('span', { class: 'mc ' + (rare ? 'rare ' : '') + cls }, emoji[ei++ % emoji.length]);
  const pile = (n, rare) => {
    if (n > 120) return [h('span', { class: 'mc big ' + (rare ? 'rare' : '') }, fmt(n))];
    const out = [];
    const stacks = n > 24 ? Math.floor(n / 10) : 0;
    for (let i = 0; i < stacks; i++) out.push(h('span', { class: 'mc stack ' + (rare ? 'rare' : '') }, '10'));
    for (let i = 0; i < n - stacks * 10; i++) out.push(one(rare));
    return out;
  };
  const { row, blanks } = eqRow(s.parts);
  let body, topCards = [];
  if (op === '×') {
    body = h('div', { class: 'packs' }, Array.from({ length: A }, () => h('div', { class: 'pack' }, Array.from({ length: B }, () => one(false, 'sm')))));
  } else {
    topCards = pile(A, true);
    body = h('div', { class: 'cardrows' },
      h('div', { class: 'crow' }, h('span', { class: 'cardlab rare' }, t('patRare') + ' ✦ ' + fmt(A)), h('div', { class: 'cards' }, topCards)),
      h('div', { class: 'crow' }, h('span', { class: 'cardlab' }, t('patRegular') + ' ' + fmt(B)), h('div', { class: 'cards' }, pile(B, false))));
  }
  const el = h('div', { class: 'cardstage' }, h('div', { class: 'eqwrap' }, row), body);
  return base(el, {
    right: (v) => fill(blanks[0], v), reveal: (v) => fill(blanks[0], v, 'shown'),
    hint: () => { if (op === '−' && A <= 24) topCards.slice(0, B).forEach((c) => c.classList.add('match')); el.classList.add('hinted'); },
  });
}

// ---------------------------------------------------------------- quick look (flashing ten-frames)
function flash(q, api) {
  const s = q.show, r = Math.random;
  const mk = (n, cls, scatter) => {
    const frames = [], nf = Math.max(1, Math.ceil(n / 10));
    const on = new Set();
    if (scatter) { const idx = shuffle(Array.from({ length: nf * 10 }, (_, i) => i), r); idx.slice(0, n).forEach((i) => on.add(i)); }
    else for (let i = 0; i < n; i++) on.add(i);
    for (let f = 0; f < nf; f++) frames.push(h('div', { class: 'frame10' }, Array.from({ length: 10 }, (_, i) => h('div', { class: 'fc' }, on.has(f * 10 + i) ? h('i', { class: 'fd ' + cls }) : null))));
    return frames;
  };
  const frames = h('div', { class: 'frames' }, s.two ? [...mk(s.a, 'a', false), ...mk(s.b, 'b', false)] : mk(s.n, 'a', s.scatter));
  const cover = h('div', { class: 'flashcover', hidden: true }, h('b', {}, '?'), h('span', {}, t('patHidden')));
  const peek = h('button', { class: 'btn ghost small', hidden: true, onclick: () => again() }, t('patPeek'));
  const box = h('div', { class: 'flashbox' }, frames, cover);
  const el = h('div', { class: 'flashstage' }, box, peek);
  let timer = 0, peeked = false, over = false;
  const hide = () => { if (over) return; frames.classList.add('hidden'); cover.hidden = false; if (!peeked) peek.hidden = false; };
  const showFor = (ms) => { frames.classList.remove('hidden'); cover.hidden = true; peek.hidden = true; clearTimeout(timer); timer = setTimeout(hide, ms); };
  const again = () => { if (peeked || over) return; peeked = true; api.hinted(); showFor(1600); };
  const reveal = () => { over = true; clearTimeout(timer); frames.classList.remove('hidden'); cover.hidden = true; peek.hidden = true; };
  return base(el, { start: () => showFor(s.ms), right: reveal, reveal, cleanup: () => clearTimeout(timer) });
}

// ---------------------------------------------------------------- balance scale
function scale(q) {
  const s = q.show, W = 440, px = 220, py = 70, arm = 145;
  const { row, blanks } = eqRow(s.parts);
  const svg = svgEl(`<svg class="scalesvg" viewBox="0 0 ${W} 240" width="100%" aria-hidden="true">
    <path d="M220 74v100M170 200h100M190 174h60l20 26H170z" fill="var(--panel)" stroke="var(--ink)" stroke-width="3.5" stroke-linejoin="round"/>
    <g class="beam"><rect x="48" y="${py - 5}" width="344" height="10" rx="5" fill="var(--gold)" stroke="var(--ink)" stroke-width="3.5"/></g>
    <circle cx="${px}" cy="${py}" r="9" fill="var(--coral)" stroke="var(--ink)" stroke-width="3"/>
    <g class="lp"><path d="M75 ${py + 4}L22 138M75 ${py + 4}L128 138" stroke="var(--ink)" stroke-width="2.5" fill="none"/><rect x="10" y="138" width="130" height="46" rx="12" fill="var(--surface)" stroke="var(--ink)" stroke-width="3.5"/><text x="75" y="170" text-anchor="middle" class="sct">${s.left}</text></g>
    <g class="rp"><path d="M365 ${py + 4}L312 138M365 ${py + 4}L418 138" stroke="var(--ink)" stroke-width="2.5" fill="none"/><rect x="300" y="138" width="130" height="46" rx="12" fill="var(--surface)" stroke="var(--ink)" stroke-width="3.5"/><text x="365" y="170" text-anchor="middle" class="sct rt">${s.right}</text></g>
  </svg>`);
  const beam = svg.querySelector('.beam'), lp = svg.querySelector('.lp'), rp = svg.querySelector('.rp'), rt = svg.querySelector('.rt');
  const set = (deg) => { const dy = arm * Math.sin((deg * Math.PI) / 180); beam.setAttribute('transform', `rotate(${deg} ${px} ${py})`); lp.setAttribute('transform', `translate(0 ${-dy})`); rp.setAttribute('transform', `translate(0 ${dy})`); };
  const tilt = -Math.sign(s.l - s.rr) * Math.max(6, Math.min(14, (Math.abs(s.l - s.rr) / Math.max(1, s.l)) * 30));
  let cur = tilt; set(cur);
  const level = () => { const from = cur, t0 = performance.now(); if (reduceMotion()) { cur = 0; set(0); return; } (function f(now) { const k = Math.min(1, (now - t0) / 700), e = 1 - (1 - k) ** 3; cur = from * (1 - e); set(cur); if (k < 1) requestAnimationFrame(f); })(t0); };
  const done = (v, cls) => { fill(blanks[0], v, cls); rt.textContent = rt.textContent.replace('?', fmt(v)); level(); };
  return base(h('div', { class: 'scalestage' }, h('div', { class: 'eqwrap' }, row), svg), { right: (v) => done(v, 'right'), reveal: (v) => done(v, 'shown') });
}

// ---------------------------------------------------------------- frog hops: tap the landing lily pad
function frog(q, api) {
  const s = q.show;
  const end = h('div', { class: 'nt blank' }, '?');
  const path = h('div', { class: 'hoprow' }, h('div', { class: 'nt' }, fmt(s.start)), s.hops.map((x) => h('div', { class: 'hopstep' }, h('b', {}, (x > 0 ? '+' : '−') + fmt(Math.abs(x))), h('span', {}, '⟶'))), end);
  const pads = q.opts.map((o, k) => h('button', { class: 'pad' + (String(o).length > 4 ? ' long' : ''), 'data-k': k, 'aria-label': o, onclick: () => api.pick(k) }, o));
  const frogEl = h('div', { class: 'frog', html: '🐸', 'aria-hidden': 'true' });
  const padRow = h('div', { class: 'pads' }, pads);
  const el = h('div', { class: 'frogbox' }, path, h('div', { class: 'pond' }, frogEl, padRow));
  const goTo = (k) => { const p = pads[k]; if (!p) return; requestAnimationFrame(() => { frogEl.style.left = p.offsetLeft + p.offsetWidth / 2 - 24 + 'px'; frogEl.classList.add('hop'); setTimeout(() => frogEl.classList.remove('hop'), 380); }); };
  return base(el, {
    inline: true,
    select: (k) => { pads.forEach((p, i) => p.classList.toggle('sel', i === k)); goTo(k); },
    mark: (k, cls) => { pads[k]?.classList.remove('sel'); pads[k]?.classList.add(cls); if (cls === 'try' || cls === 'gone') pads[k].disabled = true; },
    right: (v, k) => { pads.forEach((p) => (p.disabled = true)); pads[k]?.classList.remove('sel'); pads[k]?.classList.add('right'); goTo(k); fill(end, v); },
    reveal: (v, k) => { pads.forEach((p) => (p.disabled = true)); pads[k]?.classList.add('shown'); goTo(k); fill(end, v, 'shown'); },
    start: () => { requestAnimationFrame(() => { frogEl.style.left = '0px'; }); },
  });
}

// ---------------------------------------------------------------- spot the glitch: tap the number that breaks the pattern
function odd(q, api) {
  const toks = q.show.items.map((n, k) => h('button', { class: 'nt tap', 'data-k': k, onclick: () => api.pick(k) }, fmt(n)));
  return base(h('div', { class: 'seqrow oddrow' + (q.show.items.some((n) => String(n).length >= 4) ? ' tight' : '') }, toks), {
    inline: true,
    select: (k) => toks.forEach((x, i) => x.classList.toggle('sel', i === k)),
    mark: (k, cls) => { toks[k]?.classList.remove('sel'); toks[k]?.classList.add(cls); if (cls === 'try' || cls === 'gone') toks[k].disabled = true; },
    right: (v, k) => { toks.forEach((x) => (x.disabled = true)); toks[k]?.classList.remove('sel'); toks[k]?.classList.add('right'); },
    reveal: (v, k) => { toks.forEach((x) => (x.disabled = true)); toks[k]?.classList.add('shown'); },
  });
}

const BUILDERS = { seq, chomp, eq, eqs, table, machine, hops, cards, flash, scale, frog, odd };
export function buildStage(q, api) { return BUILDERS[q.show.kind](q, api); }

// ---------------------------------------------------------------- hint pictures (they show the idea, never the answer)
function tenFrames(v) {
  const total = v.total > 10 ? 20 : 10, nf = total / 10;
  const frames = [];
  for (let f = 0; f < nf; f++) {
    frames.push(h('div', { class: 'frame10' }, Array.from({ length: 10 }, (_, i) => {
      const n = f * 10 + i;
      let cls = null;
      if (v.gap) cls = f === 0 ? (i < v.a ? 'a' : null) : (i < v.b ? 'b' : null);
      else cls = n < v.a ? 'a' : n < v.a + v.b ? 'need' : null;
      return h('div', { class: 'fc' }, cls ? h('i', { class: 'fd ' + cls }) : null);
    })));
  }
  return h('div', { class: 'frames hintvis' }, frames);
}
function numberLine(v) {
  const pts = v.pts, W = 560, H = 112;
  const lo = Math.min(...pts), hi = Math.max(...pts);
  const x = (n) => 44 + (hi === lo ? 0 : ((n - lo) / (hi - lo)) * (W - 88));
  let g = `<line x1="20" y1="78" x2="${W - 20}" y2="78" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>`;
  pts.forEach((n) => { g += `<line x1="${x(n)}" y1="70" x2="${x(n)}" y2="86" stroke="var(--ink)" stroke-width="3"/><text x="${x(n)}" y="106" text-anchor="middle" class="nlt">${fmt(n)}</text>`; });
  for (let i = 0; i < pts.length - 1; i++) {
    const a = x(pts[i]), b = x(pts[i + 1]), d = pts[i + 1] - pts[i], mid = (a + b) / 2, hid = v.hide && i === pts.length - 2;
    g += `<path d="M${a} 70Q${mid} ${hid ? 22 : 18} ${b} 70" fill="none" stroke="var(--coral)" stroke-width="3.5" stroke-linecap="round" ${hid ? 'stroke-dasharray="6 6"' : ''}/><text x="${mid}" y="${hid ? 30 : 26}" text-anchor="middle" class="nlh">${hid ? '+ ?' : (d > 0 ? '+' : '−') + fmt(Math.abs(d))}</text>`;
  }
  return svgEl(`<svg class="numline hintvis" viewBox="0 0 ${W} ${H}" width="100%" aria-hidden="true">${g}</svg>`);
}
function hundredsChart(v) {
  const cells = [];
  for (let n = 1; n <= 100; n++) cells.push(h('i', { class: (n === v.from ? 'from ' : '') + ((n - v.from) % 10 === 0 ? 'col' : '') }, String(n)));
  return h('div', { class: 'h100 hintvis', 'aria-hidden': 'true' }, cells);
}
export function hintVisual(q) {
  const v = q.vis;
  if (!v) return null;
  if (v.kind === 'frame') return tenFrames(v);
  if (v.kind === 'line') return numberLine(v);
  if (v.kind === 'hundreds') return hundredsChart(v);
  return null;
}
