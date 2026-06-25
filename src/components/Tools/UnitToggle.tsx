'use client'

import { UnitPrefs, useUnits } from './UnitsProvider'

const OPTIONS: Record<
	keyof UnitPrefs,
	{ label: string; values: { value: string; label: string }[] }
> = {
	pressure: {
		label: 'Pressure',
		values: [
			{ value: 'psi', label: 'psi' },
			{ value: 'bar', label: 'bar' },
		],
	},
	depth: {
		label: 'Depth',
		values: [
			{ value: 'ft', label: 'ft' },
			{ value: 'm', label: 'm' },
		],
	},
	volume: {
		label: 'Volume',
		values: [
			{ value: 'cf', label: 'cf' },
			{ value: 'l', label: 'L' },
		],
	},
	flow: {
		label: 'Flow',
		values: [
			{ value: 'lpm', label: 'LPM' },
			{ value: 'cfm', label: 'CFM' },
		],
	},
}

const UnitToggle = ({ show }: { show: Array<keyof UnitPrefs> }) => {
	const { units, setUnit } = useUnits()

	return (
		<div className='flex flex-wrap gap-4'>
			{show.map((key) => {
				const opt = OPTIONS[key]
				return (
					<div key={key} className='flex items-center gap-2'>
						<span className='text-light-text text-xs font-medium'>
							{opt.label}
						</span>
						<div className='border-border inline-flex overflow-hidden rounded-md border'>
							{opt.values.map((v) => {
								const active = units[key] === v.value
								return (
									<button
										key={v.value}
										type='button'
										onClick={() =>
											setUnit(key, v.value as UnitPrefs[typeof key])
										}
										className={
											active
												? 'bg-accent text-accent-text px-3 py-1 text-sm font-medium'
												: 'text-text hover:bg-hover px-3 py-1 text-sm'
										}
									>
										{v.label}
									</button>
								)
							})}
						</div>
					</div>
				)
			})}
		</div>
	)
}

export default UnitToggle
