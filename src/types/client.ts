export type NewClientDTO = {
	name: string
	nitroxCert?: string
	advancedNitroxCert?: string
	trimixCert?: string
	inspectionCert?: string
}

export type NewCylinderDTO = {
	serialNumber: string
	birth: Date
	lastHydro: Date
	lastVis: Date
	oxygenClean: boolean
	material?: 'steel' | 'aluminum' | 'composite'
}
