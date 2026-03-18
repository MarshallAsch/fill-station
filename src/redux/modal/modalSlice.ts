import { Client } from '@/types/client'
import { Cylinder } from '@/types/cylinder'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type InitialState = {
	editClient?: Client
	editCylinder?: Cylinder
	addCylinderModalOpen: boolean
	addCylinderDisableClient: boolean
	addServiceModalOpen: boolean
	addClientModalOpen: boolean
	serviceModalHours: number
}

const initialState: InitialState = {
	editClient: undefined,
	editCylinder: undefined,
	addCylinderModalOpen: false,
	addCylinderDisableClient: false,
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
		updateAddCylinderModalOpen(
			state,
			action: PayloadAction<{
				open: boolean
				disableClient?: boolean
			}>,
		) {
			state.addCylinderModalOpen = action.payload.open
			state.addCylinderDisableClient = action.payload.disableClient ?? false
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
		updateEditCylinderModal(
			state,
			action: PayloadAction<Cylinder | undefined>,
		) {
			state.editCylinder = action.payload
		},
	},
})

export const {
	updateAddCylinderModalOpen,
	updateAddClientModalOpen,
	updateAddServiceModalOpen,
	updateServiceModalHours,
	updateEditClientModal,
	updateEditCylinderModal,
} = modalSlice.actions
export default modalSlice.reducer
