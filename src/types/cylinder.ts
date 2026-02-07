import dayjs from 'dayjs'

export type Cylinder = {
	id: number
	serialNumber: string
	birth: dayjs.Dayjs
	lastHydro: dayjs.Dayjs
	lastVis: dayjs.Dayjs
	ownerId: number
	oxygenClean: boolean
	material?: 'steel' | 'aluminum' | 'composite'
}

export type NewCylinderDTO = {
	serialNumber: string
	birth: Date
	lastHydro: Date
	lastVis: Date
	oxygenClean: boolean
	material?: 'steel' | 'aluminum' | 'composite'
}
