'use client'

import { useEffect } from 'react'
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

interface Stored<U> {
	v: number
	u: U
}

function usePersistedConverted<U>(
	key: string,
	initial: number,
	unit: U,
	toSI: (v: number, u: U) => number,
	fromSI: (v: number, u: U) => number,
	decimals: number,
): [number, (n: number) => void] {
	const [stored, setStored] = usePersistedState<Stored<U>>(key, {
		v: initial,
		u: unit,
	})
	const factor = 10 ** decimals
	const convert = (v: number, from: U, to: U) =>
		from === to ? v : Math.round(fromSI(toSI(v, from), to) * factor) / factor

	// The stored value carries the unit it was entered in, so a value restored
	// from storage is always interpreted against its own unit — never the
	// default. This prevents the double-conversion that happens when the
	// persisted unit is restored after the persisted value.
	const safe: Stored<U> =
		stored && typeof stored === 'object' && typeof stored.v === 'number'
			? stored
			: { v: initial, u: unit }
	const value = convert(safe.v, safe.u, unit)

	// Keep storage normalised to the active unit (and repair legacy/malformed
	// entries). Safe because { v, u } always describes the same physical
	// quantity, regardless of the order value and unit are restored.
	useEffect(() => {
		if (safe.u !== unit || safe !== stored) {
			setStored({ v: value, u: unit })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [unit, stored])

	return [value, (n: number) => setStored({ v: n, u: unit })]
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
