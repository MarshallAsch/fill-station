import { describe, it, expect } from 'vitest'
import {
	surfaceDensity,
	densityAtDepth,
	depthForDensity,
	RECOMMENDED_MAX_DENSITY,
} from './gasDensity'

describe('gasDensity', () => {
	it('air surface density is ~1.29 g/L', () => {
		expect(surfaceDensity({ fo2: 0.21, fhe: 0 })).toBeCloseTo(1.288, 2)
	})
	it('EAN32 at 30 m salt reaches the ~5.2 g/L recommended limit', () => {
		const d = densityAtDepth({ fo2: 0.32, fhe: 0, depthM: 30, water: 'salt' })
		expect(d).toBeCloseTo(5.23, 1)
		expect(d).toBeGreaterThan(RECOMMENDED_MAX_DENSITY - 0.1)
	})
	it('trimix is less dense than nitrox at the same depth', () => {
		const nitrox = densityAtDepth({ fo2: 0.32, fhe: 0, depthM: 30, water: 'salt' })
		const trimix = densityAtDepth({ fo2: 0.18, fhe: 0.45, depthM: 30, water: 'salt' })
		expect(trimix).toBeLessThan(nitrox)
	})
	it('depthForDensity inverts densityAtDepth', () => {
		const depth = depthForDensity({
			fo2: 0.32,
			fhe: 0,
			density: 5.2,
			water: 'salt',
		})
		expect(
			densityAtDepth({ fo2: 0.32, fhe: 0, depthM: depth, water: 'salt' }),
		).toBeCloseTo(5.2, 4)
	})
})
