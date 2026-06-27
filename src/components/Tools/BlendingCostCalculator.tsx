'use client'

import NumberInput from '@/components/UI/FormElements/NumberInput'
import { calculateBlend } from '@/lib/diveMath/blending'
import { roundVolume } from '@/lib/diveMath/format'
import { toBar } from '@/lib/diveMath/units'
import MixPicker from './MixPicker'
import SafetyNote from './SafetyNote'
import { useUnits } from './UnitsProvider'
import { usePersistedPressure } from './useUnitState'
import { usePersistedState } from './usePersistedState'

interface Prices {
	o2: number
	he: number
}
const DEFAULT_PRICES: Prices = { o2: 0.03, he: 0.5 }

const BlendingCostCalculator = () => {
	const { units } = useUnits()
	const [prices, setPrices] = usePersistedState<Prices>(
		'bc.prices',
		DEFAULT_PRICES,
	)
	const [tankVol, setTankVol] = usePersistedState('bc.tankVol', 11.1)
	const [startP, setStartP] = usePersistedPressure('bc.startP', 0)
	const [startO2, setStartO2] = usePersistedState('bc.startO2', 21)
	const [startHe, setStartHe] = usePersistedState('bc.startHe', 0)
	const [finalP, setFinalP] = usePersistedPressure('bc.finalP', 200)
	const [targetO2, setTargetO2] = usePersistedState('bc.targetO2', 32)
	const [targetHe, setTargetHe] = usePersistedState('bc.targetHe', 0)

	const setPrice = (key: keyof Prices, value: number) =>
		setPrices((prev) => ({ ...prev, [key]: value }))

	const blend = calculateBlend({
		startPressure: toBar(startP, units.pressure),
		startFo2: startO2 / 100,
		startFhe: startHe / 100,
		finalPressure: toBar(finalP, units.pressure),
		targetFo2: targetO2 / 100,
		targetFhe: targetHe / 100,
	})
	const tankL = tankVol
	const o2L = Math.max(0, blend.pO2) * tankL
	const heL = Math.max(0, blend.pHe) * tankL
	const o2Cost = o2L * prices.o2
	const heCost = heL * prices.he
	const total = o2Cost + heCost
	const startMixInvalid = startO2 + startHe > 100
	const targetMixInvalid = targetO2 + targetHe > 100

	return (
		<div className='space-y-6'>
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>Fill</h2>
				<MixPicker
					id='cost-start'
					onSelect={(o2, he) => {
						setStartO2(o2)
						setStartHe(he)
					}}
				/>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='c-tank'
						name='c-tank'
						label='Tank volume (L)'
						value={tankVol}
						onChange={setTankVol}
						min={0}
					/>
					<NumberInput
						id='c-sp'
						name='c-sp'
						label={`Start (${units.pressure})`}
						value={startP}
						onChange={setStartP}
						min={0}
					/>
					<NumberInput
						id='c-so2'
						name='c-so2'
						label='Start O₂ (%)'
						value={startO2}
						onChange={setStartO2}
						min={0}
						max={100}
					/>
					<NumberInput
						id='c-she'
						name='c-she'
						label='Start He (%)'
						value={startHe}
						onChange={setStartHe}
						min={0}
						max={100}
					/>
				</div>
				{startMixInvalid && (
					<SafetyNote level='danger'>
						O₂ + He exceeds 100% — not a valid mix.
					</SafetyNote>
				)}
				<MixPicker
					id='cost-target'
					onSelect={(o2, he) => {
						setTargetO2(o2)
						setTargetHe(he)
					}}
				/>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='c-fp'
						name='c-fp'
						label={`Final (${units.pressure})`}
						value={finalP}
						onChange={setFinalP}
						min={0}
					/>
					<NumberInput
						id='c-to2'
						name='c-to2'
						label='Target O₂ (%)'
						value={targetO2}
						onChange={setTargetO2}
						min={0}
						max={100}
					/>
					<NumberInput
						id='c-the'
						name='c-the'
						label='Target He (%)'
						value={targetHe}
						onChange={setTargetHe}
						min={0}
						max={100}
					/>
				</div>
				{targetMixInvalid && (
					<SafetyNote level='danger'>
						O₂ + He exceeds 100% — not a valid mix.
					</SafetyNote>
				)}
			</section>
			<section className='space-y-3'>
				<h2 className='text-text text-lg font-semibold'>
					Gas prices (per surface litre)
				</h2>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='c-po2'
						name='c-po2'
						label='O₂ price'
						value={prices.o2}
						onChange={(v) => setPrice('o2', v)}
						min={0}
					/>
					<NumberInput
						id='c-phe'
						name='c-phe'
						label='He price'
						value={prices.he}
						onChange={(v) => setPrice('he', v)}
						min={0}
					/>
				</div>
			</section>
			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Cost</h2>
				{blend.feasible ? (
					<>
						<p className='text-light-text text-sm'>
							O₂ used: {roundVolume(o2L, units.volume)} {units.volume} →{' '}
							{o2Cost.toFixed(2)} · He used: {roundVolume(heL, units.volume)}{' '}
							{units.volume} → {heCost.toFixed(2)}
						</p>
						<p className='text-text text-xl font-bold'>
							Total: {total.toFixed(2)}
						</p>
					</>
				) : (
					<p className='text-light-text text-sm'>{blend.reason}</p>
				)}
			</section>
		</div>
	)
}

export default BlendingCostCalculator
