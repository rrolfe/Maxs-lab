// Layout check for the new screens: Home (with and without the NEW shelf), Read It Loud menu, the LONGEST fact of every topic, the microphone test box
// and the Grown-up section. Looks for sideways overflow, text spilling out of the fact card, a microphone button that cannot be reached, and stray "null".
// usage: node read-visuals.mjs [ipad-land|ipad-old|ipad-port|phone|all] [en|es|all] [day|night|all]
import { open, BASE, shot } from './lib.mjs';
import { FACTS, CATS } from '../../data/facts.js';

const FAKE = () => {
  class FakeSR { constructor() { this.ended = false; window.__sr = this; } start() { setTimeout(() => this.onstart && this.onstart(), 30); } stop() { setTimeout(() => this.endNow(), 20); } abort() { this.endNow(); } endNow() { if (!this.ended) { this.ended = true; this.onend && this.onend(); } } }
  window.webkitSpeechRecognition = FakeSR; window.SpeechRecognition = FakeSR;
};
const args = process.argv.slice(2);
const devs = !args[0] || args[0] === 'all' ? ['ipad-land', 'ipad-old', 'ipad-port', 'phone'] : [args[0]];
const langs = !args[1] || args[1] === 'all' ? ['en', 'es'] : [args[1]];
const themes = !args[2] || args[2] === 'all' ? ['day', 'night'] : [args[2]];
const longest = CATS.map((c) => FACTS.filter((f) => f.cat === c.id).sort((a, b) => b.text.length - a.text.length)[0]);

let problems = 0, notes = 0, checks = 0;
for (const device of devs) for (const lang of langs) for (const theme of themes) {
  const tag = `${device}/${lang}/${theme}`;
  const { browser, page, errors } = await open({ device, lang, theme, init: FAKE });
  const bad = (m) => { problems++; console.log(`  PROBLEM [${tag}] ${m}`); };
  const note = (m) => { notes++; console.log(`  note    [${tag}] ${m}`); };
  const over = async (where) => {
    checks++;
    const r = await page.evaluate(() => {
      const w = window.innerWidth, off = [];
      for (const e of document.querySelectorAll('#screen *')) { const b = e.getBoundingClientRect(); if (b.width && b.right > w + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('.overlay, .fly, .confetti, [aria-hidden="true"]')) off.push(e.className || e.tagName); if (off.length > 3) break; }
      return { sw: document.documentElement.scrollWidth, w, off, nul: /(^|\s)null(\s|$)/.test(document.body.innerText) };
    });
    if (r.sw > r.w + 1) bad(`${where}: page is ${r.sw}px wide in a ${r.w}px window (${r.off.join(', ')})`);
    else if (r.off.length) bad(`${where}: elements past the right edge: ${r.off.join(', ')}`);
    if (r.nul) bad(`${where}: the word "null" is on screen`);
  };
  // Home with the shelf
  await page.waitForSelector('.hub'); await page.waitForTimeout(150);
  await over('home (shelf)');
  if (!(await page.locator('.newshelf .newcard').count() === 2)) bad('home: expected two NEW cards');
  // Home without the shelf (both games finished three times)
  await page.evaluate(() => { const S = window.__lab.S; S.newSeen = { patterns: 3, read: 3 }; });
  await page.goto(BASE + '#/quiz'); await page.goto(BASE + '#/home'); await page.waitForSelector('.hub');
  if (await page.locator('.newshelf').count()) bad('home: shelf should be gone after three plays of each');
  await over('home (no shelf)');
  if (await page.locator('.hub .tile[data-k="read"]').count() !== 1) bad('home: permanent Read It Loud tile missing');
  await page.evaluate(() => { window.__lab.S.newSeen = {}; });
  // menu
  await page.goto(BASE + '#/read'); await page.waitForSelector('.rcats'); await over('read menu');
  // the longest fact of each topic
  for (const f of longest) {
    await page.evaluate((id) => { const S = window.__lab.S; S.read.done = {}; for (const k of window.__ids) if (k !== id && k.startsWith(id.slice(0, 2))) S.read.done[k] = { t: 1, n: 1, tries: 1, how: 'mic' }; }, f.id).catch(async () => {
      await page.evaluate((ids) => { window.__ids = ids; }, FACTS.map((x) => x.id));
      await page.evaluate((id) => { const S = window.__lab.S; S.read.done = {}; for (const k of window.__ids) if (k !== id && k.startsWith(id.slice(0, 2))) S.read.done[k] = { t: 1, n: 1, tries: 1, how: 'mic' }; }, f.id);
    });
    await page.goto(BASE + '#/read'); await page.goto(BASE + '#/read/play/' + f.cat); await page.waitForSelector('.facttext');
    const txt = await page.textContent('.facttext');
    if (txt.trim() !== f.text) { bad(`${f.id}: expected the longest fact, got "${txt.slice(0, 40)}…"`); continue; }
    await over(`fact ${f.id} (${f.text.length} chars)`);
    const g = await page.evaluate(() => {
      const card = document.querySelector('.factcard').getBoundingClientRect(), t = document.querySelector('.facttext'), tb = t.getBoundingClientRect();
      const m = document.querySelector('.micbtn').getBoundingClientRect();
      return { textInside: tb.right <= card.right + 1 && t.scrollWidth <= t.clientWidth + 1, micBottom: m.bottom, micTop: m.top, vh: innerHeight, cardBottom: card.bottom };
    });
    if (!g.textInside) bad(`fact ${f.id}: text spills out of the card`);
    if (g.micBottom > g.vh) note(`fact ${f.id}: the microphone is below the fold (scroll needed): bottom ${Math.round(g.micBottom)} of ${g.vh}`);
  }
  // the microphone test box
  await page.goto(BASE + '#/read'); await page.waitForSelector('.rcats');
  await page.click('button:has-text("Test my microphone"), button:has-text("Probar mi micrófono")'); await page.waitForSelector('.mtbox');
  const d = await page.evaluate(() => { const b = document.querySelector('.mtbox').getBoundingClientRect(); return { top: b.top, bottom: b.bottom, left: b.left, right: b.right, vw: innerWidth, vh: innerHeight, sh: document.querySelector('.mtbox').scrollHeight, ch: document.querySelector('.mtbox').clientHeight }; });
  checks++; if (d.left < 0 || d.right > d.vw + 1) bad(`mic test box is wider than the screen`); if (d.sh > d.ch + 2) note(`mic test box scrolls inside (${d.sh} > ${d.ch})`);
  await page.click('.mtbox button:has-text("Close"), .mtbox button:has-text("Cerrar")');
  // Grown-up corner
  await page.goto(BASE + '#/grownup'); await page.waitForSelector('.gsec');
  const sec = page.locator('details.gsec').filter({ hasText: /Read It Loud|Lee en voz alta/ }).first();
  await sec.locator('summary').click(); await page.waitForTimeout(150); await over('grown-up section');
  await shot(page, `rv-${device}-${lang}-${theme}`);
  if (errors.length) bad('page errors: ' + errors.join(' | '));
  await browser.close();
}
console.log(problems ? `\n${problems} problem(s), ${notes} note(s), ${checks} layout checks` : `\nall good: ${checks} layout checks, ${notes} note(s)`);
process.exit(problems ? 1 : 0);
