export interface GasFill {
	pressure: number
	fo2: number
	fhe: number
}

export function mixTwoGases(a: GasFill, b: GasFill): GasFill {
	const pf = a.pressure + b.pressure
	if (pf <= 0) {
		return { pressure: 0, fo2: a.fo2, fhe: a.fhe }
	}
	return {
		pressure: pf,
		fo2: (a.fo2 * a.pressure + b.fo2 * b.pressure) / pf,
		fhe: (a.fhe * a.pressure + b.fhe * b.pressure) / pf,
	}
}
