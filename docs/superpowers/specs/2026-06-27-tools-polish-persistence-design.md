# Tools Rounding, Persistence & Fixes — Design

**Date:** 2026-06-27
**Status:** Draft (pending user review)

## Overview

A batch of Dive Tools polish/fixes:

1. Fix the nitrox compressor-intake default (100 → 5 CFM).
2. Consistent rounding of all displayed values via a shared formatting module.
3. A CNS/OTU standard-limits reference sidebar.
4. Gas-requirements: direct SAC/RMV entry, fix the hard-coded `L/min` unit, and
   a stress-factor tooltip.
5. Persist tool inputs (localStorage, no login) so switching tools / reloading
   doesn't reset everything.

Reference-only disclaimer unchanged. No dive-math algorithm changes (only display
formatting, a new input mode, and persisted state).

## 1. Nitrox default

`NitroxStickCalculator` `airFlow` default `useAirFlowState(100)` → `5` (≈ a real
compressor's free-air output in CFM, the default unit).

## 2. Rounding / formatting module

Create `src/lib/diveMath/format.ts` (pure, unit-aware, colocated with `units.ts`;
relative imports for vitest). Each helper takes the SI value + display unit (or a
display value where noted) and returns a rounded **number** (the components keep
appending the unit label), except `fmtMix` which returns a string:

```ts
roundPressure(bar, unit)   // psi → nearest 1; bar → nearest 0.1
roundVolume(litres, unit)  // cf → nearest 1; l → nearest 0.1
roundSac(lpm, unit)        // cf → nearest 0.01; l → nearest 0.1   (SAC/RMV)
roundTemp(displayTemp)     // nearest 0.1   (display temp in/out)
roundPercent(pct)          // nearest 0.1   (O2/He output %)
roundDepthDown(m, unit)    // m → floor to 0.1; ft → floor to 1   (MOD/ceilings)
fmtMix(o2Pct, hePct)       // hePct>0 ? `${o2}/${he}` : `${o2}`    (drop the /0)
```

Rounding implementation: `Math.round(x / step) * step` for the nearest-N helpers
(guard floating error, e.g. round to fixed decimals); `Math.floor(x / step) *
step` for `roundDepthDown`. `roundPercent` rounds the percent to one decimal.

Then sweep every tool, replacing ad-hoc `Math.round(fromBar(...))` /
`.toFixed(...)` with the matching helper:
- pressures → `roundPressure`
- free-gas volumes → `roundVolume`
- SAC/RMV rates → `roundSac`
- temperatures → `roundTemp`
- O₂/He result percentages → `roundPercent`
- MOD / depth ceilings → `roundDepthDown`
- mix labels rendered as `o2/he` → `fmtMix` (so a 0-helium mix shows `32`, not
  `32/0`). Apply wherever a mix is shown as `X/Y` (best-mix, mod-end, gas-density,
  blend step labels — audit during the sweep).

Drive-pressure, fill-time, cycle-rate etc. keep their current rounding (not in the
listed quantity types) unless they're pressures/volumes, in which case they use
the helpers too.

## 3. CNS / OTU standard-limits sidebar

Add an `OxygenLimitsNote` sidebar (FormulaPanel-style `<aside>`, placed via the
existing `2xl:relative` + `2xl:absolute` margin layout) on
`OxygenExposureCalculator`:
- **Single-exposure** ppO₂ → max minutes, rendered from the tool's own NOAA table
  in `oxygenExposure.ts` (don't duplicate the numbers — import/iterate the
  constant so the sidebar and the calc never drift).
- **Daily** caps: CNS 100% limit (80% common planning target) and OTU ~300/day
  (single day) — as stated reference text, matching what the tool computes.
- Reference-only note + a short "what CNS/OTU mean" line.

If the NOAA table isn't currently an exported constant, export it from
`oxygenExposure.ts` so the sidebar can iterate it.

## 4. Gas requirements

`GasRequirementsCalculator`:
- **Direct SAC/RMV entry.** A `RadioGroup` mode: "From a logged dive" (current
  fields) vs "Enter SAC/RMV directly". In direct mode, show one input — the RMV
  in `{units.volume}/min` — converted to L/min with a new `toLiters(displayVol,
  VolumeUnit)` helper in `units.ts` (the inverse of the existing `fromLiters`:
  `unit === 'cf' ? val * L_PER_CF : val`). Skip the start/end/time/avg-depth
  fields in this mode. The downstream `diveGasRequirement`/`rockBottom` consume
  the same `rmvLpm` (litres/min) regardless of how it was obtained.
- **Unit fix.** Replace `RMV: {rmvLpm.toFixed(1)} L/min` with
  `RMV: {roundSac(rmvLpm, units.volume)} {units.volume}/min` (cf/min in cf mode).
  Free-gas results and pressures use `roundVolume`/`roundPressure`.
- **Stress-factor tooltip.** Add a tooltip to the stress-factor input:
  "Multiplies your breathing rate (RMV) for the emergency ascent only — e.g. 2 =
  breathing twice as fast under stress. Affects the rock-bottom reserve, not the
  planned-dive gas." (Matches `rockBottom`: `stressedRmv = rmvLpm × stressFactor`.)

## 5. Tool-state persistence (no login)

`src/components/Tools/usePersistedState.ts`:
- `usePersistedState<T>(key: string, initial: T): [T, (v: T) => void]` —
  localStorage-backed `useState`. SSR-safe: initialize with `initial`, read the
  stored value in a `useEffect` on mount (mirrors `UnitsProvider`), and write on
  every change. Keys are namespaced `fillstation.tools.<key>`. JSON-serialised;
  malformed/again-absent storage falls back to `initial`.
- Persisted unit hooks in `useUnitState.ts`: add `usePersistedPressure(key,
  initial)`, `usePersistedDepth(key, initial)`, `usePersistedAirFlow(key,
  initial)` — the existing `useConverted` logic plus persistence of the **display
  value** (units are already persisted by `UnitsProvider`, so the stored display
  value stays consistent with the stored unit). Implementation: same convert-on-
  unit-change effect, but the underlying `useState` is replaced by
  `usePersistedState`.
- **Adoption.** Each tool's `useState`/`use*State` calls become the persisted
  variants with a stable per-tool key (e.g. `cas.banks`, `ns.final`,
  `b.ratio`). Arrays/objects (cascade banks, blend order) persist as JSON.
- Persistence stores the **display value**; no migration logic (best-effort, a
  malformed entry just falls back to the default).

## Files

- Create: `src/lib/diveMath/format.ts` (+ `format.test.ts`),
  `src/components/Tools/usePersistedState.ts` (+ `usePersistedState.test.ts` if
  pure-testable; otherwise build-verified), `src/components/Tools/OxygenLimitsNote.tsx`.
- Modify: `src/lib/diveMath/units.ts` (`toLiters`);
  `src/components/Tools/useUnitState.ts` (persisted variants);
  `oxygenExposure.ts` (export the NOAA table if needed);
  `GasRequirementsCalculator.tsx` (SAC mode, unit fix, tooltip);
  `OxygenExposureCalculator.tsx` (sidebar); and every calculator for the rounding
  sweep + persisted state (booster, cascade, blend, nitrox, best-mix, mod-end,
  ead, gas-density, gas-mixing, blending-cost, nitrox-stick, oxygen-exposure,
  gas-requirements).

## Testing

- `format.test.ts`: each rounding helper at boundaries (psi 1 / bar 0.1; cf 1 /
  l 0.1; sac cf 0.01 / l 0.1; temp 0.1; percent 0.1; depth floor m 0.1 / ft 1;
  `fmtMix` with/without helium).
- `usePersistedState` (if extracted to a pure read/write helper): round-trips
  through a localStorage mock; otherwise build + manual smoke.
- The dive-math suite stays green (no algorithm change); the rounding/persistence
  sweep is component-level, verified by build/lint and manual smoke.

## Out of scope

- Server/account-backed settings (this is localStorage only).
- Changing any dive-math algorithm or the unit conversion factors.
- A "reset to defaults" button for persisted state (could be a later add).
- Rounding of intermediate computed values — only displayed values.
