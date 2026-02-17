import { configureStore } from '@reduxjs/toolkit'
import fillsReducer from './fills/fillsSlice'
import cylinderReducer from './cylinder/cylinderSlice'
import clientReducer from './client/clientSlice'
import modalReducer from './modal/modalSlice'
import historyReducer from './history/historySlice'
import visualsReducer from './visuals/visualsSlice'

export const store = configureStore({
	reducer: {
		fills: fillsReducer,
		cylinders: cylinderReducer,
		clients: clientReducer,
		modal: modalReducer,
		history: historyReducer,
		visuals: visualsReducer,
	},
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
