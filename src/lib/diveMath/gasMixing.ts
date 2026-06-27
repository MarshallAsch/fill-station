import { ATMOSPHERIC_BAR } from './units'
import { mixZ } from './compressibility'

export interface TopUpInput {
	startBar: number // starting (gauge) pressure, bar
	startFo2: number // starting mix O₂ fraction (0–1)
	startFhe: number // starting mix He fraction (0–1)
	topFo2: number // top-up gas O₂ fraction (0–1)
	topFhe: number // top-up gas He fraction (0–1)
	finalBar: number // target (gauge) pressure to fill to, bar
	useRealGas?: boolean // apply compressibility; default false (ideal)
}

export interface TopUpResult {
	finalBar: number // resulting (gauge) pressure: finalBar, or startBar if no top-up
	addedBar: number // top-up gas added (gauge bar): max(0, finalBar - startBar)
	fo2: number // resulting O₂ fraction (0–1)
	fhe: number // resulting He fraction (0–1)
	noTopUp: boolean // true when finalBar <= startBar (nothing added)
}

// The resulting mix is a mole-weighted blend of the start gas and the top-up
// gas. `r` is the fraction of the final gas content that came from the start
// gas, so finalMix = r * startMix + (1 - r) * topUpMix. Real-gas content is
// proportional to Pabs / Z(mix, Pabs); since the final Z depends on the final
// mix, solve by a short fixed-point iteration seeded with the ideal blend.
export function topUpMix(input: TopUpInput): TopUpResult {
	const { startBar, startFo2, startFhe, topFo2, topFhe, finalBar } = input

	if (finalBar <= startBar) {
		return {
			finalBar: startBar,
			addedBar: 0,
			fo2: startFo2,
			fhe: startFhe,
			noTopUp: true,
		}
	}

	const startAbs = startBar + ATMOSPHERIC_BAR
	const finalAbs = finalBar + ATMOSPHERIC_BAR

	let r = startAbs / finalAbs // ideal-gas seed
	let fo2 = r * startFo2 + (1 - r) * topFo2
	let fhe = r * startFhe + (1 - r) * topFhe

	if (input.useRealGas) {
		const zStart = mixZ({
			fo2: startFo2,
			fhe: startFhe,
			pressureBar: startAbs,
		})
		for (let i = 0; i < 10; i++) {
			const zFinal = mixZ({ fo2, fhe, pressureBar: finalAbs })
			r = startAbs / zStart / (finalAbs / zFinal)
			fo2 = r * startFo2 + (1 - r) * topFo2
			fhe = r * startFhe + (1 - r) * topFhe
		}
	}

	return {
		finalBar,
		addedBar: finalBar - startBar,
		fo2,
		fhe,
		noTopUp: false,
	}
}
