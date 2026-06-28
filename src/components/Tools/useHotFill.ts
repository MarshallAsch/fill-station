'use client'

import { fromBar, toBar } from '@/lib/diveMath/units'
import {
	effectiveHotFillBar,
	hotTargetBar,
} from '@/lib/diveMath/temperature'
import { useUnits } from './UnitsProvider'

// Converts a cold (settled) target pressure to the hot fill pressure per the
// global temperature settings, in display units. `fillTempOverrideC` (nitrox)
// forces the Gay-Lussac hot target with that fill temperature, regardless of the
// simple/detailed mode (an explicit fill temperature supersedes).
export function useHotFill(): {
	on: boolean
	hotFill: (coldDisplay: number, fillTempOverrideC?: number) => number
} {
	const { units, tempMode, overfillPct, fillTempC, settledTempC } = useUnits()
	const on = tempMode !== 'off'
	const hotFill = (coldDisplay: number, fillTempOverrideC?: number) => {
		if (!on) return coldDisplay
		const coldBar = toBar(coldDisplay, units.pressure)
		const hotBar =
			fillTempOverrideC != null
				? hotTargetBar(coldBar, fillTempOverrideC, settledTempC)
				: effectiveHotFillBar(coldBar, {
						mode: tempMode,
						overfillPct,
						fillTempC,
						settledTempC,
					})
		return fromBar(hotBar, units.pressure)
	}
	return { on, hotFill }
}
