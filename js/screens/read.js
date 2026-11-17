// Read It Loud (BETA, added Nov 17 2026). Max picks a topic, reads a true fact out loud, and the iPad listens.
// Listening is imperfect on an old iPad, so every step has a fallback: forgiving matching (js/read/match.js), retries, "hear it", tap-a-word,
// and "grown-up listens" (a grown-up holds a button to say he read it). Nothing is recorded; only text is kept (last 40 tries, Grown-up corner).
import { S, save, addPearls } from '../core/store.js';
import { h, clear, confetti, flyPoints, shuffle } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings, L } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx, speak, canSpeak, stopSpeaking } from '../core/audio.js';
import { REWARD } from '../core/economy.js';
import { awardBadges } from '../core/badges.js';
import { CATS, FACTS, factsOf } from '../../data/facts.js';
import { match } from '../read/match.js';
import { createListener, listenSupport, ERROR_KEYS } from '../read/listen.js';
import { openMicTest } from '../read/mictest.js';
import { markPlayed, firstToday } from '../progress/newgames.js';

addStrings({
  en: {
    rdTitle: 'Read It Loud', rdBeta: 'BETA', rdIntro: 'Pick a topic, then read a fact out loud. The iPad listens! You earn pearls for every fact you read.',
    rdFirst: 'The first time, the iPad asks to use the microphone. Tap Allow.', rdTest: 'Test my microphone',
    rdPick: 'Pick a topic', rdOf: '{n} of {m} read', rdAllRead: 'All read!', rdLevel1: 'Easy', rdLevel2: 'Medium', rdLevel3: 'Challenge',
    rdTapMic: 'Tap the microphone, then read the card.', rdMic: 'Read it!', rdListening: 'Listening… tap when you are done.', rdStarting: 'Getting ready…', rdDone: 'I’m done',
    rdHear: 'Hear it', rdTapWord: 'Tap any word to hear it.', rdHeard: 'I heard', rdNothing: 'I did not hear much. Tap the microphone and try again.',
    rdGreat: ['Great reading!', 'You nailed it!', 'Wow, what a reader!', 'Super reading!', 'Loud and clear!'], rdTricky: 'Tricky words: {w}',
    rdTryAgain: 'Almost! The marked words were tricky. Try again!', rdTry3: 'That one is tough! Tap “Hear it”, then try again, or ask a grown-up to listen.',
    rdSkip: 'Skip this one', rdAskGrown: 'Grown-up listens', rdGrownRead: 'Read the card out loud to a grown-up.', rdGrownHold: 'Grown-up: hold to say “Great reading!”', rdGrownNot: 'Not yet',
    rdNext: 'Next fact', rdRunDone: 'Reading done!', rdRunSum: '{a} facts read. {b} on the first try.', rdMore: 'Read more', rdTopics: 'All topics', rdDoneToday: 'Done for today', rdCatDone: 'You read every fact about {cat}!',
    rdBonusFirst: 'First fact today', rdBonusCat: 'Topic complete', rdReplay: 'You have read them all! Here are some to read again (no new pearls).',
    qOf: '{i} of {n}', stars: '{n} of 3 stars', newPearls: '+{n} pearls', patQuit: 'Leave',
  },
  es: {
    rdTitle: 'Lee en voz alta', rdBeta: 'BETA', rdIntro: 'Elige un tema y lee un dato en voz alta. ¡El iPad escucha! Ganas perlas por cada dato que leas.',
    rdFirst: 'La primera vez, el iPad pide usar el micrófono. Toca Permitir.', rdTest: 'Probar mi micrófono',
    rdPick: 'Elige un tema', rdOf: '{n} de {m} leídos', rdAllRead: '¡Todos leídos!', rdLevel1: 'Fácil', rdLevel2: 'Medio', rdLevel3: 'Reto',
    rdTapMic: 'Toca el micrófono y lee la tarjeta.', rdMic: '¡Leer!', rdListening: 'Escuchando… toca cuando termines.', rdStarting: 'Preparando…', rdDone: 'Terminé',
    rdHear: 'Escúchalo', rdTapWord: 'Toca una palabra para oírla.', rdHeard: 'Escuché', rdNothing: 'No escuché mucho. Toca el micrófono e inténtalo otra vez.',
    rdGreat: ['¡Qué buena lectura!', '¡Lo lograste!', '¡Guau, qué lector!', '¡Súper lectura!', '¡Fuerte y claro!'], rdTricky: 'Palabras difíciles: {w}',
    rdTryAgain: '¡Casi! Las palabras marcadas fueron difíciles. ¡Inténtalo otra vez!', rdTry3: '¡Ese es difícil! Toca “Escúchalo” y vuelve a intentar, o pide a un adulto que escuche.',
    rdSkip: 'Saltar este', rdAskGrown: 'Escucha un adulto', rdGrownRead: 'Lee la tarjeta en voz alta a un adulto.', rdGrownHold: 'Adulto: mantén presionado para decir “¡Buena lectura!”', rdGrownNot: 'Todavía no',
    rdNext: 'Siguiente dato', rdRunDone: '¡Lectura terminada!', rdRunSum: '{a} datos leídos. {b} al primer intento.', rdMore: 'Leer más', rdTopics: 'Todos los temas', rdDoneToday: 'Listo por hoy', rdCatDone: '¡Leíste todos los datos de {cat}!',
    rdBonusFirst: 'Primer dato de hoy', rdBonusCat: 'Tema completo', rdReplay: '¡Ya los leíste todos! Aquí tienes algunos para leer otra vez (sin perlas nuevas).',
    qOf: '{i} de {n}', stars: '{n} de 3 estrellas', newPearls: '+{n} perlas', patQuit: 'Salir',
  },
});

const SIZE = 5;                                 // facts per sitting
let forceGrown = false;                         // set when the microphone turns out not to work: the rest of this visit uses "grown-up listens"
const strictLvl = () => Math.min(3, Math.max(1, S.read.cfg.strict || 1));
export const micMode = () => !forceGrown && S.read.cfg.listen !== 'grownup' && listenSupport() === 'ready';
const clean = (w) => w.replace(/[.,!?:;"]/g, '');
const setKids = (el, ...kids) => el.replaceChildren(...kids.flat(Infinity).filter((k) => k != null && k !== false));
const doneCount = (cat) => factsOf(cat).filter((f) => S.read.done[f.id]).length;
const pickOne = (arr) => (Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : arr);
const reachedEnd = (r) => r.words.slice(-2).some((w) => w.st === 'ok' || w.st === 'near');   // he got at least one of the last two words

export function mount(el, { parts }) {
  const cat = parts[0] === 'play' && CATS.find((c) => c.id === parts[1]);
  if (!cat) return menu(el);
  let cur = null;
  const start = () => { cur?.(); clear(el); cur = run(el, cat, start); };
  start();
  return () => { cur?.(); };
}

// ---------------------------------------------------------------- menu
function menu(el) {
  forceGrown = false;                           // each visit to the menu gives the microphone a fresh chance
  const sup = listenSupport(), grown = S.read.cfg.listen === 'grownup', ok = sup === 'ready' && !grown;
  const msg = grown ? t('rdGrownOn') : sup === 'ready' ? t('rdMicOn') : sup === 'standalone' ? t('rdMicHome') : t('rdMicNone');
  const total = FACTS.length, read = FACTS.filter((f) => S.read.done[f.id]).length;
  el.append(
    h('div', { class: 'screen-head' }, h('h1', {}, t('rdTitle')), h('span', { class: 'betatag' }, t('rdBeta'))),
    h('div', { class: 'card rdhero' },
      h('div', { class: 'ph', html: icons.mic(96) }),
      h('div', { class: 'pt' },
        h('p', { class: 'big' }, t('rdIntro')),
        h('p', { class: 'rdstat ' + (ok ? 'good' : 'warn') }, h('span', { html: ok ? icons.check(26) : icons.bulb(26) }), h('span', {}, msg)),
        ok ? h('p', { class: 'muted small', style: { margin: '4px 0 0' } }, t('rdFirst')) : null),
      ok ? h('button', { class: 'btn ghost', onclick: () => openMicTest() }, h('span', { html: icons.mic(30) }), t('rdTest')) : null),
    h('div', { class: 'row', style: { margin: '22px 0 8px', justifyContent: 'space-between' } }, h('h2', { style: { margin: 0 } }, t('rdPick')), h('span', { class: 'chip' }, t('rdOf', { n: read, m: total }))),
    h('div', { class: 'rcats' }, CATS.map((c) => {
      const n = doneCount(c.id), all = n >= 20;
      return h('a', { class: 'rcat', href: '#/read/play/' + c.id, style: { '--tc': c.c }, onclick: () => sfx.pop() },
        h('span', { class: 'rce' }, c.e), h('strong', {}, L(c.n)),
        h('span', { class: 'rbar', role: 'img', 'aria-label': t('rdOf', { n, m: 20 }) }, h('i', { style: { width: (n * 5) + '%' } })),
        h('small', {}, all ? '★ ' + t('rdAllRead') : t('rdOf', { n, m: 20 })));
    })));
}

// ---------------------------------------------------------------- picking the next facts
function pickFacts(catId, replay) {
  const all = factsOf(catId);
  const left = shuffle(replay ? all : all.filter((f) => !S.read.done[f.id]));
  const shift = S.read.cfg.shift || 0;
  const want = shift > 0 ? [2, 2, 3, 3, 3] : shift < 0 ? [1, 1, 2, 2, 3] : [1, 2, 2, 3, 3];
  const out = [];
  for (const tier of want.slice(0, SIZE)) {
    if (!left.length) break;
    let k = left.findIndex((f) => f.tier === tier);
    if (k < 0) { let bd = 9; left.forEach((f, j) => { const d = Math.abs(f.tier - tier); if (d < bd) { bd = d; k = j; } }); }
    out.push(left.splice(k, 1)[0]);
  }
  return out.sort((a, b) => a.tier - b.tier);
}

// ---------------------------------------------------------------- a sitting of five facts
function run(el, cat, again) {
  let dead = false;
  const timers = [];
  const startCount = doneCount(cat.id);
  const replay = startCount >= 20;
  const queue = pickFacts(cat.id, replay);
  let i = 0, firstTry = 0, readN = 0, pearlsRun = 0, curCleanup = null;

  const dots = h('div', { class: 'dots', role: 'img' });
  const earn = h('span', { class: 'chip' }, h('span', { html: icons.pearl(28) }), h('span', { id: 'round-pts' }, '0'));
  const head = h('div', { class: 'qhead' },
    h('button', { class: 'btn ghost icon', 'aria-label': t('patQuit'), onclick: () => { stopSpeaking(); go('/read'); }, html: icons.close(32) }),
    h('div', { class: 'qtitle' }, h('span', { class: 'rce sm' }, cat.e), h('strong', {}, L(cat.n)), h('span', { class: 'betatag' }, t('rdBeta'))), dots, earn);
  const stage = h('div', { class: 'qstage' });
  el.append(head); if (replay) el.append(h('p', { class: 'muted center' }, t('rdReplay'))); el.append(stage);   // (el.append(null) would print the word "null")
  const drawDots = () => { dots.replaceChildren(...queue.map((_, k) => h('i', { class: (k < i ? 'done ' : '') + (k === i ? 'cur' : '') }))); dots.setAttribute('aria-label', t('qOf', { i: Math.min(i + 1, queue.length), n: queue.length })); };

  function showFact() {
    if (dead) return;
    curCleanup?.(); curCleanup = null;
    if (i >= queue.length) return finish();
    drawDots();
    const f = queue[i];
    const st = { tries: 0, phase: 'ready', over: false, grown: !micMode(), l: null, hold: 0, moved: false };
    const words = f.text.split(/\s+/);
    const spans = words.map((w) => h('span', { class: 'rw', onclick: () => { if (st.phase === 'listening' || st.phase === 'starting') return; sfx.tap(); speak(clean(w), 'en', { rate: 0.8 }); } }, w));
    const factEl = h('p', { class: 'facttext' + (f.tier === 3 ? ' long' : '') }, spans.flatMap((s, k) => (k ? [' ', s] : [s])));
    const hearBtn = canSpeak('en') ? h('button', { class: 'btn ghost small', onclick: () => { if (st.phase === 'listening' || st.phase === 'starting') return; speak(f.text, 'en', { rate: 0.85 }); } }, h('span', { html: icons.speaker(28) }), t('rdHear')) : null;
    const level = h('span', { class: 'chip on' }, h('span', { html: Array.from({ length: f.tier }, () => icons.star(22)).join('') }), t('rdLevel' + f.tier));
    const card = h('div', { class: 'card factcard' }, h('div', { class: 'row', style: { gap: '10px' } }, level, h('span', { style: { flex: 1 } }), hearBtn), factEl, canSpeak('en') ? h('small', { class: 'muted' }, t('rdTapWord')) : null);

    const heardEl = h('p', { class: 'heardline', hidden: true });
    const feedback = h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const mic = h('button', { class: 'micbtn', 'aria-label': t('rdMic'), onclick: () => onMic() }, h('span', { class: 'mi' }, h('span', { html: icons.mic(60) }), h('span', { class: 'sq' })));
    const micLabel = h('div', { class: 'miclabel' }, t('rdTapMic'));
    const nextBtn = h('button', { class: 'btn alt', hidden: true, onclick: () => advance() }, t('rdNext'));
    const skipBtn = h('button', { class: 'btn ghost small', hidden: true, onclick: () => advance() }, t('rdSkip'));
    const grownBtn = h('button', { class: 'btn ghost small', hidden: true, onclick: () => { st.grown = true; renderMode(); } }, t('rdAskGrown'));
    const holdBtn = h('button', { class: 'holdbtn' }, h('span', { class: 'fill' }), h('span', { class: 'lab' }, t('rdGrownHold')));
    const notYet = h('button', { class: 'btn ghost small', onclick: () => grownNo() }, t('rdGrownNot'));
    const micBox = h('div', { class: 'micbox' }, mic, micLabel);
    const grownBox = h('div', { class: 'grownbox', hidden: true }, h('p', { class: 'muted', style: { margin: 0 } }, t('rdGrownRead')), holdBtn, notYet);
    stage.replaceChildren(h('div', { class: 'rdlayout' }, card, h('div', { class: 'rdctl' }, micBox, grownBox, heardEl, feedback, h('div', { class: 'row', style: { gap: '12px' } }, skipBtn, grownBtn, h('span', { style: { flex: 1 } }), nextBtn))));

    // ---- painting the words: green while he reads, green or orange when the try is over
    const paint = (res, final) => res.words.forEach((w, k) => {
      const c = spans[k].classList;
      c.remove('got', 'ok', 'miss');
      if (w.st === 'ok' || w.st === 'near') c.add(final ? 'ok' : 'got'); else if (w.st === 'miss' && final) c.add('miss');
    });
    const unpaint = () => spans.forEach((s) => s.classList.remove('got', 'ok', 'miss'));
    const say = (ico, text, cls) => { setKids(feedback, h('span', { html: ico }), h('span', {}, text)); feedback.className = 'feedback ' + cls; };
    const showHeard = (txt) => { heardEl.hidden = !txt; heardEl.textContent = txt ? t('rdHeard') + ': “' + txt + '”' : ''; };

    // ---- which controls show
    function renderMode() {
      const failed = st.tries >= 2 && !st.over;
      micBox.hidden = st.grown || st.over; grownBox.hidden = !st.grown || st.over;
      skipBtn.hidden = !failed; grownBtn.hidden = !(failed && !st.grown);
      mic.classList.toggle('on', st.phase === 'listening'); mic.classList.toggle('wait', st.phase === 'starting');
      mic.setAttribute('aria-label', st.phase === 'listening' ? t('rdDone') : t('rdMic'));
      micLabel.textContent = st.phase === 'listening' ? t('rdListening') : st.phase === 'starting' ? t('rdStarting') : t('rdTapMic');
    }
    renderMode();

    // ---- the microphone
    function onMic() {
      if (st.over) return;
      if (st.phase === 'listening') { sfx.tap(); st.l?.stop(); return; }
      if (st.phase === 'starting') return;
      sfx.tap();
      const talking = (() => { try { return speechSynthesis.speaking || speechSynthesis.pending; } catch { return false; } })();
      stopSpeaking();
      st.phase = 'starting'; unpaint(); showHeard(''); setKids(feedback); feedback.className = 'feedback'; renderMode();
      const begin = () => {                                                      // (Safari wants listening to start right after a tap, so only wait when the iPad was still talking)
        if (dead || st.over) return;
        st.l = createListener({
          lang: 'en-US', maxMs: 16000 + words.length * 1100, silentMs: 12000,
          onState: (s) => { if (s === 'listening' && st.phase === 'starting') { st.phase = 'listening'; renderMode(); } },
          onText: (txt) => {
            showHeard(txt);
            const r = match(f.text, txt, strictLvl()); paint(r, false);
            const lastW = r.words[r.words.length - 1];
            if (r.score >= 0.97 && lastW && (lastW.st === 'ok' || lastW.st === 'near')) st.l?.stop();   // read all the way to the end: no need to wait for a pause
          },
          onPause: (txt) => { const r = match(f.text, txt, strictLvl()); return r.pass && (r.score >= 0.9 || reachedEnd(r)); },   // he paused, and he had reached the end
          onDone: (txt) => judge(txt),
          onError: (code) => micError(code),
        });
        if (!st.l.start()) micError('denied');
      };
      if (talking) timers.push(setTimeout(begin, 380)); else begin();            // the iPad cannot talk and listen at once
    }
    function micError(code) {
      if (st.over) return;
      st.phase = 'ready';
      if (code !== 'silent') { forceGrown = true; st.grown = true; }
      renderMode();
      say(icons.bulb(34), t(ERROR_KEYS[code] || 'rdErrDenied'), 'try');
    }

    // ---- judging a try
    function judge(txt) {
      if (st.over) return;
      st.phase = 'ready'; st.tries++; S.read.tries++;
      const r = match(f.text, txt, strictLvl());
      paint(r, true); showHeard(txt);
      logTry(f, r, txt, 'mic', st.tries);
      if (r.pass) return win(r, 'mic');
      renderMode();
      say(icons.bulb(34), r.heard < 3 ? t('rdNothing') : st.tries >= 3 ? t('rdTry3') : t('rdTryAgain'), 'try');
      sfx.soft(); save();
    }
    function grownNo() { if (st.over) return; st.tries++; sfx.soft(); renderMode(); say(icons.bulb(34), t('rdTryAgain'), 'try'); }
    function grownYes() {
      if (st.over) return;
      st.tries++; S.read.tries++;
      const full = match(f.text, f.text, 1); logTry(f, full, '', 'grown', st.tries);
      paint(full, true); win(full, 'grown');
    }
    // hold-to-confirm (about a second), so a quick tap by Max does not count
    const holdStart = (e) => { e.preventDefault(); if (st.over || st.hold) return; holdBtn.classList.add('holding'); st.hold = setTimeout(() => { st.hold = 0; holdBtn.classList.remove('holding'); grownYes(); }, 1100); };
    const holdStop = () => { if (st.hold) { clearTimeout(st.hold); st.hold = 0; } holdBtn.classList.remove('holding'); };
    holdBtn.addEventListener('pointerdown', holdStart);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => holdBtn.addEventListener(ev, holdStop));
    holdBtn.addEventListener('contextmenu', (e) => e.preventDefault());

    // ---- a pass
    function win(r, how) {
      st.over = true; st.phase = 'done'; st.l?.abort();
      const first = st.tries === 1, was = S.read.done[f.id];
      const pay = replay || was ? 0 : REWARD.read.tier[f.tier];
      let bonus = 0; const lines = [];
      if (pay && firstToday('read')) { bonus = REWARD.read.firstToday; lines.push(t('rdBonusFirst') + ' +' + bonus); }
      S.read.done[f.id] = { t: Date.now(), n: ((was && was.n) || 0) + 1, tries: st.tries, how };
      S.read.passes++;
      const got = addPearls(pay + bonus).got;
      pearlsRun += got; readN++; if (first) firstTry++;
      document.getElementById('round-pts').textContent = pearlsRun;
      if (got) flyPoints(how === 'grown' ? holdBtn : mic, got);
      sfx[f.tier === 3 ? 'hardCorrect' : 'correct'](); if (f.tier === 3) confetti(innerWidth / 2, innerHeight / 2.5);
      const tricky = r.words.filter((w) => w.st === 'miss').map((w) => clean(w.w));
      setKids(feedback, h('span', { html: icons.check(34) }), h('span', {}, pickOne(t('rdGreat'))), got ? h('b', { class: 'plus' }, '+' + got) : null,
        tricky.length ? h('p', { class: 'why' }, t('rdTricky', { w: tricky.slice(0, 5).join(', ') })) : null, lines.length ? h('p', { class: 'why' }, lines.join(' · ')) : null);
      feedback.className = 'feedback good';
      micBox.hidden = true; grownBox.hidden = true; skipBtn.hidden = true; grownBtn.hidden = true; nextBtn.hidden = false;
      save();
    }
    function advance() { if (dead || st.moved) return; st.moved = true; holdStop(); st.l?.destroy(); stopSpeaking(); i++; showFact(); }
    curCleanup = () => { holdStop(); st.l?.destroy(); st.over = true; };
  }

  // ---------------------------------------------------------------- end of a sitting
  function finish() {
    stopSpeaking(); drawDots();
    const total = queue.length;
    const stars = firstTry >= 4 ? 3 : firstTry >= 2 ? 2 : readN >= 1 ? 1 : 0;
    const lines = [];
    const catFull = !replay && startCount < 20 && doneCount(cat.id) >= 20;
    const bonus = catFull ? REWARD.read.catDone : 0;
    if (catFull) lines.push(t('rdBonusCat') + ' +' + bonus);
    // the next sitting leans harder when it all went well, and easier when it was a struggle
    if (total && readN === total && firstTry >= 4) S.read.cfg.shift = Math.min(1, (S.read.cfg.shift || 0) + 1);
    else if (readN <= 2 && total >= 3) S.read.cfg.shift = Math.max(-1, (S.read.cfg.shift || 0) - 1);
    const got = bonus ? addPearls(bonus).got : 0;
    if (readN) markPlayed('read');
    save();
    if (stars === 3 || catFull) confetti(innerWidth / 2, innerHeight / 3);
    sfx.fanfare();
    const badges = awardBadges();
    stage.replaceChildren(h('div', { class: 'summary card' },
      h('div', { html: icons.trophy(72) }), h('h1', {}, t('rdRunDone')),
      stars ? h('div', { class: 'stars', role: 'img', 'aria-label': t('stars', { n: stars }) }, [1, 2, 3].map((n) => h('span', { html: n <= stars ? icons.star(56) : icons.starOff(56) }))) : null,
      h('p', { class: 'big' }, t('rdRunSum', { a: readN, b: firstTry })),
      h('div', { class: 'tally' }, h('span', { html: icons.pearl(36) }), h('strong', {}, t('newPearls', { n: pearlsRun + got })), lines.length ? h('small', { class: 'muted' }, lines.join(' · ')) : null),
      catFull ? h('p', { class: 'levelup' }, h('span', { html: icons.star(34) }), t('rdCatDone', { cat: L(cat.n) })) : null,
      badges.map((b) => h('p', { class: 'levelup' }, h('span', { html: icons.trophy(34) }), b)),
      h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '16px' } },
        h('button', { class: 'btn', onclick: () => again() }, t('rdMore')),
        h('a', { class: 'btn alt', href: '#/read' }, t('rdTopics')),
        h('a', { class: 'btn ghost', href: '#/home' }, t('rdDoneToday')))));
  }

  showFact();
  return () => { dead = true; timers.forEach(clearTimeout); curCleanup?.(); stopSpeaking(); };
}

/** One line in the Grown-up corner's "what the iPad heard" list (text only, last 40). */
function logTry(f, r, heard, mode, n) {
  const log = S.read.log;
  log.push({ t: Date.now(), id: f.id, ok: r.pass ? 1 : 0, sc: Math.round(r.score * 100), mode, n, heard: String(heard || '').slice(0, 200) });
  if (log.length > 40) log.splice(0, log.length - 40);
}
