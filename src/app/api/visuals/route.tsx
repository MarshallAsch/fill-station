import { auth } from '@/auth'
import { Cylinder } from '@/lib/models/cylinder'
import { Visual } from '@/lib/models/visual'
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

	let visual = await Visual.findAll({
		include: Cylinder,
	})
	return Response.json(visual)
}
