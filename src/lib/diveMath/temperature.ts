import { ATMOSPHERIC_BAR } from './units'

const ATM = ATMOSPHERIC_BAR
export const KELVIN_OFFSET = 273.15

// Pressure a hot fill settles to once it cools (Gay-Lussac at fixed volume):
// P_cold_abs = P_hot_abs * T_cold / T_hot. Returns gauge bar.
export function settledPressureBar(
	hotGaugeBar: number,
	fillTempC: number,
	settledTempC: number,
): number {
	const tHot = fillTempC + KELVIN_OFFSET
	const tCold = settledTempC + KELVIN_OFFSET
	if (tHot <= 0) return hotGaugeBar
	return ((hotGaugeBar + ATM) * tCold) / tHot - ATM
}

// Hot fill pressure needed to settle at a cold goal (inverse of the above).
export function hotTargetBar(
	coldGoalGaugeBar: number,
	fillTempC: number,
	settledTempC: number,
): number {
	const tHot = fillTempC + KELVIN_OFFSET
	const tCold = settledTempC + KELVIN_OFFSET
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

export const HEAT_COEFF = 0.7 // °C per (bar/min)

// Gas temperature rise during a fill (°C) from the fill rate (bar/min). Linear,
// reference-only: a faster fill heats the gas more. 0 at non-positive rate.
export function tempRiseC(fillRateBarPerMin: number): number {
	return fillRateBarPerMin > 0 ? HEAT_COEFF * fillRateBarPerMin : 0
}

// The hot fill pressure to fill to so it settles at coldGaugeBar, per the global
// temperature settings. Returns coldGaugeBar unchanged when off.
export function effectiveHotFillBar(
	coldGaugeBar: number,
	t: {
		mode: 'off' | 'simple' | 'detailed'
		overfillPct: number
		fillTempC: number
		settledTempC: number
	},
): number {
	if (t.mode === 'off') return coldGaugeBar
	if (t.mode === 'simple') return applyOverfill(coldGaugeBar, t.overfillPct)
	return hotTargetBar(coldGaugeBar, t.fillTempC, t.settledTempC)
}
