# Table Filters & Sort Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add filtering and combined sort to the cylinder and fill history tabs on `/history` using a shared toolbar component and filter hook, with filter state owned by per-tab wrapper components.

**Architecture:** Each tab on the history page becomes its own component (`CylindersTab`, `FillsTab`) that owns filter and sort `useState`, builds predicate functions, runs the items through a shared `useTableFilters` hook, and renders a shared `<TableToolbar>` above the existing table. State is in-memory only; the underlying table components stay unchanged in their public API.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Headless UI ListBox, dayjs. No test framework — verification is `npm run lint`, `npm run build`, and the existing dev server.

**Verification note:** This codebase has no unit test framework configured (per `CLAUDE.md`). Each task ends with `npm run lint` and (where types are touched) `npm run build`, then a manual browser check, then a commit.

---

## File Structure

**Create:**
- `src/lib/fills.ts` — mix categorization helpers shared by row and filter
- `src/hooks/useTableFilters.ts` — generic filter+sort hook
- `src/components/UI/TableToolbar.tsx` — shared toolbar with filter slot, sort slot, chip row, clear-all
- `src/components/History/CylindersTab.tsx` — wires cylinder filters/sort + toolbar
- `src/components/History/FillsTab.tsx` — wires fill filters/sort + toolbar

**Modify:**
- `src/app/constants/FormConstants.ts` — add filter/sort option lists
- `src/components/UI/FormElements/ListBox.tsx` — add optional controlled-mode `value` prop
- `src/components/History/components/FillHistoryRow.tsx` — import mix helper from new lib
- `src/app/history/page.tsx` — render the two new tab components

---

## Task 1: Extract fill mix helpers

**Files:**
- Create: `src/lib/fills.ts`
- Modify: `src/components/History/components/FillHistoryRow.tsx`

- [ ] **Step 1: Create `src/lib/fills.ts`**

```ts
export type FillMixCategory = 'air' | 'nitrox' | 'trimix'

type MixSource = { oxygen: number; helium: number }

export function getFillCategory(fill: MixSource): FillMixCategory {
	if (fill.helium > 0) return 'trimix'
	if (fill.oxygen === 20.9) return 'air'
	return 'nitrox'
}

export function getFillMix(fill: MixSource): string {
	if (fill.helium !== 0) return `${fill.oxygen}/${fill.helium}`
	if (fill.oxygen === 20.9) return 'air'
	return `EAN ${fill.oxygen}`
}
```

- [ ] **Step 2: Update `FillHistoryRow.tsx` to import `getFillMix` from `@/lib/fills` and delete the local copy**

Replace the local `getFillMix` function in `src/components/History/components/FillHistoryRow.tsx` with an import:

```ts
import { getFillMix } from '@/lib/fills'
```

Remove the local `function getFillMix(fill: FillHistory): string { ... }` block.

- [ ] **Step 3: Verify lint + build**

Run: `npm run lint`
Expected: 0 errors (existing warnings unchanged).

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Manual check**

Open `/history?tab=FILLS` in dev. Fill rows should still show the mix label correctly (air / EAN xx / x/y).

- [ ] **Step 5: Commit**

```bash
git add src/lib/fills.ts src/components/History/components/FillHistoryRow.tsx
git commit -m "refactor: extract fill mix helpers into src/lib/fills"
```

---

## Task 2: Add filter/sort option constants

**Files:**
- Modify: `src/app/constants/FormConstants.ts`

- [ ] **Step 1: Append the new option lists**

Add the following at the end of `src/app/constants/FormConstants.ts`. Use the `{ name, value }` shape that `ListBox` expects (see existing `ROLE_OPTIONS`).

```ts
export const YES_NO_ANY_OPTIONS = [
	{ name: 'Any', value: 'any' },
	{ name: 'Yes', value: 'yes' },
	{ name: 'No', value: 'no' },
]

export const MIX_TYPE_OPTIONS = [
	{ name: 'Any mix', value: 'any' },
	{ name: 'Air', value: 'air' },
	{ name: 'Nitrox', value: 'nitrox' },
	{ name: 'Trimix', value: 'trimix' },
]

export const CYLINDER_SORT_OPTIONS = [
	{ name: 'Serial (A→Z)', value: 'serial-asc' },
	{ name: 'Last vis (oldest first)', value: 'lastVis-asc' },
	{ name: 'Last vis (newest first)', value: 'lastVis-desc' },
	{ name: 'Last hydro (oldest first)', value: 'lastHydro-asc' },
	{ name: 'Last hydro (newest first)', value: 'lastHydro-desc' },
]

export const FILL_SORT_OPTIONS = [
	{ name: 'Date (newest first)', value: 'date-desc' },
	{ name: 'Date (oldest first)', value: 'date-asc' },
	{ name: 'Mix type (A→Z)', value: 'mix-asc' },
]
```

- [ ] **Step 2: Verify lint**

Run: `npm run lint`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/constants/FormConstants.ts
git commit -m "feat: add filter and sort option constants for history tables"
```

---

## Task 3: Add controlled-mode support to `ListBox` and `CylinderPicker`

Both components currently manage their own selection state via `useState`. The toolbar's "Clear all" button needs to reset filters from the outside. `ClientPicker` already supports a `value`/`onChange` controlled pair (see `src/components/UI/FormElements/ClientPicker.tsx`) — bring `ListBox` and `CylinderPicker` to the same shape.

**Files:**
- Modify: `src/components/UI/FormElements/ListBox.tsx`
- Modify: `src/components/UI/FormElements/CylinderPicker.tsx`

- [ ] **Step 1: Add `value` to `ListBox`**

Edit `src/components/UI/FormElements/ListBox.tsx`. Replace the `ListBoxProps` type and the start of the component body with:

```tsx
type ListBoxProps = {
	items: Item[]
	title: string
	id: string
	name: string
	defaultValue?: Item
	value?: Item
	onChange?: (item: Item) => void
}

const ListBox = ({
	items,
	title,
	id,
	name,
	defaultValue,
	value,
	onChange,
}: ListBoxProps) => {
	const [internal, setInternal] = useState<Item | undefined>(
		defaultValue || items[0],
	)
	const isControlled = value !== undefined
	const selected = isControlled ? value : internal

	const handleChange = (item: Item) => {
		if (!isControlled) setInternal(item)
		onChange?.(item)
	}

	return (
		<Listbox value={selected} onChange={handleChange}>
			{/* keep the existing JSX below this point unchanged */}
```

Keep everything from `<Label …>` onwards exactly as it was — only the props type and the state/selected derivation change.

- [ ] **Step 2: Add `value` to `CylinderPicker`**

Edit `src/components/UI/FormElements/CylinderPicker.tsx`. Update the props type and the state derivation:

```tsx
type CylinderPickerProps = {
	isFill?: boolean
	index?: number
	disableAdd?: boolean
	showExpired?: boolean
	initialValue?: Cylinder
	value?: Cylinder | null
	filter?: (c: Cylinder) => boolean
	onChange?: (c?: Cylinder) => void
	visPage?: boolean
}

const CylinderPicker = ({
	isFill,
	index,
	disableAdd,
	showExpired = false,
	filter,
	initialValue,
	value,
	onChange,
	visPage,
}: CylinderPickerProps) => {
	// ...existing state/setup above...
	const isControlled = value !== undefined
	const currentValue = isControlled ? value : selectedCylinder
```

Then in the rest of the component, replace every read of `selectedCylinder` with `currentValue`, and inside the existing Combobox `onChange` handler, only call `setSelectedCylinder` when `!isControlled`. The handler should still call `onChange?.(c)` in both modes so the parent always sees changes. Do NOT change the Redux-dispatch effect — it should keep watching the internal `selectedCylinder` because the controlled mode used by the new filter UI does not pass `isFill`.

- [ ] **Step 3: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: succeeds with 0 errors.

- [ ] **Step 4: Manual check**

Open any page that uses these components in uncontrolled mode:
- `/settings` — role `ListBox` per user (uncontrolled `defaultValue`)
- `/fills` — `CylinderPicker` in the fill rows (uncontrolled `initialValue` + Redux dispatch)

Both must continue to behave exactly as before — the change is backwards compatible because `value` is optional and the controlled branch only activates when callers opt in.

- [ ] **Step 5: Commit**

```bash
git add src/components/UI/FormElements/ListBox.tsx src/components/UI/FormElements/CylinderPicker.tsx
git commit -m "feat: support controlled value prop on ListBox and CylinderPicker"
```

---

## Task 4: Create `useTableFilters` hook

**Files:**
- Create: `src/hooks/useTableFilters.ts`

- [ ] **Step 1: Write the hook**

```ts
'use client'

import { useMemo } from 'react'

type UseTableFiltersOptions<T> = {
	predicates?: Array<(item: T) => boolean>
	sort?: (a: T, b: T) => number
}

const useTableFilters = <T,>(
	items: T[],
	{ predicates, sort }: UseTableFiltersOptions<T> = {},
): T[] => {
	return useMemo(() => {
		let result = items
		if (predicates && predicates.length > 0) {
			result = result.filter((item) => predicates.every((p) => p(item)))
		}
		if (sort) {
			result = [...result].sort(sort)
		}
		return result
	}, [items, predicates, sort])
}

export default useTableFilters
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTableFilters.ts
git commit -m "feat: add useTableFilters hook"
```

---

## Task 5: Create `<TableToolbar>` component

The toolbar renders a horizontal row of filter controls passed as `filters`, a sort control passed as `sort`, an optional chip row below for active filters, and a "Clear all" button. The chips and clear button are hidden when no filters are active.

**Files:**
- Create: `src/components/UI/TableToolbar.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client'

import { ReactNode } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Button from './Button'

export type FilterChip = {
	label: string
	onClear: () => void
}

type TableToolbarProps = {
	filters: ReactNode
	sort?: ReactNode
	chips?: FilterChip[]
	onClearAll?: () => void
}

const TableToolbar = ({
	filters,
	sort,
	chips = [],
	onClearAll,
}: TableToolbarProps) => {
	const hasChips = chips.length > 0
	return (
		<div className='border-border bg-surface mb-4 rounded-lg border p-3'>
			<div className='flex flex-wrap items-end gap-3'>
				<div className='flex flex-1 flex-wrap items-end gap-3'>{filters}</div>
				{sort && <div className='w-full sm:w-auto'>{sort}</div>}
			</div>
			{hasChips && (
				<div className='mt-3 flex flex-wrap items-center gap-2'>
					{chips.map((chip) => (
						<button
							key={chip.label}
							type='button'
							onClick={chip.onClear}
							className='bg-card-hover text-text hover:bg-hover inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium'
						>
							<span>{chip.label}</span>
							<XMarkIcon className='h-3.5 w-3.5' aria-hidden='true' />
						</button>
					))}
					{onClearAll && (
						<Button variant='ghost' onClick={onClearAll}>
							Clear all
						</Button>
					)}
				</div>
			)}
		</div>
	)
}

export default TableToolbar
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/UI/TableToolbar.tsx
git commit -m "feat: add TableToolbar component for filter + sort controls"
```

---

## Task 6: Build `CylindersTab` with filters and sort

This component owns cylinder filter and sort state, computes predicates and a comparator, runs the items through `useTableFilters`, and renders `<TableToolbar>` above `<CylinderListTable>`.

**Files:**
- Create: `src/components/History/CylindersTab.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Cylinder } from '@/types/cylinder'
import { Client } from '@/types/client'
import CylinderListTable from '@/components/Cylinders/CylinderListTable'
import TableToolbar, { FilterChip } from '@/components/UI/TableToolbar'
import ListBox from '@/components/UI/FormElements/ListBox'
import ClientPicker from '@/components/UI/FormElements/ClientPicker'
import useTableFilters from '@/hooks/useTableFilters'
import {
	CYLINDER_SORT_OPTIONS,
	YES_NO_ANY_OPTIONS,
} from '@/app/constants/FormConstants'

type CylindersTabProps = {
	cylinders: Cylinder[]
}

type TriState = 'any' | 'yes' | 'no'

const matchTri = (state: TriState, actual: boolean): boolean => {
	if (state === 'any') return true
	return state === 'yes' ? actual : !actual
}

const sortByValue: Record<string, (a: Cylinder, b: Cylinder) => number> = {
	'serial-asc': (a, b) =>
		(a.nickname ?? a.serialNumber).localeCompare(
			b.nickname ?? b.serialNumber,
		),
	'lastVis-asc': (a, b) =>
		dayjs(a.lastVis).valueOf() - dayjs(b.lastVis).valueOf(),
	'lastVis-desc': (a, b) =>
		dayjs(b.lastVis).valueOf() - dayjs(a.lastVis).valueOf(),
	'lastHydro-asc': (a, b) =>
		dayjs(a.lastHydro).valueOf() - dayjs(b.lastHydro).valueOf(),
	'lastHydro-desc': (a, b) =>
		dayjs(b.lastHydro).valueOf() - dayjs(a.lastHydro).valueOf(),
}

const triItem = (state: TriState) =>
	YES_NO_ANY_OPTIONS.find((o) => o.value === state) ?? YES_NO_ANY_OPTIONS[0]

const CylindersTab = ({ cylinders }: CylindersTabProps) => {
	const [oxygen, setOxygen] = useState<TriState>('any')
	const [needsVis, setNeedsVis] = useState<TriState>('any')
	const [outOfHydro, setOutOfHydro] = useState<TriState>('any')
	const [owner, setOwner] = useState<Client | null>(null)
	const [sortValue, setSortValue] = useState<string>('serial-asc')

	const predicates = useMemo(() => {
		const now = dayjs()
		const list: Array<(c: Cylinder) => boolean> = []
		if (oxygen !== 'any') {
			list.push((c) => matchTri(oxygen, c.oxygenClean))
		}
		if (needsVis !== 'any') {
			list.push((c) =>
				matchTri(needsVis, dayjs(c.lastVis).add(1, 'year').isBefore(now)),
			)
		}
		if (outOfHydro !== 'any') {
			list.push((c) =>
				matchTri(outOfHydro, dayjs(c.lastHydro).add(5, 'year').isBefore(now)),
			)
		}
		if (owner) {
			list.push((c) => c.ownerId === owner.id)
		}
		return list
	}, [oxygen, needsVis, outOfHydro, owner])

	const sort = sortByValue[sortValue]
	const filtered = useTableFilters(cylinders, { predicates, sort })

	const chips: FilterChip[] = []
	if (oxygen !== 'any')
		chips.push({
			label: `Oxygen clean: ${oxygen === 'yes' ? 'Yes' : 'No'}`,
			onClear: () => setOxygen('any'),
		})
	if (needsVis !== 'any')
		chips.push({
			label: needsVis === 'yes' ? 'Needs vis' : 'Vis current',
			onClear: () => setNeedsVis('any'),
		})
	if (outOfHydro !== 'any')
		chips.push({
			label: outOfHydro === 'yes' ? 'Out of hydro' : 'Hydro current',
			onClear: () => setOutOfHydro('any'),
		})
	if (owner)
		chips.push({ label: `Owner: ${owner.name}`, onClear: () => setOwner(null) })

	const clearAll = () => {
		setOxygen('any')
		setNeedsVis('any')
		setOutOfHydro('any')
		setOwner(null)
	}

	return (
		<div className='w-full'>
			<TableToolbar
				filters={
					<>
						<div className='w-40'>
							<ListBox
								items={YES_NO_ANY_OPTIONS}
								title='Oxygen clean'
								id='filter-oxygen'
								name='filter-oxygen'
								value={triItem(oxygen)}
								onChange={(item) => setOxygen(item.value as TriState)}
							/>
						</div>
						<div className='w-40'>
							<ListBox
								items={YES_NO_ANY_OPTIONS}
								title='Needs vis'
								id='filter-needs-vis'
								name='filter-needs-vis'
								value={triItem(needsVis)}
								onChange={(item) => setNeedsVis(item.value as TriState)}
							/>
						</div>
						<div className='w-40'>
							<ListBox
								items={YES_NO_ANY_OPTIONS}
								title='Out of hydro'
								id='filter-out-hydro'
								name='filter-out-hydro'
								value={triItem(outOfHydro)}
								onChange={(item) => setOutOfHydro(item.value as TriState)}
							/>
						</div>
						<div className='w-60'>
							<ClientPicker
								disableAdd
								value={owner}
								onChange={setOwner}
							/>
						</div>
					</>
				}
				sort={
					<div className='w-60'>
						<ListBox
							items={CYLINDER_SORT_OPTIONS}
							title='Sort by'
							id='cylinder-sort'
							name='cylinder-sort'
							value={
								CYLINDER_SORT_OPTIONS.find((o) => o.value === sortValue) ??
								CYLINDER_SORT_OPTIONS[0]
							}
							onChange={(item) => setSortValue(item.value)}
						/>
					</div>
				}
				chips={chips}
				onClearAll={chips.length > 0 ? clearAll : undefined}
			/>
			<CylinderListTable cylinders={filtered} showOwner />
		</div>
	)
}

export default CylindersTab
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: 0 errors.

- [ ] **Step 3: Manual check (deferred)**

Component is not yet mounted; the real browser check happens in Task 8. For now confirm the file compiles.

- [ ] **Step 4: Commit**

```bash
git add src/components/History/CylindersTab.tsx
git commit -m "feat: add CylindersTab with filter and sort controls"
```

---

## Task 7: Build `FillsTab` with filters and sort

Same pattern as `CylindersTab`. Loads fills via `useLoadFills`, owns mix/cylinder/owner filter state plus sort state, and renders `<FillHistoryTable fills={filtered} />`.

**Files:**
- Create: `src/components/History/FillsTab.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { FillHistory } from '@/types/fills'
import { Cylinder } from '@/types/cylinder'
import { Client } from '@/types/client'
import FillHistoryTable from '@/components/History/components/FillHistoryTable'
import TableToolbar, { FilterChip } from '@/components/UI/TableToolbar'
import ListBox from '@/components/UI/FormElements/ListBox'
import ClientPicker from '@/components/UI/FormElements/ClientPicker'
import CylinderPicker from '@/components/UI/FormElements/CylinderPicker'
import useLoadFills from '@/hooks/useLoadFills'
import useTableFilters from '@/hooks/useTableFilters'
import { getFillCategory, FillMixCategory } from '@/lib/fills'
import {
	FILL_SORT_OPTIONS,
	MIX_TYPE_OPTIONS,
} from '@/app/constants/FormConstants'

type MixFilter = 'any' | FillMixCategory

const sortByValue: Record<string, (a: FillHistory, b: FillHistory) => number> =
	{
		'date-desc': (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
		'date-asc': (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
		'mix-asc': (a, b) => getFillCategory(a).localeCompare(getFillCategory(b)),
	}

const mixItem = (mix: MixFilter) =>
	MIX_TYPE_OPTIONS.find((o) => o.value === mix) ?? MIX_TYPE_OPTIONS[0]

const FillsTab = () => {
	const { fills } = useLoadFills()
	const [mix, setMix] = useState<MixFilter>('any')
	const [cylinder, setCylinder] = useState<Cylinder | null>(null)
	const [owner, setOwner] = useState<Client | null>(null)
	const [sortValue, setSortValue] = useState<string>('date-desc')

	const predicates = useMemo(() => {
		const list: Array<(f: FillHistory) => boolean> = []
		if (mix !== 'any') {
			list.push((f) => getFillCategory(f) === mix)
		}
		if (cylinder) {
			list.push((f) => f.Cylinder.id === cylinder.id)
		}
		if (owner) {
			list.push((f) => f.Cylinder.Client?.id === owner.id)
		}
		return list
	}, [mix, cylinder, owner])

	const sort = sortByValue[sortValue]
	const filtered = useTableFilters(fills, { predicates, sort })

	const chips: FilterChip[] = []
	if (mix !== 'any')
		chips.push({
			label: `Mix: ${mix[0].toUpperCase()}${mix.slice(1)}`,
			onClear: () => setMix('any'),
		})
	if (cylinder)
		chips.push({
			label: `Cylinder: ${cylinder.nickname ?? cylinder.serialNumber}`,
			onClear: () => setCylinder(null),
		})
	if (owner)
		chips.push({
			label: `Owner: ${owner.name}`,
			onClear: () => setOwner(null),
		})

	const clearAll = () => {
		setMix('any')
		setCylinder(null)
		setOwner(null)
	}

	return (
		<div className='w-full'>
			<TableToolbar
				filters={
					<>
						<div className='w-40'>
							<ListBox
								items={MIX_TYPE_OPTIONS}
								title='Mix type'
								id='filter-mix'
								name='filter-mix'
								value={mixItem(mix)}
								onChange={(item) => setMix(item.value as MixFilter)}
							/>
						</div>
						<div className='w-60'>
							<CylinderPicker
								value={cylinder}
								onChange={(c) => setCylinder(c ?? null)}
							/>
						</div>
						<div className='w-60'>
							<ClientPicker disableAdd value={owner} onChange={setOwner} />
						</div>
					</>
				}
				sort={
					<div className='w-60'>
						<ListBox
							items={FILL_SORT_OPTIONS}
							title='Sort by'
							id='fill-sort'
							name='fill-sort'
							value={
								FILL_SORT_OPTIONS.find((o) => o.value === sortValue) ??
								FILL_SORT_OPTIONS[0]
							}
							onChange={(item) => setSortValue(item.value)}
						/>
					</div>
				}
				chips={chips}
				onClearAll={chips.length > 0 ? clearAll : undefined}
			/>
			<FillHistoryTable fills={filtered} />
		</div>
	)
}

export default FillsTab
```

`CylinderPicker`'s `onChange` is typed `(c?: Cylinder) => void` (callback arg is `Cylinder | undefined`), so the wrapper `(c) => setCylinder(c ?? null)` normalizes the picker's undefined to the tab's `null` state.

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/History/FillsTab.tsx
git commit -m "feat: add FillsTab with filter and sort controls"
```

---

## Task 8: Wire tabs into `app/history/page.tsx`

Replace the `<CylinderListTable cylinders=… showOwner />` and `<FillHistoryTable />` cases with the new tab components.

**Files:**
- Modify: `src/app/history/page.tsx`

- [ ] **Step 1: Replace tab render with the new components**

Edit the imports and the `getTabComponent` switch:

```tsx
'use client'

import { Suspense } from 'react'
import MaintenanceHistory from '@/components/History/MaintenanceHistory/MaintenanceHistory'
import VisHistory from '@/components/History/VisHistory'
import ClientList from '@/components/History/ClientList'
import CylindersTab from '@/components/History/CylindersTab'
import FillsTab from '@/components/History/FillsTab'
import useLoadCylinder from '@/hooks/useLoadCylinders'
import { useSearchParams } from 'next/navigation'
import { TAB } from './layout'

const HistoryContent = () => {
	const params = useSearchParams()

	const { cylinders } = useLoadCylinder()

	const getTabComponent = () => {
		switch (params.get('tab')) {
			case TAB.FILLS:
				return <FillsTab />
			case TAB.VIS_INSPECTION:
				return <VisHistory />
			case TAB.COMP_MAINTENANCE:
				return <MaintenanceHistory />
			case TAB.CLIENTS:
				return <ClientList />
			case TAB.CYLINDERS:
				return <CylindersTab cylinders={cylinders} />
			default:
				return <FillsTab />
		}
	}

	return (
		<div className='container flex w-full flex-wrap justify-center'>
			{getTabComponent()}
		</div>
	)
}

export default function History() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<HistoryContent />
		</Suspense>
	)
}
```

Delete the unused `FillHistoryTable` import (the inner table is rendered by `FillsTab` now).

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: 0 errors.

- [ ] **Step 3: Manual check — cylinders tab**

Open `/history?tab=CYLINDERS` in dev. Confirm:
- The toolbar renders above the table with Oxygen clean, Needs vis, Out of hydro, Owner, and Sort by controls.
- Changing each filter updates the visible rows.
- Active filters show as chips below the controls.
- Clicking a chip clears that filter; "Clear all" appears and resets everything.
- Switching sort changes the row order.
- On a phone width the toolbar wraps and remains usable.

- [ ] **Step 4: Manual check — fills tab**

Open `/history?tab=FILLS`. Confirm:
- Mix type filter narrows by air / nitrox / trimix.
- Cylinder picker narrows to a single cylinder's fills.
- Owner picker narrows to fills for that client's cylinders.
- Sort dropdown changes order (default newest-first).
- Chips + clear all behave as in the cylinders tab.

- [ ] **Step 5: Commit**

```bash
git add src/app/history/page.tsx
git commit -m "feat: wire filter/sort tabs into history page"
```

---

## Out of scope reminders

Confirm none of the following slipped in:
- URL param persistence
- Filtering/sorting on vis, audit, user, or client tables
- Filtering fills by date range
- Sorting fills by cylinder or end pressure
- Server-side filtering

These are explicitly deferred per the spec.
