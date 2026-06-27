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

describe('calculateBlend real-gas opt-in', () => {
	const input = {
		startPressure: 0,
		startFo2: 0.209,
		startFhe: 0,
		finalPressure: 200,
		targetFo2: 0.32,
		targetFhe: 0,
	}
	it('is unchanged when useRealGas is false or omitted', () => {
		const a = calculateBlend(input)
		const b = calculateBlend(input, { useRealGas: false })
		expect(b).toEqual(a)
	})
	it('needs less O2 pressure for a nitrox blend (O2 Z < 1)', () => {
		const ideal = calculateBlend(input)
		const real = calculateBlend(input, { useRealGas: true })
		expect(real.pO2).toBeLessThan(ideal.pO2)
	})
	it('needs more helium pressure for a trimix blend (He Z > 1)', () => {
		const tmx = {
			startPressure: 0,
			startFo2: 0.209,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.18,
			targetFhe: 0.45,
		}
		const ideal = calculateBlend(tmx)
		const real = calculateBlend(tmx, { useRealGas: true })
		expect(real.pHe).toBeGreaterThan(ideal.pHe)
	})
})

describe('blend top-up gas + order', () => {
	const base = {
		startPressure: 0,
		startFo2: 0.209,
		startFhe: 0,
		finalPressure: 200,
		targetFo2: 0.32,
		targetFhe: 0,
	}
	it('air top-up (default) matches the legacy O2/He/air result', () => {
		const r = calculateBlend(base)
		expect(r.pHe).toBeCloseTo(0, 6)
		expect(r.pTop).toBeGreaterThan(0)
		expect(r.steps[r.steps.length - 1].toBar).toBeCloseTo(200, 6)
	})
	it('produces one step per component in the chosen order', () => {
		const r = calculateBlend({ ...base, order: ['o2', 'he', 'top'] })
		expect(r.steps.map((s) => s.gas)).toEqual(['o2', 'he', 'top'])
		// cumulative and non-decreasing, ending at the final pressure
		for (let i = 1; i < r.steps.length; i++) {
			expect(r.steps[i].toBar).toBeGreaterThanOrEqual(r.steps[i - 1].toBar)
		}
		expect(r.steps[r.steps.length - 1].toBar).toBeCloseTo(200, 6)
	})
	it('a richer top-up gas needs less added O2 for the same target', () => {
		const air = calculateBlend(base)
		const ean25 = calculateBlend({ ...base, topupFo2: 0.25 })
		expect(ean25.pO2).toBeLessThan(air.pO2)
		expect(ean25.feasible).toBe(true)
	})
	it('flags drain-required when the start mix is too rich', () => {
		const r = calculateBlend({
			...base,
			startPressure: 150,
			startFo2: 0.5,
			targetFo2: 0.21,
		})
		expect(r.feasible).toBe(false)
		expect(r.reason).toBeTruthy()
	})
})
