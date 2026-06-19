# Paired Cylinder Refinements — Design

**Date:** 2026-06-19
**Status:** Approved (pending spec review)

## Background

The paired-cylinder ("doubles") feature was recently added (see
`2026-06-07-paired-cylinders-design.md`). Cylinders are paired via a
bidirectional self-referential foreign key: each cylinder of a pair stores the
other's id in `pairedCylinderId`. The pairing UI lives in `CylinderModal.tsx`,
the cylinder list shows a `LinkIcon` partner indicator, and the fill flow
auto-expands a selected cylinder into two fill records (one per member of the
pair).

This spec covers three refinements:

1. When choosing a cylinder to pair as doubles, only **unpaired** cylinders
   appear in the pairing list.
2. When doing fills, a doubles set appears as a **single** entry in the cylinder
   picker (they are always filled together).
3. A doubles set can be given a **nickname** ("doubles set name").

## Tech Stack

Next.js 16 (App Router), React 19, TypeScript, Redux Toolkit, React Query,
Sequelize + MariaDB, Tailwind v4. No test framework — verification is
`npm run lint`, `npm run build`, running the migration, and manual checks.

## Design

### 1. Data model & API

- **Migration** — `migrations/20260619000001-add-cylinder-pair-nickname.cjs`
  (CJS format, matching existing migrations). Adds a nullable `pair_nickname`
  (`STRING`) column to the `cylinders` table. `down` removes it.
- **Model** — `src/lib/models/cylinder/index.tsx`: add
  `declare pairNickname: CreationOptional<string | null>` with a matching
  `@Column`/init attribute (`pairNickname`, allowNull, default null), following
  the existing column conventions in the model.
- **Type** — `src/types/cylinder.ts`: add `pairNickname: string | null`.
- **PUT `/api/cylinders/[cylinderId]`** — extend the existing transactional
  pairing logic so `pairNickname` is kept in sync on **both** cylinders:
  - When pairing to a partner (new or changed): set `pairNickname` on both this
    cylinder and the partner.
  - When the nickname is edited without changing the partner: update both.
  - When the pairing is cleared: set `pairNickname` to `null` on both the
    cylinder and the (now ex-)partner.
  - All within the existing transaction so the two rows never drift.
- **GET routes** (`/api/cylinders`, `/api/clients/[clientId]/cylinders`)
  already return all cylinder attributes by default, so `pairNickname` and
  `pairedCylinderId` flow through with no change. No new attributes need to be
  added to the `pairedCylinder` include.

### 2. Cylinder edit modal — `src/components/Modals/CylinderModal.tsx`

- **Filter the pairing picker to unpaired cylinders only.** Replace the current
  filter:

  ```ts
  c.id !== cylinder.id && c.ownerId === cylinder.ownerId
  ```

  with:

  ```ts
  c.id !== cylinder.id &&
  c.ownerId === cylinder.ownerId &&
  (c.pairedCylinderId == null || c.id === cylinder.pairedCylinderId)
  ```

  The final clause keeps the currently-paired partner visible while editing so
  the selection is not lost.

- **Add a "Doubles set name" text input**, reusing the existing text-input
  primitive used elsewhere in the modal. Shown only when a paired cylinder is
  selected. Its value is submitted as `pairNickname`. Clearing the pairing (via
  the existing "Clear" button) also clears this field.

### 3. Fill cylinder picker — features #2 + #3 display

All pair-aware behavior is gated on the existing `isFill` flag on
`CylinderPicker`, so the cylinder list and the pairing picker are unaffected.

- **Representative rule.** For a pair, the member whose `id < pairedCylinderId`
  is the "representative." In the fill picker, the non-representative member is
  hidden so each doubles set appears exactly **once**. Selecting the
  representative already auto-expands into both fill records via the existing
  fill logic (the partner is pulled from `cylinder.pairedCylinder`), so no
  change to fill submission is required.
- **Label.** The representative entry is labeled as a pair: `pairNickname` if
  set, otherwise both serials joined (`"A123 + A124"`), shown with the existing
  `LinkIcon`. This applies to both the dropdown option rows and the
  selected-value button.
- **Search.** Extend the picker's query match (currently `serialNumber` +
  `nickname`) to also include the partner's `serialNumber` and the
  `pairNickname`, so typing either serial or the set name surfaces the pair.

## Components & Files

| File | Change |
| --- | --- |
| `migrations/20260619000001-add-cylinder-pair-nickname.cjs` | New — add `pair_nickname` column |
| `src/lib/models/cylinder/index.tsx` | Add `pairNickname` attribute |
| `src/types/cylinder.ts` | Add `pairNickname: string \| null` |
| `src/app/api/cylinders/[cylinderId]/route.tsx` | Sync `pairNickname` on both cylinders in the pairing transaction |
| `src/components/Modals/CylinderModal.tsx` | Filter pairing picker to unpaired; add "Doubles set name" input |
| `src/components/UI/FormElements/CylinderPicker.tsx` | When `isFill`: collapse pairs to representative, pair label, extended search |

## Edge Cases

- **Editing a paired cylinder:** the current partner stays visible in the
  pairing picker (filter exception) so the selection persists.
- **Unpairing:** both `pairedCylinderId` and `pairNickname` are cleared on both
  cylinders.
- **Pair with no nickname in fills:** labeled with both serials joined; the
  representative is the lower-id member.
- **Already-used cylinder in a fill session:** the existing `usedCylinders`
  filter (which includes both `cylinder.id` and `pairedCylinder.id`) continues
  to hide a set once either member is used; the collapse logic and this filter
  compose without double-showing.
- **Expired cylinders / `showExpired`:** unchanged — pair collapse layers on top
  of existing filtering.

## Out of Scope

- Migrating to a separate `CylinderPair` table (denormalized column chosen
  instead, consistent with the existing self-FK design).
- Changing how fills are expanded into two records (already implemented).
- Bulk/UI management of doubles sets outside the cylinder edit modal.

## Verification

- `npm run lint` and `npm run build` pass.
- Migration runs cleanly (`npx sequelize-cli db:migrate`) and `down` reverts.
- Manual: pairing picker only lists unpaired cylinders (plus current partner
  when editing); doubles set name saves and round-trips on both cylinders;
  fill picker shows each doubles set once with the correct label; search by
  either serial or set name finds the pair; clearing a pairing clears the name
  on both cylinders.
