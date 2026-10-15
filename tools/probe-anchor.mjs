// Зонд: куда уезжает якорь из оглавления (Lenis). node tools/probe-anchor.mjs [#id]
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';
const id = process.argv[2] || '#word';
const ctx = await chromium.launchPersistentContext(path.join(os.tmpdir(), 'fatyanova-probe'), { channel: 'chrome', headless: true, viewport: { width: 1440, height: 900 } });
const page = ctx.pages()[0] || (await ctx.newPage());
await page.addInitScript(() => sessionStorage.setItem('fa-bell', '1'));
await page.goto(process.env.URL || 'http://localhost:8650/', { waitUntil: 'load' });
await page.waitForTimeout(2500);
await page.evaluate(() => window.__lenis.scrollTo(document.querySelector('#program').getBoundingClientRect().top + scrollY, { immediate: true, force: true }));
await page.waitForTimeout(500);
const before = await page.evaluate((id) => ({ y: scrollY, want: document.querySelector(id).getBoundingClientRect().top + scrollY, lenis: window.__lenis.animatedScroll, limit: window.__lenis.limit }), id);
if (process.env.DIRECT) await page.evaluate((y) => window.__lenis.scrollTo(y - 8, { duration: 1.4 }), before.want); else if (process.env.ELEM) await page.evaluate((id) => window.__lenis.scrollTo(document.querySelector(id), { offset: -8, duration: 1.4 }), id); else if (process.env.MC) { const b = await page.locator(`.toc-row[href="${id}"]`).boundingBox(); await page.mouse.click(b.x + 40, b.y + b.height / 2); if (process.env.AWAY) await page.mouse.move(5, 5); } else if (process.env.SYN) await page.evaluate((id) => document.querySelector(`.toc-row[href="${id}"]`).click(), id); else if (process.env.FOC) await page.evaluate((id) => { window.__lenis.scrollTo(document.querySelector(id), { offset: -8, duration: 1.4 }); const t = document.querySelector(id); t.setAttribute("tabindex", "-1"); t.focus({ preventScroll: true }); }, id); else await page.locator(`.toc-row[href="${id}"]`).click();
const samples = [];
for (let i = 0; i < 12; i++) {
  await page.waitForTimeout(200);
  samples.push(await page.evaluate((id) => [Math.round(scrollY), Math.round(document.querySelector(id).getBoundingClientRect().top), Math.round(window.__lenis.targetScroll)], id));
}
console.log(JSON.stringify(before), '\n', samples.map((s) => s.join('/')).join('  '));
await ctx.close();
