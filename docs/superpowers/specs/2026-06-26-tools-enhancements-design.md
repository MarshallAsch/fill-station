# Dive Tools Enhancements — Design

**Date:** 2026-06-26
**Status:** Draft (pending user review)

## Overview

Five mostly-independent enhancements to the public Dive Tools section:

1. **Shared settings modal** — move the per-tool unit/real-gas toggles into one
   modal opened from the tool nav, plus temperature settings.
2. **Info / About page** (`/tools/about`) — tool descriptions + implementation
   decisions and data sources.
3. **Temperature (hot-fill → cools)** — a global off/simple/detailed model;
   gas-fill tools report the settled (cold) pressure and the hot target.
4. **Blend top-up gas + reorderable adds** — selectable top-up gas (not just
   air) and a reorderable O₂/He/top-up add sequence.
5. **Cascade cylinder visualization** — SVG cylinders sized by volume, filled to
   pressure, replacing the text residual list.

Pure dive math stays SI in `src/lib/diveMath/` (TDD); UI converts at the
boundary. All settings live in the existing global provider so they persist and
are shared across tools. Everything remains covered by the reference-only
disclaimer.

Build order (one plan, sequenced task groups): settings modal → about page →
temperature → blend top-up → cascade cylinders.

---

## 1. Shared settings modal

**Goal:** the unit toggles and the real-gas toggle currently render inside every
calculator (`UnitToggle show={[...]}`, `RealGasToggle`). Move them into one modal
opened from the nav so settings are set once.

- **Provider:** `UnitsProvider` already holds `units`, `setUnit`, `useRealGas`,
  `setUseRealGas`. Extend it with temperature settings (see §3). Keep the
  `useUnits()` hook name (widely used).
- **Trigger:** add a gear/"Settings" button in `ToolsTabs`, beside the
  Blending/Planning group selector.
- **Modal:** new `SettingsModal.tsx` using Headless UI `Dialog`. Contents:
  - All unit toggles (pressure, depth, volume, airFlow, o2Flow) — reuse
    `UnitToggle` with the full key list, plus the new `temp` unit (§3).
  - The real-gas toggle (`RealGasToggle`).
  - The temperature control (`TemperatureControl`, §3).
- **Remove** `UnitToggle`/`RealGasToggle`/temperature controls from the
  individual calculators. Tools just read `useUnits()`.
- A tool no longer declares which units it shows; the modal shows them all. That
  is acceptable — it's a global settings surface.

**Testing:** none new (presentational); verified by build + manual smoke.

---

## 2. Info / About page (`/tools/about`)

- **Route:** `src/app/tools/about/page.tsx` — static server component, same outer
  layout (max-width container, heading, reference-only banner).
- **Link:** add an "About these tools" link in the tools header (`ToolsPage`).
- **Tool descriptions:** add `description: string` to `ToolDef` in
  `toolsRegistry.ts` (one sentence each). The about page maps `TOOLS` grouped by
  `GROUPS` and lists name + description.
- **"How it works / decisions" sections** (static prose):
  - Real-gas vs ideal-gas (the linear Z model, coefficients, why an AL80 ≈ 77 cf
    not 80) — reuse the `RealGasNote` copy.
  - Temperature / hot fills (Gay-Lussac, the simple vs detailed model).
  - Booster physics (ramping drive pressure ≈ receiverP/ratio, rate-limited
    fill, swept-volume → cycle rate, two-phase buffer/stall).
  - Data sources: cylinders (Luxfer/Catalina aluminum; Faber/Worthington steel;
    UN/industrial T/K), boosters (Haskel AG shared drive head; USUN derived from
    bore × stroke).
  - Unit conventions + the reference-only disclaimer.
- Plain TSX (no MDX tooling). Keep sections as small components/array-driven for
  readability.

**Testing:** none new; build covers it.

---

## 3. Temperature (hot fill → cools)

A scuba cylinder fills hot (heat of compression) and loses pressure as it cools
(Gay-Lussac, `P/T` constant at fixed volume). To settle at a target you overfill
hot.

- **Global setting** (in `UnitsProvider`, shown in the settings modal):
  `tempMode: 'off' | 'simple' | 'detailed'` (default `off`), plus
  `overfillPct` (simple), `fillTempC` and `settledTempC` (detailed). Add a
  `temp: 'C' | 'F'` unit to `UnitPrefs` (default `'F'`, matching the imperial
  defaults), persisted.
- **Pure math** `src/lib/diveMath/temperature.ts` (TDD):
  - `settledPressure(hotGaugeBar, fillTempC, settledTempC): number` — Gay-Lussac
    on absolute pressure: `P_cold_abs = P_hot_abs · (T_cold_K / T_hot_K)`, return
    gauge. (`T_K = °C + 273.15`.)
  - `hotTarget(coldGoalGaugeBar, fillTempC, settledTempC): number` — inverse.
  - `applyOverfill(coldGoalGaugeBar, pct): number` and its inverse for simple
    mode (`hot = cold · (1 + pct/100)`).
  - Guard against non-positive Kelvin / divide-by-zero.
- **Integration:** the gas-fill tools that report a final/target pressure
  (cascade, blend, booster) gain, when `tempMode !== 'off'`, two derived figures
  next to their result:
  - **Settled (cold) pressure** for the computed fill, and
  - **Hot fill target** to settle at the desired pressure.
  The conversion `fillTempC`/`settledTempC` come from the unit boundary (°F→°C).
  A small shared `TemperatureNote`/helper renders these consistently.
- Booster: the target is the cold goal; show the hot fill target.

**Testing (`temperature.test.ts`):** settled < hot when settled temp < fill
temp; round-trip `hotTarget(settledPressure(p)) ≈ p`; simple overfill round-trip;
no change when temps equal; sane edge clamps.

---

## 4. Blend: top-up gas + reorderable adds

`blending.ts` currently assumes O₂ → He → air. Generalize:

- **Top-up gas:** a selectable mix (air / O₂ / nitrox / custom `fo2,fhe`) that
  fills the remainder to the final pressure.
- **Reorderable adds:** the order in which O₂, He, and the top-up are added is
  user-controlled (affects the intermediate-pressure readout / what's physically
  added when).
- **Math:** generalize `calculateBlend` to a sequence of "add gas to pressure"
  steps that achieves the target mix at the final pressure. Real-gas weighting
  (existing `mixZ`) preserved. Compute the per-step add pressures from the start
  gas, the three component contributions (O₂, He, top-up's O₂/N₂/He), and the
  target. Report each add as gauge pressure to add, in the chosen order, plus
  feasibility (drain-required) reasons.
- **UI:** add a top-up `MixPicker` (default air) and an up/down reorder control
  for the three adds; the steps list renders in order.

**Testing (`blending.test.ts`):** EAN32 from air top-up matches the existing
result (regression); a non-air top-up (e.g., EAN36 top-up) hand-checked; order
changes the step pressures but not the final mix; drain-required cases; real-gas
parity.

---

## 5. Cascade cylinder visualization

- **Component** `CascadeCylinders.tsx`: an SVG row with one cylinder per bank
  plus the fill cylinder.
  - **Height ∝ water volume** (clamped to a min/max so a 3 L pony is still
    visible next to a 50 L bank).
  - **Fill level ∝ pressure / a shared max** (the highest bank's start pressure
    or the working pressure), colored per bank (theme tokens / a small palette).
  - **Pressure label** above each (start → residual for banks; start → final for
    the fill), and a thin **mark line** at the residual/start level.
  - Static, recomputed from the cascade result on every render. Responsive
    `viewBox`, no horizontal overflow.
- **Integration:** render it in `CascadeCalculator`'s result section; keep the
  numeric residuals as a caption beneath.

**Testing:** none new (presentational); the cascade math already has tests.

---

## Files (high level)

- Modify: `UnitsProvider.tsx` (temp settings + temp unit), `ToolsTabs.tsx`
  (settings button), `ToolsPage.tsx` (about link), `UnitToggle.tsx` (temp unit),
  `toolsRegistry.ts` (`description`), `BlendCalculator.tsx`,
  `CascadeCalculator.tsx`, `BoosterCalculator.tsx`, `blending.ts`,
  `units.ts` (temp conversions if not present).
- Create: `SettingsModal.tsx`, `src/app/tools/about/page.tsx`,
  `temperature.ts` + `temperature.test.ts`, `TemperatureControl.tsx`,
  `CascadeCylinders.tsx`.
- Remove from tools: inline `UnitToggle`/`RealGasToggle` usages (moved to modal).

## Out of scope

- Animated cascade step-through (Play/Speed) — static cylinders only.
- A full virial/NIST compressibility model — the linear Z stays.
- Temperature applied to planning-only tools (MOD/END/EAD/etc.) — only the
  gas-fill tools (cascade, blend, booster).
