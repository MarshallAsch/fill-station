import { Client } from '@/lib/models/client'
import { Cylinder } from '@/lib/models/cylinder'
import { Visual } from '@/lib/models/visual'
import dayjs from 'dayjs'
import { requireRole, isErrorResponse } from '@/lib/permissions'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { NewVisualDTO } from '@/types/visuals'
import { auditLog } from '@/lib/audit'
dayjs.extend(customParseFormat)

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ cylinderId: string }> },
) {
	const result = await requireRole(['filler', 'inspector', 'admin'])
	if (isErrorResponse(result)) return result

	const { cylinderId } = await params

	const cylinders = await Visual.findAll({
		where: {
			CylinderId: cylinderId,
		},
	})

	return Response.json(cylinders)
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ cylinderId: string }> },
) {
	const session = await requireRole(['inspector', 'admin'])
	if (isErrorResponse(session)) return session

	const { cylinderId } = await params

	const cylinder = await Cylinder.findByPk(cylinderId)

	if (!cylinder) {
		return Response.json(
			{ message: `cylinder Not Fount with ID: ${cylinderId}` },
			{ status: 404 },
		)
	}

	const {
		valve,
		heat,
		painted,
		odor,
		bow,
		bulges,
		bell,
		lineCorrosion,

		exteriorDescription,
		exteriorMarks,
		externalStandards,

		internalContents,
		internalDescription,
		internalMarks,
		internalStandards,

		threadingDescription,
		badThreadCount,
		threadingStandards,

		burstDiskReplaced,
		oringReplaced,
		dipTube,
		needService,
		rebuilt,

		status,
		date,
		oxygenCleaned,
		markedOxygenClean,
		inspectorId,
	} = (await request.json()) as NewVisualDTO

	const inspector = await Client.findByPk(inspectorId)

	if (!inspector || !inspector.inspectionCert) {
		return Response.json(
			{ message: `Inspector Not Fount with ID: ${inspectorId}` },
			{ status: 404 },
		)
	}

	try {
		let result = await cylinder.createVisual({
			valve,
			heat,
			painted,
			odor,
			bow,
			bulges,
			bell,
			lineCorrosion,

			exteriorDescription,
			exteriorMarks,
			externalStandards,

			internalContents,
			internalDescription,
			internalMarks,
			internalStandards,

			threadingDescription,
			badThreadCount,
			threadingStandards,

			burstDiskReplaced,
			oringReplaced,
			dipTube,
			needService,
			rebuilt,

			status,
			date,
			oxygenCleaned,
			markedOxygenClean,

			inspectorId: inspector.id,
		})

		result = await result.save()
		await auditLog(session.user!.id!, 'create', 'visual', result.id, {
			cylinderId,
		})

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
	// Delete all visuals for this cylinder
	await Visual.destroy({ where: { CylinderId: cylinderId } })
	return Response.json({ message: 'Visuals deleted' })
}
