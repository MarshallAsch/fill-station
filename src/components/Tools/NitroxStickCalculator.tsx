'use client'

import { useState } from 'react'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import {
	nitroxStickFlowRate,
	nitroxStickSupplyDraw,
} from '@/lib/diveMath/nitroxStick'
import {
	fromBar,
	fromLiters,
	fromLpm,
	toBar,
	toLiters,
	toLpm,
} from '@/lib/diveMath/units'
import TankSizePicker from './TankSizePicker'
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
	const airFlowLpm = toLpm(airFlow, units.airFlow)
	const flow = nitroxStickFlowRate({ targetFo2, airFlow: airFlowLpm })
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
			<UnitToggle show={['pressure', 'volume', 'airFlow', 'o2Flow']} />

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
						label={`Compressor free-air (intake) flow (${units.airFlow})`}
						value={airFlow}
						onChange={setAirFlow}
					/>
				</div>
				<p className='text-text'>
					O₂ flow into the stick:{' '}
					<span className='font-semibold'>
						{leanWarning ? '0.00' : fromLpm(flow, units.o2Flow).toFixed(2)}
					</span>{' '}
					<span className='text-light-text text-sm'>{units.o2Flow}</span>
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
				<div className='space-y-3'>
					<h3 className='text-text font-medium'>Cylinder being filled</h3>
					<TankSizePicker
						category='dive'
						onSelect={(l) => setTankVolume(fromLiters(l, units.volume))}
					/>
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
					</div>
				</div>
				<div className='space-y-3'>
					<h3 className='text-text font-medium'>O₂ supply bottle</h3>
					<TankSizePicker
						category='industrial'
						onSelect={(l) => setSupplyVolume(fromLiters(l, units.volume))}
					/>
					<div className='flex flex-wrap items-end gap-3'>
						<NumberInput
							id='ns-supplyvol'
							name='ns-supplyvol'
							label={`Supply bottle volume (${units.volume})`}
							value={supplyVolume}
							onChange={setSupplyVolume}
						/>
					</div>
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
