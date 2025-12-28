import { Client } from '@/lib/models/client'
import { Cylinder } from '@/lib/models/cylinder'
import { Visual } from '@/lib/models/visual'
import dayjs from 'dayjs'

import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ cylinderId: string }> },
) {
	const { cylinderId } = await params

	let cylinders = await Visual.findAll({
		where: {
			cylinderId: cylinderId,
		},
	})

	return Response.json(cylinders)
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ cylinderId: string }> },
) {
	const { cylinderId } = await params

	let cylinder = await Cylinder.findByPk(cylinderId)

	if (!cylinder) {
		return Response.json(
			{ message: `cylinder Not Fount with ID: ${cylinderId}` },
			{ status: 404 },
		)
	}

	let {
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
	} = await request.json()

	let inspector = await Client.findByPk(inspectorId)

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
		})

		result.setInspector(inspector)
		result = await result.save()

		return Response.json(result)
	} catch (err: any) {
		console.error('error:', err)
		return Response.json(
			{ error: err.name, message: err.errors[0].message },
			{ status: 400 },
		)
	}
}
