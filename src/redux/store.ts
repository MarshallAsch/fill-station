import { configureStore } from '@reduxjs/toolkit'
import fillsReducer from './fills/fillsSlice'
import cylinderReducer from './cylinder/cylinderSlice'

export const store = configureStore({
	reducer: {
		fills: fillsReducer,
		cylinders: cylinderReducer,
	},
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
