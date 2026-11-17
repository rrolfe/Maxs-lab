// Checks the 200 Read It Loud facts (shape, reading level, characters) and runs the matcher against simulated "listening mistakes".
import { CATS, FACTS } from '../../data/facts.js';
import { match, tokens, numWords } from '../../js/read/match.js';
let bad = 0; const fail = (m) => { bad++; if (bad < 40) console.log('FAIL', m); };

// ---------- shape
if (FACTS.length !== 200) fail('expected 200 facts, got ' + FACTS.length);
const ids = new Set(), texts = new Set();
for (const c of CATS) { const n = FACTS.filter((f) => f.cat === c.id).length; if (n !== 20) fail(`${c.id} has ${n} facts`); }
const wc = (s) => s.split(/\s+/).length;
const stat = { 1: [], 2: [], 3: [] };
for (const f of FACTS) {
  if (ids.has(f.id)) fail('dup id ' + f.id); ids.add(f.id);
  if (texts.has(f.text)) fail('dup text ' + f.id); texts.add(f.text);
  if (![1, 2, 3].includes(f.tier)) fail('tier ' + f.id);
  if (!/[.!?]$/.test(f.text)) fail('no end mark ' + f.id);
  const odd = f.text.replace(/[A-Za-z0-9 .,'’:!?-]/g, '');
  if (odd) fail(`odd characters "${odd}" in ${f.id}`);
  for (const m of f.text.matchAll(/\d[\d,]*/g)) {
    const raw = m[0].replace(/,+$/, ''), n = +raw.replace(/,/g, '');
    if (raw.includes(',') && !/^\d{1,3}(,\d{3})+$/.test(raw)) fail(`bad comma number ${raw} in ${f.id}`);
    if (!raw.includes(',') && n >= 1000 && !(raw.length === 4 && n >= 1100 && n <= 2099)) fail(`number ${raw} in ${f.id} needs a comma or must be a year`);
  }
  const w = wc(f.text); stat[f.tier].push(w);
  const lim = { 1: [5, 18], 2: [8, 28], 3: [14, 42] }[f.tier];
  if (w < lim[0] || w > lim[1]) fail(`${f.id} tier ${f.tier} has ${w} words (wanted ${lim[0]}-${lim[1]}): ${f.text}`);
  if (/\b(\w+) \1\b/i.test(f.text)) fail('repeated word in ' + f.id);
}
for (const t of [1, 2, 3]) { const a = stat[t]; console.log(`tier ${t}: ${a.length} facts, ${Math.min(...a)}-${Math.max(...a)} words, average ${(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1)}`); }
console.log('per topic (tier 1/2/3):', CATS.map((c) => `${c.id} ${[1, 2, 3].map((t) => FACTS.filter((f) => f.cat === c.id && f.tier === t).length).join('/')}`).join(' | '));
console.log('number words check:', numWords(100000).join(' '), '|', numWords(1500).join(' '), '|', tokens('1912').join(' '), '|', tokens('100,000').join(' '));

// ---------- matcher against simulated listening mistakes
let seed = 7; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const words = (t) => t.split(/\s+/);
const plain = (t) => t.toLowerCase().replace(/[’']/g, '').replace(/[.,:!?]/g, '');
const SPOKEN = (t) => words(t).map((w) => tokens(w).join(' ')).join(' ');           // everything as number words, like a careful recognizer
const SWAP = { two: 'to', to: 'too', for: 'four', four: 'for', there: 'their', one: 'won', right: 'write', see: 'sea', eight: 'ate', no: 'know', by: 'buy', weigh: 'way' };
const dropAt = (arr, i) => arr.filter((_, k) => k !== i);
const results = {};
const tally = (k, strict, ok) => { const key = `${k}@${strict}`; (results[key] ||= { n: 0, pass: 0 }); results[key].n++; if (ok) results[key].pass++; };
const others = (f) => FACTS.filter((g) => g.id !== f.id);
for (const f of FACTS) {
  for (const s of [1, 2, 3]) {
    tally('perfect', s, match(f.text, f.text, s).pass);
    tally('spoken-words', s, match(f.text, SPOKEN(f.text), s).pass);
    tally('lowercase-plain', s, match(f.text, plain(f.text), s).pass);
    const sw = words(plain(f.text)).map((w) => (SWAP[w] && r() < 0.8 ? SWAP[w] : w)).join(' ');
    tally('homophones', s, match(f.text, sw, s).pass);
    const st = words(plain(f.text)).flatMap((w) => (r() < 0.15 ? [w, w] : [w])).join(' ');
    tally('stutter', s, match(f.text, 'um ' + st, s).pass);
    tally('restart', s, match(f.text, words(plain(f.text)).slice(0, 3).join(' ') + ' ' + plain(f.text), s).pass);
    for (let k = 0; k < 6; k++) {                                                      // one random word missing
      const a = words(plain(f.text)); tally('drop1', s, match(f.text, dropAt(a, Math.floor(r() * a.length)).join(' '), s).pass);
    }
    for (let k = 0; k < 6; k++) {                                                      // two random words missing
      let a = words(plain(f.text)); a = dropAt(a, Math.floor(r() * a.length)); a = dropAt(a, Math.floor(r() * a.length)); tally('drop2', s, match(f.text, a.join(' '), s).pass);
    }
    for (let k = 0; k < 6; k++) {                                                      // one word heard wrong
      const a = words(plain(f.text)); a[Math.floor(r() * a.length)] = 'banana'; tally('wrong1', s, match(f.text, a.join(' '), s).pass);
    }
    const a = words(plain(f.text));
    tally('first-half-only', s, match(f.text, a.slice(0, Math.floor(a.length / 2)).join(' '), s).pass);
    tally('second-half-only', s, match(f.text, a.slice(Math.ceil(a.length / 2)).join(' '), s).pass);
    tally('other-fact', s, match(f.text, plain(others(f)[Math.floor(r() * 199)].text), s).pass);
    tally('same-topic-other', s, match(f.text, plain(FACTS.filter((g) => g.cat === f.cat && g.id !== f.id)[Math.floor(r() * 19)].text), s).pass);
    tally('empty', s, match(f.text, '', s).pass);
    tally('noise', s, match(f.text, 'uh the a of is it to and', s).pass);
    tally('one-word-repeated', s, match(f.text, a.slice(0, 1).join(' ').repeat(1) + (' ' + a[0]).repeat(12), s).pass);
  }
}
const expectPass = ['perfect', 'spoken-words', 'lowercase-plain', 'stutter', 'restart'];
const expectFail = ['first-half-only', 'second-half-only', 'other-fact', 'same-topic-other', 'empty', 'noise', 'one-word-repeated'];
const kinds = [...new Set(Object.keys(results).map((k) => k.split('@')[0]))];
console.log('\n(pass rate of simulated reads, by strictness 1 relaxed / 2 normal / 3 strict)');
for (const k of kinds) {
  const row = [1, 2, 3].map((s) => { const x = results[`${k}@${s}`]; return `${String(Math.round((100 * x.pass) / x.n)).padStart(3)}%`; }).join('  ');
  console.log(k.padEnd(18), row);
  for (const s of [1, 2, 3]) {
    const x = results[`${k}@${s}`], pct = x.pass / x.n;
    if (expectPass.includes(k) && pct < (k === 'homophones' ? 0.95 : 0.999)) fail(`${k} should pass at strict ${s}: ${Math.round(pct * 100)}%`);
    if (expectFail.includes(k) && pct > 0.0) fail(`${k} should fail at strict ${s}: ${Math.round(pct * 100)}%`);
  }
}
const g = (k, s) => results[`${k}@${s}`].pass / results[`${k}@${s}`].n;
if (g('homophones', 1) < 0.97) fail('homophones at relaxed');
if (g('drop1', 1) < 0.97) fail('one dropped word should nearly always pass at relaxed: ' + g('drop1', 1));
if (g('drop2', 1) < 0.85) fail('two dropped words should usually pass at relaxed: ' + g('drop2', 1));
if (g('wrong1', 1) < 0.9) fail('one wrong word should usually pass at relaxed: ' + g('wrong1', 1));
console.log(bad ? `\n${bad} problem(s)` : '\nall good');
process.exit(bad ? 1 : 0);
