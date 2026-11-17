// Number Patterns: procedurally generated "number pattern" puzzles, eight levels, English and Spanish.
// The idea (from Max's teacher): solve with patterns and number sense (make 10, doubles, skip counting, ten more, number lines),
// not with fingers and not with column sums. Numbers come first; every 3rd or 4th puzzle is a different, silly "twist".
// Pure: no DOM, no storage, so the same file runs in Node for the tests (tools/tests/patterns-unit.mjs).
import { shuffle } from '../core/dom.js';

export const MAX_LEVEL = 8;
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pk = (r, arr) => arr[Math.floor(r() * arr.length)];
const T = (en, es) => ({ en, es });
export const fmt = (n) => (n < 0 ? '−' : '') + Math.abs(n).toLocaleString('en-US');
const clampL = (n) => Math.max(1, Math.min(MAX_LEVEL, n));
const ap = (start, step, n = 5) => Array.from({ length: n }, (_, i) => start + step * i);

/** Four (or n) different numbers that include the answer. `near` = the mistakes a kid would really make, tried first. */
function optNums(r, ans, near = [], { neg = false, n = 4 } = {}) {
  const ok = (c) => Number.isInteger(c) && (neg || c >= 0) && Math.abs(c) < 1e7;
  const set = new Set([ans]);
  const pool = [...shuffle(near, r), ...shuffle([ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10], r)];
  for (const c of pool) { if (set.size >= n) break; if (ok(c) && !set.has(c)) set.add(c); }
  for (let k = 3; set.size < n; k++) { if (ok(ans + k)) set.add(ans + k); if (set.size < n && ok(ans - k)) set.add(ans - k); }
  return shuffle([...set], r);
}

// ---------------------------------------------------------------- skip counting: 5, 10, 15, ?
function skipParams(lv, r) {
  const mul = (k, a, b) => k * ri(r, a, b);
  switch (lv) {
    case 1: { const s = pk(r, [1, 2, 5, 10]); return { step: s, start: s === 1 ? ri(r, 1, 12) : s === 2 ? pk(r, [0, 1, 2, 3, 4, 5, 6]) : mul(s, 0, 4) }; }
    case 2: {
      if (r() < 0.3) { const d = pk(r, [1, 2, 5, 10]); return { step: -d, start: d * ri(r, 5, 10) + (d === 1 ? ri(r, 0, 5) : 0) }; }
      const s = pk(r, [2, 5, 10]); return { step: s, start: s === 2 ? ri(r, 0, 30) : mul(s, 1, 12) };
    }
    case 3: {
      if (r() < 0.4) { const d = pk(r, [2, 5, 10]); return { step: -d, start: d * ri(r, 6, 20) }; }
      const s = pk(r, [3, 4, 3, 4, 20, 25]); return { step: s, start: s <= 4 ? s * ri(r, 0, 6) : s * ri(r, 0, 3) };
    }
    case 4: {
      if (r() < 0.4) { const d = pk(r, [3, 4, 5, 6, 10]); return { step: -d, start: d * ri(r, 6, 18) + (r() < 0.5 ? 0 : ri(r, 1, d - 1)) }; }
      return { step: pk(r, [3, 4, 6, 6, 8, 9]), start: ri(r, 1, 30) };
    }
    case 5: {
      const s = pk(r, [6, 7, 8, 9, 11, 12, 15, 25]);
      return r() < 0.35 ? { step: -s, start: s * ri(r, 6, 12) + ri(r, 0, s - 1) } : { step: s, start: ri(r, 3, 50) };
    }
    case 6: {
      const s = pk(r, [12, 15, 20, 25, 30, 40, 50, 75]);
      return r() < 0.4 ? { step: -s, start: s * ri(r, 6, 12) + pk(r, [0, 0, 5, 10]) } : { step: s, start: ri(r, 20, 400) };
    }
    case 7: {
      const s = pk(r, [13, 14, 16, 17, 19, 21, 35, 45, 125, 250]);
      return r() < 0.4 ? { step: -s, start: s * ri(r, 6, 10) + ri(r, 0, 20) } : { step: s, start: ri(r, 100, 900) };
    }
    default: {
      if (r() < 0.5) { const s = pk(r, [2, 3, 4, 5, 6]); return { step: -s, start: s * ri(r, 2, 3) }; }   // 12, 9, 6, 3, 0, −3 ... down past zero
      return { step: pk(r, [125, 250, 500, 750, 1000, 1250]), start: ri(r, 100, 3000) };
    }
  }
}
function holeFor(lv, r) {
  if (lv <= 1) return 4;
  const x = r();
  if (lv === 2) return x < 0.6 ? 4 : 3;
  return x < 0.45 ? 4 : x < 0.7 ? 3 : x < 0.9 ? 2 : 1;
}
function lineVis(terms, hole) {
  // two visible hops, so the hint shows the step without giving the answer away
  const idx = hole >= 3 ? [0, 1, 2] : [2, 3, 4];
  return { kind: 'line', pts: idx.map((i) => terms[i]) };
}
function skipRaw(lv, r, { hole = null } = {}) {
  const { start, step } = skipParams(lv, r);
  const terms = ap(start, step, 5);
  const hl = hole ?? holeFor(lv, r);
  const ans = terms[hl], d = Math.abs(step), up = step > 0, prev = terms[hl - 1];
  return {
    fam: 'skip', mode: terms.some((n) => n < 0) ? 'choice' : 'either', neg: terms.some((n) => n < 0), ans, near: [ans + step, ans - step, prev, ans + 1, ans - 1],
    title: hl === 4 ? T('What comes next?', '¿Qué número sigue?') : T('Which number is missing?', '¿Qué número falta?'),
    show: { kind: 'seq', items: terms.map((n, i) => (i === hl ? null : n)) },
    hint: T(`How much does each number ${up ? 'grow' : 'shrink'}? Hop from one number to the next.`, `¿Cuánto ${up ? 'crece' : 'baja'} cada número? Salta de uno al siguiente.`),
    vis: lineVis(terms, hl),
    why: T(`Each number goes ${up ? 'up' : 'down'} by ${fmt(d)}. ${fmt(prev)} ${up ? '+' : '−'} ${fmt(d)} = ${fmt(ans)}.`, `Cada número ${up ? 'sube' : 'baja'} ${fmt(d)}. ${fmt(prev)} ${up ? '+' : '−'} ${fmt(d)} = ${fmt(ans)}.`),
    meta: { rule: 'ap', start, step, hole: hl, terms },
  };
}

// ---------------------------------------------------------------- growing, shrinking, repeating and silly sequences
function growRaw(lv, r) {
  const kinds = lv <= 3 ? ['rep'] : lv === 4 ? ['inc', 'dbl', 'rep'] : lv === 5 ? ['inc', 'alt', 'dbl', 'half'] : lv === 6 ? ['inc', 'alt', 'triple', 'fib', 'half'] : ['fib', 'sq', 'tri', 'alt', 'triple', 'mix'];
  const kind = pk(r, kinds);
  let terms, shown, rule, hint, why, near = [], meta;
  const last = (t) => t[t.length - 1];
  const title = T('What comes next?', '¿Qué número sigue?');
  if (kind === 'rep') {
    const hi = lv <= 2 ? 10 : 30;
    const a = ri(r, 1, hi); let b = ri(r, 1, hi); if (b === a) b = a + 1;
    const unit = pk(r, [[a, b], [a, b], [a, b, b], [a, a, b]]);
    terms = Array.from({ length: 6 }, (_, i) => unit[i % unit.length]);
    shown = terms.slice(0, 5);
    near = [a, b, a + 1, b + 1];
    hint = T('Look for a part that repeats. Say it out loud like a song.', 'Busca la parte que se repite. Dila en voz alta como una canción.');
    why = T(`The pattern repeats: ${unit.join(', ')}, ${unit.join(', ')}… So ${terms[5]} comes next.`, `El patrón se repite: ${unit.join(', ')}, ${unit.join(', ')}… Así que sigue ${terms[5]}.`);
    meta = { rule: 'rep', unit };
  } else if (kind === 'inc') {
    const d0 = lv <= 4 ? 1 : pk(r, lv === 5 ? [1, 2, 3] : [2, 3, 4, 5]), g = lv <= 4 ? 1 : pk(r, lv === 5 ? [1, 2] : [1, 2, 3]), s = ri(r, 1, lv <= 4 ? 8 : 20);
    const js = ap(d0, g, 5);
    terms = [s]; js.forEach((j) => terms.push(last(terms) + j));
    shown = terms.slice(0, 5);
    near = [last(terms) + g, last(terms) - g, terms[4] + js[3]];
    hint = T('Look at the jumps between the numbers. Do the jumps stay the same?', 'Mira los saltos entre los números. ¿Los saltos son siempre iguales?');
    why = T(`The jumps grow: +${js[0]}, +${js[1]}, +${js[2]}, +${js[3]}, so the next jump is +${js[4]}. ${terms[4]} + ${js[4]} = ${terms[5]}.`, `Los saltos crecen: +${js[0]}, +${js[1]}, +${js[2]}, +${js[3]}, así que el siguiente salto es +${js[4]}. ${terms[4]} + ${js[4]} = ${terms[5]}.`);
    meta = { rule: 'inc', s, d0, g };
  } else if (kind === 'alt') {
    const a = ri(r, 3, 9), b = ri(r, 1, a - 1), s = ri(r, 5, 30);
    terms = [s, s + a, s + a - b, s + 2 * a - b, s + 2 * a - 2 * b, s + 3 * a - 2 * b];
    shown = terms.slice(0, 5);
    near = [terms[4] - b, terms[4] + b, terms[4] + a + b];
    hint = T('Two jumps take turns. Find them both.', 'Dos saltos se turnan. Encuentra los dos.');
    why = T(`The jumps take turns: +${a}, −${b}, +${a}, −${b}… Next is +${a}: ${terms[4]} + ${a} = ${terms[5]}.`, `Los saltos se turnan: +${a}, −${b}, +${a}, −${b}… Sigue +${a}: ${terms[4]} + ${a} = ${terms[5]}.`);
    meta = { rule: 'alt', s, a, b };
  } else if (kind === 'dbl') {
    const s = pk(r, lv <= 4 ? [1, 2, 3] : [2, 3, 4, 5]);
    terms = ap(0, 1, 5).map((i) => s * 2 ** i); shown = terms.slice(0, 4);
    terms = terms.slice(0, 5);
    near = [terms[3] + terms[2], terms[3] + 2, terms[3] * 3];
    hint = T('How do you get from one number to the next? Think of doubling.', '¿Cómo pasas de un número al siguiente? Piensa en duplicar.');
    why = T(`Each number is double the one before. Double ${terms[3]} is ${terms[4]}.`, `Cada número es el doble del anterior. El doble de ${terms[3]} es ${terms[4]}.`);
    meta = { rule: 'dbl', s };
  } else if (kind === 'half') {
    const m = pk(r, [1, 3, 5]);
    terms = [16, 8, 4, 2, 1].map((k) => m * k); shown = terms.slice(0, 4);
    near = [terms[3] - 1, terms[3] - 2, terms[3] / 2 + 1];
    hint = T('The numbers get smaller. Is it half each time?', 'Los números se hacen más pequeños. ¿Es la mitad cada vez?');
    why = T(`Each number is half of the one before. Half of ${terms[3]} is ${terms[4]}.`, `Cada número es la mitad del anterior. La mitad de ${terms[3]} es ${terms[4]}.`);
    meta = { rule: 'half', m };
  } else if (kind === 'triple') {
    const s = pk(r, [1, 2]);
    terms = ap(0, 1, 5).map((i) => s * 3 ** i); shown = terms.slice(0, 4);
    near = [terms[3] * 2, terms[3] + 3, terms[3] + terms[2]];
    hint = T('Try multiplying the first number to get the second.', 'Prueba multiplicar el primer número para obtener el segundo.');
    why = T(`Each number is 3 times the one before. ${terms[3]} × 3 = ${terms[4]}.`, `Cada número es 3 veces el anterior. ${terms[3]} × 3 = ${terms[4]}.`);
    meta = { rule: 'triple', s };
  } else if (kind === 'fib') {
    const a = ri(r, 1, 4), b = ri(r, 1, 4);
    terms = [a, b]; while (terms.length < 6) terms.push(terms[terms.length - 1] + terms[terms.length - 2]);
    shown = terms.slice(0, 5);
    near = [terms[4] + terms[4] - terms[3], terms[4] + 1, terms[4] + terms[2]];
    hint = T('Look at three numbers in a row. How do the first two make the third?', 'Mira tres números seguidos. ¿Cómo hacen los dos primeros el tercero?');
    why = T(`Add the two numbers before: ${terms[3]} + ${terms[4]} = ${terms[5]}.`, `Suma los dos números anteriores: ${terms[3]} + ${terms[4]} = ${terms[5]}.`);
    meta = { rule: 'fib', a, b };
  } else if (kind === 'sq') {
    const n0 = ri(r, 1, 4);
    terms = ap(n0, 1, 6).map((n) => n * n); shown = terms.slice(0, 5);
    near = [terms[4] + 10, terms[4] + 8, terms[4] + 12, terms[4] + terms[1]];
    hint = T('Look at the jumps: they grow by 2 each time. These are square numbers!', 'Mira los saltos: crecen de 2 en 2. ¡Son números cuadrados!');
    why = T(`These are square numbers: ${n0 + 5} × ${n0 + 5} = ${terms[5]}.`, `Son números cuadrados: ${n0 + 5} × ${n0 + 5} = ${terms[5]}.`);
    meta = { rule: 'sq', n0 };
  } else if (kind === 'tri') {
    const n0 = ri(r, 1, 3);
    terms = ap(n0, 1, 6).map((n) => (n * (n + 1)) / 2); shown = terms.slice(0, 5);
    near = [terms[4] + 5, terms[4] + 7, terms[4] + terms[1]];
    hint = T('Look at the jumps. They grow by 1 each time.', 'Mira los saltos. Crecen de 1 en 1.');
    why = T(`The jumps are +${n0 + 1}, +${n0 + 2}, +${n0 + 3}… so the next jump is +${n0 + 5}: ${terms[4]} + ${n0 + 5} = ${terms[5]}.`, `Los saltos son +${n0 + 1}, +${n0 + 2}, +${n0 + 3}… así que sigue +${n0 + 5}: ${terms[4]} + ${n0 + 5} = ${terms[5]}.`);
    meta = { rule: 'tri', n0 };
  } else { // mix: double, then 1 less (or 1 more)
    const s = ri(r, 2, 4), plus = r() < 0.5, k = plus ? 1 : -1;
    terms = [s]; while (terms.length < 5) terms.push(terms[terms.length - 1] * 2 + k);
    shown = terms.slice(0, 4);
    near = [terms[3] * 2, terms[3] * 2 - k, terms[3] + terms[2]];
    hint = T('Two steps in each hop: first one thing, then another. Try doubling.', 'Dos pasos en cada salto: primero uno y luego otro. Prueba duplicar.');
    why = T(`Double, then ${plus ? 'add 1' : 'take away 1'}: ${terms[3]} × 2 = ${terms[3] * 2}, ${plus ? '+' : '−'} 1 = ${terms[4]}.`, `Duplica y luego ${plus ? 'suma 1' : 'resta 1'}: ${terms[3]} × 2 = ${terms[3] * 2}, ${plus ? '+' : '−'} 1 = ${terms[4]}.`);
    meta = { rule: 'mix', s, k };
  }
  const ans = terms[shown.length];
  const vis = kind === 'rep' ? null : { kind: 'line', pts: shown.slice(0, 3) };
  return { fam: 'grow', mode: 'either', ans, near, title, show: { kind: 'seq', items: [...shown, null] }, hint, vis, why, meta: { ...meta, terms, shown } };
}

// ---------------------------------------------------------------- number bonds: 7 + ? = 10
function bondRaw(lv, r) {
  let Tt, a;
  if (lv <= 1) { Tt = 10; a = ri(r, 1, 9); }
  else if (lv === 2) { Tt = pk(r, [10, 20, 20]); a = Tt === 10 ? ri(r, 1, 9) : ri(r, 11, 19); }
  else if (lv === 3) { Tt = pk(r, [50, 100, 100]); a = 10 * ri(r, 1, Tt / 10 - 1); }
  else if (lv === 4) { Tt = 100; a = 5 * ri(r, 1, 19); }
  else if (lv === 5) { Tt = pk(r, [100, 100, 1000]); a = Tt === 100 ? ri(r, 11, 89) : 100 * ri(r, 1, 9); }
  else if (lv === 6) { Tt = 1000; a = 50 * ri(r, 1, 19); }
  else { Tt = 1000; a = 5 * ri(r, 20, 199); }
  const ans = Tt - a;
  const f = r() < 0.2 && lv <= 2 ? 2 : ri(r, 0, 3);
  const A = fmt(a), TT = fmt(Tt), B = fmt(ans);
  const parts = f === 0 ? [A, '+', '?', '=', TT] : f === 1 ? ['?', '+', A, '=', TT] : f === 2 ? [TT, '−', A, '=', '?'] : [TT, '−', '?', '=', A];
  const round = Tt >= 1000 ? 100 : 10, via = Math.ceil((a + 1) / round) * round;
  const vis = Tt <= 20 ? { kind: 'frame', a: Math.min(a, 20), b: Tt - a, total: Tt } : { kind: 'line', pts: via >= Tt || via === a ? [a, Tt] : [a, via, Tt], hide: true };
  return {
    fam: 'bond', mode: 'either', ans, near: [a, ans + 10, ans - 10, ans + (Tt >= 100 ? 5 : 1)],
    title: T('Find the missing number.', 'Encuentra el número que falta.'), show: { kind: 'eq', parts },
    hint: Tt <= 20 ? T(`Picture a ten-frame. How many more squares make ${Tt}?`, `Imagina un marco de diez. ¿Cuántos cuadros más hacen ${Tt}?`) : T(`How far is it from ${A} up to ${TT}? Jump to a round number first.`, `¿Cuánto falta de ${A} a ${TT}? Salta primero a un número redondo.`),
    vis, why: T(`${A} and ${B} make ${TT}. ${A} + ${B} = ${TT}.`, `${A} y ${B} hacen ${TT}. ${A} + ${B} = ${TT}.`),
    meta: { rule: 'bond', a, total: Tt },
  };
}

// ---------------------------------------------------------------- doubles and near doubles
function doubleRaw(lv, r) {
  let kind = 'dbl', a, b, parts, ans, hint, why, near = [];
  const D = (n) => fmt(n);
  if (lv <= 1) { a = ri(r, 1, 6); }
  else if (lv === 2) { if (r() < 0.55) a = ri(r, 5, 10); else { kind = 'near'; a = ri(r, 3, 9); } }
  else if (lv === 3) { const x = r(); if (x < 0.4) a = ri(r, 11, 15); else if (x < 0.8) { kind = 'near'; a = ri(r, 7, 14); } else { kind = 'near2'; a = ri(r, 4, 9); } }
  else if (lv === 4) { if (r() < 0.55) a = pk(r, [15, 20, 25, 30, 35, 40, 45]); else { kind = 'near'; a = ri(r, 15, 29); } }
  else if (lv === 5) { const x = r(); if (x < 0.4) { kind = 'half'; a = 2 * ri(r, 6, 49); } else if (x < 0.7) { kind = 'dbl2'; a = ri(r, 21, 49); } else { kind = 'near'; a = ri(r, 25, 49); } }
  else if (lv === 6) { const x = r(); if (x < 0.35) { kind = 'half'; a = 2 * pk(r, [55, 60, 65, 70, 75, 80, 90]); } else if (x < 0.65) { kind = 'dbl2'; a = pk(r, [47, 48, 62, 75, 85, 125]); } else { kind = 'near'; a = ri(r, 35, 99); } }
  else if (lv === 7) { const x = r(); if (x < 0.4) { kind = 'half'; a = 2 * 5 * ri(r, 40, 99); } else if (x < 0.75) { kind = 'dbl2'; a = 5 * ri(r, 40, 99); } else { kind = 'near'; a = ri(r, 110, 450); } }
  else { const x = r(); if (x < 0.35) { kind = 'half'; a = 2 * ri(r, 150, 499); } else if (x < 0.7) { kind = 'dbl2'; a = ri(r, 150, 499); } else { kind = 'near'; a = ri(r, 250, 700); } }
  if (kind === 'dbl') { b = a; ans = a + a; parts = [D(a), '+', D(b), '=', '?']; near = [ans + 1, ans - 1, a + 1, ans + 2]; hint = T(`Doubles are the same number twice: ${a} and ${a}.`, `Los dobles son el mismo número dos veces: ${a} y ${a}.`); why = T(`${a} + ${a} = ${ans}. A double is a number added to itself.`, `${a} + ${a} = ${ans}. Un doble es un número sumado a sí mismo.`); }
  else if (kind === 'near') { b = a + 1; ans = a + b; const flip = r() < 0.4; parts = flip ? [D(b), '+', D(a), '=', '?'] : [D(a), '+', D(b), '=', '?']; near = [ans + 1, ans - 1, 2 * a, 2 * b + 1]; hint = T(`Use a double you know: ${a} + ${a}. Then fix it up.`, `Usa un doble que conozcas: ${a} + ${a}. Luego ajústalo.`); why = T(`${a} + ${a} = ${2 * a}, and ${b} is one more than ${a}, so ${2 * a} + 1 = ${ans}.`, `${a} + ${a} = ${2 * a}, y ${b} es uno más que ${a}, así que ${2 * a} + 1 = ${ans}.`); }
  else if (kind === 'near2') { b = a + 2; ans = a + b; parts = [D(a), '+', D(b), '=', '?']; near = [ans + 1, ans - 1, ans + 2, 2 * a]; hint = T(`${b} is 2 more than ${a}. Start with the double ${a} + ${a}.`, `${b} es 2 más que ${a}. Empieza con el doble ${a} + ${a}.`); why = T(`${a} + ${a} = ${2 * a}, and ${b} is 2 more, so ${2 * a} + 2 = ${ans}. (Or double ${a + 1}: ${a + 1} + ${a + 1} = ${ans}.)`, `${a} + ${a} = ${2 * a}, y ${b} es 2 más, así que ${2 * a} + 2 = ${ans}. (O el doble de ${a + 1}: ${a + 1} + ${a + 1} = ${ans}.)`); }
  else if (kind === 'dbl2') { ans = 2 * a; parts = ['double', D(a), '=', '?']; near = [ans + 10, ans - 10, ans + 2, ans - 2]; hint = T(`Double each part: the tens and the ones.`, `Duplica cada parte: las decenas y las unidades.`); why = T(`Double ${a} is ${a} + ${a} = ${ans}.`, `El doble de ${a} es ${a} + ${a} = ${ans}.`); }
  else { ans = a / 2; parts = ['half of', D(a), '=', '?']; near = [ans + 1, ans - 1, ans + 10, ans - 10]; hint = T('Half means two equal parts. Which number added to itself makes this?', 'La mitad es dos partes iguales. ¿Qué número sumado a sí mismo da este?'); why = T(`${ans} + ${ans} = ${a}, so half of ${a} is ${ans}.`, `${ans} + ${ans} = ${a}, así que la mitad de ${a} es ${ans}.`); }
  return { fam: 'double', mode: 'either', ans, near, title: T('Find the answer.', 'Encuentra la respuesta.'), show: { kind: 'eq', parts, word: kind === 'dbl2' || kind === 'half' }, hint, vis: kind === 'dbl' && ans <= 20 ? { kind: 'frame', a: Math.min(a, 10), b: Math.min(b, 10), total: 20, gap: true } : null, why, meta: { rule: kind, a } };
}

// ---------------------------------------------------------------- fact patterns: a few facts in a row, then the next one
function factsRaw(lv, r) {
  const lines = []; let ans, hint, why, kind;
  const fmtL = (a, op, b, c) => `${fmt(a)} ${op} ${fmt(b)} = ${c === '?' ? '?' : fmt(c)}`;
  const pick = () => {
    if (lv <= 1) return pk(r, ['plus', 'sum']);
    if (lv === 2) return pk(r, ['plus', 'sum', 'minus']);
    if (lv === 3) return pk(r, ['plus', 'minus', 'tensplus']);
    if (lv === 4) return pk(r, ['place', 'times', 'placeminus', 'tensplus']);
    if (lv === 5) return pk(r, ['times', 'cross', 'placeminus']);
    if (lv === 6) return pk(r, ['times', 'placetimes', 'cross']);
    return pk(r, ['times', 'placetimes', 'squares']);
  };
  kind = pick();
  if (kind === 'plus') {
    const a = lv <= 1 ? ri(r, 2, 5) : ri(r, 5, 12), b = ri(r, 1, lv <= 1 ? 3 : 6);
    for (let i = 0; i < 4; i++) lines.push([a, '+', b + i, a + b + i]);
    ans = a + b + 3; hint = T('Look down the answers. What happens each time the second number goes up by 1?', 'Mira las respuestas hacia abajo. ¿Qué pasa cada vez que el segundo número sube 1?'); why = T(`The second number grows by 1, so the answer grows by 1: ${a} + ${b + 3} = ${ans}.`, `El segundo número crece 1, así que la respuesta crece 1: ${a} + ${b + 3} = ${ans}.`);
  } else if (kind === 'sum') {
    const S = lv <= 1 ? pk(r, [8, 9, 10]) : pk(r, [10, 12, 15]), a0 = S - ri(r, 1, 3);
    for (let i = 0; i < 4; i++) lines.push([a0 - i, '+', S - a0 + i, S]);
    ans = S; hint = T('One number goes down and the other goes up. What stays the same?', 'Un número baja y el otro sube. ¿Qué se queda igual?'); why = T(`One goes down 1 and the other goes up 1, so the total stays ${S}.`, `Uno baja 1 y el otro sube 1, así que el total sigue siendo ${S}.`);
  } else if (kind === 'minus') {
    const st = lv <= 2 ? 1 : pk(r, [1, 10]);
    const Tt = st === 10 ? pk(r, [50, 100]) : lv <= 2 ? pk(r, [10, 12, 15, 20]) : pk(r, [30, 40, 50, 100]);
    const b0 = st === 1 ? ri(r, 1, 4) : 10;
    for (let i = 0; i < 4; i++) lines.push([Tt, '−', b0 + st * i, Tt - b0 - st * i]);
    ans = Tt - b0 - st * 3; hint = T('The number you take away grows. What happens to the answer?', 'El número que quitas crece. ¿Qué le pasa a la respuesta?'); why = T(`Each time you take away ${st} more, the answer is ${st} less. ${fmt(Tt)} − ${fmt(b0 + st * 3)} = ${fmt(ans)}.`, `Cada vez que quitas ${st} más, la respuesta es ${st} menos. ${fmt(Tt)} − ${fmt(b0 + st * 3)} = ${fmt(ans)}.`);
  } else if (kind === 'tensplus') {
    const a = ri(r, 11, 49), s = 10;
    for (let i = 1; i <= 4; i++) lines.push([a, '+', s * i, a + s * i]);
    ans = a + s * 4; hint = T('The second number jumps by 10. How does the answer jump?', 'El segundo número salta de 10 en 10. ¿Cómo salta la respuesta?'); why = T(`Adding 10 more each time makes the answer jump by 10. ${a} + 40 = ${ans}.`, `Sumar 10 más cada vez hace que la respuesta salte de 10 en 10. ${a} + 40 = ${ans}.`);
  } else if (kind === 'place') {
    const a = ri(r, 2, 5), b = ri(r, 2, 4);
    lines.push([a, '+', b, a + b], [a * 10, '+', b * 10, (a + b) * 10]);
    lines.push([a * 100, '+', b * 100, (a + b) * 100]); lines.push([a * 1000, '+', b * 1000, '?']);
    ans = (a + b) * 1000; hint = T('Same digits, but they get bigger. Count the zeros.', 'Los mismos dígitos, pero más grandes. Cuenta los ceros.'); why = T(`${a} + ${b} = ${a + b}. With zeros: ${fmt(a * 1000)} + ${fmt(b * 1000)} = ${fmt(ans)}.`, `${a} + ${b} = ${a + b}. Con ceros: ${fmt(a * 1000)} + ${fmt(b * 1000)} = ${fmt(ans)}.`);
  } else if (kind === 'placeminus') {
    const a = ri(r, 6, 9), b = ri(r, 2, 5);
    lines.push([a, '−', b, a - b], [a * 10, '−', b * 10, (a - b) * 10], [a * 100, '−', b * 100, (a - b) * 100]); lines.push([a * 1000, '−', b * 1000, '?']);
    ans = (a - b) * 1000; hint = T('Same facts with more zeros. What is the first fact?', 'Los mismos datos con más ceros. ¿Cuál es el primer dato?'); why = T(`${a} − ${b} = ${a - b}. With zeros: ${fmt(a * 1000)} − ${fmt(b * 1000)} = ${fmt(ans)}.`, `${a} − ${b} = ${a - b}. Con ceros: ${fmt(a * 1000)} − ${fmt(b * 1000)} = ${fmt(ans)}.`);
  } else if (kind === 'times') {
    const c = lv <= 4 ? pk(r, [2, 5, 10]) : lv === 5 ? pk(r, [3, 4]) : lv === 6 ? pk(r, [6, 7, 9]) : pk(r, [11, 12, 15, 25]);
    const n0 = ri(r, 1, 3);
    for (let i = 0; i < 4; i++) lines.push([n0 + i, '×', c, (n0 + i) * c]);
    ans = (n0 + 3) * c; hint = T(`Look down the answers. How much do they grow each time?`, `Mira las respuestas hacia abajo. ¿Cuánto crecen cada vez?`); why = T(`Each answer is ${c} more than the one before. ${(n0 + 2) * c} + ${c} = ${ans}.`, `Cada respuesta es ${c} más que la anterior. ${(n0 + 2) * c} + ${c} = ${ans}.`);
  } else if (kind === 'placetimes') {
    const a = ri(r, 2, 6), b = ri(r, 2, 4);
    lines.push([a, '×', b, a * b], [a, '×', b * 10, a * b * 10], [a, '×', b * 100, a * b * 100]); lines.push([a * 10, '×', b * 100, '?']);
    ans = a * b * 1000; hint = T('Look at where the zeros go. How many zeros are there altogether?', 'Mira dónde van los ceros. ¿Cuántos ceros hay en total?'); why = T(`${a} × ${b} = ${a * b}, and there are 3 zeros altogether: ${fmt(a * 10)} × ${fmt(b * 100)} = ${fmt(ans)}.`, `${a} × ${b} = ${a * b}, y hay 3 ceros en total: ${fmt(a * 10)} × ${fmt(b * 100)} = ${fmt(ans)}.`);
  } else if (kind === 'cross') {
    const a = pk(r, [75, 85, 95]), n = 10;
    for (let i = 1; i <= 4; i++) lines.push([a, '+', n * i, a + n * i]);
    ans = a + 40; hint = T('Add 10 more each time, and watch the tens digit change. What happens at 100?', 'Suma 10 más cada vez y mira el dígito de las decenas. ¿Qué pasa en 100?'); why = T(`The answer jumps by 10 each time, even past 100: ${a} + 40 = ${ans}.`, `La respuesta salta de 10 en 10, incluso después de 100: ${a} + 40 = ${ans}.`);
  } else { // squares
    const n0 = ri(r, 1, 3);
    for (let i = 0; i < 4; i++) lines.push([n0 + i, '×', n0 + i, (n0 + i) * (n0 + i)]);
    ans = (n0 + 3) * (n0 + 3); hint = T('The same number times itself. Look at how the answers jump.', 'El mismo número por sí mismo. Mira cómo saltan las respuestas.'); why = T(`${n0 + 3} × ${n0 + 3} = ${ans}. (A number times itself is a square number.)`, `${n0 + 3} × ${n0 + 3} = ${ans}. (Un número por sí mismo es un número cuadrado.)`);
  }
  // last line shows the blank
  const rows = lines.map(([a, op, b, c], i) => (i === lines.length - 1 ? fmtL(a, op, b, '?') : fmtL(a, op, b, c)));
  const exp = lines[lines.length - 1];
  return { fam: 'facts', mode: 'either', ans, near: [ans + 1, ans - 1, ans + 10, exp[3] === '?' ? ans : lines[lines.length - 2][3]].filter((n) => n !== ans), title: T('Spot the pattern. What is the last answer?', 'Descubre el patrón. ¿Cuál es la última respuesta?'), show: { kind: 'eqs', rows }, hint, vis: null, why, meta: { rule: 'facts', kind, lines } };
}

// ---------------------------------------------------------------- ten more, ten less
function tensRaw(lv, r) {
  let a, delta;
  if (lv <= 2) { delta = pk(r, [10, -10, 10]); a = delta > 0 ? ri(r, 11, 89) : ri(r, 21, 99); }
  else if (lv === 3) { const k = pk(r, [1, 2, 3, 4]); delta = pk(r, [1, -1]) * 10 * k; a = delta > 0 ? ri(r, 11, 59) : ri(r, 45, 99); }
  else if (lv === 4) { const x = r(); if (x < 0.4) { delta = pk(r, [10, -10]); a = delta > 0 ? ri(r, 91, 99) : ri(r, 101, 109); } else if (x < 0.7) { delta = pk(r, [100, -100]); a = delta > 0 ? ri(r, 101, 899) : ri(r, 201, 999); } else { delta = pk(r, [9, 11, 19, 21]); a = ri(r, 21, 79); } }
  else if (lv === 5) { const x = r(); if (x < 0.5) { delta = pk(r, [100, -100, 200, -200]); a = ri(r, 301, 899); } else { delta = pk(r, [9, 99, 11, 19, 29]); a = ri(r, 101, 899); } }
  else if (lv === 6) { const x = r(); if (x < 0.5) { delta = pk(r, [1000, -1000]); a = delta > 0 ? ri(r, 1001, 8999) : ri(r, 2001, 9999); } else { delta = pk(r, [10, -10, 100, -100]); a = delta > 0 ? pk(r, [995, 990, 999, 1995, 2990]) : pk(r, [1005, 1010, 1100, 2005, 3000]); } }
  else if (lv === 7) { const x = r(); if (x < 0.5) { delta = pk(r, [99, 999, 101, 199]); a = ri(r, 1001, 7999); } else { delta = pk(r, [10, -10, 100, -100, 1000, -1000]); a = pk(r, [9995, 9990, 9900, 10005, 10010]); } }
  else { delta = pk(r, [999, 1001, 99, 101, -99, -101, 1999]); a = delta < 0 ? ri(r, 1201, 9999) : ri(r, 1001, 8999); }
  const ans = a + delta, d = Math.abs(delta);
  const up = delta > 0, comp = [9, 99, 999, 11, 101, 19, 21, 29, 199, 1001, 1999].includes(d);
  const parts = [fmt(a), up ? '+' : '−', fmt(d), '=', '?'];
  const base = comp ? (d === 9 || d === 99 || d === 999 ? d + 1 : d === 11 ? 10 : d === 101 ? 100 : d === 19 ? 20 : d === 21 ? 20 : d === 29 ? 30 : d === 199 ? 200 : d === 1001 ? 1000 : 2000) : d;
  const adj = base - d;   // positive: went one past
  const hint = comp ? T(`${fmt(d)} is close to ${fmt(base)}. Jump ${fmt(base)}, then fix it.`, `${fmt(d)} está cerca de ${fmt(base)}. Salta ${fmt(base)} y luego ajusta.`) : T(`Which digit changes? Look at the ${d >= 1000 ? 'thousands' : d >= 100 ? 'hundreds' : 'tens'} place.`, `¿Qué dígito cambia? Mira el lugar de ${d >= 1000 ? 'los millares' : d >= 100 ? 'las centenas' : 'las decenas'}.`);
  const why = comp ? T(`${fmt(a)} ${up ? '+' : '−'} ${fmt(base)} = ${fmt(a + (up ? base : -base))}, then ${adj > 0 ? (up ? 'take back' : 'add back') : (up ? 'add' : 'take')} ${Math.abs(adj)}: ${fmt(ans)}.`, `${fmt(a)} ${up ? '+' : '−'} ${fmt(base)} = ${fmt(a + (up ? base : -base))}, y luego ${adj > 0 ? (up ? 'quita' : 'suma') : (up ? 'suma' : 'quita')} ${Math.abs(adj)}: ${fmt(ans)}.`) : T(`${fmt(d)} ${up ? 'more' : 'less'} than ${fmt(a)} is ${fmt(ans)}.`, `${fmt(d)} ${up ? 'más' : 'menos'} que ${fmt(a)} es ${fmt(ans)}.`);
  return { fam: 'tens', mode: 'either', ans, near: comp ? [a + (up ? base : -base), ans + 1, ans - 1, a + (up ? -d : d)] : [a + (up ? -d : d), ans + d / 10 || 1, ans - d / 10 || 1, ans + 1], title: T('Find the new number.', 'Encuentra el nuevo número.'), show: { kind: 'eq', parts }, hint, vis: ans <= 100 && a <= 100 && ans >= 1 && d <= 50 && d % 10 === 0 ? { kind: 'hundreds', from: a, to: ans } : null, why, meta: { rule: 'tens', a, delta } };
}

// ---------------------------------------------------------------- number-line hops: start, hop, hop, hop
function hopRaw(lv, r) {
  let start, hops;
  if (lv <= 2) { start = ri(r, 11, 79); hops = pk(r, [[10, 1], [10, 2], [10, 10], [1, 10], [10, 5]]); }
  else if (lv === 3) { start = ri(r, 11, 60); hops = pk(r, [[10, 10, 1], [20, 5], [10, 10, 2], [30, 4], [10, 5, 5]]); }
  else if (lv === 4) { start = ri(r, 75, 96); hops = pk(r, [[10, 10], [10, 10, 1], [20, 3], [10, 10, 10, 2], [5, 5, 10]]); }
  else if (lv === 5) { start = ri(r, 40, 120); hops = pk(r, [[10, 10, -1], [20, -2], [10, -1, -1], [30, -5], [25, 25]]); }
  else if (lv === 6) { start = ri(r, 120, 480); hops = pk(r, [[100, 10, 1], [100, -10, -1], [200, 20], [100, 100, -1], [50, 50, 5]]); }
  else if (lv === 7) { start = ri(r, 210, 880); hops = pk(r, [[50, 25, 5], [100, 100, 10, 1], [100, -10, -10], [99, 99], [250, -50]]); }
  else { start = ri(r, 600, 3200); hops = pk(r, [[250, 250, -1], [500, -50, -5], [1000, 100, 10], [999, -99], [100, 100, 100, -1]]); }
  const ans = hops.reduce((s, h) => s + h, start);
  const sgn = (h) => (h > 0 ? '+' : '−') + fmt(Math.abs(h));
  const total = hops.reduce((s, h) => s + h, 0);
  return {
    fam: 'hop', mode: 'either', ans, near: [start + hops[0], ans + 1, ans - 1, start + Math.abs(total), ans + 10, ans - 10],
    title: T('Where do you land?', '¿Dónde aterrizas?'), show: { kind: 'hops', start, hops },
    hint: T('Take the hops one at a time. Say each landing spot.', 'Da los saltos uno por uno. Di dónde caes cada vez.'),
    vis: start + total <= 130 && start >= 0 ? { kind: 'line', pts: hops.reduce((a, h) => (a.push(a[a.length - 1] + h), a), [start]).slice(0, -1) } : null,
    why: T(`${fmt(start)} ${hops.map((h) => `${sgn(h)}`).join(' ')} = ${fmt(ans)}.`, `${fmt(start)} ${hops.map((h) => `${sgn(h)}`).join(' ')} = ${fmt(ans)}.`),
    meta: { rule: 'hop', start, hops },
  };
}

// ---------------------------------------------------------------- balance: 8 + 5 = 10 + ?
function balanceNums(lv, r) {
  let a, b, c, stepC = 1;
  if (lv <= 2) { a = ri(r, 2, 7); b = ri(r, 2, 5); c = ri(r, 1, a + b - 1); }
  else if (lv === 3) { const x = r(); if (x < 0.5) { a = ri(r, 6, 9); b = ri(r, 3, 9); c = 10; } else { a = ri(r, 5, 9); b = ri(r, 5, 9); c = ri(r, 4, a + b - 3); } }
  else if (lv === 4) { a = 5 * ri(r, 2, 10); b = 5 * ri(r, 2, 8); stepC = 10; c = 10 * ri(r, 1, Math.max(1, Math.floor((a + b - 1) / 10))); }
  else if (lv === 5) { a = ri(r, 31, 69); b = ri(r, 12, 29); stepC = 10; c = Math.floor((a + b) / 10) * 10 - 10 * pk(r, [0, 1]); }
  else if (lv === 6) { a = 100 * ri(r, 2, 6) + 50 * ri(r, 0, 1); b = 50 * ri(r, 1, 6); stepC = 100; c = 100 * Math.floor((a + b) / 100) - 100 * pk(r, [0, 1]); }
  else { a = ri(r, 199, 699); b = ri(r, 6, 99); stepC = 100; c = Math.ceil((a + 1) / 100) * 100 - 100 * pk(r, [0, 1]); }
  while (c >= a + b && c > 0) c -= c % stepC === 0 && c >= stepC ? stepC : c;   // the right side must start smaller than the left
  return [a, b, Math.max(0, c)];
}
function balanceRaw(lv, r) {
  let a, b, c;
  for (let i = 0; i < 12; i++) { [a, b, c] = balanceNums(lv, r); if (c !== a && c !== b && c < a + b && c > 0) break; }   // "5 + 3 = 5 + ?" is too easy to count
  if (c >= a + b) c = a + b - 1;
  const ans = a + b - c;
  const flip = r() < 0.35;
  const parts = flip ? [fmt(c), '+', '?', '=', fmt(a), '+', fmt(b)] : [fmt(a), '+', fmt(b), '=', fmt(c), '+', '?'];
  return {
    fam: 'balance', mode: 'either', ans, near: [a - c, b, ans + 1, ans - 1, ans + 10, ans - 10], title: T('Make both sides equal.', 'Haz que los dos lados sean iguales.'), show: { kind: 'eq', parts, scale: { left: `${fmt(a)} + ${fmt(b)}`, right: `${fmt(c)} + ?`, l: a + b, rr: c } },
    hint: T(`Work out the ${flip ? 'right' : 'left'} side first. Then ask: what goes with ${fmt(c)} to make the same?`, `Calcula primero el lado ${flip ? 'derecho' : 'izquierdo'}. Luego pregunta: ¿qué va con ${fmt(c)} para hacer lo mismo?`),
    vis: null, why: T(`${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}. ${fmt(c)} + ${fmt(ans)} = ${fmt(a + b)} too, so both sides are equal.`, `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}. ${fmt(c)} + ${fmt(ans)} = ${fmt(a + b)} también, así que los dos lados son iguales.`),
    meta: { rule: 'balance', a, b, c, flip },
  };
}

// ---------------------------------------------------------------- what's the rule? IN -> OUT
const RULES = {
  3: [(n) => n + 2, (n) => n + 3, (n) => n + 4, (n) => n + 5, (n) => n - 2, (n) => n - 3, (n) => n + 10],
  4: [(n) => n * 2, (n) => n * 10, (n) => n + 20, (n) => n - 5, (n) => n + 9, (n) => n * 2],
  5: [(n) => n * 5, (n) => n * 3, (n) => n + 25, (n) => n - 12, (n) => n * 4],
  6: [(n) => n * 2 + 1, (n) => n * 3 - 1, (n) => n * 5 + 2, (n) => n * 4 - 2],
  7: [(n) => n * 3 + 2, (n) => n * 6 - 1, (n) => n * 5 - 3, (n) => n * 7],
  8: [(n) => n * 9, (n) => n * 8 - 3, (n) => n * 6 + 5, (n) => n * 12],
};
const RULE_TEXT = (fn) => { const a = fn(0), b = fn(1) - fn(0); return { mul: b, add: a }; };
function ruleRaw(lv, r) {
  const L = Math.min(8, Math.max(3, lv));
  const fn = pk(r, RULES[L]);
  const { mul, add } = RULE_TEXT(fn);
  const lo = mul === 1 && add < 0 ? -add : 1;            // "take away 5" needs IN numbers of 5 or more
  const ins = [lo + ri(r, 1, L <= 3 ? 8 : 3)];
  while (ins.length < 3) { const v = lo + ri(r, 1, L <= 3 ? 18 : 8); if (!ins.includes(v)) ins.push(v); }
  ins.sort((x, y) => x - y);
  let ask = lo + (L <= 4 ? ri(r, 9, 30) : L <= 6 ? ri(r, 6, 15) : ri(r, 8, 20));
  while (ins.includes(ask)) ask++;                        // never ask for a number the table already shows
  const outs = ins.map(fn), ans = fn(ask);
  const rows = ins.map((n, i) => [n, outs[i]]); rows.push([ask, null]);
  const ruleEn = mul === 1 ? `${add >= 0 ? 'add' : 'take away'} ${Math.abs(add)}` : `multiply by ${mul}${add ? (add > 0 ? `, then add ${add}` : `, then take away ${-add}`) : ''}`;
  const ruleEs = mul === 1 ? `${add >= 0 ? 'suma' : 'resta'} ${Math.abs(add)}` : `multiplica por ${mul}${add ? (add > 0 ? ` y luego suma ${add}` : ` y luego resta ${-add}`) : ''}`;
  return {
    fam: 'rule', mode: 'either', ans, near: [ask + Math.abs(add), ask * mul, ans + 1, ans - 1, ans + mul, ans - mul], title: T('What does the machine do? Find the OUT number.', '¿Qué hace la máquina? Encuentra el número que sale.'), show: { kind: 'table', rows },
    hint: T('Look at the first row. How did the IN number turn into the OUT number? Test your idea on the next row.', 'Mira la primera fila. ¿Cómo se convirtió el número que entra en el que sale? Prueba tu idea con la siguiente fila.'),
    vis: null, why: T(`The rule is: ${ruleEn}. ${fmt(ask)} → ${fmt(ans)}.`, `La regla es: ${ruleEs}. ${fmt(ask)} → ${fmt(ans)}.`), meta: { rule: 'machine', mul, add, rows, ask },
  };
}

// ---------------------------------------------------------------- the families, by level
const FAMS = [
  { id: 'skip', min: 1, max: 8, w: 4, gen: skipRaw },
  { id: 'bond', min: 1, max: 8, w: 3, gen: bondRaw },
  { id: 'double', min: 1, max: 8, w: 2.5, gen: doubleRaw },
  { id: 'facts', min: 1, max: 8, w: 2.5, gen: factsRaw },
  { id: 'tens', min: 2, max: 8, w: 2, gen: tensRaw },
  { id: 'hop', min: 2, max: 8, w: 2, gen: hopRaw },
  { id: 'balance', min: 2, max: 8, w: 1.5, gen: balanceRaw },
  { id: 'grow', min: 2, max: 8, w: 2.5, gen: growRaw },
  { id: 'rule', min: 3, max: 8, w: 2, gen: ruleRaw },
];
export const TWISTS = [
  { id: 'cards', min: 1 }, { id: 'chomp', min: 1 }, { id: 'flash', min: 1 },
  { id: 'frog', min: 2 }, { id: 'scale', min: 2 }, { id: 'odd', min: 2 }, { id: 'machine', min: 3 },
];
const pNum = (lv) => [0, 0.1, 0.25, 0.4, 0.55, 0.65, 0.75, 0.8, 0.85][clampL(lv)];

const word = (lang, en, es) => (lang === 'es' ? es : en);
const sayOf = (q, lang) => {
  const blank = word(lang, 'blank', 'espacio'), what = word(lang, 'what', 'cuánto');
  const s = q.show;
  let body = '';
  if (s.kind === 'seq' || s.kind === 'chomp') body = s.items.map((n) => (n == null ? blank : n)).join(', ');
  else if (s.kind === 'eq' || s.kind === 'scale') body = s.parts.map((p) => (p === '?' ? what : p)).join(' ');
  else if (s.kind === 'eqs') body = s.rows.map((x) => x.replace('?', what)).join('. ');
  else if (s.kind === 'table' || s.kind === 'machine') body = s.rows.map(([a, b]) => `${word(lang, 'in', 'entra')} ${a}, ${word(lang, 'out', 'sale')} ${b == null ? blank : b}`).join('. ');
  else if (s.kind === 'hops' || s.kind === 'frog') body = `${word(lang, 'start at', 'empieza en')} ${s.start}. ` + s.hops.map((h) => (h > 0 ? word(lang, 'plus', 'más') : word(lang, 'minus', 'menos')) + ' ' + Math.abs(h)).join(', ');
  else if (s.kind === 'cards') body = s.eq;
  else if (s.kind === 'flash') body = '';
  else if (s.kind === 'odd') body = s.items.join(', ');
  return (body ? body + '. ' : '') + q.title;
};

function build(raw, lv, r, lang, extra = {}) {
  const P = (v) => (v && typeof v === 'object' && 'en' in v ? v[lang] ?? v.en : v);
  const show = raw.show;
  const q = {
    id: 'p' + lv + ':' + Math.floor(r() * 1e9).toString(36), level: lv, fam: raw.fam, twist: null, title: P(raw.title), show,
    hint: P(raw.hint), vis: raw.vis || null, why: P(raw.why), meta: raw.meta, topic: 'patterns', ...extra,
  };
  if (show.word && lang === 'es') show.parts = show.parts.map((p) => (p === 'double' ? 'el doble de' : p === 'half of' ? 'la mitad de' : p));
  if (raw.type === 'tap') { q.type = 'choice'; q.opts = raw.opts; q.a = raw.a; q.inline = true; q.vals = raw.vals; }
  else if (raw.mode === 'choice' || (raw.mode !== 'number' && r() >= pNum(lv)) || extra.forceChoice) {
    const o = optNums(r, raw.ans, raw.near || [], { neg: !!raw.neg });
    q.type = 'choice'; q.vals = o; q.opts = o.map(fmt); q.a = o.indexOf(raw.ans);
  } else { q.type = 'number'; q.a = raw.ans; }
  q.val = q.type === 'number' ? q.a : q.show.kind === 'odd' ? q.meta.terms[q.meta.idx] : q.vals[q.a];
  q.say = sayOf(q, lang);
  q.key = raw.fam + JSON.stringify(show);
  return q;
}

// ---------------------------------------------------------------- the twists: same numbers, a different game
function cardsTwist(lv, r) {
  const op = lv >= 4 && r() < 0.35 ? '×' : pk(r, ['−', '−', '+']);
  let A, B, ans, parts, title, why, hint;
  if (op === '×') {
    A = ri(r, 2, lv >= 6 ? 8 : 5); B = pk(r, lv >= 6 ? [4, 5, 6, 7, 8] : [2, 3, 4, 5]); ans = A * B;
    title = T('How many cards in all?', '¿Cuántas cartas hay en total?');
    hint = T(`${A} packs with ${B} cards in each. Count by ${B}s, or use a fact you know.`, `${A} paquetes con ${B} cartas cada uno. Cuenta de ${B} en ${B} o usa un dato que sepas.`);
    why = T(`${A} packs of ${B} is ${A} × ${B} = ${ans}.`, `${A} paquetes de ${B} es ${A} × ${B} = ${ans}.`);
  } else if (op === '−') {
    const top = lv <= 1 ? ri(r, 6, 10) : lv === 2 ? ri(r, 11, 20) : lv === 3 ? 10 * ri(r, 3, 9) + ri(r, 0, 5) : lv <= 5 ? ri(r, 40, 99) : ri(r, 120, 480);
    A = top; B = lv <= 1 ? ri(r, 2, top - 2) : lv === 2 ? ri(r, 4, top - 3) : lv === 3 ? 10 * ri(r, 1, Math.floor(top / 10) - 1) : lv <= 5 ? ri(r, 11, top - 12) : 10 * ri(r, 5, Math.floor(top / 10) - 2);
    ans = A - B;
    title = T('How many MORE rare cards than regular cards?', '¿Cuántas cartas raras MÁS que comunes hay?');
    hint = T('Line the rare cards up next to the regular ones. The extra ones sticking out are the answer.', 'Pon las cartas raras junto a las comunes. Las que sobran son la respuesta.');
    why = T(`${A} − ${B} = ${ans}. That is how many more rare cards there are.`, `${A} − ${B} = ${ans}. Esas son las cartas raras de más.`);
  } else {
    A = lv <= 1 ? ri(r, 2, 6) : lv === 2 ? ri(r, 6, 12) : lv === 3 ? 10 * ri(r, 2, 6) + ri(r, 1, 6) : lv <= 5 ? ri(r, 25, 68) : ri(r, 120, 380);
    B = lv <= 1 ? ri(r, 1, 4) : lv === 2 ? ri(r, 3, 8) : lv === 3 ? 10 * ri(r, 1, 3) : lv <= 5 ? ri(r, 14, 29) : ri(r, 60, 240);
    ans = A + B;
    title = T('How many cards in all?', '¿Cuántas cartas hay en total?');
    hint = T('Put the two groups together. Start with the bigger group and count on in chunks.', 'Junta los dos grupos. Empieza con el grupo más grande y suma por partes.');
    why = T(`${A} + ${B} = ${ans} cards in all.`, `${A} + ${B} = ${ans} cartas en total.`);
  }
  parts = [fmt(A), op, fmt(B), '=', '?'];
  return { fam: 'cards', mode: 'choice', ans, near: op === '−' ? [A + B, A, B, ans + 1, ans - 1] : op === '+' ? [A - B > 0 ? A - B : A, A, B, ans + 1, ans - 1, ans + 10, ans - 10] : [A + B, ans + A, ans - B, ans + 1, ans - 1], title, show: { kind: 'cards', op, A, B, parts, eq: parts.join(' ') }, hint, vis: null, why, meta: { rule: 'cards', op, A, B } };
}
function flashTwist(lv, r) {
  let n, a = 0, b = 0, two = false;
  if (lv <= 1) n = ri(r, 3, 10);
  else if (lv === 2) n = ri(r, 6, 14);
  else if (lv <= 4) n = ri(r, 10, 20);
  else { two = true; a = ri(r, lv <= 5 ? 4 : 6, 10); b = ri(r, lv <= 5 ? 3 : 5, 10); n = a + b; }
  const ms = lv <= 1 ? 3200 : lv <= 3 ? 2600 : 2200;
  return {
    fam: 'flash', mode: 'choice', ans: n, near: [n + 1, n - 1, n + 2, n - 2, n + 5, n - 5], title: two ? T('How many dots in all? Look fast!', '¿Cuántos puntos hay en total? ¡Mira rápido!') : T('How many dots? Look fast!', '¿Cuántos puntos hay? ¡Mira rápido!'),
    show: { kind: 'flash', n, a, b, two, ms, scatter: lv >= 3 && !two }, hint: two ? T('See the two colors? Add the red group and the blue group.', '¿Ves los dos colores? Suma el grupo rojo y el grupo azul.') : T('A full row of 5 is easy to spot. How many full rows? How many are left?', 'Una fila completa de 5 se ve fácil. ¿Cuántas filas completas hay? ¿Cuántos sobran?'), vis: null,
    why: two ? T(`${a} + ${b} = ${n} dots.`, `${a} + ${b} = ${n} puntos.`) : T(`There were ${n} dots.`, `Había ${n} puntos.`), meta: { rule: 'flash', n, a, b },
  };
}
function oddTwist(lv, r) {
  const { start, step } = skipParams(Math.max(2, Math.min(lv, 7)), r);
  const terms = ap(start, step, 6);
  const idx = ri(r, 1, 4);
  const cands = shuffle([1, 2, 3, 4, 5, 10, -1, -2, -3, -4, -5, Math.round(step / 2) || 3], r).map((b) => terms[idx] + b);
  let wrong = cands.find((w) => w >= 0 && !terms.includes(w));
  if (wrong == null) wrong = terms[idx] + 7 * Math.abs(step) + 1;
  const items = terms.slice(); items[idx] = wrong;
  const d = Math.abs(step), up = step > 0;
  return {
    fam: 'odd', type: 'tap', mode: 'choice', ans: wrong, opts: items.map(fmt), a: idx, vals: items, title: T('One number does not fit the pattern. Tap it!', 'Un número no encaja en el patrón. ¡Tócalo!'), show: { kind: 'odd', items },
    hint: T(`The numbers should ${up ? 'go up' : 'go down'} by the same amount each time. Hop along and see where it breaks.`, `Los números deben ${up ? 'subir' : 'bajar'} lo mismo cada vez. Ve saltando y mira dónde se rompe.`), vis: null,
    why: T(`It should be ${fmt(terms[idx])}: the pattern ${up ? 'goes up' : 'goes down'} by ${fmt(d)} each time.`, `Debería ser ${fmt(terms[idx])}: el patrón ${up ? 'sube' : 'baja'} ${fmt(d)} cada vez.`), meta: { rule: 'odd', start, step, idx, wrong, terms },
  };
}

/** One question. twist: null (a regular puzzle) or one of TWISTS ids. */
export function makePattern(level, r = Math.random, lang = 'en', { twist = null, avoid = null } = {}) {
  const lv = clampL(level);
  for (let tries = 0; tries < 14; tries++) {
    let q;
    if (!twist) {
      const pool = FAMS.filter((f) => lv >= f.min && lv <= f.max);
      let x = r() * pool.reduce((s, f) => s + f.w, 0), fam = pool[0];
      for (const f of pool) { x -= f.w; if (x <= 0) { fam = f; break; } }
      q = build(fam.gen(lv, r), lv, r, lang, { slot: 'core' });
    } else if (twist === 'cards') q = build(cardsTwist(lv, r), lv, r, lang, { twist, slot: 'twist' });
    else if (twist === 'flash') q = build(flashTwist(lv, r), lv, r, lang, { twist, slot: 'twist' });
    else if (twist === 'odd') q = build(oddTwist(lv, r), lv, r, lang, { twist, slot: 'twist' });
    else if (twist === 'chomp') {
      const raw = r() < 0.7 || lv < 4 ? skipRaw(lv, r, { hole: lv <= 1 ? 4 : 4 }) : growRaw(lv, r);
      raw.show = { kind: 'chomp', items: raw.show.items }; raw.title = T('Feed the Chomper! Which number is it hungry for?', '¡Dale de comer al Tragón! ¿Qué número tiene hambre?'); raw.mode = 'choice';
      q = build(raw, lv, r, lang, { twist, slot: 'twist' });
    } else if (twist === 'frog') {
      const raw = hopRaw(Math.max(2, lv), r);
      const vals = optNums(r, raw.ans, raw.near, { n: 5 }).sort((x, y) => x - y);
      q = build({ ...raw, type: 'tap', opts: vals.map(fmt), a: vals.indexOf(raw.ans), vals, show: { kind: 'frog', start: raw.meta.start, hops: raw.meta.hops }, title: T('Where does the frog land? Tap the lily pad!', '¿Dónde cae la rana? ¡Toca el nenúfar!') }, lv, r, lang, { twist, slot: 'twist' });
    } else if (twist === 'scale') {
      const raw = balanceRaw(Math.max(2, lv), r);
      raw.show = { kind: 'scale', ...raw.show.scale, parts: raw.show.parts }; raw.mode = 'choice';
      q = build(raw, lv, r, lang, { twist, slot: 'twist' });
    } else if (twist === 'machine') {
      const raw = ruleRaw(Math.max(3, lv), r);
      raw.show = { kind: 'machine', rows: raw.show.rows }; raw.mode = 'choice'; raw.title = T('Feed the machine! What number comes OUT?', '¡Alimenta la máquina! ¿Qué número sale?');
      q = build(raw, lv, r, lang, { twist, slot: 'twist' });
    } else throw new Error('Unknown twist ' + twist);
    if (!avoid || !avoid.has(q.key)) return q;
    if (tries === 13) return q;
  }
  return null;
}

/** Which of the questions in a round are twists: the 3rd or 4th, then every 3rd or 4th after that. */
export function twistSlots(r, size = 10) {
  const s = Array(size).fill(false);
  let i = pk(r, [2, 3]);
  while (i < size - 1) { s[i] = true; i += pk(r, [3, 4]); }
  if (!s[size - 1] && !s[size - 2]) s[size - 1] = true;
  return s;
}

/** A whole run of puzzles for a player at `level`. recent = keys of puzzles from the last runs (so nothing repeats). */
export function makeRound({ level, r = Math.random, lang = 'en', size = 10, recent = [] }) {
  const lv = clampL(level);
  const slots = twistSlots(r, size);
  const avoid = new Set(recent);
  const kinds = shuffle(TWISTS.filter((t) => t.min <= lv), r);
  let ti = 0;
  const out = [];
  slots.forEach((isTwist, i) => {
    let eff = lv;
    if (i === 0) eff = clampL(lv - 1);
    else if (!isTwist) { const x = r(); eff = x < 0.2 ? clampL(lv - 1) : x > 0.82 ? clampL(lv + 1) : lv; }
    const q = makePattern(eff, r, lang, { twist: isTwist ? kinds[ti++ % kinds.length].id : null, avoid });
    avoid.add(q.key); out.push(q);
  });
  return out;
}
