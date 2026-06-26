import { ATMOSPHERIC_BAR } from './units'

const ATM = ATMOSPHERIC_BAR

export interface BoosterInput {
	ratio: number
	// Max drive pressure the regulator can supply (bar gauge). Sets the stall
	// ceiling: max output = ratio × this. The drive pressure actually used ramps
	// up to only what's needed (≈ receiver pressure ÷ ratio), so this is a cap,
	// not the operating pressure.
	driveP: number
	supplyVol: number
	supplyStart: number
	receiverVol: number
	receiverStart: number
	target: number
	// Two-stage: source gas is regulated down to this inlet pressure (bar gauge)
	// before the boost stage.
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
	// Drive pressure actually needed, bar gauge: ramps from driveStart (at the
	// boost start) to driveEnd (at the target) ≈ receiver pressure ÷ ratio.
	driveStart: number
	driveEnd: number
}

export interface ProfilePoint {
	receiverP: number
	cumulativeDriveL: number
	supplyP: number
	timeSeconds?: number
	// Drive pressure being used at this point (bar gauge) ≈ receiverP / ratio.
	drivePBar?: number
	cycleRatePerSec?: number
	// Drive-gas storage (buffer) pressure as a fraction of cut-out (1 = full).
	driveBufferFrac?: number
	// Net rate the storage tank is being drawn down (free L/min).
	storageDrawLpm?: number
}

export interface BoosterTiming {
	fillSeconds: number
	// True when the booster's own max throughput is below the requested fill rate,
	// so it (not the O2 rate limit) sets the fill time.
	boosterLimited: boolean
	driveAirRateLpm: number // average drive-air consumption over the fill
	cycleRatePerSec: number // operating cycle rate (≈ constant)
	driveStartBar: number
	driveEndBar: number
	dutyCycle: number // compressor on-fraction (0 if no compressor)
	dutyContinuous: boolean // compressor runs ~100% (can't keep up)
	// Storage drained to the drive pressure before the fill finished → the
	// booster stalls and waits on the compressor. null when it doesn't happen.
	stallSeconds: number | null
}

export interface TimingArgs {
	driveAirL: number
	riseBar: number // receiver pressure rise over the boost phase
	receiverVolL: number
	maxFillRateBarPerMin: number // O2 fill-rate limit
	driveSweptL: number // air-drive piston swept volume per cycle (geometric)
	maxCpm: number // booster max cycle rate
	ratio: number
	supplyAbsBar: number // representative supply (inlet) pressure, absolute
	driveStartBar: number
	driveEndBar: number
	compressorRateLpm: number
	storageL?: number
	storageMaxBar?: number
	storageMinBar?: number
}

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

// Drive air (free L) to move gas into the receiver. Per unit of gas delivered the
// drive air is receiverAbs / inletAbs: the air-drive piston runs at only the
// pressure needed to overcome the current back-pressure (driveP ≈ receiverP /
// ratio), so the geometric ratio cancels. The inlet (gas-piston intake) pressure
// is the supply, depleting as q is drawn, capped at capAbs for a two-stage
// regulated inlet. Integrated numerically (the integrand is smooth).
function driveAirForQ(
	q: number,
	boostStartAbs: number,
	inletStartAbs: number,
	capAbs: number,
	vs: number,
	vr: number,
	steps = 400,
): number {
	if (q <= 0) return 0
	const integrand = (x: number) => {
		const receiverAbs = boostStartAbs + x / vr
		const inletAbs = Math.min(inletStartAbs - x / vs, capAbs)
		return receiverAbs / inletAbs
	}
	const h = q / steps
	let sum = 0.5 * (integrand(0) + integrand(q))
	for (let i = 1; i < steps; i++) sum += integrand(i * h)
	return sum * h
}

export function calculateBooster(input: BoosterInput): BoosterResult {
	const { ratio, driveP, supplyVol: vs, receiverVol: vr, target } = input
	const maxOutput = ratio * driveP
	const { eqPressure, boostStartReceiver, inletStartAbs } = boostSetup(input)
	const finalSupplyNoBoost = inletStartAbs - ATM
	const capAbs =
		input.regulatedInletBar !== undefined
			? input.regulatedInletBar + ATM
			: Infinity
	const boostStartAbs = boostStartReceiver + ATM
	const driveStart = boostStartReceiver / ratio
	const driveEnd = target / ratio

	if (target <= boostStartReceiver + 1e-9) {
		return {
			maxOutput,
			eqPressure,
			processGasL: 0,
			driveAirL: 0,
			finalSupply: finalSupplyNoBoost,
			feasible: true,
			driveStart,
			driveEnd,
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
				'Target exceeds the booster stall pressure (ratio × max drive pressure).',
			driveStart,
			driveEnd,
		}
	}

	const q = vr * (target - boostStartReceiver)
	const availQ = vs * (inletStartAbs - ATM) // gas drawable down to 1 atm
	if (q > availQ + 1e-9) {
		return {
			maxOutput,
			eqPressure,
			processGasL: availQ,
			driveAirL: driveAirForQ(availQ, boostStartAbs, inletStartAbs, capAbs, vs, vr),
			finalSupply: 0,
			feasible: false,
			reason: 'Supply gas is insufficient to reach the target.',
			supplyLimitedMax: boostStartReceiver + availQ / vr,
			driveStart,
			driveEnd,
		}
	}

	const finalInletAbs = inletStartAbs - q / vs
	const driveAirL = driveAirForQ(q, boostStartAbs, inletStartAbs, capAbs, vs, vr)
	return {
		maxOutput,
		eqPressure,
		processGasL: q,
		driveAirL,
		finalSupply: finalInletAbs - ATM,
		feasible: true,
		driveStart,
		driveEnd,
	}
}

export function boosterTiming(args: TimingArgs): BoosterTiming | null {
	const {
		driveAirL,
		riseBar,
		receiverVolL: vr,
		maxFillRateBarPerMin: maxRate,
		driveSweptL,
		maxCpm,
		ratio,
		supplyAbsBar,
		driveStartBar,
		driveEndBar,
		compressorRateLpm: C,
	} = args
	// Need the booster's geometry + a fill-rate limit to place the fill on time.
	if (!(driveSweptL > 0) || !(maxCpm > 0) || !(maxRate > 0) || !(ratio > 0)) {
		return null
	}

	const base = {
		driveStartBar,
		driveEndBar,
		dutyCycle: 0,
		dutyContinuous: false,
		stallSeconds: null as number | null,
	}
	if (driveAirL <= 0 || riseBar <= 0) {
		return {
			...base,
			fillSeconds: 0,
			boosterLimited: false,
			driveAirRateLpm: 0,
			cycleRatePerSec: 0,
		}
	}

	// Gas delivered to the receiver per cycle (surface L): the gas piston draws a
	// gulp of supply gas (gasSwept = driveSwept / ratio) at the supply pressure.
	const gasPerCycle = (driveSweptL / ratio) * (supplyAbsBar / ATM)
	// The booster's own ceiling on fill rate (bar/min), then the actual rate is
	// the lower of that and the O2 limit.
	const boosterMaxRate =
		gasPerCycle > 0 ? (maxCpm * gasPerCycle) / vr : Infinity
	const fillRate = Math.min(maxRate, boosterMaxRate)
	const boosterLimited = boosterMaxRate < maxRate
	const fillSeconds = (riseBar / fillRate) * 60

	// cycles/sec = (gas delivered per min) / gasPerCycle / 60
	const cycleRatePerSec =
		gasPerCycle > 0 ? (vr * fillRate) / gasPerCycle / 60 : 0
	const driveAirRateLpm = (driveAirL / fillSeconds) * 60

	const hasCompressor = C > 0
	let dutyCycle = 0
	let dutyContinuous = false
	let stallSeconds: number | null = null
	if (hasCompressor) {
		dutyCycle = Math.min(1, driveAirRateLpm / C)
		dutyContinuous = C < driveAirRateLpm
		// Storage must cover the deficit. The usable buffer is the gas between
		// cut-out and the (highest) drive pressure needed; once the tank bleeds to
		// the drive pressure the regulator can't hold it and the booster stalls.
		const hasBuffer =
			!!args.storageL && args.storageMaxBar != null && args.storageMinBar != null
		if (dutyContinuous && hasBuffer) {
			const buffer = Math.max(0, args.storageL! * (args.storageMaxBar! - driveEndBar))
			const deficit = driveAirRateLpm - C
			const drainSeconds = deficit > 0 ? (buffer / deficit) * 60 : Infinity
			if (drainSeconds < fillSeconds) stallSeconds = drainSeconds
		}
	}

	return {
		...base,
		fillSeconds,
		boosterLimited,
		driveAirRateLpm,
		cycleRatePerSec,
		dutyCycle,
		dutyContinuous,
		stallSeconds,
	}
}

export function boosterFillProfile(
	input: BoosterInput,
	steps = 40,
	timing?: TimingArgs,
): ProfilePoint[] {
	const { ratio, supplyVol: vs, receiverVol: vr, target } = input
	const { boostStartReceiver, inletStartAbs } = boostSetup(input)
	const boostStartAbs = boostStartReceiver + ATM
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
	const C = timing?.compressorRateLpm ?? 0
	const storageL = timing?.storageL ?? 0
	const cutout = timing?.storageMaxBar ?? 0
	const hasBuffer = !!(tm && storageL > 0 && cutout > 0 && C > 0)
	// Fill rate is constant, so time is linear in the receiver-pressure rise.
	const fillSeconds = tm?.fillSeconds ?? 0
	const rise = reached - boostStartReceiver

	const points: ProfilePoint[] = []
	let prevDrive = 0
	let prevTime = 0
	for (let i = 0; i <= steps; i++) {
		const receiverP = boostStartReceiver + (rise * i) / steps
		const q = vr * (receiverP - boostStartReceiver)
		const inletAbs = inletStartAbs - q / vs
		const cumulativeDriveL = driveAirForQ(
			q,
			boostStartAbs,
			inletStartAbs,
			capAbs,
			vs,
			vr,
		)
		const point: ProfilePoint = {
			receiverP,
			cumulativeDriveL,
			supplyP: inletAbs - ATM,
		}
		if (tm) {
			const timeSeconds = rise > 0 ? (fillSeconds * (receiverP - boostStartReceiver)) / rise : 0
			point.timeSeconds = timeSeconds
			point.drivePBar = receiverP / ratio
			point.cycleRatePerSec = tm.cycleRatePerSec
			if (hasBuffer) {
				// Storage runs continuously: content = full + compressor in − booster out.
				const minutes = timeSeconds / 60
				const storageGas = storageL * cutout + C * minutes - cumulativeDriveL
				point.driveBufferFrac = Math.max(0, Math.min(1, storageGas / (storageL * cutout)))
				// Net draw rate from storage = booster draw − compressor (≥ 0).
				const dDrive = cumulativeDriveL - prevDrive
				const dt = timeSeconds - prevTime
				const boosterDrawLpm = dt > 0 ? (dDrive / dt) * 60 : 0
				point.storageDrawLpm = Math.max(0, boosterDrawLpm - C)
			}
			prevDrive = cumulativeDriveL
			prevTime = timeSeconds
		}
		points.push(point)
	}
	return points
}
