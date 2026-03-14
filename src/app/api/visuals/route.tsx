import { Cylinder } from '@/lib/models/cylinder'
import { Visual } from '@/lib/models/visual'
import dayjs from 'dayjs'
import { requireRole, isErrorResponse } from '@/lib/permissions'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export async function GET(request: Request) {
	const result = await requireRole(['filler', 'inspector', 'admin'])
	if (isErrorResponse(result)) return result

	const visual = await Visual.findAll({
		include: Cylinder,
	})
	return Response.json(visual)
}
