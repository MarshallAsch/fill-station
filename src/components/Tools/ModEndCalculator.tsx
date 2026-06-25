'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import {
	calculateEnd,
	calculateMod,
	EndModel,
	Water,
} from '@/lib/diveMath/modEnd'
import { fromMeters, toMeters } from '@/lib/diveMath/units'
import MixPicker from './MixPicker'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

const ModEndCalculator = () => {
	const { units } = useUnits()
	const [fo2, setFo2] = useState(32)
	const [fhe, setFhe] = useState(0)
	const [ppo2, setPpo2] = useState(1.4)
	const [water, setWater] = useState<Water>('salt')
	const [model, setModel] = useState<EndModel>('o2-narcotic')
	const [depth, setDepth] = useState(100)

	const fo2Frac = fo2 / 100
	const fheFrac = fhe / 100
	const depthM = toMeters(depth, units.depth)

	const modEditable = calculateMod({ fo2: fo2Frac, ppo2, water })
	const mod16 = calculateMod({ fo2: fo2Frac, ppo2: 1.6, water })
	const end = calculateEnd({
		fo2: fo2Frac,
		fhe: fheFrac,
		depth: depthM,
		water,
		model,
	})

	const d = (m: number) => Math.round(fromMeters(m, units.depth))

	return (
		<div className='space-y-6'>
			<UnitToggle show={['depth']} />

			<section className='flex flex-wrap items-end gap-3'>
				<MixPicker
					id='me-mix'
					onSelect={(o2, he) => {
						setFo2(o2)
						setFhe(he)
					}}
				/>
				<NumberInput
					id='me-fo2'
					name='me-fo2'
					label='O₂ (%)'
					value={fo2}
					onChange={setFo2}
				/>
				<NumberInput
					id='me-fhe'
					name='me-fhe'
					label='He (%)'
					value={fhe}
					onChange={setFhe}
				/>
				<NumberInput
					id='me-ppo2'
					name='me-ppo2'
					label='Working ppO₂'
					value={ppo2}
					onChange={setPpo2}
				/>
			</section>

			<section className='flex flex-wrap gap-6'>
				<RadioGroup
					title='Water'
					name='water'
					value={water}
					onChange={(v) => setWater(v as Water)}
					options={[
						{ value: 'salt', label: 'Salt' },
						{ value: 'fresh', label: 'Fresh' },
					]}
				/>
				<RadioGroup
					title='END model'
					name='end-model'
					value={model}
					onChange={(v) => setModel(v as EndModel)}
					options={[
						{ value: 'o2-narcotic', label: 'O₂ narcotic' },
						{ value: 'n2-only', label: 'N₂ only' },
					]}
				/>
			</section>

			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>
					Maximum operating depth
				</h2>
				<p className='text-text'>
					ppO₂ {ppo2}:{' '}
					<span className='font-semibold'>
						{d(modEditable)} {units.depth}
					</span>
				</p>
				<p className='text-text'>
					ppO₂ 1.6:{' '}
					<span className='font-semibold'>
						{d(mod16)} {units.depth}
					</span>
				</p>
			</section>

			<section className='border-border space-y-3 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>
					Equivalent narcotic depth
				</h2>
				<NumberInput
					id='me-depth'
					name='me-depth'
					label={`Planned depth (${units.depth})`}
					value={depth}
					onChange={setDepth}
				/>
				<p className='text-text'>
					END at {depth} {units.depth}:{' '}
					<span className='font-semibold'>
						{d(end)} {units.depth}
					</span>
				</p>
			</section>
		</div>
	)
}

export default ModEndCalculator
