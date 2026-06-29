# Allow Out-of-Vis Cylinders to be Filled (with warning) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let cylinders that are overdue for visual inspection be selected and filled, showing a clear warning at pick-time and on the selected fill row, while keeping hydro-overdue cylinders blocked.

**Architecture:** Extract the duplicated vis/hydro overdue checks into one shared helper module (`src/lib/cylinderStatus.ts`). The fill cylinder picker stops disabling vis-overdue options (hydro stays blocked) and reuses the helpers. The two fill-row components render an inline amber warning when a selected cylinder (or its doubles partner) is out of vis. No backend change — the fill API never validated vis status.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, dayjs (+ duration plugin), Headless UI, Heroicons.

## Global Constraints

- Formatting: Prettier — single quotes, no semicolons, tabs, 80 char width. Run `npm run lint` after changes (auto-fixes).
- Use theme tokens / existing styling patterns; warning uses the solid `ExclamationTriangleIcon` from `@heroicons/react/24/solid`, matching the picker.
- Thresholds unchanged: visual overdue `> 12` months, hydro overdue `> 5` years, strict `>` comparison.
- The `visPage` short-circuit (vis check forced false on the visual-inspection page) stays at the picker call site.
- No backend/API change. No confirmation dialog — the warning is advisory.
- No new unit test for the date-relative helper (manual verification), per the spec's lightweight scope.

---

### Task 1: Shared cylinder-status helpers

**Files:**
- Create: `src/lib/cylinderStatus.ts`

**Interfaces:**
- Consumes: `Cylinder` type from `@/types/cylinder`; `dayjs` + `dayjs/plugin/duration`.
- Produces:
  - `export const VISUAL_INTERVAL_MONTHS = 12`
  - `export const HYDRO_INTERVAL_YEARS = 5`
  - `export const needsVisual = (cylinder: Cylinder): boolean`
  - `export const needsHydro = (cylinder: Cylinder): boolean`

- [ ] **Step 1: Create the helper module**

Create `src/lib/cylinderStatus.ts`:

```ts
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { Cylinder } from '@/types/cylinder'

dayjs.extend(duration)

export const VISUAL_INTERVAL_MONTHS = 12
export const HYDRO_INTERVAL_YEARS = 5

export const needsVisual = (cylinder: Cylinder): boolean =>
	dayjs.duration(dayjs().diff(cylinder.lastVis)).asMonths() >
	VISUAL_INTERVAL_MONTHS

export const needsHydro = (cylinder: Cylinder): boolean =>
	dayjs.duration(dayjs().diff(cylinder.lastHydro)).asYears() >
	HYDRO_INTERVAL_YEARS
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: passes with no errors (file may be reformatted; that's fine).

- [ ] **Step 3: Commit**

```bash
git add src/lib/cylinderStatus.ts
git commit -m "feat: add shared cylinder vis/hydro status helpers"
```

---

### Task 2: Make out-of-vis selectable in the picker

**Files:**
- Modify: `src/components/UI/FormElements/CylinderPicker.tsx` (~lines 22-29, 175-186)

**Interfaces:**
- Consumes: `needsVisual`, `needsHydro` from `@/lib/cylinderStatus` (Task 1).
- Produces: no new exports. `CylinderPicker` behavior: vis-overdue options become selectable; hydro-overdue options stay `disabled`; the existing warning triangle/tooltip is unchanged.

- [ ] **Step 1: Import the helpers**

In `src/components/UI/FormElements/CylinderPicker.tsx`, add the import near the other `@/` imports (e.g. after the `useLoadCylinder` import on line 27):

```tsx
import { needsVisual, needsHydro } from '@/lib/cylinderStatus'
```

- [ ] **Step 2: Replace the inline overdue computations**

Replace the existing block (currently lines ~175-180):

```tsx
								const needsHydro =
									dayjs.duration(dayjs().diff(cylinder.lastHydro)).asYears() > 5
								const needsVis = visPage
									? false
									: dayjs.duration(dayjs().diff(cylinder.lastVis)).asMonths() >
										12
```

with calls to the shared helpers (keeping the `visPage` short-circuit):

```tsx
								const hydroOverdue = needsHydro(cylinder)
								const visOverdue = visPage ? false : needsVisual(cylinder)
```

- [ ] **Step 3: Update the references to the renamed locals**

In the same `.map(...)` body, update the three remaining uses of the old names. Change `disabled` so only hydro blocks selection:

- `disabled={needsHydro || needsVis}` → `disabled={hydroOverdue}`
- `{(needsHydro || needsVis) && (` → `{(hydroOverdue || visOverdue) && (`
- Inside the tooltip + icon, replace `needsHydro` with `hydroOverdue`:
  - `message={`Needs ${needsHydro ? 'Hydro' : 'Visual'}`}` → `message={`Needs ${hydroOverdue ? 'Hydro' : 'Visual'}`}`
  - `className={`size-5 ${needsHydro ? 'fill-red-600' : !showExpired ? 'fill-yellow-500' : 'fill-amber-500'} `}` → `className={`size-5 ${hydroOverdue ? 'fill-red-600' : !showExpired ? 'fill-yellow-500' : 'fill-amber-500'} `}`

The resulting option block reads:

```tsx
								return (
									<ComboboxOption
										key={cylinder.serialNumber}
										value={cylinder}
										disabled={hydroOverdue}
										className='text-text data-disabled:text-disabled data-focus:bg-accent data-focus:text-white-text flex cursor-pointer justify-between gap-2 px-3 py-2 select-none data-focus:outline-hidden'
									>
										<span className='flex items-center gap-1'>
											{!cylinder.verified && (
												<Tooltip
													position='right'
													message='User entered details, requires verification'
												>
													<ExclamationTriangleIcon className='size-5 fill-yellow-500' />
												</Tooltip>
											)}
											{isPair(cylinder) && <LinkIcon className='h-4 w-4' />}
											{formatPickerLabel(cylinder)}
										</span>
										{(hydroOverdue || visOverdue) && (
											<Tooltip
												position='left'
												message={`Needs ${hydroOverdue ? 'Hydro' : 'Visual'}`}
											>
												<ExclamationTriangleIcon
													className={`size-5 ${hydroOverdue ? 'fill-red-600' : !showExpired ? 'fill-yellow-500' : 'fill-amber-500'} `}
												/>
											</Tooltip>
										)}
									</ComboboxOption>
								)
```

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: passes. If lint flags the now-unused `dayjs`/`duration` imports in this file, leave them only if still used elsewhere in the file; otherwise remove the unused ones it reports. (Check: `dayjs` is still used for the `dayjs.extend(duration)` call at module top and any other usage — keep those.)

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, open the fills page. Confirm:
- A cylinder >12 months past its last visual is now selectable and still shows the warning triangle ("Needs Visual") in the dropdown.
- A cylinder >5 years past its last hydro is still greyed out / unselectable.
- The visual-inspection page picker (`visPage`) behaves as before.

- [ ] **Step 6: Commit**

```bash
git add src/components/UI/FormElements/CylinderPicker.tsx
git commit -m "feat: allow out-of-vis cylinders to be selected for filling"
```

---

### Task 3: Inline out-of-vis warning on the fill card

**Files:**
- Modify: `src/components/Fills/FillCard.tsx` (imports + after the paired-cylinder block ~line 85)

**Interfaces:**
- Consumes: `needsVisual` from `@/lib/cylinderStatus`; `fill.cylinder`, `fill.pairedCylinder` from the existing `Fill` prop.
- Produces: no new exports. Renders an inline amber warning when the selected cylinder or its paired cylinder is out of vis.

- [ ] **Step 1: Add imports**

In `src/components/Fills/FillCard.tsx`, add the helper import alongside the other `@/` imports, and add the solid icon import:

```tsx
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import { needsVisual } from '@/lib/cylinderStatus'
```

(The file already imports `XCircleIcon` from `@heroicons/react/24/outline` — keep that import as-is; only add the new solid-icon import line.)

- [ ] **Step 2: Compute the warning state inside the component**

Inside the `FillCard` component body, after the `usedCylinders` declaration (~line 27), add:

```tsx
	const visWarning =
		(fill.cylinder && needsVisual(fill.cylinder)) ||
		(fill.pairedCylinder && needsVisual(fill.pairedCylinder))
	const pairedOnly =
		!!fill.pairedCylinder &&
		needsVisual(fill.pairedCylinder) &&
		!(fill.cylinder && needsVisual(fill.cylinder))
```

- [ ] **Step 3: Render the warning**

Immediately after the paired-cylinder block (the `{fill.pairedCylinder && ( ... )}` block ending ~line 85), before `<FillType ... />`, add:

```tsx
			{visWarning && (
				<div className='flex items-center gap-1 text-sm text-amber-500'>
					<ExclamationTriangleIcon className='size-5 shrink-0 fill-amber-500' />
					<span>
						{pairedOnly && fill.pairedCylinder
							? `Paired cylinder (${fill.pairedCylinder.serialNumber}) is out of visual inspection — verify before filling.`
							: 'Out of visual inspection — verify before filling.'}
					</span>
				</div>
			)}
```

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 5: Manual verification**

In `npm run dev`, on the fills page select an out-of-vis cylinder into a fill card. Confirm the amber warning renders under the picker. For a doubles set where only the paired cylinder is out of vis, confirm the paired-specific text shows.

- [ ] **Step 6: Commit**

```bash
git add src/components/Fills/FillCard.tsx
git commit -m "feat: warn on fill card when cylinder is out of visual inspection"
```

---

### Task 4: Inline out-of-vis warning on the fill table row

**Files:**
- Modify: `src/components/Fills/FillsRow.tsx` (imports + after the paired-cylinder block inside the first `<td>` ~line 71)

**Interfaces:**
- Consumes: `needsVisual` from `@/lib/cylinderStatus`; `fill.cylinder`, `fill.pairedCylinder`.
- Produces: no new exports. Renders an inline amber warning inside the cylinder cell when out of vis.

- [ ] **Step 1: Add imports**

In `src/components/Fills/FillsRow.tsx`, add:

```tsx
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import { needsVisual } from '@/lib/cylinderStatus'
```

(Keep the existing `XCircleIcon` import from `@heroicons/react/24/outline`.)

- [ ] **Step 2: Compute the warning state**

Inside the `FillsRow` component body, after the `usedCylinders` declaration (~line 21), add:

```tsx
	const visWarning =
		(fill.cylinder && needsVisual(fill.cylinder)) ||
		(fill.pairedCylinder && needsVisual(fill.pairedCylinder))
	const pairedOnly =
		!!fill.pairedCylinder &&
		needsVisual(fill.pairedCylinder) &&
		!(fill.cylinder && needsVisual(fill.cylinder))
```

- [ ] **Step 3: Render the warning inside the cylinder cell**

Inside the first `<td>`, immediately after the paired-cylinder block (the `{fill.pairedCylinder && ( ... )}` block ending ~line 71), add:

```tsx
					{visWarning && (
						<div className='mt-1 flex items-center gap-1 text-xs text-amber-500'>
							<ExclamationTriangleIcon className='size-4 shrink-0 fill-amber-500' />
							<span>
								{pairedOnly && fill.pairedCylinder
									? `Paired cylinder (${fill.pairedCylinder.serialNumber}) is out of visual inspection — verify before filling.`
									: 'Out of visual inspection — verify before filling.'}
							</span>
						</div>
					)}
```

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 5: Manual verification**

Find a view that uses the table-row layout (`FillsRow`) and select an out-of-vis cylinder. Confirm the compact amber warning renders inside the cylinder cell, including the paired-specific text for a doubles set where only the partner is out of vis.

- [ ] **Step 6: Commit**

```bash
git add src/components/Fills/FillsRow.tsx
git commit -m "feat: warn on fill row when cylinder is out of visual inspection"
```

---

## Self-Review

**Spec coverage:**
- §1 Shared helpers → Task 1.
- §2 Make out-of-vis selectable (disabled = hydro only, keep warning triangle, keep visPage short-circuit) → Task 2.
- §3 Inline warning on both fill rows incl. paired-specific wording → Tasks 3 & 4.
- §4 No backend change → no task (explicitly out of scope).
- Testing/manual verification → folded into each task's verification step; no unit test for the date-relative helper, matching the spec.

**Placeholder scan:** No TBD/TODO; all code shown in full per step.

**Type consistency:** `needsVisual(cylinder: Cylinder)` / `needsHydro(cylinder: Cylinder)` defined in Task 1 and called with the same signature in Tasks 2-4. Local rename `needsHydro`/`needsVis` → `hydroOverdue`/`visOverdue` in Task 2 avoids shadowing the imported helper names. `fill.cylinder` / `fill.pairedCylinder` and `.serialNumber` match the existing `Fill`/`Cylinder` usage in the row components.
