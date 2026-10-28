# Matador site

Next.js 16 (App Router) + Payload CMS 3 (SQLite) + GSAP/Lenis. Read `node_modules/next/dist/docs/` before using
Next APIs from memory: `middleware` is `proxy` (src/proxy.ts), `params` are async, `PageProps`/`LayoutProps` come from `next typegen`.

## Design skills (in `.claude/skills/`)
Use them for any UI work:
- `frontend-design` (Anthropic): art direction, the two-pass design plan.
- `taste-skill` (Leonxlnx): anti-slop house rules, section blueprints, critique rubric.
- `impeccable` (pbakaus): `/impeccable polish|animate|audit|critique|typeset…`.
- `ui-ux-pro-max` (nextlevelbuilder): style/palette/font database.
- `gsap-web`, `60fps-animation`, `accessible-animation`, `micro-interaction`, `page-transition-animation`, `svg-animation` (iart-ai): motion recipes.

## The direction (keep it)
The page is a *cartel de toros*: the menu is the poster, the red muleta (`src/components/Cape.tsx`) is the one
signature move (hero on load, menu category change), the cart is a bullfight ticket. Colours are the plaza's
(tokens at the top of `src/app/(site)/site.css`); one family (Noto Sans + Noto Sans Armenian, `wdth` axis), square
buttons, no gradients, eyebrows, monospace or shadows at rest. Every move has a reduced-motion fallback.

## Content
Menu, prices, contacts, hours and delivery partners live in /admin (Payload). `src/seed/menu.ts` is SAMPLE data
seeded on first boot only. After changing a collection: `npm run payload migrate:create <name>`.
