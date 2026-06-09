# Deploying Nestoria to Production

## Prerequisites

1. **Supabase** account — for PostgreSQL database
2. **Vercel** account — for frontend hosting  
3. **Render** account — for backend API hosting
4. **GitHub** repository with this code pushed to a branch

---

## Step 1: Set up Supabase (Database)

1. Go to https://supabase.com and create a new project
2. After creation, go to **Project Settings → Database**
3. Copy the **Connection string** (URI format)
4. Go to **SQL Editor** and run the following files in order:
   - `database/001_schema.sql`
   - `database/002_triggers.sql`
   - `database/006_saved_hotels.sql`
   - `database/007_hotel_coords.sql`
   - `database/008_room_extras.sql`
   - `database/004_seed.sql`
   - `database/009_admin_seed.sql`

   **Or**: Let Render run `init-db.js` on first deploy (see Step 3).

5. Note down these values for Render:
   - `DB_HOST` (from connection string)
   - `DB_PORT` (usually `5432`, or `6543` for connection pooler)
   - `DB_NAME` (usually `postgres`)
   - `DB_USER` (from connection string)
   - `DB_PASSWORD` (from connection string)
   - `DB_SSL=true`

---

## Step 2: Deploy Frontend to Vercel

1. Push your code to a GitHub repository
2. Go to https://vercel.com and import your GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add environment variable:
   - `VITE_API_URL` = `https://your-render-app.onrender.com/api`
5. Click **Deploy**
6. Note your Vercel URL: `https://your-app.vercel.app`

---

## Step 3: Deploy Backend to Render

1. Go to https://render.com and create a new **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables (use values from Step 1):

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `CORS_ORIGIN` | `https://your-app.vercel.app` |
   | `DB_HOST` | *(from Supabase)* |
   | `DB_PORT` | `5432` |
   | `DB_NAME` | `postgres` |
   | `DB_USER` | *(from Supabase)* |
   | `DB_PASSWORD` | *(from Supabase)* |
   | `DB_SSL` | `true` |
   | `JWT_SECRET` | *(generate: `openssl rand -base64 48`)* |
   | `JWT_EXPIRES_IN` | `7d` |
   | `SUPABASE_URL` | *(leave blank if not using storage)* |
   | `SUPABASE_SERVICE_ROLE_KEY` | *(leave blank)* |
   | `SUPABASE_BUCKET_NAME` | `hotel-images` |
   | `GOOGLE_CLIENT_ID` | *(leave blank if not using)* |

5. Click **Create Web Service**
6. Wait for the deploy to finish
7. Verify: visit `https://your-render-app.onrender.com/api/health`

---

## Step 4: Verify

### Health check
```
https://your-render-app.onrender.com/api/health
```
Expected: `{ "ok": true, "ts": "..." }`

### Login test (via curl or browser dev tools)
```bash
# User login
curl -X POST https://your-render-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo1234","role":"customer"}'

# Admin login
curl -X POST https://your-render-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin1234","role":"admin"}'
```

---

## Demo Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **User** (customer) | `demo@example.com` | `Demo1234` | Full booking flow |
| **User** (customer) | `customer1@nestoria.dev` | `password123` | Mock customer |
| **Host** | `vikram@marigold.in` | `password123` | Property owner |
| **Host** | `priya@casapamparo.in` | `password123` | Property owner |
| **Host** | `arjun@cardamom.in` | `password123` | Property owner |
| **Admin** | `admin@example.com` | `Admin1234` | System admin |

---

## URLs After Deployment

- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-render-app.onrender.com`
- **Backend Health**: `https://your-render-app.onrender.com/api/health`
- **Database**: Supabase PostgreSQL (connection string in Render env vars)

---

## Manual Steps Required (no automation possible)

1. ✅ All code changes done — CORS, admin role, seeds, deployment configs
2. [ ] Push code to GitHub
3. [ ] Create Supabase project and copy DB credentials
4. [ ] Log in to Vercel, import repo, set env var, deploy
5. [ ] Log in to Render, create Web Service, set env vars, deploy
6. [ ] Run SQL seed files in Supabase SQL Editor (or let init-db handle it)
7. [ ] Update `CORS_ORIGIN` on Render after Vercel URL is known
8. [ ] Update `VITE_API_URL` on Vercel after Render URL is known
