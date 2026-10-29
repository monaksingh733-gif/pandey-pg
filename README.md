# PANDEY PG — Luxury PG & Co-Living Platform

A luxury Paying Guest (PG) and co-living booking platform built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Drizzle ORM** with **PostgreSQL** support.

Designed for students and working professionals seeking premium accommodations with 3-time homely meals, zero brokerage, 24/7 security, and transparent sub-meter billing.

---

## 🏗️ Architecture & Backend Data Pipeline

The backend is built around a centralized, domain-driven **`DataPipeline`** service (`src/lib/dataPipeline.ts`) that transparently supports two runtime modes:
1. **Production PostgreSQL Mode**: Enabled when `DATABASE_URL` is set in `.env.local`. Utilizes connection pooling via `pg`, atomic transactions, and self-healing table initialization (`src/db/initDb.ts`).
2. **Zero-Config In-Memory Mode**: Default fallback when no database is configured, allowing instant local testing and development with high-speed memory arrays (`src/lib/memoryStore.ts`).

### Database Relational Schema (`src/db/schema.ts`)
- **`beds`**: 84 physical beds across 3 floors and 3 room tiers (Single, Double, Triple) with live occupancy status.
- **`bookings`**: Full resident KYC records, quotes, meal plans, emergency contacts, and token/full payment states.
- **`rent_records`**: Monthly rent ledger, sub-meter electricity readings ($\text{units} \times ₹8.5/\text{unit}$), overdue tracking, and payment receipts.
- **`maintenance_tickets`**: Resident complaint ticketing system with category, urgency, and lifecycle status (`open` → `in_progress` → `resolved`).
- **`gate_passes`**: Digital passes for late entries and night-outs with automated warden notifications.
- **`meal_skips`**: Daily resident dinner attendance tracking to prevent kitchen food waste.
- **`tour_requests`**: Scheduled in-person or video property walkthroughs.
- **`enquiries`**: Lead capture and callback requests.

---

## ✨ Features

- **Luxury Branding & Visual Design**: Rich espresso and warm gold `#C89D54` aesthetic, Playfair Display typography, responsive glassmorphism.
- **Interactive Room & Bed Inventory**: Real-time bed selector across 3 floors with AC/Non-AC and meal plan filters.
- **Real-Time Cost Calculator**: Transparent comparison between PG all-inclusive living vs. independent flat expenses.
- **Booking Engine & Digital Passes**:
  - Secure room configuration and atomic bed lock.
  - Printable boarding-pass style resident check-in card at `/pass/[code]`.
  - Automatic invoice registration in the rent ledger.
- **Resident Life Portal (`/resident`)**:
  - Access via Booking Code or 10-digit mobile number.
  - View daily and weekly mess menu.
  - One-click dinner skip toggle for tonight.
  - Lodge maintenance service requests.
  - Generate digital gate passes.
- **Warden Admin Console (`/admin`)**:
  - Protected with Warden PIN (`9548` or `1234`).
  - Real-time occupancy analytics and revenue metrics.
  - Rent ledger with sub-meter electricity billing and payment recording.
  - Bed status management and automatic bed release upon vacating.
- **WhatsApp Automation**: Pre-filled communication templates and optional Meta WhatsApp Cloud API integration.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. (Optional) Database Setup
To connect PostgreSQL (e.g. Neon, Supabase, or local):
```bash
cp .env.example .env.local
```
Add your connection string:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pandey_pg"
```
The application will automatically detect PostgreSQL, create all required tables, and seed initial inventory on start!

To manually manage migrations via Drizzle Kit:
```bash
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate SQL migration files
```

---

## 📁 Key Routes

### User & Resident Routes
- `/` — Main Homepage & Booking Flow
- `/resident` — Resident Life Portal (Mess menu, dinner skip, complaints, gate pass)
- `/admin` — Warden Management Console (Occupancy, rent ledger, sub-meters)
- `/pass/[code]` — Official Resident Booking Pass & QR verification

### REST API Endpoints
- `GET /api/availability` — Live inventory and bed counts
- `GET, POST /api/bookings` — Booking creation and live booking counter
- `GET /api/bookings/[code]` — Direct booking pass query
- `POST /api/payments/verify` — Payment verification and rent ledger sync
- `GET, POST /api/resident/portal` — Resident profile lookup, tickets, gate passes, and dinner skip toggle
- `GET /api/admin/overview` — Warden consolidated operational statistics
- `POST /api/admin/action` — Admin operations (bed toggle, booking status, tickets, rent payments, sub-meter readings)
- `POST /api/tours` — Schedule property visits
- `POST /api/enquiries` — Resident inquiry submissions
- `POST /api/auth/google` — Google OAuth ID token verification
- `POST /api/notifications/whatsapp` — WhatsApp notifications & Meta Cloud API dispatch
- `GET /api/health` — Pipeline and database connectivity health check
