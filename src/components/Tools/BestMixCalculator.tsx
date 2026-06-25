'use client'

import { useState } from 'react'
import Checkbox from '@/components/UI/FormElements/CheckBox'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import { bestMix } from '@/lib/diveMath/bestMix'
import { calculateMod, Water } from '@/lib/diveMath/modEnd'
import { fromMeters, toMeters } from '@/lib/diveMath/units'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'
import { useDepthState } from './useUnitState'

const BestMixCalculator = () => {
	const { units } = useUnits()
	const [depth, setDepth] = useDepthState(30)
	const [ppo2, setPpo2] = useState(1.4)
	const [water, setWater] = useState<Water>('salt')
	const [useHe, setUseHe] = useState(false)
	const [targetEnd, setTargetEnd] = useDepthState(30)

	const depthM = toMeters(depth, units.depth)
	const mix = bestMix({
		depthM,
		ppo2,
		targetEndM: useHe ? toMeters(targetEnd, units.depth) : undefined,
		water,
	})
	const fo2Pct = Math.round(mix.fo2 * 100)
	const fhePct = Math.round(mix.fhe * 100)
	const mod = calculateMod({ fo2: mix.fo2, ppo2, water })

	return (
		<div className='space-y-6'>
			<UnitToggle show={['depth']} />
			<section className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
				<NumberInput
					id='bm-depth'
					name='bm-depth'
					label={`Planned depth (${units.depth})`}
					value={depth}
					onChange={setDepth}
				/>
				<NumberInput
					id='bm-ppo2'
					name='bm-ppo2'
					label='Target ppO₂'
					value={ppo2}
					onChange={setPpo2}
				/>
			</section>
			<RadioGroup
				title='Water'
				name='bm-water'
				value={water}
				onChange={(v) => setWater(v as Water)}
				options={[
					{ value: 'salt', label: 'Salt' },
					{ value: 'fresh', label: 'Fresh' },
				]}
			/>
			<Checkbox
				id='bm-usehe'
				name='bm-usehe'
				title='Add helium to cap narcosis (END)'
				checked={useHe}
				onChange={setUseHe}
			/>
			{useHe && (
				<NumberInput
					id='bm-targetend'
					name='bm-targetend'
					label={`Target END (${units.depth})`}
					value={targetEnd}
					onChange={setTargetEnd}
				/>
			)}
			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Recommended mix</h2>
				<p className='text-text text-2xl font-bold'>
					{fo2Pct}
					{fhePct > 0 ? `/${fhePct}` : ''}
					{fhePct > 0 ? ' (trimix)' : ' nitrox'}
				</p>
				<p className='text-light-text text-sm'>
					O₂ {fo2Pct}% · He {fhePct}% · N₂ {Math.round(mix.fn2 * 100)}%
				</p>
				<p className='text-text'>
					MOD at this mix &amp; ppO₂:{' '}
					<span className='font-semibold'>
						{Math.round(fromMeters(mod, units.depth))} {units.depth}
					</span>
				</p>
			</section>
		</div>
	)
}

export default BestMixCalculator
