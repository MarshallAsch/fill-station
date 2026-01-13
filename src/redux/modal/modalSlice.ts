import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type InitialState = {
	addCylinderModalOpen: boolean
	addServiceModalOpen: boolean
	addClientModalOpen: boolean
}

const initialState: InitialState = {
	addCylinderModalOpen: false,
	addServiceModalOpen: false,
	addClientModalOpen: false,
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
		updateAddClientModalOpen(state, action: PayloadAction<boolean>) {
			state.addClientModalOpen = action.payload
		},
	},
})

export const {
	updateAddCylinderModalOpen,
	updateAddClientModalOpen,
	updateAddServiceModalOpen,
} = modalSlice.actions
export default modalSlice.reducer
