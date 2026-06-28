'use client'

import NumberInput from '@/components/UI/FormElements/NumberInput'
import { fromCelsius, toCelsius } from '@/lib/diveMath/units'
import { useUnits } from './UnitsProvider'

const MODES: { value: 'off' | 'simple' | 'detailed'; label: string }[] = [
	{ value: 'off', label: 'Off' },
	{ value: 'simple', label: 'Overfill %' },
	{ value: 'detailed', label: 'Temperatures' },
]

const TemperatureControl = () => {
	const {
		units,
		tempMode,
		setTempMode,
		overfillPct,
		setOverfillPct,
		fillTempC,
		setFillTempC,
		settledTempC,
		setSettledTempC,
	} = useUnits()

	const fillDisplay = Math.round(fromCelsius(fillTempC, units.temp))
	const settledDisplay = Math.round(fromCelsius(settledTempC, units.temp))

	return (
		<div className='space-y-3'>
			<div className='flex items-center gap-2'>
				<span className='text-light-text text-xs font-medium'>
					Hot-fill / cooling
				</span>
				<div className='border-border inline-flex overflow-hidden rounded-md border'>
					{MODES.map((m) => (
						<button
							key={m.value}
							type='button'
							onClick={() => setTempMode(m.value)}
							className={
								tempMode === m.value
									? 'bg-accent text-white-text px-3 py-1 text-sm font-medium'
									: 'text-text hover:bg-hover px-3 py-1 text-sm'
							}
						>
							{m.label}
						</button>
					))}
				</div>
			</div>
			{tempMode === 'simple' && (
				<NumberInput
					id='temp-overfill'
					name='temp-overfill'
					label='Hot-fill overfill (%)'
					value={overfillPct}
					onChange={setOverfillPct}
					min={0}
					tooltip='Fill this much over the target hot, so it settles at the target once it cools.'
				/>
			)}
			{tempMode === 'detailed' && (
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<NumberInput
						id='temp-fill'
						name='temp-fill'
						label={`Fill (hot) temp (°${units.temp})`}
						value={fillDisplay}
						onChange={(v) => setFillTempC(toCelsius(v, units.temp))}
						tooltip='Cylinder temperature right after filling.'
					/>
					<NumberInput
						id='temp-settled'
						name='temp-settled'
						label={`Settled temp (°${units.temp})`}
						value={settledDisplay}
						onChange={(v) => setSettledTempC(toCelsius(v, units.temp))}
						tooltip='Ambient temperature the cylinder cools to.'
					/>
				</div>
			)}
		</div>
	)
}

export default TemperatureControl
