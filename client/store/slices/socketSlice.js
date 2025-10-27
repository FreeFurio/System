import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: false,
  socketId: null
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.connected = action.payload.connected;
      state.socketId = action.payload.socketId;
    },
    setDisconnected: (state) => {
      state.connected = false;
      state.socketId = null;
    }
  }
});

export const { setConnected, setDisconnected } = socketSlice.actions;

export default socketSlice.reducer;
