import { auth } from '@/auth'
import { User } from '@/lib/models/user'

const VALID_THEMES = ['light', 'dark', 'system']

export async function PUT(request: Request) {
	const session = await auth()
	if (!session?.user)
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)

	const { name, email, theme, role } = await request.json()

	if (role !== undefined) {
		return Response.json(
			{ error: 'forbidden', message: 'Not authorized to update role' },
			{ status: 403 },
		)
	}

	if (!name && !email && !theme) {
		return Response.json(
			{ error: 'missing', message: 'Nothing to update' },
			{ status: 400 },
		)
	}
	if (theme && !VALID_THEMES.includes(theme)) {
		return Response.json(
			{ error: 'invalid', message: 'Invalid theme value' },
			{ status: 400 },
		)
	}

	try {
		const user = await User.findByPk(session.user.id)

		if (!user) {
			return Response.json(
				{ error: 'not_found', message: 'User not found' },
				{ status: 404 },
			)
		}

		if (name !== undefined) user.name = name
		if (email !== undefined) user.email = email
		if (theme !== undefined) user.theme = theme

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
