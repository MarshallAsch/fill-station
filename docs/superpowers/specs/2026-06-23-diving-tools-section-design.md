# Public Diving Tools Section — Design

**Date:** 2026-06-23
**Status:** Approved (pending spec review)

## Overview

Add a public `/tools` section with four dive-gas calculators. The section is
reachable without authentication (like `/about` and `/contact`). All math is
pure, client-side, and unit-agnostic internally; UI components convert to/from
the user's chosen units.

The four tools:

1. **Cascade fill** — fill a cylinder from a bank of storage cylinders.
2. **Nitrox stick** — continuous-blending O₂ flow rate + O₂ drawn from supply.
3. **Blend** — partial-pressure nitrox **and** trimix fill sequence.
4. **MOD + END** — max operating depth and equivalent narcotic depth.

## Goals / Non-goals

**Goals**
- Public, no-auth access.
- Single page, tabbed, with `?tab=` query-param navigation.
- Independently selectable units (pressure psi/bar, depth ft/m, volume cf/L),
  persisted in `localStorage`.
- Math separated into pure functions with **thorough unit tests** (Vitest) to
  catch regressions as tools are added/extended.

**Non-goals**
- No DB changes, no API routes, no server state.
- No DB-synced or cross-device unit preferences (localStorage only).
- No persistence of calculator inputs between visits.

## Architecture

```
src/app/tools/page.tsx           — public server page, renders <ToolsPage/>
src/components/Tools/
  ToolsPage.tsx                  — 'use client'; UnitsProvider + tab shell
  ToolsTabs.tsx                  — tab bar, reads/writes ?tab= (Suspense-wrapped)
  UnitsProvider.tsx              — context + useUnits() hook (localStorage)
  UnitToggle.tsx                 — renders only the toggles relevant to the tab
  CascadeCalculator.tsx
  NitroxStickCalculator.tsx
  BlendCalculator.tsx
  ModEndCalculator.tsx
src/lib/diveMath/
  units.ts        — conversions + constants (SI internal)
  cascade.ts
  nitroxStick.ts
  blending.ts
  modEnd.ts
  *.test.ts       — colocated Vitest tests, one per module
```

**Internal unit convention:** math modules work in SI — pressure in **bar
absolute** unless noted, volume in **litres (water capacity)**, depth in
**metres**. UI converts at the boundary. Tests assert against SI values, so they
are independent of the display-unit code.

### Routing & access
- Add `/tools` to `publicPages` in `src/proxy.ts`.
- No entry in `PERMISSIONS.pages` (public pages short-circuit before role
  checks). Anonymous and all authenticated roles can view.
- `?tab=` values: `cascade` (default when missing/invalid), `nitrox-stick`,
  `blend`, `mod-end`. Tab switch uses `router.replace` (shallow) so the URL is
  shareable. `useSearchParams` usage requires a `<Suspense>` boundary (Next 16).

### Navigation
- Add a **Tools** link to `Navbar`:
  - unauthenticated branch (alongside About),
  - authenticated desktop row (alongside About/Contact),
  - mobile menu panel.
- Simplest: hard-code the `/tools` link in `Navbar` next to About in both
  branches (it is not role-gated, so it does not belong in `getNavItems`).

### Units
- `useUnits()` exposes `{ units, setUnit }` where
  `units = { pressure: 'psi'|'bar', depth: 'ft'|'m', volume: 'cf'|'l' }`.
- Default `{ pressure: 'psi', depth: 'ft', volume: 'cf' }` (imperial).
- Persisted under `localStorage['fillstation.tools.units']`. SSR-safe: read in a
  `useEffect` after mount; render defaults until hydrated to avoid mismatch.
- `UnitToggle` shows only the relevant control(s) per tab (e.g. MOD/END shows
  depth; blend shows pressure; nitrox stick shows pressure + volume).

## Component / Reuse conventions
- Reuse `NumberInput`, `ListBox`, `RadioGroup`, `CheckBox` from
  `src/components/UI/FormElements/`.
- Remove the stray `console.log(value)` in `NumberInput.tsx`. Confirm decimal
  entry works for values like PPO₂ `1.4`; if the `String(Number(value))`
  coercion blocks intermediate decimal typing, add a `step`/decimal-friendly
  path rather than forking the component.
- Use theme tokens (`bg-background`, `text-text`, `border-border`, `bg-accent`),
  no hardcoded colors, no `dark:` variants of theme classes.
- Prettier: single quotes, no semicolons, tabs.

## The math (formulas = test oracles)

All fractions are decimals (FO₂ 0.32, FHe 0.0). Air is FO₂ = 0.209,
FN₂ = 0.791.

### 1. Cascade (`cascade.ts`)
Equalize the target cylinder against each bank cylinder in sequence, **lowest
bank pressure first** (preserves high-pressure gas). For a connected pair, all
pressures equalize to:

```
P = (P_t·V_t + P_b·V_b) / (V_t + V_b)
```

(volumes are water capacity; pressures absolute or gauge consistently — use
gauge, ambient effects ignored for shop fills). Only connect a bank while its
pressure exceeds the target's current pressure (no back-fill).

- **Input:** banks `[{ volume, pressure }]`, target `{ volume, startPressure }`,
  optional `desiredPressure`.
- **Output:** `finalPressure`, `banks: [{ residualPressure }]`,
  `reachedDesired: boolean`.
- **Tests:** single bank equalization; two-bank ordering; bank below target is
  skipped; conservation of gas (Σ P·V before = after); desired-pressure
  reached / not reached; empty banks list.

### 2. Nitrox stick (`nitroxStick.ts`)
Continuous blend: air (FO₂ 0.209) + injected pure O₂.

```
Q_o2 = Q_air · (FO2_target − 0.209) / (1 − FO2_target)
```

O₂ fraction of total throughput = `(FO2_target − 0.209) / (1 − 0.209)`.

O₂ supply drawdown for a fill: surface volume added to the tank =
`V_tank · (P_final − P_start)` (consistent pressure/volume units → surface
volume). O₂ surface volume = that × `(FO2_target − 0.209)/0.791`. Convert to
supply-bottle pressure drop: `ΔP_supply = O2_surface_volume / V_supply`
(supply bottle water capacity).

- **Input:** `FO2_target`, `Q_air`; and `{ V_tank, P_start, P_final, V_supply }`.
- **Output:** `o2FlowRate`, `o2SurfaceVolume`, `supplyPressureDrop`.
- **Edge:** `FO2_target ≤ 0.209` → flow rate 0 (no O₂ needed; flag). `FO2 → 1`
  guarded against divide-by-zero.
- **Tests:** EAN32/EAN36 flow rates against known values; air target → 0 flow;
  drawdown monotonicity; divide-by-zero guard.

### 3. Blend — partial pressure (`blending.ts`)
Given start `{ P_i, fo2_i, fhe_i }`, target `{ P_f, fo2_f, fhe_f }`. Add pure He,
then pure O₂, then **top with air** (the standard, always-solvable PP model;
topping with pure O₂ is degenerate — the O₂-add and O₂-top columns are linearly
dependent, so it is not offered). Solve added partial pressures so final O₂ and
He fractions hit target:

```
He volume:  fhe_i·P_i + P_he              = fhe_f·P_f
O2 volume:  fo2_i·P_i + P_o2 + 0.209·P_air = fo2_f·P_f
Total:      P_i + P_he + P_o2 + P_air      = P_f
```

Sequence: add He to `P_i+P_he`, add O₂ to `…+P_o2`, top with air to `P_f`.

- **Output:** `{ addHeTo, addO2To, topTo, pHe, pO2, pTop, feasible, reason }`.
- **Feasibility:** any negative add ⇒ `feasible=false` with reason (e.g. "drain
  required: too much O₂/He in start mix").
- **Tests:** air→EAN32 top-up (classic PP numbers); trimix 18/45 from empty;
  nitrox with FHe=0 reduces to nitrox blend; impossible blend flagged; sum of
  adds = `P_f − P_i`.

### 4. MOD + END (`modEnd.ts`)
Pressure-per-depth constants: salt = 10 m/bar (33 ft/ata), fresh = 10.3 m/bar
(34 ft/ata). Compute in SI, convert for display.

```
MOD (msw) = (PPO2_max / FO2 − 1) · D0        where D0 = 10 (salt) / 10.3 (fresh)
```

Show MOD at PPO₂ **1.4 (editable)** and **1.6** simultaneously.

END at planned depth, with toggle:
- **O₂ narcotic (default):** narcotic fraction = `1 − FHe`.
  `END = (depth + D0)·(1 − FHe) − D0`
- **N₂ only:** `END = (depth + D0)·(FN2 / 0.79) − D0`, `FN2 = 1 − FO2 − FHe`.

- **Input:** `FO2`, `FHe`, water `'salt'|'fresh'`, `depth`, `ppo2 (=1.4)`.
- **Output:** `{ modAt: {1.4: …, 1.6: …}, end }` in metres (UI converts).
- **Tests:** EAN32 MOD@1.4 ≈ 33.8 msw; air MOD; fresh vs salt difference;
  trimix END both models; END ≤ depth for any He>0 with O₂-narcotic model;
  N₂-only model gives shallower END than O₂-narcotic for the same trimix.

## Error handling
Inline per-field/per-result validation (no toasts): target below start
pressure, impossible blend, insufficient O₂ supply, FO₂+FHe > 1, non-positive
volumes. Results panels show a clear message instead of NaN.

## Testing setup (Vitest)
- Add `vitest` dev dependency; `"test": "vitest run"` and `"test:watch":
  "vitest"` scripts.
- Minimal `vitest.config.ts` (node environment; the math needs no DOM).
- Tests colocated as `src/lib/diveMath/*.test.ts`, asserting SI outputs with
  `toBeCloseTo` tolerances. Goal: cover every formula branch and edge case
  listed above so future tools/edits regress loudly.
- Ensure `knip` / `eslint` ignore patterns don't flag test files; run
  `npm run lint` after changes.

## Build order
1. Vitest setup + `units.ts` (+ tests).
2. `cascade.ts`, `nitroxStick.ts`, `blending.ts`, `modEnd.ts` (+ tests) — TDD.
3. `UnitsProvider` + `useUnits` + `UnitToggle`.
4. Tab shell (`ToolsPage`, `ToolsTabs`) + `/tools/page.tsx` + proxy whitelist.
5. Four calculator components.
6. Navbar links.
7. `npm run lint`, `npm test`.
