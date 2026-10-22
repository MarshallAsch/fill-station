# "Topping Up" Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Mix Two Gases" tool with a "Topping Up" calculator that, given a starting gas + a top-up gas + a target fill pressure, reports the resulting mix and how much gas was added — applying real-gas compressibility.

**Architecture:** A new mole-weighted blend function `topUpMix` in `gasMixing.ts` (replacing `mixTwoGases`) reusing the existing `mixZ` compressibility model via a short fixed-point iteration; a rewritten client component `ToppingUpCalculator.tsx` wired into the tools registry under a new id/name.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, Vitest. Pure SI dive math in `src/lib/diveMath/` (tests use relative imports — no `@/` alias in Vitest).

## Global Constraints

- Prettier: single quotes, no semicolons, TABS, 80-char width.
- Tailwind theme tokens only (`bg-background`, `text-text`, `text-light-text`, `border-border`, etc.) — no hardcoded colors, no redundant `dark:` variants.
- Reuse existing components: `NumberInput`, `MixPicker`, `SafetyNote`. Do not modify `NumberInput` (empty input already coerces to `0`).
- Only displayed values get rounding helpers (`roundPressure`, `roundPercent`, `fmtMix`); values fed into `topUpMix` are raw `toBar(...)` conversions, never rounded.
- All pressures are gauge; convert to absolute with `ATMOSPHERIC_BAR` inside `topUpMix`. Gas content ∝ `Pabs / Z(mix, Pabs)` (same model as `cascade`/`booster`).
- Real-gas is read from the global `useRealGas` setting (`useUnits()`); when off, `topUpMix` uses the ideal seed only.
- Persistence prefix `tu.`; store display values; initials: start pressure `0`, start O₂ `21`, start He `0`, top-up O₂ `32`, top-up He `0`, final pressure `3000`.

---

### Task 1: `topUpMix` math + tests

**Files:**
- Modify: `src/lib/diveMath/gasMixing.ts` (replace `mixTwoGases` + `GasFill` entirely)
- Test: `src/lib/diveMath/gasMixing.test.ts` (create)

**Interfaces:**
- Consumes: `ATMOSPHERIC_BAR` from `./units`; `mixZ` from `./compressibility` (`mixZ({ fo2, fhe, pressureBar }) => number`).
- Produces:
  - `interface TopUpInput { startBar: number; startFo2: number; startFhe: number; topFo2: number; topFhe: number; finalBar: number; useRealGas?: boolean }`
  - `interface TopUpResult { finalBar: number; addedBar: number; fo2: number; fhe: number; noTopUp: boolean }`
  - `function topUpMix(input: TopUpInput): TopUpResult`
  - (`mixTwoGases` and `GasFill` are removed — only `GasMixingCalculator` consumed them, and it is replaced in Task 2.)

- [ ] **Step 1: Write the failing tests**

Create `src/lib/diveMath/gasMixing.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { topUpMix } from './gasMixing'

describe('topUpMix', () => {
	it('tops air up to a fill pressure with EAN32 (ideal)', () => {
		// ≈ 200 psi air → 3000 psi with 32% O₂
		const r = topUpMix({
			startBar: 13.79,
			startFo2: 0.21,
			startFhe: 0,
			topFo2: 0.32,
			topFhe: 0,
			finalBar: 206.84,
			useRealGas: false,
		})
		expect(r.noTopUp).toBe(false)
		expect(r.fo2).toBeCloseTo(0.31, 2) // ~0.312, residual air pulls it under 0.32
		expect(r.fhe).toBeCloseTo(0, 6)
		expect(r.finalBar).toBe(206.84)
		expect(r.addedBar).toBeCloseTo(206.84 - 13.79, 6)
	})

	it('an empty start yields almost exactly the top-up mix', () => {
		const r = topUpMix({
			startBar: 0,
			startFo2: 0.21,
			startFhe: 0,
			topFo2: 0.32,
			topFhe: 0,
			finalBar: 206.84,
			useRealGas: false,
		})
		expect(r.fo2).toBeCloseTo(0.32, 2) // 1 atm of residual air barely dilutes
		expect(r.fhe).toBeCloseTo(0, 6)
	})

	it('final at or below start adds nothing and returns the start mix', () => {
		const r = topUpMix({
			startBar: 206.84,
			startFo2: 0.21,
			startFhe: 0,
			topFo2: 0.32,
			topFhe: 0,
			finalBar: 100,
			useRealGas: false,
		})
		expect(r.noTopUp).toBe(true)
		expect(r.addedBar).toBe(0)
		expect(r.fo2).toBe(0.21)
		expect(r.fhe).toBe(0)
		expect(r.finalBar).toBe(206.84)
	})

	it('final equal to start also adds nothing', () => {
		const r = topUpMix({
			startBar: 150,
			startFo2: 0.21,
			startFhe: 0,
			topFo2: 1,
			topFhe: 0,
			finalBar: 150,
			useRealGas: false,
		})
		expect(r.noTopUp).toBe(true)
		expect(r.addedBar).toBe(0)
		expect(r.fo2).toBe(0.21)
	})

	it('real-gas raises the O₂ fraction vs ideal when topping with O₂', () => {
		const base = {
			startBar: 100,
			startFo2: 0.21,
			startFhe: 0,
			topFo2: 1,
			topFhe: 0,
			finalBar: 200,
		}
		const ideal = topUpMix({ ...base, useRealGas: false })
		const real = topUpMix({ ...base, useRealGas: true })
		expect(ideal.fo2).toBeCloseTo(0.6, 2) // ~0.603
		expect(real.fo2).toBeCloseTo(0.61, 2) // ~0.611
		// O₂ is more compressible (Z<1), so more O₂ moles pack in than ideal.
		expect(real.fo2).toBeGreaterThan(ideal.fo2)
	})

	it('preserves helium through a trimix top-up', () => {
		const r = topUpMix({
			startBar: 0,
			startFo2: 0.21,
			startFhe: 0,
			topFo2: 0.18,
			topFhe: 0.45,
			finalBar: 200,
			useRealGas: false,
		})
		expect(r.fhe).toBeCloseTo(0.45, 2)
		expect(r.fo2).toBeCloseTo(0.18, 2)
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/diveMath/gasMixing.test.ts`
Expected: FAIL — `topUpMix` is not exported (import error / "topUpMix is not a function").

- [ ] **Step 3: Replace the implementation**

Replace the ENTIRE contents of `src/lib/diveMath/gasMixing.ts` with:

```ts
import { ATMOSPHERIC_BAR } from './units'
import { mixZ } from './compressibility'

export interface TopUpInput {
	startBar: number // starting (gauge) pressure, bar
	startFo2: number // starting mix O₂ fraction (0–1)
	startFhe: number // starting mix He fraction (0–1)
	topFo2: number // top-up gas O₂ fraction (0–1)
	topFhe: number // top-up gas He fraction (0–1)
	finalBar: number // target (gauge) pressure to fill to, bar
	useRealGas?: boolean // apply compressibility; default false (ideal)
}

export interface TopUpResult {
	finalBar: number // resulting (gauge) pressure: finalBar, or startBar if no top-up
	addedBar: number // top-up gas added (gauge bar): max(0, finalBar - startBar)
	fo2: number // resulting O₂ fraction (0–1)
	fhe: number // resulting He fraction (0–1)
	noTopUp: boolean // true when finalBar <= startBar (nothing added)
}

// The resulting mix is a mole-weighted blend of the start gas and the top-up
// gas. `r` is the fraction of the final gas content that came from the start
// gas, so finalMix = r * startMix + (1 - r) * topUpMix. Real-gas content is
// proportional to Pabs / Z(mix, Pabs); since the final Z depends on the final
// mix, solve by a short fixed-point iteration seeded with the ideal blend.
export function topUpMix(input: TopUpInput): TopUpResult {
	const { startBar, startFo2, startFhe, topFo2, topFhe, finalBar } = input

	if (finalBar <= startBar) {
		return {
			finalBar: startBar,
			addedBar: 0,
			fo2: startFo2,
			fhe: startFhe,
			noTopUp: true,
		}
	}

	const startAbs = startBar + ATMOSPHERIC_BAR
	const finalAbs = finalBar + ATMOSPHERIC_BAR

	let r = startAbs / finalAbs // ideal-gas seed
	let fo2 = r * startFo2 + (1 - r) * topFo2
	let fhe = r * startFhe + (1 - r) * topFhe

	if (input.useRealGas) {
		const zStart = mixZ({
			fo2: startFo2,
			fhe: startFhe,
			pressureBar: startAbs,
		})
		for (let i = 0; i < 10; i++) {
			const zFinal = mixZ({ fo2, fhe, pressureBar: finalAbs })
			r = startAbs / zStart / (finalAbs / zFinal)
			fo2 = r * startFo2 + (1 - r) * topFo2
			fhe = r * startFhe + (1 - r) * topFhe
		}
	}

	return {
		finalBar,
		addedBar: finalBar - startBar,
		fo2,
		fhe,
		noTopUp: false,
	}
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/diveMath/gasMixing.test.ts`
Expected: PASS — all 6 tests green.

- [ ] **Step 5: Run the full suite (no regressions)**

Run: `npm test`
Expected: all test files pass (the previous suite + the new `gasMixing.test.ts`). No other module changed, so nothing else should move.

- [ ] **Step 6: Commit**

```bash
git add src/lib/diveMath/gasMixing.ts src/lib/diveMath/gasMixing.test.ts
git commit -m "feat: add topUpMix mole-weighted blend (replaces mixTwoGases)"
```

---

### Task 2: `ToppingUpCalculator` component + registry wiring

**Files:**
- Create: `src/components/Tools/ToppingUpCalculator.tsx`
- Delete: `src/components/Tools/GasMixingCalculator.tsx`
- Modify: `src/components/Tools/toolsRegistry.ts` (import, `TabId` union, the tool entry)

**Interfaces:**
- Consumes: `topUpMix`, `TopUpResult` from `@/lib/diveMath/gasMixing` (Task 1); `toBar` from `@/lib/diveMath/units`; `fmtMix`, `roundPercent`, `roundPressure` from `@/lib/diveMath/format`; `useUnits()` from `./UnitsProvider` (returns `{ units, useRealGas, ... }`); `usePersistedPressure` from `./useUnitState`; `usePersistedState` from `./usePersistedState`; `MixPicker` (`onSelect: (fo2Pct, fhePct) => void`, `id`), `SafetyNote` (`level: 'warning' | 'danger'`), `NumberInput`.
- Produces: default export `ToppingUpCalculator` (a React component); registry tool `{ id: 'top-up', name: 'Topping Up', group: 'blending' }`.

- [ ] **Step 1: Create the component**

Create `src/components/Tools/ToppingUpCalculator.tsx`:

```tsx
'use client'

import NumberInput from '@/components/UI/FormElements/NumberInput'
import { fmtMix, roundPercent, roundPressure } from '@/lib/diveMath/format'
import { topUpMix } from '@/lib/diveMath/gasMixing'
import { toBar } from '@/lib/diveMath/units'
import MixPicker from './MixPicker'
import SafetyNote from './SafetyNote'
import { useUnits } from './UnitsProvider'
import { usePersistedPressure } from './useUnitState'
import { usePersistedState } from './usePersistedState'

const ToppingUpCalculator = () => {
	const { units, useRealGas } = useUnits()
	const [startP, setStartP] = usePersistedPressure('tu.startP', 0)
	const [startO2, setStartO2] = usePersistedState('tu.startO2', 21)
	const [startHe, setStartHe] = usePersistedState('tu.startHe', 0)
	const [topO2, setTopO2] = usePersistedState('tu.topO2', 32)
	const [topHe, setTopHe] = usePersistedState('tu.topHe', 0)
	const [finalP, setFinalP] = usePersistedPressure('tu.finalP', 3000)

	const result = topUpMix({
		startBar: toBar(startP, units.pressure),
		startFo2: startO2 / 100,
		startFhe: startHe / 100,
		topFo2: topO2 / 100,
		topFhe: topHe / 100,
		finalBar: toBar(finalP, units.pressure),
		useRealGas,
	})

	const startInvalid = startO2 + startHe > 100
	const topInvalid = topO2 + topHe > 100

	const resultO2Pct = roundPercent(result.fo2 * 100)
	const resultHePct = roundPercent(result.fhe * 100)

	return (
		<div className='space-y-6'>
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Starting gas</h2>
				<MixPicker
					id='tu-start-mix'
					onSelect={(o2, he) => {
						setStartO2(o2)
						setStartHe(he)
					}}
				/>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='tu-start-p'
						name='tu-start-p'
						label={`Pressure (${units.pressure})`}
						value={startP}
						onChange={setStartP}
						min={0}
					/>
					<NumberInput
						id='tu-start-o2'
						name='tu-start-o2'
						label='O₂ (%)'
						value={startO2}
						onChange={setStartO2}
						min={0}
						max={100}
					/>
					<NumberInput
						id='tu-start-he'
						name='tu-start-he'
						label='He (%)'
						value={startHe}
						onChange={setStartHe}
						min={0}
						max={100}
					/>
				</div>
				{startInvalid && (
					<SafetyNote level='danger'>
						O₂ + He exceeds 100% — not a valid mix.
					</SafetyNote>
				)}
			</section>
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Top-up gas</h2>
				<MixPicker
					id='tu-top-mix'
					onSelect={(o2, he) => {
						setTopO2(o2)
						setTopHe(he)
					}}
				/>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='tu-top-o2'
						name='tu-top-o2'
						label='O₂ (%)'
						value={topO2}
						onChange={setTopO2}
						min={0}
						max={100}
					/>
					<NumberInput
						id='tu-top-he'
						name='tu-top-he'
						label='He (%)'
						value={topHe}
						onChange={setTopHe}
						min={0}
						max={100}
					/>
				</div>
				{topInvalid && (
					<SafetyNote level='danger'>
						O₂ + He exceeds 100% — not a valid mix.
					</SafetyNote>
				)}
			</section>
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Fill to</h2>
				<NumberInput
					id='tu-final-p'
					name='tu-final-p'
					label={`Final pressure (${units.pressure})`}
					value={finalP}
					onChange={setFinalP}
					min={0}
				/>
			</section>
			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Resulting mix</h2>
				<p className='text-text text-2xl font-bold'>
					{fmtMix(resultO2Pct, resultHePct)}
				</p>
				<p className='text-light-text text-sm'>
					{roundPressure(result.finalBar, units.pressure)} {units.pressure} · O₂{' '}
					{resultO2Pct}% · He {resultHePct}%
				</p>
				{result.noTopUp ? (
					<SafetyNote level='warning'>
						Final pressure is at or below your start — nothing added, showing your
						starting mix.
					</SafetyNote>
				) : (
					<p className='text-light-text text-sm'>
						Added {roundPressure(result.addedBar, units.pressure)}{' '}
						{units.pressure} of {fmtMix(topO2, topHe)}
					</p>
				)}
			</section>
		</div>
	)
}

export default ToppingUpCalculator
```

- [ ] **Step 2: Delete the old component**

```bash
git rm src/components/Tools/GasMixingCalculator.tsx
```

- [ ] **Step 3: Rewire the registry**

In `src/components/Tools/toolsRegistry.ts`:

1. Replace the import line
   `import GasMixingCalculator from './GasMixingCalculator'`
   with
   `import ToppingUpCalculator from './ToppingUpCalculator'`
   (keep the import list alphabetical-ish as it already is — place it where `GasMixingCalculator` was).

2. In the `TabId` union, replace `| 'mix-two-gases'` with `| 'top-up'`.

3. Replace the whole tool entry:

```ts
	{
		id: 'mix-two-gases',
		name: 'Mix Two Gases',
		group: 'blending',
		Component: GasMixingCalculator,
		description:
			'Combine two arbitrary gas mixes in a cylinder and calculate the resulting O₂, He, and N₂ fractions by pressure contribution.',
	},
```

with:

```ts
	{
		id: 'top-up',
		name: 'Topping Up',
		group: 'blending',
		Component: ToppingUpCalculator,
		description:
			'Fill a partial cylinder up to a target pressure with a top-up gas and see the resulting mix and how much gas you added.',
	},
```

- [ ] **Step 4: Full gate**

Run: `npm test && npm run build && npm run lint && npm run knip`
Expected:
- Tests pass (unchanged from Task 1 — component is build-verified).
- Build clean (the renamed component compiles; no dangling `GasMixingCalculator` import).
- Lint 0 errors (11 pre-existing warnings in unrelated files are fine).
- Knip: no NEW findings beyond the accepted exported-interface baseline. The `gasMixing.ts` baseline entry changes from `GasFill` to `TopUpInput`/`TopUpResult` (exported interfaces, consistent with the other diveMath modules that export their input/result interfaces); `topUpMix` is consumed by `ToppingUpCalculator` so must NOT be flagged. There must be no leftover reference to `GasMixingCalculator` or `mix-two-gases` anywhere (grep to confirm: `grep -rn "GasMixingCalculator\|mix-two-gases\|mixTwoGases" src` returns nothing).

Manually: open `/tools?tab=top-up` — the tab reads "Topping Up"; with the defaults (start 0, air, EAN32, 3000) the result shows ~32% O₂ and an "Added 3000 … of 32" line; set start to 200 psi / 21% and final 3000 → ~31% O₂; set final below start → the muted "nothing added" note. The `/tools/about` page lists "Topping Up" with the new description.

- [ ] **Step 5: Commit**

```bash
git add src/components/Tools/ToppingUpCalculator.tsx src/components/Tools/toolsRegistry.ts
git commit -m "feat: replace Mix Two Gases with the Topping Up calculator"
```

---

## Notes for the implementer

- `useUnits()` returns `useRealGas` directly on the context value — destructure it alongside `units`.
- `result.finalBar` / `result.addedBar` are in **bar**; `roundPressure(bar, units.pressure)` converts to the display unit.
- Do not round the values passed into `topUpMix` — they are raw `toBar(...)` conversions.
- The `git rm` in Task 2 and the new file together are one logical change; both commits in Task 2 may be squashed into Step 5's commit if the tool's working tree is staged together — but committing per the steps is fine.
