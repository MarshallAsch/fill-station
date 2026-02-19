export type Cylinder = {
	id: number
	serialNumber: string
	birth: string
	lastHydro: string
	lastVis: string
	ownerId: number
	servicePressure: number
	oxygenClean: boolean
	material?: 'steel' | 'aluminum' | 'composite'
}

export type NewCylinderDTO = {
	serialNumber: string
	birth: Date
	lastHydro: Date
	lastVis: Date
	servicePressure: number
	oxygenClean: boolean
	material?: 'steel' | 'aluminum' | 'composite'
}
