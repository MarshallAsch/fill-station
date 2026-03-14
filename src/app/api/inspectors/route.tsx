import { Client } from '@/lib/models/client'
import { Op } from 'sequelize'
import { requireRole, isErrorResponse } from '@/lib/permissions'
export async function GET(request: Request) {
	const result = await requireRole(['filler', 'inspector', 'admin'])
	if (isErrorResponse(result)) return result

	const clients = await Client.findAll({
		where: {
			inspectionCert: {
				[Op.not]: '',
			},
		},
	})
	return Response.json(clients)
}
