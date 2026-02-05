import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Fill } from '@/types/fills'
import { Cylinder } from '@/types/cylinder'

const initialState: Fill[] = [
	{
		id: 0,
		type: 'air',
		start: 0,
		end: 3000,
		o2: 20.9,
		he: 0,
		cylinder: null,
	},
]

const fillSlice = createSlice({
	name: 'fills',
	initialState,
	reducers: {
		addNewFill: (state) => {
			state.push({
				id: state.length,
				type: 'air',
				start: 0,
				end: 0,
				o2: 20.9,
				he: 0,
				cylinder: null,
			})
		},
		removeFill: (state, action: PayloadAction<number>) => {
			return state.filter((fill) => fill.id !== action.payload)
		},
		updateFill: (state, action: PayloadAction<{ id: number; data: Fill }>) => {
			const { id, data } = action.payload
			const fillIndex = state.findIndex((fill) => fill.id === id)
			if (fillIndex !== -1) {
				state[fillIndex] = { ...state[fillIndex], ...data }
			}
		},
		updateCylinder: (
			state,
			action: PayloadAction<{ id: number; data: Cylinder | null }>,
		) => {
			const { id, data } = action.payload
			const fillIndex = state.findIndex((fill) => fill.id === id)
			if (fillIndex !== -1) {
				state[fillIndex].cylinder = data
			}
		},
	},
})

export const { addNewFill, removeFill, updateFill, updateCylinder } =
	fillSlice.actions
export default fillSlice.reducer
