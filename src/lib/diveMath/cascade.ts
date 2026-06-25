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

	// Residuals default to the untouched gauge pressure.
	const residual = banks.map((b) => b.pressure)

	// Connect banks lowest gauge pressure first to preserve high-pressure gas.
	const order = banks
		.map((_, i) => i)
		.sort((a, b) => banks[a].pressure - banks[b].pressure)

	for (const i of order) {
		const bankAbs = banks[i].pressure + ATMOSPHERIC_BAR
		if (bankAbs <= targetAbs) continue // cannot raise the target further
		const vb = banks[i].volume
		const useReal = opts?.useRealGas === true
		const zt = useReal ? mixZ({ fo2: 0.209, fhe: 0, pressureBar: targetAbs }) : 1
		const zb = useReal ? mixZ({ fo2: 0.209, fhe: 0, pressureBar: bankAbs }) : 1
		const wt = vt / zt
		const wb = vb / zb
		const eqAbs = (targetAbs * wt + bankAbs * wb) / (wt + wb)
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
