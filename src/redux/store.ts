import { configureStore } from "@reduxjs/toolkit";
import fillsReducer from "./fills/fillsSlice";
import cylinderReducer from "./cylinder/cylinderSlice";
import clientReducer from "./client/clientSlice";

export const store = configureStore({
  reducer: {
    fills: fillsReducer,
    cylinders: cylinderReducer,
    clients: clientReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
