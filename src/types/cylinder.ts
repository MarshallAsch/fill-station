export type Cylinder = {
	id: number
	serialNumber: string
	birth: string | undefined
	lastHydro: string | undefined
	lastVis: string | undefined
	ownerId?: number
	Client?: { id: number; name: string } | null
	servicePressure: number
	oxygenClean: boolean
	verified: boolean
	material?: 'steel' | 'aluminum' | 'composite'
	nickname?: string | null
	manufacturer?: string | null
	size?: number | null
	pairedCylinderId?: number | null
	pairNickname?: string | null
	pairedCylinder?: {
		id: number
		serialNumber: string
		nickname?: string | null
		servicePressure: number
		oxygenClean: boolean
		ownerId?: number
	} | null
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
	nickname?: string
	manufacturer?: string
	size?: number
	pairedCylinderId?: number | null
	pairNickname?: string | null
}
