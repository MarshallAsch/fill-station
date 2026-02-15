import { Client } from '@/lib/models/client'
import { Cylinder } from '@/lib/models/cylinder'
import dayjs from 'dayjs'

import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ clientId: string }> },
) {
	const { clientId } = await params

	let cylinders = await Cylinder.findAll({
		where: {
			ownerId: clientId,
		},
	})

	return Response.json(cylinders)
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ clientId: string }> },
) {
	const { clientId } = await params

	let client = await Client.findByPk(clientId)

	if (!client) {
		return Response.json(
			{ message: `Client Not Found with ID: ${clientId}` },
			{ status: 404 },
		)
	}

	let {
		serialNumber,
		birth,
		lastHydro,
		lastVis,
		oxygenClean,
		servicePressure,
	} = await request.json()

	if (
		!serialNumber ||
		!birth ||
		!lastHydro ||
		!lastVis ||
		!servicePressure ||
		oxygenClean == undefined
	) {
		return Response.json(
			{ error: 'missing', message: 'Missing required fields' },
			{ status: 400 },
		)
	}

	try {
		let result = await client.createCylinder({
			serialNumber: serialNumber,
			birth: dayjs(birth, 'YYYY-MM-DD'),
			lastHydro: dayjs(lastHydro, 'YYYY-MM-DD'),
			lastVis: dayjs(lastVis, 'YYYY-MM-DD'),
			oxygenClean: oxygenClean,
			servicePressure: servicePressure,
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
