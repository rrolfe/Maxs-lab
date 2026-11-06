// Offline support: app files are cached on first load and refreshed in the background (stale-while-revalidate).
// Map tiles and other sites are never cached here.
const CACHE = 'mll2-v8';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'css/lab.css', 'css/base.css', 'css/quiz.css', 'css/games.css', 'css/stands.css', 'css/world.css', 'css/misc.css', 'css/baseball.css',
  'js/boot.js', 'js/core/dom.js', 'js/core/store.js', 'js/core/i18n.js', 'js/core/icons.js', 'js/core/audio.js', 'js/core/economy.js', 'js/core/router.js', 'js/core/badges.js', 'js/screens/home.js', 'icons/fathom.svg', 'icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(CORE.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('mll2-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const hit = await cache.match(req, { ignoreSearch: false });
    const net = fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
