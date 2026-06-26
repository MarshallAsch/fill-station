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
	// Drive-gas buffer (storage) pressure as a fraction of cut-out (1 = full at
	// the start). Present only when storage + compressor data is supplied.
	driveBufferFrac?: number
	// Net rate the storage tank is being drawn down (free L/min): driveMax while
	// the compressor is off, the deficit while it's on, ~0 once it keeps up or
	// the booster stalls. Present only with storage + compressor data.
	storageDrawLpm?: number
}

export interface BoosterTiming {
	totalCycles: number
	fillSeconds: number
	// The booster runs at full speed (driveMax) while the buffer holds above the
	// drive pressure, then is compressor-limited after it stalls.
	fastSeconds: number
	slowSeconds: number
	cycleRateFast: number
	cycleRateSlow: number
	// Event markers, seconds from booster start (after equalization); null when
	// the event doesn't occur during this fill:
	compressorStartSeconds: number | null // compressor kicks on (buffer → cut-in)
	stallSeconds: number | null // booster stalls (buffer → drive pressure)
	dutyCycle: number
	dutyContinuous: boolean
	// Compressor on/off cycle in the keeps-up case (0 otherwise): the run time to
	// refill the buffer cut-in→cut-out, and the idle time as the booster drains
	// it back cut-out→cut-in.
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

interface BufferTimeline {
	hasBuffer: boolean
	keepsUp: boolean
	storageL: number
	cutout: number
	cutin: number // effective: clamped to ≥ drive pressure
	floor: number // drive pressure
	dToCutin: number // free L of drive air consumed when the buffer reaches cut-in
	dToStall: number // free L of drive air consumed when the buffer reaches drive pressure
}

// The drive-gas timeline as a function of cumulative drive air. The buffer
// starts full (cut-out); the booster draws it down at driveMax with the
// compressor off; the compressor kicks on at cut-in; if it can't keep up the
// buffer keeps falling to the drive pressure, where the booster stalls and the
// fill becomes compressor-limited.
function bufferTimeline(args: TimingArgs): BufferTimeline {
	const DM = args.driveMaxLpm
	const C = args.compressorRateLpm
	const hasCompressor = C > 0
	const hasBuffer =
		!!args.storageL &&
		args.storageMaxBar != null &&
		args.storageMinBar != null &&
		args.drivePBar != null
	const storageL = args.storageL ?? 0
	const cutout = args.storageMaxBar ?? 0
	const floor = args.drivePBar ?? 0
	// Drive pressure must sit below cut-in for the compressor to refill before the
	// booster stalls; clamp so a misconfigured cut-in degrades gracefully.
	const cutin = Math.max(args.storageMinBar ?? 0, floor)
	const keepsUp = hasCompressor && C >= DM
	const dToCutin = hasBuffer ? Math.max(0, storageL * (cutout - cutin)) : Infinity
	let dToStall = Infinity
	if (hasCompressor && !keepsUp) {
		if (hasBuffer) {
			const onDrain = Math.max(0, storageL * (cutin - floor))
			dToStall = dToCutin + (DM / (DM - C)) * onDrain
		} else {
			dToStall = 0 // no reservoir → compressor-limited from the start
		}
	}
	return { hasBuffer, keepsUp, storageL, cutout, cutin, floor, dToCutin, dToStall }
}

export function boosterTiming(args: TimingArgs): BoosterTiming | null {
	const {
		driveAirL: D,
		vdPerCycleL: vd,
		driveMaxLpm: DM,
		compressorRateLpm: C,
	} = args
	// Per-cycle volume and max consumption are enough to place the fill on a time
	// axis (the booster runs at driveMax). Compressor data is optional — it only
	// refines the fill into a full-speed phase + a compressor-limited phase and
	// adds the duty / stall / on-off markers.
	if (!(vd > 0) || !(DM > 0)) {
		return null
	}
	const hasCompressor = C > 0
	const rate = (lpm: number) => lpm / vd / 60
	const cycleRateFast = rate(DM)
	const cycleRateSlow = hasCompressor ? rate(C) : 0
	const totalCycles = D / vd

	if (D <= 0) {
		return {
			totalCycles: 0,
			fillSeconds: 0,
			fastSeconds: 0,
			slowSeconds: 0,
			cycleRateFast,
			cycleRateSlow,
			compressorStartSeconds: null,
			stallSeconds: null,
			dutyCycle: 0,
			dutyContinuous: false,
			compressorOnSeconds: 0,
			compressorOffSeconds: 0,
		}
	}

	const bt = bufferTimeline(args)
	const { dToCutin, dToStall, keepsUp, hasBuffer } = bt

	// Time to consume d free L of drive air: at driveMax until the booster stalls,
	// then at the compressor rate (C > 0 whenever dToStall is finite).
	const tOf = (d: number): number =>
		d <= dToStall
			? (d / DM) * 60
			: (dToStall / DM) * 60 + ((d - dToStall) / C) * 60
	const fillSeconds = tOf(D)
	const stalls = Number.isFinite(dToStall) && dToStall < D
	const stallSeconds = stalls ? (dToStall / DM) * 60 : null
	const fastSeconds = stalls ? stallSeconds! : fillSeconds
	const slowSeconds = fillSeconds - fastSeconds

	let compressorStartSeconds: number | null = null
	if (hasCompressor) {
		if (!hasBuffer) compressorStartSeconds = 0
		else if (dToCutin < D) compressorStartSeconds = (dToCutin / DM) * 60
	}

	// Keeps-up on/off cycle: the buffer between cut-in and cut-out drains at the
	// booster draw (off) and refills at the surplus (on).
	const cycBuffer =
		keepsUp && hasBuffer ? Math.max(0, bt.storageL * (bt.cutout - bt.cutin)) : 0
	const surplus = C - DM
	const compressorOffSeconds = cycBuffer > 0 ? (cycBuffer / DM) * 60 : 0
	const compressorOnSeconds =
		cycBuffer > 0 && surplus > 0 ? (cycBuffer / surplus) * 60 : 0

	return {
		totalCycles,
		fillSeconds,
		fastSeconds,
		slowSeconds,
		cycleRateFast,
		cycleRateSlow,
		compressorStartSeconds,
		stallSeconds,
		dutyCycle: keepsUp ? DM / C : hasCompressor ? 1 : 0,
		dutyContinuous: hasCompressor && !keepsUp,
		compressorOnSeconds,
		compressorOffSeconds,
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
	const bt = timing ? bufferTimeline(timing) : null
	const DM = timing?.driveMaxLpm ?? 0
	const C = timing?.compressorRateLpm ?? 0
	const showBuffer = !!(bt?.hasBuffer && C > 0)

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
		if (tm && timing && bt) {
			const d = cumulativeDriveL
			const { dToCutin, dToStall, cutout, cutin, floor } = bt
			point.cumulativeCycles = d / timing.vdPerCycleL
			point.timeSeconds =
				d <= dToStall
					? (d / DM) * 60
					: (dToStall / DM) * 60 + ((d - dToStall) / C) * 60
			point.cycleRatePerSec =
				d <= dToStall ? tm.cycleRateFast : tm.cycleRateSlow
			if (showBuffer) {
				let bufP: number
				if (d <= dToCutin) {
					bufP = cutout - d / bt.storageL
				} else if (d <= dToStall) {
					const span = dToStall - dToCutin
					const frac = span > 0 ? (d - dToCutin) / span : 1
					bufP = cutin - frac * (cutin - floor)
				} else {
					bufP = floor
				}
				point.driveBufferFrac = cutout > 0 ? bufP / cutout : 0
				point.storageDrawLpm =
					d <= dToCutin ? DM : d <= dToStall ? Math.max(0, DM - C) : 0
			}
		}
		points.push(point)
	}
	return points
}
