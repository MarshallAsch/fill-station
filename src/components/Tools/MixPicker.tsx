'use client'

import ListBox from '@/components/UI/FormElements/ListBox'
import { MIXES } from './presets'

const CUSTOM = 'custom'

const MixPicker = ({
	onSelect,
	id = 'mix',
}: {
	onSelect: (fo2Pct: number, fhePct: number) => void
	id?: string
}) => {
	const items = [
		{ value: CUSTOM, name: 'Apply a standard mix…' },
		...MIXES.map((m) => ({ value: m.name, name: m.name })),
	]

	// Keeps the picked mix shown after applying it (O₂/He stay editable).
	return (
		<ListBox
			id={id}
			name={id}
			title='Standard mix'
			items={items}
			defaultValue={items[0]}
			onChange={(item) => {
				if (item.value === CUSTOM) return
				const mix = MIXES.find((m) => m.name === item.value)
				if (mix) onSelect(Math.round(mix.fo2 * 100), Math.round(mix.fhe * 100))
			}}
		/>
	)
}

export default MixPicker
