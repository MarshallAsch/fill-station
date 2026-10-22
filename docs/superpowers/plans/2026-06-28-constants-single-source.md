# Constants Single-Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `src/lib/diveMath/` the single source of truth for numeric constants so the tool sidebars and `/tools/reference` docs can't drift from the math.

**Architecture:** Export the remaining private constants from the math modules (and name a few magic numbers), then replace hardcoded literals in the reference page and calculator sidebars with imports of those constants.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest. Pure SI dive math in `src/lib/diveMath/` (Vitest has no `@/` alias — math modules use relative imports).

## Global Constraints

- Prettier: single quotes, no semicolons, TABS, 80-char width.
- Theme tokens only in components; no hardcoded colors, no `dark:`.
- **Named constants only**: replace real source-of-truth constants; leave illustrative/derived prose (RealGasNote "Z≈0.96 / AL80 ~77 cf", about-page figures, cylinder psi, OxygenLimitsNote daily 80%/300, the half-life base `0.5`, ModEnd "1.6" example) unchanged.
- **Exact stored value**: interpolate the raw constant verbatim (no formatting helper). The Z line loses the cosmetic `+`/Unicode-minus — accepted.
- No dive-math value changes — only where numbers are sourced.

---

### Task 1: Export the math constants (single source of truth)

**Files:**
- Modify: `src/lib/diveMath/compressibility.ts`
- Modify: `src/lib/diveMath/gasDensity.ts`
- Modify: `src/lib/diveMath/temperature.ts`
- Modify: `src/lib/diveMath/oxygenExposure.ts`

**Interfaces:**
- Produces (new exports later tasks import):
  - `Z_COEFF: Record<'o2'|'n2'|'he', number>` from `compressibility.ts`.
  - `O2_DENSITY`, `N2_DENSITY`, `HE_DENSITY: number` from `gasDensity.ts`.
  - `KELVIN_OFFSET: number` from `temperature.ts`.
  - `OTU_THRESHOLD_PPO2`, `OTU_EXPONENT`, `CNS_HALF_LIFE_MIN: number` from `oxygenExposure.ts`.
- These are pure `export`/rename additions — no behavior change. The guarantee is that the existing dive-math suites stay green.

- [ ] **Step 1: Export `Z_COEFF`**

In `src/lib/diveMath/compressibility.ts`, change:

```ts
const Z_COEFF: Record<Gas, number> = {
```

to:

```ts
export const Z_COEFF: Record<Gas, number> = {
```

- [ ] **Step 2: Export the gas densities**

In `src/lib/diveMath/gasDensity.ts`, change lines 4-6:

```ts
const O2_DENSITY = 1.42897
const N2_DENSITY = 1.2506
const HE_DENSITY = 0.17846
```

to:

```ts
export const O2_DENSITY = 1.42897
export const N2_DENSITY = 1.2506
export const HE_DENSITY = 0.17846
```

(`surfaceDensity` keeps using them unchanged.)

- [ ] **Step 3: Export `KELVIN_OFFSET` (rename internal `K`)**

In `src/lib/diveMath/temperature.ts`:

Change line 4:
```ts
const K = 273.15
```
to:
```ts
export const KELVIN_OFFSET = 273.15
```

Then update the four uses inside `settledPressureBar` and `hotTargetBar` from `+ K` to `+ KELVIN_OFFSET`:
```ts
	const tHot = fillTempC + KELVIN_OFFSET
	const tCold = settledTempC + KELVIN_OFFSET
```
(both functions — 4 occurrences total). Leave `const ATM = ATMOSPHERIC_BAR` as-is.

- [ ] **Step 4: Name + export the OTU/CNS magic numbers**

In `src/lib/diveMath/oxygenExposure.ts`, add after the `CNS_TABLE` block (after line 14):

```ts
// OTU (pulmonary O2 toxicity) per the NOAA power formula, and the CNS clock
// surface half-time. Named so the docs and the math read the same values.
export const OTU_THRESHOLD_PPO2 = 0.5
export const OTU_EXPONENT = 0.83
export const CNS_HALF_LIFE_MIN = 90
```

Change `segmentOtu` (lines 37-40) to:

```ts
export function segmentOtu(input: { ppo2: number; minutes: number }): number {
	if (input.ppo2 <= OTU_THRESHOLD_PPO2) return 0
	return (
		input.minutes *
		Math.pow((input.ppo2 - OTU_THRESHOLD_PPO2) / OTU_THRESHOLD_PPO2, OTU_EXPONENT)
	)
}
```

Change the surface-decay line in `computeDay` (line 61) from:
```ts
			running *= Math.pow(0.5, item.minutes / 90)
```
to:
```ts
			running *= Math.pow(0.5, item.minutes / CNS_HALF_LIFE_MIN)
```
(The `0.5` half-life base stays a literal.)

- [ ] **Step 5: Run the dive-math suite — confirm no behavior change**

Run: `npm test`
Expected: all tests pass (135/136 baseline), in particular `oxygenExposure.test.ts`, `temperature.test.ts`, `compressibility.test.ts`, `gasDensity.test.ts` — the OTU/CNS values, settled/hot pressures, Z, and densities are unchanged because only literals were renamed to identically-valued constants.

- [ ] **Step 6: Build + lint**

Run: `npm run build && npm run lint`
Expected: build clean; lint 0 errors (pre-existing warnings only). (Knip is deferred to the final task once the new exports are consumed.)

- [ ] **Step 7: Commit**

```bash
git add src/lib/diveMath/compressibility.ts src/lib/diveMath/gasDensity.ts src/lib/diveMath/temperature.ts src/lib/diveMath/oxygenExposure.ts
git commit -m "refactor: export dive-math display constants as single source of truth"
```

---

### Task 2: Reference page reuses the constants

**Files:**
- Modify: `src/components/Tools/reference/ReferenceFundamentals.tsx`
- Modify: `src/components/Tools/reference/ReferenceBlendingTools.tsx`
- Modify: `src/components/Tools/reference/ReferencePlanningTools.tsx`

**Interfaces:**
- Consumes: the exports from Task 1 plus already-exported `AIR_FO2`, `AIR_FN2`, `ATMOSPHERIC_BAR`, `PSI_PER_BAR`, `L_PER_CF`, `FT_PER_M`, `HEAT_COEFF`, `RECOMMENDED_MAX_DENSITY`, `HARD_MAX_DENSITY`, `CNS_TABLE`, and `depthPerBar`.

Note on syntax: inside `<Formula>` template literals interpolate with `${CONST}`; in JSX prose use `{CONST}` expressions (so split a prose string around the value, or wrap the whole line in a `{`…`}` template/expression).

- [ ] **Step 1: ReferenceFundamentals — import + interpolate**

Add imports at the top of `src/components/Tools/reference/ReferenceFundamentals.tsx`:

```tsx
import {
	AIR_FO2,
	AIR_FN2,
	ATMOSPHERIC_BAR,
	PSI_PER_BAR,
	L_PER_CF,
	FT_PER_M,
} from '@/lib/diveMath/units'
import { Z_COEFF } from '@/lib/diveMath/compressibility'
import { KELVIN_OFFSET } from '@/lib/diveMath/temperature'
import { depthPerBar } from '@/lib/diveMath/modEnd'
import { HEAT_COEFF } from '@/lib/diveMath/temperature'
```

(Combine the two `temperature` imports into one line: `import { HEAT_COEFF, KELVIN_OFFSET } from '@/lib/diveMath/temperature'`.)

Replace the literals:
- Units/constants `<li>` items — render the values from constants:
  - `Atmospheric pressure: {ATMOSPHERIC_BAR} bar (gauge = absolute − {ATMOSPHERIC_BAR}).`
  - `Air: O₂ = {AIR_FO2}, N₂ = {AIR_FN2}.`
  - `Conversions: {PSI_PER_BAR} psi/bar · {L_PER_CF} L/ft³ · {FT_PER_M} ft/m.`
- Depth `<Formula>`: `` {`d₀ = ${depthPerBar('salt')} m/bar (salt water), ${depthPerBar('fresh')} m/bar (fresh)\nATA = depth_m / d₀ + 1`} ``
- Z `<Formula>` line: `` k_O₂ = ${Z_COEFF.o2}   k_N₂ = ${Z_COEFF.n2}   k_He = ${Z_COEFF.he} ``
- Temperature `<Formula>`: replace `K = 273.15` → `K = ${KELVIN_OFFSET}` and `ΔT = 0.7 × fillRate(bar/min)` → `ΔT = ${HEAT_COEFF} × fillRate(bar/min)`.
- Temperature prose "the 0.7 °C per (bar/min)" → `the {HEAT_COEFF} °C per (bar/min)`.

- [ ] **Step 2: ReferenceBlendingTools — import + interpolate**

Add to `src/components/Tools/reference/ReferenceBlendingTools.tsx` (after the `Formula` import):

```tsx
import { AIR_FO2, ATMOSPHERIC_BAR } from '@/lib/diveMath/units'
```

Replace literals:
- Cascade `<Formula>`: `P_final = eqAbs − 1.01325` → `P_final = eqAbs − ${ATMOSPHERIC_BAR}`.
- Cascade `<li>`: `Air assumed (fO₂ = 0.209)…` → `Air assumed (fO₂ = {AIR_FO2})…`.
- Nitrox `<Formula>`: `(targetFO₂ − 0.209)` (both places) and `(1 − 0.209)` → `(targetFO₂ − ${AIR_FO2})`, `(1 − ${AIR_FO2})`.
- Nitrox `<li>`: `Returns 0 when the target ≤ 0.209…` → `…≤ {AIR_FO2}…`.
- Booster `<Formula>`: `supplyAbs/1.01325` → `supplyAbs/${ATMOSPHERIC_BAR}`.

- [ ] **Step 3: ReferencePlanningTools — import + interpolate + build CNS table**

Add to `src/components/Tools/reference/ReferencePlanningTools.tsx`:

```tsx
import { AIR_FN2 } from '@/lib/diveMath/units'
import {
	O2_DENSITY,
	N2_DENSITY,
	HE_DENSITY,
	RECOMMENDED_MAX_DENSITY,
	HARD_MAX_DENSITY,
} from '@/lib/diveMath/gasDensity'
import {
	CNS_TABLE,
	OTU_THRESHOLD_PPO2,
	OTU_EXPONENT,
	CNS_HALF_LIFE_MIN,
} from '@/lib/diveMath/oxygenExposure'
import { HEAT_COEFF } from '@/lib/diveMath/temperature'
import { depthPerBar } from '@/lib/diveMath/modEnd'
```

Replace literals:
- MOD/END and EAD `<Formula>`: `(fN₂ / 0.791)` → `(fN₂ / ${AIR_FN2})` (both blocks).
- Gas Density `<Formula>`: `component densities (0 °C, 1 atm): O₂ 1.42897, N₂ 1.2506, He 0.17846 g/L` → `…O₂ ${O2_DENSITY}, N₂ ${N2_DENSITY}, He ${HE_DENSITY} g/L`; `ρ_surface = fO₂·1.42897 + fN₂·1.2506 + fHe·0.17846` → `…fO₂·${O2_DENSITY} + fN₂·${N2_DENSITY} + fHe·${HE_DENSITY}`; `limits: recommended ≤ 5.2 g/L, hard ≤ 6.3 g/L` → `…≤ ${RECOMMENDED_MAX_DENSITY} g/L, hard ≤ ${HARD_MAX_DENSITY} g/L`.
- Gas Density prose: `the 5.2 g/L recommended and 6.3 g/L hard limits` → `the {RECOMMENDED_MAX_DENSITY} g/L recommended and {HARD_MAX_DENSITY} g/L hard limits`.
- CNS/OTU `<Formula>`: build the table rows from the constant. Define just above the `return` (or inline) a string:

```tsx
	const cnsRows = CNS_TABLE.map(([p, m]) => `${p}→${m}`).join('  ')
	const cnsLow = CNS_TABLE[0][0]
	const cnsHigh = CNS_TABLE[CNS_TABLE.length - 1]
```

  and render the formula block as a template literal using them, e.g.:

```tsx
				<Formula>{`NOAA single-exposure CNS limits (ppO₂ ata → max minutes):
  ${cnsRows}
  (linear interpolation between rows; < ${cnsLow} → no limit; ≥ ${cnsHigh[0]} → ${cnsHigh[1]})
segment CNS% = minutes / limit × 100
OTU = minutes × ((ppO₂ − ${OTU_THRESHOLD_PPO2}) / ${OTU_THRESHOLD_PPO2})^${OTU_EXPONENT}      (0 when ppO₂ ≤ ${OTU_THRESHOLD_PPO2})
surface interval: CNS ×= 0.5^(surfaceMin / ${CNS_HALF_LIFE_MIN})   (${CNS_HALF_LIFE_MIN}-min half-time)`}</Formula>
```

  (`ReferencePlanningTools` becomes a component with a small body before `return`; if it is currently an arrow returning JSX directly, convert it to a block body `=> { const … ; return (…) }`.)
- Approximations bullets: `Hot-fill heating uses a single 0.7 °C per (bar/min) coefficient.` → `…a single {HEAT_COEFF} °C per (bar/min)…`; `Fresh water uses d₀ = 10.3 m/bar; salt uses 10.` → `Fresh water uses d₀ = {depthPerBar('fresh')} m/bar; salt uses {depthPerBar('salt')}.`

- [ ] **Step 4: Build + lint + spot-check**

Run: `npm run build && npm run lint`
Expected: build clean; lint 0 errors. Spot-check the rendered values are unchanged: the page must still show `0.209`, `0.791`, `1.01325`, `−0.0002`/`0.0002`/`0.00025`, `273.15`, `0.7`, `10`/`10.3`, `1.42897`/`1.2506`/`0.17846`, `5.2`/`6.3`, the same CNS rows `0.6→720 … 1.6→45`, `0.5`/`0.83`/`90`.

- [ ] **Step 5: Commit**

```bash
git add src/components/Tools/reference
git commit -m "refactor: reference page reads constants from the math modules"
```

---

### Task 3: Calculator sidebars reuse the constants + full gate

**Files:**
- Modify: `src/components/Tools/FormulaPanel.tsx`
- Modify: `src/components/Tools/BestMixCalculator.tsx`
- Modify: `src/components/Tools/ModEndCalculator.tsx`
- Modify: `src/components/Tools/GasDensityCalculator.tsx`
- Modify: `src/components/Tools/NitroxStickCalculator.tsx`

**Interfaces:**
- Consumes: `depthPerBar` from `@/lib/diveMath/modEnd`; `AIR_FO2` from `@/lib/diveMath/units`; `RECOMMENDED_MAX_DENSITY`/`HARD_MAX_DENSITY` (already imported in GasDensityCalculator).

- [ ] **Step 1: FormulaPanel footer**

In `src/components/Tools/FormulaPanel.tsx`, add the import:

```tsx
import { depthPerBar } from '@/lib/diveMath/modEnd'
```

Replace the footer text (lines 32-35) so the numbers come from `depthPerBar`:

```tsx
			<p className='text-light-text mt-4 text-xs italic'>
				Depths are converted to metres for the formulas (D₀ ={' '}
				{depthPerBar('salt')} m/bar salt, {depthPerBar('fresh')} m/bar fresh).
			</p>
```

- [ ] **Step 2: BestMixCalculator + ModEndCalculator d₀**

In `src/components/Tools/BestMixCalculator.tsx` and `src/components/Tools/ModEndCalculator.tsx`:
- Ensure `depthPerBar` is imported from `@/lib/diveMath/modEnd` (these files already import from that module — add `depthPerBar` to the existing import if not present).
- Replace the local `const d0 = water === 'fresh' ? 10.3 : 10` with:

```tsx
	const d0 = depthPerBar(water)
```

(The displayed MOD/END formulas already render `{d0}`, so they keep working and now track the module.)

- [ ] **Step 3: GasDensityCalculator prose**

In `src/components/Tools/GasDensityCalculator.tsx` (it already imports `RECOMMENDED_MAX_DENSITY` and `HARD_MAX_DENSITY`), replace the two prose literals:
- `Exceeds the 6.3 g/L hard limit.` → `Exceeds the {HARD_MAX_DENSITY} g/L hard limit.`
- `Above the 5.2 g/L recommended limit.` → `Above the {RECOMMENDED_MAX_DENSITY} g/L recommended limit.`

- [ ] **Step 4: NitroxStickCalculator threshold**

In `src/components/Tools/NitroxStickCalculator.tsx`, add `AIR_FO2` to the existing `@/lib/diveMath/units` import (the file already imports from units; add the name). Replace:

```tsx
	const leanWarning = targetFo2 <= 0.209
```
with:
```tsx
	const leanWarning = targetFo2 <= AIR_FO2
```

- [ ] **Step 5: Full gate**

Run: `npm test && npm run build && npm run lint && npm run knip`
Expected:
- Tests green (unchanged).
- Build clean; lint 0 errors (11 pre-existing warnings OK).
- Knip: no new findings — every new export (`Z_COEFF`, densities, `KELVIN_OFFSET`, `OTU_THRESHOLD_PPO2`, `OTU_EXPONENT`, `CNS_HALF_LIFE_MIN`) is now consumed by the reference page (and the OTU/CNS ones also internally). If knip flags any as unused, that export is missing a consumer — find and wire it, don't suppress.

Spot-check: the MOD/END/Best-Mix/Gas-Density/Nitrox sidebars and the reference page show the same numbers as before.

- [ ] **Step 6: Commit**

```bash
git add src/components/Tools/FormulaPanel.tsx src/components/Tools/BestMixCalculator.tsx src/components/Tools/ModEndCalculator.tsx src/components/Tools/GasDensityCalculator.tsx src/components/Tools/NitroxStickCalculator.tsx
git commit -m "refactor: calculator sidebars read constants from the math modules"
```

---

## Notes for the implementer

- Pure refactor — no displayed value may change. After each task, the rendered numbers must match what was there before; only their source changes.
- Inside `<Formula>` backtick strings, interpolate with `${CONST}`. In JSX text, switch to a `{CONST}` expression (split the surrounding text as needed). Don't introduce HTML entities inside template literals.
- If a `@/lib/diveMath/...` import already exists in a file, add the new name to that import rather than adding a duplicate import line.
- Don't touch the "left unchanged" items in the Global Constraints (RealGasNote, about page, OxygenLimitsNote daily prose, the `0.5` half-life base, the ModEnd "1.6" example).
