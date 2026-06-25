import { gasZ } from './compressibility'
import { AIR_FO2 } from './units'

export interface BlendInput {
	startPressure: number
	startFo2: number
	startFhe: number
	finalPressure: number
	targetFo2: number
	targetFhe: number
}

export interface BlendResult {
	pHe: number
	pO2: number
	pTop: number
	addHeTo: number
	addO2To: number
	topTo: number
	feasible: boolean
	reason?: string
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

	// He balance: startFhe*pi + pHe = targetFhe*pf
	let pHe = targetFhe * pf - startFhe * pi
	// O2 balance with air top (top FO2 = AIR_FO2, top FHe = 0):
	// startFo2*pi + pO2 + AIR_FO2*pTop = targetFo2*pf, pTop = pf - pi - pHe - pO2
	let pO2 =
		(targetFo2 * pf - startFo2 * pi - AIR_FO2 * (pf - pi - pHe)) /
		(1 - AIR_FO2)
	if (opts?.useRealGas) {
		// Real moles ∝ P/Z, so the gauge pressure to add for a target quantity
		// scales by that gas's Z at the final pressure.
		pHe *= gasZ('he', pf)
		pO2 *= gasZ('o2', pf)
	}
	const pTop = pf - pi - pHe - pO2

	const eps = 1e-6
	let feasible = true
	let reason: string | undefined
	if (pHe < -eps) {
		feasible = false
		reason = 'Too much helium in the start mix — draining required.'
	} else if (pO2 < -eps) {
		feasible = false
		reason = 'Too much oxygen in the start mix — draining required.'
	} else if (pTop < -eps) {
		feasible = false
		reason = 'Start pressure too high for this mix — draining required.'
	}

	return {
		pHe,
		pO2,
		pTop,
		addHeTo: pi + pHe,
		addO2To: pi + pHe + pO2,
		topTo: pf,
		feasible,
		reason,
	}
}
