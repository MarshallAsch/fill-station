import { describe, it, expect } from 'vitest'
import {
	settledPressureBar,
	hotTargetBar,
	applyOverfill,
	removeOverfill,
} from './temperature'

describe('temperature (hot fill cools)', () => {
	it('a hot fill settles to a lower pressure when it cools', () => {
		const cold = settledPressureBar(200, 40, 20)
		expect(cold).toBeLessThan(200)
		// Gay-Lussac on absolute: (200+1.013)*(293.15/313.15)-1.013
		expect(cold).toBeCloseTo((201.013 * 293.15) / 313.15 - 1.01325, 2)
	})
	it('hotTarget is the inverse of settledPressure', () => {
		const hot = hotTargetBar(200, 40, 20)
		expect(settledPressureBar(hot, 40, 20)).toBeCloseTo(200, 4)
	})
	it('no change when fill and settled temps are equal', () => {
		expect(settledPressureBar(200, 25, 25)).toBeCloseTo(200, 6)
	})
	it('overfill round-trips', () => {
		expect(removeOverfill(applyOverfill(200, 10), 10)).toBeCloseTo(200, 6)
		expect(applyOverfill(200, 10)).toBeCloseTo(220, 6)
	})
})
