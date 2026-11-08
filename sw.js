// Offline support: code and data are fetched fresh when online (so updates show on the next open) and fall back to the saved copy offline;
// pictures and sounds come from the saved copy and refresh in the background.
// Map tiles and other sites are never cached here.
const CACHE = 'mll2-v20';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'css/lab.css', 'css/base.css', 'css/quiz.css', 'css/games.css', 'css/stands.css', 'css/world.css', 'css/misc.css', 'css/baseball.css', 'css/chores.css',
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
  const code = req.mode === 'navigate' || /\.(js|css|html|json|webmanifest)$/.test(url.pathname) || url.pathname.endsWith('/');
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const hit = await cache.match(req, { ignoreSearch: false });
    if (code) {
      // Code and data: ask the network first, so an update shows on the very next open (a stale copy only if offline or very slow).
      try {
        const res = await Promise.race([fetch(req, { cache: 'no-cache' }), new Promise((_, no) => setTimeout(no, hit ? 4000 : 20000))]);
        if (res && res.ok) { cache.put(req, res.clone()); return res; }
        return hit || res;
      } catch { return hit || fetch(req); }
    }
    // Pictures and sounds: the saved copy right away, refreshed in the background.
    const net = fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
