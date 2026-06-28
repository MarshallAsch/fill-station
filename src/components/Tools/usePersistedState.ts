'use client'

import { useEffect, useState } from 'react'

const PREFIX = 'fillstation.tools.'

// localStorage-backed useState. SSR-safe: starts from `initial`, hydrates from
// storage on mount, persists on every change. Supports updater functions so it's
// a drop-in for useState (incl. arrays/objects).
export function usePersistedState<T>(
	key: string,
	initial: T,
): [T, (v: T | ((prev: T) => T)) => void] {
	const [value, setValue] = useState<T>(initial)
	useEffect(() => {
		try {
			const raw = localStorage.getItem(PREFIX + key)
			 
			if (raw != null) setValue(JSON.parse(raw) as T)
		} catch {
			// ignore malformed storage
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	const set = (v: T | ((prev: T) => T)) => {
		setValue((prev) => {
			const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
			try {
				localStorage.setItem(PREFIX + key, JSON.stringify(next))
			} catch {
				// ignore storage failures
			}
			return next
		})
	}
	return [value, set]
}
