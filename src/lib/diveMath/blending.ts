import { gasZ } from './compressibility'
import { AIR_FO2 } from './units'

export interface BlendInput {
	startPressure: number
	startFo2: number
	startFhe: number
	finalPressure: number
	targetFo2: number
	targetFhe: number
	topupFo2?: number
	topupFhe?: number
	order?: BlendComponent[]
}

export type BlendComponent = 'o2' | 'he' | 'top'

export interface BlendStep {
	gas: BlendComponent
	addBar: number
	toBar: number
	label: string
}

export interface BlendResult {
	pHe: number
	pO2: number
	pTop: number
	addHeTo: number
	addO2To: number
	topTo: number
	steps: BlendStep[]
	feasible: boolean
	reason?: string
}

const LABEL: Record<BlendComponent, string> = {
	o2: 'O₂',
	he: 'Helium',
	top: 'top-up gas',
}

export function calculateBlend(
	input: BlendInput,
	opts?: { useRealGas?: boolean },
): BlendResult {
	const {
		startPressure: pi,
		startFo2,
		startFhe,
		finalPressure: pf,
		targetFo2,
		targetFhe,
	} = input
	const topFo2 = input.topupFo2 ?? AIR_FO2
	const topFhe = input.topupFhe ?? 0
	const order = input.order ?? ['he', 'o2', 'top']

	// Solve added partial pressures of pure O2, pure He, and the top-up gas so the
	// final mix hits the target at pf. Top-up fills the remainder:
	//   pTop = pf - pi - pHe - pO2
	// He:  startFhe*pi + pHe + topFhe*pTop = targetFhe*pf
	// O2:  startFo2*pi + pO2 + topFo2*pTop = targetFo2*pf
	// Two linear equations in pHe, pO2 (substitute pTop). Solve:
	const rem = pf - pi
	// From He:  pHe + topFhe*(rem - pHe - pO2) = targetFhe*pf - startFhe*pi
	// From O2:  pO2 + topFo2*(rem - pHe - pO2) = targetFo2*pf - startFo2*pi
	const bHe = targetFhe * pf - startFhe * pi - topFhe * rem
	const bO2 = targetFo2 * pf - startFo2 * pi - topFo2 * rem
	// (1-topFhe)*pHe + (-topFhe)*pO2 = bHe
	// (-topFo2)*pHe + (1-topFo2)*pO2 = bO2
	const a11 = 1 - topFhe
	const a12 = -topFhe
	const a21 = -topFo2
	const a22 = 1 - topFo2
	const det = a11 * a22 - a12 * a21
	let pHe = (bHe * a22 - a12 * bO2) / det
	let pO2 = (a11 * bO2 - bHe * a21) / det

	if (opts?.useRealGas) {
		pHe *= gasZ('he', pf)
		pO2 *= gasZ('o2', pf)
	}
	const pTop = pf - pi - pHe - pO2

	const eps = 1e-6
	let feasible = true
	let reason: string | undefined
	if (Math.abs(det) < 1e-9) {
		feasible = false
		reason =
			"Top-up gas can't reach this mix — use a top-up with both oxygen and inert gas."
	} else if (pHe < -eps) {
		feasible = false
		reason = 'Too much helium in the start mix — draining required.'
	} else if (pO2 < -eps) {
		feasible = false
		reason = 'Too much oxygen in the start mix — draining required.'
	} else if (pTop < -eps) {
		feasible = false
		reason = 'Start pressure too high for this mix — draining required.'
	}

	const add: Record<BlendComponent, number> = { he: pHe, o2: pO2, top: pTop }
	let running = pi
	const steps: BlendStep[] = order.map((gas) => {
		running += add[gas]
		return { gas, addBar: add[gas], toBar: running, label: LABEL[gas] }
	})

	return {
		pHe,
		pO2,
		pTop,
		addHeTo: pi + pHe,
		addO2To: pi + pHe + pO2,
		topTo: pf,
		steps,
		feasible,
		reason,
	}
}
