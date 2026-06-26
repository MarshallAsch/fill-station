'use client'

import ListBox from '@/components/UI/FormElements/ListBox'
import { BOOSTERS } from './presets'

const CUSTOM = 'custom'

const BoosterPicker = ({ onSelect }: { onSelect: (ratio: number) => void }) => {
	const items = [
		{ value: CUSTOM, name: 'Choose a booster model…' },
		...BOOSTERS.map((b) => ({
			value: b.name,
			name: `${b.name} — ${b.ratio}:1`,
		})),
	]

	// Action-style: applies the model's ratio then reverts to the prompt.
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
				if (preset) onSelect(preset.ratio)
			}}
		/>
	)
}

export default BoosterPicker
