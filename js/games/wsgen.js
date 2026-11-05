// Word-search grid generator. Deterministic for a seed so the daily puzzle matches on every device.
const ALL_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]];
export const DIRS_BY_TIER = { 1: ALL_DIRS.slice(0, 2), 2: ALL_DIRS.slice(0, 4), 3: ALL_DIRS };
export const SIZE_BY_TIER = { 1: { size: 8, words: 4 }, 2: { size: 10, words: 6 }, 3: { size: 12, words: 8 } };

const EN_FILL = 'EEEEAAAARRIIOOTTNNSSLLCCUUDDPPMMHHGGBBFFYYWWKKVXZJQ';
const ES_FILL = 'EEEEAAAAOOOSSRRNNIIDDLLCCTTUUMMPPBBGGVVYYQQHHFFJJZXKÑ';

/** words: [{key, ...}] with key already folded (A-Z, ES keeps Ñ). Returns {grid, placed:[{word, cells}]} */
export function generate(words, { size, dirs, r, lang = 'en' }) {
  const grid = Array.from({ length: size * size }, () => '');
  const placed = [];
  const order = words.slice().sort((a, b) => b.len - a.len);
  for (const w of order) {
    const letters = [...w.key];
    let ok = false;
    for (let attempt = 0; attempt < 400 && !ok; attempt++) {
      const [dr, dc] = dirs[Math.floor(r() * dirs.length)];
      const r0 = Math.floor(r() * size), c0 = Math.floor(r() * size);
      const r1 = r0 + dr * (letters.length - 1), c1 = c0 + dc * (letters.length - 1);
      if (r1 < 0 || r1 >= size || c1 < 0 || c1 >= size) continue;
      const cells = letters.map((_, k) => (r0 + dr * k) * size + (c0 + dc * k));
      if (!cells.every((ci, k) => grid[ci] === '' || grid[ci] === letters[k])) continue;
      cells.forEach((ci, k) => { grid[ci] = letters[k]; });
      placed.push({ word: w, cells });
      ok = true;
    }
    if (!ok) return null;     // caller retries with another seed
  }
  const fill = lang === 'es' ? ES_FILL : EN_FILL;
  for (let i = 0; i < grid.length; i++) if (!grid[i]) grid[i] = fill[Math.floor(r() * fill.length)];
  return { grid, size, placed };
}

/** Cells along a straight line (8 directions) from a to b, or null if not aligned. */
export function lineCells(a, b, size) {
  const ar = Math.floor(a / size), ac = a % size, br = Math.floor(b / size), bc = b % size;
  const dr = br - ar, dc = bc - ac;
  if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) return null;
  const n = Math.max(Math.abs(dr), Math.abs(dc));
  const sr = Math.sign(dr), sc = Math.sign(dc);
  return Array.from({ length: n + 1 }, (_, k) => (ar + sr * k) * size + (ac + sc * k));
}
/** Snap a free drag endpoint to the nearest of the 8 directions (keeps length). */
export function snapEnd(a, b, size) {
  const ar = Math.floor(a / size), ac = a % size, br = Math.floor(b / size), bc = b % size;
  let dr = br - ar, dc = bc - ac;
  if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) return b;
  const ang = Math.atan2(dr, dc), step = Math.round(ang / (Math.PI / 4)) * (Math.PI / 4);
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  const nr = Math.max(0, Math.min(size - 1, ar + Math.round(Math.sin(step) * len)));
  const nc = Math.max(0, Math.min(size - 1, ac + Math.round(Math.cos(step) * len)));
  return nr * size + nc;
}
