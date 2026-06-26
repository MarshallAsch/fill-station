import { describe, it, expect } from 'vitest'
import {
	DIVE_TANKS,
	STORAGE_TANKS,
	INDUSTRIAL_TANKS,
	MIXES,
} from './presets'

describe('tank presets', () => {
	it('all tanks have positive water volume and rated pressure', () => {
		for (const t of [...DIVE_TANKS, ...STORAGE_TANKS, ...INDUSTRIAL_TANKS]) {
			expect(t.waterVolumeL).toBeGreaterThan(0)
			expect(t.ratedBar).toBeGreaterThan(0)
			expect(t.name.length).toBeGreaterThan(0)
		}
	})
	it('includes the sourced industrial T and K bottles', () => {
		const names = INDUSTRIAL_TANKS.map((t) => t.name)
		expect(names.some((n) => n.includes('T'))).toBe(true)
		expect(names.some((n) => n.includes('K'))).toBe(true)
		expect(INDUSTRIAL_TANKS).toHaveLength(4)
	})
})

describe('mix presets', () => {
	it('every mix has valid fractions summing to <= 1', () => {
		for (const m of MIXES) {
			expect(m.fo2).toBeGreaterThan(0)
			expect(m.fo2).toBeLessThanOrEqual(1)
			expect(m.fhe).toBeGreaterThanOrEqual(0)
			expect(m.fo2 + m.fhe).toBeLessThanOrEqual(1 + 1e-9)
		}
	})
	it('includes EAN80 and 100% O2', () => {
		expect(MIXES.some((m) => m.fo2 === 0.8 && m.fhe === 0)).toBe(true)
		expect(MIXES.some((m) => m.fo2 === 1 && m.fhe === 0)).toBe(true)
	})
})

import { BOOSTERS } from './presets'

describe('booster presets', () => {
	it('every booster has a positive ratio and a name', () => {
		for (const b of BOOSTERS) {
			expect(b.ratio).toBeGreaterThan(0)
			expect(b.name.length).toBeGreaterThan(0)
		}
	})
	it('includes a Haskel AG-30 at ratio 30', () => {
		expect(BOOSTERS.some((b) => b.name.includes('AG-30') && b.ratio === 30)).toBe(
			true,
		)
	})
	it('includes USUN dive boosters', () => {
		expect(BOOSTERS.some((b) => b.name.includes('USUN'))).toBe(true)
	})
	it('flags the two-stage models and carries per-cycle fields', () => {
		for (const b of BOOSTERS) {
			expect(typeof b.twoStage).toBe('boolean')
			expect(b.vdPerCycleL).toBeGreaterThanOrEqual(0)
			expect(b.driveMaxLpm).toBeGreaterThanOrEqual(0)
		}
		expect(BOOSTERS.some((b) => b.twoStage)).toBe(true)
	})
	it('seeds derived drive-air data for every preset (USUN and Haskel)', () => {
		expect(BOOSTERS.some((b) => b.name.includes('USUN'))).toBe(true)
		expect(BOOSTERS.some((b) => b.name.includes('Haskel'))).toBe(true)
		for (const b of BOOSTERS) {
			expect(b.vdPerCycleL).toBeGreaterThan(0)
			expect(b.driveMaxLpm).toBeGreaterThan(0)
		}
	})
	it('uses one shared air-drive head for all Haskel AG models', () => {
		const haskel = BOOSTERS.filter((b) => b.name.includes('Haskel'))
		expect(haskel.length).toBe(6)
		const vd = haskel[0].vdPerCycleL
		const dm = haskel[0].driveMaxLpm
		for (const b of haskel) {
			expect(b.vdPerCycleL).toBe(vd)
			expect(b.driveMaxLpm).toBe(dm)
		}
	})
})
