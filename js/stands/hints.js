// "How did I do last time?" hints for the Snack Shack menu (Rob, Nov 9 2026). Designed with a UX designer and a 1st-grade teacher:
//  * one chip per item for LAST TIME: 🙁 Ran out (orange) / 📦 Left over (violet, dashed) / ⭐ Just right (gold), each with a ten-block bar,
//    the words "about 100 thousand" instead of digit walls, and never red;
//  * one chip per item for FANS TODAY compared with last time (arrows and words, never an answer);
//  * tap the last-time chip for the exact numbers and a "use that again" button.
import { h } from '../core/dom.js';
import { S } from '../core/store.js';
import { t, addStrings } from '../core/i18n.js';

addStrings({
  en: {
    hhLast: 'Last time', hhToday: 'Fans today', hhFirst: 'After today you will see how each item did.', hhNew: '✨ New!', hhItems: 'How each item did', hhStars: '⭐ Sharp Eye! {n} items were just right.',
    hhRan: 'Ran out', hhRanMore: '{n} more wanted', hhLeft: 'Left over · {n}', hhRight: 'Just right!', hhNobody: 'Nobody asked',
    hdMade: 'Made {m} · Sold {s} · Wanted {w}', hdUse: 'Use {n} again', hhBar: 'Each block is a tenth of the fans who wanted it.',
    hf_up3: '▲▲ {n} times as many fans', hf_up2: '▲▲ Twice as many fans', hf_up1: '▲ More fans', hf_same: '＝ About the same', hf_dn1: '▼ Fewer fans', hf_dn2: '▼▼ Half as many fans', hf_dn3: '▼▼ Way fewer fans', hf_than: 'than last time',
    hw_up3: 'about {n} times as many fans as last time', hw_up2: 'about twice as many fans as last time', hw_up1: 'more fans than last time', hw_same: 'about the same number of fans as last time', hw_dn1: 'fewer fans than last time', hw_dn2: 'about half as many fans as last time', hw_dn3: 'way fewer fans than last time',
    hhCmp: 'Today has {w}.', stCoachCmp: 'Today has {w}. Check every amount: how many will you make?', hAbout: 'about {n}', hThousand: '{n} thousand', hMillion: '{n} million', hBillion: '{n} billion',
  },
  es: {
    hhLast: 'La última vez', hhToday: 'Fans hoy', hhFirst: 'Después de hoy verás cómo le fue a cada cosa.', hhNew: '✨ ¡Nuevo!', hhItems: 'Cómo le fue a cada cosa', hhStars: '⭐ ¡Ojo de águila! {n} cosas salieron justas.',
    hhRan: 'Se acabó', hhRanMore: 'querían {n} más', hhLeft: 'Sobraron · {n}', hhRight: '¡Justo!', hhNobody: 'Nadie lo pidió',
    hdMade: 'Preparaste {m} · Vendiste {s} · Querían {w}', hdUse: 'Usar {n} otra vez', hhBar: 'Cada bloque es una décima parte de los fans que lo querían.',
    hf_up3: '▲▲ {n} veces más fans', hf_up2: '▲▲ El doble de fans', hf_up1: '▲ Más fans', hf_same: '＝ Casi igual', hf_dn1: '▼ Menos fans', hf_dn2: '▼▼ La mitad de fans', hf_dn3: '▼▼ Muchos menos fans', hf_than: 'que la última vez',
    hw_up3: 'unas {n} veces más fans que la última vez', hw_up2: 'el doble de fans que la última vez', hw_up1: 'más fans que la última vez', hw_same: 'casi los mismos fans que la última vez', hw_dn1: 'menos fans que la última vez', hw_dn2: 'la mitad de fans que la última vez', hw_dn3: 'muchos menos fans que la última vez',
    hhCmp: 'Hoy hay {w}.', stCoachCmp: 'Hoy hay {w}. Revisa cada cantidad: ¿cuántos preparas?', hAbout: 'unos {n}', hThousand: '{n} mil', hMillion: '{n} millones', hBillion: '{n} mil millones',
  },
});

const fmt = (n) => Number(n).toLocaleString('en-US');
const trim = (x) => String(Math.round(x * 10) / 10);

/** Numbers a 1st grader can say: exact below 100, "about 340", "about 12 thousand", "about 2.4 million". */
export function about(n) {
  n = Math.max(0, Math.round(n));
  if (n < 100) return fmt(n);
  const a = (s) => t('hAbout', { n: s });
  if (n < 1000) return a(fmt(Math.round(n / 10) * 10));
  if (n < 10000) return a(fmt(Math.round(n / 100) * 100));
  if (n < 1e6) return a(t('hThousand', { n: fmt(Math.round(n / 1000)) }));
  if (n < 1e9) return a(t('hMillion', { n: trim(n / 1e6) }));
  return a(t('hBillion', { n: trim(n / 1e9) }));
}

/** made = how many he made; sold; out = how many fans wanted it after it ran out. */
export function verdictOf({ made = 0, sold = 0, out = 0 }) {
  const wanted = sold + out, left = Math.max(0, made - sold);
  let kind;
  if (out > Math.max(1, wanted * 0.05)) kind = 'short';
  else if (left > Math.max(1, wanted * 0.10)) kind = 'extra';
  else kind = made === 0 && wanted === 0 ? 'none' : 'right';
  return { kind, wanted, left, short: out, made, sold };
}

/** Today vs last time, as a ratio -> a bucket. */
export function bucketOf(r) {
  if (!(r > 0) || !Number.isFinite(r)) return null;
  const n = r >= 2.5 ? Math.max(3, r >= 10 ? Math.round(r / 10) * 10 : Math.round(r)) : 0;
  const key = r >= 2.5 ? 'up3' : r >= 1.6 ? 'up2' : r >= 1.2 ? 'up1' : r >= 0.85 ? 'same' : r >= 0.6 ? 'dn1' : r >= 0.35 ? 'dn2' : 'dn3';
  return { key, n, big: key === 'up3' || key === 'up2' || key === 'dn2' || key === 'dn3' };
}

/** A stretched ten-frame: each block = a tenth of the fans who wanted it; filled = what he made; striped past ten = too many. */
export function blocksEl(made, wanted) {
  const ratio = wanted > 0 ? made / wanted : made > 0 ? 2 : 0;
  const filled = Math.max(0, Math.min(20, Math.round(ratio * 10))), slots = Math.max(10, filled);
  return h('span', { class: 'tenbar', 'aria-hidden': 'true', title: t('hhBar') }, Array.from({ length: slots }, (_, i) => h('i', { class: i < filled ? (i < 10 ? 'f' : 'x') : 'e' })));
}

const WORDS = { short: 'hhRan', extra: 'hhLeft', right: 'hhRight' };
/** The "last time" chip. onTap (optional) makes it a button that opens the exact numbers. */
export function lastChip(info, onTap) {
  if (!info) return h('div', { class: 'hint last new' }, h('b', {}, t('hhNew')));
  const v = verdictOf(info);
  if (v.kind === 'none') return h('div', { class: 'hint last none' }, h('b', {}, '—'), h('small', {}, t('hhNobody')));
  const icon = v.kind === 'short' ? '🙁' : v.kind === 'extra' ? '📦' : '⭐';
  const main = v.kind === 'short' ? t('hhRan') : v.kind === 'extra' ? t('hhLeft', { n: about(v.left) }) : t('hhRight');
  const sub = v.kind === 'short' ? t('hhRanMore', { n: about(v.short) }) : null;
  const label = icon + ' ' + main + (sub ? ' · ' + sub : '');
  const props = { class: 'hint last ' + v.kind, 'aria-label': label + '. ' + t('hdMade', { m: fmt(v.made), s: fmt(v.sold), w: fmt(v.wanted) }) };
  if (onTap) { props.type = 'button'; props.onclick = onTap; }
  return h(onTap ? 'button' : 'div', props, h('span', { class: 'hl' }, h('span', { class: 'hi' }, icon), h('b', {}, main)), sub ? h('small', {}, sub) : null, blocksEl(v.made, v.wanted));
}

/** The "fans today" chip: arrows and words, no amount. */
export function fansChip(ratio) {
  const b = bucketOf(ratio);
  if (!b) return h('div', { class: 'hint fans none' }, h('b', {}, '—'));
  return h('div', { class: 'hint fans ' + b.key, 'aria-label': t('hf_' + b.key, { n: b.n }) + ' ' + t('hf_than') }, h('b', {}, t('hf_' + b.key, { n: b.n })), h('small', {}, t('hf_than')));
}

/** One plain sentence about today's crowd compared with last time. */
export const crowdPhrase = (ratio) => { const b = bucketOf(ratio); return b ? { ...b, text: t('hw_' + b.key, { n: b.n }) } : null; };
