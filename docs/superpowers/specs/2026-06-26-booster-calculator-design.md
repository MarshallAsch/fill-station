# Gas-Driven Booster Calculator — Design

**Date:** 2026-06-26
**Status:** Draft (pending user review)
**Builds on:** the existing public `/tools` section (registry, units, presets,
`SafetyNote`, `FormulaPanel`/`Math`).

## Overview

A new **Booster** calculator (Haskel / SUN style gas-driven boosters) that
estimates drive-gas requirements for boosting a supply gas into a receiver
cylinder. It models the depleting supply bottle, reports the drive-air volume
consumed, achievable pressure, final supply pressure, and an optional fill-time
estimate, and plots the fill profile.

Pure math in `src/lib/diveMath/booster.ts` (TDD-tested); a `'use client'`
component `src/components/Tools/BoosterCalculator.tsx`; a lightweight inline-SVG
chart `src/components/Tools/BoosterChart.tsx`. Registered as a `booster` tab in
the **Blending** group.

## Physics model

A gas-driven booster is a pneumatic piston pump: a large drive piston (area
`A_d`) driven by shop air at `P_drive` is coupled to a small gas piston
(area `A_g`) that compresses the process gas. Area ratio `R = A_d / A_g`. The
piston swept volumes cancel in the drive-gas-per-gas-moved ratio, so the model
needs only `R`, pressures, and volumes.

All pressures are absolute internally (gauge + `ATMOSPHERIC_BAR`); volumes are
litres (water capacity); the math is in SI (bar/L). Components convert at the
boundary.

**Stall (max output):** `P_out_max = R · P_drive` (gauge). The booster cannot
exceed this.

**Free equalization phase:** if the supply starts above the receiver, gas flows
freely (no drive gas) until they equalize:
`P_eq = (V_s·P_s + V_r·P_r) / (V_s + V_r)` (work in absolute; report gauge).
If `P_eq ≥ target`, no boosting is needed.

**Boost phase:** the booster draws process gas from the supply (inlet pressure
falling from `P_eq` as the supply drains) into the receiver up to `target`.
Free process gas moved to the receiver: `Q = V_r · (target − P_eq)` (in
bar·L → surface litres). Drive air per unit free process gas =
`R · P_drive_abs / P_inlet_abs`. As gas `q` moves, the supply (inlet) absolute
pressure is `P_eq_abs − q/V_s`. Integrating:

```
driveAir = R · P_drive_abs · V_s · ln( P_eq_abs / (P_eq_abs − Q/V_s) )
```

(surface litres). Final supply pressure (gauge) = `P_eq − Q/V_s`.

**Feasibility:**
- `target > R · P_drive` → infeasible (booster stalls first).
- Supply-limited: the most the receiver can reach is when the supply is drawn
  down to a practical floor (use atmospheric, `P_inlet_abs → ATMOSPHERIC_BAR`).
  Max receiver pressure `P_r_max` solves conservation
  `V_s·(P_eq − P_floor) = V_r·(P_r_max − P_eq)`; if `target > P_r_max`, the
  supply is exhausted before target — warn and report `P_r_max`.

### Math module API (`booster.ts`)
- `interface BoosterInput { ratio; driveP; supplyVol; supplyStart; receiverVol; receiverStart; target }` (pressures bar gauge, volumes L).
- `interface BoosterResult { maxOutput; eqPressure; processGasL; driveAirL; finalSupply; feasible; reason? ; supplyLimitedMax? }`
- `calculateBooster(input): BoosterResult` — the summary using the formulas above.
- `boosterFillProfile(input, steps = 40): ProfilePoint[]` — samples the boost
  phase from `P_eq` to the reached pressure (target or supply-limited max),
  returning `{ receiverP, cumulativeDriveL, supplyP, rateLPerBar }` at each step
  (`rateLPerBar = dDrive/dP_receiver = R·P_drive_abs·V_r / P_inlet_abs`). The
  last point's `cumulativeDriveL` equals `calculateBooster().driveAirL`.

## Component (`BoosterCalculator.tsx`)

Reuses `NumberInput`, `RadioGroup`/`ListBox`, `useUnits`, `UnitToggle`,
`SafetyNote`, and the formula/notation helpers. Inputs:
- **Booster area ratio** — a `BoosterPicker` (preset common Haskel/SUN models →
  their ratio, plus Custom → numeric ratio input).
- **Drive (air) pressure** (pressure unit).
- **Supply cylinder:** water volume (L) + start pressure; a `TankSizePicker`
  (industrial/storage) may set the volume.
- **Receiver cylinder:** water volume (L) + start + target pressure; a
  `TankSizePicker` (dive) may set volume and the target → working pressure.
- **Optional drive-air supply rate** (flow unit, lpm/cfm) → fill-time estimate.

Outputs (results panel): achievable max pressure; equalization pressure; free
process gas boosted; **drive air consumed**; final supply pressure; estimated
fill time (if a drive-air rate is given) = `driveAirL / rate`; plus the chart.

Unit handling: pressures via `toBar`/`fromBar`; volumes are litres (consistent
with the rest of the tools — water capacity always litres); drive-air rate via
the `airFlow` flow unit; drive-air *consumed* volume shown in the gas-volume
unit (cf/L toggle) as a free-gas/surface volume.

## Chart (`BoosterChart.tsx`)

Lightweight inline **SVG** (no charting dependency), `viewBox`-based and
responsive (`width=100%`, `overflow` clipped). X-axis = receiver pressure
(`P_eq → reached`), labeled in the display pressure unit. Three series from
`boosterFillProfile`, each **normalized to the plot height** (different units)
and drawn as a `<polyline>` in a distinct theme colour:
- Cumulative drive air (L) — `accent`
- Supply pressure (bar→display) — `light-text`/`text`
- Incremental drive-air rate (L/bar) — `warning`

A legend lists each series with its actual range (`min → max` in real units), so
magnitudes are readable despite normalization. Axis ticks for x (start/mid/end
pressure). All colours from theme tokens; degrades to nothing/hidden if the fill
is trivial (no boost phase).

## Presets (`boosterPresets` in `presets.ts`)

A small list of common Haskel / SUN air-driven gas-booster models mapped to
their nominal area ratios, plus "Custom". **Values to be sourced from
manufacturer datasheets during implementation** (e.g. Haskel AG/AGT series,
SUN), and cited in a code comment — the same sourcing discipline used for the
cylinder presets. Ratio is the single number consumed by the math.

## Safety / feasibility (via `SafetyNote`)
- **Danger:** `target > R · P_drive` — "Target exceeds the booster's stall
  pressure (ratio × drive pressure); it cannot be reached."
- **Warning:** supply-limited — "Supply gas is insufficient; the receiver can
  only reach ~`P_r_max`."
- **Note:** if `P_eq ≥ target` — "Free equalization already reaches the target;
  no boosting (or drive gas) needed."

## Testing (`booster.test.ts`)
- Equalization pressure for a supply-above-receiver case.
- No-boost-needed case (`P_eq ≥ target` → driveAir 0, feasible).
- Drive-air log formula against a hand-computed value (fixed ratio, pressures,
  volumes).
- Stall infeasibility (`target > R·P_drive`).
- Supply-limited case (target unreachable → `supplyLimitedMax` reported).
- `boosterFillProfile`: monotonic cumulative drive air; first point at `P_eq`
  (drive 0); last point's cumulative equals `calculateBooster().driveAirL`;
  supply pressure decreasing; rate increasing as supply depletes.

## Build order (detail in the plan)
1. `booster.ts` + tests (calculateBooster, boosterFillProfile).
2. `boosterPresets` in `presets.ts` (sourced ratios) + `BoosterPicker`.
3. `BoosterChart.tsx` (SVG).
4. `BoosterCalculator.tsx` + register the `booster` tab (Blending group).
5. `npm test && npm run build && npm run lint`.
