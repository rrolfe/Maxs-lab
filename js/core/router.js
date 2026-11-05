// Hash router. Each screen module exports mount(el, params) and returns an optional cleanup function.
const routes = new Map();
let cleanup = null, current = '';
let host = null;
let beforeEach = null;

export function route(path, loader) { routes.set(path, loader); }
export function setBeforeEach(fn) { beforeEach = fn; }
export function currentPath() { return current; }
export function go(path) {
  if (location.hash === '#' + path) render(); else location.hash = path;
}

function parse() {
  const raw = (location.hash || '#/home').slice(1);
  const [path, q] = raw.split('?');
  const params = Object.fromEntries(new URLSearchParams(q || ''));
  const parts = path.split('/').filter(Boolean);
  return { path: '/' + parts.join('/'), parts, params };
}

export async function render() {
  const { path, parts, params } = parse();
  const key = '/' + (parts[0] || 'home');
  const loader = routes.get(key) || routes.get('/home');
  if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
  current = path;
  host.replaceChildren();
  host.scrollTop = 0;
  if (beforeEach) beforeEach(key, params);
  try {
    const mod = await loader();
    if (current !== path) return; // user navigated again while loading
    host.dataset.screen = key.slice(1);
    cleanup = (await mod.mount(host, { parts: parts.slice(1), params })) || null;
  } catch (e) {
    console.error(e);
    host.textContent = 'Something went wrong. Tap Home to try again.';
  }
}

export function startRouter(el) {
  host = el;
  addEventListener('hashchange', render);
  render();
}
