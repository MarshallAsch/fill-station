import { describe, it, expect } from 'vitest'
import { mixTwoGases } from './gasMixing'

describe('mixTwoGases', () => {
	it('combines equal pressures of air and EAN36 to ~EAN28.5', () => {
		const r = mixTwoGases(
			{ pressure: 100, fo2: 0.21, fhe: 0 },
			{ pressure: 100, fo2: 0.36, fhe: 0 },
		)
		expect(r.pressure).toBe(200)
		expect(r.fo2).toBeCloseTo(0.285, 4)
		expect(r.fhe).toBe(0)
	})
	it('dilutes helium when topping trimix with air', () => {
		const r = mixTwoGases(
			{ pressure: 100, fo2: 0.18, fhe: 0.45 },
			{ pressure: 100, fo2: 0.21, fhe: 0 },
		)
		expect(r.fhe).toBeCloseTo(0.225, 4)
		expect(r.fo2).toBeCloseTo(0.195, 4)
	})
	it('returns the other gas mix when one side has zero pressure', () => {
		const r = mixTwoGases(
			{ pressure: 0, fo2: 0.21, fhe: 0 },
			{ pressure: 150, fo2: 0.32, fhe: 0 },
		)
		expect(r.pressure).toBe(150)
		expect(r.fo2).toBeCloseTo(0.32, 4)
	})
	it('returns an empty result when both pressures are zero', () => {
		const r = mixTwoGases(
			{ pressure: 0, fo2: 0.5, fhe: 0.1 },
			{ pressure: 0, fo2: 0.32, fhe: 0 },
		)
		expect(r).toEqual({ pressure: 0, fo2: 0.5, fhe: 0.1 })
	})
})
