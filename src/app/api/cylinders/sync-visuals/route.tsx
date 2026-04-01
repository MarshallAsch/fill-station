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
		const visuals = cylinder.visuals
		if (!visuals || visuals.length === 0) continue

		// Find the most recent visual by date
		const latest = visuals.reduce((a, b) =>
			dayjs(a.date).isAfter(dayjs(b.date)) ? a : b,
		)

		const visualDate = dayjs(latest.date)

		// Only update if the visual date is newer than the cylinder's lastVis
		if (!visualDate.isAfter(dayjs(cylinder.lastVis))) continue

		cylinder.lastVis = visualDate
		cylinder.oxygenClean = latest.markedOxygenClean
		await cylinder.save()
		updated++
	}

	return Response.json({ updated })
}
