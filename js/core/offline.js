// Works with no internet. The service worker (sw.js) saves the whole lab on this device the first time it is opened online;
// this file lets the page ask how much is saved, ask for the rest, and tells Max (kindly) when the internet goes away.
import { toast } from './dom.js';
import { t, addStrings } from './i18n.js';

addStrings({
  en: {
    offNowReady: 'No internet? No problem! The lab works without it, and your pearls are saved on this device. ✈️',
    offNowPart: 'No internet right now. Most of the lab still works, and your pearls are saved on this device.',
  },
  es: {
    offNowReady: '¿Sin internet? ¡No hay problema! El laboratorio funciona sin internet y tus perlas se guardan en este aparato. ✈️',
    offNowPart: 'Ahora no hay internet. Casi todo el laboratorio funciona y tus perlas se guardan en este aparato.',
  },
});

const sw = () => ('serviceWorker' in navigator ? navigator.serviceWorker : null);
const onSw = (cb) => {
  const c = sw(); if (!c) return () => {};
  const f = (e) => { if (e.data && e.data.type === 'precache') cb(e.data); };
  c.addEventListener('message', f); try { c.startMessages && c.startMessages(); } catch { /* old browsers */ }
  return () => c.removeEventListener('message', f);
};
async function worker() {
  const c = sw(); if (!c) return null;
  try { const reg = await c.getRegistration(); return c.controller || (reg && reg.active) || null; } catch { return null; }
}

// How much is saved? Resolves { state, total, have, done }.  state: 'unsupported' | 'none' (not set up) | 'setup' (still setting up) | 'ok'
export async function offlineStatus(ms = 3500) {
  const c = sw(); if (!c) return { state: 'unsupported' };
  let reg; try { reg = await c.getRegistration(); } catch { return { state: 'unsupported' }; }
  if (!reg) return { state: 'none' };
  const w = c.controller || reg.active; if (!w) return { state: 'setup' };
  return new Promise((res) => {
    let tm; const off = onSw((m) => { clearTimeout(tm); off(); res({ state: 'ok', total: m.total, have: m.have, done: !!m.done }); });
    tm = setTimeout(() => { off(); res({ state: 'setup' }); }, ms);
    w.postMessage({ type: 'status' });
  });
}
// Ask the worker to save anything that is still missing (it answers with progress messages: watch them with watchOffline).
export async function saveAll() { const w = await worker(); if (w) w.postMessage({ type: 'fill' }); return !!w; }
// Call back with every progress message. Returns a function that stops listening.
export const watchOffline = onSw;
export const isStandalone = () => !!(navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches));

// Started once from boot.js after the service worker is registered.
export function startOffline() {
  const c = sw(); if (!c) return;
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist().catch(() => {}); } catch { /* optional */ }   // ask the browser not to clear the saved lab
  const resume = () => { if (navigator.onLine !== false) saveAll(); };   // finish saving anything that was interrupted last time
  c.ready.then(() => setTimeout(resume, 1500)).catch(() => {});
  c.addEventListener('controllerchange', () => setTimeout(resume, 500));
  window.addEventListener('online', () => setTimeout(resume, 800));
  const told = () => offlineStatus().then((s) => toast(t(s.state === 'ok' && s.done ? 'offNowReady' : 'offNowPart'), 6500));
  window.addEventListener('offline', told);
  if (navigator.onLine === false) setTimeout(told, 1500);
}
