export type Client = {
	id: number
	name: string
	nitroxCert: string
	advancedNitroxCert: string
	trimixCert: string
}

export type NewClientDTO = {
	name: string
	nitroxCert?: string
	advancedNitroxCert?: string
	trimixCert?: string
	inspectionCert?: string
}
