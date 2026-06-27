import { describe, it, expect } from 'vitest'
import {
	settledPressureBar,
	hotTargetBar,
	applyOverfill,
	removeOverfill,
	tempRiseC,
	effectiveHotFillBar,
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

describe('tempRiseC', () => {
	it('is 0 at zero or negative fill rate', () => {
		expect(tempRiseC(0)).toBe(0)
		expect(tempRiseC(-5)).toBe(0)
	})
	it('is linear in fill rate (0.7 °C per bar/min)', () => {
		expect(tempRiseC(20)).toBeCloseTo(14, 6)
		expect(tempRiseC(40)).toBeCloseTo(28, 6)
	})
})

describe('effectiveHotFillBar', () => {
	const t = { mode: 'off' as const, overfillPct: 10, fillTempC: 40, settledTempC: 20 }
	it('is identity when off', () => {
		expect(effectiveHotFillBar(200, t)).toBe(200)
	})
	it('applies overfill in simple mode', () => {
		expect(effectiveHotFillBar(200, { ...t, mode: 'simple' })).toBeCloseTo(220, 6)
	})
	it('uses Gay-Lussac in detailed mode (hot > cold when fill warmer)', () => {
		const hot = effectiveHotFillBar(200, { ...t, mode: 'detailed' })
		expect(hot).toBeGreaterThan(200)
		// matches hotTargetBar(200, 40, 20)
		expect(hot).toBeCloseTo((201.013 * 313.15) / 293.15 - 1.01325, 2)
	})
})
