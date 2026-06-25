'use client'

import ListBox from '@/components/UI/FormElements/ListBox'
import {
	DIVE_TANKS,
	INDUSTRIAL_TANKS,
	STORAGE_TANKS,
	TankPreset,
} from './presets'

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
	const presets = LISTS[category]
	const items = [
		{ value: CUSTOM, name: 'Custom…' },
		...presets.map((p) => ({ value: p.name, name: p.name })),
	]
	const id = `tank-${category}${idSuffix ? `-${idSuffix}` : ''}`

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
