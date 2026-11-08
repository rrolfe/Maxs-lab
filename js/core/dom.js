// Tiny DOM helpers: no framework, no build step.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** h('div', {class:'x', onclick:fn, data:{a:1}}, 'text', childEl, [more]) */
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs && typeof attrs === 'object' && !(attrs instanceof Node) && !Array.isArray(attrs)) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') { for (const [sk, sv] of Object.entries(v)) { if (sk.startsWith('--')) el.style.setProperty(sk, sv); else el.style[sk] = sv; } }
      else if (k === 'data') for (const [dk, dv] of Object.entries(v)) el.dataset[dk] = dv;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  } else if (attrs != null) kids.unshift(attrs);
  append(el, kids);
  return el;
}
function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
}
export function svgEl(markup) {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild;
}
export const clear = (el) => { el.replaceChildren(); return el; };

/** Seeded PRNG (mulberry32) so daily puzzles match across devices. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const hashStr = (s) => { let x = 2166136261; for (const c of String(s)) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); } return x >>> 0; };
export function shuffle(arr, r = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];
export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Strip accents so Spanish words compare/fold into A-Z (keeps Ñ as its own letter). */
export function fold(s) {
  return String(s).toUpperCase().replace(/Ñ/g, '\u0001').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\u0001/g, 'Ñ');
}

export function money(n, lang = 'en') {
  const v = Math.round(n * 100) / 100;
  const [whole, cents] = Math.abs(v).toFixed(2).split('.');
  return (v < 0 ? '-' : '') + '$' + whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + cents;   // $25,600.00 (same in Spanish: the lab keeps one money style)
}

/** Confetti: canvas, under one second, ~40 particles, skipped for reduced motion. */
export function confetti(x, y, colors = ['#FF8A5B', '#FFD166', '#0B6B78', '#6D4AC9', '#0F7B5F']) {
  if (reduceMotion()) return;
  const c = h('canvas', { class: 'confetti', 'aria-hidden': 'true' });
  c.width = innerWidth; c.height = innerHeight;
  document.body.append(c);
  const g = c.getContext('2d');
  const ps = Array.from({ length: 40 }, () => ({
    x: x ?? innerWidth / 2, y: y ?? innerHeight / 3,
    vx: (Math.random() - 0.5) * 11, vy: -Math.random() * 11 - 3,
    s: 6 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
    col: colors[(Math.random() * colors.length) | 0],
  }));
  const t0 = performance.now();
  (function frame(t) {
    const k = (t - t0) / 900;
    g.clearRect(0, 0, c.width, c.height);
    for (const p of ps) {
      p.vy += 0.45; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - k);
      g.fillStyle = p.col; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore();
    }
    if (k < 1) requestAnimationFrame(frame); else c.remove();
  })(t0);
}

/** Fly a "+N" bubble from an element to the pearl counter. */
export function flyPoints(fromEl, n, toSel = '#pearl-count') {
  const to = document.querySelector(toSel);
  if (!fromEl || !to) return;
  const a = fromEl.getBoundingClientRect(), b = to.getBoundingClientRect();
  const el = h('div', { class: 'fly', 'aria-hidden': 'true' }, '+' + n);
  el.style.left = a.left + a.width / 2 + 'px'; el.style.top = a.top + a.height / 2 + 'px';
  document.body.append(el);
  if (reduceMotion()) { setTimeout(() => el.remove(), 500); return; }
  requestAnimationFrame(() => {
    el.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(.6)`;
    el.style.opacity = '0.2';
  });
  setTimeout(() => el.remove(), 700);
}

/** A small, calm "-N" that drifts up from an element (no red flash). */
export function flyLoss(fromEl, n) {
  if (!fromEl) return;
  const a = fromEl.getBoundingClientRect();
  const el = h('div', { class: 'fly loss', 'aria-hidden': 'true' }, '−' + n);
  el.style.left = a.left + a.width / 2 + 'px'; el.style.top = a.top + 'px';
  document.body.append(el);
  if (reduceMotion()) { setTimeout(() => el.remove(), 700); return; }
  requestAnimationFrame(() => { el.style.transform = 'translateY(-46px)'; el.style.opacity = '0'; });
  setTimeout(() => el.remove(), 900);
}

let toastTimer;
export function toast(msg, ms = 2600) {
  let t = document.getElementById('toast');
  if (!t) { t = h('div', { id: 'toast', role: 'status', 'aria-live': 'polite' }); document.body.append(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}
