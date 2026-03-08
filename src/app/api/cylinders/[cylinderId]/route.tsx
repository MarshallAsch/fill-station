import dayjs from 'dayjs'
import { auth } from '@/auth'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Cylinder } from '@/lib/models/cylinder'
dayjs.extend(customParseFormat)

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ cylinderId: string }> },
) {
	const session = await auth()
	if (!session) {
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)
	}
	const { cylinderId } = await params

	let cylinder = await Cylinder.findByPk(cylinderId)

	if (!cylinder) {
		return Response.json(
			{ message: `Cylinder Not Found with ID: ${cylinderId}` },
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

	cylinder.serialNumber = serialNumber
	cylinder.birth = dayjs(birth, 'YYYY-MM-DD')
	cylinder.lastHydro = dayjs(lastHydro, 'YYYY-MM-DD')
	cylinder.lastVis = dayjs(lastVis, 'YYYY-MM-DD')
	cylinder.oxygenClean = oxygenClean
	cylinder.servicePressure = servicePressure

	try {
		let result = await cylinder.save()
		return Response.json(result)
	} catch (err: any) {
		console.error('error:', err)
		return Response.json(
			{ error: err.name, message: err.errors[0].message },
			{ status: 400 },
		)
	}
}
