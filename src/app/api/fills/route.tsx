import { Cylinder } from '@/lib/models/cylinder'
import { Fill } from '@/lib/models/fill'
import { requireRole, isErrorResponse } from '@/lib/permissions'
import { FillDto } from '@/types/fills'
import { auditLog } from '@/lib/audit'
export async function GET() {
	const result = await requireRole(['filler', 'inspector', 'admin'])
	if (isErrorResponse(result)) return result

	const fills = await Fill.findAll({
		include: Cylinder,
	})
	return Response.json(fills)
}

export async function POST(request: Request) {
	const result = await requireRole(['filler', 'inspector', 'admin'])
	if (isErrorResponse(result)) return result

	const fills: FillDto[] = await request.json()
	let cylinders: Cylinder[] = []

	try {
		cylinders = (
			await Promise.all(fills.map((fill) => Cylinder.findByPk(fill.cylinderId)))
		).filter((cylinder) => cylinder !== null) as Cylinder[]
	} catch (err: any) {
		return Response.json(
			{ error: err.name, message: err.errors[0].message },
			{ status: 404 },
		)
	}

	try {
		const created = await Promise.all(
			fills.map((fill, index) =>
				cylinders[index].createFill({
					date: fill.date,
					startPressure: fill.startPressure,
					endPressure: fill.endPressure,
					oxygen: fill.oxygen,
					helium: fill.helium,
				}),
			),
		)

		await Promise.all(
			created.map((fill, index) =>
				auditLog(result.user!.id!, 'create', 'fill', fill.id, {
					cylinderId: fills[index].cylinderId,
				}),
			),
		)

		return await Response.json(created)
	} catch (err: any) {
		console.error('error:', err)
		return Response.json(
			{ error: err.name, message: err.errors[0].message },
			{ status: 400 },
		)
	}
}

export async function DELETE(request: Request) {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const { id } = await request.json()
	const fill = await Fill.findByPk(id)

	if (!fill) {
		return Response.json(
			{ error: 'not_found', message: 'Fill not found' },
			{ status: 404 },
		)
	}

	await fill.destroy()
	await auditLog(result.user!.id!, 'delete', 'fill', id)
	return Response.json({ message: 'Fill deleted' })
}
