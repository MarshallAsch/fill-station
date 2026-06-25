# Diving Tools Expansion — Design

**Date:** 2026-06-25
**Status:** Draft (pending user review)
**Builds on:** `2026-06-23-diving-tools-section-design.md` (the existing `/tools` section)

## Overview

Expand the public `/tools` section from 4 calculators to 11 (SAC/RMV and
rock-bottom share one Gas Requirements tab), reorganize the
flat tab row into two grouped sections, and add cross-cutting conveniences:
standard tank/mix presets, an independent flow-rate unit, an explicit
reference-only disclaimer, and an opt-in real-gas (compressibility) correction
on the existing blend and cascade calculators.

All math stays pure and unit-agnostic in `src/lib/diveMath/` (SI internally:
bar gauge / litres / metres; flow in litres-per-minute) with Vitest tests.
Components convert at the boundary and reuse the existing primitives.

## Goals / Non-goals

**Goals**
- 8 new calculators + a real-gas toggle, all client-side, no backend.
- Grouped two-level navigation (Blending / Planning) via a tab registry,
  preserving `?tab=<id>` deep links.
- Reusable `TankSizePicker` and `MixPicker` (preset + Custom) used across tabs.
- New independent `flow` unit (lpm/cfm) persisted with the existing unit prefs.
- Prominent reference-only disclaimer on every tab.

**Non-goals**
- No DB, API, auth, or server state. (Gas prices persist in localStorage.)
- No decompression modeling, no NDL/deco schedules.
- No per-supplier industrial-cylinder accuracy — preset values are approximate
  and Custom is always available.

## Navigation refactor

### Tab registry — `src/components/Tools/toolsRegistry.ts`
Replaces the growing `{active === ...}` ternary in `ToolsPage`.

```ts
export type ToolGroup = 'blending' | 'planning'
export interface ToolDef {
  id: string            // ?tab= value, kebab-case
  name: string          // tab label
  group: ToolGroup
  Component: React.ComponentType
}
export const TOOLS: ToolDef[] = [ /* see list below */ ]
export const GROUPS: { id: ToolGroup; name: string }[] = [
  { id: 'blending', name: 'Blending' },
  { id: 'planning', name: 'Planning' },
]
```

Tabs (ids):
- **Blending:** `cascade`, `nitrox-stick`, `blend`, `mix-two-gases`,
  `best-mix`, `blending-cost`
- **Planning:** `mod-end`, `ead`, `gas-density`, `sac-rmv`,
  `gas-requirements`, `oxygen-exposure`

### `ToolsTabs.tsx` (rewrite)
Renders a **group selector** (segmented buttons from `GROUPS`) and, below it,
the tab buttons for the active group. Active tab + group both derived from the
`?tab=` id via the registry. Selecting a group switches to that group's first
tab. Unknown/missing `?tab=` defaults to `cascade`.

### `ToolsPage.tsx` (rewrite)
Looks up the active `ToolDef` by id from `TOOLS`, renders `<Component />`.
Keeps the `UnitsProvider` wrapper and `useSearchParams` + `router.replace`
inside `<Suspense>`. Renders the disclaimer banner above the tabs.

### Disclaimer
A persistent banner at the top of the tools page (all tabs):

> **For reference only.** All results are estimates — independently verify and
> analyze every gas mix and dive plan before diving.

Styled with theme tokens (e.g. `border-border bg-hover text-text` callout).

## Units — add `flow`

Extend `UnitPrefs` (in `UnitsProvider.tsx`) and the unit helpers:

- `UnitPrefs` gains two independent flow units `airFlow` and `o2Flow`
  (`'lpm' | 'cfm'` each), defaults `airFlow: 'cfm'`, `o2Flow: 'lpm'`, so the
  compressor intake flow and the O₂ flow can be shown in different units.
- localStorage key unchanged (`fillstation.tools.units`); the post-mount merge
  over `DEFAULT_UNITS` supplies `flow` for users with older stored prefs.
- `units.ts`: add `type FlowUnit = 'lpm' | 'cfm'`, and conversions reusing
  `L_PER_CF`:
  - `toLpm(value, unit)` → litres/min (cfm × `L_PER_CF`, lpm unchanged)
  - `fromLpm(lpm, unit)` → display (lpm ÷nothing; cfm = lpm / `L_PER_CF`)
- **Re-add `fromLiters(l, unit)`** (removed earlier as dead code) — now used by
  `TankSizePicker` to render preset water volumes in the display volume unit.
  Restore it in `units.ts` with its `units.test.ts` assertion.
- `UnitToggle` gains `airFlow` and `o2Flow` dimensions (`lpm` / `cfm`). The
  nitrox-stick tab passes `show={['pressure', 'volume', 'airFlow', 'o2Flow']}`.

## New math modules (`src/lib/diveMath/`, pure SI, TDD)

Shared depth→pressure helper. `depthPerBar(water)` → `10` (salt) / `10.3`
(fresh) already lives in `modEnd.ts` (tested, consumed). **Decision:** add
`ataAtDepth` to `modEnd.ts` alongside it rather than create a new file for two
tiny functions; all new modules import `depthPerBar` and `ataAtDepth` from
`./modEnd`.

- `ataAtDepth(depthM, water): number` = `depthM / depthPerBar(water) + 1`
  (exported from `modEnd.ts`; covered by a new `modEnd.test.ts` case).

### `bestMix.ts`
- `bestFo2({ depthM, ppo2, water }): number` = `ppo2 / ataAtDepth(depthM, water)`,
  clamped to `<= 1`.
- `bestFhe({ depthM, targetEndM, water }): number` (o2-narcotic model) =
  `max(0, 1 - (targetEndM + D0) / (depthM + D0))`, `D0 = depthPerBar(water)`.
- `bestMix({ depthM, ppo2, targetEndM?, water })` returns
  `{ fo2, fhe, fn2 }` (fractions) with `fhe = 0` when `targetEndM` omitted.
- **Tests:** FO₂ for 30 m salt @1.4 ≈ 0.35; clamp at shallow depth (FO₂≤1);
  FHe for 60 m capped to 30 m END (o2-narcotic) ≈ 0.42; `targetEndM` omitted →
  fhe 0; fresh vs salt difference.

### `ead.ts`
- `ead({ depthM, fo2, fhe, water }): number` =
  `(depthM + D0) * (fn2 / 0.79) - D0`, `fn2 = 1 - fo2 - fhe`.
- **Tests:** EAN32 @ 30 m salt ≈ 24.4 m; air → returns depth; richer nitrox →
  shallower EAD; fresh vs salt.

### `gasDensity.ts`
- Component densities at 0 °C, 1 atm (g/L): O₂ `1.42897`, N₂ `1.2506`,
  He `0.17846`.
- `surfaceDensity({ fo2, fhe }): number` =
  `fo2*1.42897 + (1-fo2-fhe)*1.2506 + fhe*0.17846`.
- `densityAtDepth({ fo2, fhe, depthM, water }): number` =
  `surfaceDensity * ataAtDepth(depthM, water)`.
- `depthForDensity({ fo2, fhe, density, water }): number` =
  `((density / surfaceDensity) - 1) * depthPerBar(water)`.
- Limits: `RECOMMENDED_MAX = 5.2`, `HARD_MAX = 6.3` (g/L). Component reports
  density at depth plus the recommended/hard-max depths.
- **Tests:** air surface density ≈ 1.293 g/L; EAN32 density at 30 m salt
  (≈ 1.30 × 4 = 5.2 g/L) flags recommended limit; trimix is less dense than
  nitrox at the same depth; `depthForDensity` inverse round-trips.

### `gasMixing.ts`
- `mixTwoGases(a, b)` where each is `{ pressure, fo2, fhe }` (pressure bar
  gauge): `pf = pa + pb`; `fo2 = (fo2a*pa + fo2b*pb)/pf`; `fhe` analogous.
  Returns `{ pressure, fo2, fhe }`. `pf <= 0` → returns the zero/empty result
  (fractions default to gas `a`'s, pressure 0).
- **Tests:** equal pressures of air + EAN36 → EAN ~28.5; topping trimix with
  air dilutes He proportionally; one side zero pressure → other side's mix; sum
  of pressures correct.

### `oxygenExposure.ts` (full-day, multi-dive)
- NOAA single-exposure CNS limits (ppO₂ → max minutes), linearly interpolated:
  `0.6→720, 0.7→570, 0.8→450, 0.9→360, 1.0→300, 1.1→240, 1.2→210, 1.3→180,
  1.4→150, 1.5→120, 1.6→45`. Below 0.6 → no CNS accrual (limit ∞ → 0%).
  Above 1.6 → use the 1.6 limit and flag.
- `cnsLimitMinutes(ppo2): number` (interpolated; `Infinity` below 0.6).
- `segmentCns({ ppo2, minutes }): number` = `minutes / cnsLimitMinutes(ppo2) * 100`.
- `segmentOtu({ ppo2, minutes }): number` =
  `ppo2 <= 0.5 ? 0 : minutes * Math.pow((ppo2 - 0.5) / 0.5, 0.83)`.
- Day items: an ordered array of `{ type: 'dive', ppo2, minutes }` and
  `{ type: 'surface', minutes }`. (The component computes a dive's `ppo2` from
  depth + mix + water via `ataAtDepth`, or accepts ppo₂ directly.)
- `computeDay(items): { peakCnsPercent, endCnsPercent, totalOtu, perDive: [...] }`
  - Running CNS starts at 0; each dive adds its `segmentCns`; each surface
    interval multiplies running CNS by `0.5 ** (minutes / 90)` (90-min
    half-time). `peakCnsPercent` = max running CNS after any dive.
  - OTU sums across dives (no surface decay).
- **Tests:** single 1.4/100 min dive → CNS = 100/150*100 ≈ 66.7%, OTU ≈ 100;
  two identical dives split by a 60-min SI → second dive starts from decayed
  CNS, peak < naive sum; OTU is additive; ppO₂ < 0.5 → OTU 0; interpolation
  midpoint (e.g. ppO₂ 1.35) between table rows.

### `gasPlanning.ts` (SAC/RMV + detailed rock-bottom)
- `sacRate({ startP, endP, minutes, avgDepthM, water }): number` (bar/min,
  surface-normalized) = `((startP - endP) / minutes) / ataAtDepth(avgDepthM, water)`.
- `rmv({ startP, endP, minutes, avgDepthM, tankVolumeL, water }): number`
  (litres/min) = `sacRate(...) * tankVolumeL`.
- `diveGasRequirement({ rmvLpm, avgDepthM, minutes, water }): number` (surface L)
  = `rmvLpm * ataAtDepth(avgDepthM, water) * minutes`.
- `rockBottom({ rmvLpm, depthM, ascentRateMpm, stops, stressFactor, water,
  teamSize })`:
  - `stressedRmv = rmvLpm * stressFactor` (default `stressFactor = 2`).
  - Ascent gas (bottom → surface or first stop): `ascentMinutes = depthM /
    ascentRateMpm` (default `ascentRateMpm = 9`); average ascent ata uses the
    midpoint depth `depthM / 2`: `stressedRmv * ataAtDepth(depthM/2, water) *
    ascentMinutes`.
  - Stops: each `{ depthM, minutes }` adds `stressedRmv *
    ataAtDepth(stop.depthM, water) * stop.minutes`. Default stops `[{ depthM: 5,
    minutes: 3 }]`.
  - `× teamSize` (default 2).
  - Returns surface litres `minGasL`.
- `minGasPressure({ minGasL, tankVolumeL }): number` (bar) = `minGasL / tankVolumeL`.
- **Tests:** SAC from a known dive (e.g. 200→100 bar, 20 min, 20 m salt,
  12 L → SAC ≈ 1.67 bar/min, RMV ≈ 20 L/min); gas requirement scales with depth
  ata; rock-bottom for a 30 m dive with default stop & team 2 yields a sane
  pressure; stressFactor & teamSize scale linearly; minGasPressure inverse.

### `compressibility.ts` (real-gas, opt-in)
- Per-gas compressibility factor over 0–300 bar via a documented quadratic fit
  `Z_gas(P) = 1 + b1·P + b2·P²` with constants for O₂, N₂, He (source cited in
  code comment; He ~ideal/slightly >1, O₂/N₂ dip below 1 at moderate P).
- `mixZ({ fo2, fhe, pressureBar }): number` = mole-fraction-weighted gas Z.
- Consumed by the opt-in path in `blending.ts`/`cascade.ts` (below). The module
  itself is standalone and tested.
- **Tests:** `mixZ` at 1 bar ≈ 1 for any mix; He-rich mix Z ≥ air Z at 200 bar;
  monotonic direction vs pressure for each gas; air Z at 200 bar within a
  documented tolerance of a reference value.

### Existing-module changes (ideal-gas stays default)
- `blending.ts`: `calculateBlend(input, opts?: { useRealGas?: boolean })`.
  When `useRealGas`, partial pressures are corrected via `mixZ` at the relevant
  pressures; default (no opts / `false`) is byte-for-byte the current behavior.
  Existing tests unchanged; new tests cover the real-gas branch and that the
  default path is identical.
- `cascade.ts`: `calculateCascade(input, opts?: { useRealGas?: boolean })`.
  Real-gas path scales the equalization by `mixZ` of the (assumed air, or
  caller-supplied) gas at each stage pressure. Default unchanged. **Note:**
  cascade currently has no mix input; for the real-gas path assume air unless a
  later iteration adds per-cylinder mix. Documented as an approximation.

## Reusable pickers (`src/components/Tools/`)

### `presets.ts`
```ts
export interface TankPreset { name: string; waterVolumeL: number; ratedBar: number }
export const DIVE_TANKS: TankPreset[]        // AL80, AL63, AL40, AL30, HP100, HP117, HP130, LP85, LP95, 12L, 15L, 7L, 3L
export const STORAGE_TANKS: TankPreset[]      // UN 45L/310, UN 50L/300, UN 50L/232
export const INDUSTRIAL_TANKS: TankPreset[]   // T, K, Linde/Messer 50L @200/300 bar (sourced — see appendix)
export interface MixPreset { name: string; fo2: number; fhe: number } // fractions
export const MIXES: MixPreset[]               // Air, EAN28/32/36/40/50/80, O2(100), TMX 21/35,18/45,15/55,10/70
```
Preset values listed in the appendix below.

### `TankSizePicker.tsx`
`'use client'`. Props: `{ category: 'dive'|'storage'|'industrial', onSelect:
(waterVolumeL: number, ratedBar: number) => void }`. ListBox of the category's
presets plus a "Custom" entry (selecting Custom does nothing — leaves the
existing manual field values). On preset select, the consuming component sets
its volume field to `fromLiters(waterVolumeL, units.volume)` (and pressure to
`fromBar(toBar?...)` — preset `ratedBar` → display via `fromBar`). Reused by
Cascade (bank rows = storage/industrial; dive cylinder = dive), Nitrox Stick
(supply = industrial; tank = dive), Gas Requirements (tank = dive).

### `MixPicker.tsx`
`'use client'`. Props: `{ onSelect: (fo2Pct: number, fhePct: number) => void }`.
ListBox of `MIXES` (label shows e.g. "EAN32" / "Trimix 18/45" / "O₂ 100%") plus
"Custom". On select, sets the FO₂/He percent fields. Reused by Blend
(start+target), Mix Two Gases, Best Mix (target only where relevant), Gas
Density, EAD, MOD/END, Oxygen Exposure.

## New components

One `'use client'` component per new tab, each: reuses `NumberInput`,
`ListBox`/`RadioGroup`, `useUnits`, `UnitToggle`, the pickers; converts inputs
to SI and results to display units; theme tokens only; inline validation
messages instead of NaN/Infinity.

- `BestMixCalculator` — depth + ppO₂ (default 1.4) + optional target END →
  recommended FO₂/FHe; shows implied MOD. `UnitToggle show={['depth']}`.
- `EadCalculator` — mix (MixPicker) + depth + water → EAD. `show={['depth']}`.
- `GasDensityCalculator` — mix + depth + water → density at depth, recommended
  (5.2) and hard (6.3) max depths, with a pass/caution flag. `show={['depth']}`.
- `GasMixingCalculator` — two gases (pressure + MixPicker each) → resulting
  pressure + mix. `show={['pressure']}`.
- `OxygenExposureCalculator` — editable ordered list of dive segments
  (depth + mix + minutes) and surface intervals (minutes); add/remove rows;
  shows per-dive CNS%/OTU, peak CNS%, end-of-day CNS%, total OTU.
  `show={['depth']}`.
- `GasRequirementsCalculator` — two sections: (1) SAC/RMV from a logged dive
  (start/end pressure, time, avg depth, tank via TankSizePicker); (2) rock-
  bottom + dive gas using the computed (or entered) RMV, depth, ascent rate,
  editable stops, stress factor, team size, tank. `show={['pressure','depth','volume']}`.
- `BlendingCostCalculator` — start + target mix/pressure (or reuse blend inputs)
  → O₂/He consumed (partial pressures × tank volume → surface volume) × prices;
  price fields persist in localStorage. `show={['pressure','volume']}`.

### Compressibility toggle
Add a `CheckBox`/toggle "Account for gas compressibility (real-gas)" to the
existing `BlendCalculator` and `CascadeCalculator`; passes `{ useRealGas }` to
the math. Off by default. A short note that it's an approximation.

### Retrofit existing tabs for MixPicker
`ModEndCalculator` and `BlendCalculator` adopt `MixPicker` above their FO₂/He
inputs for consistency (manual entry still works via "Custom").

## localStorage keys
- `fillstation.tools.units` — existing, now includes `flow`.
- `fillstation.tools.gasPrices` — `{ o2, he, air?, fillFee? }` numbers for the
  cost calculator; defaults provided; merged over defaults on read.

## Error handling
Inline, per-tab: FO₂+FHe > 1, non-positive volumes/pressures/times, target
below start, ppO₂ out of range, density/exposure beyond limits → clear flags,
never raw `NaN`/`Infinity`.

## Testing (Vitest)
Every new math module is TDD with the cases listed above; the real-gas branch
adds tests without altering existing ideal-gas tests. Components verified via
`npm run build` + manual smoke (no DOM test framework). Final task runs
`npm test && npm run build && npm run lint && npm run knip`.

## Build order (high level — detailed in the plan)
1. Units: add `flow` + re-add `fromLiters` (+ tests).
2. New math modules, each TDD: `bestMix`, `ead`, `gasDensity`, `gasMixing`,
   `oxygenExposure`, `gasPlanning`, `compressibility`; add `ataAtDepth`.
3. Real-gas opt-in paths in `blending.ts` / `cascade.ts` (+ tests).
4. `presets.ts`, `TankSizePicker`, `MixPicker`.
5. Tab registry + `ToolsTabs`/`ToolsPage` rewrite + disclaimer.
6. New calculator components (one per tab).
7. Retrofit MOD/END + Blend with MixPicker; add compressibility toggle to
   Blend + Cascade; nitrox-stick flow unit.
8. `npm test && npm run build && npm run lint && npm run knip`.

---

## Appendix — Preset values

### Mixes (`MIXES`) — fo2 / fhe (fractions)
- Air — 0.21 / 0
- EAN28 — 0.28 / 0
- EAN32 — 0.32 / 0
- EAN36 — 0.36 / 0
- EAN40 — 0.40 / 0
- EAN50 — 0.50 / 0
- EAN80 — 0.80 / 0
- Oxygen 100% — 1.00 / 0
- Trimix 21/35 — 0.21 / 0.35
- Trimix 18/45 — 0.18 / 0.45
- Trimix 15/55 — 0.15 / 0.55
- Trimix 10/70 — 0.10 / 0.70

### Dive cylinders (`DIVE_TANKS`) — water volume (L) / rated (bar)
- AL80 (S80) — 11.1 / 207
- AL63 — 9.0 / 207
- AL40 — 5.7 / 207
- AL30 (pony) — 4.3 / 207
- HP100 — 12.9 / 237
- HP117 — 15.0 / 237
- HP130 — 16.6 / 237
- LP85 — 11.1 / 182
- LP95 — 12.4 / 182
- Steel 12 L — 12.0 / 232
- Steel 15 L — 15.0 / 232
- Steel 7 L (stage) — 7.0 / 232
- Steel 3 L (pony) — 3.0 / 232

### Storage / bank cylinders (`STORAGE_TANKS`) — water volume (L) / rated (bar)
- UN 45 L — 45 / 310
- UN 50 L (300) — 50 / 300
- UN 50 L (232) — 50 / 232

### Industrial supply bottles (`INDUSTRIAL_TANKS`) — water volume (L) / rated (bar)
Values from manufacturer spec sheets (Airgas, Praxair/Linde-NA, Messer); see
sources in the code comment. "T" and "K" are the US (Airgas/Praxair)
designations; Linde/Messer (EU) rate the equivalent bottles by litre.
- T cylinder (Airgas 300 / Praxair T) — 49 / 165   (2400 psi, DOT 3AA-2400)
- K cylinder (Airgas 200 / Praxair K) — 43.8 / 156 (2265 psi)
- Linde/Messer 50 L (200 bar) — 50 / 200
- Linde/Messer 50 L (300 bar) — 50 / 300

> Letter sizes are not consistent across vendors (e.g. Scott labels the 9×55
> "K"); the values above follow the Airgas/Praxair convention. Storage figures
> remain nominal; "Custom" entry is always available.

**Source citation (to include in `presets.ts` comment):** Airgas Specialty Gas
Cylinder Dimensions (ap003.pdf), Airgas Size Comparison Chart (ap004.pdf),
Praxair/Linde Cylinders & Containers spec sheet, Messer Reine Gase 2021.
