export type NewContactDTO = {
	name: string
	email: string
	message: string
}

export type ContactDTO = {
	name: string
	email: string
	message: string
	status: 'submited' | 'responded' | 'closed' | 'spam'
}
