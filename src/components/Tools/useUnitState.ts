'use client'

import { useEffect, useRef, useState } from 'react'
import {
	DepthUnit,
	FlowUnit,
	PressureUnit,
	fromBar,
	fromLpm,
	fromMeters,
	toBar,
	toLpm,
	toMeters,
} from '@/lib/diveMath/units'
import { useUnits } from './UnitsProvider'

function useConverted<U>(
	initial: number,
	unit: U,
	toSI: (v: number, u: U) => number,
	fromSI: (v: number, u: U) => number,
	decimals: number,
): [number, (n: number) => void] {
	const [value, setValue] = useState(initial)
	const prev = useRef(unit)
	useEffect(() => {
		if (prev.current !== unit) {
			const factor = 10 ** decimals
			const from = prev.current
			prev.current = unit
			 
			setValue((v) => Math.round(fromSI(toSI(v, from), unit) * factor) / factor)
		}
	}, [unit, decimals, toSI, fromSI])
	return [value, setValue]
}

export function usePressureState(initial: number) {
	const { units } = useUnits()
	return useConverted<PressureUnit>(initial, units.pressure, toBar, fromBar, 0)
}

export function useDepthState(initial: number) {
	const { units } = useUnits()
	return useConverted<DepthUnit>(initial, units.depth, toMeters, fromMeters, 0)
}

export function useAirFlowState(initial: number) {
	const { units } = useUnits()
	return useConverted<FlowUnit>(initial, units.airFlow, toLpm, fromLpm, 1)
}
