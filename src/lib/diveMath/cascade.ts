import { mixZ } from './compressibility'
import { ATMOSPHERIC_BAR } from './units'

export interface BankCylinder {
	volume: number
	pressure: number
}

export interface CascadeInput {
	banks: BankCylinder[]
	target: { volume: number; startPressure: number }
	desiredPressure?: number
}

export interface CascadeResult {
	finalPressure: number
	banks: { residualPressure: number }[]
	reachedDesired: boolean
}

export function calculateCascade(
	input: CascadeInput,
	opts?: { useRealGas?: boolean },
): CascadeResult {
	const { banks, target, desiredPressure } = input
	const vt = target.volume
	let targetAbs = target.startPressure + ATMOSPHERIC_BAR
	// The filler closes the valve once the cylinder is up to pressure, so the
	// fill stops at the desired pressure rather than equalizing past it.
	const desiredAbs =
		desiredPressure != null ? desiredPressure + ATMOSPHERIC_BAR : null

	// Residuals default to the untouched gauge pressure.
	const residual = banks.map((b) => b.pressure)

	// Connect banks lowest gauge pressure first to preserve high-pressure gas.
	const order = banks
		.map((_, i) => i)
		.sort((a, b) => banks[a].pressure - banks[b].pressure)

	for (const i of order) {
		if (desiredAbs != null && targetAbs >= desiredAbs - 1e-9) break // already full
		const bankAbs = banks[i].pressure + ATMOSPHERIC_BAR
		if (bankAbs <= targetAbs) continue // cannot raise the target further
		const vb = banks[i].volume
		const useReal = opts?.useRealGas === true
		const zt = useReal ? mixZ({ fo2: 0.209, fhe: 0, pressureBar: targetAbs }) : 1
		const zb = useReal ? mixZ({ fo2: 0.209, fhe: 0, pressureBar: bankAbs }) : 1
		const wt = vt / zt
		const wb = vb / zb
		const eqAbs = (targetAbs * wt + bankAbs * wb) / (wt + wb)

		if (desiredAbs != null && eqAbs > desiredAbs) {
			// This bank overshoots, so draw only the gas needed to top it off.
			residual[i] =
				bankAbs - ((desiredAbs - targetAbs) * wt) / wb - ATMOSPHERIC_BAR
			targetAbs = desiredAbs
			break
		}

		targetAbs = eqAbs
		residual[i] = eqAbs - ATMOSPHERIC_BAR
	}

	const finalPressure = targetAbs - ATMOSPHERIC_BAR
	const reachedDesired =
		desiredPressure != null && finalPressure >= desiredPressure - 1e-9

	return {
		finalPressure,
		banks: residual.map((r) => ({ residualPressure: r })),
		reachedDesired,
	}
}
