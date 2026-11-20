// Writes the list of every file the lab needs into sw.js (between the ALL-FILES markers), so one online visit saves the whole lab for offline play.
// Run it before every release:  node tools/make-precache.mjs        (add --check to only verify, e.g. in tests)
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['js', 'css', 'data', 'img', 'audio', 'icons'], ROOT_FILES = ['index.html', 'manifest.webmanifest'];
const out = [];
const walk = (d) => { for (const n of fs.readdirSync(path.join(root, d), { withFileTypes: true })) { if (n.name.startsWith('.')) continue; const p = d + '/' + n.name; if (n.isDirectory()) walk(p); else if (!/\.(md|txt|map)$/.test(n.name)) out.push(p); } };
for (const d of DIRS) if (fs.existsSync(path.join(root, d))) walk(d);
for (const f of ROOT_FILES) if (fs.existsSync(path.join(root, f))) out.push(f);
out.sort();
const bytes = out.reduce((n, f) => n + fs.statSync(path.join(root, f)).size, 0);
const block = `/* ALL-FILES:start (written by tools/make-precache.mjs: ${out.length} files, ${(bytes / 1048576).toFixed(1)} MB) */\nconst ALL = ${JSON.stringify(out, null, 0).replace(/","/g, '",\n  "').replace('["', '[\n  "').replace('"]', '"\n]')};\n/* ALL-FILES:end */`;
const swPath = path.join(root, 'sw.js'); const sw = fs.readFileSync(swPath, 'utf8');
const re = /\/\* ALL-FILES:start[\s\S]*?\/\* ALL-FILES:end \*\//;
if (!re.test(sw)) { console.error('sw.js has no ALL-FILES markers'); process.exit(1); }
const next = sw.replace(re, () => block);
if (process.argv.includes('--check')) { if (next !== sw) { console.error('sw.js file list is out of date: run node tools/make-precache.mjs'); process.exit(1); } console.log(`sw.js file list is current (${out.length} files, ${(bytes / 1048576).toFixed(1)} MB)`); process.exit(0); }
fs.writeFileSync(swPath, next); console.log(`sw.js file list written: ${out.length} files, ${(bytes / 1048576).toFixed(1)} MB`);
