# Tools Rounding, Persistence & Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consistent display rounding, localStorage persistence of tool inputs, a CNS/OTU limits sidebar, gas-requirements direct-SAC + unit fix + tooltip, and the nitrox compressor-intake default fix — across the Dive Tools.

**Architecture:** A pure `format.ts` rounding module + a `usePersistedState` hook (and persisted unit-state variants) are built first, then each tool is swept to use them. No dive-math algorithm changes — only display formatting, a new input mode, and persisted state. Spec: `docs/superpowers/specs/2026-06-27-tools-polish-persistence-design.md`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 (theme tokens), Vitest.

## Global Constraints

- Prettier: single quotes, no semicolons, TABS, 80-char width. Run `npm run lint` after each task.
- Vitest: import `{ describe, it, expect }` from `'vitest'`; **no `@/` alias** — files imported (transitively) by a `*.test.ts` use relative imports.
- Theme tokens only (no hardcoded colors / `dark:`).
- Rounding rules: pressure psi→nearest 1, bar→nearest 0.1; volume cf→nearest 1, l→nearest 0.1; SAC/RMV cf→nearest 0.01, l→nearest 0.1; temperature→nearest 0.1; O₂/He output %→nearest 0.1; depth (MOD/ceiling) m→floor 0.1, ft→floor 1; mix shows `o2/he` but drops `/0` when He is 0.
- Persistence: localStorage, keys namespaced `fillstation.tools.<key>`, store the **display value**, JSON-serialised, best-effort (malformed/absent → default). SSR-safe: read in a mount effect (like `UnitsProvider`).
- No dive-math algorithm change; existing Vitest suite stays green.

---

### Task 1: `format.ts` rounding/formatting module

**Files:**
- Create: `src/lib/diveMath/format.ts`
- Create: `src/lib/diveMath/format.test.ts`

**Interfaces:**
- Consumes: `fromBar`, `fromLiters`, `fromMeters`, `PressureUnit`, `VolumeUnit`, `DepthUnit` from `./units`.
- Produces: `roundPressure(bar, unit)`, `roundVolume(litres, unit)`, `roundSac(lpm, unit)`, `roundTemp(displayTemp)`, `roundPercent(pct)`, `roundDepthDown(m, unit)`, `fmtMix(o2Pct, hePct)` (string).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/diveMath/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
	roundPressure,
	roundVolume,
	roundSac,
	roundTemp,
	roundPercent,
	roundDepthDown,
	fmtMix,
} from './format'

describe('format rounding', () => {
	it('roundPressure: psi → 1, bar → 0.1', () => {
		// 200 bar = 2900.75 psi → 2901; bar 200 → 200; 13.84 bar → 13.8
		expect(roundPressure(200, 'psi')).toBe(2901)
		expect(roundPressure(13.84, 'bar')).toBeCloseTo(13.8, 6)
	})
	it('roundVolume: cf → 1, l → 0.1', () => {
		// 100 L = 3.531 cf → 4; 100 L → 100; 12.34 L → 12.3
		expect(roundVolume(100, 'cf')).toBe(4)
		expect(roundVolume(12.34, 'l')).toBeCloseTo(12.3, 6)
	})
	it('roundSac: cf → 0.01, l → 0.1', () => {
		// 14 L/min = 0.4944 cf/min → 0.49; 14.06 L/min → 14.1
		expect(roundSac(14, 'cf')).toBeCloseTo(0.49, 6)
		expect(roundSac(14.06, 'l')).toBeCloseTo(14.1, 6)
	})
	it('roundTemp / roundPercent: nearest 0.1', () => {
		expect(roundTemp(20.04)).toBeCloseTo(20, 6)
		expect(roundPercent(31.96)).toBeCloseTo(32, 6)
		expect(roundPercent(31.94)).toBeCloseTo(31.9, 6)
	})
	it('roundDepthDown: floors (m → 0.1, ft → 1)', () => {
		// 30.18 m → 30.1; 30 m = 98.4 ft → 98
		expect(roundDepthDown(30.18, 'm')).toBeCloseTo(30.1, 6)
		expect(roundDepthDown(30, 'ft')).toBe(98)
	})
	it('fmtMix: drops /0 when no helium', () => {
		expect(fmtMix(32, 0)).toBe('32')
		expect(fmtMix(21, 35)).toBe('21/35')
	})
})
```

- [ ] **Step 2: Run, expect failure**

Run: `npx vitest run src/lib/diveMath/format.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `format.ts`**

```ts
import {
	DepthUnit,
	PressureUnit,
	VolumeUnit,
	fromBar,
	fromLiters,
	fromMeters,
} from './units'

const roundTo = (value: number, step: number) =>
	Math.round(value / step) * step
const floorTo = (value: number, step: number) =>
	Math.floor(value / step) * step

// Pressure (display units): psi → nearest 1, bar → nearest 0.1.
export function roundPressure(bar: number, unit: PressureUnit): number {
	const v = fromBar(bar, unit)
	return unit === 'psi' ? Math.round(v) : roundTo(v, 0.1)
}

// Free-gas volume: cf → nearest 1, l → nearest 0.1.
export function roundVolume(litres: number, unit: VolumeUnit): number {
	const v = fromLiters(litres, unit)
	return unit === 'cf' ? Math.round(v) : roundTo(v, 0.1)
}

// SAC / RMV rate (volume per minute): cf → nearest 0.01, l → nearest 0.1.
export function roundSac(lpm: number, unit: VolumeUnit): number {
	const v = fromLiters(lpm, unit)
	return unit === 'cf' ? roundTo(v, 0.01) : roundTo(v, 0.1)
}

// Temperature (already in display units): nearest 0.1.
export function roundTemp(displayTemp: number): number {
	return roundTo(displayTemp, 0.1)
}

// O2/He output percentage: nearest 0.1.
export function roundPercent(pct: number): number {
	return roundTo(pct, 0.1)
}

// Depth (MOD / ceiling): floor to m → 0.1, ft → 1 (never overstate a max depth).
export function roundDepthDown(m: number, unit: DepthUnit): number {
	const v = fromMeters(m, unit)
	return unit === 'ft' ? Math.floor(v) : floorTo(v, 0.1)
}

// Mix label: "21/35" with helium, "32" without (drop the /0).
export function fmtMix(o2Pct: number, hePct: number): string {
	const o2 = Math.round(o2Pct)
	return hePct > 0 ? `${o2}/${Math.round(hePct)}` : `${o2}`
}
```

- [ ] **Step 4: Run, expect pass**

Run: `npx vitest run src/lib/diveMath/format.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/diveMath/format.ts src/lib/diveMath/format.test.ts
git commit -m "feat: add unit-aware display rounding/formatting helpers"
```

---

### Task 2: `toLiters` + persistence hooks

**Files:**
- Modify: `src/lib/diveMath/units.ts` (+ `units.test.ts`)
- Create: `src/components/Tools/usePersistedState.ts`
- Modify: `src/components/Tools/useUnitState.ts`

**Interfaces:**
- Produces: `toLiters(value, VolumeUnit)`; `usePersistedState<T>(key, initial): [T, (v: T | ((p:T)=>T)) => void]`; `usePersistedPressure(key, initial)`, `usePersistedDepth(key, initial)`, `usePersistedAirFlow(key, initial)` returning `[number, (n:number)=>void]`.

- [ ] **Step 1: Add `toLiters` (+ test) to `units.ts`**

Append to `src/lib/diveMath/units.ts`:

```ts
export function toLiters(value: number, unit: VolumeUnit): number {
	return unit === 'cf' ? value * L_PER_CF : value
}
```

Append to `src/lib/diveMath/units.test.ts`:

```ts
import { toLiters } from './units'

describe('toLiters', () => {
	it('cf → litres, l identity', () => {
		expect(toLiters(1, 'cf')).toBeCloseTo(28.3168466, 6)
		expect(toLiters(50, 'l')).toBe(50)
	})
})
```

Run: `npx vitest run src/lib/diveMath/units.test.ts` → PASS.

- [ ] **Step 2: Implement `usePersistedState.ts`**

```ts
'use client'

import { useEffect, useState } from 'react'

const PREFIX = 'fillstation.tools.'

// localStorage-backed useState. SSR-safe: starts from `initial`, hydrates from
// storage on mount, persists on every change. Supports updater functions so it's
// a drop-in for useState (incl. arrays/objects).
export function usePersistedState<T>(
	key: string,
	initial: T,
): [T, (v: T | ((prev: T) => T)) => void] {
	const [value, setValue] = useState<T>(initial)
	useEffect(() => {
		try {
			const raw = localStorage.getItem(PREFIX + key)
			// eslint-disable-next-line react-hooks/set-state-in-effect
			if (raw != null) setValue(JSON.parse(raw) as T)
		} catch {
			// ignore malformed storage
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	const set = (v: T | ((prev: T) => T)) => {
		setValue((prev) => {
			const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
			try {
				localStorage.setItem(PREFIX + key, JSON.stringify(next))
			} catch {
				// ignore storage failures
			}
			return next
		})
	}
	return [value, set]
}
```

- [ ] **Step 3: Add persisted unit hooks to `useUnitState.ts`**

`useUnitState.ts` has a private `useConverted(initial, unit, toSI, fromSI, decimals)` built on `useState`. Add a persisted twin and three exports. Replace the `useState` inside the converted logic with `usePersistedState` for the persisted variants:

```ts
import { usePersistedState } from './usePersistedState'

function usePersistedConverted<U>(
	key: string,
	initial: number,
	unit: U,
	toSI: (v: number, u: U) => number,
	fromSI: (v: number, u: U) => number,
	decimals: number,
): [number, (n: number) => void] {
	const [value, setValue] = usePersistedState<number>(key, initial)
	const prev = useRef(unit)
	useEffect(() => {
		if (prev.current !== unit) {
			const factor = 10 ** decimals
			const from = prev.current
			prev.current = unit
			setValue((v) => Math.round(fromSI(toSI(v, from), unit) * factor) / factor)
		}
	}, [unit, decimals, toSI, fromSI, setValue])
	return [value, setValue]
}

export function usePersistedPressure(key: string, initial: number) {
	const { units } = useUnits()
	return usePersistedConverted(key, initial, units.pressure, toBar, fromBar, 0)
}
export function usePersistedDepth(key: string, initial: number) {
	const { units } = useUnits()
	return usePersistedConverted(key, initial, units.depth, toMeters, fromMeters, 0)
}
export function usePersistedAirFlow(key: string, initial: number) {
	const { units } = useUnits()
	return usePersistedConverted(key, initial, units.airFlow, toLpm, fromLpm, 1)
}
```

(`useRef` is already imported in `useUnitState.ts`; if not, add it.)

- [ ] **Step 4: Verify build + lint + tests**

Run: `npm test && npm run build && npm run lint`
Expected: all pass (the new units test included; hooks compile though not yet consumed).

- [ ] **Step 5: Commit**

```bash
git add src/lib/diveMath/units.ts src/lib/diveMath/units.test.ts src/components/Tools/usePersistedState.ts src/components/Tools/useUnitState.ts
git commit -m "feat: add toLiters and localStorage-backed tool-state hooks"
```

---

## Per-tool sweep (Tasks 3–9)

Each per-tool task applies BOTH:
1. **Persistence** — swap every `useState(x)` → `usePersistedState('<tool>.<field>', x)` and every `usePressureState/useDepthState/useAirFlowState(x)` → the `usePersisted*` twin with a key. Keys: `<toolPrefix>.<field>` (prefixes below). Persisted hooks are imported from `./usePersistedState` and `./useUnitState`.
2. **Rounding** — replace each displayed value's `Math.round(fromBar(x, units.pressure))` / `Math.round(fromLiters(x, units.volume))` / `.toFixed(n)` with the matching `format.ts` helper (`roundPressure`/`roundVolume`/`roundSac`/`roundTemp`/`roundPercent`/`roundDepthDown`), and mix labels rendered as `o2/he` with `fmtMix`. Import the helpers from `@/lib/diveMath/format`.

Pattern examples (apply throughout):
- `{Math.round(fromBar(bar, units.pressure))} {units.pressure}` → `{roundPressure(bar, units.pressure)} {units.pressure}`
- `{Math.round(fromLiters(l, units.volume))} {units.volume}` → `{roundVolume(l, units.volume)} {units.volume}`
- `{x.toFixed(1)} °{units.temp}` → `{roundTemp(x)} °{units.temp}`
- a `p()` helper that does `Math.round(fromBar(...))` → redefine as `roundPressure(bar, units.pressure)`.

No `calculate*` inputs change. After each task: `npm run build && npm run lint` clean.

---

### Task 3: Booster — rounding + persistence

**Files:** Modify `src/components/Tools/BoosterCalculator.tsx`.

- [ ] **Step 1: Persist state.** Key prefix `b.`. Swap: `ratio`→`usePersistedState('b.ratio',30)`; `driveP`→`usePersistedPressure('b.driveP',120)`; `o2Pct`→`usePersistedState('b.o2',100)`; `hePct`→`usePersistedState('b.he',0)`; `twoStage`→`usePersistedState('b.twoStage',false)`; `regulatedInlet`→`usePersistedPressure('b.reg',150)`; `driveSwept`→`usePersistedState('b.swept',0)`; `maxCpm`→`usePersistedState('b.cpm',0)`; `supplyVol`→`usePersistedState('b.supplyVol',50)`; `supplyStart`→`usePersistedPressure('b.supplyStart',2900)`; `supplyWorking`→`usePersistedPressure('b.supplyWorking',2900)`; `receiverVol`→`usePersistedState('b.recVol',5.7)`; `receiverStart`→`usePersistedPressure('b.recStart',0)`; `receiverWorking`→`usePersistedPressure('b.recWorking',3000)`; `target`→`usePersistedPressure('b.target',3000)`; `maxFillRate`→`usePersistedPressure('b.fillRate',300)`; `compressorRate`→`usePersistedState('b.compRate',0)`; `storageGal`→`usePersistedState('b.storageGal',0)`; `storageMax`→`usePersistedPressure('b.storageMax',175)`; `storageMin`→`usePersistedPressure('b.storageMin',125)`.

- [ ] **Step 2: Rounding.** Replace the `p` helper to use `roundPressure`; `vol`→`roundVolume`; `flow` (drive-air rate, free L/min — a rate, use `roundSac`? No: drive-air rate and storage draw are flow magnitudes, not SAC — keep `roundVolume` semantics: cf→1, l→0.1, so use `roundVolume(lpm, units.airFlow)`... airFlow unit is lpm/cfm, not VolumeUnit). For the airflow-unit values (`units.airFlow`), keep the existing `Math.round(fromLpm(...))` — airFlow rounding isn't in the spec's quantity list, leave as-is. Apply `roundPressure`/`roundVolume` only to pressure/volume displays (eq pressure, drive air consumed, process gas, final supply, drive-pressure range). Import `roundPressure`, `roundVolume` from `@/lib/diveMath/format`.

- [ ] **Step 3:** `npm run build && npm run lint` → clean. Commit: `feat: rounding + persistence for the booster tool`.

---

### Task 4: Cascade — rounding + persistence

**Files:** Modify `src/components/Tools/CascadeCalculator.tsx`.

- [ ] **Step 1: Persist state.** Key prefix `cas.`. `banks`→`usePersistedState('cas.banks', [{volume:50,pressure:3000,working:3000}])` (array persists as JSON); `targetVolume`→`usePersistedState('cas.targetVol',5.7)`; `startPressure`→`usePersistedPressure('cas.start',500)`; `desiredPressure`→`usePersistedPressure('cas.desired',3000)`; `fillWorking`→`usePersistedPressure('cas.fillWorking',3000)`; `water`/other simple state → `usePersistedState('cas.<field>', default)`.

- [ ] **Step 2: Rounding.** `p` helper → `roundPressure(bar, units.pressure)`; any free-gas volume → `roundVolume`. The `CascadeCylinders` viz already uses `fromBar`-derived display values — leave its internal SVG scaling, but its pressure labels round via `Math.round` inside the component; update `CascadeCylinders.tsx` label rounding to `roundPressure` only if it shows pressures (it shows `startP→endP` already in display units — wrap with `Math.round` is fine there OR `roundPressure` if passed bar; keep consistent: leave CascadeCylinders as-is since it receives already-display values and rounds to integer, acceptable). Focus rounding on the result text (final pressure, residuals).

- [ ] **Step 3:** Build + lint → clean. Commit: `feat: rounding + persistence for the cascade tool`.

---

### Task 5: Blend — rounding + persistence + fmtMix

**Files:** Modify `src/components/Tools/BlendCalculator.tsx`.

- [ ] **Step 1: Persist state.** Key prefix `bl.`. `startPressure`→`usePersistedPressure('bl.start',0)`; `startO2`→`usePersistedState('bl.startO2',21)`; `startHe`→`usePersistedState('bl.startHe',0)`; `finalPressure`→`usePersistedPressure('bl.final',3000)`; `targetO2`→`usePersistedState('bl.targetO2',32)`; `targetHe`→`usePersistedState('bl.targetHe',0)`; `topO2`→`usePersistedState('bl.topO2',21)`; `topHe`→`usePersistedState('bl.topHe',0)`; `order`→`usePersistedState('bl.order',['he','o2','top'])`.

- [ ] **Step 2: Rounding + fmtMix.** Pressures in the steps/results → `roundPressure`. Where a mix is shown as `${o2}/${he}` (e.g. a start/target/top label), use `fmtMix(o2, he)` so a 0-He mix shows `32` not `32/0`. Import `roundPressure`, `fmtMix`.

- [ ] **Step 3:** Build + lint → clean. Commit: `feat: rounding + persistence for the blend tool`.

---

### Task 6: Nitrox — default fix + rounding + persistence

**Files:** Modify `src/components/Tools/NitroxStickCalculator.tsx`.

- [ ] **Step 1: Default + persist.** Key prefix `ns.`. `airFlow`→`usePersistedAirFlow('ns.airFlow', 5)` (the 100→**5** default fix); `tankVolume`→`usePersistedState('ns.tankVol',11.1)`; `startPressure`→`usePersistedPressure('ns.start',0)`; `finalPressure`→`usePersistedPressure('ns.final',3000)`; `workingPressure`→`usePersistedPressure('ns.working',3000)`; `supplyVolume`→`usePersistedState('ns.supplyVol',49)`; the target-O₂ state (`targetO2`/`targetFo2`) → `usePersistedState('ns.targetO2', <keep the file's existing initial value verbatim>)` (read it from the current `useState` call; do not change the number, only wrap it).

- [ ] **Step 2: Rounding.** O₂ flow-rate display (it's in the airFlow unit — leave its existing rounding) ; pressures → `roundPressure`; any volume → `roundVolume`; the ΔT note already uses `HotFillNote` (rounds internally). Import the helpers used.

- [ ] **Step 3:** Build + lint → clean. Commit: `feat: nitrox default 5 CFM, rounding + persistence`.

---

### Task 7: Gas requirements — SAC mode, unit fix, tooltip, rounding + persistence

**Files:** Modify `src/components/Tools/GasRequirementsCalculator.tsx`.

- [ ] **Step 1: Persist state + add SAC mode.** Key prefix `gr.`. Persist all inputs (`water`,`tankVol`,`startP`,`endP`,`logMinutes`,`logDepth`,`planDepth`,`planMinutes`,`ascentRate`,`stopDepth`,`stopMinutes`,`stress`,`team`) via the persisted hooks. Add `const [sacMode, setSacMode] = usePersistedState<'dive'|'direct'>('gr.sacMode','dive')` and `const [directRmv, setDirectRmv] = usePersistedState('gr.directRmv', 14)` (display = `{units.volume}/min`). Add a `RadioGroup` for `sacMode` ('From a logged dive' / 'Enter SAC/RMV directly'). When `sacMode==='direct'`, hide the start/end/time/avg-depth block and compute `const rmvLpm = toLiters(directRmv, units.volume)`; else use the existing `rmv({...})`.

- [ ] **Step 2: Unit fix + tooltip + rounding.** Replace `RMV: {rmvLpm.toFixed(1)} L/min` with `RMV: {roundSac(rmvLpm, units.volume)} {units.volume}/min`. Gas-volume results → `roundVolume`; min-gas pressure → `roundPressure`. Add a `tooltip` to the stress-factor `NumberInput`: `Multiplies your breathing rate (RMV) for the emergency ascent only — e.g. 2 = breathing twice as fast under stress. Affects the rock-bottom reserve, not the planned-dive gas.` Import `toLiters` from `@/lib/diveMath/units` and `roundSac`/`roundVolume`/`roundPressure` from `@/lib/diveMath/format`.

- [ ] **Step 3:** Build + lint → clean. Commit: `feat: gas-requirements direct SAC, unit fix, tooltip, rounding + persistence`.

---

### Task 8: Oxygen exposure — CNS/OTU limits sidebar + rounding + persistence

**Files:** Modify `src/lib/diveMath/oxygenExposure.ts` (export the table), `src/components/Tools/OxygenExposureCalculator.tsx`; Create `src/components/Tools/OxygenLimitsNote.tsx`.

- [ ] **Step 1: Export the NOAA table.** In `oxygenExposure.ts`, change `const CNS_TABLE` to `export const CNS_TABLE` so the sidebar can iterate it (no value change).

- [ ] **Step 2: Implement `OxygenLimitsNote.tsx`.** A FormulaPanel-style `<aside className='border-border bg-surface h-fit rounded-md border p-4'>` titled "Standard O₂ exposure limits": a small table mapping each `CNS_TABLE` `[ppo2, minutes]` row to "ppO₂ {ppo2} → {minutes} min (single exposure)", then reference lines: "Daily CNS: plan to ~80%, 100% limit" and "Daily OTU: ~300 single-day". Theme tokens only; import `CNS_TABLE` from `@/lib/diveMath/oxygenExposure`.

```tsx
import { CNS_TABLE } from '@/lib/diveMath/oxygenExposure'

const OxygenLimitsNote = () => (
	<aside className='border-border bg-surface h-fit rounded-md border p-4'>
		<h3 className='text-text mb-3 text-sm font-semibold'>
			Standard O₂ exposure limits (NOAA)
		</h3>
		<dl className='space-y-1 text-sm'>
			<dt className='text-light-text text-xs font-medium'>
				Single exposure (ppO₂ → max minutes)
			</dt>
			{CNS_TABLE.map(([ppo2, minutes]) => (
				<dd key={ppo2} className='text-text'>
					{ppo2.toFixed(1)} ata → {minutes} min
				</dd>
			))}
		</dl>
		<p className='text-light-text mt-3 text-xs'>
			Daily CNS: plan to ~80%, 100% limit. Daily OTU: ~300 (single day).
			Reference only — verify against current tables.
		</p>
	</aside>
)

export default OxygenLimitsNote
```

- [ ] **Step 3: Add the sidebar + persistence + rounding.** Wrap `OxygenExposureCalculator`'s return in the `2xl:relative` layout and add the sidebar via `<div className='mt-6 2xl:absolute 2xl:top-0 2xl:left-full 2xl:mt-0 2xl:ml-8 2xl:w-72'><OxygenLimitsNote /></div>` (same pattern as `FormulaPanel` consumers). Persist its inputs (key prefix `ox.`). Round any displayed percentages with `roundPercent` and ppO₂/pressures appropriately.

- [ ] **Step 4:** Build + lint → clean. Commit: `feat: CNS/OTU limits sidebar, rounding + persistence`.

---

### Task 9: Remaining planning tools — rounding + persistence (+ fmtMix)

**Files:** Modify `BestMixCalculator.tsx`, `ModEndCalculator.tsx`, `EadCalculator.tsx`, `GasDensityCalculator.tsx`, `GasMixingCalculator.tsx`, `BlendingCostCalculator.tsx`.

- [ ] **Step 1: Persist + round each.** For every tool: swap `useState`/unit hooks → persisted variants with a per-tool key prefix (`bm.`, `me.`, `ead.`, `gd.`, `gm.`, `bc.`). Apply rounding helpers to displayed values:
  - **BestMix / ModEnd:** MOD / depth results → `roundDepthDown(m, units.depth)`; best-mix O₂% → `roundPercent`; any mix label `o2/he` → `fmtMix`.
  - **Ead:** EAD depth → `roundDepthDown`; mix label → `fmtMix`.
  - **GasDensity:** density stays as-is (g/L, not in the rule list — keep its current rounding); mix label → `fmtMix`; any pressure/depth → the helpers.
  - **GasMixing:** result O₂/He % → `roundPercent`; mix labels → `fmtMix`; pressures → `roundPressure`.
  - **BlendingCost:** money stays as-is; gas volumes → `roundVolume`; pressures → `roundPressure`.

- [ ] **Step 2: FULL GATE.**

Run: `npm test && npm run build && npm run lint && npm run knip`
Expected: all tests pass (format.ts + units tests included; no dive-math change); build clean; lint 0 errors; knip no new findings beyond the accepted exported-interface baseline. Manually: values round per the rules; switching tools / reloading preserves inputs.

- [ ] **Step 3: Commit**

```bash
git add src/components/Tools
git commit -m "feat: rounding + persistence for the remaining planning tools"
```

---

## Notes for the implementer

- Persisted hooks store the **display value**; units are already persisted globally, so a restored value matches the restored unit. No migration.
- Only **displayed** values get the rounding helpers — never round values fed into `calculate*`.
- `units.airFlow` (lpm/cfm) values (compressor output, drive-air rate, O₂ flow) are NOT in the spec's rounding list — leave their existing rounding. SAC/RMV uses `roundSac` against `units.volume`.
- When swapping a `p()`-style local helper to `roundPressure`, keep its call sites unchanged (same `(bar) => …` shape).
- Keep each tool's `calculate*` wiring and the hot-fill / CylinderFields integrations intact.
