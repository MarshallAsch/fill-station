import { ataAtDepth, Water } from './modEnd'

export function sacRate(input: {
	startP: number
	endP: number
	minutes: number
	avgDepthM: number
	water: Water
}): number {
	const { startP, endP, minutes, avgDepthM, water } = input
	return (startP - endP) / minutes / ataAtDepth(avgDepthM, water)
}

export function rmv(input: {
	startP: number
	endP: number
	minutes: number
	avgDepthM: number
	tankVolumeL: number
	water: Water
}): number {
	return sacRate(input) * input.tankVolumeL
}

export function diveGasRequirement(input: {
	rmvLpm: number
	avgDepthM: number
	minutes: number
	water: Water
}): number {
	const { rmvLpm, avgDepthM, minutes, water } = input
	return rmvLpm * ataAtDepth(avgDepthM, water) * minutes
}

export interface Stop {
	depthM: number
	minutes: number
}

export function rockBottom(input: {
	rmvLpm: number
	depthM: number
	ascentRateMpm: number
	stops: Stop[]
	stressFactor: number
	water: Water
	teamSize: number
}): number {
	const { rmvLpm, depthM, ascentRateMpm, stops, stressFactor, water, teamSize } =
		input
	const stressedRmv = rmvLpm * stressFactor
	const ascentMinutes = depthM / ascentRateMpm
	const ascentGas =
		stressedRmv * ataAtDepth(depthM / 2, water) * ascentMinutes
	const stopGas = stops.reduce(
		(sum, s) => sum + stressedRmv * ataAtDepth(s.depthM, water) * s.minutes,
		0,
	)
	return (ascentGas + stopGas) * teamSize
}

export function minGasPressure(input: {
	minGasL: number
	tankVolumeL: number
}): number {
	if (input.tankVolumeL <= 0) return Infinity
	return input.minGasL / input.tankVolumeL
}
