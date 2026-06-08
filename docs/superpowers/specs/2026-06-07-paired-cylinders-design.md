# Paired Cylinders (Doubles) — Design

**Date:** 2026-06-07
**Status:** Approved (pending spec review)

## Problem

A set of doubles (twinset) is two cylinders manifolded together that share the
same gas mix and pressure. Today each Fill record maps 1:1 to a single cylinder
and there is no concept of grouping. Recording a fill for a double means adding
two separate rows in the fills page and re-entering the same pressures and gas
mix twice. This is tedious and error-prone.

## Goal

Let a user define two cylinders as a persistent pair, then fill them as a single
unit — entering pressure and gas mix once — while still keeping per-cylinder fill
records for history and inspections.

## Decisions

- **Persistent set**, modeled as a **pairing field on the cylinder** (a nullable
  self-referential `pairedCylinderId`), not a separate set model. Supports pairs
  only (not triples).
- Pairing is restricted to cylinders owned by the **same client**.
- A cylinder is in **at most one** pair. Re-pairing reassigns and clears the old
  partner.
- A paired fill still produces **two Fill records** (one per cylinder). Fill
  history, edits, and visual inspections are unchanged — the DB Fill schema and
  the POST `/api/fills` route need no change.
- Fill-time behavior: selecting one cylinder of a pair shows a **single combined
  row with shared inputs**; both cylinders are filled with identical values on
  submit, with an option to unlink for the occasional single-tank fill.

## 1. Data model

Add a nullable column `pairedCylinderId` (INTEGER, FK → `cylinders.id`,
`ON DELETE SET NULL`) to the Cylinder model.

- **Migration** (`migrations/`, CJS, `YYYYMMDDNNNNNN-add-paired-cylinder-id.cjs`):
  add the column and a self-referential foreign key constraint with
  `onDelete: 'SET NULL'`.
- **Model** (`src/lib/models/cylinder/index.tsx`): declare the `pairedCylinderId`
  attribute and a self-association (`Cylinder.belongsTo(Cylinder, { as: 'pairedCylinder', foreignKey: 'pairedCylinderId' })`)
  so the partner can be eager-loaded.
- **Type** (`src/types/cylinder.ts`): add `pairedCylinderId?: number | null` and
  an optional eager-loaded `pairedCylinder?` (minimal shape: id, serialNumber,
  nickname, servicePressure, oxygenClean) to `Cylinder`. Add
  `pairedCylinderId?: number | null` to the create/edit DTO.
- Two cylinders in a double point at each other (A→B and B→A). Both pointers are
  kept consistent by the API (see §4).

## 2. Pairing management (CylinderModal)

Pairing is **edit-only** — a cylinder must exist before it can be paired, so the
create flow is unchanged.

In `src/components/Modals/CylinderModal.tsx`, when editing an existing cylinder,
add a "Paired cylinder" control:

- A `CylinderPicker` in **controlled mode** (`value`/`onChange`), listing only
  the **same owner's** other cylinders, excluding the cylinder being edited.
- Selecting a cylinder links them; clearing the selection unlinks.
- The selected `pairedCylinderId` is submitted with the rest of the form to the
  PUT route.
- Show nothing (or a disabled hint) in the create flow.

## 3. Fill recording (fills page)

When a cylinder selected via `CylinderPicker` (in `FillsRow` / `FillCard`) has a
`pairedCylinder`, the row becomes a **combined paired row**:

- The cylinder cell shows both cylinders, e.g. `Yellow Set — SN123 + SN124`
  (fall back to serials when no nickname).
- Pressure and gas-mix inputs appear **once** and apply to both cylinders.
- Both cylinders are marked "used" so neither can be re-selected elsewhere in the
  batch (the existing used-cylinder filter must account for partners).
- A small **"unlink for this fill"** control drops the partner, reverting to a
  normal single-cylinder row (for filling just one tank of a set).

**State/Redux** (`src/redux/fills/fillsSlice.ts`):

- The in-progress fill entry (`Fill` in `src/types/fills.ts`) gains an optional
  `pairedCylinder?: Cylinder`.
- A `updateCylinder` action that selects a cylinder with a partner also sets
  `pairedCylinder`. Add an action (or reuse `updateFill`/`updateCylinder`) to
  clear `pairedCylinder` for the unlink control.

**Submit** (fills page submit handler):

- When mapping fill entries to `FillDto[]`, any entry carrying a `pairedCylinder`
  expands into **two `FillDto` records** with identical `date`, `startPressure`,
  `endPressure`, `oxygen`, `helium` — one per cylinder id.
- POST `/api/fills` is unchanged.

**Auto end-pressure:** when a paired cylinder is selected and end pressure is 0,
auto-fill from the **selected (primary)** cylinder's `servicePressure` (existing
behavior, applied once).

## 4. API changes

`PUT /api/cylinders/[cylinderId]` (`src/app/api/cylinders/[cylinderId]/route.tsx`)
accepts `pairedCylinderId` and maintains bidirectional consistency inside a
**transaction**:

1. Validate the target partner (if provided) exists and has the **same owner**;
   reject otherwise (400).
2. Let `old = current cylinder.pairedCylinderId`.
3. If pairing to B:
   - If B was paired to some D (≠ this cylinder), clear `D.pairedCylinderId`.
   - If this cylinder was paired to some C (≠ B), clear `C.pairedCylinderId`.
   - Set `this.pairedCylinderId = B` and `B.pairedCylinderId = this`.
4. If clearing (null):
   - Set `this.pairedCylinderId = null` and, if `old` existed, clear that
     partner's pointer too.
5. Audit-log the pairing change consistent with existing PUT audit behavior.

`GET` cylinder routes eager-load `pairedCylinder` so the fills page and cylinder
list have partner data available.

## 5. Display (cylinder list)

Optionally show a small "paired" indicator on `CylinderListRow.tsx` (e.g. a link
chip referencing the partner serial). Low priority; include only if it fits
cleanly within the existing row layout.

## 6. Edge cases

- **Mismatched `servicePressure`** between partners: auto-fill end pressure from
  the selected (primary) cylinder. Rare for true doubles.
- **Gas/cert validation** (oxygen clean; nitrox/trimix certs): validated against
  **both** cylinders; if either fails, show the existing warning dialog.
- **Deleting a cylinder**: `ON DELETE SET NULL` clears the partner's pointer
  automatically at the DB level.
- **Same-owner constraint**: enforced server-side; the picker also filters by
  owner client-side.

## Out of scope

- Sets larger than two cylinders (manifolded banks of 3+).
- Editing/splitting an already-recorded paired fill as a unit — edits remain
  per-record via the existing EditFillModal.
- A dedicated CylinderSet model or named sets.

## Files touched

- `migrations/YYYYMMDDNNNNNN-add-paired-cylinder-id.cjs` (new)
- `src/lib/models/cylinder/index.tsx`
- `src/types/cylinder.ts`
- `src/types/fills.ts`
- `src/components/Modals/CylinderModal.tsx`
- `src/app/api/cylinders/[cylinderId]/route.tsx`
- cylinder GET routes (`src/app/api/cylinders/route.tsx`,
  `src/app/api/clients/[clientId]/cylinders/route.tsx`) — eager-load partner
- `src/redux/fills/fillsSlice.ts`
- `src/components/` fills row/card + `CylinderPicker` (combined paired row, unlink)
- fills page submit handler (`src/app/fills/page.tsx`)
- `src/components/Cylinders/CylinderListRow.tsx` (optional indicator)
