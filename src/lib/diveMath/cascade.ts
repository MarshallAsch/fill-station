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

export function calculateCascade(input: CascadeInput): CascadeResult {
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
		const eqAbs = (targetAbs * vt + bankAbs * vb) / (vt + vb)
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
