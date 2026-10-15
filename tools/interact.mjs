// Клик-тесты главной: node tools/interact.mjs [url]   (по умолчанию dev 8650)
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';

const url = process.argv[2] || process.env.URL || 'http://localhost:8650/';
let fails = 0;
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`);
  if (!cond) fails++;
};

async function run(vp, label, opts = {}) {
  console.log(`\n== ${label} ${vp.width}×${vp.height}${opts.reduced ? ' reduced' : ''}`);
  const ctx = await chromium.launchPersistentContext(path.join(os.tmpdir(), 'fatyanova-int-' + label), {
    channel: 'chrome',
    headless: true,
    viewport: vp,
    isMobile: vp.width < 700,
    hasTouch: vp.width < 700,
    reducedMotion: opts.reduced ? 'reduce' : 'no-preference',
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.addInitScript(() => sessionStorage.clear());
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 200)));
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  const go = (sel) =>
    page.evaluate((sel) => {
      const el = document.querySelector(sel);
      const box = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
      const y = box.getBoundingClientRect().top + scrollY;
      window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y);
    }, sel);

  // прелоадер и занавес
  if (!opts.reduced) {
    const pl = await page.locator('.pl').count();
    ok('прелоадер показан в первый визит', pl === 1);
  }
  await page.waitForFunction(() => !document.querySelector('.pl'), null, { timeout: 6000 }).catch(() => {});
  ok('прелоадер ушёл', (await page.locator('.pl').count()) === 0, `${Date.now() - t0} мс`);
  await page.waitForTimeout(1800);
  const drape = await page.evaluate(() => {
    const r = document.querySelector('.hero .drape--l').getBoundingClientRect();
    return r.width / innerWidth;
  });
  ok('занавес раскрыт', drape < 0.08, `ширина кулисы ${(drape * 100).toFixed(1)}%`);
  const h1 = await page.evaluate(() => {
    const r = document.querySelector('#hero-title').getBoundingClientRect();
    const d = document.querySelector('.hero .drape--l').getBoundingClientRect();
    return { left: r.left, drape: d.right, op: getComputedStyle(document.querySelector('#hero-title .ln, #hero-title .hl') || document.body).opacity };
  });
  ok('заголовок не под кулисой', h1.left > h1.drape, `h1 ${h1.left.toFixed(0)} / кулиса ${h1.drape.toFixed(0)}`);

  // оглавление → якорь
  if (vp.width >= 900) {
    await go('#program');
    await page.waitForTimeout(500);
    // не locator.click(): Playwright сам докручивает элемент нативно и спорит с Lenis
    const b = await page.locator('.toc-row[href="#word"]').boundingBox();
    await page.mouse.click(b.x + 40, b.y + b.height / 2);
    await page.waitForTimeout(1900);
    const top = await page.evaluate(() => document.querySelector('#word').getBoundingClientRect().top);
    ok('оглавление ведёт к «Слову продюсера»', Math.abs(top) < 30, `top ${top.toFixed(0)}`);
  }

  // билеты
  await go('#case');
  await page.waitForTimeout(600);
  await page.locator('#tk-apr').click();
  await page.waitForTimeout(300);
  const tk = await page.evaluate(() => ({
    sel: document.querySelector('#tk-apr').getAttribute('aria-selected'),
    txt: document.querySelector('#case-panel').textContent,
  }));
  ok('апрельский билет выбран', tk.sel === 'true' && tk.txt.includes('Земля, встречай'));
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(200);
  ok('стрелка переключает билет', (await page.locator('#tk-nov').getAttribute('aria-selected')) === 'true');

  // звёзды
  await go('#stars');
  await page.waitForTimeout(900);
  if (vp.width >= 900) {
    await page.locator('.star').nth(2).hover();
    await page.waitForTimeout(500);
    const nm = await page.locator('.sky-card-name').textContent();
    ok('наведение на звезду меняет карточку', nm === 'Олег Газманов', nm);
    await page.locator('.star').nth(4).focus();
    await page.waitForTimeout(300);
    ok('звезда с клавиатуры', (await page.locator('.sky-card-name').textContent()) === 'Вера Алдонина');
  } else {
    const n = await page.locator('.sky-mcard').count();
    ok('мобильные карточки звёзд', n === 5);
  }

  // услуги: аккордеон на мобильных
  if (vp.width < 900) {
    await go('#services');
    await page.waitForTimeout(500);
    await page.locator('.svc-row').nth(2).click();
    await page.waitForTimeout(700);
    const h = await page.evaluate(() => document.querySelectorAll('.svc-panel')[2].getBoundingClientRect().height);
    ok('аккордеон раскрывается', h > 100, `${h.toFixed(0)} px`);
  }

  // галерея: фильтр, лайтбокс
  await go('#gallery');
  await page.waitForTimeout(800);
  await page.locator('.chip', { hasText: 'Поклон' }).click();
  await page.waitForTimeout(900);
  const vis = await page.evaluate(() => [...document.querySelectorAll('.frame')].filter((f) => !f.hidden).length);
  ok('фильтр «Поклон»', vis === 2, `${vis} кадра`);
  await page.locator('.chip', { hasText: 'Все' }).click();
  await page.waitForTimeout(900);
  await page.locator('.frame:not([hidden]) .frame-btn').nth(1).click();
  await page.waitForTimeout(900);
  ok('лайтбокс открыт', (await page.locator('.lb').count()) === 1);
  const c1 = await page.locator('.lb-count').textContent();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  const c2 = await page.locator('.lb-count').textContent();
  ok('стрелка листает', c1 !== c2, `${c1} → ${c2}`);
  const lock = await page.evaluate(() => document.documentElement.style.overflow);
  ok('скролл заблокирован', lock === 'hidden');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  ok('Esc закрывает', (await page.locator('.lb').count()) === 0);

  // видео
  await go('.vids');
  await page.waitForTimeout(1500);
  const playing = await page.evaluate(() => [...document.querySelectorAll('.vid video')].filter((v) => !v.paused).length);
  ok(opts.reduced ? 'видео не играют сами (reduced)' : 'видео в зоне видимости играют', opts.reduced ? playing === 0 : playing >= 1, `${playing}`);
  await page.locator('.vid-sound').first().click();
  await page.waitForTimeout(300);
  const muted = await page.evaluate(() => [...document.querySelectorAll('.vid video')].map((v) => v.muted));
  ok('звук включается у одного', muted.filter((m) => !m).length === 1);

  // финал
  await go('#contacts');
  await page.waitForTimeout(1500);
  const tel = await page.locator('.cc-phone').getAttribute('href');
  ok('телефон tel:', tel === 'tel:+79130060936');
  const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
  ok('нет горизонтального скролла', ov.sw <= ov.iw, `${ov.sw}/${ov.iw}`);
  ok('нет ошибок в консоли', errs.length === 0, errs.slice(0, 3).join(' | '));
  await ctx.close();
}

await run({ width: 1440, height: 900 }, 'desk');
await run({ width: 390, height: 844 }, 'mob');
await run({ width: 1440, height: 900 }, 'desk-rm', { reduced: true });
console.log(fails ? `\n${fails} провал(ов)` : '\nвсё зелёное');
process.exit(fails ? 1 : 0);
