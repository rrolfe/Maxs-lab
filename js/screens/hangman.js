import { S, save } from '../core/store.js';
import { h, clear, confetti, clamp, fold, shuffle } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx, speak, canSpeak } from '../core/audio.js';
import { loadPacks, packName, packWords, pickWords, markSolved, recordWin, recordLoss } from '../games/common.js';
import { awardBadges } from '../core/badges.js';

addStrings({
  en: {
    hmTitle: 'Hangman', hmPick: 'Pick a theme', hmLevel: 'Level', hmE: 'Easy: short words, first letter free', hmM: 'Medium: longer words', hmH: 'Hard: big words, fewer bubbles',
    hmPass: 'Pass the iPad', hmPassSub: 'One player picks a secret word. The other guesses.', hmType: 'Type a secret word', hmClueOpt: 'Clue (optional)', hmReady: 'Ready! Pass the iPad', hmGuess: 'Guess the word!',
    hmLeft: 'Air bubbles left', hmWin: 'You got it!', hmLose: 'The bubbles ran out. The word was:', hmNextWord: 'Next word', hmOther: 'Other theme', hmTooShort: 'Use 3 to 12 letters.', hmAnother: 'Play again',
    hmPromoted: 'Harder words are ready for you next time!', hmOnlyLetters: 'Letters only, please.', hmLetter: 'Letter {l}', hmHideWord: 'Hide it', hmSecretSet: 'Secret word is hidden. Pass the iPad!', hmSolved: 'Solved',
  },
  es: {
    hmTitle: 'Ahorcado', hmPick: 'Elige un tema', hmLevel: 'Nivel', hmE: 'Fácil: palabras cortas, primera letra gratis', hmM: 'Medio: palabras más largas', hmH: 'Difícil: palabras grandes y menos burbujas',
    hmPass: 'Pasa el iPad', hmPassSub: 'Un jugador elige una palabra secreta. El otro la adivina.', hmType: 'Escribe una palabra secreta', hmClueOpt: 'Pista (opcional)', hmReady: '¡Listo! Pasa el iPad', hmGuess: '¡Adivina la palabra!',
    hmLeft: 'Burbujas de aire', hmWin: '¡Lo lograste!', hmLose: 'Se acabaron las burbujas. La palabra era:', hmNextWord: 'Siguiente palabra', hmOther: 'Otro tema', hmTooShort: 'Usa de 3 a 12 letras.', hmAnother: 'Jugar otra vez',
    hmPromoted: '¡La próxima vez te esperan palabras más difíciles!', hmOnlyLetters: 'Solo letras, por favor.', hmLetter: 'Letra {l}', hmHideWord: 'Ocultar', hmSecretSet: 'La palabra secreta está oculta. ¡Pasa el iPad!', hmSolved: 'Resuelta',
  },
});

const LIVES = { 1: 8, 2: 7, 3: 6 };
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
  const bubbles = h('div', { class: 'bubbles', role: 'img' });
  const scene = h('div', { class: 'hmscene' }, sceneSvg(), bubbles, h('small', {}, t('hmLeft')));
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
    msg.replaceChildren(h('span', { html: won ? icons.check(34) : icons.bulb(34) }), h('div', {}, h('strong', {}, won ? t('hmWin') : t('hmLose') + ' ' + word.toUpperCase()), fact ? h('p', { class: 'why' }, fact) : null, canSpeak() ? h('button', { class: 'btn ghost small', onclick: () => speak(word + '. ' + (fact || '')), html: icons.speaker(28) }) : null));
    draw();
    onEnd(won, msg);
  }
  draw();
  const left = h('div', { class: 'stack' }, scene);
  const right = h('div', { class: 'stack' }, clue ? clueEl : null, slotsEl, keysEl, msg);
  el.append(h('div', { class: 'hmplay' }, left, right));
  return { msg };
}

function sceneSvg() {
  const d = document.createElement('div');
  d.innerHTML = `<svg viewBox="0 0 300 180" role="img" aria-label="Submarine under the sea">
  <rect width="300" height="180" rx="10" fill="#0B3C57"/>
  <path d="M0 150c30-12 60-12 90 0s60 12 90 0 60-12 120 0v30H0z" fill="#0B6B78"/>
  <path d="M22 160c4-30 8-44 6-66M32 160c-1-20 2-34 8-44" stroke="#FF8A5B" stroke-width="5" stroke-linecap="round" fill="none"/>
  <ellipse cx="150" cy="86" rx="62" ry="30" fill="#FFD166" stroke="#EAF5F3" stroke-width="4"/>
  <rect x="136" y="48" width="30" height="20" rx="8" fill="#FFD166" stroke="#EAF5F3" stroke-width="4"/>
  <circle cx="126" cy="86" r="10" fill="#9AD7E8" stroke="#10303B" stroke-width="3"/><circle cx="150" cy="86" r="10" fill="#9AD7E8" stroke="#10303B" stroke-width="3"/><circle cx="174" cy="86" r="10" fill="#9AD7E8" stroke="#10303B" stroke-width="3"/>
  <path d="M212 86l18-12v24z" fill="#FF8A5B" stroke="#EAF5F3" stroke-width="3"/>
  <path d="M242 128c8-10 18-14 30-12-2 8-4 14-8 18-8 0-16-2-22-6z" fill="#EAF5F3" opacity=".9"/>
  <circle cx="86" cy="50" r="5" fill="none" stroke="#EAF5F3" stroke-width="2.5"/><circle cx="100" cy="30" r="3.5" fill="none" stroke="#EAF5F3" stroke-width="2.5"/><circle cx="76" cy="26" r="2.5" fill="none" stroke="#EAF5F3" stroke-width="2"/>
</svg>`;
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
      onEnd(won, msg) {
        let promoted = false;
        if (won) { markSolved('hm', w.key); promoted = recordWin('hm', tier); } else recordLoss('hm');
        save();
        const b = awardBadges();
        msg.append(h('div', { class: 'row', style: { flexBasis: '100%', marginTop: '10px' } },
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
      onEnd(won, msg) { if (won) { recordWin('hm', 1); save(); } msg.append(h('div', { class: 'row', style: { flexBasis: '100%', marginTop: '10px' } }, h('button', { class: 'btn', onclick: () => { secret = ''; clue = ''; setup(); } }, t('hmAnother')), h('a', { class: 'btn ghost', href: '#/hangman' }, t('back')))); } });
  }
  setup();
}
