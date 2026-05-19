export type FillMixCategory = 'air' | 'nitrox' | 'trimix'

type MixSource = { oxygen: number; helium: number }

export function getFillCategory(fill: MixSource): FillMixCategory {
	if (fill.helium > 0) return 'trimix'
	if (fill.oxygen === 20.9) return 'air'
	return 'nitrox'
}

export function getFillMix(fill: MixSource): string {
	if (fill.helium !== 0) return `${fill.oxygen}/${fill.helium}`
	if (fill.oxygen === 20.9) return 'air'
	return `EAN ${fill.oxygen}`
}
