import { Cylinder } from '@/lib/models/cylinder'
import { Fill } from '@/lib/models/fill'
import { auth } from '@/auth'
import { FillDto } from '@/types/fills'
export async function GET() {
	const session = await auth()
	if (!session)
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)
	const fills = await Fill.findAll({
		include: Cylinder,
	})
	return Response.json(fills)
}

export async function POST(request: Request) {
	const session = await auth()
	if (!session)
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)
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

		return await Response.json(created)
	} catch (err: any) {
		console.error('error:', err)
		return Response.json(
			{ error: err.name, message: err.errors[0].message },
			{ status: 400 },
		)
	}
}
