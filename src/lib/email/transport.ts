import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import nconf from '../config'

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
	if (transporter) return transporter

	const host = nconf.get('smtp:host')
	if (!host) {
		console.warn(
			'SMTP not configured — email sending disabled. Set SMTP__HOST to enable.',
		)
		return null
	}

	const user = nconf.get('smtp:user')
	const pass = nconf.get('smtp:password')

	transporter = nodemailer.createTransport({
		host,
		port: nconf.get('smtp:port') ?? 587,
		...(user && pass ? { auth: { user, pass } } : {}),
	})

	return transporter
}

export async function sendEmail(
	to: string,
	subject: string,
	html: string,
): Promise<boolean> {
	const t = getTransporter()
	if (!t) return false

	try {
		await t.sendMail({
			from: nconf.get('smtp:from') ?? 'noreply@fillstation.local',
			to,
			subject,
			html,
		})
		return true
	} catch (err) {
		console.error('Failed to send email:', err)
		return false
	}
}

export function getShopEmail(): string | undefined {
	return nconf.get('smtp:shop_email') || undefined
}
