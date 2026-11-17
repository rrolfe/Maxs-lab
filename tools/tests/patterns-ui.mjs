// Number Patterns in a real browser: menu, a whole run (right, wrong, hint, reveal), the end screen, and every puzzle picture.
import { open, shot, pearls, BASE } from './lib.mjs';
const dev = process.argv[2] || 'ipad-land', lang = process.argv[3] || 'en', theme = process.argv[4] || 'day';
const { browser, page, errors } = await open({ device: dev, lang, theme });
const tag = `pat-${dev}-${lang}-${theme}`;
const log = (...a) => console.log(...a);
let bad = 0; const check = (ok, msg) => { if (!ok) { bad++; log('FAIL', msg); } };

await page.goto(BASE + '#/patterns'); await page.waitForSelector('.pathero');
await shot(page, tag + '-menu');
const startP = await pearls(page);
await page.click('.pathero .btn'); await page.waitForSelector('.qlayout.pat');

const kinds = []; let prevId = null;
for (let n = 0; n < 10; n++) {
  await page.waitForFunction((p) => window.__lab.q && window.__lab.q.id !== p, prevId);   // the next puzzle is up (not the old one still on screen)
  const q = await page.evaluate(() => { const q = window.__lab.q; return { id: q.id, kind: q.show.kind, type: q.type, inline: !!q.inline, a: q.a, twist: q.twist, title: q.title, opts: q.opts }; });
  prevId = q.id; kinds.push(q.kind + (q.twist ? '*' : ''));
  await page.waitForTimeout(480);   // the screen ignores taps for the first 0.4 s
  if (n < 5 || q.twist) await shot(page, `${tag}-q${n + 1}-${q.kind}`);
  // question 1: wrong first, then a hint, then right. question 2: wrong twice (reveal). Others: right.
  const pickRight = async () => {
    if (q.type === 'number') { for (const ch of String(q.a)) await page.click(`.key:text-is("${ch}")`); }
    else if (q.inline) await page.click(`.qcard [data-k="${q.a}"]`);
    else await page.click(`.numopt[data-k="${q.a}"]`);
  };
  let wrongTaken = 0;
  const pickWrong = async () => {
    if (q.type === 'number') { const w = String(q.a + 1 + wrongTaken++); for (const ch of w) await page.click(`.key:text-is("${ch}")`); }
    else { const ks = q.opts.map((_, i) => i).filter((i) => i !== q.a); const k = ks[wrongTaken++]; await page.click(q.inline ? `.qcard [data-k="${k}"]:not([disabled])` : `.numopt[data-k="${k}"]:not([disabled])`); }
  };
  if (n === 0) {
    await pickWrong(); await page.click('.qfoot .btn:not([hidden])'.replace('.btn', 'button') + ':has-text("' + (lang === 'es' ? 'Comprobar' : 'Check') + '")');
    await page.waitForSelector('.feedback.try');
    await shot(page, tag + '-wrong');
    await page.click('.qfoot button:has-text("' + (lang === 'es' ? 'Pista' : 'Hint') + '")', { force: true });
    await page.waitForSelector('.hintbox:not([hidden])');
    await shot(page, tag + '-hint');
    if (q.type === 'number') { await page.evaluate(() => 0); }
  }
  if (n === 1) {
    for (let k = 0; k < 2; k++) { await pickWrong(); await page.click('.qfoot button:has-text("' + (lang === 'es' ? 'Comprobar' : 'Check') + '")'); await page.waitForTimeout(150); }
    await page.waitForSelector('.feedback.try .why');
    await shot(page, tag + '-reveal');
    await page.waitForTimeout(1700);
    await page.click('.qfoot button:has-text("' + (lang === 'es' ? 'Siguiente' : 'Next') + '")');
    continue;
  }
  try {
    await pickRight();
    await page.click('.qfoot button:has-text("' + (lang === 'es' ? 'Comprobar' : 'Check') + '")', { timeout: 4000 });
  } catch (e) { await shot(page, tag + '-FAIL'); log('FAILED on', n + 1, JSON.stringify(q), '\n', String(e.message).split('\n')[0]); bad++; await browser.close(); process.exit(1); }
  await page.waitForSelector('.feedback.good');
  if (n < 5 || q.twist) await shot(page, `${tag}-q${n + 1}-${q.kind}-done`);
  const nextVisible = await page.$('.qfoot button:has-text("' + (lang === 'es' ? 'Siguiente' : 'Next') + '"):not([hidden])');
  if (nextVisible && await nextVisible.isVisible()) await nextVisible.click(); else await page.waitForTimeout(1700);
}
await page.waitForSelector('.summary', { timeout: 6000 });
await shot(page, tag + '-summary');
const st = await page.evaluate(() => ({ runs: window.__lab.S.patterns.runs, seen: window.__lab.S.newSeen.patterns, cards: Object.keys(window.__lab.S.patterns.cards).length, q: window.__lab.S.patterns.q, skill: window.__lab.S.patterns.skill }));
check(st.runs === 1, 'run counted'); check(st.seen === 1, 'newSeen counted'); check(st.cards === 1, 'one card won'); check(st.q === 10, '10 puzzles recorded: ' + st.q);
check((await pearls(page)) > startP, 'pearls went up');
log(tag, 'kinds:', kinds.join(' '), '| skill', st.skill.toFixed(2), '| pearls', startP, '->', await pearls(page));
log('errors:', errors.length ? errors : 'none', '| failures:', bad);
await browser.close();
process.exit(bad || errors.length ? 1 : 0);
