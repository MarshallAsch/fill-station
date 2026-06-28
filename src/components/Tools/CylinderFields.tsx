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
