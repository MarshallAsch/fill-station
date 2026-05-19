import { Maintenance } from '@/lib/models/maintenance'
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
	const record = await Maintenance.findByPk(id)
	if (!record) {
		return Response.json(
			{ error: 'not_found', message: 'Maintenance record not found' },
			{ status: 404 },
		)
	}

	const { date, hours, description } = await request.json()

	const before = {
		date: record.date.toISOString(),
		hours: record.hours,
		description: record.description,
	}

	record.date = dayjs(date)
	record.hours = Number(hours)
	record.description = description ?? ''

	try {
		const saved = await record.save()
		await auditLog(result.user!.id!, 'update', 'maintenance', id, {
			before,
			after: {
				date: record.date.toISOString(),
				hours: record.hours,
				description: record.description,
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
