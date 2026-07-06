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
	bleedTo: number
	bleedBar: number
}

const LABEL: Record<BlendComponent, string> = {
	o2: 'O₂',
	he: 'Helium',
	top: 'top-up gas',
}

const EPS = 1e-6

const DRAIN_IMPOSSIBLE =
	"Even a full drain can't reach this mix with this top-up gas — the target has less O₂ (or He) than the top-up gas provides."

const DET_UNREACHABLE =
	"Top-up gas can't reach this mix — use a top-up with both oxygen and inert gas."

interface SolveCtx {
	pf: number
	startFo2: number
	startFhe: number
	targetFo2: number
	targetFhe: number
	topFo2: number
	topFhe: number
	a11: number
	a12: number
	a21: number
	a22: number
	det: number
	useRealGas: boolean
}

// Solve the added partial pressures (pure He, pure O2, top-up gas) needed to
// reach the target at pf, starting from a tank already holding `pStart` bar of
// the start mix. Real-gas Z scaling is applied to the pure-gas additions,
// matching the top-level behavior.
function solvePartials(
	pStart: number,
	ctx: SolveCtx,
): { pHe: number; pO2: number; pTop: number } {
	const {
		pf,
		startFo2,
		startFhe,
		targetFo2,
		targetFhe,
		topFo2,
		topFhe,
		a11,
		a12,
		a21,
		a22,
		det,
		useRealGas,
	} = ctx
	const rem = pf - pStart
	const bHe = targetFhe * pf - startFhe * pStart - topFhe * rem
	const bO2 = targetFo2 * pf - startFo2 * pStart - topFo2 * rem
	let pHe = (bHe * a22 - a12 * bO2) / det
	let pO2 = (a11 * bO2 - bHe * a21) / det
	if (useRealGas) {
		pHe *= gasZ('he', pf)
		pO2 *= gasZ('o2', pf)
	}
	const pTop = pf - pStart - pHe - pO2
	return { pHe, pO2, pTop }
}

function buildResult(
	pi: number,
	effectiveStart: number,
	partials: { pHe: number; pO2: number; pTop: number },
	order: BlendComponent[],
	feasible: boolean,
	reason: string | undefined,
): BlendResult {
	const { pHe, pO2, pTop } = partials
	const add: Record<BlendComponent, number> = { he: pHe, o2: pO2, top: pTop }
	let running = effectiveStart
	const steps: BlendStep[] = order.map((gas) => {
		running += add[gas]
		return { gas, addBar: add[gas], toBar: running, label: LABEL[gas] }
	})
	return {
		pHe,
		pO2,
		pTop,
		addHeTo: effectiveStart + pHe,
		addO2To: effectiveStart + pHe + pO2,
		topTo: effectiveStart + pHe + pO2 + pTop,
		steps,
		feasible,
		reason,
		bleedTo: effectiveStart,
		bleedBar: Math.max(0, pi - effectiveStart),
	}
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

	const a11 = 1 - topFhe
	const a12 = -topFhe
	const a21 = -topFo2
	const a22 = 1 - topFo2
	const det = a11 * a22 - a12 * a21

	// Top-up gas spans no usable direction — no bleed can fix this.
	if (Math.abs(det) < 1e-9) {
		return buildResult(
			pi,
			pi,
			{ pHe: 0, pO2: 0, pTop: 0 },
			order,
			false,
			DET_UNREACHABLE,
		)
	}

	const ctx: SolveCtx = {
		pf,
		startFo2,
		startFhe,
		targetFo2,
		targetFhe,
		topFo2,
		topFhe,
		a11,
		a12,
		a21,
		a22,
		det,
		useRealGas: opts?.useRealGas ?? false,
	}

	const primary = solvePartials(pi, ctx)
	const primaryOk =
		primary.pHe >= -EPS && primary.pO2 >= -EPS && primary.pTop >= -EPS
	if (primaryOk) {
		return buildResult(pi, pi, primary, order, true, undefined)
	}

	// Infeasible at the current start pressure due to a negative partial.
	// A bleed is only possible if there is gas to vent.
	if (pi <= EPS) {
		return buildResult(pi, pi, primary, order, false, DRAIN_IMPOSSIBLE)
	}

	// Each partial is affine in the start pressure; reconstruct each line from
	// two evaluations (pStart = 0 and pStart = pi) and find the highest bleed
	// target that keeps all three partials >= 0.
	const at0 = solvePartials(0, ctx)
	const recon = (v0: number, vPi: number) => ({
		base: v0,
		slope: (vPi - v0) / pi,
	})
	const lines = [
		recon(at0.pHe, primary.pHe),
		recon(at0.pO2, primary.pO2),
		recon(at0.pTop, primary.pTop),
	]

	let lo = 0
	let hi = pi
	let constantInfeasible = false
	for (const { base, slope } of lines) {
		if (Math.abs(slope) < 1e-12) {
			if (base < -EPS) constantInfeasible = true
		} else {
			const cross = -base / slope
			if (slope > 0) lo = Math.max(lo, cross)
			else hi = Math.min(hi, cross)
		}
	}

	if (constantInfeasible || hi < lo - EPS || hi < 0) {
		return buildResult(pi, pi, primary, order, false, DRAIN_IMPOSSIBLE)
	}

	const bleedTo = Math.max(0, Math.min(hi, pi))
	const bled = solvePartials(bleedTo, ctx)
	return buildResult(pi, bleedTo, bled, order, true, undefined)
}
