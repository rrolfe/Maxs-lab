// Microphone listening for Read It Loud (beta). One small wrapper around the browser's speech recognition, so the screen
// never has to care about the browser's quirks. Everything here is written for Safari on an iPad first:
//   - iOS only offers it in a Safari tab (not from a Home Screen icon, not inside another app, not in Chrome or Firefox) and only with Siri turned on, and Safari sends the audio to Apple to be turned into text
//   - it stops by itself after a short pause, so a long fact is listened to in several short sittings that are stitched together
//   - a phone or iPad cannot talk and listen at the same moment (the screen stops its own voice first)
//   - nothing is recorded or kept here: only the words that come back as text, and only while a fact is on screen
import { listenWhy } from '../core/device.js';

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

/**
 * 'ready' | 'standalone' (iPhone / iPad Home Screen icon, where iOS blocks it) | 'none' (this browser has no speech recognition)
 * Only Apple blocks installed apps: on Android and on a computer an installed app can listen. listenProblem() says exactly why not (js/core/device.js).
 */
export function listenSupport() {
  const why = listenWhy(!!SR);
  return why === null ? 'ready' : why === 'homescreen' ? 'standalone' : 'none';
}
export const listenProblem = () => listenWhy(!!SR);

/**
 * const l = createListener({ onText(text, final), onState(state), onError(code), maxMs })
 *   state: 'idle' | 'starting' | 'listening'
 *   error codes: 'denied' (permission or Siri off) | 'nomic' | 'network' | 'lang' | 'unstable' | 'silent' (nothing heard for a while)
 *   onError(code, raw) also gets the browser's own word for it (e.g. 'service-not-allowed'); the microphone test shows it to a grown-up
 *   l.start(); l.stop() = finish and report what was heard; l.abort() = throw it away; l.text() = everything heard so far
 *   onPause(textSoFar) runs each time the browser ends a sitting after he spoke; return true when that is already enough to stop
 */
export function createListener({ lang = 'en-US', onText = null, onState = null, onError = null, onDone = null, onPause = null, maxMs = 45000, silentMs = 12000 } = {}) {
  let rec = null, want = false, done = true, base = '', live = '', state = 'idle', quick = 0, sessionStart = 0, heardAny = false, clock = false, threw = 0;
  let maxTimer = 0, silentTimer = 0, retryTimer = 0;
  const set = (s) => { if (state !== s) { state = s; onState?.(s); } };
  const text = () => (base + ' ' + live).replace(/\s+/g, ' ').trim();
  const clearTimers = () => { clearTimeout(maxTimer); clearTimeout(silentTimer); clearTimeout(retryTimer); };
  function finish(reason) {
    if (done) return;
    done = true; want = false; clearTimers(); set('idle');
    const t = text(); live = '';
    onDone?.(t, reason);
  }
  function fail(code, raw) { if (done) return; try { rec?.abort(); } catch { /* ignore */ } rec = null; done = true; want = false; clearTimers(); set('idle'); onError?.(code, raw || code); }

  function begin() {
    if (!want) return;
    let r;
    try { r = new SR(); } catch { fail('denied', 'cannot-create'); return; }
    rec = r; sessionStart = Date.now();
    r.lang = lang; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
    r.onstart = () => {
      set('listening');
      if (!clock) {                                    // the timers start when the microphone really opens (not while iOS is asking permission)
        clock = true;
        maxTimer = setTimeout(() => { if (want) l.stop(); }, maxMs);
        silentTimer = setTimeout(() => { if (want && !heardAny) fail('silent', 'no-speech'); }, silentMs);
      }
    };
    r.onresult = (e) => {
      let t = '';
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + ' ';
      live = t.trim();
      if (live) { heardAny = true; clearTimeout(silentTimer); silentTimer = setTimeout(() => { if (want && !heardAny) fail('silent', 'no-speech'); }, silentMs); }
      onText?.(text(), e.results[e.results.length - 1]?.isFinal === true);
    };
    r.onerror = (e) => {
      const c = e && e.error;
      if (c === 'not-allowed' || c === 'service-not-allowed') return fail('denied', c);
      if (c === 'audio-capture') return fail('nomic', c);
      if (c === 'network') return fail('network', c);
      if (c === 'language-not-supported') return fail('lang', c);
      /* 'no-speech' and 'aborted' are normal: the end handler decides what to do next */
    };
    r.onend = () => {
      if (rec !== r) return;
      rec = null;
      base = text(); live = '';
      if (!want) return finish('stopped');
      if (onPause && heardAny && onPause(base) === true) return finish('paused');   // he paused and what he read is already enough
      // the browser stopped by itself after a pause: listen again, unless it keeps ending at once with nothing
      if (Date.now() - sessionStart < 500) { if (++quick >= 4) return fail('unstable', 'ended-at-once'); } else quick = 0;
      retryTimer = setTimeout(() => { if (want) begin(); }, 160);
    };
    try { r.start(); threw = 0; } catch { if (++threw >= 5) return fail('unstable', 'start-threw'); retryTimer = setTimeout(() => { if (want) begin(); }, 300); }   // start() can throw while the last sitting is still closing: try again, but not forever
  }

  const onHide = () => { if (document.visibilityState === 'hidden' && !done) l.abort(); };
  document.addEventListener('visibilitychange', onHide);

  const l = {
    get state() { return state; },
    text,
    start() {
      if (!SR || !done) return false;
      done = false; want = true; base = ''; live = ''; quick = 0; heardAny = false; clock = false; threw = 0;
      set('starting');
      begin();
      return true;
    },
    stop() {                                           // ask the browser to wrap up; it reports the last words, then onDone fires
      if (done) return;
      want = false; clearTimeout(maxTimer); clearTimeout(silentTimer); clearTimeout(retryTimer);
      if (rec) { try { rec.stop(); } catch { finish('stopped'); } setTimeout(() => finish('stopped'), 1500); }   // safety: never hang if no end event comes
      else finish('stopped');
    },
    abort() {
      if (done) { return; }
      want = false; done = true; clearTimers();
      try { rec?.abort(); } catch { /* ignore */ }
      rec = null; base = ''; live = ''; set('idle');
    },
    destroy() { l.abort(); document.removeEventListener('visibilitychange', onHide); },
  };
  return l;
}
