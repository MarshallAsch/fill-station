import { depthPerBar, Water } from './modEnd'
import { AIR_FN2 } from './units'

export function ead(input: {
	depthM: number
	fo2: number
	fhe: number
	water: Water
}): number {
	const { depthM, fo2, fhe, water } = input
	const d0 = depthPerBar(water)
	const fn2 = 1 - fo2 - fhe
	return (depthM + d0) * (fn2 / AIR_FN2) - d0
}
