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
}

export type UpdateProfileDTO = {
	name: string
	email: string
}
