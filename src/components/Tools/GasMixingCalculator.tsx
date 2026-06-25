'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import { mixTwoGases } from '@/lib/diveMath/gasMixing'
import { fromBar, toBar } from '@/lib/diveMath/units'
import MixPicker from './MixPicker'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'
import { usePressureState } from './useUnitState'

const GasMixingCalculator = () => {
	const { units } = useUnits()
	const [p1, setP1] = usePressureState(100)
	const [o21, setO21] = useState(21)
	const [he1, setHe1] = useState(0)
	const [p2, setP2] = usePressureState(100)
	const [o22, setO22] = useState(32)
	const [he2, setHe2] = useState(0)

	const result = mixTwoGases(
		{ pressure: toBar(p1, units.pressure), fo2: o21 / 100, fhe: he1 / 100 },
		{ pressure: toBar(p2, units.pressure), fo2: o22 / 100, fhe: he2 / 100 },
	)

	return (
		<div className='space-y-6'>
			<UnitToggle show={['pressure']} />
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Gas A</h2>
				<MixPicker
					id='mix-a'
					onSelect={(o2, he) => {
						setO21(o2)
						setHe1(he)
					}}
				/>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='ga-p'
						name='ga-p'
						label={`Pressure (${units.pressure})`}
						value={p1}
						onChange={setP1}
					/>
					<NumberInput
						id='ga-o2'
						name='ga-o2'
						label='O₂ (%)'
						value={o21}
						onChange={setO21}
					/>
					<NumberInput
						id='ga-he'
						name='ga-he'
						label='He (%)'
						value={he1}
						onChange={setHe1}
					/>
				</div>
			</section>
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Gas B</h2>
				<MixPicker
					id='mix-b'
					onSelect={(o2, he) => {
						setO22(o2)
						setHe2(he)
					}}
				/>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='gb-p'
						name='gb-p'
						label={`Pressure (${units.pressure})`}
						value={p2}
						onChange={setP2}
					/>
					<NumberInput
						id='gb-o2'
						name='gb-o2'
						label='O₂ (%)'
						value={o22}
						onChange={setO22}
					/>
					<NumberInput
						id='gb-he'
						name='gb-he'
						label='He (%)'
						value={he2}
						onChange={setHe2}
					/>
				</div>
			</section>
			<section className='border-border space-y-1 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Resulting mix</h2>
				<p className='text-text text-2xl font-bold'>
					{Math.round(result.fo2 * 100)}/{Math.round(result.fhe * 100)}
				</p>
				<p className='text-light-text text-sm'>
					{Math.round(fromBar(result.pressure, units.pressure))}{' '}
					{units.pressure} · O₂ {Math.round(result.fo2 * 100)}% · He{' '}
					{Math.round(result.fhe * 100)}%
				</p>
			</section>
		</div>
	)
}

export default GasMixingCalculator
