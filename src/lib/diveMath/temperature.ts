import { ATMOSPHERIC_BAR } from './units'

const ATM = ATMOSPHERIC_BAR
const K = 273.15

// Pressure a hot fill settles to once it cools (Gay-Lussac at fixed volume):
// P_cold_abs = P_hot_abs * T_cold / T_hot. Returns gauge bar.
export function settledPressureBar(
	hotGaugeBar: number,
	fillTempC: number,
	settledTempC: number,
): number {
	const tHot = fillTempC + K
	const tCold = settledTempC + K
	if (tHot <= 0) return hotGaugeBar
	return ((hotGaugeBar + ATM) * tCold) / tHot - ATM
}

// Hot fill pressure needed to settle at a cold goal (inverse of the above).
export function hotTargetBar(
	coldGoalGaugeBar: number,
	fillTempC: number,
	settledTempC: number,
): number {
	const tHot = fillTempC + K
	const tCold = settledTempC + K
	if (tCold <= 0) return coldGoalGaugeBar
	return ((coldGoalGaugeBar + ATM) * tHot) / tCold - ATM
}

// Simple mode: a flat overfill fraction on the gauge pressure.
export function applyOverfill(coldGaugeBar: number, pct: number): number {
	return coldGaugeBar * (1 + pct / 100)
}

export function removeOverfill(hotGaugeBar: number, pct: number): number {
	return hotGaugeBar / (1 + pct / 100)
}
