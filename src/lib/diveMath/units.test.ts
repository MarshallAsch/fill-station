import { describe, it, expect } from 'vitest'
import {
	AIR_FO2,
	ATMOSPHERIC_BAR,
	toBar,
	fromBar,
	toMeters,
	fromMeters,
	toLiters,
	fromLiters,
} from './units'

describe('units', () => {
	it('exposes air and atmospheric constants', () => {
		expect(AIR_FO2).toBe(0.209)
		expect(ATMOSPHERIC_BAR).toBeCloseTo(1.01325, 5)
	})

	it('converts pressure psi <-> bar', () => {
		expect(toBar(145.037738, 'psi')).toBeCloseTo(10, 4)
		expect(toBar(10, 'bar')).toBe(10)
		expect(fromBar(10, 'psi')).toBeCloseTo(145.037738, 3)
		expect(fromBar(10, 'bar')).toBe(10)
	})

	it('converts depth ft <-> m', () => {
		expect(toMeters(33, 'ft')).toBeCloseTo(10.0584, 3)
		expect(toMeters(10, 'm')).toBe(10)
		expect(fromMeters(10, 'ft')).toBeCloseTo(32.8084, 3)
	})

	it('converts volume cf <-> l', () => {
		expect(toLiters(1, 'cf')).toBeCloseTo(28.3168, 3)
		expect(toLiters(5, 'l')).toBe(5)
		expect(fromLiters(28.3168466, 'cf')).toBeCloseTo(1, 4)
	})
})
