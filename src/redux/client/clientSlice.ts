import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Client = {
	id: number
	name: string
	nitroxCert: string
	advancedNitroxCert: string
	trimixCert: string
}

type InitialState = {
	selectedClient: Client | null
	allClients: Client[]
}

const initialState: InitialState = {
	selectedClient: null,
	allClients: [],
}

const clientSlice = createSlice({
	name: 'clients',
	initialState,
	reducers: {
		setClients: (state, action: PayloadAction<Client[]>) => {
			state.allClients = action.payload;
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
		selectClient: (state, action: PayloadAction<number>) => {
			const clientIndex = state.allClients.findIndex(
				(client: Client) => client.id === action.payload,
			)
			if (clientIndex) {
				state.selectedClient = state.allClients[clientIndex]
			}
		},
	},
})

export const { setClients, addNewClient, removeClient, updateClient, selectClient } =
	clientSlice.actions
export default clientSlice.reducer
