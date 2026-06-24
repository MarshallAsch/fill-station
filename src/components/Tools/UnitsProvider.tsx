'use client'

import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'
import { DepthUnit, PressureUnit, VolumeUnit } from '@/lib/diveMath/units'

export interface UnitPrefs {
	pressure: PressureUnit
	depth: DepthUnit
	volume: VolumeUnit
}

const STORAGE_KEY = 'fillstation.tools.units'
const DEFAULT_UNITS: UnitPrefs = {
	pressure: 'psi',
	depth: 'ft',
	volume: 'cf',
}

interface UnitsContextValue {
	units: UnitPrefs
	setUnit: <K extends keyof UnitPrefs>(key: K, value: UnitPrefs[K]) => void
	hydrated: boolean
}

const UnitsContext = createContext<UnitsContextValue | null>(null)

const loadUnits = (): UnitPrefs => {
	if (typeof window === 'undefined') return DEFAULT_UNITS
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (raw) return { ...DEFAULT_UNITS, ...JSON.parse(raw) }
	} catch {
		// ignore malformed storage
	}
	return DEFAULT_UNITS
}

const UnitsProvider = ({ children }: { children: ReactNode }) => {
	const [units, setUnits] = useState<UnitPrefs>(loadUnits)
	const [hydrated, setHydrated] = useState(false)

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setHydrated(true)
	}, [])

	const setUnit = <K extends keyof UnitPrefs>(key: K, value: UnitPrefs[K]) => {
		setUnits((prev) => {
			const next = { ...prev, [key]: value }
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
			} catch {
				// ignore storage failures
			}
			return next
		})
	}

	return (
		<UnitsContext.Provider value={{ units, setUnit, hydrated }}>
			{children}
		</UnitsContext.Provider>
	)
}

export function useUnits(): UnitsContextValue {
	const ctx = useContext(UnitsContext)
	if (!ctx) throw new Error('useUnits must be used within a UnitsProvider')
	return ctx
}

export default UnitsProvider
