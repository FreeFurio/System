import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null
};

const workflowSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setWorkflows: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addWorkflow: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateWorkflow: (state, action) => {
      const index = state.items.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    removeWorkflow: (state, action) => {
      state.items = state.items.filter(w => w.id !== action.payload);
    }
  }
});

export const {
  setLoading,
  setError,
  setWorkflows,
  addWorkflow,
  updateWorkflow,
  removeWorkflow
} = workflowSlice.actions;

export default workflowSlice.reducer;
