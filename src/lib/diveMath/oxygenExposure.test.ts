import { describe, it, expect } from 'vitest'
import {
	cnsLimitMinutes,
	segmentCns,
	segmentOtu,
	computeDay,
} from './oxygenExposure'

describe('cnsLimitMinutes', () => {
	it('matches the NOAA table at exact points', () => {
		expect(cnsLimitMinutes(1.4)).toBe(150)
		expect(cnsLimitMinutes(1.6)).toBe(45)
	})
	it('interpolates between table rows', () => {
		expect(cnsLimitMinutes(1.35)).toBeCloseTo(165, 0)
	})
	it('has no limit below 0.6', () => {
		expect(cnsLimitMinutes(0.5)).toBe(Infinity)
	})
})

describe('segmentCns / segmentOtu', () => {
	it('computes CNS percent from time and limit', () => {
		expect(segmentCns({ ppo2: 1.4, minutes: 100 })).toBeCloseTo(66.67, 1)
	})
	it('computes OTU from the REPEX power law', () => {
		expect(segmentOtu({ ppo2: 1.4, minutes: 100 })).toBeCloseTo(162.88, 1)
	})
	it('accrues no OTU at or below ppO2 0.5', () => {
		expect(segmentOtu({ ppo2: 0.5, minutes: 60 })).toBe(0)
	})
})

describe('computeDay', () => {
	it('sums a single dive', () => {
		const r = computeDay([{ type: 'dive', ppo2: 1.4, minutes: 75 }])
		expect(r.peakCnsPercent).toBeCloseTo(50, 1)
		expect(r.endCnsPercent).toBeCloseTo(50, 1)
		expect(r.perDive).toHaveLength(1)
	})
	it('decays CNS across a surface interval (90-min half-time)', () => {
		const r = computeDay([
			{ type: 'dive', ppo2: 1.4, minutes: 75 },
			{ type: 'surface', minutes: 90 },
			{ type: 'dive', ppo2: 1.4, minutes: 75 },
		])
		// after dive1: 50; after 90-min SI: 25; after dive2: 75
		expect(r.endCnsPercent).toBeCloseTo(75, 1)
		expect(r.peakCnsPercent).toBeCloseTo(75, 1)
		// OTU is additive (no surface decay)
		expect(r.totalOtu).toBeCloseTo(2 * segmentOtu({ ppo2: 1.4, minutes: 75 }), 4)
	})
})
