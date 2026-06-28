// First-order real-gas approximation. Per-gas compressibility modeled as a
// linear function of pressure, Z(P) = 1 + k * P (P in bar), with coefficients
// fit to published Z data near room temperature (~15–20 °C): at ~200 bar
// O2 ≈ 0.96, N2 ≈ 1.04, He ≈ 1.05, so dry air ≈ 1.03 — which brings a nominal
// "AL80" (11.1 L × 207 bar) down to ~79 cf from the ideal 81, close to the real
// 77.4. Approximate; covered by the reference-only disclaimer.
export type Gas = 'o2' | 'n2' | 'he'

export const Z_COEFF: Record<Gas, number> = {
	o2: -0.0002,
	n2: 0.0002,
	he: 0.00025,
}

export function gasZ(gas: Gas, pressureBar: number): number {
	return 1 + Z_COEFF[gas] * pressureBar
}

export function mixZ(input: {
	fo2: number
	fhe: number
	pressureBar: number
}): number {
	const { fo2, fhe, pressureBar } = input
	const fn2 = 1 - fo2 - fhe
	return (
		fo2 * gasZ('o2', pressureBar) +
		fhe * gasZ('he', pressureBar) +
		fn2 * gasZ('n2', pressureBar)
	)
}
