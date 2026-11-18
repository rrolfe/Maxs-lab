// Learning about Boise: the Home card at the top of the NEW shelf, the places screen, a place opened, the quiz paying once, saves, badges and the phone layout.
// usage: node boise-ui.mjs [en|es]
import { open, BASE } from './lib.mjs';
const lang = process.argv[2] || 'en';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const bal = (page) => page.evaluate(() => window.__lab.S.pearls.balance);
const lift = (page) => page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; });

for (const device of ['ipad-land', 'phone']) {
  const { page, browser, errors } = await open({ device, lang });
  await lift(page);
  await page.waitForSelector('.hub');
  const cards = await page.$$eval('.newshelf .newcard', (e) => e.map((x) => x.dataset.k));
  ok(cards[0] === 'boise' && cards.length === 3, `${device}: Boise is the first card on the NEW shelf: ` + cards.join(','));
  ok(await page.locator('.newcard[data-k="boise"] svg.bscene').count() === 1, `${device}: the Home card has the animated picture`);
  ok(await page.locator('.tile.wide[data-k="boise"] svg.bscene').count() === 1 && (await page.$$('.tile')).length === 11, `${device}: a wide Boise tile and 10 other tiles`);
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${device}: Home does not scroll sideways`);
  await page.click('.newcard[data-k="boise"]');
  await page.waitForSelector('.bz-card');
  const n = await page.locator('.bz-card').count();
  ok(n >= 24, `${device}: ${n} places listed`);
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${device}: the places screen does not scroll sideways`);
  // topic tabs
  const tabs = await page.$$eval('.boise .tab', (e) => e.map((x) => x.textContent));
  ok(tabs.length === 4, `${device}: four tabs: ` + tabs.join(' | '));
  await page.locator('.boise .tab').nth(2).click(); const nh = await page.locator('.bz-card').count();
  ok(nh > 0 && nh < n, `${device}: the history tab filters (${nh} of ${n})`);
  await page.locator('.boise .tab').first().click();
  // open a place, answer wrong then right
  const before = await bal(page);
  await page.locator('.bz-card').first().click(); await page.waitForSelector('.bzD');
  ok(await page.locator('.bzD .bz-facts li').count() === 3, `${device}: three facts`);
  ok(await page.locator('.bzD .bz-try').count() === 1, `${device}: a try-it idea`);
  ok(await page.locator('.bzD svg.bscene').count() === 1, `${device}: a picture`);
  ok(await page.evaluate(() => { const d = document.querySelector('.bzD').getBoundingClientRect(); return d.left >= 0 && d.right <= innerWidth + 1; }), `${device}: the dialog fits the screen`);
  const right = await page.evaluate(async () => { const m = await import('./data/boise.js'); const S = window.__lab.S; const p = m.default[0]; const q = (p[S.lang] || p.en).quiz; return q.opts[q.a]; });
  const wrong = page.locator('.bzD .ans', { hasNotText: right }).first();
  await wrong.click(); await page.waitForTimeout(200);
  ok((await bal(page)) === before, `${device}: a wrong answer costs nothing`);
  ok(await page.locator('.bzD .ans.try').count() === 1, `${device}: the wrong answer is marked`);
  await page.locator('.bzD .ans', { hasText: right }).first().click(); await page.waitForTimeout(500);
  const got = (await bal(page)) - before;
  ok(got === 8 + 3 + 5, `${device}: one wrong try, then right = 8 + 3 (half of 6) + 5 (first place today) = 16 (got ${got})`);
  const st = await page.evaluate(() => window.__lab.S.boise);
  ok(Object.keys(st.done).length === 1 && st.done[Object.keys(st.done)[0]].w === 1, `${device}: saved as explored with 1 wrong try`);
  ok(await page.evaluate(() => window.__lab.S.passport.badges.bz1 > 0), `${device}: the Boise Visitor badge is earned`);
  ok(await page.evaluate(() => window.__lab.S.newSeen.boise === 1), `${device}: the NEW counter moved by one`);
  // asking again pays nothing
  await page.click('.bzD .btn.ghost:has-text("' + (lang === 'es' ? 'Todos' : 'All') + '")'); await page.waitForSelector('.bz-card .bz-done');
  const b2 = await bal(page);
  await page.locator('.bz-card').first().click(); await page.waitForSelector('.bzD');
  await page.locator('.bzD .ans', { hasText: right }).first().click(); await page.waitForTimeout(300);
  ok((await bal(page)) === b2, `${device}: answering an explored place again pays nothing`);
  await page.click('.bzD .pclose');
  // the next place is another place and only the first place of the day gets the daily bonus
  await page.locator('.bz-card').nth(1).click(); await page.waitForSelector('.bzD');
  const r2 = await page.evaluate(async () => { const m = await import('./data/boise.js'); const S = window.__lab.S; const p = m.default[1]; const q = (p[S.lang] || p.en).quiz; return q.opts[q.a]; });
  const b3 = await bal(page);
  await page.locator('.bzD .ans', { hasText: r2 }).first().click(); await page.waitForTimeout(400);
  ok((await bal(page)) - b3 === 8 + 6, `${device}: second place, first try = 8 + 6 = 14 (got ${(await bal(page)) - b3})`);
  await page.click('.bzD .btn.gold'); await page.waitForSelector('.bzD h2');       // "Next place"
  ok(await page.locator('.bzD .ans').count() === 3, `${device}: Next place opens another place`);
  await page.click('.bzD .pclose');
  // deep link
  await page.goto(BASE + '#/boise/zooboise'); await page.waitForSelector('.bzD');
  ok(/Zoo/.test(await page.textContent('.bzD h2')), `${device}: #/boise/zooboise opens the zoo`);
  ok(errors.length === 0, `${device}: no page errors ` + errors.join('|'));
  await browser.close();
}

// every place: three facts, a try-it, a quiz with three answers and one right, and a picture that is not blank
{
  const { page, browser } = await open({ device: 'ipad-land', lang });
  const r = await page.evaluate(async () => {
    const m = await import('./data/boise.js'); const sc = await import('./js/boise/scenes.js'); const bad = []; const ids = new Set();
    for (const p of m.default) {
      if (ids.has(p.id)) bad.push('duplicate id ' + p.id); ids.add(p.id);
      if (!m.CATS.some((c) => c.id === p.cat)) bad.push(p.id + ': unknown topic');
      for (const l of ['en', 'es']) {
        const d = p[l]; if (!d) { bad.push(p.id + ': no ' + l); continue; }
        if (!d.name || !d.hook || !d.ask) bad.push(`${p.id}/${l}: missing name, hook or try-it`);
        if (!Array.isArray(d.facts) || d.facts.length !== 3 || d.facts.some((f) => !f || f.length > 260)) bad.push(`${p.id}/${l}: needs 3 facts of normal length`);
        const q = d.quiz; if (!q || !q.q || q.opts.length !== 3 || !(q.a >= 0 && q.a < 3) || new Set(q.opts).size !== 3 || !q.why) bad.push(`${p.id}/${l}: quiz is not 3 different answers with one right`);
      }
      if (!sc.hasScene(p.scene || p.id)) bad.push(p.id + ': using the plain picture for its topic');
    }
    return { n: m.default.length, bad, byCat: m.CATS.map((c) => c.id + ':' + m.default.filter((p) => p.cat === c.id).length) };
  });
  ok(r.bad.length === 0, 'content check on ' + r.n + ' places (' + r.byCat.join(', ') + '): ' + r.bad.join(' | '));
  await browser.close();
}
console.log(fails ? `\n${fails} FAILED` : '\nall good');
process.exit(fails ? 1 : 0);
