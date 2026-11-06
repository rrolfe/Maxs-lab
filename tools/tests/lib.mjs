import { createRequire } from 'module';
import { execSync } from 'child_process';
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW_PATH || require('path').join(execSync('npm root -g').toString().trim(), 'playwright'));
export const BASE = 'http://127.0.0.1:8767/';
export async function open({ device = 'ipad-land', lang = 'en', theme = 'day', state = null } = {}) {
  const browser = await chromium.launch();
  const ctxOpts = device === 'ipad-land' ? { ...devices['iPad Pro 11 landscape'] } : { viewport: { width: 834, height: 1194 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 };
  ctxOpts.serviceWorkers = 'block';
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
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
export const shot = (page, name) => page.screenshot({ path: `/tmp/claude-0/-home-claude/2f17bed4-bec3-54e2-a1c6-817904baf255/scratchpad/${name}.png` });
