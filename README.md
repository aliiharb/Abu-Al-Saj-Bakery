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

client/      React public menu and admin dashboard
server/      Express API and Supabase integration
server/db/   SQL schema and seed data



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
JWT_SECRET=long_random_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_bcrypt_hash_or_password
PORT=5000
CLIENT_ORIGIN=http://localhost:5173,https://your-netlify-site.netlify.app
VITE_API_URL=
VITE_WHATSAPP_PHONE=961XXXXXXXX
```

`VITE_WHATSAPP_PHONE` is used by the public cart checkout. Use international format without the `+` sign, for example `96170123456`.

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

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so local frontend calls work with an empty `VITE_API_URL`. You can also create `client/.env` with this value if you prefer direct local API calls:

```env
VITE_API_URL=http://localhost:5000
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

## Netlify + Supabase Deployment

This project deploys frontend and backend together on Netlify:

```txt
Frontend: Netlify static build from client/
Backend:  Netlify Functions from netlify/functions/
Database: Supabase PostgreSQL
Storage:  Supabase public bucket menu-images
```

Netlify build settings:

```txt
Base directory: repository root
Build command: npm run install:all && npm --prefix client run build
Publish directory: client/dist
Functions directory: netlify/functions
Node version: 20
```

Netlify environment variables:

```txt
DATABASE_URL=your_supabase_postgres_connection_string
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=long_random_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_bcrypt_hash_or_password
CLIENT_ORIGIN=https://your-netlify-site.netlify.app
VITE_API_URL=
VITE_WHATSAPP_PHONE=961XXXXXXXX
```

`VITE_API_URL` can be empty on Netlify because `/api/*` is redirected to the Netlify Function on the same domain. Keep `SUPABASE_SERVICE_KEY`, `DATABASE_URL`, `JWT_SECRET`, and admin credentials only in local `.env` files or Netlify environment variables; never commit real secret values.
Set `VITE_WHATSAPP_PHONE` in Netlify with the bakery WhatsApp number in international format without `+`, for example `96170123456`.
