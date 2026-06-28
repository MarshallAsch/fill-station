import { describe, it, expect } from 'vitest'
import {
	roundPressure,
	roundVolume,
	roundSac,
	roundTemp,
	roundPercent,
	roundDepthDown,
	fmtMix,
} from './format'

describe('format rounding', () => {
	it('roundPressure: psi → 1, bar → 0.1', () => {
		// 200 bar = 2900.75 psi → 2901; bar 200 → 200; 13.84 bar → 13.8
		expect(roundPressure(200, 'psi')).toBe(2901)
		expect(roundPressure(13.84, 'bar')).toBeCloseTo(13.8, 6)
	})
	it('roundVolume: cf → 1, l → 0.1', () => {
		// 100 L = 3.531 cf → 4; 100 L → 100; 12.34 L → 12.3
		expect(roundVolume(100, 'cf')).toBe(4)
		expect(roundVolume(12.34, 'l')).toBeCloseTo(12.3, 6)
	})
	it('roundSac: cf → 0.01, l → 0.1', () => {
		// 14 L/min = 0.4944 cf/min → 0.49; 14.06 L/min → 14.1
		expect(roundSac(14, 'cf')).toBeCloseTo(0.49, 6)
		expect(roundSac(14.06, 'l')).toBeCloseTo(14.1, 6)
	})
	it('roundTemp / roundPercent: nearest 0.1', () => {
		expect(roundTemp(20.04)).toBeCloseTo(20, 6)
		expect(roundPercent(31.96)).toBeCloseTo(32, 6)
		expect(roundPercent(31.94)).toBeCloseTo(31.9, 6)
	})
	it('roundDepthDown: floors (m → 0.1, ft → 1)', () => {
		// 30.18 m → 30.1; 30 m = 98.4 ft → 98
		expect(roundDepthDown(30.18, 'm')).toBeCloseTo(30.1, 6)
		expect(roundDepthDown(30, 'ft')).toBe(98)
	})
	it('fmtMix: drops /0 when no helium', () => {
		expect(fmtMix(32, 0)).toBe('32')
		expect(fmtMix(21, 35)).toBe('21/35')
	})
	it('produces clean decimals (no floating-point tails) for display', () => {
		// 312 * 0.1 === 31.200000000000003; the helper must yield exactly 31.2
		expect(roundPercent(31.21658)).toBe(31.2)
		expect(String(roundPercent(31.21658))).toBe('31.2')
		expect(String(roundPercent(7.0000001))).toBe('7')
		expect(String(roundDepthDown(30.18, 'm'))).toBe('30.1')
		expect(String(roundSac(14, 'cf'))).toBe('0.49')
	})
})
