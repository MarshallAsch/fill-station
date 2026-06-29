# Allow Out-of-Vis Cylinders to be Filled (with warning) — Design

**Date:** 2026-06-29
**Status:** Draft (pending user review)

## Overview

Today the fill cylinder picker (`src/components/UI/FormElements/CylinderPicker.tsx`)
disables any cylinder that is overdue for either a hydro test or a visual
inspection, so it cannot be selected for a fill. We want cylinders that are out
of visual inspection ("out of vis") to be **selectable and fillable anyway**,
while surfacing a clear warning. Hydro-overdue cylinders stay a hard block.

This is an advisory-warning change only — the fill API has never validated vis
status, so no backend change is required.

## Scope decisions (from brainstorming)

- **Visual only.** Out-of-vis cylinders become selectable. Hydro-overdue
  cylinders remain disabled/unselectable (filling past hydro is treated as a
  hard stop).
- **Two-level warning.** Keep the existing warning triangle + "Needs Visual"
  tooltip in the picker dropdown (pick-time signal), AND add a visible inline
  warning on the selected fill row (fill-time signal).
- **No confirmation dialog.** The warning is advisory; submission is not gated.

## Current behavior (reference)

`CylinderPicker.tsx` computes, per option (lines ~175–186):

```ts
const needsHydro = dayjs.duration(dayjs().diff(cylinder.lastHydro)).asYears() > 5
const needsVis = visPage
  ? false
  : dayjs.duration(dayjs().diff(cylinder.lastVis)).asMonths() > 12
// ...
<ComboboxOption disabled={needsHydro || needsVis} ...>
```

A warning `ExclamationTriangleIcon` with a `Needs ${needsHydro ? 'Hydro' : 'Visual'}`
tooltip already renders for overdue cylinders (lines ~201–210). The `visPage`
prop already forces `needsVis = false` so the visual-inspection page is
unaffected by any of these changes.

The fill rows that embed the picker are:
- `src/components/Fills/FillCard.tsx` (card layout)
- `src/components/Fills/FillsRow.tsx` (table-row layout)

Both store the chosen cylinder as `fill.cylinder` and an optional doubles
partner as `fill.pairedCylinder`.

## 1. Shared cylinder-status helpers (drift-proofing)

The 12-month visual and 5-year hydro thresholds currently live as inline magic
numbers inside `CylinderPicker`. Because the fill rows now need the same visual
check, extract this into a small shared module so the logic has one source of
truth (matching the repo's existing constants-single-source pattern).

New file `src/lib/cylinderStatus.ts`:

```ts
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { Cylinder } from '@/types/cylinder'

dayjs.extend(duration)

export const VISUAL_INTERVAL_MONTHS = 12
export const HYDRO_INTERVAL_YEARS = 5

export const needsVisual = (cylinder: Cylinder): boolean =>
  dayjs.duration(dayjs().diff(cylinder.lastVis)).asMonths() > VISUAL_INTERVAL_MONTHS

export const needsHydro = (cylinder: Cylinder): boolean =>
  dayjs.duration(dayjs().diff(cylinder.lastHydro)).asYears() > HYDRO_INTERVAL_YEARS
```

Notes:
- Values and the strict `>` comparison are unchanged from the current inline
  logic — pure extraction, no behavior change to the thresholds.
- `CylinderPicker` keeps its `visPage` short-circuit at the call site
  (`visPage ? false : needsVisual(cylinder)`); the helper itself stays
  context-free.

## 2. Make out-of-vis selectable in the picker

In `CylinderPicker.tsx`:
- Import `needsVisual`, `needsHydro` from `@/lib/cylinderStatus` and replace the
  two inline `dayjs.duration(...)` computations with calls to them (keeping the
  `visPage` short-circuit for the visual check).
- Change the option's `disabled` prop from `needsHydro || needsVis` to
  **`needsHydro`** only.
- Leave the warning-triangle block and its tooltip exactly as-is. The vis
  warning now renders on a *selectable* option; the amber/yellow color logic
  (`!showExpired ? 'fill-yellow-500' : 'fill-amber-500'`) is unchanged.

## 3. Inline warning on the selected fill row

In both `FillCard.tsx` and `FillsRow.tsx`, after the `CylinderPicker` (and the
existing paired-cylinder line), add a warning block shown when the selected
cylinder or its paired cylinder is out of vis:

```tsx
const visWarning =
  (fill.cylinder && needsVisual(fill.cylinder)) ||
  (fill.pairedCylinder && needsVisual(fill.pairedCylinder))
```

Render, when `visWarning` is truthy, an inline amber warning using the existing
icon + theme styling, for example:

```tsx
{visWarning && (
  <div className='flex items-center gap-1 text-sm text-amber-500'>
    <ExclamationTriangleIcon className='size-5 fill-amber-500' />
    <span>Out of visual inspection — verify before filling.</span>
  </div>
)}
```

Wording detail: when only the paired cylinder is out of vis (the representative
one is in vis), the message names which one, e.g.
`Paired cylinder (<serial>) is out of visual inspection — verify before filling.`
Implementation may use a small helper to build the message; both rows share the
same wording.

- `FillCard.tsx`: place the warning directly under the paired-cylinder block
  (after line ~85), inside the card's vertical flex stack.
- `FillsRow.tsx`: place the warning inside the first `<td>`, under the
  paired-cylinder block (after line ~71), using the same compact text size as
  the surrounding row content.

`ExclamationTriangleIcon` is imported from `@heroicons/react/24/solid` in
`CylinderPicker`; the fill rows currently import `XCircleIcon` from
`@heroicons/react/24/outline` — add the solid `ExclamationTriangleIcon` import
to each row file.

## 4. No backend change

`src/app/api/fills/route.tsx` does not (and will not) validate visual status.
The warning is purely advisory and does not gate fill submission.

## Testing

- `npm run lint` must pass.
- Manual verification:
  - A cylinder >12 months past `lastVis` is now selectable in the fill picker
    and still shows the warning triangle in the dropdown.
  - Selecting it shows the inline warning on the fill row.
  - A cylinder >5 years past `lastHydro` remains disabled/unselectable.
  - A doubles set where only the paired cylinder is out of vis shows the
    paired-specific warning text.
  - The visual-inspection page (`visPage`) behavior is unchanged.
- The repo has dive-math unit tests under `src/lib/diveMath/*.test.ts`. The new
  `cylinderStatus.ts` is date-relative; no unit test is added unless the
  implementation plan introduces an injectable "now" — keep it as manual
  verification to match the lightweight scope.
