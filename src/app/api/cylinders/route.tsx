import { Cylinder } from '@/lib/models/cylinder'
import { Client } from '@/lib/models/client'
import dayjs from 'dayjs'
import { requireRole, isErrorResponse } from '@/lib/permissions-server'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export async function GET(request: Request) {
	const result = await requireRole(['filler', 'inspector', 'admin'])
	if (isErrorResponse(result)) return result

	const cylinders = await Cylinder.findAll({
		include: [
			{ model: Client, attributes: ['id', 'name'] },
			{
				model: Cylinder,
				as: 'pairedCylinder',
				attributes: [
					'id',
					'serialNumber',
					'nickname',
					'servicePressure',
					'oxygenClean',
					'ownerId',
				],
			},
		],
	})

	return Response.json(cylinders)
}

export async function POST(request: Request) {
	const result = await requireRole(['filler', 'inspector', 'admin'])
	if (isErrorResponse(result)) return result

	const {
		serialNumber,
		ownerId,
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

	console.log(dayjs(birth, 'YYYY-MM-DD'))
	try {
		const result = await Cylinder.create({
			serialNumber: serialNumber,
			birth: dayjs(birth, 'YYYY-MM-DD'),
			lastHydro: dayjs(lastHydro, 'YYYY-MM-DD'),
			lastVis: dayjs(lastVis, 'YYYY-MM-DD'),
			oxygenClean: oxygenClean,
			ownerId: ownerId,
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
