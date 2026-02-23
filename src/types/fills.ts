import { Cylinder } from './cylinder'

export type FillHistory = {
	id: number
	name: string
	date: string
	oxygen: number
	helium: number
	startPressure: number
	endPressure: number
	Cylinder: Cylinder
	createdAt?: string
	updatedAt?: string
}

export type FillType = 'air' | 'nitrox' | 'trimix'

export type Fill = {
	id: number
	type: FillType
	start: number
	end: number
	o2: number
	he: number
	cylinder?: Cylinder
}
