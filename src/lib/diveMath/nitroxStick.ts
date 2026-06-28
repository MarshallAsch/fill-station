import { AIR_FO2 } from './units'

export function nitroxStickFlowRate(input: {
	targetFo2: number
	airFlow: number
}): number {
	const { targetFo2, airFlow } = input
	if (targetFo2 <= AIR_FO2) return 0
	return (airFlow * (targetFo2 - AIR_FO2)) / (1 - targetFo2)
}

export interface SupplyDraw {
	o2SurfaceVolume: number
	supplyPressureDrop: number
}

export function nitroxStickSupplyDraw(input: {
	targetFo2: number
	tankVolume: number
	startPressure: number
	finalPressure: number
	supplyVolume: number
}): SupplyDraw {
	const { targetFo2, tankVolume, startPressure, finalPressure, supplyVolume } =
		input
	if (targetFo2 <= AIR_FO2) {
		return { o2SurfaceVolume: 0, supplyPressureDrop: 0 }
	}
	const addedSurfaceVolume = tankVolume * (finalPressure - startPressure)
	const o2Fraction = (targetFo2 - AIR_FO2) / (1 - AIR_FO2)
	const o2SurfaceVolume = addedSurfaceVolume * o2Fraction
	const supplyPressureDrop =
		supplyVolume > 0 ? o2SurfaceVolume / supplyVolume : Infinity
	return { o2SurfaceVolume, supplyPressureDrop }
}
