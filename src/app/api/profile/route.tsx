import { auth } from '@/auth'
import { sequelize } from '@/lib/models/config'
import { QueryTypes } from 'sequelize'

export async function PUT(request: Request) {
	const session = await auth()
	if (!session?.user)
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)

	const { name, email } = await request.json()

	if (!name && !email) {
		return Response.json(
			{ error: 'missing', message: 'Nothing to update' },
			{ status: 400 },
		)
	}

	try {
		await sequelize.query(
			'UPDATE users SET name = :name, email = :email WHERE email = :currentEmail',
			{
				replacements: {
					name: name ?? null,
					email: email ?? null,
					currentEmail: session.user.email,
				},
				type: QueryTypes.UPDATE,
			},
		)

		const [user] = await sequelize.query<{
			id: string
			name: string | null
			email: string | null
			image: string | null
		}>(
			'SELECT id, name, email, image FROM users WHERE email = :email LIMIT 1',
			{
				replacements: { email: email ?? session.user.email },
				type: QueryTypes.SELECT,
			},
		)

		return Response.json(user)
	} catch (err: any) {
		console.error('error:', err)
		return Response.json(
			{ error: err.name, message: err.message },
			{ status: 400 },
		)
	}
}
