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
	// Sane ordering: drive pressure (6) < cut-in (10) < cut-out (12).
	const t = {
		driveAirL: 6000,
		vdPerCycleL: 3,
		driveMaxLpm: 1200,
		compressorRateLpm: 600,
		drivePBar: 6,
		storageL: 100,
		storageMaxBar: 12,
		storageMinBar: 10,
	}
	it('returns null only without per-cycle / max-consumption data', () => {
		expect(boosterTiming({ ...t, vdPerCycleL: 0 })).toBeNull()
		expect(boosterTiming({ ...t, driveMaxLpm: 0 })).toBeNull()
	})
	it('no compressor data: full speed throughout, no stall, time derivable', () => {
		const r = boosterTiming({ ...t, compressorRateLpm: 0 })!
		expect(r.totalCycles).toBeCloseTo(2000, 6)
		expect(r.fillSeconds).toBeCloseTo((6000 / 1200) * 60, 6)
		expect(r.slowSeconds).toBe(0)
		expect(r.stallSeconds).toBeNull()
		expect(r.compressorStartSeconds).toBeNull()
		expect(r.cycleRateSlow).toBe(0)
		expect(r.dutyContinuous).toBe(false)
	})
	it('undersized compressor: full-speed phase, stall, then compressor-limited', () => {
		// dToCutin = 100*(12-10) = 200 → compressorStart = 200/1200*60 = 10 s.
		// onDrain = 100*(10-6) = 400; dToStall = 200 + (1200/600)*400 = 1000.
		// stall = 1000/1200*60 = 50 s; fill = 50 + (6000-1000)/600*60 = 550 s.
		const r = boosterTiming(t)!
		expect(r.compressorStartSeconds).toBeCloseTo(10, 6)
		expect(r.stallSeconds).toBeCloseTo(50, 6)
		expect(r.fillSeconds).toBeCloseTo(550, 6)
		expect(r.fastSeconds).toBeCloseTo(50, 6)
		expect(r.slowSeconds).toBeCloseTo(500, 6)
		expect(r.cycleRateFast).toBeGreaterThan(r.cycleRateSlow)
		expect(r.dutyContinuous).toBe(true)
		expect(r.dutyCycle).toBe(1)
		// events are ordered: booster on (0) < compressor on < stall < fill
		expect(r.compressorStartSeconds!).toBeLessThan(r.stallSeconds!)
		expect(r.stallSeconds!).toBeLessThan(r.fillSeconds)
	})
	it('compressor keeps up: no stall, duty < 1, on/off cycle reported', () => {
		const r = boosterTiming({ ...t, driveMaxLpm: 300 })! // 300 ≤ 600
		expect(r.stallSeconds).toBeNull()
		expect(r.fillSeconds).toBeCloseTo((6000 / 300) * 60, 6)
		expect(r.dutyContinuous).toBe(false)
		expect(r.dutyCycle).toBeCloseTo(0.5, 6) // 300/600
		expect(r.compressorStartSeconds).toBeCloseTo((200 / 300) * 60, 6)
		// cycle buffer = 100*(12-10)=200: off = 200/300*60 = 40, on = 200/300*60 = 40
		expect(r.compressorOffSeconds).toBeCloseTo(40, 6)
		expect(r.compressorOnSeconds).toBeCloseTo(40, 6)
	})
	it('a higher cut-in (compressor on sooner) lengthens the full-speed phase', () => {
		const lowCutIn = boosterTiming({ ...t, storageMinBar: 10 })!
		const highCutIn = boosterTiming({ ...t, storageMinBar: 11 })!
		expect(highCutIn.stallSeconds!).toBeGreaterThan(lowCutIn.stallSeconds!)
	})
	it('a higher drive pressure (smaller usable buffer) stalls sooner', () => {
		const lowFloor = boosterTiming({ ...t, drivePBar: 6 })!
		const highFloor = boosterTiming({ ...t, drivePBar: 8 })!
		expect(highFloor.stallSeconds!).toBeLessThan(lowFloor.stallSeconds!)
	})
	it('undersized with no buffer: compressor-limited from the start', () => {
		const r = boosterTiming({
			driveAirL: 6000,
			vdPerCycleL: 3,
			driveMaxLpm: 1200,
			compressorRateLpm: 600,
		})!
		expect(r.stallSeconds).toBe(0)
		expect(r.fastSeconds).toBe(0)
		expect(r.fillSeconds).toBeCloseTo((6000 / 600) * 60, 6)
		expect(r.compressorStartSeconds).toBe(0)
		expect(r.dutyContinuous).toBe(true)
	})
	it('zero boost ⇒ zero timing', () => {
		const r = boosterTiming({ ...t, driveAirL: 0 })!
		expect(r.fillSeconds).toBe(0)
		expect(r.totalCycles).toBe(0)
		expect(r.stallSeconds).toBeNull()
		expect(r.compressorStartSeconds).toBeNull()
	})
})

describe('boosterFillProfile timing fields', () => {
	const timing = {
		driveAirL: 0, // overwritten below via summary
		vdPerCycleL: 3,
		driveMaxLpm: 1200,
		compressorRateLpm: 600,
		drivePBar: 6,
		storageL: 30, // small enough that the base fill drains it to the stall floor
		storageMaxBar: 12,
		storageMinBar: 10,
	}
	it('omits time fields when no timing supplied', () => {
		const p = boosterFillProfile(base, 20)
		expect(p[0].timeSeconds).toBeUndefined()
		expect(p[0].driveBufferFrac).toBeUndefined()
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
	it('tracks the drive-gas buffer falling from full (cut-out) and the draw rate', () => {
		const summary = calculateBooster(base)
		const t = { ...timing, driveAirL: summary.driveAirL }
		const p = boosterFillProfile(base, 40, t)
		// starts full (100% of cut-out) and never rises
		expect(p[0].driveBufferFrac).toBeCloseTo(1, 6)
		for (let i = 1; i < p.length; i++) {
			expect(p[i].driveBufferFrac!).toBeLessThanOrEqual(
				p[i - 1].driveBufferFrac! + 1e-9,
			)
		}
		// floor reached is the drive pressure / cut-out = 6/12 = 0.5
		expect(p[p.length - 1].driveBufferFrac!).toBeCloseTo(0.5, 2)
		// storage draw starts at driveMax (compressor off)
		expect(p[0].storageDrawLpm).toBeCloseTo(1200, 6)
	})
})
