// Сабсет шрифтов под страницу: латиница + русская кириллица + цифры + типографские знаки.
// Гугловские подмножества next/font давали 8 файлов ~175 КБ с высоким приоритетом — это било по LCP на мобильных.
//   node scripts/subset-fonts.mjs   (исходники — raw/fonts/*.ttf из github.com/google/fonts, OFL)
import fs from 'node:fs';
import subsetFont from 'subset-font';

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)).join('');
const chars = range(0x20, 0x7e) + range(0x410, 0x44f) + 'Ёё' + '«»—–…№·’‘“”„×→←↑↓↗✕◉○' + range(0xa0, 0xbf) + '‑ ';

const JOBS = [
  // [исходник, результат, оси вариаций]
  ['Playfair.ttf', 'playfair.woff2', { wght: 400 }],
  ['Playfair-Italic.ttf', 'playfair-italic.woff2', { wght: 400 }],
  ['Manrope.ttf', 'manrope.woff2', { wght: { min: 400, max: 700 } }],
  ['Plex-Regular.ttf', 'plex-400.woff2', null],
  ['Plex-Medium.ttf', 'plex-500.woff2', null],
  ['MarckScript-Regular.ttf', 'marck.woff2', null],
];

fs.mkdirSync('app/fonts', { recursive: true });
for (const [src, out, axes] of JOBS) {
  const buf = fs.readFileSync(`raw/fonts/${src}`);
  const res = await subsetFont(buf, chars, { targetFormat: 'woff2', ...(axes ? { variationAxes: axes } : {}) });
  fs.writeFileSync(`app/fonts/${out}`, res);
  console.log('✓', out, (res.length / 1024).toFixed(1) + ' КБ');
}
