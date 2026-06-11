// Create tunnels for frontend and backend using tunnelmole and update .env files
const fs = require('fs');
const path = require('path');

async function main(){
  let tm;
  try { tm = require('tunnelmole'); } catch (e) { console.error('tunnelmole missing', e.message); process.exit(1); }
  const tunnel = tm.tunnelmole || tm.default || tm;
  if (!tunnel) { console.error('tunnelmole export not found'); process.exit(1); }

  const FE_PORT = 5173;
  const BE_PORT = 5000;
  console.log('Creating frontend tunnel for port', FE_PORT);
  const feUrl = await tunnel({ port: FE_PORT });
  console.log('Frontend URL:', feUrl);
  console.log('Creating backend tunnel for port', BE_PORT);
  const beUrl = await tunnel({ port: BE_PORT });
  console.log('Backend URL:', beUrl + '/api/health');

  // update frontend .env
  fs.writeFileSync(path.join(__dirname,'frontend','.env'), `VITE_API_URL=${beUrl}/api\nVITE_GOOGLE_CLIENT_ID=\n`, 'utf8');
  // update backend .env CORS
  const beEnvPath = path.join(__dirname,'backend','.env');
  let beEnv = fs.existsSync(beEnvPath) ? fs.readFileSync(beEnvPath,'utf8') : '';
  if (beEnv.includes('CORS_ORIGIN=')) beEnv = beEnv.replace(/^CORS_ORIGIN=.*$/m, `CORS_ORIGIN=${feUrl},http://localhost:5173`);
  else beEnv += `\nCORS_ORIGIN=${feUrl},http://localhost:5173\n`;
  fs.writeFileSync(beEnvPath, beEnv, 'utf8');

  console.log('\nTunnels created. Frontend:', feUrl, '\nBackend:', beUrl + '/api/health');
  console.log('Note: Restart backend to pick up CORS change if needed.');
}

main().catch(err=>{ console.error(err); process.exit(1); });
