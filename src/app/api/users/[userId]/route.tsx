import { auth } from '@/auth'
import { User } from '@/lib/models/user'

const VALID_ROLES = ['user', 'admin']

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ userId: string }> },
) {
	const session = await auth()
	if (!session?.user)
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)

	if (session.user.role !== 'admin') {
		return Response.json(
			{ error: 'forbidden', message: 'Admin access required' },
			{ status: 403 },
		)
	}

	const { userId } = await params
	const { role, clientId } = await request.json()

	if (role !== undefined && !VALID_ROLES.includes(role)) {
		return Response.json(
			{ error: 'invalid', message: 'Invalid role value' },
			{ status: 400 },
		)
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

		return Response.json(user)
	} catch (err: any) {
		console.error('error:', err)
		return Response.json(
			{ error: err.name, message: err.message },
			{ status: 400 },
		)
	}
}
