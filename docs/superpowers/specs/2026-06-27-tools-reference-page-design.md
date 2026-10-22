# Tools Reference Page — "The math behind the tools" — Design

**Date:** 2026-06-27
**Status:** Draft (pending user review)

## Overview

A new publicly-accessible documentation page, `/tools/reference`, that documents
the equations, algorithms, constants, and references behind every Dive Tool, so
users can verify the math the tools are based on. Sections are organized per tool
(grouped Blending / Planning, matching the registry), with shared models
(units, real-gas Z, depth↔pressure, temperature) documented once in a
**Fundamentals** section that the per-tool entries reference.

Content must reflect the **actual code** in `src/lib/diveMath/`, not generic dive
theory. Static content only — no data fetching, no computation, no new runtime
dependency. Equations are rendered with Unicode + monospace blocks (matching how
the app already renders O₂, ×, ÷, etc.), not a math-typesetting library.

Same reference-only disclaimer as the rest of the tools.

## Routing & access

- Create `src/app/tools/reference/page.tsx` — a server component (no `'use
  client'`, no fetching), mirroring `src/app/tools/about/page.tsx`'s container
  (`mx-auto max-w-3xl px-4 py-8`), back-link, and disclaimer banner.
- Public access: `/tools/about` is already publicly reachable; verify
  `src/proxy.ts` does not gate `/tools/reference` (the tools pages are public).
  If the middleware's public-path allowance is path-specific, add
  `/tools/reference` alongside `/tools/about`. (Implementer: read `src/proxy.ts`
  and match whatever pattern already exempts `/tools` / `/tools/about`.)
- Cross-links:
  - On `/tools/about`, add a link to `/tools/reference` (text:
    "Equations & references →"), styled like the existing `text-accent underline`
    back-link.
  - On `/tools/reference`, a back-link to `/tools` and a link to `/tools/about`.

## File structure

To keep files focused (the content is large — 12 tools + shared models), split
into presentational primitives + content section components under
`src/components/Tools/reference/`:

- `Formula.tsx` — a themed, horizontally-scrollable monospace block for an
  equation. Props: `{ children: ReactNode }`. Renders
  `<pre class="border-border bg-hover text-text my-2 overflow-x-auto rounded-md
  border p-3 font-mono text-sm">`. (The page body must never scroll
  horizontally; the formula scrolls inside its own container.)
- `ReferenceFundamentals.tsx` — the shared-models section.
- `ReferenceBlendingTools.tsx` — Cascade, Nitrox Stick, Blend (PP), Topping Up,
  Blending Cost, Booster.
- `ReferencePlanningTools.tsx` — MOD/END, Best Mix, EAD, Gas Density, CNS/OTU,
  Gas Requirements.
- `src/app/tools/reference/page.tsx` composes: disclaimer + intro + links +
  `<ReferenceFundamentals />` + `<ReferenceBlendingTools />` +
  `<ReferencePlanningTools />`.

Each tool entry follows the same shape:
1. `<h3>` tool name (matching the registry name).
2. **What it computes** — one or two sentences.
3. **Formula(s)** — one or more `<Formula>` blocks.
4. **Constants / assumptions** — bullet list of the exact constants and any
   assumptions (e.g. "air assumed for compressibility", "salt water d₀ = 10").
5. **References** — the standard source(s), and a cross-reference to the
   Fundamentals model(s) it uses rather than repeating them.

Theme tokens only (`text-text`, `text-light-text`, `border-border`, `bg-hover`);
no hardcoded colors, no `dark:` variants. Use Unicode for math (O₂, N₂, He, ×,
÷, ≈, ², ∫, →, ≤, ≥, ΔT, ρ).

## Content — exact formulas to document

All formulas below are transcribed from `src/lib/diveMath/`. The implementer
must keep them faithful to the code.

**Must be shown in full equation form (not just named/referenced):** MOD; END
for *both* models (N₂-only and O₂-narcotic); the complete Gas Requirements set
(SAC, RMV, gas needed, rock-bottom with the ascent + stops expansion, min gas);
and the partial-pressure Blend 2×2 system (the `bHe`/`bO₂`/`det` setup and the
`pHe`/`pO₂`/`pTop` solution, including the real-gas `Z` correction). These are
the equations a user is most likely to verify, so each gets its own `<Formula>`
block(s).

### Fundamentals

**Units & constants:** `ATMOSPHERIC_BAR = 1.01325`, `AIR_FO2 = 0.209`,
`AIR_FN2 = 0.791`, `PSI_PER_BAR = 14.5037738`, `L_PER_CF = 28.3168466`,
`FT_PER_M = 3.280839895`. All internal math is SI (bar, metres, litres,
°C); display converts at the unit boundary.

**Depth ↔ pressure:** `d₀ = depthPerBar(water)` = `10 m/bar` (salt), `10.3`
(fresh). `ATA = depth_m / d₀ + 1`.

**Real-gas compressibility:** first-order linear `Z(P) = 1 + k·P` (P in absolute
bar), `k_O₂ = −0.0002`, `k_N₂ = +0.0002`, `k_He = +0.00025`.
`mixZ = fO₂·Z_O₂ + fHe·Z_He + fN₂·Z_N₂` with `fN₂ = 1 − fO₂ − fHe`. Gas content
is proportional to `P_abs / Z`. Note: at ~200 bar O₂≈0.96, N₂≈1.04, He≈1.05, dry
air≈1.03, so a nominal AL80 (11.1 L × 207 bar) reads ~77–79 cf vs the ideal 81.
**Approximation note:** a reference-grade linear fit, not a virial/NIST/AGA8
model. Reference: real-gas law PV = ZnRT; compressibility-factor tables for
O₂/N₂/He near room temperature.

**Temperature / hot fills (Gay-Lussac, fixed volume):** `K = 273.15`.
`P_cold_abs = P_hot_abs × (T_cold_K / T_hot_K)`;
`P_hot_abs = (P_cold_goal_abs) × (T_hot_K / T_cold_K)` (gauge = abs − 1.01325).
Adiabatic fill heating estimate `ΔT = 0.7 × fillRate_bar/min` (clamped ≥ 0).
Simple mode uses a flat overfill %. **Approximation note:** `HEAT_COEFF = 0.7`
is a first-order project constant rolling cylinder thermal mass into one factor.
Reference: Gay-Lussac's / combined gas law.

### Blending tools

**Cascade Fill** (`cascade.ts`): sequential free equalization, lowest-pressure
bank first. Per bank (skipped if bank ≤ target):
- Ideal: `eqAbs = (P_target_abs·V_target + P_bank_abs·V_bank) / (V_target + V_bank)`.
- Real-gas: weight by content `w = V / Z(air, P_abs)`:
  `eqAbs = (P_target_abs·w_target + P_bank_abs·w_bank) / (w_target + w_bank)`.
- `P_final_gauge = eqAbs − 1.01325`. Air assumed (fO₂ = 0.209).
References: conservation of moles on free equalization (Dalton/ideal-gas), real
gas via Fundamentals.

**Nitrox Stick** (`nitroxStick.ts`):
- Flow: `O₂_flow = airFlow × (targetFO₂ − 0.209) / (1 − targetFO₂)` (0 if target
  ≤ 0.209).
- Supply draw: `addedSurfaceVol = tankVol × (finalP − startP)`;
  `o2Fraction = (targetFO₂ − 0.209) / (1 − 0.209)`;
  `o2SurfaceVol = addedSurfaceVol × o2Fraction`;
  `supplyPressureDrop = o2SurfaceVol / supplyVol`.
Reference: continuous-blending / partial-pressure of O₂ into an air stream.

**Blend (PP)** (`blending.ts`): partial-pressure blend solving the 2×2 linear
system for added pure-O₂ and pure-He partial pressures, remainder = top-up:
- `rem = pf − pi`; `bHe = targetFhe·pf − startFhe·pi − topFhe·rem`;
  `bO2 = targetFo2·pf − startFo2·pi − topFo2·rem`.
- `a11 = 1 − topFhe, a12 = −topFhe, a21 = −topFo2, a22 = 1 − topFo2`,
  `det = a11·a22 − a12·a21`;
  `pHe = (bHe·a22 − a12·bO2)/det`, `pO2 = (a11·bO2 − bHe·a21)/det`.
- Real-gas: `pHe ×= Z(He, pf_abs)`, `pO2 ×= Z(O₂, pf_abs)`.
- `pTop = pf − pi − pHe − pO2`. Feasibility: `|det| < 1e-9` (top-up can't reach
  target), or any of `pHe/pO2/pTop < −1e-6` (would require draining).
Reference: Dalton's law of partial pressures; partial-pressure blending.

**Topping Up** (`gasMixing.ts`): mole-weighted blend
`finalMix = r·startMix + (1−r)·topMix`, `r` = start gas's share of final moles.
- Ideal: `r = startAbs / finalAbs`.
- Real-gas: content ∝ `P_abs / Z`; `r = (startAbs/Z_start) / (finalAbs/Z_final)`
  solved by a 10-iteration fixed point (Z_final depends on the unknown final
  mix). `noTopUp` when `finalBar ≤ startBar`.
Reference: Dalton's law; real gas via Fundamentals.

**Blending Cost** (UI over the Blend result): cost = per-component gas volume ×
unit price; no dive-math module. Document that it prices the `Blend (PP)` output
(O₂/He/top-up volumes) — see Blend (PP).

**Booster** (`booster.ts`): O₂ booster pump model.
- `maxOutput = ratio × driveP` (stall ceiling; infeasible if `target >
  maxOutput`).
- Free equalization (boostSetup) mole-weighted like cascade (uses supply &
  receiver). Boost starts at the equalized pressure when supply > receiver, else
  at receiverStart.
- Drive air for transferring `q` surface litres, trapezoidal integral (400
  steps): `integrand(x) = (receiverAbs(x)/inletAbs(x)) × Z(inletAbs)/Z(receiverAbs)`,
  `receiverAbs(x) = boostStart_abs + x/receiverVol`,
  `inletAbs(x) = min(supplyStart_abs − x/supplyVol, capAbs)`;
  `driveAirL = ∫₀^q integrand dx`.
- Timing: `gasPerCycle = ((driveSwept/ratio) × (supplyAbs/1.01325)) / Z_supply`;
  `boosterMaxRate = maxCpm·gasPerCycle / receiverVol`;
  `boostRate = min(maxFillRate, boosterMaxRate)`; fill time = equalization time
  + boost time, both rate-limited; duty cycle vs compressor; storage buffer can
  stall (`stallSeconds`). **Approximation note:** trapezoidal numeric
  integration; geometric swept-volume estimate; representative inlet pressure.
References: real-gas law; pump displacement ratio; mass/mole balance on transfer.

### Planning tools

**MOD / END** (`modEnd.ts`):
- `MOD_m = (ppO₂_limit / fO₂ − 1) × d₀` (Dalton: `ppO₂ = fO₂ × ATA`).
- END (N₂-only model): `END_m = (depth + d₀)·(fN₂ / 0.791) − d₀`.
- END (O₂-narcotic model): `END_m = (depth + d₀)·(1 − fHe) − d₀`.
References: Dalton's law; narcotic-depth conventions (N₂-only vs O₂-also-narcotic).

**Best Mix** (`bestMix.ts`):
- `bestFO₂ = min(1, ppO₂_limit / ATA)`.
- `bestFHe = max(0, 1 − (targetEND + d₀)/(depth + d₀))` (N₂-only END).
- `fN₂ = max(0, 1 − fO₂ − fHe)`.
Reference: inverse of MOD/END (Dalton; narcosis convention).

**EAD** (`ead.ts`): `EAD_m = (depth + d₀)·(fN₂ / 0.791) − d₀`, `fN₂ = 1 − fO₂ −
fHe`. Reference: standard Equivalent Air Depth formula.

**Gas Density** (`gasDensity.ts`): component densities at 0 °C, 1 atm —
O₂ 1.42897, N₂ 1.2506, He 0.17846 g/L.
- `ρ_surface = fO₂·1.42897 + fN₂·1.2506 + fHe·0.17846`.
- `ρ_depth = ρ_surface × ATA`.
- `depthForDensity = (ρ_target/ρ_surface − 1) × d₀`.
- Limits: recommended ≤ 5.2 g/L, hard ≤ 6.3 g/L.
References: ideal-gas density scaling with pressure; gas-density limits per
Anthony & Mitchell (the 5.2 g/L recommended / 6.3 g/L hard limits widely cited
in technical-diving guidance). Mark the limits as the cited recommendation.

**CNS / OTU** (`oxygenExposure.ts`):
- NOAA single-exposure CNS limits table (ppO₂ ata → max minutes): 0.6→720,
  0.7→570, 0.8→450, 0.9→360, 1.0→300, 1.1→240, 1.2→210, 1.3→180, 1.4→150,
  1.5→120, 1.6→45. Linear interpolation between rows; `< 0.6 ata` → no limit;
  `≥ 1.6 ata` → 45 min.
- `segmentCNS% = minutes / limit × 100`.
- `OTU = minutes × ((ppO₂ − 0.5)/0.5)^0.83` for ppO₂ > 0.5, else 0.
- Multi-segment day: running CNS sums per dive; surface intervals decay CNS with
  a 90-minute half-life `CNS ×= 0.5^(surfaceMin/90)`; tracks peak and end CNS and
  total OTU.
References: NOAA Diving Manual (oxygen exposure limits, CNS clock, 90-min CNS
half-time, OTU/UPTD power formula).

**Gas Requirements** (`gasPlanning.ts`):
- `SAC = (startP − endP)/minutes / ATA(avgDepth)` (bar/min surface).
- `RMV = SAC × tankVol` (L/min surface). (The tool also allows entering RMV
  directly.)
- `gasRequirement = RMV × ATA(depth) × minutes` (surface L).
- Rock-bottom: `stressedRMV = RMV × stressFactor`;
  `ascentGas = stressedRMV × ATA(depth/2) × (depth/ascentRate)`; plus each stop
  `stressedRMV × ATA(stopDepth) × stopMin`; `× teamSize`.
- `minGasPressure = minGasL / tankVol` (Infinity if tankVol ≤ 0).
References: standard SAC/RMV definitions; rock-bottom / minimum-gas reserve
planning (technical-diving convention).

## Honesty about approximations

A short "Approximations & limitations" note (in Fundamentals or its own closing
section) collects the project-specific deviations so they aren't mistaken for
standards: the **linear Z fit** (vs virial/NIST), **ΔT = 0.7·rate**, **fresh
d₀ = 10.3**, the booster **trapezoidal integration / geometric swept volume**,
and the general reference-only disclaimer. Where an exact citation is uncertain,
name the principle and canonical source type rather than invent a precise
reference.

## Files

- Create: `src/app/tools/reference/page.tsx`;
  `src/components/Tools/reference/Formula.tsx`;
  `src/components/Tools/reference/ReferenceFundamentals.tsx`;
  `src/components/Tools/reference/ReferenceBlendingTools.tsx`;
  `src/components/Tools/reference/ReferencePlanningTools.tsx`.
- Modify: `src/app/tools/about/page.tsx` (add the "Equations & references →"
  link); `src/proxy.ts` only if needed to make `/tools/reference` public.

## Testing

Static content — verified by `npm run build` (compiles, route renders) and
`npm run lint` (0 errors). No unit tests (nothing computational). During
implementation, cross-check each documented formula against its `src/lib/diveMath/`
source so the page and the code agree. `npm run knip` should report no new unused
exports (the new components are all imported by the page).

## Out of scope

- A math-typesetting library (KaTeX/MathJax) — Unicode + monospace only.
- Interactive / runnable examples on the page (it's reference text).
- Documenting UI-only concerns (persistence, rounding, unit toggles) beyond a
  one-line mention where relevant.
- Changing any dive-math algorithm — this is documentation of existing behavior.
