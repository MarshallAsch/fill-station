import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type InitialState = {
	addCylinderModalOpen: boolean
	addServiceModalOpen: boolean
}

const initialState: InitialState = {
	addCylinderModalOpen: false,
	addServiceModalOpen: false,
}

const modalSlice = createSlice({
	name: 'modal',
	initialState,
	reducers: {
		updateAddCylinderModalOpen(state, action: PayloadAction<boolean>) {
			state.addCylinderModalOpen = action.payload
		},
		updateAddServiceModalOpen(state, action: PayloadAction<boolean>) {
			state.addServiceModalOpen = action.payload
		},
	},
})

export const { updateAddCylinderModalOpen, updateAddServiceModalOpen } =
	modalSlice.actions
export default modalSlice.reducer
