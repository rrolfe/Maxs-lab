// Offline support. The first online visit saves the WHOLE lab (every screen, game, picture and data file: the list below) so it keeps working with no internet.
// Code and data are fetched fresh when online (so updates show on the next open) and fall back to the saved copy offline;
// pictures and sounds come from the saved copy and refresh in the background. Map tiles and other sites are never cached here.
// The Grown-up corner asks this worker how much is saved ({type:'status'}) and can ask it to save the rest ({type:'fill'}).
const CACHE = 'mll2-v31';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'css/lab.css', 'css/base.css', 'css/quiz.css', 'css/games.css', 'css/stands.css', 'css/world.css', 'css/misc.css', 'css/baseball.css', 'css/chores.css', 'css/play.css', 'css/boise.css',
  'js/boot.js', 'js/core/dom.js', 'js/core/store.js', 'js/core/i18n.js', 'js/core/device.js', 'js/core/icons.js', 'js/core/audio.js', 'js/core/offline.js', 'js/core/economy.js', 'js/core/router.js', 'js/core/badges.js', 'js/screens/home.js', 'icons/fathom.svg', 'icons/apple-touch-icon.png'];
/* ALL-FILES:start (written by tools/make-precache.mjs: 230 files, 11.3 MB) */
const ALL = [
  "css/base.css",
  "css/baseball.css",
  "css/boise.css",
  "css/chores.css",
  "css/games.css",
  "css/lab.css",
  "css/misc.css",
  "css/play.css",
  "css/quiz.css",
  "css/stands.css",
  "css/world.css",
  "data/boise.js",
  "data/facts.js",
  "data/land.js",
  "data/packs.js",
  "data/people.js",
  "data/placeqs.js",
  "data/places.js",
  "data/questions.en.js",
  "data/questions.es.js",
  "icons/apple-touch-icon.png",
  "icons/fathom.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "img/people/abraham-lincoln.jpg",
  "img/people/alexander-fleming.jpg",
  "img/people/alexander-graham-bell.jpg",
  "img/people/amelia-earhart.jpg",
  "img/people/babe-ruth.jpg",
  "img/people/benjamin-franklin.jpg",
  "img/people/cousteau.jpg",
  "img/people/einstein.jpg",
  "img/people/ernest-shackleton.jpg",
  "img/people/frida-kahlo.jpg",
  "img/people/galileo-galilei.jpg",
  "img/people/george-washington.jpg",
  "img/people/isaac-newton.jpg",
  "img/people/jackie-robinson.jpg",
  "img/people/johannes-gutenberg.jpg",
  "img/people/katherine-johnson.jpg",
  "img/people/leonardo-da-vinci.jpg",
  "img/people/lionel-messi.jpg",
  "img/people/ludwig-van-beethoven.jpg",
  "img/people/marco-polo.jpg",
  "img/people/marie-curie.jpg",
  "img/people/neil-armstrong.jpg",
  "img/people/nikola-tesla.jpg",
  "img/people/pele.jpg",
  "img/people/roberto-clemente.jpg",
  "img/people/steve-irwin.jpg",
  "img/people/thomas-edison.jpg",
  "img/people/walt-disney.jpg",
  "img/people/wolfgang-amadeus-mozart.jpg",
  "img/people/wright-brothers.jpg",
  "img/places/ait-benhaddou.jpg",
  "img/places/amboseli.jpg",
  "img/places/amsterdam.jpg",
  "img/places/antarctica.jpg",
  "img/places/atacama.jpg",
  "img/places/athens.jpg",
  "img/places/auckland.jpg",
  "img/places/bangkok.jpg",
  "img/places/barcelona.jpg",
  "img/places/bay-of-fundy.jpg",
  "img/places/beijing.jpg",
  "img/places/blue-hole.jpg",
  "img/places/bogota.jpg",
  "img/places/boise.jpg",
  "img/places/boston.jpg",
  "img/places/boulders.jpg",
  "img/places/buenos-aires.jpg",
  "img/places/cairo.jpg",
  "img/places/cape-town.jpg",
  "img/places/cappadocia.jpg",
  "img/places/cartagena.jpg",
  "img/places/chicago.jpg",
  "img/places/chichen-itza.jpg",
  "img/places/cusco.jpg",
  "img/places/deadvlei.jpg",
  "img/places/djoudj.jpg",
  "img/places/dubai.jpg",
  "img/places/exuma.jpg",
  "img/places/faroe.jpg",
  "img/places/flaming-cliffs.jpg",
  "img/places/florence.jpg",
  "img/places/galapagos.jpg",
  "img/places/giants-causeway.jpg",
  "img/places/giza.jpg",
  "img/places/great-barrier-reef.jpg",
  "img/places/guayaquil.jpg",
  "img/places/havana.jpg",
  "img/places/hawaii.jpg",
  "img/places/hong-kong.jpg",
  "img/places/iceland-lights.jpg",
  "img/places/istanbul.jpg",
  "img/places/jantar-mantar.jpg",
  "img/places/jellyfish-lake.jpg",
  "img/places/jigokudani.jpg",
  "img/places/kinderdijk.jpg",
  "img/places/kirkland.jpg",
  "img/places/komodo.jpg",
  "img/places/kyoto.jpg",
  "img/places/la-paz.jpg",
  "img/places/lalibela.jpg",
  "img/places/las-terrenas.jpg",
  "img/places/lencois.jpg",
  "img/places/lima.jpg",
  "img/places/lisbon.jpg",
  "img/places/london.jpg",
  "img/places/maasai-mara.jpg",
  "img/places/machu-picchu.jpg",
  "img/places/mar-del-plata.jpg",
  "img/places/marrakesh.jpg",
  "img/places/medellin.jpg",
  "img/places/melbourne.jpg",
  "img/places/meteora.jpg",
  "img/places/mexico-city.jpg",
  "img/places/mont-saint-michel.jpg",
  "img/places/monteverde.jpg",
  "img/places/montreal.jpg",
  "img/places/moscow.jpg",
  "img/places/nairobi.jpg",
  "img/places/neuschwanstein.jpg",
  "img/places/new-orleans.jpg",
  "img/places/new-york.jpg",
  "img/places/okavango.jpg",
  "img/places/panama-canal.jpg",
  "img/places/panama-city.jpg",
  "img/places/paris.jpg",
  "img/places/perito-moreno.jpg",
  "img/places/petra.jpg",
  "img/places/phong-nha.jpg",
  "img/places/plitvice.jpg",
  "img/places/pompeii.jpg",
  "img/places/quebec-city.jpg",
  "img/places/quito.jpg",
  "img/places/rio-de-janeiro.jpg",
  "img/places/rome.jpg",
  "img/places/rwanda-volcanoes.jpg",
  "img/places/sagarmatha.jpg",
  "img/places/sagrada-familia.jpg",
  "img/places/san-francisco.jpg",
  "img/places/san-jose-cr.jpg",
  "img/places/san-juan.jpg",
  "img/places/santa-cruz-bolivia.jpg",
  "img/places/santiago.jpg",
  "img/places/sao-paulo.jpg",
  "img/places/seattle.jpg",
  "img/places/seoul.jpg",
  "img/places/serengeti.jpg",
  "img/places/sigatoka.jpg",
  "img/places/singapore.jpg",
  "img/places/strokkur.jpg",
  "img/places/suomenlinna.jpg",
  "img/places/supertrees.jpg",
  "img/places/sydney.jpg",
  "img/places/tigers-nest.jpg",
  "img/places/tikal.jpg",
  "img/places/tokyo.jpg",
  "img/places/toronto.jpg",
  "img/places/tromso.jpg",
  "img/places/tsingy.jpg",
  "img/places/uyuni.jpg",
  "img/places/vancouver.jpg",
  "img/places/venice.jpg",
  "img/places/victoria.jpg",
  "img/places/waitomo.jpg",
  "img/places/washington-dc.jpg",
  "img/places/wulingyuan.jpg",
  "img/places/yellowstone.jpg",
  "index.html",
  "js/baseball/engine.js",
  "js/baseball/field.js",
  "js/boise/scenes.js",
  "js/boot.js",
  "js/core/audio.js",
  "js/core/badges.js",
  "js/core/device.js",
  "js/core/dom.js",
  "js/core/economy.js",
  "js/core/i18n.js",
  "js/core/icons.js",
  "js/core/offline.js",
  "js/core/router.js",
  "js/core/store.js",
  "js/core/version.js",
  "js/games/common.js",
  "js/games/wsgen.js",
  "js/progress/newgames.js",
  "js/progress/stats.js",
  "js/quiz/engine.js",
  "js/quiz/math.js",
  "js/quiz/missions.js",
  "js/quiz/patterns.js",
  "js/read/listen.js",
  "js/read/match.js",
  "js/read/mictest.js",
  "js/screens/baseball.js",
  "js/screens/boise.js",
  "js/screens/checkin.js",
  "js/screens/chores.js",
  "js/screens/credits.js",
  "js/screens/grownup-extra.js",
  "js/screens/grownup-new.js",
  "js/screens/grownup-offline.js",
  "js/screens/grownup-reset.js",
  "js/screens/grownup.js",
  "js/screens/hangman.js",
  "js/screens/home.js",
  "js/screens/passport-lite.js",
  "js/screens/passport.js",
  "js/screens/pat-visuals.js",
  "js/screens/patterns.js",
  "js/screens/quiz.js",
  "js/screens/read.js",
  "js/screens/stands.js",
  "js/screens/wordsearch.js",
  "js/screens/world.js",
  "js/stands/cream-data.js",
  "js/stands/cream-shop.js",
  "js/stands/cream-text.js",
  "js/stands/hints.js",
  "js/stands/lemon-shop.js",
  "js/stands/perks.js",
  "js/stands/pizza.js",
  "js/stands/runner.js",
  "js/stands/sims.js",
  "js/stands/upgrade-text.js",
  "js/world/tilemap.js",
  "manifest.webmanifest"
];
/* ALL-FILES:end */

const isMedia = (u) => /^(img|audio|icons)\//.test(u);
// A wifi sign-in page can answer with HTML instead of the file: never save that as code or data.
const sane = (res, path) => !!res && res.ok && !(/\.(js|css|json|webmanifest|jpg|png|svg)$/.test(path) && /text\/html/i.test(res.headers.get('content-type') || ''));
let slowUntil = 0;   // after a slow or dead network, use the saved copy straight away for a minute and a half
const abs = (u) => new URL(u, self.registration.scope).href;
const allOldCaches = () => caches.keys().then((ks) => ks.filter((k) => k.startsWith('mll2-') && k !== CACHE));

// Save one file. Pictures and sounds are copied from the previous version's saved copy when there is one (no new download); code is always fetched fresh.
async function put(cache, u) {
  const url = abs(u);
  try {
    if (await cache.match(url)) return true;
    if (isMedia(u)) { const old = await caches.match(url); if (old) { await cache.put(url, old.clone()); return true; } }
    const res = await fetch(new Request(url, { cache: 'reload' }));
    if (!sane(res, new URL(url).pathname)) return false;
    await cache.put(url, res); return true;
  } catch { return false; }
}
async function status() {
  const cache = await caches.open(CACHE); const have = new Set((await cache.keys()).map((r) => r.url));
  const missing = ALL.filter((u) => !have.has(abs(u)));
  return { type: 'precache', total: ALL.length, have: ALL.length - missing.length, done: missing.length === 0, cache: CACHE };
}
const tell = async (to) => { const s = await status(); const cs = to ? [to] : await self.clients.matchAll({ includeUncontrolled: true }); cs.forEach((c) => c.postMessage(s)); return s; };
let filling = null;
// Save every file that is not saved yet, six at a time. When everything is saved, the old versions' copies are thrown away.
function fillAll(kinds) {
  if (filling) return filling;
  filling = (async () => {
    const cache = await caches.open(CACHE); const have = new Set((await cache.keys()).map((r) => r.url));
    const todo = ALL.filter((u) => (kinds === 'all' || !isMedia(u)) && !have.has(abs(u)));
    let i = 0, n = 0;
    await Promise.all(Array.from({ length: 6 }, async () => { while (i < todo.length) { await put(cache, todo[i++]); if (++n % 12 === 0) tell(); } }));
    const s = await tell();
    if (s.done) await Promise.all((await allOldCaches()).map((k) => caches.delete(k)));
    return s;
  })().finally(() => { filling = null; });
  return filling;
}

self.addEventListener('install', (e) => {
  // the first screens, then all the code and data (a few MB); the pictures follow right after in the background
  e.waitUntil(caches.open(CACHE).then(async (c) => { await Promise.allSettled(CORE.map((u) => c.add(u))); await fillAll('code'); }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim().then(() => fillAll('all')));
});
self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type === 'status') e.waitUntil(tell(e.source));
  else if (d.type === 'fill') e.waitUntil(fillAll('all').then(() => tell()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const code = req.mode === 'navigate' || /\.(js|css|html|json|webmanifest)$/.test(url.pathname) || url.pathname.endsWith('/');
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    // this version's copy, or (while a new version is still saving itself) the previous version's copy
    const hit = (await cache.match(req)) || (await caches.match(req));
    const refresh = () => fetch(req, { cache: 'no-cache' }).then((res) => { if (sane(res, url.pathname)) { cache.put(req, res.clone()); return res; } return null; });
    if (code) {
      if (hit && (navigator.onLine === false || Date.now() < slowUntil)) { refresh().catch(() => {}); return hit; }   // offline or a very slow network: no waiting
      // Code and data: ask the network first, so an update shows on the very next open (the saved copy only if offline or slow).
      try {
        const res = await Promise.race([refresh(), new Promise((_, no) => setTimeout(no, hit ? 3000 : 20000))]);
        if (res) return res;
        return hit || fetch(req);
      } catch { if (hit) { slowUntil = Date.now() + 90000; return hit; } return fetch(req); }
    }
    // Pictures and sounds: the saved copy right away, refreshed in the background.
    if (hit) { if (navigator.onLine !== false && Date.now() >= slowUntil) fetch(req).then((res) => { if (sane(res, url.pathname)) cache.put(req, res.clone()); }).catch(() => {}); return hit; }
    return fetch(req).then((res) => { if (sane(res, url.pathname)) cache.put(req, res.clone()); return res; });
  }));
});
