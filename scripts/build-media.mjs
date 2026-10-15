// Готовит фото для сайта: raw/src/*.jpg → public/media/<id>-<w>.{avif,webp} + lib/media.ts
//   npm run media            — собрать недостающее
//   npm run media -- --force — пересобрать всё
// Исходники: 10 фото от клиента (концерты в Музее Победы), стоп-кадр портрета из промо-ролика VK,
// один кадр со стены VK (604 px — только маленьким), постеры трёх клипов со стены VK.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'raw/src';
const OUT = 'public/media';
const force = process.argv.includes('--force');
const WIDTHS = [480, 800, 1200, 1600, 2000];

// [id, файл, alt, обрезка {left, top, width, height} | null]
const PLAN = [
  ['blue-pair-lift', 'blue-pair-lift.jpg', 'Коллектив в синих народных костюмах кружится парами на сцене Музея Победы', null],
  ['green-jump', 'green-jump.jpg', 'Танцор в зелёной кепке в высоком прыжке над ансамблем в народных костюмах', null],
  ['lilac-ribbons', 'lilac-ribbons.jpg', 'Девушки в лиловых платьях с розовыми лентами застыли в танцевальной композиции', null],
  ['red-headbands', 'red-headbands.jpg', 'Артисты в красных повязках сидят на сцене спиной к спине и улыбаются', null],
  ['group-cosmonautics', 'group-cosmonautics.jpg', 'Общий снимок всех коллективов у экрана «День космонавтики» в Музее Победы', null],
  ['kerchiefs-line', 'kerchiefs-line.jpg', 'Ряд юных артистов в платках и кепках — сценический образ военных лет', null],
  ['wide-stage-april12', 'wide-stage-april12.jpg', 'Широкий план сцены 12 апреля: ансамбль в синих костюмах перед экраном «Из Сибири с любовью»', null],
  ['curtain-call', 'curtain-call.jpg', 'Все участники концерта аплодируют на сцене после финального номера', null],
  ['solo-zhuravli', 'solo-zhuravli.jpg', 'Солистка в белой рубахе и зелёной юбке танцует перед экраном конкурса «Журавли Победы»', null],
  ['red-gold-pairs', 'red-gold-pairs.jpg', 'Пары в красно-золотых народных костюмах танцуют на сцене', null],
  ['anna-portrait', 'anna-portrait.jpg', 'Анна Фатьянова, продюсер творческих коллективов', { left: 560, top: 0, width: 864, height: 1080 }],
  ['red-sarafans', 'red-sarafans-vk.jpg', 'Девушки в красных сарафанах и белых платках в танце', null],
  ['poster-stage-blue', 'poster-stage-blue.jpg', 'Кадр клипа: ансамбль в голубых костюмах на сцене Музея Победы', null],
  ['poster-stage-brown', 'poster-stage-brown.jpg', 'Кадр клипа: танцоры в коричневых костюмах на сцене', null],
  ['poster-stage-finale', 'poster-stage-finale.jpg', 'Кадр клипа: финальный номер в Музее Победы', null],
];

fs.mkdirSync(OUT, { recursive: true });
const entries = [];
for (const [id, file, alt, crop] of PLAN) {
  let base = sharp(path.join(SRC, file)).rotate();
  if (crop) base = base.extract(crop);
  const buf = await base.toBuffer();
  const meta = await sharp(buf).metadata();
  const widths = WIDTHS.filter((w) => w < meta.width);
  widths.push(meta.width);
  const ws = [...new Set(widths)].sort((a, b) => a - b);
  for (const w of ws) {
    const img = () => sharp(buf).resize({ width: w, withoutEnlargement: true });
    const avif = `${OUT}/${id}-${w}.avif`;
    const webp = `${OUT}/${id}-${w}.webp`;
    if (force || !fs.existsSync(avif)) await img().avif({ quality: 52, effort: 6 }).toFile(avif);
    if (force || !fs.existsSync(webp)) await img().webp({ quality: 74, effort: 6 }).toFile(webp);
  }
  // крошечное размытое превью — фон на время загрузки
  const blur = await sharp(buf).resize(16).webp({ quality: 40 }).toBuffer();
  entries.push({ id, w: meta.width, h: meta.height, widths: ws, alt, blur: `data:image/webp;base64,${blur.toString('base64')}` });
  const kb = ws.map((w) => Math.round(fs.statSync(`${OUT}/${id}-${w}.avif`).size / 1024)).join('/');
  console.log(id, `${meta.width}x${meta.height}`, 'avif KB', kb);
}

// Open Graph — обычный JPEG 1200×630
await sharp(path.join(SRC, 'group-cosmonautics.jpg')).resize(1200, 630, { fit: 'cover', position: 'south' }).jpeg({ quality: 82, mozjpeg: true }).toFile(`${OUT}/og.jpg`);

const ts = `// Сгенерировано scripts/build-media.mjs — не править руками.
export type MediaId = ${entries.map((e) => `'${e.id}'`).join(' | ')};
export type MediaItem = { id: MediaId; w: number; h: number; widths: number[]; alt: string; blur: string };
export const MEDIA: Record<MediaId, MediaItem> = ${JSON.stringify(Object.fromEntries(entries.map((e) => [e.id, e])), null, 2)};
`;
fs.mkdirSync('lib', { recursive: true });
fs.writeFileSync('lib/media.ts', ts);
console.log('lib/media.ts', entries.length);
