# Table filters & sort — design

History page tables (cylinders, fills) need filtering and sorting so users
can find specific cylinders or fills without scrolling. Same UX pattern
applies to both tables.

## Shared infrastructure

### `<TableToolbar>` component

Renders above a table. Props:

- `children`: filter controls (`ListBox`, `ClientPicker`, `CylinderPicker`, …)
- `activeFilters`: `Array<{ label: string; onClear: () => void }>` — drives the
  chip row and the "Clear all" button (also hidden when empty)
- `onClearAll`: `() => void`

Layout:

```
┌───────────────────────────────────────────────────────┐
│ ▼ Oxygen  ▼ Vis  ▼ Hydro  ▼ Owner       Sort: ▼ Field │
│ [Needs vis ✕]  [Owner: Marshall ✕]      Clear all     │
└───────────────────────────────────────────────────────┘
```

Filter row wraps on small screens (`flex flex-wrap gap-2`). Chip row hidden
when no filters active.

### `useTableFilters<T>` hook

```ts
useTableFilters<T>(items: T[], {
  predicates: Array<(item: T) => boolean>,
  sort?: (a: T, b: T) => number,
}): T[]
```

- Applies all predicates with AND (any predicate returning `false` rejects the
  item)
- Applies `sort` after filtering
- Memoized so downstream `usePagination` stays stable when inputs don't change
- Returns a new array; caller passes the result into `usePagination`

Composition pattern:

```ts
const filtered = useTableFilters(items, { predicates, sort })
const { paginatedItems, page, setPage, totalPages } = usePagination(filtered)
```

## Where the toolbar lives

Toolbar mounts on the history page (`src/app/history/page.tsx`), not inside the
table component. The history page owns filter/sort state via `useState`, runs
the items through `useTableFilters`, and passes the result into the table as
its existing `cylinders` / `fills` prop.

Rationale:

- Tables stay generic — they keep accepting a flat list and rendering it
- A future move to URL params is a one-page change
- Toolbar is per-tab, so it lives where the tab routing lives

The non-history caller (`/app/clients/[slug]`, etc., if they reuse
`CylinderListTable`) keeps working — they just don't render a toolbar.

## Cylinders (#5)

### Filter controls

| Filter | Control | Predicate |
|---|---|---|
| Oxygen clean | `ListBox`: Any / Yes / No | `value === 'any' \|\| cylinder.oxygenClean === (value === 'yes')` |
| Needs vis | `ListBox`: Any / Yes / No | derived from `dayjs(lastVis).add(1, 'year').isBefore(now)` |
| Out of hydro | `ListBox`: Any / Yes / No | derived from `dayjs(lastHydro).add(5, 'year').isBefore(now)` |
| Owner | `ClientPicker` (controlled, `disableAdd`) | `cylinder.ownerId === client.id` |

### Sort options

Single `ListBox` with combined field+direction options:

- Serial / nickname (A→Z) — default
- Last vis (oldest first)
- Last vis (newest first)
- Last hydro (oldest first)
- Last hydro (newest first)

Sort comparators live next to the options in a small lookup map (keyed by the
ListBox value).

### Active filter chips

- `Oxygen clean: Yes` (clears to Any)
- `Needs vis` (clears to Any) — single label since the affirmative is the
  interesting case; "No" reads as "any" effectively
- `Out of hydro` (clears to Any)
- `Owner: <client name>` (clears the picker)

## Fill history (#8)

### Filter controls

| Filter | Control | Predicate |
|---|---|---|
| Mix type | `ListBox`: Any / Air / Nitrox / Trimix | category derived from `oxygen` / `helium`: `helium > 0 → trimix`, `oxygen === 20.9 → air`, else `nitrox` |
| Cylinder | `CylinderPicker` (controlled, `disableAdd`) | `fill.Cylinder.id === cylinder.id` |
| Owner | `ClientPicker` (controlled, `disableAdd`) | `fill.Cylinder.Client?.id === client.id` |

### Sort options

- Date (newest first) — default
- Date (oldest first)
- Mix type (alphabetical)

### Active filter chips

- `Mix: Air` (clears to Any)
- `Cylinder: <nickname or serial>` (clears the picker)
- `Owner: <client name>` (clears the picker)

## Constants

Sort option lists, "needs vis" / "out of hydro" thresholds, and the mix-type
categorization already exist in code:

- Add `CYLINDER_SORT_OPTIONS` and `FILL_SORT_OPTIONS` to
  `src/app/constants/FormConstants.ts` alongside existing `ROLE_OPTIONS`
- Add a `getFillCategory(fill)` helper next to existing `getFillMix` (or
  extract both to `src/lib/fills.ts`) returning `'air' | 'nitrox' | 'trimix'`
  for the predicate

## State

- All filter/sort state lives in `app/history/page.tsx` via `useState`
- Survives tab switches via the existing tab routing (history page stays
  mounted); resets on full navigation away
- No URL params (deferred — toolbar location keeps this a small future change)

## Out of scope

- URL param persistence
- Saving filter presets
- Server-side filtering (table sizes are small enough for client filtering)
- Filtering on the audit log, user list, or client list tables
- Sorting fills by cylinder name or end pressure (user opted out)
- Filtering fills by date range (user opted out)

## Build order

1. `<TableToolbar>` component + `useTableFilters` hook + sort-option constants
2. Wire cylinder filters/sort into the history page → `CylinderListTable`
3. Wire fill filters/sort into the history page → `FillHistoryTable`
