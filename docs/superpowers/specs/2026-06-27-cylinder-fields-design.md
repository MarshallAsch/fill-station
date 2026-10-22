# Reusable Cylinder Fields — Design

**Date:** 2026-06-27
**Status:** Draft (pending user review)

## Overview

Extract the repeated "select / edit a cylinder" UI in the Dive Tools into one
reusable component, `CylinderFields`, and adopt it in every fill/blend cylinder
context. Each cylinder shows a consistent field set — **water volume, working
pressure, filled pressure, and (optionally) start pressure** — with a help
tooltip on the pressure fields clarifying *working* (the cylinder's rating) vs
*filled* (the actual gas pressure). Today "working pressure" is hidden (seeded
from the preset, used only for overfill warnings); this makes it an explicit,
editable field everywhere.

No dive-math changes. UI/markup + per-tool state wiring only. Reference-only
disclaimer still applies.

## The component — `src/components/Tools/CylinderFields.tsx`

A controlled, presentational client component (`'use client'`). It renders the
existing `TankSizePicker` followed by a field grid (`grid grid-cols-1 gap-4
sm:grid-cols-2`).

```ts
type CylinderCategory = 'scuba' | 'cascade' | 'industrial'

interface PressureField {
	value: number // display units
	onChange: (n: number) => void
}

function CylinderFields(props: {
	idPrefix: string
	// Single category or a merged set (e.g. ['scuba','cascade'] for a fill
	// destination that may be a scuba tank OR a cascade bottle).
	category: CylinderCategory | CylinderCategory[]
	waterVolumeL: number
	onWaterVolumeL: (n: number) => void
	working: PressureField
	filled: PressureField & { label: string }
	start?: PressureField & { label: string } // shown only when provided
	showPressures?: boolean // default true; false → size-only picker + volume
}): JSX.Element
```

**Fields rendered (in order):**
1. `TankSizePicker` (category/categories — see below).
2. Water volume (litres) — `NumberInput`, tooltip "Water (internal) cylinder
   volume — not free-gas capacity" (the existing wording).
3. Working pressure (`working`) — tooltip: *"The cylinder's rated (max)
   working/service pressure — its label rating, not how full it is."*
4. Start pressure (`start`, only if provided) — tooltip: *"Gas already in the
   cylinder before filling."*
5. Filled pressure (`filled`) — labelled per context; tooltip: *"The actual gas
   pressure in the cylinder (or the pressure to fill it to) — not the cylinder's
   rating."*

When `showPressures === false`, render only the picker + water volume (used for
the nitrox O₂ supply, whose pressure the math doesn't consume).

**Behavior:**
- On preset select (`TankSizePicker.onSelect(volumeL, ratedBar)`): call
  `onWaterVolumeL(volumeL)`, `working.onChange(fromBar(ratedBar, units.pressure))`,
  and `filled.onChange(fromBar(ratedBar, units.pressure))` — i.e. set volume +
  working, and seed filled = working. (Reads `useUnits()` for the conversion.)
  `start` is not changed by selection.
- Overfill warning: when `filled.value > working.value * 1.1` (both display
  units, so no conversion needed), render a `SafetyNote level='danger'`: "Fill
  pressure is more than 10% over the cylinder's working pressure." Only when
  `showPressures` and `working.value > 0`.

## Merged category lists — `TankSizePicker`

`TankSizePicker` currently takes one `category: 'dive' | 'storage' | 'industrial'`.
Extend it to also accept an **array** of categories; when an array is given it
concatenates the corresponding preset lists (dedup by name) into one picker.
`CylinderFields` maps its category words to the picker's: `scuba → dive`,
`cascade → storage`, `industrial → industrial`. Existing single-category callers
are unchanged.

## Adoption

Each tool keeps its own state (`usePressureState` for singleton pressures,
`useState`/row objects for water volume and the banks array) and wires it through
`CylinderFields`. Adding "working pressure" means new working-pressure state per
cylinder — a `usePressureState` for singletons (booster supply/receiver, nitrox
tank, cascade fill target) and a `working` field on each bank-row object for the
cascade banks array — seeded by the preset on select. The existing overfill
checks now read that field, and the now-redundant `workingPressureBar` tracking
state is removed in favour of the working field. NOTE: banks store pressures in
display units in their row objects today (converted to bar at calc time), so the
per-bank working field follows the same convention.

| Context | category | start | filled label | pressures |
|---|---|---|---|---|
| Cascade bank ×N | `cascade` | — | "Current pressure" | yes |
| Cascade fill target | `['scuba','cascade']` | "Start pressure" | "Target pressure" | yes |
| Booster supply | `industrial` | — | "Current pressure" | yes |
| Booster receiver | `['scuba','cascade']` | "Start pressure" | "Target pressure" | yes |
| Nitrox tank (destination) | `['scuba','cascade']` | "Start pressure" | "Fill pressure" | yes |
| Nitrox O₂ supply | `industrial` | — | — | no (size only) |

- **Sources** (cascade bank, booster supply): no start; `filled` = the bottle's
  current contents (the existing "pressure" / "supply start" state).
- **Destinations** (cascade fill, booster receiver, nitrox tank): `start` =
  current contents; `filled` = the target/fill pressure (the existing
  desired/target/final state). Destination pickers offer scuba **and** cascade
  bottles.
- Gas-requirements tank is left as-is (a dive-consumption planner, not a fill).
- The math inputs are unchanged: each tool still passes the same pressures it
  always did to its `calculate*` function (the bank `pressure`, supply start,
  target/final/desired, etc.). Working pressure feeds only the overfill warning.

## Cascade bank overfill

Cascade banks gain a working-pressure field too; an overfill warning per bank
(filled > working×1.1) comes free from the component. The cascade fill target's
existing `workingPressureBar`/`overfill` logic is replaced by the component's
built-in warning on the target.

## Testing

- No new dive math; existing Vitest suites must stay green.
- `CylinderFields` is presentational — verified by build + lint and manual smoke.
- Confirm each tool still produces the same numeric results (the calculation
  inputs are unchanged); the only new behavior is the working-pressure field and
  its overfill warning.

## Out of scope

- A separate "fill the banks" mode (the merged scuba+cascade destination list
  covers it).
- Any change to the dive-math modules or the cascade/blend/booster algorithms.
- Converting the gas-requirements tank.
- Persisting per-cylinder state beyond what each tool already keeps.
