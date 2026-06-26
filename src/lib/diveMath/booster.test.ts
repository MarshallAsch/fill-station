import { describe, it, expect } from 'vitest'
import { calculateBooster, boosterFillProfile, BoosterInput } from './booster'

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
		expect(last.rateLPerBar).toBeGreaterThan(first.rateLPerBar)
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
