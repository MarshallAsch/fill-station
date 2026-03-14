export type Profile = {
	id: string
	name: string | null
	email: string | null
	image: string | null
}

export type UpdateProfileDTO = {
	name: string
	email: string
}
