import { requireRole, isErrorResponse } from '@/lib/permissions-server'
import { User } from '@/lib/models/user'
import { Client } from '@/lib/models/client'

export async function GET() {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const users = await User.findAll({
		include: [{ model: Client, as: 'client', attributes: ['name'] }],
	})

	return Response.json(users)
}
