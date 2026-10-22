# Constants Single-Source (drift-proofing) — Design

**Date:** 2026-06-28
**Status:** Draft (pending user review)

## Overview

The tool sidebars and the `/tools/reference` documentation hardcode numeric
constants (0.209, 1.01325, the Z coefficients, gas densities, 5.2/6.3 limits,
10/10.3 depth-per-bar, the OTU 0.5/0.83 and 90-min CNS half-life, 273.15) that
duplicate the values in `src/lib/diveMath/`. If a math constant is ever updated,
the docs silently drift. This refactor makes the math modules the single source
of truth: export the remaining private constants and have every display surface
import them instead of hardcoding.

**Scope decisions (from brainstorming):**
- **Named constants only** — replace the real source-of-truth constants. Leave
  illustrative / derived prose (e.g. "Z ≈ 0.96 at 200 bar", "AL80 ~77 cf",
  cylinder spec psi, the daily CNS 80% / OTU ~300 guidance) as written.
- **Exact stored value** — interpolate the raw constant verbatim (e.g. a Z coeff
  renders `-0.0002`, `AIR_FN2` renders `0.791`). No formatting helper; the
  cosmetic `+`/Unicode-minus on the Z line is acceptable to lose.

No dive-math behavior changes — only where the numbers are *sourced* from.

## 1. Export the remaining constants (single source of truth)

- `src/lib/diveMath/compressibility.ts`: change `const Z_COEFF` → `export const
  Z_COEFF`. (Type stays `Record<Gas, number>`; values unchanged: o2 −0.0002,
  n2 +0.0002, he +0.00025.)
- `src/lib/diveMath/gasDensity.ts`: export the three component densities —
  `export const O2_DENSITY = 1.42897`, `export const N2_DENSITY = 1.2506`,
  `export const HE_DENSITY = 0.17846` (values unchanged; `surfaceDensity` keeps
  using them).
- `src/lib/diveMath/temperature.ts`: replace the internal `const K = 273.15`
  with `export const KELVIN_OFFSET = 273.15` and update its in-module uses
  (`settledPressureBar`, `hotTargetBar`) to reference `KELVIN_OFFSET`. Behavior
  identical.
- `src/lib/diveMath/oxygenExposure.ts`: introduce named, exported constants for
  the magic numbers and use them in the functions so code and docs share one
  source:
  - `export const OTU_THRESHOLD_PPO2 = 0.5`
  - `export const OTU_EXPONENT = 0.83`
  - `export const CNS_HALF_LIFE_MIN = 90`
  - `segmentOtu`: `if (ppo2 <= OTU_THRESHOLD_PPO2) return 0` and
    `minutes * Math.pow((ppo2 − OTU_THRESHOLD_PPO2) / OTU_THRESHOLD_PPO2,
    OTU_EXPONENT)`.
  - `computeDay` surface decay: `running *= Math.pow(0.5, minutes /
    CNS_HALF_LIFE_MIN)`. (The `0.5` half-life *base* stays a literal — it is the
    definition of a half-life, not a tunable constant.)
- `src/lib/diveMath/modEnd.ts`: no change — `depthPerBar(water)` is already
  exported and is the source for 10 (salt) / 10.3 (fresh).

Already exported and reused as-is: `AIR_FO2`, `AIR_FN2`, `ATMOSPHERIC_BAR`,
`PSI_PER_BAR`, `L_PER_CF`, `FT_PER_M`, `HEAT_COEFF`, `RECOMMENDED_MAX_DENSITY`,
`HARD_MAX_DENSITY`, `CNS_TABLE`.

## 2. Replace hardcoded literals in display surfaces

Numbers are interpolated as the exact stored value. Inside `<Formula>` template
literals use `${CONST}`; in JSX prose use `{CONST}` expressions.

### Reference page components

**`ReferenceFundamentals.tsx`** — import from `@/lib/diveMath/units`,
`compressibility`, `temperature`, `modEnd`:
- "Atmospheric pressure: 1.01325 bar (gauge = absolute − 1.01325)" →
  `${ATMOSPHERIC_BAR}` (both).
- "Air: O₂ = 0.209, N₂ = 0.791" → `${AIR_FO2}`, `${AIR_FN2}`.
- "14.5037738 psi/bar · 28.3168466 L/ft³ · 3.280839895 ft/m" → `${PSI_PER_BAR}`,
  `${L_PER_CF}`, `${FT_PER_M}`.
- "d₀ = 10 m/bar (salt water), 10.3 m/bar (fresh)" →
  `${depthPerBar('salt')}`, `${depthPerBar('fresh')}`.
- Z line "k_O₂ = −0.0002   k_N₂ = +0.0002   k_He = +0.00025" →
  `k_O₂ = ${Z_COEFF.o2}   k_N₂ = ${Z_COEFF.n2}   k_He = ${Z_COEFF.he}`.
- "K = 273.15" → `${KELVIN_OFFSET}`.
- "ΔT = 0.7 × fillRate" and the prose "the 0.7 °C per (bar/min)" → `${HEAT_COEFF}`.

**`ReferenceBlendingTools.tsx`** — import `ATMOSPHERIC_BAR`, `AIR_FO2`:
- "P_final = eqAbs − 1.01325" and "supplyAbs/1.01325" → `${ATMOSPHERIC_BAR}`.
- Nitrox "× (targetFO₂ − 0.209)", "(targetFO₂ − 0.209) / (1 − 0.209)", "≤ 0.209",
  and "Air assumed (fO₂ = 0.209)" → `${AIR_FO2}` / `{AIR_FO2}` as appropriate.

**`ReferencePlanningTools.tsx`** — import `AIR_FN2`, `O2_DENSITY`,
`N2_DENSITY`, `HE_DENSITY`, `RECOMMENDED_MAX_DENSITY`, `HARD_MAX_DENSITY`,
`OTU_THRESHOLD_PPO2`, `OTU_EXPONENT`, `CNS_HALF_LIFE_MIN`, `CNS_TABLE`,
`HEAT_COEFF`, `depthPerBar`:
- END / EAD "(fN₂ / 0.791)" → `${AIR_FN2}`.
- Densities "O₂ 1.42897, N₂ 1.2506, He 0.17846" and the ρ_surface line →
  `${O2_DENSITY}`, `${N2_DENSITY}`, `${HE_DENSITY}`.
- "recommended ≤ 5.2 g/L, hard ≤ 6.3 g/L" (formula block) and the prose "the
  5.2 g/L recommended and 6.3 g/L hard limits" → `${RECOMMENDED_MAX_DENSITY}`,
  `${HARD_MAX_DENSITY}` / `{...}`.
- CNS limits table block → build the rows from `CNS_TABLE.map(([p, m]) => ...)`
  joined with newlines, instead of the hardcoded 11-row string. Keep the same
  visual layout (ppO₂ → minutes). The "< 0.6 → no limit; ≥ 1.6 → 45" hint
  derives its 0.6/1.6/45 from `CNS_TABLE[0][0]`, `CNS_TABLE.at(-1)` rows.
- OTU "((ppO₂ − 0.5) / 0.5)^0.83  (0 when ppO₂ ≤ 0.5)" →
  `${OTU_THRESHOLD_PPO2}` (×3 spots) and `${OTU_EXPONENT}`.
- "CNS ×= 0.5^(surfaceMin / 90)  (90-min half-time)" → `${CNS_HALF_LIFE_MIN}`
  (the `0.5` half-life base stays literal).
- Approximations bullets: "0.7 °C per (bar/min)" → `{HEAT_COEFF}`; "Fresh water
  uses d₀ = 10.3 m/bar; salt uses 10" → `{depthPerBar('fresh')}` /
  `{depthPerBar('salt')}`.

### Calculator sidebars

**`FormulaPanel.tsx`** — the footer "D₀ = 10 m/bar salt, 10.3 m/bar fresh" →
`{depthPerBar('salt')}` / `{depthPerBar('fresh')}` (import `depthPerBar` from
`@/lib/diveMath/modEnd`).

**`BestMixCalculator.tsx`** and **`ModEndCalculator.tsx`** — replace the local
`const d0 = water === 'fresh' ? 10.3 : 10` with `const d0 = depthPerBar(water)`
(import `depthPerBar`). The displayed MOD/END formulas already render `{d0}`, so
they keep working and now track the module.

**`GasDensityCalculator.tsx`** — it already imports `RECOMMENDED_MAX_DENSITY`
/ `HARD_MAX_DENSITY`; replace the prose literals "Exceeds the 6.3 g/L hard
limit." / "Above the 5.2 g/L recommended limit." with the constants
(`{HARD_MAX_DENSITY}` / `{RECOMMENDED_MAX_DENSITY}`).

**`NitroxStickCalculator.tsx`** — the lean-warning threshold `targetFo2 <=
0.209` → `targetFo2 <= AIR_FO2` (import `AIR_FO2` from `@/lib/diveMath/units`).

## 3. Left unchanged (per "named constants only")

- `RealGasNote.tsx` — "Z ≈ 0.96 / 1.04 / 1.05 at 200 bar", "AL80 ~77 cf, not
  81" (illustrative, derived approximations).
- `/tools/about` page — illustrative figures and cylinder spec pressures.
- `OxygenLimitsNote.tsx` — already iterates `CNS_TABLE`; its daily-limit prose
  (CNS ~80% / 100%, OTU ~300) are reference guidance, not code constants.
- The half-life base `0.5` and `ModEndCalculator`'s "1.6" MOD example ppO₂
  (a UI-chosen display value).

## Files

- Modify (exports): `src/lib/diveMath/compressibility.ts`,
  `src/lib/diveMath/gasDensity.ts`, `src/lib/diveMath/temperature.ts`,
  `src/lib/diveMath/oxygenExposure.ts`.
- Modify (reuse): `src/components/Tools/reference/ReferenceFundamentals.tsx`,
  `ReferenceBlendingTools.tsx`, `ReferencePlanningTools.tsx`,
  `src/components/Tools/FormulaPanel.tsx`,
  `src/components/Tools/BestMixCalculator.tsx`,
  `src/components/Tools/ModEndCalculator.tsx`,
  `src/components/Tools/GasDensityCalculator.tsx`,
  `src/components/Tools/NitroxStickCalculator.tsx`.

## Testing

- `oxygenExposure.test.ts` must stay green after the named-constant refactor
  (identical numbers). If a colocated test imports the new constants, fine;
  otherwise the existing assertions already cover the behavior.
- Existing `compressibility.test.ts`, `gasDensity.test.ts`, `temperature.test.ts`
  stay green (no value change; only an `export` added / a rename of the internal
  `K`).
- The display changes are render-only: verified by `npm run build` + `npm run
  lint`, plus a spot-check that the rendered numbers are unchanged from before
  (e.g. the reference page still shows 0.209, 1.01325, 5.2/6.3, the CNS rows,
  −0.0002, etc.).
- `npm run knip`: every newly-exported constant is consumed — `Z_COEFF`,
  the densities, `KELVIN_OFFSET`, and the OTU/CNS constants by the reference
  page (and the OTU/CNS ones also internally). No new unused-export findings.

## Out of scope

- Computing the illustrative/derived values (RealGasNote, about page) from the
  functions — left as prose approximations.
- Any dive-math algorithm or constant-value change.
- A shared "constants registry" abstraction — the modules already are the
  registry; display code imports directly.
