import { configureStore } from '@reduxjs/toolkit'
import fillsReducer from './fills/fillsSlice'
import cylinderReducer from './cylinder/cylinderSlice'
import clientReducer from './client/clientSlice'
import modalReducer from './modal/modalSlice'
import historyReducer from './history/historySlice'

export const store = configureStore({
	reducer: {
		fills: fillsReducer,
		cylinders: cylinderReducer,
		clients: clientReducer,
		modal: modalReducer,
		history: historyReducer,
	},
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
