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
}
