'use client'

import NumberInput from '@/components/UI/FormElements/NumberInput'
import { fmtMix, roundPercent, roundPressure } from '@/lib/diveMath/format'
import { topUpMix } from '@/lib/diveMath/gasMixing'
import { toBar } from '@/lib/diveMath/units'
import MixPicker from './MixPicker'
import SafetyNote from './SafetyNote'
import { useUnits } from './UnitsProvider'
import { usePersistedPressure } from './useUnitState'
import { usePersistedState } from './usePersistedState'

const ToppingUpCalculator = () => {
	const { units, useRealGas } = useUnits()
	const [startP, setStartP] = usePersistedPressure('tu.startP', 0)
	const [startO2, setStartO2] = usePersistedState('tu.startO2', 21)
	const [startHe, setStartHe] = usePersistedState('tu.startHe', 0)
	const [topO2, setTopO2] = usePersistedState('tu.topO2', 32)
	const [topHe, setTopHe] = usePersistedState('tu.topHe', 0)
	const [finalP, setFinalP] = usePersistedPressure('tu.finalP', 3000)

	const result = topUpMix({
		startBar: toBar(startP, units.pressure),
		startFo2: startO2 / 100,
		startFhe: startHe / 100,
		topFo2: topO2 / 100,
		topFhe: topHe / 100,
		finalBar: toBar(finalP, units.pressure),
		useRealGas,
	})

	const startInvalid = startO2 + startHe > 100
	const topInvalid = topO2 + topHe > 100

	const resultO2Pct = roundPercent(result.fo2 * 100)
	const resultHePct = roundPercent(result.fhe * 100)

	return (
		<div className='space-y-6'>
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Starting gas</h2>
				<MixPicker
					id='tu-start-mix'
					onSelect={(o2, he) => {
						setStartO2(o2)
						setStartHe(he)
					}}
				/>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='tu-start-p'
						name='tu-start-p'
						label={`Pressure (${units.pressure})`}
						value={startP}
						onChange={setStartP}
						min={0}
					/>
					<NumberInput
						id='tu-start-o2'
						name='tu-start-o2'
						label='O₂ (%)'
						value={startO2}
						onChange={setStartO2}
						min={0}
						max={100}
					/>
					<NumberInput
						id='tu-start-he'
						name='tu-start-he'
						label='He (%)'
						value={startHe}
						onChange={setStartHe}
						min={0}
						max={100}
					/>
				</div>
				{startInvalid && (
					<SafetyNote level='danger'>
						O₂ + He exceeds 100% — not a valid mix.
					</SafetyNote>
				)}
			</section>
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Top-up gas</h2>
				<MixPicker
					id='tu-top-mix'
					onSelect={(o2, he) => {
						setTopO2(o2)
						setTopHe(he)
					}}
				/>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='tu-top-o2'
						name='tu-top-o2'
						label='O₂ (%)'
						value={topO2}
						onChange={setTopO2}
						min={0}
						max={100}
					/>
					<NumberInput
						id='tu-top-he'
						name='tu-top-he'
						label='He (%)'
						value={topHe}
						onChange={setTopHe}
						min={0}
						max={100}
					/>
				</div>
				{topInvalid && (
					<SafetyNote level='danger'>
						O₂ + He exceeds 100% — not a valid mix.
					</SafetyNote>
				)}
			</section>
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Fill to</h2>
				<NumberInput
					id='tu-final-p'
					name='tu-final-p'
					label={`Final pressure (${units.pressure})`}
					value={finalP}
					onChange={setFinalP}
					min={0}
				/>
			</section>
			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Resulting mix</h2>
				<p className='text-text text-2xl font-bold'>
					{fmtMix(resultO2Pct, resultHePct)}
				</p>
				<p className='text-light-text text-sm'>
					{roundPressure(result.finalBar, units.pressure)} {units.pressure} · O₂{' '}
					{resultO2Pct}% · He {resultHePct}%
				</p>
				{result.noTopUp ? (
					<SafetyNote level='warning'>
						Final pressure is at or below your start — nothing added, showing
						your starting mix.
					</SafetyNote>
				) : (
					<p className='text-light-text text-sm'>
						Added {roundPressure(result.addedBar, units.pressure)}{' '}
						{units.pressure} of {fmtMix(topO2, topHe)}
					</p>
				)}
			</section>
		</div>
	)
}

export default ToppingUpCalculator
