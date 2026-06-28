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
	TempUnit,
	VolumeUnit,
} from '@/lib/diveMath/units'

export interface UnitPrefs {
	pressure: PressureUnit
	depth: DepthUnit
	volume: VolumeUnit
	airFlow: FlowUnit
	o2Flow: FlowUnit
	temp: TempUnit
}

const STORAGE_KEY = 'fillstation.tools.units'
const REALGAS_KEY = 'fillstation.tools.realgas'
const DEFAULT_REAL_GAS = true
const DEFAULT_UNITS: UnitPrefs = {
	pressure: 'psi',
	depth: 'ft',
	volume: 'cf',
	airFlow: 'cfm',
	o2Flow: 'lpm',
	temp: 'F',
}

const TEMP_KEY = 'fillstation.tools.temp'
type TempMode = 'off' | 'simple' | 'detailed'
const DEFAULT_TEMP = {
	mode: 'off' as TempMode,
	overfillPct: 10,
	fillTempC: 27, // ~80 °F fill
	settledTempC: 21, // ~70 °F ambient
}

interface UnitsContextValue {
	units: UnitPrefs
	setUnit: <K extends keyof UnitPrefs>(key: K, value: UnitPrefs[K]) => void
	// Global across every tool: account for gas compressibility (real-gas) rather
	// than ideal gas. Persisted, so it's set once and applies everywhere.
	useRealGas: boolean
	setUseRealGas: (value: boolean) => void
	tempMode: TempMode
	setTempMode: (m: TempMode) => void
	overfillPct: number
	setOverfillPct: (v: number) => void
	fillTempC: number
	setFillTempC: (v: number) => void
	settledTempC: number
	setSettledTempC: (v: number) => void
}

const UnitsContext = createContext<UnitsContextValue | null>(null)

const UnitsProvider = ({ children }: { children: ReactNode }) => {
	const [units, setUnits] = useState<UnitPrefs>(DEFAULT_UNITS)
	const [useRealGas, setRealGas] = useState<boolean>(DEFAULT_REAL_GAS)
	const [temp, setTemp] = useState(DEFAULT_TEMP)

	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			if (raw) {
				// eslint-disable-next-line react-hooks/set-state-in-effect
				setUnits({ ...DEFAULT_UNITS, ...JSON.parse(raw) })
			}
			const rg = localStorage.getItem(REALGAS_KEY)

			if (rg != null) setRealGas(rg === 'true')
			const t = localStorage.getItem(TEMP_KEY)

			if (t) setTemp({ ...DEFAULT_TEMP, ...JSON.parse(t) })
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

	const setUseRealGas = (value: boolean) => {
		setRealGas(value)
		try {
			localStorage.setItem(REALGAS_KEY, String(value))
		} catch {
			// ignore storage failures
		}
	}

	const updateTemp = (patch: Partial<typeof DEFAULT_TEMP>) => {
		setTemp((prev) => {
			const next = { ...prev, ...patch }
			try {
				localStorage.setItem(TEMP_KEY, JSON.stringify(next))
			} catch {
				// ignore storage failures
			}
			return next
		})
	}

	return (
		<UnitsContext.Provider
			value={{
				units,
				setUnit,
				useRealGas,
				setUseRealGas,
				tempMode: temp.mode,
				setTempMode: (m) => updateTemp({ mode: m }),
				overfillPct: temp.overfillPct,
				setOverfillPct: (v) => updateTemp({ overfillPct: v }),
				fillTempC: temp.fillTempC,
				setFillTempC: (v) => updateTemp({ fillTempC: v }),
				settledTempC: temp.settledTempC,
				setSettledTempC: (v) => updateTemp({ settledTempC: v }),
			}}
		>
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
