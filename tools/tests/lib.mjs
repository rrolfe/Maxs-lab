import { createRequire } from 'module';
import { execSync } from 'child_process';
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW_PATH || require('path').join(execSync('npm root -g').toString().trim(), 'playwright'));
export const BASE = 'http://127.0.0.1:8767/';
export async function open({ device = 'ipad-land', lang = 'en', theme = 'day', state = null, cookies = null, standalone = false } = {}) {
  const browser = await chromium.launch();
  const ctxOpts = device === 'ipad-land' ? { ...devices['iPad Pro 11 landscape'] } : { viewport: { width: 834, height: 1194 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 };
  ctxOpts.serviceWorkers = 'block';
  const ctx = await browser.newContext(ctxOpts);
  if (cookies) await ctx.addCookies(cookies);       // what iOS copies into a new Home Screen icon
  const page = await ctx.newPage();
  if (standalone) await page.addInitScript(() => { Object.defineProperty(navigator, 'standalone', { get: () => true }); });   // pretend to be the Home Screen icon
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/tile|ERR_|Failed to load resource|net::/i.test(m.text())) errors.push('console: ' + m.text()); });
  await page.addInitScript(({ lang, theme, state }) => {
    if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('mll2:v1:state', JSON.stringify({ lang, theme, ...(state || {}) })); }
  }, { lang, theme, state });
  await page.goto(BASE + '#/home');
  await page.waitForSelector('.hud');
  return { browser, page, errors, ctx };
}
export const pearls = (page) => page.evaluate(() => window.__lab.S.pearls.balance);
import { tmpdir } from 'os';
export const shot = (page, name) => page.screenshot({ path: `${process.env.SHOT_DIR || tmpdir()}/${name}.png` });
