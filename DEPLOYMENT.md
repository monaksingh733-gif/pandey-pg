# 🚀 PANDEY PG — Cloud Deployment & Database Guide

This guide explains how to deploy **PANDEY PG** permanently to the cloud for free, with 24/7 uptime and a live PostgreSQL database.

---

## 1. 🗄️ Connect Free Cloud PostgreSQL Database (Neon or Supabase)

Your project is built with **Drizzle ORM** and supports any PostgreSQL connection string:

### Step 1: Create Free Database
1. Go to **[Neon.tech](https://neon.tech)** (Recommended — 100% free, serverless Postgres) or **[Supabase.com](https://supabase.com)**.
2. Create a new free project named `pandey-pg`.
3. Copy your connection string. It will look like:
   ```text
   postgresql://neondb_owner:xyz@ep-cold-shadow-1234.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Add to `.env.local`
Paste the connection string in your `.env.local`:
```env
DATABASE_URL="postgresql://neondb_owner:xyz@...neon.tech/neondb?sslmode=require"
```
*(If left blank, the app will run in high-speed in-memory store mode).*

---

## 2. 🌐 Deploy to Vercel (100% Free 24/7 Live Website)

### Option A: Via Vercel CLI (Fastest)
In your project terminal, run:
```bash
npx vercel
```
1. Press `Enter` to confirm project setup.
2. Link to your Vercel account.
3. When asked for environment variables, add:
   - `DATABASE_URL` (your Neon Postgres string)
   - `WARDEN_PIN` = `9548`
4. Run `npx vercel --prod` to deploy to production!

### Option B: Via GitHub
1. Push this project to GitHub.
2. Go to **[vercel.com](https://vercel.com)** ➔ Import your GitHub repository.
3. Under **Environment Variables**, add `DATABASE_URL` and `WARDEN_PIN`.
4. Click **Deploy**. Vercel will give you a permanent live URL (e.g., `https://pandey-pg.vercel.app`)!

---

## 3. 🛡️ Secret Portals & URLs

Once deployed, your permanent live URLs will be:

| Feature | URL Path | Description |
| :--- | :--- | :--- |
| **Main Website** | `/` | Luxury PG landing page, room pricing, 360° inspector & booking flow |
| **Resident Portal** | `/resident` | Daily food menu, dinner skip attendance, complaints & gate passes |
| **Warden Console** | `/admin` | Bed occupancy map, bookings, complaints, gate passes & electricity biller |
| **Digital Pass** | `/pass/[code]` | Printable resident check-in pass & QR verification |

**Default Warden Security PIN:** `9548` *(or `1234`)*
