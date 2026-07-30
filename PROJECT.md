# DIY Calc Pro — Project Context

Read this file at the start of every session so context doesn't need to be repeated.

## What this is

**DIY Calc Pro** by Seiton Home — a premium bilingual (ES default / EN) cost calculator
for artisan DIY creators (candles, resin, soap, concrete, plaster, multi-material
products). It is a **calculator tool only** — not a business/inventory/invoicing system.
Sold as a paid product (license-gated) at diycalc.seitonhome.com, linked from the main
seitonhome.com site.

**Product philosophy (owner-stated, 2026-07-30): the cost number is not the point.**
The reason an artisan opens this app is to be told exactly how to execute the
mixture/recipe (how much wax, resin ratio, water:plaster ratio, lye safety, cure
times...). Cost/pricing output is a side effect, not the core value. When adding or
reviewing calculator features, weigh instructional/process content at least as
heavily as the math — see "Step-by-step guides" below for the feature this produced.

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

## Bugs found & fixed 2026-07-30

Found during a second full functional test pass (all 6 calculators including
save/PDF-export, wizard flow x6, materials/molds/formulas libraries, simulator,
compare, learn, settings, admin gating) and fixed the same session:

1. **Mold-volume instructions didn't say to weigh the mold first** — the
   water-displacement method (irregular shape, in `mold-calculator.tsx` and
   candles' `geometry.irregularMethod`) jumped straight to "fill with water,"
   skipping the empty-mold weigh-in step needed to compute volume by
   subtraction. Rewritten as 3 explicit numbered steps in both places, in
   neutral Latin American Spanish.
2. **Multi-material calculator showed the cost-distribution chart twice** —
   `calculators/multi/page.tsx` has its own richer pie chart (with
   most-expensive/most-time-consuming labels), but also rendered the generic
   `<ResultPanel>` donut chart with the *same* per-component data underneath
   it. Fixed by adding a `hideCostDistribution` prop to `ResultPanel` and
   passing it from the multi page only.
3. **Candles result panel showed "1 pieza" in the English UI** — the wick-count
   line in `calculators/candles/page.tsx` had `amount: "1 pieza"` hardcoded
   instead of `es ? "1 pieza" : "1 pc"`.
4. **Molds library showed the raw material enum instead of its label** —
   `molds-client.tsx` rendered `m.mold_material` directly (e.g. lowercase
   `"silicone"`) instead of `t(\`materials.${m.mold_material}\`)` like the
   dropdown already did.
5. **Formula library detail view showed a blank quantity** — the
   `formula_materials` table column is `amount`, but `formulas-client.tsx`
   read `m.quantity` (a field that doesn't exist), so every material row
   showed just a bare unit with no number in front of it.
6. **Scenario Comparator ("Compare") showed NaN for Total cost/unit, Gross
   margin, and Net margin** — `compare/page.tsx` read
   `totalCostPerUnit`/`grossMarginPct`/`netMarginPct` off the results object,
   but `calculateResults()` (core.ts) actually returns `costPerUnit`/
   `grossMargin`/`netMargin`. Same mismatch broke the "best scenario" ★
   highlighting, the winner-banner scenario name, and the chart's "Cost" bar.
   Fixed by aligning all four usages to the real `CalculationResults` field
   names.

If any of these resurface, check the field/prop names against the actual
`CalculationResults` type (`src/types/index.ts`) and translation keys before
re-diagnosing — most of the above were naming mismatches, not logic bugs.

## Step-by-step process guides (added 2026-07-30)

`src/components/ui/step-guide.tsx` — `<StepGuide title steps={StepGuideStep[]}>`, a
numbered vertical timeline of `{ icon: LucideIcon, title, description, critical? }`.
Renders in the results column of all 6 calculators, right after the RecipeCard/"What
you need" panel, showing HOW to execute the recipe the calculator just computed —
not just its cost. `critical: true` renders that step's icon badge in red (used for
lye handling in soap, workspace/ventilation prep in candles and resin).

Each calculator builds its own `steps` array in its `page.tsx` (a local
`get<Material>Steps(locale, ...)` function, same file-local pattern as the existing
`buildRecipe()`/RecipeCard note functions) using **real computed values from
`results`**, not generic text — e.g. soap's lye/water grams, resin's Part A/B grams,
candles' per-wax melt/pour/fragrance temps from `WAX_TYPES`. This is the reason it's
per-calculator inline logic instead of a shared JSON content file: the copy has to
interpolate that specific calculation's numbers.

- **Soap** branches on `soapData.isSaponified`: 8 steps for lye soap (safety gear →
  weigh separately → lye-to-liquid order → cool → trace → fragrance → pour → cure)
  vs. 5 for melt-and-pour. This calculator previously had the richest safety warning
  in the app (the lye banner) but zero process steps — now it has both.
- **Candles** pulls `meltPointC`/`fragranceAddTempC`/`pourTempC`/`needsSecondPour`
  from `WAX_TYPES[waxType]` per step, replacing what used to be one static note
  ("melt and pour at 65-70°C") shown identically regardless of which wax was picked
  (wrong for e.g. gel wax at 88°C or beeswax at 74°C).
- **Concrete** branches three ways on `concreteType`: hypertufa and microcement get
  their own fully different step sequences (no sand vs. peat/perlite; ultra-thin
  troweled layers needing primer/epoxy sealer) instead of the generic "mix dry, add
  water, demold at 24h" note that used to apply to all 9 mix types alike.
- **Plaster** and **Resin** follow the same "real numbers from `results`" pattern
  (water/plaster grams, A/B grams, pour count).
- **Multi-material** doesn't have its own recipe (it aggregates other calculators'
  outputs), so instead it shows a de-duplicated "Before you start" checklist — one
  safety/process reminder per unique material type present in the set, sourced from
  a small `COMPONENT_TIPS` map in `multi/page.tsx` — plus an inline one-line hint
  under each component's type selector. This was previously the only calculator with
  zero guidance content despite being the app's marketed "Diferencial" feature.

While in this calculator this session, also fixed two "dead" warnings that were
computed but never rendered: candles' `gelFragrance` and concrete's `tooLittleWater`
(the latter now has a warning box next to the existing `tooMuchWater` one).

## Guided wizard (added 2026-07-29)

`/{locale}/wizard` (`src/app/[locale]/wizard/page.tsx`) is the app's guided onboarding
flow: pick a material → pick a project type for that material → land on
`/calculators/{material}?type={value}` with that technique/type already selected and
its recommendation visible, instead of a blank form. It's the target of the
dashboard's "Nuevo cálculo" button and the empty-state "Hacer mi primer cálculo" CTA.

- Project-type options per material come from the SAME data each calculator already
  uses — `RESIN_TECHNIQUES` (`lib/calculations/resin.ts`), `CONCRETE_MIX_TYPES`,
  `PLASTER_TYPES`, `SOAP_TYPES` — so the wizard and the calculator never drift apart.
  Candles has no such data structure; its 12 short descriptions live under
  `calculators.candles.typeDescriptions.*` in the message files. Multi has no natural
  "technique," so its second question is "what's the main material" and it prefills
  the first component's type.
- Each calculator reads `?type=` on mount (via `new URLSearchParams(window.location.search)`,
  not `useSearchParams()` — the latter forces a Suspense boundary on these
  statically-generated pages and broke the build) and calls `setValue()` to preselect
  its own type field.
- **Gotcha**: for the 3 calculators whose type field is a Radix `Select` (candles,
  soap, multi's per-component type), calling `setValue()` synchronously on mount gets
  silently overwritten a tick later — the value visibly reverts to empty. Wrap it in
  `setTimeout(..., 50)` with a `clearTimeout` cleanup (already done in all three). The
  other 3 (resin, concrete, plaster) use plain radio-styled `<input>`s bound via
  `register()` and don't need the delay — only Radix `Select` is affected. If a future
  calculator field prefill silently reverts to empty, check whether it's a Radix
  Select first before assuming the prefill code itself is wrong.

## Standing preferences

- Auto commit + push every change in this repo without asking first (standing
  authorization given 2026-07-18) — still verify it builds first.
- Bilingual: any user-facing copy change needs both `src/messages/es.json` and
  `en.json` updated.
