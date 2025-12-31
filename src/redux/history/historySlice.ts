import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export enum TAB {
	FILLS = 'FILLS',
	VIS_INSPECTION = 'VISUAL_INSPECTION',
	COMP_MAINTENANCE = 'COMPRESSOR_MAINTENANCE',
}

const initialState = {
	selectedTab: TAB.FILLS,
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
