import { describe, it, expect } from 'vitest'
import { nitroxStickFlowRate, nitroxStickSupplyDraw } from './nitroxStick'

describe('nitroxStickFlowRate', () => {
	it('computes O2 flow for EAN32 at a given air flow', () => {
		// Q_o2 = Q_air * (0.32 - 0.209) / (1 - 0.32)
		expect(nitroxStickFlowRate({ targetFo2: 0.32, airFlow: 100 })).toBeCloseTo(
			16.32,
			2,
		)
	})

	it('computes O2 flow for EAN36', () => {
		expect(nitroxStickFlowRate({ targetFo2: 0.36, airFlow: 100 })).toBeCloseTo(
			23.59,
			2,
		)
	})

	it('returns 0 when target is air or leaner', () => {
		expect(nitroxStickFlowRate({ targetFo2: 0.209, airFlow: 100 })).toBe(0)
		expect(nitroxStickFlowRate({ targetFo2: 0.18, airFlow: 100 })).toBe(0)
	})

	it('guards against divide-by-zero near pure O2', () => {
		const v = nitroxStickFlowRate({ targetFo2: 1, airFlow: 100 })
		expect(Number.isFinite(v)).toBe(false)
	})
})

describe('nitroxStickSupplyDraw', () => {
	it('computes O2 surface volume and supply drawdown for a fill', () => {
		const r = nitroxStickSupplyDraw({
			targetFo2: 0.32,
			tankVolume: 12,
			startPressure: 0,
			finalPressure: 200,
			supplyVolume: 50,
		})
		// added surface vol = 12 * 200 = 2400 L
		// O2 fraction of throughput = (0.32 - 0.209) / 0.791 = 0.14033
		// O2 surface vol = 2400 * 0.14033 = 336.79 L
		expect(r.o2SurfaceVolume).toBeCloseTo(336.79, 1)
		// supply drop = 336.79 / 50 = 6.74 bar
		expect(r.supplyPressureDrop).toBeCloseTo(6.74, 1)
	})

	it('returns zero draw when target is air', () => {
		const r = nitroxStickSupplyDraw({
			targetFo2: 0.209,
			tankVolume: 12,
			startPressure: 0,
			finalPressure: 200,
			supplyVolume: 50,
		})
		expect(r.o2SurfaceVolume).toBe(0)
		expect(r.supplyPressureDrop).toBe(0)
	})

	it('scales drawdown with the fill pressure delta', () => {
		const base = nitroxStickSupplyDraw({
			targetFo2: 0.32,
			tankVolume: 12,
			startPressure: 0,
			finalPressure: 100,
			supplyVolume: 50,
		})
		const more = nitroxStickSupplyDraw({
			targetFo2: 0.32,
			tankVolume: 12,
			startPressure: 0,
			finalPressure: 200,
			supplyVolume: 50,
		})
		expect(more.supplyPressureDrop).toBeCloseTo(2 * base.supplyPressureDrop, 4)
	})
})
