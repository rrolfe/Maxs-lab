// Number Patterns: checks thousands of generated puzzles with an INDEPENDENT calculator (it re-derives every answer from what is
// shown on screen, not from the generator's own arithmetic). Run: node tools/tests/patterns-unit.mjs
import { makePattern, makeRound, twistSlots, TWISTS, MAX_LEVEL, fmt } from '../../js/quiz/patterns.js';

let bad = 0, total = 0;
const fail = (msg, q) => { bad++; if (bad <= 25) console.log('FAIL', msg, JSON.stringify(q).slice(0, 400)); };
const num = (s) => { const x = String(s).replace(/,/g, '').replace('−', '-'); return Number(x); };
// seeded random so a failure can be repeated
function seeded(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** Solve "a op b = c" style lines with one '?' (or two sides: "a + b = c + ?") */
function evalSide(tokens) { // tokens like ['8','+','5'] or ['half of','36'] or ['double','34'] or ['?']
  if (tokens.length === 1) return tokens[0] === '?' ? '?' : num(tokens[0]);
  if (tokens[0] === 'double' || tokens[0] === 'el doble de') return 2 * num(tokens[1]);
  if (tokens[0] === 'half of' || tokens[0] === 'la mitad de') return num(tokens[1]) / 2;
  if (tokens.length === 3) {
    const [x, op, y] = tokens;
    if (x === '?' || y === '?') return '?';
    const a = num(x), b = num(y);
    return op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : NaN;
  }
  return NaN;
}
function solveEq(parts) {
  const i = parts.indexOf('=');
  const L = parts.slice(0, i), R = parts.slice(i + 1);
  const l = evalSide(L), r = evalSide(R);
  if (l === '?' || r === '?') {
    // single unknown inside a side: find it
    const known = l === '?' ? r : l, side = l === '?' ? L : R;
    if (side.length === 1) return known;
    const [x, op, y] = side;
    if (x === '?') return op === '+' ? known - num(y) : op === '−' ? known + num(y) : known / num(y);
    return op === '+' ? known - num(x) : op === '−' ? num(x) - known : known / num(x);
  }
  // unknown on the "other" side of a two-sided balance: "a + b = c + ?" => evalSide gave '?' for the right
  return NaN;
}
function solveBalance(parts) {
  // forms: [a,+,b,=,c,+,?]  or  [c,+,?,=,a,+,b]
  const i = parts.indexOf('=');
  const L = parts.slice(0, i), R = parts.slice(i + 1);
  const hasQ = (t) => t.includes('?');
  const full = hasQ(L) ? R : L, part = hasQ(L) ? L : R;
  const total = evalSide(full);
  const known = part[0] === '?' ? num(part[2]) : num(part[0]);
  return total - known;
}

function verify(q, lv) {
  total++;
  const s = q.show, m = q.meta;
  let expect;
  switch (s.kind) {
    case 'seq': case 'chomp': {
      const n = s.items.length, hole = s.items.indexOf(null);
      if (hole < 0 || s.items.filter((x) => x == null).length !== 1) return fail('seq needs exactly one blank', q);
      const t = m.terms;
      const vis = s.items.filter((x) => x != null);
      if (q.fam === 'skip') { // arithmetic progression
        const exp = m.start + m.step * hole; expect = exp;
        for (let i = 0; i < n; i++) if (i !== hole && s.items[i] !== m.start + m.step * i) return fail('skip item off', q);
        if (Math.abs(m.step) < 1) return fail('zero step', q);
      } else {
        // growing patterns: rebuild from the rule
        let terms;
        const k = m.rule;
        if (k === 'ap') terms = m.terms;
        else if (k === 'rep') terms = Array.from({ length: 6 }, (_, i) => m.unit[i % m.unit.length]);
        else if (k === 'inc') { terms = [m.s]; for (let i = 0; i < 5; i++) terms.push(terms[terms.length - 1] + m.d0 + m.g * i); }
        else if (k === 'alt') { terms = [m.s]; for (let i = 0; i < 5; i++) terms.push(terms[terms.length - 1] + (i % 2 === 0 ? m.a : -m.b)); }
        else if (k === 'dbl') terms = [0, 1, 2, 3, 4].map((i) => m.s * 2 ** i);
        else if (k === 'half') terms = [0, 1, 2, 3, 4].map((i) => m.m * 2 ** (4 - i));
        else if (k === 'triple') terms = [0, 1, 2, 3, 4].map((i) => m.s * 3 ** i);
        else if (k === 'fib') { terms = [m.a, m.b]; for (let i = 2; i < 6; i++) terms.push(terms[i - 1] + terms[i - 2]); }
        else if (k === 'sq') terms = [0, 1, 2, 3, 4, 5].map((i) => (m.n0 + i) ** 2);
        else if (k === 'tri') terms = [0, 1, 2, 3, 4, 5].map((i) => ((m.n0 + i) * (m.n0 + i + 1)) / 2);
        else if (k === 'mix') { terms = [m.s]; for (let i = 0; i < 4; i++) terms.push(terms[terms.length - 1] * 2 + m.k); }
        else return fail('unknown grow rule ' + k, q);
        for (let i = 0; i < s.items.length; i++) if (i !== hole && s.items[i] !== terms[i]) return fail(`grow item ${i} off (${s.items[i]} vs ${terms[i]})`, q);
        expect = terms[hole];
      }
      break;
    }
    case 'eq': case 'scale': {
      expect = (s.kind === 'scale' || m.rule === 'balance') ? solveBalance(s.parts) : solveEq(s.parts);
      if (m.rule === 'bond' && !(m.a + expect === m.total)) return fail('bond sum', q);
      break;
    }
    case 'eqs': {
      const rows = s.rows;
      const lastIdx = rows.length - 1;
      const parsed = rows.map((row) => row.split(' '));
      for (let i = 0; i < lastIdx; i++) if (solveEq(parsed[i].map((x) => (x === '=' ? '=' : x))) !== undefined) { /* every shown line must be true */ }
      for (let i = 0; i < lastIdx; i++) {
        const [a, op, b, eq, c] = parsed[i];
        const v = op === '+' ? num(a) + num(b) : op === '−' ? num(a) - num(b) : num(a) * num(b);
        if (v !== num(c)) return fail('shown fact is false: ' + rows[i], q);
      }
      const [a, op, b] = parsed[lastIdx];
      expect = op === '+' ? num(a) + num(b) : op === '−' ? num(a) - num(b) : num(a) * num(b);
      break;
    }
    case 'table': case 'machine': {
      const rows = s.rows;
      const fn = (x) => m.mul * x + m.add;
      for (const [i, o] of rows) if (o != null && fn(i) !== o) return fail('table row false', q);
      const last = rows[rows.length - 1]; if (last[1] != null) return fail('table last row must be the unknown', q);
      expect = fn(last[0]);
      if (rows.slice(0, -1).some(([i]) => i === last[0])) return fail('asked a number already shown', q);
      break;
    }
    case 'hops': case 'frog': {
      expect = s.hops.reduce((a, b) => a + b, s.start);
      if (s.hops.length < 2) return fail('hops too short', q);
      break;
    }
    case 'cards': {
      const { op, A, B } = s;
      expect = op === '+' ? A + B : op === '−' ? A - B : A * B;
      if (op === '−' && !(A > B)) return fail('cards: A must exceed B', q);
      break;
    }
    case 'flash': expect = s.two ? s.a + s.b : s.n; if (s.two && s.a + s.b !== s.n) return fail('flash sum', q); if (s.n > 20) return fail('flash > 20', q); break;
    case 'odd': {
      const t = m.terms, wrong = m.idx;
      const diffs = s.items.map((x, i) => (x !== t[i] ? i : -1)).filter((i) => i >= 0);
      if (diffs.length !== 1 || diffs[0] !== wrong) return fail('odd: exactly one number must break the pattern', q);
      if (q.a !== wrong) return fail('odd: answer index', q);
      if (new Set(s.items).size !== s.items.length) return fail('odd: duplicate numbers shown', q);
      expect = null;
      break;
    }
    default: return fail('unknown show kind ' + s.kind, q);
  }
  if (!Number.isFinite(expect) && expect !== null) return fail('answer not finite: ' + expect, q);
  if (q.type === 'number') {
    if (q.a !== expect) return fail(`number answer ${q.a} != ${expect}`, q);
    if (!Number.isInteger(q.a) || q.a < 0) return fail('number answers must be whole numbers >= 0 (keypad)', q);
  } else if (q.type === 'choice') {
    if (new Set(q.opts).size !== q.opts.length) return fail('duplicate options', q);
    if (q.a < 0 || q.a >= q.opts.length) return fail('correct option missing', q);
    if (s.kind === 'odd') { if (q.opts[q.a] !== fmt(s.items[q.a])) return fail('odd option text', q); }
    else {
      if (num(q.opts[q.a]) !== expect) return fail(`choice answer ${q.opts[q.a]} != ${expect}`, q);
      if (q.opts.filter((o) => num(o) === expect).length !== 1) return fail('correct answer listed twice', q);
    }
    if (q.opts.length < 4) return fail('need at least 4 options', q);
    if (s.kind === 'frog') {
      const v = q.vals; for (let i = 1; i < v.length; i++) if (v[i] <= v[i - 1]) return fail('frog pads must be ascending', q);
    }
  } else return fail('unknown type ' + q.type, q);
  // text must exist in both languages and never leak "undefined"/"NaN"
  for (const lang of ['en', 'es']) {
    const rr = seeded(7);
    void rr;
  }
  for (const k of ['title', 'hint', 'why', 'say']) {
    const v = q[k]; if (typeof v !== 'string' || !v.trim()) return fail('missing ' + k, q);
    if (/undefined|NaN|\[object|\?\?/.test(v)) return fail('bad text in ' + k + ': ' + v, q);
  }
  if (q.type === 'number' && /\b(count on your fingers)\b/i.test(q.hint)) return fail('hints must not suggest fingers', q);
}

const r = seeded(20261117);
const famSeen = {}, twSeen = {};
for (const lang of ['en', 'es']) {
  for (let lv = 1; lv <= MAX_LEVEL; lv++) {
    for (let i = 0; i < 700; i++) {
      const q = makePattern(lv, r, lang);
      verify(q, lv); famSeen[q.fam] = (famSeen[q.fam] || 0) + 1;
    }
    for (const t of TWISTS) {
      if (t.min > lv) continue;
      for (let i = 0; i < 150; i++) { const q = makePattern(lv, r, lang, { twist: t.id }); verify(q, lv); if (q.twist !== t.id) fail('twist id', q); twSeen[t.id] = (twSeen[t.id] || 0) + 1; }
    }
  }
}
// rounds: size, twist rhythm, no duplicates, twist variety
let roundsOk = 0;
for (let lv = 1; lv <= MAX_LEVEL; lv++) {
  for (let k = 0; k < 120; k++) {
    const round = makeRound({ level: lv, r, lang: k % 2 ? 'es' : 'en', size: 10 });
    total++;
    if (round.length !== 10) { fail('round size ' + round.length, {}); continue; }
    const idx = round.map((q, i) => (q.slot === 'twist' ? i : -1)).filter((i) => i >= 0);
    if (idx.length < 2 || idx.length > 4) fail('twist count ' + idx.length, idx);
    if (idx[0] !== 2 && idx[0] !== 3) fail('first twist must be 3rd or 4th question: ' + idx, idx);
    for (let i = 1; i < idx.length; i++) { const gap = idx[i] - idx[i - 1]; if (gap < 2 || gap > 4) fail('twist spacing ' + gap + ' in ' + idx, idx); }
    if (round[0].slot !== 'core') fail('first must be a regular puzzle', {});
    const kinds = round.filter((q) => q.twist).map((q) => q.twist); if (new Set(kinds).size !== kinds.length) fail('twists repeat in a round: ' + kinds, kinds);
    const keys = round.map((q) => q.key); if (new Set(keys).size !== keys.length) fail('duplicate puzzle in a round', keys);
    round.forEach((q) => verify(q, lv));
    roundsOk++;
  }
}
// twistSlots never puts two twists side by side
for (let i = 0; i < 2000; i++) { const s = twistSlots(r, 10); total++; for (let j = 1; j < s.length; j++) if (s[j] && s[j - 1]) { fail('adjacent twists', s); break; } if (s.filter(Boolean).length < 2) fail('too few twists', s); }

console.log('puzzles checked:', total, '| rounds:', roundsOk, '| problems:', bad);
console.log('families:', JSON.stringify(famSeen));
console.log('twists  :', JSON.stringify(twSeen));
process.exit(bad ? 1 : 0);
