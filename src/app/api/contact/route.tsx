import dayjs from 'dayjs'
import { requireRole, isErrorResponse } from '@/lib/permissions-server'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Contact } from '@/lib/models/contact'
import { NewContactDTO } from '@/types/contact'
import { User } from '@/lib/models/user'
import { sendEmail, getShopEmail } from '@/lib/email/transport'
import { contactNotificationEmail } from '@/lib/email/templates'
dayjs.extend(customParseFormat)

export async function GET(request: Request) {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const contacts = await Contact.findAll()
	return Response.json(contacts)
}

export async function POST(request: Request) {
	const record: NewContactDTO = await request.json()

	const result = await Contact.create(record)

	// Fire-and-forget: notify admins + shop email
	;(async () => {
		try {
			const html = contactNotificationEmail(
				record.name,
				record.email,
				record.message,
			)
			const subject = 'New Contact Form Submission'

			const admins = await User.findAll({
				where: {
					role: 'admin',
					notifyContact: true,
				},
			})

			for (const admin of admins) {
				if (admin.email) {
					await sendEmail(admin.email, subject, html)
				}
			}

			const shopEmail = getShopEmail()
			if (shopEmail) {
				await sendEmail(shopEmail, subject, html)
			}
		} catch (err) {
			console.error('Failed to send contact notification emails:', err)
		}
	})()

	return Response.json(result)
}
