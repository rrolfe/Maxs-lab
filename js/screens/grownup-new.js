// Grown-up corner section for the two games added Nov 17 2026: Number Patterns and Read It Loud (beta).
// Totals, the microphone settings (who listens, how forgiving), a microphone test, and the "what the iPad heard" list for the last tries.
import { S, save } from '../core/store.js';
import { h, toast } from '../core/dom.js';
import { t, addStrings, L } from '../core/i18n.js';
import { listenSupport } from '../read/listen.js';
import { openMicTest } from '../read/mictest.js';
import { CATS, FACTS, FACT_BY_ID } from '../../data/facts.js';
import { patLevel, cardsOwned, CARD_TOTAL } from '../progress/newgames.js';

addStrings({
  en: {
    gNew: 'New: Number Patterns and Read It Loud',
    gPatH: 'Number Patterns', gPatStats: '{n} puzzles · {p}% right on the first try · {r} games played · {c} of {m} critter cards', gPatNone: 'Not played yet.',
    gPatLevel: 'Puzzle level now: {l} of 8. It adjusts by itself as he plays. The Easier / Harder setting under Overview moves it by one.',
    gPatWhy: 'Built for the “number patterns without counting on fingers” goal: quick ten-frame flashes, number lines, hops, skip counting, balance scales and number machines. Every third or fourth puzzle is a fun twist.',
    gReadH: 'Read It Loud (beta)', gReadStats: '{n} of {m} facts read · {a} tries · {b} passed', gReadBy: 'Passed with the iPad listening: {a} · Grown-up listened: {b}',
    gListenH: 'Who listens?', gListenAuto: 'The iPad', gListenGrown: 'A grown-up', gStrictH: 'How forgiving is the iPad?', gStrict1: 'Forgiving', gStrict2: 'Normal', gStrict3: 'Strict',
    gStrictNote: 'Forgiving counts a fact as read when about 70% of the words are heard. Normal asks for about 82%, Strict about 92%. Start with Forgiving: an older iPad often misses small words.',
    gMicNow: 'Right now:', gMicTest: 'Test the microphone',
    gMicNote: 'The iPad can only listen when Max’s Lab is open in a Safari tab (not from the Home Screen icon), with Siri turned on in Settings. Safari sends the sound to Apple to turn it into words. Max’s Lab never records the sound: it keeps only the words of the last 40 tries, on this iPad, shown below.',
    gHeardH: 'What the iPad heard (last tries)', gHeardNone: 'Nothing yet. Try a fact in Read It Loud.', gHeardFact: 'Fact', gHeardHeard: 'Heard', gHeardNothing: '(nothing)', gHeardGrown: 'grown-up listened', gHeardClear: 'Clear this list', gHeardNote: 'If good reading is often marked wrong, choose Forgiving, or let a grown-up listen.',
    gReadCats: 'Facts read by topic',
  },
  es: {
    gNew: 'Nuevo: Patrones de números y Lee en voz alta',
    gPatH: 'Patrones de números', gPatStats: '{n} rompecabezas · {p}% bien al primer intento · {r} juegos · {c} de {m} cartas de criaturas', gPatNone: 'Todavía no ha jugado.',
    gPatLevel: 'Nivel actual: {l} de 8. Se ajusta solo mientras juega. La opción Más fácil / Más difícil en Resumen lo mueve un nivel.',
    gPatWhy: 'Hecho para la meta de “patrones de números sin contar con los dedos”: destellos de cuadros de diez, rectas numéricas, saltos, conteo de 2 en 2, balanzas y máquinas de números. Cada tres o cuatro rompecabezas hay un giro divertido.',
    gReadH: 'Lee en voz alta (beta)', gReadStats: '{n} de {m} datos leídos · {a} intentos · {b} aprobados', gReadBy: 'Aprobados con el iPad escuchando: {a} · Escuchó un adulto: {b}',
    gListenH: '¿Quién escucha?', gListenAuto: 'El iPad', gListenGrown: 'Un adulto', gStrictH: '¿Qué tan flexible es el iPad?', gStrict1: 'Flexible', gStrict2: 'Normal', gStrict3: 'Estricto',
    gStrictNote: 'Flexible cuenta un dato como leído cuando se oye cerca del 70% de las palabras. Normal pide cerca del 82% y Estricto cerca del 92%. Empieza con Flexible: un iPad viejo a menudo no oye las palabras cortas.',
    gMicNow: 'Ahora mismo:', gMicTest: 'Probar el micrófono',
    gMicNote: 'El iPad solo puede escuchar cuando el Laboratorio de Max está abierto en una pestaña de Safari (no desde el icono de la pantalla de inicio) y con Siri activado en Ajustes. Safari envía el sonido a Apple para convertirlo en palabras. El Laboratorio de Max nunca graba el sonido: solo guarda las palabras de los últimos 40 intentos, en este iPad, que se muestran abajo.',
    gHeardH: 'Lo que escuchó el iPad (últimos intentos)', gHeardNone: 'Todavía nada. Prueba un dato en Lee en voz alta.', gHeardFact: 'Dato', gHeardHeard: 'Escuchó', gHeardNothing: '(nada)', gHeardGrown: 'escuchó un adulto', gHeardClear: 'Borrar esta lista', gHeardNote: 'Si una buena lectura se marca mal a menudo, elige Flexible o deja que un adulto escuche.',
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
  const micNow = grown ? t('rdGrownOn') : sup === 'ready' ? t('rdMicOn') : sup === 'standalone' ? t('rdMicHome') : t('rdMicNone');

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
    h('p', {}, h('b', {}, t('gMicNow') + ' '), micNow),
    h('div', { class: 'row', style: { marginBottom: '6px' } }, h('b', {}, t('gListenH')), seg([['auto', 'gListenAuto'], ['grownup', 'gListenGrown']], () => (R.cfg.listen === 'grownup' ? 'grownup' : 'auto'), (v) => { R.cfg.listen = v; })),
    h('div', { class: 'row', style: { marginBottom: '6px' } }, h('b', {}, t('gStrictH')), seg([[1, 'gStrict1'], [2, 'gStrict2'], [3, 'gStrict3']], () => R.cfg.strict || 1, (v) => { R.cfg.strict = v; })),
    h('p', { class: 'muted small' }, t('gStrictNote')),
    sup === 'ready' ? h('div', { class: 'row' }, h('button', { class: 'btn gold small', onclick: () => openMicTest() }, t('gMicTest'))) : null,
    h('p', { class: 'muted small' }, t('gMicNote')),
    h('h3', {}, t('gHeardH')), logBox, h('p', { class: 'muted small' }, t('gHeardNote')),
    h('div', { class: 'row' }, h('button', { class: 'btn ghost small', onclick: () => { R.log.length = 0; save(); drawLog(); toast('✓'); } }, t('gHeardClear')))];
  return [...pat, ...rd];
}
