import { Maintenance } from '@/lib/models/maintenance'
import { NewMaintenanceDTO } from '@/types/maintenance'
import dayjs from 'dayjs'
import { requireRole, isErrorResponse } from '@/lib/permissions-server'
import { auditLog } from '@/lib/audit'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export async function GET(request: Request) {
	const result = await requireRole(['filler', 'inspector', 'admin'])
	if (isErrorResponse(result)) return result

	const maintenance = await Maintenance.findAll({
		order: [
			['date', 'ASC'],
			['hours', 'DESC'],
		],
	})
	return Response.json(maintenance)
}

export async function POST(request: Request) {
	const result = await requireRole(['filler', 'inspector', 'admin'])
	if (isErrorResponse(result)) return result

	const record: NewMaintenanceDTO = await request.json()

	const maintenance = await Maintenance.create(record)
	return Response.json(maintenance)
}

export async function DELETE(request: Request) {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const { id } = await request.json()
	const record = await Maintenance.findByPk(id)

	if (!record) {
		return Response.json(
			{ error: 'not_found', message: 'Maintenance record not found' },
			{ status: 404 },
		)
	}

	await record.destroy()
	await auditLog(result.user!.id!, 'delete', 'maintenance', id)
	return Response.json({ message: 'Maintenance record deleted' })
}
