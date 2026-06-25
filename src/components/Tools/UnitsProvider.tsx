'use client'

import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'
import {
	DepthUnit,
	FlowUnit,
	PressureUnit,
	VolumeUnit,
} from '@/lib/diveMath/units'

export interface UnitPrefs {
	pressure: PressureUnit
	depth: DepthUnit
	volume: VolumeUnit
	airFlow: FlowUnit
	o2Flow: FlowUnit
}

const STORAGE_KEY = 'fillstation.tools.units'
const DEFAULT_UNITS: UnitPrefs = {
	pressure: 'psi',
	depth: 'ft',
	volume: 'cf',
	airFlow: 'cfm',
	o2Flow: 'lpm',
}

interface UnitsContextValue {
	units: UnitPrefs
	setUnit: <K extends keyof UnitPrefs>(key: K, value: UnitPrefs[K]) => void
}

const UnitsContext = createContext<UnitsContextValue | null>(null)

const UnitsProvider = ({ children }: { children: ReactNode }) => {
	const [units, setUnits] = useState<UnitPrefs>(DEFAULT_UNITS)

	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			if (raw) {
				// eslint-disable-next-line react-hooks/set-state-in-effect
				setUnits({ ...DEFAULT_UNITS, ...JSON.parse(raw) })
			}
		} catch {
			// ignore malformed storage
		}
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
		<UnitsContext.Provider value={{ units, setUnit }}>
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
