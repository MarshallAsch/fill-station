import { depthPerBar, Water } from './modEnd'

export function ead(input: {
	depthM: number
	fo2: number
	fhe: number
	water: Water
}): number {
	const { depthM, fo2, fhe, water } = input
	const d0 = depthPerBar(water)
	const fn2 = 1 - fo2 - fhe
	return (depthM + d0) * (fn2 / 0.79) - d0
}
