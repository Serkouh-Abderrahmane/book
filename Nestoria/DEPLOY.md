# Deploy — Nestoria

## URLs

| Service | URL |
|---------|-----|
| Frontend | https://book-orcin-gamma.vercel.app |
| Backend | https://nestoria-api.onrender.com |
| Backend health | https://nestoria-api.onrender.com/api/health |
| Database | `db.ywyuhcittkpmfeeuuvjy.supabase.co:5432` |

---

## Step 1: Run SQL on Supabase

Go to **Supabase Dashboard → SQL Editor** and run these files in order:

1. `database/001_schema.sql`
2. `database/002_triggers.sql`
3. `database/006_saved_hotels.sql`
4. `database/007_hotel_coords.sql`
5. `database/008_room_extras.sql`
6. `database/004_seed.sql`
7. `database/009_admin_seed.sql`

**Or skip this** — Render's `init-db.js` will auto-run them on first deploy if the database is empty.

---

## Step 2: Deploy Backend to Render

1. Go to https://render.com → **New Web Service**
2. Connect your GitHub repo (`Serkouh-Abderrahmane/book`)
3. Settings:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add these environment variables:

```
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://book-orcin-gamma.vercel.app,http://localhost:5173
DB_HOST=db.ywyuhcittkpmfeeuuvjy.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=Serkouh_2002
DB_SSL=true
JWT_SECRET=2xxhXmJApQ/BLQ3BAsD6MpdOyiqZQ2G3QUrUymCCwlCTBR6mNffRuOAuWe2E70YS
JWT_EXPIRES_IN=7d
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET_NAME=hotel-images
GOOGLE_CLIENT_ID=
```

5. Click **Create Web Service**
6. Wait for deploy, then visit `https://nestoria-api.onrender.com/api/health` — should show `{ "ok": true }`

---

## Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com → **Add New → Project**
2. Import your GitHub repo (`Serkouh-Abderrahmane/book`)
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add environment variable:
   - `VITE_API_URL` = `https://nestoria-api.onrender.com/api`
5. Click **Deploy**

---

## Verify

```bash
# Health
curl https://nestoria-api.onrender.com/api/health

# Customer login
curl -X POST https://nestoria-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo1234","role":"customer"}'

# Admin login
curl -X POST https://nestoria-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin1234","role":"admin"}'
```

Then open `https://book-orcin-gamma.vercel.app` and log in.

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | `demo@example.com` | `Demo1234` |
| Host | `vikram@marigold.in` | `password123` |
| Admin | `admin@example.com` | `Admin1234` |
