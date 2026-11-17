// The forgiving "did he read it?" matcher for Read It Loud (beta). Pure functions: no DOM, no storage, safe to unit-test in Node.
// A phone or iPad turns speech into text with mistakes (digits for number words, "to" for "two", dropped little words, a missing plural s),
// and a 7-year-old reads with pauses and re-starts. So this lines up what was heard against what was written, word by word, and is generous:
//   - numbers match in any form ("50" = "fifty", "7-year-old" = "seven year old", "1969" = "nineteen sixty nine")
//   - sound-alikes match (to/too/two, their/there, one/won ...) and near spellings match (a letter off, plural or possessive s)
//   - little words (a, the, of ...) count half as much as the others
//   - extra heard words ("um", a repeated word, a restart) cost nothing; the words only have to come in the same order.

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ORD = { 1: 'first', 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth', 11: 'eleventh', 12: 'twelfth', 13: 'thirteenth', 14: 'fourteenth', 15: 'fifteenth', 16: 'sixteenth', 17: 'seventeenth', 18: 'eighteenth', 19: 'nineteenth', 20: 'twentieth', 21: 'twenty first', 22: 'twenty second', 23: 'twenty third', 24: 'twenty fourth', 25: 'twenty fifth', 26: 'twenty sixth', 27: 'twenty seventh', 28: 'twenty eighth', 29: 'twenty ninth', 30: 'thirtieth', 31: 'thirty first' };

export function numWords(n) {
  if (n < 20) return [ONES[n]];
  if (n < 100) return [TENS[Math.floor(n / 10)]].concat(n % 10 ? [ONES[n % 10]] : []);
  if (n < 1000) return [ONES[Math.floor(n / 100)], 'hundred'].concat(n % 100 ? numWords(n % 100) : []);
  for (const [u, name] of [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']]) {
    if (n >= u) { const q = Math.floor(n / u), r = n % u; return numWords(q).concat([name], r ? numWords(r) : []); }
  }
  return [String(n)];
}
function yearWords(n) {
  const hi = Math.floor(n / 100), lo = n % 100;
  if (n === 2000) return ['two', 'thousand'];
  if (n > 2000 && n < 2010) return ['two', 'thousand', ONES[lo]];
  if (lo === 0) return numWords(hi).concat(['hundred']);
  if (lo < 10) return numWords(hi).concat(['oh', ONES[lo]]);
  return numWords(hi).concat(numWords(lo));
}

/** One written or heard word -> a list of lower-case comparison tokens (usually one). */
export function tokens(word) {
  let w = String(word).toLowerCase().replace(/[’‘`]/g, "'").replace(/−/g, '-');
  w = w.replace(/^[^a-z0-9$]+|[^a-z0-9%]+$/g, '');                 // trim punctuation at both ends
  if (!w) return [];
  const out = [];
  let m;
  if ((m = w.match(/^\$(\d[\d,]*)$/))) return numTokens(m[1]).concat(['dollars']);
  if ((m = w.match(/^(\d[\d,]*(?:\.\d+)?)%$/))) return numTokens(m[1]).concat(['percent']);
  if (/^\d[\d,]*(\.\d+)?$/.test(w)) return numTokens(w);
  if ((m = w.match(/^(\d+)(st|nd|rd|th)$/))) { const n = +m[1]; return ORD[n] ? ORD[n].split(' ') : numTokens(m[1]); }
  for (const part of w.split(/[-–—\/_]+/)) {
    if (/^\d[\d,]*(\.\d+)?$/.test(part)) { out.push(...numTokens(part)); continue; }
    const p = part.replace(/'/g, '').replace(/[^a-z0-9]/g, '');
    if (p) out.push(p);
  }
  return out;
}
function numTokens(s) {
  if (s.includes('.')) { const [a, b] = s.replace(/,/g, '').split('.'); return numWords(+a).concat(['point'], b.split('').map((d) => ONES[+d])); }
  const comma = s.includes(',');
  const n = +s.replace(/,/g, '');
  if (!comma && s.length === 4 && n >= 1100 && n <= 2099) return yearWords(n);   // 1969 is said "nineteen sixty nine"
  return n < 1e12 ? numWords(n) : [s];
}

const LITTLE = new Set(['a', 'an', 'the', 'of', 'to', 'in', 'on', 'at', 'is', 'are', 'was', 'were', 'be', 'it', 'its', 'and', 'or', 'as', 'for', 'by', 'that', 'this', 'with', 'so', 'from', 'than', 'but', 'has', 'have', 'can']);
const weight = (tok) => (LITTLE.has(tok) ? 0.5 : 1);

// sound-alikes: all words in a group are treated as the same word
const GROUPS = [
  ['to', 'too', 'two'], ['for', 'four', 'fore'], ['there', 'their', 'theyre'], ['here', 'hear'], ['know', 'no'], ['one', 'won'], ['right', 'write', 'rite'], ['by', 'buy', 'bye'],
  ['sun', 'son'], ['would', 'wood'], ['see', 'sea'], ['be', 'bee'], ['eye', 'i', 'aye'], ['you', 'ewe', 'u'], ['are', 'r'], ['your', 'youre', 'yore'], ['whole', 'hole'], ['ate', 'eight'],
  ['weigh', 'way', 'whey'], ['tail', 'tale'], ['flower', 'flour'], ['mail', 'male'], ['plain', 'plane'], ['sail', 'sale'], ['steal', 'steel'], ['bear', 'bare'], ['hair', 'hare'],
  ['meat', 'meet'], ['peace', 'piece'], ['pair', 'pear'], ['red', 'read'], ['blue', 'blew'], ['new', 'knew'], ['night', 'knight'], ['not', 'knot'], ['wait', 'weight'], ['which', 'witch'],
  ['whale', 'wail'], ['wear', 'where'], ['threw', 'through'], ['sight', 'site'], ['seen', 'scene'], ['cell', 'sell'], ['hour', 'our'], ['made', 'maid'], ['rain', 'reign'], ['road', 'rode'],
  ['role', 'roll'], ['sole', 'soul'], ['week', 'weak'], ['war', 'wore'], ['great', 'grate'], ['feet', 'feat'], ['heal', 'heel'], ['die', 'dye'], ['fair', 'fare'], ['nose', 'knows'],
  ['oh', 'owe'], ['ant', 'aunt'], ['dear', 'deer'], ['sent', 'scent', 'cent'], ['toe', 'tow'], ['vain', 'vein'], ['stair', 'stare'], ['sweet', 'suite'], ['pi', 'pie'], ['paws', 'pause'],
];
const GROUP_OF = new Map();
GROUPS.forEach((g, i) => g.forEach((w) => GROUP_OF.set(w, i)));

function stem(w) { return w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w; }
function edit(a, b, cap) {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
/** A rough "how it sounds" key: so "atmosfear" and "atmosphere", or "volcayno" and "volcano", line up. */
export function phon(w) {
  let s = w.replace(/[^a-z]/g, '');
  s = s.replace(/^kn/, 'n').replace(/^gn/, 'n').replace(/^wr/, 'r').replace(/^ps/, 's').replace(/^wh/, 'w');
  s = s.replace(/ph/g, 'f').replace(/ght/g, 't').replace(/ck/g, 'k').replace(/q/g, 'k').replace(/x/g, 'ks').replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k').replace(/z/g, 's').replace(/dg/g, 'j').replace(/tch/g, 'ch');
  s = s.replace(/(.)\1+/g, '$1');
  return (s[0] || '') + s.slice(1).replace(/[aeiouyhw]/g, '');
}

/** 2 = same word, 1 = close enough (counts, but shown as "near"), 0 = different. */
export function same(a, b, strict = 1) {
  if (a === b) return 2;
  if (stem(a) === stem(b)) return 1;
  const ga = GROUP_OF.get(a);
  if (ga !== undefined && ga === GROUP_OF.get(b)) return 1;
  const lo = Math.min(a.length, b.length), hi = Math.max(a.length, b.length);
  if (strict >= 3) return lo >= 6 && edit(a, b, 1) <= 1 ? 1 : 0;
  if (lo >= 4 && edit(a, b, hi >= 8 ? 2 : 1) <= (hi >= 8 ? 2 : 1)) return 1;
  if (strict <= 2 && lo >= 5 && phon(a) === phon(b) && phon(a).length >= 3) return 1;
  return 0;
}

export const PASS_AT = [0.7, 0.82, 0.92];   // 1 = relaxed (the default for the beta), 2 = normal, 3 = strict

/**
 * match(expectedText, heardText, strict) ->
 *   { words: [{ w, st: 'ok' | 'near' | 'miss' | 'skip' }],   one per written word, for colouring the screen
 *     score, pass, need, heard }                               score 0..1 (weighted), heard = number of words heard
 */
export function match(expected, heard, strict = 1) {
  strict = Math.min(3, Math.max(1, strict | 0 || 1));
  const shown = String(expected).split(/\s+/).filter(Boolean);
  const E = [], owner = [];                                          // flat expected tokens, and which written word each came from
  shown.forEach((w, wi) => tokens(w).forEach((tk) => { E.push(tk); owner.push(wi); }));
  const H = String(heard || '').split(/\s+/).flatMap(tokens);
  const n = E.length, m = H.length;
  // best in-order alignment (weighted longest common subsequence with fuzzy word equality)
  const dp = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const sm = Array.from({ length: n + 1 }, () => new Int8Array(m + 1));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const s = same(E[i - 1], H[j - 1], strict);
    const take = s ? dp[i - 1][j - 1] + weight(E[i - 1]) : -1;
    const skip = Math.max(dp[i - 1][j], dp[i][j - 1]);
    dp[i][j] = Math.max(take, skip); sm[i][j] = s;
  }
  const got = new Array(n).fill(0);                                  // 0 missed, 1 near, 2 exact
  for (let i = n, j = m; i > 0 && j > 0;) {
    const s = sm[i][j];
    if (s && dp[i][j] === dp[i - 1][j - 1] + weight(E[i - 1])) { got[i - 1] = s; i--; j--; }
    else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--;
  }
  let total = 0, have = 0;
  E.forEach((tk, i) => { total += weight(tk); if (got[i]) have += weight(tk); });
  const words = shown.map((w, wi) => {
    const idx = []; owner.forEach((o, i) => { if (o === wi) idx.push(i); });
    if (!idx.length) return { w, st: 'skip' };
    const hit = idx.filter((i) => got[i]).length, exact = idx.every((i) => got[i] === 2);
    return { w, st: hit === idx.length ? (exact ? 'ok' : 'near') : hit * 2 >= idx.length ? 'near' : 'miss' };
  });
  const score = total ? have / total : 0;
  const need = PASS_AT[strict - 1];
  return { words, score, need, heard: m, pass: total > 0 && score >= need && m >= Math.ceil(n * 0.5) };
}
