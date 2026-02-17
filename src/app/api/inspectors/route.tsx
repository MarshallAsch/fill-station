import { auth } from '@/auth'
import { Client } from '@/lib/models/client'
import { Op } from 'sequelize'

export async function GET(request: Request) {
	const session = await auth()
	if (!session)
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)

	let clients = await Client.findAll({
		where: {
			inspectionCert: {
				[Op.not]: '',
			},
		},
	})
	return Response.json(clients)
}
