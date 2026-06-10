// Simple tunnel launcher — just starts localtunnel for both ports and prints URLs
const localtunnel = require('localtunnel');

(async () => {
  try {
    const [fe, be] = await Promise.all([
      localtunnel({ port: 5173 }),
      localtunnel({ port: 5000 }),
    ]);
    console.log('FRONTEND_URL=' + fe.url);
    console.log('BACKEND_URL=' + be.url);
  } catch (err) {
    console.error('Tunnel error:', err.message);
    process.exit(1);
  }
})();
