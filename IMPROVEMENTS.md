# Improvement list

Status: `[ ]` todo, `[x]` done. Cons are listed so each item is a conscious trade-off.

## Reliability
- [x] **Persist active orders to Postgres**: already done. Orders are saved on creation and `loadActiveOrders` reloads NEW/COOKING/READY on boot.
  Cons: extra DB reads/writes per order change; must keep DB and socket state in sync; needs a Redis adapter if ever run on multiple instances.
- [x] **Opening-hours pinger (8am-10pm Cambodia time)** via `.github/workflows/keep-alive.yml` (needs to be pushed to GitHub to start) hitting `/api/health` every ~5 min (GitHub Actions cron or Render cron; UptimeRobot can't schedule by hour).
  Cons: a workaround, not a guarantee; first request of the morning can still be a cold start; cron schedules can drift.
- [x] "Server waking up..." message (admin login retries; dashboard badge shows amber "Connecting…" instead of red Offline) and retry with backoff instead of a plain Offline badge.
  Cons: only hides the delay; aggressive retries can flood a booting server.
- [ ] Paid Render plan (always on). Cons: monthly cost.

## Security
- [x] Staff login (JWT, 12h) for admin API, sockets and the web admin/inventory pages. Enabled by setting `ADMIN_PASSWORD` on the backend.
  - [x] Flutter POS app: login screen, token saved on device, sent on the socket, and handed to the embedded admin web view. Not yet run on a real device.
  Cons: single shared password, no reset flow; token expiry means re-login every 12h.
- [x] helmet, rate limiting (API, login, per-socket orders), CORS allowlist (`ALLOWED_ORIGINS`), zod validation on orders, status updates and inventory.
  - [x] Order totals are recomputed from DB prices; unavailable/unknown items and bad quantities are rejected (falls back to submitted prices only if the DB is unreachable).
  Cons: shared restaurant Wi-Fi can trip IP rate limits; wrong CORS breaks the site.
- [-] Table tokens on QR codes: decided not needed. Cons: reprint QR codes; tokens can still be shared.

## Performance
- [x] WebP images: 673 MB of originals replaced by 18.8 MB; old .png/.jpg paths from the DB are mapped to .webp in the web app and Flutter POS. Cons: free-tier limits, third-party dependency.
- [x] Code-split admin/inventory/item pages; menu.json fallback loaded only when needed (main bundle 1.33 MB -> 560 kB). Cons: brief loading flashes, stale-chunk errors after deploys.
- [x] Menu caching as stale-while-revalidate: cached menu shows instantly, fresh copy fetched on every load. Cons: a customer can briefly see the previous menu (up to one load) before the update arrives.

## Code health
- [x] One-off backend scripts moved to `scripts/archive/backend/` (nothing deleted).
- [ ] Legacy Vue app (`legacy-vue-frontend/`): decide whether to delete.
- [x] `backend/raw-images` and `unused-images` (1.2 GB) are no longer tracked (files kept locally, still in git history). A history rewrite would be needed to shrink the .git folder itself.
- [x] Tests for order pricing and auth/login/token routes (`npm test` in `backend/`, 12 passing). [ ] Still untested: socket order flow, status transitions.
  Cons: upfront time, maintenance.
- [x] React error boundary. [ ] Sentry (needs account/DSN). Cons: free-tier limits; avoid capturing customer data.

## Features (only if needed)
- [ ] Kitchen display, call waiter, receipt printing, reports/CSV export, multi-language, KHQR/ABA payments (highest risk).

## UX / SEO / accessibility
- [x] Error boundary, aria-labels on icon-only buttons, visible keyboard focus, reduced-motion support, pinch-zoom re-enabled, Open Graph tags and Restaurant structured data (no phone/street address yet: add real ones).
- [ ] PWA (installable + offline menu). Cons: service-worker caching can serve stale prices; only worth it if staff want an installable app.
- [ ] Full accessibility audit (colour contrast, touch-target sizes, screen-reader pass).

## Receipt printing (done 2026-10)
- [x] New 58mm thermal layout in `frontend/src/utils/receipt.ts` (pure, previewable); Bluetooth/ESC-POS sending in `printer.ts`.
  Logo (`receiptLogo.ts`, regenerate with `scripts/make_receipt_logo.py`) -> bold double-height name -> tagline -> order no./date -> table -> items (wrapped, qty, unit price, bold notes) -> total + KHR -> thank-you.
  Header/footer text lives in `SHOP` at the top of `receipt.ts`. No phone, tax/VAT or Wi-Fi line yet (add if wanted).
- [x] Reprint from Analytics now passes the real order number and table (it used to print `#5e00` and `TABLE: N/A`).
- [ ] Not yet checked on the live site: do one real reprint after the Vercel deploy. Logo size/darkness may need tuning (width is `WIDTH` in the script, gap below the logo is the `40` in `logoChunks`).
- Local testing tip: the CORS allowlist rejects `localhost`, so a local dev server needs a temporary Vite proxy to the live backend (it showed "Server is waking up" forever without it).

## POS search (done)
- [x] Cashier POS search (web and Flutter) ranks exact SKU, then SKU prefix, then name prefix, then other matches (SF2 before SF20...).

## Open items / next session
- [ ] Rebuild and reinstall the Flutter APK to get the SF2 search fix (phone currently has the login + WebP build): `cd restaurant_pos && flutter build apk --release`, then `adb install -r` (adb is at `%LOCALAPPDATA%\Android\Sdk\platform-toolsdb.exe`, not on PATH).
- [ ] Render env: `ADMIN_PASSWORD` and `ALLOWED_ORIGINS` are set (verified: login required, CORS limited to the Vercel site). `LOYVERSE_API_KEY` is still invalid (Loyverse sync fails, deliberately left alone).
- [ ] Delete `legacy-vue-frontend/` (1.5 MB, only referenced by the README) when ready: `git rm -r legacy-vue-frontend` and remove the README mentions.
- [ ] Still untested: socket order flow, status transitions. Sentry, PWA, accessibility audit, history rewrite (~810 MB .git) remain optional.
- [x] Table tokens on QR codes: decided not needed.

