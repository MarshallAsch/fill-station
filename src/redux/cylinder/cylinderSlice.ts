import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";

export type Cylinder = {
  serialNumber: string;
  birthDate: dayjs.Dayjs | null;
  lastHydro: dayjs.Dayjs | null;
  lastVis: dayjs.Dayjs | null;
  oxygenClean: boolean;
};

// This will eventually be empty to start and populated with API Data
const initialState: Cylinder[] = [
  {
    serialNumber: "abcd-efg-hi",
    birthDate: null,
    lastHydro: null,
    lastVis: null,
    oxygenClean: false,
  },
];

const cylinderSlice = createSlice({
  name: "cylinders",
  initialState,
  reducers: {
    AddCylinders: (state, action: PayloadAction<Cylinder[]>) => {
      return [...state, ...action.payload];
    },
    updateCylinder: (
      state,
      action: PayloadAction<{ serialNumber: string; data: Cylinder }>,
    ) => {
      const { serialNumber, data } = action.payload;
      const cylinderIndex = state.findIndex(
        (cylinder) => cylinder.serialNumber === serialNumber,
      );
      if (cylinderIndex !== -1) {
        state[cylinderIndex] = { ...state[cylinderIndex], ...data };
      }
    },
  },
});

export const { AddCylinders, updateCylinder } = cylinderSlice.actions;
export default cylinderSlice.reducer;
