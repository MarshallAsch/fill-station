import { requireRole, isErrorResponse } from '@/lib/permissions-server'
import { sendEmail } from '@/lib/email/transport'

export async function POST() {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const email = result.user?.email
	if (!email) {
		return Response.json(
			{ error: 'no_email', message: 'No email address on your account' },
			{ status: 400 },
		)
	}

	const sent = await sendEmail(
		email,
		'Fill Station — Test Email',
		'<h1>Test Email</h1><p>This is a test email from Fill Station. Your email configuration is working correctly.</p>',
	)

	if (!sent) {
		return Response.json(
			{
				error: 'send_failed',
				message: 'Failed to send email. Check SMTP configuration.',
			},
			{ status: 500 },
		)
	}

	return Response.json({ success: true })
}
