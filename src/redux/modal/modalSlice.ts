import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type InitialState = {
	addCylinderModalOpen: boolean
	addClientModalOpen: boolean
}

const initialState: InitialState = {
	addCylinderModalOpen: false,
	addClientModalOpen: false,
}

const modalSlice = createSlice({
	name: 'modal',
	initialState,
	reducers: {
		updateAddCylinderModalOpen(state, action: PayloadAction<boolean>) {
			state.addCylinderModalOpen = action.payload
		},
		updateAddClientModalOpen(state, action: PayloadAction<boolean>) {
			state.addClientModalOpen = action.payload
		},
	},
})

export const { updateAddCylinderModalOpen, updateAddClientModalOpen } = modalSlice.actions
export default modalSlice.reducer
