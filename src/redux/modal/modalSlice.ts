import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type InitialState = {
	addCylinderModalOpen: boolean
	addServiceModalOpen: boolean
	addClientModalOpen: boolean
	serviceModalHours: number
}

const initialState: InitialState = {
	addCylinderModalOpen: false,
	addServiceModalOpen: false,
	addClientModalOpen: false,
	serviceModalHours: 0,
}

const modalSlice = createSlice({
	name: 'modal',
	initialState,
	reducers: {
		updateServiceModalHours(state, action: PayloadAction<number>) {
			state.serviceModalHours = action.payload
		},
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
	updateServiceModalHours,
} = modalSlice.actions
export default modalSlice.reducer
