import { Cylinder } from '@/lib/models/cylinder'
import dayjs from 'dayjs'

import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export async function GET(request: Request) {
	// For example, fetch data from your DB here

	let cylinders = await Cylinder.findAll()

	return Response.json(cylinders)
}

export async function POST(request: Request) {
	// For example, fetch data from your DB here

	let { serialNumber, birth, lastHydro, lastVis, oxygenClean } =
		await request.json()

	if (
		!serialNumber ||
		!birth ||
		!lastHydro ||
		!lastVis ||
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
