import { Cylinder } from '@/lib/models/cylinder'
import { Visual } from '@/lib/models/visual'
import { requireRole, isErrorResponse } from '@/lib/permissions-server'
import dayjs from 'dayjs'

export async function POST() {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const cylinders = await Cylinder.findAll({
		include: [
			{
				model: Visual,
				attributes: ['date', 'markedOxygenClean'],
			},
		],
	})

	let updated = 0

	for (const cylinder of cylinders) {
		const visuals = cylinder.Visuals
		if (!visuals || visuals.length === 0) continue

		// Find the most recent visual by date
		const latest = visuals.reduce((a, b) =>
			dayjs(a.date).isAfter(dayjs(b.date)) ? a : b,
		)

		const visualDate = dayjs(latest.date)

		// Only update if the visual date is at least as new as the cylinder's lastVis
		if (visualDate.isBefore(dayjs(cylinder.lastVis))) continue

		let changed = false
		if (!visualDate.isSame(dayjs(cylinder.lastVis))) {
			cylinder.lastVis = visualDate
			changed = true
		}
		if (cylinder.oxygenClean !== latest.markedOxygenClean) {
			cylinder.oxygenClean = latest.markedOxygenClean
			changed = true
		}

		if (changed) {
			await cylinder.save()
			updated++
		}
	}

	return Response.json({ updated })
}
