# Paired Cylinder Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the doubles feature so the pairing list shows only unpaired cylinders, a doubles set appears once in the fill picker, and a doubles set can be named.

**Architecture:** Builds on the existing bidirectional self-FK (`pairedCylinderId`). Adds a denormalized `pairNickname` column kept in sync on both cylinders of a pair by the PUT route's existing pairing transaction. The fill picker (`CylinderPicker` with `isFill`) collapses each pair to a single "representative" entry (the member whose `id < pairedCylinderId`) and labels it. The pairing picker (`CylinderModal`) filters to unpaired cylinders.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Redux Toolkit, React Query, Sequelize + MariaDB, Tailwind v4.

## Global Constraints

- No test framework exists. Verification per task is `npm run lint`, `npm run build`, running the migration, and explicit manual checks — there are no unit tests to write.
- Always run `npm run lint` after code changes (project rule).
- Prettier style: single quotes, no semicolons, tabs, 80 char width.
- Use theme tokens (`text-text`, `bg-background`, etc.), not hardcoded Tailwind colors. No redundant `dark:` variants.
- The Sequelize table is `Cylinders` (capitalized); columns are camelCase (e.g. `pairedCylinderId`, new column `pairNickname`).
- **Org policy: do NOT commit or push without explicit user approval.** Treat each "Commit" step as "stage the listed files and ask the user to approve the commit." Run all git commands from the repo root; never use `-C`.
- The representative of a pair is the member whose `id < pairedCylinderId`. An unpaired cylinder (`pairedCylinderId == null`) is always its own representative.

---

### Task 1: Data layer — migration, model, type

**Files:**
- Create: `migrations/20260619000001-add-cylinder-pair-nickname.cjs`
- Modify: `src/lib/models/cylinder/index.tsx` (attribute declaration ~line 58, init block ~line 178)
- Modify: `src/types/cylinder.ts` (Cylinder type ~line 16, NewCylinderDTO ~line 40)

**Interfaces:**
- Produces: `Cylinder.pairNickname` (DB column `pairNickname` on `Cylinders`, `STRING`, nullable, default null); TS `Cylinder.pairNickname?: string | null`; `NewCylinderDTO.pairNickname?: string | null`.

- [ ] **Step 1: Write the migration**

Create `migrations/20260619000001-add-cylinder-pair-nickname.cjs`:

```js
'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('Cylinders', 'pairNickname', {
			type: Sequelize.STRING,
			allowNull: true,
			defaultValue: null,
		})
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('Cylinders', 'pairNickname')
	},
}
```

- [ ] **Step 2: Run the migration**

Run: `npx sequelize-cli db:migrate`
Expected: `20260619000001-add-cylinder-pair-nickname` runs successfully, no errors. (Requires the local MariaDB from `docker compose up` to be running.)

Sanity-check the reversibility, then re-apply:

Run: `npx sequelize-cli db:migrate:undo && npx sequelize-cli db:migrate`
Expected: undo removes the column cleanly, re-migrate re-adds it.

- [ ] **Step 3: Add the model attribute**

In `src/lib/models/cylinder/index.tsx`, after the `pairedCylinder` declaration (line 59), add the attribute declaration:

```ts
	declare pairedCylinderId: CreationOptional<ForeignKey<Cylinder['id']> | null>
	declare pairedCylinder?: NonAttribute<Cylinder>

	declare pairNickname: CreationOptional<string | null>
```

In the `Cylinder.init` block, after the `pairedCylinderId` attribute (lines 178-182), add:

```ts
		pairedCylinderId: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: true,
			defaultValue: null,
		},
		pairNickname: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null,
		},
```

- [ ] **Step 4: Add the TypeScript types**

In `src/types/cylinder.ts`, add `pairNickname` to the `Cylinder` type after `pairedCylinderId` (line 16):

```ts
	pairedCylinderId?: number | null
	pairNickname?: string | null
```

And to `NewCylinderDTO` after `pairedCylinderId` (line 40):

```ts
	pairedCylinderId?: number | null
	pairNickname?: string | null
```

- [ ] **Step 5: Verify lint and build**

Run: `npm run lint && npm run build`
Expected: no errors.

- [ ] **Step 6: Commit** (stage, then request approval per org policy)

```bash
git add migrations/20260619000001-add-cylinder-pair-nickname.cjs src/lib/models/cylinder/index.tsx src/types/cylinder.ts
git commit -m "feat: add pairNickname column for doubles set name

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Sync pairNickname on both cylinders in the PUT route

**Files:**
- Modify: `src/app/api/cylinders/[cylinderId]/route.tsx` (destructure ~line 37, pairing transaction lines 79-126)

**Interfaces:**
- Consumes: `Cylinder.pairNickname` (Task 1).
- Produces: PUT body now accepts `pairNickname: string | null`. After a successful pairing/unpairing, both cylinders of the pair share the same `pairNickname`; detached ex-partners have `pairNickname = null`.

- [ ] **Step 1: Read `pairNickname` from the request body**

In `src/app/api/cylinders/[cylinderId]/route.tsx`, add `pairNickname` to the destructure (after `pairedCylinderId`, line 37):

```ts
		size,
		pairedCylinderId,
		pairNickname,
	} = await request.json()
```

Immediately after that block, normalize it:

```ts
	const normalizedPairNickname =
		typeof pairNickname === 'string' && pairNickname.trim() !== ''
			? pairNickname.trim()
			: null
```

- [ ] **Step 2: Set pairNickname to null when clearing the pairing**

In the `if (pairedCylinderId === null)` branch (lines 84-92), update the partner detach and the cylinder itself to also clear the nickname:

```ts
			if (pairedCylinderId === null) {
				// Clearing: detach this cylinder and its old partner.
				if (previousPartnerId) {
					await Cylinder.update(
						{ pairedCylinderId: null, pairNickname: null },
						{ where: { id: previousPartnerId }, transaction },
					)
				}
				cylinder.pairedCylinderId = null
				cylinder.pairNickname = null
			} else {
```

- [ ] **Step 3: Set pairNickname on both cylinders when pairing**

In the `else` (pairing to a partner) branch (lines 93-125), clear the nickname on any detached ex-partners and set it on both members of the new pair:

```ts
			} else {
				// Pairing to a new partner.
				// Detach this cylinder's old partner, if different.
				if (previousPartnerId && previousPartnerId !== pairedCylinderId) {
					await Cylinder.update(
						{ pairedCylinderId: null, pairNickname: null },
						{ where: { id: previousPartnerId }, transaction },
					)
				}
				// Detach the new partner's existing partner, if any.
				const partner = await Cylinder.findByPk(pairedCylinderId, {
					transaction,
				})
				if (!partner) {
					await transaction.rollback()
					return Response.json(
						{ error: 'not_found', message: 'Paired cylinder not found' },
						{ status: 400 },
					)
				}
				if (
					partner.pairedCylinderId &&
					partner.pairedCylinderId !== cylinder.id
				) {
					await Cylinder.update(
						{ pairedCylinderId: null, pairNickname: null },
						{ where: { id: partner.pairedCylinderId }, transaction },
					)
				}
				partner.pairedCylinderId = cylinder.id
				partner.pairNickname = normalizedPairNickname
				await partner.save({ transaction })
				cylinder.pairedCylinderId = pairedCylinderId
				cylinder.pairNickname = normalizedPairNickname
			}
```

- [ ] **Step 4: Verify lint and build**

Run: `npm run lint && npm run build`
Expected: no errors.

- [ ] **Step 5: Manual check**

With the dev server running (`docker compose up` or `npm run dev`):
1. Edit a cylinder, pair it with another, set a doubles set name, save.
2. Reload and edit BOTH cylinders — confirm each shows the same set name.
3. Edit one, change the set name, save — confirm both reflect the new name.
4. Clear the pairing on one — confirm both lose the set name and the link.

- [ ] **Step 6: Commit** (stage, then request approval per org policy)

```bash
git add src/app/api/cylinders/[cylinderId]/route.tsx
git commit -m "feat: sync doubles set name across both paired cylinders

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Cylinder modal — unpaired filter + doubles set name input

**Files:**
- Modify: `src/components/Modals/CylinderModal.tsx` (state ~line 78, submit ~line 115, pairing UI lines 277-302)

**Interfaces:**
- Consumes: `Cylinder.pairNickname`, `Cylinder.pairedCylinderId` (Task 1); PUT body `pairNickname` (Task 2).
- Produces: submits `formData.pairNickname` (string or null) alongside `pairedCylinderId`.

- [ ] **Step 1: Add doubles-set-name state**

In `src/components/Modals/CylinderModal.tsx`, after the `pairedCylinder` state (lines 78-80), add:

```ts
	const [pairedCylinder, setPairedCylinder] = useState<Cylinder | null>(
		(cylinder?.pairedCylinder as Cylinder) ?? null,
	)
	const [pairNickname, setPairNickname] = useState<string>(
		cylinder?.pairNickname ?? '',
	)
```

- [ ] **Step 2: Submit the doubles set name**

In `handleSubmit`, replace the single pairing line (line 115):

```ts
		// Pairing is edit-only; for new cylinders this is null and ignored by the API.
		formData.pairedCylinderId = pairedCylinder ? pairedCylinder.id : null
```

with:

```ts
		// Pairing is edit-only; for new cylinders this is null and ignored by the API.
		formData.pairedCylinderId = pairedCylinder ? pairedCylinder.id : null
		formData.pairNickname =
			pairedCylinder && pairNickname.trim() !== '' ? pairNickname.trim() : null
```

- [ ] **Step 3: Filter the pairing picker to unpaired cylinders and add the name input**

Replace the pairing block (lines 277-302) with:

```tsx
									{cylinder && (
										<div className='space-y-2'>
											<p className='text-text text-sm/6 font-medium'>
												Paired cylinder (doubles)
											</p>
											<div className='flex items-end gap-2'>
												<CylinderPicker
													disableAdd={true}
													value={pairedCylinder}
													filter={(c) =>
														c.id !== cylinder.id &&
														c.ownerId === cylinder.ownerId &&
														(c.pairedCylinderId == null ||
															c.id === cylinder.pairedCylinderId)
													}
													onChange={(c) => setPairedCylinder(c ?? null)}
												/>
												{pairedCylinder && (
													<Button
														variant='ghost'
														onClick={() => {
															setPairedCylinder(null)
															setPairNickname('')
														}}
													>
														Clear
													</Button>
												)}
											</div>
											{pairedCylinder && (
												<TextInput
													type='text'
													id='pair-nickname'
													name='pairNickname'
													ariaLabel='Doubles set name'
													value={pairNickname}
													onChange={(e) =>
														setPairNickname(
															(e.target as HTMLInputElement).value,
														)
													}
													placeholder='Doubles set name (optional)'
												/>
											)}
										</div>
									)}
```

(Note: `TextInput` is already imported at line 10. The controlled `pairNickname` field is the source of truth — `handleSubmit` reads it from state, not from `form.entries()`, so the conditional render is safe.)

- [ ] **Step 4: Verify lint and build**

Run: `npm run lint && npm run build`
Expected: no errors.

- [ ] **Step 5: Manual check**

1. Edit an unpaired cylinder, open the pairing picker — confirm only unpaired cylinders of the same owner appear (no already-paired ones).
2. Edit an already-paired cylinder — confirm its current partner still appears/stays selected, and the doubles set name field shows the existing name.
3. Pair, type a set name, save — round-trips (covered with Task 2's checks).

- [ ] **Step 6: Commit** (stage, then request approval per org policy)

```bash
git add src/components/Modals/CylinderModal.tsx
git commit -m "feat: filter pairing list to unpaired cylinders and add doubles set name input

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Fill picker — collapse pairs to one entry, label, and search

**Files:**
- Modify: `src/components/UI/FormElements/CylinderPicker.tsx` (imports ~line 13, query filter lines 65-74, label fn lines 76-79, displayValue line 113, options render lines 149-187)

**Interfaces:**
- Consumes: `Cylinder.pairNickname`, `Cylinder.pairedCylinderId`, `Cylinder.pairedCylinder.serialNumber` (returned by GET `/api/cylinders`); `isFill` prop (existing).
- Produces: in fill context, each pair renders once (representative only), labeled by set name or both serials with a link icon; search matches partner serial and set name.

- [ ] **Step 1: Import the link icon**

In `src/components/UI/FormElements/CylinderPicker.tsx`, add `LinkIcon` to the outline-icon import (line 13):

```ts
import { ChevronDownIcon, LinkIcon } from '@heroicons/react/24/outline'
```

- [ ] **Step 2: Add representative + pair-label helpers and extend search**

Replace the query-filter block and label function (lines 65-79) with:

```ts
	const isRepresentative = (cylinder: Cylinder) =>
		cylinder.pairedCylinderId == null ||
		cylinder.id < cylinder.pairedCylinderId

	const isPair = (cylinder: Cylinder) =>
		isFill && cylinder.pairedCylinderId != null

	const filteredCylinders =
		query === ''
			? cylinders
			: cylinders.filter((cylinder) => {
					const q = query.toLowerCase()
					return (
						cylinder.serialNumber.toLowerCase().includes(q) ||
						(cylinder.nickname?.toLowerCase().includes(q) ?? false) ||
						(isPair(cylinder) &&
							((cylinder.pairedCylinder?.serialNumber
								?.toLowerCase()
								.includes(q) ??
								false) ||
								(cylinder.pairNickname?.toLowerCase().includes(q) ??
									false)))
					)
				})

	const formatCylinderLabel = (cylinder: Cylinder) =>
		cylinder.nickname
			? `${cylinder.nickname} (${cylinder.serialNumber})`
			: cylinder.serialNumber

	const formatPickerLabel = (cylinder: Cylinder) => {
		if (isPair(cylinder)) {
			if (cylinder.pairNickname) return cylinder.pairNickname
			const partnerSerial = cylinder.pairedCylinder?.serialNumber
			if (partnerSerial)
				return `${cylinder.serialNumber} + ${partnerSerial}`
		}
		return formatCylinderLabel(cylinder)
	}
```

- [ ] **Step 3: Use the pair label in the selected-value display**

In the `ComboboxInput`, change `displayValue` (lines 113-115) to use `formatPickerLabel`:

```tsx
					displayValue={(cylinder: Cylinder) =>
						cylinder ? formatPickerLabel(cylinder) : ''
					}
```

- [ ] **Step 4: Collapse pairs and label options in the dropdown**

In the options render (lines 149-187), (a) add the representative filter for fill context, and (b) show the pair label with a link icon. Replace:

```tsx
					{filter &&
						filteredCylinders.filter(filter).map((cylinder) => {
```

with:

```tsx
					{filter &&
						filteredCylinders
							.filter(filter)
							.filter((c) => !isFill || isRepresentative(c))
							.map((cylinder) => {
```

and replace the label span (lines 164-174):

```tsx
									<span className='flex items-center gap-1'>
										{!cylinder.verified && (
											<Tooltip
												position='right'
												message='User entered details, requires verification'
											>
												<ExclamationTriangleIcon className='size-5 fill-yellow-500' />
											</Tooltip>
										)}
										{formatCylinderLabel(cylinder)}
									</span>
```

with:

```tsx
									<span className='flex items-center gap-1'>
										{!cylinder.verified && (
											<Tooltip
												position='right'
												message='User entered details, requires verification'
											>
												<ExclamationTriangleIcon className='size-5 fill-yellow-500' />
											</Tooltip>
										)}
										{isPair(cylinder) && (
											<LinkIcon className='h-4 w-4' />
										)}
										{formatPickerLabel(cylinder)}
									</span>
```

- [ ] **Step 5: Verify lint and build**

Run: `npm run lint && npm run build`
Expected: no errors.

- [ ] **Step 6: Manual check**

On the fills page (`/fills`), with a client that owns a paired set:
1. Open the cylinder picker — confirm the doubles set appears exactly once (not both members), with a link icon and the set name (or `A123 + A124` if unnamed).
2. Type one member's serial, then the partner's serial, then the set name — each surfaces the single pair entry.
3. Select the pair — confirm the fill expands into both cylinders on submit (existing behavior), and the selected-value box shows the pair label.
4. Confirm non-paired cylinders still appear and behave as before, and the pairing picker in the cylinder edit modal (non-fill) still lists individual cylinders (unaffected by collapse).

- [ ] **Step 7: Commit** (stage, then request approval per org policy)

```bash
git add src/components/UI/FormElements/CylinderPicker.tsx
git commit -m "feat: show doubles set as single labeled entry in fill picker

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Feature 1 (pairing list shows only unpaired) → Task 3, Step 3 filter.
- Feature 2 (one cylinder of a set in fills) → Task 4, Steps 2 & 4 (representative collapse).
- Feature 3 (doubles set nickname) → Task 1 (column/type), Task 2 (sync), Task 3 (input), Task 4 (label/search display).
- Spec "Data model & API" → Task 1 + Task 2. GET routes need no change (return all attributes) — confirmed, no task needed.
- Spec edge cases (editing keeps current partner, unpair clears both, unnamed pair label, used-cylinder filter, expired) → covered in Task 3 filter, Task 2 clearing branch, Task 4 label fallback + representative filter layering on existing `filter`/`showExpired`.

**Placeholder scan:** No TBD/TODO/"handle edge cases" — all steps contain concrete code and commands.

**Type consistency:** `pairNickname` (string | null) used consistently across model, type, DTO, PUT body, modal submit, and picker. `isRepresentative`/`isPair`/`formatPickerLabel` helper names used consistently within Task 4. `normalizedPairNickname` defined and used within Task 2.
