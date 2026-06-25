import { describe, it, expect } from 'vitest'
import { ead } from './ead'

describe('ead', () => {
	it('gives ~24.4 m for EAN32 at 30 m salt', () => {
		expect(ead({ depthM: 30, fo2: 0.32, fhe: 0, water: 'salt' })).toBeCloseTo(
			24.43,
			1,
		)
	})
	it('returns the dive depth for air', () => {
		expect(ead({ depthM: 30, fo2: 0.21, fhe: 0, water: 'salt' })).toBeCloseTo(
			30,
			4,
		)
	})
	it('richer nitrox gives a shallower EAD', () => {
		const lean = ead({ depthM: 30, fo2: 0.28, fhe: 0, water: 'salt' })
		const rich = ead({ depthM: 30, fo2: 0.36, fhe: 0, water: 'salt' })
		expect(rich).toBeLessThan(lean)
	})
})
