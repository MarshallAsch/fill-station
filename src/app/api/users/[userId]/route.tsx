import { requireRole, isErrorResponse } from '@/lib/permissions'
import { User, VALID_ROLES } from '@/lib/models/user'
import { auditLog } from '@/lib/audit'

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ userId: string }> },
) {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const { userId } = await params
	const { role, clientId } = await request.json()

	if (role !== undefined && !VALID_ROLES.includes(role)) {
		return Response.json(
			{ error: 'invalid', message: 'Invalid role value' },
			{ status: 400 },
		)
	}

	if (role !== undefined && role !== 'admin') {
		// Check if this is self-demotion
		if (userId === result.user!.id) {
			const adminCount = await User.count({ where: { role: 'admin' } })
			if (adminCount <= 1) {
				return Response.json(
					{ error: 'forbidden', message: 'Cannot remove the last admin' },
					{ status: 400 },
				)
			}
		}
	}

	try {
		const user = await User.findByPk(userId)

		if (!user) {
			return Response.json(
				{ error: 'not_found', message: 'User not found' },
				{ status: 404 },
			)
		}

		if (role !== undefined) user.role = role
		if (clientId !== undefined) user.clientId = clientId

		await user.save()
		await auditLog(result.user!.id!, 'update', 'user', userId, {
			role,
			clientId,
		})

		return Response.json(user)
	} catch (err: any) {
		console.error('error:', err)
		return Response.json(
			{ error: err.name, message: err.message },
			{ status: 400 },
		)
	}
}
