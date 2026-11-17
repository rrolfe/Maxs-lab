// Number Patterns (new Nov 17 2026). Ten puzzles per run; every 3rd or 4th one is a silly "twist". Numbers first, no finger counting.
// Puzzle maker: js/quiz/patterns.js (pure, unit-tested). Pictures: pat-visuals.js. Level and cards: progress/newgames.js.
import { S, save, day, addPearls, losePearls } from '../core/store.js';
import { h, clear, confetti, flyPoints, flyLoss } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings, L } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx, speak, canSpeak, stopSpeaking } from '../core/audio.js';
import { makeRound, MAX_LEVEL } from '../quiz/patterns.js';
import { REWARD, payFor, penaltyFor } from '../core/economy.js';
import { awardBadges } from '../core/badges.js';
import { buildStage, hintVisual } from './pat-visuals.js';
import { patLevel, adaptPat, recordPat, rollCard, cardsOwned, CARD_TOTAL, CRITTERS, markPlayed, firstToday } from '../progress/newgames.js';

addStrings({
  en: {
    tilePatterns: 'Number Patterns', tilePatternsSub: 'Spot it. Solve it. Win cards!', patterns: 'Number Patterns',
    patTitle: 'Number Patterns', patIntro: '10 puzzles, about 4 minutes. Every few puzzles, something silly happens!', patPlay: 'Play!', patLevelN: 'Pattern level {n}',
    patTip: 'Brain tip: look for the pattern first. Your brain is faster than your fingers!', patCardsH: 'My critter cards', patCardsN: '{n} of {m} collected. Finish a run to win a card!',
    patTwist: 'Surprise puzzle!', tw_cards: 'Critter Cards', tw_chomp: 'Feed the Chomper', tw_flash: 'Quick Look', tw_frog: 'Frog Hops', tw_scale: 'Balance Scale', tw_odd: 'Glitch Hunt', tw_machine: 'Number Machine',
    patQuit: 'Leave', patType: 'Type your answer', patNotYet: 'Not yet. Try again, or tap Hint. (Wrong picks cost a few pearls.)',
    patOk: ['Correct!', 'You got it!', 'Yes!', 'Nailed it!', 'That’s right!', 'Pattern spotted!'], patOkHint: 'Good use of the hint. Try spotting the pattern yourself next time.', patOkTwist: 'Awesome! A silly one, solved!',
    patShow: 'Here is the answer', patDone: 'Run complete!', patRight: '{a} of {b} on the first try', patBonusRun: 'Run bonus', patBonusPerfect: 'Perfect bonus', patBonusFirst: 'First run today',
    patLevelUp: 'Pattern level {n}!', patLevelUpNote: 'The puzzles are trickier now. Some will stump you, and that’s the point.', patNewCard: 'New card: {name}!', patNewRare: 'RARE card: {name}!', patSameCard: '{name} again!',
    patAgain: 'Play again', patDoneToday: 'Done for today', patNewTag: 'NEW', patRareTag: 'RARE ✦', patCardBook: 'Critter cards',
    qOf: '{i} of {n}', stars: '{n} of 3 stars', newPearls: '+{n} pearls',
  },
  es: {
    tilePatterns: 'Patrones de números', tilePatternsSub: '¡Descúbrelo, resuélvelo y gana cartas!', patterns: 'Patrones de números',
    patTitle: 'Patrones de números', patIntro: '10 acertijos, unos 4 minutos. ¡De vez en cuando pasa algo divertido!', patPlay: '¡Jugar!', patLevelN: 'Nivel de patrones {n}',
    patTip: 'Consejo: primero busca el patrón. ¡Tu cerebro es más rápido que tus dedos!', patCardsH: 'Mis cartas de criaturas', patCardsN: '{n} de {m} reunidas. ¡Termina una ronda para ganar una carta!',
    patTwist: '¡Acertijo sorpresa!', tw_cards: 'Cartas de criaturas', tw_chomp: 'Alimenta al Tragón', tw_flash: 'Vistazo rápido', tw_frog: 'Saltos de rana', tw_scale: 'La balanza', tw_odd: 'Caza del error', tw_machine: 'La máquina de números',
    patQuit: 'Salir', patType: 'Escribe tu respuesta', patNotYet: 'Todavía no. Inténtalo otra vez o toca Pista. (Las respuestas equivocadas cuestan unas perlas.)',
    patOk: ['¡Correcto!', '¡Lo lograste!', '¡Sí!', '¡Exacto!', '¡Así es!', '¡Patrón descubierto!'], patOkHint: 'Buen uso de la pista. La próxima vez intenta descubrir el patrón tú.', patOkTwist: '¡Genial! ¡Un acertijo divertido resuelto!',
    patShow: 'Esta es la respuesta', patDone: '¡Ronda completa!', patRight: '{a} de {b} al primer intento', patBonusRun: 'Bono de ronda', patBonusPerfect: 'Bono perfecto', patBonusFirst: 'Primera ronda de hoy',
    patLevelUp: '¡Nivel de patrones {n}!', patLevelUpNote: 'Ahora los acertijos son más difíciles. Algunos te harán pensar mucho, y de eso se trata.', patNewCard: '¡Carta nueva: {name}!', patNewRare: '¡Carta RARA: {name}!', patSameCard: '¡{name} otra vez!',
    patAgain: 'Jugar otra vez', patDoneToday: 'Listo por hoy', patNewTag: 'NUEVA', patRareTag: 'RARA ✦', patCardBook: 'Cartas de criaturas',
    qOf: '{i} de {n}', stars: '{n} de 3 estrellas', newPearls: '+{n} perlas',
  },
});

// replaceChildren() turns a null child into the text "null", so empty slots are dropped first
const setKids = (el, ...kids) => el.replaceChildren(...kids.flat(Infinity).filter((k) => k != null && k !== false));

export function mount(el, { parts }) {
  if (parts[0] !== 'play') return menu(el);
  let cur = null;
  const start = () => { cur?.(); clear(el); cur = run(el, start); };
  start();
  return () => { cur?.(); };
}

// ---------------------------------------------------------------- menu
const cardTile = (c, own) => own
  ? h('div', { class: 'bk have' + (c.rare ? ' rare' : ''), title: L(c.n) }, h('span', {}, c.e), h('small', {}, L(c.n)))
  : h('div', { class: 'bk' + (c.rare ? ' rare' : '') }, h('span', {}, '?'), h('small', {}, c.rare ? '✦' : ''));
function menu(el) {
  const lv = patLevel();
  const pips = h('span', { class: 'pips', role: 'img', 'aria-label': t('patLevelN', { n: lv }), style: { '--tc': 'var(--c-math)' } }, Array.from({ length: MAX_LEVEL }, (_, i) => h('i', { class: i < lv ? 'on' : '' })));
  el.append(
    h('div', { class: 'screen-head' }, h('h1', {}, t('patTitle'))),
    h('div', { class: 'pathero card' },
      h('div', { class: 'ph', html: icons.patterns(104) }),
      h('div', { class: 'pt' }, h('p', { class: 'big' }, t('patIntro')), h('div', { class: 'row', style: { gap: '12px' } }, pips, h('strong', {}, t('patLevelN', { n: lv }))), h('p', { class: 'muted small', style: { margin: '8px 0 0' } }, t('patTip'))),
      h('a', { class: 'btn gold', href: '#/patterns/play', onclick: () => sfx.pop() }, t('patPlay'))),
    h('h2', { style: { marginTop: '26px' } }, t('patCardsH')), h('p', { class: 'muted' }, t('patCardsN', { n: cardsOwned(), m: CARD_TOTAL })),
    h('div', { class: 'cardbook' }, CRITTERS.map((c) => cardTile(c, !!S.patterns.cards[c.id]))));
}

// ---------------------------------------------------------------- a run
function run(el, again) {
  let dead = false;
  const timers = [];
  const startLevel = patLevel();
  const items = makeRound({ level: startLevel, lang: S.lang, size: 10, recent: S.patterns.recent });
  let i = 0, roundPts = 0, firstTry = 0, curStage = null;

  const dots = h('div', { class: 'dots', role: 'img' });
  const earn = h('span', { class: 'chip' }, h('span', { html: icons.pearl(28) }), h('span', { id: 'round-pts' }, '0'));
  const head = h('div', { class: 'qhead' },
    h('button', { class: 'btn ghost icon', 'aria-label': t('patQuit'), onclick: () => { stopSpeaking(); go('/patterns'); }, html: icons.close(32) }),
    h('div', { class: 'qtitle' }, h('span', { html: icons.patterns(36) }), h('strong', {}, t('patTitle'))), dots, earn);
  const stageBox = h('div', { class: 'qstage' });
  el.append(head, stageBox);

  const drawDots = () => {
    dots.replaceChildren(...items.map((q, k) => h('i', { class: (k < i ? 'done ' : '') + (k === i ? 'cur ' : '') + (q.twist ? 'boss' : '') })));
    dots.setAttribute('aria-label', t('qOf', { i: Math.min(i + 1, items.length), n: items.length }));
  };

  function showQuestion() {
    if (dead) return;
    if (curStage) { curStage.cleanup(); curStage = null; }
    if (i >= items.length) return finish();
    drawDots();
    const q = items[i];
    if (window.__lab) window.__lab.q = q;   // test hook
    const st = { attempts: 0, hinted: 0, sel: null, typed: '', t0: performance.now(), locked: true, over: false, wrong: new Set(), lost: 0 };
    const hold = setTimeout(() => { st.locked = false; }, 400);   // ignore leftover touches from the last screen
    timers.push(hold);
    const nOpts = q.type === 'choice' ? q.opts.length : 4;
    const baseP = q.twist ? REWARD.pat.twist : REWARD.pat.core;

    const feedback = h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const hintBox = h('div', { class: 'hintbox col', hidden: true });
    const checkBtn = h('button', { class: 'btn', disabled: true, onclick: () => evaluate() }, t('check'));
    const nextBtn = h('button', { class: 'btn alt', hidden: true, onclick: () => advance() }, t('next'));
    const hintBtn = h('button', { class: 'btn ghost', onclick: () => giveHint() }, h('span', { html: icons.bulb(32) }), t('hint'));
    const speakBtn = (S.speak && canSpeak()) ? h('button', { class: 'btn ghost icon', 'aria-label': t('readAloud'), onclick: () => speak(q.say), html: icons.speaker(34) }) : null;

    const api = {
      pick: (k) => { if (st.locked || st.over || st.wrong.has(k)) return; sfx.tap(); st.sel = k; stg.select(k); gridSelect(k); checkBtn.disabled = false; },
      hinted: () => { st.hinted++; },
    };
    const stg = buildStage(q, api);
    curStage = stg;

    // ---- answer area: a grid of number buttons, a keypad, or nothing (the picture holds the choices)
    let grid = null, disp = null, pad = null;
    const gridSelect = (k) => { if (grid) grid.querySelectorAll('.ans').forEach((x) => x.classList.toggle('sel', +x.dataset.k === k)); };
    let answerEl = null;
    if (q.type === 'choice' && !q.inline) {
      grid = h('div', { class: 'answers numgrid' }, q.opts.map((txt, k) => h('button', { class: 'ans numopt', 'data-k': k, onclick: () => api.pick(k) }, h('span', { class: 'lab' }, txt))));
      answerEl = grid;
    } else if (q.type === 'number') {
      disp = h('div', { class: 'numdisp', role: 'textbox', 'aria-label': t('patType') }, h('span', { class: 'ph' }, '?'));
      const show = () => { disp.replaceChildren(st.typed ? st.typed : h('span', { class: 'ph' }, '?')); checkBtn.disabled = !st.typed; };
      const press = (k) => { if (st.locked || st.over) return; sfx.tap(); if (k === 'del') st.typed = st.typed.slice(0, -1); else if (st.typed.length < 8) st.typed += k; show(); };
      const keys = ['7', '8', '9', 'del', '4', '5', '6', '', '1', '2', '3', '', '0'];
      pad = h('div', { class: 'keypad' }, keys.map((k) => (k === '' ? h('span') : h('button', { class: 'key' + (k === 'del' ? ' del' : '') + (k === '0' ? ' zero' : ''), 'aria-label': k === 'del' ? 'Delete' : k, onclick: () => press(k) }, k === 'del' ? '⌫' : k))));
      answerEl = h('div', { class: 'numui' }, disp, pad);
      st.refresh = show;
    }

    const twistChip = q.twist ? h('span', { class: 'chip on' }, h('span', { html: icons.star(24) }), t('patTwist') + ' ' + t('tw_' + q.twist)) : null;
    const qcard = h('div', { class: 'qcard patcard' + (q.twist ? ' twist' : '') },
      h('div', { class: 'row', style: { gap: '10px' } }, twistChip, h('span', { style: { flex: 1 } }), speakBtn),
      h('h2', { class: 'qtext pattitle' }, q.title), stg.el);
    stageBox.replaceChildren(h('div', { class: 'qlayout pat' }, qcard, h('div', { class: 'qright' }, answerEl, feedback, hintBox,
      h('div', { class: 'qfoot' }, hintBtn, h('span', { style: { flex: 1 } }), checkBtn, nextBtn))));
    stg.start();

    // ---- hints: 1) the idea, with a picture; 2) on choices, two wrong answers fade away
    function giveHint() {
      if (st.over) return; sfx.pop();
      st.hinted++;
      if (st.hinted === 1) {
        hintBox.hidden = false;
        setKids(hintBox, h('div', { class: 'row', style: { gap: '12px', flexWrap: 'nowrap' } }, h('span', { html: icons.bulb(30) }), h('span', {}, q.hint)), hintVisual(q));
        stg.hint();
      } else if (st.hinted === 2 && q.type === 'choice') eliminate();
      if (st.hinted >= 2 || q.type !== 'choice') hintBtn.disabled = true;
      else hintBtn.lastChild.textContent = t('hint') + ' 2';
    }
    function eliminate() {
      const ks = q.opts.map((_, k) => k).filter((k) => k !== q.a && k !== st.sel && !st.wrong.has(k));
      ks.sort(() => Math.random() - 0.5).slice(0, q.opts.length >= 5 ? 2 : 1 + (q.opts.length >= 4 ? 1 : 0)).forEach((k) => {
        st.wrong.add(k);
        if (grid) { const b = grid.querySelector(`[data-k="${k}"]`); b.disabled = true; b.classList.add('gone'); } else stg.mark(k, 'gone');
      });
    }

    // ---- checking
    const isRight = () => (q.type === 'number' ? Math.abs(parseFloat(st.typed) - q.a) < 1e-9 : st.sel === q.a);
    function evaluate() {
      if (st.locked || st.over) return;
      st.attempts++;
      const ms = performance.now() - st.t0;
      if (isRight()) {
        st.over = true;
        const pay = payFor(nOpts, baseP, st.attempts - 1);
        const pts = st.hinted ? Math.floor(pay / 2) : pay;
        const success = st.attempts === 1 && !st.hinted ? 1 : 0.6;
        if (success === 1) firstTry++;
        roundPts += pts;
        const res = addPearls(pts); if (res.got) flyPoints(checkBtn, res.got);
        document.getElementById('round-pts').textContent = Math.max(0, roundPts);
        recordPat(q, success); adaptPat(q, success, ms);
        if (grid) { const b = grid.querySelector(`[data-k="${st.sel}"]`); b.classList.remove('sel'); b.classList.add('right', 'pop'); grid.querySelectorAll('.ans').forEach((x) => (x.disabled = true)); }
        if (disp) { disp.classList.add('right', 'pop'); pad.querySelectorAll('button').forEach((b) => (b.disabled = true)); }
        stg.right(q.val, q.a);
        sfx[q.twist ? 'hardCorrect' : 'correct']();
        if (q.twist) confetti(innerWidth / 2, innerHeight / 2.5);
        const praise = st.hinted ? t('patOkHint') : q.twist ? t('patOkTwist') : pick(t('patOk'));
        feedback.className = 'feedback good'; setKids(feedback, h('span', { html: icons.check(34) }), h('span', {}, praise), pts ? h('b', { class: 'plus' }, '+' + pts) : null);
        const needRead = q.twist || st.attempts > 1 || st.hinted;
        if (needRead) feedback.append(h('p', { class: 'why' }, q.why));
        checkBtn.hidden = true; hintBtn.hidden = true; nextBtn.hidden = false; nextBtn.focus?.({ preventScroll: true });
        if (!needRead) { st.auto = setTimeout(advance, 1400); timers.push(st.auto); }   // tapping Next first must not also fire this
        return;
      }
      // a wrong pick costs a few pearls (so blind guessing loses), then a second try, then the answer is shown
      sfx.wrong();
      const lost = losePearls(penaltyFor(nOpts, baseP)); roundPts -= lost; st.lost += lost;
      document.getElementById('round-pts').textContent = Math.max(0, roundPts);
      if (lost) flyLoss(checkBtn, lost);
      const lay = stageBox.querySelector('.qlayout'); lay.classList.remove('wobble'); void lay.offsetWidth; lay.classList.add('wobble');
      if (st.attempts >= 2) return reveal();
      if (grid) { const b = grid.querySelector(`[data-k="${st.sel}"]`); b.classList.remove('sel'); b.classList.add('try'); b.disabled = true; st.wrong.add(st.sel); st.sel = null; }
      else if (q.inline) { stg.mark(st.sel, 'try'); st.wrong.add(st.sel); st.sel = null; }
      else { st.typed = ''; st.refresh(); }
      feedback.className = 'feedback try'; setKids(feedback, h('span', { html: icons.bulb(34) }), h('span', {}, t('patNotYet')), lost ? h('b', { class: 'minus' }, '−' + lost) : null);
      checkBtn.disabled = true; hintBtn.classList.add('nudge');
    }
    function reveal() {
      if (st.over) return; st.over = true;
      recordPat(q, 0); adaptPat(q, 0, performance.now() - st.t0);
      if (grid) { grid.querySelectorAll('.ans').forEach((x) => { x.disabled = true; x.classList.remove('sel'); if (+x.dataset.k === q.a) x.classList.add('right'); }); }
      if (disp) { disp.replaceChildren(String(q.a)); disp.classList.add('right'); pad.querySelectorAll('button').forEach((b) => (b.disabled = true)); }
      stg.reveal(q.val, q.a);
      feedback.className = 'feedback try'; setKids(feedback, h('span', { html: icons.bulb(34) }), h('div', {}, h('strong', {}, t('patShow')), h('p', { class: 'why' }, q.why)), st.lost ? h('b', { class: 'minus' }, '−' + st.lost) : null);
      checkBtn.hidden = true; hintBtn.hidden = true; nextBtn.hidden = false; nextBtn.disabled = true;
      timers.push(setTimeout(() => { nextBtn.disabled = false; }, 1500));
    }
    function advance() { if (dead || st.moved) return; st.moved = true; clearTimeout(st.auto); i++; showQuestion(); }
  }

  const pick = (arr) => (Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : arr);

  // ---------------------------------------------------------------- the end of a run
  function finish() {
    stopSpeaking();
    const total = items.length;
    const stars = firstTry >= Math.ceil(total * 0.8) ? 3 : firstTry >= Math.ceil(total * 0.5) ? 2 : 1;
    const R = REWARD.pat; let bonus = R.runDone; const lines = [[t('patBonusRun'), R.runDone]];
    if (firstTry === total) { bonus += R.perfect; lines.push([t('patBonusPerfect'), R.perfect]); }
    if (firstToday('patterns')) { bonus += R.firstToday; lines.push([t('patBonusFirst'), R.firstToday]); }
    const P = S.patterns; P.runs++; P.best = Math.max(P.best || 0, firstTry);
    const got = addPearls(bonus).got;
    const { card, isNew } = rollCard(firstTry, total);
    markPlayed('patterns');
    const up = patLevel() > startLevel;
    save();
    if (stars === 3) confetti(innerWidth / 2, innerHeight / 3);
    sfx[up ? 'levelUp' : 'fanfare']();
    const newBadges = awardBadges();
    const reveal = h('div', { class: 'wincard' + (card.rare ? ' rare' : '') },
      h('span', { class: 'wctag' }, isNew ? t('patNewTag') : '×' + S.patterns.cards[card.id]), card.rare ? h('span', { class: 'wcrare' }, t('patRareTag')) : null, h('span', { class: 'wce' }, card.e), h('strong', {}, L(card.n)));
    const left = h('div', { class: 'sumleft' },
      h('div', { html: icons.trophy(64) }), h('h1', {}, t('patDone')),
      h('div', { class: 'stars', role: 'img', 'aria-label': t('stars', { n: stars }) }, [1, 2, 3].map((n) => h('span', { html: n <= stars ? icons.star(52) : icons.starOff(52) }))),
      h('p', { class: 'big' }, t('patRight', { a: firstTry, b: total })),
      h('div', { class: 'tally' }, h('span', { html: icons.pearl(36) }), h('strong', {}, t('newPearls', { n: Math.max(0, roundPts) + got })), h('small', { class: 'muted' }, lines.map(([a, b]) => `${a} +${b}`).join(' · '))));
    const right = h('div', { class: 'sumright' },
      reveal, h('p', { class: 'center', style: { margin: 0, fontWeight: 700 } }, isNew ? t(card.rare ? 'patNewRare' : 'patNewCard', { name: L(card.n) }) : t('patSameCard', { name: L(card.n) })),
      up ? h('p', { class: 'levelup' }, h('span', { html: icons.star(34) }), t('patLevelUp', { n: patLevel() })) : null, up ? h('p', { class: 'muted small', style: { margin: 0 } }, t('patLevelUpNote')) : null,
      newBadges.map((b) => h('p', { class: 'levelup' }, h('span', { html: icons.trophy(34) }), b)));
    stageBox.replaceChildren(h('div', { class: 'summary card patsum' },
      h('div', { class: 'sumcols' }, left, right),
      h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '10px' } },
        h('button', { class: 'btn', onclick: () => again() }, t('patAgain')),
        h('a', { class: 'btn ghost', href: '#/home' }, t('patDoneToday')))));
  }

  showQuestion();
  return () => { dead = true; timers.forEach(clearTimeout); curStage?.cleanup(); stopSpeaking(); };
}
