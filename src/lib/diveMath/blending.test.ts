import { describe, it, expect } from 'vitest'
import { calculateBlend } from './blending'

describe('calculateBlend', () => {
	it('blends EAN32 from empty (nitrox, no helium)', () => {
		const r = calculateBlend({
			startPressure: 0,
			startFo2: 0.209,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.32,
			targetFhe: 0,
		})
		expect(r.feasible).toBe(true)
		expect(r.pHe).toBeCloseTo(0, 6)
		// pO2 = (0.32*200 - 0.209*0 - 0.209*(200)) / 0.791
		expect(r.pO2).toBeCloseTo(28.07, 1)
		expect(r.addO2To).toBeCloseTo(28.07, 1)
		expect(r.topTo).toBeCloseTo(200, 6)
	})

	it('blends trimix 18/45 from empty', () => {
		const r = calculateBlend({
			startPressure: 0,
			startFo2: 0.209,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.18,
			targetFhe: 0.45,
		})
		expect(r.feasible).toBe(true)
		expect(r.pHe).toBeCloseTo(90, 6)
		expect(r.addHeTo).toBeCloseTo(90, 6)
		expect(r.pO2).toBeCloseTo(16.46, 1)
		expect(r.addO2To).toBeCloseTo(106.46, 1)
		expect(r.pTop).toBeCloseTo(93.54, 1)
	})

	it('the three additions sum to the pressure delta', () => {
		const r = calculateBlend({
			startPressure: 50,
			startFo2: 0.209,
			startFhe: 0,
			finalPressure: 230,
			targetFo2: 0.3,
			targetFhe: 0.2,
		})
		expect(r.pHe + r.pO2 + r.pTop).toBeCloseTo(230 - 50, 6)
	})

	it('flags an impossible blend that needs draining', () => {
		const r = calculateBlend({
			startPressure: 150,
			startFo2: 0.36,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.32,
			targetFhe: 0,
		})
		expect(r.feasible).toBe(false)
		expect(r.reason).toBeTruthy()
	})
})
