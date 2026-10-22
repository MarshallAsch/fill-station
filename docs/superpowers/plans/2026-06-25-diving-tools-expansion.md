# Diving Tools Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the public `/tools` section from 4 to 11 calculators (SAC/RMV and rock-bottom share one Gas Requirements tab) with grouped navigation, standard tank/mix presets, an independent flow-rate unit, a reference-only disclaimer, and an opt-in real-gas correction on blend/cascade.

**Architecture:** New pure math modules in `src/lib/diveMath/` (SI internally: bar gauge / litres / metres / litres-per-minute), each TDD-tested with Vitest. Thin `'use client'` components in `src/components/Tools/` convert at the boundary and reuse existing primitives. A tab registry drives two-level grouped navigation; reusable `TankSizePicker`/`MixPicker` populate fields from preset tables.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Headless UI, Vitest.

## Global Constraints

- Prettier: single quotes, no semicolons, tabs, 80-char width. Run `npm run lint` after every task.
- Theme tokens only (`bg-background`, `text-text`, `text-light-text`, `bg-accent`, `text-accent-text`, `border-border`, `bg-hover`, `border-accent`). No hardcoded Tailwind colors. No `dark:` variants of theme classes.
- `'use client'` on interactive components; the `src/app/tools/page.tsx` route stays a server component.
- Import alias `@/*` → `src/*`.
- Reuse `NumberInput`, `ListBox`, `RadioGroup`, `CheckBox` from `src/components/UI/FormElements/` — no raw `<input>`.
- Math modules contain NO React and NO unit-display logic. Fractions are decimals. Air FO₂ `0.209`, FN₂ `0.791`.
- Tests import `{ describe, it, expect }` from `'vitest'`, colocated as `src/lib/diveMath/<name>.test.ts`.
- If ESLint's `react-hooks/set-state-in-effect` fires, suppress with an inline `// eslint-disable-next-line react-hooks/set-state-in-effect` (existing repo pattern).
- Reference-only disclaimer copy (verbatim): **"For reference only. All results are estimates — independently verify and analyze every gas mix and dive plan before diving."**

---

### Task 1: units.ts — flow unit + restore fromLiters

**Files:**
- Modify: `src/lib/diveMath/units.ts`
- Test: `src/lib/diveMath/units.test.ts`

**Interfaces:**
- Consumes: existing `L_PER_CF`.
- Produces: `type FlowUnit = 'lpm' | 'cfm'`; `toLpm(value, unit): number`; `fromLpm(lpm, unit): number`; `fromLiters(l, unit): number` (restored).

- [ ] **Step 1: Add the failing tests**

Append to `src/lib/diveMath/units.test.ts` (add `fromLiters`, `toLpm`, `fromLpm` to the existing import from `./units`):

```ts
import { fromLiters, toLpm, fromLpm } from './units'

describe('volume (fromLiters)', () => {
	it('converts litres back to the display unit', () => {
		expect(fromLiters(28.3168466, 'cf')).toBeCloseTo(1, 4)
		expect(fromLiters(5, 'l')).toBe(5)
	})
})

describe('flow rate', () => {
	it('converts flow to litres-per-minute', () => {
		expect(toLpm(1, 'cfm')).toBeCloseTo(28.3168, 3)
		expect(toLpm(10, 'lpm')).toBe(10)
	})
	it('converts litres-per-minute back to the display unit', () => {
		expect(fromLpm(28.3168466, 'cfm')).toBeCloseTo(1, 4)
		expect(fromLpm(10, 'lpm')).toBe(10)
	})
})
```

(If `fromLiters` / `toLpm` / `fromLpm` are already in the existing single import line, merge them there instead of adding a second import.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/units.test.ts`
Expected: FAIL — `fromLiters`/`toLpm`/`fromLpm` not exported.

- [ ] **Step 3: Implement in units.ts**

Add the `FlowUnit` type after the existing unit types, and append these functions at the end of `src/lib/diveMath/units.ts`:

```ts
export type FlowUnit = 'lpm' | 'cfm'

export function fromLiters(l: number, unit: VolumeUnit): number {
	return unit === 'cf' ? l / L_PER_CF : l
}

export function toLpm(value: number, unit: FlowUnit): number {
	return unit === 'cfm' ? value * L_PER_CF : value
}

export function fromLpm(lpm: number, unit: FlowUnit): number {
	return unit === 'cfm' ? lpm / L_PER_CF : lpm
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/units.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
npm run lint
git add src/lib/diveMath/units.ts src/lib/diveMath/units.test.ts
git commit -m "feat: add flow unit and restore fromLiters in diveMath units"
```

---

### Task 2: modEnd.ts — ataAtDepth helper

**Files:**
- Modify: `src/lib/diveMath/modEnd.ts`
- Test: `src/lib/diveMath/modEnd.test.ts`

**Interfaces:**
- Consumes: existing `depthPerBar`, `Water`.
- Produces: `ataAtDepth(depthM: number, water: Water): number` = `depthM / depthPerBar(water) + 1`.

- [ ] **Step 1: Add the failing test**

Append to `src/lib/diveMath/modEnd.test.ts` (add `ataAtDepth` to the `./modEnd` import):

```ts
import { ataAtDepth } from './modEnd'

describe('ataAtDepth', () => {
	it('is 1 ata at the surface', () => {
		expect(ataAtDepth(0, 'salt')).toBe(1)
	})
	it('adds 1 ata per 10 m in salt water', () => {
		expect(ataAtDepth(30, 'salt')).toBeCloseTo(4, 6)
	})
	it('uses 10.3 m per bar in fresh water', () => {
		expect(ataAtDepth(10.3, 'fresh')).toBeCloseTo(2, 6)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/modEnd.test.ts`
Expected: FAIL — `ataAtDepth` not exported.

- [ ] **Step 3: Implement in modEnd.ts**

Add after `depthPerBar` in `src/lib/diveMath/modEnd.ts`:

```ts
export function ataAtDepth(depthM: number, water: Water): number {
	return depthM / depthPerBar(water) + 1
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/modEnd.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
npm run lint
git add src/lib/diveMath/modEnd.ts src/lib/diveMath/modEnd.test.ts
git commit -m "feat: add ataAtDepth helper to modEnd"
```

---

### Task 3: Add flow preference to UnitsProvider + UnitToggle

**Files:**
- Modify: `src/components/Tools/UnitsProvider.tsx`
- Modify: `src/components/Tools/UnitToggle.tsx`

**Interfaces:**
- Consumes: `FlowUnit` from `@/lib/diveMath/units`.
- Produces: `UnitPrefs` gains `flow: FlowUnit`; default `'cfm'`. `UnitToggle` `OPTIONS` gains a `flow` entry (lpm/cfm).

No unit tests (UI). Verified by `npm run build`.

- [ ] **Step 1: Extend UnitPrefs + defaults**

In `src/components/Tools/UnitsProvider.tsx`, update the import and the interface/defaults:

```tsx
import { DepthUnit, FlowUnit, PressureUnit, VolumeUnit } from '@/lib/diveMath/units'

export interface UnitPrefs {
	pressure: PressureUnit
	depth: DepthUnit
	volume: VolumeUnit
	flow: FlowUnit
}

const DEFAULT_UNITS: UnitPrefs = {
	pressure: 'psi',
	depth: 'ft',
	volume: 'cf',
	flow: 'cfm',
}
```

(The post-mount `{ ...DEFAULT_UNITS, ...JSON.parse(raw) }` merge already supplies `flow` for users with older stored prefs — no other change needed.)

- [ ] **Step 2: Add the flow toggle option**

In `src/components/Tools/UnitToggle.tsx`, add a `flow` entry to the `OPTIONS` record (after `volume`):

```tsx
	flow: {
		label: 'Flow',
		values: [
			{ value: 'lpm', label: 'LPM' },
			{ value: 'cfm', label: 'CFM' },
		],
	},
```

- [ ] **Step 3: Verify build + lint**

```bash
npm run build
npm run lint
```
Expected: build succeeds; lint clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/Tools/UnitsProvider.tsx src/components/Tools/UnitToggle.tsx
git commit -m "feat: add flow unit preference to tools units"
```

---

### Task 4: bestMix.ts

**Files:**
- Create: `src/lib/diveMath/bestMix.ts`
- Test: `src/lib/diveMath/bestMix.test.ts`

**Interfaces:**
- Consumes: `Water`, `depthPerBar`, `ataAtDepth` from `./modEnd`.
- Produces:
  - `bestFo2(input: { depthM: number; ppo2: number; water: Water }): number` (clamped ≤ 1)
  - `bestFhe(input: { depthM: number; targetEndM: number; water: Water }): number` (≥ 0)
  - `interface BestMix { fo2: number; fhe: number; fn2: number }`
  - `bestMix(input: { depthM: number; ppo2: number; targetEndM?: number; water: Water }): BestMix`

- [ ] **Step 1: Write the failing test**

Create `src/lib/diveMath/bestMix.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { bestFo2, bestFhe, bestMix } from './bestMix'

describe('bestFo2', () => {
	it('gives 0.35 for 30 m salt at ppO2 1.4', () => {
		expect(bestFo2({ depthM: 30, ppo2: 1.4, water: 'salt' })).toBeCloseTo(0.35, 4)
	})
	it('clamps to 1.0 in shallow water', () => {
		expect(bestFo2({ depthM: 3, ppo2: 1.4, water: 'salt' })).toBe(1)
	})
	it('is deeper-leaner: fresh gives a richer mix than salt at the same depth', () => {
		const salt = bestFo2({ depthM: 30, ppo2: 1.4, water: 'salt' })
		const fresh = bestFo2({ depthM: 30, ppo2: 1.4, water: 'fresh' })
		expect(fresh).toBeGreaterThan(salt)
	})
})

describe('bestFhe', () => {
	it('caps END at 30 m for a 60 m dive (salt)', () => {
		expect(bestFhe({ depthM: 60, targetEndM: 30, water: 'salt' })).toBeCloseTo(
			0.4286,
			3,
		)
	})
	it('returns 0 when the target END is at or beyond the depth', () => {
		expect(bestFhe({ depthM: 30, targetEndM: 30, water: 'salt' })).toBe(0)
	})
})

describe('bestMix', () => {
	it('returns fhe 0 when no END target is given', () => {
		const m = bestMix({ depthM: 30, ppo2: 1.4, water: 'salt' })
		expect(m.fhe).toBe(0)
		expect(m.fo2).toBeCloseTo(0.35, 4)
		expect(m.fn2).toBeCloseTo(0.65, 4)
	})
	it('fractions sum to 1', () => {
		const m = bestMix({ depthM: 60, ppo2: 1.4, targetEndM: 30, water: 'salt' })
		expect(m.fo2 + m.fhe + m.fn2).toBeCloseTo(1, 6)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/bestMix.test.ts`
Expected: FAIL — `Cannot find module './bestMix'`.

- [ ] **Step 3: Implement bestMix.ts**

```ts
import { ataAtDepth, depthPerBar, Water } from './modEnd'

export function bestFo2(input: {
	depthM: number
	ppo2: number
	water: Water
}): number {
	const { depthM, ppo2, water } = input
	return Math.min(1, ppo2 / ataAtDepth(depthM, water))
}

export function bestFhe(input: {
	depthM: number
	targetEndM: number
	water: Water
}): number {
	const { depthM, targetEndM, water } = input
	const d0 = depthPerBar(water)
	return Math.max(0, 1 - (targetEndM + d0) / (depthM + d0))
}

export interface BestMix {
	fo2: number
	fhe: number
	fn2: number
}

export function bestMix(input: {
	depthM: number
	ppo2: number
	targetEndM?: number
	water: Water
}): BestMix {
	const fo2 = bestFo2(input)
	const fhe =
		input.targetEndM === undefined
			? 0
			: bestFhe({
					depthM: input.depthM,
					targetEndM: input.targetEndM,
					water: input.water,
				})
	return { fo2, fhe, fn2: Math.max(0, 1 - fo2 - fhe) }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/bestMix.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
npm run lint
git add src/lib/diveMath/bestMix.ts src/lib/diveMath/bestMix.test.ts
git commit -m "feat: add best-mix math"
```

---

### Task 5: ead.ts

**Files:**
- Create: `src/lib/diveMath/ead.ts`
- Test: `src/lib/diveMath/ead.test.ts`

**Interfaces:**
- Consumes: `Water`, `depthPerBar` from `./modEnd`.
- Produces: `ead(input: { depthM: number; fo2: number; fhe: number; water: Water }): number`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/diveMath/ead.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { ead } from './ead'

describe('ead', () => {
	it('gives ~24.4 m for EAN32 at 30 m salt', () => {
		expect(ead({ depthM: 30, fo2: 0.32, fhe: 0, water: 'salt' })).toBeCloseTo(
			24.43,
			1,
		)
	})
	it('returns the dive depth for air', () => {
		expect(ead({ depthM: 30, fo2: 0.21, fhe: 0, water: 'salt' })).toBeCloseTo(
			30,
			4,
		)
	})
	it('richer nitrox gives a shallower EAD', () => {
		const lean = ead({ depthM: 30, fo2: 0.28, fhe: 0, water: 'salt' })
		const rich = ead({ depthM: 30, fo2: 0.36, fhe: 0, water: 'salt' })
		expect(rich).toBeLessThan(lean)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/ead.test.ts`
Expected: FAIL — `Cannot find module './ead'`.

- [ ] **Step 3: Implement ead.ts**

```ts
import { depthPerBar, Water } from './modEnd'

export function ead(input: {
	depthM: number
	fo2: number
	fhe: number
	water: Water
}): number {
	const { depthM, fo2, fhe, water } = input
	const d0 = depthPerBar(water)
	const fn2 = 1 - fo2 - fhe
	return (depthM + d0) * (fn2 / 0.79) - d0
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/ead.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
npm run lint
git add src/lib/diveMath/ead.ts src/lib/diveMath/ead.test.ts
git commit -m "feat: add equivalent air depth math"
```

---

### Task 6: gasDensity.ts

**Files:**
- Create: `src/lib/diveMath/gasDensity.ts`
- Test: `src/lib/diveMath/gasDensity.test.ts`

**Interfaces:**
- Consumes: `Water`, `depthPerBar`, `ataAtDepth` from `./modEnd`.
- Produces:
  - constants `RECOMMENDED_MAX_DENSITY = 5.2`, `HARD_MAX_DENSITY = 6.3`
  - `surfaceDensity(input: { fo2: number; fhe: number }): number`
  - `densityAtDepth(input: { fo2: number; fhe: number; depthM: number; water: Water }): number`
  - `depthForDensity(input: { fo2: number; fhe: number; density: number; water: Water }): number`

- [ ] **Step 1: Write the failing test**

Create `src/lib/diveMath/gasDensity.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
	surfaceDensity,
	densityAtDepth,
	depthForDensity,
	RECOMMENDED_MAX_DENSITY,
} from './gasDensity'

describe('gasDensity', () => {
	it('air surface density is ~1.29 g/L', () => {
		expect(surfaceDensity({ fo2: 0.21, fhe: 0 })).toBeCloseTo(1.288, 2)
	})
	it('EAN32 at 30 m salt reaches the ~5.2 g/L recommended limit', () => {
		const d = densityAtDepth({ fo2: 0.32, fhe: 0, depthM: 30, water: 'salt' })
		expect(d).toBeCloseTo(5.23, 1)
		expect(d).toBeGreaterThan(RECOMMENDED_MAX_DENSITY - 0.1)
	})
	it('trimix is less dense than nitrox at the same depth', () => {
		const nitrox = densityAtDepth({ fo2: 0.32, fhe: 0, depthM: 30, water: 'salt' })
		const trimix = densityAtDepth({ fo2: 0.18, fhe: 0.45, depthM: 30, water: 'salt' })
		expect(trimix).toBeLessThan(nitrox)
	})
	it('depthForDensity inverts densityAtDepth', () => {
		const depth = depthForDensity({
			fo2: 0.32,
			fhe: 0,
			density: 5.2,
			water: 'salt',
		})
		expect(
			densityAtDepth({ fo2: 0.32, fhe: 0, depthM: depth, water: 'salt' }),
		).toBeCloseTo(5.2, 4)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/gasDensity.test.ts`
Expected: FAIL — `Cannot find module './gasDensity'`.

- [ ] **Step 3: Implement gasDensity.ts**

```ts
import { ataAtDepth, depthPerBar, Water } from './modEnd'

// Gas densities at 0 °C, 1 atm (g/L).
const O2_DENSITY = 1.42897
const N2_DENSITY = 1.2506
const HE_DENSITY = 0.17846

export const RECOMMENDED_MAX_DENSITY = 5.2
export const HARD_MAX_DENSITY = 6.3

export function surfaceDensity(input: { fo2: number; fhe: number }): number {
	const { fo2, fhe } = input
	const fn2 = 1 - fo2 - fhe
	return fo2 * O2_DENSITY + fn2 * N2_DENSITY + fhe * HE_DENSITY
}

export function densityAtDepth(input: {
	fo2: number
	fhe: number
	depthM: number
	water: Water
}): number {
	const { fo2, fhe, depthM, water } = input
	return surfaceDensity({ fo2, fhe }) * ataAtDepth(depthM, water)
}

export function depthForDensity(input: {
	fo2: number
	fhe: number
	density: number
	water: Water
}): number {
	const { fo2, fhe, density, water } = input
	const surface = surfaceDensity({ fo2, fhe })
	return (density / surface - 1) * depthPerBar(water)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/gasDensity.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
npm run lint
git add src/lib/diveMath/gasDensity.ts src/lib/diveMath/gasDensity.test.ts
git commit -m "feat: add gas density math"
```

---

### Task 7: gasMixing.ts

**Files:**
- Create: `src/lib/diveMath/gasMixing.ts`
- Test: `src/lib/diveMath/gasMixing.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface GasFill { pressure: number; fo2: number; fhe: number }`
  - `mixTwoGases(a: GasFill, b: GasFill): GasFill` (pressure-weighted combine; `pa + pb <= 0` → `{ pressure: 0, fo2: a.fo2, fhe: a.fhe }`)

- [ ] **Step 1: Write the failing test**

Create `src/lib/diveMath/gasMixing.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mixTwoGases } from './gasMixing'

describe('mixTwoGases', () => {
	it('combines equal pressures of air and EAN36 to ~EAN28.5', () => {
		const r = mixTwoGases(
			{ pressure: 100, fo2: 0.21, fhe: 0 },
			{ pressure: 100, fo2: 0.36, fhe: 0 },
		)
		expect(r.pressure).toBe(200)
		expect(r.fo2).toBeCloseTo(0.285, 4)
		expect(r.fhe).toBe(0)
	})
	it('dilutes helium when topping trimix with air', () => {
		const r = mixTwoGases(
			{ pressure: 100, fo2: 0.18, fhe: 0.45 },
			{ pressure: 100, fo2: 0.21, fhe: 0 },
		)
		expect(r.fhe).toBeCloseTo(0.225, 4)
		expect(r.fo2).toBeCloseTo(0.195, 4)
	})
	it('returns the other gas mix when one side has zero pressure', () => {
		const r = mixTwoGases(
			{ pressure: 0, fo2: 0.21, fhe: 0 },
			{ pressure: 150, fo2: 0.32, fhe: 0 },
		)
		expect(r.pressure).toBe(150)
		expect(r.fo2).toBeCloseTo(0.32, 4)
	})
	it('returns an empty result when both pressures are zero', () => {
		const r = mixTwoGases(
			{ pressure: 0, fo2: 0.5, fhe: 0.1 },
			{ pressure: 0, fo2: 0.32, fhe: 0 },
		)
		expect(r).toEqual({ pressure: 0, fo2: 0.5, fhe: 0.1 })
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/gasMixing.test.ts`
Expected: FAIL — `Cannot find module './gasMixing'`.

- [ ] **Step 3: Implement gasMixing.ts**

```ts
export interface GasFill {
	pressure: number
	fo2: number
	fhe: number
}

export function mixTwoGases(a: GasFill, b: GasFill): GasFill {
	const pf = a.pressure + b.pressure
	if (pf <= 0) {
		return { pressure: 0, fo2: a.fo2, fhe: a.fhe }
	}
	return {
		pressure: pf,
		fo2: (a.fo2 * a.pressure + b.fo2 * b.pressure) / pf,
		fhe: (a.fhe * a.pressure + b.fhe * b.pressure) / pf,
	}
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/gasMixing.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
npm run lint
git add src/lib/diveMath/gasMixing.ts src/lib/diveMath/gasMixing.test.ts
git commit -m "feat: add two-gas mixing math"
```

---

### Task 8: oxygenExposure.ts

**Files:**
- Create: `src/lib/diveMath/oxygenExposure.ts`
- Test: `src/lib/diveMath/oxygenExposure.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `cnsLimitMinutes(ppo2: number): number` (interpolated NOAA single-exposure limit; `Infinity` below 0.6)
  - `segmentCns(input: { ppo2: number; minutes: number }): number`
  - `segmentOtu(input: { ppo2: number; minutes: number }): number`
  - `type DayItem = { type: 'dive'; ppo2: number; minutes: number } | { type: 'surface'; minutes: number }`
  - `interface DayResult { peakCnsPercent: number; endCnsPercent: number; totalOtu: number; perDive: { cnsPercent: number; otu: number }[] }`
  - `computeDay(items: DayItem[]): DayResult`

- [ ] **Step 1: Write the failing test**

Create `src/lib/diveMath/oxygenExposure.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
	cnsLimitMinutes,
	segmentCns,
	segmentOtu,
	computeDay,
} from './oxygenExposure'

describe('cnsLimitMinutes', () => {
	it('matches the NOAA table at exact points', () => {
		expect(cnsLimitMinutes(1.4)).toBe(150)
		expect(cnsLimitMinutes(1.6)).toBe(45)
	})
	it('interpolates between table rows', () => {
		expect(cnsLimitMinutes(1.35)).toBeCloseTo(165, 0)
	})
	it('has no limit below 0.6', () => {
		expect(cnsLimitMinutes(0.5)).toBe(Infinity)
	})
})

describe('segmentCns / segmentOtu', () => {
	it('computes CNS percent from time and limit', () => {
		expect(segmentCns({ ppo2: 1.4, minutes: 100 })).toBeCloseTo(66.67, 1)
	})
	it('computes OTU from the REPEX power law', () => {
		expect(segmentOtu({ ppo2: 1.4, minutes: 100 })).toBeCloseTo(162.88, 1)
	})
	it('accrues no OTU at or below ppO2 0.5', () => {
		expect(segmentOtu({ ppo2: 0.5, minutes: 60 })).toBe(0)
	})
})

describe('computeDay', () => {
	it('sums a single dive', () => {
		const r = computeDay([{ type: 'dive', ppo2: 1.4, minutes: 75 }])
		expect(r.peakCnsPercent).toBeCloseTo(50, 1)
		expect(r.endCnsPercent).toBeCloseTo(50, 1)
		expect(r.perDive).toHaveLength(1)
	})
	it('decays CNS across a surface interval (90-min half-time)', () => {
		const r = computeDay([
			{ type: 'dive', ppo2: 1.4, minutes: 75 },
			{ type: 'surface', minutes: 90 },
			{ type: 'dive', ppo2: 1.4, minutes: 75 },
		])
		// after dive1: 50; after 90-min SI: 25; after dive2: 75
		expect(r.endCnsPercent).toBeCloseTo(75, 1)
		expect(r.peakCnsPercent).toBeCloseTo(75, 1)
		// OTU is additive (no surface decay)
		expect(r.totalOtu).toBeCloseTo(2 * segmentOtu({ ppo2: 1.4, minutes: 75 }), 4)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/oxygenExposure.test.ts`
Expected: FAIL — `Cannot find module './oxygenExposure'`.

- [ ] **Step 3: Implement oxygenExposure.ts**

```ts
// NOAA single-exposure CNS limits: ppO2 (ata) -> max minutes.
const CNS_TABLE: [number, number][] = [
	[0.6, 720],
	[0.7, 570],
	[0.8, 450],
	[0.9, 360],
	[1.0, 300],
	[1.1, 240],
	[1.2, 210],
	[1.3, 180],
	[1.4, 150],
	[1.5, 120],
	[1.6, 45],
]

export function cnsLimitMinutes(ppo2: number): number {
	if (ppo2 < CNS_TABLE[0][0]) return Infinity
	const last = CNS_TABLE[CNS_TABLE.length - 1]
	if (ppo2 >= last[0]) return last[1]
	for (let i = 0; i < CNS_TABLE.length - 1; i++) {
		const [p0, l0] = CNS_TABLE[i]
		const [p1, l1] = CNS_TABLE[i + 1]
		if (ppo2 >= p0 && ppo2 <= p1) {
			const t = (ppo2 - p0) / (p1 - p0)
			return l0 + t * (l1 - l0)
		}
	}
	return last[1]
}

export function segmentCns(input: { ppo2: number; minutes: number }): number {
	const limit = cnsLimitMinutes(input.ppo2)
	if (!Number.isFinite(limit)) return 0
	return (input.minutes / limit) * 100
}

export function segmentOtu(input: { ppo2: number; minutes: number }): number {
	if (input.ppo2 <= 0.5) return 0
	return input.minutes * Math.pow((input.ppo2 - 0.5) / 0.5, 0.83)
}

export type DayItem =
	| { type: 'dive'; ppo2: number; minutes: number }
	| { type: 'surface'; minutes: number }

export interface DayResult {
	peakCnsPercent: number
	endCnsPercent: number
	totalOtu: number
	perDive: { cnsPercent: number; otu: number }[]
}

export function computeDay(items: DayItem[]): DayResult {
	let running = 0
	let peak = 0
	let totalOtu = 0
	const perDive: { cnsPercent: number; otu: number }[] = []

	for (const item of items) {
		if (item.type === 'surface') {
			running *= Math.pow(0.5, item.minutes / 90)
			continue
		}
		const cns = segmentCns({ ppo2: item.ppo2, minutes: item.minutes })
		const otu = segmentOtu({ ppo2: item.ppo2, minutes: item.minutes })
		running += cns
		totalOtu += otu
		peak = Math.max(peak, running)
		perDive.push({ cnsPercent: cns, otu })
	}

	return { peakCnsPercent: peak, endCnsPercent: running, totalOtu, perDive }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/oxygenExposure.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
npm run lint
git add src/lib/diveMath/oxygenExposure.ts src/lib/diveMath/oxygenExposure.test.ts
git commit -m "feat: add full-day oxygen exposure (CNS/OTU) math"
```

---

### Task 9: gasPlanning.ts

**Files:**
- Create: `src/lib/diveMath/gasPlanning.ts`
- Test: `src/lib/diveMath/gasPlanning.test.ts`

**Interfaces:**
- Consumes: `Water`, `ataAtDepth` from `./modEnd`.
- Produces:
  - `sacRate(input: { startP: number; endP: number; minutes: number; avgDepthM: number; water: Water }): number` (bar/min, surface-normalized)
  - `rmv(input: { startP: number; endP: number; minutes: number; avgDepthM: number; tankVolumeL: number; water: Water }): number` (L/min)
  - `diveGasRequirement(input: { rmvLpm: number; avgDepthM: number; minutes: number; water: Water }): number` (surface L)
  - `interface Stop { depthM: number; minutes: number }`
  - `rockBottom(input: { rmvLpm: number; depthM: number; ascentRateMpm: number; stops: Stop[]; stressFactor: number; water: Water; teamSize: number }): number` (surface L)
  - `minGasPressure(input: { minGasL: number; tankVolumeL: number }): number` (bar)

- [ ] **Step 1: Write the failing test**

Create `src/lib/diveMath/gasPlanning.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
	sacRate,
	rmv,
	diveGasRequirement,
	rockBottom,
	minGasPressure,
} from './gasPlanning'

describe('sacRate / rmv', () => {
	it('derives SAC and RMV from a logged dive', () => {
		const args = {
			startP: 200,
			endP: 100,
			minutes: 20,
			avgDepthM: 20,
			water: 'salt' as const,
		}
		expect(sacRate(args)).toBeCloseTo(1.6667, 3)
		expect(rmv({ ...args, tankVolumeL: 12 })).toBeCloseTo(20, 2)
	})
})

describe('diveGasRequirement', () => {
	it('scales with depth ata and time', () => {
		expect(
			diveGasRequirement({ rmvLpm: 20, avgDepthM: 20, minutes: 20, water: 'salt' }),
		).toBeCloseTo(1200, 1)
	})
})

describe('rockBottom / minGasPressure', () => {
	const base = {
		rmvLpm: 20,
		depthM: 30,
		ascentRateMpm: 9,
		stops: [{ depthM: 5, minutes: 3 }],
		stressFactor: 2,
		water: 'salt' as const,
		teamSize: 2,
	}
	it('computes minimum gas for a 30 m dive', () => {
		// ascent: stressedRmv 40 * ata(15)=2.5 * (30/9=3.333) = 333.33
		// stop: 40 * ata(5)=1.5 * 3 = 180 ; team 2 -> 1026.67 L
		expect(rockBottom(base)).toBeCloseTo(1026.67, 0)
	})
	it('scales linearly with team size', () => {
		const solo = rockBottom({ ...base, teamSize: 1 })
		expect(rockBottom(base)).toBeCloseTo(2 * solo, 4)
	})
	it('converts minimum gas to tank pressure', () => {
		expect(minGasPressure({ minGasL: 1026.67, tankVolumeL: 12 })).toBeCloseTo(
			85.56,
			1,
		)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/gasPlanning.test.ts`
Expected: FAIL — `Cannot find module './gasPlanning'`.

- [ ] **Step 3: Implement gasPlanning.ts**

```ts
import { ataAtDepth, Water } from './modEnd'

export function sacRate(input: {
	startP: number
	endP: number
	minutes: number
	avgDepthM: number
	water: Water
}): number {
	const { startP, endP, minutes, avgDepthM, water } = input
	return (startP - endP) / minutes / ataAtDepth(avgDepthM, water)
}

export function rmv(input: {
	startP: number
	endP: number
	minutes: number
	avgDepthM: number
	tankVolumeL: number
	water: Water
}): number {
	return sacRate(input) * input.tankVolumeL
}

export function diveGasRequirement(input: {
	rmvLpm: number
	avgDepthM: number
	minutes: number
	water: Water
}): number {
	const { rmvLpm, avgDepthM, minutes, water } = input
	return rmvLpm * ataAtDepth(avgDepthM, water) * minutes
}

export interface Stop {
	depthM: number
	minutes: number
}

export function rockBottom(input: {
	rmvLpm: number
	depthM: number
	ascentRateMpm: number
	stops: Stop[]
	stressFactor: number
	water: Water
	teamSize: number
}): number {
	const { rmvLpm, depthM, ascentRateMpm, stops, stressFactor, water, teamSize } =
		input
	const stressedRmv = rmvLpm * stressFactor
	const ascentMinutes = depthM / ascentRateMpm
	const ascentGas =
		stressedRmv * ataAtDepth(depthM / 2, water) * ascentMinutes
	const stopGas = stops.reduce(
		(sum, s) => sum + stressedRmv * ataAtDepth(s.depthM, water) * s.minutes,
		0,
	)
	return (ascentGas + stopGas) * teamSize
}

export function minGasPressure(input: {
	minGasL: number
	tankVolumeL: number
}): number {
	if (input.tankVolumeL <= 0) return Infinity
	return input.minGasL / input.tankVolumeL
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/gasPlanning.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
npm run lint
git add src/lib/diveMath/gasPlanning.ts src/lib/diveMath/gasPlanning.test.ts
git commit -m "feat: add SAC/RMV and rock-bottom gas planning math"
```

---

### Task 10: compressibility.ts

**Files:**
- Create: `src/lib/diveMath/compressibility.ts`
- Test: `src/lib/diveMath/compressibility.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type Gas = 'o2' | 'n2' | 'he'`
  - `gasZ(gas: Gas, pressureBar: number): number`
  - `mixZ(input: { fo2: number; fhe: number; pressureBar: number }): number`

This is a documented first-order approximation (linear per-gas Z over 0–300 bar). It is opt-in and covered by the reference-only disclaimer.

- [ ] **Step 1: Write the failing test**

Create `src/lib/diveMath/compressibility.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { gasZ, mixZ } from './compressibility'

describe('gasZ', () => {
	it('is ~1 at the surface for every gas', () => {
		expect(gasZ('o2', 0)).toBe(1)
		expect(gasZ('n2', 0)).toBe(1)
		expect(gasZ('he', 0)).toBe(1)
	})
	it('oxygen compresses more than ideal at pressure (Z < 1)', () => {
		expect(gasZ('o2', 200)).toBeLessThan(1)
	})
	it('helium is less compressible than ideal (Z > 1)', () => {
		expect(gasZ('he', 200)).toBeGreaterThan(1)
	})
})

describe('mixZ', () => {
	it('is ~1 at the surface', () => {
		expect(mixZ({ fo2: 0.32, fhe: 0, pressureBar: 0 })).toBeCloseTo(1, 6)
	})
	it('a helium-rich mix has a higher Z than air at pressure', () => {
		const air = mixZ({ fo2: 0.21, fhe: 0, pressureBar: 200 })
		const trimix = mixZ({ fo2: 0.21, fhe: 0.55, pressureBar: 200 })
		expect(trimix).toBeGreaterThan(air)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/compressibility.test.ts`
Expected: FAIL — `Cannot find module './compressibility'`.

- [ ] **Step 3: Implement compressibility.ts**

```ts
// First-order real-gas approximation. Per-gas compressibility modeled as a
// linear function of pressure, Z(P) = 1 + k * P (P in bar), with coefficients
// chosen so that at ~200 bar: O2 ≈ 0.95, N2 ≈ 1.02, He ≈ 1.10 — the directional
// behavior of published Z data near room temperature. Opt-in and approximate;
// covered by the reference-only disclaimer.
export type Gas = 'o2' | 'n2' | 'he'

const Z_COEFF: Record<Gas, number> = {
	o2: -0.00025,
	n2: 0.0001,
	he: 0.0005,
}

export function gasZ(gas: Gas, pressureBar: number): number {
	return 1 + Z_COEFF[gas] * pressureBar
}

export function mixZ(input: {
	fo2: number
	fhe: number
	pressureBar: number
}): number {
	const { fo2, fhe, pressureBar } = input
	const fn2 = 1 - fo2 - fhe
	return (
		fo2 * gasZ('o2', pressureBar) +
		fhe * gasZ('he', pressureBar) +
		fn2 * gasZ('n2', pressureBar)
	)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/compressibility.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
npm run lint
git add src/lib/diveMath/compressibility.ts src/lib/diveMath/compressibility.test.ts
git commit -m "feat: add gas compressibility (Z-factor) model"
```

---

### Task 11: Real-gas opt-in for blend + cascade

**Files:**
- Modify: `src/lib/diveMath/blending.ts`
- Modify: `src/lib/diveMath/cascade.ts`
- Test: `src/lib/diveMath/blending.test.ts`, `src/lib/diveMath/cascade.test.ts`

**Interfaces:**
- Consumes: `gasZ`, `mixZ` from `./compressibility`.
- Produces:
  - `calculateBlend(input, opts?: { useRealGas?: boolean }): BlendResult` — default/`false` is byte-for-byte the current behavior. Real-gas path: `pHe *= gasZ('he', finalPressure)`, `pO2 *= gasZ('o2', finalPressure)`, then `pTop = pf - pi - pHe - pO2`; `addHeTo`/`addO2To`/`topTo` recomputed.
  - `calculateCascade(input, opts?: { useRealGas?: boolean }): CascadeResult` — default unchanged. Real-gas path weights each side of the equalization by `V / mixZ(air, absolutePressure)`.

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/diveMath/blending.test.ts`:

```ts
describe('calculateBlend real-gas opt-in', () => {
	const input = {
		startPressure: 0,
		startFo2: 0.209,
		startFhe: 0,
		finalPressure: 200,
		targetFo2: 0.32,
		targetFhe: 0,
	}
	it('is unchanged when useRealGas is false or omitted', () => {
		const a = calculateBlend(input)
		const b = calculateBlend(input, { useRealGas: false })
		expect(b).toEqual(a)
	})
	it('needs less O2 pressure for a nitrox blend (O2 Z < 1)', () => {
		const ideal = calculateBlend(input)
		const real = calculateBlend(input, { useRealGas: true })
		expect(real.pO2).toBeLessThan(ideal.pO2)
	})
	it('needs more helium pressure for a trimix blend (He Z > 1)', () => {
		const tmx = {
			startPressure: 0,
			startFo2: 0.209,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.18,
			targetFhe: 0.45,
		}
		const ideal = calculateBlend(tmx)
		const real = calculateBlend(tmx, { useRealGas: true })
		expect(real.pHe).toBeGreaterThan(ideal.pHe)
	})
})
```

Append to `src/lib/diveMath/cascade.test.ts`:

```ts
describe('calculateCascade real-gas opt-in', () => {
	const input = {
		banks: [{ volume: 50, pressure: 200 }],
		target: { volume: 10, startPressure: 0 },
	}
	it('is unchanged when useRealGas is false or omitted', () => {
		const a = calculateCascade(input)
		const b = calculateCascade(input, { useRealGas: false })
		expect(b).toEqual(a)
	})
	it('returns a finite, close result with real-gas weighting', () => {
		const ideal = calculateCascade(input)
		const real = calculateCascade(input, { useRealGas: true })
		expect(Number.isFinite(real.finalPressure)).toBe(true)
		expect(Math.abs(real.finalPressure - ideal.finalPressure)).toBeLessThan(10)
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test src/lib/diveMath/blending.test.ts src/lib/diveMath/cascade.test.ts`
Expected: FAIL — `calculateBlend`/`calculateCascade` reject the second argument / behavior not implemented.

- [ ] **Step 3: Implement the blend real-gas path**

In `src/lib/diveMath/blending.ts`, add the import and change the signature + the partial-pressure block:

```ts
import { gasZ } from './compressibility'
```

Change `export function calculateBlend(input: BlendInput): BlendResult {` to:

```ts
export function calculateBlend(
	input: BlendInput,
	opts?: { useRealGas?: boolean },
): BlendResult {
```

After the existing `pO2` calculation and before `const pTop = ...`, insert the correction, then make `pHe`/`pO2`/`pTop` reflect it. Replace the `const pHe = ...`, `const pO2 = ...`, `const pTop = ...` trio with:

```ts
	// He balance: startFhe*pi + pHe = targetFhe*pf
	let pHe = targetFhe * pf - startFhe * pi
	// O2 balance with air top (top FO2 = AIR_FO2, top FHe = 0):
	let pO2 =
		(targetFo2 * pf - startFo2 * pi - AIR_FO2 * (pf - pi - pHe)) /
		(1 - AIR_FO2)
	if (opts?.useRealGas) {
		// Real moles ∝ P/Z, so the gauge pressure to add for a target quantity
		// scales by that gas's Z at the final pressure.
		pHe *= gasZ('he', pf)
		pO2 *= gasZ('o2', pf)
	}
	const pTop = pf - pi - pHe - pO2
```

(Leave the feasibility checks and `return` block as-is; they already consume `pHe`/`pO2`/`pTop`.)

- [ ] **Step 4: Implement the cascade real-gas path**

In `src/lib/diveMath/cascade.ts`, add the import and change the signature, then weight the equalization by `V / mixZ(air, absPressure)` when `useRealGas`:

```ts
import { mixZ } from './compressibility'
```

Change `export function calculateCascade(input: CascadeInput): CascadeResult {` to:

```ts
export function calculateCascade(
	input: CascadeInput,
	opts?: { useRealGas?: boolean },
): CascadeResult {
```

Inside the `for (const i of order)` loop, replace the equalization line
`const eqAbs = (targetAbs * vt + bankAbs * vb) / (vt + vb)` with:

```ts
		const useReal = opts?.useRealGas === true
		const zt = useReal ? mixZ({ fo2: 0.209, fhe: 0, pressureBar: targetAbs }) : 1
		const zb = useReal ? mixZ({ fo2: 0.209, fhe: 0, pressureBar: bankAbs }) : 1
		const wt = vt / zt
		const wb = vb / zb
		const eqAbs = (targetAbs * wt + bankAbs * wb) / (wt + wb)
```

(When `useRealGas` is false, `zt = zb = 1`, so `eqAbs` is identical to the current formula — the default path is unchanged.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/blending.test.ts src/lib/diveMath/cascade.test.ts`
Expected: PASS (including the pre-existing ideal-gas tests).

- [ ] **Step 6: Run the full suite**

Run: `npm test`
Expected: PASS (all diveMath modules).

- [ ] **Step 7: Lint + commit**

```bash
npm run lint
git add src/lib/diveMath/blending.ts src/lib/diveMath/cascade.ts src/lib/diveMath/blending.test.ts src/lib/diveMath/cascade.test.ts
git commit -m "feat: add opt-in real-gas correction to blend and cascade"
```

---

### Task 12: presets.ts (tank + mix data)

**Files:**
- Create: `src/components/Tools/presets.ts`
- Test: `src/components/Tools/presets.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface TankPreset { name: string; waterVolumeL: number; ratedBar: number }`
  - `DIVE_TANKS`, `STORAGE_TANKS`, `INDUSTRIAL_TANKS: TankPreset[]`
  - `interface MixPreset { name: string; fo2: number; fhe: number }`
  - `MIXES: MixPreset[]`

Note: `presets.test.ts` lives under `src/components/Tools/`. Vitest's `include`
is `src/**/*.test.ts`, so it is picked up automatically.

- [ ] **Step 1: Write the failing test**

Create `src/components/Tools/presets.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
	DIVE_TANKS,
	STORAGE_TANKS,
	INDUSTRIAL_TANKS,
	MIXES,
} from './presets'

describe('tank presets', () => {
	it('all tanks have positive water volume and rated pressure', () => {
		for (const t of [...DIVE_TANKS, ...STORAGE_TANKS, ...INDUSTRIAL_TANKS]) {
			expect(t.waterVolumeL).toBeGreaterThan(0)
			expect(t.ratedBar).toBeGreaterThan(0)
			expect(t.name.length).toBeGreaterThan(0)
		}
	})
	it('includes the sourced industrial T and K bottles', () => {
		const names = INDUSTRIAL_TANKS.map((t) => t.name)
		expect(names.some((n) => n.includes('T'))).toBe(true)
		expect(names.some((n) => n.includes('K'))).toBe(true)
		expect(INDUSTRIAL_TANKS).toHaveLength(4)
	})
})

describe('mix presets', () => {
	it('every mix has valid fractions summing to <= 1', () => {
		for (const m of MIXES) {
			expect(m.fo2).toBeGreaterThan(0)
			expect(m.fo2).toBeLessThanOrEqual(1)
			expect(m.fhe).toBeGreaterThanOrEqual(0)
			expect(m.fo2 + m.fhe).toBeLessThanOrEqual(1 + 1e-9)
		}
	})
	it('includes EAN80 and 100% O2', () => {
		expect(MIXES.some((m) => m.fo2 === 0.8 && m.fhe === 0)).toBe(true)
		expect(MIXES.some((m) => m.fo2 === 1 && m.fhe === 0)).toBe(true)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/Tools/presets.test.ts`
Expected: FAIL — `Cannot find module './presets'`.

- [ ] **Step 3: Implement presets.ts**

```ts
export interface TankPreset {
	name: string
	waterVolumeL: number
	ratedBar: number
}

// Common scuba cylinders — water (internal) volume in litres, rated pressure in bar.
export const DIVE_TANKS: TankPreset[] = [
	{ name: 'AL80 (S80)', waterVolumeL: 11.1, ratedBar: 207 },
	{ name: 'AL63', waterVolumeL: 9.0, ratedBar: 207 },
	{ name: 'AL40', waterVolumeL: 5.7, ratedBar: 207 },
	{ name: 'AL30 (pony)', waterVolumeL: 4.3, ratedBar: 207 },
	{ name: 'HP100', waterVolumeL: 12.9, ratedBar: 237 },
	{ name: 'HP117', waterVolumeL: 15.0, ratedBar: 237 },
	{ name: 'HP130', waterVolumeL: 16.6, ratedBar: 237 },
	{ name: 'LP85', waterVolumeL: 11.1, ratedBar: 182 },
	{ name: 'LP95', waterVolumeL: 12.4, ratedBar: 182 },
	{ name: 'Steel 12 L', waterVolumeL: 12.0, ratedBar: 232 },
	{ name: 'Steel 15 L', waterVolumeL: 15.0, ratedBar: 232 },
	{ name: 'Steel 7 L (stage)', waterVolumeL: 7.0, ratedBar: 232 },
	{ name: 'Steel 3 L (pony)', waterVolumeL: 3.0, ratedBar: 232 },
]

// Cascade/storage bank cylinders.
export const STORAGE_TANKS: TankPreset[] = [
	{ name: 'UN 45 L (310 bar)', waterVolumeL: 45, ratedBar: 310 },
	{ name: 'UN 50 L (300 bar)', waterVolumeL: 50, ratedBar: 300 },
	{ name: 'UN 50 L (232 bar)', waterVolumeL: 50, ratedBar: 232 },
]

// Industrial O2/He supply bottles. Values from Airgas / Praxair (Linde NA) /
// Messer spec sheets. "T" and "K" follow the Airgas/Praxair US convention;
// Linde/Messer (EU) rate the equivalent bottles by litre.
// Sources: Airgas Specialty Gas Cylinder Dimensions (ap003.pdf), Airgas Size
// Comparison Chart (ap004.pdf), Praxair/Linde Cylinders & Containers, Messer
// Reine Gase 2021.
export const INDUSTRIAL_TANKS: TankPreset[] = [
	{ name: 'T cylinder (Airgas 300)', waterVolumeL: 49, ratedBar: 165 },
	{ name: 'K cylinder (Airgas 200)', waterVolumeL: 43.8, ratedBar: 156 },
	{ name: 'Linde/Messer 50 L (200 bar)', waterVolumeL: 50, ratedBar: 200 },
	{ name: 'Linde/Messer 50 L (300 bar)', waterVolumeL: 50, ratedBar: 300 },
]

export interface MixPreset {
	name: string
	fo2: number
	fhe: number
}

export const MIXES: MixPreset[] = [
	{ name: 'Air', fo2: 0.21, fhe: 0 },
	{ name: 'EAN28', fo2: 0.28, fhe: 0 },
	{ name: 'EAN32', fo2: 0.32, fhe: 0 },
	{ name: 'EAN36', fo2: 0.36, fhe: 0 },
	{ name: 'EAN40', fo2: 0.4, fhe: 0 },
	{ name: 'EAN50', fo2: 0.5, fhe: 0 },
	{ name: 'EAN80', fo2: 0.8, fhe: 0 },
	{ name: 'Oxygen 100%', fo2: 1.0, fhe: 0 },
	{ name: 'Trimix 21/35', fo2: 0.21, fhe: 0.35 },
	{ name: 'Trimix 18/45', fo2: 0.18, fhe: 0.45 },
	{ name: 'Trimix 15/55', fo2: 0.15, fhe: 0.55 },
	{ name: 'Trimix 10/70', fo2: 0.1, fhe: 0.7 },
]
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/components/Tools/presets.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
npm run lint
git add src/components/Tools/presets.ts src/components/Tools/presets.test.ts
git commit -m "feat: add tank and mix presets"
```

---

### Task 13: TankSizePicker

**Files:**
- Create: `src/components/Tools/TankSizePicker.tsx`

**Interfaces:**
- Consumes: `ListBox` from `@/components/UI/FormElements/ListBox`; `DIVE_TANKS`, `STORAGE_TANKS`, `INDUSTRIAL_TANKS`, `TankPreset` from `./presets`.
- Produces: `TankSizePicker({ category, onSelect }: { category: 'dive' | 'storage' | 'industrial'; onSelect: (waterVolumeL: number, ratedBar: number) => void })`.

No unit test (UI). Verified by build.

- [ ] **Step 1: Implement TankSizePicker.tsx**

```tsx
'use client'

import ListBox from '@/components/UI/FormElements/ListBox'
import {
	DIVE_TANKS,
	INDUSTRIAL_TANKS,
	STORAGE_TANKS,
	TankPreset,
} from './presets'

const LISTS: Record<'dive' | 'storage' | 'industrial', TankPreset[]> = {
	dive: DIVE_TANKS,
	storage: STORAGE_TANKS,
	industrial: INDUSTRIAL_TANKS,
}

const CUSTOM = 'custom'

const TankSizePicker = ({
	category,
	onSelect,
}: {
	category: 'dive' | 'storage' | 'industrial'
	onSelect: (waterVolumeL: number, ratedBar: number) => void
}) => {
	const presets = LISTS[category]
	const items = [
		{ value: CUSTOM, name: 'Custom…' },
		...presets.map((p) => ({ value: p.name, name: p.name })),
	]

	return (
		<ListBox
			id={`tank-${category}`}
			name={`tank-${category}`}
			title='Standard size'
			items={items}
			defaultValue={items[0]}
			onChange={(item) => {
				if (item.value === CUSTOM) return
				const preset = presets.find((p) => p.name === item.value)
				if (preset) onSelect(preset.waterVolumeL, preset.ratedBar)
			}}
		/>
	)
}

export default TankSizePicker
```

- [ ] **Step 2: Verify build + lint**

```bash
npm run build
npm run lint
```
Expected: build succeeds; lint clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/Tools/TankSizePicker.tsx
git commit -m "feat: add reusable tank size picker"
```

---

### Task 14: MixPicker

**Files:**
- Create: `src/components/Tools/MixPicker.tsx`

**Interfaces:**
- Consumes: `ListBox`; `MIXES`, `MixPreset` from `./presets`.
- Produces: `MixPicker({ onSelect }: { onSelect: (fo2Pct: number, fhePct: number) => void })` — emits percentages (e.g. `32`, `0`).

No unit test (UI). Verified by build.

- [ ] **Step 1: Implement MixPicker.tsx**

```tsx
'use client'

import ListBox from '@/components/UI/FormElements/ListBox'
import { MIXES } from './presets'

const CUSTOM = 'custom'

const MixPicker = ({
	onSelect,
	id = 'mix',
}: {
	onSelect: (fo2Pct: number, fhePct: number) => void
	id?: string
}) => {
	const items = [
		{ value: CUSTOM, name: 'Custom…' },
		...MIXES.map((m) => ({ value: m.name, name: m.name })),
	]

	return (
		<ListBox
			id={id}
			name={id}
			title='Standard mix'
			items={items}
			defaultValue={items[0]}
			onChange={(item) => {
				if (item.value === CUSTOM) return
				const mix = MIXES.find((m) => m.name === item.value)
				if (mix) onSelect(Math.round(mix.fo2 * 100), Math.round(mix.fhe * 100))
			}}
		/>
	)
}

export default MixPicker
```

- [ ] **Step 2: Verify build + lint**

```bash
npm run build
npm run lint
```
Expected: build succeeds; lint clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/Tools/MixPicker.tsx
git commit -m "feat: add reusable mix picker"
```

---

### Task 15: Grouped navigation — tab registry + ToolsTabs/ToolsPage rewrite + disclaimer

**Files:**
- Create: `src/components/Tools/toolsRegistry.ts`
- Modify: `src/components/Tools/ToolsTabs.tsx`
- Modify: `src/components/Tools/ToolsPage.tsx`

**Interfaces:**
- Consumes: existing calculator components.
- Produces:
  - `toolsRegistry.ts`: `type ToolGroup = 'blending' | 'planning'`; `type TabId` (string union of the 4 current ids, extended in later tasks); `interface ToolDef { id: TabId; name: string; group: ToolGroup; Component: React.ComponentType }`; `TOOLS: ToolDef[]`; `GROUPS: { id: ToolGroup; name: string }[]`.
  - `ToolsTabs({ active, onChange }: { active: TabId; onChange: (id: TabId) => void })` — renders a group selector + the active group's tabs.

This task keeps the existing 4 calculators, just regrouped. Later tasks append new entries to `TOOLS`.

- [ ] **Step 1: Create toolsRegistry.ts**

```ts
import { ComponentType } from 'react'
import BlendCalculator from './BlendCalculator'
import CascadeCalculator from './CascadeCalculator'
import ModEndCalculator from './ModEndCalculator'
import NitroxStickCalculator from './NitroxStickCalculator'

export type ToolGroup = 'blending' | 'planning'

export type TabId =
	| 'cascade'
	| 'nitrox-stick'
	| 'blend'
	| 'mod-end'

export interface ToolDef {
	id: TabId
	name: string
	group: ToolGroup
	Component: ComponentType
}

export const GROUPS: { id: ToolGroup; name: string }[] = [
	{ id: 'blending', name: 'Blending' },
	{ id: 'planning', name: 'Planning' },
]

export const TOOLS: ToolDef[] = [
	{ id: 'cascade', name: 'Cascade Fill', group: 'blending', Component: CascadeCalculator },
	{ id: 'nitrox-stick', name: 'Nitrox Stick', group: 'blending', Component: NitroxStickCalculator },
	{ id: 'blend', name: 'Blend (PP)', group: 'blending', Component: BlendCalculator },
	{ id: 'mod-end', name: 'MOD / END', group: 'planning', Component: ModEndCalculator },
]
```

- [ ] **Step 2: Rewrite ToolsTabs.tsx (grouped)**

```tsx
'use client'

import { GROUPS, TOOLS, TabId, ToolGroup } from './toolsRegistry'

const ToolsTabs = ({
	active,
	onChange,
}: {
	active: TabId
	onChange: (id: TabId) => void
}) => {
	const activeTool = TOOLS.find((t) => t.id === active) ?? TOOLS[0]
	const activeGroup: ToolGroup = activeTool.group
	const groupTabs = TOOLS.filter((t) => t.group === activeGroup)

	const selectGroup = (group: ToolGroup) => {
		const first = TOOLS.find((t) => t.group === group)
		if (first) onChange(first.id)
	}

	return (
		<div className='space-y-3'>
			<div className='border-border inline-flex overflow-hidden rounded-md border'>
				{GROUPS.map((g) => {
					const isActive = g.id === activeGroup
					return (
						<button
							key={g.id}
							type='button'
							onClick={() => selectGroup(g.id)}
							className={
								isActive
									? 'bg-accent text-accent-text px-4 py-1.5 text-sm font-semibold'
									: 'text-text hover:bg-hover px-4 py-1.5 text-sm font-medium'
							}
						>
							{g.name}
						</button>
					)
				})}
			</div>
			<div className='border-border flex flex-wrap gap-2 border-b'>
				{groupTabs.map((tab) => {
					const isActive = tab.id === active
					return (
						<button
							key={tab.id}
							type='button'
							onClick={() => onChange(tab.id)}
							className={
								isActive
									? 'border-accent text-text -mb-px border-b-2 px-4 py-2 text-sm font-semibold'
									: 'text-light-text hover:text-text -mb-px border-b-2 border-transparent px-4 py-2 text-sm font-medium'
							}
						>
							{tab.name}
						</button>
					)
				})}
			</div>
		</div>
	)
}

export default ToolsTabs
```

- [ ] **Step 3: Rewrite ToolsPage.tsx (registry-driven + disclaimer)**

```tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import UnitsProvider from './UnitsProvider'
import ToolsTabs from './ToolsTabs'
import { TOOLS, TabId } from './toolsRegistry'

function isTabId(value: string | null): value is TabId {
	return TOOLS.some((t) => t.id === value)
}

const ToolsPage = () => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const param = searchParams.get('tab')
	const active: TabId = isTabId(param) ? param : 'cascade'
	const ActiveComponent =
		(TOOLS.find((t) => t.id === active) ?? TOOLS[0]).Component

	const onChange = (id: TabId) => {
		router.replace(`/tools?tab=${id}`)
	}

	return (
		<UnitsProvider>
			<div className='mx-auto max-w-3xl px-4 py-8'>
				<h1 className='text-text mb-2 text-3xl font-bold'>Dive Tools</h1>
				<div className='border-border bg-hover text-text mb-6 rounded-md border p-3 text-sm'>
					<span className='font-semibold'>For reference only.</span> All results
					are estimates — independently verify and analyze every gas mix and dive
					plan before diving.
				</div>
				<ToolsTabs active={active} onChange={onChange} />
				<div className='mt-6'>
					<ActiveComponent />
				</div>
			</div>
		</UnitsProvider>
	)
}

export default ToolsPage
```

- [ ] **Step 4: Verify build + smoke test**

Run: `npm run build`
Expected: build succeeds; `/tools` present.

Run `npm run dev`, open `/tools`: confirm the **Blending**/**Planning** group selector switches tab sets, the four existing calculators render, the disclaimer banner shows, and `?tab=` updates on tab click.

- [ ] **Step 5: Lint + commit**

```bash
npm run lint
git add src/components/Tools/toolsRegistry.ts src/components/Tools/ToolsTabs.tsx src/components/Tools/ToolsPage.tsx
git commit -m "feat: grouped tools navigation via tab registry + disclaimer"
```

---

### Task 16: BestMixCalculator

**Files:**
- Create: `src/components/Tools/BestMixCalculator.tsx`
- Modify: `src/components/Tools/toolsRegistry.ts`

**Interfaces:**
- Consumes: `bestMix` from `@/lib/diveMath/bestMix`; `calculateMod` from `@/lib/diveMath/modEnd`; `toMeters`, `fromMeters` from `@/lib/diveMath/units`; `useUnits`, `UnitToggle`, `NumberInput`, `RadioGroup`, `CheckBox`.
- Produces: `BestMixCalculator` (default export); registry entry `{ id: 'best-mix', name: 'Best Mix', group: 'blending' }`.

- [ ] **Step 1: Implement BestMixCalculator.tsx**

```tsx
'use client'

import { useState } from 'react'
import Checkbox from '@/components/UI/FormElements/CheckBox'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import { bestMix } from '@/lib/diveMath/bestMix'
import { calculateMod, Water } from '@/lib/diveMath/modEnd'
import { fromMeters, toMeters } from '@/lib/diveMath/units'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

const BestMixCalculator = () => {
	const { units } = useUnits()
	const [depth, setDepth] = useState(30)
	const [ppo2, setPpo2] = useState(1.4)
	const [water, setWater] = useState<Water>('salt')
	const [useHe, setUseHe] = useState(false)
	const [targetEnd, setTargetEnd] = useState(30)

	const depthM = toMeters(depth, units.depth)
	const mix = bestMix({
		depthM,
		ppo2,
		targetEndM: useHe ? toMeters(targetEnd, units.depth) : undefined,
		water,
	})
	const fo2Pct = Math.round(mix.fo2 * 100)
	const fhePct = Math.round(mix.fhe * 100)
	const mod = calculateMod({ fo2: mix.fo2, ppo2, water })

	return (
		<div className='space-y-6'>
			<UnitToggle show={['depth']} />
			<section className='flex flex-wrap items-end gap-3'>
				<NumberInput
					id='bm-depth'
					name='bm-depth'
					label={`Planned depth (${units.depth})`}
					value={depth}
					onChange={setDepth}
				/>
				<NumberInput
					id='bm-ppo2'
					name='bm-ppo2'
					label='Target ppO₂'
					value={ppo2}
					onChange={setPpo2}
				/>
			</section>
			<RadioGroup
				title='Water'
				name='bm-water'
				value={water}
				onChange={(v) => setWater(v as Water)}
				options={[
					{ value: 'salt', label: 'Salt' },
					{ value: 'fresh', label: 'Fresh' },
				]}
			/>
			<div onClick={() => setUseHe((p) => !p)}>
				<Checkbox
					id='bm-usehe'
					name='bm-usehe'
					title='Add helium to cap narcosis (END)'
					defaultChecked={useHe}
				/>
			</div>
			{useHe && (
				<NumberInput
					id='bm-targetend'
					name='bm-targetend'
					label={`Target END (${units.depth})`}
					value={targetEnd}
					onChange={setTargetEnd}
				/>
			)}
			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Recommended mix</h2>
				<p className='text-text text-2xl font-bold'>
					{fo2Pct}
					{fhePct > 0 ? `/${fhePct}` : ''}
					{fhePct > 0 ? ' (trimix)' : ' nitrox'}
				</p>
				<p className='text-light-text text-sm'>
					O₂ {fo2Pct}% · He {fhePct}% · N₂ {Math.round(mix.fn2 * 100)}%
				</p>
				<p className='text-text'>
					MOD at this mix &amp; ppO₂:{' '}
					<span className='font-semibold'>
						{Math.round(fromMeters(mod, units.depth))} {units.depth}
					</span>
				</p>
			</section>
		</div>
	)
}

export default BestMixCalculator
```

Note on the checkbox: the project's `CheckBox` is uncontrolled (`defaultChecked`), so the wrapping `div` `onClick` toggles `useHe` state. This mirrors how the repo drives that primitive; keep it.

- [ ] **Step 2: Register the tab**

In `src/components/Tools/toolsRegistry.ts`: add the import and extend `TabId` + `TOOLS`:

```ts
import BestMixCalculator from './BestMixCalculator'
```

Add `| 'best-mix'` to the `TabId` union, and add to `TOOLS` (in the blending group):

```ts
	{ id: 'best-mix', name: 'Best Mix', group: 'blending', Component: BestMixCalculator },
```

- [ ] **Step 3: Verify build + lint**

```bash
npm run build
npm run lint
```
Expected: build succeeds; lint clean. Smoke-test `/tools?tab=best-mix`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Tools/BestMixCalculator.tsx src/components/Tools/toolsRegistry.ts
git commit -m "feat: add best mix calculator UI"
```

---

### Task 17: EadCalculator

**Files:**
- Create: `src/components/Tools/EadCalculator.tsx`
- Modify: `src/components/Tools/toolsRegistry.ts`

**Interfaces:**
- Consumes: `ead` from `@/lib/diveMath/ead`; `Water` from `@/lib/diveMath/modEnd`; `toMeters`, `fromMeters`; `useUnits`, `UnitToggle`, `NumberInput`, `RadioGroup`, `MixPicker`.
- Produces: `EadCalculator`; registry entry `{ id: 'ead', name: 'EAD', group: 'planning' }`.

- [ ] **Step 1: Implement EadCalculator.tsx**

```tsx
'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import { ead } from '@/lib/diveMath/ead'
import { Water } from '@/lib/diveMath/modEnd'
import { fromMeters, toMeters } from '@/lib/diveMath/units'
import MixPicker from './MixPicker'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

const EadCalculator = () => {
	const { units } = useUnits()
	const [fo2, setFo2] = useState(32)
	const [fhe, setFhe] = useState(0)
	const [water, setWater] = useState<Water>('salt')
	const [depth, setDepth] = useState(30)

	const result = ead({
		depthM: toMeters(depth, units.depth),
		fo2: fo2 / 100,
		fhe: fhe / 100,
		water,
	})

	return (
		<div className='space-y-6'>
			<UnitToggle show={['depth']} />
			<MixPicker
				id='ead-mix'
				onSelect={(o2, he) => {
					setFo2(o2)
					setFhe(he)
				}}
			/>
			<section className='flex flex-wrap items-end gap-3'>
				<NumberInput id='ead-fo2' name='ead-fo2' label='O₂ (%)' value={fo2} onChange={setFo2} />
				<NumberInput id='ead-fhe' name='ead-fhe' label='He (%)' value={fhe} onChange={setFhe} />
				<NumberInput
					id='ead-depth'
					name='ead-depth'
					label={`Depth (${units.depth})`}
					value={depth}
					onChange={setDepth}
				/>
			</section>
			<RadioGroup
				title='Water'
				name='ead-water'
				value={water}
				onChange={(v) => setWater(v as Water)}
				options={[
					{ value: 'salt', label: 'Salt' },
					{ value: 'fresh', label: 'Fresh' },
				]}
			/>
			<section className='border-border rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Equivalent Air Depth</h2>
				<p className='text-text'>
					EAD at {depth} {units.depth}:{' '}
					<span className='font-semibold'>
						{Math.round(fromMeters(result, units.depth))} {units.depth}
					</span>
				</p>
			</section>
		</div>
	)
}

export default EadCalculator
```

- [ ] **Step 2: Register the tab**

In `toolsRegistry.ts` add `import EadCalculator from './EadCalculator'`, add `| 'ead'` to `TabId`, and add to `TOOLS` (planning group):

```ts
	{ id: 'ead', name: 'EAD', group: 'planning', Component: EadCalculator },
```

- [ ] **Step 3: Verify build + lint**

```bash
npm run build
npm run lint
```
Expected: succeeds. Smoke-test `/tools?tab=ead`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Tools/EadCalculator.tsx src/components/Tools/toolsRegistry.ts
git commit -m "feat: add equivalent air depth calculator UI"
```

---

### Task 18: GasDensityCalculator

**Files:**
- Create: `src/components/Tools/GasDensityCalculator.tsx`
- Modify: `src/components/Tools/toolsRegistry.ts`

**Interfaces:**
- Consumes: `densityAtDepth`, `depthForDensity`, `RECOMMENDED_MAX_DENSITY`, `HARD_MAX_DENSITY` from `@/lib/diveMath/gasDensity`; `Water`; `toMeters`, `fromMeters`; `useUnits`, `UnitToggle`, `NumberInput`, `RadioGroup`, `MixPicker`.
- Produces: `GasDensityCalculator`; registry entry `{ id: 'gas-density', name: 'Gas Density', group: 'planning' }`.

- [ ] **Step 1: Implement GasDensityCalculator.tsx**

```tsx
'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import {
	densityAtDepth,
	depthForDensity,
	HARD_MAX_DENSITY,
	RECOMMENDED_MAX_DENSITY,
} from '@/lib/diveMath/gasDensity'
import { Water } from '@/lib/diveMath/modEnd'
import { fromMeters, toMeters } from '@/lib/diveMath/units'
import MixPicker from './MixPicker'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

const GasDensityCalculator = () => {
	const { units } = useUnits()
	const [fo2, setFo2] = useState(21)
	const [fhe, setFhe] = useState(0)
	const [water, setWater] = useState<Water>('salt')
	const [depth, setDepth] = useState(30)

	const mix = { fo2: fo2 / 100, fhe: fhe / 100 }
	const density = densityAtDepth({ ...mix, depthM: toMeters(depth, units.depth), water })
	const recDepth = depthForDensity({ ...mix, density: RECOMMENDED_MAX_DENSITY, water })
	const hardDepth = depthForDensity({ ...mix, density: HARD_MAX_DENSITY, water })
	const d = (m: number) => Math.round(fromMeters(m, units.depth))

	const flag =
		density > HARD_MAX_DENSITY
			? { text: 'Exceeds the 6.3 g/L hard limit.', cls: 'text-text font-semibold' }
			: density > RECOMMENDED_MAX_DENSITY
				? { text: 'Above the 5.2 g/L recommended limit.', cls: 'text-text' }
				: { text: 'Within recommended density.', cls: 'text-light-text' }

	return (
		<div className='space-y-6'>
			<UnitToggle show={['depth']} />
			<MixPicker
				id='gd-mix'
				onSelect={(o2, he) => {
					setFo2(o2)
					setFhe(he)
				}}
			/>
			<section className='flex flex-wrap items-end gap-3'>
				<NumberInput id='gd-fo2' name='gd-fo2' label='O₂ (%)' value={fo2} onChange={setFo2} />
				<NumberInput id='gd-fhe' name='gd-fhe' label='He (%)' value={fhe} onChange={setFhe} />
				<NumberInput
					id='gd-depth'
					name='gd-depth'
					label={`Depth (${units.depth})`}
					value={depth}
					onChange={setDepth}
				/>
			</section>
			<RadioGroup
				title='Water'
				name='gd-water'
				value={water}
				onChange={(v) => setWater(v as Water)}
				options={[
					{ value: 'salt', label: 'Salt' },
					{ value: 'fresh', label: 'Fresh' },
				]}
			/>
			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Gas density</h2>
				<p className='text-text'>
					At {depth} {units.depth}:{' '}
					<span className='font-semibold'>{density.toFixed(2)} g/L</span>
				</p>
				<p className={flag.cls + ' text-sm'}>{flag.text}</p>
				<p className='text-light-text text-sm'>
					Recommended max (5.2 g/L) depth: {d(recDepth)} {units.depth} · Hard max
					(6.3 g/L) depth: {d(hardDepth)} {units.depth}
				</p>
			</section>
		</div>
	)
}

export default GasDensityCalculator
```

- [ ] **Step 2: Register the tab**

`import GasDensityCalculator from './GasDensityCalculator'`, add `| 'gas-density'` to `TabId`, add to `TOOLS` (planning):

```ts
	{ id: 'gas-density', name: 'Gas Density', group: 'planning', Component: GasDensityCalculator },
```

- [ ] **Step 3: Verify build + lint**

```bash
npm run build
npm run lint
```
Smoke-test `/tools?tab=gas-density`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Tools/GasDensityCalculator.tsx src/components/Tools/toolsRegistry.ts
git commit -m "feat: add gas density calculator UI"
```

---

### Task 19: GasMixingCalculator

**Files:**
- Create: `src/components/Tools/GasMixingCalculator.tsx`
- Modify: `src/components/Tools/toolsRegistry.ts`

**Interfaces:**
- Consumes: `mixTwoGases` from `@/lib/diveMath/gasMixing`; `toBar`, `fromBar`; `useUnits`, `UnitToggle`, `NumberInput`, `MixPicker`.
- Produces: `GasMixingCalculator`; registry entry `{ id: 'mix-two-gases', name: 'Mix Two Gases', group: 'blending' }`.

- [ ] **Step 1: Implement GasMixingCalculator.tsx**

```tsx
'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import { mixTwoGases } from '@/lib/diveMath/gasMixing'
import { fromBar, toBar } from '@/lib/diveMath/units'
import MixPicker from './MixPicker'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

const GasMixingCalculator = () => {
	const { units } = useUnits()
	const [p1, setP1] = useState(100)
	const [o21, setO21] = useState(21)
	const [he1, setHe1] = useState(0)
	const [p2, setP2] = useState(100)
	const [o22, setO22] = useState(32)
	const [he2, setHe2] = useState(0)

	const result = mixTwoGases(
		{ pressure: toBar(p1, units.pressure), fo2: o21 / 100, fhe: he1 / 100 },
		{ pressure: toBar(p2, units.pressure), fo2: o22 / 100, fhe: he2 / 100 },
	)

	return (
		<div className='space-y-6'>
			<UnitToggle show={['pressure']} />
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Gas A</h2>
				<MixPicker id='mix-a' onSelect={(o2, he) => { setO21(o2); setHe1(he) }} />
				<div className='flex flex-wrap items-end gap-3'>
					<NumberInput id='ga-p' name='ga-p' label={`Pressure (${units.pressure})`} value={p1} onChange={setP1} />
					<NumberInput id='ga-o2' name='ga-o2' label='O₂ (%)' value={o21} onChange={setO21} />
					<NumberInput id='ga-he' name='ga-he' label='He (%)' value={he1} onChange={setHe1} />
				</div>
			</section>
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Gas B</h2>
				<MixPicker id='mix-b' onSelect={(o2, he) => { setO22(o2); setHe2(he) }} />
				<div className='flex flex-wrap items-end gap-3'>
					<NumberInput id='gb-p' name='gb-p' label={`Pressure (${units.pressure})`} value={p2} onChange={setP2} />
					<NumberInput id='gb-o2' name='gb-o2' label='O₂ (%)' value={o22} onChange={setO22} />
					<NumberInput id='gb-he' name='gb-he' label='He (%)' value={he2} onChange={setHe2} />
				</div>
			</section>
			<section className='border-border space-y-1 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Resulting mix</h2>
				<p className='text-text text-2xl font-bold'>
					{Math.round(result.fo2 * 100)}/{Math.round(result.fhe * 100)}
				</p>
				<p className='text-light-text text-sm'>
					{Math.round(fromBar(result.pressure, units.pressure))} {units.pressure}{' '}
					· O₂ {Math.round(result.fo2 * 100)}% · He {Math.round(result.fhe * 100)}%
				</p>
			</section>
		</div>
	)
}

export default GasMixingCalculator
```

- [ ] **Step 2: Register the tab**

`import GasMixingCalculator from './GasMixingCalculator'`, add `| 'mix-two-gases'`, add to `TOOLS` (blending):

```ts
	{ id: 'mix-two-gases', name: 'Mix Two Gases', group: 'blending', Component: GasMixingCalculator },
```

- [ ] **Step 3: Verify build + lint**

```bash
npm run build
npm run lint
```
Smoke-test `/tools?tab=mix-two-gases`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Tools/GasMixingCalculator.tsx src/components/Tools/toolsRegistry.ts
git commit -m "feat: add two-gas mixing calculator UI"
```

---

### Task 20: OxygenExposureCalculator

**Files:**
- Create: `src/components/Tools/OxygenExposureCalculator.tsx`
- Modify: `src/components/Tools/toolsRegistry.ts`

**Interfaces:**
- Consumes: `computeDay`, `DayItem` from `@/lib/diveMath/oxygenExposure`; `ataAtDepth`, `Water` from `@/lib/diveMath/modEnd`; `toMeters`; `useUnits`, `UnitToggle`, `NumberInput`.
- Produces: `OxygenExposureCalculator`; registry entry `{ id: 'oxygen-exposure', name: 'CNS / OTU', group: 'planning' }`.

The UI keeps an ordered list of dives (depth + O₂% + minutes) interleaved with surface intervals (minutes). Each dive's ppO₂ is computed from depth + mix at the chosen water.

- [ ] **Step 1: Implement OxygenExposureCalculator.tsx**

```tsx
'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import { computeDay, DayItem } from '@/lib/diveMath/oxygenExposure'
import { ataAtDepth, Water } from '@/lib/diveMath/modEnd'
import { toMeters } from '@/lib/diveMath/units'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

interface DiveRow {
	depth: number
	fo2: number
	minutes: number
	surfaceAfter: number
}

const OxygenExposureCalculator = () => {
	const { units } = useUnits()
	const [water, setWater] = useState<Water>('salt')
	const [rows, setRows] = useState<DiveRow[]>([
		{ depth: 30, fo2: 32, minutes: 40, surfaceAfter: 60 },
	])

	const update = (i: number, key: keyof DiveRow, value: number) =>
		setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))
	const addRow = () =>
		setRows((prev) => [...prev, { depth: 30, fo2: 32, minutes: 40, surfaceAfter: 60 }])
	const removeRow = (i: number) =>
		setRows((prev) => prev.filter((_, idx) => idx !== i))

	const items: DayItem[] = []
	rows.forEach((r, i) => {
		const ppo2 = (r.fo2 / 100) * ataAtDepth(toMeters(r.depth, units.depth), water)
		items.push({ type: 'dive', ppo2, minutes: r.minutes })
		if (i < rows.length - 1) items.push({ type: 'surface', minutes: r.surfaceAfter })
	})
	const result = computeDay(items)

	return (
		<div className='space-y-6'>
			<UnitToggle show={['depth']} />
			<RadioGroup
				title='Water'
				name='ox-water'
				value={water}
				onChange={(v) => setWater(v as Water)}
				options={[
					{ value: 'salt', label: 'Salt' },
					{ value: 'fresh', label: 'Fresh' },
				]}
			/>
			<section className='space-y-4'>
				{rows.map((r, i) => (
					<div key={i} className='border-border space-y-3 rounded-md border p-3'>
						<div className='flex items-center justify-between'>
							<h3 className='text-text font-semibold'>Dive {i + 1}</h3>
							<button
								type='button'
								onClick={() => removeRow(i)}
								disabled={rows.length === 1}
								className='text-light-text hover:text-text text-sm disabled:opacity-40'
							>
								Remove
							</button>
						</div>
						<div className='flex flex-wrap items-end gap-3'>
							<NumberInput id={`ox-d-${i}`} name={`ox-d-${i}`} label={`Depth (${units.depth})`} value={r.depth} onChange={(v) => update(i, 'depth', v)} />
							<NumberInput id={`ox-o2-${i}`} name={`ox-o2-${i}`} label='O₂ (%)' value={r.fo2} onChange={(v) => update(i, 'fo2', v)} />
							<NumberInput id={`ox-t-${i}`} name={`ox-t-${i}`} label='Time (min)' value={r.minutes} onChange={(v) => update(i, 'minutes', v)} />
							{i < rows.length - 1 && (
								<NumberInput id={`ox-si-${i}`} name={`ox-si-${i}`} label='Surface interval (min)' value={r.surfaceAfter} onChange={(v) => update(i, 'surfaceAfter', v)} />
							)}
						</div>
						<p className='text-light-text text-sm'>
							CNS {result.perDive[i]?.cnsPercent.toFixed(1) ?? '0'}% · OTU{' '}
							{Math.round(result.perDive[i]?.otu ?? 0)}
						</p>
					</div>
				))}
				<button
					type='button'
					onClick={addRow}
					className='bg-accent text-accent-text rounded-md px-3 py-2 text-sm font-medium'
				>
					Add dive
				</button>
			</section>
			<section className='border-border space-y-1 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Day totals</h2>
				<p className='text-text'>
					Peak CNS: <span className='font-semibold'>{result.peakCnsPercent.toFixed(1)}%</span>
				</p>
				<p className='text-text'>
					End-of-day CNS:{' '}
					<span className='font-semibold'>{result.endCnsPercent.toFixed(1)}%</span>
				</p>
				<p className='text-text'>
					Total OTU: <span className='font-semibold'>{Math.round(result.totalOtu)}</span>
				</p>
			</section>
		</div>
	)
}

export default OxygenExposureCalculator
```

- [ ] **Step 2: Register the tab**

`import OxygenExposureCalculator from './OxygenExposureCalculator'`, add `| 'oxygen-exposure'`, add to `TOOLS` (planning):

```ts
	{ id: 'oxygen-exposure', name: 'CNS / OTU', group: 'planning', Component: OxygenExposureCalculator },
```

- [ ] **Step 3: Verify build + lint**

```bash
npm run build
npm run lint
```
Smoke-test `/tools?tab=oxygen-exposure`: add a dive, set a surface interval, confirm peak CNS reflects the decay.

- [ ] **Step 4: Commit**

```bash
git add src/components/Tools/OxygenExposureCalculator.tsx src/components/Tools/toolsRegistry.ts
git commit -m "feat: add full-day CNS/OTU calculator UI"
```

---

### Task 21: GasRequirementsCalculator

**Files:**
- Create: `src/components/Tools/GasRequirementsCalculator.tsx`
- Modify: `src/components/Tools/toolsRegistry.ts`

**Interfaces:**
- Consumes: `rmv`, `diveGasRequirement`, `rockBottom`, `minGasPressure`, `Stop` from `@/lib/diveMath/gasPlanning`; `Water` from `@/lib/diveMath/modEnd`; `toBar`, `fromBar`, `toMeters`, `toLiters`, `fromLiters` from `@/lib/diveMath/units`; `useUnits`, `UnitToggle`, `NumberInput`, `RadioGroup`, `TankSizePicker`.
- Produces: `GasRequirementsCalculator`; registry entry `{ id: 'gas-requirements', name: 'Gas Requirements', group: 'planning' }`.

- [ ] **Step 1: Implement GasRequirementsCalculator.tsx**

```tsx
'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import {
	diveGasRequirement,
	minGasPressure,
	rmv,
	rockBottom,
} from '@/lib/diveMath/gasPlanning'
import { Water } from '@/lib/diveMath/modEnd'
import { fromBar, fromLiters, toBar, toLiters, toMeters } from '@/lib/diveMath/units'
import TankSizePicker from './TankSizePicker'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

const GasRequirementsCalculator = () => {
	const { units } = useUnits()
	const [water, setWater] = useState<Water>('salt')
	const [tankVol, setTankVol] = useState(12)
	// SAC inputs
	const [startP, setStartP] = useState(200)
	const [endP, setEndP] = useState(100)
	const [logMinutes, setLogMinutes] = useState(20)
	const [logDepth, setLogDepth] = useState(20)
	// Plan inputs
	const [planDepth, setPlanDepth] = useState(30)
	const [planMinutes, setPlanMinutes] = useState(20)
	const [ascentRate, setAscentRate] = useState(9)
	const [stopDepth, setStopDepth] = useState(5)
	const [stopMinutes, setStopMinutes] = useState(3)
	const [stress, setStress] = useState(2)
	const [team, setTeam] = useState(2)

	const tankVolumeL = toLiters(tankVol, units.volume)
	const rmvLpm = rmv({
		startP: toBar(startP, units.pressure),
		endP: toBar(endP, units.pressure),
		minutes: logMinutes,
		avgDepthM: toMeters(logDepth, units.depth),
		tankVolumeL,
		water,
	})
	const planAvgM = toMeters(planDepth, units.depth)
	const diveGasL = diveGasRequirement({ rmvLpm, avgDepthM: planAvgM, minutes: planMinutes, water })
	const minGasL = rockBottom({
		rmvLpm,
		depthM: planAvgM,
		ascentRateMpm: units.depth === 'ft' ? toMeters(ascentRate, 'ft') : ascentRate,
		stops: [{ depthM: toMeters(stopDepth, units.depth), minutes: stopMinutes }],
		stressFactor: stress,
		water,
		teamSize: team,
	})
	const minGasBar = minGasPressure({ minGasL, tankVolumeL })

	return (
		<div className='space-y-6'>
			<UnitToggle show={['pressure', 'depth', 'volume']} />
			<RadioGroup
				title='Water'
				name='gr-water'
				value={water}
				onChange={(v) => setWater(v as Water)}
				options={[
					{ value: 'salt', label: 'Salt' },
					{ value: 'fresh', label: 'Fresh' },
				]}
			/>
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>1 · SAC / RMV from a logged dive</h2>
				<TankSizePicker category='dive' onSelect={(l) => setTankVol(fromLiters(l, units.volume))} />
				<div className='flex flex-wrap items-end gap-3'>
					<NumberInput id='gr-tank' name='gr-tank' label={`Tank volume (${units.volume})`} value={tankVol} onChange={setTankVol} />
					<NumberInput id='gr-start' name='gr-start' label={`Start (${units.pressure})`} value={startP} onChange={setStartP} />
					<NumberInput id='gr-end' name='gr-end' label={`End (${units.pressure})`} value={endP} onChange={setEndP} />
					<NumberInput id='gr-min' name='gr-min' label='Time (min)' value={logMinutes} onChange={setLogMinutes} />
					<NumberInput id='gr-ldepth' name='gr-ldepth' label={`Avg depth (${units.depth})`} value={logDepth} onChange={setLogDepth} />
				</div>
				<p className='text-text'>
					RMV: <span className='font-semibold'>{rmvLpm.toFixed(1)} L/min</span>
				</p>
			</section>
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>2 · Plan &amp; rock bottom</h2>
				<div className='flex flex-wrap items-end gap-3'>
					<NumberInput id='gr-pdepth' name='gr-pdepth' label={`Avg depth (${units.depth})`} value={planDepth} onChange={setPlanDepth} />
					<NumberInput id='gr-pmin' name='gr-pmin' label='Bottom time (min)' value={planMinutes} onChange={setPlanMinutes} />
					<NumberInput id='gr-arate' name='gr-arate' label={`Ascent rate (${units.depth}/min)`} value={ascentRate} onChange={setAscentRate} />
					<NumberInput id='gr-sdepth' name='gr-sdepth' label={`Stop depth (${units.depth})`} value={stopDepth} onChange={setStopDepth} />
					<NumberInput id='gr-smin' name='gr-smin' label='Stop time (min)' value={stopMinutes} onChange={setStopMinutes} />
					<NumberInput id='gr-stress' name='gr-stress' label='Stress factor' value={stress} onChange={setStress} />
					<NumberInput id='gr-team' name='gr-team' label='Team size' value={team} onChange={setTeam} />
				</div>
			</section>
			<section className='border-border space-y-1 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Results</h2>
				<p className='text-text'>
					Dive gas needed:{' '}
					<span className='font-semibold'>{Math.round(fromLiters(diveGasL, units.volume))} {units.volume} (surface)</span>
				</p>
				<p className='text-text'>
					Rock bottom (min gas):{' '}
					<span className='font-semibold'>
						{Number.isFinite(minGasBar) ? Math.round(fromBar(minGasBar, units.pressure)) : '—'} {units.pressure}
					</span>
				</p>
			</section>
		</div>
	)
}

export default GasRequirementsCalculator
```

- [ ] **Step 2: Register the tab**

`import GasRequirementsCalculator from './GasRequirementsCalculator'`, add `| 'gas-requirements'`, add to `TOOLS` (planning):

```ts
	{ id: 'gas-requirements', name: 'Gas Requirements', group: 'planning', Component: GasRequirementsCalculator },
```

- [ ] **Step 3: Verify build + lint**

```bash
npm run build
npm run lint
```
Smoke-test `/tools?tab=gas-requirements`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Tools/GasRequirementsCalculator.tsx src/components/Tools/toolsRegistry.ts
git commit -m "feat: add gas requirements (SAC/RMV + rock bottom) calculator UI"
```

---

### Task 22: BlendingCostCalculator

**Files:**
- Create: `src/components/Tools/BlendingCostCalculator.tsx`
- Modify: `src/components/Tools/toolsRegistry.ts`

**Interfaces:**
- Consumes: `calculateBlend` from `@/lib/diveMath/blending`; `toBar`, `toLiters` from `@/lib/diveMath/units`; `useUnits`, `UnitToggle`, `NumberInput`, `MixPicker`.
- Produces: `BlendingCostCalculator`; registry entry `{ id: 'blending-cost', name: 'Blending Cost', group: 'blending' }`. Gas prices persist in localStorage key `fillstation.tools.gasPrices`.

The cost model: O₂ surface volume added = `pO2(bar) × tankVolumeL`; He surface volume = `pHe(bar) × tankVolumeL` (partial pressures are in bar gauge; gauge·litres ≈ surface litres). Cost = surface litres × price-per-litre for each gas.

- [ ] **Step 1: Implement BlendingCostCalculator.tsx**

```tsx
'use client'

import { useEffect, useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import { calculateBlend } from '@/lib/diveMath/blending'
import { toBar, toLiters } from '@/lib/diveMath/units'
import MixPicker from './MixPicker'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

const PRICE_KEY = 'fillstation.tools.gasPrices'
interface Prices {
	o2: number
	he: number
}
const DEFAULT_PRICES: Prices = { o2: 0.03, he: 0.5 }

const BlendingCostCalculator = () => {
	const { units } = useUnits()
	const [prices, setPrices] = useState<Prices>(DEFAULT_PRICES)
	const [tankVol, setTankVol] = useState(12)
	const [startP, setStartP] = useState(0)
	const [startO2, setStartO2] = useState(21)
	const [startHe, setStartHe] = useState(0)
	const [finalP, setFinalP] = useState(200)
	const [targetO2, setTargetO2] = useState(32)
	const [targetHe, setTargetHe] = useState(0)

	useEffect(() => {
		try {
			const raw = localStorage.getItem(PRICE_KEY)
			// eslint-disable-next-line react-hooks/set-state-in-effect
			if (raw) setPrices({ ...DEFAULT_PRICES, ...JSON.parse(raw) })
		} catch {
			// ignore malformed storage
		}
	}, [])

	const setPrice = (key: keyof Prices, value: number) =>
		setPrices((prev) => {
			const next = { ...prev, [key]: value }
			try {
				localStorage.setItem(PRICE_KEY, JSON.stringify(next))
			} catch {
				// ignore storage failures
			}
			return next
		})

	const blend = calculateBlend({
		startPressure: toBar(startP, units.pressure),
		startFo2: startO2 / 100,
		startFhe: startHe / 100,
		finalPressure: toBar(finalP, units.pressure),
		targetFo2: targetO2 / 100,
		targetFhe: targetHe / 100,
	})
	const tankL = toLiters(tankVol, units.volume)
	const o2L = Math.max(0, blend.pO2) * tankL
	const heL = Math.max(0, blend.pHe) * tankL
	const o2Cost = o2L * prices.o2
	const heCost = heL * prices.he
	const total = o2Cost + heCost

	return (
		<div className='space-y-6'>
			<UnitToggle show={['pressure', 'volume']} />
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Fill</h2>
				<MixPicker id='cost-start' onSelect={(o2, he) => { setStartO2(o2); setStartHe(he) }} />
				<div className='flex flex-wrap items-end gap-3'>
					<NumberInput id='c-tank' name='c-tank' label={`Tank volume (${units.volume})`} value={tankVol} onChange={setTankVol} />
					<NumberInput id='c-sp' name='c-sp' label={`Start (${units.pressure})`} value={startP} onChange={setStartP} />
					<NumberInput id='c-so2' name='c-so2' label='Start O₂ (%)' value={startO2} onChange={setStartO2} />
					<NumberInput id='c-she' name='c-she' label='Start He (%)' value={startHe} onChange={setStartHe} />
				</div>
				<MixPicker id='cost-target' onSelect={(o2, he) => { setTargetO2(o2); setTargetHe(he) }} />
				<div className='flex flex-wrap items-end gap-3'>
					<NumberInput id='c-fp' name='c-fp' label={`Final (${units.pressure})`} value={finalP} onChange={setFinalP} />
					<NumberInput id='c-to2' name='c-to2' label='Target O₂ (%)' value={targetO2} onChange={setTargetO2} />
					<NumberInput id='c-the' name='c-the' label='Target He (%)' value={targetHe} onChange={setTargetHe} />
				</div>
			</section>
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Gas prices (per surface litre)</h2>
				<div className='flex flex-wrap items-end gap-3'>
					<NumberInput id='c-po2' name='c-po2' label='O₂ price' value={prices.o2} onChange={(v) => setPrice('o2', v)} />
					<NumberInput id='c-phe' name='c-phe' label='He price' value={prices.he} onChange={(v) => setPrice('he', v)} />
				</div>
			</section>
			<section className='border-border space-y-1 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Cost</h2>
				{blend.feasible ? (
					<>
						<p className='text-light-text text-sm'>
							O₂ used: {Math.round(o2L)} L → {o2Cost.toFixed(2)} · He used:{' '}
							{Math.round(heL)} L → {heCost.toFixed(2)}
						</p>
						<p className='text-text text-xl font-bold'>Total: {total.toFixed(2)}</p>
					</>
				) : (
					<p className='text-light-text text-sm'>{blend.reason}</p>
				)}
			</section>
		</div>
	)
}

export default BlendingCostCalculator
```

- [ ] **Step 2: Register the tab**

`import BlendingCostCalculator from './BlendingCostCalculator'`, add `| 'blending-cost'`, add to `TOOLS` (blending):

```ts
	{ id: 'blending-cost', name: 'Blending Cost', group: 'blending', Component: BlendingCostCalculator },
```

- [ ] **Step 3: Verify build + lint**

```bash
npm run build
npm run lint
```
Smoke-test `/tools?tab=blending-cost`: change a price, reload, confirm it persists.

- [ ] **Step 4: Commit**

```bash
git add src/components/Tools/BlendingCostCalculator.tsx src/components/Tools/toolsRegistry.ts
git commit -m "feat: add blending cost calculator UI"
```

---

### Task 23: Nitrox stick flow unit

**Files:**
- Modify: `src/components/Tools/NitroxStickCalculator.tsx`

**Interfaces:**
- Consumes: `toLpm`, `fromLpm` from `@/lib/diveMath/units`; the `flow` unit from `useUnits`.
- Produces: air-flow input and O₂-flow output displayed in the selected `flow` unit, independent of the volume unit.

The math (`nitroxStickFlowRate`) is unit-agnostic on flow (ratio), so convert the air-flow input to LPM for consistency and convert the O₂-flow result back to the display flow unit.

- [ ] **Step 1: Use the flow unit in NitroxStickCalculator.tsx**

Add `toLpm, fromLpm` to the `units` import, add `'flow'` to the `UnitToggle`, and convert the air-flow and O₂-flow through the flow unit.

Change the import line to:

```tsx
import { fromBar, fromLpm, toBar, toLiters, toLpm } from '@/lib/diveMath/units'
```

Change the flow computation:

```tsx
	const airFlowLpm = toLpm(airFlow, units.flow)
	const flow = nitroxStickFlowRate({ targetFo2, airFlow: airFlowLpm })
```

Change `<UnitToggle show={['pressure', 'volume']} />` to:

```tsx
			<UnitToggle show={['pressure', 'volume', 'flow']} />
```

Change the air-flow input label and the O₂-flow output line:

```tsx
					<NumberInput
						id='ns-airflow'
						name='ns-airflow'
						label={`Compressor free-air (intake) flow (${units.flow})`}
						value={airFlow}
						onChange={setAirFlow}
					/>
```

```tsx
				<p className='text-text'>
					O₂ flow into the stick:{' '}
					<span className='font-semibold'>
						{leanWarning ? '0.00' : fromLpm(flow, units.flow).toFixed(2)}
					</span>{' '}
					<span className='text-light-text text-sm'>{units.flow}</span>
				</p>
```

- [ ] **Step 2: Verify build + lint**

```bash
npm run build
npm run lint
```
Smoke-test `/tools?tab=nitrox-stick`: set Flow to LPM and Volume to cf; confirm the O₂ flow shows in LPM while tank/supply stay cf.

- [ ] **Step 3: Commit**

```bash
git add src/components/Tools/NitroxStickCalculator.tsx
git commit -m "feat: give nitrox stick its own flow unit"
```

---

### Task 24: Retrofit pickers + compressibility toggle onto existing calculators

**Files:**
- Modify: `src/components/Tools/ModEndCalculator.tsx`
- Modify: `src/components/Tools/BlendCalculator.tsx`
- Modify: `src/components/Tools/CascadeCalculator.tsx`
- Modify: `src/components/Tools/NitroxStickCalculator.tsx`

**Interfaces:**
- Consumes: `MixPicker`, `TankSizePicker`, `Checkbox`, `fromLiters`.
- Produces: `MixPicker` on MOD/END + Blend; `TankSizePicker` on Cascade banks (storage) + Cascade target/Nitrox tank (dive) + Nitrox supply (industrial); compressibility toggle on Blend + Cascade passing `{ useRealGas }`.

- [ ] **Step 1: Add MixPicker to ModEndCalculator**

In `ModEndCalculator.tsx`, add `import MixPicker from './MixPicker'`, and render it above the FO₂/FHe inputs (inside the first `<section>`), wiring to the existing `setFo2`/`setFhe`:

```tsx
			<MixPicker
				id='me-mix'
				onSelect={(o2, he) => {
					setFo2(o2)
					setFhe(he)
				}}
			/>
```

- [ ] **Step 2: Add MixPicker to BlendCalculator (start + target)**

In `BlendCalculator.tsx`, add `import MixPicker from './MixPicker'`. Above the starting-gas inputs:

```tsx
			<MixPicker id='bl-start-mix' onSelect={(o2, he) => { setStartO2(o2); setStartHe(he) }} />
```

Above the target-gas inputs:

```tsx
			<MixPicker id='bl-target-mix' onSelect={(o2, he) => { setTargetO2(o2); setTargetHe(he) }} />
```

- [ ] **Step 3: Add compressibility toggle to BlendCalculator**

Add `import { useState } from 'react'` already present; add a `useRealGas` state and a `Checkbox`, and pass it to `calculateBlend`. Add `import Checkbox from '@/components/UI/FormElements/CheckBox'`.

```tsx
	const [useRealGas, setUseRealGas] = useState(false)
```

Change the `calculateBlend(...)` call to:

```tsx
	const result = calculateBlend(
		{
			startPressure: toBar(startPressure, units.pressure),
			startFo2: startO2 / 100,
			startFhe: startHe / 100,
			finalPressure: toBar(finalPressure, units.pressure),
			targetFo2: targetO2 / 100,
			targetFhe: targetHe / 100,
		},
		{ useRealGas },
	)
```

Add the toggle near the `UnitToggle` using the **controlled** `Checkbox`
(`checked` + `onChange`; `CheckBox` was made controlled-capable during Task 16):

```tsx
			<Checkbox
				id='bl-realgas'
				name='bl-realgas'
				title='Account for gas compressibility (real-gas, approximate)'
				checked={useRealGas}
				onChange={setUseRealGas}
			/>
```

- [ ] **Step 4: Add TankSizePicker + compressibility toggle to CascadeCalculator**

In `CascadeCalculator.tsx`, add imports:

```tsx
import Checkbox from '@/components/UI/FormElements/CheckBox'
import { fromLiters } from '@/lib/diveMath/units'
import TankSizePicker from './TankSizePicker'
```

Add a `useRealGas` state and pass it through:

```tsx
	const [useRealGas, setUseRealGas] = useState(false)
```

Change the `calculateCascade(...)` call to pass `{ useRealGas }` as the second argument.

Add a `TankSizePicker category='storage'` inside each bank row that sets that bank's volume and pressure (it already has `updateBank(i, 'volume', ...)`/`'pressure'`):

```tsx
						<TankSizePicker
							category='storage'
							onSelect={(l, bar) => {
								updateBank(i, 'volume', fromLiters(l, units.volume))
								updateBank(i, 'pressure', fromBar(bar, units.pressure))
							}}
						/>
```

Add a `TankSizePicker category='dive'` near the target cylinder volume field, setting `setTargetVolume(fromLiters(l, units.volume))`. Add the compressibility toggle near `UnitToggle` using the **controlled** `Checkbox`:

```tsx
			<Checkbox
				id='cas-realgas'
				name='cas-realgas'
				title='Account for gas compressibility (real-gas, approximate)'
				checked={useRealGas}
				onChange={setUseRealGas}
			/>
```

(`fromBar` is already imported in CascadeCalculator.)

- [ ] **Step 5: Add TankSizePicker to NitroxStickCalculator**

In `NitroxStickCalculator.tsx`, add `import TankSizePicker from './TankSizePicker'` and `fromLiters` to the units import. Add a dive picker above the tank-volume field and an industrial picker above the supply-volume field:

```tsx
				<TankSizePicker category='dive' onSelect={(l) => setTankVolume(fromLiters(l, units.volume))} />
```
```tsx
				<TankSizePicker category='industrial' onSelect={(l) => setSupplyVolume(fromLiters(l, units.volume))} />
```

- [ ] **Step 6: Verify build + full suite + lint + knip**

```bash
npm test && npm run build && npm run lint && npm run knip
```
Expected: all 50+ tests pass; build succeeds; lint clean; knip reports no new unused exports (`fromLiters`, all preset arrays, and all math functions are now consumed).

Smoke-test each retrofitted tab: MOD/END + Blend mix presets fill fields; Cascade bank/target presets fill volume+pressure; Nitrox tank/supply presets fill; the compressibility toggle on Blend + Cascade changes results.

- [ ] **Step 7: Commit**

```bash
git add src/components/Tools/ModEndCalculator.tsx src/components/Tools/BlendCalculator.tsx src/components/Tools/CascadeCalculator.tsx src/components/Tools/NitroxStickCalculator.tsx
git commit -m "feat: add mix/tank pickers and compressibility toggle to existing calculators"
```

---

## Self-Review Notes

- **Spec coverage:** grouped nav + registry (Task 15); flow unit + `fromLiters` (Tasks 1, 3); `ataAtDepth` (Task 2); bestMix (4,16); EAD (5,17); gasDensity (6,18); gasMixing (7,19); oxygenExposure full-day (8,20); gasPlanning rock-bottom (9,21); compressibility + real-gas opt-in (10,11,24); presets incl. sourced T/K + EAN80/O₂ (12); pickers (13,14); blending cost localStorage (22); nitrox flow unit (23); MixPicker retrofit on MOD/END + Blend, TankSizePicker on Cascade/Nitrox, compressibility toggle on Blend/Cascade (24); reference-only disclaimer (15).
- **Type consistency:** `ataAtDepth(depthM, water)` (Task 2) is consumed by bestMix/gasDensity/gasPlanning/oxygenExposure components with the same signature. `calculateBlend(input, { useRealGas })` / `calculateCascade(input, { useRealGas })` (Task 11) consumed by Task 24. `TankSizePicker` `onSelect(waterVolumeL, ratedBar)` and `MixPicker` `onSelect(fo2Pct, fhePct)` consumed consistently. `TabId` is extended additively in each component task.
- **knip:** `fromLiters` is consumed by every TankSizePicker call site (Tasks 13/21/24); all preset arrays are consumed by the pickers; all new math functions are consumed by their components — verified in Task 24 Step 6.
- **CheckBox pattern:** the repo's `CheckBox` is uncontrolled (`defaultChecked`), so toggles are driven by a wrapping `div onClick`. This is used for `useHe` (Task 16) and the compressibility toggles (Task 24). If a controlled checkbox is preferred during implementation, that's an acceptable local improvement as long as state stays in sync.
