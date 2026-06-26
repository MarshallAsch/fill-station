'use client'

import ListBox from '@/components/UI/FormElements/ListBox'
import { fromBar, fromLiters } from '@/lib/diveMath/units'
import {
	DIVE_TANKS,
	freeGasLiters,
	INDUSTRIAL_TANKS,
	STORAGE_TANKS,
	TankPreset,
} from './presets'
import { useUnits } from './UnitsProvider'

const LISTS: Record<'dive' | 'storage' | 'industrial', TankPreset[]> = {
	dive: DIVE_TANKS,
	storage: STORAGE_TANKS,
	industrial: INDUSTRIAL_TANKS,
}

const CUSTOM = 'custom'

const TankSizePicker = ({
	category,
	idSuffix,
	onSelect,
}: {
	category: 'dive' | 'storage' | 'industrial'
	idSuffix?: string
	onSelect: (waterVolumeL: number, ratedBar: number) => void
}) => {
	const { units } = useUnits()
	const presets = LISTS[category]
	const items = [
		{ value: CUSTOM, name: 'Choose a standard size…' },
		...presets.map((p) => {
			const freeDisplay = Math.round(fromLiters(freeGasLiters(p), units.volume))
			const presDisplay = Math.round(fromBar(p.ratedBar, units.pressure))
			return {
				value: p.name,
				name: `${p.name} — ≈${freeDisplay} ${units.volume} @ ${presDisplay} ${units.pressure}`,
			}
		}),
	]
	const id = `tank-${category}${idSuffix ? `-${idSuffix}` : ''}`

	// Keeps the picked size shown after it applies the preset (the fields stay
	// editable; manual edits just won't change what the picker displays).
	return (
		<ListBox
			id={id}
			name={id}
			title='Standard size'
			items={items}
			defaultValue={items[0]}
			onChange={(item) => {
				if (item.value === CUSTOM) return
				const preset = presets.find((p) => p.name === item.value)
				if (preset) onSelect(preset.waterVolumeL, preset.ratedBar)
			}}
		/>
	)
}

export default TankSizePicker
