import { describe, it, expect } from 'vitest'
import {
	calculateBooster,
	boosterFillProfile,
	boosterTiming,
	BoosterInput,
} from './booster'

const base: BoosterInput = {
	ratio: 30,
	driveP: 10,
	supplyVol: 50,
	supplyStart: 200,
	receiverVol: 12,
	receiverStart: 50,
	target: 200,
}

describe('calculateBooster', () => {
	it('equalizes a high supply into the receiver before boosting', () => {
		const r = calculateBooster(base)
		// P_eq ≈ ((50*201.013)+(12*51.013))/62 − 1.013 ≈ 170.97 bar gauge
		expect(r.eqPressure).toBeCloseTo(170.97, 1)
		expect(r.feasible).toBe(true)
	})
	it('reports drive air via the log-integral (hand-checked ≈ 683 L)', () => {
		const r = calculateBooster(base)
		expect(r.driveAirL).toBeGreaterThan(680)
		expect(r.driveAirL).toBeLessThan(686)
		expect(r.processGasL).toBeCloseTo(348.4, 0)
	})
	it('needs no boost when equalization already reaches target', () => {
		const r = calculateBooster({ ...base, target: 150 })
		expect(r.driveAirL).toBe(0)
		expect(r.feasible).toBe(true)
	})
	it('is infeasible when the target exceeds stall pressure (ratio×drive)', () => {
		const r = calculateBooster({ ...base, target: 350 }) // max = 30×10 = 300
		expect(r.feasible).toBe(false)
		expect(r.reason).toBeTruthy()
		expect(r.maxOutput).toBe(300)
	})
	it('flags a supply-limited fill and reports the reachable max', () => {
		// tiny supply: 2 L from 200 bar can't fill 12 L to 280 bar
		const r = calculateBooster({
			...base,
			supplyVol: 2,
			receiverStart: 0,
			target: 280,
		})
		expect(r.feasible).toBe(false)
		expect(r.supplyLimitedMax).toBeGreaterThan(0)
		expect(r.supplyLimitedMax).toBeLessThan(280)
	})
})

describe('boosterFillProfile', () => {
	it('rises monotonically and ends at the summary drive-air total', () => {
		const profile = boosterFillProfile(base, 40)
		const summary = calculateBooster(base)
		expect(profile.length).toBe(41)
		expect(profile[0].cumulativeDriveL).toBeCloseTo(0, 6)
		for (let i = 1; i < profile.length; i++) {
			expect(profile[i].cumulativeDriveL).toBeGreaterThanOrEqual(
				profile[i - 1].cumulativeDriveL,
			)
		}
		const last = profile[profile.length - 1]
		expect(last.cumulativeDriveL).toBeCloseTo(summary.driveAirL, 2)
		expect(last.receiverP).toBeCloseTo(base.target, 6)
	})
	it('shows supply pressure falling and drive-rate rising as supply depletes', () => {
		const profile = boosterFillProfile(base, 20)
		const first = profile[0]
		const last = profile[profile.length - 1]
		expect(last.supplyP).toBeLessThan(first.supplyP)
	})
	it('returns an empty profile when no boost is needed', () => {
		expect(boosterFillProfile({ ...base, target: 150 })).toEqual([])
	})
	it('supply-limited: non-empty profile, supply drawn to atmospheric, cumulative drive matches summary', () => {
		const input = { ...base, supplyVol: 2, receiverStart: 0, target: 280 }
		const profile = boosterFillProfile(input, 40)
		const summary = calculateBooster(input)
		expect(profile.length).toBeGreaterThan(0)
		const last = profile[profile.length - 1]
		expect(last.cumulativeDriveL).toBeCloseTo(summary.driveAirL, 2)
		expect(last.supplyP).toBeCloseTo(0, 1)
	})
})

describe('two-stage (regulated inlet cap)', () => {
	it('matches single-stage when the cap is at/above the equalized supply', () => {
		const single = calculateBooster(base)
		const capped = calculateBooster({ ...base, regulatedInletBar: 1000 })
		expect(capped.driveAirL).toBeCloseTo(single.driveAirL, 6)
	})
	it('uses different drive air than single-stage with a low regulated inlet', () => {
		// a low cap means the falling-inlet (log) penalty is replaced by a
		// constant low inlet for the early part — but the constant term uses the
		// low cap as the divisor; check it differs and is finite/positive
		const single = calculateBooster(base)
		const capped = calculateBooster({ ...base, regulatedInletBar: 60 })
		expect(capped.feasible).toBe(true)
		expect(capped.driveAirL).toBeGreaterThan(0)
		expect(capped.driveAirL).not.toBeCloseTo(single.driveAirL, 1)
	})
	it('hand-checked capped value (cap below equalized supply)', () => {
		// base: ratio 30, drive 10, Vs 50, supplyStart 200, Vr 12,
		// receiverStart 50, target 200. eqAbs ≈ 171.98, boostStart ≈ 170.97,
		// Q = 12*(200−170.97) ≈ 348.39. cap = 60 bar → capAbs ≈ 61.013.
		// qStar = 50*(171.98−61.013) ≈ 5548 > Q ⇒ whole boost is constant-inlet:
		// drive = 30*11.013*348.39/61.013 ≈ 1885 L
		const r = calculateBooster({ ...base, regulatedInletBar: 60 })
		expect(r.driveAirL).toBeGreaterThan(1850)
		expect(r.driveAirL).toBeLessThan(1920)
	})
})

describe('boosterTiming', () => {
	const t = {
		driveAirL: 6000,
		vdPerCycleL: 3,
		driveMaxLpm: 300,
		compressorRateLpm: 600,
		drivePBar: 8,
		storageL: 100,
		storageMaxBar: 12,
		storageMinBar: 8,
	}
	it('returns null without the required data', () => {
		expect(boosterTiming({ ...t, vdPerCycleL: 0 })).toBeNull()
		expect(boosterTiming({ ...t, compressorRateLpm: 0 })).toBeNull()
	})
	it('compressor keeps up: single phase, duty < 1', () => {
		const r = boosterTiming(t)! // driveMax 300 ≤ compressor 600
		expect(r.totalCycles).toBeCloseTo(2000, 6) // 6000/3
		expect(r.dutyContinuous).toBe(false)
		expect(r.dutyCycle).toBeCloseTo(0.5, 6) // 300/600
		expect(r.fillSeconds).toBeCloseTo((6000 / 300) * 60, 6)
		expect(r.cycleRate1).toBeCloseTo(300 / 3 / 60, 6)
	})
	it('keeps-up: reports the compressor on/off cycle from cut-in↔cut-out', () => {
		// cycle buffer = 100*(12-8) = 400 free L.
		// off (compressor idle, booster drains): 400/300*60 = 80 s
		// on (compressor refills while feeding booster): 400/(600-300)*60 = 80 s
		const r = boosterTiming(t)!
		expect(r.compressorOffSeconds).toBeCloseTo(80, 6)
		expect(r.compressorOnSeconds).toBeCloseTo(80, 6)
		// duty derived from on/off matches driveMax/compressor
		expect(
			r.compressorOnSeconds / (r.compressorOnSeconds + r.compressorOffSeconds),
		).toBeCloseTo(r.dutyCycle, 6)
	})
	it('buffer-limited: two phases, continuous duty, fill = p1 + p2', () => {
		const r = boosterTiming({ ...t, driveMaxLpm: 1200 })! // > compressor 600
		expect(r.dutyContinuous).toBe(true)
		expect(r.dutyCycle).toBe(1)
		expect(r.fillSeconds).toBeCloseTo(r.phase1Seconds + r.phase2Seconds, 6)
		expect(r.phase1Seconds).toBeGreaterThan(0)
		expect(r.phase2Seconds).toBeGreaterThan(0)
		expect(r.cycleRate1).toBeGreaterThan(r.cycleRate2)
		// no compressor on/off cycling in the continuous phase
		expect(r.compressorOnSeconds).toBe(0)
		expect(r.compressorOffSeconds).toBe(0)
	})
	it('buffer-limited: floor is the drive pressure, not the compressor cut-in', () => {
		// higher drive pressure ⇒ smaller usable buffer above it ⇒ shorter fast phase
		const lowFloor = boosterTiming({ ...t, driveMaxLpm: 1200, drivePBar: 8 })!
		const highFloor = boosterTiming({ ...t, driveMaxLpm: 1200, drivePBar: 10 })!
		expect(highFloor.phase1Seconds).toBeLessThan(lowFloor.phase1Seconds)
		// the compressor cut-in (storageMin) does NOT bound the buffer here
		const lowCutIn = boosterTiming({
			...t,
			driveMaxLpm: 1200,
			drivePBar: 8,
			storageMinBar: 2,
		})!
		expect(lowCutIn.phase1Seconds).toBeCloseTo(lowFloor.phase1Seconds, 6)
	})
	it('buffer-limited: drive pressure at/above cut-out leaves no buffer', () => {
		const r = boosterTiming({ ...t, driveMaxLpm: 1200, drivePBar: 12 })!
		expect(r.phase1Seconds).toBe(0)
	})
	it('zero boost ⇒ zero timing', () => {
		const r = boosterTiming({ ...t, driveAirL: 0 })!
		expect(r.fillSeconds).toBe(0)
		expect(r.totalCycles).toBe(0)
		expect(r.compressorOnSeconds).toBe(0)
		expect(r.compressorOffSeconds).toBe(0)
	})
})

describe('boosterFillProfile timing fields', () => {
	const timing = {
		driveAirL: 0, // overwritten below via summary
		vdPerCycleL: 3,
		driveMaxLpm: 1200,
		compressorRateLpm: 600,
		storageL: 100,
		storageMaxBar: 12,
		storageMinBar: 8,
	}
	it('omits time fields when no timing supplied', () => {
		const p = boosterFillProfile(base, 20)
		expect(p[0].timeSeconds).toBeUndefined()
	})
	it('attaches increasing time and cycles ending at the totals', () => {
		const summary = calculateBooster(base)
		const t = { ...timing, driveAirL: summary.driveAirL }
		const p = boosterFillProfile(base, 40, t)
		const tm = boosterTiming(t)!
		expect(p[0].timeSeconds).toBeCloseTo(0, 6)
		for (let i = 1; i < p.length; i++) {
			expect(p[i].timeSeconds!).toBeGreaterThanOrEqual(p[i - 1].timeSeconds!)
		}
		expect(p[p.length - 1].timeSeconds!).toBeCloseTo(tm.fillSeconds, 1)
		expect(p[p.length - 1].cumulativeCycles!).toBeCloseTo(tm.totalCycles, 1)
	})
})
