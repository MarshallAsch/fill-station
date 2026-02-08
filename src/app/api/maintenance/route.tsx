import { Maintenance } from '@/lib/models/maintenance'
import { NewMaintenanceDTO } from '@/types/maintenance'
import dayjs from 'dayjs'

import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export async function GET(request: Request) {
	let result = await Maintenance.findAll({ order: [['date', 'ASC']] })
	return Response.json(result)
}

export async function POST(request: Request) {
	let record: NewMaintenanceDTO = await request.json()

	let result = await Maintenance.create(record)
	return Response.json(result)
}
