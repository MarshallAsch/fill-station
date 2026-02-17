import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Cylinder } from '@/types/cylinder'
import { Client } from '@/types/client'

type InitialState = {
	cylinder?: Cylinder
	client?: Client
}

const initialState: InitialState = {}

const visualsSlice = createSlice({
	name: 'visuals',
	initialState,
	reducers: {
		updateClient: (state, action: PayloadAction<Client | undefined>) => {
			state.client = action.payload
		},
		updateCylinder: (state, action: PayloadAction<Cylinder | undefined>) => {
			state.cylinder = action.payload
		},
	},
})

export const { updateClient, updateCylinder } = visualsSlice.actions
export default visualsSlice.reducer
