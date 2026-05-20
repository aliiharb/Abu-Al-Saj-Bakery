# Abu Al-Saj Bakery

Full-stack menu and admin dashboard for Abu Al-Saj, built with:

- React + Vite
- TailwindCSS
- Framer Motion
- Node.js + Express
- PostgreSQL on Supabase
- Supabase Storage
- JWT admin login

## Structure

```txt
client/      React public menu and admin dashboard
server/      Express API and Supabase integration
server/db/   SQL schema and seed data
.env         Local secrets, ignored by Git
```

## Local Setup

Install everything:

```bash
npm run install:all
```

Create `.env`:

```bash
cp .env.example .env
```

Fill the values:

```env
DATABASE_URL=your_supabase_postgres_connection_string
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
PORT=5000
CLIENT_ORIGIN=http://localhost:5173,https://your-vercel-app.vercel.app
```

For production, replace the plain admin password with a bcrypt hash:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('your-password', 10).then(console.log)"
```

Create a public Supabase Storage bucket named:

```txt
menu-images
```

Run the schema and seed:

```bash
psql "$DATABASE_URL" -f server/db/schema.sql
```

On Windows PowerShell:

```powershell
psql $env:DATABASE_URL -f server/db/schema.sql
```

Start both apps:

```bash
npm run dev
```

Local URLs:

```txt
Public menu: http://localhost:5173
Admin:       http://localhost:5173/admin
API:         http://localhost:5000
```

Default local admin login:

```txt
username: admin
password: admin
```

## API Routes

```txt
POST   /api/auth/login
GET    /api/categories
GET    /api/items
POST   /api/items
PUT    /api/items/:id
DELETE /api/items/:id
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
POST   /api/upload
```

Write routes require:

```txt
Authorization: Bearer <token>
```

## Development Fallback

If Supabase is unavailable, the API uses the seeded menu in memory so the dashboard still works locally. Changes made in fallback mode reset when the server restarts.

Image uploads also fall back to temporary data URLs when Supabase Storage is not configured. Use real Supabase credentials for production.

## GitHub

This repo is safe to push after checking that `.env` is not staged:

```bash
git status --short
```

Only `.env.example` should be committed, never `.env`.

## Free Hosting

Recommended free setup:

```txt
Frontend: Vercel, root directory client
Backend:  Render Web Service, root directory server
Database: Supabase Free project
Storage:  Supabase public bucket menu-images
```

Frontend environment variable:

```txt
VITE_API_URL=https://your-render-api.onrender.com
```

Backend environment variables:

```txt
DATABASE_URL=your_supabase_pooler_or_direct_connection_url
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=long_random_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_bcrypt_hash_or_password
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
```

Do not set `PORT` on Render. Render supplies it automatically.
