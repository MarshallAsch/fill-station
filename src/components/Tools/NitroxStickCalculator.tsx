'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import {
	nitroxStickFlowRate,
	nitroxStickSupplyDraw,
} from '@/lib/diveMath/nitroxStick'
import { fromBar, toBar, toLiters } from '@/lib/diveMath/units'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

const NitroxStickCalculator = () => {
	const { units } = useUnits()
	const [fo2, setFo2] = useState(32)
	const [airFlow, setAirFlow] = useState(100)
	const [tankVolume, setTankVolume] = useState(80)
	const [startPressure, setStartPressure] = useState(0)
	const [finalPressure, setFinalPressure] = useState(3000)
	const [supplyVolume, setSupplyVolume] = useState(80)

	const targetFo2 = fo2 / 100
	const flow = nitroxStickFlowRate({ targetFo2, airFlow })
	const draw = nitroxStickSupplyDraw({
		targetFo2,
		tankVolume: toLiters(tankVolume, units.volume),
		startPressure: toBar(startPressure, units.pressure),
		finalPressure: toBar(finalPressure, units.pressure),
		supplyVolume: toLiters(supplyVolume, units.volume),
	})

	const leanWarning = targetFo2 <= 0.209

	return (
		<div className='space-y-6'>
			<UnitToggle show={['pressure', 'volume']} />

			<section className='space-y-4'>
				<h2 className='text-text text-lg font-semibold'>O₂ flow rate</h2>
				<div className='flex items-end gap-3'>
					<NumberInput
						id='ns-fo2'
						name='ns-fo2'
						label='Target O₂ (%)'
						value={fo2}
						onChange={setFo2}
					/>
					<NumberInput
						id='ns-airflow'
						name='ns-airflow'
						label='Compressor air flow'
						value={airFlow}
						onChange={setAirFlow}
					/>
				</div>
				<p className='text-text'>
					O₂ flow into the stick:{' '}
					<span className='font-semibold'>
						{leanWarning ? '0' : flow.toFixed(2)}
					</span>{' '}
					<span className='text-light-text text-sm'>
						(same units as the air flow you entered)
					</span>
				</p>
				{leanWarning && (
					<p className='text-light-text text-sm'>
						Target is air or leaner — no O₂ injection needed.
					</p>
				)}
			</section>

			<section className='space-y-4'>
				<h2 className='text-text text-lg font-semibold'>
					O₂ drawn from supply bottle
				</h2>
				<div className='flex flex-wrap items-end gap-3'>
					<NumberInput
						id='ns-tankvol'
						name='ns-tankvol'
						label={`Tank volume (${units.volume})`}
						value={tankVolume}
						onChange={setTankVolume}
					/>
					<NumberInput
						id='ns-start'
						name='ns-start'
						label={`Start pressure (${units.pressure})`}
						value={startPressure}
						onChange={setStartPressure}
					/>
					<NumberInput
						id='ns-final'
						name='ns-final'
						label={`Final pressure (${units.pressure})`}
						value={finalPressure}
						onChange={setFinalPressure}
					/>
					<NumberInput
						id='ns-supplyvol'
						name='ns-supplyvol'
						label={`Supply bottle volume (${units.volume})`}
						value={supplyVolume}
						onChange={setSupplyVolume}
					/>
				</div>
				{!Number.isFinite(draw.supplyPressureDrop) || supplyVolume <= 0 ? (
					<p className='text-light-text text-sm'>
						Enter the supply bottle volume to estimate O₂ drawdown.
					</p>
				) : (
					<p className='text-text'>
						O₂ supply pressure drop:{' '}
						<span className='font-semibold'>
							{Math.round(fromBar(draw.supplyPressureDrop, units.pressure))}{' '}
							{units.pressure}
						</span>
					</p>
				)}
			</section>
		</div>
	)
}

export default NitroxStickCalculator
