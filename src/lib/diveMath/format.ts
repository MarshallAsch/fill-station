import {
	DepthUnit,
	PressureUnit,
	VolumeUnit,
	fromBar,
	fromLiters,
	fromMeters,
} from './units'

// Divide by an integer factor rather than multiplying by the fractional step:
// `Math.round(312.1658) * 0.1` is 31.200000000000003, but `312 / 10` is exactly
// 31.2 — so the displayed value has no floating-point tail.
const roundTo = (value: number, step: number) => {
	const inv = Math.round(1 / step)
	return Math.round(value * inv) / inv
}
const floorTo = (value: number, step: number) => {
	const inv = Math.round(1 / step)
	return Math.floor(value * inv) / inv
}

// Pressure (display units): psi → nearest 1, bar → nearest 0.1.
export function roundPressure(bar: number, unit: PressureUnit): number {
	const v = fromBar(bar, unit)
	return unit === 'psi' ? Math.round(v) : roundTo(v, 0.1)
}

// Free-gas volume: cf → nearest 1, l → nearest 0.1.
export function roundVolume(litres: number, unit: VolumeUnit): number {
	const v = fromLiters(litres, unit)
	return unit === 'cf' ? Math.round(v) : roundTo(v, 0.1)
}

// SAC / RMV rate (volume per minute): cf → nearest 0.01, l → nearest 0.1.
export function roundSac(lpm: number, unit: VolumeUnit): number {
	const v = fromLiters(lpm, unit)
	return unit === 'cf' ? roundTo(v, 0.01) : roundTo(v, 0.1)
}

// Temperature (already in display units): nearest 0.1.
export function roundTemp(displayTemp: number): number {
	return roundTo(displayTemp, 0.1)
}

// O2/He output percentage: nearest 0.1.
export function roundPercent(pct: number): number {
	return roundTo(pct, 0.1)
}

// Depth (MOD / ceiling): floor to m → 0.1, ft → 1 (never overstate a max depth).
export function roundDepthDown(m: number, unit: DepthUnit): number {
	const v = fromMeters(m, unit)
	return unit === 'ft' ? Math.floor(v) : floorTo(v, 0.1)
}

// Mix label: "21/35" with helium, "32" without (drop the /0).
export function fmtMix(o2Pct: number, hePct: number): string {
	const o2 = Math.round(o2Pct)
	return hePct > 0 ? `${o2}/${Math.round(hePct)}` : `${o2}`
}
