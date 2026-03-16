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

	const body = await request.json()
	const { name, email, theme, role } = body

	if (role !== undefined) {
		return Response.json(
			{ error: 'forbidden', message: 'Not authorized to update role' },
			{ status: 403 },
		)
	}

	const notificationFields = [
		'notifyContact',
		'notifyHydro',
		'notifyVisual',
		'hydroReminderDays1',
		'hydroReminderDays2',
		'visualReminderDays1',
		'visualReminderDays2',
	] as const

	const hasNotificationField = notificationFields.some(
		(f) => body[f] !== undefined,
	)

	if (!name && !email && !theme && !hasNotificationField) {
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

		for (const field of notificationFields) {
			if (body[field] !== undefined) {
				const val = body[field]
				if (field.startsWith('notify') && typeof val !== 'boolean') continue
				if (
					field.includes('Days') &&
					(typeof val !== 'number' || val < 1 || val > 365)
				)
					continue
				;(user as any)[field] = val
			}
		}

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
