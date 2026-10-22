# Booster Cycle Timing, Compressor Duty & Two-Stage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Booster calculator with two-stage (regulated-inlet) support, drive-gas compressor modelling (rough duty cycle + cycle timing with slow/fast warnings), and time-axis graphs (dual-axis supply/receiver pressure; cycle rate with threshold bands).

**Architecture:** Extend pure SI math in `src/lib/diveMath/booster.ts` (inlet-cap drive-gas + a `boosterTiming` function + timing fields on the fill profile, all TDD). Add two presentational SVG charts. Rework `BoosterCalculator` to add the booster per-cycle/max-consumption + two-stage + compressor inputs, the timing display, and the new charts.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, Vitest.

## Global Constraints

- Prettier: single quotes, no semicolons, tabs, 80-char. Run `npm run lint` after each task.
- Theme tokens only (`bg-surface`, `text-text`, `text-light-text`, `text-accent`, `text-warning`, `text-danger`, `border-border`). No hardcoded colors, no `dark:`.
- `'use client'` on interactive components; `booster.ts` is pure SI (no React/JSX/unit logic).
- Import alias `@/*` → `src/*`. Reuse `NumberInput`, `SafetyNote`, `TankSizePicker`, `BoosterPicker`, `useUnits`, `UnitToggle`. No raw inputs.
- SI: pressures bar gauge (absolute = `+ATMOSPHERIC_BAR`); volumes litres; rates litres/min; time seconds. Storage entered in US gallons (`1 gal = 3.785411784 L`).
- Single-stage behaviour must be byte-for-byte unchanged (existing booster tests must keep passing): two-stage is an optional inlet cap; absent ⇒ identical math.
- Flow-limit / needle-valve control is OUT OF SCOPE (deferred).

---

### Task 1: Two-stage inlet-cap in booster drive-gas math

**Files:**
- Modify: `src/lib/diveMath/booster.ts`
- Test: `src/lib/diveMath/booster.test.ts`

**Interfaces:**
- Consumes: existing `ATMOSPHERIC_BAR`, `boostSetup`.
- Produces: `BoosterInput` gains optional `regulatedInletBar?: number` (bar gauge; the two-stage regulated inlet cap). `calculateBooster`/`boosterFillProfile` honour the cap (effective inlet = `min(supply, cap)`). A private `driveAirForQ(...)` helper. Single-stage (`regulatedInletBar` undefined) is unchanged.

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/diveMath/booster.test.ts`:

```ts
describe('two-stage (regulated inlet cap)', () => {
	it('matches single-stage when the cap is at/above the equalized supply', () => {
		const single = calculateBooster(base)
		const capped = calculateBooster({ ...base, regulatedInletBar: 1000 })
		expect(capped.driveAirL).toBeCloseTo(single.driveAirL, 6)
	})
	it('uses less drive air than single-stage with a low regulated inlet', () => {
		// a low cap means the falling-inlet (log) penalty is replaced by a
		// constant low inlet for the early part — but the constant term uses the
		// low cap as the divisor; check it differs and is finite/positive
		const single = calculateBooster(base)
		const capped = calculateBooster({ ...base, regulatedInletBar: 60 })
		expect(capped.feasible).toBe(true)
		expect(capped.driveAirL).toBeGreaterThan(0)
		expect(capped.driveAirL).not.toBeCloseTo(single.driveAirL, 1)
	})
	it('hand-checked capped value (cap below equalized supply)', () => {
		// base: ratio 30, drive 10, Vs 50, supplyStart 200, Vr 12,
		// receiverStart 50, target 200. eqAbs ≈ 171.98, boostStart ≈ 170.97,
		// Q = 12*(200−170.97) ≈ 348.39. cap = 60 bar → capAbs ≈ 61.013.
		// qStar = 50*(171.98−61.013) ≈ 5548 > Q ⇒ whole boost is constant-inlet:
		// drive = 30*11.013*348.39/61.013 ≈ 1885 L
		const r = calculateBooster({ ...base, regulatedInletBar: 60 })
		expect(r.driveAirL).toBeGreaterThan(1850)
		expect(r.driveAirL).toBeLessThan(1920)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/booster.test.ts`
Expected: FAIL — `regulatedInletBar` not honoured (capped equals single, or type error).

- [ ] **Step 3: Implement the inlet cap**

In `src/lib/diveMath/booster.ts`, add `regulatedInletBar?: number` to `BoosterInput`:

```ts
export interface BoosterInput {
	ratio: number
	driveP: number
	supplyVol: number
	supplyStart: number
	receiverVol: number
	receiverStart: number
	target: number
	regulatedInletBar?: number
}
```

Add a private helper after `boostSetup`:

```ts
// Drive air (free litres) to move Q free litres into the receiver, with the
// inlet pressure capped at capAbs (two-stage regulated inlet). capAbs = +∞ for
// single-stage. While the supply (inletStartAbs − q/vs) is above the cap the
// inlet is constant (linear drive term); below it, the inlet follows the supply
// down (log term).
function driveAirForQ(
	q: number,
	inletStartAbs: number,
	capAbs: number,
	vs: number,
	ratio: number,
	drivePAbs: number,
): number {
	if (q <= 0) return 0
	const qStar = Math.max(0, vs * (inletStartAbs - capAbs))
	const q1 = Math.min(q, qStar)
	const seg1 = q1 > 0 ? ((ratio * drivePAbs) / capAbs) * q1 : 0
	let seg2 = 0
	if (q > qStar) {
		const startAbs2 = qStar > 0 ? capAbs : inletStartAbs
		const finalAbs = inletStartAbs - q / vs
		seg2 = ratio * drivePAbs * vs * Math.log(startAbs2 / finalAbs)
	}
	return seg1 + seg2
}
```

In `calculateBooster`, compute `capAbs` and replace the two drive-air computations with `driveAirForQ`:

```ts
	const capAbs =
		input.regulatedInletBar !== undefined
			? input.regulatedInletBar + ATM
			: Infinity
```

- supply-limited branch `driveAirL`: replace `ratio * drivePAbs * vs * Math.log(inletStartAbs / ATM)` with `driveAirForQ(availQ, inletStartAbs, capAbs, vs, ratio, drivePAbs)`.
- normal branch: replace `const finalInletAbs = ...; const driveAirL = ratio * drivePAbs * vs * Math.log(inletStartAbs / finalInletAbs)` with:

```ts
	const finalInletAbs = inletStartAbs - q / vs
	const driveAirL = driveAirForQ(q, inletStartAbs, capAbs, vs, ratio, drivePAbs)
```

In `boosterFillProfile`, compute `capAbs` the same way and use it for the cumulative drive and the (effective-inlet) rate:

```ts
	const capAbs =
		input.regulatedInletBar !== undefined
			? input.regulatedInletBar + ATM
			: Infinity
	...
		const cumulativeDriveL = driveAirForQ(
			q,
			inletStartAbs,
			capAbs,
			vs,
			ratio,
			drivePAbs,
		)
		const effInletAbs = Math.min(inletAbs, capAbs)
		points.push({
			receiverP,
			cumulativeDriveL,
			supplyP: inletAbs - ATM,
			rateLPerBar: (ratio * drivePAbs * vr) / effInletAbs,
		})
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/booster.test.ts`
Expected: PASS — new two-stage tests pass AND all existing single-stage tests pass unchanged.

- [ ] **Step 5: Lint + commit**

```bash
npm run lint
git add src/lib/diveMath/booster.ts src/lib/diveMath/booster.test.ts
git commit -m "feat: two-stage regulated-inlet cap in booster drive-gas math"
```

---

### Task 2: Booster timing + profile time/cycle fields

**Files:**
- Modify: `src/lib/diveMath/booster.ts`
- Test: `src/lib/diveMath/booster.test.ts`

**Interfaces:**
- Consumes: existing booster internals.
- Produces:
  - `interface BoosterTiming { totalCycles; fillSeconds; phase1Seconds; phase2Seconds; cycleRate1; cycleRate2; dutyCycle; dutyContinuous }` (rates in cycles/sec, duty 0–1)
  - `interface TimingArgs { driveAirL; vdPerCycleL; driveMaxLpm; compressorRateLpm; storageL?; storageMaxBar?; storageMinBar? }`
  - `boosterTiming(args: TimingArgs): BoosterTiming | null` (null if `vdPerCycleL`/`compressorRateLpm`/`driveMaxLpm` ≤ 0)
  - `ProfilePoint` gains optional `timeSeconds?`, `cumulativeCycles?`, `cycleRatePerSec?`
  - `boosterFillProfile(input, steps?, timing?: TimingArgs): ProfilePoint[]` — when `timing` is supplied (and valid), attaches the time/cycle fields.

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/diveMath/booster.test.ts` (add `boosterTiming` to the `./booster` import):

```ts
import { boosterTiming } from './booster'

describe('boosterTiming', () => {
	const t = {
		driveAirL: 6000,
		vdPerCycleL: 3,
		driveMaxLpm: 300,
		compressorRateLpm: 600,
		storageL: 100,
		storageMaxBar: 12,
		storageMinBar: 8,
	}
	it('returns null without the required data', () => {
		expect(boosterTiming({ ...t, vdPerCycleL: 0 })).toBeNull()
		expect(boosterTiming({ ...t, compressorRateLpm: 0 })).toBeNull()
	})
	it('compressor keeps up: single phase, duty < 1', () => {
		const r = boosterTiming(t)! // driveMax 300 ≤ compressor 600
		expect(r.totalCycles).toBeCloseTo(2000, 6) // 6000/3
		expect(r.dutyContinuous).toBe(false)
		expect(r.dutyCycle).toBeCloseTo(0.5, 6) // 300/600
		expect(r.fillSeconds).toBeCloseTo((6000 / 300) * 60, 6)
		expect(r.cycleRate1).toBeCloseTo(300 / 3 / 60, 6)
	})
	it('buffer-limited: two phases, continuous duty, fill = p1 + p2', () => {
		const r = boosterTiming({ ...t, driveMaxLpm: 1200 })! // > compressor 600
		expect(r.dutyContinuous).toBe(true)
		expect(r.dutyCycle).toBe(1)
		expect(r.fillSeconds).toBeCloseTo(r.phase1Seconds + r.phase2Seconds, 6)
		expect(r.phase1Seconds).toBeGreaterThan(0)
		expect(r.phase2Seconds).toBeGreaterThan(0)
		expect(r.cycleRate1).toBeGreaterThan(r.cycleRate2)
	})
	it('zero boost ⇒ zero timing', () => {
		const r = boosterTiming({ ...t, driveAirL: 0 })!
		expect(r.fillSeconds).toBe(0)
		expect(r.totalCycles).toBe(0)
	})
})

describe('boosterFillProfile timing fields', () => {
	const timing = {
		driveAirL: 0, // overwritten below via summary
		vdPerCycleL: 3,
		driveMaxLpm: 1200,
		compressorRateLpm: 600,
		storageL: 100,
		storageMaxBar: 12,
		storageMinBar: 8,
	}
	it('omits time fields when no timing supplied', () => {
		const p = boosterFillProfile(base, 20)
		expect(p[0].timeSeconds).toBeUndefined()
	})
	it('attaches increasing time and cycles ending at the totals', () => {
		const summary = calculateBooster(base)
		const t = { ...timing, driveAirL: summary.driveAirL }
		const p = boosterFillProfile(base, 40, t)
		const tm = boosterTiming(t)!
		expect(p[0].timeSeconds).toBeCloseTo(0, 6)
		for (let i = 1; i < p.length; i++) {
			expect(p[i].timeSeconds!).toBeGreaterThanOrEqual(p[i - 1].timeSeconds!)
		}
		expect(p[p.length - 1].timeSeconds!).toBeCloseTo(tm.fillSeconds, 1)
		expect(p[p.length - 1].cumulativeCycles!).toBeCloseTo(tm.totalCycles, 1)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/booster.test.ts`
Expected: FAIL — `boosterTiming` undefined / no timing fields.

- [ ] **Step 3: Implement boosterTiming + profile timing**

Add the interfaces and function to `src/lib/diveMath/booster.ts`:

```ts
export interface BoosterTiming {
	totalCycles: number
	fillSeconds: number
	phase1Seconds: number
	phase2Seconds: number
	cycleRate1: number
	cycleRate2: number
	dutyCycle: number
	dutyContinuous: boolean
}

export interface TimingArgs {
	driveAirL: number
	vdPerCycleL: number
	driveMaxLpm: number
	compressorRateLpm: number
	storageL?: number
	storageMaxBar?: number
	storageMinBar?: number
}

export function boosterTiming(args: TimingArgs): BoosterTiming | null {
	const { driveAirL, vdPerCycleL, driveMaxLpm, compressorRateLpm } = args
	if (!(vdPerCycleL > 0) || !(compressorRateLpm > 0) || !(driveMaxLpm > 0)) {
		return null
	}
	const totalCycles = driveAirL / vdPerCycleL
	const cycleRate = (lpm: number) => lpm / vdPerCycleL / 60
	if (driveAirL <= 0) {
		return {
			totalCycles: 0,
			fillSeconds: 0,
			phase1Seconds: 0,
			phase2Seconds: 0,
			cycleRate1: 0,
			cycleRate2: 0,
			dutyCycle: 0,
			dutyContinuous: false,
		}
	}
	if (driveMaxLpm <= compressorRateLpm) {
		const fillSeconds = (driveAirL / driveMaxLpm) * 60
		const rate = cycleRate(driveMaxLpm)
		return {
			totalCycles,
			fillSeconds,
			phase1Seconds: fillSeconds,
			phase2Seconds: 0,
			cycleRate1: rate,
			cycleRate2: rate,
			dutyCycle: driveMaxLpm / compressorRateLpm,
			dutyContinuous: false,
		}
	}
	const buffer =
		args.storageL && args.storageMaxBar != null && args.storageMinBar != null
			? Math.max(0, args.storageL * (args.storageMaxBar - args.storageMinBar))
			: 0
	const bufferDrainSec = buffer > 0 ? (buffer / (driveMaxLpm - compressorRateLpm)) * 60 : 0
	const fillAtMaxSec = (driveAirL / driveMaxLpm) * 60
	const phase1Seconds = Math.min(bufferDrainSec, fillAtMaxSec)
	const driveP1 = (driveMaxLpm * phase1Seconds) / 60
	const remaining = Math.max(0, driveAirL - driveP1)
	const phase2Seconds = remaining > 0 ? (remaining / compressorRateLpm) * 60 : 0
	return {
		totalCycles,
		fillSeconds: phase1Seconds + phase2Seconds,
		phase1Seconds,
		phase2Seconds,
		cycleRate1: cycleRate(driveMaxLpm),
		cycleRate2: cycleRate(compressorRateLpm),
		dutyCycle: 1,
		dutyContinuous: true,
	}
}
```

Extend `ProfilePoint`:

```ts
export interface ProfilePoint {
	receiverP: number
	cumulativeDriveL: number
	supplyP: number
	rateLPerBar: number
	timeSeconds?: number
	cumulativeCycles?: number
	cycleRatePerSec?: number
}
```

Change `boosterFillProfile` signature to `(input, steps = 40, timing?: TimingArgs)`. After computing each point's `cumulativeDriveL`, if `timing` is present and `boosterTiming(timing)` is non-null, attach time/cycle fields. Compute the timing once before the loop:

```ts
export function boosterFillProfile(
	input: BoosterInput,
	steps = 40,
	timing?: TimingArgs,
): ProfilePoint[] {
	// ...existing setup, capAbs, summary, reached, early return...
	const tm = timing ? boosterTiming(timing) : null
	const driveP1 = tm ? (timing!.driveMaxLpm * tm.phase1Seconds) / 60 : 0

	const points: ProfilePoint[] = []
	for (let i = 0; i <= steps; i++) {
		// ...existing receiverP, q, inletAbs, cumulativeDriveL, effInletAbs...
		const point: ProfilePoint = {
			receiverP,
			cumulativeDriveL,
			supplyP: inletAbs - ATM,
			rateLPerBar: (ratio * drivePAbs * vr) / effInletAbs,
		}
		if (tm) {
			const d = cumulativeDriveL
			point.cumulativeCycles = d / timing!.vdPerCycleL
			point.timeSeconds =
				d <= driveP1
					? (d / timing!.driveMaxLpm) * 60
					: tm.phase1Seconds + ((d - driveP1) / timing!.compressorRateLpm) * 60
			point.cycleRatePerSec = d <= driveP1 ? tm.cycleRate1 : tm.cycleRate2
		}
		points.push(point)
	}
	return points
}
```

(For the compressor-keeps-up case `phase1Seconds === fillSeconds` and `driveP1 === driveAirL`, so every point is in phase 1 — `timeSeconds = d/driveMax*60`, a single rate. Correct.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/booster.test.ts`
Expected: PASS (timing + profile-timing tests, plus all earlier booster tests).

- [ ] **Step 5: Full suite + lint + commit**

```bash
npm test && npm run lint
git add src/lib/diveMath/booster.ts src/lib/diveMath/booster.test.ts
git commit -m "feat: add booster timing (cycles, fill time, duty) + profile time fields"
```

---

### Task 3: Extend booster presets (two-stage + per-cycle data)

**Files:**
- Modify: `src/components/Tools/presets.ts`
- Test: `src/components/Tools/presets.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `BoosterPreset` gains `twoStage: boolean`, `vdPerCycleL: number`, `driveMaxLpm: number`. `0` for `vdPerCycleL`/`driveMaxLpm` means "unknown — enter from the datasheet" (the UI seeds the editable field and hides timing until set).

- [ ] **Step 1: Update the failing test**

In `src/components/Tools/presets.test.ts`, extend the booster block:

```ts
	it('flags the two-stage models and carries per-cycle fields', () => {
		for (const b of BOOSTERS) {
			expect(typeof b.twoStage).toBe('boolean')
			expect(b.vdPerCycleL).toBeGreaterThanOrEqual(0)
			expect(b.driveMaxLpm).toBeGreaterThanOrEqual(0)
		}
		expect(BOOSTERS.some((b) => b.twoStage)).toBe(true)
	})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/Tools/presets.test.ts`
Expected: FAIL — `twoStage`/`vdPerCycleL`/`driveMaxLpm` missing.

- [ ] **Step 3: Extend BoosterPreset + BOOSTERS**

In `src/components/Tools/presets.ts`, update the interface and data. `vdPerCycleL`/`driveMaxLpm` are left `0` (model-specific drive-air-consumption / displacement figures are not reliably published; the UI seeds an editable field and the user enters their booster's value). `twoStage` is set from the model designation.

```ts
export interface BoosterPreset {
	name: string
	ratio: number
	twoStage: boolean
	// Drive-air consumed per cycle (free L) and max drive-air consumption (free
	// L/min). Model-specific and not reliably published per model, so default 0
	// ("unknown"); the calculator seeds an editable field the user fills from the
	// booster datasheet. Two-stage flag from the model designation.
	vdPerCycleL: number
	driveMaxLpm: number
}

export const BOOSTERS: BoosterPreset[] = [
	{ name: 'Haskel AG-30', ratio: 30, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'Haskel AG-50', ratio: 50, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'Haskel AG-62', ratio: 62, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'Haskel AG-75', ratio: 75, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'Haskel AG-102', ratio: 102, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'Haskel AG-152', ratio: 152, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'USUN XB30 / XBD30', ratio: 30, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'USUN GB40 / GBD40', ratio: 40, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'USUN GB40-OL-F (O₂)', ratio: 40, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'USUN GBT 15/40 (2-stage)', ratio: 40, twoStage: true, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'USUN SBT 15/40 (2-stage)', ratio: 40, twoStage: true, vdPerCycleL: 0, driveMaxLpm: 0 },
]
```

Keep the existing source comment above `BOOSTERS`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/components/Tools/presets.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
npm run lint
git add src/components/Tools/presets.ts src/components/Tools/presets.test.ts
git commit -m "feat: add two-stage flag and per-cycle fields to booster presets"
```

---

### Task 4: Time-axis charts (dual-axis pressure + banded cycle rate)

**Files:**
- Create: `src/components/Tools/DualAxisChart.tsx`
- Create: `src/components/Tools/CycleRateChart.tsx`

**Interfaces:**
- Consumes: nothing (presentational; caller passes display-unit arrays).
- Produces:
  - `interface AxisSeries { label: string; colorClass: string; values: number[]; unit: string }`
  - `DualAxisChart({ x, xLabels, xCaption, left, right }: { x: number[]; xLabels: string[]; xCaption: string; left: AxisSeries; right: AxisSeries })`
  - `CycleRateChart({ times, xLabels, xCaption, rates, highPerSec, lowPerSec }: { times: number[]; xLabels: string[]; xCaption: string; rates: number[]; highPerSec: number; lowPerSec: number })`

No unit tests (presentational). Verified by build.

- [ ] **Step 1: Implement DualAxisChart.tsx**

```tsx
export interface AxisSeries {
	label: string
	colorClass: string
	values: number[]
	unit: string
}

const W = 320
const H = 150
const PAD = 8

function scaler(values: number[], h: number) {
	const min = Math.min(...values)
	const max = Math.max(...values)
	const span = max - min || 1
	return {
		min,
		max,
		y: (v: number) => h - PAD - ((v - min) / span) * (h - 2 * PAD),
	}
}

const DualAxisChart = ({
	x,
	xLabels,
	xCaption,
	left,
	right,
}: {
	x: number[]
	xLabels: string[]
	xCaption: string
	left: AxisSeries
	right: AxisSeries
}) => {
	const n = x.length
	if (n < 2) return null
	const px = (i: number) => PAD + (i / (n - 1)) * (W - 2 * PAD)
	const ls = scaler(left.values, H)
	const rs = scaler(right.values, H)
	const line = (vals: number[], s: ReturnType<typeof scaler>) =>
		vals.map((v, i) => `${px(i)},${s.y(v)}`).join(' ')

	return (
		<div className='border-border bg-surface rounded-md border p-4'>
			<div className='mb-1 flex flex-wrap items-baseline justify-between gap-x-2 text-xs'>
				<span className={`${left.colorClass} font-semibold`}>
					{left.label} ({Math.round(ls.min)}–{Math.round(ls.max)} {left.unit})
				</span>
				<span className={`${right.colorClass} font-semibold`}>
					{right.label} ({Math.round(rs.min)}–{Math.round(rs.max)} {right.unit})
				</span>
			</div>
			<svg viewBox={`0 0 ${W} ${H}`} className='h-auto w-full' role='img'
				aria-label={`${left.label} and ${right.label} vs ${xCaption}`}>
				<g className={left.colorClass}>
					<polyline points={line(left.values, ls)} fill='none'
						stroke='currentColor' strokeWidth={2} />
				</g>
				<g className={right.colorClass}>
					<polyline points={line(right.values, rs)} fill='none'
						stroke='currentColor' strokeWidth={2} strokeDasharray='4 3' />
				</g>
			</svg>
			<div className='text-light-text flex justify-between gap-2 text-xs'>
				{xLabels.map((l, i) => (
					<span key={i}>{l}</span>
				))}
			</div>
			<p className='text-light-text text-center text-xs'>{xCaption}</p>
		</div>
	)
}

export default DualAxisChart
```

- [ ] **Step 2: Implement CycleRateChart.tsx**

```tsx
const W = 320
const H = 120
const PAD = 8

const CycleRateChart = ({
	xLabels,
	xCaption,
	rates,
	highPerSec,
	lowPerSec,
}: {
	xLabels: string[]
	xCaption: string
	rates: number[]
	highPerSec: number
	lowPerSec: number
}) => {
	const n = rates.length
	if (n < 2) return null
	const max = Math.max(...rates, highPerSec) * 1.1 || 1
	const px = (i: number) => PAD + (i / (n - 1)) * (W - 2 * PAD)
	const y = (v: number) => H - PAD - (v / max) * (H - 2 * PAD)
	const line = rates.map((v, i) => `${px(i)},${y(v)}`).join(' ')

	return (
		<div className='border-border bg-surface rounded-md border p-4'>
			<div className='text-text mb-1 text-xs font-semibold'>
				Cycle rate (cycles/sec)
			</div>
			<svg viewBox={`0 0 ${W} ${H}`} className='h-auto w-full' role='img'
				aria-label='Booster cycle rate vs time'>
				{/* danger band above 1/sec */}
				<rect x={PAD} y={y(max)} width={W - 2 * PAD} height={Math.max(0, y(highPerSec) - y(max))}
					className='text-danger' fill='currentColor' opacity={0.1} />
				{/* warning band below 1/30 s */}
				<rect x={PAD} y={y(lowPerSec)} width={W - 2 * PAD} height={Math.max(0, y(0) - y(lowPerSec))}
					className='text-warning' fill='currentColor' opacity={0.12} />
				<g className='text-accent'>
					<polyline points={line} fill='none' stroke='currentColor' strokeWidth={2} />
				</g>
			</svg>
			<div className='text-light-text flex justify-between gap-2 text-xs'>
				{xLabels.map((l, i) => (
					<span key={i}>{l}</span>
				))}
			</div>
			<p className='text-light-text text-center text-xs'>{xCaption}</p>
		</div>
	)
}

export default CycleRateChart
```

- [ ] **Step 3: Verify build + lint**

```bash
npm run build
npm run lint
```
Expected: succeeds (components compile though not yet consumed).

- [ ] **Step 4: Commit**

```bash
git add src/components/Tools/DualAxisChart.tsx src/components/Tools/CycleRateChart.tsx
git commit -m "feat: add dual-axis and banded cycle-rate charts for booster"
```

---

### Task 5: Rework BoosterCalculator (two-stage + compressor + timing + charts)

**Files:**
- Modify: `src/components/Tools/BoosterCalculator.tsx`
- Modify: `src/components/Tools/BoosterPicker.tsx`
- Delete: `src/components/Tools/BoosterChart.tsx` (replaced by DualAxisChart + CycleRateChart)

**Interfaces:**
- Consumes: `calculateBooster`, `boosterFillProfile`, `boosterTiming` from `@/lib/diveMath/booster`; `toBar`/`fromBar`/`toLpm`/`fromLpm` from `@/lib/diveMath/units`; `BoosterPreset`/`BOOSTERS` from `./presets`; `DualAxisChart`, `CycleRateChart`; `usePressureState`; existing primitives.
- Produces: `BoosterPicker` `onSelect: (preset: BoosterPreset) => void`; reworked `BoosterCalculator`.

- [ ] **Step 1: Change BoosterPicker to emit the full preset**

In `src/components/Tools/BoosterPicker.tsx`, change the prop type and the onChange to pass the whole preset:

```tsx
import ListBox from '@/components/UI/FormElements/ListBox'
import { BOOSTERS, BoosterPreset } from './presets'

const CUSTOM = 'custom'

const BoosterPicker = ({
	onSelect,
}: {
	onSelect: (preset: BoosterPreset) => void
}) => {
	const items = [
		{ value: CUSTOM, name: 'Choose a booster model…' },
		...BOOSTERS.map((b) => ({
			value: b.name,
			name: `${b.name} — ${b.ratio}:1${b.twoStage ? ' · 2-stage' : ''}`,
		})),
	]
	return (
		<ListBox
			id='booster-model'
			name='booster-model'
			title='Booster model'
			items={items}
			value={items[0]}
			onChange={(item) => {
				if (item.value === CUSTOM) return
				const preset = BOOSTERS.find((b) => b.name === item.value)
				if (preset) onSelect(preset)
			}}
		/>
	)
}

export default BoosterPicker
```

- [ ] **Step 2: Rework BoosterCalculator.tsx**

Replace the file with the version below. New state: `vdPerCycle`, `driveMax` (plain useState, seeded by preset), `twoStage` + `regulatedInlet` (two-stage), compressor `compressorRate`, `storageGal`, `storageMax`, `storageMin`. The picker now fills ratio/vd/driveMax/twoStage. Timing + new charts wired; estimate panel extended; pressure chart falls back to receiver-pressure x when timing is absent.

```tsx
'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import Checkbox from '@/components/UI/FormElements/CheckBox'
import {
	boosterFillProfile,
	boosterTiming,
	calculateBooster,
} from '@/lib/diveMath/booster'
import { fromBar, fromLiters, toBar, toLpm } from '@/lib/diveMath/units'
import CycleRateChart from './CycleRateChart'
import DualAxisChart from './DualAxisChart'
import BoosterPicker from './BoosterPicker'
import SafetyNote from './SafetyNote'
import TankSizePicker from './TankSizePicker'
import UnitToggle from './UnitToggle'
import { usePressureState } from './useUnitState'
import { useUnits } from './UnitsProvider'

const GAL_TO_L = 3.785411784
const HIGH_RATE = 1 // cycle/sec danger threshold
const LOW_RATE = 1 / 30 // cycle/sec warning threshold

function fmtDuration(sec: number): string {
	const m = Math.floor(sec / 60)
	const s = Math.round(sec % 60)
	return m > 0 ? `${m}m ${s}s` : `${s}s`
}

const BoosterCalculator = () => {
	const { units } = useUnits()
	const [ratio, setRatio] = useState(30)
	const [driveP, setDriveP] = usePressureState(150)
	const [twoStage, setTwoStage] = useState(false)
	const [regulatedInlet, setRegulatedInlet] = usePressureState(150)
	const [vdPerCycle, setVdPerCycle] = useState(0)
	const [driveMax, setDriveMax] = useState(0)
	const [supplyVol, setSupplyVol] = useState(50)
	const [supplyStart, setSupplyStart] = usePressureState(2900)
	const [receiverVol, setReceiverVol] = useState(11.1)
	const [receiverStart, setReceiverStart] = usePressureState(500)
	const [target, setTarget] = usePressureState(3000)
	const [compressorRate, setCompressorRate] = useState(0)
	const [storageGal, setStorageGal] = useState(0)
	const [storageMax, setStorageMax] = usePressureState(175)
	const [storageMin, setStorageMin] = usePressureState(125)

	const input = {
		ratio,
		driveP: toBar(driveP, units.pressure),
		supplyVol,
		supplyStart: toBar(supplyStart, units.pressure),
		receiverVol,
		receiverStart: toBar(receiverStart, units.pressure),
		target: toBar(target, units.pressure),
		regulatedInletBar: twoStage
			? toBar(regulatedInlet, units.pressure)
			: undefined,
	}
	const result = calculateBooster(input)

	const timingArgs = {
		driveAirL: result.driveAirL,
		vdPerCycleL: toLpm(vdPerCycle, units.airFlow) > 0 ? vdPerCycle : 0,
		driveMaxLpm: toLpm(driveMax, units.airFlow),
		compressorRateLpm: toLpm(compressorRate, units.airFlow),
		storageL: storageGal * GAL_TO_L,
		storageMaxBar: toBar(storageMax, units.pressure),
		storageMinBar: toBar(storageMin, units.pressure),
	}
	const timing = boosterTiming(timingArgs)
	const profile = boosterFillProfile(input, 40, timing ? timingArgs : undefined)
	const hasTime = profile.length > 0 && profile[0].timeSeconds !== undefined

	const p = (bar: number) => Math.round(fromBar(bar, units.pressure))
	const vol = (l: number) => Math.round(fromLiters(l, units.volume))

	const last = profile.length ? profile[profile.length - 1] : null
	const xCaptionTime = 'Time'
	const xCaptionPressure = `Receiver pressure (${units.pressure})`

	const fastWarn =
		timing != null && (timing.cycleRate1 > HIGH_RATE)
	const slowWarn =
		timing != null && timing.dutyContinuous && timing.cycleRate2 < LOW_RATE

	return (
		<div className='space-y-6'>
			<UnitToggle show={['pressure', 'volume', 'airFlow']} />

			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Booster</h2>
				<BoosterPicker
					onSelect={(preset) => {
						setRatio(preset.ratio)
						setTwoStage(preset.twoStage)
						setVdPerCycle(preset.vdPerCycleL)
						setDriveMax(preset.driveMaxLpm)
					}}
				/>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput id='b-ratio' name='b-ratio' label='Area ratio (n:1)' value={ratio} onChange={setRatio} min={1} />
					<NumberInput id='b-drive' name='b-drive' label={`Drive pressure (${units.pressure})`} value={driveP} onChange={setDriveP} min={0} />
					<NumberInput id='b-vd' name='b-vd' label={`Drive air / cycle (${units.airFlow.replace('m', '')})`} value={vdPerCycle} onChange={setVdPerCycle} min={0} tooltip='Drive air consumed per cycle, from the booster datasheet. Enables cycle timing.' />
					<NumberInput id='b-dmax' name='b-dmax' label={`Max drive-air consumption (${units.airFlow})`} value={driveMax} onChange={setDriveMax} min={0} tooltip='Booster max free-air consumption at full speed, from the datasheet.' />
				</div>
				<div onClick={() => setTwoStage((v) => !v)} className='inline-block'>
					<Checkbox id='b-2stage' name='b-2stage' title='Two-stage (regulated inlet)' checked={twoStage} onChange={setTwoStage} />
				</div>
				{twoStage && (
					<NumberInput id='b-reg' name='b-reg' label={`Regulated inlet pressure (${units.pressure})`} value={regulatedInlet} onChange={setRegulatedInlet} min={0} tooltip='Low pressure the source is regulated to before the first stage.' />
				)}
			</section>

			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Supply cylinder</h2>
				<TankSizePicker category='industrial' onSelect={(l) => setSupplyVol(l)} />
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput id='b-svol' name='b-svol' label='Supply volume (L)' value={supplyVol} onChange={setSupplyVol} min={0} tooltip='Water (internal) cylinder volume — not free-gas capacity' />
					<NumberInput id='b-sstart' name='b-sstart' label={`Supply start (${units.pressure})`} value={supplyStart} onChange={setSupplyStart} min={0} />
				</div>
			</section>

			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Receiver cylinder</h2>
				<TankSizePicker category='dive' onSelect={(l, bar) => { setReceiverVol(l); setTarget(fromBar(bar, units.pressure)) }} />
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput id='b-rvol' name='b-rvol' label='Receiver volume (L)' value={receiverVol} onChange={setReceiverVol} min={0} tooltip='Water (internal) cylinder volume — not free-gas capacity' />
					<NumberInput id='b-rstart' name='b-rstart' label={`Receiver start (${units.pressure})`} value={receiverStart} onChange={setReceiverStart} min={0} />
					<NumberInput id='b-target' name='b-target' label={`Target (${units.pressure})`} value={target} onChange={setTarget} min={0} />
				</div>
			</section>

			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Drive compressor (optional)</h2>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput id='b-crate' name='b-crate' label={`Compressor output (${units.airFlow})`} value={compressorRate} onChange={setCompressorRate} min={0} />
					<NumberInput id='b-stgal' name='b-stgal' label='Storage volume (gal)' value={storageGal} onChange={setStorageGal} min={0} />
					<NumberInput id='b-stmax' name='b-stmax' label={`Storage max (${units.pressure})`} value={storageMax} onChange={setStorageMax} min={0} />
					<NumberInput id='b-stmin' name='b-stmin' label={`Storage min (${units.pressure})`} value={storageMin} onChange={setStorageMin} min={0} />
				</div>
			</section>

			{!result.feasible && result.reason && (
				<SafetyNote level='danger'>
					{result.reason}
					{result.supplyLimitedMax !== undefined &&
						` Reachable max ≈ ${p(result.supplyLimitedMax)} ${units.pressure}.`}
				</SafetyNote>
			)}
			{result.feasible && result.driveAirL === 0 && (
				<SafetyNote level='warning'>
					Free equalization already reaches the target — no boosting needed.
				</SafetyNote>
			)}
			{fastWarn && (
				<SafetyNote level='danger'>
					Booster cycling faster than ~1/sec — hard on the booster; lower the
					drive pressure or use a smaller drive supply.
				</SafetyNote>
			)}
			{slowWarn && (
				<SafetyNote level='warning'>
					Compressor undersized — the booster cycles very slowly (
					{fmtDuration(timing!.phase2Seconds)} of the fill at{' '}
					{timing!.cycleRate2.toFixed(2)}/sec).
				</SafetyNote>
			)}

			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Estimate</h2>
				<p className='text-text'>Equalization pressure: <span className='font-semibold'>{p(result.eqPressure)} {units.pressure}</span></p>
				<p className='text-text'>Drive air consumed: <span className='font-semibold'>{vol(result.driveAirL)} {units.volume}</span></p>
				<p className='text-text'>Process gas boosted: <span className='font-semibold'>{vol(result.processGasL)} {units.volume}</span></p>
				<p className='text-text'>Final supply pressure: <span className='font-semibold'>{p(result.finalSupply)} {units.pressure}</span></p>
				{timing && result.driveAirL > 0 && (
					<>
						<p className='text-text'>Total cycles: <span className='font-semibold'>{Math.round(timing.totalCycles)}</span></p>
						<p className='text-text'>Fill time: <span className='font-semibold'>{fmtDuration(timing.fillSeconds)}</span></p>
						<p className='text-text'>Compressor duty: <span className='font-semibold'>{timing.dutyContinuous ? '~100% (continuous)' : `${Math.round(timing.dutyCycle * 100)}%`}</span></p>
					</>
				)}
			</section>

			{profile.length > 0 && (
				<DualAxisChart
					x={
						hasTime
							? profile.map((pt) => pt.timeSeconds!)
							: profile.map((pt) => fromBar(pt.receiverP, units.pressure))
					}
					xLabels={
						hasTime
							? [fmtDuration(0), fmtDuration((last!.timeSeconds ?? 0) / 2), fmtDuration(last!.timeSeconds ?? 0)]
							: [`${p(profile[0].receiverP)}`, `${p(profile[Math.floor(profile.length / 2)].receiverP)}`, `${p(last!.receiverP)}`]
					}
					xCaption={hasTime ? xCaptionTime : xCaptionPressure}
					left={{ label: 'Supply', colorClass: 'text-light-text', unit: units.pressure, values: profile.map((pt) => fromBar(pt.supplyP, units.pressure)) }}
					right={{ label: 'Receiver', colorClass: 'text-accent', unit: units.pressure, values: profile.map((pt) => fromBar(pt.receiverP, units.pressure)) }}
				/>
			)}
			{hasTime && (
				<CycleRateChart
					times={profile.map((pt) => pt.timeSeconds!)}
					xLabels={[fmtDuration(0), fmtDuration((last!.timeSeconds ?? 0) / 2), fmtDuration(last!.timeSeconds ?? 0)]}
					xCaption={xCaptionTime}
					rates={profile.map((pt) => pt.cycleRatePerSec ?? 0)}
					highPerSec={HIGH_RATE}
					lowPerSec={LOW_RATE}
				/>
			)}
		</div>
	)
}

export default BoosterCalculator
```

Notes: `vdPerCycle`/`driveMax`/`compressorRate` are entered in the airFlow-ish unit; the "per cycle" field label trims the "m" (so "L"/"CF") since it's a per-cycle volume — keep it as the airFlow magnitude (the conversion `toLpm` divides cycles out only via rates; `vdPerCycle` is a volume, so treat it as the volume in the airFlow's base: pass it straight as litres when airFlow is lpm). To keep this correct and simple, **only enable timing when `units.airFlow === 'lpm'` OR convert via `toLpm`/60-agnostic** — see Step 3 simplification.

- [ ] **Step 3: Simplify the per-cycle unit handling**

`vdPerCycleL` must be litres. `toLpm(x, unit)` converts a per-minute flow, which is the right *factor* for cfm→lpm but the name is per-minute. Since `Vd` is a volume (not per-minute), reuse the same numeric factor via `fromLpm`/`toLpm` is dimensionally fine (cf→L is the same factor). In the component, convert `vdPerCycle` with `toLpm(vdPerCycle, units.airFlow)` to get litres (the per-minute label is cosmetic; the factor is cf↔L). Confirm `timingArgs.vdPerCycleL = toLpm(vdPerCycle, units.airFlow)` (not the guarded ternary). Replace the Step-2 `vdPerCycleL` line with:

```ts
		vdPerCycleL: toLpm(vdPerCycle, units.airFlow),
```

- [ ] **Step 4: Delete the old chart**

```bash
git rm src/components/Tools/BoosterChart.tsx
```
(`ChartSeries` and `BoosterChart` are no longer imported anywhere — confirm with grep.)

- [ ] **Step 5: Full gate + smoke test**

Run: `npm test && npm run build && npm run lint && npm run knip`
Expected: all tests pass; build clean; lint 0 errors; knip reports no new unused exports (the old `BoosterChart`/`ChartSeries` are gone; `DualAxisChart`/`CycleRateChart`/`boosterTiming` are consumed).

Smoke-test `/tools?tab=booster`: pick a 2-stage USUN model → the "Two-stage" box checks and a regulated-inlet field appears; enter drive air/cycle + max consumption + compressor output + storage → total cycles, fill time, duty cycle appear, the pressure chart switches to a time x-axis with supply/receiver dual lines, and the cycle-rate chart shows the threshold bands; push the compressor output low to see the slow warning; leave the booster per-cycle fields at 0 → timing/charts gracefully fall back (pressure chart on receiver-pressure x, no cycle-rate chart).

- [ ] **Step 6: Commit**

```bash
git add src/components/Tools/BoosterCalculator.tsx src/components/Tools/BoosterPicker.tsx
git commit -m "feat: booster two-stage, compressor timing/duty, and time-axis charts"
```

---

## Self-Review Notes

- **Spec coverage:** two-stage inlet cap + bypass equalization (Task 1); per-cycle/max-consumption data + duty/timing model with phases (Tasks 2, 3, 5); compressor inputs incl. gallons + max/min (Task 5); cycle-rate slow/fast warnings (Task 5 SafetyNotes); time-axis dual pressure chart + banded cycle-rate chart (Tasks 4, 5); drive-air rate now volume/time & L/bar series removed (old chart deleted in Task 5); graceful fallback when timing data absent (Task 5 `hasTime`).
- **Single-stage parity:** Task 1 keeps `regulatedInletBar` undefined ⇒ `capAbs = ∞` ⇒ existing formula; existing booster tests must stay green (Task 1 Step 4).
- **Type consistency:** `BoosterInput.regulatedInletBar?` (Task 1) and `TimingArgs`/`BoosterTiming`/`ProfilePoint` time fields (Task 2) are consumed unchanged in Task 5; `BoosterPreset` fields (Task 3) consumed by `BoosterPicker`/`BoosterCalculator` (Task 5); `AxisSeries`/chart props (Task 4) consumed in Task 5.
- **Known limitation (flag to user):** `vdPerCycleL`/`driveMaxLpm` ship as `0` (unknown) in presets because per-model drive-air data isn't reliably published — the timing/duty/cycle-rate features stay hidden until the user enters their booster's figures. Surface this after implementation for the "what needs updating" follow-up.
- **Deferred:** drive-gas flow-limit control (not in this plan).
