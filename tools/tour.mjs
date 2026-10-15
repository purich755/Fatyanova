// Скриншот-тур: node tools/tour.mjs [w] [h] [--reduced] [--only name] [--bell]
//   URL=http://localhost:8651/ node tools/tour.mjs 390
// Без --bell прелоадер пропускается (флаг в sessionStorage до загрузки).
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--') && !/^[a-z-]+$/i.test(a));
const W = +(args[0] || 1440), H = +(args[1] || (W < 700 ? 844 : 900));
const reduced = process.argv.includes('--reduced');
const oi = process.argv.indexOf('--only');
const only = oi > 0 ? process.argv[oi + 1] : null;
const url = process.env.URL || 'http://localhost:8650/';
// [имя, селектор, доля: 0..1 — от высоты элемента, >1 — в экранах от верха элемента, <0 — экран до элемента]
const STOPS = [
  ['01-hero', '#top', 0],
  ['02-program', '#program', 0.02],
  ['03-word', '#word', 0.05],
  ['04-word-b', '#word', 0.45],
  ['05-path-a', '#path', 0.0],
  ['06-path-b', '#path', 0.4],
  ['07-path-c', '#path', 0.75],
  ['08-ribbon', '#case', -0.3],
  ['09-case-a', '#case', 0.0],
  ['10-case-b', '#case', 0.6],
  ['11-stars', '#stars', 0.12],
  ['12-stars-b', '#stars', 0.4],
  ['13-svc', '#services', 0.05],
  ['14-svc-b', '#services', 0.45],
  ['15-gallery', '#gallery', 0.05],
  ['16-videos', '.vids', 0.0],
  ['17-join', '#join', 0.0],
  ['18-cc-a', '#contacts', 0.0],
  ['19-cc-b', '#contacts', 0.7],
  ['20-footer', 'footer', 0],
];
const ctx = await chromium.launchPersistentContext(path.join(os.tmpdir(), 'fatyanova-tour'), {
  channel: 'chrome',
  headless: true,
  viewport: { width: W, height: H },
  isMobile: W < 700,
  hasTouch: W < 700,
  reducedMotion: reduced ? 'reduce' : 'no-preference',
  locale: 'ru-RU',
});
const page = ctx.pages()[0] || (await ctx.newPage());
if (!process.argv.includes('--bell')) await page.addInitScript(() => sessionStorage.setItem('fa-bell', '1'));
const errs = [];
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errs.push(m.type() + ': ' + m.text().slice(0, 300)));
page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
page.on('response', (r) => r.status() >= 400 && errs.push(r.status() + ' ' + r.url()));
await page.goto(url, { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(2600);
const scrollTo = (y) =>
  page.evaluate((y) => {
    const l = window.__lenis;
    if (l) l.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  }, y);
const total = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < total; y += 600) {
  await scrollTo(y);
  await page.waitForTimeout(80);
}
await scrollTo(0);
await page.waitForTimeout(900);
const dir = `raw/tour-${W}${reduced ? '-rm' : ''}`;
fs.mkdirSync(dir, { recursive: true });
for (const [name, sel, frac] of STOPS) {
  if (only && !name.includes(only)) continue;
  const y = await page.evaluate(
    ({ sel, frac }) => {
      const el = document.querySelector(sel);
      if (!el) return -1;
      // у закреплённых секций высота — у pin-spacer
      const box = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
      const r = box.getBoundingClientRect();
      const top = r.top + scrollY;
      const h = box.offsetHeight;
      return Math.max(0, top + (frac < 0 ? frac * innerHeight : frac * (frac > 1 ? innerHeight : h)));
    },
    { sel, frac },
  );
  if (y < 0) {
    console.log('нет', sel);
    continue;
  }
  const cur = await page.evaluate(() => scrollY);
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    await scrollTo(cur + ((y - cur) * i) / steps);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${dir}/${name}.png` });
}
const info = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight }));
console.log(dir, JSON.stringify(info));
console.log([...new Set(errs)].join('\n'));
await ctx.close();
