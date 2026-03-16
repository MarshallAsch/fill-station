import cron from 'node-cron'
import dayjs from 'dayjs'
import { Op } from 'sequelize'
import { Client } from './models/client'
import { Cylinder } from './models/cylinder'
import { User } from './models/user'
import { NotificationLog } from './models/notificationLog'
import { sendEmail } from './email/transport'
import {
	hydroReminderEmail,
	visualReminderEmail,
} from './email/templates'

let scheduled = false

export function startCronJobs() {
	if (scheduled) return
	scheduled = true

	// Daily at 8:00 AM UTC
	cron.schedule('0 8 * * *', async () => {
		console.log('Running daily notification check...')
		try {
			await checkDueReminders()
		} catch (err) {
			console.error('Cron notification check failed:', err)
		}
	})

	console.log('Cron jobs scheduled')
}

async function checkDueReminders() {
	const today = dayjs().format('YYYY-MM-DD')

	// Find all clients that have cylinders
	const clients = await Client.findAll({
		include: [
			{
				model: Cylinder,
				as: 'Cylinders',
			},
		],
	})

	for (const client of clients) {
		const cylinders = client.Cylinders ?? []
		if (cylinders.length === 0) continue

		// Find users linked to this client who have emails
		const users = await User.findAll({
			where: {
				clientId: client.id,
				email: { [Op.ne]: null },
			},
		})

		if (users.length === 0) continue

		for (const cylinder of cylinders) {
			const nextHydro = dayjs(cylinder.lastHydro).add(5, 'year')
			const nextVis = dayjs(cylinder.lastVis).add(1, 'year')

			for (const user of users) {
				// Hydro reminders
				if (user.notifyHydro) {
					for (const reminderDays of [
						user.hydroReminderDays1,
						user.hydroReminderDays2,
					]) {
						const reminderDate = nextHydro.subtract(
							reminderDays,
							'day',
						)
						if (reminderDate.format('YYYY-MM-DD') === today) {
							await sendReminderIfNotSent({
								userId: user.id,
								type: 'hydro_reminder',
								cylinderId: cylinder.id,
								reminderDays,
								today,
								email: user.email!,
								html: hydroReminderEmail(
									user.name ?? 'Customer',
									cylinder.serialNumber,
									nextHydro.format('MMM D, YYYY'),
								),
								subject: `Hydro Test Due Soon — ${cylinder.serialNumber}`,
							})
						}
					}
				}

				// Visual reminders
				if (user.notifyVisual) {
					for (const reminderDays of [
						user.visualReminderDays1,
						user.visualReminderDays2,
					]) {
						const reminderDate = nextVis.subtract(
							reminderDays,
							'day',
						)
						if (reminderDate.format('YYYY-MM-DD') === today) {
							await sendReminderIfNotSent({
								userId: user.id,
								type: 'visual_reminder',
								cylinderId: cylinder.id,
								reminderDays,
								today,
								email: user.email!,
								html: visualReminderEmail(
									user.name ?? 'Customer',
									cylinder.serialNumber,
									nextVis.format('MMM D, YYYY'),
								),
								subject: `Visual Inspection Due Soon — ${cylinder.serialNumber}`,
							})
						}
					}
				}
			}
		}
	}
}

async function sendReminderIfNotSent(params: {
	userId: string
	type: 'hydro_reminder' | 'visual_reminder'
	cylinderId: number
	reminderDays: number
	today: string
	email: string
	html: string
	subject: string
}) {
	// Check deduplication
	const existing = await NotificationLog.findOne({
		where: {
			userId: params.userId,
			type: params.type,
			cylinderId: params.cylinderId,
			reminderDays: params.reminderDays,
			sentAt: params.today,
		},
	})

	if (existing) return

	// Send email — only log on success
	const sent = await sendEmail(params.email, params.subject, params.html)

	if (sent) {
		await NotificationLog.create({
			userId: params.userId,
			type: params.type,
			cylinderId: params.cylinderId,
			reminderDays: params.reminderDays,
			sentAt: params.today,
		})
	}
}
