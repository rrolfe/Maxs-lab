// The ballpark picture for Max's Ballpark: a view from behind home plate with the pitcher, the catcher, Max at bat and the fielders.
// All of the motion lives here (wind-up, pitch, bat swing with a swoosh, contact flash, the ball's flight, the catch). Rules live in engine.js.
// Figures are drawn so that every moving part is its own group that rotates about its own (0 0) corner: it keeps working when the group sits inside a translate().
import { reduceMotion } from '../core/dom.js';
import { SWEET, ZONE } from './engine.js';

const NS = 'http://www.w3.org/2000/svg';
const INK = '#10303B';
export const CONTACT_MS = 125;                 // how long after the tap the bat meets the ball
const PLATE = [240, 338], ZC = [240, 296], REL = [247, 214], ZX = 84, ZY = 76;
const BASES = [[388, 268], [240, 176], [92, 268]];
const FIELDERS = { lf: [78, 152], cf: [240, 148], rf: [402, 152], ss: [172, 202], b2: [306, 202], b1: [392, 254], b3: [88, 254] };
const OPP_COLORS = { dinos: ['#3FA66B', '#2C7A4D'], rockets: ['#7A5CD6', '#4E3A9E'], pirates: ['#2F2F44', '#C0392B'] };
const rnd = (() => { let a = 12345; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })();
const lerp = (a, b, t) => a + (b - a) * t;

function crowdDots() {
  const cols = ['#FFD166', '#EF476F', '#fff', '#8ECAE6', '#F4A261', '#9BE564', '#C77DFF'];
  let out = '';
  for (let row = 0; row < 7; row++) for (let x = 4 + (row % 2) * 4; x < 480; x += 8.5) {
    const y = 66 + row * 7.6 + (rnd() - 0.5) * 1.5;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2.3 + rnd() * 0.5).toFixed(1)}" fill="${cols[Math.floor(rnd() * cols.length)]}"/>`;
  }
  return out;
}
const stripes = () => Array.from({ length: 10 }, (_, i) => `<rect x="0" y="${132 + i * 27}" width="480" height="27" fill="${i % 2 ? '#62C26E' : '#58B864'}"/>`).join('');
// a small fielder: cap + jersey in the opponent's colours, with a glove
const fielder = (pos, [x, y]) => {
  const s = 0.5 + ((y - 140) / 260) * 0.7;
  return `<g class="fld" data-pos="${pos}" transform="translate(${x} ${y}) scale(${s.toFixed(2)})"><g class="fi">
    <ellipse cx="0" cy="26" rx="13" ry="4" fill="#000" opacity=".16"/>
    <path d="M-5 14 L-7 25 M5 14 L7 25" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M-9 26h6M3 26h6" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="-10" y="-8" width="20" height="24" rx="7" style="fill:var(--opp)" stroke="${INK}" stroke-width="2.2"/>
    <circle cx="0" cy="-17" r="9" fill="#F2C9A0" stroke="${INK}" stroke-width="2.2"/>
    <path d="M-9.5 -19 a9.5 9.5 0 0 1 19 0 z" style="fill:var(--opp2)" stroke="${INK}" stroke-width="2"/><path d="M4 -19 h10" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    <circle class="glove" cx="-13" cy="4" r="6" fill="#8B5A2B" stroke="${INK}" stroke-width="2"/></g></g>`;
};

const SVG = () => `<svg viewBox="0 0 480 400" xmlns="${NS}">
  <defs>
    <linearGradient id="bbsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7EC8F5"/><stop offset="1" stop-color="#D8F0FF"/></linearGradient>
    <linearGradient id="bbstand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A4A86"/><stop offset="1" stop-color="#27305E"/></linearGradient>
    <radialGradient id="bbsw" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="86"><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".92"/></radialGradient>
    <radialGradient id="bbglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFD166" stop-opacity=".05"/><stop offset="1" stop-color="#FFD166" stop-opacity=".55"/></radialGradient>
  </defs>
  <g class="cam">
    <rect width="480" height="400" fill="url(#bbsky)"/>
    <g opacity=".85"><ellipse cx="90" cy="26" rx="34" ry="9" fill="#fff"/><ellipse cx="118" cy="20" rx="22" ry="8" fill="#fff"/><ellipse cx="360" cy="34" rx="40" ry="9" fill="#fff"/></g>
    <g class="towers"><rect x="38" y="10" width="7" height="60" fill="#5B6B8C"/><rect x="26" y="4" width="32" height="20" rx="3" fill="#EEF3FF" stroke="${INK}" stroke-width="2"/><g stroke="${INK}" stroke-width="1.2"><path d="M26 11h32M26 17h32M34 4v20M42 4v20M50 4v20" fill="none"/></g>
      <rect x="435" y="10" width="7" height="60" fill="#5B6B8C"/><rect x="422" y="4" width="32" height="20" rx="3" fill="#EEF3FF" stroke="${INK}" stroke-width="2"/><g stroke="${INK}" stroke-width="1.2"><path d="M422 11h32M422 17h32M430 4v20M438 4v20M446 4v20" fill="none"/></g></g>
    <rect y="58" width="480" height="62" fill="url(#bbstand)"/>
    <g class="crowd">${crowdDots()}</g>
    <rect y="118" width="480" height="16" fill="#1F6F4A"/><rect y="118" width="480" height="4" fill="#FFD166"/>
    <g fill="#fff" opacity=".9"><rect x="22" y="125" width="52" height="7" rx="1.5"/><rect x="108" y="125" width="52" height="7" rx="1.5" fill="#EF476F"/><rect x="196" y="125" width="88" height="7" rx="1.5" fill="#FFD166"/><rect x="320" y="125" width="52" height="7" rx="1.5" fill="#8ECAE6"/><rect x="406" y="125" width="52" height="7" rx="1.5"/></g>
    <rect y="132" width="480" height="3" fill="${INK}" opacity=".35"/>
    ${stripes()}
    <path d="M240 372 L430 270 L240 150 L50 270 Z" fill="#D9A56B" stroke="#C48E55" stroke-width="2"/>
    <path d="M240 336 L372 270 L240 192 L108 270 Z" fill="#63C26F"/>
    <path d="M240 338 L480 224 M240 338 L0 224" stroke="#fff" stroke-width="3" opacity=".9"/>
    <path d="M240 338 L388 268 L240 176 L92 268 Z" fill="none" stroke="#fff" stroke-width="2" opacity=".55"/>
    <ellipse cx="240" cy="338" rx="64" ry="26" fill="#C98E52"/><ellipse cx="240" cy="238" rx="30" ry="10" fill="#C98E52"/><rect x="233" y="236" width="14" height="3" rx="1.5" fill="#fff"/>
    <g class="bases" fill="#fff" stroke="${INK}" stroke-width="2.2">
      <path class="base b1" d="M388 262 l12 6 l-12 6 l-12 -6z"/><path class="base b2" d="M240 171 l10 5 l-10 5 l-10 -5z"/><path class="base b3" d="M92 262 l12 6 l-12 6 l-12 -6z"/></g>
    <path d="M227 334h26l3 7-16 9-16-9z" fill="#fff" stroke="${INK}" stroke-width="2.4"/>
    <g class="fielders">${Object.entries(FIELDERS).map(([k, v]) => fielder(k, v)).join('')}</g>
    <g class="runners"></g>
    <g class="pitcher"><g transform="translate(240 244)">
      <ellipse cx="0" cy="2" rx="16" ry="5" fill="#000" opacity=".18"/>
      <g class="pleg"><path d="M-4 -12 L-6 0 M4 -12 L5 0" stroke="#fff" stroke-width="6" stroke-linecap="round"/><path d="M-9 1h7M2 1h7" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g>
      <g class="pbody"><rect x="-11" y="-36" width="22" height="26" rx="8" style="fill:var(--opp)" stroke="${INK}" stroke-width="2.4"/>
        <circle cx="0" cy="-45" r="9.5" fill="#F2C9A0" stroke="${INK}" stroke-width="2.4"/><path d="M-10 -47 a10 10 0 0 1 20 0z" style="fill:var(--opp2)" stroke="${INK}" stroke-width="2.2"/><path d="M-9 -47 h-5" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
        <g transform="translate(9 -30)"><g class="parm"><path d="M0 0 L2 18" stroke="#F2C9A0" stroke-width="6" stroke-linecap="round"/><circle cx="2" cy="19" r="4.5" fill="#8B5A2B" stroke="${INK}" stroke-width="1.6"/></g></g>
        <path d="M-9 -29 L-17 -16" stroke="#F2C9A0" stroke-width="6" stroke-linecap="round"/><circle cx="-18" cy="-14" r="5.5" fill="#8B5A2B" stroke="${INK}" stroke-width="1.8"/></g>
    </g></g>
    <g class="zonebox"><rect x="${ZC[0] - ZX * ZONE}" y="${ZC[1] - ZY * ZONE}" width="${ZX * ZONE * 2}" height="${ZY * ZONE * 2}" rx="6" fill="#fff" fill-opacity=".07" stroke="#fff" stroke-width="2.6" stroke-dasharray="7 5" opacity=".7"/></g>
    <g class="catcher">
      <path d="M205 400 v-18 q0 -14 14 -14 h42 q14 0 14 14 v18z" fill="#2F3B52" stroke="${INK}" stroke-width="2.6"/><path d="M222 372 h36" stroke="#fff" stroke-width="3" opacity=".5"/>
      <circle cx="240" cy="356" r="17" fill="#3B4A66" stroke="${INK}" stroke-width="2.8"/><path d="M226 354 h28 M226 361 h28 M233 349 v17 M247 349 v17" stroke="#C9D3E8" stroke-width="1.8" opacity=".9"/>
      <g class="mittg" transform="translate(${ZC[0]} ${ZC[1]})"><g class="mitt"><circle r="17" fill="#B9773A" stroke="${INK}" stroke-width="2.8"/><path d="M-9 -4 q9 8 18 0" stroke="#7A4A1E" stroke-width="2.2" fill="none"/><circle r="7" fill="#D69A5A" opacity=".7"/></g></g>
    </g>
    <g class="batter">
      <g transform="translate(162 318)"><g class="stride"><path d="M-8 0 L-24 50 M10 0 L24 50" stroke="#fff" stroke-width="12" stroke-linecap="round"/><path d="M-8 0 L-24 50 M10 0 L24 50" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" opacity=".25"/><path d="M-33 53h18M16 53h20" stroke="${INK}" stroke-width="7.5" stroke-linecap="round"/></g>
        <g class="torso"><rect x="-19" y="-60" width="38" height="62" rx="13" fill="#2F7BE0" stroke="${INK}" stroke-width="3"/><rect x="-19" y="-6" width="38" height="8" fill="#fff" opacity=".85"/>
          <text x="-1" y="-24" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="22" fill="#fff" stroke="${INK}" stroke-width=".8">7</text>
          <circle cx="4" cy="-82" r="15" fill="#F2C9A0" stroke="${INK}" stroke-width="3"/><path d="M-12 -86 a16 16 0 0 1 32 0 q0 4 -4 3 h-26 q-3 0 -2 -3z" fill="#2F7BE0" stroke="${INK}" stroke-width="3"/><path d="M16 -83 h16" stroke="#2F7BE0" stroke-width="6" stroke-linecap="round"/><path d="M16 -83 h16" stroke="${INK}" stroke-width="1.5" stroke-linecap="round" opacity=".4"/>
          <circle cx="12" cy="-80" r="2" fill="${INK}"/><path d="M9 -73 q4 3 8 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M2 -52 L14 -38" stroke="#F2C9A0" stroke-width="9" stroke-linecap="round"/><path d="M2 -52 L14 -38" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" opacity=".22"/>
          <g transform="translate(14 -38)"><g class="batrot"><path class="wedge" d="M0 0 L29.4 -80.8 A86 86 0 0 1 86 0 Z" fill="url(#bbsw)" opacity="0"/>
            <path d="M-9 -3.2 H62 Q84 -5.6 88 0 Q84 5.6 62 3.2 H-9 Z" fill="#C8873F" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><path d="M58 -3.8 H80" stroke="#E7B06B" stroke-width="2" opacity=".7"/><circle cx="-9" cy="0" r="3.6" fill="#8B5A2B" stroke="${INK}" stroke-width="2"/>
            <circle cx="2" cy="0" r="6.6" fill="#F2C9A0" stroke="${INK}" stroke-width="2.2"/></g></g>
        </g></g>
    </g>
    <g class="ring" opacity="0"><ellipse class="ringE" rx="27" ry="25" fill="url(#bbglow)" stroke="#FFD166" stroke-width="4.5"/></g>
    <g class="fx"></g>
    <g class="ballg" opacity="0"><ellipse class="bsh" rx="8" ry="3" fill="#000" opacity=".22"/><g class="ballb"><circle r="10" fill="#fff" stroke="${INK}" stroke-width="2.2"/><path d="M-6.5 -6 Q-2 0 -6.5 6 M6.5 -6 Q2 0 6.5 6" stroke="#C0392B" stroke-width="1.7" fill="none"/></g></g>
  </g>
</svg>`;

export function makeField(opp = 'dinos') {
  const wrap = document.createElement('div'); wrap.className = 'bbfield'; wrap.setAttribute('role', 'img');
  wrap.innerHTML = SVG() + '<div class="bbbanner" hidden></div>';
  const svg = wrap.firstElementChild, $ = (s) => svg.querySelector(s), $$ = (s) => [...svg.querySelectorAll(s)];
  const banner = wrap.querySelector('.bbbanner');
  const ballg = $('.ballg'), ballb = $('.ballb'), bsh = $('.bsh'), ring = $('.ring'), ringE = $('.ringE'), fx = $('.fx'), mittg = $('.mittg'), mitt = $('.mitt');
  const batrot = $('.batrot'), torso = $('.torso'), stride = $('.stride'), wedge = $('.wedge'), parm = $('.parm'), pbody = $('.pbody'), pleg = $('.pleg'), cam = $('.cam'), crowd = $('.crowd');
  const slow = reduceMotion();
  let raf = 0, timers = [], anims = [], cur = null, api = { wrap };
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
  const anim = (el, kf, opt) => { if (!el) return null; const a = el.animate(kf, { fill: 'forwards', ...opt }); anims.push(a); return a; };
  const ballAt = (x, y, r, shadowY) => {
    ballg.setAttribute('opacity', '1'); ballb.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(r / 10).toFixed(3)})`);
    if (shadowY == null) bsh.setAttribute('opacity', '0'); else { bsh.setAttribute('opacity', '.22'); bsh.setAttribute('cx', x.toFixed(1)); bsh.setAttribute('cy', shadowY.toFixed(1)); bsh.setAttribute('rx', (r * 0.9).toFixed(1)); bsh.setAttribute('ry', (r * 0.32).toFixed(1)); }
  };
  const hideBall = () => ballg.setAttribute('opacity', '0');

  api.setOpp = (o) => { const [a, b] = OPP_COLORS[o] || OPP_COLORS.dinos; svg.style.setProperty('--opp', a); svg.style.setProperty('--opp2', b); };
  api.setOpp(opp);
  api.setBases = (bases) => {
    $$('.base').forEach((b, i) => b.setAttribute('fill', bases[i] ? '#FFD166' : '#fff'));
    $('.runners').innerHTML = bases.map((on, i) => !on ? '' : `<g transform="translate(${BASES[i][0]} ${BASES[i][1] - 2}) scale(.8)"><ellipse cx="0" cy="22" rx="12" ry="4" fill="#000" opacity=".16"/><path d="M-4 12 L-6 22 M4 12 L6 22" stroke="#fff" stroke-width="5" stroke-linecap="round"/><rect x="-9" y="-9" width="18" height="23" rx="6" fill="#2F7BE0" stroke="${INK}" stroke-width="2.2"/><circle cx="0" cy="-17" r="8.5" fill="#F2C9A0" stroke="${INK}" stroke-width="2.2"/><path d="M-9 -19 a9 9 0 0 1 18 0z" fill="#2F7BE0" stroke="${INK}" stroke-width="2"/><path d="M3 -19 h9" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/></g>`).join('');
  };
  api.stop = () => { cancelAnimationFrame(raf); raf = 0; timers.forEach(clearTimeout); timers = []; anims.forEach((a) => { try { a.cancel(); } catch { /* already gone */ } }); anims = []; cur = null; };
  api.reset = () => {
    api.stop(); hideBall(); ring.setAttribute('opacity', '0'); banner.hidden = true; fx.replaceChildren();
    for (const el of [batrot, torso, stride, wedge, parm, pbody, pleg, mitt, cam, crowd, ...$$('.fi')]) { el.style.transform = ''; if (el === wedge) el.setAttribute('opacity', '0'); }
    batrot.style.transform = 'rotate(-130deg)'; torso.style.transform = 'rotate(-4deg)'; parm.style.transform = 'rotate(30deg)';
    mittg.setAttribute('transform', `translate(${ZC[0]} ${ZC[1]})`);
  };
  api.banner = (txt, cls = '', ms = 1500) => { banner.textContent = txt; banner.className = 'bbbanner ' + cls; banner.hidden = false; later(() => { banner.hidden = true; }, ms); };
  api.shake = (px = 4) => { if (slow) return; anim(cam, [{ transform: 'translate(0,0)' }, { transform: `translate(${-px}px,${px / 2}px)` }, { transform: `translate(${px}px,${-px / 2}px)` }, { transform: `translate(${-px / 2}px,0)` }, { transform: 'translate(0,0)' }], { duration: 260 }); };
  const burst = (x, y, text) => {
    const g = document.createElementNS(NS, 'g'); g.setAttribute('transform', `translate(${x} ${y})`);
    g.innerHTML = `<g class="bst"><polygon points="${Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 16 : 34; return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }).join(' ')}" fill="#FFD166" stroke="#fff" stroke-width="3"/><circle r="9" fill="#fff"/>${text ? `<text y="-40" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="20" fill="#fff" stroke="${INK}" stroke-width="4" paint-order="stroke">${text}</text>` : ''}</g>`;
    fx.append(g);
    const b = g.firstElementChild; b.style.transformBox = 'fill-box'; b.style.transformOrigin = 'center';
    anim(b, [{ transform: 'scale(.2)', opacity: 1 }, { transform: 'scale(1.15)', opacity: 1, offset: .35 }, { transform: 'scale(1.5)', opacity: 0 }], { duration: slow ? 200 : 520 });
    later(() => g.remove(), 600);
  };
  const fireworks = (n = 4) => {
    const cols = ['#FFD166', '#EF476F', '#8ECAE6', '#9BE564', '#C77DFF', '#fff'];
    for (let k = 0; k < n; k++) later(() => {
      const cx = 70 + Math.random() * 340, cy = 26 + Math.random() * 48, col = cols[Math.floor(Math.random() * cols.length)];
      for (let i = 0; i < 12; i++) {
        const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', 2.6); c.setAttribute('fill', col); fx.append(c);
        const a = (i / 12) * Math.PI * 2, d = 26 + Math.random() * 14;
        anim(c, [{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d + 8}px)`, opacity: 0 }], { duration: 900, easing: 'ease-out' });
        later(() => c.remove(), 950);
      }
    }, k * 260);
  };
  api.cheer = (big) => {
    if (!slow) anim(crowd, [{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-5px)' }, { transform: 'translateY(0)' }], { duration: big ? 1500 : 800 });
    if (big && !slow) fireworks(4);
  };

  // ---------- the pitch ----------
  const pitchPos = (p, tau) => {
    const u = Math.pow(Math.max(0, tau), 1.45), end = [ZC[0] + p.x * ZX, ZC[1] + p.y * ZY];
    const off = p.kind === 'curve' ? p.bend * 40 * Math.sin(Math.PI * u) : 0;
    return [lerp(REL[0], end[0], u) + off, lerp(REL[1], end[1], u) + (p.kind === 'change' ? -6 * Math.sin(Math.PI * u) : 0), 3.2 + 10.5 * u];
  };
  api.tau = () => (cur && cur.flying ? (performance.now() - cur.t0) / cur.p.ms : null);
  api.ballNow = () => { const tau = api.tau(); return tau == null ? null : pitchPos(cur.p, Math.min(tau, 1)); };
  /** Start a pitch: wind-up, release (onRelease), flight, and onPlate when it reaches the catcher's mitt (unless a hit took over). */
  api.pitch = (p, { onRelease, onPlate }) => {
    api.reset(); cur = { p, flying: false, t0: 0, plated: false };
    const end = [ZC[0] + p.x * ZX, ZC[1] + p.y * ZY];
    mittg.setAttribute('transform', `translate(${end[0].toFixed(1)} ${end[1].toFixed(1)})`);
    batrot.style.transform = 'rotate(-130deg)';
    const wind = slow ? 200 : 700;
    anim(parm, [{ transform: 'rotate(30deg)' }, { transform: 'rotate(-165deg)', offset: .55 }, { transform: 'rotate(-165deg)', offset: .62 }, { transform: 'rotate(25deg)' }], { duration: wind, easing: 'ease-in-out' });
    anim(pbody, [{ transform: 'translate(0,0) rotate(0deg)' }, { transform: 'translate(-2px,-3px) rotate(-6deg)', offset: .5 }, { transform: 'translate(3px,2px) rotate(8deg)' }], { duration: wind, easing: 'ease-in-out' });
    anim(pleg, [{ transform: 'translateY(0)' }, { transform: 'translateY(-4px)', offset: .45 }, { transform: 'translateY(0)' }], { duration: wind });
    // the batter wiggles his bat while he waits
    anim(batrot, [{ transform: 'rotate(-130deg)' }, { transform: 'rotate(-136deg)', offset: .4 }, { transform: 'rotate(-128deg)', offset: .7 }, { transform: 'rotate(-130deg)' }], { duration: wind });
    later(() => {
      cur.flying = true; cur.t0 = performance.now();
      ring.setAttribute('opacity', '1'); ringE.setAttribute('rx', 27); ringE.setAttribute('ry', 25); ringE.setAttribute('stroke', '#FFD166');
      const [rx, ry] = pitchPos(p, SWEET); ringE.setAttribute('cx', rx.toFixed(1)); ringE.setAttribute('cy', ry.toFixed(1));
      onRelease?.();
      const step = () => {
        if (!cur || !cur.flying) return;
        const tau = (performance.now() - cur.t0) / p.ms, [x, y, r] = pitchPos(p, Math.min(tau, 1));
        ballAt(x, y, r);
        if (tau >= 1 && !cur.plated) { cur.plated = true; cur.flying = false; ring.setAttribute('opacity', '0'); onPlate?.(); return; }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, wind * 0.62);
  };
  /** The ball lands in the catcher's mitt: a pop and a puff of dust. */
  api.pop = (strong = true) => {
    const [x, y] = cur ? pitchPos(cur.p, 1) : ZC;
    anim(mitt, [{ transform: 'scale(1)' }, { transform: 'scale(1.28)', offset: .3 }, { transform: 'scale(1)' }], { duration: 260 });
    if (strong) burst(x, y, '');
    later(hideBall, 420);
  };
  /** Max swings: the whole body turns, the bat sweeps through with a swoosh, then follows through. */
  api.swing = () => {
    const d = slow ? 200 : 440;
    anim(batrot, [{ transform: 'rotate(-130deg)', easing: 'ease-in' }, { transform: 'rotate(-6deg)', offset: .28, easing: 'linear' }, { transform: 'rotate(66deg)', offset: .55, easing: 'ease-out' }, { transform: 'rotate(125deg)' }], { duration: d });
    anim(torso, [{ transform: 'rotate(-4deg)', easing: 'ease-in' }, { transform: 'rotate(15deg)', offset: .3, easing: 'ease-out' }, { transform: 'rotate(24deg)' }], { duration: d });
    anim(stride, [{ transform: 'translateX(0)' }, { transform: 'translateX(9px)', offset: .25 }, { transform: 'translateX(11px)' }], { duration: d });
    anim(wedge, [{ opacity: 0 }, { opacity: 0, offset: .06 }, { opacity: 1, offset: .2 }, { opacity: .9, offset: .4 }, { opacity: 0, offset: .7 }, { opacity: 0 }], { duration: d });
  };

  // ---------- after contact ----------
  const flyBall = (from, to, { dur, arc = 0, r1 = 5, shadow = true, onEnd, ease = 'out' }) => {
    const t0 = performance.now(), r0 = from[2] || 11;
    const go = () => {
      const u = Math.min(1, (performance.now() - t0) / dur), e = ease === 'out' ? 1 - (1 - u) * (1 - u) : u;
      const gx = lerp(from[0], to[0], e), gy = lerp(from[1], to[1], e), y = gy - Math.sin(u * Math.PI) * arc;
      ballAt(gx, y, lerp(r0, r1, e), shadow ? gy + 4 : null);
      if (u < 1) raf = requestAnimationFrame(go); else onEnd?.();
    };
    raf = requestAnimationFrame(go);
  };
  const chase = (pos, to, frac = 0.7, ms = 650) => {
    const el = $(`.fld[data-pos="${pos}"] .fi`), f = FIELDERS[pos]; if (!el) return;
    const s = 0.5 + ((f[1] - 140) / 260) * 0.7; anim(el, [{ transform: 'translate(0,0)' }, { transform: `translate(${((to[0] - f[0]) * frac) / s}px,${((to[1] - f[1]) * frac) / s}px)` }], { duration: ms, easing: 'ease-out' });
  };
  const nearest = (to, only) => Object.entries(FIELDERS).filter(([k]) => !only || only.includes(k)).sort((a, b) => Math.hypot(a[1][0] - to[0], a[1][1] - to[1]) - Math.hypot(b[1][0] - to[0], b[1][1] - to[1]))[0][0];
  const glove = (pos) => { const g = $(`.fld[data-pos="${pos}"] .glove`); if (g) { g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; anim(g, [{ transform: 'scale(1)' }, { transform: 'scale(1.9)', offset: .3 }, { transform: 'scale(1)' }], { duration: 380 }); } };
  /** The ball flies off the bat. o = the engine result; done() when it has landed or been caught. */
  api.hit = (o, done) => {
    const from = api.ballNow() || [ZC[0], ZC[1], 11]; if (cur) { cur.flying = false; } ring.setAttribute('opacity', '0');
    const perfect = o.timing === 'perfect', k = o.kind, side = Math.random() < 0.5 ? -1 : 1;
    burst(from[0], from[1], perfect ? 'PERFECT!' : ''); api.shake(k === 'homer' ? 7 : 4);
    const after = (fn, ms = 320) => later(fn, ms);
    if (k === 'homer') { const to = [150 + Math.random() * 180, 78]; flyBall(from, to, { dur: slow ? 600 : 1500, arc: 90, r1: 3, shadow: false, ease: 'out', onEnd: () => { hideBall(); api.cheer(true); after(done, 1100); } }); }
    else if (k === 'triple' || k === 'double') {
      const to = k === 'triple' ? [side > 0 ? 440 : 40, 156] : [side > 0 ? 345 : 135, 158], pos = nearest(to, ['lf', 'cf', 'rf']);
      chase(pos, to, 0.85, 900); flyBall(from, to, { dur: slow ? 500 : 1000, arc: 54, r1: 5, onEnd: () => { api.cheer(false); after(() => { hideBall(); done(); }, 500); } });
    } else if (k === 'single') {
      const to = [190 + Math.random() * 120, 220], pos = nearest(to, ['ss', 'b2', 'cf']);
      chase(pos, to, 0.6, 600); flyBall(from, to, { dur: slow ? 400 : 750, arc: 24, r1: 6, onEnd: () => { api.cheer(false); after(() => { hideBall(); done(); }, 420); } });
    } else if (k === 'foul') {
      const to = [side > 0 ? 492 : -12, 296]; 
      flyBall(from, to, { dur: slow ? 400 : 750, arc: 60, r1: 6, shadow: false, onEnd: () => { hideBall(); done(); } });
    } else if (k === 'groundout') {
      const pos = ['ss', 'b2', 'b3', 'b1'][Math.floor(Math.random() * 4)], to = FIELDERS[pos].map((v, i) => (i ? v + 8 : v));
      chase(pos, to, 0.3, 500); flyBall(from, to, { dur: slow ? 400 : 750, arc: 6, r1: 7, onEnd: () => { glove(pos); flyBall([to[0], to[1], 7], [BASES[0][0] - 6, BASES[0][1] - 18], { dur: 380, arc: 8, r1: 7, shadow: false, ease: 'in', onEnd: () => { glove('b1'); after(() => { hideBall(); done(); }, 400); } }); } });
    } else {     // fly out / sacrifice fly: a high ball caught by an outfielder
      const pos = ['lf', 'cf', 'rf'][Math.floor(Math.random() * 3)], to = [FIELDERS[pos][0] + (Math.random() - 0.5) * 20, FIELDERS[pos][1] - 6];
      chase(pos, to, 0.4, 1100); flyBall(from, to, { dur: slow ? 600 : 1500, arc: 105, r1: 5, onEnd: () => { glove(pos); after(() => { hideBall(); done(); }, 450); } });
    }
  };
  api.celebrate = (big) => api.cheer(big);

  // ---------- defense: a fly ball the other team hit; tap when the ring closes on the spot where it lands ----------
  api.fly = (ms, onEnd) => {
    api.reset();
    const pos = ['lf', 'cf', 'rf'][Math.floor(Math.random() * 3)], f = FIELDERS[pos], L = [f[0] + (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 30), f[1] + 16];
    const from = [ZC[0], ZC[1] + 20, 11], t0 = performance.now(); let done = false;
    cur = { fly: true, t0, ms };
    ring.setAttribute('opacity', '1'); ringE.setAttribute('cx', L[0]); ringE.setAttribute('cy', L[1]); ringE.setAttribute('rx', 60); ringE.setAttribute('ry', 22);
    chase(pos, L, 0.95, ms * 0.85);
    const fin = (ok) => {
      if (done) return; done = true; cancelAnimationFrame(raf); ring.setAttribute('opacity', '0');
      if (ok) { ballAt(L[0], L[1] - 10, 6, L[1]); glove(pos); burst(L[0], L[1] - 12, ''); api.banner('✋', 'catch', 900); later(() => { hideBall(); onEnd(true); }, 900); }
      else { flyBall([L[0], L[1] - 10, 6], [L[0] + 22, L[1] + 8], { dur: 400, arc: 10, r1: 5, onEnd: () => later(() => { hideBall(); onEnd(false); }, 500) }); }
    };
    const step = () => {
      if (done) return;
      const u = (performance.now() - t0) / ms;
      if (u >= 1.12) { fin(false); return; }
      const uu = Math.min(1, u), x = lerp(from[0], L[0], uu), gy = lerp(from[1], L[1], uu);
      ballAt(x, gy - Math.sin(uu * Math.PI) * 130, lerp(11, 6, uu), gy + 2);
      const k = 1 + 1.6 * Math.max(0, 1 - u); ringE.setAttribute('rx', (27 * k).toFixed(1)); ringE.setAttribute('ry', (10 * k).toFixed(1));
      ringE.setAttribute('stroke', u >= 0.82 && u <= 1.1 ? '#6EE7A0' : '#FFD166');
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return { tau: () => (performance.now() - t0) / ms, finish: fin };
  };
  api.reset();
  return api;
}
