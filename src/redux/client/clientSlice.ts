import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Client = {
  id: number;
  name: string;
  nitroxCert: string;
  advancedNitroxCert: string;
  trimixCert: string;
};

const initialState: Client[] = [
  {
    id: 1,
    name: "Marshall Asch",
    nitroxCert: "123456 (TDI)",
    advancedNitroxCert: "456789 (TDI)",
    trimixCert: "",
  },
  {
    id: 2,
    name: "Bob",
    nitroxCert: "",
    advancedNitroxCert: "",
    trimixCert: "",
  },
  {
    id: 3,
    name: "Frank",
    nitroxCert: "444444 (TDI)",
    advancedNitroxCert: "",
    trimixCert: "",
  },
  {
    id: 4,
    name: "Jim",
    nitroxCert: "555 (TDI)",
    advancedNitroxCert: "666 (TDI)",
    trimixCert: "200000 (TDI)",
  },
];

const clientSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    addNewClient: (state, action: PayloadAction<string>) => {
      state.push({
        id: state.length,
        name: action.payload,
        nitroxCert: "",
        advancedNitroxCert: "",
        trimixCert: "",
      });
    },
    removeClient: (state, action: PayloadAction<number>) => {
      return state.filter((client) => client.id !== action.payload);
    },
    updateClient: (
      state,
      action: PayloadAction<{ id: number; data: Client }>,
    ) => {
      const { id, data } = action.payload;
      const clientIndex = state.findIndex((client) => client.id === id);
      if (clientIndex !== -1) {
        state[clientIndex] = { ...state[clientIndex], ...data };
      }
    },
  },
});

export const { addNewClient, removeClient, updateClient } = clientSlice.actions;
export default clientSlice.reducer;
