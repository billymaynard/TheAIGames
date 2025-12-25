const http = require('http');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, 'public');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const rawPath = req.url.split('?')[0];
  const normalized = path.normalize(rawPath).replace(/^(\.\.[/\\])+/, '');
  const trimmed = normalized.replace(/^[/\\]+/, '');
  const target = trimmed === '' ? 'index.html' : trimmed;
  const filePath = path.join(publicDir, target);
  const resolvedBase = path.resolve(publicDir);
  const resolvedPath = path.resolve(filePath);

  if (!resolvedPath.startsWith(resolvedBase)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
