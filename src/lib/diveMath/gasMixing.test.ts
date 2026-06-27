import { describe, it, expect } from 'vitest'
import { topUpMix } from './gasMixing'

describe('topUpMix', () => {
	it('tops air up to a fill pressure with EAN32 (ideal)', () => {
		// ≈ 200 psi air → 3000 psi with 32% O₂
		const r = topUpMix({
			startBar: 13.79,
			startFo2: 0.21,
			startFhe: 0,
			topFo2: 0.32,
			topFhe: 0,
			finalBar: 206.84,
			useRealGas: false,
		})
		expect(r.noTopUp).toBe(false)
		expect(r.fo2).toBeCloseTo(0.31, 2) // ~0.312, residual air pulls it under 0.32
		expect(r.fhe).toBeCloseTo(0, 6)
		expect(r.finalBar).toBe(206.84)
		expect(r.addedBar).toBeCloseTo(206.84 - 13.79, 6)
	})

	it('an empty start yields almost exactly the top-up mix', () => {
		const r = topUpMix({
			startBar: 0,
			startFo2: 0.21,
			startFhe: 0,
			topFo2: 0.32,
			topFhe: 0,
			finalBar: 206.84,
			useRealGas: false,
		})
		expect(r.fo2).toBeCloseTo(0.32, 2) // 1 atm of residual air barely dilutes
		expect(r.fhe).toBeCloseTo(0, 6)
	})

	it('final at or below start adds nothing and returns the start mix', () => {
		const r = topUpMix({
			startBar: 206.84,
			startFo2: 0.21,
			startFhe: 0,
			topFo2: 0.32,
			topFhe: 0,
			finalBar: 100,
			useRealGas: false,
		})
		expect(r.noTopUp).toBe(true)
		expect(r.addedBar).toBe(0)
		expect(r.fo2).toBe(0.21)
		expect(r.fhe).toBe(0)
		expect(r.finalBar).toBe(206.84)
	})

	it('final equal to start also adds nothing', () => {
		const r = topUpMix({
			startBar: 150,
			startFo2: 0.21,
			startFhe: 0,
			topFo2: 1,
			topFhe: 0,
			finalBar: 150,
			useRealGas: false,
		})
		expect(r.noTopUp).toBe(true)
		expect(r.addedBar).toBe(0)
		expect(r.fo2).toBe(0.21)
	})

	it('real-gas raises the O₂ fraction vs ideal when topping with O₂', () => {
		const base = {
			startBar: 100,
			startFo2: 0.21,
			startFhe: 0,
			topFo2: 1,
			topFhe: 0,
			finalBar: 200,
		}
		const ideal = topUpMix({ ...base, useRealGas: false })
		const real = topUpMix({ ...base, useRealGas: true })
		expect(ideal.fo2).toBeCloseTo(0.6, 2) // ~0.603
		expect(real.fo2).toBeCloseTo(0.61, 2) // ~0.611
		// O₂ is more compressible (Z<1), so more O₂ moles pack in than ideal.
		expect(real.fo2).toBeGreaterThan(ideal.fo2)
	})

	it('preserves helium through a trimix top-up', () => {
		const r = topUpMix({
			startBar: 0,
			startFo2: 0.21,
			startFhe: 0,
			topFo2: 0.18,
			topFhe: 0.45,
			finalBar: 200,
			useRealGas: false,
		})
		expect(r.fhe).toBeCloseTo(0.45, 2)
		expect(r.fo2).toBeCloseTo(0.18, 2)
	})
})
