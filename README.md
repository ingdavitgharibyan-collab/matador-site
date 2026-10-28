# Matador — shawarma · Angus burgers · BBQ

Restaurant site with an editable menu, ordering by WhatsApp / Telegram / phone, three languages (հայ / рус / eng).

## Features
- **Menu as a bullfight poster**: one list with a sticky category bar (scrollspy; the red muleta sweeps across on a
  jump), search, filters (spicy / no pork / vegetarian), dish sheet with choices (bread, sauce, "without…", paid
  extras), pork, vegetarian and allergen labels. Every dish is readable without JavaScript.
- **Order ticket (cart)**: kept in the browser; delivery zones (fee, minimum order, time), pickup or table;
  free-delivery progress and a drink offer;
  sends a ready-made order to WhatsApp (prefilled), Telegram (copied + opens the chat) or by phone; links to
  delivery services (Yandex Eats, Wolt, Glovo, Menu.am — edit in admin).
- **Live open / closed status** in Yerevan time (overnight shifts, 24 h days, holidays), weekly hours with the
  current shift highlighted. Orders are blocked when closed, in the last N minutes before closing, or when paused
  from the admin; calling stays possible.
- **Map on request** (no third-party load until asked) + Google / Yandex directions.
- **Printable QR cards**: `/hy/qr` (general) and `/hy/qr?table=5` (per table: the ticket opens in "Table 5" mode,
  no address or delivery fee). Same for `/ru` and `/en`.
- **SEO**: per-language metadata and hreflang, schema.org Restaurant + Menu, sitemap, robots, OG image.
- **Orders are recorded** before any chat opens: number per business day (`M-2810-007`), prices recomputed on the
  server, statuses (new → accepted → cooking → ready/out → delivered), a status page for the guest (`/hy/o/<token>`),
  anti-spam (honeypot, timing, per-IP/phone limits).
- **Kitchen bot (Telegram)**: every order goes to the kitchen group with Accept / Reject / Ready / Out / Delivered
  buttons; `/pause`, `/resume`, `/stop` (stop-list buttons), `/back`, `/today`.
- **Admin** at `/admin` (Payload), in Armenian, Russian or English: today's panel (orders, revenue, waiting, top
  dishes), orders, dishes (choices, diet flags, allergens, photo, stop-list), categories, staff with roles
  (owner / manager / kitchen — the kitchen can only switch availability), settings with weekday rows, holidays,
  pause, payment methods, delivery zones; version history for dishes and settings.
- **Motion**: GSAP + ScrollTrigger + SplitText, Lenis smooth scroll; all off under `prefers-reduced-motion`.

## Run locally
```bash
cp .env.example .env        # set PAYLOAD_SECRET; NEXT_PUBLIC_SERVER_URL=http://localhost:3000 for local work
npm install
npm run dev                 # http://localhost:3000 → /hy
```
First boot creates `matador.db` and seeds the **sample** menu. In development `/admin` lets you create the first user.

## Test
```bash
npm run test:unit                          # hours, phone numbers, order message, cart storage
npm run build:local && npm run test:e2e    # ordering flows, closed hours, Telegram fallback, a11y (axe), first screen
```
CI (`.github/workflows/ci.yml`) runs typecheck, lint, unit, the build guard, the production build and e2e on every PR.

## Deploy (one small VPS, Docker)
1. `.env` on the server: `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL=https://<your domain>` (the build refuses anything else),
   `SERVER_ALIASES=https://www.<your domain>`, and for the first start `ADMIN_EMAIL` + `ADMIN_PASSWORD`
   (in production the server will not start without a user, so nobody can claim `/admin` first).
2. `docker compose up -d --build` — the database and photos live on the `matador-data` volume (`/data`).
3. Put Caddy (or nginx) in front for HTTPS; all hosts redirect to `NEXT_PUBLIC_SERVER_URL`.
4. Uptime: point a monitor at `https://<domain>/health` (200 = app and database answer).
5. Backups: `docker compose exec site node scripts/backup.mjs` nightly (cron), then copy `/data/backups` off the
   server. Rehearse `scripts/restore.md` once before launch.
6. Kitchen bot: create a bot with @BotFather, add it to the kitchen group, put `TELEGRAM_BOT_TOKEN`,
   `TELEGRAM_CHAT_ID` (the group id) and a random `TELEGRAM_WEBHOOK_SECRET` in `.env`, then
   `node --env-file=.env scripts/telegram-setup.mjs`.
7. Password reset: set `SMTP_*` for e-mail resets, or run `npx tsx scripts/reset-password.ts <email> <new password>`.

Changing collections: `npm run payload migrate:create <name>`; migrations run on boot.

## Before launch
Replace in /admin: every dish, price and weight (sample), address + map coordinates, phone, WhatsApp number,
Telegram username, social links, hours and holidays, payment methods, delivery partner store links; upload real dish
photos (the drawings are stand-ins).
