import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { Cylinder } from '../cylinder/cylinderSlice'

export enum TAB {
	FILLS = 'FILLS',
	VIS_INSPECTION = 'VISUAL_INSPECTION',
	COMP_MAINTENANCE = 'COMPRESSOR_MAINTENANCE',
}

export type FillHistory = {
	id: number
	name: string
	date: string
	mix: number
	start: number
	end: number
	cylinder: Cylinder
}

const initialState = {
	selectedTab: TAB.FILLS,
	fillHistory: [
		{
			id: 1,
			name: 'Marshall Asch',
			date: dayjs().format('MM/DD/YYYY'),
			mix: 20.9,
			start: 500,
			end: 3400,
			cylinder: {
				serialNumber: 'abcd-efg-hi',
				birthDate: null,
				lastHydro: null,
				lastVis: null,
				oxygenClean: false,
			},
		},
		{
			id: 2,
			name: 'Marshall Asch',
			date: dayjs().format('MM/DD/YYYY'),
			mix: 20.9,
			start: 500,
			end: 3400,
			cylinder: {
				serialNumber: 'abcd-efg-hi',
				birthDate: null,
				lastHydro: null,
				lastVis: null,
				oxygenClean: false,
			},
		},
	],
}

const historySlice = createSlice({
	name: 'fills',
	initialState,
	reducers: {
		setSelectedTab(state, action: PayloadAction<TAB>) {
			state.selectedTab = action.payload
		},
	},
})

export const { setSelectedTab } = historySlice.actions
export default historySlice.reducer
