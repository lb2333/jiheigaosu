const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = Number(process.env.PORT) || 8088;
const HOST = process.env.HOST || '127.0.0.1';
const ROOT = path.resolve(__dirname);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ktx2': 'image/ktx2',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json'
};

const COMPRESSIBLE_EXTS = new Set([
  '.html', '.js', '.mjs', '.css', '.json', '.svg', '.gltf'
]);

function makeEtag(stat) {
  return `W/"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
}

function isSafePath(targetPath) {
  const rel = path.relative(ROOT, targetPath);
  return rel !== '' ? (!rel.startsWith('..') && !path.isAbsolute(rel)) : true;
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' });
    return res.end('Method Not Allowed');
  }

  let urlPath;
  try {
    const rawPath = (req.url || '/').split('?')[0];
    urlPath = decodeURIComponent(rawPath);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad Request: Malformed URL');
  }

  if (urlPath.includes('\0')) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad Request');
  }

  const normalizedRel = (urlPath === '/' ? 'index.html' : urlPath).replace(/^[/\\]+/, '');
  let filePath = path.resolve(ROOT, normalizedRel);

  if (!isSafePath(filePath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not Found: ' + urlPath);
    }

    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      fs.stat(filePath, (idxErr, idxStat) => {
        if (idxErr || !idxStat.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('Not Found: ' + urlPath);
        }
        serveFile(req, res, filePath, idxStat, urlPath);
      });
      return;
    }

    if (!stat.isFile()) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Forbidden');
    }

    serveFile(req, res, filePath, stat, urlPath);
  });
});

function serveFile(req, res, filePath, stat, urlPath) {
  const ext = path.extname(filePath).toLowerCase();
  const isLongCache = urlPath.startsWith('/lib/cesium/') || urlPath.startsWith('/assets/');
  const etag = makeEtag(stat);
  const lastModified = stat.mtime.toUTCString();

  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': isLongCache ? 'public, max-age=86400' : 'no-cache',
    'ETag': etag,
    'Last-Modified': lastModified,
    'X-Content-Type-Options': 'nosniff'
  };

  // Conditional 304 check
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, headers);
    return res.end();
  }

  const acceptEncoding = String(req.headers['accept-encoding'] || '');
  const shouldCompress = COMPRESSIBLE_EXTS.has(ext) && stat.size >= 1024;
  let encoding = null;

  if (shouldCompress) {
    if (/\bbr\b/i.test(acceptEncoding)) encoding = 'br';
    else if (/\bgzip\b/i.test(acceptEncoding)) encoding = 'gzip';
  }

  if (encoding) {
    headers['Content-Encoding'] = encoding;
    headers['Vary'] = 'Accept-Encoding';
  } else {
    headers['Content-Length'] = stat.size;
  }

  res.writeHead(200, headers);
  if (req.method === 'HEAD') {
    return res.end();
  }

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('Internal Server Error');
  });

  if (encoding === 'br') {
    const brotli = zlib.createBrotliCompress({
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 }
    });
    stream.pipe(brotli).pipe(res);
  } else if (encoding === 'gzip') {
    stream.pipe(zlib.createGzip({ level: 6 })).pipe(res);
  } else {
    stream.pipe(res);
  }
}

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`[启动失败] 端口 ${PORT} 已被占用，请关闭已运行的服务或设置环境变量 PORT=8089 后重试。`);
  } else {
    console.error('[服务异常]', err);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`G1211吉黑高速三维原型服务已启动: http://${HOST}:${PORT}/index.html`);
  console.log(`已启用 Brotli/Gzip 压缩、流式传输与 ETag 协商缓存`);
});
