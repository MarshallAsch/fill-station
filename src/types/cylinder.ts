import dayjs from 'dayjs'

export type Cylinder = {
	serialNumber: string
	birthDate: dayjs.Dayjs
	lastHydro: dayjs.Dayjs
	lastVis: {
		date: dayjs.Dayjs
		passed: boolean
		oxygenClean: boolean
		details: string
	} | null
}
