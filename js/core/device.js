// What phone, iPad or computer this is, and which browser, in plain words (added Nov 18 2026).
// Why: whether the microphone can work depends on both. Read It Loud uses the browser's own speech recognition, and
//   - Safari on iPhone / iPad can listen, but only in a Safari tab (not from a Home Screen icon, not inside another app)
//   - Chrome, Firefox and Edge on iPhone / iPad cannot (Apple makes them use a Safari engine without speech recognition)
//   - Chrome / Edge / Samsung Internet on Android, and Chrome / Edge / Safari on a computer, can (also as an installed app)
//   - Firefox cannot, anywhere
// So the screens use this to say exactly what to do on THIS device. Plain browser checks only, nothing is sent anywhere.
// Written for old iPads too (no .at(), no ??=).

let cache = null;

export function deviceInfo() {
  if (cache) return cache;
  const nav = typeof navigator === 'undefined' ? {} : navigator;
  const ua = nav.userAgent || '', plat = nav.platform || '', touch = nav.maxTouchPoints || 0;
  const macTouch = /Mac/.test(plat) && touch > 1;                       // iPadOS asks websites for the desktop page and says "Macintosh"
  const ios = /iPhone|iPad|iPod/.test(ua) || macTouch;
  const android = /Android/.test(ua);
  const kind = ios ? (/iPhone|iPod/.test(ua) ? 'iphone' : 'ipad') : android ? (/Mobile/.test(ua) ? 'phone' : 'tablet') : 'computer';
  let standalone = false;
  try { standalone = nav.standalone === true || matchMedia('(display-mode: standalone)').matches; } catch { /* old browser */ }
  // a page opened inside another app (Instagram, Facebook, Gmail, Messenger, TikTok...) is a "web view": no speech recognition there
  const inappTokens = /FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|Snapchat|TikTok|BytedanceWebview|Twitter|LinkedInApp|Pinterest|GSA\/|; wv\)/.test(ua);
  let browser = 'other';
  if (inappTokens || (ios && !standalone && !/Safari\//.test(ua))) browser = 'inapp';
  else if (/EdgiOS|EdgA|Edg\//.test(ua)) browser = 'edge';
  else if (/OPR\/|OPiOS|OPT\//.test(ua)) browser = 'opera';
  else if (/FxiOS|Firefox\//.test(ua)) browser = 'firefox';
  else if (/SamsungBrowser/.test(ua)) browser = 'samsung';
  else if (/DuckDuckGo/.test(ua)) browser = 'duck';
  else if (nav.brave) browser = 'brave';
  else if (/CriOS|Chrome\//.test(ua)) browser = 'chrome';
  else if (/Version\/[\d.]+.*Safari\//.test(ua) || (ios && (standalone || /Safari\//.test(ua)))) browser = 'safari';   // (a Home Screen icon is Safari's engine too)
  cache = { kind, ios, android, computer: kind === 'computer', browser, standalone, ua };
  return cache;
}

const NAMES = {
  en: { iphone: 'iPhone', ipad: 'iPad', phone: 'phone', tablet: 'tablet', computer: 'computer' },
  es: { iphone: 'iPhone', ipad: 'iPad', phone: 'teléfono', tablet: 'tableta', computer: 'computadora' },
};
const THE = {
  en: { iphone: 'the iPhone', ipad: 'the iPad', phone: 'the phone', tablet: 'the tablet', computer: 'the computer' },
  es: { iphone: 'el iPhone', ipad: 'el iPad', phone: 'el teléfono', tablet: 'la tableta', computer: 'la computadora' },
};
const BR = { safari: 'Safari', chrome: 'Chrome', edge: 'Edge', firefox: 'Firefox', samsung: 'Samsung Internet', opera: 'Opera', duck: 'DuckDuckGo', brave: 'Brave' };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** the browser Max should use for the microphone on this device */
export function recommended(lang) {
  const d = deviceInfo();
  return d.ios ? 'Safari' : d.android ? 'Chrome' : lang === 'es' ? 'Chrome, Edge o Safari' : 'Chrome, Edge or Safari';
}

/** words that screens can drop into text: {dev} iPad, {the} the iPad, {The} The iPad, {br} Chrome, {Br}, {rec} Safari, {co} Apple */
export function deviceVars(lang) {
  const d = deviceInfo(), l = lang === 'es' ? 'es' : 'en';
  const br = d.browser === 'inapp' ? (l === 'es' ? 'esta app' : 'this app') : BR[d.browser] || (l === 'es' ? 'este navegador' : 'this browser');
  const co = d.ios || d.browser === 'safari' ? 'Apple' : d.browser === 'edge' ? 'Microsoft' : d.android || d.browser === 'chrome' || d.browser === 'samsung' ? 'Google' : (l === 'es' ? 'el servicio de voz del navegador' : 'the browser’s speech service');
  return { dev: NAMES[l][d.kind], the: THE[l][d.kind], The: cap(THE[l][d.kind]), br, Br: cap(br), rec: recommended(l), co };
}

/**
 * Why this browser cannot listen, or null when it can (or when we should simply try).
 * hasSR = the browser has speech recognition at all.
 *   'homescreen' iPhone / iPad Home Screen icon   'inapp' inside another app   'iosbrowser' Chrome / Firefox / Edge on iPhone or iPad
 *   'firefox'                                      'oldsafari' Safari without it (old iOS / macOS)   'nobrowser' anything else
 */
export function listenWhy(hasSR) {
  const d = deviceInfo();
  if (d.ios && d.standalone) return 'homescreen';      // only Apple blocks installed apps; on Android and computers an installed app can listen
  if (hasSR) return null;
  if (d.browser === 'inapp') return 'inapp';
  if (d.ios && d.browser !== 'safari') return 'iosbrowser';
  if (d.browser === 'firefox') return 'firefox';
  if (d.browser === 'safari') return 'oldsafari';
  return 'nobrowser';
}

/** a test hook: forget what was detected (the UA changes in tests) */
export const resetDevice = () => { cache = null; };
