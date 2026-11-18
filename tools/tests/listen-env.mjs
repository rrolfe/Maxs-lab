// Read It Loud's microphone help on every kind of device: iPhone / iPad Safari, iPhone Chrome, the Home Screen icon, pages inside other apps,
// Android, desktop Chrome / Firefox / Safari. The test PRETENDS to be each one (browser name, platform, with or without speech recognition)
// and checks what the lab says and shows: ready, or exact plain-words help, the "Copy the link" button, the denied / network messages,
// the stuck "getting ready" recovery, English and Spanish, and that no {placeholder} or the word "null" ever shows.
// usage: node listen-env.mjs   (LAB_URL=http://127.0.0.1:PORT/ to point at another server)
import { open, BASE } from './lib.mjs';

const UA = {
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.153 Mobile/15E148 Safari/604.1',
  iphoneIcon: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148',
  iphoneInstagram: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.0.0',
  ipadMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  ipadOld: 'Mozilla/5.0 (iPad; CPU OS 12_5_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1',
  androidChrome: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  androidFirefox: 'Mozilla/5.0 (Android 14; Mobile; rv:127.0) Gecko/127.0 Firefox/127.0',
  androidWebView: 'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.0.0 Mobile Safari/537.36',
  winChrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  winEdge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
  winFirefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  macSafari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
};

// The pretend browser, installed before the lab's own code runs. cfg: { ua, platform, touch, standalone, sr, mode }
const envInit = (cfg) => ({
  content: `(${((c) => {
    const def = (k, v) => Object.defineProperty(navigator, k, { get: () => v, configurable: true });
    def('userAgent', c.ua); def('platform', c.platform || 'Win32'); def('maxTouchPoints', c.touch || 0);
    if (c.standalone) {
      def('standalone', true);
      const mm = window.matchMedia.bind(window);
      window.matchMedia = (q) => (/display-mode:\s*standalone/.test(q) ? { matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} } : mm(q));
    }
    window.__clip = [];
    try { Object.defineProperty(navigator, 'clipboard', { value: { writeText: (x) => { window.__clip.push(x); return Promise.resolve(); } }, configurable: true }); } catch { /* ignore */ }
    delete window.webkitSpeechRecognition; delete window.SpeechRecognition;
    if (c.sr) {
      window.__srMode = c.mode || 'ok';
      class FakeSR {
        constructor() { this.onstart = this.onresult = this.onerror = this.onend = null; this.ended = false; window.__sr = this; }
        start() {
          if (window.__srMode === 'hang') return;                                   // the permission question is open: nothing happens yet
          if (window.__srMode === 'denied') { setTimeout(() => { this.onerror && this.onerror({ error: 'not-allowed' }); this.endNow(); }, 20); return; }
          if (window.__srMode === 'network') { setTimeout(() => { this.onerror && this.onerror({ error: 'network' }); this.endNow(); }, 20); return; }
          setTimeout(() => this.onstart && this.onstart(), 30);
        }
        stop() { setTimeout(() => this.endNow(), 20); }
        abort() { setTimeout(() => this.endNow(), 5); }
        endNow() { if (!this.ended) { this.ended = true; this.onend && this.onend(); } }
        say(text, final) { const r = Object.assign([{ transcript: text }], { isFinal: !!final }); this.onresult && this.onresult({ results: [r] }); }
      }
      window.webkitSpeechRecognition = FakeSR; window.SpeechRecognition = FakeSR;
    }
  }).toString()})(${JSON.stringify(cfg)})`,
});

let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { fails++; console.log('  FAIL:', m); } };
const text = (page, sel) => page.evaluate((s) => (document.querySelector(s) || {}).textContent || '', sel);
const body = (page) => page.evaluate(() => document.body.innerText);
const clean = async (page, where) => {
  const b = await body(page);
  ok(!/\{[A-Za-z]+\}/.test(b), 'a {placeholder} is on screen: ' + where + ' → ' + (b.match(/.{0,30}\{[A-Za-z]+\}.{0,30}/) || [''])[0]);
  ok(!/(^|\s)null(\s|$)|undefined/.test(b), 'null/undefined on screen: ' + where);
};

async function scenario(name, cfg, opts, fn) {
  if (typeof opts === 'function') { fn = opts; opts = {}; }
  console.log('•', name);
  const { browser, page, errors } = await open({ device: 'phone', init: envInit(cfg), ...opts });
  try { await fn(page); } catch (e) { fails++; console.log('  EXCEPTION:', e.message.split('\n')[0]); }
  if (errors.length) { fails++; console.log('  page errors:', errors); }
  await browser.close();
}
const menu = async (page) => { await page.goto(BASE + '#/read'); await page.waitForSelector('.rcats'); };
const hasTest = (page) => page.locator('.rdhero button:has-text("Test my microphone"), .rdhero button:has-text("Probar mi micrófono")').count();
const hasCopy = (page) => page.locator('.rdhero button:has-text("Copy the link"), .rdhero button:has-text("Copiar el enlace")').count();
const readySays = (page) => page.evaluate(() => document.querySelector('.rdstat.good') !== null);
const grownSection = async (page) => {
  await page.goto(BASE + '#/grownup'); await page.waitForSelector('.gsec');
  const sec = page.locator('details.gsec:has(summary:text("Read It Loud")), details.gsec:has(summary:text("Lee en voz alta"))');
  await sec.locator('summary').first().click();
  return sec;
};
const playFact = async (page) => { await page.goto(BASE + '#/read/play/oc'); await page.waitForSelector('.facttext'); };

// ---------------------------------------------------------------- can listen
await scenario('iPhone Safari: ready, with the test button', { ua: UA.iphoneSafari, platform: 'iPhone', touch: 5, sr: true }, async (page) => {
  await menu(page);
  ok(await readySays(page), 'menu says ready');
  ok((await hasTest(page)) === 1, 'test button is there');
  ok((await hasCopy(page)) === 0, 'no copy-link button when it works');
  ok(/the iPhone/i.test(await text(page, '.rdhero')), 'says the iPhone, not the iPad');
  ok(!/iPad/.test(await text(page, '.rdhero')), 'the word iPad is not on an iPhone');
  await page.click('.rdhero button:has-text("Test my microphone")'); await page.waitForSelector('.mtbox');
  ok(/Detected: iPhone · Safari/.test(await text(page, '.mtbox')), 'test box names the device and browser: ' + (await text(page, '.mtbox')).slice(-80));
  ok(/Apple/.test(await text(page, '.mtbox')), 'privacy tip names Apple');
  await clean(page, 'iPhone Safari');
});
await scenario('iPad Safari (asks for the computer page): shows iPad, ready', { ua: UA.ipadMac, platform: 'MacIntel', touch: 5, sr: true }, async (page) => {
  await menu(page);
  ok(await readySays(page), 'ready');
  ok(/the iPad/i.test(await text(page, '.rdhero')), 'recognised as an iPad: ' + (await text(page, '.rdstat')));
  await page.click('.rdhero button:has-text("Test my microphone")'); await page.waitForSelector('.mtbox');
  ok(/Detected: iPad · Safari/.test(await text(page, '.mtbox')), 'detected iPad · Safari');
});
await scenario('Android Chrome: ready', { ua: UA.androidChrome, platform: 'Linux armv8l', touch: 5, sr: true }, async (page) => {
  await menu(page);
  ok(await readySays(page), 'ready');
  ok(/the phone/i.test(await text(page, '.rdhero')), 'says the phone');
  await page.click('.rdhero button:has-text("Test my microphone")'); await page.waitForSelector('.mtbox');
  ok(/Detected: phone · Chrome/.test(await text(page, '.mtbox')), 'detected phone · Chrome');
  ok(/Google/.test(await text(page, '.mtbox')), 'privacy tip names Google');
});
await scenario('Android Chrome installed as an app: STILL ready (it used to be blocked)', { ua: UA.androidChrome, platform: 'Linux armv8l', touch: 5, sr: true, standalone: true }, async (page) => {
  await menu(page);
  ok(await readySays(page), 'installed Android app can listen: ' + (await text(page, '.rdstat')));
  await playFact(page);
  ok(await page.isVisible('.micbtn'), 'microphone button is shown');
});
await scenario('Desktop Chrome: ready, "the computer"', { ua: UA.winChrome, platform: 'Win32', touch: 0, sr: true }, async (page) => {
  await menu(page);
  ok(await readySays(page), 'ready');
  ok(/the computer/i.test(await text(page, '.rdhero')), 'says the computer');
  await page.click('.rdhero button:has-text("Test my microphone")'); await page.waitForSelector('.mtbox');
  ok(/Detected: computer · Chrome/.test(await text(page, '.mtbox')), 'detected computer · Chrome');
});
await scenario('Desktop Edge: ready, Microsoft', { ua: UA.winEdge, platform: 'Win32', touch: 0, sr: true }, async (page) => {
  await menu(page);
  ok(await readySays(page), 'ready');
  await page.click('.rdhero button:has-text("Test my microphone")'); await page.waitForSelector('.mtbox');
  ok(/Detected: computer · Edge/.test(await text(page, '.mtbox')) && /Microsoft/.test(await text(page, '.mtbox')), 'Edge and Microsoft');
});
await scenario('Mac Safari: ready', { ua: UA.macSafari, platform: 'MacIntel', touch: 0, sr: true }, async (page) => {
  await menu(page);
  ok(await readySays(page), 'ready');
  await page.click('.rdhero button:has-text("Test my microphone")'); await page.waitForSelector('.mtbox');
  ok(/Detected: computer · Safari/.test(await text(page, '.mtbox')), 'detected computer · Safari');
});

// ---------------------------------------------------------------- cannot listen: exact help
await scenario('iPhone Chrome: says open it in Safari, copy link works', { ua: UA.iphoneChrome, platform: 'iPhone', touch: 5, sr: false }, async (page) => {
  await menu(page);
  const s = await text(page, '.rdstat');
  ok(!(await readySays(page)), 'not marked ready');
  ok(/Chrome on the iPhone cannot listen/.test(s) && /Safari/.test(s), 'explains Chrome on iPhone and points to Safari: ' + s);
  ok(/grown-up can listen/i.test(s), 'a grown-up can listen meanwhile');
  ok((await hasTest(page)) === 0, 'no test button');
  ok((await hasCopy(page)) === 1, 'copy-link button');
  await page.click('.rdhero button:has-text("Copy the link")');
  await page.waitForTimeout(200);
  const clip = await page.evaluate(() => window.__clip);
  ok(clip.length === 1 && clip[0] === BASE, 'copied the plain link (no #/read part): ' + JSON.stringify(clip));
  ok(/Link copied/.test(await body(page)) && /Safari/.test(await text(page, '.toast, #toast, [role="status"]')), 'a "Link copied" toast appears');
  await playFact(page);
  ok(await page.isVisible('.holdbtn') && !(await page.isVisible('.micbtn')), 'grown-up button instead of the microphone');
  await clean(page, 'iPhone Chrome');
});
await scenario('iPhone Home Screen icon: Safari, not the icon', { ua: UA.iphoneIcon, platform: 'iPhone', touch: 5, sr: true, standalone: true }, async (page) => {
  await menu(page);
  const s = await text(page, '.rdstat');
  ok(!(await readySays(page)) && /Home Screen icon/.test(s) && /Safari/.test(s), 'explains the Home Screen icon: ' + s);
  ok((await hasCopy(page)) === 1 && (await hasTest(page)) === 0, 'copy-link, no test button');
  await playFact(page);
  ok(await page.isVisible('.holdbtn'), 'grown-up button');
});
await scenario('page inside Instagram: open it in the browser', { ua: UA.iphoneInstagram, platform: 'iPhone', touch: 5, sr: false }, async (page) => {
  await menu(page);
  const s = await text(page, '.rdstat');
  ok(/inside another app/.test(s) && /Safari/.test(s), 'explains in-app pages: ' + s);
  ok((await hasCopy(page)) === 1, 'copy-link');
});
await scenario('Android in-app web view', { ua: UA.androidWebView, platform: 'Linux armv8l', touch: 5, sr: false }, async (page) => {
  await menu(page);
  const s = await text(page, '.rdstat');
  ok(/inside another app/.test(s) && /Chrome/.test(s), 'points to Chrome: ' + s);
});
await scenario('Android Firefox: use Chrome', { ua: UA.androidFirefox, platform: 'Linux armv8l', touch: 5, sr: false }, async (page) => {
  await menu(page);
  const s = await text(page, '.rdstat');
  ok(/Firefox cannot listen/.test(s) && /Chrome/.test(s), 'Firefox → Chrome: ' + s);
});
await scenario('Desktop Firefox: use Chrome, Edge or Safari', { ua: UA.winFirefox, platform: 'Win32', touch: 0, sr: false }, async (page) => {
  await menu(page);
  const s = await text(page, '.rdstat');
  ok(/Firefox cannot listen/.test(s) && /Chrome, Edge or Safari/.test(s), 'Firefox → Chrome, Edge or Safari: ' + s);
  ok((await hasCopy(page)) === 1 && (await hasTest(page)) === 0, 'copy-link, no test button');
});
await scenario('old iPad Safari without speech recognition', { ua: UA.ipadOld, platform: 'iPad', touch: 5, sr: false }, async (page) => {
  await menu(page);
  const s = await text(page, '.rdstat');
  ok(/too old/.test(s) && /the iPad/.test(s), 'says Safari is too old and to update the iPad: ' + s);
});

// ---------------------------------------------------------------- errors while listening
await scenario('denied on iPhone Safari: Siri, Dictation and the website setting', { ua: UA.iphoneSafari, platform: 'iPhone', touch: 5, sr: true, mode: 'denied' }, async (page) => {
  await playFact(page); await page.click('.micbtn');
  await page.waitForSelector('.holdbtn:visible', { timeout: 5000 });
  const f = await text(page, '.feedback');
  ok(/Siri/.test(f) && /Dictation/.test(f) && /Safari/.test(f), 'iOS steps: ' + f);
  ok(!/lock icon/.test(f), 'no desktop wording on an iPhone');
});
await scenario('denied on Android Chrome: the lock icon', { ua: UA.androidChrome, platform: 'Linux armv8l', touch: 5, sr: true, mode: 'denied' }, async (page) => {
  await playFact(page); await page.click('.micbtn');
  await page.waitForSelector('.holdbtn:visible', { timeout: 5000 });
  const f = await text(page, '.feedback');
  ok(/lock icon/.test(f) && !/Siri/.test(f), 'lock-icon steps, no Siri: ' + f);
});
await scenario('network error on desktop: mentions the right browsers', { ua: UA.winChrome, platform: 'Win32', touch: 0, sr: true, mode: 'network' }, async (page) => {
  await playFact(page); await page.click('.micbtn');
  await page.waitForSelector('.holdbtn:visible', { timeout: 5000 });
  const f = await text(page, '.feedback');
  ok(/internet/.test(f) && /Chrome, Edge or Safari/.test(f), 'network help: ' + f);
});
await scenario('mic test shows the browser\'s own error word', { ua: UA.winChrome, platform: 'Win32', touch: 0, sr: true, mode: 'denied' }, async (page) => {
  await menu(page);
  await page.click('.rdhero button:has-text("Test my microphone")'); await page.waitForSelector('.mtbox');
  await page.click('.mtbox .micbtn');
  await page.waitForSelector('.mtbox .feedback.try', { timeout: 5000 });
  const m = await text(page, '.mtbox');
  ok(/Technical note: not-allowed/.test(m) && /lock icon/.test(m), 'technical note + steps: ' + m.slice(0, 200));
  await page.click('.mtbox button:has-text("Close")');
  const sec = await grownSection(page);
  ok(/not-allowed/.test(await sec.textContent()), 'Grown-up corner remembers it');
});

// ---------------------------------------------------------------- never stuck on "getting ready"
await scenario('waiting for the permission question: cancel and hint', { ua: UA.iphoneSafari, platform: 'iPhone', touch: 5, sr: true, mode: 'hang' }, async (page) => {
  await playFact(page);
  await page.click('.micbtn');
  await page.waitForSelector('.micbtn.wait');
  await page.click('.micbtn');                                                    // a second tap cancels
  await page.waitForTimeout(150);
  ok((await page.locator('.micbtn.wait').count()) === 0 && (await page.locator('.micbtn.on').count()) === 0, 'back to ready after a second tap');
  ok(/Tap the microphone, then read/.test(await text(page, '.miclabel')), 'label is back to the start');
  await page.click('.micbtn'); await page.waitForSelector('.micbtn.wait');
  await page.waitForTimeout(7600);
  ok(/Still waiting for the microphone/.test(await text(page, '.feedback')) && /Allow/.test(await text(page, '.feedback')), 'hint appears after about 7 seconds: ' + (await text(page, '.feedback')));
  await page.evaluate(() => window.__sr.onstart());                               // he taps Allow: it starts listening
  await page.waitForSelector('.micbtn.on', { timeout: 3000 });
  ok(!/Still waiting/.test(await text(page, '.feedback')), 'hint goes away once it listens');
});

// ---------------------------------------------------------------- Grown-up corner
await scenario('Grown-up corner on iPhone Chrome: device, steps, copy link', { ua: UA.iphoneChrome, platform: 'iPhone', touch: 5, sr: false }, async (page) => {
  const sec = await grownSection(page);
  const s = await sec.textContent();
  ok(/Detected: iPhone · Chrome/.test(s), 'device line');
  ok(/Chrome on the iPhone cannot listen/.test(s), 'why');
  ok(await sec.locator('button:has-text("Copy the link")').count() === 1, 'copy-link button');
  await sec.locator('summary:has-text("If the microphone does not work")').click();
  ok(/Open the link in Safari/.test(await sec.locator('.mthelp').textContent()) && /Dictation/.test(await sec.locator('.mthelp').textContent()), 'iOS help steps');
  await clean(page, 'grown-up iPhone Chrome');
});
await scenario('Grown-up corner on Android and desktop show their own steps', { ua: UA.androidChrome, platform: 'Linux armv8l', touch: 5, sr: true }, async (page) => {
  const sec = await grownSection(page);
  await sec.locator('summary:has-text("If the microphone does not work")').click();
  const hlp = await sec.locator('.mthelp').textContent();
  ok(/Samsung Internet/.test(hlp) && /Permissions → Microphone/.test(hlp) && !/Siri/.test(hlp), 'Android steps: ' + hlp.slice(0, 120));
});
await scenario('Grown-up corner on desktop', { ua: UA.winChrome, platform: 'Win32', touch: 0, sr: true }, async (page) => {
  const sec = await grownSection(page);
  await sec.locator('summary:has-text("If the microphone does not work")').click();
  const hlp = await sec.locator('.mthelp').textContent();
  ok(/Chrome, Edge or Safari/.test(hlp) && /sound settings/.test(hlp), 'desktop steps: ' + hlp.slice(0, 120));
  ok(/What the computer heard/.test(await sec.textContent()), '"What the computer heard"');
});

// ---------------------------------------------------------------- Spanish
await scenario('Spanish on iPhone Chrome', { ua: UA.iphoneChrome, platform: 'iPhone', touch: 5, sr: false }, { lang: 'es' }, async (page) => {
  await menu(page);
  const s = await text(page, '.rdstat');
  ok(/Chrome en el iPhone no puede escuchar/.test(s) && /Safari/.test(s) && /puede escuchar un adulto/.test(s), 'Spanish help: ' + s);
  ok((await hasCopy(page)) === 1, 'Copiar el enlace');
  await clean(page, 'es iPhone Chrome menu');
  const sec = await grownSection(page);
  await sec.locator('summary:has-text("Si el micrófono no funciona")').click();
  ok(/Abre el enlace en Safari/.test(await sec.locator('.mthelp').textContent()), 'Spanish steps');
  await clean(page, 'es grown-up');
});
await scenario('Spanish on a computer', { ua: UA.winChrome, platform: 'Win32', touch: 0, sr: true }, { lang: 'es' }, async (page) => {
  await menu(page);
  ok(/la computadora/.test(await text(page, '.rdhero')), 'la computadora');
  await page.click('.rdhero button:has-text("Probar mi micrófono")'); await page.waitForSelector('.mtbox');
  ok(/Detectado: computadora · Chrome/.test(await text(page, '.mtbox')), 'Detectado: computadora · Chrome');
  await clean(page, 'es desktop');
});

console.log(fails ? `\n${fails} problem(s) in ${checks} checks` : `\nall good (${checks} checks)`);
process.exit(fails ? 1 : 0);
