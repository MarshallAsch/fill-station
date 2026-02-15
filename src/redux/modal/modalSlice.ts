import { Client } from '@/types/client'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type InitialState = {
	editClient?: Client
	addCylinderModalOpen: boolean
	addServiceModalOpen: boolean
	addClientModalOpen: boolean
	serviceModalHours: number
}

const initialState: InitialState = {
	editClient: undefined,
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
		updateEditClientModal(state, action: PayloadAction<Client | undefined>) {
			state.editClient = action.payload
		},
	},
})

export const {
	updateAddCylinderModalOpen,
	updateAddClientModalOpen,
	updateAddServiceModalOpen,
	updateServiceModalHours,
	updateEditClientModal,
} = modalSlice.actions
export default modalSlice.reducer
