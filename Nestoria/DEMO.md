# Demo — Chi Vinh Land

Start the full demo environment with a single command.

## Quick Start

```bash
cd Nestoria
npm run demo
```

The script will:
1. Start the backend (port 5000)
2. Start the frontend (port 5173)
3. Start a combined proxy (port 8000)
4. Create a public Tunnelmole tunnel
5. Run health checks
6. Print the public URL

## Public URL

Once the script finishes, look for:

```
=== PUBLIC URL ===
https://xxx.tunnelmole.com
==================
```

Give this URL to your client.

## Stop

Press `Ctrl + C` in the terminal window to stop all processes.

## What the script checks

- Backend API health
- Hotels exist with proper names (no `removed-*` or slug-like values)
- Vietnamese listings are present
- Public tunnel is accessible

## Requirements

- Node.js 18+
- PostgreSQL running locally
- Database seeded (`npm run init-db` in the backend directory)
- Tunnelmole installed (`npm install` at the Nestoria root)

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Port already in use | Kill the existing process or change the port |
| Backend won't start | Check PostgreSQL is running and seeded |
| Tunnelmole fails | Run `npm install` in the Nestoria root directory |
| No public URL | Check the tmole terminal window for the URL |
