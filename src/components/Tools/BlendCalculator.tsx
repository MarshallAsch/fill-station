'use client'

import { useState } from 'react'
import Checkbox from '@/components/UI/FormElements/CheckBox'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import { calculateBlend } from '@/lib/diveMath/blending'
import { fromBar, toBar } from '@/lib/diveMath/units'
import MixPicker from './MixPicker'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

const BlendCalculator = () => {
	const { units } = useUnits()
	const [startPressure, setStartPressure] = useState(0)
	const [startO2, setStartO2] = useState(21)
	const [startHe, setStartHe] = useState(0)
	const [finalPressure, setFinalPressure] = useState(3000)
	const [targetO2, setTargetO2] = useState(32)
	const [targetHe, setTargetHe] = useState(0)
	const [useRealGas, setUseRealGas] = useState(false)

	const result = calculateBlend(
		{
			startPressure: toBar(startPressure, units.pressure),
			startFo2: startO2 / 100,
			startFhe: startHe / 100,
			finalPressure: toBar(finalPressure, units.pressure),
			targetFo2: targetO2 / 100,
			targetFhe: targetHe / 100,
		},
		{ useRealGas },
	)

	const p = (bar: number) => Math.round(fromBar(bar, units.pressure))

	return (
		<div className='space-y-6'>
			<UnitToggle show={['pressure']} />
			<Checkbox
				id='bl-realgas'
				name='bl-realgas'
				title='Account for gas compressibility (real-gas, approximate)'
				checked={useRealGas}
				onChange={setUseRealGas}
			/>

			<section className='space-y-4'>
				<h2 className='text-text text-lg font-semibold'>Starting gas</h2>
				<MixPicker
					id='bl-start-mix'
					onSelect={(o2, he) => {
						setStartO2(o2)
						setStartHe(he)
					}}
				/>
				<div className='flex flex-wrap items-end gap-3'>
					<NumberInput
						id='bl-start-pr'
						name='bl-start-pr'
						label={`Pressure (${units.pressure})`}
						value={startPressure}
						onChange={setStartPressure}
					/>
					<NumberInput
						id='bl-start-o2'
						name='bl-start-o2'
						label='O₂ (%)'
						value={startO2}
						onChange={setStartO2}
					/>
					<NumberInput
						id='bl-start-he'
						name='bl-start-he'
						label='He (%)'
						value={startHe}
						onChange={setStartHe}
					/>
				</div>
			</section>

			<section className='space-y-4'>
				<h2 className='text-text text-lg font-semibold'>Target gas</h2>
				<MixPicker
					id='bl-target-mix'
					onSelect={(o2, he) => {
						setTargetO2(o2)
						setTargetHe(he)
					}}
				/>
				<div className='flex flex-wrap items-end gap-3'>
					<NumberInput
						id='bl-final-pr'
						name='bl-final-pr'
						label={`Pressure (${units.pressure})`}
						value={finalPressure}
						onChange={setFinalPressure}
					/>
					<NumberInput
						id='bl-target-o2'
						name='bl-target-o2'
						label='O₂ (%)'
						value={targetO2}
						onChange={setTargetO2}
					/>
					<NumberInput
						id='bl-target-he'
						name='bl-target-he'
						label='He (%)'
						value={targetHe}
						onChange={setTargetHe}
					/>
				</div>
			</section>

			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Fill sequence</h2>
				{result.feasible ? (
					<ol className='text-text list-decimal space-y-1 pl-5'>
						<li>
							Add helium to{' '}
							<span className='font-semibold'>
								{p(result.addHeTo)} {units.pressure}
							</span>
						</li>
						<li>
							Add oxygen to{' '}
							<span className='font-semibold'>
								{p(result.addO2To)} {units.pressure}
							</span>
						</li>
						<li>
							Top with air to{' '}
							<span className='font-semibold'>
								{p(result.topTo)} {units.pressure}
							</span>
						</li>
					</ol>
				) : (
					<p className='text-light-text text-sm'>{result.reason}</p>
				)}
			</section>
		</div>
	)
}

export default BlendCalculator
