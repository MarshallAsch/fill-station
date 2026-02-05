import { Cylinder } from '@/types/cylinder'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type InitialState = {
	cylinders: Cylinder[]
}

const initialState: InitialState = {
	cylinders: [],
}

const cylinderSlice = createSlice({
	name: 'cylinders',
	initialState,
	reducers: {
		setCylinders: (state, action: PayloadAction<Cylinder[]>) => {
			state.cylinders = action.payload
		},
		AddCylinders: (state, action: PayloadAction<Cylinder[]>) => {
			state.cylinders.push(...action.payload)
		},
		updateCylinder: (
			state,
			action: PayloadAction<{ serialNumber: string; data: Cylinder }>,
		) => {
			const { serialNumber, data } = action.payload
			const cylinderIndex = state.cylinders.findIndex(
				(cylinder) => cylinder.serialNumber === serialNumber,
			)
			if (cylinderIndex !== -1) {
				state.cylinders[cylinderIndex] = {
					...state.cylinders[cylinderIndex],
					...data,
				}
			}
		},
	},
})

export const { setCylinders, AddCylinders, updateCylinder } =
	cylinderSlice.actions
export default cylinderSlice.reducer
