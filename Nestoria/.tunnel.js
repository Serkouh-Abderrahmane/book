const lt = require('localtunnel');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const fe = await lt({ port: 5173 });
    const be = await lt({ port: 5000 });
    const txt = 'FRONTEND_URL=' + fe.url + '\nBACKEND_URL=' + be.url + '\n';
    fs.writeFileSync(path.join(__dirname, '.tunnel-urls.txt'), txt);
    console.log('Tunnels active:');
    console.log('  Frontend: ' + fe.url);
    console.log('  Backend:  ' + be.url);
  } catch (e) {
    console.error('Tunnel error:', e.message);
    process.exit(1);
  }
})();
