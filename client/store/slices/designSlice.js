import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  taskId: null,
  workflow: null,
  canvasData: null,
  selectedEditor: 'original',
  designUrl: null
};

const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    setDesignTask: (state, action) => {
      state.taskId = action.payload.taskId;
      state.workflow = action.payload.workflow;
      state.canvasData = action.payload.canvasData;
    },
    updateCanvasData: (state, action) => {
      state.canvasData = action.payload;
    },
    setSelectedEditor: (state, action) => {
      state.selectedEditor = action.payload;
    },
    setDesignUrl: (state, action) => {
      state.designUrl = action.payload;
    },
    clearDesign: (state) => {
      return initialState;
    }
  }
});

export const {
  setDesignTask,
  updateCanvasData,
  setSelectedEditor,
  setDesignUrl,
  clearDesign
} = designSlice.actions;

export default designSlice.reducer;
