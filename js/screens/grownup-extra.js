// Extra Grown-up corner sections: time per program, what to work on, weekly check-in progress and school scores.
import { S, save, TOPICS, levelOf } from '../core/store.js';
import { h, toast } from '../core/dom.js';
import { t, addStrings } from '../core/i18n.js';
import { TOPIC_META } from '../quiz/missions.js';
import { timeStats, mins, programKey, PROGRAMS, suggestions, weekKey, checkinDoneThisWeek } from '../progress/stats.js';

addStrings({
  en: {
    gTime: 'Time in the lab', gTimeToday: 'Today', gTimeWeek: 'Last 7 days', gTimeAvg: 'Daily average', gByProgram: 'Where the time goes (last 7 days)',
    gTimeNote: 'Time is counted while Max is actively tapping. Time per program starts counting from this update, so older days show only totals.',
    gMinN: '{n} min', gNoProg: 'No program time recorded yet.', gDaysBars: 'Minutes per day',
    gSuggest: 'What to work on', gSuggestNone: 'Play a few missions and suggestions will appear here.',
    sg_focus: '{s} is the area to practice: only {p}% right on recent questions. A few {s} missions this week would help.',
    sg_checkinLow: 'The weekly check-in showed {s} as the weakest area ({p}% right). Try a {s} mission or two before the next check-in.',
    sg_stretch: '{s} is a real strength ({p}% right recently). He may be ready for a stretch: try “Harder” under Question difficulty.',
    sg_idle: 'Little practice this week in: {s}. A short mission in each keeps skills balanced.',
    sg_balance: '{p}% of lab time this week went to {s}. Mix in a quiz mission or the world map for variety.',
    sg_checkin: 'This week’s check-in has not been done yet. It takes about 8 minutes.',
    gProgress: 'Weekly check-in and progress', gCheckNow: 'Start this week’s check-in', gCheckDone: 'This week’s check-in is done ✓', gCheckHist: 'Check-in history', gNoCheck: 'No check-ins yet. The first one sets the starting point.',
    gCheckHow: 'Each check-in has 24 fresh questions: 4 per subject, one try, no hints. Scores are only comparable from week to week. With 4 questions per subject, small changes are normal.',
    gCheckRow: '{d}: {ok} of {n} right ({p}%)', gTrend: 'Change since last check-in', gSubjLevels: 'Current lab level by subject',
    gBench: 'About national percentiles',
    gBenchText: 'The lab’s questions are not scored against a national sample, so it cannot give a true percentile for 1st graders. Real percentiles come from a normed test such as the one your school uses (for example MAP Growth or i-Ready). Enter those results below to see them next to the lab’s weekly check-ins.',
    gSchool: 'School test results', gSchTest: 'Test (e.g. MAP Growth)', gSchSubj: 'Subject', gSchPct: 'National percentile (1-99)', gSchAdd: 'Add result', gSchNone: 'No school results added yet.', gSchDel: 'Delete', gSchRow: '{d} · {t} · {s}: {p}th percentile',
    gAdded: 'Result added.', gSubjMath: 'Math', gSubjReading: 'Reading', gSubjLang: 'Language', gSubjOther: 'Other',
  },
  es: {
    gTime: 'Tiempo en el laboratorio', gTimeToday: 'Hoy', gTimeWeek: 'Últimos 7 días', gTimeAvg: 'Promedio diario', gByProgram: 'En qué se va el tiempo (últimos 7 días)',
    gTimeNote: 'El tiempo se cuenta mientras Max toca la pantalla. El tiempo por programa se cuenta desde esta actualización, así que los días anteriores solo muestran totales.',
    gMinN: '{n} min', gNoProg: 'Todavía no hay tiempo registrado por programa.', gDaysBars: 'Minutos por día',
    gSuggest: 'En qué trabajar', gSuggestNone: 'Juega unas misiones y aquí aparecerán sugerencias.',
    sg_focus: '{s} es el área para practicar: solo {p}% correcto en las preguntas recientes. Unas misiones de {s} esta semana ayudarían.',
    sg_checkinLow: 'El chequeo semanal mostró {s} como el área más débil ({p}% correcto). Prueba una o dos misiones de {s} antes del próximo chequeo.',
    sg_stretch: '{s} es una verdadera fortaleza ({p}% correcto últimamente). Quizá esté listo para un reto: prueba “Más difícil” en Dificultad de las preguntas.',
    sg_idle: 'Poca práctica esta semana en: {s}. Una misión corta en cada una mantiene las habilidades parejas.',
    sg_balance: 'El {p}% del tiempo esta semana fue para {s}. Mezcla una misión de preguntas o el mapa del mundo para variar.',
    sg_checkin: 'Todavía no se hizo el chequeo de esta semana. Toma unos 8 minutos.',
    gProgress: 'Chequeo semanal y progreso', gCheckNow: 'Empezar el chequeo de esta semana', gCheckDone: 'El chequeo de esta semana está hecho ✓', gCheckHist: 'Historial de chequeos', gNoCheck: 'Todavía no hay chequeos. El primero marca el punto de partida.',
    gCheckHow: 'Cada chequeo tiene 24 preguntas nuevas: 4 por materia, un intento, sin pistas. Los resultados solo se comparan de semana a semana. Con 4 preguntas por materia, los cambios pequeños son normales.',
    gCheckRow: '{d}: {ok} de {n} correctas ({p}%)', gTrend: 'Cambio desde el último chequeo', gSubjLevels: 'Nivel actual del laboratorio por materia',
    gBench: 'Sobre los percentiles nacionales',
    gBenchText: 'Las preguntas del laboratorio no se comparan con una muestra nacional, así que no pueden dar un percentil real para primer grado. Los percentiles reales vienen de una prueba estandarizada, como la de su escuela (por ejemplo MAP Growth o i-Ready). Anota esos resultados abajo para verlos junto a los chequeos semanales.',
    gSchool: 'Resultados de pruebas escolares', gSchTest: 'Prueba (p. ej. MAP Growth)', gSchSubj: 'Materia', gSchPct: 'Percentil nacional (1-99)', gSchAdd: 'Agregar resultado', gSchNone: 'Todavía no hay resultados escolares.', gSchDel: 'Borrar', gSchRow: '{d} · {t} · {s}: percentil {p}',
    gAdded: 'Resultado agregado.', gSubjMath: 'Matemáticas', gSubjReading: 'Lectura', gSubjLang: 'Lenguaje', gSubjOther: 'Otra',
  },
});

const pct = (o) => (o && o.n ? Math.round((100 * o.ok) / o.n) : null);
const topicName = (tp) => t(TOPIC_META[tp]?.key || tp);

export function timeNodes() {
  const ts = timeStats(7), today = ts.days[ts.days.length - 1].sec;
  const maxDay = Math.max(60, ...ts.days.map((d) => d.sec));
  const rows = Object.entries(ts.prog).filter(([, s]) => s >= 30).sort((a, b) => b[1] - a[1]);
  const maxP = Math.max(1, ...rows.map(([, s]) => s));
  return [
    h('div', { class: 'gstats' },
      h('div', {}, h('small', {}, t('gTimeToday')), h('b', {}, t('gMinN', { n: mins(today) }))),
      h('div', {}, h('small', {}, t('gTimeWeek')), h('b', {}, t('gMinN', { n: mins(ts.total) }))),
      h('div', {}, h('small', {}, t('gTimeAvg')), h('b', {}, t('gMinN', { n: mins(ts.total / 7) })))),
    h('h3', {}, t('gDaysBars')),
    h('div', { class: 'wkbars', role: 'img', 'aria-label': t('gDaysBars') }, ts.days.map((d) => h('div', { class: 'wb', title: t('gMinN', { n: mins(d.sec) }) }, h('small', {}, String(mins(d.sec))), h('i', { style: { height: Math.max(4, Math.round((d.sec / maxDay) * 70)) + 'px' } }), h('small', {}, d.d.toLocaleDateString(S.lang === 'es' ? 'es-US' : 'en-US', { weekday: 'narrow' }))))),
    h('h3', {}, t('gByProgram')),
    rows.length ? h('div', { class: 'progbars' }, rows.map(([p, s]) => h('div', { class: 'pbrow' }, h('span', {}, t(programKey(p))), h('div', { class: 'pbtrack' }, h('i', { style: { width: Math.max(3, Math.round((s / maxP) * 100)) + '%' } })), h('b', {}, t('gMinN', { n: mins(s) }))))) : h('p', { class: 'muted' }, t('gNoProg')),
    h('p', { class: 'muted small' }, t('gTimeNote')),
  ];
}

export function suggestNodes() {
  const list = suggestions();
  const text = (s) => {
    const sub = s.tp ? topicName(s.tp) : s.tps ? s.tps.map(topicName).join(', ') : s.p ? t(programKey(s.p)) : '';
    return t('sg_' + s.k, { s: sub, p: s.pct ?? '' });
  };
  return list.length ? [h('ul', { class: 'sglist' }, list.map((s) => h('li', {}, text(s))))] : [h('p', { class: 'muted' }, t('gSuggestNone'))];
}

export function progressNodes(rerender) {
  const C = S.checkins, list = C.list.slice(-12);
  const done = checkinDoneThisWeek();
  const last = list[list.length - 1], prev = list[list.length - 2];
  const nodes = [
    done ? h('p', { class: 'chip on' }, t('gCheckDone')) : h('a', { class: 'btn gold small', href: '#/checkin' }, t('gCheckNow')),
    h('p', { class: 'muted small' }, t('gCheckHow')),
    h('h3', {}, t('gCheckHist')),
  ];
  if (!list.length) nodes.push(h('p', { class: 'muted' }, t('gNoCheck')));
  else {
    nodes.push(h('div', { class: 'ckbars', role: 'img', 'aria-label': t('gCheckHist') }, list.map((c) => h('div', { class: 'ckb', title: c.date }, h('small', {}, Math.round((100 * c.ok) / c.n) + '%'), h('i', { style: { height: Math.max(6, Math.round((c.ok / c.n) * 90)) + 'px' } }), h('small', {}, c.date.slice(5))))));
    nodes.push(h('div', { class: 'gsub' }, TOPICS.map((tp) => {
      const a = pct(last.byTopic?.[tp]), b = pct(prev?.byTopic?.[tp]);
      const delta = a != null && b != null ? a - b : null;
      return h('div', { class: 'card flat' }, h('strong', {}, topicName(tp)), h('div', { class: 'lvbar' }, [1, 2, 3, 4, 5, 6].map((i) => h('i', { class: i <= levelOf(tp) ? 'on' : '' }))),
        h('small', {}, t('gLevel', { n: levelOf(tp) }) + ' · ' + (a != null ? a + '%' : '–') + (delta != null && delta !== 0 ? ` (${delta > 0 ? '+' : ''}${delta})` : '')));
    })));
    nodes.push(h('ul', { class: 'sglist' }, [...list].reverse().slice(0, 6).map((c) => h('li', {}, t('gCheckRow', { d: c.date, ok: c.ok, n: c.n, p: Math.round((100 * c.ok) / c.n) })))));
  }
  // benchmark honesty + school scores
  nodes.push(h('h3', {}, t('gBench')), h('p', { class: 'muted' }, t('gBenchText')), h('h3', {}, t('gSchool')));
  const sch = C.school || (C.school = []);
  nodes.push(sch.length ? h('ul', { class: 'sglist' }, sch.slice().sort((a, b) => b.date.localeCompare(a.date)).map((r) => h('li', {}, t('gSchRow', { d: r.date, t: r.test, s: r.subject, p: r.pct }), ' ', h('button', { class: 'btn ghost small', onclick: () => { C.school = sch.filter((x) => x !== r); save(); rerender?.(); } }, t('gSchDel'))))) : h('p', { class: 'muted' }, t('gSchNone')));
  const test = h('input', { class: 'textin', placeholder: t('gSchTest'), maxlength: 40, 'aria-label': t('gSchTest') });
  const subj = h('select', { class: 'textin', 'aria-label': t('gSchSubj') }, [['math', 'gSubjMath'], ['reading', 'gSubjReading'], ['language', 'gSubjLang'], ['other', 'gSubjOther']].map(([v, k]) => h('option', { value: t(k) }, t(k))));
  const pc = h('input', { class: 'textin', type: 'number', min: 1, max: 99, placeholder: t('gSchPct'), 'aria-label': t('gSchPct'), style: { width: '170px' } });
  nodes.push(h('div', { class: 'row' }, test, subj, pc, h('button', { class: 'btn small', onclick: () => {
    const p = Math.round(+pc.value); if (!test.value.trim() || !(p >= 1 && p <= 99)) { toast(t('gSchPct')); return; }
    sch.push({ date: new Date().toISOString().slice(0, 10), test: test.value.trim(), subject: subj.value, pct: p }); save(); toast(t('gAdded')); rerender?.();
  } }, t('gSchAdd'))));
  return nodes;
}
void PROGRAMS; void weekKey;
