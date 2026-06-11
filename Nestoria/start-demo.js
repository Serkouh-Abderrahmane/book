// start-demo.js — One command demo launcher (production mode)
// Starts backend (serves API + built frontend), creates a public URL via Tunnelmole.
// Usage: cd Nestoria && npm run demo

const { spawn, execSync } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

const ROOT = __dirname;
const BACKEND_DIR = path.join(ROOT, 'backend');
const FE_BUILD = path.join(ROOT, 'frontend', 'build');
const PORT = 5000;

const children = [];

function log(tag, msg) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}][${tag}] ${msg}`);
}

async function waitForPort(port, host, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://${host}:${port}/api/health`, (res) => { res.resume(); resolve(); });
        req.on('error', reject);
        req.setTimeout(3000, () => { req.destroy(); reject(new Error('timeout')); });
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return false;
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { reject(new Error(`Invalid JSON: ${data.slice(0, 100)}`)); }
      });
    }).on('error', reject);
  });
}

function startProcess(cmd, args, opts) {
  log('spawn', `${cmd} ${args.join(' ')}`);
  const proc = spawn(cmd, args, { ...opts, shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(proc);
  proc.stdout.on('data', (d) => d.toString().split('\n').filter(Boolean).forEach((l) => log(opts.tag || 'proc', l)));
  proc.stderr.on('data', (d) => {
    const s = d.toString().trim();
    if (s && !s.includes('ExperimentalWarning') && !s.includes('--experimental')) {
      log(opts.tag || 'proc', s);
    }
  });
  proc.on('exit', (code) => log(opts.tag || 'proc', `exited (${code})`));
  return proc;
}

async function cleanup() {
  log('demo', '\nShutting down...');
  children.forEach((c) => { try { c.kill('SIGTERM'); } catch {} });
  setTimeout(() => { children.forEach((c) => { try { c.kill('SIGKILL'); } catch {} }); }, 2000);
}

async function verifyApi(baseUrl) {
  log('verify', 'Running health checks...');
  let ok = 0, fail = 0;

  try {
    const health = await fetchJson(`${baseUrl}/api/health`);
    if (health.ok) { log('verify', '✓ Backend health check passed'); ok++; }
    else { log('verify', '✗ Backend health check failed'); fail++; }
  } catch (e) {
    log('verify', `✗ Backend health check error: ${e.message}`); fail++;
  }

  try {
    const data = await fetchJson(`${baseUrl}/api/hotels?sort=score`);
    const hotels = data.hotels || [];
    if (hotels.length > 0) {
      log('verify', `✓ API returns ${hotels.length} hotels`); ok++;
      const badNames = hotels.filter((h) => !h.name || h.name.startsWith('removed-') || h.name.includes('[REMOVED]') || h.name === h.slug);
      if (badNames.length === 0) { log('verify', '✓ All property names are valid'); ok++; }
      else { log('verify', `✗ ${badNames.length} hotels have broken names`); fail++; }
    } else {
      log('verify', '✗ API returned empty hotels array'); fail++;
    }
  } catch (e) {
    log('verify', `✗ Hotels API error: ${e.message}`); fail++;
  }

  return { ok, fail };
}

async function main() {
  log('demo', '=== Nestoria Demo (Production Mode) ===');
  log('demo', `Root: ${ROOT}`);

  // Verify frontend build exists
  if (!fs.existsSync(FE_BUILD)) {
    log('demo', 'FATAL: Frontend build not found. Run: cd frontend && npm run build');
    process.exit(1);
  }
  log('demo', `✓ Frontend build found (${FE_BUILD})`);

  // Start backend with NODE_ENV=production
  log('demo', 'Starting backend (API + frontend server)...');
  const be = startProcess('node', ['server.js'], {
    cwd: BACKEND_DIR,
    tag: 'backend',
    env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT) },
  });

  if (!(await waitForPort(PORT, '127.0.0.1', 20000))) {
    log('demo', 'FATAL: Backend failed to start'); process.exit(1);
  }
  log('demo', `✓ Backend running on :${PORT} (serves API + frontend)`);

  // Verify local
  const localResult = await verifyApi(`http://127.0.0.1:${PORT}`);
  if (localResult.fail > 0) {
    log('demo', `WARNING: ${localResult.fail} checks failed — continuing`);
  } else {
    log('demo', `✓ All ${localResult.ok} local checks passed`);
  }

  // Start Tunnelmole
  log('demo', 'Starting Tunnelmole tunnel...');
  let tunnelUrl = null;

  try {
    const tmModule = require('tunnelmole');
    const tm = tmModule.tunnelmole || tmModule.default || tmModule;
    if (typeof tm === 'function') {
      const result = await tm({ port: PORT });
      tunnelUrl = typeof result === 'string' ? result : (result.url || result);
    }
  } catch (e) {
    log('demo', `Programmatic tunnelmole failed: ${e.message}`);
  }

  if (!tunnelUrl) {
    tunnelUrl = await new Promise((resolve) => {
      const tm = spawn('npx.cmd', ['tunnelmole', String(PORT)], {
        shell: true, stdio: ['ignore', 'pipe', 'pipe'],
      });
      children.push(tm);
      let url = null;
      const onData = (d) => {
        const text = d.toString();
        log('tmole', text.trim());
        const match = text.match(/(https?:\/\/[^\s]+tunnelmole[^\s]*)/i);
        if (match && !url) {
          url = match[1].replace(/[^a-zA-Z0-9:/._-]/g, '');
          resolve(url);
        }
      };
      tm.stdout.on('data', onData);
      tm.stderr.on('data', onData);
      setTimeout(() => resolve(url || 'unknown'), 25000);
    });
  }

  if (!tunnelUrl || tunnelUrl === 'unknown') {
    log('demo', 'Could not detect tunnel URL');
    log('demo', `Access locally: http://localhost:${PORT}`);
    tunnelUrl = `http://localhost:${PORT}`;
  }

  log('demo', `\n=== PUBLIC URL ===`);
  log('demo', tunnelUrl);
  log('demo', `==================\n`);

  // Verify public URL
  log('demo', 'Verifying public URL...');
  await new Promise((r) => setTimeout(r, 2000));
  const publicResult = await verifyApi(tunnelUrl);

  log('demo', `\n=== RESULTS ===`);
  log('demo', `Local checks:  ${localResult.ok} passed, ${localResult.fail} failed`);
  log('demo', `Public checks: ${publicResult.ok} passed, ${publicResult.fail} failed`);
  log('demo', ``);
  log('demo', `Give your client this URL: ${tunnelUrl}`);
  log('demo', ``);
  log('demo', `Press Ctrl+C to stop.`);
}

process.on('SIGINT', async () => { await cleanup(); process.exit(); });
process.on('SIGTERM', async () => { await cleanup(); process.exit(); });

main().catch(async (err) => {
  log('demo', `FATAL: ${err.message}`);
  await cleanup();
  process.exit(1);
});
