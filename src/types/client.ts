export type Client = {
	id: number
	name: string
	nitroxCert: string
	advancedNitroxCert: string
	trimixCert: string
	inspectionCert?: string
	createdAt?: string
	updatedAt?: string
}

export type NewClientDTO = {
	name: string
	id?: string // only when updating the record (not used directly so its fine to coerce this to a string)
	nitroxCert?: string
	advancedNitroxCert?: string
	trimixCert?: string
	inspectionCert?: string
}
