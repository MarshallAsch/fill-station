# Paired Cylinders (Doubles) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let two cylinders be linked as a persistent pair so a "set of doubles" can be filled in one row — entering pressure/gas once — while still producing one Fill record per cylinder.

**Architecture:** A nullable self-referential `pairedCylinderId` column on the Cylinder model links two cylinders (A↔B). The cylinder edit modal manages the pairing; the PUT route keeps both pointers consistent in a transaction. On the fills page, selecting a paired cylinder carries its partner in the in-progress Redux fill entry; on submit, a paired entry expands into two `FillDto` records with identical values, so the Fill DB schema and POST `/api/fills` are unchanged.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Redux Toolkit, React Query, Sequelize + MariaDB, Tailwind v4. No test framework is configured — verification is `npm run lint`, `npm run build`, running migrations, and explicit manual checks.

**Spec:** `docs/superpowers/specs/2026-06-07-paired-cylinders-design.md`

---

## File Structure

- `migrations/20260607000001-add-cylinder-paired.cjs` (new) — adds `pairedCylinderId` column + self FK.
- `src/lib/models/cylinder/index.tsx` — attribute + self-association.
- `src/types/cylinder.ts` — `pairedCylinderId` / `pairedCylinder` on type + DTO.
- `src/types/fills.ts` — `pairedCylinder` on in-progress `Fill`.
- `src/app/api/cylinders/route.tsx` — eager-load partner in GET.
- `src/app/api/clients/[clientId]/cylinders/route.tsx` — eager-load partner in GET.
- `src/app/api/cylinders/[cylinderId]/route.tsx` — accept `pairedCylinderId`, bidirectional update in a transaction.
- `src/components/Modals/CylinderModal.tsx` — pairing picker (edit-only) + clear button.
- `src/components/Fills/FillsRow.tsx` / `FillCard.tsx` — combined paired row, used-cylinder filter, unlink control.
- `src/components/Fills/FillType.tsx` — validate gas/cert against both cylinders of a pair.
- `src/app/fills/page.tsx` — expand paired entries into two `FillDto` on submit.
- `src/components/Cylinders/CylinderListRow.tsx` — optional "paired" indicator.

---

## Task 1: Database migration + model column

**Files:**
- Create: `migrations/20260607000001-add-cylinder-paired.cjs`
- Modify: `src/lib/models/cylinder/index.tsx`

- [ ] **Step 1: Write the migration**

Create `migrations/20260607000001-add-cylinder-paired.cjs`:

```js
'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('Cylinders', 'pairedCylinderId', {
			type: Sequelize.INTEGER.UNSIGNED,
			allowNull: true,
			defaultValue: null,
			references: { model: 'Cylinders', key: 'id' },
			onUpdate: 'CASCADE',
			onDelete: 'SET NULL',
		})
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('Cylinders', 'pairedCylinderId')
	},
}
```

- [ ] **Step 2: Run the migration**

Run: `npx sequelize-cli db:migrate`
Expected: migration `20260607000001-add-cylinder-paired` runs successfully, no errors. (Requires the local MariaDB from `docker compose up` to be running.)

- [ ] **Step 3: Add the attribute and association to the model**

In `src/lib/models/cylinder/index.tsx`, add the attribute declaration after the `size` declaration (line 56):

```ts
	declare size: CreationOptional<number | null>

	declare pairedCylinderId: CreationOptional<number | null>
	declare pairedCylinder?: NonAttribute<Cylinder>
```

In the `Cylinder.init({...})` object, add this column definition after the `size` block (after line 167):

```ts
		size: {
			type: DataTypes.FLOAT,
			allowNull: true,
			defaultValue: null,
		},
		pairedCylinderId: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: true,
			defaultValue: null,
		},
```

After the existing associations at the bottom of the file (after line 178), add the self-association:

```ts
Cylinder.belongsTo(Client, { foreignKey: 'ownerId' })
Client.hasMany(Cylinder, { foreignKey: 'ownerId' })

Cylinder.belongsTo(Cylinder, {
	as: 'pairedCylinder',
	foreignKey: 'pairedCylinderId',
})
```

- [ ] **Step 4: Verify it compiles**

Run: `npm run lint`
Expected: passes (prettier + eslint) with no errors in the edited files.

- [ ] **Step 5: Commit**

```bash
git add migrations/20260607000001-add-cylinder-paired.cjs src/lib/models/cylinder/index.tsx
git commit -m "feat: add pairedCylinderId column and self-association to Cylinder"
```

---

## Task 2: Type updates

**Files:**
- Modify: `src/types/cylinder.ts`

- [ ] **Step 1: Add fields to the Cylinder type and DTO**

In `src/types/cylinder.ts`, add `pairedCylinderId` and `pairedCylinder` to `Cylinder` (after `size`, line 15), and `pairedCylinderId` to `NewCylinderDTO` (after `size`, line 30). The `pairedCylinder` partner uses a minimal shape (only scalar, non-date fields are eager-loaded by the API):

```ts
export type Cylinder = {
	id: number
	serialNumber: string
	birth: string | undefined
	lastHydro: string | undefined
	lastVis: string | undefined
	ownerId?: number
	Client?: { id: number; name: string } | null
	servicePressure: number
	oxygenClean: boolean
	verified: boolean
	material?: 'steel' | 'aluminum' | 'composite'
	nickname?: string | null
	manufacturer?: string | null
	size?: number | null
	pairedCylinderId?: number | null
	pairedCylinder?: {
		id: number
		serialNumber: string
		nickname?: string | null
		servicePressure: number
		oxygenClean: boolean
		ownerId?: number
	} | null
	createdAt?: string
	updatedAt?: string
}

export type NewCylinderDTO = {
	serialNumber: string
	birth: Date
	lastHydro: Date
	lastVis: Date
	servicePressure: number
	oxygenClean: boolean
	material?: 'steel' | 'aluminum' | 'composite'
	nickname?: string
	manufacturer?: string
	size?: number
	pairedCylinderId?: number | null
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run lint`
Expected: passes with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/cylinder.ts
git commit -m "feat: add paired cylinder fields to Cylinder type and DTO"
```

---

## Task 3: Eager-load the partner in cylinder GET routes

**Files:**
- Modify: `src/app/api/cylinders/route.tsx:12-14`
- Modify: `src/app/api/clients/[clientId]/cylinders/route.tsx:19-23`

The partner is loaded with a curated **non-date** attribute list. This keeps the nested object JSON-serializable (no dayjs getters fire) so it is safe to store in Redux.

- [ ] **Step 1: Add the include to `GET /api/cylinders`**

In `src/app/api/cylinders/route.tsx`, replace the `findAll` call (lines 12-14):

```ts
	const cylinders = await Cylinder.findAll({
		include: [
			{ model: Client, attributes: ['id', 'name'] },
			{
				model: Cylinder,
				as: 'pairedCylinder',
				attributes: [
					'id',
					'serialNumber',
					'nickname',
					'servicePressure',
					'oxygenClean',
					'ownerId',
				],
			},
		],
	})
```

- [ ] **Step 2: Add the include to `GET /api/clients/[clientId]/cylinders`**

In `src/app/api/clients/[clientId]/cylinders/route.tsx`, replace the `findAll` call (lines 19-23):

```ts
	const cylinders = await Cylinder.findAll({
		where: {
			ownerId: clientId,
		},
		include: [
			{
				model: Cylinder,
				as: 'pairedCylinder',
				attributes: [
					'id',
					'serialNumber',
					'nickname',
					'servicePressure',
					'oxygenClean',
					'ownerId',
				],
			},
		],
	})
```

- [ ] **Step 3: Verify and manually check**

Run: `npm run lint`
Expected: passes.

Then with the dev server running (`npm run dev`) and signed in, in the browser console or a terminal hit the cylinders endpoint and confirm the shape includes `pairedCylinder` (null until pairing exists):

Run: `curl -s http://localhost:3000/api/cylinders -H "Cookie: <your session cookie>" | jq '.[0] | {id, serialNumber, pairedCylinder}'`
Expected: an object with a `pairedCylinder` key (value `null` for unpaired cylinders). If auth makes curl impractical, instead confirm the dev server logs no Sequelize errors when the cylinders table loads on any page.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/cylinders/route.tsx "src/app/api/clients/[clientId]/cylinders/route.tsx"
git commit -m "feat: eager-load paired cylinder in cylinder GET routes"
```

---

## Task 4: Bidirectional pairing in the cylinder PUT route

**Files:**
- Modify: `src/app/api/cylinders/[cylinderId]/route.tsx`

Note: the existing PUT route does not write audit logs (only DELETE does), so this task does not add one — staying consistent with current behavior.

- [ ] **Step 1: Add the sequelize import**

In `src/app/api/cylinders/[cylinderId]/route.tsx`, add the import after the existing model import (line 5):

```ts
import { Cylinder } from '@/lib/models/cylinder'
import { sequelize } from '@/lib/models/config'
```

- [ ] **Step 2: Read `pairedCylinderId` from the body**

In the PUT handler, add `pairedCylinderId` to the destructured body (the block at lines 26-36):

```ts
	const {
		serialNumber,
		birth,
		lastHydro,
		lastVis,
		oxygenClean,
		servicePressure,
		nickname,
		manufacturer,
		size,
		pairedCylinderId,
	} = await request.json()
```

- [ ] **Step 3: Validate the partner before mutating**

Immediately after the destructuring (before the `cylinder.serialNumber = ...` assignments), add validation. `pairedCylinderId === undefined` means "no change"; `null` means "clear"; a number means "pair to that cylinder":

```ts
	if (pairedCylinderId !== undefined && pairedCylinderId !== null) {
		if (Number(pairedCylinderId) === cylinder.id) {
			return Response.json(
				{ error: 'invalid', message: 'A cylinder cannot be paired with itself' },
				{ status: 400 },
			)
		}
		const partner = await Cylinder.findByPk(pairedCylinderId)
		if (!partner) {
			return Response.json(
				{ error: 'not_found', message: 'Paired cylinder not found' },
				{ status: 400 },
			)
		}
		if (partner.ownerId !== cylinder.ownerId) {
			return Response.json(
				{
					error: 'invalid',
					message: 'Paired cylinders must have the same owner',
				},
				{ status: 400 },
			)
		}
	}
```

- [ ] **Step 4: Replace the save block with a transaction that maintains both pointers**

Replace the scalar assignments and the `try { const result = await cylinder.save() ... }` block (lines 38-58) with:

```ts
	cylinder.serialNumber = serialNumber
	cylinder.birth = dayjs(birth, 'YYYY-MM-DD')
	cylinder.lastHydro = dayjs(lastHydro, 'YYYY-MM-DD')
	cylinder.lastVis = dayjs(lastVis, 'YYYY-MM-DD')
	cylinder.oxygenClean = oxygenClean
	cylinder.servicePressure = servicePressure
	cylinder.nickname = nickname || null
	cylinder.manufacturer = manufacturer || null
	cylinder.size = size ? Number(size) : null
	cylinder.verified = true

	const transaction = await sequelize.transaction()
	try {
		if (pairedCylinderId !== undefined) {
			const previousPartnerId = cylinder.pairedCylinderId

			if (pairedCylinderId === null) {
				// Clearing: detach this cylinder and its old partner.
				if (previousPartnerId) {
					await Cylinder.update(
						{ pairedCylinderId: null },
						{ where: { id: previousPartnerId }, transaction },
					)
				}
				cylinder.pairedCylinderId = null
			} else {
				// Pairing to a new partner.
				// Detach this cylinder's old partner, if different.
				if (previousPartnerId && previousPartnerId !== pairedCylinderId) {
					await Cylinder.update(
						{ pairedCylinderId: null },
						{ where: { id: previousPartnerId }, transaction },
					)
				}
				// Detach the new partner's existing partner, if any.
				const partner = await Cylinder.findByPk(pairedCylinderId, {
					transaction,
				})
				if (partner!.pairedCylinderId && partner!.pairedCylinderId !== cylinder.id) {
					await Cylinder.update(
						{ pairedCylinderId: null },
						{ where: { id: partner!.pairedCylinderId }, transaction },
					)
				}
				partner!.pairedCylinderId = cylinder.id
				await partner!.save({ transaction })
				cylinder.pairedCylinderId = pairedCylinderId
			}
		}

		const result = await cylinder.save({ transaction })
		await transaction.commit()
		return Response.json(result)
	} catch (err: any) {
		await transaction.rollback()
		console.error('error:', err)
		return Response.json(
			{ error: err.name, message: err.errors?.[0]?.message ?? err.message },
			{ status: 400 },
		)
	}
```

- [ ] **Step 5: Verify it compiles**

Run: `npm run lint`
Expected: passes with no errors.

- [ ] **Step 6: Manual check (deferred to Task 5)**

The pairing UI does not exist yet, so end-to-end pairing is verified in Task 5. For now confirm the build:

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 7: Commit**

```bash
git add "src/app/api/cylinders/[cylinderId]/route.tsx"
git commit -m "feat: maintain bidirectional cylinder pairing in PUT route"
```

---

## Task 5: Pairing control in the cylinder edit modal

**Files:**
- Modify: `src/components/Modals/CylinderModal.tsx`

- [ ] **Step 1: Add state for the selected partner**

In `src/components/Modals/CylinderModal.tsx`, after the `customManufacturer` state (line 76), add state seeded from the cylinder's existing partner. Cast the minimal partner shape to `Cylinder` for the picker's `value` prop:

```ts
	const [pairedCylinder, setPairedCylinder] = useState<Cylinder | null>(
		(cylinder?.pairedCylinder as Cylinder) ?? null,
	)
```

- [ ] **Step 2: Send `pairedCylinderId` with the form**

In `handleSubmit`, after the size parsing block (after line 108, before `if (ownerId) {`), add:

```ts
		// Pairing is edit-only; for new cylinders this is null and ignored by the API.
		formData.pairedCylinderId = pairedCylinder ? pairedCylinder.id : null
```

- [ ] **Step 3: Render the pairing picker (edit mode only)**

In the form JSX, add this block after the oxygenClean `RadioGroup` (after line 268, before the buttons `<div className='flex w-full justify-end gap-2'>`). It renders only when editing an existing cylinder, lists the same owner's other cylinders, and offers a clear button:

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
														c.ownerId === cylinder.ownerId
													}
													onChange={(c) => setPairedCylinder(c ?? null)}
												/>
												{pairedCylinder && (
													<Button
														variant='ghost'
														onClick={() => setPairedCylinder(null)}
													>
														Clear
													</Button>
												)}
											</div>
										</div>
									)}
```

- [ ] **Step 4: Add the CylinderPicker import**

At the top of the file, after the `ListBox` import (line 25):

```ts
import ListBox from '../UI/FormElements/ListBox'
import CylinderPicker from '../UI/FormElements/CylinderPicker'
```

- [ ] **Step 5: Verify it compiles**

Run: `npm run lint`
Expected: passes with no errors.

- [ ] **Step 6: Manual end-to-end check of pairing**

Start the app (`docker compose up` for the DB, `npm run dev`). Sign in as an admin/filler. Create or pick a client with at least two cylinders. Open one cylinder's edit modal:
- Confirm the "Paired cylinder (doubles)" picker appears and lists only that owner's other cylinders.
- Select the second cylinder and save.
- Reopen the **first** cylinder: the partner is shown. Reopen the **second** cylinder: it shows the first as its partner (bidirectional).
- Edit the first cylinder, click "Clear", save. Reopen both: neither shows a partner.

Expected: all of the above hold. If the partner does not display on reopen, confirm Task 3's GET include is returning `pairedCylinder`.

- [ ] **Step 7: Commit**

```bash
git add src/components/Modals/CylinderModal.tsx
git commit -m "feat: add paired cylinder picker to cylinder edit modal"
```

---

## Task 6: Carry the partner in the in-progress fill entry

**Files:**
- Modify: `src/types/fills.ts:19-27`

- [ ] **Step 1: Add `pairedCylinder` to the in-progress Fill type**

In `src/types/fills.ts`, add the optional field to the `Fill` type:

```ts
export type Fill = {
	id: number
	type: FillType
	start: number
	end: number
	o2: number
	he: number
	cylinder?: Cylinder
	pairedCylinder?: Cylinder
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run lint`
Expected: passes with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/fills.ts
git commit -m "feat: add pairedCylinder to in-progress fill entry type"
```

---

## Task 7: Combined paired row in the fills table and cards

**Files:**
- Modify: `src/components/Fills/FillsRow.tsx`
- Modify: `src/components/Fills/FillCard.tsx`

Both components share the same logic: include partners in the used-cylinder filter, set the partner when a paired cylinder is selected, and show the partner + an "unlink for this fill" control.

- [ ] **Step 1: Update `FillsRow` — used filter, partner select, partner display**

In `src/components/Fills/FillsRow.tsx`, replace the `usedCylinders` computation (lines 18-20) so partners count as used:

```ts
	const usedCylinders = useAppSelector((state) => state.fills)
		.fills.flatMap((f) => [f.cylinder?.id, f.pairedCylinder?.id])
		.filter((id) => id !== undefined)
```

Replace the `CylinderPicker`'s `onChange` (lines 30-41) so selecting a paired cylinder records its partner:

```tsx
					onChange={(val) =>
						dispatch(
							updateFill({
								id: fill.id,
								data: {
									...fill,
									cylinder: val || undefined,
									pairedCylinder: val?.pairedCylinder
										? (val.pairedCylinder as Cylinder)
										: undefined,
									end: fill.end === 0 && val ? val.servicePressure : fill.end,
								},
							}),
						)
					}
```

Add the `Cylinder` type import after the `Fill` import (line 7):

```ts
import { Fill } from '@/types/fills'
import { Cylinder } from '@/types/cylinder'
import { Client } from '@/types/client'
```

Inside the cylinder `<td>` (the one wrapping `CylinderPicker`, lines 24-43), add the partner indicator + unlink control directly after the closing `</CylinderPicker>` (i.e. after `/>` on line 42, still inside the `<td>`):

```tsx
					{fill.pairedCylinder && (
						<div className='text-light-text mt-1 flex items-center gap-2 text-xs'>
							<span>
								+{' '}
								{fill.pairedCylinder.nickname
									? `${fill.pairedCylinder.nickname} (${fill.pairedCylinder.serialNumber})`
									: fill.pairedCylinder.serialNumber}
							</span>
							<button
								type='button'
								className='underline'
								onClick={() =>
									dispatch(
										updateFill({
											id: fill.id,
											data: { ...fill, pairedCylinder: undefined },
										}),
									)
								}
							>
								unlink
							</button>
						</div>
					)}
```

- [ ] **Step 2: Verify `FillsRow` compiles**

Run: `npm run lint`
Expected: passes with no errors.

- [ ] **Step 3: Update `FillCard` with the same three changes**

In `src/components/Fills/FillCard.tsx`, replace the `usedCylinders` computation (lines 24-26):

```ts
	const usedCylinders = useAppSelector((state) => state.fills)
		.fills.flatMap((f) => [f.cylinder?.id, f.pairedCylinder?.id])
		.filter((id) => id !== undefined)
```

Replace the `CylinderPicker`'s `onChange` (lines 44-55):

```tsx
				onChange={(val) =>
					dispatch(
						updateFill({
							id: fill.id,
							data: {
								...fill,
								cylinder: val || undefined,
								pairedCylinder: val?.pairedCylinder
									? (val.pairedCylinder as Cylinder)
									: undefined,
								end: fill.end === 0 && val ? val.servicePressure : fill.end,
							},
						}),
					)
				}
```

Add the partner indicator + unlink control immediately after the `</CylinderPicker>` (`/>` on line 56), before `<FillType ... />`:

```tsx
			{fill.pairedCylinder && (
				<div className='text-light-text flex items-center gap-2 text-sm'>
					<span>
						+{' '}
						{fill.pairedCylinder.nickname
							? `${fill.pairedCylinder.nickname} (${fill.pairedCylinder.serialNumber})`
							: fill.pairedCylinder.serialNumber}
					</span>
					<button
						type='button'
						className='underline'
						onClick={() =>
							dispatch(
								updateFill({
									id: fill.id,
									data: { ...fill, pairedCylinder: undefined },
								}),
							)
						}
					>
						unlink
					</button>
				</div>
			)}
```

Add the `Cylinder` type import after the `Fill` import (line 4):

```ts
import { Fill } from '@/types/fills'
import { Cylinder } from '@/types/cylinder'
```

- [ ] **Step 4: Verify `FillCard` compiles**

Run: `npm run lint`
Expected: passes with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Fills/FillsRow.tsx src/components/Fills/FillCard.tsx
git commit -m "feat: show combined paired cylinder row with unlink in fills UI"
```

---

## Task 8: Validate gas/cert against both cylinders of a pair

**Files:**
- Modify: `src/components/Fills/FillType.tsx`
- Modify: `src/components/Fills/FillsRow.tsx`
- Modify: `src/components/Fills/FillCard.tsx`

A paired fill writes the same gas to both cylinders, so nitrox/trimix must be allowed only when **both** cylinders are oxygen-clean (the client cert check is unchanged).

- [ ] **Step 1: Accept a `pairedCylinder` prop in `FillType` and require both clean**

In `src/components/Fills/FillType.tsx`, add `pairedCylinder` to the props type (after `cylinder?: Cylinder` on line 28):

```ts
type FillTypeProps = {
	index: number
	item: Fill
	client?: Client
	cylinder?: Cylinder
	pairedCylinder?: Cylinder
}
```

Destructure it in the component signature (line 38):

```ts
const FillType = ({ index, item, client, cylinder, pairedCylinder }: FillTypeProps) => {
```

Replace the `nitroxUse` / `trimixUse` computation (lines 41-45) so the partner must also be oxygen-clean when present:

```ts
	const bothOxygenClean =
		cylinder?.oxygenClean == true &&
		(!pairedCylinder || pairedCylinder.oxygenClean == true)

	const nitroxUse =
		bothOxygenClean &&
		!!(client && (client.nitroxCert || client.advancedNitroxCert))
	const trimixUse = bothOxygenClean && !!(client && client.trimixCert)
```

- [ ] **Step 2: Pass the partner from `FillsRow`**

In `src/components/Fills/FillsRow.tsx`, add the prop to the `FillType` element (the block at lines 45-50):

```tsx
				<FillType
					index={fill.id}
					item={fill}
					client={client || undefined}
					cylinder={fill.cylinder}
					pairedCylinder={fill.pairedCylinder}
				/>
```

- [ ] **Step 3: Pass the partner from `FillCard`**

In `src/components/Fills/FillCard.tsx`, add the prop to the `FillType` element (the block at lines 57-62):

```tsx
			<FillType
				index={fill.id}
				item={fill}
				client={client || undefined}
				cylinder={fill.cylinder}
				pairedCylinder={fill.pairedCylinder}
			/>
```

- [ ] **Step 4: Verify it compiles**

Run: `npm run lint`
Expected: passes with no errors.

- [ ] **Step 5: Manual check**

With a paired set where the two cylinders differ in oxygen-clean status (edit one cylinder's "oxygen clean" to No, save), select that set on the fills page and open the gas-type dropdown. Confirm Nitrox/Trimix show the cert warning (uncertified) because not both cylinders are oxygen-clean. Set both to oxygen-clean and confirm Nitrox/Trimix become available (given client cert).

- [ ] **Step 6: Commit**

```bash
git add src/components/Fills/FillType.tsx src/components/Fills/FillsRow.tsx src/components/Fills/FillCard.tsx
git commit -m "feat: validate fill gas type against both cylinders of a pair"
```

---

## Task 9: Expand paired entries into two FillDto on submit

**Files:**
- Modify: `src/app/fills/page.tsx:27-36`

- [ ] **Step 1: Replace the fill mapping with an expansion**

In `src/app/fills/page.tsx`, replace the `fills.map(...)` that builds `fillData` (lines 27-36) with a `flatMap` that emits a second record for a paired cylinder:

```ts
		const fillData: FillDto[] = fills.flatMap((fill) => {
			const base = {
				date: dayjs(fillDate as string),
				startPressure: fill.start,
				endPressure: fill.end,
				oxygen: fill.o2,
				helium: fill.he,
			}

			const records: FillDto[] = [{ ...base, cylinderId: fill.cylinder?.id }]

			if (fill.pairedCylinder) {
				records.push({ ...base, cylinderId: fill.pairedCylinder.id })
			}

			return records
		})
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run lint`
Expected: passes with no errors.

- [ ] **Step 3: Manual end-to-end check of a paired fill**

With the app running and a paired set already configured (from Task 5):
- Go to "Record a Tank Fill", pick the client, add a fill, and select the **first** cylinder of the pair via the cylinder picker.
- Confirm the row shows the partner ("+ <partner>") and a single set of pressure/gas inputs.
- Confirm neither cylinder of the pair can be selected again in a second fill row (both filtered out).
- Enter start/end pressure and gas mix once, submit.
- Verify in the fill history (or `GET /api/fills`) that **two** Fill records were created — one per cylinder — with identical date, pressures, and gas mix.
- Repeat, but click "unlink" before submitting: confirm only **one** Fill record is created and the partner becomes selectable again.

Expected: all of the above hold.

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/fills/page.tsx
git commit -m "feat: expand paired cylinder fills into two records on submit"
```

---

## Task 10 (optional): Paired indicator in the cylinder list

**Files:**
- Modify: `src/components/Cylinders/CylinderListRow.tsx`

Low priority — include only if it fits the row cleanly.

- [ ] **Step 1: Add a small partner line under the cylinder name**

In `src/components/Cylinders/CylinderListRow.tsx`, inside the cylinder-name `<td>` (lines 46-57), add a partner line after the nickname/serial block. Replace the cell body so the partner shows when present:

```tsx
			<td className='text-text py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap sm:pl-6'>
				{cylinder.nickname ? (
					<div className='flex flex-col items-center'>
						<span>{cylinder.nickname}</span>
						<span className='text-light-text text-xs'>
							{cylinder.serialNumber}
						</span>
					</div>
				) : (
					cylinder.serialNumber
				)}
				{cylinder.pairedCylinder && (
					<div className='text-light-text mt-1 text-xs'>
						🔗 {cylinder.pairedCylinder.nickname ?? cylinder.pairedCylinder.serialNumber}
					</div>
				)}
			</td>
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run lint`
Expected: passes with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Cylinders/CylinderListRow.tsx
git commit -m "feat: show paired cylinder indicator in cylinder list"
```

---

## Final verification

- [ ] Run `npm run lint` — passes.
- [ ] Run `npm run build` — succeeds.
- [ ] Re-run the manual checks in Task 5 (bidirectional pairing), Task 8 (gas type requires both cylinders oxygen-clean), and Task 9 (paired fill creates two records; unlink creates one).
- [ ] Confirm deleting a paired cylinder (admin) leaves the partner's `pairedCylinderId` null (the `ON DELETE SET NULL` FK handles this) — delete one cylinder of a pair and reopen the survivor's edit modal to confirm it shows no partner.
