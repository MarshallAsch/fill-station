import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Fill = {
  id: number;
  type: "air" | "nitrox" | "trimix" | "heliox";
  start: number;
  end: number;
  o2: number;
  he: number;
  cylinder: string;
};

const initialState: Fill[] = [
  {
    id: 0,
    type: "air",
    start: 0,
    end: 3000,
    o2: 20.9,
    he: 0,
    cylinder: "",
  },
];

const fillSlice = createSlice({
  name: "fills",
  initialState,
  reducers: {
    addNewFill: (state) => {
      state.push({
        id: state.length,
        type: "air",
        start: 0,
        end: 0,
        o2: 20.9,
        he: 0,
        cylinder: "",
      });
    },
    removeFill: (state, action: PayloadAction<number>) => {
      return state.filter((fill) => fill.id !== action.payload);
    },
    updateFill: (state, action: PayloadAction<{ id: number; data: Fill }>) => {
      const { id, data } = action.payload;
      const fillIndex = state.findIndex((fill) => fill.id === id);
      if (fillIndex !== -1) {
        state[fillIndex] = { ...state[fillIndex], ...data };
      }
    },
  },
});

export const { addNewFill, removeFill, updateFill } = fillSlice.actions;
export default fillSlice.reducer;
