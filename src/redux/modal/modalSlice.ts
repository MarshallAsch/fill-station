import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type InitialState = {
	addCylinderModalOpen: boolean
}

const initialState: InitialState = {
	addCylinderModalOpen: false,
}

const modalSlice = createSlice({
	name: 'modal',
	initialState,
	reducers: {
		updateAddCylinderModalOpen(state, action: PayloadAction<boolean>) {
			state.addCylinderModalOpen = action.payload
		},
	},
})

export const { updateAddCylinderModalOpen } = modalSlice.actions
export default modalSlice.reducer
