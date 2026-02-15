import { Client } from '@/types/client'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type InitialState = {
	allClients: Client[]
}

const initialState: InitialState = {
	allClients: [],
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
	},
})

export const { setClients, addNewClient, removeClient, updateClient } =
	clientSlice.actions
export default clientSlice.reducer
