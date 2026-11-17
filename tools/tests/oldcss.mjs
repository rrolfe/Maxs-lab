// Older iPads (Safari before 16.2) do not know colour-mix(). This pretends to be one: the new games' stylesheet is served with colour-mix( renamed to a
// function nobody knows, which is what such a browser sees. Then it checks that the important highlights are still drawn (word highlights, shelf, tiles,
// puzzle answers) in day and night, using the plain-colour fallbacks at the end of css/play.css.
// A control run without those fallbacks must FAIL some checks, otherwise this test would not prove anything.
// usage: node oldcss.mjs   (LAB_URL=http://127.0.0.1:PORT/ to point at another server)
import { open, BASE, shot } from './lib.mjs';

// [name, html to build inside #screen, selector to measure, property, what must be true]
const CASES = [
  ['twist card', '<div class="patcard twist"></div>', '.patcard.twist', 'backgroundColor', 'paint'],
  ['blank tile', '<div class="nt blank"></div>', '.nt.blank', 'backgroundColor', 'paint'],
  ['right tile', '<div class="nt right"></div>', '.nt.right', 'backgroundColor', 'paint'],
  ['shown tile', '<div class="nt shown"></div>', '.nt.shown', 'backgroundColor', 'paint'],
  ['tried tile', '<div class="nt try"></div>', '.nt.try', 'backgroundColor', 'paint'],
  ['equation box', '<div class="eqb"></div>', '.eqb', 'backgroundColor', 'paint'],
  ['equation right', '<div class="eqb right"></div>', '.eqb.right', 'backgroundColor', 'paint'],
  ['equation shown', '<div class="eqb shown"></div>', '.eqb.shown', 'backgroundColor', 'paint'],
  ['tried pad', '<div class="pad try"></div>', '.pad.try', 'backgroundColor', 'paint'],
  ['pack', '<div class="pack"></div>', '.pack', 'backgroundColor', 'paint'],
  ['hundred chart colored', '<div class="h100"><i class="col">1</i></div>', '.h100 i.col', 'backgroundColor', 'paint'],
  ['hundred chart border', '<div class="h100"><i>1</i></div>', '.h100 i', 'borderTopStyle', 'solid'],
  ['finger-count border', '<div class="fc"></div>', '.fc', 'borderTopStyle', 'solid'],
  ['status good', '<p class="rdstat good"></p>', '.rdstat.good', 'backgroundColor', 'paint'],
  ['status warn', '<p class="rdstat warn"></p>', '.rdstat.warn', 'backgroundColor', 'paint'],
  ['word heard', '<span class="rw got">a</span>', '.rw.got', 'backgroundColor', 'paint'],
  ['word right', '<span class="rw ok">a</span>', '.rw.ok', 'backgroundColor', 'paint'],
  ['word missed', '<span class="rw miss">a</span>', '.rw.miss', 'backgroundColor', 'paint'],
  ['hold fill', '<button class="holdbtn"><i class="fill"></i></button>', '.holdbtn .fill', 'backgroundColor', 'paint'],
  ['NEW shelf', '<section class="newshelf"></section>', '.newshelf', 'backgroundImage', 'gradient'],
  ['topic tile', '<a class="rcat" style="--tc:#CFE8FF"></a>', '.rcat', 'backgroundColor', 'paint'],
];

async function run(control, theme) {
  const { browser, page, errors, ctx } = await open({ theme });
  await ctx.route('**/css/play.css*', async (route) => {
    const res = await route.fetch(); let css = await res.text();
    if (control) css = css.split('/* ===== Older iPads')[0];                 // the same sheet without the fallbacks
    await route.fulfill({ response: res, body: css.replaceAll('color-mix(', 'colormixx(') });
  });
  await page.reload(); await page.waitForSelector('.hud');
  const res = [];
  for (const [name, html, sel, prop, want] of CASES) {
    const v = await page.evaluate(([html, sel, prop]) => {
      const box = document.createElement('div'); box.innerHTML = html; document.body.append(box);
      const v = getComputedStyle(box.querySelector(sel))[prop]; box.remove(); return v;
    }, [html, sel, prop]);
    const good = want === 'paint' ? /^rgba?\(/.test(v) && !/^rgba\(\d+, \d+, \d+, 0\)$/.test(v) && v !== 'transparent'
      : want === 'gradient' ? /gradient/.test(v) : v === want;
    res.push({ name, v, good });
  }
  // the NEW shelf text must stay readable: its heading is dark ink, so the shelf must not be see-through on a dark page
  const shelf = await page.evaluate(() => { const s = document.createElement('section'); s.className = 'newshelf'; document.body.append(s); const c = getComputedStyle(s).backgroundImage; s.remove(); return c; });
  await shot(page, `oldcss-${control ? 'control' : 'fallback'}-${theme}`);
  await browser.close();
  return { res, errors, shelf };
}

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { fails++; console.log('  FAIL:', m); } };
for (const theme of ['day', 'night']) {
  const a = await run(false, theme);
  for (const r of a.res) ok(r.good, `${theme}: ${r.name} is not drawn without colour-mix (got ${r.v})`);
  ok(a.errors.length === 0, `${theme}: page errors ${a.errors.join(' | ')}`);
  const c = await run(true, theme);
  const bad = c.res.filter((r) => !r.good).length;
  ok(bad >= 10, `${theme}: control run (no fallbacks) should lose most highlights, lost ${bad}; this test would not catch a missing fallback`);
}
console.log(fails ? `oldcss: ${fails} of ${checks} checks FAILED` : `oldcss: all ${checks} checks passed`);
process.exit(fails ? 1 : 0);
