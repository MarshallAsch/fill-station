// NOAA single-exposure CNS limits: ppO2 (ata) -> max minutes.
export const CNS_TABLE: [number, number][] = [
	[0.6, 720],
	[0.7, 570],
	[0.8, 450],
	[0.9, 360],
	[1.0, 300],
	[1.1, 240],
	[1.2, 210],
	[1.3, 180],
	[1.4, 150],
	[1.5, 120],
	[1.6, 45],
]

export function cnsLimitMinutes(ppo2: number): number {
	if (ppo2 < CNS_TABLE[0][0]) return Infinity
	const last = CNS_TABLE[CNS_TABLE.length - 1]
	if (ppo2 >= last[0]) return last[1]
	for (let i = 0; i < CNS_TABLE.length - 1; i++) {
		const [p0, l0] = CNS_TABLE[i]
		const [p1, l1] = CNS_TABLE[i + 1]
		if (ppo2 >= p0 && ppo2 <= p1) {
			const t = (ppo2 - p0) / (p1 - p0)
			return l0 + t * (l1 - l0)
		}
	}
	return last[1]
}

export function segmentCns(input: { ppo2: number; minutes: number }): number {
	const limit = cnsLimitMinutes(input.ppo2)
	if (!Number.isFinite(limit)) return 0
	return (input.minutes / limit) * 100
}

export function segmentOtu(input: { ppo2: number; minutes: number }): number {
	if (input.ppo2 <= 0.5) return 0
	return input.minutes * Math.pow((input.ppo2 - 0.5) / 0.5, 0.83)
}

export type DayItem =
	| { type: 'dive'; ppo2: number; minutes: number }
	| { type: 'surface'; minutes: number }

export interface DayResult {
	peakCnsPercent: number
	endCnsPercent: number
	totalOtu: number
	perDive: { cnsPercent: number; otu: number }[]
}

export function computeDay(items: DayItem[]): DayResult {
	let running = 0
	let peak = 0
	let totalOtu = 0
	const perDive: { cnsPercent: number; otu: number }[] = []

	for (const item of items) {
		if (item.type === 'surface') {
			running *= Math.pow(0.5, item.minutes / 90)
			continue
		}
		const cns = segmentCns({ ppo2: item.ppo2, minutes: item.minutes })
		const otu = segmentOtu({ ppo2: item.ppo2, minutes: item.minutes })
		running += cns
		totalOtu += otu
		peak = Math.max(peak, running)
		perDive.push({ cnsPercent: cns, otu })
	}

	return { peakCnsPercent: peak, endCnsPercent: running, totalOtu, perDive }
}
