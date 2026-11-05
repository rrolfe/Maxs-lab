import { S, save, today } from '../core/store.js';
import { h, clear, shuffle, confetti, clamp } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings, L } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx, speak, canSpeak } from '../core/audio.js';
import { loadPacks, packName, packWords, pickWords, markSolved, recordWin, recordLoss, TIER_NAMES, dailySeed, rng } from '../games/common.js';
import { generate, lineCells, snapEnd, DIRS_BY_TIER, SIZE_BY_TIER } from '../games/wsgen.js';
import { awardBadges } from '../core/badges.js';

addStrings({
  en: {
    wsTitle: 'Word Search', wsDaily: 'Today’s puzzle', wsDailyDone: 'Done today. Play again for fun!', wsPick: 'Pick a theme', wsTier: 'Size', wsPlayers: 'Players',
    solo: 'Just me', race: 'Race with Dad', tierEasy: 'Easy 8×8', tierMed: 'Medium 10×10', tierHard: 'Hard 12×12', suggested: 'Ready for this',
    wsTapFirst: 'Tap the FIRST letter of a word, or slide your finger across it.', wsTapLast: 'Now tap the LAST letter.', wsNope: 'Not one of our words yet. Try again!', wsAlready: 'You already found that one.',
    wsFound: 'Found {w}!', wsAllFound: 'You found every word!', wsPeek: 'Peek', newPuzzle: 'New puzzle', otherTheme: 'Other theme', letters: '{n} letters', mystery: 'Mystery word',
    turn: '{p}’s turn', maxP: 'Max', dadP: 'Dad', wins: '{p} wins!', tie: 'It’s a tie!', wsPromoted: 'Bigger puzzles are ready for you next time!', factsHead: 'Cool facts from this puzzle',
    foundCount: '{a} of {b} found', wordsLeft: 'Words to find', sayIt: 'Say it',
  },
  es: {
    wsTitle: 'Sopa de letras', wsDaily: 'El reto de hoy', wsDailyDone: '¡Listo por hoy! Juega otra vez por diversión.', wsPick: 'Elige un tema', wsTier: 'Tamaño', wsPlayers: 'Jugadores',
    solo: 'Solo yo', race: 'Carrera con Papá', tierEasy: 'Fácil 8×8', tierMed: 'Medio 10×10', tierHard: 'Difícil 12×12', suggested: 'Listo para esto',
    wsTapFirst: 'Toca la PRIMERA letra de una palabra, o desliza el dedo sobre ella.', wsTapLast: 'Ahora toca la ÚLTIMA letra.', wsNope: 'Todavía no es una de nuestras palabras. ¡Inténtalo otra vez!', wsAlready: 'Esa ya la encontraste.',
    wsFound: '¡Encontraste {w}!', wsAllFound: '¡Encontraste todas las palabras!', wsPeek: 'Pista', newPuzzle: 'Nueva sopa', otherTheme: 'Otro tema', letters: '{n} letras', mystery: 'Palabra misteriosa',
    turn: 'Turno de {p}', maxP: 'Max', dadP: 'Papá', wins: '¡{p} gana!', tie: '¡Empate!', wsPromoted: '¡La próxima vez te esperan sopas más grandes!', factsHead: 'Datos curiosos de esta sopa',
    foundCount: '{a} de {b} encontradas', wordsLeft: 'Palabras por encontrar', sayIt: 'Escúchala',
  },
});

const TIER_KEYS = { 1: 'tierEasy', 2: 'tierMed', 3: 'tierHard' };
const opt = { tier: null, players: 1 };

export async function mount(el, { parts, params }) {
  if (parts[0] === 'play') return play(el, params);
  return menu(el);
}

async function menu(el) {
  if (opt.tier == null) opt.tier = S.words.tier.ws || 1;
  const packs = await loadPacks();
  const daily = S.words.daily?.date === today();
  const seed = dailySeed(); const dp = packs[seed % packs.length];
  const root = h('div');
  el.append(root);
  function draw() {
    const sug = S.words.tier.ws || 1;
    root.replaceChildren(
      h('div', { class: 'screen-head' }, h('h1', {}, t('wsTitle'))),
      h('a', { class: 'continue', href: '#/words/play?daily=1&tier=2', style: { marginBottom: '22px' } },
        h('div', { class: 'ci', style: { fontSize: '44px' } }, dp.icon), h('div', { class: 'ct' }, h('small', {}, t('wsDaily')), h('strong', {}, packName(dp)), h('small', {}, daily ? t('wsDailyDone') : '')),
        h('span', { class: 'btn gold' }, t('play'))),
      h('div', { class: 'optrow' },
        h('div', {}, h('h3', {}, t('wsTier')), h('div', { class: 'row' }, [1, 2, 3].map((n) => h('button', { class: 'chip big' + (opt.tier === n ? ' on' : ''), 'aria-pressed': String(opt.tier === n), onclick: () => { opt.tier = n; draw(); } }, t(TIER_KEYS[n]), n === sug && sug > 1 ? h('span', { class: 'tag' }, t('suggested')) : null)))),
        h('div', {}, h('h3', {}, t('wsPlayers')), h('div', { class: 'row' }, [[1, 'solo'], [2, 'race']].map(([n, k]) => h('button', { class: 'chip big' + (opt.players === n ? ' on' : ''), 'aria-pressed': String(opt.players === n), onclick: () => { opt.players = n; draw(); } }, t(k)))))),
      h('h2', { style: { marginTop: '22px' } }, t('wsPick')),
      h('div', { class: 'packs' }, packs.map((p) => h('a', { class: 'pack', href: `#/words/play?pack=${p.id}&tier=${opt.tier}&p=${opt.players}` }, h('span', { class: 'pe' }, p.icon), h('strong', {}, packName(p))))));
  }
  draw();
}

async function play(el, params) {
  const packs = await loadPacks();
  const daily = params.daily === '1';
  const tier = clamp(parseInt(params.tier || '1', 10), 1, 3);
  const nPlayers = params.p === '2' ? 2 : 1;
  const seedBase = daily ? dailySeed() : Math.floor(Math.random() * 1e9);
  const pack = daily ? packs[seedBase % packs.length] : packs.find((p) => p.id === params.pack) || packs[0];
  const cfg = SIZE_BY_TIER[tier];
  const words = packWords(pack);
  let puzzle = null, chosen = [];
  for (let k = 0; k < 60 && !puzzle; k++) {
    const r = rng(seedBase + k * 7919);
    chosen = pickWords(words, cfg.words, { tiers: tier === 1 ? [1] : tier === 2 ? [2] : [2, 3], r, maxLen: tier === 1 ? 6 : tier === 2 ? 8 : 11, useHistory: !daily });
    if (chosen.length < cfg.words) chosen = pickWords(words, cfg.words, { tiers: [1, 2, 3], r, maxLen: cfg.size - 1, useHistory: false });
    puzzle = generate(chosen, { size: cfg.size, dirs: DIRS_BY_TIER[tier], r, lang: S.lang });
  }
  if (!puzzle) { el.append(h('p', {}, 'Could not make a puzzle. ', h('a', { href: '#/words' }, t('back')))); return; }
  const N = cfg.size;
  const mysteryCount = tier === 3 ? 3 : 0;
  const mysteryKeys = new Set(puzzle.placed.filter((p) => p.word.len >= 6).slice(0, mysteryCount).map((p) => p.word.key));
  const found = new Map();           // key -> {cells, color, player}
  let anchor = null, preview = [], turn = 0, over = false;
  const scores = [0, 0];

  const msg = h('div', { class: 'wsmsg', role: 'status', 'aria-live': 'polite' }, t('wsTapFirst'));
  const grid = h('div', { class: 'wsgrid', style: { '--n': N }, role: 'application', 'aria-label': t('wsTitle') });
  const cells = puzzle.grid.map((ch, i) => h('div', { class: 'wcell', 'data-i': i }, ch));
  grid.append(...cells);
  const list = h('ul', { class: 'wlist' });
  const turnBar = nPlayers === 2 ? h('div', { class: 'turnbar' }) : null;
  const count = h('p', { class: 'muted small' });
  const side = h('div', { class: 'wside' }, turnBar, h('h3', {}, t('wordsLeft')), count, list,
    h('div', { class: 'row' },
      h('button', { class: 'btn ghost small', onclick: peek }, h('span', { html: icons.bulb(30) }), t('wsPeek')),
      h('button', { class: 'btn ghost small', onclick: () => go('/words') }, t('otherTheme'))));
  const title = h('div', { class: 'screen-head' },
    h('button', { class: 'btn ghost icon', 'aria-label': t('back'), onclick: () => go('/words'), html: icons.back(34) }),
    h('h1', {}, `${pack.icon} ${packName(pack)}`), h('span', { class: 'chip' }, t(TIER_KEYS[tier])));
  const fin = h('div', { class: 'wsfinish' });
  el.append(title, h('div', { class: 'wsplay' }, h('div', { class: 'wsleft' }, grid, msg), side), fin);

  const colorOf = (n) => 'c' + (n % 8);
  function drawList() {
    list.replaceChildren(...puzzle.placed.map((p) => {
      const f = found.get(p.word.key);
      const mystery = mysteryKeys.has(p.word.key);
      const label = f ? p.word.w : mystery ? p.word.clue : p.word.w;
      return h('li', { class: 'wl' + (f ? ' found ' + (f.player != null ? 'p' + f.player : f.color) : '') + (mystery && !f ? ' mys' : '') },
        h('span', { class: 'ck' }, f ? '✓' : mystery ? '?' : ''), h('span', { class: 'wt' }, label), mystery && !f ? h('span', { class: 'tag' }, t('letters', { n: p.word.len })) : null);
    }));
    count.textContent = t('foundCount', { a: found.size, b: puzzle.placed.length });
    if (turnBar) turnBar.replaceChildren(h('span', { class: 'pl p0' + (turn === 0 ? ' on' : '') }, `${t('maxP')} ${scores[0]}`), h('span', { class: 'pl p1' + (turn === 1 ? ' on' : '') }, `${t('dadP')} ${scores[1]}`), h('small', {}, t('turn', { p: turn === 0 ? t('maxP') : t('dadP') })));
  }
  function paint() {
    cells.forEach((c, i) => { c.className = 'wcell'; });
    for (const [, f] of found) f.cells.forEach((i) => cells[i].classList.add('found', f.player != null ? 'p' + f.player : f.color));
    preview.forEach((i) => cells[i].classList.add('sel'));
    if (anchor != null) cells[anchor].classList.add('anchor');
  }
  function layout() {
    const landscape = innerWidth > innerHeight;
    const availH = innerHeight - 250, availW = landscape ? innerWidth * 0.56 : innerWidth - 40;
    const cell = clamp(Math.floor(Math.min(availH + (landscape ? 0 : 160), availW) / N), 34, 64);
    grid.style.setProperty('--cell', cell + 'px');
  }
  layout(); addEventListener('resize', layout);

  function cellAt(e) {
    const b = grid.getBoundingClientRect();
    const x = e.clientX - b.left, y = e.clientY - b.top;
    const col = clamp(Math.floor((x / b.width) * N), 0, N - 1), row = clamp(Math.floor((y / b.height) * N), 0, N - 1);
    return row * N + col;
  }
  let start = null, moved = false;
  grid.addEventListener('pointerdown', (e) => {
    if (over) return; e.preventDefault(); grid.setPointerCapture?.(e.pointerId);
    start = cellAt(e); moved = false; preview = [start]; paint();
  });
  grid.addEventListener('pointermove', (e) => {
    if (start == null || over) return;
    const c = cellAt(e); if (c === start && !moved) return;
    moved = true; const end = snapEnd(start, c, N); preview = lineCells(start, end, N) || [start]; paint();
  });
  const up = (e) => {
    if (start == null || over) return;
    const c = cellAt(e); const s = start; start = null;
    if (moved && c !== s) { const end = snapEnd(s, c, N); anchor = null; tryLine(s, end); return; }
    // a tap
    if (anchor == null) { anchor = s; preview = [s]; msg.textContent = t('wsTapLast'); sfx.tap(); paint(); }
    else if (anchor === s) { anchor = null; preview = []; msg.textContent = t('wsTapFirst'); paint(); }
    else { const a = anchor; anchor = null; tryLine(a, s); }
  };
  grid.addEventListener('pointerup', up);
  grid.addEventListener('pointercancel', () => { start = null; preview = []; paint(); });
  grid.addEventListener('contextmenu', (e) => e.preventDefault());

  function tryLine(a, b) {
    const line = lineCells(a, b, N);
    preview = [];
    if (!line || line.length < 2) { msg.textContent = t('wsNope'); sfx.wrong(); paint(); return; }
    const text = line.map((i) => puzzle.grid[i]).join(''), rev = [...text].reverse().join('');
    const hit = puzzle.placed.find((p) => p.word.key === text || p.word.key === rev);
    if (!hit) { msg.textContent = t('wsNope'); sfx.wrong(); paint(); return; }
    if (found.has(hit.word.key)) { msg.textContent = t('wsAlready'); paint(); return; }
    const f = { cells: hit.cells, color: colorOf(found.size), player: nPlayers === 2 ? turn : null };
    found.set(hit.word.key, f);
    if (nPlayers === 2) { scores[turn]++; }
    sfx.found(); msg.textContent = t('wsFound', { w: hit.word.w });
    msg.classList.add('good'); setTimeout(() => msg.classList.remove('good'), 1200);
    if (nPlayers === 2) turn = 1 - turn;
    paint(); drawList();
    if (found.size === puzzle.placed.length) finish();
  }

  function peek() {
    if (over) return; sfx.pop();
    const left = puzzle.placed.filter((p) => !found.has(p.word.key));
    if (!left.length) return;
    const p = left[Math.floor(Math.random() * left.length)];
    const c = cells[p.cells[0]]; c.classList.add('peek'); setTimeout(() => c.classList.remove('peek'), 1800);
  }

  function finish() {
    over = true; sfx.levelUp(); confetti(innerWidth / 2, innerHeight / 3);
    for (const p of puzzle.placed) markSolved('ws', p.word.key);
    let line = t('wsAllFound');
    let promoted = false;
    if (nPlayers === 2) line = scores[0] === scores[1] ? t('tie') : t('wins', { p: scores[0] > scores[1] ? t('maxP') : t('dadP') });
    if (nPlayers === 1 || scores[0] >= scores[1]) promoted = recordWin('ws', tier);
    if (daily) S.words.daily = { date: today(), done: true };
    save();
    const badges = awardBadges();
    fin.replaceChildren(h('div', { class: 'card summary' },
      h('div', { html: icons.trophy(72) }), h('h1', {}, line),
      promoted ? h('p', { class: 'levelup' }, h('span', { html: icons.star(30) }), t('wsPromoted')) : null,
      badges.map((b) => h('p', { class: 'levelup' }, h('span', { html: icons.trophy(30) }), b)),
      h('h3', {}, t('factsHead')),
      h('ul', { class: 'facts' }, puzzle.placed.map((p) => h('li', {}, h('strong', {}, p.word.w), ' ', p.word.fact || '', canSpeak() ? h('button', { class: 'btn ghost small', 'aria-label': t('sayIt'), onclick: () => speak(p.word.w + '. ' + (p.word.fact || '')), html: icons.speaker(28) }) : null))),
      h('div', { class: 'row', style: { justifyContent: 'center' } },
        h('a', { class: 'btn', href: location.hash, onclick: (e) => { e.preventDefault(); clear(el); removeEventListener('resize', layout); play(el, { ...params, daily: undefined }); } }, t('newPuzzle')),
        h('a', { class: 'btn alt', href: '#/words' }, t('otherTheme')),
        h('a', { class: 'btn ghost', href: '#/home' }, t('home')))));
    fin.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  drawList(); paint();
  return () => removeEventListener('resize', layout);
}
