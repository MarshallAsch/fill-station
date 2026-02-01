import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Cylinder } from '../cylinder/cylinderSlice'
import dayjs from 'dayjs'

export type FillHistory = {
	id: number
	name: string
	date: string
	mix: number
	start: number
	end: number
	cylinder: Cylinder
}

export enum TAB {
	FILLS = 'FILLS',
	VIS_INSPECTION = 'VISUAL_INSPECTION',
	COMP_MAINTENANCE = 'COMPRESSOR_MAINTENANCE',
}

export enum MAINTENANCE_TYPE {
	START = 'start',
	AIR_TEST = 'air-test',
	GENERAL = 'general',
	FILTER_CHANGE = 'filter-change',
	OIL_CHANGE = 'oil-change',
}

export type CompressorMaintenance = {
	id: number
	date: string
	type: MAINTENANCE_TYPE
	title: string
	content: string
}

type InitialState = {
	selectedTab: TAB
	fillHistory: FillHistory[]
	maintenanceTimeline: CompressorMaintenance[]
}

const initialState: InitialState = {
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
			},
		},
	],
	maintenanceTimeline: [
		{
			id: 1,
			date: dayjs('2024-11-21T00:00:00.000').toISOString(),
			type: MAINTENANCE_TYPE.START,
			title: 'Got the compressor',
			content: '',
		},
		{
			id: 2,
			date: dayjs('2025-01-10T00:00:00.000').toISOString(),
			type: MAINTENANCE_TYPE.AIR_TEST,
			title: 'Air analysis done',
			content: 'Buro Veritas',
		},
		{
			id: 3,
			date: dayjs('2025-11-10T00:00:00.000').toISOString(),
			type: MAINTENANCE_TYPE.OIL_CHANGE,
			title: 'Changed Oil',
			content: '',
		},
		{
			id: 4,
			date: dayjs('2025-03-10T00:00:00.000').toISOString(),
			type: MAINTENANCE_TYPE.FILTER_CHANGE,
			title: 'Changed Filter',
			content:
				'P21 on the compressor with a really really really really really long and really really detailed description of what was done. Like super duper really really really long because there was just so much to note that it all had to be written here because of all the super duper important details',
		},
		{
			id: 5,
			date: dayjs('2025-07-10T00:00:00.000').toISOString(),
			type: MAINTENANCE_TYPE.FILTER_CHANGE,
			title: 'Changed Filter',
			content: 'P21 on the compressor',
		},
		{
			id: 6,
			date: dayjs('2025-11-09T00:00:00.000').toISOString(),
			type: MAINTENANCE_TYPE.FILTER_CHANGE,
			title: 'Changed Filter',
			content: 'P21 on the compressor',
		},
		{
			id: 7,
			date: dayjs('2025-11-09T00:00:00.000').toISOString(),
			type: MAINTENANCE_TYPE.AIR_TEST,
			title: 'Air analysis done',
			content: 'Aircheck Lab',
		},
		{
			id: 8,
			date: dayjs('2025-11-10T00:00:00.000').toISOString(),
			type: MAINTENANCE_TYPE.FILTER_CHANGE,
			title: 'Changed Filter',
			content: 'P61 on the wall',
		},
		{
			id: 9,
			date: dayjs('2025-11-10T00:00:00.000').toISOString(),
			type: MAINTENANCE_TYPE.GENERAL,
			title: 'General Service',
			content: 'Inspected things',
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
