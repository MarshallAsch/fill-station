import { describe, it, expect } from 'vitest'
import { calculateMod, calculateEnd, depthPerBar } from './modEnd'

describe('calculateMod', () => {
	it('computes EAN32 MOD at ppO2 1.4 in salt water', () => {
		// (1.4/0.32 - 1) * 10 = 33.75 m
		expect(calculateMod({ fo2: 0.32, ppo2: 1.4, water: 'salt' })).toBeCloseTo(
			33.75,
			2,
		)
	})

	it('computes EAN32 MOD at ppO2 1.6 in salt water', () => {
		expect(calculateMod({ fo2: 0.32, ppo2: 1.6, water: 'salt' })).toBeCloseTo(
			40,
			2,
		)
	})

	it('is deeper in fresh water than salt for the same mix', () => {
		const salt = calculateMod({ fo2: 0.32, ppo2: 1.4, water: 'salt' })
		const fresh = calculateMod({ fo2: 0.32, ppo2: 1.4, water: 'fresh' })
		expect(fresh).toBeGreaterThan(salt)
	})
})

describe('calculateEnd', () => {
	it('treats O2 as narcotic by default model', () => {
		// trimix 18/45 at 60 m salt: (60+10)*(1-0.45) - 10 = 28.5 m
		expect(
			calculateEnd({
				fo2: 0.18,
				fhe: 0.45,
				depth: 60,
				water: 'salt',
				model: 'o2-narcotic',
			}),
		).toBeCloseTo(28.5, 2)
	})

	it('n2-only model gives a shallower END than o2-narcotic for trimix', () => {
		const o2 = calculateEnd({
			fo2: 0.18,
			fhe: 0.45,
			depth: 60,
			water: 'salt',
			model: 'o2-narcotic',
		})
		const n2 = calculateEnd({
			fo2: 0.18,
			fhe: 0.45,
			depth: 60,
			water: 'salt',
			model: 'n2-only',
		})
		expect(n2).toBeLessThan(o2)
	})

	it('returns the dive depth for air on the o2-narcotic model', () => {
		expect(
			calculateEnd({
				fo2: 0.21,
				fhe: 0,
				depth: 30,
				water: 'salt',
				model: 'o2-narcotic',
			}),
		).toBeCloseTo(30, 6)
	})
})

describe('depthPerBar', () => {
	it('uses 10 m for salt and 10.3 m for fresh', () => {
		expect(depthPerBar('salt')).toBe(10)
		expect(depthPerBar('fresh')).toBe(10.3)
	})
})
