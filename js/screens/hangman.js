import { S, save, addPearls } from '../core/store.js';
import { REWARD } from '../core/economy.js';
import { h, clear, confetti, clamp, fold, shuffle, flyPoints } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx, speak, canSpeak } from '../core/audio.js';
import { loadPacks, packName, packWords, pickWords, markSolved, recordWin, recordLoss } from '../games/common.js';
import { awardBadges } from '../core/badges.js';

addStrings({
  en: {
    hmTitle: 'Hangman', hmPick: 'Pick a theme', hmLevel: 'Level', hmE: 'Easy: short words, first letter free', hmM: 'Medium: longer words', hmH: 'Hard: big words',
    hmPass: 'Pass the iPad', hmPassSub: 'One player picks a secret word. The other guesses.', hmType: 'Type a secret word', hmClueOpt: 'Clue (optional)', hmReady: 'Ready! Pass the iPad', hmGuess: 'Guess the word!',
    hmLeft: 'Misses left', hmWin: 'You got it!', hmLose: 'Good try! The word was:', hmLearn: 'Let’s learn it:', hmEarned: '+{n} pearls', hmFlawless: 'No misses! Flawless bonus', hmTryBonus: 'for a good try', hmPassNoPearls: 'Passed-iPad games are just for fun (no pearls).', hmFigure: 'Gallows with a stick figure: {n} of 7 parts drawn', hmNextWord: 'Next word', hmOther: 'Other theme', hmTooShort: 'Use 3 to 12 letters.', hmAnother: 'Play again',
    hmPromoted: 'Harder words are ready for you next time!', hmOnlyLetters: 'Letters only, please.', hmLetter: 'Letter {l}', hmHideWord: 'Hide it', hmSecretSet: 'Secret word is hidden. Pass the iPad!', hmSolved: 'Solved',
  },
  es: {
    hmTitle: 'Ahorcado', hmPick: 'Elige un tema', hmLevel: 'Nivel', hmE: 'Fácil: palabras cortas, primera letra gratis', hmM: 'Medio: palabras más largas', hmH: 'Difícil: palabras grandes',
    hmPass: 'Pasa el iPad', hmPassSub: 'Un jugador elige una palabra secreta. El otro la adivina.', hmType: 'Escribe una palabra secreta', hmClueOpt: 'Pista (opcional)', hmReady: '¡Listo! Pasa el iPad', hmGuess: '¡Adivina la palabra!',
    hmLeft: 'Fallos restantes', hmWin: '¡Lo lograste!', hmLose: '¡Buen intento! La palabra era:', hmLearn: 'Vamos a aprenderla:', hmEarned: '+{n} perlas', hmFlawless: '¡Sin fallos! Bono perfecto', hmTryBonus: 'por intentarlo', hmPassNoPearls: 'Los juegos con el iPad pasado son solo por diversión (sin perlas).', hmFigure: 'Horca con un muñeco de palitos: {n} de 7 partes dibujadas', hmNextWord: 'Siguiente palabra', hmOther: 'Otro tema', hmTooShort: 'Usa de 3 a 12 letras.', hmAnother: 'Jugar otra vez',
    hmPromoted: '¡La próxima vez te esperan palabras más difíciles!', hmOnlyLetters: 'Solo letras, por favor.', hmLetter: 'Letra {l}', hmHideWord: 'Ocultar', hmSecretSet: 'La palabra secreta está oculta. ¡Pasa el iPad!', hmSolved: 'Resuelta',
  },
});

const LIVES = { 1: 7, 2: 7, 3: 7 };   // head, body, two arms, two legs, then a face: seven misses
const TIER_LABEL = { 1: 'hmE', 2: 'hmM', 3: 'hmH' };
const opt = { tier: null };
const alphabet = () => (S.lang === 'es' ? 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ').split('');

export async function mount(el, { parts, params }) {
  if (parts[0] === 'play') return play(el, params);
  if (parts[0] === 'pass') return pass(el);
  return menu(el);
}

async function menu(el) {
  if (opt.tier == null) opt.tier = S.words.tier.hm || 1;
  const packs = await loadPacks();
  const root = h('div'); el.append(root);
  function draw() {
    root.replaceChildren(
      h('div', { class: 'screen-head' }, h('h1', {}, t('hmTitle'))),
      h('a', { class: 'continue', href: '#/hangman/pass', style: { marginBottom: '22px' } }, h('div', { class: 'ci', html: icons.hangman(56) }), h('div', { class: 'ct' }, h('strong', {}, t('hmPass')), h('small', {}, t('hmPassSub'))), h('span', { class: 'btn gold' }, t('play'))),
      h('h3', {}, t('hmLevel')),
      h('div', { class: 'row', style: { marginBottom: '8px' } }, [1, 2, 3].map((n) => h('button', { class: 'chip big' + (opt.tier === n ? ' on' : ''), 'aria-pressed': String(opt.tier === n), onclick: () => { opt.tier = n; draw(); } }, t(TIER_LABEL[n])))),
      h('h2', { style: { marginTop: '18px' } }, t('hmPick')),
      h('div', { class: 'packs' }, packs.map((p) => h('a', { class: 'pack', href: `#/hangman/play?pack=${p.id}&tier=${opt.tier}` }, h('span', { class: 'pe' }, p.icon), h('strong', {}, packName(p))))));
  }
  draw();
}

/** The game board, shared by themed words and passed-iPad words. */
function board(el, { word, clue, fact, lives, freeFirst, onEnd, header, themed }) {
  const key = [...fold(word)];
  const shown = [...word.toUpperCase()];
  const guessed = new Set(); let misses = 0, over = false;
  if (freeFirst) guessed.add(key[0]);
  const figure = gallowsSvg();
  const bubbles = h('div', { class: 'bubbles', role: 'img' });
  const scene = h('div', { class: 'hmscene' }, figure, bubbles, h('small', {}, t('hmLeft')));
  const slotsEl = h('div', { class: 'hmword', 'aria-live': 'polite' });
  const keysEl = h('div', { class: 'hmkeys' });
  const msg = h('div', { class: 'feedback', role: 'status' });
  const clueEl = h('p', { class: 'hmclue' }, clue || '');
  const keyBtns = {};
  for (const L of alphabet()) {
    const b = h('button', { class: 'hmkey', 'aria-label': t('hmLetter', { l: L }), onclick: () => guess(L) }, L);
    keyBtns[L] = b; keysEl.append(b);
  }
  function draw() {
    slotsEl.replaceChildren(...shown.map((ch, i) => h('span', { class: 'hmslot' + (guessed.has(key[i]) ? ' rev' : '') + (over && !guessed.has(key[i]) ? ' lost' : '') }, guessed.has(key[i]) || over ? ch : '')));
    slotsEl.setAttribute('aria-label', shown.map((ch, i) => (guessed.has(key[i]) ? ch : '_')).join(' '));
    bubbles.replaceChildren(...Array.from({ length: lives }, (_, i) => h('i', { class: i < misses ? 'pop' : '' })));
    bubbles.setAttribute('aria-label', `${lives - misses} / ${lives}`);
    figure.querySelectorAll('[data-part]').forEach((p) => p.classList.toggle('on', +p.dataset.part < misses));
    figure.setAttribute('aria-label', t('hmFigure', { n: misses }));
    for (const [L, b] of Object.entries(keyBtns)) {
      const used = guessed.has(L) || (L === 'Ñ' && guessed.has('Ñ'));
      b.disabled = over || used;
      b.classList.toggle('hit', used && key.includes(L)); b.classList.toggle('miss', used && !key.includes(L));
    }
  }
  function guess(L) {
    if (over || guessed.has(L)) return;
    guessed.add(L);
    if (key.includes(L)) sfx.pop(); else { misses++; sfx.splash(); }
    const won = key.every((k) => guessed.has(k));
    if (won) end(true); else if (misses >= lives) end(false);
    draw();
  }
  function end(won) {
    over = true;
    if (won) { sfx.levelUp(); confetti(innerWidth / 2, innerHeight / 3); }
    msg.className = 'feedback ' + (won ? 'good' : 'try');
    msg.replaceChildren(h('span', { html: won ? icons.check(34) : icons.bulb(34) }), h('div', {}, h('strong', {}, won ? t('hmWin') : t('hmLose') + ' ' + word.toUpperCase()), !won && (fact || clue) ? h('p', { class: 'why' }, h('b', {}, t('hmLearn') + ' '), fact || clue) : fact ? h('p', { class: 'why' }, fact) : null, canSpeak() ? h('button', { class: 'btn ghost small', onclick: () => speak(word + '. ' + (fact || '')), html: icons.speaker(28) }) : null));
    draw();
    onEnd(won, msg, misses);
  }
  draw();
  const left = h('div', { class: 'stack' }, scene);
  const right = h('div', { class: 'stack' }, clue ? clueEl : null, slotsEl, keysEl, msg);
  el.append(h('div', { class: 'hmplay' }, left, right));
  return { msg };
}

/** Gallows with a stick figure. Parts 0-6 appear one per miss: head, body, left arm, right arm, left leg, right leg, face. */
function gallowsSvg() {
  const d = document.createElement('div');
  d.innerHTML = `<svg viewBox="0 0 300 250" role="img" aria-label="Gallows">
  <rect width="300" height="250" rx="12" fill="#FFF4D6"/>
  <path d="M20 232h150M60 232V28h140v34" stroke="#6B4A2B" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M60 78l34-34" stroke="#6B4A2B" stroke-width="8" stroke-linecap="round"/>
  <path d="M200 62v14" stroke="#B08A5A" stroke-width="5" stroke-linecap="round"/>
  <g stroke="#10303B" stroke-width="7" stroke-linecap="round" fill="none">
    <circle data-part="0" class="hp" cx="200" cy="100" r="24" fill="#FFE2B8"/>
    <path data-part="1" class="hp" d="M200 124v62"/>
    <path data-part="2" class="hp" d="M200 140l-34 28"/>
    <path data-part="3" class="hp" d="M200 140l34 28"/>
    <path data-part="4" class="hp" d="M200 186l-30 40"/>
    <path data-part="5" class="hp" d="M200 186l30 40"/>
    <g data-part="6" class="hp" stroke-width="4"><circle cx="191" cy="96" r="2" fill="#10303B"/><circle cx="209" cy="96" r="2" fill="#10303B"/><ellipse cx="200" cy="111" rx="5" ry="4" fill="#10303B"/></g>
  </g></svg>`;
  return d.firstElementChild;
}

async function play(el, params) {
  const packs = await loadPacks();
  const pack = packs.find((p) => p.id === params.pack) || packs[0];
  const tier = clamp(parseInt(params.tier || '1', 10), 1, 3);
  const all = packWords(pack);
  const tiers = tier === 1 ? [1] : tier === 2 ? [1, 2] : [2, 3];
  const words = pickWords(all, 6, { tiers, prefix: 'hm', maxLen: tier === 1 ? 6 : 11 });
  let idx = 0;
  const wrap = h('div'); el.append(wrap);
  const head = () => h('div', { class: 'screen-head' }, h('button', { class: 'btn ghost icon', 'aria-label': t('back'), onclick: () => go('/hangman'), html: icons.back(34) }), h('h1', {}, `${pack.icon} ${packName(pack)}`), h('span', { class: 'chip' }, t(TIER_LABEL[tier]).split(':')[0]));
  function round() {
    clear(wrap);
    const w = words[idx % words.length];
    wrap.append(head());
    board(wrap, { word: w.w, clue: w.clue, fact: w.fact, lives: LIVES[tier], freeFirst: tier === 1,
      onEnd(won, msg, misses) {
        let promoted = false;
        if (won) { markSolved('hm', w.key); promoted = recordWin('hm', tier); } else recordLoss('hm');
        // pearls: a win pays by level (+ flawless bonus); a loss still pays a little for trying, so no word ever feels wasted
        const base = won ? REWARD.hm.win[tier] : REWARD.hm.loss;
        const flawless = won && misses === 0 ? REWARD.hm.flawless : 0;
        const r = addPearls(base + flawless);
        if (r.got) flyPoints(msg, r.got);
        save();
        const b = awardBadges();
        msg.append(h('div', { class: 'row', style: { flexBasis: '100%', marginTop: '10px' } },
          h('b', { class: 'plus' }, t('hmEarned', { n: r.got }) + (flawless ? ' · ' + t('hmFlawless') : won ? '' : ' ' + t('hmTryBonus'))),
          promoted ? h('p', { class: 'levelup', style: { margin: 0 } }, h('span', { html: icons.star(28) }), t('hmPromoted')) : null,
          b.map((x) => h('p', { class: 'levelup', style: { margin: 0 } }, x)),
          h('button', { class: 'btn', onclick: () => { idx++; round(); } }, t('hmNextWord')),
          h('a', { class: 'btn ghost', href: '#/hangman' }, t('hmOther'))));
      } });
  }
  round();
}

function pass(el) {
  const wrap = h('div'); el.append(wrap);
  const head = h('div', { class: 'screen-head' }, h('button', { class: 'btn ghost icon', 'aria-label': t('back'), onclick: () => go('/hangman'), html: icons.back(34) }), h('h1', {}, t('hmPass')));
  let secret = '', clue = '';
  function setup() {
    clear(wrap); wrap.append(head);
    const disp = h('div', { class: 'hmsecret', 'aria-label': t('hmType') }, h('span', { class: 'muted' }, t('hmType')));
    const note = h('p', { class: 'muted' }, t('hmTooShort'));
    const clueIn = h('input', { class: 'textin', type: 'text', maxlength: '60', placeholder: t('hmClueOpt'), 'aria-label': t('hmClueOpt'), autocomplete: 'off', autocapitalize: 'sentences' });
    const go1 = h('button', { class: 'btn', disabled: true, onclick: () => { clue = clueIn.value.trim(); play2(); } }, t('hmReady'));
    const redraw = () => { disp.replaceChildren(secret ? '•'.repeat(secret.length) : h('span', { class: 'muted' }, t('hmType'))); go1.disabled = secret.length < 3; };
    const keys = h('div', { class: 'hmkeys big' }, alphabet().map((L) => h('button', { class: 'hmkey', onclick: () => { if (secret.length < 12) { secret += L; sfx.tap(); redraw(); } } }, L)),
      h('button', { class: 'hmkey', 'aria-label': 'Delete', onclick: () => { secret = secret.slice(0, -1); redraw(); } }, '⌫'));
    wrap.append(h('div', { class: 'stack', style: { maxWidth: '680px' } }, disp, keys, note, clueIn, go1));
    redraw();
  }
  function play2() {
    clear(wrap); wrap.append(head);
    wrap.append(h('p', { class: 'chip on' }, t('hmSecretSet')));
    board(wrap, { word: secret, clue: clue || t('hmGuess'), fact: '', lives: 7, freeFirst: false,
      onEnd(won, msg) { if (won) { recordWin('hm', 1); save(); } msg.append(h('p', { class: 'muted', style: { flexBasis: '100%' } }, t('hmPassNoPearls')), h('div', { class: 'row', style: { flexBasis: '100%', marginTop: '10px' } }, h('button', { class: 'btn', onclick: () => { secret = ''; clue = ''; setup(); } }, t('hmAnother')), h('a', { class: 'btn ghost', href: '#/hangman' }, t('back')))); } });
  }
  setup();
}
