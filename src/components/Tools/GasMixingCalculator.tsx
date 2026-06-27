'use client'

import NumberInput from '@/components/UI/FormElements/NumberInput'
import { fmtMix, roundPercent, roundPressure } from '@/lib/diveMath/format'
import { mixTwoGases } from '@/lib/diveMath/gasMixing'
import { toBar } from '@/lib/diveMath/units'
import MixPicker from './MixPicker'
import SafetyNote from './SafetyNote'
import { useUnits } from './UnitsProvider'
import { usePersistedPressure } from './useUnitState'
import { usePersistedState } from './usePersistedState'

const GasMixingCalculator = () => {
	const { units } = useUnits()
	const [p1, setP1] = usePersistedPressure('gm.p1', 100)
	const [o21, setO21] = usePersistedState('gm.o21', 21)
	const [he1, setHe1] = usePersistedState('gm.he1', 0)
	const [p2, setP2] = usePersistedPressure('gm.p2', 100)
	const [o22, setO22] = usePersistedState('gm.o22', 32)
	const [he2, setHe2] = usePersistedState('gm.he2', 0)

	const result = mixTwoGases(
		{ pressure: toBar(p1, units.pressure), fo2: o21 / 100, fhe: he1 / 100 },
		{ pressure: toBar(p2, units.pressure), fo2: o22 / 100, fhe: he2 / 100 },
	)

	const mixAInvalid = o21 + he1 > 100
	const mixBInvalid = o22 + he2 > 100

	const resultO2Pct = roundPercent(result.fo2 * 100)
	const resultHePct = roundPercent(result.fhe * 100)

	return (
		<div className='space-y-6'>
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
						min={0}
					/>
					<NumberInput
						id='ga-o2'
						name='ga-o2'
						label='O₂ (%)'
						value={o21}
						onChange={setO21}
						min={0}
						max={100}
					/>
					<NumberInput
						id='ga-he'
						name='ga-he'
						label='He (%)'
						value={he1}
						onChange={setHe1}
						min={0}
						max={100}
					/>
				</div>
				{mixAInvalid && (
					<SafetyNote level='danger'>
						O₂ + He exceeds 100% — not a valid mix.
					</SafetyNote>
				)}
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
						min={0}
					/>
					<NumberInput
						id='gb-o2'
						name='gb-o2'
						label='O₂ (%)'
						value={o22}
						onChange={setO22}
						min={0}
						max={100}
					/>
					<NumberInput
						id='gb-he'
						name='gb-he'
						label='He (%)'
						value={he2}
						onChange={setHe2}
						min={0}
						max={100}
					/>
				</div>
				{mixBInvalid && (
					<SafetyNote level='danger'>
						O₂ + He exceeds 100% — not a valid mix.
					</SafetyNote>
				)}
			</section>
			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Resulting mix</h2>
				<p className='text-text text-2xl font-bold'>
					{fmtMix(resultO2Pct, resultHePct)}
				</p>
				<p className='text-light-text text-sm'>
					{roundPressure(result.pressure, units.pressure)} {units.pressure} · O₂{' '}
					{resultO2Pct}% · He {resultHePct}%
				</p>
			</section>
		</div>
	)
}

export default GasMixingCalculator
