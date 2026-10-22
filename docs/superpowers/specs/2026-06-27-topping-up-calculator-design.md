# "Topping Up" Calculator — Design

**Date:** 2026-06-27
**Status:** Draft (pending user review)

## Overview

Replace the confusing "Mix Two Gases" tool (which asks for two arbitrary
pressure + mix pairs) with a **"Topping Up"** calculator framed around the
question fillers actually ask: *I have a partial cylinder of one gas — if I top
it up to a target pressure with a second gas, what mix do I end up with, and how
much did I add?*

Example: 200 psi of air, topped to 3000 psi with EAN32, lands at **~31.3 % O₂**
(slightly under 32 because of the residual air). Real-gas compressibility is
applied (the global setting), so the result reflects the actual mole-weighted
blend rather than a naïve gauge-pressure average. The starting pressure defaults
to `0` (empty cylinder); the mixes and fill pressure carry sensible defaults
(air → EAN32 → 3000).

Reference-only — same disclaimer as the rest of the tools. This is a UI reframe
plus a new mole-weighted blend function; the math engine reuses the existing
`mixZ` compressibility model.

## Tool identity

In `src/components/Tools/toolsRegistry.ts`, the existing `mix-two-gases` entry
becomes:

- `id`: `top-up` (replaces `mix-two-gases` in the `TabId` union)
- `name`: `Topping Up`
- `group`: `blending` (unchanged)
- `Component`: `ToppingUpCalculator`
- `description`: `Fill a partial cylinder up to a target pressure with a top-up
  gas and see the resulting mix and how much gas you added.`

Selection is via the `?tab=` query param (`ToolsPage` falls back to `cascade`
for an unknown tab), so old `?tab=mix-two-gases` links degrade gracefully to the
default tab. No hard route changes.

Rename the component file `GasMixingCalculator.tsx` → `ToppingUpCalculator.tsx`
(and the component symbol `GasMixingCalculator` → `ToppingUpCalculator`). Update
the registry import.

## Math

### New function `topUpMix` (in `src/lib/diveMath/gasMixing.ts`)

Replaces `mixTwoGases` (which is only consumed by the calculator being
rewritten). Work in **absolute** pressure throughout.

```ts
import { ATMOSPHERIC_BAR } from './units'
import { mixZ } from './compressibility'

export interface TopUpInput {
	startBar: number // starting (gauge) pressure, bar
	startFo2: number // starting mix O₂ fraction (0–1)
	startFhe: number // starting mix He fraction (0–1)
	topFo2: number // top-up gas O₂ fraction (0–1)
	topFhe: number // top-up gas He fraction (0–1)
	finalBar: number // target (gauge) pressure to fill to, bar
	useRealGas?: boolean // apply compressibility (global setting); default false
}

export interface TopUpResult {
	finalBar: number // resulting (gauge) pressure: finalBar, or startBar if no top-up
	addedBar: number // top-up gas added (gauge bar): max(0, finalBar - startBar)
	fo2: number // resulting O₂ fraction (0–1)
	fhe: number // resulting He fraction (0–1)
	noTopUp: boolean // true when finalBar <= startBar (nothing added)
}
```

Behaviour:

1. **No top-up** — if `finalBar <= startBar`: return
   `{ finalBar: startBar, addedBar: 0, fo2: startFo2, fhe: startFhe,
   noTopUp: true }`. (User decision: a final at/below start means nothing was
   added; show the starting mix unchanged.)

2. **Blend weight `r`** = fraction of the *final* gas content (moles) that came
   from the starting gas. The final mix is the linear blend
   `finalFrac = r · startFrac + (1 − r) · topFrac` for both O₂ and He.

   - `startAbs = startBar + ATMOSPHERIC_BAR`, `finalAbs = finalBar +
     ATMOSPHERIC_BAR`.
   - **Ideal** (`useRealGas` falsy): `r = startAbs / finalAbs`.
   - **Real-gas** (`useRealGas` true): gas content ∝ `Pabs / Z(mix, Pabs)`
     (the same content model `cascade`/`booster` use, `w = V·P / Z`). So
     `r = (startAbs / Z_start) / (finalAbs / Z_final)` where
     `Z_start = mixZ({ fo2: startFo2, fhe: startFhe, pressureBar: startAbs })`
     and `Z_final = mixZ({ fo2, fhe, pressureBar: finalAbs })`. Because
     `Z_final` depends on the final mix, solve by fixed-point iteration: seed
     `fo2`/`fhe` with the ideal blend (`r = startAbs/finalAbs`), then for a
     fixed 10 iterations recompute `Z_final`, `r`, and the blend. (Converges in
     3–4 iterations; 10 is a safe constant — no early-exit needed.)

3. Return `{ finalBar, addedBar: finalBar - startBar, fo2, fhe, noTopUp: false }`.

Notes:
- An empty start (`startBar = 0` ⇒ `startAbs = ATM`, small `r`) blends almost
  entirely toward the top-up mix; a literally-zero-absolute case cannot occur
  because `ATMOSPHERIC_BAR > 0`.
- Fractions are not clamped here (an invalid O₂+He>100 % input is flagged in the
  UI, see below); the function just blends whatever fractions it is given.

Remove the old `mixTwoGases` function and its `GasFill` interface (no other
consumer — verified: only `GasMixingCalculator` imported them).

## Component (`ToppingUpCalculator.tsx`)

`'use client'`. Reads `units` and `useRealGas` from `useUnits()`. Layout follows
the existing calculator conventions (sections, `NumberInput`, `MixPicker`,
`SafetyNote`, theme tokens, rounding helpers).

Persisted state — prefix `tu.`. The **starting pressure** initializes to `0`
(empty cylinder — no pressure pre-suggested); the mixes and final pressure carry
sensible defaults (air start, EAN32 top-up, 3000 fill).

| State | Key | Hook | Initial |
|---|---|---|---|
| start pressure | `tu.startP` | `usePersistedPressure` | 0 |
| start O₂ % | `tu.startO2` | `usePersistedState` | 21 |
| start He % | `tu.startHe` | `usePersistedState` | 0 |
| top-up O₂ % | `tu.topO2` | `usePersistedState` | 32 |
| top-up He % | `tu.topHe` | `usePersistedState` | 0 |
| final pressure | `tu.finalP` | `usePersistedPressure` | 3000 |

With the start pressure at `0` and a 3000 fill, the initial render computes a
real result (topping an empty cylinder with EAN32 ⇒ ~32 % O₂); `noTopUp` only
shows once a user sets the final at or below the start.

Sections:

1. **Starting gas** — `MixPicker` (sets start O₂/He) + a 3-up grid:
   `Pressure ({units.pressure})`, `O₂ (%)`, `He (%)`. `SafetyNote level="danger"`
   when `startO2 + startHe > 100`.
2. **Top-up gas** — `MixPicker` (sets top-up O₂/He) + `O₂ (%)`, `He (%)`.
   `SafetyNote` when `topO2 + topHe > 100`.
3. **Fill to** — `Final pressure ({units.pressure})` (`NumberInput`, `min={0}`).
4. **Result** (bordered card):
   - Big `fmtMix(resultO2Pct, resultHePct)`.
   - Sub-line: `{roundPressure(result.finalBar…)} {unit} · O₂ {o2}% · He {he}%`.
   - **Added** line: `Added {roundPressure(result.addedBar…)} {unit} of
     {fmtMix(topO2, topHe)}` — hidden when `noTopUp`.
   - When `noTopUp`: a `SafetyNote level="warning"` (or muted note) reading
     "Final pressure is at or below your start — nothing added, showing your
     starting mix."

Call:

```ts
const result = topUpMix({
	startBar: toBar(startP, units.pressure),
	startFo2: startO2 / 100,
	startFhe: startHe / 100,
	topFo2: topO2 / 100,
	topFhe: topHe / 100,
	finalBar: toBar(finalP, units.pressure),
	useRealGas,
})
```

Display rounding: `roundPressure` for pressures, `roundPercent` for the result
O₂/He %, `fmtMix` for the mix labels. Pressures fed into `topUpMix` are the raw
`toBar(...)` conversions (never rounded).

## Files

- **Modify:** `src/lib/diveMath/gasMixing.ts` (replace `mixTwoGases` +
  `GasFill` with `topUpMix` + `TopUpInput`/`TopUpResult`);
  `src/components/Tools/toolsRegistry.ts` (id/name/description/import).
- **Create:** `src/components/Tools/ToppingUpCalculator.tsx`;
  `src/lib/diveMath/gasMixing.test.ts`.
- **Delete:** `src/components/Tools/GasMixingCalculator.tsx` (content moves to
  the renamed file).

## Testing

`gasMixing.test.ts` (Vitest, relative imports — no `@/` alias in tests):

- **Worked example (ideal):** start 13.79 bar (≈200 psi) air (fo2 0.21), top-up
  fo2 0.32, final 206.84 bar (≈3000 psi), `useRealGas` false → `fo2 ≈ 0.312`
  (assert `toBeCloseTo(0.31, 2)`, i.e. within 0.005 — robust to the small
  absolute-vs-gauge difference); `addedBar ≈ 193.05`.
- **Empty start:** `startBar 0`, top-up 0.32 → `fo2` very close to 0.32
  (`r = ATM/finalAbs`, tiny) and `fhe ≈ 0`.
- **No top-up:** `finalBar <= startBar` → `noTopUp true`, `addedBar 0`,
  `fo2 === startFo2`, `finalBar === startBar`.
- **Real-gas direction:** identical inputs with `useRealGas true` vs false —
  the O₂-heavy result differs from ideal (assert the two results are not equal
  and the real-gas O₂ fraction moves in the expected direction for an O₂-rich
  top-up). Keep the assertion tolerant (the shift is small) but non-trivial.
- **`addedBar`** equals `finalBar - startBar` for a normal top-up.

No other dive-math module changes, so the rest of the suite stays green. The
component is verified by build + lint + manual smoke (the math is covered by the
unit tests).

## Out of scope

- Keeping the old two-arbitrary-pressures mode (fully replaced).
- A multi-step / multi-gas top-up sequence (that's the existing Blend (PP) tool).
- Temperature / hot-fill handling for this tool (the question is "what mix",
  not "what fill pressure when hot").
- Any change to the compressibility coefficients or other tools.
