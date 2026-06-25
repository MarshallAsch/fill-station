import { describe, it, expect } from 'vitest'
import {
	sacRate,
	rmv,
	diveGasRequirement,
	rockBottom,
	minGasPressure,
} from './gasPlanning'

describe('sacRate / rmv', () => {
	it('derives SAC and RMV from a logged dive', () => {
		const args = {
			startP: 200,
			endP: 100,
			minutes: 20,
			avgDepthM: 20,
			water: 'salt' as const,
		}
		expect(sacRate(args)).toBeCloseTo(1.6667, 3)
		expect(rmv({ ...args, tankVolumeL: 12 })).toBeCloseTo(20, 2)
	})
})

describe('diveGasRequirement', () => {
	it('scales with depth ata and time', () => {
		expect(
			diveGasRequirement({ rmvLpm: 20, avgDepthM: 20, minutes: 20, water: 'salt' }),
		).toBeCloseTo(1200, 1)
	})
})

describe('rockBottom / minGasPressure', () => {
	const base = {
		rmvLpm: 20,
		depthM: 30,
		ascentRateMpm: 9,
		stops: [{ depthM: 5, minutes: 3 }],
		stressFactor: 2,
		water: 'salt' as const,
		teamSize: 2,
	}
	it('computes minimum gas for a 30 m dive', () => {
		// ascent: stressedRmv 40 * ata(15)=2.5 * (30/9=3.333) = 333.33
		// stop: 40 * ata(5)=1.5 * 3 = 180 ; team 2 -> 1026.67 L
		expect(rockBottom(base)).toBeCloseTo(1026.67, 0)
	})
	it('scales linearly with team size', () => {
		const solo = rockBottom({ ...base, teamSize: 1 })
		expect(rockBottom(base)).toBeCloseTo(2 * solo, 4)
	})
	it('converts minimum gas to tank pressure', () => {
		expect(minGasPressure({ minGasL: 1026.67, tankVolumeL: 12 })).toBeCloseTo(
			85.56,
			1,
		)
	})
})
