# Compute Tank Bleed-Down When Required to Reach a Mix — Design

**Date:** 2026-07-05
**Status:** Draft (pending user review)

## Overview

The partial-pressure Blend calculator (`src/lib/diveMath/blending.ts`,
surfaced by `BlendCalculator.tsx` and `BlendingCostCalculator.tsx`) solves the
added partial pressures of pure O₂, pure He, and top-up gas needed to turn a
starting mix into a target mix at the final pressure. When the starting mix is
too rich (any added partial pressure comes out negative), it currently flags the
blend infeasible with a "draining required" message but gives **no number** —
the user is told they must drain the tank but not how far.

This change computes the bleed-down: the pressure to vent the tank to so that
the target mix becomes reachable by topping up, bleeding as little as possible.
Both calculators share `calculateBlend`, so extending the core function fixes
both surfaces.

## Scope decisions (from brainstorming)

- **Both surfaces.** The bleed logic lives in `calculateBlend`; the Blend
  calculator renders an explicit bleed step, and the Blending Cost calculator
  automatically becomes feasible and costs the post-bleed added gas.
- **Bleed as the first step** of the fill sequence in the Blend calculator
  ("Bleed down to X bar"), followed by the add-O₂/He/top-up steps computed from
  the bled-down pressure.
- **No "wasted bled-off gas" cost line** (YAGNI). Cost stays "gas you buy and
  add."
- **Bleed only when a negative partial pressure requires it.** The `det ≈ 0`
  ("top-up can't reach this mix") case is unchanged. A mix that stays
  unreachable even after a full drain (e.g. EAN18 with air top-up — you cannot
  remove O₂ by adding gas) stays infeasible with a message.

## Current behavior (reference)

`calculateBlend(input, opts)` in `src/lib/diveMath/blending.ts`:

- Solves a 2×2 linear system for the ideal added partials `pHe`, `pO2` from the
  current start pressure `pi`, then `pTop = pf - pi - pHe - pO2`.
- If `opts.useRealGas`, multiplies `pHe *= gasZ('he', pf)` and
  `pO2 *= gasZ('o2', pf)` **after** the ideal solve (`pTop` is then derived from
  the scaled values).
- Feasibility is checked on the (possibly Z-scaled) `pHe`, `pO2`, `pTop`:
  - `|det| < 1e-9` → infeasible, "Top-up gas can't reach this mix…"
  - `pHe < -eps` → infeasible, "Too much helium in the start mix — draining required."
  - `pO2 < -eps` → infeasible, "Too much oxygen in the start mix — draining required."
  - `pTop < -eps` → infeasible, "Start pressure too high for this mix — draining required."
- Builds `steps` by walking `order` (default `['he','o2','top']`), starting the
  running total at `pi`.

Consumers:
- `BlendCalculator.tsx` renders `result.steps` (filtered to `|addBar| ≥ 0.01`)
  as a numbered list, plus a reorder control over `order`; on `!feasible` it
  shows `result.reason`.
- `BlendingCostCalculator.tsx` reads `blend.pO2`, `blend.pHe` (via
  `Math.max(0, …) * tankL`), `blend.feasible`, `blend.reason`. It does **not**
  pass `order` or render steps.

## 1. Core math change (`src/lib/diveMath/blending.ts`)

### 1a. Factor out the partial solve

Extract the existing per-start-pressure solve into a pure helper so it can be
evaluated at more than one start pressure:

```ts
// Solve added partials (pure He, pure O2, top-up) to reach the target at pf,
// starting from a tank already holding `pStart` bar of the start mix.
// Applies the same real-gas Z scaling as the top-level function.
function solvePartials(
	pStart: number,
	ctx: {
		pf: number
		startFo2: number
		startFhe: number
		targetFo2: number
		targetFhe: number
		topFo2: number
		topFhe: number
		det: number
		a11: number
		a12: number
		a21: number
		a22: number
		useRealGas: boolean
	},
): { pHe: number; pO2: number; pTop: number } {
	const {
		pf, startFo2, startFhe, targetFo2, targetFhe, topFo2, topFhe,
		det, a11, a12, a21, a22, useRealGas,
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
```

The top-level function computes `a11/a12/a21/a22/det` (unchanged) and calls
`solvePartials(pi, ctx)` for the primary solve.

### 1b. Bleed-down solve

Each of `pHe`, `pO2`, `pTop` is **affine in the start pressure** (the Z factors
are constants at fixed `pf`, so scaling preserves affineness). Reconstruct each
line from two evaluations and solve for the feasible bleed target.

Enter this branch only when the primary solve at `pi` is infeasible due to a
negative partial (i.e. `|det| ≥ 1e-9` and at least one of `pHe`, `pO2`, `pTop`
`< -eps`) **and** `pi > eps` (a bleed is physically possible):

```ts
// Reconstruct each partial as pX(pStart) = base + slope * pStart using two
// evaluations: pStart = 0 and pStart = pi. Affine, so this is exact.
const at0 = solvePartials(0, ctx)
const atPi = solvePartials(pi, ctx) // == primary solve
const lines = {
	pHe: { base: at0.pHe, slope: (atPi.pHe - at0.pHe) / pi },
	pO2: { base: at0.pO2, slope: (atPi.pO2 - at0.pO2) / pi },
	pTop: { base: at0.pTop, slope: (atPi.pTop - at0.pTop) / pi },
}

// Feasible pStart interval: pX(pStart) >= 0 for all three.
//   slope > 0  -> pStart >= -base/slope     (lower bound)
//   slope < 0  -> pStart <= -base/slope     (upper bound)
//   slope ~ 0  -> feasible iff base >= 0     (constant)
let lo = 0
let hi = pi
let constantInfeasible = false
for (const { base, slope } of Object.values(lines)) {
	if (Math.abs(slope) < 1e-12) {
		if (base < -eps) constantInfeasible = true
	} else {
		const cross = -base / slope
		if (slope > 0) lo = Math.max(lo, cross)
		else hi = Math.min(hi, cross)
	}
}

const bleedFeasible = !constantInfeasible && hi >= lo - eps && hi >= 0
const bleedTo = bleedFeasible ? Math.max(0, Math.min(hi, pi)) : pi
```

- `bleedFeasible` true → the target is reachable after venting to `bleedTo`
  (with `bleedTo < pi`, since `pi` itself was infeasible).
- `bleedFeasible` false → no `pStart` in `[0, pi]` satisfies all three; the mix
  is unreachable even after a full drain. Keep it infeasible.

### 1c. Recompute from the bleed target and assemble the result

Let `effectiveStart = bleedFeasible ? bleedTo : pi`. Recompute the final
partials with `solvePartials(effectiveStart, ctx)` and re-evaluate feasibility
on those values (the same `pHe/pO2/pTop < -eps` checks, now expected to pass
when `bleedFeasible`). Build `steps` with the running total starting at
`effectiveStart` instead of `pi`.

**Result shape additions** to `BlendResult`:

```ts
export interface BlendResult {
	// …existing fields (pHe, pO2, pTop, addHeTo, addO2To, topTo, steps,
	//   feasible, reason)…
	bleedTo: number // pressure (bar) to vent the tank to; == startPressure when no bleed
	bleedBar: number // amount vented (bar): max(0, startPressure - bleedTo); 0 when no bleed
}
```

- `bleedBar = Math.max(0, pi - bleedTo)`.
- When no bleed is needed (primary solve feasible): `bleedTo = pi`,
  `bleedBar = 0`.
- `addHeTo`, `addO2To`, `topTo` and the `steps` running totals are all computed
  from `effectiveStart`.
- `reason` is set only when the blend is still infeasible after considering a
  bleed. The three existing "…draining required." strings are replaced, since a
  bleed is now attempted automatically: when a bleed makes the mix reachable
  there is no reason (feasible). When it remains unreachable, use a single
  message: `"Even a full drain can't reach this mix with this top-up gas — the
  target has less O₂ (or He) than the top-up gas provides."` The `det ≈ 0`
  message is unchanged.

### Edge cases

- `pi ≤ eps` (empty/near-empty start) and primary infeasible → cannot bleed;
  `bleedTo = pi`, `bleedBar = 0`, remains infeasible. (Also avoids divide-by-`pi`.)
- `|det| < 1e-9` → unchanged infeasible path; no bleed attempted.
- Real gas: Z factors are applied inside `solvePartials`, so both the primary
  and bleed solves use identical scaling; the two-point reconstruction stays
  exact because scaling by a constant preserves affineness.

## 2. Blend calculator UI (`BlendCalculator.tsx`)

When `result.bleedBar > 0.01`, prepend a single, non-reorderable list item to
the numbered fill sequence, before the mapped add-steps:

```tsx
{result.bleedBar > 0.01 && (
	<li>
		<span className='font-semibold'>Bleed down</span>
		{': to '}
		<span className='font-semibold'>
			{roundPressure(result.bleedTo, units.pressure)} {units.pressure}
		</span>
	</li>
)}
```

- The add-steps map is unchanged; their `toBar` values already start from
  `bleedTo` because the core function computed them from `effectiveStart`.
- The reorder control still operates only on `order` (`he`/`o2`/`top`) — the
  bleed is always first and is not reorderable.
- The infeasible branch (`result.reason`) now only shows for genuinely
  unreachable mixes (post-full-drain or `det ≈ 0`).

## 3. Blending Cost calculator (`BlendingCostCalculator.tsx`)

No code change. It reads `blend.pO2`/`blend.pHe`/`blend.feasible`/`blend.reason`.
Once `calculateBlend` returns a feasible post-bleed solution, the added-gas
volumes and cost reflect the gas added after bleeding, and the "draining
required" message disappears for solvable cases. No "wasted gas" line is added.

## 4. Tests (`src/lib/diveMath/blending.test.ts`)

- **Update** the existing "impossible blend that needs draining" and
  "drain-required when the start mix is too rich" cases: those that are solvable
  by bleeding now assert `feasible === true`, `bleedBar > 0`, `0 ≤ bleedTo < pi`,
  and that the recomputed final mix hits the target (recompose the mix from the
  step end-pressures / partials and check `fo2`/`fhe` within tolerance).
- **Add** cases:
  - Nitrox bleed: rich start (e.g. start EAN36 @ high pressure) topped with air
    to a leaner target — asserts a positive `bleedBar` and correct target mix.
  - Genuinely unreachable: target O₂ below the top-up O₂ fraction (e.g. target
    EAN18 with air top-up) — `feasible === false`, `reason` truthy, even though a
    bleed was considered.
  - Empty start (`startPressure = 0`) with an otherwise-infeasible target →
    `feasible === false`, `bleedBar === 0`.
  - No-bleed-needed happy path → `bleedBar === 0`, `bleedTo === startPressure`,
    `feasible === true`.
  - A trimix bleed case exercising both `pHe`/`pO2` bounds is desirable if it can
    be constructed simply; otherwise the nitrox case plus an existing trimix
    feasible case cover the paths.

## Non-goals

- No change to `topUpMix`/`gasMixing.ts` (that calculator reports the resulting
  mix from a fixed top-up; it does not target a mix, so bleed-to-target does not
  apply).
- No backend, schema, or API changes.
- No "wasted bled-off gas" cost accounting.
