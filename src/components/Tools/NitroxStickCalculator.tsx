'use client'

import NumberInput from '@/components/UI/FormElements/NumberInput'
import {
	nitroxStickFlowRate,
	nitroxStickSupplyDraw,
} from '@/lib/diveMath/nitroxStick'
import { tempRiseC } from '@/lib/diveMath/temperature'
import { AIR_FO2, fromLpm, toBar, toLpm } from '@/lib/diveMath/units'
import { roundPressure } from '@/lib/diveMath/format'
import SafetyNote from './SafetyNote'
import CylinderFields from './CylinderFields'
import HotFillNote from './HotFillNote'
import { useUnits } from './UnitsProvider'
import { usePersistedAirFlow, usePersistedPressure } from './useUnitState'
import { usePersistedState } from './usePersistedState'
import { useHotFill } from './useHotFill'

const NitroxStickCalculator = () => {
	const { units, settledTempC } = useUnits()
	const [fo2, setFo2] = usePersistedState('ns.targetO2', 32)
	const [airFlow, setAirFlow] = usePersistedAirFlow('ns.airFlow', 5)
	const [tankVolume, setTankVolume] = usePersistedState('ns.tankVol', 11.1)
	const [startPressure, setStartPressure] = usePersistedPressure('ns.start', 0)
	const [finalPressure, setFinalPressure] = usePersistedPressure(
		'ns.final',
		3000,
	)
	const [supplyVolume, setSupplyVolume] = usePersistedState('ns.supplyVol', 49)
	const [workingPressure, setWorkingPressure] = usePersistedPressure(
		'ns.working',
		3000,
	)

	const targetFo2 = fo2 / 100
	const airFlowLpm = toLpm(airFlow, units.airFlow)
	const hot = useHotFill()
	const fillRateBarPerMin = tankVolume > 0 ? airFlowLpm / tankVolume : 0
	const deltaTC = tempRiseC(fillRateBarPerMin)
	const hotFinal = hot.on
		? hot.hotFill(finalPressure, settledTempC + deltaTC)
		: finalPressure
	const deltaTDisplay = units.temp === 'F' ? deltaTC * (9 / 5) : deltaTC
	const flow = nitroxStickFlowRate({ targetFo2, airFlow: airFlowLpm })
	const draw = nitroxStickSupplyDraw({
		targetFo2,
		tankVolume,
		startPressure: toBar(startPressure, units.pressure),
		finalPressure: toBar(hotFinal, units.pressure),
		supplyVolume,
	})

	const leanWarning = targetFo2 <= AIR_FO2
	const highO2 = fo2 > 40

	return (
		<div className='space-y-6'>
			<section className='space-y-4'>
				<h2 className='text-text text-lg font-semibold'>O₂ flow rate</h2>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='ns-fo2'
						name='ns-fo2'
						label='Target O₂ (%)'
						value={fo2}
						onChange={setFo2}
						min={0}
						max={100}
					/>
					<NumberInput
						id='ns-airflow'
						name='ns-airflow'
						label={`Compressor free-air (intake) flow (${units.airFlow})`}
						value={airFlow}
						onChange={setAirFlow}
						min={0}
					/>
				</div>
				{highO2 && (
					<SafetyNote level='danger'>
						O₂ above 40% requires oxygen-clean equipment and O₂-service gas —
						special handling.
					</SafetyNote>
				)}
				<div className='border-border space-y-2 rounded-md border p-4'>
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
				</div>
			</section>

			<section className='space-y-4'>
				<h2 className='text-text text-lg font-semibold'>
					O₂ drawn from supply bottle
				</h2>
				<div className='space-y-3'>
					<h3 className='text-text font-medium'>Cylinder being filled</h3>
					<CylinderFields
						idPrefix='ns-tank'
						category={['scuba', 'cascade']}
						waterVolumeL={tankVolume}
						onWaterVolumeL={setTankVolume}
						working={{ value: workingPressure, onChange: setWorkingPressure }}
						start={{
							value: startPressure,
							onChange: setStartPressure,
							label: 'Start pressure',
						}}
						filled={{
							value: finalPressure,
							onChange: setFinalPressure,
							label: 'Fill pressure',
						}}
					/>
				</div>
				<div className='space-y-3'>
					<h3 className='text-text font-medium'>O₂ supply bottle</h3>
					<CylinderFields
						idPrefix='ns-supply'
						category='industrial'
						waterVolumeL={supplyVolume}
						onWaterVolumeL={setSupplyVolume}
						showPressures={false}
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
							{roundPressure(draw.supplyPressureDrop, units.pressure)}{' '}
							{units.pressure}
						</span>
					</p>
				)}
				{hot.on && (
					<HotFillNote
						cold={finalPressure}
						hot={hotFinal}
						deltaTDisplay={deltaTDisplay}
					/>
				)}
			</section>
		</div>
	)
}

export default NitroxStickCalculator
