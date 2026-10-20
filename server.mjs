import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  let filePath;
  const stemArtBase = path.resolve(process.cwd(), '..', 'yongzhen-stem-art');

  if (reqPath === '/yongzhen-stem-art') {
    res.writeHead(302, { Location: '/yongzhen-stem-art/' });
    res.end();
    return;
  }

  if (reqPath.startsWith('/yongzhen-stem-art/')) {
    let sub = reqPath.slice('/yongzhen-stem-art/'.length);
    if (!sub || sub === '/') sub = 'index.html';
    filePath = path.resolve(stemArtBase, sub);
    if (!filePath.startsWith(stemArtBase)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }
  } else {
    filePath = path.resolve(process.cwd(), reqPath.startsWith('/') ? reqPath.slice(1) : reqPath);
    if (!filePath.startsWith(process.cwd())) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Handle range requests for PDF/video
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stats.size,
        'Content-Type': contentType,
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

function startServer(port) {
  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`====================================================`);
    console.log(`  徐秉鴻老師 教學成果網站 本地伺服器已啟動！`);
    console.log(`  瀏覽網址：${url}`);
    console.log(`  按 Ctrl + C 可停止伺服器`);
    console.log(`====================================================`);
    exec(`start ${url}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`連接埠 ${port} 已被佔用，嘗試連接埠 ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('伺服器錯誤:', err);
    }
  });
}

startServer(PORT);

