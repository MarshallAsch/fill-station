# Hot-Fill Temperature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the global temperature setting is on, treat each fill tool's entered fill pressure as the cold (settled) target and feed the hot fill pressure to its calculation; estimate the nitrox tool's temperature rise from its fill rate so its hot target is derived automatically.

**Architecture:** Two pure helpers in `temperature.ts` (`tempRiseC`, `effectiveHotFillBar`), a `useHotFill()` hook + a `HotFillNote` display component, then each fill tool (blend, cascade, booster, nitrox) feeds the hot pressure to its existing `calculate*` and renders the note. No dive-math algorithm changes — only which target pressure is passed in. Spec: `docs/superpowers/specs/2026-06-27-hot-fill-temperature-design.md`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 (theme tokens), Vitest.

## Global Constraints

- Prettier: single quotes, no semicolons, TABS for indentation, 80-char width. Run `npm run lint` after each task.
- Vitest tests import `{ describe, it, expect }` from `'vitest'`; vitest has **no `@/` alias** — files imported (transitively) by a `*.test.ts` use relative imports.
- Theme tokens only (no hardcoded colors): `text-text`, `text-light-text`, etc.
- `HEAT_COEFF = 0.7` °C per (bar/min); `ΔT = HEAT_COEFF × fillRate` linear, **no clamp**.
- `fillRateBarPerMin = freeAirFlowLpm / waterVolumeL`.
- No dive-math algorithm change: each `calculate*`/`nitroxStickSupplyDraw` keeps its signature; only the target pressure value passed in changes (cold → hot when temperature on).
- A temperature **delta** converts °C→°F as `×9/5` (no +32 offset) — do NOT use `fromCelsius` (which is for absolute temps) on a ΔT.
- Existing global temp settings (`useUnits()`): `tempMode: 'off'|'simple'|'detailed'`, `overfillPct`, `fillTempC`, `settledTempC`, and `units.temp: 'C'|'F'`.
- Existing temperature helpers in `src/lib/diveMath/temperature.ts`: `settledPressureBar`, `hotTargetBar`, `applyOverfill`, `removeOverfill`.

---

### Task 1: `temperature.ts` — `tempRiseC` + `effectiveHotFillBar`

**Files:**
- Modify: `src/lib/diveMath/temperature.ts`
- Modify: `src/lib/diveMath/temperature.test.ts`

**Interfaces:**
- Produces: `HEAT_COEFF`, `tempRiseC(fillRateBarPerMin): number`, `effectiveHotFillBar(coldGaugeBar, { mode, overfillPct, fillTempC, settledTempC }): number`.

- [ ] **Step 1: Write failing tests**

Append to `src/lib/diveMath/temperature.test.ts`:

```ts
import { tempRiseC, effectiveHotFillBar } from './temperature'

describe('tempRiseC', () => {
	it('is 0 at zero or negative fill rate', () => {
		expect(tempRiseC(0)).toBe(0)
		expect(tempRiseC(-5)).toBe(0)
	})
	it('is linear in fill rate (0.7 °C per bar/min)', () => {
		expect(tempRiseC(20)).toBeCloseTo(14, 6)
		expect(tempRiseC(40)).toBeCloseTo(28, 6)
	})
})

describe('effectiveHotFillBar', () => {
	const t = { mode: 'off' as const, overfillPct: 10, fillTempC: 40, settledTempC: 20 }
	it('is identity when off', () => {
		expect(effectiveHotFillBar(200, t)).toBe(200)
	})
	it('applies overfill in simple mode', () => {
		expect(effectiveHotFillBar(200, { ...t, mode: 'simple' })).toBeCloseTo(220, 6)
	})
	it('uses Gay-Lussac in detailed mode (hot > cold when fill warmer)', () => {
		const hot = effectiveHotFillBar(200, { ...t, mode: 'detailed' })
		expect(hot).toBeGreaterThan(200)
		// matches hotTargetBar(200, 40, 20)
		expect(hot).toBeCloseTo((201.013 * 313.15) / 293.15 - 1.01325, 2)
	})
})
```

- [ ] **Step 2: Run, expect failure**

Run: `npx vitest run src/lib/diveMath/temperature.test.ts`
Expected: FAIL (`tempRiseC`/`effectiveHotFillBar` not exported).

- [ ] **Step 3: Implement**

Append to `src/lib/diveMath/temperature.ts`:

```ts
export const HEAT_COEFF = 0.7 // °C per (bar/min)

// Gas temperature rise during a fill (°C) from the fill rate (bar/min). Linear,
// reference-only: a faster fill heats the gas more. 0 at non-positive rate.
export function tempRiseC(fillRateBarPerMin: number): number {
	return fillRateBarPerMin > 0 ? HEAT_COEFF * fillRateBarPerMin : 0
}

// The hot fill pressure to fill to so it settles at coldGaugeBar, per the global
// temperature settings. Returns coldGaugeBar unchanged when off.
export function effectiveHotFillBar(
	coldGaugeBar: number,
	t: {
		mode: 'off' | 'simple' | 'detailed'
		overfillPct: number
		fillTempC: number
		settledTempC: number
	},
): number {
	if (t.mode === 'off') return coldGaugeBar
	if (t.mode === 'simple') return applyOverfill(coldGaugeBar, t.overfillPct)
	return hotTargetBar(coldGaugeBar, t.fillTempC, t.settledTempC)
}
```

- [ ] **Step 4: Run, expect pass**

Run: `npx vitest run src/lib/diveMath/temperature.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/diveMath/temperature.ts src/lib/diveMath/temperature.test.ts
git commit -m "feat: add tempRiseC and effectiveHotFillBar"
```

---

### Task 2: `useHotFill` hook + `HotFillNote` component

**Files:**
- Create: `src/components/Tools/useHotFill.ts`
- Create: `src/components/Tools/HotFillNote.tsx`

**Interfaces:**
- Consumes: `useUnits` (temp settings + `units.pressure`), `effectiveHotFillBar`/`hotTargetBar`, `toBar`/`fromBar`.
- Produces:
  - `useHotFill(): { on: boolean; hotFill: (coldDisplay: number, fillTempOverrideC?: number) => number }`
  - `HotFillNote({ cold, hot, deltaTDisplay }: { cold: number; hot: number; deltaTDisplay?: number })` — `cold`/`hot` in display pressure units.

- [ ] **Step 1: Implement `useHotFill.ts`**

```ts
'use client'

import { fromBar, toBar } from '@/lib/diveMath/units'
import {
	effectiveHotFillBar,
	hotTargetBar,
} from '@/lib/diveMath/temperature'
import { useUnits } from './UnitsProvider'

// Converts a cold (settled) target pressure to the hot fill pressure per the
// global temperature settings, in display units. `fillTempOverrideC` (nitrox)
// forces the Gay-Lussac hot target with that fill temperature, regardless of the
// simple/detailed mode (an explicit fill temperature supersedes).
export function useHotFill(): {
	on: boolean
	hotFill: (coldDisplay: number, fillTempOverrideC?: number) => number
} {
	const { units, tempMode, overfillPct, fillTempC, settledTempC } = useUnits()
	const on = tempMode !== 'off'
	const hotFill = (coldDisplay: number, fillTempOverrideC?: number) => {
		if (!on) return coldDisplay
		const coldBar = toBar(coldDisplay, units.pressure)
		const hotBar =
			fillTempOverrideC != null
				? hotTargetBar(coldBar, fillTempOverrideC, settledTempC)
				: effectiveHotFillBar(coldBar, {
						mode: tempMode,
						overfillPct,
						fillTempC,
						settledTempC,
					})
		return fromBar(hotBar, units.pressure)
	}
	return { on, hotFill }
}
```

- [ ] **Step 2: Implement `HotFillNote.tsx`**

```tsx
'use client'

import { useUnits } from './UnitsProvider'

// Cold-target → hot-fill note: "Fill hot to X; settles to your Y target".
// `cold`/`hot` are display pressure units; `deltaTDisplay` is an optional
// estimated rise in the display temperature unit (nitrox).
const HotFillNote = ({
	cold,
	hot,
	deltaTDisplay,
}: {
	cold: number
	hot: number
	deltaTDisplay?: number
}) => {
	const { units } = useUnits()
	if (hot <= cold + 1e-6) return null
	return (
		<div className='text-text space-y-1'>
			<p>
				Fill hot to:{' '}
				<span className='font-semibold'>
					{Math.round(hot)} {units.pressure}
				</span>{' '}
				<span className='text-light-text'>
					so it settles to your {Math.round(cold)} {units.pressure} target
				</span>
			</p>
			{deltaTDisplay != null && deltaTDisplay > 0 && (
				<p className='text-light-text text-sm'>
					Estimated gas temperature rise from the fill rate: +
					{Math.round(deltaTDisplay)} °{units.temp}
				</p>
			)}
		</div>
	)
}

export default HotFillNote
```

- [ ] **Step 3: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: succeeds (not yet consumed).

- [ ] **Step 4: Commit**

```bash
git add src/components/Tools/useHotFill.ts src/components/Tools/HotFillNote.tsx
git commit -m "feat: add useHotFill hook and HotFillNote component"
```

---

### Task 3: Blend — fill to hot

**Files:**
- Modify: `src/components/Tools/BlendCalculator.tsx`

**Interfaces:**
- Consumes: `useHotFill`, `HotFillNote`.

Current: `calculateBlend({ …, finalPressure: toBar(finalPressure, units.pressure) })` and `<TemperatureResult goalBar={toBar(finalPressure, units.pressure)} />`.

- [ ] **Step 1: Feed the hot pressure into the calc and render the note**

Add `import { useHotFill } from './useHotFill'` and `import HotFillNote from './HotFillNote'`; remove the `TemperatureResult` import.

Near the top of the component add:

```tsx
	const hot = useHotFill()
	const hotFinal = hot.hotFill(finalPressure)
```

Change the `calculateBlend` input `finalPressure` to use the hot value:

```tsx
			finalPressure: toBar(hotFinal, units.pressure),
```

Replace `<TemperatureResult goalBar={toBar(finalPressure, units.pressure)} />` with:

```tsx
				{hot.on && <HotFillNote cold={finalPressure} hot={hotFinal} />}
```

- [ ] **Step 2: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: succeeds. With temperature off, `hotFinal === finalPressure` (no change). With it on, the blend adds are computed at the hot final pressure and the note shows the hot fill.

- [ ] **Step 3: Commit**

```bash
git add src/components/Tools/BlendCalculator.tsx
git commit -m "feat: blend fills to the hot pressure when temperature is on"
```

---

### Task 4: Cascade — fill to hot

**Files:**
- Modify: `src/components/Tools/CascadeCalculator.tsx`

**Interfaces:**
- Consumes: `useHotFill`, `HotFillNote`.

Current: `calculateCascade({ …, desiredPressure: toBar(desiredPressure, units.pressure) })` and `<TemperatureResult goalBar={result.finalPressure} />`.

- [ ] **Step 1: Feed the hot desired pressure into the calc and render the note**

Add `import { useHotFill } from './useHotFill'` and `import HotFillNote from './HotFillNote'`; remove the `TemperatureResult` import.

Add near the top:

```tsx
	const hot = useHotFill()
	const hotDesired = hot.hotFill(desiredPressure)
```

Change the `calculateCascade` input `desiredPressure`:

```tsx
			desiredPressure: toBar(hotDesired, units.pressure),
```

Replace `<TemperatureResult goalBar={result.finalPressure} />` with:

```tsx
				{hot.on && <HotFillNote cold={desiredPressure} hot={hotDesired} />}
```

(The "Final cylinder pressure"/reached-desired result and the `CascadeCylinders` viz now reflect filling to the hot target — intended. The CylinderFields per-cylinder overfill warning still compares the entered cold values; unchanged.)

- [ ] **Step 2: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: succeeds. Temperature off → `hotDesired === desiredPressure`, unchanged. On → cascade targets the hot pressure; note shows it settles to the entered target.

- [ ] **Step 3: Commit**

```bash
git add src/components/Tools/CascadeCalculator.tsx
git commit -m "feat: cascade fills to the hot pressure when temperature is on"
```

---

### Task 5: Booster — fill to hot; remove old `TemperatureResult`

**Files:**
- Modify: `src/components/Tools/BoosterCalculator.tsx`
- Delete: `src/components/Tools/TemperatureResult.tsx`

**Interfaces:**
- Consumes: `useHotFill`, `HotFillNote`.

Current: `const targetBar = toBar(target, units.pressure)`, `input.target = targetBar`, `<TemperatureResult goalBar={targetBar} />`.

- [ ] **Step 1: Feed the hot target into the calc and render the note**

Add `import { useHotFill } from './useHotFill'` and `import HotFillNote from './HotFillNote'`; remove the `TemperatureResult` import.

Add near the top (before `targetBar` is used):

```tsx
	const hot = useHotFill()
	const hotTarget = hot.hotFill(target)
```

Change `targetBar` to use the hot value:

```tsx
	const targetBar = toBar(hotTarget, units.pressure)
```

Replace `<TemperatureResult goalBar={targetBar} />` with:

```tsx
					{hot.on && <HotFillNote cold={target} hot={hotTarget} />}
```

- [ ] **Step 2: Delete the now-unused `TemperatureResult.tsx`**

After blend (Task 3) and cascade (Task 4) and this task switched off it, no tool imports `TemperatureResult` anymore. Remove the file:

```bash
git rm src/components/Tools/TemperatureResult.tsx
```

Confirm: `grep -rn "TemperatureResult" src/components/Tools` returns nothing.

- [ ] **Step 3: Verify build + lint + knip**

Run: `npm run build && npm run lint && npm run knip`
Expected: succeeds; knip shows no reference to the deleted file and no new unused exports beyond the accepted baseline.

- [ ] **Step 4: Commit**

```bash
git add src/components/Tools/BoosterCalculator.tsx src/components/Tools/TemperatureResult.tsx
git commit -m "feat: booster fills to the hot pressure; drop old TemperatureResult"
```

---

### Task 6: Nitrox — fill to hot with fill-rate ΔT estimate

**Files:**
- Modify: `src/components/Tools/NitroxStickCalculator.tsx`

**Interfaces:**
- Consumes: `useHotFill`, `HotFillNote`, `tempRiseC`, `useUnits` (`settledTempC`, `units.temp`).

Current: `airFlowLpm = toLpm(airFlow, units.airFlow)`, `tankVolume`, `finalPressure`; `nitroxStickSupplyDraw({ …, finalPressure: toBar(finalPressure, units.pressure) })`. No temperature handling yet.

- [ ] **Step 1: Estimate ΔT, compute the hot final, feed it to the calc, render the note**

Add `import { useHotFill } from './useHotFill'`, `import HotFillNote from './HotFillNote'`, and `import { tempRiseC } from '@/lib/diveMath/temperature'`. Destructure `settledTempC` from `useUnits()` (alongside the existing `units`).

Add near the top (after `airFlowLpm`/`tankVolume` are defined):

```tsx
	const hot = useHotFill()
	const fillRateBarPerMin = tankVolume > 0 ? airFlowLpm / tankVolume : 0
	const deltaTC = tempRiseC(fillRateBarPerMin)
	const hotFinal = hot.on
		? hot.hotFill(finalPressure, settledTempC + deltaTC)
		: finalPressure
	const deltaTDisplay = units.temp === 'F' ? deltaTC * (9 / 5) : deltaTC
```

Change the `nitroxStickSupplyDraw` input `finalPressure`:

```tsx
		finalPressure: toBar(hotFinal, units.pressure),
```

Add the note where the result is shown (after the O₂/supply result block):

```tsx
				{hot.on && (
					<HotFillNote
						cold={finalPressure}
						hot={hotFinal}
						deltaTDisplay={deltaTDisplay}
					/>
				)}
```

- [ ] **Step 2: FULL GATE**

Run: `npm test && npm run build && npm run lint && npm run knip`
Expected: all tests pass (temperature.ts tests incl. the new ones; no dive-math change); build clean; lint 0 errors; knip no new findings. Manually: with temperature on, the nitrox tool shows an estimated ΔT from the air-flow ÷ tank volume, a hot fill pressure above the entered final, and the O₂ + air reflect filling to the hot pressure; temperature off → unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/components/Tools/NitroxStickCalculator.tsx
git commit -m "feat: nitrox estimates fill-rate temperature rise and fills to hot"
```

---

## Notes for the implementer

- Pressures are held in **display units** in the components; the hot conversion happens once (`hot.hotFill`), then `toBar` at the calc boundary. The note also takes display units.
- `hot.hotFill(cold)` returns `cold` unchanged when temperature is off, so the `hot.on &&` guards are just for hiding the note — the calc wiring is safe either way.
- The nitrox ΔT uses `settledTempC` (global ambient, present even in simple mode) + the estimated rise; do not run the ΔT through `fromCelsius` — convert the **delta** with `×9/5` for °F display only.
- No `calculate*`/`nitroxStickSupplyDraw` signature changes; if a math test breaks, the wiring passed the wrong value — revisit, don't change the math.
