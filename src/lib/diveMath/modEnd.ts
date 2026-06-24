import { AIR_FN2 } from './units'

export type Water = 'salt' | 'fresh'
export type EndModel = 'o2-narcotic' | 'n2-only'

export function depthPerBar(water: Water): number {
	return water === 'fresh' ? 10.3 : 10
}

export function calculateMod(input: {
	fo2: number
	ppo2: number
	water: Water
}): number {
	const { fo2, ppo2, water } = input
	return (ppo2 / fo2 - 1) * depthPerBar(water)
}

export function calculateEnd(input: {
	fo2: number
	fhe: number
	depth: number
	water: Water
	model: EndModel
}): number {
	const { fo2, fhe, depth, water, model } = input
	const d0 = depthPerBar(water)
	if (model === 'n2-only') {
		const fn2 = 1 - fo2 - fhe
		return (depth + d0) * (fn2 / AIR_FN2) - d0
	}
	// o2-narcotic: narcotic fraction is everything that is not helium
	return (depth + d0) * (1 - fhe) - d0
}
