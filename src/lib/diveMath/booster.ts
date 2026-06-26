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
	timeSeconds?: number
	cumulativeCycles?: number
	cycleRatePerSec?: number
}

export interface BoosterTiming {
	totalCycles: number
	fillSeconds: number
	phase1Seconds: number
	phase2Seconds: number
	cycleRate1: number
	cycleRate2: number
	dutyCycle: number
	dutyContinuous: boolean
	// Compressor on/off cycle in the keeps-up case (0 when running continuously
	// or when storage isn't specified): time the compressor runs to refill the
	// buffer from cut-in to cut-out, and the idle time as the booster drains it
	// back from cut-out to cut-in.
	compressorOnSeconds: number
	compressorOffSeconds: number
}

export interface TimingArgs {
	driveAirL: number
	vdPerCycleL: number
	driveMaxLpm: number
	compressorRateLpm: number
	// Drive (regulated) pressure feeding the booster, bar gauge. The usable
	// buffer floor: once storage bleeds down to this, the regulator can no
	// longer hold drive pressure, so buffered drive air is exhausted.
	drivePBar?: number
	storageL?: number
	storageMaxBar?: number
	// Compressor cut-in (restart) pressure, bar gauge. Bounds the on/off cycle
	// when the compressor keeps up; it does NOT bound the usable buffer during a
	// heavy fill (the compressor runs continuously and the tank drains past it
	// down to the drive pressure).
	storageMinBar?: number
}

export function boosterTiming(args: TimingArgs): BoosterTiming | null {
	const { driveAirL, vdPerCycleL, driveMaxLpm, compressorRateLpm } = args
	// Per-cycle volume and max consumption are enough to place the fill on a time
	// axis (the booster runs at driveMax). Compressor data is optional — it only
	// refines the fill into a buffered phase + a compressor-limited phase and
	// adds duty/on-off info.
	if (!(vdPerCycleL > 0) || !(driveMaxLpm > 0)) {
		return null
	}
	const hasCompressor = compressorRateLpm > 0
	const totalCycles = driveAirL / vdPerCycleL
	const cycleRate = (lpm: number) => lpm / vdPerCycleL / 60
	if (driveAirL <= 0) {
		return {
			totalCycles: 0,
			fillSeconds: 0,
			phase1Seconds: 0,
			phase2Seconds: 0,
			cycleRate1: 0,
			cycleRate2: 0,
			dutyCycle: 0,
			dutyContinuous: false,
			compressorOnSeconds: 0,
			compressorOffSeconds: 0,
		}
	}
	if (!hasCompressor || driveMaxLpm <= compressorRateLpm) {
		// Single phase: the booster runs at driveMax throughout (compressor keeps
		// up, or no compressor data — best-case continuous-supply estimate).
		const fillSeconds = (driveAirL / driveMaxLpm) * 60
		const rate = cycleRate(driveMaxLpm)
		// Compressor cycles on/off between cut-in and cut-out. The buffer between
		// those setpoints drains at the booster draw (off) and refills at the
		// net surplus (on). Undefined when storage or the gap isn't given, the
		// compressor exactly matches the booster (it never shuts off), or no
		// compressor was specified.
		const cycBuffer =
			hasCompressor &&
			args.storageL &&
			args.storageMaxBar != null &&
			args.storageMinBar != null
				? Math.max(0, args.storageL * (args.storageMaxBar - args.storageMinBar))
				: 0
		const surplus = compressorRateLpm - driveMaxLpm
		const compressorOffSeconds =
			cycBuffer > 0 ? (cycBuffer / driveMaxLpm) * 60 : 0
		const compressorOnSeconds =
			cycBuffer > 0 && surplus > 0 ? (cycBuffer / surplus) * 60 : 0
		return {
			totalCycles,
			fillSeconds,
			phase1Seconds: fillSeconds,
			phase2Seconds: 0,
			cycleRate1: rate,
			cycleRate2: rate,
			dutyCycle: hasCompressor ? driveMaxLpm / compressorRateLpm : 0,
			dutyContinuous: false,
			compressorOnSeconds,
			compressorOffSeconds,
		}
	}
	// Buffer-limited: the compressor runs continuously and the storage tank
	// drains from cut-out down to the drive pressure (the floor where the
	// regulator can no longer hold drive pressure) — not down to the cut-in.
	const buffer =
		args.storageL && args.storageMaxBar != null && args.drivePBar != null
			? Math.max(0, args.storageL * (args.storageMaxBar - args.drivePBar))
			: 0
	const bufferDrainSec =
		buffer > 0 ? (buffer / (driveMaxLpm - compressorRateLpm)) * 60 : 0
	const fillAtMaxSec = (driveAirL / driveMaxLpm) * 60
	const phase1Seconds = Math.min(bufferDrainSec, fillAtMaxSec)
	const driveP1 = (driveMaxLpm * phase1Seconds) / 60
	const remaining = Math.max(0, driveAirL - driveP1)
	const phase2Seconds =
		remaining > 0 ? (remaining / compressorRateLpm) * 60 : 0
	return {
		totalCycles,
		fillSeconds: phase1Seconds + phase2Seconds,
		phase1Seconds,
		phase2Seconds,
		cycleRate1: cycleRate(driveMaxLpm),
		cycleRate2: cycleRate(compressorRateLpm),
		dutyCycle: 1,
		dutyContinuous: true,
		compressorOnSeconds: 0,
		compressorOffSeconds: 0,
	}
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
	timing?: TimingArgs,
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

	const tm = timing ? boosterTiming(timing) : null
	const driveP1 = tm ? (timing!.driveMaxLpm * tm.phase1Seconds) / 60 : 0

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
		const point: ProfilePoint = {
			receiverP,
			cumulativeDriveL,
			supplyP: inletAbs - ATM,
		}
		if (tm) {
			const d = cumulativeDriveL
			point.cumulativeCycles = d / timing!.vdPerCycleL
			point.timeSeconds =
				d <= driveP1
					? (d / timing!.driveMaxLpm) * 60
					: tm.phase1Seconds + ((d - driveP1) / timing!.compressorRateLpm) * 60
			point.cycleRatePerSec = d <= driveP1 ? tm.cycleRate1 : tm.cycleRate2
		}
		points.push(point)
	}
	return points
}
