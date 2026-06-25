import { describe, it, expect } from 'vitest'
import { bestFo2, bestFhe, bestMix } from './bestMix'

describe('bestFo2', () => {
	it('gives 0.35 for 30 m salt at ppO2 1.4', () => {
		expect(bestFo2({ depthM: 30, ppo2: 1.4, water: 'salt' })).toBeCloseTo(0.35, 4)
	})
	it('clamps to 1.0 in shallow water', () => {
		expect(bestFo2({ depthM: 3, ppo2: 1.4, water: 'salt' })).toBe(1)
	})
	it('is deeper-leaner: fresh gives a richer mix than salt at the same depth', () => {
		const salt = bestFo2({ depthM: 30, ppo2: 1.4, water: 'salt' })
		const fresh = bestFo2({ depthM: 30, ppo2: 1.4, water: 'fresh' })
		expect(fresh).toBeGreaterThan(salt)
	})
})

describe('bestFhe', () => {
	it('caps END at 30 m for a 60 m dive (salt)', () => {
		expect(bestFhe({ depthM: 60, targetEndM: 30, water: 'salt' })).toBeCloseTo(
			0.4286,
			3,
		)
	})
	it('returns 0 when the target END is at or beyond the depth', () => {
		expect(bestFhe({ depthM: 30, targetEndM: 30, water: 'salt' })).toBe(0)
	})
})

describe('bestMix', () => {
	it('returns fhe 0 when no END target is given', () => {
		const m = bestMix({ depthM: 30, ppo2: 1.4, water: 'salt' })
		expect(m.fhe).toBe(0)
		expect(m.fo2).toBeCloseTo(0.35, 4)
		expect(m.fn2).toBeCloseTo(0.65, 4)
	})
	it('fractions sum to 1', () => {
		const m = bestMix({ depthM: 60, ppo2: 1.4, targetEndM: 30, water: 'salt' })
		expect(m.fo2 + m.fhe + m.fn2).toBeCloseTo(1, 6)
	})
})
