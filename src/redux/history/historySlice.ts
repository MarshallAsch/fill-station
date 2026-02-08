import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { VisualHistory } from '@/types/visuals'
import { FillHistory } from '@/types/fills'

export enum TAB {
	FILLS = 'FILLS',
	VIS_INSPECTION = 'VISUAL_INSPECTION',
	COMP_MAINTENANCE = 'COMPRESSOR_MAINTENANCE',
	CLIENTS = 'CLIENTS',
	CYLINDERS = 'CYLINDERS',
}

type InitialState = {
	selectedTab: TAB
	fillHistory: FillHistory[]
	visHistory: VisualHistory[]
}

const initialState: InitialState = {
	selectedTab: TAB.FILLS,
	fillHistory: [],
	visHistory: [],
}

const historySlice = createSlice({
	name: 'fills',
	initialState,
	reducers: {
		setFillHistory: (state, action: PayloadAction<FillHistory[]>) => {
			state.fillHistory = action.payload
		},
		setVisHistory: (state, action: PayloadAction<VisualHistory[]>) => {
			state.visHistory = action.payload
		},
		setSelectedTab(state, action: PayloadAction<TAB>) {
			state.selectedTab = action.payload
		},
	},
})

export const { setFillHistory, setVisHistory, setSelectedTab } =
	historySlice.actions
export default historySlice.reducer
