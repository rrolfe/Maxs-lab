import { S, TOPICS, levelOf, addPearls, losePearls, today, day, save } from '../core/store.js';
import { h, clear, sleep, confetti, flyPoints, flyLoss, toast } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx, speak, canSpeak, stopSpeaking } from '../core/audio.js';
import { dailyMissions, MISSIONS, TOPIC_META } from '../quiz/missions.js';
import { buildRound, prepare, pointsFor, penaltyOf, recordAnswer } from '../quiz/engine.js';
import { allDoneCard } from '../games/common.js';
import { REWARD } from '../core/economy.js';
import { awardBadges } from '../core/badges.js';

addStrings({
  en: {
    quizTitle: 'Quiz Missions', todays: 'Today’s missions', pickSubject: 'Practice a subject', level: 'Level {n}', questions8: '8 questions · about 4 minutes',
    dive: 'First mission today: +15 pearls bonus!', goMission: 'Go', boss: 'Stretch question', bossNote: 'Tricky on purpose! A miss costs a few pearls, so think first.',
    notYet: 'Not yet. Try again, or tap Hint. (Wrong picks cost a few pearls.)', notYet2: 'Not yet. Look again!', correct: 'Correct!', correctHard: 'Nice thinking! That was a tough one.', correctHint: 'Good use of the hint. Try spotting that clue yourself next time.',
    correctN: ['Correct!', 'You got it!', 'Yes!', 'Nailed it!', 'That’s right!'],
    showAnswer: 'Here is the answer', hintTitle: 'Hint', hintNone: 'Read it slowly and picture it.', dadQ: 'Dad’s question', tapOrder: 'Tap the items in the right order.',
    yourOrder: 'Your order', clear: 'Undo', qOf: '{i} of {n}', roundDone: 'Mission complete!', stars: '{n} of 3 stars', newPearls: '+{n} pearls',
    bonusFinish: 'Mission bonus', bonusPerfect: 'Perfect bonus', bonusDive: 'First mission today', levelUp: 'New level: {topic} → Level {n}!',
    levelUpNote: 'These questions are harder now. Some will stump you, and that’s the point.', another: 'Another mission', playGame: 'Play a game', doneToday: 'Done for today',
    loadingQ: 'Finding great questions…', trueL: 'True', falseL: 'False', quitQ: 'Leave mission', typeAnswer: 'Type your answer', noQuestions: 'No questions found. Try another mission.', allDoneQs: 'You have answered every question in this mission! Try another mission, or tell Dad you need MORE questions to keep going!',
    rightOf: '{a} of {b} on the first try',
  },
  es: {
    quizTitle: 'Misiones de preguntas', todays: 'Misiones de hoy', pickSubject: 'Practica una materia', level: 'Nivel {n}', questions8: '8 preguntas · unos 4 minutos',
    dive: 'Primera misión de hoy: ¡+15 perlas de bonificación!', goMission: 'Ir', boss: 'Pregunta de reto', bossNote: '¡Es difícil a propósito! Si fallas pierdes unas perlas, así que piensa primero.',
    notYet: 'Todavía no. Inténtalo otra vez o toca Pista. (Las respuestas equivocadas cuestan unas perlas.)', notYet2: 'Todavía no. ¡Mira otra vez!', correct: '¡Correcto!', correctHard: '¡Buen razonamiento! Esa era difícil.', correctHint: 'Buen uso de la pista. La próxima vez intenta descubrirla tú.',
    correctN: ['¡Correcto!', '¡Lo lograste!', '¡Sí!', '¡Exacto!', '¡Así es!'],
    showAnswer: 'Esta es la respuesta', hintTitle: 'Pista', hintNone: 'Léela despacio e imagínala.', dadQ: 'Pregunta de Papá', tapOrder: 'Toca los elementos en el orden correcto.',
    yourOrder: 'Tu orden', clear: 'Deshacer', qOf: '{i} de {n}', roundDone: '¡Misión cumplida!', stars: '{n} de 3 estrellas', newPearls: '+{n} perlas',
    bonusFinish: 'Bono de misión', bonusPerfect: 'Bono perfecto', bonusDive: 'Primera misión de hoy', levelUp: 'Nuevo nivel: {topic} → Nivel {n}.',
    levelUpNote: 'Ahora las preguntas son más difíciles. Algunas te harán pensar mucho, y de eso se trata.', another: 'Otra misión', playGame: 'Jugar un juego', doneToday: 'Listo por hoy',
    loadingQ: 'Buscando buenas preguntas…', trueL: 'Verdadero', falseL: 'Falso', quitQ: 'Salir de la misión', typeAnswer: 'Escribe tu respuesta', noQuestions: 'No hay preguntas. Prueba otra misión.', allDoneQs: '¡Ya respondiste todas las preguntas de esta misión! Prueba otra misión, o dile a papá que necesitas MÁS preguntas para seguir.',
    rightOf: '{a} de {b} al primer intento',
  },
});

export async function mount(el, { parts }) {
  if (parts[0] === 'mission') return runRound(el, { mission: parts[1] || 'mix' });
  if (parts[0] === 'topic') return runRound(el, { topic: parts[1], mission: 'mix' });
  return menu(el);
}

// ---------------- menu ----------------
function menu(el) {
  const dive = S.mission.lastDay !== today();
  const missions = dailyMissions().map((id) => {
    const m = MISSIONS[id];
    return h('a', { class: 'mission', href: '#/quiz/mission/' + id, style: { '--mc': m.color } },
      h('span', { class: 'mi', html: icons[m.icon](60) }),
      h('span', { class: 'mt' }, h('strong', {}, t('m_' + id)), h('small', {}, t('m_' + id + '_s')), h('small', { class: 'dim' }, t('questions8'))),
      h('span', { class: 'btn small' }, t('goMission')));
  });
  const topics = TOPICS.map((tp) => {
    const lv = levelOf(tp);
    const pips = h('span', { class: 'pips', role: 'img', 'aria-label': t('level', { n: lv }) }, [1, 2, 3, 4, 5, 6].map((n) => h('i', { class: n <= lv ? 'on' : '' })));
    return h('a', { class: 'topic', href: '#/quiz/topic/' + tp, style: { '--tc': `var(--c-${tp})` } },
      h('span', { html: icons[TOPIC_META[tp].icon](44) }), h('strong', {}, t(TOPIC_META[tp].key)), pips, h('small', {}, t('level', { n: lv })));
  });
  el.append(
    h('div', { class: 'screen-head' }, h('h1', {}, t('quizTitle'))),
    dive ? h('p', { class: 'chip on' }, t('dive')) : null,
    h('h2', {}, t('todays')), h('div', { class: 'missions' }, missions),
    h('h2', { style: { marginTop: '28px' } }, t('pickSubject')), h('div', { class: 'topics' }, topics));
}

// ---------------- round runner ----------------
const cap = (s) => s;
async function runRound(el, { mission, topic }) {
  let dead = false;
  const cleanups = [];
  el.append(h('p', { class: 'center muted', style: { padding: '30vh 0' } }, t('loadingQ')));
  let items;
  try { items = await buildRound({ mission, topic }); } catch (e) { console.error(e); items = []; }
  if (dead) return;
  clear(el);
  if (!items.length) { el.append(allDoneCard('allDoneQs', '#/quiz')); return; }

  const startLevels = Object.fromEntries(TOPICS.map((tp) => [tp, levelOf(tp)]));
  let i = 0, roundPts = 0, firstTry = 0, answered = 0;
  const queue = items.slice();
  const title = topic ? t(TOPIC_META[topic].key) : t('m_' + mission);
  const meta = topic ? TOPIC_META[topic] : MISSIONS[mission];
  const requeued = new Set();

  const dots = h('div', { class: 'dots', role: 'img' });
  const earn = h('span', { class: 'chip' }, h('span', { html: icons.pearl(28) }), h('span', { id: 'round-pts' }, '0'));
  const head = h('div', { class: 'qhead' },
    h('button', { class: 'btn ghost icon', 'aria-label': t('quitQ'), onclick: () => { stopSpeaking(); go('/quiz'); }, html: icons.close(32) }),
    h('div', { class: 'qtitle' }, h('span', { html: icons[meta.icon](36) }), h('strong', {}, title)), dots, earn);
  const stage = h('div', { class: 'qstage' });
  el.append(head, stage);

  function drawDots() {
    dots.replaceChildren(...queue.map((q, k) => h('i', { class: (k < i ? 'done ' : '') + (k === i ? 'cur ' : '') + (q.slot === 'boss' ? 'boss' : '') })));
    dots.setAttribute('aria-label', t('qOf', { i: Math.min(i + 1, queue.length), n: queue.length }));
  }

  function showQuestion() {
    if (dead) return;
    if (i >= queue.length) return finish();
    drawDots();
    const q = prepare(queue[i]);
    const st = { attempts: 0, hinted: 0, sel: null, placed: [], typed: '', t0: performance.now(), locked: true, over: false, wrong: new Set(), timers: [] };
    setTimeout(() => { st.locked = false; }, 400);       // ignore "holdover" touches from the last screen

    const feedback = h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const hintBox = h('div', { class: 'hintbox', hidden: true });
    const checkBtn = h('button', { class: 'btn', disabled: true, onclick: () => evaluate() }, t('check'));
    const nextBtn = h('button', { class: 'btn alt', hidden: true, onclick: () => advance() }, t('next'));
    const hintBtn = h('button', { class: 'btn ghost', onclick: () => giveHint() }, h('span', { html: icons.bulb(32) }), t('hint'));
    const showBtn = h('button', { class: 'btn ghost', hidden: true, onclick: () => reveal(0) }, t('show'));
    const speakBtn = (S.speak && canSpeak()) ? h('button', { class: 'btn ghost icon', 'aria-label': t('readAloud'), onclick: () => speak(q.q + (S.lang === 'es' && q.shown ? '. ' + q.shown.join('. ') : '')), html: icons.speaker(34) }) : null;
    const topicMeta = TOPIC_META[q.topic];
    const badges = [
      topicMeta ? h('span', { class: 'chip', style: { borderColor: `var(--c-${q.topic})` } }, h('span', { html: icons[topicMeta.icon](26) }), t(topicMeta.key)) : null,
      q.dad ? h('span', { class: 'chip on' }, t('dadQ')) : null,
      q.slot === 'boss' ? h('span', { class: 'chip on', title: t('bossNote') }, h('span', { html: icons.star(24) }), t('boss')) : null,
    ];
    const qcard = h('div', { class: 'qcard' }, h('div', { class: 'row', style: { gap: '10px' } }, badges, h('span', { style: { flex: 1 } }), speakBtn),
      h('h2', { class: 'qtext' }, q.q), q.type === 'order' ? h('p', { class: 'muted small' }, t('tapOrder')) : null, q.slot === 'boss' ? h('p', { class: 'muted small' }, t('bossNote')) : null);

    let answerUI;
    if (q.type === 'choice') answerUI = buildChoice(); else if (q.type === 'order') answerUI = buildOrder(); else answerUI = buildNumber();

    stage.replaceChildren(h('div', { class: 'qlayout ' + q.type }, qcard, h('div', { class: 'qright' }, answerUI.el, feedback, hintBox,
      h('div', { class: 'qfoot' }, hintBtn, showBtn, h('span', { style: { flex: 1 } }), checkBtn, nextBtn))));
    qcard.querySelector('.qtext').scrollIntoView?.({ block: 'nearest' });

    // ---- choice
    function buildChoice() {
      const two = q.shown.length === 2;
      const wrap = h('div', { class: 'answers' + (two ? ' two' : '') + (q.shown.some((s) => s.length > 34) ? ' long' : '') });
      q.shown.forEach((txt, k) => {
        const b = h('button', { class: 'ans', 'data-k': k, onclick: () => {
          if (st.locked || st.over || st.wrong.has(k)) return; sfx.tap();
          st.sel = k; wrap.querySelectorAll('.ans').forEach((x) => x.classList.toggle('sel', +x.dataset.k === k)); checkBtn.disabled = false;
        } }, h('span', { class: 'mark' }, two ? (txt === t('trueL') ? '✓' : '✗') : String.fromCharCode(65 + k)), h('span', { class: 'lab' }, txt));
        wrap.append(b);
      });
      return { el: wrap, isRight: () => st.sel === q.correctShown, wrongPick: () => { const b = wrap.querySelector(`[data-k="${st.sel}"]`); b.classList.remove('sel'); b.classList.add('try'); b.disabled = true; st.wrong.add(st.sel); st.sel = null; },
        showRight: () => { wrap.querySelectorAll('.ans').forEach((x) => { x.disabled = true; x.classList.remove('sel'); if (+x.dataset.k === q.correctShown) x.classList.add('right'); }); },
        markRight: () => { const b = wrap.querySelector(`[data-k="${st.sel}"]`); b.classList.remove('sel'); b.classList.add('right', 'pop'); wrap.querySelectorAll('.ans').forEach((x) => (x.disabled = true)); },
        hint2: () => { const wr = [...wrap.querySelectorAll('.ans')].filter((x) => +x.dataset.k !== q.correctShown && +x.dataset.k !== st.sel && !x.disabled); shuffleRemove(wr, q.shown.length === 2 ? 0 : q.shown.length >= 4 ? 2 : 1); } };
    }
    function shuffleRemove(list, n) { list.sort(() => Math.random() - 0.5).slice(0, n).forEach((x) => { x.disabled = true; x.classList.add('gone'); st.wrong.add(+x.dataset.k); }); }

    // ---- order
    function buildOrder() {
      const slots = h('div', { class: 'slots', 'aria-label': t('yourOrder') });
      const pool = h('div', { class: 'pool' });
      const undo = h('button', { class: 'btn ghost small', onclick: () => { if (st.locked || st.over) return; st.placed.pop(); redraw(); } }, t('clear'));
      function redraw() {
        slots.replaceChildren(...q.opts.map((_, k) => { const idx = st.placed[k]; return h('button', { class: 'slot' + (idx != null ? ' filled' : ''), onclick: () => { if (st.locked || st.over || idx == null) return; st.placed.splice(k, 1); redraw(); } }, h('span', { class: 'num' }, k + 1), idx != null ? h('span', { class: 'lab' }, q.opts[idx]) : null); }));
        pool.replaceChildren(...q.order.filter((idx) => !st.placed.includes(idx)).map((idx) => h('button', { class: 'tilechip', onclick: () => { if (st.locked || st.over) return; sfx.pop(); st.placed.push(idx); redraw(); } }, q.opts[idx])));
        checkBtn.disabled = st.placed.length !== q.opts.length; undo.disabled = !st.placed.length;
      }
      redraw();
      return { el: h('div', { class: 'orderui' }, slots, pool, undo), isRight: () => st.placed.every((v, k) => v === k),
        wrongPick: () => { st.placed = []; redraw(); }, showRight: () => { st.placed = q.opts.map((_, k) => k); redraw(); slots.querySelectorAll('.slot').forEach((s) => s.classList.add('right')); pool.replaceChildren(); undo.hidden = true; },
        markRight: () => { slots.querySelectorAll('.slot').forEach((s) => s.classList.add('right', 'pop')); undo.hidden = true; }, hint2: () => {} };
    }

    // ---- number
    function buildNumber() {
      const negOK = q.a < 0 || q.level >= 6, decOK = !Number.isInteger(q.a);
      const disp = h('div', { class: 'numdisp', role: 'textbox', 'aria-label': t('typeAnswer') }, h('span', { class: 'ph' }, '?'));
      const show = () => { disp.replaceChildren(st.typed ? st.typed : h('span', { class: 'ph' }, '?')); checkBtn.disabled = !st.typed || st.typed === '-' || st.typed === '.'; };
      const press = (k) => { if (st.locked || st.over) return; sfx.tap(); if (k === 'del') st.typed = st.typed.slice(0, -1); else if (k === '-') st.typed = st.typed.startsWith('-') ? st.typed.slice(1) : '-' + st.typed; else if (k === '.') { if (!st.typed.includes('.')) st.typed += st.typed ? '.' : '0.'; } else if (st.typed.length < 8) st.typed += k; show(); };
      const keys = ['7', '8', '9', 'del', '4', '5', '6', negOK ? '-' : '', '1', '2', '3', decOK ? '.' : '', '0'];
      const pad = h('div', { class: 'keypad' }, keys.map((k) => k === '' ? h('span') : h('button', { class: 'key' + (k === 'del' ? ' del' : '') + (k === '0' ? ' zero' : ''), 'aria-label': k === 'del' ? 'Delete' : k, onclick: () => press(k) }, k === 'del' ? '⌫' : k === '-' ? '−' : k)));
      show();
      return { el: h('div', { class: 'numui' }, disp, pad), isRight: () => Math.abs(parseFloat(st.typed) - q.a) < 1e-6,
        wrongPick: () => { st.typed = ''; show(); }, showRight: () => { st.typed = String(q.a); disp.replaceChildren(String(q.a)); disp.classList.add('right'); pad.querySelectorAll('button').forEach((b) => (b.disabled = true)); checkBtn.disabled = true; },
        markRight: () => { disp.classList.add('right', 'pop'); pad.querySelectorAll('button').forEach((b) => (b.disabled = true)); }, hint2: () => {} };
    }

    // ---- hint
    function giveHint() {
      if (st.over) return; sfx.pop();
      st.hinted++;
      if (st.hinted === 1) { hintBox.hidden = false; hintBox.replaceChildren(h('span', { html: icons.bulb(30) }), h('span', {}, q.hint || t('hintNone'))); }
      else if (st.hinted === 2 && q.type === 'choice') { answerUI.hint2(); hintBox.hidden = false; }
      else { hintBtn.disabled = true; }
      if (st.hinted >= 2 || q.type !== 'choice') hintBtn.disabled = true;
      if (st.hinted === 1 && q.type === 'choice') hintBtn.lastChild.textContent = t('hint') + ' 2';
    }

    // ---- evaluating
    function evaluate() {
      if (st.locked || st.over) return;
      st.attempts++;
      const ms = performance.now() - st.t0;
      if (answerUI.isRight()) {
        st.over = true;
        answerUI.markRight();
        const pts = (S.seen[q.id]?.ok || 0) >= 1 ? 0 : pointsFor(q, { wrong: st.attempts - 1, hinted: st.hinted > 0 });   // never pay twice for the same question
        const success = st.attempts === 1 && !st.hinted ? 1 : 0.6;
        if (success === 1) firstTry++;
        answered++;
        roundPts += pts;
        const res = addPearls(pts); if (res.got) flyPoints(checkBtn, res.got);
        document.getElementById('round-pts').textContent = roundPts;
        recordAnswer(q, success, { ms });
        const hard = q.slot === 'boss' || q.rel >= 0 && q.level >= 4;
        sfx[hard ? 'hardCorrect' : 'correct']();
        if (q.slot === 'boss') confetti(innerWidth / 2, innerHeight / 2.5);
        const praise = st.hinted ? t('correctHint') : (hard && success === 1) ? t('correctHard') : pickPraise();
        feedback.className = 'feedback good'; feedback.replaceChildren(h('span', { html: icons.check(34) }), h('span', {}, praise), pts ? h('b', { class: 'plus' }, '+' + pts) : null);
        const needRead = q.slot === 'boss' || q.fun;
        if (needRead && q.why) feedback.append(h('p', { class: 'why' }, q.why));
        checkBtn.hidden = true; hintBtn.hidden = true; showBtn.hidden = true; nextBtn.hidden = false; nextBtn.focus?.({ preventScroll: true });
        if (!needRead) st.timers.push(setTimeout(advance, 1500));
        return;
      }
      // wrong: a small, gentle loss so blind guessing does not pay
      sfx.wrong();
      const lost = losePearls(penaltyOf(q)); roundPts -= lost; st.lostTotal = (st.lostTotal || 0) + lost;
      document.getElementById('round-pts').textContent = Math.max(0, roundPts);
      if (lost) flyLoss(checkBtn, lost);
      stage.querySelector('.qlayout').classList.remove('wobble'); void stage.offsetWidth; stage.querySelector('.qlayout').classList.add('wobble');
      if (st.attempts >= 2 || q.type === 'number' && st.attempts >= 2) return reveal(0);
      answerUI.wrongPick();
      feedback.className = 'feedback try'; feedback.replaceChildren(h('span', { html: icons.bulb(34) }), h('span', {}, t('notYet')), lost ? h('b', { class: 'minus' }, '−' + lost) : null);
      checkBtn.disabled = true; showBtn.hidden = false;
      hintBtn.classList.add('nudge');
    }

    function reveal(success) {
      if (st.over) return; st.over = true;
      const ms = performance.now() - st.t0; answered++;
      recordAnswer(q, 0, { ms });
      answerUI.showRight();
      if (!requeued.has(q.id) && queue.length < 11 && q.slot !== 'boss') { requeued.add(q.id); queue.splice(Math.min(i + 4, queue.length), 0, { ...queue[i], slot: 'easy', rel: -1, redo: true }); }
      feedback.className = 'feedback try'; feedback.replaceChildren(h('span', { html: icons.bulb(34) }), h('div', {}, h('strong', {}, t('showAnswer')), h('p', { class: 'why' }, q.why || '')), st.lostTotal ? h('b', { class: 'minus' }, '−' + st.lostTotal) : null);
      if (S.speak && canSpeak() && q.why) { /* read-aloud only on tap */ }
      checkBtn.hidden = true; hintBtn.hidden = true; showBtn.hidden = true; nextBtn.hidden = false; nextBtn.disabled = true;
      setTimeout(() => { nextBtn.disabled = false; }, 1500);
    }

    function advance() { st.timers.forEach(clearTimeout); i++; showQuestion(); }
    cleanups.push(() => st.timers.forEach(clearTimeout));
  }

  const praises = t('correctN');
  function pickPraise() { const arr = Array.isArray(praises) ? praises : [praises]; return arr[Math.floor(Math.random() * arr.length)]; }

  // ---------------- summary ----------------
  async function finish() {
    stopSpeaking();
    const total = queue.length;
    const stars = firstTry >= Math.ceil(total * 0.75) ? 3 : firstTry >= Math.ceil(total * 0.4) ? 2 : 1;
    const R = REWARD.quiz; let bonus = R.missionDone; const lines = [[t('bonusFinish'), R.missionDone]];
    if (firstTry === total) { bonus += R.missionPerfect; lines.push([t('bonusPerfect'), R.missionPerfect]); }
    if (S.mission.lastDay !== today()) { bonus += R.firstMissionToday; lines.push([t('bonusDive'), R.firstMissionToday]); S.mission.lastDay = today(); }
    day().missions++; S.mission.done++;
    const got = addPearls(bonus).got;
    const ups = TOPICS.filter((tp) => levelOf(tp) > startLevels[tp]);
    save();
    if (stars === 3) confetti(innerWidth / 2, innerHeight / 3);
    sfx[ups.length ? 'levelUp' : 'found']();
    const newBadges = awardBadges();
    stage.replaceChildren(h('div', { class: 'summary card' },
      h('div', { html: icons.trophy(84) }), h('h1', {}, t('roundDone')),
      h('div', { class: 'stars', role: 'img', 'aria-label': t('stars', { n: stars }) }, [1, 2, 3].map((n) => h('span', { html: n <= stars ? icons.star(64) : icons.starOff(64) }))),
      h('p', { class: 'big' }, t('rightOf', { a: firstTry, b: total })),
      h('div', { class: 'tally' }, h('span', { html: icons.pearl(40) }), h('strong', {}, t('newPearls', { n: Math.max(0, roundPts) + got })), h('small', { class: 'muted' }, lines.map(([a, b]) => `${a} +${b}`).join(' · '))),
      ups.map((tp) => h('p', { class: 'levelup' }, h('span', { html: icons.star(34) }), t('levelUp', { topic: t(TOPIC_META[tp].key), n: levelOf(tp) }))),
      ups.length ? h('p', { class: 'muted' }, t('levelUpNote')) : null,
      newBadges.map((b) => h('p', { class: 'levelup' }, h('span', { html: icons.trophy(34) }), b)),
      h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '18px' } },
        h('a', { class: 'btn', href: topic ? '#/quiz/topic/' + topic : '#/quiz/mission/' + mission, onclick: (e) => { e.preventDefault(); clear(el); runRound(el, { mission, topic }); } }, t('another')),
        h('a', { class: 'btn alt', href: '#/words' }, t('playGame')),
        h('a', { class: 'btn ghost', href: '#/home' }, t('doneToday')))));
  }

  showQuestion();
  return () => { dead = true; cleanups.forEach((f) => f()); stopSpeaking(); };
}
