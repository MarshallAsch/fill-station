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
