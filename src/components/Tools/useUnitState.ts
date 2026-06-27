'use client'

import { useEffect, useRef } from 'react'
import {
	fromBar,
	fromLpm,
	fromMeters,
	toBar,
	toLpm,
	toMeters,
} from '@/lib/diveMath/units'
import { useUnits } from './UnitsProvider'
import { usePersistedState } from './usePersistedState'

function usePersistedConverted<U>(
	key: string,
	initial: number,
	unit: U,
	toSI: (v: number, u: U) => number,
	fromSI: (v: number, u: U) => number,
	decimals: number,
): [number, (n: number) => void] {
	const [value, setValue] = usePersistedState<number>(key, initial)
	const prev = useRef(unit)
	useEffect(() => {
		if (prev.current !== unit) {
			const factor = 10 ** decimals
			const from = prev.current
			prev.current = unit
			 
			setValue((v) => Math.round(fromSI(toSI(v, from), unit) * factor) / factor)
		}
	}, [unit, decimals, toSI, fromSI, setValue])
	return [value, setValue]
}

export function usePersistedPressure(key: string, initial: number) {
	const { units } = useUnits()
	return usePersistedConverted(key, initial, units.pressure, toBar, fromBar, 0)
}

export function usePersistedDepth(key: string, initial: number) {
	const { units } = useUnits()
	return usePersistedConverted(
		key,
		initial,
		units.depth,
		toMeters,
		fromMeters,
		0,
	)
}

export function usePersistedAirFlow(key: string, initial: number) {
	const { units } = useUnits()
	return usePersistedConverted(key, initial, units.airFlow, toLpm, fromLpm, 1)
}

