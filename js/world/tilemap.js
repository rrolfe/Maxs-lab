// A small Web-Mercator slippy map with no libraries: satellite tiles on top, a built-in offline land map underneath.
// Providers are tried in order; if one cannot deliver tiles the next one is used, and the offline map is always there.
import land from '../../data/land.js';

const TS = 256, MAXLAT = 85.0511;
const rad = Math.PI / 180;
export const mercY = (lat) => { const s = Math.sin(Math.max(-MAXLAT, Math.min(MAXLAT, lat)) * rad); return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI); };
export const mercLat = (v) => (2 * Math.atan(Math.exp((0.5 - v) * 2 * Math.PI)) - Math.PI / 2) / rad;
export const lonU = (lon) => (lon + 180) / 360;
export function distKm(a, b) {
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
}

/** Tile sources, best first. {z}/{y}/{x} are filled in. `key` providers need a free key typed in by a grown-up. */
export const PROVIDERS = [
  { id: 'esri', name: 'Esri World Imagery', key: true, maxZ: 16, url: 'https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token={key}', attr: 'Imagery © Esri, Maxar, Earthstar Geographics and the GIS User Community' },
  { id: 'eox24', name: 'Sentinel-2 cloudless', maxZ: 12, url: 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg', attr: 'Sentinel-2 cloudless – s2maps.eu by EOX IT Services GmbH (contains modified Copernicus Sentinel data)' },
  { id: 'eox21', name: 'Sentinel-2 cloudless (2021)', maxZ: 12, url: 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/g/{z}/{y}/{x}.jpg', attr: 'Sentinel-2 cloudless – s2maps.eu by EOX IT Services GmbH (contains modified Copernicus Sentinel data)' },
  { id: 'gibs', name: 'NASA Blue Marble', maxZ: 6, url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/EPSG3857_500m/{z}/{y}/{x}.jpeg', attr: 'Imagery: NASA Blue Marble, via NASA GIBS' },
];

export class TileMap {
  constructor(host, opts = {}) {
    this.host = host; this.o = opts; this.z = 2; this.u = 0.5; this.v = 0.42; this.pi = -1; this.ok = 0; this.err = 0;
    this.tiles = new Map(); this.marks = new Map(); this.sel = null; this.pin = null; this.pad = { l: 0, r: 0, t: 0, b: 0 }; this.dead = false; this.raf = 0; this.anim = 0;
    this.root = host.appendChild(document.createElement('div')); this.root.className = 'tm'; this.root.tabIndex = 0;
    this.root.setAttribute('role', 'application');
    this.cv = this.root.appendChild(document.createElement('canvas')); this.cv.className = 'tm-bg';
    this.tl = this.root.appendChild(document.createElement('div')); this.tl.className = 'tm-tiles';
    this.ml = this.root.appendChild(document.createElement('div')); this.ml.className = 'tm-marks';
    this.attr = this.root.appendChild(document.createElement('div')); this.attr.className = 'tm-attr';
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this.root);
    this._bind();
    this.nextProvider();
    this.resize();
  }
  // ---------- geometry ----------
  get S() { return TS * 2 ** this.z; }
  get w() { return this.root.clientWidth || 1; } get h() { return this.root.clientHeight || 1; }
  minZ() { return Math.max(0.6, Math.log2(Math.max(this.w, this.h) / TS)); }
  maxZ() { const p = this.provider; return (p ? p.maxZ : 6) + 2; }
  clamp() {
    this.z = Math.max(this.minZ(), Math.min(this.maxZ(), this.z));
    const S = this.S, hw = this.w / 2 / S, hh = this.h / 2 / S;
    this.u = hw >= 0.5 ? 0.5 : Math.max(hw, Math.min(1 - hw, this.u));
    this.v = hh >= 0.5 ? 0.5 : Math.max(hh, Math.min(1 - hh, this.v));
  }
  toScreen(lat, lon) { const S = this.S; return { x: (lonU(lon) - this.u) * S + this.w / 2, y: (mercY(lat) - this.v) * S + this.h / 2 }; }
  toLatLon(x, y) { const S = this.S; return { lon: ((x - this.w / 2) / S + this.u) * 360 - 180, lat: mercLat((y - this.h / 2) / S + this.v) }; }
  resize() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr); this.dpr = dpr;
    this.clamp(); this.draw();
  }
  zoomAbout(z, sx, sy) {
    const before = this.toLatLon(sx, sy); this.z = z; this.clamp();
    const S = this.S; this.u = lonU(before.lon) - (sx - this.w / 2) / S; this.v = mercY(before.lat) - (sy - this.h / 2) / S; this.clamp(); this.draw();
  }
  panBy(dx, dy) { const S = this.S; this.u -= dx / S; this.v -= dy / S; this.clamp(); this.draw(); }
  zoomBy(dz) { this.flyTo(null, null, this.z + dz, 220); }
  flyTo(lat, lon, z, ms = 800) {
    cancelAnimationFrame(this.anim);
    const tz = Math.max(this.minZ(), Math.min(this.maxZ(), z == null ? this.z : z)), S1 = TS * 2 ** tz, pd = this.pad;
    const tu = lat == null ? this.u : lonU(lon) - (pd.l - pd.r) / (2 * S1), tv = lat == null ? this.v : mercY(lat) - (pd.t - pd.b) / (2 * S1);
    const z0 = this.z, u0 = this.u, v0 = this.v, t0 = performance.now();
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = (t) => {
      const k = still ? 1 : Math.min(1, (t - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      this.z = z0 + (tz - z0) * e; this.u = u0 + (tu - u0) * e; this.v = v0 + (tv - v0) * e; this.clamp(); this.draw();
      if (k < 1) this.anim = requestAnimationFrame(step);
    };
    this.anim = requestAnimationFrame(step);
  }
  // ---------- providers ----------
  get provider() { return PROVIDERS[this.pi]; }
  nextProvider() {
    const key = (this.o.getKey && this.o.getKey()) || '';
    do { this.pi++; } while (PROVIDERS[this.pi] && PROVIDERS[this.pi].key && !key);
    this.ok = 0; this.err = 0;
    for (const [, im] of this.tiles) im.remove(); this.tiles.clear();
    const p = this.provider;
    this.attr.textContent = p ? p.attr : 'Land outlines: Natural Earth (public domain)';
    if (this.o.onProvider) this.o.onProvider(p || null);
    if (this.root.isConnected) { this.clamp(); this.draw(); }
  }
  _tileUrl(p, z, x, y) { return p.url.replace('{z}', z).replace('{x}', x).replace('{y}', y).replace('{key}', encodeURIComponent((this.o.getKey && this.o.getKey()) || '')); }
  _tiles() {
    const p = this.provider; if (!p) return;
    const zi = Math.max(0, Math.min(p.maxZ, Math.floor(this.z + 0.3))), k = 2 ** (this.z - zi), n = 2 ** zi;
    const cx = this.u * n * TS, cy = this.v * n * TS, hw = this.w / 2 / k, hh = this.h / 2 / k;
    const x0 = Math.max(0, Math.floor((cx - hw) / TS)), x1 = Math.min(n - 1, Math.floor((cx + hw) / TS));
    const y0 = Math.max(0, Math.floor((cy - hh) / TS)), y1 = Math.min(n - 1, Math.floor((cy + hh) / TS));
    const need = new Set();
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const id = `${p.id}/${zi}/${tx}/${ty}`; need.add(id);
      let im = this.tiles.get(id);
      if (!im) {
        im = new Image(); im.className = 'tm-t'; im.alt = ''; im.draggable = false; im.decoding = 'async';
        im.onload = () => { im.classList.add('ok'); this.ok++; };
        im.onerror = () => { im.remove(); this.tiles.delete(id); this.err++; if (this.err >= 6 && this.ok === 0 && this.provider === p) this.nextProvider(); };
        im.src = this._tileUrl(p, zi, tx, ty); this.tl.append(im); this.tiles.set(id, im);
      }
      const s = TS * k + 0.6;
      im.style.width = im.style.height = s + 'px';
      im.style.transform = `translate(${this.w / 2 + (tx * TS - cx) * k}px,${this.h / 2 + (ty * TS - cy) * k}px)`;
    }
    for (const [id, im] of this.tiles) if (!need.has(id)) { im.remove(); this.tiles.delete(id); }
  }
  // ---------- drawing ----------
  draw() { if (this.dead || this.raf) return; this.raf = requestAnimationFrame(() => { this.raf = 0; this._draw(); }); }
  _draw() {
    if (this.dead) return;
    const g = this.cv.getContext('2d'), S = this.S, night = document.documentElement.dataset.theme === 'night';
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.fillStyle = night ? '#16264A' : '#8FD0E6'; g.fillRect(0, 0, this.w, this.h);
    const X = (lon) => (lonU(lon) - this.u) * S + this.w / 2, Y = (lat) => (mercY(lat) - this.v) * S + this.h / 2;
    g.strokeStyle = night ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.55)'; g.lineWidth = 1; g.beginPath();
    for (let lo = -180; lo <= 180; lo += 30) { const x = X(lo); g.moveTo(x, 0); g.lineTo(x, this.h); }
    for (let la = -60; la <= 60; la += 30) { const y = Y(la); g.moveTo(0, y); g.lineTo(this.w, y); }
    g.stroke();
    g.fillStyle = night ? '#3A4A6B' : '#EFE6C8'; g.strokeStyle = night ? '#6C7FA8' : '#B9A978'; g.lineWidth = 1.2;
    for (const r of land) {
      g.beginPath();
      for (let i = 0; i < r.length; i += 2) { const x = X(r[i]), y = Y(Math.max(-MAXLAT, r[i + 1])); i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.closePath(); g.fill(); g.stroke();
    }
    this._tiles(); this._marks();
  }
  // ---------- markers ----------
  setMarkers(list) {
    this.ml.replaceChildren(); this.marks.clear();
    for (const m of list) {
      const el = document.createElement('div'); el.className = 'tm-m' + (m.fam ? ' fam' : '') + (m.done ? ' done' : '') + (m.kind ? ' k-' + m.kind : '');
      el.innerHTML = '<i></i><b></b>'; el.lastChild.textContent = m.label; el.dataset.id = m.id;
      this.ml.append(el); this.marks.set(m.id, { ...m, el });
    }
    this.draw();
  }
  setSelected(id) { this.sel = id; this.draw(); }
  setPin(p) { this.pin = p; if (!this.pinEl) { this.pinEl = this.ml.appendChild(document.createElement('div')); } this.pinEl.className = 'tm-pin ' + (p ? p.cls || '' : 'off'); this.pinEl.textContent = p && p.text || ''; this.draw(); }
  _marks() {
    const z = this.z, W = this.w, H = this.h, taken = [];
    const order = [...this.marks.values()].sort((a, b) => (b.id === this.sel) - (a.id === this.sel) || b.fam - a.fam);
    for (const m of order) {
      const p = this.toScreen(m.lat, m.lon); m.sx = p.x; m.sy = p.y;
      const inside = p.x > -40 && p.x < W + 40 && p.y > -40 && p.y < H + 40;
      m.vis = inside && (!this.o.filter || this.o.filter(m));
      m.el.style.display = m.vis ? '' : 'none';
      if (!m.vis) continue;
      m.el.style.transform = `translate(${p.x}px,${p.y}px)`;
      m.el.classList.toggle('sel', m.id === this.sel);
      let lab = m.id === this.sel || m.fam || z >= 5.2 || (m.done && z >= 3.4);
      if (lab) { const r = { x: p.x - 60, y: p.y + 8, w: 120, h: 22 }; if (m.id !== this.sel && taken.some((t) => r.x < t.x + t.w && r.x + r.w > t.x && r.y < t.y + t.h && r.y + r.h > t.y)) lab = false; else taken.push(r); }
      m.el.classList.toggle('lab', !!lab);
    }
    if (this.pin && this.pinEl) { const p = this.toScreen(this.pin.lat, this.pin.lon); this.pinEl.style.transform = `translate(${p.x}px,${p.y}px)`; }
  }
  nearest(x, y, r = 36) {
    let best = null, bd = r * r;
    for (const m of this.marks.values()) { if (!m.vis) continue; const d = (m.sx - x) ** 2 + (m.sy - y) ** 2; if (d < bd) { bd = d; best = m; } }
    return best;
  }
  // ---------- input ----------
  _bind() {
    const r = this.root, ptrs = new Map(); let moved = 0, t0 = 0, lastTap = { t: 0, x: 0, y: 0 }, pinch = 0;
    const pos = (e) => { const b = r.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
    r.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.tm-ui')) return;
      r.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, pos(e)); cancelAnimationFrame(this.anim);
      if (ptrs.size === 1) { moved = 0; t0 = performance.now(); } else { const [a, b] = [...ptrs.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); moved = 99; }
    });
    r.addEventListener('pointermove', (e) => {
      if (!ptrs.has(e.pointerId)) return; const p = pos(e), old = ptrs.get(e.pointerId); ptrs.set(e.pointerId, p);
      if (ptrs.size === 1) { moved += Math.abs(p.x - old.x) + Math.abs(p.y - old.y); this.panBy(p.x - old.x, p.y - old.y); }
      else if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch > 0) this.zoomAbout(this.z + Math.log2(d / pinch), (a.x + b.x) / 2, (a.y + b.y) / 2);
        pinch = d;
      }
    });
    const up = (e) => {
      if (!ptrs.has(e.pointerId)) return; const p = ptrs.get(e.pointerId); ptrs.delete(e.pointerId);
      if (ptrs.size === 0 && moved < 9 && performance.now() - t0 < 600 && e.type === 'pointerup') {
        const now = performance.now();
        if (now - lastTap.t < 320 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 30) { this.zoomAbout(this.z + 1, p.x, p.y); lastTap.t = 0; return; }
        lastTap = { t: now, x: p.x, y: p.y };
        const ll = this.toLatLon(p.x, p.y);
        if (this.o.onTap) this.o.onTap({ ...ll, x: p.x, y: p.y, hit: this.nearest(p.x, p.y) });
      }
      if (ptrs.size < 2) pinch = 0;
    };
    r.addEventListener('pointerup', up); r.addEventListener('pointercancel', up);
    r.addEventListener('wheel', (e) => { e.preventDefault(); const p = pos(e); this.zoomAbout(this.z - e.deltaY * (e.ctrlKey ? 0.01 : 0.0018), p.x, p.y); }, { passive: false });
    r.addEventListener('keydown', (e) => {
      const k = { ArrowLeft: [60, 0], ArrowRight: [-60, 0], ArrowUp: [0, 60], ArrowDown: [0, -60] }[e.key];
      if (k) { e.preventDefault(); this.panBy(k[0], k[1]); } else if (e.key === '+' || e.key === '=') this.zoomBy(1); else if (e.key === '-') this.zoomBy(-1);
    });
    this._mq = matchMedia('(prefers-color-scheme: dark)');
  }
  destroy() { this.dead = true; cancelAnimationFrame(this.raf); cancelAnimationFrame(this.anim); this.ro.disconnect(); this.root.remove(); }
}
