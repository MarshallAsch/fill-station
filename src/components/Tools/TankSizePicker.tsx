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

	// Action-style picker: applies a preset then reverts to the prompt (value is
	// pinned to the placeholder), so it never shows a stale selection after the
	// user edits the fields by hand.
	return (
		<ListBox
			id={id}
			name={id}
			title='Standard size'
			items={items}
			value={items[0]}
			onChange={(item) => {
				if (item.value === CUSTOM) return
				const preset = presets.find((p) => p.name === item.value)
				if (preset) onSelect(preset.waterVolumeL, preset.ratedBar)
			}}
		/>
	)
}

export default TankSizePicker
