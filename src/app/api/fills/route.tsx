import { auth } from '@/auth'
import { Cylinder } from '@/lib/models/cylinder'
import { Fill } from '@/lib/models/fill'
import dayjs from 'dayjs'

export async function GET(request: Request) {
	const session = await auth()
	if (!session)
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)

	let fills = await Fill.findAll({
		include: Cylinder,
	})
	return Response.json(fills)
}

type FillDto = {
	date: dayjs.Dayjs
	cylinderId: number
	startPressure: number
	endPressure: number
	oxygen: number
	helium: number
}

export async function POST(request: Request) {
	const session = await auth()
	if (!session)
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)

	let fills: FillDto[] = await request.json()
	let cylinders: Cylinder[] = []

	try {
		let cylinders = await fills.map((fill) =>
			Cylinder.findByPk(fill.cylinderId),
		)
	} catch (err: any) {
		return Response.json(
			{ error: err.name, message: err.errors[0].message },
			{ status: 404 },
		)
	}

	try {
		let created = await fills.map((fill, index) =>
			cylinders[index].createFill({
				date: fill.date,
				startPressure: fill.startPressure,
				endPressure: fill.endPressure,
				oxygen: fill.oxygen,
				helium: fill.helium,
			}),
		)

		return Response.json(created)
	} catch (err: any) {
		console.error('error:', err)
		return Response.json(
			{ error: err.name, message: err.errors[0].message },
			{ status: 400 },
		)
	}
}
