import { describe, it, expect } from 'vitest'
import { ATMOSPHERIC_BAR } from './units'
import { calculateCascade } from './cascade'

describe('calculateCascade', () => {
	it('equalizes target against a single bank', () => {
		const r = calculateCascade({
			banks: [{ volume: 50, pressure: 200 }],
			target: { volume: 10, startPressure: 0 },
		})
		// (1.01325*10 + 201.01325*50) / 60  -> gauge
		expect(r.finalPressure).toBeCloseTo(166.68, 1)
		expect(r.banks[0].residualPressure).toBeCloseTo(166.68, 1)
	})

	it('uses lowest-pressure banks first', () => {
		const r = calculateCascade({
			banks: [
				{ volume: 50, pressure: 200 },
				{ volume: 50, pressure: 100 },
			],
			target: { volume: 10, startPressure: 0 },
		})
		// low bank (100) used before high bank (200); final must exceed
		// equalizing only against the 200 bank would (since two stages add gas)
		expect(r.finalPressure).toBeGreaterThan(166.68)
		// residuals are reported in original input order
		expect(r.banks[0].residualPressure).toBeGreaterThan(
			r.banks[1].residualPressure,
		)
	})

	it('skips banks at or below the target pressure', () => {
		const r = calculateCascade({
			banks: [{ volume: 50, pressure: 50 }],
			target: { volume: 10, startPressure: 100 },
		})
		expect(r.finalPressure).toBe(100)
		expect(r.banks[0].residualPressure).toBe(50)
	})

	it('conserves gas (absolute P*V) across the system', () => {
		const banks = [
			{ volume: 50, pressure: 200 },
			{ volume: 40, pressure: 150 },
		]
		const target = { volume: 12, startPressure: 30 }
		const before =
			banks.reduce((s, b) => s + (b.pressure + ATMOSPHERIC_BAR) * b.volume, 0) +
			(target.startPressure + ATMOSPHERIC_BAR) * target.volume
		const r = calculateCascade({ banks, target })
		const after =
			r.banks.reduce(
				(s, b, i) =>
					s + (b.residualPressure + ATMOSPHERIC_BAR) * banks[i].volume,
				0,
			) +
			(r.finalPressure + ATMOSPHERIC_BAR) * target.volume
		expect(after).toBeCloseTo(before, 4)
	})

	it('reports whether the desired pressure is reached', () => {
		const reached = calculateCascade({
			banks: [{ volume: 200, pressure: 230 }],
			target: { volume: 10, startPressure: 0 },
			desiredPressure: 200,
		})
		expect(reached.reachedDesired).toBe(true)
		const notReached = calculateCascade({
			banks: [{ volume: 5, pressure: 230 }],
			target: { volume: 10, startPressure: 0 },
			desiredPressure: 200,
		})
		expect(notReached.reachedDesired).toBe(false)
	})

	it('stops at the desired pressure instead of overshooting', () => {
		const r = calculateCascade({
			banks: [
				{ volume: 50, pressure: 300 },
				{ volume: 50, pressure: 300 },
			],
			target: { volume: 10, startPressure: 0 },
			desiredPressure: 200,
		})
		expect(r.finalPressure).toBeCloseTo(200, 6)
		expect(r.reachedDesired).toBe(true)
	})

	it('leaves banks untouched once the desired pressure is reached', () => {
		const r = calculateCascade({
			banks: [
				{ volume: 200, pressure: 300 },
				{ volume: 200, pressure: 300 },
			],
			target: { volume: 10, startPressure: 0 },
			desiredPressure: 200,
		})
		// The first bank alone covers the fill, so the second is never opened.
		expect(r.banks[1].residualPressure).toBe(300)
	})

	it('conserves gas when a bank is only partly drawn', () => {
		const banks = [{ volume: 50, pressure: 300 }]
		const target = { volume: 10, startPressure: 0 }
		const before =
			(banks[0].pressure + ATMOSPHERIC_BAR) * banks[0].volume +
			(target.startPressure + ATMOSPHERIC_BAR) * target.volume
		const r = calculateCascade({ banks, target, desiredPressure: 200 })
		const after =
			(r.banks[0].residualPressure + ATMOSPHERIC_BAR) * banks[0].volume +
			(r.finalPressure + ATMOSPHERIC_BAR) * target.volume
		expect(r.finalPressure).toBeCloseTo(200, 6)
		expect(after).toBeCloseTo(before, 4)
	})

	it('still equalizes fully when it cannot reach the desired pressure', () => {
		const r = calculateCascade({
			banks: [{ volume: 50, pressure: 200 }],
			target: { volume: 10, startPressure: 0 },
			desiredPressure: 300,
		})
		expect(r.finalPressure).toBeCloseTo(166.68, 1)
		expect(r.reachedDesired).toBe(false)
	})

	it('handles an empty bank list', () => {
		const r = calculateCascade({
			banks: [],
			target: { volume: 10, startPressure: 50 },
			desiredPressure: 200,
		})
		expect(r.finalPressure).toBe(50)
		expect(r.banks).toEqual([])
		expect(r.reachedDesired).toBe(false)
	})
})

describe('calculateCascade real-gas opt-in', () => {
	const input = {
		banks: [{ volume: 50, pressure: 200 }],
		target: { volume: 10, startPressure: 0 },
	}
	it('is unchanged when useRealGas is false or omitted', () => {
		const a = calculateCascade(input)
		const b = calculateCascade(input, { useRealGas: false })
		expect(b).toEqual(a)
	})
	it('returns a finite, close result with real-gas weighting', () => {
		const ideal = calculateCascade(input)
		const real = calculateCascade(input, { useRealGas: true })
		expect(Number.isFinite(real.finalPressure)).toBe(true)
		expect(Math.abs(real.finalPressure - ideal.finalPressure)).toBeLessThan(10)
	})
})
