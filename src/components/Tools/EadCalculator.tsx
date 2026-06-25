'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import { ead } from '@/lib/diveMath/ead'
import { Water } from '@/lib/diveMath/modEnd'
import { fromMeters, toMeters } from '@/lib/diveMath/units'
import MixPicker from './MixPicker'
import SafetyNote from './SafetyNote'
import UnitToggle from './UnitToggle'
import { useDepthState } from './useUnitState'
import { useUnits } from './UnitsProvider'

const EadCalculator = () => {
	const { units } = useUnits()
	const [fo2, setFo2] = useState(32)
	const [fhe, setFhe] = useState(0)
	const [water, setWater] = useState<Water>('salt')
	const [depth, setDepth] = useDepthState(100)

	const result = ead({
		depthM: toMeters(depth, units.depth),
		fo2: fo2 / 100,
		fhe: fhe / 100,
		water,
	})

	const mixInvalid = fo2 + fhe > 100

	return (
		<div className='space-y-6'>
			<UnitToggle show={['depth']} />
			<MixPicker
				id='ead-mix'
				onSelect={(o2, he) => {
					setFo2(o2)
					setFhe(he)
				}}
			/>
			<section className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
				<NumberInput
					id='ead-fo2'
					name='ead-fo2'
					label='O₂ (%)'
					value={fo2}
					onChange={setFo2}
					min={0}
					max={100}
				/>
				<NumberInput
					id='ead-fhe'
					name='ead-fhe'
					label='He (%)'
					value={fhe}
					onChange={setFhe}
					min={0}
					max={100}
				/>
				<NumberInput
					id='ead-depth'
					name='ead-depth'
					label={`Depth (${units.depth})`}
					value={depth}
					onChange={setDepth}
					min={0}
				/>
			</section>
			{mixInvalid && (
				<SafetyNote level='danger'>
					O₂ + He exceeds 100% — not a valid mix.
				</SafetyNote>
			)}
			<RadioGroup
				title='Water'
				name='ead-water'
				value={water}
				onChange={(v) => setWater(v as Water)}
				options={[
					{ value: 'salt', label: 'Salt' },
					{ value: 'fresh', label: 'Fresh' },
				]}
			/>
			<section className='border-border rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>
					Equivalent Air Depth
				</h2>
				<p className='text-text'>
					EAD at {depth} {units.depth}:{' '}
					<span className='font-semibold'>
						{Math.round(fromMeters(result, units.depth))} {units.depth}
					</span>
				</p>
			</section>
		</div>
	)
}

export default EadCalculator
