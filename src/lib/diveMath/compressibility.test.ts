import { describe, it, expect } from 'vitest'
import { gasZ, mixZ } from './compressibility'

describe('gasZ', () => {
	it('is ~1 at the surface for every gas', () => {
		expect(gasZ('o2', 0)).toBe(1)
		expect(gasZ('n2', 0)).toBe(1)
		expect(gasZ('he', 0)).toBe(1)
	})
	it('oxygen compresses more than ideal at pressure (Z < 1)', () => {
		expect(gasZ('o2', 200)).toBeLessThan(1)
	})
	it('helium is less compressible than ideal (Z > 1)', () => {
		expect(gasZ('he', 200)).toBeGreaterThan(1)
	})
})

describe('mixZ', () => {
	it('is ~1 at the surface', () => {
		expect(mixZ({ fo2: 0.32, fhe: 0, pressureBar: 0 })).toBeCloseTo(1, 6)
	})
	it('a helium-rich mix has a higher Z than air at pressure', () => {
		const air = mixZ({ fo2: 0.21, fhe: 0, pressureBar: 200 })
		const trimix = mixZ({ fo2: 0.21, fhe: 0.55, pressureBar: 200 })
		expect(trimix).toBeGreaterThan(air)
	})
})
