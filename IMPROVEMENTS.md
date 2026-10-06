# Improvement list

Status: `[ ]` todo, `[x]` done. Cons are listed so each item is a conscious trade-off.

## Reliability
- [x] **Persist active orders to Postgres**: already done. Orders are saved on creation and `loadActiveOrders` reloads NEW/COOKING/READY on boot.
  Cons: extra DB reads/writes per order change; must keep DB and socket state in sync; needs a Redis adapter if ever run on multiple instances.
- [x] **Opening-hours pinger (8am-10pm Cambodia time)** via `.github/workflows/keep-alive.yml` (needs to be pushed to GitHub to start) hitting `/api/health` every ~5 min (GitHub Actions cron or Render cron; UptimeRobot can't schedule by hour).
  Cons: a workaround, not a guarantee; first request of the morning can still be a cold start; cron schedules can drift.
- [ ] "Server waking up..." message and retry with backoff instead of a plain Offline badge.
  Cons: only hides the delay; aggressive retries can flood a booting server.
- [ ] Paid Render plan (always on). Cons: monthly cost.

## Security
- [x] Staff login (JWT, 12h) for admin API, sockets and the web admin/inventory pages. Enabled by setting `ADMIN_PASSWORD` on the backend.
  - [x] Flutter POS app: login screen, token saved on device, sent on the socket, and handed to the embedded admin web view. Not yet run on a real device.
  Cons: single shared password, no reset flow; token expiry means re-login every 12h.
- [x] helmet, rate limiting (API, login, per-socket orders), CORS allowlist (`ALLOWED_ORIGINS`), zod validation on orders, status updates and inventory.
  - [x] Order totals are recomputed from DB prices; unavailable/unknown items and bad quantities are rejected (falls back to submitted prices only if the DB is unreachable).
  Cons: shared restaurant Wi-Fi can trip IP rate limits; wrong CORS breaks the site.
- [ ] Table tokens on QR codes. Cons: reprint QR codes; tokens can still be shared.

## Performance
- [ ] WebP images (conversion script in progress locally; menu images already lazy-loaded). Cons: free-tier limits, third-party dependency.
- [x] Code-split admin/inventory/item pages; menu.json fallback loaded only when needed (main bundle 1.33 MB -> 560 kB). Cons: brief loading flashes, stale-chunk errors after deploys.
- [x] Menu caching as stale-while-revalidate: cached menu shows instantly, fresh copy fetched on every load. Cons: a customer can briefly see the previous menu (up to one load) before the update arrives.

## Code health
- [x] One-off backend scripts moved to `scripts/archive/backend/` (nothing deleted).
- [ ] Legacy Vue app (`legacy-vue-frontend/`): decide whether to delete.
- [ ] `backend/raw-images` is 1.2 GB / ~700 files tracked in git. Moving them out (Cloudinary/external storage) shrinks clones, but needs a history rewrite to reclaim space; decide before doing it.
- [x] Tests for order pricing (`npm test` in `backend/`, 7 passing). [ ] Still untested: socket order flow, status transitions, auth routes.
  Cons: upfront time, maintenance.
- [x] React error boundary. [ ] Sentry (needs account/DSN). Cons: free-tier limits; avoid capturing customer data.

## Features (only if needed)
- [ ] Kitchen display, call waiter, receipt printing, reports/CSV export, multi-language, KHQR/ABA payments (highest risk).

## UX / SEO / accessibility
- [x] Error boundary, aria-labels on icon-only buttons, visible keyboard focus, reduced-motion support, pinch-zoom re-enabled, Open Graph tags and Restaurant structured data (no phone/street address yet: add real ones).
- [ ] PWA (installable + offline menu). Cons: service-worker caching can serve stale prices; only worth it if staff want an installable app.
- [ ] Full accessibility audit (colour contrast, touch-target sizes, screen-reader pass).
