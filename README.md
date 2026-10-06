# Restaurant POS

A restaurant point-of-sale and ordering platform. Customers place orders by scanning a table QR code, staff manage live orders and inventory from an admin dashboard, and a Flutter POS app provides a dedicated interface for front-of-house use. Orders and menu data can sync with an external Loyverse POS account, and updates propagate to connected clients in real time over WebSockets.

## Tech Stack

**Backend** (`backend/`)
- Node.js with TypeScript, run via `tsx`
- Express 5 for the HTTP API
- Socket.IO for real-time order and status updates
- Prisma ORM with PostgreSQL
- Axios-based integration with the Loyverse API for menu/order sync
- Sharp for image processing

**Frontend** (`frontend/`)
- React 19 with TypeScript, built with Vite
- Tailwind CSS for styling
- React Router for navigation
- TanStack Query for data fetching
- Socket.IO client for live updates
- Recharts for analytics charts, Cloudinary SDK for image delivery, qrcode.react for table QR codes

**Mobile/Desktop POS app** (`restaurant_pos/`)
- Flutter (Dart), using the Provider package for state management
- Talks to the same backend over HTTP and Socket.IO
- Includes a WebView-based view alongside native POS/order screens

**Legacy frontend** (`legacy-vue-frontend/`)
- An earlier Vue 3 + Vite implementation of the customer-facing app, kept for reference and no longer the active frontend

**Utility scripts** (`scripts/`, plus one-off scripts in `backend/`)
- Node scripts for one-time data/image migration tasks (linking menu images, deduplicating items, converting images to WebP, syncing with Loyverse, etc.)

## Project Structure

```
backend/            Express API, Prisma schema, Loyverse integration, DB scripts
  src/routes/       menu, inventory, and analytics endpoints
  src/socket/       Socket.IO setup and in-memory active order state
  prisma/           schema.prisma and local dev database
frontend/           React customer app + admin/staff dashboard
  src/pages/        Landing, customer ordering, menu item, admin dashboard, inventory dashboard
  src/components/admin/  Live orders, menu management, analytics, admin ordering
  src/context/      Cart and Socket React contexts
restaurant_pos/     Flutter POS app (POS view, orders view, admin dashboard view)
legacy-vue-frontend/ Superseded Vue 3 frontend (reference only)
scripts/            Standalone Node scripts for data/image maintenance
```

## Data Model

The Prisma schema (`backend/prisma/schema.prisma`) defines: `User` (staff accounts with roles such as WAITER), `Table`, `Category`, `MenuItem` (with modifiers and optional Loyverse linkage), `Order` and `OrderItem`, `InventoryItem`, and `QRScanLog` for tracking table QR scans.

## Features

- QR-code-based customer ordering per table (`CustomerOrdering`, `MenuItemPage`)
- Live order tracking for staff, pushed via Socket.IO (`AdminLiveOrders`)
- Menu management, including categories, items, modifiers, availability, and images (`AdminMenuManagement`)
- Inventory tracking with low-stock warnings (`InventoryDashboard`, `InventoryItem`)
- Sales/order analytics (`AdminAnalytics`, `backend/src/routes/analytics.ts`)
- Two-way sync with Loyverse POS for menu items and orders (`backend/loyverse.ts`)
- A native Flutter POS app for staff terminals, sharing the same backend

## Prerequisites

- Node.js 18+ and npm
- A PostgreSQL database (for `DATABASE_URL` / `DIRECT_URL`)
- Flutter SDK (only if working on `restaurant_pos/`)
- Optional: a Loyverse account and API key if you want live POS sync

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```
DATABASE_URL=<your postgres connection string>
DIRECT_URL=<your postgres direct connection string>
LOYVERSE_API_KEY=<your Loyverse API key, optional>
PORT=5000
```

Apply the Prisma schema and generate the client:

```bash
npx prisma generate
npx prisma db push
```

Run the API in development mode:

```bash
npm run dev
```

The server starts on `http://localhost:5000` (or the port set in `PORT`) and exposes a health check at `/api/health`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

This starts the Vite dev server. Confirm the API base URL used by the frontend (see `frontend/src`) points at your running backend.

### 3. Flutter POS app (optional)

```bash
cd restaurant_pos
flutter pub get
flutter run
```

## Notes

- `backend/prisma/dev.db` is a local SQLite artifact left over from earlier development; the schema itself is configured for PostgreSQL.
- `backend/seed.ts`, `backend/seed-inventory.ts` and `backend/reset-orders.ts` are maintenance utilities, not part of the running application. The earlier one-off migration scripts (image linking, de-duplication, menu fixes) are archived in `scripts/archive/backend/` for reference; their relative paths assume they were run from `backend/`, so they may need adjusting before reuse. The scripts under `scripts/` are likewise one-off data/image utilities.
