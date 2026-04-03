import { AppSettings, SETTINGS_DEFAULTS } from '@/types/settings'

async function getSetting() {
	const { Setting } = await import('@/lib/models/setting')
	return Setting
}

export async function getSettings(): Promise<AppSettings> {
	const Setting = await getSetting()
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
	const current = await getSettings()

	const errors = validateSettings(partial, current)
	if (errors.length > 0) {
		throw new Error(errors.join('; '))
	}

	for (const [key, value] of Object.entries(partial)) {
		const typedKey = key as keyof AppSettings
		const oldValue = current[typedKey]
		if (JSON.stringify(oldValue) === JSON.stringify(value)) continue

		const Setting = await getSetting()
		await Setting.upsert({
			key,
			value: JSON.stringify(value),
		})

		const { auditLog: log } = await import('@/lib/audit')
		await log(userId, 'update', 'setting', key, {
			old: oldValue,
			new: value,
		})
	}

	return getSettings()
}

function validateSettings(
	partial: Partial<AppSettings>,
	current: AppSettings,
): string[] {
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
			partial.allowedServicePressures ?? current.allowedServicePressures
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
	const { User } = await import('@/lib/models/user')
	const user = await User.findByPk(id)
	if (!user || user.role !== 'inspector') {
		return 'defaultInspectorId must reference a user with inspector role'
	}
	return null
}
