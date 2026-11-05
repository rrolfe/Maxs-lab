// Flat vector icons on a 48px grid: ink outlines, one coral accent. Always paired with a text label in the UI.
const I = 'stroke:var(--ink);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round';
const wrap = (body, size = 48, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 48 48" width="${size}" height="${size}" fill="none" aria-hidden="true" focusable="false">${body}</svg>`;
const f = (c) => `fill:var(--${c})`;

export const icons = {
  home: (s) => wrap(`<path d="M7 23 24 9l17 14" style="${I}"/><path d="M12 21v18h24V21" style="${I};${f('surface')}"/><path d="M20 39V28h8v11" style="${I};${f('coral')}"/>`, s),
  close: (s) => wrap(`<path d="M13 13l22 22M35 13 13 35" style="${I};stroke-width:4"/>`, s),
  back: (s) => wrap(`<path d="M29 10 15 24l14 14" style="${I};stroke-width:4"/>`, s),
  speaker: (s) => wrap(`<path d="M8 19h8l9-7v24l-9-7H8z" style="${I};${f('gold')}"/><path d="M31 18c3 3 3 9 0 12M36 13c6 6 6 16 0 22" style="${I}"/>`, s),
  talk: (s) => wrap(`<path d="M7 10h34v22H27l-8 7v-7H7z" style="${I};${f('gold')}"/><path d="M14 18h20M14 24h13" style="${I}"/>`, s),
  speakerOff: (s) => wrap(`<path d="M8 19h8l9-7v24l-9-7H8z" style="${I};${f('surface')}"/><path d="M32 19l10 10M42 19 32 29" style="${I}"/>`, s),
  gear: (s) => wrap(`<path d="M24 5v7M24 36v7M5 24h7M36 24h7M10.6 10.6l5 5M32.4 32.4l5 5M37.4 10.6l-5 5M15.6 32.4l-5 5" style="${I};stroke-width:7;stroke-linecap:butt"/><circle cx="24" cy="24" r="13" style="${I};${f('surface')}"/><circle cx="24" cy="24" r="5" style="${I};${f('gold')}"/>`, s),
  bulb: (s) => wrap(`<path d="M17 31c-4-3-6-6-6-11a13 13 0 0 1 26 0c0 5-2 8-6 11v4H17z" style="${I};${f('gold')}"/><path d="M18 41h12M20 45h8" style="${I}"/>`, s),
  check: (s) => wrap(`<path d="M10 25l9 9 19-21" style="${I};stroke-width:5;stroke:var(--success)"/>`, s),
  star: (s) => wrap(`<path d="m24 6 5.5 11.6 12.5 1.6-9.2 8.7 2.4 12.6L24 34.4 12.8 40.5l2.4-12.6L6 19.2l12.5-1.6z" style="${I};${f('gold')}"/>`, s),
  starOff: (s) => wrap(`<path d="m24 6 5.5 11.6 12.5 1.6-9.2 8.7 2.4 12.6L24 34.4 12.8 40.5l2.4-12.6L6 19.2l12.5-1.6z" style="${I};fill:none;opacity:.45"/>`, s),
  pearl: (s) => wrap(`<circle cx="24" cy="24" r="15" style="${I};fill:#F3E3F6"/><path d="M16.5 20a8.5 8.5 0 0 1 6.5-5.5" style="stroke:#fff;stroke-width:3.6;stroke-linecap:round"/><circle cx="29" cy="29" r="3" style="fill:#D9B8E6"/>`, s),
  moon: (s) => wrap(`<path d="M31 7a17 17 0 1 0 10 27A14 14 0 0 1 31 7z" style="${I};${f('gold')}"/>`, s),
  sun: (s) => wrap(`<circle cx="24" cy="24" r="8" style="${I};${f('gold')}"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.5 10.5l4 4M33.5 33.5l4 4M37.5 10.5l-4 4M14.5 33.5l-4 4" style="${I}"/>`, s),
  lock: (s) => wrap(`<rect x="11" y="21" width="26" height="20" rx="4" style="${I};${f('surface')}"/><path d="M16 21v-5a8 8 0 0 1 16 0v5" style="${I}"/><circle cx="24" cy="31" r="2.6" style="fill:var(--ink)"/>`, s),
  // hub tiles
  wordsearch: (s) => wrap(`<rect x="6" y="6" width="36" height="36" rx="6" style="${I};${f('surface')}"/><path d="M13 16h22M13 24h22M13 32h22M16 11v26M24 11v26M32 11v26" style="stroke:var(--ink);stroke-width:1.2;opacity:.35"/><rect x="11" y="21.5" width="26" height="7" rx="3.5" style="${f('coral')};stroke:var(--ink);stroke-width:2.2;opacity:.9"/>`, s),
  hangman: (s) => wrap(`<path d="M8 41h24M14 41V8h20v6" style="${I}"/><circle cx="34" cy="20" r="5" style="${I};${f('gold')}"/><path d="M34 25v9M34 28l-5 4M34 28l5 4" style="${I}"/><path d="M26 41h14" style="${I};stroke:var(--coral)"/>`, s),
  quiz: (s) => wrap(`<circle cx="24" cy="24" r="17" style="${I};${f('gold')}"/><path d="M18 19a6.5 6.5 0 1 1 9 6c-2 1-3 2-3 4" style="${I};stroke-width:3.4"/><circle cx="24" cy="35" r="2.2" style="fill:var(--ink)"/>`, s),
  stands: (s) => wrap(`<path d="M7 20h34l-3-9H10z" style="${I};${f('coral')}"/><path d="M7 20c0 4 6 4 6 0 0 4 7 4 7 0 0 4 8 4 8 0 0 4 7 4 7 0 0 4 6 4 6 0" style="${I};${f('surface')}"/><path d="M11 25v16h26V25" style="${I};${f('surface')}"/><rect x="17" y="30" width="14" height="6" rx="2" style="${I};${f('gold')}"/>`, s),
  world: (s) => wrap(`<circle cx="24" cy="24" r="17" style="${I};${f('teal')}"/><path d="M13 17c4-3 8-2 9 1s-3 5-1 8 6 1 5 6M30 11c2 3 6 3 8 5M32 28c3 0 6 2 7 4" style="stroke:var(--surface);stroke-width:3;stroke-linecap:round;fill:none"/><circle cx="24" cy="24" r="17" style="${I}"/>`, s),
  passport: (s) => wrap(`<rect x="10" y="5" width="28" height="38" rx="4" style="${I};${f('ink')}"/><circle cx="24" cy="21" r="8" style="stroke:var(--gold);stroke-width:2.6;fill:none"/><path d="M16 21h16M24 13c-3 4-3 12 0 16M24 13c3 4 3 12 0 16" style="stroke:var(--gold);stroke-width:1.6"/><rect x="16" y="34" width="16" height="3.2" rx="1.6" style="fill:var(--coral)"/>`, s),
  // stands
  lemonade: (s) => wrap(`<path d="M12 12h24l-3 29H15z" style="${I};${f('surface')}"/><path d="M13.5 22h21l-1.5 19H15z" style="${I};${f('gold')}"/><circle cx="29" cy="15" r="7" style="${I};${f('gold')}"/><path d="M29 8v14M22 15h14" style="stroke:var(--ink);stroke-width:1.6"/><path d="M25 12 31 4" style="${I};stroke:var(--coral)"/>`, s),
  icecream: (s) => wrap(`<path d="M15 24h18L24 44z" style="${I};${f('gold')}"/><path d="M19 28l5 10M27 28l-3 10M30 26l-4 12" style="stroke:var(--ink);stroke-width:1.4;opacity:.5"/><circle cx="24" cy="17" r="9" style="${I};${f('coral')}"/><path d="M16 21a8 8 0 0 0 16 0" style="${I};${f('surface')}"/><circle cx="24" cy="7" r="2.6" style="fill:var(--ink)"/>`, s),
  pizza: (s) => wrap(`<path d="M6 14c12-8 24-8 36 0L24 43z" style="${I};${f('gold')}"/><path d="M6 14c12-8 24-8 36 0" style="${I};stroke-width:4.5"/><circle cx="19" cy="20" r="3.4" style="${f('coral')};stroke:var(--ink);stroke-width:2"/><circle cx="29" cy="22" r="3.4" style="${f('coral')};stroke:var(--ink);stroke-width:2"/><circle cx="24" cy="31" r="3.4" style="${f('coral')};stroke:var(--ink);stroke-width:2"/>`, s),
  ballpark: (s) => wrap(`<circle cx="24" cy="24" r="17" style="${I};fill:#fff"/><path d="M13 12c4 4 4 20 0 24M35 12c-4 4-4 20 0 24" style="stroke:var(--coral);stroke-width:2.6;fill:none"/><path d="M11 17l3 1M11 24h3M11 31l3-1M37 17l-3 1M37 24h-3M37 31l-3-1" style="stroke:var(--coral);stroke-width:2"/>`, s),
  sanctuary: (s) => wrap(`<path d="M5 25c6-9 17-12 27-6l9-6v22l-9-6c-10 6-21 3-27-4z" style="${I};${f('teal')}"/><circle cx="14" cy="23" r="2" style="fill:var(--surface)"/>`, s),
  shark: (s) => wrap(`<path d="M4 31c4-3 8-4 12-4 3-9 9-14 17-15-1 6 0 10 3 13 3 0 6-1 8-3-1 5-3 9-6 12-6 4-14 5-24 3l-5 3z" style="${I};${f('teal')}"/><path d="M4 31c8 3 20 6 36-3" style="${I};${f('surface')}"/><circle cx="15" cy="29" r="1.6" style="fill:var(--ink)"/>`, s),
  trophy: (s) => wrap(`<path d="M14 8h20v12a10 10 0 0 1-20 0z" style="${I};${f('gold')}"/><path d="M14 12H7c0 8 3 11 8 12M34 12h7c0 8-3 11-8 12M24 30v7M16 41h16" style="${I}"/>`, s),
  stamp: (s) => wrap(`<circle cx="24" cy="24" r="16" style="${I};${f('coral')};opacity:.9"/><circle cx="24" cy="24" r="11" style="stroke:var(--surface);stroke-width:2;fill:none"/><path d="m24 15 2.7 6 6.3.7-4.7 4.3 1.3 6.3-5.6-3.2-5.6 3.2 1.3-6.3-4.7-4.3 6.3-.7z" style="fill:var(--surface)"/>`, s),
  plus: (s) => wrap(`<path d="M24 10v28M10 24h28" style="${I};stroke-width:5"/>`, s),
  minus: (s) => wrap(`<path d="M10 24h28" style="${I};stroke-width:5"/>`, s),
  dino: (s) => wrap(`<path d="M6 33c0-9 8-15 17-15 5 0 8 2 10 5l7-4v8l-5 2c-1 6-5 9-11 9H12c-4 0-6-2-6-5z" style="${I};${f('success')}"/><path d="M14 18l3-7 4 7M22 17l4-7 3 8" style="${I};${f('coral')}"/><circle cx="35" cy="25" r="1.8" style="fill:var(--ink)"/><path d="M14 40v4M26 40v4" style="${I}"/>`, s),
  planet: (s) => wrap(`<circle cx="24" cy="24" r="12" style="${I};${f('gold')}"/><path d="M13 20c8-3 17-1 22 3" style="stroke:var(--coral);stroke-width:3;fill:none"/><ellipse cx="24" cy="26" rx="21" ry="7" transform="rotate(-18 24 26)" style="${I};fill:none"/><circle cx="9" cy="10" r="1.6" style="fill:var(--ink)"/><circle cx="40" cy="9" r="1.6" style="fill:var(--ink)"/>`, s),
  family: (s) => wrap(`<path d="m24 5 5 10.5 11.5 1.6-8.4 8 2.1 11.4L24 31l-10.2 5.5 2.1-11.4-8.4-8L19 15.5z" style="${I};${f('gold')}"/>`, s),
};

/** The "Fathom" fin-M logo (also exported as icons/fathom.svg). */
export function logo(size = 56) {
  return `<svg class="logo" viewBox="0 0 96 96" width="${size}" height="${size}" role="img" aria-label="Max’s Lab">
  <rect width="96" height="96" rx="22" fill="#10303B"/>
  <path d="M12 70C16 46 26 30 40 20c0 16 4 36 8 50z" fill="#EAF5F3"/>
  <path d="M44 70c4-24 14-40 28-50 0 16 4 36 8 50z" fill="#EAF5F3"/>
  <path d="M12 79q9-9 18 0t18 0 18 0 18 0" fill="none" stroke="#FF8A5B" stroke-width="5.5" stroke-linecap="round"/>
  <circle cx="22" cy="24" r="7" fill="#FFD166"/><circle cx="25.5" cy="21.5" r="6" fill="#10303B"/>
</svg>`;
}
export const ico = (name, size) => (icons[name] ? icons[name](size) : '');
