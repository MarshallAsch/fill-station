import { ATMOSPHERIC_BAR } from './units'

export interface BoosterInput {
	ratio: number
	driveP: number
	supplyVol: number
	supplyStart: number
	receiverVol: number
	receiverStart: number
	target: number
	regulatedInletBar?: number
}

export interface BoosterResult {
	maxOutput: number
	eqPressure: number
	processGasL: number
	driveAirL: number
	finalSupply: number
	feasible: boolean
	reason?: string
	supplyLimitedMax?: number
}

export interface ProfilePoint {
	receiverP: number
	cumulativeDriveL: number
	supplyP: number
	rateLPerBar: number
}

const ATM = ATMOSPHERIC_BAR

// Shared setup: the boost phase's starting conditions, after any free
// equalization (which happens only when the supply starts above the receiver).
function boostSetup(input: BoosterInput) {
	const { supplyVol: vs, supplyStart, receiverVol: vr, receiverStart } = input
	const eqAbs =
		(vs * (supplyStart + ATM) + vr * (receiverStart + ATM)) / (vs + vr)
	const eqPressure = eqAbs - ATM
	const equalizes = supplyStart > receiverStart
	const boostStartReceiver = equalizes ? eqPressure : receiverStart
	const inletStartAbs = equalizes ? eqAbs : supplyStart + ATM
	return { eqPressure, boostStartReceiver, inletStartAbs }
}

// Drive air (free litres) to move Q free litres into the receiver, with the
// inlet pressure capped at capAbs (two-stage regulated inlet). capAbs = +∞ for
// single-stage. While the supply (inletStartAbs − q/vs) is above the cap the
// inlet is constant (linear drive term); below it, the inlet follows the supply
// down (log term).
function driveAirForQ(
	q: number,
	inletStartAbs: number,
	capAbs: number,
	vs: number,
	ratio: number,
	drivePAbs: number,
): number {
	if (q <= 0) return 0
	const qStar = Math.max(0, vs * (inletStartAbs - capAbs))
	const q1 = Math.min(q, qStar)
	const seg1 = q1 > 0 ? ((ratio * drivePAbs) / capAbs) * q1 : 0
	let seg2 = 0
	if (q > qStar) {
		const startAbs2 = qStar > 0 ? capAbs : inletStartAbs
		const finalAbs = inletStartAbs - q / vs
		seg2 = ratio * drivePAbs * vs * Math.log(startAbs2 / finalAbs)
	}
	return seg1 + seg2
}

export function calculateBooster(input: BoosterInput): BoosterResult {
	const { ratio, driveP, supplyVol: vs, receiverVol: vr, target } = input
	const maxOutput = ratio * driveP
	const { eqPressure, boostStartReceiver, inletStartAbs } = boostSetup(input)
	const drivePAbs = driveP + ATM
	const finalSupplyNoBoost = inletStartAbs - ATM
	const capAbs =
		input.regulatedInletBar !== undefined
			? input.regulatedInletBar + ATM
			: Infinity

	if (target <= boostStartReceiver + 1e-9) {
		return {
			maxOutput,
			eqPressure,
			processGasL: 0,
			driveAirL: 0,
			finalSupply: finalSupplyNoBoost,
			feasible: true,
		}
	}

	if (target > maxOutput) {
		return {
			maxOutput,
			eqPressure,
			processGasL: 0,
			driveAirL: 0,
			finalSupply: finalSupplyNoBoost,
			feasible: false,
			reason:
				'Target exceeds the booster stall pressure (ratio × drive pressure).',
		}
	}

	const q = vr * (target - boostStartReceiver)
	const availQ = vs * (inletStartAbs - ATM) // gas drawable down to 1 atm
	if (q > availQ + 1e-9) {
		return {
			maxOutput,
			eqPressure,
			processGasL: availQ,
			driveAirL: driveAirForQ(availQ, inletStartAbs, capAbs, vs, ratio, drivePAbs),
			finalSupply: 0,
			feasible: false,
			reason: 'Supply gas is insufficient to reach the target.',
			supplyLimitedMax: boostStartReceiver + availQ / vr,
		}
	}

	const finalInletAbs = inletStartAbs - q / vs
	const driveAirL = driveAirForQ(q, inletStartAbs, capAbs, vs, ratio, drivePAbs)
	return {
		maxOutput,
		eqPressure,
		processGasL: q,
		driveAirL,
		finalSupply: finalInletAbs - ATM,
		feasible: true,
	}
}

export function boosterFillProfile(
	input: BoosterInput,
	steps = 40,
): ProfilePoint[] {
	const { ratio, driveP, supplyVol: vs, receiverVol: vr, target } = input
	const { boostStartReceiver, inletStartAbs } = boostSetup(input)
	const drivePAbs = driveP + ATM
	const capAbs =
		input.regulatedInletBar !== undefined
			? input.regulatedInletBar + ATM
			: Infinity
	const summary = calculateBooster(input)
	const reached = summary.feasible
		? target
		: (summary.supplyLimitedMax ?? boostStartReceiver)
	if (reached <= boostStartReceiver + 1e-9) return []

	const points: ProfilePoint[] = []
	for (let i = 0; i <= steps; i++) {
		const receiverP =
			boostStartReceiver + ((reached - boostStartReceiver) * i) / steps
		const q = vr * (receiverP - boostStartReceiver)
		const inletAbs = inletStartAbs - q / vs
		const cumulativeDriveL = driveAirForQ(
			q,
			inletStartAbs,
			capAbs,
			vs,
			ratio,
			drivePAbs,
		)
		const effInletAbs = Math.min(inletAbs, capAbs)
		points.push({
			receiverP,
			cumulativeDriveL,
			supplyP: inletAbs - ATM,
			rateLPerBar: (ratio * drivePAbs * vr) / effInletAbs,
		})
	}
	return points
}
