const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const ROOT_DIR = path.resolve(__dirname);

const ALLOWED_MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

// Internal build / config files that must never be exposed over HTTP
const BLOCKED_FILES = new Set([
  'serve.js',
  'build.js',
  'package.json',
  'package-lock.json',
  'tailwind.config.js'
]);

const server = http.createServer((req, res) => {
  // Only allow safe read-only methods
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', 'Allow': 'GET, HEAD' });
    return res.end('405 Methode niet toegestaan');
  }

  const cleanUrl = (req.url === '/' ? '/index.html' : req.url).split('?')[0];
  let decodedUrl;
  try {
    decodedUrl = decodeURIComponent(cleanUrl);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('400 Ongeldige URL');
  }

  const safePath = path.resolve(ROOT_DIR, '.' + decodedUrl);
  const relative = path.relative(ROOT_DIR, safePath);

  // Strict path-traversal prevention
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Toegang geweigerd');
  }

  const filename = path.basename(safePath).toLowerCase();
  const ext = path.extname(safePath).toLowerCase();
  const isHidden = relative.split(path.sep).some(part => part.startsWith('.') && part !== '.');

  // Block hidden files (.git, .github), internal tools, and untrusted extensions
  if (isHidden || BLOCKED_FILES.has(filename) || !ALLOWED_MIME[ext]) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 Niet gevonden');
  }

  fs.stat(safePath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('404 Niet gevonden');
      }
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('500 Server Fout');
    }

    if (!stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Niet gevonden');
    }

    res.writeHead(200, {
      'Content-Type': ALLOWED_MIME[ext],
      'Content-Length': stats.size,
      'X-Content-Type-Options': 'nosniff'
    });

    if (req.method === 'HEAD') {
      return res.end();
    }

    const stream = fs.createReadStream(safePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Fout bij lezen van bestand');
      }
    });
    stream.pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n🎉 Veilige lokale dev-server draait op: http://${HOST}:${PORT}`);
  console.log(`Druk op Ctrl+C om te stoppen.\n`);
});
