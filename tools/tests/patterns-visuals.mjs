// Draws hundreds of Number Patterns puzzles (every kind, every level) in the real card layout and flags anything that sticks out or overflows.
// usage: node patterns-visuals.mjs [ipad-land|ipad-old|ipad-port|phone] [en|es] [day|night]
import { open, shot, BASE } from './lib.mjs';
const dev = process.argv[2] || 'ipad-land', lang = process.argv[3] || 'en', theme = process.argv[4] || 'day';
const { browser, page, errors } = await open({ device: dev === 'ipad-port' ? 'port' : dev, lang, theme });
const tag = `patvis-${dev}-${lang}-${theme}`;
await page.goto(BASE + '#/patterns'); await page.waitForSelector('.pathero');
const out = await page.evaluate(async ({ lang }) => {
  const gen = await import('/js/quiz/patterns.js');
  const vis = await import('/js/screens/pat-visuals.js');
  const { h } = await import('/js/core/dom.js');
  const host = document.querySelector('#screen');
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const api = { pick() {}, hinted() {} };
  const problems = [], seen = {}, tall = {};
  let n = 0;
  const sticks = (box, label) => {
    const br = box.getBoundingClientRect();
    if (box.scrollWidth > box.clientWidth + 1) return `${label}: scrolls sideways (${box.scrollWidth} > ${box.clientWidth})`;
    for (const el of box.querySelectorAll('*')) {
      if (el.closest('svg') && el.tagName !== 'svg') continue;
      const r = el.getBoundingClientRect();
      if (r.width && (r.right > br.right + 1.5 || r.left < br.left - 1.5)) return `${label}: <${el.tagName.toLowerCase()} class="${el.getAttribute('class') || ''}"> sticks out by ${Math.round(Math.max(r.right - br.right, br.left - r.left))}px`;
    }
    return null;
  };
  for (let level = 1; level <= gen.MAX_LEVEL; level++) {
    const list = [];
    for (let k = 0; k < 36; k++) list.push(gen.makePattern(level, Math.random, lang));
    for (const tw of gen.TWISTS) if (tw.min <= level) for (let k = 0; k < 5; k++) list.push(gen.makePattern(level, Math.random, lang, { twist: tw.id }));
    for (const q of list) {
      const stg = vis.buildStage(q, api);
      const card = h('div', { class: 'qcard patcard' + (q.twist ? ' twist' : '') }, h('div', { class: 'row' }, h('span', { class: 'chip on' }, 'Surprise puzzle! ' + (q.twist || ''))), h('h2', { class: 'qtext pattitle' }, q.title), stg.el);
      const grid = q.type === 'choice' && !q.inline ? h('div', { class: 'answers numgrid' }, q.opts.map((o, k) => h('button', { class: 'ans numopt', 'data-k': k }, h('span', { class: 'lab' }, o)))) : null;
      const hintBox = h('div', { class: 'hintbox col' }, h('div', { class: 'row', style: { flexWrap: 'nowrap' } }, h('span', {}, '💡'), h('span', {}, q.hint)), vis.hintVisual(q));
      const right = h('div', { class: 'qright' }, grid, hintBox);
      host.replaceChildren(h('div', { class: 'qlayout pat' }, card, right));
      stg.start(); await frame();
      const id = `${q.show.kind} L${level}${q.twist ? '*' : ''} [${q.fam}]`;
      let p = sticks(card, id + ' start'); if (p) problems.push(p);
      p = sticks(right, id + ' right-column'); if (p) problems.push(p);
      if (grid) for (const b of grid.children) if (b.scrollWidth > b.clientWidth + 1) { problems.push(`${id}: answer "${b.textContent}" is wider than its button`); break; }
      stg.right(q.val, q.a); await frame();
      p = sticks(card, id + ' solved'); if (p) problems.push(p);
      const ht = card.getBoundingClientRect().height + 0;
      if (!tall[q.show.kind] || ht > tall[q.show.kind].h) tall[q.show.kind] = { h: Math.round(ht), q: JSON.parse(JSON.stringify(q)) };
      stg.cleanup(); n++; seen[q.show.kind] = (seen[q.show.kind] || 0) + 1;
    }
  }
  return { n, seen, problems, tall: Object.fromEntries(Object.entries(tall).map(([k, v]) => [k, v.h])), tallQ: Object.fromEntries(Object.entries(tall).map(([k, v]) => [k, v.q])), vh: innerHeight, vw: innerWidth };
}, { lang });
console.log(tag, `viewport ${out.vw}x${out.vh} | puzzles drawn: ${out.n} | kinds:`, JSON.stringify(out.seen));
console.log('tallest card per kind (px):', JSON.stringify(out.tall));
const uniq = [...new Set(out.problems.map((x) => x.replace(/L\d/, 'L*').replace(/\d+px/, 'Npx')))];
console.log('problems:', out.problems.length, uniq.slice(0, 14));
// keep a picture of the tallest puzzle of every kind
for (const [kind, q] of Object.entries(out.tallQ)) {
  await page.evaluate(async (q) => {
    const vis = await import('/js/screens/pat-visuals.js'); const { h } = await import('/js/core/dom.js');
    const stg = vis.buildStage(q, { pick() {}, hinted() {} });
    const card = h('div', { class: 'qcard patcard' + (q.twist ? ' twist' : '') }, h('h2', { class: 'qtext pattitle' }, q.title), stg.el);
    document.querySelector('#screen').replaceChildren(h('div', { class: 'qlayout pat' }, card, h('div', { class: 'qright' }, q.type === 'choice' && !q.inline ? h('div', { class: 'answers numgrid' }, q.opts.map((o, k) => h('button', { class: 'ans numopt' }, o))) : null)));
    stg.start();
  }, q);
  await page.waitForTimeout(250);
  await shot(page, `${tag}-${kind}`);
}
console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
process.exit(out.problems.length || errors.length ? 1 : 0);
