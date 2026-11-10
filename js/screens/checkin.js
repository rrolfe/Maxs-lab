// Weekly Check-in: 24 fresh questions (4 per subject, levels 2-5), one try, no hints, no pearls lost. Results feed the Grown-up corner.
import { S, save, awardCheckin, TOPICS } from '../core/store.js';
import { REWARD } from '../core/economy.js';
import { h, shuffle, pick, confetti } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { sfx, speak, canSpeak, stopSpeaking } from '../core/audio.js';
import { loadBank, prepare, recordAnswer } from '../quiz/engine.js';
import { makeMath } from '../quiz/math.js';
import { TOPIC_META } from '../quiz/missions.js';
import { weekKey, checkinDoneThisWeek } from '../progress/stats.js';
import { awardBadges } from '../core/badges.js';

export const CHECKIN_LEVELS = [2, 3, 4, 5];
export const CHECKIN_REWARD = REWARD.checkin;

addStrings({
  en: {
    ciTitle: 'Weekly Check-in', ciIntro: 'A quick look at how much you have grown this week. 24 questions, no hints, one try each. No pearls are lost, and you earn {n} pearls just for finishing, whatever your score!', ciBonus: 'Check-in bonus: +{n} pearls',
    ciStart: 'Start the check-in', ciDone: 'You already did this week’s check-in. See you next week!', ciQ: 'Question {a} of {b}', ciRead: 'Read it to me',
    ciAnswered: 'You answered {a} of {b} right!', ciGreat: 'Great effort, Max!', ciUp: 'That is up from last time!', ciSame: 'Right on track. Keep going!', ciKeep: 'Every week you grow. Nice work!',
    ciBack: 'Home', ciAgainNote: 'Questions are new each week.', prHome: 'Home screen', ciPer: '{a} of {b}', 
  },
  es: {
    ciTitle: 'Chequeo semanal', ciIntro: 'Una mirada rápida a cuánto has crecido esta semana. 24 preguntas, sin pistas, un intento cada una. ¡No se pierden perlas y ganas {n} perlas solo por terminar, sin importar tu puntaje!', ciBonus: 'Bono del chequeo: +{n} perlas',
    ciStart: 'Empezar el chequeo', ciDone: 'Ya hiciste el chequeo de esta semana. ¡Nos vemos la próxima!', ciQ: 'Pregunta {a} de {b}', ciRead: 'Léemela',
    ciAnswered: '¡Acertaste {a} de {b}!', ciGreat: '¡Gran esfuerzo, Max!', ciUp: '¡Mejoraste desde la última vez!', ciSame: '¡Vas muy bien! Sigue así.', ciKeep: 'Cada semana creces. ¡Buen trabajo!',
    ciBack: 'Inicio', ciAgainNote: 'Las preguntas son nuevas cada semana.', prHome: 'Pantalla de inicio', ciPer: '{a} de {b}', 
  },
});

function asChoice(m) {
  if (m.type === 'choice') return m;
  const a = m.a, set = new Set([a]);
  for (const c of shuffle([a + 1, a - 1, a + 10, a - 10, a + 2, a - 2, Number(String(a).split('').reverse().join('')), a * 2])) { if (set.size >= 4) break; if (c > 0 && Number.isFinite(c) && !set.has(c)) set.add(c); }
  let k = 3; while (set.size < 4) set.add(a + k++);
  const opts = shuffle([...set]);
  return { ...m, type: 'choice', opts: opts.map(String), a: opts.indexOf(a) };
}

/** 4 questions per subject at fixed levels, preferring ones never used in a check-in. Exported so tests can inspect it. */
export function buildCheckin(bank, lang = S.lang) {
  const seen = new Set(S.checkins.seen);
  const out = [];
  for (const tp of TOPICS) for (const lv of CHECKIN_LEVELS) {
    if (tp === 'math') { out.push(prepare(asChoice(makeMath(lv, Math.random, lang)))); continue; }
    let pool = bank.filter((q) => q.topic === tp && q.level === lv && q.type === 'choice');
    const fresh = pool.filter((q) => !seen.has(q.id)); if (fresh.length) pool = fresh;
    if (!pool.length) pool = bank.filter((q) => q.topic === tp && q.type === 'choice' && Math.abs(q.level - lv) <= 1);
    out.push(prepare(pick(pool)));
  }
  return shuffle(out);
}

export async function mount(el) {
  const root = h('div', { class: 'checkin' }); el.append(root);
  let dead = false;
  const bank = await loadBank(S.lang);
  const last = () => S.checkins.list.slice(-1)[0];

  function intro() {
    const done = checkinDoneThisWeek();
    root.replaceChildren(
      h('div', { class: 'screen-head' }, h('h1', {}, t('ciTitle'))),
      h('div', { class: 'card center', style: { maxWidth: '720px', margin: '10px auto' } },
        h('div', { html: icons.trophy(72) }),
        h('p', { class: 'big' }, done ? t('ciDone') : t('ciIntro', { n: CHECKIN_REWARD })),
        done ? h('a', { class: 'btn gold', href: '#/home' }, t('ciBack')) : h('button', { class: 'btn gold go', onclick: () => { sfx.pop(); run(); } }, t('ciStart')),
        h('p', { class: 'muted small' }, t('ciAgainNote'))));
  }

  function run() {
    const qs = buildCheckin(bank);
    const res = Object.fromEntries(TOPICS.map((tp) => [tp, { n: 0, ok: 0 }]));
    const t0 = Date.now(); let i = 0, ok = 0;
    function show() {
      if (dead) return;
      if (i >= qs.length) return finish();
      const q = qs[i]; stopSpeaking();
      let locked = false;
      const opts = h('div', { class: 'ciopts' }, q.shown.map((txt, k) => h('button', { class: 'ans', onclick: (e) => choose(k, e.currentTarget) }, h('span', { class: 'mark' }, String.fromCharCode(65 + k)), h('span', {}, txt))));
      const read = S.speak && canSpeak() ? h('button', { class: 'btn ghost icon', 'aria-label': t('ciRead'), onclick: () => speak(q.q + (S.lang === 'es' ? '. ' + q.shown.join('. ') : '')), html: icons.speaker(30) }) : null;
      root.replaceChildren(
        h('div', { class: 'screen-head' }, h('h1', {}, t('ciTitle')), h('span', { class: 'chip' }, t('ciQ', { a: i + 1, b: qs.length }))),
        h('div', { class: 'ciprog' }, h('i', { style: { width: Math.round((100 * i) / qs.length) + '%' } })),
        h('div', { class: 'card' }, h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('span', { class: 'chip' }, t(TOPIC_META[q.topic]?.key || 'topicMix')), read), h('h2', { class: 'qtext' }, q.q), opts));
      function choose(k, b) {
        if (locked) return; locked = true; sfx.tap(); b.classList.add('chosen');
        opts.querySelectorAll('.ans').forEach((x) => { x.disabled = true; });
        const right = k === q.correctShown;
        const r = (res[q.topic] ||= { n: 0, ok: 0 }); r.n++; if (right) { r.ok++; ok++; }
        S.checkins.seen.push(q.id); if (S.checkins.seen.length > 600) S.checkins.seen.splice(0, S.checkins.seen.length - 600);
        recordAnswer({ ...q, slot: 'at' }, right ? 1 : 0, { ms: 6000 });
        setTimeout(() => { i++; show(); }, 450);
      }
    }
    function finish() {
      stopSpeaking();
      const prev = last();
      const entry = { wk: weekKey(), date: new Date().toISOString().slice(0, 10), n: qs.length, ok, byTopic: res, sec: Math.round((Date.now() - t0) / 1000), lang: S.lang };
      S.checkins.list.push(entry); if (S.checkins.list.length > 200) S.checkins.list.shift();
      const got = awardCheckin(CHECKIN_REWARD); save(); awardBadges();
      sfx.levelUp(); confetti(innerWidth / 2, innerHeight / 3);
      const note = !prev ? t('ciKeep') : ok > prev.ok ? t('ciUp') : t('ciSame');
      root.replaceChildren(h('div', { class: 'card center summary', style: { maxWidth: '720px', margin: '14px auto' } },
        h('div', { html: icons.trophy(84) }), h('h1', {}, t('ciGreat')),
        h('p', { class: 'big' }, t('ciAnswered', { a: ok, b: qs.length })), h('p', {}, note),
        h('div', { class: 'cires' }, TOPICS.map((tp) => h('div', {}, h('small', {}, t(TOPIC_META[tp].key)), h('b', {}, t('ciPer', { a: res[tp].ok, b: res[tp].n }))))),
        got ? h('p', { class: 'big' }, h('span', { html: icons.pearl(36) }), ' ', t('ciBonus', { n: got })) : null,
        h('a', { class: 'btn gold', href: '#/home' }, t('ciBack'))));
    }
    show();
  }

  intro();
  return () => { dead = true; stopSpeaking(); };
}
