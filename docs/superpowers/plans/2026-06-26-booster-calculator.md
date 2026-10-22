# Gas-Driven Booster Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Booster (Haskel/SUN gas-driven booster) calculator to `/tools` that estimates drive-gas requirements for boosting a supply gas into a receiver, modelling the depleting supply, and plots the fill profile.

**Architecture:** Pure SI math in `src/lib/diveMath/booster.ts` (TDD-tested) computes a summary and a sampled fill profile (closed-form log integral for drive-gas with a draining supply). A `'use client'` `BoosterCalculator` converts at the unit boundary and renders inputs, results, `SafetyNote`s and a lightweight inline-SVG `BoosterChart`. Registered as a `booster` tab in the Blending group.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, Vitest.

## Global Constraints

- Prettier: single quotes, no semicolons, tabs, 80-char. Run `npm run lint` after each task.
- Theme tokens only (`bg-surface`, `text-text`, `text-light-text`, `bg-accent`, `text-accent`, `text-warning`, `text-danger`, `border-border`, `border-warning`, `border-danger`). No hardcoded colors, no `dark:` variants.
- `'use client'` on interactive components; math modules have NO React/JSX and NO unit-display logic.
- Import alias `@/*` → `src/*`. Reuse `NumberInput`, `ListBox`, `SafetyNote`, `useUnits`, `UnitToggle`, `TankSizePicker`.
- Tests import `{ describe, it, expect }` from `'vitest'`, colocated as `src/lib/diveMath/booster.test.ts`.
- Pressures SI = bar gauge; absolute = gauge + `ATMOSPHERIC_BAR` (1.01325); volumes = litres (water capacity always litres). Drive-air *rate* uses the `airFlow` unit; drive-air *consumed* is a free-gas volume shown in the gas-volume (`volume`) unit.
- Booster ratio presets are Haskel AG-series (model number = nominal ratio); cite the source in a code comment. SUN/other → Custom.

---

### Task 1: Booster math module

**Files:**
- Create: `src/lib/diveMath/booster.ts`
- Test: `src/lib/diveMath/booster.test.ts`

**Interfaces:**
- Consumes: `ATMOSPHERIC_BAR` from `./units`.
- Produces:
  - `interface BoosterInput { ratio: number; driveP: number; supplyVol: number; supplyStart: number; receiverVol: number; receiverStart: number; target: number }` (pressures bar gauge, volumes L)
  - `interface BoosterResult { maxOutput: number; eqPressure: number; processGasL: number; driveAirL: number; finalSupply: number; feasible: boolean; reason?: string; supplyLimitedMax?: number }`
  - `interface ProfilePoint { receiverP: number; cumulativeDriveL: number; supplyP: number; rateLPerBar: number }`
  - `calculateBooster(input: BoosterInput): BoosterResult`
  - `boosterFillProfile(input: BoosterInput, steps?: number): ProfilePoint[]`

- [ ] **Step 1: Write the failing test**

Create `src/lib/diveMath/booster.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { calculateBooster, boosterFillProfile, BoosterInput } from './booster'

const base: BoosterInput = {
	ratio: 30,
	driveP: 10,
	supplyVol: 50,
	supplyStart: 200,
	receiverVol: 12,
	receiverStart: 50,
	target: 200,
}

describe('calculateBooster', () => {
	it('equalizes a high supply into the receiver before boosting', () => {
		const r = calculateBooster(base)
		// P_eq ≈ ((50*201.013)+(12*51.013))/62 − 1.013 ≈ 170.97 bar gauge
		expect(r.eqPressure).toBeCloseTo(170.97, 1)
		expect(r.feasible).toBe(true)
	})
	it('reports drive air via the log-integral (hand-checked ≈ 683 L)', () => {
		const r = calculateBooster(base)
		expect(r.driveAirL).toBeGreaterThan(680)
		expect(r.driveAirL).toBeLessThan(686)
		expect(r.processGasL).toBeCloseTo(348.4, 0)
	})
	it('needs no boost when equalization already reaches target', () => {
		const r = calculateBooster({ ...base, target: 150 })
		expect(r.driveAirL).toBe(0)
		expect(r.feasible).toBe(true)
	})
	it('is infeasible when the target exceeds stall pressure (ratio×drive)', () => {
		const r = calculateBooster({ ...base, target: 350 }) // max = 30×10 = 300
		expect(r.feasible).toBe(false)
		expect(r.reason).toBeTruthy()
		expect(r.maxOutput).toBe(300)
	})
	it('flags a supply-limited fill and reports the reachable max', () => {
		// tiny supply: 2 L from 200 bar can't fill 12 L to 280 bar
		const r = calculateBooster({
			...base,
			supplyVol: 2,
			receiverStart: 0,
			target: 280,
		})
		expect(r.feasible).toBe(false)
		expect(r.supplyLimitedMax).toBeGreaterThan(0)
		expect(r.supplyLimitedMax).toBeLessThan(280)
	})
})

describe('boosterFillProfile', () => {
	it('rises monotonically and ends at the summary drive-air total', () => {
		const profile = boosterFillProfile(base, 40)
		const summary = calculateBooster(base)
		expect(profile.length).toBe(41)
		expect(profile[0].cumulativeDriveL).toBeCloseTo(0, 6)
		for (let i = 1; i < profile.length; i++) {
			expect(profile[i].cumulativeDriveL).toBeGreaterThanOrEqual(
				profile[i - 1].cumulativeDriveL,
			)
		}
		const last = profile[profile.length - 1]
		expect(last.cumulativeDriveL).toBeCloseTo(summary.driveAirL, 2)
		expect(last.receiverP).toBeCloseTo(base.target, 6)
	})
	it('shows supply pressure falling and drive-rate rising as supply depletes', () => {
		const profile = boosterFillProfile(base, 20)
		const first = profile[0]
		const last = profile[profile.length - 1]
		expect(last.supplyP).toBeLessThan(first.supplyP)
		expect(last.rateLPerBar).toBeGreaterThan(first.rateLPerBar)
	})
	it('returns an empty profile when no boost is needed', () => {
		expect(boosterFillProfile({ ...base, target: 150 })).toEqual([])
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/diveMath/booster.test.ts`
Expected: FAIL — `Cannot find module './booster'`.

- [ ] **Step 3: Implement booster.ts**

```ts
import { ATMOSPHERIC_BAR } from './units'

export interface BoosterInput {
	ratio: number
	driveP: number
	supplyVol: number
	supplyStart: number
	receiverVol: number
	receiverStart: number
	target: number
}

export interface BoosterResult {
	maxOutput: number
	eqPressure: number
	processGasL: number
	driveAirL: number
	finalSupply: number
	feasible: boolean
	reason?: string
	supplyLimitedMax?: number
}

export interface ProfilePoint {
	receiverP: number
	cumulativeDriveL: number
	supplyP: number
	rateLPerBar: number
}

const ATM = ATMOSPHERIC_BAR

// Shared setup: the boost phase's starting conditions, after any free
// equalization (which happens only when the supply starts above the receiver).
function boostSetup(input: BoosterInput) {
	const { supplyVol: vs, supplyStart, receiverVol: vr, receiverStart } = input
	const eqAbs =
		(vs * (supplyStart + ATM) + vr * (receiverStart + ATM)) / (vs + vr)
	const eqPressure = eqAbs - ATM
	const equalizes = supplyStart > receiverStart
	const boostStartReceiver = equalizes ? eqPressure : receiverStart
	const inletStartAbs = equalizes ? eqAbs : supplyStart + ATM
	return { eqPressure, boostStartReceiver, inletStartAbs }
}

export function calculateBooster(input: BoosterInput): BoosterResult {
	const { ratio, driveP, supplyVol: vs, receiverVol: vr, target } = input
	const maxOutput = ratio * driveP
	const { eqPressure, boostStartReceiver, inletStartAbs } = boostSetup(input)
	const drivePAbs = driveP + ATM
	const finalSupplyNoBoost = inletStartAbs - ATM

	if (target <= boostStartReceiver + 1e-9) {
		return {
			maxOutput,
			eqPressure,
			processGasL: 0,
			driveAirL: 0,
			finalSupply: finalSupplyNoBoost,
			feasible: true,
		}
	}

	if (target > maxOutput) {
		return {
			maxOutput,
			eqPressure,
			processGasL: 0,
			driveAirL: 0,
			finalSupply: finalSupplyNoBoost,
			feasible: false,
			reason:
				'Target exceeds the booster stall pressure (ratio × drive pressure).',
		}
	}

	const q = vr * (target - boostStartReceiver)
	const availQ = vs * (inletStartAbs - ATM) // gas drawable down to 1 atm
	if (q > availQ + 1e-9) {
		return {
			maxOutput,
			eqPressure,
			processGasL: availQ,
			driveAirL: ratio * drivePAbs * vs * Math.log(inletStartAbs / ATM),
			finalSupply: 0,
			feasible: false,
			reason: 'Supply gas is insufficient to reach the target.',
			supplyLimitedMax: boostStartReceiver + availQ / vr,
		}
	}

	const finalInletAbs = inletStartAbs - q / vs
	const driveAirL = ratio * drivePAbs * vs * Math.log(inletStartAbs / finalInletAbs)
	return {
		maxOutput,
		eqPressure,
		processGasL: q,
		driveAirL,
		finalSupply: finalInletAbs - ATM,
		feasible: true,
	}
}

export function boosterFillProfile(
	input: BoosterInput,
	steps = 40,
): ProfilePoint[] {
	const { ratio, driveP, supplyVol: vs, receiverVol: vr, target } = input
	const { boostStartReceiver, inletStartAbs } = boostSetup(input)
	const drivePAbs = driveP + ATM
	const summary = calculateBooster(input)
	const reached = summary.feasible
		? target
		: (summary.supplyLimitedMax ?? boostStartReceiver)
	if (reached <= boostStartReceiver + 1e-9) return []

	const points: ProfilePoint[] = []
	for (let i = 0; i <= steps; i++) {
		const receiverP =
			boostStartReceiver + ((reached - boostStartReceiver) * i) / steps
		const q = vr * (receiverP - boostStartReceiver)
		const inletAbs = inletStartAbs - q / vs
		const cumulativeDriveL =
			q <= 0 ? 0 : ratio * drivePAbs * vs * Math.log(inletStartAbs / inletAbs)
		points.push({
			receiverP,
			cumulativeDriveL,
			supplyP: inletAbs - ATM,
			rateLPerBar: (ratio * drivePAbs * vr) / inletAbs,
		})
	}
	return points
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/lib/diveMath/booster.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Run full suite + lint**

Run: `npm test && npm run lint`
Expected: all pass; lint 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/diveMath/booster.ts src/lib/diveMath/booster.test.ts
git commit -m "feat: add gas-driven booster math (drive-gas with depleting supply)"
```

---

### Task 2: Booster presets + picker

**Files:**
- Modify: `src/components/Tools/presets.ts`
- Create: `src/components/Tools/BoosterPicker.tsx`
- Test: `src/components/Tools/presets.test.ts` (extend)

**Interfaces:**
- Consumes: `ListBox`.
- Produces:
  - `interface BoosterPreset { name: string; ratio: number }` and `BOOSTERS: BoosterPreset[]` in `presets.ts`.
  - `BoosterPicker({ onSelect }: { onSelect: (ratio: number) => void })` — action-style (applies then reverts to prompt, like `MixPicker`).

- [ ] **Step 1: Add the failing test**

Append to `src/components/Tools/presets.test.ts` (add `BOOSTERS` to the `./presets` import):

```ts
import { BOOSTERS } from './presets'

describe('booster presets', () => {
	it('every booster has a positive ratio and a name', () => {
		for (const b of BOOSTERS) {
			expect(b.ratio).toBeGreaterThan(0)
			expect(b.name.length).toBeGreaterThan(0)
		}
	})
	it('includes a Haskel AG-30 at ratio 30', () => {
		expect(BOOSTERS.some((b) => b.name.includes('AG-30') && b.ratio === 30)).toBe(
			true,
		)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/Tools/presets.test.ts`
Expected: FAIL — `BOOSTERS` not exported.

- [ ] **Step 3: Add BOOSTERS to presets.ts**

Append to `src/components/Tools/presets.ts`:

```ts
export interface BoosterPreset {
	name: string
	ratio: number
}

// Haskel AG single-stage air-driven gas boosters — the model number is the
// nominal pressure (area) ratio. Source: Haskel AG-series product pages
// (haskel.com / fluidprocesscontrol.com). SUN and other brands: use Custom.
export const BOOSTERS: BoosterPreset[] = [
	{ name: 'Haskel AG-30', ratio: 30 },
	{ name: 'Haskel AG-50', ratio: 50 },
	{ name: 'Haskel AG-62', ratio: 62 },
	{ name: 'Haskel AG-75', ratio: 75 },
	{ name: 'Haskel AG-102', ratio: 102 },
	{ name: 'Haskel AG-152', ratio: 152 },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/Tools/presets.test.ts`
Expected: PASS.

- [ ] **Step 5: Create BoosterPicker.tsx**

```tsx
'use client'

import ListBox from '@/components/UI/FormElements/ListBox'
import { BOOSTERS } from './presets'

const CUSTOM = 'custom'

const BoosterPicker = ({ onSelect }: { onSelect: (ratio: number) => void }) => {
	const items = [
		{ value: CUSTOM, name: 'Choose a booster model…' },
		...BOOSTERS.map((b) => ({
			value: b.name,
			name: `${b.name} — ${b.ratio}:1`,
		})),
	]

	// Action-style: applies the model's ratio then reverts to the prompt.
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
				if (preset) onSelect(preset.ratio)
			}}
		/>
	)
}

export default BoosterPicker
```

- [ ] **Step 6: Lint + commit**

```bash
npm run lint
git add src/components/Tools/presets.ts src/components/Tools/presets.test.ts src/components/Tools/BoosterPicker.tsx
git commit -m "feat: add booster ratio presets and picker"
```

---

### Task 3: Booster fill-profile chart (SVG)

**Files:**
- Create: `src/components/Tools/BoosterChart.tsx`

**Interfaces:**
- Consumes: nothing (presentational; unit conversion done by the caller).
- Produces:
  - `interface ChartSeries { label: string; colorClass: string; values: number[]; rangeLabel: string }`
  - `BoosterChart({ xLabels, series }: { xLabels: string[]; series: ChartSeries[] })` — renders a normalized multi-line inline SVG with a legend. `colorClass` is a Tailwind text-color class (stroke uses `currentColor`).

No unit test (presentational SVG). Verified by build.

- [ ] **Step 1: Implement BoosterChart.tsx**

```tsx
export interface ChartSeries {
	label: string
	colorClass: string
	values: number[]
	rangeLabel: string
}

const W = 320
const H = 140
const PAD = 8

function normalize(values: number[]): number[] {
	const min = Math.min(...values)
	const max = Math.max(...values)
	const span = max - min || 1
	return values.map((v) => (v - min) / span)
}

const BoosterChart = ({
	xLabels,
	series,
}: {
	xLabels: string[]
	series: ChartSeries[]
}) => {
	const n = series[0]?.values.length ?? 0
	if (n < 2) return null
	const x = (i: number) => PAD + (i / (n - 1)) * (W - 2 * PAD)
	const y = (norm: number) => H - PAD - norm * (H - 2 * PAD)

	return (
		<div className='border-border bg-surface rounded-md border p-4'>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				className='h-auto w-full'
				role='img'
				aria-label='Booster fill profile'
			>
				{series.map((s) => {
					const norm = normalize(s.values)
					const pts = norm.map((v, i) => `${x(i)},${y(v)}`).join(' ')
					return (
						<g key={s.label} className={s.colorClass}>
							<polyline
								points={pts}
								fill='none'
								stroke='currentColor'
								strokeWidth={2}
							/>
						</g>
					)
				})}
			</svg>
			<div className='text-light-text mt-1 flex justify-between text-xs'>
				{xLabels.map((l, i) => (
					<span key={i}>{l}</span>
				))}
			</div>
			<dl className='mt-3 space-y-1'>
				{series.map((s) => (
					<div key={s.label} className='flex items-center gap-2 text-xs'>
						<span className={`${s.colorClass} text-base leading-none`}>—</span>
						<span className='text-text'>{s.label}</span>
						<span className='text-light-text'>{s.rangeLabel}</span>
					</div>
				))}
			</dl>
		</div>
	)
}

export default BoosterChart
```

- [ ] **Step 2: Verify build + lint**

```bash
npm run build
npm run lint
```
Expected: build succeeds; lint clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/Tools/BoosterChart.tsx
git commit -m "feat: add booster fill-profile SVG chart"
```

---

### Task 4: Booster calculator component + register tab

**Files:**
- Create: `src/components/Tools/BoosterCalculator.tsx`
- Modify: `src/components/Tools/toolsRegistry.ts`

**Interfaces:**
- Consumes: `calculateBooster`, `boosterFillProfile` from `@/lib/diveMath/booster`; `toBar`, `fromBar`, `fromLiters`, `toLpm` from `@/lib/diveMath/units`; `useUnits`, `UnitToggle`, `NumberInput`, `SafetyNote`, `TankSizePicker`, `BoosterPicker`, `BoosterChart` (+ `ChartSeries`).
- Produces: `BoosterCalculator` (default export); registry entry `{ id: 'booster', name: 'Booster', group: 'blending', Component: BoosterCalculator }` and `| 'booster'` in `TabId`.

- [ ] **Step 1: Implement BoosterCalculator.tsx**

```tsx
'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import { boosterFillProfile, calculateBooster } from '@/lib/diveMath/booster'
import { fromBar, fromLiters, toBar, toLpm } from '@/lib/diveMath/units'
import BoosterChart, { ChartSeries } from './BoosterChart'
import BoosterPicker from './BoosterPicker'
import SafetyNote from './SafetyNote'
import TankSizePicker from './TankSizePicker'
import UnitToggle from './UnitToggle'
import { usePressureState } from './useUnitState'
import { useUnits } from './UnitsProvider'

const BoosterCalculator = () => {
	const { units } = useUnits()
	const [ratio, setRatio] = useState(30)
	const [driveP, setDriveP] = usePressureState(150)
	const [supplyVol, setSupplyVol] = useState(50)
	const [supplyStart, setSupplyStart] = usePressureState(2900)
	const [receiverVol, setReceiverVol] = useState(11.1)
	const [receiverStart, setReceiverStart] = usePressureState(500)
	const [target, setTarget] = usePressureState(3000)
	const [driveRate, setDriveRate] = useState(0)

	const input = {
		ratio,
		driveP: toBar(driveP, units.pressure),
		supplyVol,
		supplyStart: toBar(supplyStart, units.pressure),
		receiverVol,
		receiverStart: toBar(receiverStart, units.pressure),
		target: toBar(target, units.pressure),
	}
	const result = calculateBooster(input)
	const profile = boosterFillProfile(input, 40)

	const p = (bar: number) => Math.round(fromBar(bar, units.pressure))
	const vol = (l: number) => Math.round(fromLiters(l, units.volume))
	const driveRateLpm = toLpm(driveRate, units.airFlow)
	const fillMinutes =
		driveRate > 0 && result.driveAirL > 0
			? result.driveAirL / driveRateLpm
			: null

	const chartSeries: ChartSeries[] = profile.length
		? [
				{
					label: 'Cumulative drive air',
					colorClass: 'text-accent',
					values: profile.map((pt) => fromLiters(pt.cumulativeDriveL, units.volume)),
					rangeLabel: `${vol(profile[0].cumulativeDriveL)}→${vol(profile[profile.length - 1].cumulativeDriveL)} ${units.volume}`,
				},
				{
					label: 'Supply pressure',
					colorClass: 'text-light-text',
					values: profile.map((pt) => fromBar(pt.supplyP, units.pressure)),
					rangeLabel: `${p(profile[0].supplyP)}→${p(profile[profile.length - 1].supplyP)} ${units.pressure}`,
				},
				{
					label: 'Drive-air rate',
					colorClass: 'text-warning',
					values: profile.map((pt) => pt.rateLPerBar),
					rangeLabel: `${Math.round(profile[0].rateLPerBar)}→${Math.round(profile[profile.length - 1].rateLPerBar)} L/bar`,
				},
			]
		: []
	const xLabels = profile.length
		? [
				`${p(profile[0].receiverP)} ${units.pressure}`,
				`${p(profile[Math.floor(profile.length / 2)].receiverP)}`,
				`${p(profile[profile.length - 1].receiverP)} ${units.pressure}`,
			]
		: []

	return (
		<div className='space-y-6'>
			<UnitToggle show={['pressure', 'volume', 'airFlow']} />

			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Booster</h2>
				<BoosterPicker onSelect={setRatio} />
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput id='b-ratio' name='b-ratio' label='Area ratio (n:1)' value={ratio} onChange={setRatio} min={1} />
					<NumberInput id='b-drive' name='b-drive' label={`Drive pressure (${units.pressure})`} value={driveP} onChange={setDriveP} min={0} />
				</div>
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
					<NumberInput id='b-driverate' name='b-driverate' label={`Drive-air supply rate (${units.airFlow}, optional)`} value={driveRate} onChange={setDriveRate} min={0} />
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

			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Estimate</h2>
				<p className='text-text'>
					Max output pressure:{' '}
					<span className='font-semibold'>{p(result.maxOutput)} {units.pressure}</span>
				</p>
				<p className='text-text'>
					Equalization pressure:{' '}
					<span className='font-semibold'>{p(result.eqPressure)} {units.pressure}</span>
				</p>
				<p className='text-text'>
					Drive air consumed:{' '}
					<span className='font-semibold'>{vol(result.driveAirL)} {units.volume}</span>
				</p>
				<p className='text-text'>
					Final supply pressure:{' '}
					<span className='font-semibold'>{p(result.finalSupply)} {units.pressure}</span>
				</p>
				{fillMinutes !== null && (
					<p className='text-text'>
						Est. fill time at {driveRate} {units.airFlow}:{' '}
						<span className='font-semibold'>{Math.round(fillMinutes)} min</span>
					</p>
				)}
			</section>

			{chartSeries.length > 0 && (
				<BoosterChart xLabels={xLabels} series={chartSeries} />
			)}
		</div>
	)
}

export default BoosterCalculator
```

Notes: supply/receiver **water volume** are plain `useState` in litres (consistent with the rest of the tools — water capacity always litres); `TankSizePicker` `onSelect` sets litres directly. `ratio` and `driveRate` are unitless/flow and stay plain `useState`. Drive pressure / start / target use `usePressureState` so they convert on the pressure toggle.

- [ ] **Step 2: Register the tab**

In `src/components/Tools/toolsRegistry.ts`: add the import, extend `TabId`, and add the `TOOLS` entry (blending group):

```ts
import BoosterCalculator from './BoosterCalculator'
```

Add `| 'booster'` to the `TabId` union, and add to `TOOLS`:

```ts
	{ id: 'booster', name: 'Booster', group: 'blending', Component: BoosterCalculator },
```

- [ ] **Step 3: Verify build + smoke test**

Run: `npm run build`
Expected: build succeeds; `/tools` route present.

Run `npm run dev`, open `/tools?tab=booster`: pick a Haskel model (sets ratio), enter a supply + receiver, confirm drive-air consumed and the three-line chart render; set target above stall to see the danger note; provide a drive-air rate to see the fill-time estimate; toggle psi↔bar and confirm pressures convert while volumes stay in litres.

- [ ] **Step 4: Full gate + commit**

Run: `npm test && npm run build && npm run lint && npm run knip`
Expected: all tests pass; build clean; lint 0 errors; knip no new unused exports.

```bash
git add src/components/Tools/BoosterCalculator.tsx src/components/Tools/toolsRegistry.ts
git commit -m "feat: add booster calculator UI and register the tab"
```

---

## Self-Review Notes

- **Spec coverage:** depletion model + log integral (Task 1 `calculateBooster`); free equalization, stall and supply-limited feasibility (Task 1); fill-profile sampling for the chart with last-point = total invariant (Task 1 `boosterFillProfile`); sourced Haskel ratio presets + picker (Task 2); 3-line normalized SVG chart with range legend (Task 3); component inputs/outputs, optional drive-air-rate → fill time, SafetyNotes, unit handling (pressure/airFlow/gas-volume toggle, water-volume litres), tab registration (Task 4).
- **Type consistency:** `BoosterInput`/`BoosterResult`/`ProfilePoint` defined in Task 1 are consumed unchanged in Task 4; `ChartSeries` defined in Task 3 consumed in Task 4; `BOOSTERS`/`BoosterPreset` (Task 2) consumed by `BoosterPicker` (Task 2) and the picker by Task 4.
- **knip:** `calculateBooster`, `boosterFillProfile`, `BOOSTERS`, `BoosterChart`, `BoosterPicker` are all consumed by the component/picker (Task 4/2) — verified in Task 4 Step 4.
- **Drive-air rate units:** the optional rate input is in the `airFlow` unit; `toLpm` converts it to L/min before dividing the drive-air litres for the time estimate.
