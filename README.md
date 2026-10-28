# Matador — shawarma · Angus burgers · BBQ

Restaurant site with an editable menu, ordering by WhatsApp / Telegram / phone, three languages (հայ / рус / eng).

## Features
- **Menu as a bullfight poster**: categories switch with a sweeping red muleta; dish details dialog with quantity.
- **Order ticket (cart)**: kept in the browser, delivery or pickup, delivery fee and free-delivery threshold,
  sends a ready-made order to WhatsApp (prefilled), Telegram (copied + opens the chat) or by phone; links to
  delivery services (Yandex Eats, Wolt, Glovo, Menu.am — edit in admin).
- **Live open / closed status** in Yerevan time, weekly hours with today highlighted.
- **Map on request** (no third-party load until asked) + Google / Yandex directions.
- **Printable QR table card**: `/hy/qr`, `/ru/qr`, `/en/qr`.
- **SEO**: per-language metadata and hreflang, schema.org Restaurant + Menu, sitemap, robots, OG image.
- **Admin** at `/admin` (Payload): dishes (photo, price, weight, spicy, house pick, availability), categories,
  contacts, hours, delivery settings — each text in three languages.
- **Motion**: GSAP + ScrollTrigger + SplitText, Lenis smooth scroll; all off under `prefers-reduced-motion`.

## Run
```bash
cp .env.example .env        # set PAYLOAD_SECRET, NEXT_PUBLIC_SERVER_URL
npm install
npm run dev                 # http://localhost:3000 → /hy
```
First boot creates `matador.db` and seeds the **sample** menu. Open `/admin` to create the first user
(or set `ADMIN_EMAIL` / `ADMIN_PASSWORD` before the first boot).

Production: `npm run build && npm run start` (migrations in `src/migrations` run on boot). SQLite needs a
persistent disk and one instance; for multi-instance hosting switch to `@payloadcms/db-postgres`.

## Before launch
Replace in /admin: every dish, price and weight (sample), address + map coordinates, phone, WhatsApp number,
Telegram username, social links, hours, delivery partner URLs; upload real dish photos (the drawings are stand-ins).
