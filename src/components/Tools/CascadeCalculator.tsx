'use client'

import { calculateCascade } from '@/lib/diveMath/cascade'
import { roundPressure } from '@/lib/diveMath/format'
import { fromBar, toBar } from '@/lib/diveMath/units'
import CascadeCylinders from './CascadeCylinders'
import CylinderFields from './CylinderFields'
import HotFillNote from './HotFillNote'
import RealGasNote from './RealGasNote'
import { useUnits } from './UnitsProvider'
import { usePersistedState } from './usePersistedState'
import { usePersistedPressure } from './useUnitState'
import { useHotFill } from './useHotFill'

interface BankRow {
	volume: number
	pressure: number
	working: number
}

const CascadeCalculator = () => {
	const { units, useRealGas } = useUnits()
	const hot = useHotFill()
	const [banks, setBanks] = usePersistedState<BankRow[]>('cas.banks', [
		{ volume: 50, pressure: 3000, working: 3000 },
	])
	const [targetVolume, setTargetVolume] = usePersistedState(
		'cas.targetVol',
		11.1,
	)
	const [startPressure, setStartPressure] = usePersistedPressure(
		'cas.start',
		500,
	)
	const [desiredPressure, setDesiredPressure] = usePersistedPressure(
		'cas.desired',
		3000,
	)
	const hotDesired = hot.hotFill(desiredPressure)
	const [fillWorking, setFillWorking] = usePersistedPressure(
		'cas.fillWorking',
		3000,
	)

	const updateBank = (i: number, key: keyof BankRow, value: number) => {
		setBanks((prev) =>
			prev.map((b, idx) => (idx === i ? { ...b, [key]: value } : b)),
		)
	}
	const addBank = () =>
		setBanks((prev) => [...prev, { volume: 50, pressure: 3000, working: 3000 }])
	const removeBank = (i: number) =>
		setBanks((prev) => prev.filter((_, idx) => idx !== i))

	const result = calculateCascade(
		{
			banks: banks.map((b) => ({
				volume: b.volume,
				pressure: toBar(b.pressure, units.pressure),
			})),
			target: {
				volume: targetVolume,
				startPressure: toBar(startPressure, units.pressure),
			},
			desiredPressure: toBar(hotDesired, units.pressure),
		},
		{ useRealGas },
	)

	const cylMax = Math.max(
		...banks.map((b) => b.pressure),
		fromBar(result.finalPressure, units.pressure),
		1,
	)
	const cylinders = [
		...banks.map((b, i) => ({
			label: `Bank ${i + 1}`,
			volumeL: b.volume,
			startP: b.pressure,
			endP: fromBar(result.banks[i].residualPressure, units.pressure),
			maxP: cylMax,
			colorClass: ['text-warning', 'text-light-text', 'text-accent'][i % 3],
		})),
		{
			label: 'Fill',
			volumeL: targetVolume,
			startP: startPressure,
			endP: fromBar(result.finalPressure, units.pressure),
			maxP: cylMax,
			colorClass: 'text-accent',
		},
	]

	const p = (bar: number) => roundPressure(bar, units.pressure)

	return (
		<div className='2xl:relative'>
			<div className='space-y-6'>
				<section className='space-y-4'>
					<h2 className='text-text text-lg font-semibold'>Storage bank</h2>
					{banks.map((b, i) => (
						<div key={i} className='space-y-2'>
							<CylinderFields
								idPrefix={`bank-${i}`}
								category='cascade'
								waterVolumeL={b.volume}
								onWaterVolumeL={(v) => updateBank(i, 'volume', v)}
								working={{
									value: b.working,
									onChange: (v) => updateBank(i, 'working', v),
								}}
								filled={{
									value: b.pressure,
									onChange: (v) => updateBank(i, 'pressure', v),
									label: 'Current pressure',
								}}
							/>
							<button
								type='button'
								onClick={() => removeBank(i)}
								disabled={banks.length === 1}
								className='text-light-text hover:text-text px-2 py-2 text-sm disabled:opacity-40'
							>
								Remove
							</button>
						</div>
					))}
					<button
						type='button'
						onClick={addBank}
						className='bg-accent text-white-text rounded-md px-3 py-2 text-sm font-medium'
					>
						Add bank cylinder
					</button>
				</section>

				<section className='space-y-4'>
					<h2 className='text-text text-lg font-semibold'>Cylinder to fill</h2>
					<CylinderFields
						idPrefix='cas-fill'
						category={['scuba', 'cascade']}
						waterVolumeL={targetVolume}
						onWaterVolumeL={setTargetVolume}
						working={{ value: fillWorking, onChange: setFillWorking }}
						start={{
							value: startPressure,
							onChange: setStartPressure,
							label: 'Start pressure',
						}}
						filled={{
							value: desiredPressure,
							onChange: setDesiredPressure,
							label: 'Target pressure',
						}}
					/>
				</section>

				<section className='border-border space-y-2 rounded-md border p-4'>
					<h2 className='text-text text-lg font-semibold'>Result</h2>
					<p className='text-text'>
						Final cylinder pressure:{' '}
						<span className='font-semibold'>
							{p(result.finalPressure)} {units.pressure}
						</span>
					</p>
					{hot.on && <HotFillNote cold={desiredPressure} hot={hotDesired} />}
					<p
						className={
							result.reachedDesired
								? 'text-text text-sm'
								: 'text-light-text text-sm'
						}
					>
						{result.reachedDesired
							? 'Reaches the desired pressure.'
							: `Falls short of the desired ${desiredPressure} ${units.pressure}.`}
					</p>
					<CascadeCylinders cylinders={cylinders} unit={units.pressure} />
					<div className='text-light-text text-sm'>
						Bank residual pressures:{' '}
						{result.banks.map((b, i) => (
							<span key={i}>
								{i > 0 ? ', ' : ''}
								{p(b.residualPressure)} {units.pressure}
							</span>
						))}
					</div>
				</section>
			</div>
			<div className='mt-6 2xl:absolute 2xl:top-0 2xl:left-full 2xl:mt-0 2xl:ml-8 2xl:w-72'>
				<RealGasNote />
			</div>
		</div>
	)
}

export default CascadeCalculator
