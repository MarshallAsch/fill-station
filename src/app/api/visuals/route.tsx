import { Cylinder } from '@/lib/models/cylinder'
import { Visual } from '@/lib/models/visual'
import dayjs from 'dayjs'

import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export async function GET(request: Request) {
	let visual = await Visual.findAll({
		include: Cylinder,
	})
	return Response.json(visual)
}
