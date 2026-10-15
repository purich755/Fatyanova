// Статический сервер для папки out/ (результат `next build` со статическим экспортом).
//   node tools/serve.mjs [port] [dir]
// Сжимает текст, отдаёт Range для видео и кэширует /media/ — примерно как GitHub Pages/Vercel.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.argv[2] || 8651);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', process.argv[3] || 'out');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.webp': 'image/webp', '.avif': 'image/avif',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.woff2': 'font/woff2',
};

http
  .createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    let file = path.join(ROOT, p);
    if (!path.extname(file) && fs.existsSync(file + '.html')) file += '.html';
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404');
    }
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const cache = /\/(media|_next\/static)\//.test(p) ? 'public, max-age=31536000, immutable' : 'no-cache';
    const size = fs.statSync(file).size;
    const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
    if (range) {
      const start = range[1] ? +range[1] : 0;
      const end = range[2] ? Math.min(+range[2], size - 1) : size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Cache-Control': cache });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    const gz = /text|javascript|json|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '');
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': cache, 'Accept-Ranges': 'bytes', ...(gz ? { 'Content-Encoding': 'gzip' } : { 'Content-Length': size }) });
    (gz ? fs.createReadStream(file).pipe(zlib.createGzip()) : fs.createReadStream(file)).pipe(res);
  })
  .listen(PORT, () => console.log(`http://localhost:${PORT}/`));
