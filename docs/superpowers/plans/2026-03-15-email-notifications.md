# Email Notifications Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email notifications for contact form submissions, new account welcome emails, and scheduled hydro/visual due reminders.

**Architecture:** Nodemailer transport configured via nconf SMTP env vars. Interactive notifications fire-and-forget from API routes and NextAuth events. Scheduled reminders run via node-cron daily job initialized in `instrumentation.ts`, deduplicated by a NotificationLog model. User preferences stored on the User model and editable from the profile page.

**Tech Stack:** nodemailer, node-cron, Sequelize, NextAuth events, nconf

**Spec:** `docs/superpowers/specs/2026-03-15-email-notifications-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/email/transport.ts` | Create | Nodemailer singleton, `sendEmail(to, subject, html)` |
| `src/lib/email/templates.ts` | Create | HTML template functions for each email type |
| `src/lib/cron.ts` | Create | node-cron daily job for scheduled reminders |
| `src/lib/models/notificationLog/index.tsx` | Create | NotificationLog Sequelize model |
| `src/lib/models/user/index.tsx` | Modify | Add 7 notification preference fields |
| `src/types/profile.ts` | Modify | Add notification fields to Profile + UpdateProfileDTO |
| `src/auth.ts` | Modify | Add `createUser` event for welcome email |
| `src/app/api/contact/route.tsx` | Modify | Send contact notification emails |
| `src/app/api/profile/route.tsx` | Modify | Accept notification fields, fix validation |
| `src/app/_api/index.ts` | No change needed | Already passes full DTO to axios; widening the type is sufficient |
| `src/components/Profile/ProfileForm.tsx` | Modify | Add notification preferences UI section |
| `src/app/profile/page.tsx` | Modify | Pass notification fields to ProfileForm |
| `src/instrumentation.ts` | Create | Register cron scheduler on server boot |
| `migrations/20241101000010-add-user-notification-prefs.cjs` | Create | Add preference columns to users table |
| `migrations/20241101000011-create-notification-log.cjs` | Create | Create notification_logs table |

---

## Chunk 1: Database & Email Infrastructure

### Task 1: Migration — User notification preferences

**Files:**
- Create: `migrations/20241101000010-add-user-notification-prefs.cjs`

- [ ] **Step 1: Create the migration file**

```js
'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('users', 'notify_contact', {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		})
		await queryInterface.addColumn('users', 'notify_hydro', {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		})
		await queryInterface.addColumn('users', 'notify_visual', {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		})
		await queryInterface.addColumn('users', 'hydro_reminder_days1', {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 180,
		})
		await queryInterface.addColumn('users', 'hydro_reminder_days2', {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 30,
		})
		await queryInterface.addColumn('users', 'visual_reminder_days1', {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 60,
		})
		await queryInterface.addColumn('users', 'visual_reminder_days2', {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 30,
		})
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('users', 'notify_contact')
		await queryInterface.removeColumn('users', 'notify_hydro')
		await queryInterface.removeColumn('users', 'notify_visual')
		await queryInterface.removeColumn('users', 'hydro_reminder_days1')
		await queryInterface.removeColumn('users', 'hydro_reminder_days2')
		await queryInterface.removeColumn('users', 'visual_reminder_days1')
		await queryInterface.removeColumn('users', 'visual_reminder_days2')
	},
}
```

- [ ] **Step 2: Commit**

```bash
git add migrations/20241101000010-add-user-notification-prefs.cjs
git commit -m "feat: add migration for user notification preferences"
```

---

### Task 2: Migration — NotificationLog table

**Files:**
- Create: `migrations/20241101000011-create-notification-log.cjs`

- [ ] **Step 1: Create the migration file**

```js
'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('notification_logs', {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				autoIncrement: true,
				primaryKey: true,
			},
			user_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: { model: 'users', key: 'id' },
				onDelete: 'CASCADE',
			},
			type: {
				type: Sequelize.ENUM('hydro_reminder', 'visual_reminder'),
				allowNull: false,
			},
			cylinder_id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				references: { model: 'Cylinders', key: 'id' },
				onDelete: 'CASCADE',
			},
			reminder_days: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			sent_at: {
				type: Sequelize.DATEONLY,
				allowNull: false,
			},
		})

		await queryInterface.addIndex(
			'notification_logs',
			['user_id', 'type', 'cylinder_id', 'reminder_days', 'sent_at'],
			{ name: 'notification_logs_dedup_idx' },
		)
	},

	async down(queryInterface) {
		await queryInterface.dropTable('notification_logs')
	},
}
```

- [ ] **Step 2: Commit**

```bash
git add migrations/20241101000011-create-notification-log.cjs
git commit -m "feat: add migration for notification_logs table"
```

---

### Task 3: User model — add notification preference fields

**Files:**
- Modify: `src/lib/models/user/index.tsx`

- [ ] **Step 1: Add field declarations to the User class**

After the existing `declare lastLogin` line (line 26), add:

```typescript
declare notifyContact: CreationOptional<boolean>
declare notifyHydro: CreationOptional<boolean>
declare notifyVisual: CreationOptional<boolean>
declare hydroReminderDays1: CreationOptional<number>
declare hydroReminderDays2: CreationOptional<number>
declare visualReminderDays1: CreationOptional<number>
declare visualReminderDays2: CreationOptional<number>
```

- [ ] **Step 2: Add field definitions to `User.init()`**

After the `lastLogin` field definition (after line 72), add:

```typescript
notifyContact: {
	type: DataTypes.BOOLEAN,
	allowNull: false,
	defaultValue: true,
},
notifyHydro: {
	type: DataTypes.BOOLEAN,
	allowNull: false,
	defaultValue: true,
},
notifyVisual: {
	type: DataTypes.BOOLEAN,
	allowNull: false,
	defaultValue: true,
},
hydroReminderDays1: {
	type: DataTypes.INTEGER,
	allowNull: false,
	defaultValue: 180,
},
hydroReminderDays2: {
	type: DataTypes.INTEGER,
	allowNull: false,
	defaultValue: 30,
},
visualReminderDays1: {
	type: DataTypes.INTEGER,
	allowNull: false,
	defaultValue: 60,
},
visualReminderDays2: {
	type: DataTypes.INTEGER,
	allowNull: false,
	defaultValue: 30,
},
```

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/models/user/index.tsx
git commit -m "feat: add notification preference fields to User model"
```

---

### Task 4: NotificationLog model

**Files:**
- Create: `src/lib/models/notificationLog/index.tsx`

- [ ] **Step 1: Create the model file**

Follow the existing model pattern (class-based with `Model<InferAttributes, InferCreationAttributes>`). The User model uses `underscored: true` and the `users` table uses snake_case column names, so this model should also use `underscored: true`.

```typescript
import {
	Model,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
	ForeignKey,
	DataTypes,
} from 'sequelize'
import { sequelize } from '../config'
import { User } from '../user'
import { Cylinder } from '../cylinder'

export class NotificationLog extends Model<
	InferAttributes<NotificationLog>,
	InferCreationAttributes<NotificationLog>
> {
	declare id: CreationOptional<number>
	declare userId: ForeignKey<string>
	declare type: 'hydro_reminder' | 'visual_reminder'
	declare cylinderId: ForeignKey<number>
	declare reminderDays: number
	declare sentAt: string
}

NotificationLog.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: User, key: 'id' },
		},
		type: {
			type: DataTypes.ENUM('hydro_reminder', 'visual_reminder'),
			allowNull: false,
		},
		cylinderId: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			references: { model: Cylinder, key: 'id' },
		},
		reminderDays: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		sentAt: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
	},
	{
		modelName: 'NotificationLog',
		tableName: 'notification_logs',
		sequelize,
		underscored: true,
		timestamps: false,
		indexes: [
			{
				name: 'notification_logs_dedup_idx',
				fields: [
					'user_id',
					'type',
					'cylinder_id',
					'reminder_days',
					'sent_at',
				],
			},
		],
	},
)
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/models/notificationLog/index.tsx
git commit -m "feat: add NotificationLog model"
```

---

### Task 5: Email transport

**Files:**
- Create: `src/lib/email/transport.ts`

- [ ] **Step 1: Install nodemailer**

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

- [ ] **Step 2: Create the transport file**

nconf uses `lowerCase: true`, so `SMTP__HOST` becomes `nconf.get('smtp:host')`.

```typescript
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

	transporter = nodemailer.createTransport({
		host,
		port: nconf.get('smtp:port') ?? 587,
		auth: {
			user: nconf.get('smtp:user'),
			pass: nconf.get('smtp:password'),
		},
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
```

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/email/transport.ts package.json package-lock.json
git commit -m "feat: add nodemailer email transport"
```

---

### Task 6: Email templates

**Files:**
- Create: `src/lib/email/templates.ts`

- [ ] **Step 1: Create the templates file**

Simple functions returning HTML strings with inline styles. No template engine.

```typescript
export function welcomeEmail(userName: string): string {
	return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
	<h1 style="color: #1a1a1a;">Welcome to Fill Station</h1>
	<p style="color: #333; font-size: 16px;">
		Hi ${escapeHtml(userName)},
	</p>
	<p style="color: #333; font-size: 16px;">
		Your account has been created. You can now track your cylinder fills, visual inspections, and hydro tests.
	</p>
	<p style="color: #666; font-size: 14px;">
		— Fill Station
	</p>
</body>
</html>`
}

export function contactNotificationEmail(
	contactName: string,
	contactEmail: string,
	message: string,
): string {
	return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
	<h1 style="color: #1a1a1a;">New Contact Form Submission</h1>
	<p style="color: #333; font-size: 16px;"><strong>From:</strong> ${escapeHtml(contactName)} (${escapeHtml(contactEmail)})</p>
	<div style="background: #f5f5f5; border-left: 4px solid #0070f3; padding: 12px 16px; margin: 16px 0;">
		<p style="color: #333; font-size: 16px; white-space: pre-wrap;">${escapeHtml(message)}</p>
	</div>
	<p style="color: #666; font-size: 14px;">
		— Fill Station
	</p>
</body>
</html>`
}

export function hydroReminderEmail(
	userName: string,
	cylinderSerial: string,
	dueDate: string,
): string {
	return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
	<h1 style="color: #1a1a1a;">Hydro Test Due Soon</h1>
	<p style="color: #333; font-size: 16px;">
		Hi ${escapeHtml(userName)},
	</p>
	<p style="color: #333; font-size: 16px;">
		Cylinder <strong>${escapeHtml(cylinderSerial)}</strong> has a hydro test due on <strong>${escapeHtml(dueDate)}</strong>.
	</p>
	<p style="color: #333; font-size: 16px;">
		Please contact the shop to schedule your hydrostatic test.
	</p>
	<p style="color: #666; font-size: 14px;">
		— Fill Station
	</p>
</body>
</html>`
}

export function visualReminderEmail(
	userName: string,
	cylinderSerial: string,
	dueDate: string,
): string {
	return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
	<h1 style="color: #1a1a1a;">Visual Inspection Due Soon</h1>
	<p style="color: #333; font-size: 16px;">
		Hi ${escapeHtml(userName)},
	</p>
	<p style="color: #333; font-size: 16px;">
		Cylinder <strong>${escapeHtml(cylinderSerial)}</strong> has a visual inspection due on <strong>${escapeHtml(dueDate)}</strong>.
	</p>
	<p style="color: #333; font-size: 16px;">
		Please contact the shop to schedule your visual inspection.
	</p>
	<p style="color: #666; font-size: 14px;">
		— Fill Station
	</p>
</body>
</html>`
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/email/templates.ts
git commit -m "feat: add email template functions"
```

---

## Chunk 2: Interactive Notifications

### Task 7: Welcome email on account creation

**Files:**
- Modify: `src/auth.ts:37-43`

- [ ] **Step 1: Add createUser event**

In the `events` object in `src/auth.ts`, add a `createUser` handler after the existing `signIn` handler. Import `sendEmail` and `welcomeEmail` at the top.

Add imports at top of file:

```typescript
import { sendEmail } from './lib/email/transport'
import { welcomeEmail } from './lib/email/templates'
```

Add the `createUser` event inside the `events` object (after the `signIn` event closing brace):

```typescript
async createUser({ user }) {
	if (user.email && user.name) {
		sendEmail(
			user.email,
			'Welcome to Fill Station',
			welcomeEmail(user.name),
		).catch((err) =>
			console.error('Failed to send welcome email:', err),
		)
	}
},
```

Note: `sendEmail` returns a Promise but we intentionally don't await it (fire-and-forget). The `.catch()` prevents unhandled rejection warnings.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/auth.ts
git commit -m "feat: send welcome email on new account creation"
```

---

### Task 8: Contact form notification emails

**Files:**
- Modify: `src/app/api/contact/route.tsx:16-21`

- [ ] **Step 1: Add email notifications to the POST handler**

Add imports at top of file:

```typescript
import { User } from '@/lib/models/user'
import { sendEmail, getShopEmail } from '@/lib/email/transport'
import { contactNotificationEmail } from '@/lib/email/templates'
```

After the existing `Contact.create(record)` call and before the `Response.json(result)` return, add the fire-and-forget email logic. Do NOT await this — wrap in an async IIFE:

```typescript
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
```

Check `src/types/contact.ts` to verify the field names (`name`, `email`, `message`) match `NewContactDTO`. Adjust if they differ.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/contact/route.tsx
git commit -m "feat: send email notifications on contact form submission"
```

---

## Chunk 3: Scheduled Notifications

### Task 9: Cron job for scheduled reminders

**Files:**
- Create: `src/lib/cron.ts`

- [ ] **Step 1: Install node-cron**

```bash
npm install node-cron
npm install -D @types/node-cron
```

- [ ] **Step 2: Create the cron module**

The join path is: `Cylinder.ownerId → Client.id ← User.clientId`. Use Sequelize `include` with nested associations. The User model is associated to Client via `User.belongsTo(Client, { foreignKey: 'clientId', as: 'client' })` and Cylinder is associated via `Cylinder.belongsTo(Client, { foreignKey: 'ownerId' })`.

For the query, we go from Client (which has many Cylinders and has many Users through the reverse belongsTo):

```typescript
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

	// Find all clients that have both cylinders and users with emails
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
```

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/cron.ts package.json package-lock.json
git commit -m "feat: add cron job for scheduled notification reminders"
```

---

### Task 10: Instrumentation — start cron on server boot

**Files:**
- Create: `src/instrumentation.ts`

- [ ] **Step 1: Create instrumentation.ts**

Next.js 16 calls the `register()` export from `instrumentation.ts` once on server boot. This is the correct place to start the cron scheduler.

```typescript
export async function register() {
	// Only run on the server (not during build or in edge runtime)
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		const { startCronJobs } = await import('./lib/cron')
		startCronJobs()
	}
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/instrumentation.ts
git commit -m "feat: register cron scheduler on server boot via instrumentation"
```

---

## Chunk 4: User Preferences UI & Profile API

### Task 11: Update Profile type and API client

**Files:**
- Modify: `src/types/profile.ts`
- Modify: `src/app/_api/index.ts:151-157`

- [ ] **Step 1: Add notification fields to the Profile type**

In `src/types/profile.ts`, add fields to the `Profile` type after `lastLogin`:

```typescript
notifyContact: boolean
notifyHydro: boolean
notifyVisual: boolean
hydroReminderDays1: number
hydroReminderDays2: number
visualReminderDays1: number
visualReminderDays2: number
```

Update `UpdateProfileDTO` to include optional notification fields:

```typescript
export type UpdateProfileDTO = {
	name?: string
	email?: string
	notifyContact?: boolean
	notifyHydro?: boolean
	notifyVisual?: boolean
	hydroReminderDays1?: number
	hydroReminderDays2?: number
	visualReminderDays1?: number
	visualReminderDays2?: number
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/types/profile.ts
git commit -m "feat: add notification fields to Profile type"
```

---

### Task 12: Update profile API route

**Files:**
- Modify: `src/app/api/profile/route.tsx`

- [ ] **Step 1: Update the validation and field handling**

First, change the destructuring at line 14 to capture the full body. Change:

```typescript
const { name, email, theme, role } = await request.json()
```

to:

```typescript
const body = await request.json()
const { name, email, theme, role } = body
```

Next, replace the validation check at line 23:

```typescript
if (!name && !email && !theme) {
```

with:

```typescript
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
```

Finally, add validated notification field assignment before `await user.save()` (after the existing field assignments at lines 46-48):

```typescript
for (const field of notificationFields) {
	if (body[field] !== undefined) {
		const val = body[field]
		if (field.startsWith('notify') && typeof val !== 'boolean')
			continue
		if (
			field.includes('Days') &&
			(typeof val !== 'number' || val < 1 || val > 365)
		)
			continue
		;(user as any)[field] = val
	}
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/profile/route.tsx
git commit -m "feat: accept notification preference fields in profile API"
```

---

### Task 13: Update profile page to pass notification data

**Files:**
- Modify: `src/app/profile/page.tsx:40-50`

- [ ] **Step 1: Add notification fields to the Profile object**

In the `user: Profile` object construction (around line 40), add the notification fields:

```typescript
notifyContact: result.notifyContact ?? true,
notifyHydro: result.notifyHydro ?? true,
notifyVisual: result.notifyVisual ?? true,
hydroReminderDays1: result.hydroReminderDays1 ?? 180,
hydroReminderDays2: result.hydroReminderDays2 ?? 30,
visualReminderDays1: result.visualReminderDays1 ?? 60,
visualReminderDays2: result.visualReminderDays2 ?? 30,
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/app/profile/page.tsx
git commit -m "feat: pass notification preferences to profile form"
```

---

### Task 14: Add notification preferences UI to ProfileForm

**Files:**
- Modify: `src/components/Profile/ProfileForm.tsx`

- [ ] **Step 1: Add state for notification fields**

Add import at top:

```typescript
import NumberInput from '@/components/UI/FormElements/NumberInput'
```

Note: `updateProfile` is already imported in this file (line 7).

After the existing `useState` calls (lines 17-18), add:

```typescript
const [notifyContact, setNotifyContact] = useState(user.notifyContact)
const [notifyHydro, setNotifyHydro] = useState(user.notifyHydro)
const [notifyVisual, setNotifyVisual] = useState(user.notifyVisual)
const [hydroReminderDays1, setHydroReminderDays1] = useState(
	user.hydroReminderDays1,
)
const [hydroReminderDays2, setHydroReminderDays2] = useState(
	user.hydroReminderDays2,
)
const [visualReminderDays1, setVisualReminderDays1] = useState(
	user.visualReminderDays1,
)
const [visualReminderDays2, setVisualReminderDays2] = useState(
	user.visualReminderDays2,
)
```

- [ ] **Step 2: Update handleSave to include notification fields**

Change the `handleSave` call from:

```typescript
const data = await updateProfile({ name, email })
```

to:

```typescript
const data = await updateProfile({
	name,
	email,
	notifyContact,
	notifyHydro,
	notifyVisual,
	hydroReminderDays1,
	hydroReminderDays2,
	visualReminderDays1,
	visualReminderDays2,
})
```

- [ ] **Step 3: Add notification preferences section in edit mode**

Inside the edit mode block (after the "Linked client" div around line 94, before the buttons div), add:

```tsx
<div className='border-border mt-4 border-t pt-4'>
	<h3 className='text-text mb-3 text-sm font-semibold'>
		Notification Preferences
	</h3>
	<div className='flex flex-col gap-3'>
		{user.role === 'admin' && (
			<label className='flex items-center gap-2'>
				<input
					type='checkbox'
					checked={notifyContact}
					onChange={(e) =>
						setNotifyContact(e.target.checked)
					}
					className='bg-background border-border checked:bg-accent h-4 w-4 rounded'
				/>
				<span className='text-text text-sm'>
					Contact form submissions
				</span>
			</label>
		)}
		<label className='flex items-center gap-2'>
			<input
				type='checkbox'
				checked={notifyHydro}
				onChange={(e) =>
					setNotifyHydro(e.target.checked)
				}
				className='bg-background border-border checked:bg-accent h-4 w-4 rounded'
			/>
			<span className='text-text text-sm'>
				Hydro test reminders
			</span>
		</label>
		{notifyHydro && (
			<div className='ml-6 flex gap-3'>
				<NumberInput
					id='hydro-days-1'
					name='hydroReminderDays1'
					label='First reminder (days)'
					value={hydroReminderDays1}
					onChange={setHydroReminderDays1}
				/>
				<NumberInput
					id='hydro-days-2'
					name='hydroReminderDays2'
					label='Second reminder (days)'
					value={hydroReminderDays2}
					onChange={setHydroReminderDays2}
				/>
			</div>
		)}
		<label className='flex items-center gap-2'>
			<input
				type='checkbox'
				checked={notifyVisual}
				onChange={(e) =>
					setNotifyVisual(e.target.checked)
				}
				className='bg-background border-border checked:bg-accent h-4 w-4 rounded'
			/>
			<span className='text-text text-sm'>
				Visual inspection reminders
			</span>
		</label>
		{notifyVisual && (
			<div className='ml-6 flex gap-3'>
				<NumberInput
					id='visual-days-1'
					name='visualReminderDays1'
					label='First reminder (days)'
					value={visualReminderDays1}
					onChange={setVisualReminderDays1}
				/>
				<NumberInput
					id='visual-days-2'
					name='visualReminderDays2'
					label='Second reminder (days)'
					value={visualReminderDays2}
					onChange={setVisualReminderDays2}
				/>
			</div>
		)}
	</div>
</div>
```

- [ ] **Step 4: Add notification preferences in read-only view**

In the read-only view (the `<dl>` section), after the "Linked client" `<div>` (around line 142), add a summary of notification preferences:

```tsx
<div className='px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4'>
	<dt className='text-light-text text-sm font-medium'>
		Notifications
	</dt>
	<dd className='text-text mt-1 text-sm sm:col-span-2 sm:mt-0'>
		{[
			user.role === 'admin' &&
				user.notifyContact &&
				'Contact form',
			user.notifyHydro && 'Hydro reminders',
			user.notifyVisual && 'Visual reminders',
		]
			.filter(Boolean)
			.join(', ') || 'None'}
	</dd>
</div>
```

- [ ] **Step 5: Update cancel handler to reset notification state**

In the cancel button `onClick` (around line 102), add resets:

```typescript
setNotifyContact(user.notifyContact)
setNotifyHydro(user.notifyHydro)
setNotifyVisual(user.notifyVisual)
setHydroReminderDays1(user.hydroReminderDays1)
setHydroReminderDays2(user.hydroReminderDays2)
setVisualReminderDays1(user.visualReminderDays1)
setVisualReminderDays2(user.visualReminderDays2)
```

- [ ] **Step 6: Run lint**

```bash
npm run lint
```

- [ ] **Step 7: Verify build**

```bash
npm run build
```

Expected: Build succeeds with no type errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/Profile/ProfileForm.tsx
git commit -m "feat: add notification preferences UI to profile form"
```
