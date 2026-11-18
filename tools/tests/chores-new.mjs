// The holiday and Aunt Kimber's jobs, and Belen's birthday art: due Friday 20 Nov 2026, 25 pearls, one time only, gone after Friday.
// The clock is faked so the test gives the same answer on any day. usage: node chores-new.mjs [en|es]
import { open } from './lib.mjs';
const lang = process.argv[2] || 'en';
const fakeDate = (iso) => ({ content: `(()=>{const R=Date,off=new R('${iso}').getTime()-R.now();class D extends R{constructor(...a){a.length?super(...a):super(R.now()+off)}static now(){return R.now()+off}}window.Date=D;})()` });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const press = async (page, code) => { for (const d of code) await page.locator(`.pinpad .key[aria-label="${d}"]`).click(); await page.locator('.pinpad .key.go').click(); await page.waitForTimeout(500); };
const bal = (page) => page.evaluate(() => window.__lab.S.pearls.balance);
const cards = (page) => page.$$eval('.chcard', (e) => e.map((x) => ({ name: x.querySelector('.chname').childNodes[0].textContent, due: !!x.querySelector('.chdue'), pts: x.querySelector('.chpts').textContent, disabled: x.disabled })));
const goChores = async (page) => { await page.goto(page.url().split('#')[0] + '#/chores'); await page.waitForSelector('.chcard'); };
const N = lang === 'es'
  ? { belen: /cumpleaños de Belen/, thanks: /Acción de Gracias/, xmas: /Navidad/, kset: /poner la mesa en casa de la tía Kimber/, kclr: /recoger la mesa en casa de la tía Kimber/, grat: /agradecido/, place: /lugares de la mesa/, tf: /de cada persona que viene a Acción de Gracias/, ask: /tía Kimber o al tío JP/, due: /viernes/, done: /Hecho/ }
  : { belen: /Belen’s birthday/, thanks: /decorate for Thanksgiving/, xmas: /decorate for Christmas/, kset: /set the table at Aunt Kimber’s/, kclr: /clear the table at Aunt Kimber’s/, grat: /thankful/, place: /place settings/, tf: /about each person coming for Thanksgiving/, ask: /Aunt Kimber or Uncle JP/, due: /Friday/, done: /Done/ };

// Wednesday 18 Nov: everything is there, Belen's art first with its deadline
{
  const { page, browser, errors } = await open({ lang, init: fakeDate('2026-11-18T12:00:00') });
  await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.pearls = { balance: 0, earned: 0, spent: 0 }; st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; st.save?.(); });
  await goChores(page);
  const c = await cards(page);
  ok(c.length === 41, '41 jobs on Wednesday 18 Nov: ' + c.length);
  ok(N.belen.test(c[0].name) && c[0].due && /25/.test(c[0].pts) && N.due.test(await page.textContent('.chcard .chdue')), 'Belen’s art is first, says it is due Friday, and pays 25: ' + JSON.stringify(c[0]));
  for (const [k, re, pts] of [['thanks', N.thanks, 25], ['xmas', N.xmas, 30], ['kset', N.kset, 15], ['kclr', N.kclr, 15], ['grat', N.grat, 5], ['place', N.place, 20]]) {
    const m = c.find((x) => re.test(x.name)); ok(!!m && m.pts.replace(/\D/g, '') === String(pts), `${k} is there and pays ${pts}: ` + JSON.stringify(m));
  }
  ok(c.filter((x) => x.due).length === 1, 'only the birthday art has a deadline');
  // do Belen's art: 25 pearls, then it is done for good
  await page.locator('.chcard').first().click(); await page.waitForTimeout(300);
  ok(/Friday|viernes/.test(await page.textContent('.chhow')), 'the how-to says to finish by Friday');
  await page.locator('.chdetail .btn.go').click(); await page.waitForTimeout(300); await press(page, '1234');
  ok((await bal(page)) === 25, 'balance is 25 pearls (got ' + (await bal(page)) + ')');
  await page.locator('.summary .btn.gold').click(); await page.waitForTimeout(300);
  const c2 = await cards(page);
  const b2 = c2.find((x) => N.belen.test(x.name));
  ok(b2 && b2.disabled && N.done.test(b2.pts) && !b2.due, 'after doing it, it shows Done and cannot be repeated: ' + JSON.stringify(b2));
  // a normal job that is limited by the day behaves as before
  await page.locator('.chcard:not(.done)').first().click(); await page.waitForTimeout(300);
  ok(!errors.length, 'no page errors ' + errors.join('|'));
  await browser.close();
}
// Thursday 19 Nov: still done (once means once), even on a new day
{
  const { page, browser } = await open({ lang, init: fakeDate('2026-11-19T12:00:00'), state: null });
  await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.chores.done['2026-11-18'] = { belenart: 1 }; });
  await goChores(page);
  const b = (await cards(page)).find((x) => N.belen.test(x.name));
  ok(b && b.disabled, 'Thursday: it was done on Wednesday, so it stays done');
  await browser.close();
}
// Friday 20 Nov: not done yet, still there. Saturday 21 Nov: gone.
{
  const { page, browser } = await open({ lang, init: fakeDate('2026-11-20T21:30:00') });
  await goChores(page);
  const c = await cards(page); ok(c.length === 41 && N.belen.test(c[0].name) && !c[0].disabled, 'Friday evening: still there and not done: ' + c.length);
  await browser.close();
}
{
  const { page, browser } = await open({ lang, init: fakeDate('2026-11-21T08:00:00') });
  await goChores(page);
  const c = await cards(page); ok(c.length === 40 && !c.some((x) => N.belen.test(x.name)), 'Saturday: the deadline job is gone: ' + c.length);
  await browser.close();
}

// Thanksgiving week (Mon 23 - Sun 29 Nov): "name something you are thankful for about each person coming" shows every day, 15 pearls, and is gone before and after.
{
  const { page, browser } = await open({ lang, init: fakeDate('2026-11-21T10:00:00') });
  await goChores(page);
  const c = await cards(page);
  ok(!c.some((x) => N.tf.test(x.name)), 'Saturday 21 Nov: the Thanksgiving-week job is not there yet');
  const a = c.find((x) => N.ask.test(x.name)); ok(!!a && a.pts.replace(/\D/g, '') === '10' && !a.due, 'ask Aunt Kimber or Uncle JP is there and pays 10: ' + JSON.stringify(a));
  await browser.close();
}
for (const [day, want] of [['2026-11-23', true], ['2026-11-26', true], ['2026-11-29', true], ['2026-11-30', false]]) {
  const { page, browser } = await open({ lang, init: fakeDate(day + 'T12:00:00') });
  await goChores(page);
  const c = await cards(page), m = c.find((x) => N.tf.test(x.name));
  ok(want ? !!m && m.pts.replace(/\D/g, '') === '15' && !m.due && !m.disabled : !m, `${day}: the Thanksgiving-week job is ${want ? 'there, pays 15, and has no deadline badge' : 'gone'}: ` + JSON.stringify(m));
  await browser.close();
}
{
  // do it on Monday for 15 pearls; it is a daily job so it is locked for the day and comes back on Tuesday
  const { page, browser, errors } = await open({ lang, init: fakeDate('2026-11-23T12:00:00') });
  await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.pearls = { balance: 0, earned: 0, spent: 0 }; st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; st.save?.(); });
  await goChores(page);
  await page.locator('.chcard', { hasText: N.tf }).click(); await page.waitForTimeout(300);
  ok(/Thanksgiving|Acción de Gracias/.test(await page.textContent('.chhow')), 'the how-to explains the job');
  await page.locator('.chdetail .btn.go').click(); await page.waitForTimeout(300); await press(page, '1234');
  ok((await bal(page)) === 15, 'balance is 15 pearls (got ' + (await bal(page)) + ')');
  await page.locator('.summary .btn.gold').click(); await page.waitForTimeout(300);
  const m = (await cards(page)).find((x) => N.tf.test(x.name)); ok(m && m.disabled, 'locked for the rest of Monday: ' + JSON.stringify(m));
  ok(!errors.length, 'no page errors ' + errors.join('|'));
  await browser.close();
}
{
  const { page, browser } = await open({ lang, init: fakeDate('2026-11-24T09:00:00'), state: null });
  await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.chores.done['2026-11-23'] = { thanksfor: 1 }; });
  await goChores(page);
  const m = (await cards(page)).find((x) => N.tf.test(x.name)); ok(m && !m.disabled, 'Tuesday: it is available again');
  await browser.close();
}
{
  // ask-for-a-job: up to 3 times a week
  const { page, browser } = await open({ lang, init: fakeDate('2026-11-26T09:00:00'), state: null });
  await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.chores.done['2026-11-23'] = { askhelp: 1 }; st.S.chores.done['2026-11-24'] = { askhelp: 1 }; });
  await goChores(page);
  let a = (await cards(page)).find((x) => N.ask.test(x.name)); ok(a && !a.disabled, 'Thursday: only 2 times so far this week, still available');
  await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.chores.done['2026-11-25'] = { askhelp: 1 }; });
  await goChores(page); await page.reload(); await page.waitForSelector('.chcard');
  a = (await cards(page)).find((x) => N.ask.test(x.name)); ok(a && a.disabled, 'after 3 times in the week it waits for next week: ' + JSON.stringify(a));
  await browser.close();
}
console.log(fails ? `\n${fails} FAILED` : '\nall good');
process.exit(fails ? 1 : 0);
