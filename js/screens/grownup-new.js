// Grown-up corner section for the games added Nov 17-18 2026: Number Patterns, Read It Loud (beta) and Learning about Boise.
// Totals, the microphone settings (who listens, how forgiving), what this device is and how to fix its microphone, a microphone test, and the "what it heard" list for the last tries.
import { S, save } from '../core/store.js';
import { h, toast } from '../core/dom.js';
import { t, addStrings, L } from '../core/i18n.js';
import { listenSupport } from '../read/listen.js';
import { openMicTest, listenNote, copyLinkButton, helpBlock, lastMicError } from '../read/mictest.js';
import { CATS, FACTS, FACT_BY_ID } from '../../data/facts.js';
import { patLevel, cardsOwned, CARD_TOTAL } from '../progress/newgames.js';
import BZ, { CATS as BZCATS } from '../../data/boise.js';

addStrings({
  en: {
    gNew: 'New: Number Patterns, Read It Loud and Learning about Boise',
    gBzH: 'Learning about Boise', gBzStats: '{n} of {m} places explored · {f} answered right on the first try', gBzNone: 'Not started yet.', gBzWhy: 'Facts, history and things to do in Boise for ages 7 to 14. Each place has three facts, a “try it” idea for the family and a quiz. The facts were checked against official sources in November 2026, but hours, prices and seasons change, so check before a visit.',
    gPatH: 'Number Patterns', gPatStats: '{n} puzzles · {p}% right on the first try · {r} games played · {c} of {m} critter cards', gPatNone: 'Not played yet.',
    gPatLevel: 'Puzzle level now: {l} of 8. It adjusts by itself as he plays. The Easier / Harder setting under Overview moves it by one.',
    gPatWhy: 'Built for the “number patterns without counting on fingers” goal: quick ten-frame flashes, number lines, hops, skip counting, balance scales and number machines. Every third or fourth puzzle is a fun twist.',
    gReadH: 'Read It Loud (beta)', gReadStats: '{n} of {m} facts read · {a} tries · {b} passed', gReadBy: 'Passed with {the} listening: {a} · Grown-up listened: {b}',
    gListenH: 'Who listens?', gListenAuto: '{The}', gListenGrown: 'A grown-up', gStrictH: 'How forgiving is {the}?', gStrict1: 'Forgiving', gStrict2: 'Normal', gStrict3: 'Strict',
    gStrictNote: 'Forgiving counts a fact as read when about 70% of the words are heard. Normal asks for about 82%, Strict about 92%. Start with Forgiving: an older phone or iPad often misses small words.',
    gMicNow: 'Right now:', gMicTest: 'Test the microphone',
    gMicNote: 'Max’s Lab never records sound. {Br} sends the sound to {co} to turn it into words, and Max’s Lab keeps only the words of the last 40 tries, on {the}, shown below.',
    gLastErr: 'The browser’s last microphone message: {c}',
    gHeardH: 'What {the} heard (last tries)', gHeardNone: 'Nothing yet. Try a fact in Read It Loud.', gHeardFact: 'Fact', gHeardHeard: 'Heard', gHeardNothing: '(nothing)', gHeardGrown: 'grown-up listened', gHeardClear: 'Clear this list', gHeardNote: 'If good reading is often marked wrong, choose Forgiving, or let a grown-up listen.',
    gReadCats: 'Facts read by topic',
  },
  es: {
    gNew: 'Nuevo: Patrones de números, Lee en voz alta y Aprendiendo sobre Boise',
    gBzH: 'Aprendiendo sobre Boise', gBzStats: '{n} de {m} lugares explorados · {f} respondidos bien al primer intento', gBzNone: 'Todavía no ha empezado.', gBzWhy: 'Datos, historia y cosas para hacer en Boise para edades de 7 a 14 años. Cada lugar tiene tres datos, una idea para probar en familia y un acertijo. Los datos se revisaron con fuentes oficiales en noviembre de 2026, pero los horarios, precios y temporadas cambian, así que confírmalos antes de visitar.',
    gPatH: 'Patrones de números', gPatStats: '{n} rompecabezas · {p}% bien al primer intento · {r} juegos · {c} de {m} cartas de criaturas', gPatNone: 'Todavía no ha jugado.',
    gPatLevel: 'Nivel actual: {l} de 8. Se ajusta solo mientras juega. La opción Más fácil / Más difícil en Resumen lo mueve un nivel.',
    gPatWhy: 'Hecho para la meta de “patrones de números sin contar con los dedos”: destellos de cuadros de diez, rectas numéricas, saltos, conteo de 2 en 2, balanzas y máquinas de números. Cada tres o cuatro rompecabezas hay un giro divertido.',
    gReadH: 'Lee en voz alta (beta)', gReadStats: '{n} de {m} datos leídos · {a} intentos · {b} aprobados', gReadBy: 'Aprobados con {the} escuchando: {a} · Escuchó un adulto: {b}',
    gListenH: '¿Quién escucha?', gListenAuto: '{The}', gListenGrown: 'Un adulto', gStrictH: '¿Qué tan flexible es {the}?', gStrict1: 'Flexible', gStrict2: 'Normal', gStrict3: 'Estricto',
    gStrictNote: 'Flexible cuenta un dato como leído cuando se oye cerca del 70% de las palabras. Normal pide cerca del 82% y Estricto cerca del 92%. Empieza con Flexible: un teléfono o iPad viejo a menudo no oye las palabras cortas.',
    gMicNow: 'Ahora mismo:', gMicTest: 'Probar el micrófono',
    gMicNote: 'El Laboratorio de Max nunca graba el sonido. {Br} envía el sonido a {co} para convertirlo en palabras, y el Laboratorio de Max solo guarda las palabras de los últimos 40 intentos, en {the}, que se muestran abajo.',
    gLastErr: 'Último mensaje del navegador sobre el micrófono: {c}',
    gHeardH: 'Lo que escuchó {the} (últimos intentos)', gHeardNone: 'Todavía nada. Prueba un dato en Lee en voz alta.', gHeardFact: 'Dato', gHeardHeard: 'Escuchó', gHeardNothing: '(nada)', gHeardGrown: 'escuchó un adulto', gHeardClear: 'Borrar esta lista', gHeardNote: 'Si una buena lectura se marca mal a menudo, elige Flexible o deja que un adulto escuche.',
    gReadCats: 'Datos leídos por tema',
  },
});

const seg = (opts, get, set) => h('div', { class: 'seg2', style: { marginLeft: 0 } }, opts.map(([v, k]) => h('button', {
  'aria-pressed': String(get() === v),
  onclick: (e) => { set(v); save(); e.currentTarget.parentNode.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget))); },
}, t(k))));

export function newGameNodes() {
  const P = S.patterns, R = S.read;
  const sup = listenSupport(), grown = R.cfg.listen === 'grownup';
  const micNow = grown ? t('rdGrownOn') : listenNote();

  // ----- Number Patterns
  const pat = [h('h3', {}, t('gPatH')),
    P.q ? h('p', {}, t('gPatStats', { n: P.q, p: Math.round((100 * P.ok) / P.q), r: P.runs, c: cardsOwned(), m: CARD_TOTAL })) : h('p', { class: 'muted' }, t('gPatNone')),
    h('p', {}, t('gPatLevel', { l: patLevel() })), h('p', { class: 'muted small' }, t('gPatWhy'))];

  // ----- Read It Loud
  const read = FACTS.filter((f) => R.done[f.id]);
  const by = { mic: 0, grown: 0 }; for (const f of read) by[R.done[f.id].how === 'grown' ? 'grown' : 'mic']++;
  const cats = h('div', { class: 'row', style: { gap: '8px' } }, CATS.map((c) => h('span', { class: 'chip' }, c.e + ' ' + L(c.n) + ' ' + FACTS.filter((f) => f.cat === c.id && R.done[f.id]).length + '/20')));
  const logBox = h('div', { class: 'heardlog' });
  const drawLog = () => {
    const rows = R.log.slice(-10).reverse();
    logBox.replaceChildren(...(rows.length ? rows.map((e) => {
      const f = FACT_BY_ID[e.id];
      return h('div', { class: 'hl ' + (e.ok ? 'ok' : 'no') },
        h('div', { class: 'hlh' }, h('b', {}, (e.ok ? '✓ ' : '✗ ') + (e.mode === 'grown' ? t('gHeardGrown') : e.sc + '%')), h('small', { class: 'muted' }, new Date(e.t).toLocaleString(S.lang, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))),
        h('div', {}, h('small', { class: 'muted' }, t('gHeardFact') + ': '), f ? f.text : e.id),
        e.mode === 'grown' ? null : h('div', {}, h('small', { class: 'muted' }, t('gHeardHeard') + ': '), e.heard || t('gHeardNothing')));
    }) : [h('p', { class: 'muted' }, t('gHeardNone'))]));
  };
  drawLog();
  const rd = [h('h3', {}, t('gReadH')),
    h('p', {}, t('gReadStats', { n: read.length, m: FACTS.length, a: R.tries, b: R.passes })), h('p', { class: 'muted small' }, t('gReadBy', { a: by.mic, b: by.grown })), cats,
    h('p', {}, h('b', {}, t('gMicNow') + ' '), micNow), h('p', { class: 'muted small', style: { margin: '-4px 0 8px' } }, t('rdMtDevice')),
    h('div', { class: 'row', style: { marginBottom: '6px' } }, h('b', {}, t('gListenH')), seg([['auto', 'gListenAuto'], ['grownup', 'gListenGrown']], () => (R.cfg.listen === 'grownup' ? 'grownup' : 'auto'), (v) => { R.cfg.listen = v; })),
    h('div', { class: 'row', style: { marginBottom: '6px' } }, h('b', {}, t('gStrictH')), seg([[1, 'gStrict1'], [2, 'gStrict2'], [3, 'gStrict3']], () => R.cfg.strict || 1, (v) => { R.cfg.strict = v; })),
    h('p', { class: 'muted small' }, t('gStrictNote')),
    h('div', { class: 'row', style: { gap: '10px' } }, h('button', { class: 'btn gold small', onclick: () => openMicTest() }, t('gMicTest')), sup !== 'ready' ? copyLinkButton('btn ghost small') : null),
    lastMicError() ? h('p', { class: 'muted small' }, t('gLastErr', { c: lastMicError() })) : null,
    helpBlock(),
    h('p', { class: 'muted small' }, t('gMicNote')),
    h('h3', {}, t('gHeardH')), logBox, h('p', { class: 'muted small' }, t('gHeardNote')),
    h('div', { class: 'row' }, h('button', { class: 'btn ghost small', onclick: () => { R.log.length = 0; save(); drawLog(); toast('✓'); } }, t('gHeardClear')))];
  // ----- Learning about Boise
  const bz = S.boise, bdone = BZ.filter((p) => bz.done[p.id]), bfirst = bdone.filter((p) => !bz.done[p.id].w).length;
  const boise = [h('h3', {}, t('gBzH')),
    bdone.length ? h('p', {}, t('gBzStats', { n: bdone.length, m: BZ.length, f: bfirst })) : h('p', { class: 'muted' }, t('gBzNone')),
    h('div', { class: 'row', style: { gap: '8px' } }, BZCATS.map((c) => h('span', { class: 'chip' }, c.e + ' ' + L(c.n) + ' ' + BZ.filter((p) => p.cat === c.id && bz.done[p.id]).length + '/' + BZ.filter((p) => p.cat === c.id).length))),
    h('p', { class: 'muted small' }, t('gBzWhy'))];
  return [...pat, ...rd, ...boise];
}
