// Start backend and frontend, then create tunnels using tunnelmole (Node compatible require)
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const FE_PORT = 5173;
const BE_PORT = 5001; // avoid collision with any existing local backend on 5000

function writeEnv(p, content) { fs.writeFileSync(p, content, 'utf8'); }

async function main(){
  console.log('Starting backend...');
  const be = spawn(process.execPath, ['server.js'], { cwd: path.join(ROOT, 'backend'), env: { ...process.env, PORT: String(BE_PORT) }, stdio: 'pipe' });
  be.stdout.on('data', d => process.stdout.write(`[backend] ${d}`));
  be.stderr.on('data', d => process.stderr.write(`[backend] ${d}`));

  console.log('Starting frontend (vite)...');
  const fe = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '--port', String(FE_PORT)], { cwd: path.join(ROOT, 'frontend'), stdio: 'pipe' });
  fe.stdout.on('data', d => process.stdout.write(`[frontend] ${d}`));
  fe.stderr.on('data', d => process.stderr.write(`[frontend] ${d}`));

  // wait a bit
  await new Promise(r => setTimeout(r, 6000));

  // create tunnels using tunnelmole
  let tunnelmoleModule;
  try { tunnelmoleModule = require('tunnelmole'); } catch (e) { console.error('tunnelmole not installed', e.message); process.exit(1); }
  const tm = tunnelmoleModule && (tunnelmoleModule.tunnelmole || tunnelmoleModule.default || tunnelmoleModule);
  if (!tm) { console.error('tunnelmole export not found'); process.exit(1); }
  console.log('Creating frontend tunnel...');
  const feUrl = await tm({ port: FE_PORT });
  console.log('FE URL:', feUrl);
  console.log('Creating backend tunnel...');
  const beUrl = await tm({ port: BE_PORT });
  console.log('BE URL:', beUrl + '/api/health');

  // update frontend .env
  writeEnv(path.join(ROOT, 'frontend', '.env'), `VITE_API_URL=${beUrl}/api\nVITE_GOOGLE_CLIENT_ID=\n`);

  // update backend .env CORS
  const beEnvPath = path.join(ROOT, 'backend', '.env');
  let beEnv = fs.existsSync(beEnvPath) ? fs.readFileSync(beEnvPath,'utf8') : '';
  if (beEnv.includes('CORS_ORIGIN=')) beEnv = beEnv.replace(/^CORS_ORIGIN=.*$/m, `CORS_ORIGIN=${feUrl},http://localhost:5173`);
  else beEnv += `\nCORS_ORIGIN=${feTun.url},http://localhost:5173\n`;
  writeEnv(beEnvPath, beEnv);

  // Restart backend to pick up CORS
  be.kill();
  await new Promise(r => setTimeout(r,2000));
  const be2 = spawn(process.execPath, ['server.js'], { cwd: path.join(ROOT, 'backend'), env: { ...process.env, PORT: String(BE_PORT) }, stdio: 'pipe' });
  be2.stdout.on('data', d=>process.stdout.write(`[backend] ${d}`));
  be2.stderr.on('data', d=>process.stderr.write(`[backend] ${d}`));

  console.log('\nREADY');
  console.log('Frontend:', feTun.url);
  console.log('Backend:', beTun.url + '/api/health');

  process.on('SIGINT', ()=>{ console.log('Shutting down'); fe.kill(); be2.kill(); feTun.close(); beTun.close(); process.exit(); });
}

main().catch(err=>{console.error(err); process.exit(1)});
