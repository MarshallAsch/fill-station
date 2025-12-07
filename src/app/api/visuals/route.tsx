import { Visual } from '@/lib/models/visual'
import dayjs from 'dayjs'

import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export async function GET(request: Request) {
	// For example, fetch data from your DB here

	let visual = await Visual.findAll()

	return Response.json(visual)
}

export async function POST(request: Request) {
	// For example, fetch data from your DB here

	let visual = await Visual.create({})

	return Response.json(visual)
}
