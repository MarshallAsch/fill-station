import { requireRole, isErrorResponse } from '@/lib/permissions-server'
import {
	welcomeEmail,
	contactNotificationEmail,
	hydroReminderEmail,
	visualReminderEmail,
} from '@/lib/email/templates'
import { NextRequest } from 'next/server'

const templates: Record<string, () => string> = {
	welcome: () => welcomeEmail('Jane Smith'),
	contact: () =>
		contactNotificationEmail(
			'John Doe',
			'john@example.com',
			'Hi, I have a question about my cylinder hydro test schedule. Can you let me know when my next test is due?',
		),
	hydro: () => hydroReminderEmail('Jane Smith', 'ALU-12345', 'Jun 15, 2026'),
	visual: () => visualReminderEmail('Jane Smith', 'ALU-12345', 'Sep 1, 2026'),
}

export async function GET(request: NextRequest) {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const template = request.nextUrl.searchParams.get('template')

	if (!template || !templates[template]) {
		return Response.json(
			{
				error: 'invalid_template',
				message: `Valid templates: ${Object.keys(templates).join(', ')}`,
			},
			{ status: 400 },
		)
	}

	const html = templates[template]()
	return new Response(html, {
		headers: { 'Content-Type': 'text/html; charset=utf-8' },
	})
}
