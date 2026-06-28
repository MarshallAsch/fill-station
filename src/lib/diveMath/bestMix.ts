import { ataAtDepth, depthPerBar, Water } from './modEnd'

export function bestFo2(input: {
	depthM: number
	ppo2: number
	water: Water
}): number {
	const { depthM, ppo2, water } = input
	return Math.min(1, ppo2 / ataAtDepth(depthM, water))
}

export function bestFhe(input: {
	depthM: number
	targetEndM: number
	water: Water
}): number {
	const { depthM, targetEndM, water } = input
	const d0 = depthPerBar(water)
	return Math.max(0, 1 - (targetEndM + d0) / (depthM + d0))
}

export interface BestMix {
	fo2: number
	fhe: number
	fn2: number
}

export function bestMix(input: {
	depthM: number
	ppo2: number
	targetEndM?: number
	water: Water
}): BestMix {
	const fo2 = bestFo2(input)
	const fhe =
		input.targetEndM === undefined
			? 0
			: bestFhe({
					depthM: input.depthM,
					targetEndM: input.targetEndM,
					water: input.water,
				})
	return { fo2, fhe, fn2: Math.max(0, 1 - fo2 - fhe) }
}
