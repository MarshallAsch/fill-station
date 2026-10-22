# Booster Cycle Timing, Compressor Duty & Two-Stage — Design

**Date:** 2026-06-26
**Status:** Draft (pending user review)
**Extends:** `2026-06-26-booster-calculator-design.md` (the existing Booster tab) and
its implementation in `src/lib/diveMath/booster.ts` + `BoosterCalculator.tsx` +
`BoosterChart.tsx`.

## Overview

Extend the Booster calculator with: two-stage booster support (regulated low
inlet + bypass equalization), per-model drive-gas-per-cycle and max drive-air
consumption, a drive-gas compressor model (output rate, storage tank) yielding a
**rough duty cycle**, **cycle timing** (seconds per cycle, total fill time) with
slow/fast warnings, and **time-axis graphs** (supply + receiver pressure on a
dual axis; cycle rate with warning bands).

Explicitly **out of scope (deferred):** an adjustable drive-gas *flow limit*
(needle-valve cycle-speed control). The drive pressure remains the ceiling/energy
control; cycle speed is governed by booster max consumption then compressor
output.

All math stays pure SI in `src/lib/diveMath/booster.ts` (TDD); the UI converts at
the boundary. Pressures bar gauge (absolute = +`ATMOSPHERIC_BAR`); volumes
litres; rates litres/min; time seconds.

## Two-stage boosters (regulated inlet)

A two-stage booster regulates the source gas down to a **fixed low inlet
pressure** before stage 1. Model this as an **inlet cap**: the effective boost
inlet pressure at any point is `min(supplyPressure, regulatedInlet)`. This
unifies single- and two-stage:

- **Single-stage:** no cap — effective inlet = current supply pressure (falls as
  the supply drains). Drive air = the existing log integral.
- **Two-stage:** cap at `regulatedInletBar`. While the supply is above the cap,
  inlet is constant at the cap (drive air accrues *linearly*); once the supply
  drains below the cap, inlet follows the supply down (log integral).
- **Bypass equalization still applies:** if the supply starts above the receiver,
  free equalization to `P_eq` happens first (via the booster's bypass), then the
  boost phase begins — unchanged from the existing model.
- Max output uses the existing stored ratio (the output-stage ratio, e.g. 40 for
  a 15/40 two-stage).

### Drive-air with an inlet cap (closed form)
Let `inletStartAbs` = post-equalization supply abs pressure, `Q = Vr·(target −
boostStartReceiver)` (free litres to the receiver), `cap = regulatedInletAbs`
(or `+∞` for single-stage), `drivePAbs = driveP + ATM`.

- Crossover where supply falls to the cap: `qStar = max(0, Vs·(inletStartAbs −
  cap))`. (If `cap ≥ inletStartAbs`, `qStar = 0` — no constant segment, identical
  to single-stage.)
- **Constant-inlet segment** for `q ∈ [0, min(Q, qStar)]`: inlet = `cap`,
  `driveSeg1 = ratio · drivePAbs / cap · min(Q, qStar)`.
- **Falling-inlet segment** for `q ∈ [min(Q,qStar), Q]` (only if `Q > qStar`):
  `driveSeg2 = ratio · drivePAbs · Vs · ln( capOrStart / (inletStartAbs − Q/Vs) )`
  where `capOrStart = min(cap, inletStartAbs)` (= `cap` when a constant segment
  preceded it, else `inletStartAbs`).
- `driveAirL = driveSeg1 + driveSeg2`.

Single-stage (`cap = ∞`) reduces to `driveSeg2 = ratio·drivePAbs·Vs·ln(inletStart/
finalInlet)` exactly as today — existing tests must still pass.

## Per-model booster data (sourced into presets)

Extend `BoosterPreset` with:
- `twoStage: boolean`
- `vdPerCycleL: number` — free litres of drive air consumed per cycle (drive-piston
  displacement at the rated drive pressure)
- `driveMaxLpm: number` — the booster's max free-air drive consumption (≈ max
  cycle rate × `vdPerCycleL`)

Values sourced from Haskel/USUN datasheets where available; where a number isn't
published, use a cited reasonable estimate (same discipline as the cylinder data)
and keep the corresponding **editable input field** so the user can override.
Two-stage models (USUN GBT/SBT 15/40; Haskel AGT if added) get `twoStage: true`.

## Compressor model + timing

New optional inputs (in `BoosterCalculator`): drive-gas **compressor output rate**
`C` (litres/min via the airFlow unit), **storage volume** (US gallons → litres,
`1 gal = 3.785411784 L`), storage **max** and **min** pressure (bar). Plus the
two booster fields `vdPerCycleL`, `driveMaxLpm` (auto-filled by the preset,
editable), and `regulatedInletBar` (shown only for two-stage).

Pure-math `boosterTiming(args): BoosterTiming | null` where
`args = { driveAirL, vdPerCycleL, driveMaxLpm, compressorRateLpm, storageL,
storageMaxBar, storageMinBar }`. Returns `null` if the required data
(`vdPerCycleL`, `compressorRateLpm`) is missing.

- `totalCycles = driveAirL / vdPerCycleL`.
- Storage buffer free air `B = storageL · (storageMaxBar − storageMinBar)` (0 if
  storage not given).
- **If `driveMaxLpm ≤ compressorRateLpm`** (compressor keeps up): single phase —
  `fillSeconds = driveAirL / driveMaxLpm · 60`; `cycleRate = driveMaxLpm /
  vdPerCycleL / 60` (cycles/sec); `dutyCycle = driveMaxLpm / compressorRateLpm`
  (compressor cycles on/off); `dutyContinuous = false`.
- **Else (`driveMaxLpm > compressorRateLpm`)** — two phases:
  - Phase 1 (buffered): booster at `driveMaxLpm`, deficit `(driveMaxLpm − C)`
    drains `B`: `phase1Seconds = B / (driveMaxLpm − C) · 60`; drive used in P1 =
    `driveMaxLpm · phase1Seconds/60`; `cycleRate1 = driveMaxLpm/vdPerCycleL/60`.
  - Phase 2 (compressor-limited): remaining drive = `driveAirL − driveP1`;
    `phase2Seconds = remaining / C · 60`; `cycleRate2 = C/vdPerCycleL/60`.
  - `fillSeconds = phase1Seconds + phase2Seconds`; `dutyContinuous = true`
    (compressor runs ~100% during the fill); `dutyCycle = 1`.
- Clamp non-finite/negative to sane values; if `driveAirL = 0` (no boost), timing
  is all zero.

`secondsPerCycle` per phase = `vdPerCycleL / rateLpm · 60`.

**Warnings (SafetyNote):**
- Danger if any active `cycleRate > 1` /sec — "Booster cycling faster than ~1/s —
  hard on the booster; lower the drive pressure or use a smaller drive supply."
- Warning if the compressor-limited `cycleRate2 < 1/30` /sec — "Compressor
  undersized — the booster will cycle very slowly for ~`phase2` of the fill."

## Graphs (x-axis = time)

`boosterFillProfile` is extended to attach, per sampled point: `timeSeconds`,
`cumulativeCycles`, and `cycleRatePerSec`. Time is derived from the cumulative
drive air and the phase rates (P1 at `driveMaxLpm`, P2 at `C`); if timing data is
absent, the profile omits time fields and the UI falls back to the
receiver-pressure x-axis for the pressure chart and hides the cycle-rate chart.

Two charts (replacing the small-multiples), both x = time:
1. **Pressure vs time — dual axis.** Supply pressure on the **left** y-axis
   (falling), receiver pressure on the **right** y-axis (rising), each scaled to
   its own real range with axis min/max labels; two lines, real-scaled (not
   normalized). Left axis + supply line in one theme colour, right axis +
   receiver line in another.
2. **Cycle rate vs time.** Cycle rate (cycles/sec) line; a shaded **red band**
   for the region above 1/sec and an **amber band** below 1/30 s, so the slow
   stretch (Phase 2) reads as a duration. Y in cycles/sec; x = time (shared).

The drive-air rate is expressed in **volume/time** (the airFlow unit) wherever
shown — the old `L/bar` series is removed.

A small `DualAxisChart` (lightweight inline SVG, left/right y-axis ticks) and a
`BandedLineChart` (line + shaded threshold bands) — or one configurable chart —
replace the current normalized multi-line `BoosterChart`. Theme tokens only;
responsive `viewBox`; no horizontal overflow.

## Component changes (`BoosterCalculator`)

- Booster section gains `vdPerCycleL` and `driveMaxLpm` editable fields
  (auto-filled by `BoosterPicker`), and a `regulatedInletBar` field shown only
  when the selected model `twoStage` (default via a checkbox/flag for Custom).
- New **Drive compressor** section: output rate (airFlow unit), storage volume
  (gallons), storage max & min pressure (pressure unit).
- Estimate panel adds: total cycles, total fill time (mm:ss or minutes),
  seconds/cycle (per phase if two-phase), and duty cycle (`x%` when the
  compressor cycles, or "~100% (continuous)" when buffer-limited).
- The "Max output pressure" line stays removed (done previously); stall
  feasibility still uses `ratio × drive` internally.
- Units: pressures via toBar/fromBar; water volumes litres; storage gallons →
  litres internally; rates via the airFlow unit (`toLpm`/`fromLpm`); time shown
  in s/min.

## Testing (`booster.test.ts`)

- Two-stage capped-inlet drive air: a case where `regulatedInletBar < P_eq` (a
  constant segment + a falling segment) hand-checked; and `regulatedInletBar` ≥
  supply reduces to the single-stage value (parity with the existing test).
- Existing single-stage tests unchanged (cap absent/∞).
- `boosterTiming`: compressor-keeps-up case (single phase, duty < 1); buffer-
  limited case (two phases, `fillSeconds = phase1+phase2`, dutyContinuous);
  `totalCycles = driveAirL/vdPerCycleL`; returns `null` without required data;
  zero-boost → zero timing.
- Cycle-rate thresholds: a config that trips the >1/s danger and one that trips
  the <1/30 s warning.
- `boosterFillProfile`: time monotonically increasing; last `timeSeconds ≈
  fillSeconds`; `cumulativeCycles` last ≈ `totalCycles`; time fields omitted when
  timing data absent.

## Build order (detail in the plan)
1. `booster.ts`: inlet-cap (two-stage) drive-air math + tests (single-stage parity preserved).
2. `booster.ts`: `boosterTiming` + extend `boosterFillProfile` with time/cycles/rate + tests.
3. Presets: extend `BoosterPreset` (`twoStage`, `vdPerCycleL`, `driveMaxLpm`); source/cite values; picker fills them.
4. Charts: dual-axis pressure-vs-time + banded cycle-rate-vs-time (replace normalized chart).
5. `BoosterCalculator`: new fields (booster per-cycle/max, two-stage regulated inlet, compressor section), estimate additions, wire charts + warnings.
6. `npm test && npm run build && npm run lint && npm run knip`.
