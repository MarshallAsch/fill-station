import { Client } from '@/types/client'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type InitialState = {
	allClients: Client[]
	selectedClient: Client | null
	selectedInspector: Client | null
}

const initialState: InitialState = {
	allClients: [],
	selectedClient: null,
	selectedInspector: null,
}

const clientSlice = createSlice({
	name: 'clients',
	initialState,
	reducers: {
		setClients: (state, action: PayloadAction<Client[]>) => {
			state.allClients = action.payload
		},
		addNewClient: (state, action: PayloadAction<string>) => {
			state.allClients.push({
				id: state.allClients.length,
				name: action.payload,
				nitroxCert: '',
				advancedNitroxCert: '',
				trimixCert: '',
			})
		},
		removeClient: (state, action: PayloadAction<number>) => {
			state.allClients = state.allClients.filter(
				(client: Client) => client.id !== action.payload,
			)
		},
		updateClient: (
			state,
			action: PayloadAction<{ id: number; data: Client }>,
		) => {
			const { id, data } = action.payload
			const clientIndex = state.allClients.findIndex(
				(client: Client) => client.id === id,
			)
			if (clientIndex !== -1) {
				state.allClients[clientIndex] = {
					...state.allClients[clientIndex],
					...data,
				}
			}
		},
		setSelectedClient: (state, action: PayloadAction<Client | null>) => {
			state.selectedClient = action.payload
		},
		setSelectedInspector: (state, action: PayloadAction<Client | null>) => {
			state.selectedInspector = action.payload
		},
	},
})

export const {
	setClients,
	addNewClient,
	removeClient,
	updateClient,
	setSelectedClient,
	setSelectedInspector,
} = clientSlice.actions
export default clientSlice.reducer
