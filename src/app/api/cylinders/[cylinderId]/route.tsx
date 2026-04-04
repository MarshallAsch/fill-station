import dayjs from 'dayjs'
import { requireRole, isErrorResponse } from '@/lib/permissions-server'
import { auditLog } from '@/lib/audit'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Cylinder } from '@/lib/models/cylinder'
dayjs.extend(customParseFormat)

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ cylinderId: string }> },
) {
	const result = await requireRole(['filler', 'inspector', 'admin'])
	if (isErrorResponse(result)) return result

	const { cylinderId } = await params

	const cylinder = await Cylinder.findByPk(cylinderId)

	if (!cylinder) {
		return Response.json(
			{ message: `Cylinder Not Found with ID: ${cylinderId}` },
			{ status: 404 },
		)
	}

	const {
		serialNumber,
		birth,
		lastHydro,
		lastVis,
		oxygenClean,
		servicePressure,
		nickname,
		manufacturer,
		size,
	} = await request.json()

	cylinder.serialNumber = serialNumber
	cylinder.birth = dayjs(birth, 'YYYY-MM-DD')
	cylinder.lastHydro = dayjs(lastHydro, 'YYYY-MM-DD')
	cylinder.lastVis = dayjs(lastVis, 'YYYY-MM-DD')
	cylinder.oxygenClean = oxygenClean
	cylinder.servicePressure = servicePressure
	cylinder.nickname = nickname || null
	cylinder.manufacturer = manufacturer || null
	cylinder.size = size ? Number(size) : null
	cylinder.verified = true

	try {
		const result = await cylinder.save()
		return Response.json(result)
	} catch (err: any) {
		console.error('error:', err)
		return Response.json(
			{ error: err.name, message: err.errors[0].message },
			{ status: 400 },
		)
	}
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ cylinderId: string }> },
) {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const { cylinderId } = await params
	const cylinder = await Cylinder.findByPk(cylinderId)

	if (!cylinder) {
		return Response.json(
			{ error: 'not_found', message: 'Cylinder not found' },
			{ status: 404 },
		)
	}

	await cylinder.destroy()
	await auditLog(result.user!.id!, 'delete', 'cylinder', cylinderId, {
		serialNumber: cylinder.serialNumber,
	})
	return Response.json({ message: 'Cylinder deleted' })
}
