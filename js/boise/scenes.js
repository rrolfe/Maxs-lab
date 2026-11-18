// Learning about Boise: little illustrated scenes (original art, drawn here as SVG; nothing is downloaded).
// scene(id, cat) -> SVG text for a 320 x 200 picture. banner() is the wide animated skyline for the Home screen.
// Things that move carry a class (bz-cloud, bz-wave, bz-bob, bz-flap, bz-spin, bz-fall, bz-glow, bz-rise); css/boise.css animates them and switches it all off for people who asked for less motion.
const OL = 'stroke="#2B3A4A" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
const NO = 'stroke="none"';

// ---------------------------------------------------------------- tiny drawing helpers
const rect = (x, y, w, h, fill, rx = 0, o = OL) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${o}/>`;
const circ = (x, y, r, fill, o = OL) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${o}/>`;
const ell = (x, y, rx, ry, fill, o = OL) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${o}/>`;
const path = (d, fill, o = OL) => `<path d="${d}" fill="${fill}" ${o}/>`;
const line = (d, col = '#2B3A4A', w = 2) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const g = (inner, attrs = '') => `<g ${attrs}>${inner}</g>`;
const at = (x, y, s, inner, cls = '') => `<g ${cls ? `class="${cls}"` : ''}><g transform="translate(${x} ${y}) scale(${s})">${inner}</g></g>`;

/** a smooth hill line through points, filled down to the bottom of the picture */
function ridge(fill, pts, o = OL) {
  let d = `M${pts[0][0]},200 L${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    d += i === 0 ? ` Q${x0},${y0} ${mx},${my}` : ` Q${x0},${y0} ${mx},${my}`;
    if (i === pts.length - 2) d += ` T${x1},${y1}`;
  }
  d += ` L${pts[pts.length - 1][0]},200 Z`;
  return path(d, fill, o);
}
const sky = (a, b, id, w = 320) => `<defs><linearGradient id="sk${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="${w}" height="200" fill="url(#sk${id})"/>`;
const DAY = (id = 'd') => sky('#7CC8FF', '#E2F5FF', id);
const DUSK = (id = 'u') => sky('#FF9E7A', '#FFE3A6', id);
const NIGHT = (id = 'n') => sky('#17224F', '#5A4B8A', id);
const sun = (x, y, r = 15, col = '#FFD84D') => g(`<g class="bz-spin" style="transform-origin:${x}px ${y}px">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M${x},${y - r - 7} L${x},${y - r - 15}" stroke="${col}" stroke-width="4" stroke-linecap="round" transform="rotate(${a} ${x} ${y})"/>`).join('')}</g>${circ(x, y, r, col)}`);
const moon = (x, y) => circ(x, y, 13, '#FFF3C2') + circ(x + 6, y - 3, 11, '#17224F', NO);
const cloud = (x, y, s = 1, cls = 'bz-cloud') => at(x, y, s, `${ell(0, 0, 20, 9, '#fff', NO)}${ell(-12, 3, 12, 7, '#fff', NO)}${ell(13, 3, 13, 7, '#fff', NO)}${ell(2, -6, 11, 8, '#fff', NO)}`, cls);
const stars = (n = 14) => Array.from({ length: n }, (_, i) => `<circle class="bz-twinkle" style="animation-delay:${(i % 5) * 0.4}s" cx="${(i * 47 + 13) % 310 + 5}" cy="${(i * 29 + 7) % 90 + 6}" r="${i % 3 ? 1.4 : 2}" fill="#FFF8D6"/>`).join('');
const tree = (x, y, s = 1, col = '#5FA05A') => at(x, y, s, `${rect(-3, -4, 6, 16, '#8A5A3A', 1)}${circ(0, -14, 13, col)}${circ(-8, -8, 8, col, NO)}${circ(8, -8, 8, col, NO)}${circ(0, -14, 13, 'none')}`);
const pine = (x, y, s = 1, col = '#2F7A55') => at(x, y, s, `${rect(-2.5, 0, 5, 9, '#7A4E2E', 1)}${path('M0,-30 L12,-8 L-12,-8 Z', col)}${path('M0,-20 L15,4 L-15,4 Z', col)}`);
const bare = (x, y, s = 1) => at(x, y, s, `${line('M0,10 L0,-8 M0,-2 L-8,-12 M0,-6 L8,-15 M-8,-12 L-12,-14', '#6B4A33', 3)}`);
const river = (y, h = 36, col = '#4DA6D9') => path(`M-5,${y} Q60,${y - 7} 120,${y} T240,${y} T330,${y - 2} L330,${y + h} L-5,${y + h} Z`, col) +
  g(`<g class="bz-wave">${line(`M20,${y + 10} q10,-5 20,0 t20,0`, '#BDE8FF', 2.5)}${line(`M150,${y + 20} q10,-5 20,0 t20,0`, '#BDE8FF', 2.5)}</g><g class="bz-wave b">${line(`M90,${y + 24} q10,-5 20,0 t20,0`, '#BDE8FF', 2.5)}${line(`M230,${y + 12} q10,-5 20,0 t20,0`, '#BDE8FF', 2.5)}</g>`);
const grass = (y, col = '#7DBB67') => rect(-5, y, 330, 205 - y, col, 0, `stroke="#2B3A4A" stroke-width="2"`);
const bird = (x, y, s = 1, col = '#2B3A4A') => at(x, y, s, `<g class="bz-flap">${line('M-9,0 Q-5,-6 0,0 Q5,-6 9,0', col, 2.4)}</g>`, 'bz-fly');
const duck = (x, y, s = 1) => at(x, y, s, `${ell(0, 0, 9, 6, '#B08A55')}${circ(7, -6, 5, '#2E8B57')}${path('M11,-6 L16,-5 L11,-3 Z', '#FFB62E')}${circ(8.5, -7, 1, '#2B3A4A', NO)}`, 'bz-bob');
const heron = (x, y, s = 1) => at(x, y, s, `${line('M-2,0 L-2,22 M3,0 L3,22', '#7A6A4A', 2)}${ell(0, -4, 11, 8, '#9FB6C9')}${line('M8,-8 Q16,-22 6,-30', '#9FB6C9', 5)}${circ(6, -32, 4, '#CFDCE8')}${path('M9,-32 L22,-31 L9,-29 Z', '#FFC24A')}${line('M-10,-6 L-16,-2', '#9FB6C9', 4)}`);
const giraffe = (x, y, s = 1) => at(x, y, s, `${rect(-14, -6, 28, 18, '#FFC94B', 8)}${rect(-12, 10, 5, 22, '#FFC94B', 2)}${rect(7, 10, 5, 22, '#FFC94B', 2)}${path('M8,-4 L16,-4 L12,-44 L6,-44 Z', '#FFC94B')}${ell(11, -48, 9, 6, '#FFC94B')}${line('M8,-54 L8,-60 M14,-54 L14,-60', '#2B3A4A', 2)}${circ(-6, 0, 3, '#B9792A', NO)}${circ(3, 5, 3, '#B9792A', NO)}${circ(10, -18, 2.4, '#B9792A', NO)}${circ(9, -30, 2.4, '#B9792A', NO)}${circ(14, -48, 1.2, '#2B3A4A', NO)}`);
const sheep = (x, y, s = 1) => at(x, y, s, `${circ(0, 0, 9, '#fff')}${circ(-7, -2, 6, '#fff')}${circ(7, -2, 6, '#fff')}${ell(11, -3, 4, 4.5, '#3A3A3A')}${line('M-4,8 L-4,13 M4,8 L4,13', '#3A3A3A', 2)}`);
const fish = (x, y, s = 1, col = '#FF8A5B') => at(x, y, s, `<g class="bz-bob">${ell(0, 0, 11, 6, col)}${path('M-10,0 L-18,-6 L-18,6 Z', col)}${circ(5, -1, 1.3, '#2B3A4A', NO)}</g>`);
const wagon = (x, y, s = 1) => at(x, y, s, `${path('M-26,-4 Q-24,-30 0,-32 Q24,-30 26,-4 Z', '#FFF6E2')}${line('M-14,-26 L-14,-4 M0,-31 L0,-4 M14,-26 L14,-4', '#D8C7A0', 2)}${rect(-28, -4, 56, 9, '#9A6A3E', 2)}${circ(-16, 10, 10, '#C8935A')}${circ(-16, 10, 3, '#2B3A4A', NO)}${circ(16, 10, 10, '#C8935A')}${circ(16, 10, 3, '#2B3A4A', NO)}${line('M-16,0 L-16,20 M-24,10 L-8,10 M16,0 L16,20 M8,10 L24,10', '#7A4E2E', 1.6)}`);
const balloon = (x, y, s = 1, a = '#FF6B6B', b = '#FFD84D') => at(x, y, s, `${path('M0,-30 C-24,-30 -26,-2 -8,14 L8,14 C26,-2 24,-30 0,-30 Z', a)}${path('M0,-30 C-10,-26 -10,0 -3,14 L3,14 C10,0 10,-26 0,-30 Z', b)}${line('M-6,14 L-5,24 M6,14 L5,24', '#2B3A4A', 1.6)}${rect(-6, 24, 12, 8, '#A9743F', 1)}`, 'bz-rise');
const building = (x, y, w, h, fill, win = '#FFF3B0') => rect(x, y, w, h, fill, 2) + Array.from({ length: Math.max(1, Math.floor(h / 16) - 1) }, (_, r) => Array.from({ length: Math.max(1, Math.floor(w / 14)) }, (_, c) => rect(x + 5 + c * 14, y + 8 + r * 16, 7, 8, win, 1, NO)).join('')).join('');
const foothills = (col = '#D9B25E', back = '#B98F46') => ridge(back, [[-10, 118], [60, 90], [130, 108], [210, 82], [330, 106]]) + ridge(col, [[-10, 138], [50, 120], [120, 136], [200, 116], [330, 134]]);
const mtn = (x, y, w, h, fill, snow = true) => path(`M${x},${y} L${x + w / 2},${y - h} L${x + w},${y} Z`, fill) + (snow ? path(`M${x + w / 2},${y - h} L${x + w / 2 + w * 0.17},${y - h + h * 0.3} L${x + w / 2 + w * 0.05},${y - h + h * 0.24} L${x + w / 2 - w * 0.06},${y - h + h * 0.32} L${x + w / 2 - w * 0.17},${y - h + h * 0.3} Z`, '#fff', 'stroke="#2B3A4A" stroke-width="1.6" stroke-linejoin="round"') : '');
const bike = (x, y, s = 1) => at(x, y, s, `${circ(-9, 0, 7, 'none')}${circ(9, 0, 7, 'none')}${line('M-9,0 L-2,-10 L7,-10 L9,0 M-2,-10 L-5,-14 M7,-10 L6,-15', '#E05A47', 2.4)}${circ(2, -19, 4, '#FFC9A8')}${line('M2,-15 L-1,-10', '#3B6EA5', 3)}`, 'bz-bob');
const domeBuilding = (x, y, s = 1) => at(x, y, s, `${rect(-46, 10, 92, 38, '#E8D2A5', 1)}${rect(-38, -2, 76, 12, '#EFDDB6', 1)}${[-32, -20, -8, 8, 20, 32].map((c) => rect(c - 2.5, 10, 5, 38, '#F6EAC8', 1)).join('')}${path('M-18,-2 L-18,-16 Q0,-50 18,-16 L18,-2 Z', '#9FC4B1')}${path('M-12,-18 Q0,-44 12,-18 Z', '#F2C14E')}${line('M0,-44 L0,-56', '#2B3A4A', 2)}${path('M0,-56 L14,-52 L0,-48 Z', '#E8574A')}${rect(-12, 28, 24, 20, '#7A5236', 2)}`);

// ---------------------------------------------------------------- one scene per place
const SCENES = {
  greenbelt: () => DAY('g1') + cloud(60, 36) + cloud(230, 28, 0.8) + ridge('#9CC57A', [[-10, 112], [90, 100], [200, 108], [330, 98]]) + river(124, 28) + grass(150, '#86C46C') + path('M-5,176 Q120,150 330,166 L330,186 Q130,172 -5,198 Z', '#E8D9B8') + tree(40, 140, 1.3) + tree(270, 136, 1.2, '#4E9654') + tree(200, 142, 0.9) + bike(170, 168, 1.15) + duck(70, 140, 0.9) + bird(120, 60, 1) + heron(285, 120, 0.8),
  floatriver: () => DAY('g2') + sun(262, 36) + cloud(60, 34, 1) + ridge('#8DBB6D', [[-10, 90], [100, 80], [210, 90], [330, 76]]) + tree(36, 96, 1.1) + tree(290, 92, 1.1, '#4E9654') + path('M-5,98 L330,98 L330,200 L-5,200 Z', '#4DA6D9', NO) + river(104, 100) +
    [[70, 140, '#FF6B6B'], [150, 160, '#FFD84D'], [235, 138, '#7C5CFF']].map(([x, y, c]) => at(x, y, 1, `<g class="bz-bob">${ell(0, 8, 22, 9, c)}${ell(0, 8, 10, 4, '#4DA6D9', NO)}${circ(0, -6, 8, '#FFC9A8')}${rect(-8, -2, 16, 12, '#FF8A3D', 5)}</g>`)).join('') + bird(180, 52),
  zooboise: () => DAY('g3') + cloud(48, 34) + cloud(250, 40, 0.8) + ridge('#9CC57A', [[-10, 104], [110, 92], [220, 102], [330, 90]]) + grass(136, '#8CCB74') + tree(36, 138, 1.4) + tree(284, 134, 1.2, '#4E9654') + giraffe(176, 134, 1.2) + rect(104, 120, 8, 30, '#8A5A3A', 1) + rect(88, 112, 70, 22, '#FFF6E2', 4) + circ(96, 123, 3, '#FF8A5B', NO) + circ(112, 123, 3, '#FF8A5B', NO) + circ(128, 123, 3, '#FF8A5B', NO) + circ(144, 123, 3, '#FF8A5B', NO) + bird(250, 70, 0.9),
  discovery: () => sky('#BFE3FF', '#F2FAFF', 'g4') + cloud(50, 30, 0.9) + rect(70, 74, 180, 96, '#FFE6A8', 4) + rect(70, 58, 180, 20, '#FF9E5B', 4) + rect(124, 124, 72, 46, '#5BB7C9', 3) + rect(132, 132, 24, 38, '#FFF6E2', 2) + rect(164, 132, 24, 38, '#FFF6E2', 2) +
    at(160, 40, 1, `<g class="bz-spin" style="transform-origin:0 0">${circ(0, 0, 4, '#fff')}${[0, 60, 120].map((a) => ell(0, 0, 22, 8, 'none', 'stroke="#7C5CFF" stroke-width="2.6" fill="none" transform="rotate(' + a + ')"')).join('')}</g>`) +
    at(96, 106, 1, `<g class="bz-spin" style="transform-origin:0 0">${circ(0, 0, 14, '#9AA9B8')}${[0, 45, 90, 135].map((a) => rect(-3, -20, 6, 40, '#9AA9B8', 1, `transform="rotate(${a})" ${OL}`)).join('')}${circ(0, 0, 5, '#fff')}</g>`) +
    at(224, 104, 1, `<g class="bz-glow">${path('M0,-14 C-12,-14 -14,2 -6,8 L-6,16 L6,16 L6,8 C14,2 12,-14 0,-14 Z', '#FFE066')}${line('M-4,20 L4,20', '#2B3A4A', 2.4)}</g>`) + grass(170, '#8CCB74'),
  bogus: () => NIGHT('g5') + stars(18) + moon(262, 34) + mtn(20, 150, 150, 100, '#C7D6E8') + mtn(120, 150, 200, 120, '#DCE7F4') + pine(40, 160, 1, '#245E47') + pine(70, 168, 1.2, '#245E47') + pine(262, 164, 1.2, '#245E47') + rect(-5, 160, 330, 45, '#F4F9FF', 0, `stroke="#2B3A4A" stroke-width="2"`) +
    line('M214,66 Q190,100 205,130 T186,158', '#FFE066', 3) + line('M200,60 Q176,100 190,132 T172,158', '#FFE066', 3) + circ(150, 150, 3, '#FFE066', NO) + circ(246, 126, 3, '#FFE066', NO) +
    [0, 1, 2, 3, 4, 5, 6].map((i) => `<circle class="bz-fall" style="animation-delay:${i * 0.35}s" cx="${30 + i * 44}" cy="${10 + (i % 3) * 8}" r="2.4" fill="#fff"/>`).join(''),
  blueturf: () => DAY('g6') + cloud(54, 30, 0.9) + cloud(240, 26, 0.8) + path('M-5,86 L325,86 L325,200 L-5,200 Z', '#9DB1C6') + rect(10, 96, 300, 96, '#2E6FDB', 6) +
    [40, 80, 120, 160, 200, 240, 280].map((x) => `<line x1="${x}" y1="98" x2="${x}" y2="190" stroke="#fff" stroke-width="2.5" opacity=".75"/>`).join('') + ell(160, 144, 20, 20, 'none', 'stroke="#FF8A3D" stroke-width="5"') +
    rect(60, 60, 200, 30, '#F2E3C6', 3) + Array.from({ length: 16 }, (_, i) => circ(70 + i * 12, 74, 4, i % 2 ? '#FF8A3D' : '#2E6FDB', NO)).join('') + line('M22,150 L22,100 M14,100 L30,100', '#FFD84D', 4) + line('M298,150 L298,100 M290,100 L306,100', '#FFD84D', 4),
  surfwave: () => DAY('g7') + cloud(60, 30) + ridge('#8DBB6D', [[-10, 80], [120, 72], [240, 80], [330, 70]]) + rect(-5, 90, 330, 110, '#3F9ED6', 0, NO) +
    g(`<g class="bz-wave">${path('M-5,150 Q40,86 100,112 Q130,128 120,150 Q70,140 40,160 Z', '#6FC6EF')}${path('M-5,150 Q40,86 100,112 Q80,110 60,120 Q28,130 -5,160 Z', '#fff', NO)}${line('M-5,150 Q40,86 100,112 Q130,128 120,150', '#2B3A4A', 2)}</g>`) + river(160, 40, '#4DA6D9') +
    at(190, 140, 1, `<g class="bz-bob">${path('M-26,8 Q0,16 26,2 Q0,10 -26,8 Z', '#FF6B6B')}${rect(-16, -8, 8, 18, '#3B6EA5', 3)}${circ(-12, -16, 5, '#FFC9A8')}${line('M-12,-4 L-22,-10 M-12,-4 L2,-8', '#FFC9A8', 3)}</g>`) +
    at(260, 148, 1, `<g class="bz-bob b">${path('M-24,6 Q0,14 24,6 Q10,0 -24,6 Z', '#FFD84D')}${circ(-2, -6, 5, '#FFC9A8')}${rect(-8, -2, 12, 9, '#7C5CFF', 3)}${line('M-18,-10 L18,10', '#8A5A3A', 3)}</g>`),
  freakalley: () => sky('#9FD6FF', '#DDF1FF', 'g8') + rect(0, 0, 320, 200, '#C98D6B', 0, NO) + Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => rect(c * 38 - (r % 2 ? 19 : 0), r * 24, 36, 22, '#C98D6B', 0, 'stroke="#A8704F" stroke-width="1.4"')).join('')).join('') +
    path('M24,170 Q20,100 70,90 Q110,84 112,130 Q114,170 60,176 Z', '#FF6B8B') + circ(70, 126, 20, '#FFD84D') + circ(62, 120, 4, '#2B3A4A', NO) + circ(80, 120, 4, '#2B3A4A', NO) + line('M60,134 Q70,144 82,134', '#2B3A4A', 2.6) +
    path('M130,176 L150,60 L170,176 Z', '#3EC7B1') + path('M150,60 L184,70 L150,84 Z', '#FFD84D') +
    ell(236, 112, 46, 52, '#7C5CFF') + ell(236, 112, 32, 38, '#FF9E5B') + ell(236, 112, 16, 22, '#FFE066') + path('M196,100 L270,100', 'none', 'stroke="#fff" stroke-width="3" stroke-dasharray="4 5"') + rect(0, 176, 320, 24, '#7C7F86', 0, `stroke="#2B3A4A" stroke-width="2"`),
  potatodrop: () => NIGHT('g9') + stars(20) + [[40, 36, '#FF6B6B'], [270, 52, '#FFD84D'], [220, 30, '#6FE3C1']].map(([x, y, c], i) => g(`<g class="bz-glow" style="animation-delay:${i * 0.5}s">${[0, 45, 90, 135].map((a) => `<line x1="${x}" y1="${y - 14}" x2="${x}" y2="${y + 14}" stroke="${c}" stroke-width="3" stroke-linecap="round" transform="rotate(${a} ${x} ${y})"/>`).join('')}</g>`)).join('') +
    building(14, 118, 50, 82, '#2C3B6B', '#FFE066') + building(70, 104, 40, 96, '#35457A', '#FFE066') + building(230, 112, 44, 88, '#2C3B6B', '#FFE066') + building(278, 126, 42, 74, '#35457A', '#FFE066') +
    line('M160,-4 L160,44', '#C7D0E0', 3) + at(160, 78, 1, `<g class="bz-bob"><g class="bz-glow">${ell(0, 0, 36, 28, '#C79A5E')}${circ(-12, -8, 3.4, '#9A7440', NO)}${circ(10, 6, 3.4, '#9A7440', NO)}${circ(-4, 10, 3, '#9A7440', NO)}${circ(14, -10, 2.8, '#9A7440', NO)}${circ(-18, 6, 2.6, '#9A7440', NO)}</g></g>`) + rect(100, 176, 120, 24, '#2C3B6B', 0, OL),
  botanical: () => DAY('g10') + cloud(70, 30) + foothills('#CFE59B', '#B8D58A') + grass(126, '#9BD07C') +
    [[30, '#FF6B8B'], [70, '#FFD84D'], [110, '#B28CFF'], [150, '#FF8A3D'], [190, '#FF6B8B'], [230, '#FFD84D'], [270, '#B28CFF']].map(([x, c], i) => g(`${line(`M${x},176 L${x},${148 - (i % 3) * 6}`, '#3E8F4A', 3)}${circ(x, 144 - (i % 3) * 6, 9, c)}${circ(x, 144 - (i % 3) * 6, 3, '#FFF3B0', NO)}`, `class="bz-sway" style="animation-delay:${i * 0.3}s;transform-origin:${x}px 176px"`)).join('') +
    rect(210, 76, 84, 46, 'rgba(255,255,255,0.55)', 4) + line('M210,100 L294,100 M238,76 L238,122 M266,76 L266,122', '#2B3A4A', 1.6) + tree(52, 124, 1.1) + bird(150, 62),
  boisename: () => DAY('g11') + sun(266, 34) + cloud(50, 34) + ridge('#8DBB6D', [[-10, 100], [110, 90], [220, 100], [330, 88]]) + [20, 58, 96, 220, 258, 296].map((x, i) => tree(x, 104 + (i % 2) * 6, 1.2 + (i % 3) * 0.1, i % 2 ? '#4E9654' : '#5FA05A')).join('') + river(132, 70) +
    at(160, 150, 1.1, `<g class="bz-bob">${path('M-34,0 Q0,16 34,0 Q0,-6 -34,0 Z', '#A9743F')}${circ(-4, -10, 6, '#FFC9A8')}${path('M-12,-12 Q-4,-24 6,-12 Z', '#C0392B')}${rect(-10, -6, 12, 8, '#3B6EA5', 3)}${line('M-4,0 L22,-12', '#7A4E2E', 3)}</g>`) + bird(220, 60),
  capitol: () => DAY('g0') + cloud(54, 32) + cloud(250, 26, 0.8) + foothills('#CFE59B', '#B8D58A') + grass(136, '#9BD07C') + domeBuilding(160, 98, 1.25) + tree(40, 140, 1.3) + tree(276, 138, 1.2, '#4E9654') + rect(112, 168, 96, 8, '#E8D9B8', 1) + bird(250, 70, 0.9),
  basque: () => DUSK('g12') + sun(250, 64, 14, '#FFE066') + ridge('#8DBB6D', [[-10, 106], [80, 90], [180, 104], [330, 86]]) + ridge('#6FA85A', [[-10, 140], [90, 122], [200, 138], [330, 120]]) +
    sheep(60, 150, 1.4) + sheep(112, 160, 1.2) + sheep(232, 154, 1.3) +
    line('M20,30 Q160,56 300,30', '#2B3A4A', 2) + [34, 70, 106, 142, 178, 214, 250, 284].map((x, i) => path(`M${x},${36 + Math.sin(i / 1.2) * 6 + 6} l12,0 l-6,16 z`, ['#D6322E', '#2E8B57', '#FFFFFF'][i % 3])).join('') +
    rect(200, 98, 60, 38, '#F2E3C6', 2) + path('M196,98 L230,72 L264,98 Z', '#C0522E') + rect(222, 110, 16, 26, '#8A5A3A', 2) + rect(206, 106, 10, 10, '#FFE066', 1) + rect(246, 106, 10, 10, '#FFE066', 1),
  oldpen: () => DAY('g15') + cloud(70, 30) + ridge('#C9A06A', [[-10, 100], [100, 84], [220, 100], [330, 82]]) + rect(30, 100, 260, 70, '#D9B27A', 2) + Array.from({ length: 14 }, (_, i) => rect(30 + i * 18.6, 92, 14, 10, '#D9B27A', 1)).join('') + rect(136, 52, 48, 120, '#D9B27A', 2) + Array.from({ length: 4 }, (_, i) => rect(136 + i * 12, 44, 8, 10, '#D9B27A', 1)).join('') + rect(150, 108, 20, 64, '#5E4632', 9) + rect(148, 68, 8, 16, '#3E3228', 1) + rect(164, 68, 8, 16, '#3E3228', 1) +
    Array.from({ length: 3 }, (_, i) => line(`M${50 + i * 14},116 L${50 + i * 14},140`, '#3E3228', 2.4)).join('') + Array.from({ length: 3 }, (_, i) => line(`M${240 + i * 14},116 L${240 + i * 14},140`, '#3E3228', 2.4)).join('') + grass(170, '#9ABF6E') + bird(250, 60, 0.9),
  goldrush: () => DAY('g16') + cloud(60, 34) + mtn(10, 130, 150, 90, '#8FA6BC') + mtn(120, 130, 200, 112, '#A9BDD0') + pine(40, 146, 1.3) + pine(280, 144, 1.3) + pine(250, 150, 1) + grass(140, '#8CB36A') + path('M-5,170 Q100,150 200,166 T330,160 L330,205 L-5,205 Z', '#6FB7E0') + g(`<g class="bz-wave">${line('M30,184 q10,-5 20,0 t20,0', '#D9F0FF', 2.5)}${line('M210,186 q10,-5 20,0 t20,0', '#D9F0FF', 2.5)}</g>`) +
    at(150, 176, 1, `${ell(0, 0, 30, 9, '#9AA3AD')}${ell(0, -2, 22, 5, '#6C747C', NO)}${circ(-8, -4, 4, '#FFD84D')}${circ(4, -6, 3.4, '#FFD84D')}${circ(12, -3, 3, '#FFD84D')}`) + [0, 1, 2].map((i) => `<path class="bz-twinkle" style="animation-delay:${i * 0.5}s" d="M${96 + i * 56},${150 - (i % 2) * 8} l3,-8 l3,8 l8,3 l-8,3 l-3,8 l-3,-8 l-8,-3 z" fill="#FFE066"/>`).join(''),
  oregontrail: () => DUSK('g17') + sun(250, 82, 18, '#FFE066') + ridge('#C98A5E', [[-10, 112], [90, 98], [190, 112], [330, 94]]) + ridge('#A96A45', [[-10, 144], [100, 130], [220, 146], [330, 128]]) + path('M-5,182 Q120,150 330,170 L330,205 L-5,205 Z', '#D9B27A') + wagon(130, 160, 1.25) +
    at(200, 164, 1, `${ell(0, 0, 14, 8, '#8A5A3A')}${path('M10,-2 L18,-14 L22,-12 L16,2 Z', '#8A5A3A')}${line('M-8,6 L-8,18 M6,6 L6,18', '#6B4A33', 3)}`) + bird(60, 54, 0.9) + bird(86, 70, 0.7),
  potatoes: () => DAY('g18') + sun(52, 36) + cloud(220, 32) + ridge('#9CC57A', [[-10, 96], [110, 88], [220, 96], [330, 84]]) + path('M-5,110 L325,110 L325,205 L-5,205 Z', '#8A5E3C') +
    [0, 1, 2, 3, 4].map((i) => line(`M${20 + i * 70},110 L${-60 + i * 105},205`, '#6B4A33', 5)).join('') + [[60, 138], [250, 138], [110, 170], [210, 168], [160, 186]].map(([x, y]) => at(x, y, 1, `${ell(0, 0, 13, 9, '#D2A164')}${circ(-4, -2, 1.6, '#9A7440', NO)}${circ(5, 2, 1.6, '#9A7440', NO)}`)).join('') +
    at(160, 122, 1, `<g class="bz-bob">${ell(0, 0, 32, 22, '#D9A867')}${circ(-10, -6, 3, '#9A7440', NO)}${circ(8, 4, 3, '#9A7440', NO)}${circ(-2, 9, 2.6, '#9A7440', NO)}${circ(14, -8, 2.4, '#9A7440', NO)}${circ(-18, 4, 2.4, '#9A7440', NO)}</g>`),
  birdsofprey: () => DUSK('g20') + sun(70, 74, 18, '#FFE066') + ridge('#B87A55', [[-10, 126], [70, 104], [150, 124], [240, 98], [330, 120]]) + ridge('#8A5A3A', [[-10, 164], [100, 148], [210, 162], [330, 146]]) +
    at(190, 70, 1.5, `<g class="bz-bob">${path('M0,0 Q-22,-18 -40,-6 Q-24,-6 -14,6 Z', '#7A5A3F')}${path('M0,0 Q22,-18 40,-6 Q24,-6 14,6 Z', '#7A5A3F')}${ell(0, 6, 8, 14, '#9A7A58')}${circ(0, -8, 6, '#F4EAD8')}${path('M0,-8 L8,-5 L0,-2 Z', '#FFB62E')}${path('M-4,18 L0,30 L4,18 Z', '#7A5A3F')}</g>`) + bird(80, 48, 0.8) + bird(110, 36, 0.6),
  mknature: () => sky('#BFE3FF', '#EAF7FF', 'g21') + cloud(60, 28, 0.9) + ridge('#8DBB6D', [[-10, 86], [110, 76], [220, 88], [330, 72]]) + tree(40, 92, 1.3) + tree(272, 90, 1.2, '#4E9654') + rect(-5, 96, 330, 110, '#8A6B4A', 0, `stroke="#2B3A4A" stroke-width="2"`) +
    rect(60, 104, 200, 84, '#4DA6D9', 8) + rect(60, 104, 200, 84, 'none', 6, 'stroke="#6B4A33" stroke-width="7"') + g(`<g class="bz-wave">${line('M80,126 q10,-5 20,0 t20,0', '#BDE8FF', 2.5)}${line('M180,160 q10,-5 20,0 t20,0', '#BDE8FF', 2.5)}</g>`) + fish(120, 140, 1.4, '#FF8A5B') + fish(196, 124, 1.1, '#FFD84D') + fish(170, 166, 1, '#9FB6C9') + path('M60,186 Q110,170 160,186 Q210,200 260,184 L260,188 L60,188 Z', '#6B5B3E', NO) + at(80, 178, 1, `${path('M0,0 q4,-10 8,0', '#3E8F4A', 0)}${line('M0,10 L2,-8 M6,10 L8,-12 M12,10 L12,-6', '#3E8F4A', 2.6)}`),
  tablerock: () => DUSK('g22') + sun(250, 60, 16, '#FFE066') + ridge('#D9A06A', [[-10, 132], [80, 118], [180, 134], [330, 112]]) + path('M70,122 L88,76 L248,76 L270,122 Z', '#C98B5E') + path('M88,76 L248,76 L244,70 L92,70 Z', '#E0A878') + line('M104,92 L214,92 M96,106 L240,106', '#A96A45', 2) + rect(-5, 146, 330, 60, '#8A6B4A', 0, `stroke="#2B3A4A" stroke-width="2"`) +
    Array.from({ length: 16 }, (_, i) => circ(20 + i * 19, 168 + (i % 3) * 8, 1.8, '#FFE066', NO)).join('') + at(170, 66, 1, `${circ(0, -12, 4, '#FFC9A8')}${rect(-4, -8, 8, 12, '#3B6EA5', 2)}${line('M-4,4 L-6,12 M4,4 L6,12', '#2B3A4A', 2.4)}`) + bird(60, 46, 0.9),
  camelsback: () => DAY('g23') + sun(266, 34) + cloud(60, 34) + ridge('#C9A26A', [[-10, 112], [60, 96], [140, 126], [210, 86], [330, 124]]) + path('M-5,150 Q40,86 90,96 Q130,100 150,150 Z', '#D9B25E') + path('M-5,150 Q40,86 90,96 Q130,100 150,150', 'none', 'stroke="#2B3A4A" stroke-width="2" fill="none"') + ridge('#9CC57A', [[-10, 168], [120, 150], [330, 164]]) +
    line('M40,170 Q70,146 60,132 T96,108', '#F0DFA8', 4) + bike(86, 118, 0.8) + tree(40, 168, 1) + tree(278, 160, 1.1, '#4E9654') + bird(200, 50),
  luckypeak: () => DAY('g24') + sun(40, 34) + cloud(220, 30) + mtn(110, 100, 130, 70, '#B7A27E', false) + ridge('#C9A26A', [[-10, 98], [60, 82], [150, 100], [330, 78]]) + path('M-5,102 L325,102 L325,205 L-5,205 Z', '#4DA6D9') + rect(236, 92, 84, 40, '#B9B2A6', 3) + line('M244,100 L312,100 M244,112 L312,112 M244,124 L312,124', '#8E887C', 2) + g(`<g class="bz-wave">${line('M30,130 q10,-5 20,0 t20,0', '#BDE8FF', 2.5)}${line('M120,160 q10,-5 20,0 t20,0', '#BDE8FF', 2.5)}${line('M190,140 q10,-5 20,0 t20,0', '#BDE8FF', 2.5)}</g>`) +
    at(110, 136, 1, `<g class="bz-bob">${path('M-26,0 L26,0 L18,12 L-18,12 Z', '#FF6B6B')}${rect(-3, -22, 3, 22, '#2B3A4A', 0)}${path('M0,-22 L22,-4 L0,-4 Z', '#fff')}</g>`) + at(60, 168, 1, `<g class="bz-bob b">${path('M-22,0 L22,0 L14,10 L-14,10 Z', '#FFD84D')}${circ(0, -6, 6, '#FFC9A8')}</g>`),
  juliadavis: () => DAY('n1') + sun(268, 34) + cloud(60, 32) + cloud(210, 44, 0.8) + ridge('#9CC57A', [[-10, 104], [110, 92], [220, 102], [330, 90]]) + grass(128, '#8CCB74') +
    ell(110, 162, 74, 22, '#4DA6D9') + g(`<g class="bz-wave">${line('M70,160 q8,-4 16,0 t16,0', '#BDE8FF', 2.5)}</g>`) +
    at(104, 150, 1, `<g class="bz-bob">${path('M-22,0 L22,0 L16,12 L-16,12 Z', '#FFD84D')}${rect(-3, -20, 6, 20, '#2B3A4A', 1)}${path('M-3,-20 L16,-12 L-3,-6 Z', '#FF6B6B')}</g>`) +
    path('M180,176 Q230,150 300,168', 'none', 'stroke="#E8D2A5" stroke-width="9" stroke-linecap="round"') +
    [[196, 166, 3, '#BBB'], [212, 158, 4, '#E8B97A'], [230, 156, 5.5, '#4DA6D9'], [250, 158, 4.5, '#E05A47'], [272, 162, 9, '#E9B96E'], [296, 168, 7, '#F3D98B']].map(([x, y, r, c]) => circ(x, y, r, c)).join('') + tree(30, 142, 1.3) + tree(300, 128, 1.1, '#4E9654') + bird(180, 52, 1),
  steelheads: () => sky('#26356E', '#4A5C9C', 'n2') + rect(0, 112, 320, 90, '#EAF6FF', 0, NO) + rect(0, 112, 320, 4, '#2B3A4A', 0, NO) +
    path('M10,196 L60,118 L260,118 L310,196 Z', '#F6FBFF') + line('M160,118 L160,196', '#E05A47', 4) + line('M52,150 L268,150', '#3C7BE0', 3) + ell(160, 168, 24, 9, 'none', 'stroke="#3C7BE0" stroke-width="3"') +
    rect(116, 96, 88, 22, '#F2C44B', 2) + rect(122, 102, 76, 16, '#26356E', 1, NO) + line('M122,102 L198,102 M122,108 L198,108 M122,114 L198,114', '#5A6FB0', 1) +
    [[40, 36], [90, 20], [250, 30], [290, 50], [215, 14]].map(([x, y], i) => circ(x, y, 1.6, '#FFF8D6', NO)).join('') +
    at(80, 12, 1, `<g class="bz-fall">${circ(0, 0, 9, '#C88A52')}${circ(-6, -7, 4, '#C88A52')}${circ(6, -7, 4, '#C88A52')}${circ(0, 2, 3, '#F0D2A8', NO)}${circ(-3, -1, 1.2, '#2B3A4A', NO)}${circ(3, -1, 1.2, '#2B3A4A', NO)}</g>`) +
    at(236, 22, 0.9, `<g class="bz-fall">${circ(0, 0, 9, '#E8A5C8')}${circ(-6, -7, 4, '#E8A5C8')}${circ(6, -7, 4, '#E8A5C8')}${circ(0, 2, 3, '#FBE3EF', NO)}${circ(-3, -1, 1.2, '#2B3A4A', NO)}${circ(3, -1, 1.2, '#2B3A4A', NO)}</g>`) +
    line('M214,176 L250,152', '#7A4E2E', 5) + path('M246,150 L262,150 L258,158 L244,158 Z', '#7A4E2E') + ell(196, 178, 7, 3, '#2B3A4A') + fish(60, 168, 1.1, '#6CB6E8'),
  celebration: () => DUSK('n3') + sun(62, 70, 15, '#FFE066') + ridge('#C9A26A', [[-10, 110], [80, 86], [170, 112], [250, 84], [330, 106]]) +
    path('M168,80 L318,70 L318,160 L158,160 Z', '#D9B27A') + path('M168,80 L318,70 L318,84 L168,94 Z', '#E8C890') + line('M168,106 L318,98 M164,130 L318,126', '#B98F46', 2) +
    line('M196,102 q8,-14 16,0 q-8,10 -16,0 M205,102 q0,-5 4,-5', '#6B3E26', 2.5) + line('M226,108 l8,-12 l8,12 l8,-12 l8,12', '#6B3E26', 2.5) + line('M276,92 l0,26 M268,100 l8,-4 l8,4 M268,120 l8,-4 l8,4 M276,92 m-4,-4 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0', '#6B3E26', 2.5) + line('M200,138 q10,-10 20,0 q-10,8 -20,0', '#6B3E26', 2.5) +
    ridge('#B98F46', [[-10, 150], [90, 136], [200, 152], [330, 140]]) + path('M-5,168 Q60,156 120,168 T250,166 T330,164 L330,210 L-5,210 Z', '#4DA6D9') +
    g(`<g class="bz-wave">${line('M30,184 q10,-5 20,0 t20,0', '#BDE8FF', 2.5)}${line('M180,182 q10,-5 20,0 t20,0', '#BDE8FF', 2.5)}</g>`) + at(60, 146, 1, `${line('M-18,0 L22,-12', '#7A4E2E', 3)}${path('M22,-12 L30,-14 L24,-8 Z', '#C9C9C9')}${line('M-18,0 L-24,6', '#7A4E2E', 3)}`) + bird(120, 40, 1),
  milmuseum: () => DAY('n4') + sun(40, 34) + cloud(210, 36) + ridge('#9CC57A', [[-10, 108], [100, 98], [220, 106], [330, 96]]) + grass(128, '#8CB86A') +
    rect(150, 70, 140, 62, '#D8C9A6', 2) + rect(150, 62, 140, 10, '#8A7A55', 2) + [166, 198, 230, 262].map((x) => rect(x, 88, 18, 26, '#6F9CBE', 1)).join('') + rect(210, 106, 22, 26, '#8A5A3A', 1) +
    rect(280, 40, 3, 60, '#2B3A4A', 0) + path('M283,42 L310,50 L283,60 Z', '#E05A47') +
    at(76, 150, 1.25, `${path('M-34,0 L-26,-14 L22,-14 L36,0 Z', '#7A8F5A')}${path('M-14,-14 L-8,-26 L12,-26 L18,-14 Z', '#6B7F4D')}${line('M12,-20 L46,-24', '#4A5A38', 4)}${rect(-38, 0, 76, 10, '#5A6A44', 4)}${[-28, -12, 4, 20, 32].map((x) => circ(x, 5, 6, '#3D4A30')).join('')}${[-28, -12, 4, 20, 32].map((x) => circ(x, 5, 2, '#9AAF7A', NO)).join('')}`) + at(250, 172, 1, `${rect(-30, -5, 60, 9, '#8A7A55', 2)}${[-22, -8, 6, 20].map((x) => circ(x, 6, 5, '#3D4A30')).join('')}`) + bird(190, 40, 0.9),
  blackhistory: () => DAY('n5') + sun(44, 36) + cloud(230, 34) + ridge('#9CC57A', [[-10, 112], [100, 102], [220, 110], [330, 100]]) + grass(136, '#8CCB74') +
    rect(100, 92, 120, 66, '#FFF6E2', 2) + path('M92,94 L160,60 L228,94 Z', '#C06A4A') + rect(144, 22, 32, 40, '#FFF6E2', 2) + path('M138,24 L160,2 L182,24 Z', '#C06A4A') + line('M160,2 L160,-6 M154,-2 L166,-2', '#2B3A4A', 2) +
    rect(150, 120, 20, 38, '#8A5A3A', 6) + [[116, 106], [196, 106]].map(([x, y]) => path(`M${x},${y + 22} L${x},${y + 8} Q${x + 8},${y - 8} ${x + 16},${y + 8} L${x + 16},${y + 22} Z`, '#7C5CFF') + path(`M${x + 8},${y - 2} L${x + 8},${y + 22} M${x},${y + 12} L${x + 16},${y + 12}`, 'none', 'stroke="#FFD84D" stroke-width="2"')).join('') + at(160, 38, 1, `${path('M-6,18 L-6,6 Q0,-8 6,6 L6,18 Z', '#FF6B6B')}`) +
    path('M130,196 Q150,170 160,158 Q170,170 190,196 Z', '#E8D2A5') + tree(48, 146, 1.3) + tree(280, 142, 1.2, '#4E9654') + bird(230, 60, 0.9),
  annefrank: () => sky('#FFD9A8', '#FFF4DC', 'n6') + sun(250, 56, 16, '#FFE9A0') + cloud(70, 36) + ridge('#A6CFA0', [[-10, 112], [110, 100], [220, 110], [330, 98]]) + river(122, 30, '#6DB7DE') + grass(150, '#8FCB7C') +
    [[46, 126], [112, 126], [178, 126], [244, 126]].map(([x, y], i) => rect(x, y - 30 + (i % 2) * 6, 54, 56 - (i % 2) * 6, '#C9C2B4', 3) + line(`M${x + 8},${y - 16 + (i % 2) * 6} L${x + 46},${y - 16 + (i % 2) * 6} M${x + 8},${y - 8 + (i % 2) * 6} L${x + 46},${y - 8 + (i % 2) * 6} M${x + 8},${y + (i % 2) * 6} L${x + 34},${y + (i % 2) * 6}`, '#6B6B6B', 2)).join('') +
    at(160, 176, 1.2, `${rect(-30, -4, 60, 9, '#8A5A3A', 2)}${path('M-26,-4 L0,-14 L26,-4 Z', '#FFF6E2')}${line('M0,-14 L0,-4', '#2B3A4A', 2)}${line('M-18,-6 L-6,-10 M6,-10 L18,-6', '#B9B2A2', 1.6)}`) + tree(20, 160, 1.3) + tree(300, 156, 1.2, '#4E9654') + bird(120, 54, 0.9),
  albertson: () => DAY('n7') + sun(40, 34) + cloud(220, 34) + ridge('#9CC57A', [[-10, 98], [110, 88], [220, 98], [330, 86]]) + grass(112, '#8CCB74') + ell(160, 162, 150, 34, '#4DA6D9') +
    g(`<g class="bz-wave">${line('M60,160 q10,-5 20,0 t20,0', '#BDE8FF', 2.5)}${line('M200,168 q10,-5 20,0 t20,0', '#BDE8FF', 2.5)}</g>`) +
    at(40, 112, 1.5, `${rect(-4, -4, 8, 40, '#7A4E2E', 1)}${circ(0, -20, 22, '#5FA05A')}${circ(-14, -8, 14, '#5FA05A', NO)}${circ(14, -8, 14, '#5FA05A', NO)}${circ(0, -20, 22, 'none')}${ell(0, 8, 8, 9, '#B08A55')}${circ(-4, 5, 3.4, '#fff')}${circ(4, 5, 3.4, '#fff')}${circ(-4, 5, 1.4, '#2B3A4A', NO)}${circ(4, 5, 1.4, '#2B3A4A', NO)}${path('M-1.5,8 L1.5,8 L0,11 Z', '#FFB62E', NO)}`) +
    at(200, 134, 1, `${ell(0, 0, 26, 6, '#8A5A3A')}${ell(-4, -8, 11, 8, '#5E9B4E')}${circ(11, -8, 4, '#7DB36B')}${line('M-11,-8 L-4,-14 M0,-15 L4,-8', '#3E6B34', 1.5)}`) +
    duck(120, 166, 1.1) + duck(138, 172, 0.9) + [[250, 142], [262, 138], [274, 144]].map(([x, y]) => rect(x - 1.5, y - 22, 3, 26, '#6B4A33', 1) + ell(x, y - 24, 4, 7, '#8A5A3A')).join('') + heron(290, 146, 0.9),
  hagerman: () => DUSK('n8') + sun(250, 52, 14, '#FFE066') + cloud(60, 34, 0.9) + ridge('#C9A26A', [[-10, 98], [70, 84], [160, 100], [260, 80], [330, 96]]) +
    rect(-5, 104, 330, 96, '#D9B27A', 0, NO) + [[116, '#E8C890'], [136, '#C8935A'], [158, '#E6C28A'], [178, '#B98F46']].map(([y, c]) => rect(-5, y, 330, 22, c, 0, 'stroke="#8A6A3A" stroke-width="1.5"')).join('') +
    at(150, 152, 1.15, `${ell(0, 0, 34, 15, '#FFF6E2', 'stroke="#6B4A33" stroke-width="2.4"')}${path('M24,-8 Q34,-22 36,-34 L48,-38 Q58,-36 58,-30 L50,-26 Q44,-20 36,-4 Z', '#FFF6E2', 'stroke="#6B4A33" stroke-width="2.4" stroke-linejoin="round"')}${circ(48, -33, 2, '#6B4A33', NO)}${line('M-12,-12 Q-8,0 -12,12 M-2,-14 Q2,0 -2,14 M8,-13 Q12,0 8,13 M18,-10 Q21,0 18,10', '#B9A27A', 2)}${line('M-18,10 L-20,34 M-8,13 L-9,34 M16,13 L18,34 M26,8 L30,34', '#6B4A33', 3)}${line('M-33,-4 Q-46,0 -44,18', '#6B4A33', 3)}`) +
    at(250, 178, 1, `${rect(-14, -4, 28, 8, '#8A5A3A', 2)}${line('M14,0 L30,-12', '#8A5A3A', 4)}${path('M30,-12 L40,-18 L36,-8 Z', '#E05A47')}`) + circ(60, 172, 6, '#EADFC4') + circ(86, 182, 4, '#EADFC4') + bird(112, 44, 1),
};

// a plain scene for any place that has no picture of its own yet, so nothing ever looks broken
const FALLBACK = {
  do: () => SCENES.greenbelt(),
  history: () => SCENES.oregontrail(),
  nature: () => SCENES.camelsback(),
};

export function addScene(id, fn) { SCENES[id] = fn; }
export const hasScene = (id) => !!SCENES[id];

/** The picture for a place, as SVG text (decorative: the words next to it say what it is). */
export function scene(id, cat = 'do') {
  const body = (SCENES[id] || FALLBACK[cat] || FALLBACK.do)();
  return `<svg class="bscene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true" focusable="false">${body}</svg>`;
}

/** Wide, animated Boise skyline for the Home screen: foothills, Table Rock, the Capitol dome, the river, a hot air balloon and birds. */
export function banner() {
  const body = sky('#7CC8FF', '#FFF1C9', 'bn', 800) + sun(660, 44, 18) + cloud(120, 38, 1.1) + cloud(400, 26, 0.9, 'bz-cloud b') + cloud(740, 80, 0.8, 'bz-cloud c') + cloud(560, 88, 0.7, 'bz-cloud c') +
    ridge('#B98F46', [[-10, 112], [110, 84], [240, 106], [380, 72], [520, 100], [640, 76], [810, 104]]) + path('M40,124 L66,92 L190,92 L220,124 Z', '#C98B5E') + path('M66,92 L190,92 L186,86 L70,86 Z', '#E0A878') +
    ridge('#D9B25E', [[-10, 136], [130, 114], [300, 132], [480, 110], [680, 130], [810, 114]]) +
    balloon(520, 78, 1.15) + balloon(330, 54, 0.72, '#7C5CFF', '#6FE3C1') + balloon(660, 118, 0.6, '#FF9E5B', '#FFE066') +
    at(420, 140, 0.95, `${rect(-46, 10, 92, 34, '#E8D2A5', 1)}${[-32, -20, -8, 8, 20, 32].map((c) => rect(c - 2.5, 10, 5, 34, '#F6EAC8', 1)).join('')}${path('M-18,10 L-18,-4 Q0,-38 18,-4 L18,10 Z', '#9FC4B1')}${path('M-12,-6 Q0,-32 12,-6 Z', '#F2C14E')}${line('M0,-30 L0,-42', '#2B3A4A', 2)}${path('M0,-42 L12,-39 L0,-36 Z', '#E8574A')}`) +
    [50, 96, 160, 270, 340, 500, 560, 640, 700, 760].map((x, i) => tree(x, 152 + (i % 2) * 4, 1 + (i % 3) * 0.12, i % 2 ? '#4E9654' : '#5FA05A')).join('') +
    path('M-10,160 Q200,148 400,160 T810,156 L810,210 L-10,210 Z', '#4DA6D9') + g(`<g class="bz-wave">${[40, 200, 360, 520, 680].map((x) => line(`M${x},178 q10,-5 20,0 t20,0`, '#BDE8FF', 2.5)).join('')}</g><g class="bz-wave b">${[120, 280, 440, 600, 740].map((x) => line(`M${x},190 q10,-5 20,0 t20,0`, '#BDE8FF', 2.5)).join('')}</g>`) +
    duck(300, 172, 1) + duck(320, 178, 0.8) + bird(180, 48, 1.1) + bird(214, 62, 0.8) + bird(600, 100, 0.9) + bird(430, 60, 0.7);
  return `<svg class="bscene bbanner" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true" focusable="false">${body}</svg>`;
}

export const SCENE_IDS = Object.keys(SCENES);
