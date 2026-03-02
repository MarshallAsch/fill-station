import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Fill } from '@/types/fills'
import { Cylinder } from '@/types/cylinder'

type InitialState = {
	fills: Fill[]
}

const initialState: InitialState = {
	fills: [
		{
			id: 0,
			type: 'air',
			start: 0,
			end: 0,
			o2: 20.9,
			he: 0,
			cylinder: undefined,
		},
	],
}

const fillSlice = createSlice({
	name: 'fills',
	initialState,
	reducers: {
		addNewFill: (state) => {
			state.fills.push({
				id: state.fills.length,
				type: 'air',
				start: 0,
				end: 0,
				o2: 20.9,
				he: 0,
				cylinder: undefined,
			})
		},
		removeFill: (state, action: PayloadAction<number>) => {
			state.fills = state.fills.filter((fill) => fill.id !== action.payload)
		},
		updateFill: (state, action: PayloadAction<{ id: number; data: Fill }>) => {
			const { id, data } = action.payload
			const fillIndex = state.fills.findIndex((fill) => fill.id === id)
			if (fillIndex !== -1) {
				state.fills[fillIndex] = { ...state.fills[fillIndex], ...data }
			}
		},
		updateCylinder: (
			state,
			action: PayloadAction<{ id: number; data: Cylinder | undefined }>,
		) => {
			const { id, data } = action.payload
			const fillIndex = state.fills.findIndex((fill) => fill.id === id)
			if (fillIndex !== -1) {
				state.fills[fillIndex].cylinder = data
			}
		},
	},
})

export const { addNewFill, removeFill, updateFill, updateCylinder } =
	fillSlice.actions
export default fillSlice.reducer
