# Dive Tools Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared settings modal, an info/about page, temperature (hot-fill) handling, a configurable blend top-up gas with reorderable adds, and an SVG cylinder visualization for cascades — to the public Dive Tools section.

**Architecture:** Pure dive math stays SI in `src/lib/diveMath/` (TDD, Vitest); React components convert at the unit boundary. Global prefs (units, real-gas, temperature) live in the existing `UnitsProvider` context (persisted to localStorage) and are edited through one modal. Spec: `docs/superpowers/specs/2026-06-26-tools-enhancements-design.md`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 (theme tokens), Headless UI (`Dialog` for the modal, `ListBox` for pickers), Vitest.

## Global Constraints

- Prettier: single quotes, no semicolons, TABS for indentation, 80-char width. Run `npm run lint` after each task.
- Vitest tests import `{ describe, it, expect }` from `'vitest'`. Vitest has **no `@/` alias** — files imported (transitively) by a `*.test.ts` must use **relative** imports to other `src` modules (e.g. `'../../lib/diveMath/x'`), not `@/`.
- Theme tokens only (no hardcoded colors): `bg-surface`, `bg-background`, `bg-hover`, `text-text`, `text-light-text`, `text-accent`, `text-white-text`, `border-border`, `text-danger`, `text-warning`. SVG uses `fill-current`/`stroke='currentColor'` with a theme color class.
- Reuse existing primitives: `NumberInput`, `Checkbox` (`onChange(checked: boolean)`), `ListBox`, `MixPicker`, `Tooltip`. Do not add raw HTML inputs.
- `ATMOSPHERIC_BAR = 1.01325` and helpers (`toBar`/`fromBar`/`fromLiters`/`toLpm`/`fromLpm`) live in `src/lib/diveMath/units.ts`.
- The whole tools section is wrapped in `UnitsProvider`; `useUnits()` returns `{ units, setUnit, useRealGas, setUseRealGas }` today.
- Full gate at the end: `npm test && npm run build && npm run lint && npm run knip`.

---

### Task 1: Temperature conversions + global temperature settings

**Files:**
- Modify: `src/lib/diveMath/units.ts`
- Modify: `src/lib/diveMath/units.test.ts`
- Modify: `src/components/Tools/UnitsProvider.tsx`

**Interfaces:**
- Produces: `TempUnit = 'C' | 'F'`; `toCelsius(value, unit)`, `fromCelsius(c, unit)` in `units.ts`. `UnitPrefs` gains `temp: TempUnit`. `useUnits()` gains `tempMode: 'off' | 'simple' | 'detailed'`, `setTempMode`, `overfillPct: number`, `setOverfillPct`, `fillTempC: number`, `setFillTempC`, `settledTempC: number`, `setSettledTempC` (fill/settled stored in °C canonically).

- [ ] **Step 1: Write failing tests for temperature conversions**

Append to `src/lib/diveMath/units.test.ts`:

```ts
import { toCelsius, fromCelsius } from './units'

describe('temperature conversions', () => {
	it('converts F to C and back', () => {
		expect(toCelsius(32, 'F')).toBeCloseTo(0, 6)
		expect(toCelsius(212, 'F')).toBeCloseTo(100, 6)
		expect(fromCelsius(0, 'F')).toBeCloseTo(32, 6)
	})
	it('is identity for celsius', () => {
		expect(toCelsius(20, 'C')).toBe(20)
		expect(fromCelsius(20, 'C')).toBe(20)
	})
})
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run src/lib/diveMath/units.test.ts`
Expected: FAIL (`toCelsius` is not exported).

- [ ] **Step 3: Add conversions to `units.ts`**

Append to `src/lib/diveMath/units.ts`:

```ts
export type TempUnit = 'C' | 'F'

export function toCelsius(value: number, unit: TempUnit): number {
	return unit === 'F' ? ((value - 32) * 5) / 9 : value
}

export function fromCelsius(c: number, unit: TempUnit): number {
	return unit === 'F' ? (c * 9) / 5 + 32 : c
}
```

- [ ] **Step 4: Run tests, expect pass**

Run: `npx vitest run src/lib/diveMath/units.test.ts`
Expected: PASS.

- [ ] **Step 5: Extend `UnitsProvider.tsx` with temperature settings**

In `src/components/Tools/UnitsProvider.tsx`:

1. Import the type: add `TempUnit` to the existing `import { ... } from '@/lib/diveMath/units'`.
2. Add `temp: TempUnit` to the `UnitPrefs` interface, and `temp: 'F'` to `DEFAULT_UNITS`.
3. Add a storage key + defaults after `REALGAS_KEY`:

```ts
const TEMP_KEY = 'fillstation.tools.temp'
type TempMode = 'off' | 'simple' | 'detailed'
const DEFAULT_TEMP = {
	mode: 'off' as TempMode,
	overfillPct: 10,
	fillTempC: 27, // ~80 °F fill
	settledTempC: 21, // ~70 °F ambient
}
```

4. Extend `UnitsContextValue` with:

```ts
	tempMode: TempMode
	setTempMode: (m: TempMode) => void
	overfillPct: number
	setOverfillPct: (v: number) => void
	fillTempC: number
	setFillTempC: (v: number) => void
	settledTempC: number
	setSettledTempC: (v: number) => void
```

5. In the provider body add state + persistence (mirror the `useRealGas` pattern). Store the temp block as one JSON object:

```ts
	const [temp, setTemp] = useState(DEFAULT_TEMP)
```

In the existing `useEffect`, after the real-gas read, add:

```ts
			const t = localStorage.getItem(TEMP_KEY)
			// eslint-disable-next-line react-hooks/set-state-in-effect
			if (t) setTemp({ ...DEFAULT_TEMP, ...JSON.parse(t) })
```

Add one setter that merges + persists, then derive the individual setters:

```ts
	const updateTemp = (patch: Partial<typeof DEFAULT_TEMP>) => {
		setTemp((prev) => {
			const next = { ...prev, ...patch }
			try {
				localStorage.setItem(TEMP_KEY, JSON.stringify(next))
			} catch {
				// ignore storage failures
			}
			return next
		})
	}
```

6. Add to the provider `value`:

```ts
				tempMode: temp.mode,
				setTempMode: (m) => updateTemp({ mode: m }),
				overfillPct: temp.overfillPct,
				setOverfillPct: (v) => updateTemp({ overfillPct: v }),
				fillTempC: temp.fillTempC,
				setFillTempC: (v) => updateTemp({ fillTempC: v }),
				settledTempC: temp.settledTempC,
				setSettledTempC: (v) => updateTemp({ settledTempC: v }),
```

- [ ] **Step 6: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: succeeds, 0 lint errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/diveMath/units.ts src/lib/diveMath/units.test.ts src/components/Tools/UnitsProvider.tsx
git commit -m "feat: temperature conversions and global temperature settings"
```

---

### Task 2: `temperature.ts` pure math

**Files:**
- Create: `src/lib/diveMath/temperature.ts`
- Create: `src/lib/diveMath/temperature.test.ts`

**Interfaces:**
- Produces: `settledPressureBar(hotGaugeBar, fillTempC, settledTempC)`, `hotTargetBar(coldGoalGaugeBar, fillTempC, settledTempC)`, `applyOverfill(coldGaugeBar, pct)`, `removeOverfill(hotGaugeBar, pct)` — all `(…): number`, pressures bar gauge.

- [ ] **Step 1: Write failing tests**

Create `src/lib/diveMath/temperature.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
	settledPressureBar,
	hotTargetBar,
	applyOverfill,
	removeOverfill,
} from './temperature'

describe('temperature (hot fill cools)', () => {
	it('a hot fill settles to a lower pressure when it cools', () => {
		const cold = settledPressureBar(200, 40, 20)
		expect(cold).toBeLessThan(200)
		// Gay-Lussac on absolute: (200+1.013)*(293.15/313.15)-1.013
		expect(cold).toBeCloseTo((201.013 * 293.15) / 313.15 - 1.01325, 2)
	})
	it('hotTarget is the inverse of settledPressure', () => {
		const hot = hotTargetBar(200, 40, 20)
		expect(settledPressureBar(hot, 40, 20)).toBeCloseTo(200, 4)
	})
	it('no change when fill and settled temps are equal', () => {
		expect(settledPressureBar(200, 25, 25)).toBeCloseTo(200, 6)
	})
	it('overfill round-trips', () => {
		expect(removeOverfill(applyOverfill(200, 10), 10)).toBeCloseTo(200, 6)
		expect(applyOverfill(200, 10)).toBeCloseTo(220, 6)
	})
})
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run src/lib/diveMath/temperature.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `temperature.ts`**

```ts
import { ATMOSPHERIC_BAR } from './units'

const ATM = ATMOSPHERIC_BAR
const K = 273.15

// Pressure a hot fill settles to once it cools (Gay-Lussac at fixed volume):
// P_cold_abs = P_hot_abs * T_cold / T_hot. Returns gauge bar.
export function settledPressureBar(
	hotGaugeBar: number,
	fillTempC: number,
	settledTempC: number,
): number {
	const tHot = fillTempC + K
	const tCold = settledTempC + K
	if (tHot <= 0) return hotGaugeBar
	return ((hotGaugeBar + ATM) * tCold) / tHot - ATM
}

// Hot fill pressure needed to settle at a cold goal (inverse of the above).
export function hotTargetBar(
	coldGoalGaugeBar: number,
	fillTempC: number,
	settledTempC: number,
): number {
	const tHot = fillTempC + K
	const tCold = settledTempC + K
	if (tCold <= 0) return coldGoalGaugeBar
	return ((coldGoalGaugeBar + ATM) * tHot) / tCold - ATM
}

// Simple mode: a flat overfill fraction on the gauge pressure.
export function applyOverfill(coldGaugeBar: number, pct: number): number {
	return coldGaugeBar * (1 + pct / 100)
}

export function removeOverfill(hotGaugeBar: number, pct: number): number {
	return hotGaugeBar / (1 + pct / 100)
}
```

- [ ] **Step 4: Run tests, expect pass**

Run: `npx vitest run src/lib/diveMath/temperature.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/diveMath/temperature.ts src/lib/diveMath/temperature.test.ts
git commit -m "feat: add temperature (hot-fill cooling) math"
```

---

### Task 3: `TemperatureControl` component

**Files:**
- Create: `src/components/Tools/TemperatureControl.tsx`

**Interfaces:**
- Consumes: `useUnits()` (tempMode/overfillPct/fillTempC/settledTempC + setters, `units.temp`); `toCelsius`/`fromCelsius`; `NumberInput`.
- Produces: default-exported `TemperatureControl` (no props) for the settings modal.

- [ ] **Step 1: Implement the component**

```tsx
'use client'

import NumberInput from '@/components/UI/FormElements/NumberInput'
import { fromCelsius, toCelsius } from '@/lib/diveMath/units'
import { useUnits } from './UnitsProvider'

const MODES: { value: 'off' | 'simple' | 'detailed'; label: string }[] = [
	{ value: 'off', label: 'Off' },
	{ value: 'simple', label: 'Overfill %' },
	{ value: 'detailed', label: 'Temperatures' },
]

const TemperatureControl = () => {
	const {
		units,
		tempMode,
		setTempMode,
		overfillPct,
		setOverfillPct,
		fillTempC,
		setFillTempC,
		settledTempC,
		setSettledTempC,
	} = useUnits()

	const fillDisplay = Math.round(fromCelsius(fillTempC, units.temp))
	const settledDisplay = Math.round(fromCelsius(settledTempC, units.temp))

	return (
		<div className='space-y-3'>
			<div className='flex items-center gap-2'>
				<span className='text-light-text text-xs font-medium'>
					Hot-fill / cooling
				</span>
				<div className='border-border inline-flex overflow-hidden rounded-md border'>
					{MODES.map((m) => (
						<button
							key={m.value}
							type='button'
							onClick={() => setTempMode(m.value)}
							className={
								tempMode === m.value
									? 'bg-accent text-white-text px-3 py-1 text-sm font-medium'
									: 'text-text hover:bg-hover px-3 py-1 text-sm'
							}
						>
							{m.label}
						</button>
					))}
				</div>
			</div>
			{tempMode === 'simple' && (
				<NumberInput
					id='temp-overfill'
					name='temp-overfill'
					label='Hot-fill overfill (%)'
					value={overfillPct}
					onChange={setOverfillPct}
					min={0}
					tooltip='Fill this much over the target hot, so it settles at the target once it cools.'
				/>
			)}
			{tempMode === 'detailed' && (
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='temp-fill'
						name='temp-fill'
						label={`Fill (hot) temp (°${units.temp})`}
						value={fillDisplay}
						onChange={(v) => setFillTempC(toCelsius(v, units.temp))}
						tooltip='Cylinder temperature right after filling.'
					/>
					<NumberInput
						id='temp-settled'
						name='temp-settled'
						label={`Settled temp (°${units.temp})`}
						value={settledDisplay}
						onChange={(v) => setSettledTempC(toCelsius(v, units.temp))}
						tooltip='Ambient temperature the cylinder cools to.'
					/>
				</div>
			)}
		</div>
	)
}

export default TemperatureControl
```

- [ ] **Step 2: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Tools/TemperatureControl.tsx
git commit -m "feat: add temperature control for the settings modal"
```

---

### Task 4: Settings modal + nav button; remove inline toggles

**Files:**
- Create: `src/components/Tools/SettingsModal.tsx`
- Modify: `src/components/Tools/ToolsTabs.tsx`
- Modify: `src/components/Tools/UnitToggle.tsx` (add `temp` unit option)
- Modify: `src/components/Tools/BoosterCalculator.tsx`, `CascadeCalculator.tsx`, `BlendCalculator.tsx`, `NitroxStickCalculator.tsx`, `BestMixCalculator.tsx`, `ModEndCalculator.tsx`, `EadCalculator.tsx`, `GasDensityCalculator.tsx`, `GasMixingCalculator.tsx`, `GasRequirementsCalculator.tsx`, `OxygenExposureCalculator.tsx`, `BlendingCostCalculator.tsx` (remove inline `<UnitToggle .../>` and `<RealGasToggle />`)

**Interfaces:**
- Consumes: `UnitToggle`, `RealGasToggle`, `TemperatureControl`, Headless UI `Dialog`.
- Produces: `SettingsModal({ open, onClose })`; a settings button in `ToolsTabs`.

- [ ] **Step 1: Add the `temp` unit to `UnitToggle.tsx`**

In `src/components/Tools/UnitToggle.tsx`, add a `temp` entry to the `OPTIONS` record:

```tsx
	temp: {
		label: 'Temperature',
		values: [
			{ value: 'C', label: '°C' },
			{ value: 'F', label: '°F' },
		],
	},
```

- [ ] **Step 2: Implement `SettingsModal.tsx`**

```tsx
'use client'

import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from '@headlessui/react'
import { Fragment } from 'react'
import RealGasToggle from './RealGasToggle'
import TemperatureControl from './TemperatureControl'
import UnitToggle from './UnitToggle'

const SettingsModal = ({
	open,
	onClose,
}: {
	open: boolean
	onClose: () => void
}) => {
	return (
		<Transition show={open} as={Fragment}>
			<Dialog onClose={onClose} className='relative z-50'>
				<TransitionChild
					as={Fragment}
					enter='ease-out duration-200'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='ease-in duration-150'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'
				>
					<div className='fixed inset-0 bg-black/40' aria-hidden='true' />
				</TransitionChild>
				<div className='fixed inset-0 flex items-center justify-center p-4'>
					<TransitionChild
						as={Fragment}
						enter='ease-out duration-200'
						enterFrom='opacity-0 scale-95'
						enterTo='opacity-100 scale-100'
						leave='ease-in duration-150'
						leaveFrom='opacity-100 scale-100'
						leaveTo='opacity-0 scale-95'
					>
						<DialogPanel className='bg-background border-border w-full max-w-md space-y-5 rounded-lg border p-6 shadow-xl'>
							<DialogTitle className='text-text text-lg font-semibold'>
								Settings
							</DialogTitle>
							<div className='space-y-2'>
								<h3 className='text-light-text text-xs font-medium'>Units</h3>
								<UnitToggle
									show={['pressure', 'depth', 'volume', 'airFlow', 'temp']}
								/>
							</div>
							<div className='space-y-2'>
								<h3 className='text-light-text text-xs font-medium'>Gas model</h3>
								<RealGasToggle />
							</div>
							<TemperatureControl />
							<div className='flex justify-end'>
								<button
									type='button'
									onClick={onClose}
									className='bg-accent text-white-text rounded-md px-4 py-2 text-sm font-medium'
								>
									Done
								</button>
							</div>
						</DialogPanel>
					</TransitionChild>
				</div>
			</Dialog>
		</Transition>
	)
}

export default SettingsModal
```

- [ ] **Step 3: Add the settings button to `ToolsTabs.tsx`**

Make `ToolsTabs` `'use client'` already (it is). Add `useState` + the modal. Change the top row so the group selector and a Settings button share a flex row:

```tsx
import { useState } from 'react'
import SettingsModal from './SettingsModal'
```

Wrap the existing group-selector `<div className='border-border inline-flex …'>` in a flex container with the button:

```tsx
			<div className='flex items-center justify-between gap-2'>
				<div className='border-border inline-flex overflow-hidden rounded-md border'>
					{/* existing GROUPS.map(...) buttons unchanged */}
				</div>
				<button
					type='button'
					onClick={() => setSettingsOpen(true)}
					className='border-border text-text hover:bg-hover rounded-md border px-3 py-1.5 text-sm font-medium'
				>
					⚙ Settings
				</button>
			</div>
```

Add `const [settingsOpen, setSettingsOpen] = useState(false)` at the top of the component and render `<SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />` inside the returned root element.

- [ ] **Step 4: Remove inline toggles from every tool**

In each calculator listed in **Files**, delete the inline `<UnitToggle show={[...]} />` line and any `<RealGasToggle />` line, and remove the now-unused imports (`UnitToggle`, `RealGasToggle`). Leave each tool's `useUnits()` usage. (Tools that wrapped layout for a sidebar keep their wrappers.) Grep to confirm none remain:

Run: `grep -rn "UnitToggle\|RealGasToggle" src/components/Tools` 
Expected: only `UnitToggle.tsx`, `RealGasToggle.tsx`, and `SettingsModal.tsx` reference them.

- [ ] **Step 5: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: succeeds, 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/Tools
git commit -m "feat: shared settings modal in the tools nav; drop per-tool toggles"
```

---

### Task 5: Temperature integration in the gas-fill tools

**Files:**
- Create: `src/components/Tools/TemperatureResult.tsx`
- Modify: `src/components/Tools/CascadeCalculator.tsx`, `BlendCalculator.tsx`, `BoosterCalculator.tsx`

**Interfaces:**
- Consumes: `useUnits()` (tempMode/overfillPct/fillTempC/settledTempC); `settledPressureBar`/`hotTargetBar`/`applyOverfill`/`removeOverfill`; `toBar`/`fromBar`.
- Produces: `TemperatureResult({ goalBar })` — given a target/final pressure (bar gauge), renders the settled-cold and hot-target lines (nothing when `tempMode === 'off'`).

- [ ] **Step 1: Implement `TemperatureResult.tsx`**

```tsx
'use client'

import { fromBar } from '@/lib/diveMath/units'
import {
	applyOverfill,
	hotTargetBar,
	removeOverfill,
	settledPressureBar,
} from '@/lib/diveMath/temperature'
import { useUnits } from './UnitsProvider'

// Given a fill/target pressure (bar gauge), show what it settles to once cool
// and the hot pressure needed to settle at it. Hidden when temperature is off.
const TemperatureResult = ({ goalBar }: { goalBar: number }) => {
	const { units, tempMode, overfillPct, fillTempC, settledTempC } = useUnits()
	if (tempMode === 'off' || goalBar <= 0) return null

	const p = (bar: number) => Math.round(fromBar(bar, units.pressure))
	const settled =
		tempMode === 'simple'
			? removeOverfill(goalBar, overfillPct)
			: settledPressureBar(goalBar, fillTempC, settledTempC)
	const hot =
		tempMode === 'simple'
			? applyOverfill(goalBar, overfillPct)
			: hotTargetBar(goalBar, fillTempC, settledTempC)

	return (
		<div className='text-text space-y-1'>
			<p>
				Settles to (cold):{' '}
				<span className='font-semibold'>
					{p(settled)} {units.pressure}
				</span>{' '}
				<span className='text-light-text'>after cooling</span>
			</p>
			<p>
				Fill hot to:{' '}
				<span className='font-semibold'>
					{p(hot)} {units.pressure}
				</span>{' '}
				<span className='text-light-text'>to settle at the target</span>
			</p>
		</div>
	)
}

export default TemperatureResult
```

- [ ] **Step 2: Wire into the three tools**

- **CascadeCalculator:** in the Result section, after the final-pressure line, add `<TemperatureResult goalBar={result.finalPressure} />` (import it). `result.finalPressure` is bar gauge.
- **BlendCalculator:** after the steps list, add `<TemperatureResult goalBar={toBar(finalPressure, units.pressure)} />` (it already imports `toBar`).
- **BoosterCalculator:** in the Estimate section, after the fill-time block, add `<TemperatureResult goalBar={targetBar} />` (`targetBar` already exists in scope).

- [ ] **Step 3: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: succeeds. Manually: with the settings modal temperature = detailed, the three tools show the cold/hot lines.

- [ ] **Step 4: Commit**

```bash
git add src/components/Tools
git commit -m "feat: show settled-cold and hot-fill target in gas-fill tools"
```

---

### Task 6: Info / About page

**Files:**
- Modify: `src/components/Tools/toolsRegistry.ts` (add `description`)
- Create: `src/app/tools/about/page.tsx`
- Modify: `src/components/Tools/ToolsPage.tsx` (link to about)

**Interfaces:**
- Consumes: `TOOLS`, `GROUPS` from `toolsRegistry`.
- Produces: `ToolDef.description: string`; the `/tools/about` route.

- [ ] **Step 1: Add `description` to every `ToolDef`**

In `src/components/Tools/toolsRegistry.ts`, add `description: string` to the `ToolDef` interface and a one-sentence `description` to each `TOOLS` entry. Example values (write one for each of the 12 tools):

```ts
{ id: 'cascade', name: 'Cascade Fill', group: 'blending', Component: CascadeCalculator, description: 'Fill a cylinder from a bank of storage bottles, lowest-pressure bottle first, and see the final pressure and bank residuals.' },
```

Cover all 12: cascade, nitrox-stick, blend, mix-two-gases, blending-cost, booster, mod-end, best-mix, ead, gas-density, oxygen-exposure, gas-requirements. (One clear sentence each.)

- [ ] **Step 2: Create the about page**

`src/app/tools/about/page.tsx`:

```tsx
import Link from 'next/link'
import { GROUPS, TOOLS } from '@/components/Tools/toolsRegistry'

export default function ToolsAboutPage() {
	return (
		<div className='mx-auto max-w-3xl px-4 py-8'>
			<Link href='/tools' className='text-accent text-sm underline'>
				← Back to tools
			</Link>
			<h1 className='text-text mt-2 mb-2 text-3xl font-bold'>
				About the Dive Tools
			</h1>
			<div className='border-border bg-hover text-text mb-6 rounded-md border p-3 text-sm'>
				<span className='font-semibold'>For reference only.</span> All results
				are estimates — independently verify and analyze every gas mix and dive
				plan before diving.
			</div>

			{GROUPS.map((g) => (
				<section key={g.id} className='mb-6'>
					<h2 className='text-text mb-2 text-xl font-semibold'>{g.name}</h2>
					<dl className='space-y-2'>
						{TOOLS.filter((t) => t.group === g.id).map((t) => (
							<div key={t.id}>
								<dt className='text-text font-medium'>{t.name}</dt>
								<dd className='text-light-text text-sm'>{t.description}</dd>
							</div>
						))}
					</dl>
				</section>
			))}

			<h2 className='text-text mt-8 mb-2 text-xl font-semibold'>
				How it works &amp; decisions made
			</h2>
			<div className='text-text space-y-4 text-sm'>
				<div>
					<h3 className='font-semibold'>Real gas vs ideal gas</h3>
					<p>
						Gas amounts use the compressibility factor Z (PV = ZnRT), not just
						the ideal PV = nRT. A first-order linear Z (O₂ ≈ 0.96, N₂ ≈ 1.04,
						He ≈ 1.05 at 200 bar) is applied when the global real-gas setting is
						on — which is why a nominal AL80 (11.1 L × 3000 psi) reads ~77 cf,
						not the ideal 81. It&apos;s a reference-grade approximation, not a
						full virial/NIST model.
					</p>
				</div>
				<div>
					<h3 className='font-semibold'>Temperature / hot fills</h3>
					<p>
						A cylinder fills hot and loses pressure as it cools (Gay-Lussac:
						P/T constant at fixed volume). With temperatures set, the tools show
						the pressure a fill settles to once cool and the hot pressure to fill
						to so it settles at the target; the simple mode uses a flat overfill
						percentage instead.
					</p>
				</div>
				<div>
					<h3 className='font-semibold'>Booster model</h3>
					<p>
						The drive pressure ramps to only what the back-pressure needs
						(≈ receiver pressure ÷ ratio), so drive air is the receiver/supply
						pressure ratio integrated over the fill, not the stall-pressure
						estimate. Fill time is rate-limited (max O₂ fill rate). Cycle rate
						comes from the air-drive swept volume per stroke; a storage buffer +
						compressor can stall the booster if undersized.
					</p>
				</div>
				<div>
					<h3 className='font-semibold'>Data sources</h3>
					<p>
						Cylinder water volumes and pressures: Luxfer / Catalina (aluminum,
						3000 psi), Faber / Worthington (HP steel, 3442 psi), UN / industrial
						T &amp; K bottles. Boosters: Haskel AG (one shared 5.75″ air-drive
						head across the series), USUN (drive-air derived from bore × stroke).
						All cylinder/booster figures are starting estimates you can edit.
					</p>
				</div>
			</div>
		</div>
	)
}
```

- [ ] **Step 3: Link to the about page from `ToolsPage.tsx`**

In `src/components/Tools/ToolsPage.tsx`, add an `import Link from 'next/link'` and, under the `<h1>Dive Tools</h1>`, a link:

```tsx
				<Link href='/tools/about' className='text-accent mb-4 inline-block text-sm underline'>
					About these tools &amp; how they work →
				</Link>
```

- [ ] **Step 4: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: succeeds; `/tools/about` renders.

- [ ] **Step 5: Commit**

```bash
git add src/components/Tools/toolsRegistry.ts src/app/tools/about/page.tsx src/components/Tools/ToolsPage.tsx
git commit -m "feat: add Dive Tools about/info page"
```

---

### Task 7: Generalize blend math (top-up gas + reorderable adds)

**Files:**
- Modify: `src/lib/diveMath/blending.ts`
- Modify: `src/lib/diveMath/blending.test.ts`

**Interfaces:**
- Produces: extended `BlendInput` with `topupFo2?: number` (default `AIR_FO2`), `topupFhe?: number` (default 0), `order?: ('o2' | 'he' | 'top')[]` (default `['he','o2','top']`). `BlendResult` gains `steps: { gas: 'o2'|'he'|'top'; addBar: number; toBar: number; label: string }[]` (cumulative gauge after each add, in `order`). Existing fields (`pHe`,`pO2`,`pTop`,`addHeTo`,`addO2To`,`topTo`,`feasible`,`reason`) retained for back-compat.

- [ ] **Step 1: Write failing tests**

Append to `src/lib/diveMath/blending.test.ts`:

```ts
describe('blend top-up gas + order', () => {
	const base = {
		startPressure: 0,
		startFo2: 0.209,
		startFhe: 0,
		finalPressure: 200,
		targetFo2: 0.32,
		targetFhe: 0,
	}
	it('air top-up (default) matches the legacy O2/He/air result', () => {
		const r = calculateBlend(base)
		expect(r.pHe).toBeCloseTo(0, 6)
		expect(r.pTop).toBeGreaterThan(0)
		expect(r.steps[r.steps.length - 1].toBar).toBeCloseTo(200, 6)
	})
	it('produces one step per component in the chosen order', () => {
		const r = calculateBlend({ ...base, order: ['o2', 'he', 'top'] })
		expect(r.steps.map((s) => s.gas)).toEqual(['o2', 'he', 'top'])
		// cumulative and non-decreasing, ending at the final pressure
		for (let i = 1; i < r.steps.length; i++) {
			expect(r.steps[i].toBar).toBeGreaterThanOrEqual(r.steps[i - 1].toBar)
		}
		expect(r.steps[r.steps.length - 1].toBar).toBeCloseTo(200, 6)
	})
	it('a richer top-up gas needs less added O2 for the same target', () => {
		const air = calculateBlend(base)
		const ean36 = calculateBlend({ ...base, topupFo2: 0.36 })
		expect(ean36.pO2).toBeLessThan(air.pO2)
		expect(ean36.feasible).toBe(true)
	})
	it('flags drain-required when the start mix is too rich', () => {
		const r = calculateBlend({ ...base, startFo2: 0.5, targetFo2: 0.21 })
		expect(r.feasible).toBe(false)
		expect(r.reason).toBeTruthy()
	})
})
```

- [ ] **Step 2: Run, expect failure**

Run: `npx vitest run src/lib/diveMath/blending.test.ts`
Expected: FAIL (`steps`, `topupFo2`, `order` not present).

- [ ] **Step 3: Generalize `calculateBlend`**

Replace the body of `src/lib/diveMath/blending.ts` with a version that solves the same partial-pressure balance for an arbitrary top-up gas, then emits ordered steps. The He and O₂ balances generalize (top-up contributes both O₂ and He):

```ts
import { gasZ } from './compressibility'
import { AIR_FO2 } from './units'

export interface BlendInput {
	startPressure: number
	startFo2: number
	startFhe: number
	finalPressure: number
	targetFo2: number
	targetFhe: number
	topupFo2?: number
	topupFhe?: number
	order?: BlendComponent[]
}

export type BlendComponent = 'o2' | 'he' | 'top'

export interface BlendStep {
	gas: BlendComponent
	addBar: number
	toBar: number
	label: string
}

export interface BlendResult {
	pHe: number
	pO2: number
	pTop: number
	addHeTo: number
	addO2To: number
	topTo: number
	steps: BlendStep[]
	feasible: boolean
	reason?: string
}

const LABEL: Record<BlendComponent, string> = {
	o2: 'O₂',
	he: 'Helium',
	top: 'top-up gas',
}

export function calculateBlend(
	input: BlendInput,
	opts?: { useRealGas?: boolean },
): BlendResult {
	const {
		startPressure: pi,
		startFo2,
		startFhe,
		finalPressure: pf,
		targetFo2,
		targetFhe,
	} = input
	const topFo2 = input.topupFo2 ?? AIR_FO2
	const topFhe = input.topupFhe ?? 0
	const order = input.order ?? ['he', 'o2', 'top']

	// Solve added partial pressures of pure O2, pure He, and the top-up gas so the
	// final mix hits the target at pf. Top-up fills the remainder:
	//   pTop = pf - pi - pHe - pO2
	// He:  startFhe*pi + pHe + topFhe*pTop = targetFhe*pf
	// O2:  startFo2*pi + pO2 + topFo2*pTop = targetFo2*pf
	// Two linear equations in pHe, pO2 (substitute pTop). Solve:
	const rem = pf - pi
	// From He:  pHe + topFhe*(rem - pHe - pO2) = targetFhe*pf - startFhe*pi
	// From O2:  pO2 + topFo2*(rem - pHe - pO2) = targetFo2*pf - startFo2*pi
	const bHe = targetFhe * pf - startFhe * pi - topFhe * rem
	const bO2 = targetFo2 * pf - startFo2 * pi - topFo2 * rem
	// (1-topFhe)*pHe + (-topFhe)*pO2 = bHe
	// (-topFo2)*pHe + (1-topFo2)*pO2 = bO2
	const a11 = 1 - topFhe
	const a12 = -topFhe
	const a21 = -topFo2
	const a22 = 1 - topFo2
	const det = a11 * a22 - a12 * a21
	let pHe = det !== 0 ? (bHe * a22 - a12 * bO2) / det : 0
	let pO2 = det !== 0 ? (a11 * bO2 - bHe * a21) / det : 0

	if (opts?.useRealGas) {
		pHe *= gasZ('he', pf)
		pO2 *= gasZ('o2', pf)
	}
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

	const add: Record<BlendComponent, number> = { he: pHe, o2: pO2, top: pTop }
	let running = pi
	const steps: BlendStep[] = order.map((gas) => {
		running += add[gas]
		return { gas, addBar: add[gas], toBar: running, label: LABEL[gas] }
	})

	return {
		pHe,
		pO2,
		pTop,
		addHeTo: pi + pHe,
		addO2To: pi + pHe + pO2,
		topTo: pf,
		steps,
		feasible,
		reason,
	}
}
```

Note: with `topFhe=0, topFo2=AIR_FO2` the 2×2 reduces to the previous closed form (verify the regression test passes).

- [ ] **Step 4: Run tests, expect pass**

Run: `npx vitest run src/lib/diveMath/blending.test.ts`
Expected: PASS (existing + 4 new).

- [ ] **Step 5: Commit**

```bash
git add src/lib/diveMath/blending.ts src/lib/diveMath/blending.test.ts
git commit -m "feat: blend with a configurable top-up gas and ordered add steps"
```

---

### Task 8: Blend UI — top-up gas picker + reorder

**Files:**
- Modify: `src/components/Tools/BlendCalculator.tsx`

**Interfaces:**
- Consumes: generalized `calculateBlend` (`topupFo2`/`topupFhe`/`order`, `result.steps`); `MixPicker`; `NumberInput`.

- [ ] **Step 1: Add top-up + order state and feed the calc**

In `BlendCalculator`, add state:

```tsx
	const [topO2, setTopO2] = useState(21)
	const [topHe, setTopHe] = useState(0)
	const [order, setOrder] = useState<('o2' | 'he' | 'top')[]>(['he', 'o2', 'top'])
```

Pass into `calculateBlend` input: `topupFo2: topO2 / 100, topupFhe: topHe / 100, order`.

- [ ] **Step 2: Add the top-up gas section (a `MixPicker` + O₂/He inputs)**

After the target-gas section, add a "Top-up gas" section mirroring the existing target-gas inputs (default Air = 21/0): a `MixPicker id='bl-top-mix'` with `onSelect={(o2, he) => { setTopO2(o2); setTopHe(he) }}`, plus two `NumberInput`s bound to `topO2`/`topHe`.

- [ ] **Step 3: Render ordered steps + a reorder control**

Replace the existing add-steps list rendering with `result.steps.map(...)` showing `${step.label}: add to ${p(step.toBar)} ${units.pressure}` (skip steps whose `addBar` is ~0). Add small up/down buttons that reorder the `order` array (swap adjacent), e.g. a row per component with ▲/▼ that call a `move(i, dir)` helper:

```tsx
	const move = (i: number, dir: -1 | 1) =>
		setOrder((prev) => {
			const next = [...prev]
			const j = i + dir
			if (j < 0 || j >= next.length) return prev
			;[next[i], next[j]] = [next[j], next[i]]
			return next
		})
```

- [ ] **Step 4: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: succeeds. Manually: changing the top-up gas / reordering updates the steps; air top-up matches the prior behaviour.

- [ ] **Step 5: Commit**

```bash
git add src/components/Tools/BlendCalculator.tsx
git commit -m "feat: blend UI for top-up gas and reorderable adds"
```

---

### Task 9: Cascade cylinder visualization

**Files:**
- Create: `src/components/Tools/CascadeCylinders.tsx`
- Modify: `src/components/Tools/CascadeCalculator.tsx`

**Interfaces:**
- Consumes: nothing (presentational; caller passes display-unit arrays).
- Produces: `CascadeCylinders({ cylinders, unit })` where `cylinders: { label: string; volumeL: number; startP: number; endP: number; maxP: number; colorClass: string }[]`.

- [ ] **Step 1: Implement `CascadeCylinders.tsx`**

```tsx
export interface CylinderView {
	label: string
	volumeL: number
	startP: number
	endP: number
	maxP: number
	colorClass: string
}

const W = 360
const H = 180
const PAD = 18
const GAP = 10

// Cylinders sized by water volume (height) and filled to their pressure, with a
// start-pressure mark and a pressure label. Static; recomputed each render.
const CascadeCylinders = ({
	cylinders,
	unit,
}: {
	cylinders: CylinderView[]
	unit: string
}) => {
	const n = cylinders.length
	if (n === 0) return null
	const maxVol = Math.max(...cylinders.map((c) => c.volumeL), 1)
	const maxP = Math.max(...cylinders.map((c) => c.maxP), 1)
	const colW = (W - 2 * PAD - (n - 1) * GAP) / n
	const plotH = H - 2 * PAD

	return (
		<div className='border-border bg-surface rounded-md border p-4'>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				className='h-auto w-full'
				role='img'
				aria-label='Cascade cylinder pressures'
			>
				{cylinders.map((c, i) => {
					// Height scaled by volume, clamped so small bottles stay visible.
					const hFrac = 0.45 + 0.55 * (c.volumeL / maxVol)
					const cylH = plotH * hFrac
					const x = PAD + i * (colW + GAP)
					const yTop = H - PAD - cylH
					const fill = Math.max(0, Math.min(1, c.endP / maxP))
					const fillH = cylH * fill
					const startY = H - PAD - cylH * Math.max(0, Math.min(1, c.startP / maxP))
					return (
						<g key={i} className={c.colorClass}>
							<rect
								x={x}
								y={H - PAD - fillH}
								width={colW}
								height={fillH}
								fill='currentColor'
								opacity={0.85}
								rx={3}
							/>
							<rect
								x={x}
								y={yTop}
								width={colW}
								height={cylH}
								fill='none'
								stroke='currentColor'
								strokeWidth={1.5}
								rx={3}
							/>
							{/* start-pressure mark */}
							<line
								x1={x}
								y1={startY}
								x2={x + colW}
								y2={startY}
								className='text-light-text'
								stroke='currentColor'
								strokeWidth={1}
								strokeDasharray='3 2'
							/>
							<text
								x={x + colW / 2}
								y={yTop - 4}
								textAnchor='middle'
								className='fill-current'
								fontSize={9}
							>
								{Math.round(c.startP)}→{Math.round(c.endP)}
							</text>
							<text
								x={x + colW / 2}
								y={H - PAD + 12}
								textAnchor='middle'
								className='text-light-text fill-current'
								fontSize={9}
							>
								{c.label}
							</text>
						</g>
					)
				})}
			</svg>
			<p className='text-light-text text-center text-xs'>
				Cylinder fill (start → after transfer), {unit}; height ∝ volume
			</p>
		</div>
	)
}

export default CascadeCylinders
```

- [ ] **Step 2: Wire into `CascadeCalculator.tsx`**

`banks[i].pressure`, `startPressure`, `desiredPressure` are in **display units**; `result.banks[i].residualPressure` and `result.finalPressure` are **bar gauge** (convert with `fromBar`). Build one shared `maxP` from all display start pressures, then construct the array and render it in the Result section (keep the numeric residual list as the caption beneath):

```tsx
	const cylMax = Math.max(
		...banks.map((b) => b.pressure),
		fromBar(result.finalPressure, units.pressure),
		1,
	)
	const cylinders = [
		...banks.map((b, i) => ({
			label: `Bank ${i + 1}`,
			volumeL: b.volume,
			startP: b.pressure,
			endP: fromBar(result.banks[i].residualPressure, units.pressure),
			maxP: cylMax,
			colorClass: ['text-warning', 'text-light-text', 'text-accent'][i % 3],
		})),
		{
			label: 'Fill',
			volumeL: targetVolume,
			startP: startPressure,
			endP: fromBar(result.finalPressure, units.pressure),
			maxP: cylMax,
			colorClass: 'text-accent',
		},
	]
```

Then render: `<CascadeCylinders cylinders={cylinders} unit={units.pressure} />`.

- [ ] **Step 3: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: succeeds. Manually: cascade shows cylinders sized by volume, filled to pressure, with start marks.

- [ ] **Step 4: Full gate**

Run: `npm test && npm run build && npm run lint && npm run knip`
Expected: all tests pass; build clean; lint 0 errors; knip no new findings (the new exported interfaces `CylinderView`/`BlendStep`/`BlendComponent` may appear alongside the existing accepted exported-interface baseline).

- [ ] **Step 5: Commit**

```bash
git add src/components/Tools/CascadeCylinders.tsx src/components/Tools/CascadeCalculator.tsx
git commit -m "feat: SVG cylinder visualization for cascade fills"
```

---

## Notes for the implementer

- Task 5 and Task 9 reference `result.finalPressure` / `result.banks[i].residualPressure` from `calculateCascade` — both are **bar gauge**. Convert with `fromBar(..., units.pressure)` before display; `banks[i].pressure`/`startPressure`/`targetVolume` are already in display units.
- Keep all cylinder `maxP` equal to one shared maximum so fill levels are visually comparable.
- After Task 4, every tool reads units/real-gas/temperature only from `useUnits()`; there are no per-tool toggles left.
