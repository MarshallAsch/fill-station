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
