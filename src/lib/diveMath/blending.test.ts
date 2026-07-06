import { describe, it, expect } from 'vitest'
import { calculateBlend } from './blending'

// Reconstruct the achieved mix fractions from a result (ideal gas), so bleed
// cases can be verified without hand-computing the exact bleed pressure.
const achieved = (
	r: { bleedTo: number; pHe: number; pO2: number; pTop: number },
	startFo2: number,
	startFhe: number,
	topFo2: number,
	topFhe: number,
	pf: number,
) => {
	const fo2 = (startFo2 * r.bleedTo + r.pO2 + topFo2 * r.pTop) / pf
	const fhe = (startFhe * r.bleedTo + r.pHe + topFhe * r.pTop) / pf
	return { fo2, fhe }
}

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
		expect(r.pO2).toBeCloseTo(28.07, 1)
		expect(r.addO2To).toBeCloseTo(28.07, 1)
		expect(r.topTo).toBeCloseTo(200, 6)
		expect(r.bleedBar).toBe(0)
		expect(r.bleedTo).toBe(0)
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
		expect(r.bleedBar).toBe(0)
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
		expect(r.bleedBar).toBe(0)
		expect(r.bleedTo).toBe(50)
	})

	it('bleeds down a slightly-rich nitrox start (EAN36 -> EAN32)', () => {
		const r = calculateBlend({
			startPressure: 150,
			startFo2: 0.36,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.32,
			targetFhe: 0,
		})
		expect(r.feasible).toBe(true)
		expect(r.bleedBar).toBeGreaterThan(0)
		expect(r.bleedTo).toBeCloseTo(147.02, 1)
		expect(r.bleedBar).toBeCloseTo(2.98, 1)
		const mix = achieved(r, 0.36, 0, 0.209, 0, 200)
		expect(mix.fo2).toBeCloseTo(0.32, 4)
		expect(mix.fhe).toBeCloseTo(0, 4)
	})

	it('bleeds down a very rich start (near-full drain)', () => {
		const r = calculateBlend({
			startPressure: 150,
			startFo2: 0.5,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.21,
			targetFhe: 0,
		})
		expect(r.feasible).toBe(true)
		expect(r.bleedBar).toBeGreaterThan(0)
		expect(r.bleedTo).toBeCloseTo(0.69, 1)
		expect(r.bleedBar).toBeCloseTo(149.31, 1)
		const mix = achieved(r, 0.5, 0, 0.209, 0, 200)
		expect(mix.fo2).toBeCloseTo(0.21, 4)
	})

	it('bleeds down a helium-rich trimix start', () => {
		const r = calculateBlend({
			startPressure: 180,
			startFo2: 0.18,
			startFhe: 0.45,
			finalPressure: 200,
			targetFo2: 0.18,
			targetFhe: 0.35,
		})
		expect(r.feasible).toBe(true)
		expect(r.bleedBar).toBeGreaterThan(0)
		const mix = achieved(r, 0.18, 0.45, 0.209, 0, 200)
		expect(mix.fo2).toBeCloseTo(0.18, 4)
		expect(mix.fhe).toBeCloseTo(0.35, 4)
	})

	it('stays infeasible when the target is leaner than the top-up gas', () => {
		const r = calculateBlend({
			startPressure: 150,
			startFo2: 0.209,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.18,
			targetFhe: 0,
		})
		expect(r.feasible).toBe(false)
		expect(r.reason).toBeTruthy()
		expect(r.bleedBar).toBe(0)
	})

	it('cannot bleed an empty start (still infeasible)', () => {
		const r = calculateBlend({
			startPressure: 0,
			startFo2: 0.209,
			startFhe: 0,
			finalPressure: 200,
			targetFo2: 0.18,
			targetFhe: 0,
		})
		expect(r.feasible).toBe(false)
		expect(r.bleedBar).toBe(0)
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
	it('bleeds down when the start mix is too rich', () => {
		const r = calculateBlend({
			...base,
			startPressure: 150,
			startFo2: 0.5,
			targetFo2: 0.21,
		})
		expect(r.feasible).toBe(true)
		expect(r.bleedBar).toBeGreaterThan(0)
	})
	it('flags an unsolvable pure-O2 top-up', () => {
		const r = calculateBlend({ ...base, topupFo2: 1, topupFhe: 0 })
		expect(r.feasible).toBe(false)
		expect(r.reason).toBeTruthy()
	})
})
