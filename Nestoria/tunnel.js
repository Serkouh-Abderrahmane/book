// One-command tunnel launcher
//   node tunnel.js
// Starts: frontend (Vite), backend (Express), localtunnel for both
// Auto-updates .env files and restarts backend with correct CORS.

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const localtunnel = require('localtunnel');

const ROOT = __dirname;
const FE_PORT = 5173;
const BE_PORT = 5000;
  const FE_SUBDOMAIN = 'nestoria-fe-' + Math.random().toString(36).slice(2, 6);
  const BE_SUBDOMAIN = 'nestoria-be-' + Math.random().toString(36).slice(2, 6);

function readEnv(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
}

function writeEnv(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

(async () => {
  console.log('Starting local servers...\n');

  // 1. Kill any existing servers on our ports
  try { execSync(`netstat -ano | findstr :${FE_PORT}`, { stdio: 'pipe' }); } catch { /* ok */ }
  try { execSync(`netstat -ano | findstr :${BE_PORT}`, { stdio: 'pipe' }); } catch { /* ok */ }

  // 2. Start backend
  const be = spawn('node', ['server.js'], {
    cwd: path.join(ROOT, 'backend'),
    stdio: 'pipe',
    env: { ...process.env, PORT: String(BE_PORT) },
  });
  be.stdout.on('data', d => process.stdout.write(`[backend] ${d}`));
  be.stderr.on('data', d => process.stderr.write(`[backend] ${d}`));

  // 3. Start frontend (Vite)
  const fe = spawn('npx.cmd', ['vite', '--host', '--port', String(FE_PORT)], {
    cwd: path.join(ROOT, 'frontend'),
    stdio: 'pipe',
  });
  fe.stdout.on('data', d => process.stdout.write(`[frontend] ${d}`));
  fe.stderr.on('data', d => process.stderr.write(`[frontend] ${d}`));

  // Wait for servers to be ready
  await new Promise(r => setTimeout(r, 6000));

  // 4. Start tunnels
  console.log('\nStarting tunnels...\n');
  const [tunFe, tunBe] = await Promise.all([
    localtunnel({ port: FE_PORT, subdomain: FE_SUBDOMAIN }).catch(() =>
      localtunnel({ port: FE_PORT }) // fallback to random
    ),
    localtunnel({ port: BE_PORT, subdomain: BE_SUBDOMAIN }).catch(() =>
      localtunnel({ port: BE_PORT })
    ),
  ]);

  const feUrl = tunFe.url;
  const beUrl = tunBe.url;

  console.log('========================================');
  console.log('  TUNNELS ACTIVE');
  console.log('========================================');
  console.log(`  Frontend: ${feUrl}`);
  console.log(`  Backend:  ${beUrl}/api/health`);
  console.log('========================================\n');

  // 5. Update frontend .env
  const feEnvPath = path.join(ROOT, 'frontend', '.env');
  const newFeEnv = `VITE_API_URL=${beUrl}/api\nVITE_GOOGLE_CLIENT_ID=\n`;
  writeEnv(feEnvPath, newFeEnv);

  // 6. Update backend .env
  const beEnvPath = path.join(ROOT, 'backend', '.env');
  let beEnv = readEnv(beEnvPath);
  // Update CORS_ORIGIN — replace existing value or add it
  if (beEnv.includes('CORS_ORIGIN=')) {
    beEnv = beEnv.replace(/^CORS_ORIGIN=.*$/m, `CORS_ORIGIN=${feUrl},http://localhost:5173`);
  } else {
    beEnv += `\nCORS_ORIGIN=${feUrl},http://localhost:5173\n`;
  }
  writeEnv(beEnvPath, beEnv);

  // 6b. Update frontend .env immediately so the dev server uses the backend tunnel URL
  try {
    const feEnvPath = path.join(ROOT, 'frontend', '.env');
    const feEnv = `VITE_API_URL=${beUrl}/api\nVITE_GOOGLE_CLIENT_ID=\n`;
    writeEnv(feEnvPath, feEnv);
  } catch (err) { /* ignore */ }

  // 7. Restart backend with new CORS
  be.kill('SIGTERM');
  await new Promise(r => setTimeout(r, 2000));
  const be2 = spawn('node', ['server.js'], {
    cwd: path.join(ROOT, 'backend'),
    stdio: 'pipe',
    env: { ...process.env, PORT: String(BE_PORT) },
  });
  be2.stdout.on('data', d => process.stdout.write(`[backend] ${d}`));
  be2.stderr.on('data', d => process.stderr.write(`[backend] ${d}`));

  await new Promise(r => setTimeout(r, 3000));

  console.log('\n========================================');
  console.log('  READY! Give your friend this URL:');
  console.log(`  ${feUrl}`);
  console.log('========================================');
  console.log('\nImportant: Visit the URLs yourself first to');
  console.log('click the "Click to Continue" button.\n');
  console.log('Press Ctrl+C to stop everything.\n');

  // Cleanup on exit
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    be2.kill();
    fe.kill();
    tunFe.close();
    tunBe.close();
    process.exit();
  });
})();
