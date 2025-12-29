import { Client } from '@/lib/models/client'
import { Op } from 'sequelize'

export async function GET(request: Request) {
	let clients = await Client.findAll({
		where: {
			inspectionCert: {
				[Op.not]: '',
			},
		},
	})
	return Response.json(clients)
}
