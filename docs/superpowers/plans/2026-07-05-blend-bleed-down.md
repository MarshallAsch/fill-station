# Blend Bleed-Down Calculation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a starting mix is too rich to reach the target by topping up, compute how far to bleed (vent) the tank down so the mix becomes reachable, and surface it as the first step of the fill sequence.

**Architecture:** Extend `calculateBlend` in `src/lib/diveMath/blending.ts`: factor the per-start-pressure partial-pressure solve into a `solvePartials(pStart, ctx)` helper, and when the solve at the current start pressure is infeasible due to a negative partial, reconstruct each partial as an affine function of start pressure (exact from two evaluations) and solve for the highest bleed-down pressure that makes all three partials ≥ 0. Add `bleedTo`/`bleedBar` to the result. The Blend calculator renders a "Bleed down to X" first step; the Blending Cost calculator benefits with no code change (it already reads `pO2`/`pHe`/`feasible`).

**Tech Stack:** TypeScript, vitest (`npm run test` → `vitest run`), Next.js/React (Tailwind) for the UI, dayjs unaffected.

## Global Constraints

- Formatting: Prettier — single quotes, no semicolons, tabs, 80 char width. Run `npm run lint` after code changes (auto-fixes).
- Bleeding vents the existing mix: composition (`startFo2`/`startFhe`) is unchanged, only pressure drops.
- Only attempt a bleed when the solve at the current start pressure is infeasible due to a **negative partial pressure** and the start pressure `> eps`. The `|det| < 1e-9` case ("top-up can't reach this mix") is unchanged and never triggers a bleed.
- A mix unreachable even after a full drain (target has less O₂/He than the top-up provides) stays infeasible with the single message: `"Even a full drain can't reach this mix with this top-up gas — the target has less O₂ (or He) than the top-up gas provides."`
- Real-gas Z scaling stays exactly as today (applied inside `solvePartials`); it must produce identical results for existing feasible-from-empty cases.
- `eps = 1e-6` (matches existing code).
- No backend/schema/API changes. No "wasted bled-off gas" cost line.

---

### Task 1: Core bleed-down math in `calculateBlend`

**Files:**
- Modify: `src/lib/diveMath/blending.ts`
- Test: `src/lib/diveMath/blending.test.ts`

**Interfaces:**
- Consumes: `gasZ` from `./compressibility`, `AIR_FO2` from `./units` (already imported).
- Produces: `BlendResult` gains two fields:
  - `bleedTo: number` — pressure (bar) to vent the tank to; equals `startPressure` when no bleed is needed.
  - `bleedBar: number` — amount vented (bar), `Math.max(0, startPressure - bleedTo)`; `0` when no bleed.
  - `calculateBlend(input, opts?)` signature is unchanged. `steps`, `addHeTo`, `addO2To`, `topTo` are now computed from the post-bleed start pressure.

- [ ] **Step 1: Replace the test file with the updated + new cases (RED)**

Overwrite `src/lib/diveMath/blending.test.ts` with:

```ts
import { describe, it, expect } from 'vitest'
import { calculateBlend } from './blending'

// Reconstruct the achieved mix fractions from a result (ideal gas), so bleed
// cases can be verified without hand-computing the exact bleed pressure.
const achieved = (
	r: { bleedTo: number; pHe: number; pO2: number; pTop: number },
	startFo2: number,
	startFhe: number,
	topFo2: number,
	topFhe: number,
	pf: number,
) => {
	const fo2 = (startFo2 * r.bleedTo + r.pO2 + topFo2 * r.pTop) / pf
	const fhe = (startFhe * r.bleedTo + r.pHe + topFhe * r.pTop) / pf
	return { fo2, fhe }
}

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
		expect(r.pO2).toBeCloseTo(28.07, 1)
		expect(r.addO2To).toBeCloseTo(28.07, 1)
		expect(r.topTo).toBeCloseTo(200, 6)
		expect(r.bleedBar).toBe(0)
		expect(r.bleedTo).toBe(0)
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
		expect(r.bleedBar).toBe(0)
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
		expect(r.bleedBar).toBe(0)
		expect(r.bleedTo).toBe(50)
	})

	it('bleeds down a slightly-rich nitrox start (EAN36 -> EAN32)', () => {
		const r = calculateBlend({
			startPressure: 150,
			startFo2: 0.36,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.32,
			targetFhe: 0,
		})
		expect(r.feasible).toBe(true)
		expect(r.bleedBar).toBeGreaterThan(0)
		expect(r.bleedTo).toBeCloseTo(147.02, 1)
		expect(r.bleedBar).toBeCloseTo(2.98, 1)
		const mix = achieved(r, 0.36, 0, 0.209, 0, 200)
		expect(mix.fo2).toBeCloseTo(0.32, 4)
		expect(mix.fhe).toBeCloseTo(0, 4)
	})

	it('bleeds down a very rich start (near-full drain)', () => {
		const r = calculateBlend({
			startPressure: 150,
			startFo2: 0.5,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.21,
			targetFhe: 0,
		})
		expect(r.feasible).toBe(true)
		expect(r.bleedBar).toBeGreaterThan(0)
		expect(r.bleedTo).toBeCloseTo(0.69, 1)
		expect(r.bleedBar).toBeCloseTo(149.31, 1)
		const mix = achieved(r, 0.5, 0, 0.209, 0, 200)
		expect(mix.fo2).toBeCloseTo(0.21, 4)
	})

	it('bleeds down a helium-rich trimix start', () => {
		const r = calculateBlend({
			startPressure: 180,
			startFo2: 0.18,
			startFhe: 0.45,
			finalPressure: 200,
			targetFo2: 0.18,
			targetFhe: 0.35,
		})
		expect(r.feasible).toBe(true)
		expect(r.bleedBar).toBeGreaterThan(0)
		const mix = achieved(r, 0.18, 0.45, 0.209, 0, 200)
		expect(mix.fo2).toBeCloseTo(0.18, 4)
		expect(mix.fhe).toBeCloseTo(0.35, 4)
	})

	it('stays infeasible when the target is leaner than the top-up gas', () => {
		const r = calculateBlend({
			startPressure: 150,
			startFo2: 0.209,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.18,
			targetFhe: 0,
		})
		expect(r.feasible).toBe(false)
		expect(r.reason).toBeTruthy()
		expect(r.bleedBar).toBe(0)
	})

	it('cannot bleed an empty start (still infeasible)', () => {
		const r = calculateBlend({
			startPressure: 0,
			startFo2: 0.209,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.18,
			targetFhe: 0,
		})
		expect(r.feasible).toBe(false)
		expect(r.bleedBar).toBe(0)
	})
})

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
		for (let i = 1; i < r.steps.length; i++) {
			expect(r.steps[i].toBar).toBeGreaterThanOrEqual(r.steps[i - 1].toBar)
		}
		expect(r.steps[r.steps.length - 1].toBar).toBeCloseTo(200, 6)
	})
	it('a richer top-up gas needs less added O2 for the same target', () => {
		const air = calculateBlend(base)
		const ean25 = calculateBlend({ ...base, topupFo2: 0.25 })
		expect(ean25.pO2).toBeLessThan(air.pO2)
		expect(ean25.feasible).toBe(true)
	})
	it('bleeds down when the start mix is too rich', () => {
		const r = calculateBlend({
			...base,
			startPressure: 150,
			startFo2: 0.5,
			targetFo2: 0.21,
		})
		expect(r.feasible).toBe(true)
		expect(r.bleedBar).toBeGreaterThan(0)
	})
	it('flags an unsolvable pure-O2 top-up', () => {
		const r = calculateBlend({ ...base, topupFo2: 1, topupFhe: 0 })
		expect(r.feasible).toBe(false)
		expect(r.reason).toBeTruthy()
	})
})
```

- [ ] **Step 2: Run the tests to confirm they fail (RED)**

Run: `npm run test -- src/lib/diveMath/blending.test.ts`
Expected: FAIL. The bleed cases and `bleedBar`/`bleedTo` assertions fail (the fields don't exist yet — TypeScript/vitest reports them as `undefined`, and the previously-"infeasible" cases now expect `feasible === true`).

- [ ] **Step 3: Rewrite `calculateBlend` with the bleed-down solve (GREEN)**

Replace the entire contents of `src/lib/diveMath/blending.ts` with:

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
	bleedTo: number
	bleedBar: number
}

const LABEL: Record<BlendComponent, string> = {
	o2: 'O₂',
	he: 'Helium',
	top: 'top-up gas',
}

const EPS = 1e-6

const DRAIN_IMPOSSIBLE =
	"Even a full drain can't reach this mix with this top-up gas — the target has less O₂ (or He) than the top-up gas provides."

const DET_UNREACHABLE =
	"Top-up gas can't reach this mix — use a top-up with both oxygen and inert gas."

interface SolveCtx {
	pf: number
	startFo2: number
	startFhe: number
	targetFo2: number
	targetFhe: number
	topFo2: number
	topFhe: number
	a11: number
	a12: number
	a21: number
	a22: number
	det: number
	useRealGas: boolean
}

// Solve the added partial pressures (pure He, pure O2, top-up gas) needed to
// reach the target at pf, starting from a tank already holding `pStart` bar of
// the start mix. Real-gas Z scaling is applied to the pure-gas additions,
// matching the top-level behavior.
function solvePartials(
	pStart: number,
	ctx: SolveCtx,
): { pHe: number; pO2: number; pTop: number } {
	const {
		pf,
		startFo2,
		startFhe,
		targetFo2,
		targetFhe,
		topFo2,
		topFhe,
		a11,
		a12,
		a21,
		a22,
		det,
		useRealGas,
	} = ctx
	const rem = pf - pStart
	const bHe = targetFhe * pf - startFhe * pStart - topFhe * rem
	const bO2 = targetFo2 * pf - startFo2 * pStart - topFo2 * rem
	let pHe = (bHe * a22 - a12 * bO2) / det
	let pO2 = (a11 * bO2 - bHe * a21) / det
	if (useRealGas) {
		pHe *= gasZ('he', pf)
		pO2 *= gasZ('o2', pf)
	}
	const pTop = pf - pStart - pHe - pO2
	return { pHe, pO2, pTop }
}

function buildResult(
	pi: number,
	effectiveStart: number,
	partials: { pHe: number; pO2: number; pTop: number },
	order: BlendComponent[],
	feasible: boolean,
	reason: string | undefined,
): BlendResult {
	const { pHe, pO2, pTop } = partials
	const add: Record<BlendComponent, number> = { he: pHe, o2: pO2, top: pTop }
	let running = effectiveStart
	const steps: BlendStep[] = order.map((gas) => {
		running += add[gas]
		return { gas, addBar: add[gas], toBar: running, label: LABEL[gas] }
	})
	return {
		pHe,
		pO2,
		pTop,
		addHeTo: effectiveStart + pHe,
		addO2To: effectiveStart + pHe + pO2,
		topTo: effectiveStart + pHe + pO2 + pTop,
		steps,
		feasible,
		reason,
		bleedTo: effectiveStart,
		bleedBar: Math.max(0, pi - effectiveStart),
	}
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

	const a11 = 1 - topFhe
	const a12 = -topFhe
	const a21 = -topFo2
	const a22 = 1 - topFo2
	const det = a11 * a22 - a12 * a21

	// Top-up gas spans no usable direction — no bleed can fix this.
	if (Math.abs(det) < 1e-9) {
		return buildResult(
			pi,
			pi,
			{ pHe: 0, pO2: 0, pTop: 0 },
			order,
			false,
			DET_UNREACHABLE,
		)
	}

	const ctx: SolveCtx = {
		pf,
		startFo2,
		startFhe,
		targetFo2,
		targetFhe,
		topFo2,
		topFhe,
		a11,
		a12,
		a21,
		a22,
		det,
		useRealGas: opts?.useRealGas ?? false,
	}

	const primary = solvePartials(pi, ctx)
	const primaryOk =
		primary.pHe >= -EPS && primary.pO2 >= -EPS && primary.pTop >= -EPS
	if (primaryOk) {
		return buildResult(pi, pi, primary, order, true, undefined)
	}

	// Infeasible at the current start pressure due to a negative partial.
	// A bleed is only possible if there is gas to vent.
	if (pi <= EPS) {
		return buildResult(pi, pi, primary, order, false, DRAIN_IMPOSSIBLE)
	}

	// Each partial is affine in the start pressure; reconstruct each line from
	// two evaluations (pStart = 0 and pStart = pi) and find the highest bleed
	// target that keeps all three partials >= 0.
	const at0 = solvePartials(0, ctx)
	const recon = (v0: number, vPi: number) => ({
		base: v0,
		slope: (vPi - v0) / pi,
	})
	const lines = [
		recon(at0.pHe, primary.pHe),
		recon(at0.pO2, primary.pO2),
		recon(at0.pTop, primary.pTop),
	]

	let lo = 0
	let hi = pi
	let constantInfeasible = false
	for (const { base, slope } of lines) {
		if (Math.abs(slope) < 1e-12) {
			if (base < -EPS) constantInfeasible = true
		} else {
			const cross = -base / slope
			if (slope > 0) lo = Math.max(lo, cross)
			else hi = Math.min(hi, cross)
		}
	}

	if (constantInfeasible || hi < lo - EPS || hi < 0) {
		return buildResult(pi, pi, primary, order, false, DRAIN_IMPOSSIBLE)
	}

	const bleedTo = Math.max(0, Math.min(hi, pi))
	const bled = solvePartials(bleedTo, ctx)
	return buildResult(pi, bleedTo, bled, order, true, undefined)
}
```

- [ ] **Step 4: Run the blending tests to confirm they pass (GREEN)**

Run: `npm run test -- src/lib/diveMath/blending.test.ts`
Expected: PASS (all cases in the three describe blocks green).

- [ ] **Step 5: Run the full test suite and lint**

Run: `npm run test`
Expected: PASS (no regressions in other diveMath modules — e.g. `booster.ts` imports from `blending`; its tests must still pass).
Run: `npm run lint`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/diveMath/blending.ts src/lib/diveMath/blending.test.ts
git commit -m "feat: compute tank bleed-down when required to reach a blend"
```

---

### Task 2: Render the bleed step in the Blend calculator

**Files:**
- Modify: `src/components/Tools/BlendCalculator.tsx`

**Interfaces:**
- Consumes: `result.bleedBar`, `result.bleedTo` from `calculateBlend` (Task 1); existing `roundPressure`, `units.pressure`.
- Produces: no new exports. UI-only change: a non-reorderable "Bleed down to X" first item in the fill sequence when a bleed is required.

- [ ] **Step 1: Prepend the bleed step inside the fill-sequence `<ol>`**

In `src/components/Tools/BlendCalculator.tsx`, the feasible branch renders:

```tsx
<ol className='text-text list-decimal space-y-1 pl-5'>
	{result.steps
		.filter((step) => Math.abs(step.addBar) >= 0.01)
		.map((step) => (
```

Add a bleed `<li>` as the first child of that `<ol>`, immediately before the
`{result.steps` expression:

```tsx
<ol className='text-text list-decimal space-y-1 pl-5'>
	{result.bleedBar > 0.01 && (
		<li>
			<span className='font-semibold'>Bleed down</span>
			{': to '}
			<span className='font-semibold'>
				{roundPressure(result.bleedTo, units.pressure)} {units.pressure}
			</span>
		</li>
	)}
	{result.steps
		.filter((step) => Math.abs(step.addBar) >= 0.01)
		.map((step) => (
```

Leave the closing tags and the rest of the block (reorder controls, hot-fill
note) unchanged. Do not modify the `order`/reorder logic — the bleed is always
first and is not reorderable.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: 0 errors.

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open `/tools`, select the Blend (gas blending) calculator.

- Starting gas EAN36 @ 150 bar (or the psi equivalent shown), target EAN32 @
  200 bar, top-up air → the fill sequence shows "Bleed down: to ~147 bar" as
  step 1, followed by the add steps ending at the final pressure. Toggle units
  (psi/bar) and confirm the bleed pressure converts.
- Set target EAN18 with air top-up → the sequence is replaced by the infeasible
  message ("Even a full drain can't reach this mix…"), no bleed step.
- A normal feasible blend (e.g. EAN21 @ 50 bar → EAN32 @ 200) → no bleed step
  appears (unchanged behavior).
- Open the Blending Cost calculator, enter the EAN36 @ 150 → EAN32 @ 200 case →
  it now shows a cost (feasible) instead of the draining message.

- [ ] **Step 4: Commit**

```bash
git add src/components/Tools/BlendCalculator.tsx
git commit -m "feat: show bleed-down as the first blend step"
```

---

## Self-Review

**Spec coverage:**
- §1a factor `solvePartials` → Task 1, Step 3.
- §1b bleed-down affine solve (two-point reconstruction, interval intersection, `pi ≤ eps` guard, `det ≈ 0` skip) → Task 1, Step 3.
- §1c result fields `bleedTo`/`bleedBar`, steps from `effectiveStart`, replaced reason strings → Task 1, Step 3; asserted in Step 1 tests.
- §2 Blend calculator bleed step → Task 2.
- §3 cost calculator benefits with no code change → verified in Task 2, Step 3 (no code task, per spec).
- §4 tests (updated draining cases, nitrox bleed, unreachable, empty start, no-bleed, trimix bleed) → Task 1, Step 1.

**Placeholder scan:** No TBD/TODO; full file contents and test code provided.

**Type consistency:** `BlendResult` fields `bleedTo`/`bleedBar` are defined in Task 1's Produces and the interface, used in Task 2's JSX. `solvePartials`/`buildResult`/`SolveCtx` are internal to `blending.ts`. `calculateBlend(input, opts?)` signature unchanged, matching both calculators' existing call sites. The message constants (`DRAIN_IMPOSSIBLE`, `DET_UNREACHABLE`) match the spec wording.
