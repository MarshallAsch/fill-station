'use client'

import NumberInput from '@/components/UI/FormElements/NumberInput'
import RadioGroup from '@/components/UI/FormElements/RadioGroup'
import {
	densityAtDepth,
	depthForDensity,
	HARD_MAX_DENSITY,
	RECOMMENDED_MAX_DENSITY,
} from '@/lib/diveMath/gasDensity'
import { fmtMix, roundDepthDown } from '@/lib/diveMath/format'
import { Water } from '@/lib/diveMath/modEnd'
import { toMeters } from '@/lib/diveMath/units'
import MixPicker from './MixPicker'
import SafetyNote from './SafetyNote'
import { usePersistedDepth } from './useUnitState'
import { usePersistedState } from './usePersistedState'
import { useUnits } from './UnitsProvider'

const GasDensityCalculator = () => {
	const { units } = useUnits()
	const [fo2, setFo2] = usePersistedState('gd.fo2', 21)
	const [fhe, setFhe] = usePersistedState('gd.fhe', 0)
	const [water, setWater] = usePersistedState<Water>('gd.water', 'salt')
	const [depth, setDepth] = usePersistedDepth('gd.depth', 100)

	const mix = { fo2: fo2 / 100, fhe: fhe / 100 }
	const density = densityAtDepth({
		...mix,
		depthM: toMeters(depth, units.depth),
		water,
	})
	const recDepth = depthForDensity({
		...mix,
		density: RECOMMENDED_MAX_DENSITY,
		water,
	})
	const hardDepth = depthForDensity({
		...mix,
		density: HARD_MAX_DENSITY,
		water,
	})

	const densityStatus =
		density > HARD_MAX_DENSITY
			? 'hard'
			: density > RECOMMENDED_MAX_DENSITY
				? 'warning'
				: 'ok'

	const mixInvalid = fo2 + fhe > 100

	return (
		<div className='space-y-6'>
			<MixPicker
				id='gd-mix'
				onSelect={(o2, he) => {
					setFo2(o2)
					setFhe(he)
				}}
			/>
			<section className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
				<NumberInput
					id='gd-fo2'
					name='gd-fo2'
					label='O₂ (%)'
					value={fo2}
					onChange={setFo2}
					min={0}
					max={100}
				/>
				<NumberInput
					id='gd-fhe'
					name='gd-fhe'
					label='He (%)'
					value={fhe}
					onChange={setFhe}
					min={0}
					max={100}
				/>
				<NumberInput
					id='gd-depth'
					name='gd-depth'
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
				name='gd-water'
				value={water}
				onChange={(v) => setWater(v as Water)}
				options={[
					{ value: 'salt', label: 'Salt' },
					{ value: 'fresh', label: 'Fresh' },
				]}
			/>
			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Gas density</h2>
				<p className='text-light-text text-sm'>Mix: {fmtMix(fo2, fhe)}</p>
				<p className='text-text'>
					At {depth} {units.depth}:{' '}
					<span className='font-semibold'>{density.toFixed(2)} g/L</span>
				</p>
				{densityStatus === 'hard' && (
					<SafetyNote level='danger'>
						Exceeds the {HARD_MAX_DENSITY} g/L hard limit.
					</SafetyNote>
				)}
				{densityStatus === 'warning' && (
					<SafetyNote level='warning'>
						Above the {RECOMMENDED_MAX_DENSITY} g/L recommended limit.
					</SafetyNote>
				)}
				{densityStatus === 'ok' && (
					<p className='text-light-text text-sm'>Within recommended density.</p>
				)}
				<p className='text-light-text text-sm'>
					Recommended max (5.2 g/L) depth:{' '}
					{roundDepthDown(recDepth, units.depth)} {units.depth} · Hard max (6.3
					g/L) depth: {roundDepthDown(hardDepth, units.depth)} {units.depth}
				</p>
			</section>
		</div>
	)
}

export default GasDensityCalculator
