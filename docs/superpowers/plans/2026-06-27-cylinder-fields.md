# Reusable Cylinder Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the repeated cylinder-selection UI across the Dive Tools with one reusable `CylinderFields` component (water volume + working/filled/optional-start pressures, working-vs-actual tooltips, preset seeding, built-in overfill warning), and let fill destinations pick scuba **or** cascade bottles.

**Architecture:** A new controlled, presentational `CylinderFields` component wraps the existing `TankSizePicker` (extended to accept a merged category set) plus a `NumberInput` grid. Each calculator keeps its own state and wires it through the component; "working pressure" becomes explicit editable state seeded from the preset and feeds the overfill warning. No dive-math changes — every `calculate*` call passes the same pressures as before.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 (theme tokens), Headless UI `ListBox`, Vitest. Spec: `docs/superpowers/specs/2026-06-27-cylinder-fields-design.md`.

## Global Constraints

- Prettier: single quotes, no semicolons, TABS for indentation, 80-char width. Run `npm run lint` after each task.
- Theme tokens only (no hardcoded colors, no `dark:`): `text-text`, `text-light-text`, `border-border`, etc.
- Reuse `NumberInput`, `SafetyNote`, `TankSizePicker`, `ListBox`. No raw HTML inputs.
- Water volume is **litres only** (no unit conversion); pressures are held in **display units** in component/tool state and converted to bar at calc time via `toBar`/`fromBar`.
- No dive-math changes: each tool's `calculate*` input is unchanged; working pressure feeds only the overfill warning.
- Tooltip copy (verbatim):
  - Working: `The cylinder's rated (max) working/service pressure — its label rating, not how full it is.`
  - Filled: `The actual gas pressure in the cylinder (or the pressure to fill it to) — not the cylinder's rating.`
  - Start: `Gas already in the cylinder before filling.`
- Overfill rule (verbatim, existing): SafetyNote `level='danger'` with text `Fill pressure is more than 10% over the cylinder's working pressure.` when `filled > working * 1.1` (both display units).
- Existing Vitest suite must stay green (`npm test`).

---

### Task 1: Extend `TankSizePicker` to accept a merged category set

**Files:**
- Modify: `src/components/Tools/TankSizePicker.tsx`

**Interfaces:**
- Produces: `TankSizePicker` `category` prop accepts `Cat | Cat[]` where `Cat = 'dive' | 'storage' | 'industrial'`; an array concatenates the preset lists (dedup by name). Single-category callers unchanged.

- [ ] **Step 1: Change the `category` prop + preset selection**

In `src/components/Tools/TankSizePicker.tsx`, replace the `category` type and the `presets`/`id` derivation:

```tsx
type Cat = 'dive' | 'storage' | 'industrial'

const TankSizePicker = ({
	category,
	idSuffix,
	onSelect,
}: {
	category: Cat | Cat[]
	idSuffix?: string
	onSelect: (waterVolumeL: number, ratedBar: number) => void
}) => {
	const { units, useRealGas } = useUnits()
	const cats = Array.isArray(category) ? category : [category]
	const seen = new Set<string>()
	const presets = cats
		.flatMap((c) => LISTS[c])
		.filter((p) => (seen.has(p.name) ? false : (seen.add(p.name), true)))
	const id = `tank-${cats.join('-')}${idSuffix ? `-${idSuffix}` : ''}`
```

Leave the rest of the component (the `items` map, the `ListBox`, the `onChange` that does `presets.find(...)`) unchanged — it already reads from `presets`.

- [ ] **Step 2: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: succeeds, 0 errors (all existing single-category callers still typecheck).

- [ ] **Step 3: Commit**

```bash
git add src/components/Tools/TankSizePicker.tsx
git commit -m "feat: TankSizePicker accepts a merged set of cylinder categories"
```

---

### Task 2: Create the `CylinderFields` component

**Files:**
- Create: `src/components/Tools/CylinderFields.tsx`

**Interfaces:**
- Consumes: `TankSizePicker` (Task 1, accepts `Cat[]`), `NumberInput`, `SafetyNote`, `useUnits`, `fromBar`.
- Produces: default-exported `CylinderFields`; exported `CylinderCategory = 'scuba' | 'cascade' | 'industrial'`. Props:
  `{ idPrefix: string; category: CylinderCategory | CylinderCategory[]; waterVolumeL: number; onWaterVolumeL: (n)=>void; working?: { value; onChange }; filled?: { value; onChange; label }; start?: { value; onChange; label }; showPressures?: boolean }`.

- [ ] **Step 1: Implement the component**

```tsx
'use client'

import NumberInput from '@/components/UI/FormElements/NumberInput'
import { fromBar } from '@/lib/diveMath/units'
import SafetyNote from './SafetyNote'
import TankSizePicker from './TankSizePicker'
import { useUnits } from './UnitsProvider'

export type CylinderCategory = 'scuba' | 'cascade' | 'industrial'

const CATEGORY_MAP: Record<
	CylinderCategory,
	'dive' | 'storage' | 'industrial'
> = {
	scuba: 'dive',
	cascade: 'storage',
	industrial: 'industrial',
}

interface PressureField {
	value: number
	onChange: (n: number) => void
}

// Standard cylinder block: a size picker + water volume, working pressure, an
// optional start pressure, and a filled/target pressure — all in display units.
// Picking a preset sets the water volume + working pressure and seeds the filled
// pressure to the working pressure; an overfill warning fires when filled is
// more than 10% over working. `showPressures={false}` makes it size-only.
const CylinderFields = ({
	idPrefix,
	category,
	waterVolumeL,
	onWaterVolumeL,
	working,
	filled,
	start,
	showPressures = true,
}: {
	idPrefix: string
	category: CylinderCategory | CylinderCategory[]
	waterVolumeL: number
	onWaterVolumeL: (n: number) => void
	working?: PressureField
	filled?: (PressureField & { label: string }) | undefined
	start?: PressureField & { label: string }
	showPressures?: boolean
}) => {
	const { units } = useUnits()
	const pickerCategory = Array.isArray(category)
		? category.map((c) => CATEGORY_MAP[c])
		: CATEGORY_MAP[category]
	const pressures = showPressures && !!working && !!filled

	const overfill =
		pressures && working!.value > 0 && filled!.value > working!.value * 1.1

	return (
		<div className='space-y-3'>
			<TankSizePicker
				category={pickerCategory}
				idSuffix={idPrefix}
				onSelect={(l, bar) => {
					onWaterVolumeL(l)
					if (pressures) {
						const disp = fromBar(bar, units.pressure)
						working!.onChange(disp)
						filled!.onChange(disp)
					}
				}}
			/>
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
				<NumberInput
					id={`${idPrefix}-vol`}
					name={`${idPrefix}-vol`}
					label='Water volume (L)'
					value={waterVolumeL}
					onChange={onWaterVolumeL}
					min={0}
					tooltip='Water (internal) cylinder volume — not free-gas capacity'
				/>
				{pressures && (
					<>
						<NumberInput
							id={`${idPrefix}-working`}
							name={`${idPrefix}-working`}
							label={`Working pressure (${units.pressure})`}
							value={working!.value}
							onChange={working!.onChange}
							min={0}
							tooltip="The cylinder's rated (max) working/service pressure — its label rating, not how full it is."
						/>
						{start && (
							<NumberInput
								id={`${idPrefix}-start`}
								name={`${idPrefix}-start`}
								label={`${start.label} (${units.pressure})`}
								value={start.value}
								onChange={start.onChange}
								min={0}
								tooltip='Gas already in the cylinder before filling.'
							/>
						)}
						<NumberInput
							id={`${idPrefix}-filled`}
							name={`${idPrefix}-filled`}
							label={`${filled!.label} (${units.pressure})`}
							value={filled!.value}
							onChange={filled!.onChange}
							min={0}
							tooltip="The actual gas pressure in the cylinder (or the pressure to fill it to) — not the cylinder's rating."
						/>
					</>
				)}
			</div>
			{overfill && (
				<SafetyNote level='danger'>
					Fill pressure is more than 10% over the cylinder&apos;s working
					pressure.
				</SafetyNote>
			)}
		</div>
	)
}

export default CylinderFields
```

- [ ] **Step 2: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: succeeds (component compiles though not yet consumed).

- [ ] **Step 3: Commit**

```bash
git add src/components/Tools/CylinderFields.tsx
git commit -m "feat: add reusable CylinderFields component"
```

---

### Task 3: Adopt `CylinderFields` in the Nitrox Stick tool

**Files:**
- Modify: `src/components/Tools/NitroxStickCalculator.tsx`

**Interfaces:**
- Consumes: `CylinderFields` (Task 2).

The current tool has a "Cylinder being filled" block (`TankSizePicker category='dive'` + tank volume / start / final + an `overfill` SafetyNote driven by `workingPressureBar`) and an "O₂ supply bottle" block (`TankSizePicker category='industrial'` + supply volume + more). Replace the cylinder-field markup with `CylinderFields`.

- [ ] **Step 1: Add working-pressure state; drop `workingPressureBar`/`overfill`**

Add `import CylinderFields from './CylinderFields'` and remove the now-unused `TankSizePicker` import (both cylinder blocks move to `CylinderFields`). Add a working-pressure state hook (rated default 3000) near the other `usePressureState` hooks:

```tsx
	const [workingPressure, setWorkingPressure] = usePressureState(3000)
```

Delete the `const [workingPressureBar, setWorkingPressureBar] = useState<number | null>(null)` line and the `const overfill = workingPressureBar != null && toBar(finalPressure, units.pressure) > workingPressureBar * 1.1` line (the component now owns the overfill warning). If removing `workingPressureBar` leaves `toBar` unused in the file, drop it from the imports too.

- [ ] **Step 2: Replace the "Cylinder being filled" block**

Replace the `<TankSizePicker category='dive' …/>` + its `<div className='grid …'>` of three `NumberInput`s + the `{overfill && <SafetyNote>…}` with:

```tsx
				<CylinderFields
					idPrefix='ns-tank'
					category={['scuba', 'cascade']}
					waterVolumeL={tankVolume}
					onWaterVolumeL={setTankVolume}
					working={{ value: workingPressure, onChange: setWorkingPressure }}
					start={{
						value: startPressure,
						onChange: setStartPressure,
						label: 'Start pressure',
					}}
					filled={{
						value: finalPressure,
						onChange: setFinalPressure,
						label: 'Fill pressure',
					}}
				/>
```

- [ ] **Step 3: Replace the "O₂ supply bottle" cylinder block with a size-only `CylinderFields`**

Replace the supply `<TankSizePicker category='industrial' …/>` + the supply-volume `NumberInput` block with:

```tsx
				<CylinderFields
					idPrefix='ns-supply'
					category='industrial'
					waterVolumeL={supplyVolume}
					onWaterVolumeL={setSupplyVolume}
					showPressures={false}
				/>
```

Keep any other supply fields the tool shows (e.g. O₂ flow rate) outside the cylinder block, untouched.

- [ ] **Step 4: Verify build + lint + the nitrox math is unchanged**

Run: `npm run build && npm run lint`
Expected: succeeds. The `calculateNitroxStick` input still receives `tankVolume`, `startPressure`, `finalPressure`, `supplyVolume` exactly as before — no math change. Manually: selecting a preset sets volume + working + fill; over-filling >110% shows the warning.

- [ ] **Step 5: Commit**

```bash
git add src/components/Tools/NitroxStickCalculator.tsx
git commit -m "feat: use CylinderFields in the nitrox stick tool"
```

---

### Task 4: Adopt `CylinderFields` in the Booster tool

**Files:**
- Modify: `src/components/Tools/BoosterCalculator.tsx`

**Interfaces:**
- Consumes: `CylinderFields` (Task 2).

The booster has a "Supply cylinder" section (`TankSizePicker category='industrial'` + `supplyVol` + `supplyStart`) and a "Receiver cylinder" section (`TankSizePicker category='dive'` + `receiverVol` + `receiverStart` + `target`).

- [ ] **Step 1: Add working-pressure state for both cylinders**

Add `import CylinderFields from './CylinderFields'`; remove the now-unused `TankSizePicker` import. Add two pressure states near the existing ones:

```tsx
	const [supplyWorking, setSupplyWorking] = usePressureState(2900)
	const [receiverWorking, setReceiverWorking] = usePressureState(3000)
```

- [ ] **Step 2: Replace the Supply cylinder field block (source — no start)**

Replace the supply `<TankSizePicker …/>` + supply `NumberInput` grid with:

```tsx
				<CylinderFields
					idPrefix='b-supply'
					category='industrial'
					waterVolumeL={supplyVol}
					onWaterVolumeL={setSupplyVol}
					working={{ value: supplyWorking, onChange: setSupplyWorking }}
					filled={{
						value: supplyStart,
						onChange: setSupplyStart,
						label: 'Current pressure',
					}}
				/>
```

- [ ] **Step 3: Replace the Receiver cylinder field block (destination — start + target)**

Replace the receiver `<TankSizePicker …/>` + receiver `NumberInput` grid with:

```tsx
				<CylinderFields
					idPrefix='b-receiver'
					category={['scuba', 'cascade']}
					waterVolumeL={receiverVol}
					onWaterVolumeL={setReceiverVol}
					working={{ value: receiverWorking, onChange: setReceiverWorking }}
					start={{
						value: receiverStart,
						onChange: setReceiverStart,
						label: 'Start pressure',
					}}
					filled={{
						value: target,
						onChange: setTarget,
						label: 'Target pressure',
					}}
				/>
```

Leave the rest of the booster sections (booster, gas, drive compressor, estimate, charts) untouched.

- [ ] **Step 4: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: succeeds. `calculateBooster`/`boosterTiming` inputs still receive `supplyVol`, `supplyStart`, `receiverVol`, `receiverStart`, `target` unchanged — no math change.

- [ ] **Step 5: Commit**

```bash
git add src/components/Tools/BoosterCalculator.tsx
git commit -m "feat: use CylinderFields in the booster tool"
```

---

### Task 5: Adopt `CylinderFields` in the Cascade tool (banks + fill)

**Files:**
- Modify: `src/components/Tools/CascadeCalculator.tsx`

**Interfaces:**
- Consumes: `CylinderFields` (Task 2).

The cascade has a `BankRow = { volume: number; pressure: number }` array (each rendered with `TankSizePicker category='storage'` + volume/pressure + a Remove button) and a "Cylinder to fill" section (`TankSizePicker category='dive'` + `targetVolume` + `startPressure` + `desiredPressure` + a `workingPressureBar`-driven `overfill` SafetyNote).

- [ ] **Step 1: Add `working` to the bank row + the fill working state; drop `workingPressureBar`/`overfill`**

Add `import CylinderFields from './CylinderFields'`; remove the now-unused `TankSizePicker` import. Extend the row type and defaults:

```tsx
interface BankRow {
	volume: number
	pressure: number
	working: number
}
```

Every place a bank is created (the initial `useState([{ volume: 50, pressure: 3000 }])`, `addBank`'s `{ volume: 50, pressure: 3000 }`) becomes `{ volume: 50, pressure: 3000, working: 3000 }`.

Add the fill-target working state and delete the old working/overfill tracking:

```tsx
	const [fillWorking, setFillWorking] = usePressureState(3000)
```

Delete `const [workingPressureBar, setWorkingPressureBar] = useState<number | null>(null)` and the `const overfill = workingPressureBar != null && …` line, and the fill section's `{overfill && <SafetyNote>…}` block (the component now owns it).

- [ ] **Step 2: Replace each bank's field markup with `CylinderFields` (source — no start)**

In the `banks.map((b, i) => …)`, replace the bank's `<TankSizePicker category='storage' …/>` + the `<div className='grid …'>` of volume/pressure inputs with a `CylinderFields` (keep the Remove button beside/below it):

```tsx
					<CylinderFields
						idPrefix={`bank-${i}`}
						category='cascade'
						waterVolumeL={b.volume}
						onWaterVolumeL={(v) => updateBank(i, 'volume', v)}
						working={{
							value: b.working,
							onChange: (v) => updateBank(i, 'working', v),
						}}
						filled={{
							value: b.pressure,
							onChange: (v) => updateBank(i, 'pressure', v),
							label: 'Current pressure',
						}}
					/>
```

`updateBank` already does `{ ...b, [key]: value }`, so it handles the new `working` key with no change. Keep the existing Remove button and the "Add bank cylinder" button.

- [ ] **Step 3: Replace the "Cylinder to fill" field markup with `CylinderFields` (destination — start + target)**

Replace the fill `<TankSizePicker category='dive' …/>` + its volume/start/desired `NumberInput` grid with:

```tsx
				<CylinderFields
					idPrefix='cas-fill'
					category={['scuba', 'cascade']}
					waterVolumeL={targetVolume}
					onWaterVolumeL={setTargetVolume}
					working={{ value: fillWorking, onChange: setFillWorking }}
					start={{
						value: startPressure,
						onChange: setStartPressure,
						label: 'Start pressure',
					}}
					filled={{
						value: desiredPressure,
						onChange: setDesiredPressure,
						label: 'Target pressure',
					}}
				/>
```

The `CascadeCylinders` visualization and the `calculateCascade` call still read `banks[i].volume`/`banks[i].pressure`, `targetVolume`, `startPressure`, `desiredPressure` — unchanged. The `overfill` `useState`/derived value is gone; the component shows the warning on the fill target (and now also per bank).

- [ ] **Step 4: Full gate**

Run: `npm test && npm run build && npm run lint && npm run knip`
Expected: all tests pass (cascade math unchanged); build clean; lint 0 errors; knip no new findings beyond the accepted exported-interface baseline (the new `CylinderCategory` type may appear). Manually: banks and the fill cylinder each show volume + working + (start) + filled; presets seed volume+working+fill; destinations list scuba + cascade bottles; overfill warnings fire.

- [ ] **Step 5: Commit**

```bash
git add src/components/Tools/CascadeCalculator.tsx
git commit -m "feat: use CylinderFields for cascade banks and fill cylinder"
```

---

## Notes for the implementer

- Pressures stay in **display units** in tool/row state; `CylinderFields` only converts the preset's `ratedBar` to display units on select (via `fromBar`). The overfill comparison is display-vs-display, no conversion.
- No `calculate*` signature changes anywhere; if a math test breaks, something was wired wrong — revisit, don't change the math.
- Removing each tool's inline `TankSizePicker`/overfill leaves no other inline cylinder UI: after Task 5, `grep -rn "TankSizePicker" src/components/Tools` should show only `TankSizePicker.tsx`, `CylinderFields.tsx`, and `GasRequirementsCalculator.tsx` (intentionally left as-is per the spec).
- Water-volume label is "Water volume (L)" in the component (was "Tank volume (L)"/"Supply volume (L)" before) — a deliberate consistency change.
