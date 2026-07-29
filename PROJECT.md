# DIY Calc Pro — Project Context

Read this file at the start of every session so context doesn't need to be repeated.

## What this is

**DIY Calc Pro** by Seiton Home — a premium bilingual (ES default / EN) cost calculator
for artisan DIY creators (candles, resin, soap, concrete, plaster, multi-material
products). It is a **calculator tool only** — not a business/inventory/invoicing system.
Sold as a paid product (license-gated) at diycalc.seitonhome.com, linked from the main
seitonhome.com site.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript strict, Tailwind CSS
- next-intl with `localePrefix: "always"` — every route is `/es/...` or `/en/...`
- Supabase (Postgres, Auth, RLS) — SSR client in `src/lib/supabase/`
- Zustand (`src/store/index.ts`) — persists only `locale`; `user`/`license` fields exist
  but are dead state (see known issues below)
- React Hook Form + Zod (`resolver: zodResolver(schema) as any` — needed for
  `z.coerce.number()` compatibility with strict TS)
- Recharts for charts, jsPDF for PDF export

## Structure

- `src/app/[locale]/` — all pages, locale-prefixed
  - `calculators/{candles,resin,soap,concrete,plaster,multi}` — the 6 calculators
  - `library/{materials,molds,formulas}` — user's saved materials/molds/formulas
  - `simulator`, `compare`, `learn`, `dashboard`, `settings`, `admin` (role-gated)
- `src/proxy.ts` — custom middleware: auth/license gate for protected paths, otherwise
  delegates to next-intl's `intlMiddleware`
- `src/lib/calculations/` — pure calculation engines per material
- `src/lib/licensing.ts` — validates activation codes against Seiton Home's external
  licensing API (`seitonhome.com/api/activate-code`); this app has no license codes
  of its own
- `supabase/migrations/` — schema + RLS policies

## Licensing model

New users get a `demo` license row (via `handle_new_user()` trigger). Registration and
`/api/activate-license` both call the external Seiton licensing API to validate a code,
then flip `licenses.status` to `active`. There is no way to activate a test account
through the UI without a real Seiton activation code — to create a throwaway test
account, use the Supabase service-role key to `admin.createUser()` and directly
`update` its `licenses` row to `status: 'active'` (see session notes / ask the user
for the current test account credentials before re-creating one).

## Known issues (found 2026-07-29, unfixed as of last check — verify before assuming still true)

1. **English locale is broken on every authenticated page.** `src/proxy.ts` bypasses
   next-intl's `intlMiddleware` for `PROTECTED_PATHS`/`ADMIN_PATHS`, and
   `src/app/[locale]/layout.tsx` calls `getMessages()` without first calling
   `setRequestLocale(locale)`. Result: dashboard/calculators/library/etc. under
   `/en/...` render Spanish text (only the locale badge and a couple of
   client-derived bits show English). Public pages (`/`, `/login`, `/register`,
   `/activate`, `/support`) are fine since they go through `intlMiddleware` normally.
2. **"Guardar fórmula" doesn't save to the Formulas library.** Every calculator's
   save handler (`handleSave` in each `calculators/*/page.tsx`) inserts only into the
   `calculations` table, never `formulas`. `Biblioteca de Fórmulas` and the
   dashboard's "Fórmulas guardadas" stat are permanently empty/0 for every user.
3. **Settings page license status is always wrong.** `useAppStore().license` is never
   populated — `setLicense` exists in `src/store/index.ts` but is called nowhere — so
   `/settings` always shows "Sin activar" regardless of the real DB status. (The
   dashboard itself is fine: it computes premium status from server-fetched props,
   not the store.)
4. **Untranslated category keys shown raw**, e.g. "candles" instead of "Velas" — in the
   Multimaterial calculator's material-type dropdown
   (`calculators/multi/page.tsx:155`, renders `{k}` instead of a translated label) and
   in the dashboard/admin "Tipo" column for recent calculations.
5. **"Admin" nav link shown to every user** in `src/components/layout/sidebar.tsx`
   regardless of role (not a security hole — `/admin/page.tsx` correctly redirects
   non-admins server-side — just a confusing UI element for everyone else).

## Standing preferences

- Auto commit + push every change in this repo without asking first (standing
  authorization given 2026-07-18) — still verify it builds first.
- Bilingual: any user-facing copy change needs both `src/messages/es.json` and
  `en.json` updated.
