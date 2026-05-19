import { Fill } from '@/lib/models/fill'
import { requireRole, isErrorResponse } from '@/lib/permissions-server'
import { auditLog } from '@/lib/audit'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const { id } = await params
	const fill = await Fill.findByPk(id)
	if (!fill) {
		return Response.json(
			{ error: 'not_found', message: 'Fill not found' },
			{ status: 404 },
		)
	}

	const { date, startPressure, endPressure, oxygen, helium } =
		await request.json()

	const before = {
		date: fill.date.toISOString(),
		startPressure: fill.startPressure,
		endPressure: fill.endPressure,
		oxygen: fill.oxygen,
		helium: fill.helium,
	}

	fill.date = dayjs(date)
	fill.startPressure = Number(startPressure)
	fill.endPressure = Number(endPressure)
	fill.oxygen = Number(oxygen)
	fill.helium = Number(helium)

	try {
		const saved = await fill.save()
		await auditLog(result.user!.id!, 'update', 'fill', id, {
			before,
			after: {
				date: fill.date.toISOString(),
				startPressure: fill.startPressure,
				endPressure: fill.endPressure,
				oxygen: fill.oxygen,
				helium: fill.helium,
			},
		})
		return Response.json(saved)
	} catch (err: any) {
		console.error('error:', err)
		return Response.json(
			{ error: err.name, message: err.errors?.[0]?.message ?? err.message },
			{ status: 400 },
		)
	}
}
