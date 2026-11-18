// Heroes in the Passport: every person has a real photo with its credit in their challenge, and the round picture shows the photo once he has met them.
// usage: node people-photos.mjs [en|es] [ipad-land|ipad-old|phone]
import { open, BASE, shot } from './lib.mjs';
import people from '../../data/people.js';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const { page, browser, errors } = await open({ lang, device });
// 1. every photo file is there and is a real picture, and the data has a credit for each
const files = await page.evaluate(async (ids) => Promise.all(ids.map(async (id) => { const r = await fetch('img/people/' + id + '.jpg'); const b = r.ok ? await r.blob() : null; return [id, r.ok, b ? b.size : 0, b ? b.type : '']; })), people.map((p) => p.id));
ok(files.every((f) => f[1] && f[2] > 8000 && /jpeg/.test(f[3])), 'all ' + people.length + ' photo files load (' + files.filter((f) => !f[1]).map((f) => f[0]).join(',') + ')');
ok(people.every((p) => p.photo && p.photo.credit && p.photo.license && /^https:\/\/commons\.wikimedia\.org\//.test(p.photo.source)), 'every person has a credit, a licence and a source link');
// 2. the dialog
await page.goto(BASE + '#/passport/heroes'); await page.waitForSelector('.herogrid .hero');
ok((await page.$$('.herogrid .hero')).length === people.length, people.length + ' heroes in the grid');
ok((await page.$$('.herogrid img.mono.photo')).length === 0, 'no photo in the grid before he has met anyone (monograms)');
await page.locator('.herogrid .hero').nth(0).click(); await page.waitForSelector('.heroD .heropic img');
await page.waitForFunction(() => { const i = document.querySelector('.heroD .heropic img'); return i && i.complete && i.naturalWidth > 100; }, null, { timeout: 5000 });
const cap = await page.textContent('.heroD .heropic figcaption');
ok(/Oren Jack Turner/.test(cap) && /Public domain/.test(cap), 'credit shows under the photo: ' + cap);
ok(/Photo|Foto/.test(cap), 'credit is in ' + lang);
const alt = await page.getAttribute('.heroD .heropic img', 'alt'); ok(/Einstein/.test(alt), 'alt text names him: ' + alt);
const box = await page.locator('.heroD .heropic img').boundingBox(), dlg = await page.locator('.heroD').boundingBox(), vp = page.viewportSize();
ok(box.height <= 305 && box.width <= dlg.width, 'photo fits the dialog (' + Math.round(box.width) + 'x' + Math.round(box.height) + ' in ' + Math.round(dlg.width) + ')');
await shot(page, `hero-photo-${lang}-${device}`);
// 3. answer right: the person is met, and the grid now shows the photo for him only
const q = people[0].quiz[lang === 'es' ? 'es' : 'en'][0], right = q.opts[q.a];
await page.locator('.heroD .ans', { hasText: right }).first().click(); await page.waitForTimeout(400);
await page.locator('.heroD .pclose').click(); await page.waitForTimeout(300);
ok((await page.$$('.herogrid img.mono.photo')).length === 1, 'one round photo in the grid after meeting him');
await page.waitForFunction(() => { const i = document.querySelector('.herogrid img.mono.photo'); return i && i.complete && i.naturalWidth > 50; }, null, { timeout: 5000 });
await shot(page, `hero-grid-${lang}-${device}`);
// 4. a missing photo file falls back quietly (no broken box)
await page.route('**/img/people/frida-kahlo.jpg', (r) => r.abort());
await page.locator('.herogrid .hero', { hasText: /Frida/ }).click(); await page.waitForSelector('.heroD');
await page.waitForTimeout(600);
ok((await page.$$('.heroD .heropic')).length === 0, 'if a photo cannot load the empty frame is removed');
await page.locator('.heroD .pclose').click();
// 5. credits page lists them
await page.goto(BASE + '#/credits'); await page.waitForSelector('.credlist li');
const li = await page.$$eval('.credlist li', (e) => e.length); ok(li >= people.length + 100, 'credits page lists places and people (' + li + ')');
ok(/Guillermo Kahlo/.test(await page.textContent('.credlist')), 'a person’s credit is on the Credits page');
ok(!errors.length || errors.every((e) => /frida|ERR_FAILED|net::/i.test(e)), 'no page errors ' + errors.join('|'));
await browser.close();
console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
