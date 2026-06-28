import { ataAtDepth, depthPerBar, Water } from './modEnd'

// Gas densities at 0 °C, 1 atm (g/L).
export const O2_DENSITY = 1.42897
export const N2_DENSITY = 1.2506
export const HE_DENSITY = 0.17846

export const RECOMMENDED_MAX_DENSITY = 5.2
export const HARD_MAX_DENSITY = 6.3

export function surfaceDensity(input: { fo2: number; fhe: number }): number {
	const { fo2, fhe } = input
	const fn2 = 1 - fo2 - fhe
	return fo2 * O2_DENSITY + fn2 * N2_DENSITY + fhe * HE_DENSITY
}

export function densityAtDepth(input: {
	fo2: number
	fhe: number
	depthM: number
	water: Water
}): number {
	const { fo2, fhe, depthM, water } = input
	return surfaceDensity({ fo2, fhe }) * ataAtDepth(depthM, water)
}

export function depthForDensity(input: {
	fo2: number
	fhe: number
	density: number
	water: Water
}): number {
	const { fo2, fhe, density, water } = input
	const surface = surfaceDensity({ fo2, fhe })
	return (density / surface - 1) * depthPerBar(water)
}
