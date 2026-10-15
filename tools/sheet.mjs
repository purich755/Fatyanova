// Контактный лист: node raw/sheet.mjs <dir> <out.jpg> [cols]
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const [dir, out, colsArg] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const cols = +(colsArg || 6), W = +(process.argv[5] || 300), H = Math.round(W * +(process.argv[6] || 0.733));
const rows = Math.ceil(files.length / cols);
const tiles = await Promise.all(
  files.map(async (f, i) => {
    const img = await sharp(path.join(dir, f)).resize(W, H - 20, { fit: 'contain', background: '#222' }).toBuffer();
    const label = Buffer.from(`<svg width="${W}" height="20"><rect width="100%" height="100%" fill="#000"/><text x="4" y="15" font-size="14" fill="#fff" font-family="monospace">${f}</text></svg>`);
    return [
      { input: img, left: (i % cols) * W, top: Math.floor(i / cols) * H },
      { input: label, left: (i % cols) * W, top: Math.floor(i / cols) * H + H - 20 },
    ];
  }),
);
await sharp({ create: { width: cols * W, height: rows * H, channels: 3, background: '#111' } })
  .composite(tiles.flat())
  .jpeg({ quality: 80 })
  .toFile(out);
console.log(out, files.length);
