# Admin Settings Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the admin settings page into a tabbed layout with server-wide configuration stored in a new `Setting` DB table.

**Architecture:** Hybrid storage — app settings in a key-value DB table, infra config (SMTP) read-only from nconf. Vertical sidebar tabs via URL `?tab=` search params (matching the history page pattern). Server components where possible, client components only for interactive forms.

**Tech Stack:** Next.js 16, Sequelize, Headless UI, Tailwind CSS v4, nconf, nodemailer

**Spec:** `docs/superpowers/specs/2026-03-20-admin-settings-tabs-design.md`

---

### Task 1: Types and Setting Model

**Files:**
- Create: `src/types/settings.ts`
- Create: `src/lib/models/setting/index.tsx`
- Create: `migrations/20260320000001-create-settings.cjs`

- [ ] **Step 1: Create the AppSettings type**

```typescript
// src/types/settings.ts
export type AppSettings = {
	defaultInspectorId: string | null
	cronHour: number
	cronMinute: number
	defaultHydroReminder1: number
	defaultHydroReminder2: number
	defaultVisualReminder1: number
	defaultVisualReminder2: number
	defaultServicePressure: number
	allowedServicePressures: number[]
}

export const SETTINGS_DEFAULTS: AppSettings = {
	defaultInspectorId: null,
	cronHour: 8,
	cronMinute: 0,
	defaultHydroReminder1: 180,
	defaultHydroReminder2: 30,
	defaultVisualReminder1: 60,
	defaultVisualReminder2: 30,
	defaultServicePressure: 3000,
	allowedServicePressures: [2640, 3000, 3442],
}
```

- [ ] **Step 2: Create the Setting Sequelize model**

```typescript
// src/lib/models/setting/index.tsx
import {
	Model,
	InferAttributes,
	InferCreationAttributes,
	DataTypes,
} from 'sequelize'
import { sequelize } from '../config'

export class Setting extends Model<
	InferAttributes<Setting>,
	InferCreationAttributes<Setting>
> {
	declare key: string
	declare value: string
}

Setting.init(
	{
		key: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		value: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
	},
	{
		modelName: 'setting',
		sequelize,
		underscored: true,
		timestamps: false,
	},
)
```

- [ ] **Step 3: Create the migration**

```javascript
// migrations/20260320000001-create-settings.cjs
'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('settings', {
			key: {
				type: Sequelize.STRING,
				primaryKey: true,
			},
			value: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
		})
	},

	async down(queryInterface) {
		await queryInterface.dropTable('settings')
	},
}
```

- [ ] **Step 4: Run lint**

Run: `npm run lint`

- [ ] **Step 5: Commit**

```bash
git add src/types/settings.ts src/lib/models/setting/index.tsx migrations/20260320000001-create-settings.cjs
git commit -m "feat: add Setting model and AppSettings type"
```

**Note:** No explicit model registration needed. In this codebase, models self-register with Sequelize when their module is first imported (the `Setting.init()` call at module scope handles it). The Setting model will be loaded when `src/lib/settings.ts` (Task 2) imports it via `import { Setting } from '@/lib/models/setting'`.

---

### Task 2: Settings Helper

**Files:**
- Create: `src/lib/settings.ts`

**Reference:**
- `src/lib/audit.ts` — existing audit log helper pattern
- `src/lib/models/setting/index.tsx` — Setting model from Task 1
- `src/types/settings.ts` — AppSettings type from Task 1

- [ ] **Step 1: Create getSettings and updateSettings helpers**

```typescript
// src/lib/settings.ts
import { Setting } from '@/lib/models/setting'
import { AppSettings, SETTINGS_DEFAULTS } from '@/types/settings'
import { auditLog } from '@/lib/audit'
import { User } from '@/lib/models/user'

export async function getSettings(): Promise<AppSettings> {
	const rows = await Setting.findAll()
	const map = new Map(rows.map((r) => [r.key, r.value]))

	function get<K extends keyof AppSettings>(key: K): AppSettings[K] {
		const raw = map.get(key)
		if (raw === undefined) return SETTINGS_DEFAULTS[key]
		return JSON.parse(raw) as AppSettings[K]
	}

	return {
		defaultInspectorId: get('defaultInspectorId'),
		cronHour: get('cronHour'),
		cronMinute: get('cronMinute'),
		defaultHydroReminder1: get('defaultHydroReminder1'),
		defaultHydroReminder2: get('defaultHydroReminder2'),
		defaultVisualReminder1: get('defaultVisualReminder1'),
		defaultVisualReminder2: get('defaultVisualReminder2'),
		defaultServicePressure: get('defaultServicePressure'),
		allowedServicePressures: get('allowedServicePressures'),
	}
}

export async function updateSettings(
	userId: string,
	partial: Partial<AppSettings>,
): Promise<AppSettings> {
	const errors = validateSettings(partial)
	if (errors.length > 0) {
		throw new Error(errors.join('; '))
	}

	const current = await getSettings()

	for (const [key, value] of Object.entries(partial)) {
		const typedKey = key as keyof AppSettings
		const oldValue = current[typedKey]
		if (JSON.stringify(oldValue) === JSON.stringify(value)) continue

		await Setting.upsert({
			key,
			value: JSON.stringify(value),
		})

		await auditLog(userId, 'update', 'setting', key, {
			old: oldValue,
			new: value,
		})
	}

	return getSettings()
}

function validateSettings(partial: Partial<AppSettings>): string[] {
	const errors: string[] = []

	if ('cronHour' in partial) {
		const v = partial.cronHour!
		if (!Number.isInteger(v) || v < 0 || v > 23)
			errors.push('cronHour must be 0-23')
	}
	if ('cronMinute' in partial) {
		const v = partial.cronMinute!
		if (!Number.isInteger(v) || v < 0 || v > 59)
			errors.push('cronMinute must be 0-59')
	}

	const reminderKeys = [
		'defaultHydroReminder1',
		'defaultHydroReminder2',
		'defaultVisualReminder1',
		'defaultVisualReminder2',
	] as const
	for (const key of reminderKeys) {
		if (key in partial) {
			const v = partial[key]!
			if (!Number.isInteger(v) || v < 1 || v > 365)
				errors.push(`${key} must be 1-365`)
		}
	}

	if ('allowedServicePressures' in partial) {
		const v = partial.allowedServicePressures!
		if (!Array.isArray(v) || v.length === 0)
			errors.push('allowedServicePressures must be non-empty')
		if (v.some((p) => !Number.isInteger(p) || p <= 0))
			errors.push('allowedServicePressures must all be positive integers')
	}

	if ('defaultServicePressure' in partial) {
		const allowed =
			partial.allowedServicePressures ??
			SETTINGS_DEFAULTS.allowedServicePressures
		if (!allowed.includes(partial.defaultServicePressure!))
			errors.push('defaultServicePressure must be in allowedServicePressures')
	}

	return errors
}

// Validate defaultInspectorId separately (async — needs DB)
export async function validateInspectorId(
	id: string | null,
): Promise<string | null> {
	if (id === null) return null
	const user = await User.findByPk(id)
	if (!user || user.role !== 'inspector') {
		return 'defaultInspectorId must reference a user with inspector role'
	}
	return null
}
```

**Note:** The `updateSettings` caller (API route in Task 4) must call `validateInspectorId` separately before calling `updateSettings`, since it requires an async DB lookup.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/lib/settings.ts
git commit -m "feat: add getSettings/updateSettings helpers"
```

---

### Task 3: Settings API Routes

**Files:**
- Create: `src/app/api/settings/route.tsx`
- Create: `src/app/api/settings/test-email/route.tsx`

**Reference:**
- `src/app/api/users/route.tsx` — existing admin-only API route pattern (uses `requireRole`/`isErrorResponse`)
- `src/lib/permissions-server.ts` — `requireRole` and `isErrorResponse` helpers
- `src/lib/email/transport.ts` — `sendEmail` function
- `src/lib/settings.ts` — `getSettings`/`updateSettings` from Task 2
- `src/lib/permissions.ts` — add `settings` to the `PERMISSIONS.api` map

- [ ] **Step 1: Create GET + PATCH /api/settings**

```typescript
// src/app/api/settings/route.tsx
import {
	requireRole,
	isErrorResponse,
} from '@/lib/permissions-server'
import { getSettings, updateSettings, validateInspectorId } from '@/lib/settings'

export async function GET() {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const settings = await getSettings()
	return Response.json(settings)
}

export async function PATCH(request: Request) {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const body = await request.json()

	// Validate inspector ID if provided
	if ('defaultInspectorId' in body) {
		const error = await validateInspectorId(body.defaultInspectorId)
		if (error) {
			return Response.json({ error: 'validation', message: error }, { status: 400 })
		}
	}

	try {
		const updated = await updateSettings(result.user!.id!, body)
		return Response.json(updated)
	} catch (err: any) {
		return Response.json(
			{ error: 'validation', message: err.message },
			{ status: 400 },
		)
	}
}
```

- [ ] **Step 2: Create POST /api/settings/test-email**

```typescript
// src/app/api/settings/test-email/route.tsx
import {
	requireRole,
	isErrorResponse,
} from '@/lib/permissions-server'
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
			{ error: 'send_failed', message: 'Failed to send email. Check SMTP configuration.' },
			{ status: 500 },
		)
	}

	return Response.json({ success: true })
}
```

- [ ] **Step 3: Add settings routes to permissions map**

In `src/lib/permissions.ts`, add these entries to the `PERMISSIONS.api` object (after the `/api/contact` entry):

```typescript
'/api/settings': { GET: ['admin'], PATCH: ['admin'] },
'/api/settings/test-email': { POST: ['admin'] },
```

This ensures the proxy middleware in `src/proxy.ts` allows admin access to these routes. Without this, the proxy will return 403 for unmatched API routes.

- [ ] **Step 4: Run lint**

Run: `npm run lint`

- [ ] **Step 5: Commit**

```bash
git add src/app/api/settings/route.tsx src/app/api/settings/test-email/route.tsx src/lib/permissions.ts
git commit -m "feat: add settings API routes (GET, PATCH, test-email)"
```

---

### Task 4: Settings Layout (Sidebar)

**Files:**
- Create: `src/app/settings/layout.tsx` (overwrite existing — currently no layout)

**Reference:**
- `src/app/history/layout.tsx` — the exact pattern to follow (client component, `useRouter`, `useSearchParams`, `clsx`, vertical sidebar with icons)
- `@heroicons/react/24/outline` — icons used in history layout

- [ ] **Step 1: Create the settings layout with vertical sidebar**

```typescript
// src/app/settings/layout.tsx
'use client'

import { ReactNode, Suspense } from 'react'
import clsx from 'clsx'
import {
	WrenchScrewdriverIcon,
	BellIcon,
	UsersIcon,
	ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'
import AirTank from '@/icons/AirTank'
import { useRouter, useSearchParams } from 'next/navigation'

export enum SETTINGS_TAB {
	INSPECTION = 'INSPECTION',
	CYLINDERS = 'CYLINDERS',
	NOTIFICATIONS = 'NOTIFICATIONS',
	USERS = 'USERS',
	AUDIT_LOG = 'AUDIT_LOG',
}

const navigation = [
	{
		name: 'Inspection & Maintenance',
		value: SETTINGS_TAB.INSPECTION,
		icon: WrenchScrewdriverIcon,
	},
	{
		name: 'Cylinder Defaults',
		value: SETTINGS_TAB.CYLINDERS,
		icon: AirTank,
	},
	{
		name: 'Notifications',
		value: SETTINGS_TAB.NOTIFICATIONS,
		icon: BellIcon,
	},
	{ name: 'Users', value: SETTINGS_TAB.USERS, icon: UsersIcon },
	{
		name: 'Audit Log',
		value: SETTINGS_TAB.AUDIT_LOG,
		icon: ClipboardDocumentListIcon,
	},
]

const LayoutContent = ({ children }: { children: ReactNode }) => {
	const router = useRouter()
	const params = useSearchParams()

	const tab = params.get('tab')

	const selectedTab = (
		Object.values(SETTINGS_TAB) as Array<unknown>
	).includes(tab)
		? tab
		: SETTINGS_TAB.INSPECTION

	return (
		<div className='border-border flex grow border-t'>
			<div className='fixed inset-y-0 z-50 flex w-72 flex-col'>
				<div className='border-border bg-background mt-24 flex grow flex-col gap-y-5 overflow-y-auto border-t border-r px-6'>
					<nav className='flex flex-1 flex-col'>
						<ul role='list' className='flex flex-1 flex-col gap-y-7'>
							<li>
								<ul
									role='list'
									className='flex flex-1 flex-col gap-y-7'
								>
									<li>
										<ul
											role='list'
											className='-mx-2 mt-2 space-y-1'
										>
											{navigation.map((item) => (
												<li key={item.name}>
													<button
														onClick={() =>
															router.push(
																`/settings?tab=${item.value}`,
															)
														}
														className={clsx(
															item.value ===
																selectedTab
																? 'bg-surface text-accent-text'
																: 'text-text hover:bg-hover hover:text-accent-text',
															'group flex w-full cursor-pointer gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
														)}
													>
														<item.icon
															aria-hidden='true'
															className={clsx(
																item.value ===
																	selectedTab
																	? 'text-accent-text'
																	: 'text-muted-text group-hover:text-accent-text',
																'size-6 shrink-0',
															)}
														/>
														{item.name}
													</button>
												</li>
											))}
										</ul>
									</li>
								</ul>
							</li>
						</ul>
					</nav>
				</div>
			</div>

			<div className='min-w-full py-10 pl-72'>
				<div className='flex justify-center px-4 sm:px-6 lg:px-8'>
					{children}
				</div>
			</div>
		</div>
	)
}

const Layout = ({ children }: { children: ReactNode }) => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LayoutContent>{children}</LayoutContent>
		</Suspense>
	)
}

export default Layout
```

- [ ] **Step 2: Run lint**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/app/settings/layout.tsx
git commit -m "feat: add settings sidebar layout with tab navigation"
```

---

### Task 5: Notifications Tab (Server Component)

**Files:**
- Create: `src/components/Settings/NotificationsTab.tsx`
- Create: `src/components/Settings/SendTestEmailButton.tsx`

**Reference:**
- `src/lib/config/index.tsx` — nconf instance
- `src/lib/email/transport.ts` — nconf keys for SMTP (`smtp:host`, `smtp:port`, `smtp:from`, `smtp:shop_email`)
- `src/components/UI/Button.tsx` — existing Button component

- [ ] **Step 1: Create the NotificationsTab server component**

This component receives SMTP config values as props (fetched from nconf in the page). Displays them read-only in a key-value grid. Shows a green/red status indicator based on whether the SMTP host is configured.

```typescript
// src/components/Settings/NotificationsTab.tsx
import SendTestEmailButton from './SendTestEmailButton'

type SmtpConfig = {
	host: string | undefined
	port: number | undefined
	from: string | undefined
	shopEmail: string | undefined
}

const NotificationsTab = ({ smtp }: { smtp: SmtpConfig }) => {
	const isConfigured = !!smtp.host

	const rows = [
		{ label: 'SMTP Host', value: smtp.host },
		{ label: 'SMTP Port', value: smtp.port?.toString() },
		{ label: 'From Address', value: smtp.from },
		{ label: 'Shop Email', value: smtp.shopEmail },
	]

	return (
		<div className='w-full max-w-2xl'>
			<h2 className='text-text text-xl font-semibold'>
				Email Configuration
			</h2>
			<p className='text-muted-text mt-1 text-sm'>
				Read-only — configured via environment variables
			</p>

			<div className='mt-6 grid grid-cols-[140px_1fr] gap-x-4 gap-y-3 text-sm'>
				{rows.map((row) => (
					<>
						<div
							key={`${row.label}-label`}
							className='text-muted-text'
						>
							{row.label}
						</div>
						<div
							key={`${row.label}-value`}
							className='bg-surface rounded px-2 py-1 font-mono text-text'
						>
							{row.value ?? '—'}
						</div>
					</>
				))}

				<div className='text-muted-text'>Status</div>
				<div className='flex items-center gap-2'>
					<div
						className={`size-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`}
					/>
					<span
						className={`text-sm ${isConfigured ? 'text-green-500' : 'text-red-500'}`}
					>
						{isConfigured ? 'Configured' : 'Not configured'}
					</span>
				</div>
			</div>

			<div className='mt-6'>
				<SendTestEmailButton disabled={!isConfigured} />
			</div>
		</div>
	)
}

export default NotificationsTab
```

- [ ] **Step 2: Create the SendTestEmailButton client island**

```typescript
// src/components/Settings/SendTestEmailButton.tsx
'use client'

import Button from '@/components/UI/Button'
import { useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'

const SendTestEmailButton = ({ disabled }: { disabled?: boolean }) => {
	const [sending, setSending] = useState(false)

	const handleSend = async () => {
		setSending(true)
		try {
			const res = await axios.post('/api/settings/test-email')
			if (res.status === 200) {
				toast.success('Test email sent — check your inbox')
			} else {
				toast.error(res.data?.message ?? 'Failed to send test email')
			}
		} catch {
			toast.error('Failed to send test email')
		} finally {
			setSending(false)
		}
	}

	return (
		<Button onClick={handleSend} disabled={disabled || sending}>
			{sending ? 'Sending...' : 'Send Test Email'}
		</Button>
	)
}

export default SendTestEmailButton
```

- [ ] **Step 3: Run lint**

Run: `npm run lint`

- [ ] **Step 4: Commit**

```bash
git add src/components/Settings/NotificationsTab.tsx src/components/Settings/SendTestEmailButton.tsx
git commit -m "feat: add notifications tab with SMTP status and test email"
```

---

### Task 6: Inspection Tab (Client Component)

**Files:**
- Create: `src/components/Settings/InspectionTab.tsx`

**Reference:**
- `src/components/Profile/ProfileForm.tsx` — existing form pattern with save button, number inputs, toast notifications
- `src/components/UI/FormElements/ListBox.tsx` — dropdown component
- `src/components/UI/FormElements/NumberInput.tsx` — number input component
- `src/components/UI/Button.tsx` — button component
- `src/types/settings.ts` — `AppSettings` type

- [ ] **Step 1: Create the InspectionTab client component**

This component receives current settings and a list of inspectors as props. Renders:
- Default Inspector dropdown (ListBox with inspector-role users)
- Notification Schedule (hour + minute inputs with UTC label and local timezone preview)
- Default Reminder Days (four number inputs in a 2x2 grid)
- Save Changes button

The local timezone preview uses `Intl.DateTimeFormat` to convert UTC time to the browser's local time. For example, if `cronHour=8, cronMinute=0` and the user is in EDT, show "08:00 UTC (4:00 AM EDT)".

On save, PATCH `/api/settings` with the changed fields. Show success/error toast.

Props type:
```typescript
type InspectionTabProps = {
	settings: AppSettings
	inspectors: { id: string; name: string | null }[]
}
```

The inspector dropdown items should include a "None" option that maps to `null`.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/components/Settings/InspectionTab.tsx
git commit -m "feat: add inspection & maintenance settings tab"
```

---

### Task 7: Cylinders Tab (Client Component)

**Files:**
- Create: `src/components/Settings/CylindersTab.tsx`

**Reference:**
- `src/components/Settings/InspectionTab.tsx` — same save pattern from Task 6
- `src/components/UI/FormElements/ListBox.tsx` — dropdown for default pressure
- `src/components/UI/Button.tsx` — button component
- `src/types/settings.ts` — `AppSettings` type

- [ ] **Step 1: Create the CylindersTab client component**

This component receives current settings as props. Renders:
- Default Service Pressure dropdown (populated from the allowed pressures list)
- Allowed Service Pressures as a tag/chip list with remove buttons (X) and an "Add" button that shows a number input
- Save Changes button

Validation rules (client-side, duplicating server validation):
- Cannot remove a pressure that is the current default (show toast error)
- Allowed pressures must be non-empty
- New pressures must be positive integers

On save, PATCH `/api/settings` with changed fields. Show success/error toast.

Props type:
```typescript
type CylindersTabProps = {
	settings: AppSettings
}
```

- [ ] **Step 2: Run lint**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/components/Settings/CylindersTab.tsx
git commit -m "feat: add cylinder defaults settings tab"
```

---

### Task 8: Rewrite Settings Page

**Files:**
- Modify: `src/app/settings/page.tsx` (full rewrite)

**Reference:**
- `src/app/settings/layout.tsx` — `SETTINGS_TAB` enum from Task 4
- `src/lib/settings.ts` — `getSettings()` from Task 2
- `src/lib/config/index.tsx` — nconf instance for SMTP values
- `src/lib/models/user/index.tsx` — User model for inspector list + user list
- `src/lib/models/audit/index.tsx` — AuditLog model
- `src/lib/models/client/index.tsx` — Client model (included in user query)
- All tab components from Tasks 5-7

- [ ] **Step 1: Rewrite page.tsx as a server component that renders the active tab**

The page reads `searchParams.tab` to decide which tab content to render. For each tab, it fetches only the data that tab needs:

- `INSPECTION`: `getSettings()` + `User.findAll({ where: { role: 'inspector' } })`
- `CYLINDERS`: `getSettings()`
- `NOTIFICATIONS`: nconf SMTP values (`smtp:host`, `smtp:port`, `smtp:from`, `smtp:shop_email`)
- `USERS`: `User.findAll()` with client include (existing query)
- `AUDIT_LOG`: `AuditLog.findAll()` with user include (existing query)

Auth check: `auth()` → redirect if not logged in or not admin.

Pass serialized data (`JSON.parse(JSON.stringify(...))`) as props to tab components.

Default to `INSPECTION` tab if no tab param or invalid value.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/app/settings/page.tsx
git commit -m "feat: rewrite settings page with tabbed layout"
```

---

### Task 9: Integrate Settings into Cron Job

**Files:**
- Modify: `src/lib/cron.ts`

**Reference:**
- `src/lib/cron.ts` — current cron implementation (hardcoded `'0 8 * * *'` schedule)
- `src/lib/settings.ts` — `getSettings()` from Task 2

- [ ] **Step 1: Update cron to use settings for schedule and defaults**

Two changes:

1. **Schedule**: Change from `cron.schedule('0 8 * * *', ...)` to `cron.schedule('* * * * *', ...)` (every minute). Inside the handler, call `getSettings()` and check if the current UTC hour/minute matches `cronHour`/`cronMinute`. If not, return early.

2. **No changes to reminder logic**: The cron already reads `user.hydroReminderDays1` etc. per-user. The new settings defaults (`defaultHydroReminder1` etc.) are only applied when creating new users, not in the cron itself. So no changes needed to the reminder day logic in `checkDueReminders`.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/lib/cron.ts
git commit -m "feat: use configurable cron schedule from settings"
```

---

### Task 10: Integrate Settings into Cylinder Model, FormConstants, and CylinderModal

**Files:**
- Modify: `src/lib/models/cylinder/index.tsx:107-114` — remove hardcoded default and `isIn` validator
- Modify: `src/app/constants/FormConstants.ts`
- Modify: `src/components/Modals/CylinderModal.tsx` — the only consumer of `SERVICE_PRESSURE`

**Reference:**
- `src/lib/models/cylinder/index.tsx:107-114` — hardcoded `defaultValue: 3000` and `isIn: [[2640, 3000, 3442]]`
- `src/app/constants/FormConstants.ts:69-82` — current hardcoded `SERVICE_PRESSURE` array
- `src/components/Modals/CylinderModal.tsx:18,168,172` — imports and uses `SERVICE_PRESSURE` in a ListBox

- [ ] **Step 1: Remove hardcoded cylinder validation**

In `src/lib/models/cylinder/index.tsx`, update the `servicePressure` field:
- Remove `defaultValue: 3000` — the default will come from `getSettings().defaultServicePressure` at the application layer (in the CylinderModal form or API route)
- Remove `validate: { isIn: [[2640, 3000, 3442]] }` — validation is now managed by the settings system. The `isIn` validator would reject any new pressures added via the admin UI.

The field should become:
```typescript
servicePressure: {
	type: DataTypes.INTEGER.UNSIGNED,
	allowNull: false,
},
```

- [ ] **Step 2: Add helper function to FormConstants**

Add a helper that converts a `number[]` to the `{ name, value }[]` format expected by the ListBox component:

```typescript
export function servicePressureOptions(
	pressures: number[],
): { name: string; value: string }[] {
	return pressures.map((p) => ({
		name: `${p} psi`,
		value: String(p),
	}))
}
```

Keep the existing `SERVICE_PRESSURE` constant as a fallback.

- [ ] **Step 2: Update CylinderModal to accept dynamic pressures**

The `CylinderModal` currently imports `SERVICE_PRESSURE` directly. Update it to:
1. Accept an optional `allowedServicePressures?: number[]` prop
2. If provided, use `servicePressureOptions(allowedServicePressures)` instead of the static `SERVICE_PRESSURE`
3. Fall back to `SERVICE_PRESSURE` if the prop is not provided

The parent component that renders `CylinderModal` (check `src/components/Providers/ModalProvider.tsx`) needs to pass the allowed pressures. This may require fetching settings via the API or receiving them as props from a server component. Follow the existing data flow pattern — if the modal is rendered in a client context, the parent can fetch settings with React Query or receive them via Redux.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

- [ ] **Step 4: Commit**

```bash
git add src/app/constants/FormConstants.ts src/components/Modals/CylinderModal.tsx
git commit -m "feat: use configurable service pressures from settings"
```

---

### Task 11: Final Lint and Verification

- [ ] **Step 1: Run full lint**

Run: `npm run lint`
Fix any issues.

- [ ] **Step 2: Run build**

Run: `npm run build`
Fix any type errors or build failures.

- [ ] **Step 3: Run knip**

Run: `npm run knip`
Check for unused exports introduced by the changes.

- [ ] **Step 4: Run the migration**

Run: `npx sequelize-cli db:migrate`
Verify the `settings` table was created.

- [ ] **Step 5: Manual smoke test**

Start the dev server (`npm run dev` or `docker compose up`) and verify:
1. Navigate to `/settings` — sidebar renders with 5 tabs
2. Inspection tab loads with default values, inspector dropdown works
3. Cylinders tab loads with default pressures, add/remove works
4. Notifications tab shows SMTP config read-only
5. Users tab shows existing user table
6. Audit Log tab shows existing log
7. Save changes on Inspection/Cylinders tabs, verify values persist on reload
8. Check audit log shows the settings changes

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix: address lint/build issues from settings tabs"
```
