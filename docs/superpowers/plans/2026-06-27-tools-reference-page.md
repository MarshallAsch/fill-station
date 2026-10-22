# Tools Reference Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a publicly-accessible `/tools/reference` page documenting the equations, algorithms, constants, and references behind every Dive Tool, so users can verify the math.

**Architecture:** A static server-component page composes three content section components (Fundamentals, Blending tools, Planning tools) plus a shared `Formula` presentational primitive. Content is hand-authored JSX transcribed faithfully from `src/lib/diveMath/`. Equations render as Unicode in monospace blocks — no math library.

**Tech Stack:** Next.js 16 App Router (server components), React 19, TypeScript, Tailwind v4.

## Global Constraints

- Prettier: single quotes, no semicolons, TABS, 80-char width.
- Theme tokens only (`text-text`, `text-light-text`, `border-border`, `bg-hover`, `text-accent`) — no hardcoded colors, no `dark:` variants.
- Static content: no `'use client'`, no data fetching, no new runtime dependency.
- Unicode math only (O₂, N₂, He, ×, ÷, ≈, ², ∫, →, ≤, ≥, ΔT, ρ, √, Σ); formulas inside `<Formula>` which scrolls horizontally — the page body never scrolls horizontally.
- Formulas must stay faithful to `src/lib/diveMath/`. MOD, both END models, the full Gas Requirements set, and the partial-pressure Blend 2×2 system must each appear as full `<Formula>` blocks.
- Reuse the `/tools/about` container/disclaimer pattern (`mx-auto max-w-3xl px-4 py-8`).

---

### Task 1: `Formula` primitive, page scaffold, Fundamentals, wiring

**Files:**
- Create: `src/components/Tools/reference/Formula.tsx`
- Create: `src/components/Tools/reference/ReferenceFundamentals.tsx`
- Create: `src/app/tools/reference/page.tsx`
- Modify: `src/proxy.ts` (add `/tools/reference` to `publicPages`)
- Modify: `src/app/tools/about/page.tsx` (add the "Equations & references →" link)

**Interfaces:**
- Produces:
  - `Formula` — `({ children: ReactNode }) => JSX` default export (monospace block).
  - `ReferenceFundamentals` — `() => JSX` default export (a `<section>`).
  - The route `/tools/reference` rendering the disclaimer + intro + links + `<ReferenceFundamentals />`.

- [ ] **Step 1: Create the `Formula` primitive**

Create `src/components/Tools/reference/Formula.tsx`:

```tsx
import { ReactNode } from 'react'

// A monospace equation block. Scrolls horizontally inside its own container so
// the page body never scrolls; preserves whitespace/newlines for multi-line math.
const Formula = ({ children }: { children: ReactNode }) => (
	<pre className='border-border bg-hover text-text my-2 overflow-x-auto rounded-md border p-3 font-mono text-sm whitespace-pre'>
		{children}
	</pre>
)

export default Formula
```

- [ ] **Step 2: Create the Fundamentals section**

Create `src/components/Tools/reference/ReferenceFundamentals.tsx`:

```tsx
import Formula from './Formula'

const ReferenceFundamentals = () => (
	<section className='mb-8'>
		<h2 className='text-text mb-3 text-xl font-semibold'>Fundamentals</h2>
		<p className='text-light-text mb-4 text-sm'>
			Shared models the tools build on. All internal math is SI (bar, metres,
			litres, °C); values convert to your chosen units only for display.
		</p>

		<h3 className='text-text mt-4 font-semibold'>Units &amp; constants</h3>
		<ul className='text-text my-2 list-disc space-y-1 pl-5 text-sm'>
			<li>Atmospheric pressure: 1.01325 bar (gauge = absolute − 1.01325).</li>
			<li>Air: O₂ = 0.209, N₂ = 0.791.</li>
			<li>
				Conversions: 14.5037738 psi/bar · 28.3168466 L/ft³ · 3.280839895 ft/m.
			</li>
		</ul>

		<h3 className='text-text mt-4 font-semibold'>Depth ↔ pressure</h3>
		<Formula>{`d₀ = 10 m/bar (salt water), 10.3 m/bar (fresh)
ATA = depth_m / d₀ + 1`}</Formula>
		<p className='text-light-text text-sm'>
			ATA is the absolute pressure at depth in atmospheres. Reference: hydrostatic
			pressure (~1 bar per 10 m of seawater).
		</p>

		<h3 className='text-text mt-4 font-semibold'>
			Real-gas compressibility (Z)
		</h3>
		<Formula>{`PV = Z·nRT          (Z = 1 for an ideal gas)
Z(P) = 1 + k·P      (P in absolute bar)
  k_O₂ = −0.0002   k_N₂ = +0.0002   k_He = +0.00025
Z_mix = fO₂·Z_O₂ + fHe·Z_He + fN₂·Z_N₂   (fN₂ = 1 − fO₂ − fHe)
gas content ∝ P_abs / Z`}</Formula>
		<p className='text-light-text text-sm'>
			Applied when the global real-gas setting is on. At ~200 bar O₂ ≈ 0.96,
			N₂ ≈ 1.04, He ≈ 1.05, dry air ≈ 1.03 — so a nominal AL80 (11.1 L × 207 bar)
			reads ~77–79 ft³ rather than the ideal 81.{' '}
			<span className='font-medium'>Approximation:</span> a first-order linear fit
			to published Z data near room temperature, not a full virial / NIST / AGA8
			model. Reference: real-gas law, compressibility-factor tables for O₂/N₂/He.
		</p>

		<h3 className='text-text mt-4 font-semibold'>Temperature &amp; hot fills</h3>
		<Formula>{`Gay-Lussac (fixed volume):  P / T = constant   (T in kelvin, K = 273.15)
Settle on cooling:  P_cold_abs = P_hot_abs × (T_cold / T_hot)
Fill hot to target: P_hot_abs  = P_cold_abs × (T_hot / T_cold)
Fill-rate heating:  ΔT = 0.7 × fillRate(bar/min)   (≥ 0)`}</Formula>
		<p className='text-light-text text-sm'>
			With temperatures set, a fill is computed to the hot pressure that settles
			to your cold target; “simple” mode uses a flat overfill % instead.{' '}
			<span className='font-medium'>Approximation:</span> the 0.7 °C per (bar/min)
			coefficient rolls cylinder thermal mass into one constant. Reference:
			Gay-Lussac’s / combined gas law.
		</p>
	</section>
)

export default ReferenceFundamentals
```

- [ ] **Step 3: Create the page**

Create `src/app/tools/reference/page.tsx`:

```tsx
import Link from 'next/link'
import ReferenceFundamentals from '@/components/Tools/reference/ReferenceFundamentals'

export default function ToolsReferencePage() {
	return (
		<div className='mx-auto max-w-3xl px-4 py-8'>
			<Link href='/tools' className='text-accent text-sm underline'>
				← Back to tools
			</Link>
			<h1 className='text-text mt-4 mb-2 text-3xl font-bold'>
				The math behind the tools
			</h1>
			<div className='border-border bg-hover text-text mb-4 rounded-md border p-3 text-sm'>
				<span className='font-semibold'>For reference only.</span> All results are
				estimates — independently verify and analyze every gas mix and dive plan
				before diving.
			</div>
			<p className='text-light-text mb-6 text-sm'>
				The equations, constants, and references behind each calculator, so you
				can check the math. See also the{' '}
				<Link href='/tools/about' className='text-accent underline'>
					tool overview
				</Link>
				.
			</p>

			<ReferenceFundamentals />
		</div>
	)
}
```

- [ ] **Step 4: Make the route public**

In `src/proxy.ts`, add `'/tools/reference'` to the `publicPages` array (it sits right after `'/tools/about'`):

```ts
const publicPages = [
	'/',
	'/about',
	'/contact',
	'/tools',
	'/tools/about',
	'/tools/reference',
]
```

(Keep whatever exact entries already exist; only add the one line. The array uses exact-match — `pathname === p`.)

- [ ] **Step 5: Link from the about page**

In `src/app/tools/about/page.tsx`, immediately after the disclaimer `<div>` (the one containing "For reference only.") and before the `{GROUPS.map(...)}`, add:

```tsx
			<p className='mb-6 text-sm'>
				<Link href='/tools/reference' className='text-accent underline'>
					Equations &amp; references →
				</Link>
			</p>
```

`Link` is already imported in that file. (If the disclaimer `<div>` already has a `mb-6`, leave it; the new `<p>` adds the link below it.)

- [ ] **Step 6: Build & lint**

Run: `npm run build && npm run lint`
Expected: build compiles, `/tools/reference` route is generated; lint 0 errors (11 pre-existing warnings unrelated).

- [ ] **Step 7: Commit**

```bash
git add src/components/Tools/reference/Formula.tsx src/components/Tools/reference/ReferenceFundamentals.tsx src/app/tools/reference/page.tsx src/proxy.ts src/app/tools/about/page.tsx
git commit -m "feat: add tools reference page scaffold + fundamentals"
```

---

### Task 2: Blending tools section

**Files:**
- Create: `src/components/Tools/reference/ReferenceBlendingTools.tsx`
- Modify: `src/app/tools/reference/page.tsx` (render it after Fundamentals)

**Interfaces:**
- Consumes: `Formula` from `./Formula`.
- Produces: `ReferenceBlendingTools` — `() => JSX` default export (a `<section>`).

- [ ] **Step 1: Create the Blending tools section**

Create `src/components/Tools/reference/ReferenceBlendingTools.tsx`:

```tsx
import Formula from './Formula'

const ReferenceBlendingTools = () => (
	<section className='mb-8'>
		<h2 className='text-text mb-3 text-xl font-semibold'>Blending tools</h2>

		<h3 className='text-text mt-4 font-semibold'>Cascade Fill</h3>
		<p className='text-text text-sm'>
			Fills a cylinder from a bank of storage bottles, lowest-pressure bottle
			first, by free equalization (no pump). Each bottle equalizes with the
			cylinder until pressures meet.
		</p>
		<Formula>{`Per bank (skipped if bank ≤ target), mole-weighted mean:
ideal:    eqAbs = (P_target_abs·V_target + P_bank_abs·V_bank) / (V_target + V_bank)
real gas: w = V / Z(air, P_abs)
          eqAbs = (P_target_abs·w_target + P_bank_abs·w_bank) / (w_target + w_bank)
P_final = eqAbs − 1.01325`}</Formula>
		<ul className='text-text my-2 list-disc space-y-1 pl-5 text-sm'>
			<li>Banks used lowest-pressure first to preserve high-pressure gas.</li>
			<li>Air assumed (fO₂ = 0.209) for the compressibility weighting.</li>
		</ul>
		<p className='text-light-text text-sm'>
			Reference: conservation of moles on free equalization; real gas via
			Fundamentals.
		</p>

		<h3 className='text-text mt-4 font-semibold'>Nitrox Stick</h3>
		<p className='text-text text-sm'>
			Continuous blending: how much pure O₂ to bleed into an air stream for a
			target nitrox fraction, and the O₂ drawn from supply for a fill.
		</p>
		<Formula>{`O₂ flow      = airFlow × (targetFO₂ − 0.209) / (1 − targetFO₂)
added (surface L) = tankVol × (finalP − startP)
O₂ fraction  = (targetFO₂ − 0.209) / (1 − 0.209)
O₂ volume    = added × O₂ fraction
supply drop  = O₂ volume / supplyVol`}</Formula>
		<ul className='text-text my-2 list-disc space-y-1 pl-5 text-sm'>
			<li>Returns 0 when the target ≤ 0.209 (no enrichment needed).</li>
		</ul>
		<p className='text-light-text text-sm'>
			Reference: partial pressure of O₂ added to air (Dalton’s law).
		</p>

		<h3 className='text-text mt-4 font-semibold'>Blend (PP)</h3>
		<p className='text-text text-sm'>
			Partial-pressure blend to a target O₂/He mix: solves for the pure-O₂ and
			pure-He pressures to add, then tops up with air or a chosen travel gas.
		</p>
		<Formula>{`pi = start pressure   pf = final pressure   rem = pf − pi
bHe = targetFhe·pf − startFhe·pi − topFhe·rem
bO₂ = targetFo2·pf − startFo2·pi − topFo2·rem
det = (1 − topFhe)(1 − topFo2) − (topFhe)(topFo2)
pHe = ( bHe·(1 − topFo2) + topFhe·bO₂ ) / det
pO₂ = ( (1 − topFhe)·bO₂ + topFo2·bHe ) / det
real gas:  pHe ×= Z(He, pf)   pO₂ ×= Z(O₂, pf)   (pf = final pressure)
pTop = pf − pi − pHe − pO₂`}</Formula>
		<ul className='text-text my-2 list-disc space-y-1 pl-5 text-sm'>
			<li>
				Infeasible if |det| &lt; 1e-9 (top-up gas can’t reach the target) or any
				of pHe / pO₂ / pTop &lt; 0 (would require draining the cylinder).
			</li>
		</ul>
		<p className='text-light-text text-sm'>
			Reference: Dalton’s law of partial pressures; partial-pressure blending.
		</p>

		<h3 className='text-text mt-4 font-semibold'>Topping Up</h3>
		<p className='text-text text-sm'>
			Given a starting gas and a top-up gas filled to a target pressure, the
			resulting mix — a mole-weighted blend of the two.
		</p>
		<Formula>{`finalMix = r·startMix + (1 − r)·topMix
  r = start gas's share of the final gas content
ideal:    r = startAbs / finalAbs
real gas: content ∝ P_abs / Z
          r = (startAbs / Z_start) / (finalAbs / Z_final)
          solved by a 10-step fixed point (Z_final depends on the final mix)`}</Formula>
		<ul className='text-text my-2 list-disc space-y-1 pl-5 text-sm'>
			<li>If final ≤ start, nothing is added and the start mix is returned.</li>
		</ul>
		<p className='text-light-text text-sm'>
			Reference: Dalton’s law; real gas via Fundamentals.
		</p>

		<h3 className='text-text mt-4 font-semibold'>Blending Cost</h3>
		<p className='text-text text-sm'>
			Prices a partial-pressure blend by multiplying each component’s consumed gas
			volume (O₂, He, top-up) from the Blend (PP) result by its unit price. No
			separate dive-math model — see Blend (PP) for the volumes.
		</p>

		<h3 className='text-text mt-4 font-semibold'>Booster</h3>
		<p className='text-text text-sm'>
			Models an air-driven O₂ booster pump: free equalization first, then the
			drive-air consumed, fill time, and cycle rate for the boosted portion.
		</p>
		<Formula>{`maxOutput = ratio × driveP            (stall ceiling; infeasible if target > maxOutput)
free equalization (supply ⇄ receiver), mole-weighted like Cascade
drive air for q surface L (trapezoidal integral, 400 steps):
  receiverAbs(x) = boostStart_abs + x / receiverVol
  inletAbs(x)    = min(supplyStart_abs − x / supplyVol, cap)
  integrand(x)   = (receiverAbs/inletAbs) × Z(inletAbs)/Z(receiverAbs)
  driveAirL = ∫₀^q integrand dx
gasPerCycle  = ((driveSwept/ratio) × (supplyAbs/1.01325)) / Z_supply
boosterRate  = maxCpm · gasPerCycle / receiverVol
fillTime     = equalization time + boost time   (both rate-limited)`}</Formula>
		<ul className='text-text my-2 list-disc space-y-1 pl-5 text-sm'>
			<li>Drive pressure ramps to only what the back-pressure needs.</li>
			<li>Fill is capped at the max O₂ fill rate; an undersized storage buffer + compressor can stall the pump.</li>
			<li>
				<span className='font-medium'>Approximation:</span> trapezoidal numeric
				integration; geometric swept-volume estimate.
			</li>
		</ul>
		<p className='text-light-text text-sm'>
			Reference: real-gas law; pump displacement ratio; mole balance on transfer.
		</p>
	</section>
)

export default ReferenceBlendingTools
```

- [ ] **Step 2: Render it on the page**

In `src/app/tools/reference/page.tsx`, add the import after the Fundamentals import:

```tsx
import ReferenceBlendingTools from '@/components/Tools/reference/ReferenceBlendingTools'
```

and render it immediately after `<ReferenceFundamentals />`:

```tsx
			<ReferenceFundamentals />
			<ReferenceBlendingTools />
```

- [ ] **Step 3: Build & lint**

Run: `npm run build && npm run lint`
Expected: build clean; lint 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Tools/reference/ReferenceBlendingTools.tsx src/app/tools/reference/page.tsx
git commit -m "feat: add blending tools section to the reference page"
```

---

### Task 3: Planning tools section + full gate

**Files:**
- Create: `src/components/Tools/reference/ReferencePlanningTools.tsx`
- Modify: `src/app/tools/reference/page.tsx` (render it last)

**Interfaces:**
- Consumes: `Formula` from `./Formula`.
- Produces: `ReferencePlanningTools` — `() => JSX` default export (a `<section>`).

- [ ] **Step 1: Create the Planning tools section**

Create `src/components/Tools/reference/ReferencePlanningTools.tsx`:

```tsx
import Formula from './Formula'

const ReferencePlanningTools = () => (
	<section className='mb-8'>
		<h2 className='text-text mb-3 text-xl font-semibold'>Planning tools</h2>

		<h3 className='text-text mt-4 font-semibold'>MOD / END</h3>
		<p className='text-text text-sm'>
			Maximum Operating Depth for a ppO₂ ceiling, and Equivalent Narcotic Depth
			for a mix at a planned depth.
		</p>
		<Formula>{`MOD (m) = (ppO₂_limit / fO₂ − 1) × d₀          (ppO₂ = fO₂ × ATA)

END, N₂-only model:     END (m) = (depth + d₀) × (fN₂ / 0.791) − d₀
END, O₂-narcotic model: END (m) = (depth + d₀) × (1 − fHe) − d₀
  fN₂ = 1 − fO₂ − fHe`}</Formula>
		<p className='text-light-text text-sm'>
			Reference: Dalton’s law (ppO₂); narcotic-depth conventions (N₂-only vs O₂
			also narcotic).
		</p>

		<h3 className='text-text mt-4 font-semibold'>Best Mix</h3>
		<p className='text-text text-sm'>
			The richest O₂ fraction allowed at a depth, and the He fraction for a target
			END — the inverse of MOD/END.
		</p>
		<Formula>{`bestFO₂ = min(1, ppO₂_limit / ATA)
bestFHe = max(0, 1 − (targetEND + d₀) / (depth + d₀))   (N₂-only END)
fN₂     = max(0, 1 − fO₂ − fHe)`}</Formula>
		<p className='text-light-text text-sm'>
			Reference: inverse of MOD / END (Dalton’s law; narcosis convention).
		</p>

		<h3 className='text-text mt-4 font-semibold'>EAD</h3>
		<p className='text-text text-sm'>
			Equivalent Air Depth — the air depth with the same N₂ partial pressure, for
			looking up air decompression tables.
		</p>
		<Formula>{`EAD (m) = (depth + d₀) × (fN₂ / 0.791) − d₀     (fN₂ = 1 − fO₂ − fHe)`}</Formula>
		<p className='text-light-text text-sm'>
			Reference: standard Equivalent Air Depth formula.
		</p>

		<h3 className='text-text mt-4 font-semibold'>Gas Density</h3>
		<p className='text-text text-sm'>
			Breathing-gas density at depth, flagging mixes over the recommended and hard
			limits.
		</p>
		<Formula>{`component densities (0 °C, 1 atm): O₂ 1.42897, N₂ 1.2506, He 0.17846 g/L
ρ_surface = fO₂·1.42897 + fN₂·1.2506 + fHe·0.17846
ρ_depth   = ρ_surface × ATA
depthForDensity = (ρ_target / ρ_surface − 1) × d₀
limits: recommended ≤ 5.2 g/L, hard ≤ 6.3 g/L`}</Formula>
		<p className='text-light-text text-sm'>
			Reference: gas density scales with absolute pressure; the 5.2 g/L
			recommended and 6.3 g/L hard limits per Anthony &amp; Mitchell, widely cited
			in technical-diving guidance.
		</p>

		<h3 className='text-text mt-4 font-semibold'>CNS / OTU</h3>
		<p className='text-text text-sm'>
			Cumulative oxygen toxicity across a day: CNS clock percentage and pulmonary
			OTUs over multiple dive segments and surface intervals.
		</p>
		<Formula>{`NOAA single-exposure CNS limits (ppO₂ ata → max minutes):
  0.6→720  0.7→570  0.8→450  0.9→360  1.0→300  1.1→240
  1.2→210  1.3→180  1.4→150  1.5→120  1.6→45
  (linear interpolation between rows; < 0.6 → no limit; ≥ 1.6 → 45)
segment CNS% = minutes / limit × 100
OTU = minutes × ((ppO₂ − 0.5) / 0.5)^0.83      (0 when ppO₂ ≤ 0.5)
surface interval: CNS ×= 0.5^(surfaceMin / 90)   (90-min half-time)`}</Formula>
		<p className='text-light-text text-sm'>
			Reference: NOAA Diving Manual — oxygen exposure limits, the CNS clock and
			90-minute half-time, and the OTU / UPTD power formula.
		</p>

		<h3 className='text-text mt-4 font-semibold'>Gas Requirements</h3>
		<p className='text-text text-sm'>
			Surface gas consumption (SAC/RMV) from a logged dive (or entered directly),
			planned-segment gas, and the rock-bottom reserve to bring a team up safely.
		</p>
		<Formula>{`SAC (bar/min)   = (startP − endP) / minutes / ATA(avgDepth)
RMV (L/min)     = SAC × tankVolume
gas needed (L)  = RMV × ATA(depth) × minutes
rock-bottom (L) = teamSize × [ stressedRMV × ATA(depth/2) × (depth / ascentRate)
                             + Σ stressedRMV × ATA(stopDepth) × stopMinutes ]
                  stressedRMV = RMV × stressFactor
min gas (bar)   = minGasL / tankVolume`}</Formula>
		<ul className='text-text my-2 list-disc space-y-1 pl-5 text-sm'>
			<li>The stress factor multiplies RMV for the emergency ascent only.</li>
		</ul>
		<p className='text-light-text text-sm'>
			Reference: standard SAC/RMV definitions; rock-bottom / minimum-gas reserve
			planning (technical-diving convention).
		</p>

		<hr className='border-border my-6' />
		<h2 className='text-text mb-2 text-xl font-semibold'>
			Approximations &amp; limitations
		</h2>
		<ul className='text-light-text my-2 list-disc space-y-1 pl-5 text-sm'>
			<li>Real gas uses a first-order linear Z fit, not a virial / NIST model.</li>
			<li>Hot-fill heating uses a single 0.7 °C per (bar/min) coefficient.</li>
			<li>Fresh water uses d₀ = 10.3 m/bar; salt uses 10.</li>
			<li>The booster uses numeric (trapezoidal) integration and a geometric swept-volume estimate.</li>
			<li>All results are estimates — verify independently before diving.</li>
		</ul>
	</section>
)

export default ReferencePlanningTools
```

- [ ] **Step 2: Render it on the page**

In `src/app/tools/reference/page.tsx`, add the import:

```tsx
import ReferencePlanningTools from '@/components/Tools/reference/ReferencePlanningTools'
```

and render it after `<ReferenceBlendingTools />`:

```tsx
			<ReferenceBlendingTools />
			<ReferencePlanningTools />
```

- [ ] **Step 3: Full gate**

Run: `npm test && npm run build && npm run lint && npm run knip`
Expected:
- Tests unchanged and green (no dive-math change).
- Build clean; `/tools/reference` renders all three sections.
- Lint 0 errors (11 pre-existing warnings OK).
- Knip: no new findings — `Formula`, `ReferenceFundamentals`, `ReferenceBlendingTools`, `ReferencePlanningTools` are all imported (the three sections by the page, `Formula` by all three).

Manually: visit `/tools/reference` (logged out, to confirm it’s public) — all sections render, formulas are readable and scroll horizontally on narrow screens without scrolling the page body; the `/tools/about` page shows the "Equations & references →" link.

- [ ] **Step 4: Commit**

```bash
git add src/components/Tools/reference/ReferencePlanningTools.tsx src/app/tools/reference/page.tsx
git commit -m "feat: add planning tools section + approximations to the reference page"
```

---

## Notes for the implementer

- Transcribe the JSX verbatim — the formulas were cross-checked against `src/lib/diveMath/`. If anything looks wrong, re-read the source module and flag it rather than silently “fixing” the text.
- `<Formula>` children are template literals with real newlines (`whitespace-pre` preserves them). Keep the backtick strings intact; Prettier won’t reflow inside them.
- Unicode characters (O₂, ÷, ∫, ρ, ², Σ, →, ≤, ≥) must be the actual glyphs, not HTML entities, inside the template literals; in JSX text use entities where required (`&amp;`, `&lt;`).
- Do not add `'use client'` to any of these files — they are static server components.
