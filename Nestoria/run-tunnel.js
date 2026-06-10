import { createTunnel } from 'tunnelmole';

const port = parseInt(process.argv[2] || '5173', 10);

try {
  const tunnel = await createTunnel({ port });
  console.log(`TUNNEL_URL=${tunnel.url}`);
  console.log(`TUNNEL_PORT=${port}`);

  process.on('SIGINT', () => { process.exit(0); });
  process.on('SIGTERM', () => { process.exit(0); });
} catch (err) {
  console.error('TUNNEL_ERROR=' + err.message);
  process.exit(1);
}
