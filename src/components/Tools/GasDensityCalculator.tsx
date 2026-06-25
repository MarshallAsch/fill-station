'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import {
	densityAtDepth,
	depthForDensity,
	HARD_MAX_DENSITY,
	RECOMMENDED_MAX_DENSITY,
} from '@/lib/diveMath/gasDensity'
import { Water } from '@/lib/diveMath/modEnd'
import { fromMeters, toMeters } from '@/lib/diveMath/units'
import MixPicker from './MixPicker'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

const GasDensityCalculator = () => {
	const { units } = useUnits()
	const [fo2, setFo2] = useState(21)
	const [fhe, setFhe] = useState(0)
	const [water, setWater] = useState<Water>('salt')
	const [depth, setDepth] = useState(30)

	const mix = { fo2: fo2 / 100, fhe: fhe / 100 }
	const density = densityAtDepth({
		...mix,
		depthM: toMeters(depth, units.depth),
		water,
	})
	const recDepth = depthForDensity({
		...mix,
		density: RECOMMENDED_MAX_DENSITY,
		water,
	})
	const hardDepth = depthForDensity({
		...mix,
		density: HARD_MAX_DENSITY,
		water,
	})
	const d = (m: number) => Math.round(fromMeters(m, units.depth))

	const flag =
		density > HARD_MAX_DENSITY
			? {
					text: 'Exceeds the 6.3 g/L hard limit.',
					cls: 'text-text font-semibold',
				}
			: density > RECOMMENDED_MAX_DENSITY
				? { text: 'Above the 5.2 g/L recommended limit.', cls: 'text-text' }
				: { text: 'Within recommended density.', cls: 'text-light-text' }

	return (
		<div className='space-y-6'>
			<UnitToggle show={['depth']} />
			<MixPicker
				id='gd-mix'
				onSelect={(o2, he) => {
					setFo2(o2)
					setFhe(he)
				}}
			/>
			<section className='flex flex-wrap items-end gap-3'>
				<NumberInput
					id='gd-fo2'
					name='gd-fo2'
					label='O₂ (%)'
					value={fo2}
					onChange={setFo2}
				/>
				<NumberInput
					id='gd-fhe'
					name='gd-fhe'
					label='He (%)'
					value={fhe}
					onChange={setFhe}
				/>
				<NumberInput
					id='gd-depth'
					name='gd-depth'
					label={`Depth (${units.depth})`}
					value={depth}
					onChange={setDepth}
				/>
			</section>
			<RadioGroup
				title='Water'
				name='gd-water'
				value={water}
				onChange={(v) => setWater(v as Water)}
				options={[
					{ value: 'salt', label: 'Salt' },
					{ value: 'fresh', label: 'Fresh' },
				]}
			/>
			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Gas density</h2>
				<p className='text-text'>
					At {depth} {units.depth}:{' '}
					<span className='font-semibold'>{density.toFixed(2)} g/L</span>
				</p>
				<p className={flag.cls + ' text-sm'}>{flag.text}</p>
				<p className='text-light-text text-sm'>
					Recommended max (5.2 g/L) depth: {d(recDepth)} {units.depth} · Hard
					max (6.3 g/L) depth: {d(hardDepth)} {units.depth}
				</p>
			</section>
		</div>
	)
}

export default GasDensityCalculator
