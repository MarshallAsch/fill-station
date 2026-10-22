# Hot-Fill Temperature — Design

**Date:** 2026-06-27
**Status:** Draft (pending user review)

## Overview

When the global temperature setting is on, treat the fill pressure a user
enters in the fill tools as the **cold (settled) target**, and feed the
corresponding **hot** fill pressure into each tool's calculation (so the
estimate covers filling to the hot pressure that cools to the target). Add a
nitrox-stick estimate that derives the gas temperature rise from the fill rate
(its air flow ÷ cylinder volume) and cylinder size, so its hot-fill target comes
from the fill speed automatically.

Extends the existing temperature feature (`temperature.ts`, the global
off/simple/detailed setting in `UnitsProvider`, and `TemperatureResult`). First-
order, reference-only — same disclaimer as the rest of the tools.

## Temperature math (`src/lib/diveMath/temperature.ts`)

Two additions (existing `settledPressureBar`/`hotTargetBar`/`applyOverfill`/
`removeOverfill` unchanged):

```ts
export const HEAT_COEFF = 0.7 // °C per (bar/min): gas temp rise vs fill rate

// Gas temperature rise during a fill (°C), from the fill rate (bar/min).
// Linear, reference-only: a fast fill heats the gas more (less time to shed heat
// through the wall). No clamp — fill rates fast enough to overshoot are
// impractically/unsafely fast. ΔT is 0 at 0 rate or non-positive inputs.
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

`fillRateBarPerMin` is computed by the caller as `freeAirFlowLpm / waterVolumeL`
(adding `freeAirFlow` free L/min into a `V`-litre cylinder raises pressure by
`freeAirFlow / V` bar/min).

## `useHotFill()` hook (`src/components/Tools/useHotFill.ts`)

A small client hook that reads the global temperature settings from `useUnits()`
and returns helpers operating in **display units**:

```ts
useHotFill(): {
	// Hot fill pressure (display units) for a cold target (display units).
	// fillTempOverrideC: when given (nitrox), use it as the hot fill temperature
	// instead of the global fillTempC (detailed) — used to inject the estimated ΔT.
	hotFill: (coldDisplay: number, fillTempOverrideC?: number) => number
	on: boolean // tempMode !== 'off'
}
```

Implementation converts display→bar (`toBar`), computes the hot bar, converts
back (`fromBar`):
- **No override:** call `effectiveHotFillBar(coldBar, globalSettings)` (off →
  identity; simple → overfill%; detailed → `hotTargetBar` with the global
  fill/settled temps).
- **With `fillTempOverrideC` (and `on`):** always use
  `hotTargetBar(coldBar, fillTempOverrideC, settledTempC)` regardless of the
  global mode — an explicit fill temperature supersedes the simple/detailed
  choice. This is how nitrox injects its estimated `ambient + ΔT`.

So nitrox calls `hotFill(coldFinal, settledTempC + deltaT)` and gets a
mode-independent hot target whenever temperature is on.

## "Fill to hot" in the fill tools

When `useHotFill().on`, the entered fill pressure is the cold target and the
**hot** pressure is fed to the calculation:

| Tool | Entered (cold) field | Calc input set to hot |
|---|---|---|
| Nitrox stick | `finalPressure` | `nitroxStickSupplyDraw({ finalPressure: hot })` |
| Cascade | `desiredPressure` | `calculateCascade({ desiredPressure: hot })` |
| Booster | `target` | `calculateBooster({ target: hot })` |
| Blend | `finalPressure` | `calculateBlend({ finalPressure: hot })` |

- The hot pressure is `hotFill(coldEntered)` (display) → `toBar` for the calc.
- Cooling doesn't change a mix's composition, so blend/nitrox fractions are
  unchanged; only the total gas to reach the hot pressure rises.
- Each tool renders a note: "**Fill hot to X {unit}**" (the hot pressure) with a
  sub-line "settles to your {coldTarget} target". When temperature is off, no
  change and no note.
- This **replaces** the current `TemperatureResult` two-line settled/hot readout
  in cascade/blend/booster (which treated the entry ambiguously); the entry is
  now unambiguously the cold target. `TemperatureResult` is repurposed to render
  the single "fill hot to" note from a cold target + the hot value.

## Nitrox ΔT auto-estimate

When temperature is on, the nitrox tool estimates the gas temperature rise from
its fill rate instead of using the global manual fill temp / overfill:

- `fillRateBarPerMin = toLpm(airFlow, units.airFlow) / tankVolumeL` (reuse the
  existing nitrox air-flow input and the tank water volume).
- `deltaT = tempRiseC(fillRateBarPerMin)`.
- Ambient (cool-down) temperature = the global `settledTempC` (always present in
  state, default 21 °C, even when the mode is `simple`).
- Hot fill = `hotFill(coldFinal, settledTempC + deltaT)` — the override makes the
  hot target use `fillTemp = ambient + ΔT` regardless of the global mode (simple
  or detailed), via the `useHotFill` override path above.
- The nitrox result shows: the estimated `ΔT` (in the global temp unit), the
  fill rate, and the hot fill pressure; `nitroxStickSupplyDraw` is fed the hot
  `finalPressure`, so the reported O₂ + air reflect filling to hot.
- If `airFlow` or `tankVolume` is 0, `deltaT = 0` → hot = cold (no rise).

The auto-estimate is **nitrox-only**; the other tools use the global
simple/detailed model via `useHotFill()`. (Booster has its own flow data and
could adopt the estimate later — out of scope here.)

## Files

- Modify: `src/lib/diveMath/temperature.ts` (+ `temperature.test.ts`).
- Create: `src/components/Tools/useHotFill.ts`.
- Modify: `src/components/Tools/TemperatureResult.tsx` (repurpose to the cold→hot
  note), and the four tools (`NitroxStickCalculator`, `CascadeCalculator`,
  `BoosterCalculator`, `BlendCalculator`) to feed the hot pressure + render the
  note. Nitrox additionally computes/show the ΔT estimate.

## Testing

- `temperature.test.ts`: `tempRiseC` (0 at 0/negative rate; `0.7 * rate`
  linear); `effectiveHotFillBar` (off = identity; detailed = `hotTargetBar`
  result and > cold when fill temp > ambient; simple = `applyOverfill`).
- Per-tool regression (existing Vitest where a calc is involved): temperature
  off leaves the calc's target input unchanged; the dive-math modules are not
  changed, only what pressure the components pass in. The fill-to-hot wiring is
  component-level (build/lint + manual smoke); the math is covered by the
  `temperature.ts` tests.

## Out of scope

- Applying the fill-rate ΔT estimate to tools other than nitrox.
- A user-editable heat coefficient or a clamp/saturation on ΔT.
- Any change to the blend/cascade/booster/nitrox dive-math algorithms (only the
  target pressure fed in changes).
- Modelling cylinder steel thermal mass / heat-transfer (the linear coefficient
  rolls this into one constant).
