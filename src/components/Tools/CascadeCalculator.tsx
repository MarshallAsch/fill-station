'use client'

import { useState } from 'react'
import Checkbox from '@/components/UI/FormElements/CheckBox'
import NumberInput from '@/components/UI/FormElements/NumberInput'
import { calculateCascade } from '@/lib/diveMath/cascade'
import { fromBar, fromLiters, toBar, toLiters } from '@/lib/diveMath/units'
import TankSizePicker from './TankSizePicker'
import UnitToggle from './UnitToggle'
import { useUnits } from './UnitsProvider'

interface BankRow {
	volume: number
	pressure: number
}

const CascadeCalculator = () => {
	const { units } = useUnits()
	const [banks, setBanks] = useState<BankRow[]>([
		{ volume: 80, pressure: 3000 },
	])
	const [targetVolume, setTargetVolume] = useState(80)
	const [startPressure, setStartPressure] = useState(500)
	const [desiredPressure, setDesiredPressure] = useState(3000)
	const [useRealGas, setUseRealGas] = useState(false)

	const updateBank = (i: number, key: keyof BankRow, value: number) => {
		setBanks((prev) =>
			prev.map((b, idx) => (idx === i ? { ...b, [key]: value } : b)),
		)
	}
	const addBank = () =>
		setBanks((prev) => [...prev, { volume: 80, pressure: 3000 }])
	const removeBank = (i: number) =>
		setBanks((prev) => prev.filter((_, idx) => idx !== i))

	const result = calculateCascade(
		{
			banks: banks.map((b) => ({
				volume: toLiters(b.volume, units.volume),
				pressure: toBar(b.pressure, units.pressure),
			})),
			target: {
				volume: toLiters(targetVolume, units.volume),
				startPressure: toBar(startPressure, units.pressure),
			},
			desiredPressure: toBar(desiredPressure, units.pressure),
		},
		{ useRealGas },
	)

	const p = (bar: number) => Math.round(fromBar(bar, units.pressure))

	return (
		<div className='space-y-6'>
			<UnitToggle show={['pressure', 'volume']} />
			<Checkbox
				id='cas-realgas'
				name='cas-realgas'
				title='Account for gas compressibility (real-gas, approximate)'
				checked={useRealGas}
				onChange={setUseRealGas}
			/>

			<section className='space-y-4'>
				<h2 className='text-text text-lg font-semibold'>Storage bank</h2>
				{banks.map((b, i) => (
					<div key={i} className='flex flex-wrap items-end gap-3'>
						<TankSizePicker
							category='storage'
							onSelect={(l, bar) => {
								updateBank(i, 'volume', fromLiters(l, units.volume))
								updateBank(i, 'pressure', fromBar(bar, units.pressure))
							}}
						/>
						<NumberInput
							id={`bank-vol-${i}`}
							name={`bank-vol-${i}`}
							label={`Volume (${units.volume})`}
							value={b.volume}
							onChange={(v) => updateBank(i, 'volume', v)}
						/>
						<NumberInput
							id={`bank-pr-${i}`}
							name={`bank-pr-${i}`}
							label={`Pressure (${units.pressure})`}
							value={b.pressure}
							onChange={(v) => updateBank(i, 'pressure', v)}
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
					className='bg-accent text-accent-text rounded-md px-3 py-2 text-sm font-medium'
				>
					Add bank cylinder
				</button>
			</section>

			<section className='space-y-4'>
				<h2 className='text-text text-lg font-semibold'>Cylinder to fill</h2>
				<TankSizePicker
					category='dive'
					onSelect={(l) => setTargetVolume(fromLiters(l, units.volume))}
				/>
				<div className='flex items-end gap-3'>
					<NumberInput
						id='target-vol'
						name='target-vol'
						label={`Volume (${units.volume})`}
						value={targetVolume}
						onChange={setTargetVolume}
					/>
					<NumberInput
						id='target-start'
						name='target-start'
						label={`Start pressure (${units.pressure})`}
						value={startPressure}
						onChange={setStartPressure}
					/>
					<NumberInput
						id='target-desired'
						name='target-desired'
						label={`Desired pressure (${units.pressure})`}
						value={desiredPressure}
						onChange={setDesiredPressure}
					/>
				</div>
			</section>

			<section className='border-border space-y-2 rounded-md border p-4'>
				<h2 className='text-text text-lg font-semibold'>Result</h2>
				<p className='text-text'>
					Final cylinder pressure:{' '}
					<span className='font-semibold'>
						{p(result.finalPressure)} {units.pressure}
					</span>
				</p>
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
	)
}

export default CascadeCalculator
