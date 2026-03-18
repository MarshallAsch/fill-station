export type Cylinder = {
	id: number
	serialNumber: string
	birth: string | undefined
	lastHydro: string | undefined
	lastVis: string | undefined
	ownerId?: number
	servicePressure: number
	oxygenClean: boolean
	verified: boolean
	material?: 'steel' | 'aluminum' | 'composite'
	createdAt?: string
	updatedAt?: string
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
