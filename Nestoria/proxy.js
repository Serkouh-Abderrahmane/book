// Reverse proxy: serves frontend + backend on a single port for ngrok
const httpProxy = require('http-proxy');
const http = require('http');

const FE_PORT = 5173;
const BE_PORT = 5000;
const PROXY_PORT = 8000;

const proxy = httpProxy.createProxy({ ws: true });

const server = http.createServer((req, res) => {
  const target = req.url.startsWith('/api/')
    ? { target: 'http://localhost:' + BE_PORT }
    : { target: 'http://localhost:' + FE_PORT };
  proxy.web(req, res, target, (err) => {
    res.writeHead(502);
    res.end('Proxy error: ' + err.message);
  });
});

server.listen(PROXY_PORT, () => {
  console.log('Proxy listening on http://localhost:' + PROXY_PORT);
  console.log('  /api/*  -> backend :' + BE_PORT);
  console.log('  /*      -> frontend:' + FE_PORT);
});
