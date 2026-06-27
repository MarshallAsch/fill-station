'use client'

import { fromBar } from '@/lib/diveMath/units'
import {
	applyOverfill,
	hotTargetBar,
	removeOverfill,
	settledPressureBar,
} from '@/lib/diveMath/temperature'
import { useUnits } from './UnitsProvider'

// Given a fill/target pressure (bar gauge), show what it settles to once cool
// and the hot pressure needed to settle at it. Hidden when temperature is off.
const TemperatureResult = ({ goalBar }: { goalBar: number }) => {
	const { units, tempMode, overfillPct, fillTempC, settledTempC } = useUnits()
	if (tempMode === 'off' || goalBar <= 0) return null

	const p = (bar: number) => Math.round(fromBar(bar, units.pressure))
	const settled =
		tempMode === 'simple'
			? removeOverfill(goalBar, overfillPct)
			: settledPressureBar(goalBar, fillTempC, settledTempC)
	const hot =
		tempMode === 'simple'
			? applyOverfill(goalBar, overfillPct)
			: hotTargetBar(goalBar, fillTempC, settledTempC)

	return (
		<div className='text-text space-y-1'>
			<p>
				Settles to (cold):{' '}
				<span className='font-semibold'>
					{p(settled)} {units.pressure}
				</span>{' '}
				<span className='text-light-text'>after cooling</span>
			</p>
			<p>
				Fill hot to:{' '}
				<span className='font-semibold'>
					{p(hot)} {units.pressure}
				</span>{' '}
				<span className='text-light-text'>to settle at the target</span>
			</p>
		</div>
	)
}

export default TemperatureResult
