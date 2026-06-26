'use client'

import ListBox from '@/components/UI/FormElements/ListBox'
import { BOOSTERS, BoosterPreset } from './presets'

const CUSTOM = 'custom'

const BoosterPicker = ({
	onSelect,
}: {
	onSelect: (preset: BoosterPreset) => void
}) => {
	const items = [
		{ value: CUSTOM, name: 'Choose a booster model…' },
		...BOOSTERS.map((b) => ({
			value: b.name,
			name: `${b.name} — ${b.ratio}:1${b.twoStage ? ' · 2-stage' : ''}`,
		})),
	]
	return (
		<ListBox
			id='booster-model'
			name='booster-model'
			title='Booster model'
			items={items}
			value={items[0]}
			onChange={(item) => {
				if (item.value === CUSTOM) return
				const preset = BOOSTERS.find((b) => b.name === item.value)
				if (preset) onSelect(preset)
			}}
		/>
	)
}

export default BoosterPicker
