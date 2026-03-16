export type Theme = 'light' | 'dark' | 'system'

export type Profile = {
	id: string
	name: string | null
	email: string | null
	image: string | null
	theme: Theme
	role: string
	clientId: number | null
	clientName: string | null
	lastLogin: string | null
	notifyContact: boolean
	notifyHydro: boolean
	notifyVisual: boolean
	hydroReminderDays1: number
	hydroReminderDays2: number
	visualReminderDays1: number
	visualReminderDays2: number
}

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
