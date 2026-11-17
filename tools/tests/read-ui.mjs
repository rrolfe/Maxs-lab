// Read It Loud, end to end in a browser with a PRETEND microphone (no real speech needed).
// Covers: a clean read, a read in two sittings, a wrong read, denied permission -> grown-up listens, Home Screen icon (no mic), no speech support,
// a full sitting of five facts (pearls, bonuses, badges, NEW counter), replay mode, the microphone test box, and that nothing prints the word "null".
// usage: node read-ui.mjs   (LAB_URL=http://127.0.0.1:PORT/ to point at another server)
import { open, BASE } from './lib.mjs';

const FAKE = () => {
  window.__srs = []; window.__srMode = 'ok';
  class FakeSR {
    constructor() { this.onstart = this.onresult = this.onerror = this.onend = null; this.ended = false; window.__srs.push(this); window.__sr = this; }
    start() {
      if (window.__srMode === 'denied') { setTimeout(() => { this.onerror && this.onerror({ error: 'not-allowed' }); this.endNow(); }, 20); return; }
      setTimeout(() => this.onstart && this.onstart(), 30);
    }
    stop() { setTimeout(() => this.endNow(), 20); }
    abort() { setTimeout(() => this.endNow(), 5); }
    endNow() { if (!this.ended) { this.ended = true; this.onend && this.onend(); } }
    say(text, final) { const r = Object.assign([{ transcript: text }], { isFinal: !!final }); this.onresult && this.onresult({ results: [r] }); }
  }
  window.webkitSpeechRecognition = FakeSR; window.SpeechRecognition = FakeSR;
};
const NOSR = () => { delete window.webkitSpeechRecognition; delete window.SpeechRecognition; };

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { fails++; console.log('  FAIL:', m); } };
const S = (page, f) => page.evaluate(f);
const fact = (page) => page.evaluate(() => ({ text: document.querySelector('.facttext').textContent, tier: document.querySelector('.factcard .chip.on')?.textContent.trim() }));
const bal = (page) => page.evaluate(() => window.__lab.S.pearls.balance);
const noNull = async (page, where) => ok(!/(^|\s)null(\s|$)/.test(await page.evaluate(() => document.body.innerText)), 'the word "null" is on screen: ' + where);
const tapMic = async (page) => { await page.click('.micbtn'); await page.waitForSelector('.micbtn.on', { timeout: 5000 }); };
const sr = (page, fn, ...a) => page.evaluate(([f, args]) => window.__sr[f](...args), [fn, a]);
const waitGood = (page) => page.waitForSelector('.feedback.good', { timeout: 6000 });

async function scenario(name, opts, fn) {
  console.log('•', name);
  const { browser, page, errors } = await open({ device: 'ipad-land', init: FAKE, ...opts });
  try { await fn(page); await noNull(page, name); } catch (e) { fails++; console.log('  EXCEPTION:', e.message.split('\n')[0]); }
  if (errors.length) { fails++; console.log('  page errors:', errors); }
  await browser.close();
}

// 1. a clean read, all in one go
await scenario('clean read finishes by itself', {}, async (page) => {
  await page.goto(BASE + '#/read/play/sp'); await page.waitForSelector('.facttext');
  const f = await fact(page), p0 = await bal(page);
  await tapMic(page);
  await sr(page, 'say', f.text, true);                      // he read it all the way to the end
  await waitGood(page);
  const got = (await bal(page)) - p0;
  ok(got === 14 || got === 15 || got === 17, `pearls for the first fact today (4/5/7 + 10 bonus), got ${got}`);
  ok(await page.isVisible('.btn.alt:has-text("Next fact")'), 'Next fact button shows');
  ok(await page.locator('.rw.ok').count() >= f.text.split(' ').length - 1, 'words turn green');
  const rec = await S(page, () => Object.values(window.__lab.S.read.done)[0]);
  ok(rec && rec.how === 'mic' && rec.tries === 1, 'fact stored as read with the microphone on try 1');
});

// 2. read in two sittings (the browser stops after a pause), second half in a new session
await scenario('read in two sittings is stitched together', {}, async (page) => {
  await page.goto(BASE + '#/read/play/bb'); await page.waitForSelector('.facttext');
  const f = await fact(page); const w = f.text.split(' '); const half = Math.ceil(w.length / 2);
  await tapMic(page);
  await sr(page, 'say', w.slice(0, half).join(' '), true);
  await sr(page, 'endNow');                                  // the browser ended the sitting after a pause
  await page.waitForTimeout(500);
  ok(await page.isVisible('.micbtn.on'), 'still listening after the first pause (he has not reached the end)');
  ok(await page.locator('.feedback.good').count() === 0, 'not judged yet');
  await sr(page, 'say', w.slice(half).join(' '), true);
  await sr(page, 'endNow');
  await waitGood(page);
});

// 3. wrong reading twice -> skip and grown-up buttons appear, no pearls, second try can pass
await scenario('wrong reads do not pay; skip and grown-up appear after two tries', {}, async (page) => {
  await page.goto(BASE + '#/read/play/an'); await page.waitForSelector('.facttext');
  const f = await fact(page), p0 = await bal(page);
  for (let k = 0; k < 2; k++) {
    await tapMic(page);
    await sr(page, 'say', 'the quick brown fox jumps over the lazy dog', true);
    await page.click('.micbtn');                              // I'm done
    await page.waitForSelector('.feedback.try', { timeout: 5000 });
    await page.waitForTimeout(200);
  }
  ok((await bal(page)) === p0, 'no pearls for wrong reads');
  ok(await page.isVisible('button:has-text("Skip this one")'), 'skip shows after two tries');
  ok(await page.isVisible('button:has-text("Grown-up listens")'), 'grown-up option shows after two tries');
  ok(await page.locator('.rw.miss').count() > 0, 'missed words are marked');
  await tapMic(page); await sr(page, 'say', f.text, true); await waitGood(page);
  const rec = await S(page, () => Object.values(window.__lab.S.read.done)[0]);
  ok(rec && rec.tries === 3, 'third try recorded');
});

// 4. permission denied -> plain message, grown-up listens takes over, hold-to-confirm pays
await scenario('denied microphone falls back to grown-up listens', {}, async (page) => {
  await page.evaluate(() => { window.__srMode = 'denied'; });
  await page.goto(BASE + '#/read/play/oc'); await page.waitForSelector('.facttext');
  const p0 = await bal(page);
  await page.click('.micbtn');
  await page.waitForSelector('.holdbtn:visible', { timeout: 5000 });
  ok(/Siri|microphone/i.test(await page.textContent('.feedback')), 'plain-words message about the microphone');
  const b = await page.locator('.holdbtn').boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.waitForTimeout(300); await page.mouse.up();
  await page.waitForTimeout(200);
  ok((await bal(page)) === p0, 'a quick tap does not count');
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.waitForTimeout(1500); await page.mouse.up();
  await waitGood(page);
  ok((await bal(page)) > p0, 'holding for a second pays');
  const rec = await S(page, () => Object.values(window.__lab.S.read.done)[0]);
  ok(rec && rec.how === 'grown', 'stored as grown-up listened');
});

// 5. Home Screen icon: iOS has no speech recognition there
await scenario('Home Screen icon: explained, grown-up listens from the start', { standalone: true }, async (page) => {
  await page.goto(BASE + '#/read'); await page.waitForSelector('.rcats');
  ok(/Safari/.test(await page.textContent('.rdstat')), 'menu explains to open it in Safari');
  ok(await page.locator('button:has-text("Test my microphone")').count() === 0, 'no mic test button when it cannot work');
  await page.goto(BASE + '#/read/play/di'); await page.waitForSelector('.facttext');
  ok(await page.isVisible('.holdbtn'), 'grown-up button is there right away');
  ok(!(await page.isVisible('.micbtn')), 'no microphone button');
});

// 6. no speech recognition at all
await scenario('browser without speech recognition', { init: NOSR }, async (page) => {
  await page.goto(BASE + '#/read'); await page.waitForSelector('.rcats');
  ok(/grown-up listens/i.test(await page.textContent('.rdstat')), 'menu says a grown-up listens');
  await page.goto(BASE + '#/read/play/mc'); await page.waitForSelector('.facttext');
  ok(await page.isVisible('.holdbtn'), 'grown-up button is there');
});

// 7. a whole sitting: five facts, summary, bonuses, badge, NEW counter
await scenario('full sitting of five facts', {}, async (page) => {
  await page.goto(BASE + '#/read/play/sp'); await page.waitForSelector('.facttext');
  const p0 = await bal(page); const tiers = [];
  for (let k = 0; k < 5; k++) {
    const f = await fact(page); tiers.push(f.tier);
    await tapMic(page); await sr(page, 'say', f.text, true); await waitGood(page);
    await page.click('.btn.alt:has-text("Next fact")');
    if (k < 4) await page.waitForSelector('.facttext');
  }
  await page.waitForSelector('.summary');
  const got = (await bal(page)) - p0;
  ok(got === 4 + 5 + 5 + 7 + 7 + 10, `28 pearls for five facts plus 10 first-of-day, got ${got}`);
  ok(JSON.stringify(tiers) === JSON.stringify(['Easy', 'Medium', 'Medium', 'Challenge', 'Challenge']), 'tier mix easy, medium, medium, challenge, challenge: ' + tiers);
  ok(await page.locator('.summary .stars svg').count() === 3, 'three stars for five first-try reads');
  const st = await S(page, () => ({ n: Object.keys(window.__lab.S.read.done).length, seen: window.__lab.S.newSeen.read, badge: !!window.__lab.S.passport.badges.rd1, shift: window.__lab.S.read.cfg.shift }));
  ok(st.n === 5 && st.seen === 1 && st.badge, `five facts stored, NEW counter 1, first badge: ${JSON.stringify(st)}`);
  ok(st.shift === 1, 'next sitting leans harder after a perfect one');
  await page.click('button:has-text("Read more")'); await page.waitForSelector('.facttext');
  const f2 = await fact(page); await tapMic(page); await sr(page, 'say', f2.text, true); await waitGood(page);
  const got2 = (await bal(page)) - p0 - got;
  ok(got2 > 0 && got2 < 10, `a second sitting pays tier pay only (no repeat bonus), got ${got2}`);
});

// 8. replay mode: all 20 read -> no new pearls, a note says so
await scenario('replay after every fact in a topic is read', {
  state: { read: { done: Object.fromEntries(Array.from({ length: 20 }, (_, i) => ['sp' + String(i + 1).padStart(2, '0'), { t: 1, n: 1, tries: 1, how: 'mic' }])), tries: 20, passes: 20, lastDay: '', cat: '', cfg: { strict: 1, listen: 'auto', shift: 0 }, log: [] } },
}, async (page) => {
  await page.goto(BASE + '#/read/play/sp'); await page.waitForSelector('.facttext');
  ok(/read them all/i.test(await page.textContent('.screen, #screen')), 'replay note is shown');
  const f = await fact(page), p0 = await bal(page);
  await tapMic(page); await sr(page, 'say', f.text, true); await waitGood(page);
  ok((await bal(page)) === p0, 'no pearls for a re-read');
});

// 9. the microphone test box
await scenario('microphone test box', {}, async (page) => {
  await page.goto(BASE + '#/read'); await page.waitForSelector('.rcats');
  await page.click('button:has-text("Test my microphone")'); await page.waitForSelector('.mtbox');
  const line = await page.textContent('.mtline');
  await tapMic(page); await sr(page, 'say', line, true); await sr(page, 'endNow');
  await page.waitForSelector('.mtbox .feedback.good', { timeout: 5000 });
  await page.click('.mtbox button:has-text("Close")'); await page.waitForTimeout(100);
  ok(await page.locator('.mtbox').count() === 0, 'box closes');
});

// 10. Grown-up corner shows the heard list and settings
await scenario('Grown-up corner section', {}, async (page) => {
  await page.goto(BASE + '#/read/play/sp'); await page.waitForSelector('.facttext');
  const f = await fact(page); await tapMic(page); await sr(page, 'say', 'jupiter big planet', true); await page.click('.micbtn'); await page.waitForSelector('.feedback.try');
  await page.goto(BASE + '#/grownup'); await page.waitForSelector('.gsec');
  const sec = page.locator('details.gsec:has(summary:text("Read It Loud"))');
  await sec.locator('summary').click();
  ok(await sec.locator('.hl').count() >= 1, 'heard list shows the try');
  ok(/jupiter big planet/i.test(await sec.textContent()), 'what the iPad heard is shown');
  await sec.locator('button:has-text("A grown-up")').click();
  ok(await S(page, () => window.__lab.S.read.cfg.listen) === 'grownup', 'who-listens setting saved');
  await sec.locator('button:has-text("Strict")').click();
  ok(await S(page, () => window.__lab.S.read.cfg.strict) === 3, 'strictness setting saved');
});

console.log(fails ? `\n${fails} problem(s) in ${checks} checks` : `\nall good (${checks} checks)`);
process.exit(fails ? 1 : 0);
