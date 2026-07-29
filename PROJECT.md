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
  but are never populated (nothing calls `setUser`/`setLicense`) — don't rely on them,
  fetch license/role directly from Supabase where needed (see `settings/page.tsx` and
  `components/layout/sidebar.tsx` for the pattern)
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

## Bugs found & fixed 2026-07-29

Found during a full functional test pass (all 6 calculators, library, simulator,
compare, learn, settings, language switch) and fixed the same session:

1. **English locale broken on every authenticated page** — `src/proxy.ts` bypasses
   next-intl's `intlMiddleware` for `PROTECTED_PATHS`/`ADMIN_PATHS`, so
   `getMessages()` in `[locale]/layout.tsx` resolved the wrong locale via cache/header
   fallback. Fixed by calling `getMessages({ locale })` with the URL-segment locale
   explicitly (plus `setRequestLocale(locale)`) instead of relying on requestLocale
   negotiation. If English breaks again on a protected route, start here.
2. **"Guardar fórmula" never saved to the Formulas library** — every calculator's
   save handler inserted only into `calculations`, never `formulas`/`formula_materials`.
   Fixed via a shared `saveFormula()` helper in `src/lib/formulas.ts`, called from all
   6 `calculators/*/page.tsx` `handleSave` functions.
3. **Settings page license status always wrong** — `useAppStore().license` was never
   populated (`setLicense` defined but never called). Fixed by having
   `settings/page.tsx` fetch the license row directly from Supabase instead of the
   store.
4. **Untranslated category keys shown raw** (e.g. "candles" instead of "Velas") — in
   the Multimaterial material-type dropdown, dashboard/admin "Tipo" columns, and the
   Formulas library category badge. Fixed by translating via `dashboard.quickAccess.*`
   wherever a raw `category`/`type` value was rendered.
5. **"Admin" nav link shown to every user** regardless of role. Fixed by having
   `Sidebar` fetch the current user's role client-side and only injecting the Admin
   item when `role === "admin"`.

If any of these resurface, that's a regression worth flagging loudly rather than
re-diagnosing from scratch — the root causes above still apply.

## Standing preferences

- Auto commit + push every change in this repo without asking first (standing
  authorization given 2026-07-18) — still verify it builds first.
- Bilingual: any user-facing copy change needs both `src/messages/es.json` and
  `en.json` updated.
