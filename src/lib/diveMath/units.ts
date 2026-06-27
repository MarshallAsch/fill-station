export const AIR_FO2 = 0.209
export const AIR_FN2 = 0.791
export const ATMOSPHERIC_BAR = 1.01325

export const PSI_PER_BAR = 14.5037738
export const L_PER_CF = 28.3168466
export const FT_PER_M = 3.280839895

export type PressureUnit = 'psi' | 'bar'
export type DepthUnit = 'ft' | 'm'
export type VolumeUnit = 'cf' | 'l'

export function toBar(value: number, unit: PressureUnit): number {
	return unit === 'psi' ? value / PSI_PER_BAR : value
}

export function fromBar(bar: number, unit: PressureUnit): number {
	return unit === 'psi' ? bar * PSI_PER_BAR : bar
}

export function toMeters(value: number, unit: DepthUnit): number {
	return unit === 'ft' ? value / FT_PER_M : value
}

export function fromMeters(m: number, unit: DepthUnit): number {
	return unit === 'ft' ? m * FT_PER_M : m
}

export type FlowUnit = 'lpm' | 'cfm'

export function fromLiters(l: number, unit: VolumeUnit): number {
	return unit === 'cf' ? l / L_PER_CF : l
}

export function toLiters(value: number, unit: VolumeUnit): number {
	return unit === 'cf' ? value * L_PER_CF : value
}

export function toLpm(value: number, unit: FlowUnit): number {
	return unit === 'cfm' ? value * L_PER_CF : value
}

export function fromLpm(lpm: number, unit: FlowUnit): number {
	return unit === 'cfm' ? lpm / L_PER_CF : lpm
}

export type TempUnit = 'C' | 'F'

export function toCelsius(value: number, unit: TempUnit): number {
	return unit === 'F' ? ((value - 32) * 5) / 9 : value
}

export function fromCelsius(c: number, unit: TempUnit): number {
	return unit === 'F' ? (c * 9) / 5 + 32 : c
}

