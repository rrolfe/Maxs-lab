import { open, shot } from './lib.mjs';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land', theme = process.argv[4] || 'day';
const { page, browser, errors } = await open({ lang, device, theme });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; st.S.settings.pinHash = null; });
ok(!!(await page.$('.ciBanner')), 'home shows the weekly check-in banner');
{ // the banner words must be real words (they once showed the raw label "ciBanner") and must say what he earns
  const txt = await page.locator('.ciBanner').innerText();
  ok(!/ciBanner/i.test(txt), 'the banner shows words, not the label (' + txt.replace(/\s+/g, ' ').slice(0, 90) + ')');
  ok(/50/.test(txt), 'the banner says he earns 50 pearls');
}
const pearls0 = await page.evaluate(async () => { const st = await import('./js/core/store.js'); const d = st.day(); d.pearls = 650; return st.S.pearls.balance; });   // already past the daily limit: the bonus must still be paid in full
// time per program: pretend some minutes
await page.evaluate(async () => { const st = await import('./js/core/store.js'); const d = st.day(); d.sec = 1500; d.prog = { quiz: 600, words: 420, baseball: 300, stands: 180 }; });
// run the check-in
await page.locator('.ciBanner').click(); await w(500);
ok(/50/.test(await page.locator('.checkin .big').first().innerText()), 'the intro says he earns 50 pearls');
await shot(page, `checkin-intro-${lang}-${device}-${theme}`);
await page.locator('.btn.gold.go').click(); await w(400);
await shot(page, `checkin-q-${lang}-${device}-${theme}`);
let n = 0;
for (let i = 0; i < 30; i++) {
  const a = page.locator('.ciopts .ans:not([disabled])');
  if (!(await a.count())) break;
  await a.nth(i % (await a.count())).click(); await w(560); n++;
}
ok(n === 24, 'answered 24 questions (' + n + ')');
ok(!!(await page.$('.summary')), 'results screen shows');
{
  const after = await page.evaluate(() => window.__lab.S.pearls.balance);
  ok(after - pearls0 === 50, `the check-in pays 50 pearls even past the daily taper (${pearls0} -> ${after})`);
  ok(/50/.test(await page.locator('.summary').innerText()), 'the results say +50');
}
await shot(page, `checkin-done-${lang}-${device}-${theme}`);
const rec = await page.evaluate(() => { const c = window.__lab.S.checkins.list; return { n: c.length, tot: c[0]?.n, topics: Object.keys(c[0]?.byTopic || {}).length, per: Object.values(c[0]?.byTopic || {}).map((v) => v.n).join(',') }; });
ok(rec.n === 1 && rec.tot === 24 && rec.topics === 6 && rec.per === '4,4,4,4,4,4', 'check-in saved: ' + JSON.stringify(rec));
await page.evaluate(() => { location.hash = '#/home'; }); await w(300);
ok(!(await page.$('.ciBanner')), 'banner gone after the check-in is done');
// parent corner
await page.evaluate(() => { location.hash = '#/grownup'; }); await w(600);
await page.locator('details.gsec > summary').nth(4).click().catch(() => {});
const txt = await page.evaluate(() => document.body.innerText);
ok(/Where the time goes|En qué se va el tiempo/.test(txt), 'time-per-program section present');
ok(/What to work on|En qué trabajar/.test(txt), 'suggestions section present');
await page.locator('details.gsec > summary', { hasText: /Weekly check-in|Chequeo semanal/ }).click(); await w(200);
ok(/not scored against a national sample|no se comparan con una muestra nacional/i.test(await page.evaluate(() => document.body.innerText)), 'honest percentile note present');
await page.locator('input[maxlength="40"]').fill('MAP Growth'); await page.locator('input[type="number"][max="99"]').fill('99');
await page.locator('.btn.small', { hasText: /Add result|Agregar resultado/ }).click(); await w(300);
ok(/99/.test(await page.evaluate(() => document.body.innerText)) && (await page.evaluate(() => window.__lab.S.checkins.school.length)) === 1, 'school percentile result saved');
await page.evaluate(() => window.scrollTo(0, 0));
await shot(page, `parent-${lang}-${device}-${theme}`);
const full = await page.evaluate(() => { document.querySelectorAll('details.gsec').forEach((d, i) => { if (i < 5) d.open = true; }); return document.body.scrollHeight; });
await page.screenshot({ path: `/tmp/claude-0/-home-claude/2f17bed4-bec3-54e2-a1c6-817904baf255/scratchpad/parent-full-${lang}-${device}-${theme}.png`, fullPage: true });
ok(errors.length === 0, 'console clean ' + errors.join('/'));
await browser.close(); console.log(fails ? 'FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
