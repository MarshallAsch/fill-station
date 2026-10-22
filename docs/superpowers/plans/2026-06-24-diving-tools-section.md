# Diving Tools Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public `/tools` page with four client-side dive-gas calculators (cascade fill, nitrox stick, partial-pressure blend, MOD/END), backed by tested pure-math modules.

**Architecture:** Pure, unit-agnostic math lives in `src/lib/diveMath/` (SI internally: bar / litres / metres) and is covered by Vitest unit tests. Thin React components in `src/components/Tools/` read inputs, convert units, and render results. A localStorage-backed `UnitsProvider` shares three independent unit preferences (pressure, depth, volume) across tabs. The page is a single tabbed view navigated via a `?tab=` query param and is whitelisted as public in `src/proxy.ts`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Headless UI, Heroicons, Vitest (new).

## Global Constraints

- Prettier: single quotes, no semicolons, tabs, 80-char width. Run `npm run lint` after every task.
- Theme tokens only (`bg-background`, `text-text`, `border-border`, `bg-accent`, `text-accent-text`, `bg-hover`, `text-light-text`). No hardcoded Tailwind colors. No `dark:` variants of theme classes.
- `'use client'` directive required for interactive components.
- Import alias `@/*` → `src/*`.
- Reuse existing form primitives in `src/components/UI/FormElements/` (`NumberInput`, `ListBox`, `RadioGroup`, `CheckBox`) — do not hand-roll raw inputs.
- Math modules contain NO React and NO unit-display logic. All fractions are decimals (FO₂ 0.32). Air is FO₂ `0.209`, FN₂ `0.791`.
- Test files import `{ describe, it, expect }` from `'vitest'` (no global config), colocated as `src/lib/diveMath/<name>.test.ts`.

---

### Task 1: Vitest setup + units module

**Files:**
- Modify: `package.json` (add devDeps + scripts)
- Create: `vitest.config.ts`
- Create: `src/lib/diveMath/units.ts`
- Test: `src/lib/diveMath/units.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - Constants: `AIR_FO2 = 0.209`, `AIR_FN2 = 0.791`, `PSI_PER_BAR`, `L_PER_CF`, `FT_PER_M`, `ATMOSPHERIC_BAR = 1.01325`.
  - Types: `PressureUnit = 'psi'|'bar'`, `DepthUnit = 'ft'|'m'`, `VolumeUnit = 'cf'|'l'`.
  - `toBar(value: number, unit: PressureUnit): number`, `fromBar(bar: number, unit: PressureUnit): number`
  - `toMeters(value: number, unit: DepthUnit): number`, `fromMeters(m: number, unit: DepthUnit): number`
  - `toLiters(value: number, unit: VolumeUnit): number`, `fromLiters(l: number, unit: VolumeUnit): number`

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest@^3`
Expected: `vitest` added to `devDependencies`.

- [ ] **Step 2: Add test scripts to package.json**

In `package.json` `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts'],
	},
})
```

- [ ] **Step 4: Write the failing test**

Create `src/lib/diveMath/units.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
	AIR_FO2,
	ATMOSPHERIC_BAR,
	toBar,
	fromBar,
	toMeters,
	fromMeters,
	toLiters,
	fromLiters,
} from './units'

describe('units', () => {
	it('exposes air and atmospheric constants', () => {
		expect(AIR_FO2).toBe(0.209)
		expect(ATMOSPHERIC_BAR).toBeCloseTo(1.01325, 5)
	})

	it('converts pressure psi <-> bar', () => {
		expect(toBar(145.037738, 'psi')).toBeCloseTo(10, 4)
		expect(toBar(10, 'bar')).toBe(10)
		expect(fromBar(10, 'psi')).toBeCloseTo(145.037738, 3)
		expect(fromBar(10, 'bar')).toBe(10)
	})

	it('converts depth ft <-> m', () => {
		expect(toMeters(33, 'ft')).toBeCloseTo(10.0584, 3)
		expect(toMeters(10, 'm')).toBe(10)
		expect(fromMeters(10, 'ft')).toBeCloseTo(32.8084, 3)
	})

	it('converts volume cf <-> l', () => {
		expect(toLiters(1, 'cf')).toBeCloseTo(28.3168, 3)
		expect(toLiters(5, 'l')).toBe(5)
		expect(fromLiters(28.3168466, 'cf')).toBeCloseTo(1, 4)
	})
})
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './units'`.

- [ ] **Step 6: Implement units.ts**

```ts
export const AIR_FO2 = 0.209
export const AIR_FN2 = 0.791
export const ATMOSPHERIC_BAR = 1.01325

export const PSI_PER_BAR = 14.5037738
export const L_PER_CF = 28.3168466
export const FT_PER_M = 3.280839895

export type PressureUnit = 'psi' | 'bar'
export type DepthUnit = 'ft' | 'm'
export type VolumeUnit = 'cf' | 'l'

export function toBar(value: number, unit: PressureUnit): number {
	return unit === 'psi' ? value / PSI_PER_BAR : value
}

export function fromBar(bar: number, unit: PressureUnit): number {
	return unit === 'psi' ? bar * PSI_PER_BAR : bar
}

export function toMeters(value: number, unit: DepthUnit): number {
	return unit === 'ft' ? value / FT_PER_M : value
}

export function fromMeters(m: number, unit: DepthUnit): number {
	return unit === 'ft' ? m * FT_PER_M : m
}

export function toLiters(value: number, unit: VolumeUnit): number {
	return unit === 'cf' ? value * L_PER_CF : value
}

export function fromLiters(l: number, unit: VolumeUnit): number {
	return unit === 'cf' ? l / L_PER_CF : l
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (4 tests).

- [ ] **Step 8: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/diveMath/units.ts src/lib/diveMath/units.test.ts
git commit -m "feat: add vitest setup and diveMath units module"
```

---

### Task 2: Cascade fill math

**Files:**
- Create: `src/lib/diveMath/cascade.ts`
- Test: `src/lib/diveMath/cascade.test.ts`

**Interfaces:**
- Consumes: `ATMOSPHERIC_BAR` from `./units`.
- Produces:
  - `interface BankCylinder { volume: number; pressure: number }` (volume in litres, pressure in bar gauge)
  - `interface CascadeInput { banks: BankCylinder[]; target: { volume: number; startPressure: number }; desiredPressure?: number }`
  - `interface CascadeResult { finalPressure: number; banks: { residualPressure: number }[]; reachedDesired: boolean }`
  - `calculateCascade(input: CascadeInput): CascadeResult`

- [ ] **Step 1: Write the failing test**

Create `src/lib/diveMath/cascade.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { ATMOSPHERIC_BAR } from './units'
import { calculateCascade } from './cascade'

describe('calculateCascade', () => {
	it('equalizes target against a single bank', () => {
		const r = calculateCascade({
			banks: [{ volume: 50, pressure: 200 }],
			target: { volume: 10, startPressure: 0 },
		})
		// (1.01325*10 + 201.01325*50) / 60  -> gauge
		expect(r.finalPressure).toBeCloseTo(166.68, 1)
		expect(r.banks[0].residualPressure).toBeCloseTo(166.68, 1)
	})

	it('uses lowest-pressure banks first', () => {
		const r = calculateCascade({
			banks: [
				{ volume: 50, pressure: 200 },
				{ volume: 50, pressure: 100 },
			],
			target: { volume: 10, startPressure: 0 },
		})
		// low bank (100) used before high bank (200); final must exceed
		// equalizing only against the 200 bank would (since two stages add gas)
		expect(r.finalPressure).toBeGreaterThan(166.68)
		// residuals are reported in original input order
		expect(r.banks[0].residualPressure).toBeGreaterThan(
			r.banks[1].residualPressure,
		)
	})

	it('skips banks at or below the target pressure', () => {
		const r = calculateCascade({
			banks: [{ volume: 50, pressure: 50 }],
			target: { volume: 10, startPressure: 100 },
		})
		expect(r.finalPressure).toBe(100)
		expect(r.banks[0].residualPressure).toBe(50)
	})

	it('conserves gas (absolute P*V) across the system', () => {
		const banks = [
			{ volume: 50, pressure: 200 },
			{ volume: 40, pressure: 150 },
		]
		const target = { volume: 12, startPressure: 30 }
		const before =
			banks.reduce((s, b) => s + (b.pressure + ATMOSPHERIC_BAR) * b.volume, 0) +
			(target.startPressure + ATMOSPHERIC_BAR) * target.volume
		const r = calculateCascade({ banks, target })
		const after =
			r.banks.reduce(
				(s, b, i) =>
					s + (b.residualPressure + ATMOSPHERIC_BAR) * banks[i].volume,
				0,
			) +
			(r.finalPressure + ATMOSPHERIC_BAR) * target.volume
		expect(after).toBeCloseTo(before, 4)
	})

	it('reports whether the desired pressure is reached', () => {
		const reached = calculateCascade({
			banks: [{ volume: 200, pressure: 230 }],
			target: { volume: 10, startPressure: 0 },
			desiredPressure: 200,
		})
		expect(reached.reachedDesired).toBe(true)
		const notReached = calculateCascade({
			banks: [{ volume: 5, pressure: 230 }],
			target: { volume: 10, startPressure: 0 },
			desiredPressure: 200,
		})
		expect(notReached.reachedDesired).toBe(false)
	})

	it('handles an empty bank list', () => {
		const r = calculateCascade({
			banks: [],
			target: { volume: 10, startPressure: 50 },
			desiredPressure: 200,
		})
		expect(r.finalPressure).toBe(50)
		expect(r.banks).toEqual([])
		expect(r.reachedDesired).toBe(false)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/cascade.test.ts`
Expected: FAIL — `Cannot find module './cascade'`.

- [ ] **Step 3: Implement cascade.ts**

```ts
import { ATMOSPHERIC_BAR } from './units'

export interface BankCylinder {
	volume: number
	pressure: number
}

export interface CascadeInput {
	banks: BankCylinder[]
	target: { volume: number; startPressure: number }
	desiredPressure?: number
}

export interface CascadeResult {
	finalPressure: number
	banks: { residualPressure: number }[]
	reachedDesired: boolean
}

export function calculateCascade(input: CascadeInput): CascadeResult {
	const { banks, target, desiredPressure } = input
	const vt = target.volume
	let targetAbs = target.startPressure + ATMOSPHERIC_BAR

	// Residuals default to the untouched gauge pressure.
	const residual = banks.map((b) => b.pressure)

	// Connect banks lowest gauge pressure first to preserve high-pressure gas.
	const order = banks
		.map((_, i) => i)
		.sort((a, b) => banks[a].pressure - banks[b].pressure)

	for (const i of order) {
		const bankAbs = banks[i].pressure + ATMOSPHERIC_BAR
		if (bankAbs <= targetAbs) continue // cannot raise the target further
		const vb = banks[i].volume
		const eqAbs = (targetAbs * vt + bankAbs * vb) / (vt + vb)
		targetAbs = eqAbs
		residual[i] = eqAbs - ATMOSPHERIC_BAR
	}

	const finalPressure = targetAbs - ATMOSPHERIC_BAR
	const reachedDesired =
		desiredPressure != null && finalPressure >= desiredPressure - 1e-9

	return {
		finalPressure,
		banks: residual.map((r) => ({ residualPressure: r })),
		reachedDesired,
	}
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/cascade.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/diveMath/cascade.ts src/lib/diveMath/cascade.test.ts
git commit -m "feat: add cascade fill math"
```

---

### Task 3: Nitrox stick math

**Files:**
- Create: `src/lib/diveMath/nitroxStick.ts`
- Test: `src/lib/diveMath/nitroxStick.test.ts`

**Interfaces:**
- Consumes: `AIR_FO2` from `./units`.
- Produces:
  - `nitroxStickFlowRate(input: { targetFo2: number; airFlow: number }): number` — O₂ flow in the same unit as `airFlow`; `0` when `targetFo2 <= AIR_FO2`.
  - `interface SupplyDraw { o2SurfaceVolume: number; supplyPressureDrop: number }`
  - `nitroxStickSupplyDraw(input: { targetFo2: number; tankVolume: number; startPressure: number; finalPressure: number; supplyVolume: number }): SupplyDraw` — volumes in litres, pressures in bar; `supplyPressureDrop` in bar.

- [ ] **Step 1: Write the failing test**

Create `src/lib/diveMath/nitroxStick.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { nitroxStickFlowRate, nitroxStickSupplyDraw } from './nitroxStick'

describe('nitroxStickFlowRate', () => {
	it('computes O2 flow for EAN32 at a given air flow', () => {
		// Q_o2 = Q_air * (0.32 - 0.209) / (1 - 0.32)
		expect(nitroxStickFlowRate({ targetFo2: 0.32, airFlow: 100 })).toBeCloseTo(
			16.32,
			2,
		)
	})

	it('computes O2 flow for EAN36', () => {
		expect(nitroxStickFlowRate({ targetFo2: 0.36, airFlow: 100 })).toBeCloseTo(
			23.59,
			2,
		)
	})

	it('returns 0 when target is air or leaner', () => {
		expect(nitroxStickFlowRate({ targetFo2: 0.209, airFlow: 100 })).toBe(0)
		expect(nitroxStickFlowRate({ targetFo2: 0.18, airFlow: 100 })).toBe(0)
	})

	it('guards against divide-by-zero near pure O2', () => {
		const v = nitroxStickFlowRate({ targetFo2: 1, airFlow: 100 })
		expect(Number.isFinite(v)).toBe(false)
	})
})

describe('nitroxStickSupplyDraw', () => {
	it('computes O2 surface volume and supply drawdown for a fill', () => {
		const r = nitroxStickSupplyDraw({
			targetFo2: 0.32,
			tankVolume: 12,
			startPressure: 0,
			finalPressure: 200,
			supplyVolume: 50,
		})
		// added surface vol = 12 * 200 = 2400 L
		// O2 fraction of throughput = (0.32 - 0.209) / 0.791 = 0.14033
		// O2 surface vol = 2400 * 0.14033 = 336.79 L
		expect(r.o2SurfaceVolume).toBeCloseTo(336.79, 1)
		// supply drop = 336.79 / 50 = 6.74 bar
		expect(r.supplyPressureDrop).toBeCloseTo(6.74, 1)
	})

	it('returns zero draw when target is air', () => {
		const r = nitroxStickSupplyDraw({
			targetFo2: 0.209,
			tankVolume: 12,
			startPressure: 0,
			finalPressure: 200,
			supplyVolume: 50,
		})
		expect(r.o2SurfaceVolume).toBe(0)
		expect(r.supplyPressureDrop).toBe(0)
	})

	it('scales drawdown with the fill pressure delta', () => {
		const base = nitroxStickSupplyDraw({
			targetFo2: 0.32,
			tankVolume: 12,
			startPressure: 0,
			finalPressure: 100,
			supplyVolume: 50,
		})
		const more = nitroxStickSupplyDraw({
			targetFo2: 0.32,
			tankVolume: 12,
			startPressure: 0,
			finalPressure: 200,
			supplyVolume: 50,
		})
		expect(more.supplyPressureDrop).toBeCloseTo(2 * base.supplyPressureDrop, 4)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/nitroxStick.test.ts`
Expected: FAIL — `Cannot find module './nitroxStick'`.

- [ ] **Step 3: Implement nitroxStick.ts**

```ts
import { AIR_FO2 } from './units'

export function nitroxStickFlowRate(input: {
	targetFo2: number
	airFlow: number
}): number {
	const { targetFo2, airFlow } = input
	if (targetFo2 <= AIR_FO2) return 0
	return (airFlow * (targetFo2 - AIR_FO2)) / (1 - targetFo2)
}

export interface SupplyDraw {
	o2SurfaceVolume: number
	supplyPressureDrop: number
}

export function nitroxStickSupplyDraw(input: {
	targetFo2: number
	tankVolume: number
	startPressure: number
	finalPressure: number
	supplyVolume: number
}): SupplyDraw {
	const { targetFo2, tankVolume, startPressure, finalPressure, supplyVolume } =
		input
	if (targetFo2 <= AIR_FO2) {
		return { o2SurfaceVolume: 0, supplyPressureDrop: 0 }
	}
	const addedSurfaceVolume = tankVolume * (finalPressure - startPressure)
	const o2Fraction = (targetFo2 - AIR_FO2) / (1 - AIR_FO2)
	const o2SurfaceVolume = addedSurfaceVolume * o2Fraction
	const supplyPressureDrop =
		supplyVolume > 0 ? o2SurfaceVolume / supplyVolume : Infinity
	return { o2SurfaceVolume, supplyPressureDrop }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/nitroxStick.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/diveMath/nitroxStick.ts src/lib/diveMath/nitroxStick.test.ts
git commit -m "feat: add nitrox stick blending math"
```

---

### Task 4: Partial-pressure blend math

**Files:**
- Create: `src/lib/diveMath/blending.ts`
- Test: `src/lib/diveMath/blending.test.ts`

**Interfaces:**
- Consumes: `AIR_FO2` from `./units`.
- Produces:
  - `interface BlendInput { startPressure: number; startFo2: number; startFhe: number; finalPressure: number; targetFo2: number; targetFhe: number }` (pressures in bar gauge)
  - `interface BlendResult { pHe: number; pO2: number; pTop: number; addHeTo: number; addO2To: number; topTo: number; feasible: boolean; reason?: string }`
  - `calculateBlend(input: BlendInput): BlendResult` — adds pure He, then pure O₂, then tops with air.

- [ ] **Step 1: Write the failing test**

Create `src/lib/diveMath/blending.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { calculateBlend } from './blending'

describe('calculateBlend', () => {
	it('blends EAN32 from empty (nitrox, no helium)', () => {
		const r = calculateBlend({
			startPressure: 0,
			startFo2: 0.209,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.32,
			targetFhe: 0,
		})
		expect(r.feasible).toBe(true)
		expect(r.pHe).toBeCloseTo(0, 6)
		// pO2 = (0.32*200 - 0.209*0 - 0.209*(200)) / 0.791
		expect(r.pO2).toBeCloseTo(28.07, 1)
		expect(r.addO2To).toBeCloseTo(28.07, 1)
		expect(r.topTo).toBeCloseTo(200, 6)
	})

	it('blends trimix 18/45 from empty', () => {
		const r = calculateBlend({
			startPressure: 0,
			startFo2: 0.209,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.18,
			targetFhe: 0.45,
		})
		expect(r.feasible).toBe(true)
		expect(r.pHe).toBeCloseTo(90, 6)
		expect(r.addHeTo).toBeCloseTo(90, 6)
		expect(r.pO2).toBeCloseTo(16.46, 1)
		expect(r.addO2To).toBeCloseTo(106.46, 1)
		expect(r.pTop).toBeCloseTo(93.54, 1)
	})

	it('the three additions sum to the pressure delta', () => {
		const r = calculateBlend({
			startPressure: 50,
			startFo2: 0.209,
			startFhe: 0,
			finalPressure: 230,
			targetFo2: 0.3,
			targetFhe: 0.2,
		})
		expect(r.pHe + r.pO2 + r.pTop).toBeCloseTo(230 - 50, 6)
	})

	it('flags an impossible blend that needs draining', () => {
		const r = calculateBlend({
			startPressure: 150,
			startFo2: 0.36,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.32,
			targetFhe: 0,
		})
		expect(r.feasible).toBe(false)
		expect(r.reason).toBeTruthy()
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/blending.test.ts`
Expected: FAIL — `Cannot find module './blending'`.

- [ ] **Step 3: Implement blending.ts**

```ts
import { AIR_FO2 } from './units'

export interface BlendInput {
	startPressure: number
	startFo2: number
	startFhe: number
	finalPressure: number
	targetFo2: number
	targetFhe: number
}

export interface BlendResult {
	pHe: number
	pO2: number
	pTop: number
	addHeTo: number
	addO2To: number
	topTo: number
	feasible: boolean
	reason?: string
}

export function calculateBlend(input: BlendInput): BlendResult {
	const {
		startPressure: pi,
		startFo2,
		startFhe,
		finalPressure: pf,
		targetFo2,
		targetFhe,
	} = input

	// He balance: startFhe*pi + pHe = targetFhe*pf
	const pHe = targetFhe * pf - startFhe * pi
	// O2 balance with air top (top FO2 = AIR_FO2, top FHe = 0):
	// startFo2*pi + pO2 + AIR_FO2*pTop = targetFo2*pf, pTop = pf - pi - pHe - pO2
	const pO2 =
		(targetFo2 * pf - startFo2 * pi - AIR_FO2 * (pf - pi - pHe)) /
		(1 - AIR_FO2)
	const pTop = pf - pi - pHe - pO2

	const eps = 1e-6
	let feasible = true
	let reason: string | undefined
	if (pHe < -eps) {
		feasible = false
		reason = 'Too much helium in the start mix — draining required.'
	} else if (pO2 < -eps) {
		feasible = false
		reason = 'Too much oxygen in the start mix — draining required.'
	} else if (pTop < -eps) {
		feasible = false
		reason = 'Start pressure too high for this mix — draining required.'
	}

	return {
		pHe,
		pO2,
		pTop,
		addHeTo: pi + pHe,
		addO2To: pi + pHe + pO2,
		topTo: pf,
		feasible,
		reason,
	}
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/blending.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/diveMath/blending.ts src/lib/diveMath/blending.test.ts
git commit -m "feat: add partial-pressure blend math"
```

---

### Task 5: MOD + END math

**Files:**
- Create: `src/lib/diveMath/modEnd.ts`
- Test: `src/lib/diveMath/modEnd.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type Water = 'salt' | 'fresh'`
  - `type EndModel = 'o2-narcotic' | 'n2-only'`
  - `calculateMod(input: { fo2: number; ppo2: number; water: Water }): number` — MOD in metres.
  - `calculateEnd(input: { fo2: number; fhe: number; depth: number; water: Water; model: EndModel }): number` — END in metres (depth in metres).
  - `depthPerBar(water: Water): number` — `10` (salt) / `10.3` (fresh).

- [ ] **Step 1: Write the failing test**

Create `src/lib/diveMath/modEnd.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { calculateMod, calculateEnd, depthPerBar } from './modEnd'

describe('calculateMod', () => {
	it('computes EAN32 MOD at ppO2 1.4 in salt water', () => {
		// (1.4/0.32 - 1) * 10 = 33.75 m
		expect(calculateMod({ fo2: 0.32, ppo2: 1.4, water: 'salt' })).toBeCloseTo(
			33.75,
			2,
		)
	})

	it('computes EAN32 MOD at ppO2 1.6 in salt water', () => {
		expect(calculateMod({ fo2: 0.32, ppo2: 1.6, water: 'salt' })).toBeCloseTo(
			40,
			2,
		)
	})

	it('is deeper in fresh water than salt for the same mix', () => {
		const salt = calculateMod({ fo2: 0.32, ppo2: 1.4, water: 'salt' })
		const fresh = calculateMod({ fo2: 0.32, ppo2: 1.4, water: 'fresh' })
		expect(fresh).toBeGreaterThan(salt)
	})
})

describe('calculateEnd', () => {
	it('treats O2 as narcotic by default model', () => {
		// trimix 18/45 at 60 m salt: (60+10)*(1-0.45) - 10 = 28.5 m
		expect(
			calculateEnd({
				fo2: 0.18,
				fhe: 0.45,
				depth: 60,
				water: 'salt',
				model: 'o2-narcotic',
			}),
		).toBeCloseTo(28.5, 2)
	})

	it('n2-only model gives a shallower END than o2-narcotic for trimix', () => {
		const o2 = calculateEnd({
			fo2: 0.18,
			fhe: 0.45,
			depth: 60,
			water: 'salt',
			model: 'o2-narcotic',
		})
		const n2 = calculateEnd({
			fo2: 0.18,
			fhe: 0.45,
			depth: 60,
			water: 'salt',
			model: 'n2-only',
		})
		expect(n2).toBeLessThan(o2)
	})

	it('returns the dive depth for air on the o2-narcotic model', () => {
		expect(
			calculateEnd({
				fo2: 0.21,
				fhe: 0,
				depth: 30,
				water: 'salt',
				model: 'o2-narcotic',
			}),
		).toBeCloseTo(30, 6)
	})
})

describe('depthPerBar', () => {
	it('uses 10 m for salt and 10.3 m for fresh', () => {
		expect(depthPerBar('salt')).toBe(10)
		expect(depthPerBar('fresh')).toBe(10.3)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/modEnd.test.ts`
Expected: FAIL — `Cannot find module './modEnd'`.

- [ ] **Step 3: Implement modEnd.ts**

```ts
import { AIR_FN2 } from './units'

export type Water = 'salt' | 'fresh'
export type EndModel = 'o2-narcotic' | 'n2-only'

export function depthPerBar(water: Water): number {
	return water === 'fresh' ? 10.3 : 10
}

export function calculateMod(input: {
	fo2: number
	ppo2: number
	water: Water
}): number {
	const { fo2, ppo2, water } = input
	return (ppo2 / fo2 - 1) * depthPerBar(water)
}

export function calculateEnd(input: {
	fo2: number
	fhe: number
	depth: number
	water: Water
	model: EndModel
}): number {
	const { fo2, fhe, depth, water, model } = input
	const d0 = depthPerBar(water)
	if (model === 'n2-only') {
		const fn2 = 1 - fo2 - fhe
		return (depth + d0) * (fn2 / AIR_FN2) - d0
	}
	// o2-narcotic: narcotic fraction is everything that is not helium
	return (depth + d0) * (1 - fhe) - d0
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/modEnd.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: PASS (all diveMath tests, ~29).

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/diveMath/modEnd.ts src/lib/diveMath/modEnd.test.ts
git commit -m "feat: add MOD and END math"
```

---

### Task 6: Units preference provider

**Files:**
- Create: `src/components/Tools/UnitsProvider.tsx`

**Interfaces:**
- Consumes: `PressureUnit`, `DepthUnit`, `VolumeUnit` from `@/lib/diveMath/units`.
- Produces:
  - `interface UnitPrefs { pressure: PressureUnit; depth: DepthUnit; volume: VolumeUnit }`
  - `UnitsProvider` (React component, wraps children)
  - `useUnits(): { units: UnitPrefs; setUnit: <K extends keyof UnitPrefs>(key: K, value: UnitPrefs[K]) => void; hydrated: boolean }`
  - localStorage key `fillstation.tools.units`; default `{ pressure: 'psi', depth: 'ft', volume: 'cf' }`.

- [ ] **Step 1: Implement UnitsProvider.tsx**

```tsx
'use client'

import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'
import {
	DepthUnit,
	PressureUnit,
	VolumeUnit,
} from '@/lib/diveMath/units'

export interface UnitPrefs {
	pressure: PressureUnit
	depth: DepthUnit
	volume: VolumeUnit
}

const STORAGE_KEY = 'fillstation.tools.units'
const DEFAULT_UNITS: UnitPrefs = {
	pressure: 'psi',
	depth: 'ft',
	volume: 'cf',
}

interface UnitsContextValue {
	units: UnitPrefs
	setUnit: <K extends keyof UnitPrefs>(key: K, value: UnitPrefs[K]) => void
	hydrated: boolean
}

const UnitsContext = createContext<UnitsContextValue | null>(null)

const UnitsProvider = ({ children }: { children: ReactNode }) => {
	const [units, setUnits] = useState<UnitPrefs>(DEFAULT_UNITS)
	const [hydrated, setHydrated] = useState(false)

	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			if (raw) setUnits({ ...DEFAULT_UNITS, ...JSON.parse(raw) })
		} catch {
			// ignore malformed storage
		}
		setHydrated(true)
	}, [])

	const setUnit = <K extends keyof UnitPrefs>(key: K, value: UnitPrefs[K]) => {
		setUnits((prev) => {
			const next = { ...prev, [key]: value }
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
			} catch {
				// ignore storage failures
			}
			return next
		})
	}

	return (
		<UnitsContext.Provider value={{ units, setUnit, hydrated }}>
			{children}
		</UnitsContext.Provider>
	)
}

export function useUnits(): UnitsContextValue {
	const ctx = useContext(UnitsContext)
	if (!ctx) throw new Error('useUnits must be used within a UnitsProvider')
	return ctx
}

export default UnitsProvider
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Tools/UnitsProvider.tsx
git commit -m "feat: add tools units preference provider"
```

---

### Task 7: Unit toggle control

**Files:**
- Create: `src/components/Tools/UnitToggle.tsx`

**Interfaces:**
- Consumes: `useUnits` from `./UnitsProvider`; `UnitPrefs`.
- Produces:
  - `UnitToggle({ show }: { show: Array<keyof UnitPrefs> })` — renders a segmented button per requested unit dimension. Pressure options psi/bar, depth ft/m, volume cf/L.

- [ ] **Step 1: Implement UnitToggle.tsx**

```tsx
'use client'

import { UnitPrefs, useUnits } from './UnitsProvider'

const OPTIONS: Record<
	keyof UnitPrefs,
	{ label: string; values: { value: string; label: string }[] }
> = {
	pressure: {
		label: 'Pressure',
		values: [
			{ value: 'psi', label: 'psi' },
			{ value: 'bar', label: 'bar' },
		],
	},
	depth: {
		label: 'Depth',
		values: [
			{ value: 'ft', label: 'ft' },
			{ value: 'm', label: 'm' },
		],
	},
	volume: {
		label: 'Volume',
		values: [
			{ value: 'cf', label: 'cf' },
			{ value: 'l', label: 'L' },
		],
	},
}

const UnitToggle = ({ show }: { show: Array<keyof UnitPrefs> }) => {
	const { units, setUnit } = useUnits()

	return (
		<div className='flex flex-wrap gap-4'>
			{show.map((key) => {
				const opt = OPTIONS[key]
				return (
					<div key={key} className='flex items-center gap-2'>
						<span className='text-light-text text-xs font-medium'>
							{opt.label}
						</span>
						<div className='border-border inline-flex overflow-hidden rounded-md border'>
							{opt.values.map((v) => {
								const active = units[key] === v.value
								return (
									<button
										key={v.value}
										type='button'
										onClick={() =>
											setUnit(key, v.value as UnitPrefs[typeof key])
										}
										className={
											active
												? 'bg-accent text-accent-text px-3 py-1 text-sm font-medium'
												: 'text-text hover:bg-hover px-3 py-1 text-sm'
										}
									>
										{v.label}
									</button>
								)
							})}
						</div>
					</div>
				)
			})}
		</div>
	)
}

export default UnitToggle
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Tools/UnitToggle.tsx
git commit -m "feat: add tools unit toggle control"
```

---

### Task 8: Tabbed page shell + public route

**Files:**
- Create: `src/app/tools/page.tsx`
- Create: `src/components/Tools/ToolsPage.tsx`
- Create: `src/components/Tools/ToolsTabs.tsx`
- Modify: `src/proxy.ts` (add `/tools` to `publicPages`)

**Interfaces:**
- Consumes: `UnitsProvider` from `./UnitsProvider`.
- Produces:
  - `TABS` constant: `[{ id: 'cascade', name: 'Cascade Fill' }, { id: 'nitrox-stick', name: 'Nitrox Stick' }, { id: 'blend', name: 'Blend (PP)' }, { id: 'mod-end', name: 'MOD / END' }]` exported from `ToolsTabs.tsx`.
  - `type TabId = 'cascade' | 'nitrox-stick' | 'blend' | 'mod-end'`
  - `ToolsTabs({ active, onChange }: { active: TabId; onChange: (id: TabId) => void })`
  - `ToolsPage` reads `?tab=`, renders the active calculator (placeholder text in this task — replaced in Tasks 9-12).

- [ ] **Step 1: Add /tools to public pages in proxy.ts**

In `src/proxy.ts`, change:

```ts
const publicPages = ['/', '/api/auth', '/about', '/contact']
```

to:

```ts
const publicPages = ['/', '/api/auth', '/about', '/contact', '/tools']
```

- [ ] **Step 2: Create ToolsTabs.tsx**

```tsx
'use client'

export type TabId = 'cascade' | 'nitrox-stick' | 'blend' | 'mod-end'

export const TABS: { id: TabId; name: string }[] = [
	{ id: 'cascade', name: 'Cascade Fill' },
	{ id: 'nitrox-stick', name: 'Nitrox Stick' },
	{ id: 'blend', name: 'Blend (PP)' },
	{ id: 'mod-end', name: 'MOD / END' },
]

const ToolsTabs = ({
	active,
	onChange,
}: {
	active: TabId
	onChange: (id: TabId) => void
}) => {
	return (
		<div className='border-border flex flex-wrap gap-2 border-b'>
			{TABS.map((tab) => {
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
	)
}

export default ToolsTabs
```

- [ ] **Step 3: Create ToolsPage.tsx (placeholders for calculators)**

```tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import UnitsProvider from './UnitsProvider'
import ToolsTabs, { TABS, TabId } from './ToolsTabs'

function isTabId(value: string | null): value is TabId {
	return TABS.some((t) => t.id === value)
}

const ToolsPage = () => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const param = searchParams.get('tab')
	const active: TabId = isTabId(param) ? param : 'cascade'

	const onChange = (id: TabId) => {
		router.replace(`/tools?tab=${id}`)
	}

	return (
		<UnitsProvider>
			<div className='mx-auto max-w-3xl px-4 py-8'>
				<h1 className='text-text mb-2 text-3xl font-bold'>Dive Tools</h1>
				<p className='text-light-text mb-6 text-sm'>
					Gas blending and dive-planning calculators. Estimates only — always
					verify with an analyzer.
				</p>
				<ToolsTabs active={active} onChange={onChange} />
				<div className='mt-6'>
					{active === 'cascade' && <p className='text-text'>Cascade Fill</p>}
					{active === 'nitrox-stick' && (
						<p className='text-text'>Nitrox Stick</p>
					)}
					{active === 'blend' && <p className='text-text'>Blend (PP)</p>}
					{active === 'mod-end' && <p className='text-text'>MOD / END</p>}
				</div>
			</div>
		</UnitsProvider>
	)
}

export default ToolsPage
```

- [ ] **Step 4: Create the page route**

Create `src/app/tools/page.tsx`:

```tsx
import { Suspense } from 'react'
import ToolsPage from '@/components/Tools/ToolsPage'

export default function Tools() {
	return (
		<Suspense>
			<ToolsPage />
		</Suspense>
	)
}
```

- [ ] **Step 5: Verify it builds and runs**

Run: `npm run build`
Expected: build succeeds; `/tools` listed as a static route.

Then run `npm run dev`, open `http://localhost:3000/tools`, and confirm:
- the page loads while logged out (public),
- clicking tabs updates the `?tab=` URL and the shown placeholder.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/tools/page.tsx src/components/Tools/ToolsPage.tsx src/components/Tools/ToolsTabs.tsx src/proxy.ts
git commit -m "feat: add public tools page shell with tabbed navigation"
```

---

### Task 9: Navbar links

**Files:**
- Modify: `src/components/Layout/Navbar.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: a `Tools` link visible to logged-out and logged-in users (desktop + mobile).

- [ ] **Step 1: Add Tools link to the logged-out branch**

In `src/components/Layout/Navbar.tsx`, the logged-out branch currently renders a single About link:

```tsx
{session.status !== 'authenticated' ? (
	<Link href='/about' className='text-text text-sm/6 font-semibold'>
		About
	</Link>
) : (
```

Replace it with a grouped set including Tools:

```tsx
{session.status !== 'authenticated' ? (
	<div className='flex gap-x-8'>
		<Link href='/tools' className='text-text text-sm/6 font-semibold'>
			Tools
		</Link>
		<Link href='/about' className='text-text text-sm/6 font-semibold'>
			About
		</Link>
	</div>
) : (
```

- [ ] **Step 2: Add Tools link to the authenticated desktop nav**

In the authenticated desktop block, before the About link:

```tsx
<div className='hidden lg:flex lg:gap-x-12'>
	{navigation.map((item) => (
		<Link
			key={item.name}
			href={item.href}
			className='text-text text-sm/6 font-semibold'
		>
			{item.name}
		</Link>
	))}
	<Link href='/tools' className='text-text text-sm/6 font-semibold'>
		Tools
	</Link>
	<Link href='/about' className='text-text text-sm/6 font-semibold'>
		About
	</Link>
```

- [ ] **Step 3: Add Tools link to the mobile menu panel**

In the mobile `DialogPanel`, before the About link in the navigation list:

```tsx
<Link
	href='/tools'
	onClick={() => setMobileMenuOpen(false)}
	className='text-text hover:bg-hover -mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold'
>
	Tools
</Link>
<Link
	href='/about'
	onClick={() => setMobileMenuOpen(false)}
	className='text-text hover:bg-hover -mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold'
>
	About
</Link>
```

- [ ] **Step 4: Verify**

Run `npm run dev`; confirm the Tools link appears logged out (desktop) and logged in (desktop + mobile menu) and navigates to `/tools`.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/Layout/Navbar.tsx
git commit -m "feat: add Tools link to navbar"
```

---

### Task 10: Cascade calculator component

**Files:**
- Create: `src/components/Tools/CascadeCalculator.tsx`
- Modify: `src/components/Tools/ToolsPage.tsx` (swap placeholder)

**Interfaces:**
- Consumes: `calculateCascade`, `BankCylinder` from `@/lib/diveMath/cascade`; `toBar`, `fromBar`, `toLiters` from `@/lib/diveMath/units`; `useUnits`; `UnitToggle`; `NumberInput`.
- Produces: `CascadeCalculator` (default export).

- [ ] **Step 1: Implement CascadeCalculator.tsx**

```tsx
'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import { calculateCascade } from '@/lib/diveMath/cascade'
import { fromBar, toBar, toLiters } from '@/lib/diveMath/units'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

interface BankRow {
	volume: number
	pressure: number
}

const CascadeCalculator = () => {
	const { units } = useUnits()
	const [banks, setBanks] = useState<BankRow[]>([{ volume: 80, pressure: 3000 }])
	const [targetVolume, setTargetVolume] = useState(80)
	const [startPressure, setStartPressure] = useState(500)
	const [desiredPressure, setDesiredPressure] = useState(3000)

	const updateBank = (i: number, key: keyof BankRow, value: number) => {
		setBanks((prev) =>
			prev.map((b, idx) => (idx === i ? { ...b, [key]: value } : b)),
		)
	}
	const addBank = () =>
		setBanks((prev) => [...prev, { volume: 80, pressure: 3000 }])
	const removeBank = (i: number) =>
		setBanks((prev) => prev.filter((_, idx) => idx !== i))

	const result = calculateCascade({
		banks: banks.map((b) => ({
			volume: toLiters(b.volume, units.volume),
			pressure: toBar(b.pressure, units.pressure),
		})),
		target: {
			volume: toLiters(targetVolume, units.volume),
			startPressure: toBar(startPressure, units.pressure),
		},
		desiredPressure: toBar(desiredPressure, units.pressure),
	})

	const p = (bar: number) => Math.round(fromBar(bar, units.pressure))

	return (
		<div className='space-y-6'>
			<UnitToggle show={['pressure', 'volume']} />

			<section className='space-y-4'>
				<h2 className='text-text text-lg font-semibold'>Storage bank</h2>
				{banks.map((b, i) => (
					<div key={i} className='flex items-end gap-3'>
						<NumberInput
							id={`bank-vol-${i}`}
							name={`bank-vol-${i}`}
							label={`Volume (${units.volume})`}
							value={b.volume}
							onChange={(v) => updateBank(i, 'volume', v)}
						/>
						<NumberInput
							id={`bank-pr-${i}`}
							name={`bank-pr-${i}`}
							label={`Pressure (${units.pressure})`}
							value={b.pressure}
							onChange={(v) => updateBank(i, 'pressure', v)}
						/>
						<button
							type='button'
							onClick={() => removeBank(i)}
							disabled={banks.length === 1}
							className='text-light-text hover:text-text px-2 py-2 text-sm disabled:opacity-40'
						>
							Remove
						</button>
					</div>
				))}
				<button
					type='button'
					onClick={addBank}
					className='bg-accent text-accent-text rounded-md px-3 py-2 text-sm font-medium'
				>
					Add bank cylinder
				</button>
			</section>

			<section className='space-y-4'>
				<h2 className='text-text text-lg font-semibold'>Cylinder to fill</h2>
				<div className='flex items-end gap-3'>
					<NumberInput
						id='target-vol'
						name='target-vol'
						label={`Volume (${units.volume})`}
						value={targetVolume}
						onChange={setTargetVolume}
					/>
					<NumberInput
						id='target-start'
						name='target-start'
						label={`Start pressure (${units.pressure})`}
						value={startPressure}
						onChange={setStartPressure}
					/>
					<NumberInput
						id='target-desired'
						name='target-desired'
						label={`Desired pressure (${units.pressure})`}
						value={desiredPressure}
						onChange={setDesiredPressure}
					/>
				</div>
			</section>

			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Result</h2>
				<p className='text-text'>
					Final cylinder pressure:{' '}
					<span className='font-semibold'>
						{p(result.finalPressure)} {units.pressure}
					</span>
				</p>
				<p
					className={
						result.reachedDesired ? 'text-text text-sm' : 'text-light-text text-sm'
					}
				>
					{result.reachedDesired
						? 'Reaches the desired pressure.'
						: `Falls short of the desired ${desiredPressure} ${units.pressure}.`}
				</p>
				<div className='text-light-text text-sm'>
					Bank residual pressures:{' '}
					{result.banks.map((b, i) => (
						<span key={i}>
							{i > 0 ? ', ' : ''}
							{p(b.residualPressure)} {units.pressure}
						</span>
					))}
				</div>
			</section>
		</div>
	)
}

export default CascadeCalculator
```

- [ ] **Step 2: Wire it into ToolsPage.tsx**

In `src/components/Tools/ToolsPage.tsx`, add the import and replace the cascade placeholder:

```tsx
import CascadeCalculator from './CascadeCalculator'
```

```tsx
{active === 'cascade' && <CascadeCalculator />}
```

- [ ] **Step 3: Verify**

Run `npm run dev`, open `/tools`, confirm the cascade calculator renders, computes a final pressure, the unit toggles re-scale inputs/results, and Add/Remove bank works.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Tools/CascadeCalculator.tsx src/components/Tools/ToolsPage.tsx
git commit -m "feat: add cascade fill calculator UI"
```

---

### Task 11: Nitrox stick calculator component

**Files:**
- Create: `src/components/Tools/NitroxStickCalculator.tsx`
- Modify: `src/components/Tools/ToolsPage.tsx` (swap placeholder)

**Interfaces:**
- Consumes: `nitroxStickFlowRate`, `nitroxStickSupplyDraw` from `@/lib/diveMath/nitroxStick`; `toBar`, `fromBar`, `toLiters` from `@/lib/diveMath/units`; `useUnits`; `UnitToggle`; `NumberInput`.
- Produces: `NitroxStickCalculator` (default export).

- [ ] **Step 1: Implement NitroxStickCalculator.tsx**

```tsx
'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import {
	nitroxStickFlowRate,
	nitroxStickSupplyDraw,
} from '@/lib/diveMath/nitroxStick'
import { fromBar, toBar, toLiters } from '@/lib/diveMath/units'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

const NitroxStickCalculator = () => {
	const { units } = useUnits()
	const [fo2, setFo2] = useState(32)
	const [airFlow, setAirFlow] = useState(100)
	const [tankVolume, setTankVolume] = useState(80)
	const [startPressure, setStartPressure] = useState(0)
	const [finalPressure, setFinalPressure] = useState(3000)
	const [supplyVolume, setSupplyVolume] = useState(80)

	const targetFo2 = fo2 / 100
	const flow = nitroxStickFlowRate({ targetFo2, airFlow })
	const draw = nitroxStickSupplyDraw({
		targetFo2,
		tankVolume: toLiters(tankVolume, units.volume),
		startPressure: toBar(startPressure, units.pressure),
		finalPressure: toBar(finalPressure, units.pressure),
		supplyVolume: toLiters(supplyVolume, units.volume),
	})

	const leanWarning = targetFo2 <= 0.209

	return (
		<div className='space-y-6'>
			<UnitToggle show={['pressure', 'volume']} />

			<section className='space-y-4'>
				<h2 className='text-text text-lg font-semibold'>O₂ flow rate</h2>
				<div className='flex items-end gap-3'>
					<NumberInput
						id='ns-fo2'
						name='ns-fo2'
						label='Target O₂ (%)'
						value={fo2}
						onChange={setFo2}
					/>
					<NumberInput
						id='ns-airflow'
						name='ns-airflow'
						label='Compressor air flow'
						value={airFlow}
						onChange={setAirFlow}
					/>
				</div>
				<p className='text-text'>
					O₂ flow into the stick:{' '}
					<span className='font-semibold'>
						{leanWarning ? '0' : flow.toFixed(2)}
					</span>{' '}
					<span className='text-light-text text-sm'>
						(same units as the air flow you entered)
					</span>
				</p>
				{leanWarning && (
					<p className='text-light-text text-sm'>
						Target is air or leaner — no O₂ injection needed.
					</p>
				)}
			</section>

			<section className='space-y-4'>
				<h2 className='text-text text-lg font-semibold'>
					O₂ drawn from supply bottle
				</h2>
				<div className='flex flex-wrap items-end gap-3'>
					<NumberInput
						id='ns-tankvol'
						name='ns-tankvol'
						label={`Tank volume (${units.volume})`}
						value={tankVolume}
						onChange={setTankVolume}
					/>
					<NumberInput
						id='ns-start'
						name='ns-start'
						label={`Start pressure (${units.pressure})`}
						value={startPressure}
						onChange={setStartPressure}
					/>
					<NumberInput
						id='ns-final'
						name='ns-final'
						label={`Final pressure (${units.pressure})`}
						value={finalPressure}
						onChange={setFinalPressure}
					/>
					<NumberInput
						id='ns-supplyvol'
						name='ns-supplyvol'
						label={`Supply bottle volume (${units.volume})`}
						value={supplyVolume}
						onChange={setSupplyVolume}
					/>
				</div>
				<p className='text-text'>
					O₂ supply pressure drop:{' '}
					<span className='font-semibold'>
						{Math.round(fromBar(draw.supplyPressureDrop, units.pressure))}{' '}
						{units.pressure}
					</span>
				</p>
			</section>
		</div>
	)
}

export default NitroxStickCalculator
```

- [ ] **Step 2: Wire it into ToolsPage.tsx**

```tsx
import NitroxStickCalculator from './NitroxStickCalculator'
```

```tsx
{active === 'nitrox-stick' && <NitroxStickCalculator />}
```

- [ ] **Step 3: Verify**

Run `npm run dev`, open `/tools?tab=nitrox-stick`; confirm flow rate updates with target O₂ / air flow and the supply drop updates with the fill inputs and unit toggles.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Tools/NitroxStickCalculator.tsx src/components/Tools/ToolsPage.tsx
git commit -m "feat: add nitrox stick calculator UI"
```

---

### Task 12: Blend calculator component

**Files:**
- Create: `src/components/Tools/BlendCalculator.tsx`
- Modify: `src/components/Tools/ToolsPage.tsx` (swap placeholder)

**Interfaces:**
- Consumes: `calculateBlend` from `@/lib/diveMath/blending`; `toBar`, `fromBar` from `@/lib/diveMath/units`; `useUnits`; `UnitToggle`; `NumberInput`.
- Produces: `BlendCalculator` (default export).

- [ ] **Step 1: Implement BlendCalculator.tsx**

```tsx
'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import { calculateBlend } from '@/lib/diveMath/blending'
import { fromBar, toBar } from '@/lib/diveMath/units'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

const BlendCalculator = () => {
	const { units } = useUnits()
	const [startPressure, setStartPressure] = useState(0)
	const [startO2, setStartO2] = useState(21)
	const [startHe, setStartHe] = useState(0)
	const [finalPressure, setFinalPressure] = useState(3000)
	const [targetO2, setTargetO2] = useState(32)
	const [targetHe, setTargetHe] = useState(0)

	const result = calculateBlend({
		startPressure: toBar(startPressure, units.pressure),
		startFo2: startO2 / 100,
		startFhe: startHe / 100,
		finalPressure: toBar(finalPressure, units.pressure),
		targetFo2: targetO2 / 100,
		targetFhe: targetHe / 100,
	})

	const p = (bar: number) => Math.round(fromBar(bar, units.pressure))

	return (
		<div className='space-y-6'>
			<UnitToggle show={['pressure']} />

			<section className='space-y-4'>
				<h2 className='text-text text-lg font-semibold'>Starting gas</h2>
				<div className='flex flex-wrap items-end gap-3'>
					<NumberInput
						id='bl-start-pr'
						name='bl-start-pr'
						label={`Pressure (${units.pressure})`}
						value={startPressure}
						onChange={setStartPressure}
					/>
					<NumberInput
						id='bl-start-o2'
						name='bl-start-o2'
						label='O₂ (%)'
						value={startO2}
						onChange={setStartO2}
					/>
					<NumberInput
						id='bl-start-he'
						name='bl-start-he'
						label='He (%)'
						value={startHe}
						onChange={setStartHe}
					/>
				</div>
			</section>

			<section className='space-y-4'>
				<h2 className='text-text text-lg font-semibold'>Target gas</h2>
				<div className='flex flex-wrap items-end gap-3'>
					<NumberInput
						id='bl-final-pr'
						name='bl-final-pr'
						label={`Pressure (${units.pressure})`}
						value={finalPressure}
						onChange={setFinalPressure}
					/>
					<NumberInput
						id='bl-target-o2'
						name='bl-target-o2'
						label='O₂ (%)'
						value={targetO2}
						onChange={setTargetO2}
					/>
					<NumberInput
						id='bl-target-he'
						name='bl-target-he'
						label='He (%)'
						value={targetHe}
						onChange={setTargetHe}
					/>
				</div>
			</section>

			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Fill sequence</h2>
				{result.feasible ? (
					<ol className='text-text list-decimal space-y-1 pl-5'>
						<li>
							Add helium to{' '}
							<span className='font-semibold'>
								{p(result.addHeTo)} {units.pressure}
							</span>
						</li>
						<li>
							Add oxygen to{' '}
							<span className='font-semibold'>
								{p(result.addO2To)} {units.pressure}
							</span>
						</li>
						<li>
							Top with air to{' '}
							<span className='font-semibold'>
								{p(result.topTo)} {units.pressure}
							</span>
						</li>
					</ol>
				) : (
					<p className='text-light-text text-sm'>{result.reason}</p>
				)}
			</section>
		</div>
	)
}

export default BlendCalculator
```

- [ ] **Step 2: Wire it into ToolsPage.tsx**

```tsx
import BlendCalculator from './BlendCalculator'
```

```tsx
{active === 'blend' && <BlendCalculator />}
```

- [ ] **Step 3: Verify**

Run `npm run dev`, open `/tools?tab=blend`; confirm EAN32-from-empty shows an O₂ then air sequence, a trimix target shows He → O₂ → air, and an over-rich start shows the drain warning.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Tools/BlendCalculator.tsx src/components/Tools/ToolsPage.tsx
git commit -m "feat: add partial-pressure blend calculator UI"
```

---

### Task 13: MOD/END calculator component

**Files:**
- Create: `src/components/Tools/ModEndCalculator.tsx`
- Modify: `src/components/Tools/ToolsPage.tsx` (swap placeholder)

**Interfaces:**
- Consumes: `calculateMod`, `calculateEnd`, `Water`, `EndModel` from `@/lib/diveMath/modEnd`; `toMeters`, `fromMeters` from `@/lib/diveMath/units`; `useUnits`; `UnitToggle`; `NumberInput`; `RadioGroup`.
- Produces: `ModEndCalculator` (default export).

- [ ] **Step 1: Implement ModEndCalculator.tsx**

```tsx
'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import {
	calculateEnd,
	calculateMod,
	EndModel,
	Water,
} from '@/lib/diveMath/modEnd'
import { fromMeters, toMeters } from '@/lib/diveMath/units'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

const ModEndCalculator = () => {
	const { units } = useUnits()
	const [fo2, setFo2] = useState(32)
	const [fhe, setFhe] = useState(0)
	const [ppo2, setPpo2] = useState(1.4)
	const [water, setWater] = useState<Water>('salt')
	const [model, setModel] = useState<EndModel>('o2-narcotic')
	const [depth, setDepth] = useState(100)

	const fo2Frac = fo2 / 100
	const fheFrac = fhe / 100
	const depthM = toMeters(depth, units.depth)

	const modEditable = calculateMod({ fo2: fo2Frac, ppo2, water })
	const mod16 = calculateMod({ fo2: fo2Frac, ppo2: 1.6, water })
	const end = calculateEnd({
		fo2: fo2Frac,
		fhe: fheFrac,
		depth: depthM,
		water,
		model,
	})

	const d = (m: number) => Math.round(fromMeters(m, units.depth))

	return (
		<div className='space-y-6'>
			<UnitToggle show={['depth']} />

			<section className='flex flex-wrap items-end gap-3'>
				<NumberInput
					id='me-fo2'
					name='me-fo2'
					label='O₂ (%)'
					value={fo2}
					onChange={setFo2}
				/>
				<NumberInput
					id='me-fhe'
					name='me-fhe'
					label='He (%)'
					value={fhe}
					onChange={setFhe}
				/>
				<NumberInput
					id='me-ppo2'
					name='me-ppo2'
					label='Working ppO₂'
					value={ppo2}
					onChange={setPpo2}
				/>
			</section>

			<section className='flex flex-wrap gap-6'>
				<RadioGroup
					title='Water'
					name='water'
					value={water}
					onChange={(v) => setWater(v as Water)}
					options={[
						{ value: 'salt', label: 'Salt' },
						{ value: 'fresh', label: 'Fresh' },
					]}
				/>
				<RadioGroup
					title='END model'
					name='end-model'
					value={model}
					onChange={(v) => setModel(v as EndModel)}
					options={[
						{ value: 'o2-narcotic', label: 'O₂ narcotic' },
						{ value: 'n2-only', label: 'N₂ only' },
					]}
				/>
			</section>

			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Maximum operating depth</h2>
				<p className='text-text'>
					ppO₂ {ppo2}:{' '}
					<span className='font-semibold'>
						{d(modEditable)} {units.depth}
					</span>
				</p>
				<p className='text-text'>
					ppO₂ 1.6:{' '}
					<span className='font-semibold'>
						{d(mod16)} {units.depth}
					</span>
				</p>
			</section>

			<section className='border-border space-y-3 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>
					Equivalent narcotic depth
				</h2>
				<NumberInput
					id='me-depth'
					name='me-depth'
					label={`Planned depth (${units.depth})`}
					value={depth}
					onChange={setDepth}
				/>
				<p className='text-text'>
					END at {depth} {units.depth}:{' '}
					<span className='font-semibold'>
						{d(end)} {units.depth}
					</span>
				</p>
			</section>
		</div>
	)
}

export default ModEndCalculator
```

- [ ] **Step 2: Wire it into ToolsPage.tsx**

```tsx
import ModEndCalculator from './ModEndCalculator'
```

```tsx
{active === 'mod-end' && <ModEndCalculator />}
```

- [ ] **Step 3: Verify**

Run `npm run dev`, open `/tools?tab=mod-end`; confirm EAN32 shows MOD ≈ 111 ft @1.4 and ≈ 131 ft @1.6 (or ≈33.8 m / 40 m in metric), the depth toggle re-scales, and switching water / END model changes the numbers.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Final full check**

Run: `npm test && npm run build`
Expected: all tests pass; build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/Tools/ModEndCalculator.tsx src/components/Tools/ToolsPage.tsx
git commit -m "feat: add MOD/END calculator UI"
```

---

## Self-Review Notes

- **Spec coverage:** public route + proxy whitelist (Task 8); `?tab=` nav (Task 8); independent localStorage units (Tasks 6-7); cascade (Tasks 2, 10); nitrox stick flow + supply draw (Tasks 3, 11); PP blend nitrox+trimix (Tasks 4, 12); MOD@1.4 editable + 1.6 and END O₂-narcotic/N₂-only toggle, fresh/salt, units (Tasks 5, 13); navbar links (Task 9); Vitest with per-formula tests (Tasks 1-5); `NumberInput` `console.log` removal — see note below.
- **NumberInput console.log:** the spec calls for removing the stray `console.log(value)` in `src/components/UI/FormElements/NumberInput.tsx`. Do this as a one-line cleanup during Task 10 (first task that renders `NumberInput`) and include it in that commit; decimal entry for `ppO₂ 1.4` works through the existing `Number()` coercion, so no further change is needed.
- **Internal units:** all math is SI (bar gauge / litres / metres); components convert at the boundary via `toBar/fromBar`, `toLiters`, `toMeters/fromMeters`.
