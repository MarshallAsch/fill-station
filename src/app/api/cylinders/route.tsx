import { auth } from '@/auth'
import { Cylinder } from '@/lib/models/cylinder'
import dayjs from 'dayjs'

import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export async function GET(request: Request) {
	const session = await auth()
	if (!session)
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)

	let cylinders = await Cylinder.findAll()

	return Response.json(cylinders)
}

export async function POST(request: Request) {
	const session = await auth()
	if (!session)
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)

	let {
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
		let result = await Cylinder.create({
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
