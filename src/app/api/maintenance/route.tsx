import { auth } from '@/auth'
import { Maintenance } from '@/lib/models/maintenance'
import { NewMaintenanceDTO } from '@/types/maintenance'
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

	let result = await Maintenance.findAll({ order: [['date', 'ASC']] })
	return Response.json(result)
}

export async function POST(request: Request) {
	const session = await auth()
	if (!session)
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)

	let record: NewMaintenanceDTO = await request.json()

	let result = await Maintenance.create(record)
	return Response.json(result)
}
