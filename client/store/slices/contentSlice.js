import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  generatedContents: [],
  selectedContent: {
    facebook: { headline: '', caption: '', hashtag: '' },
    instagram: { headline: '', caption: '', hashtag: '' },
    twitter: { headline: '', caption: '', hashtag: '' }
  },
  selectedIds: {},
  availablePlatforms: [],
  taskId: null,
  workflowId: null,
  fromDraftEdit: false
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setGeneratedContents: (state, action) => {
      state.generatedContents = action.payload.contents;
      state.taskId = action.payload.taskId;
      state.workflowId = action.payload.workflowId;
      state.fromDraftEdit = action.payload.fromDraftEdit || false;
    },
    setAvailablePlatforms: (state, action) => {
      state.availablePlatforms = action.payload;
    },
    selectPlatformContent: (state, action) => {
      const { platform, type, content, contentId } = action.payload;
      state.selectedContent[platform][type] = content;
      state.selectedIds[`${platform}-${type}`] = contentId;
    },
    updateSelectedContent: (state, action) => {
      const { platform, type, content } = action.payload;
      state.selectedContent[platform][type] = content;
    },
    clearContent: (state) => {
      return initialState;
    }
  }
});

export const {
  setGeneratedContents,
  setAvailablePlatforms,
  selectPlatformContent,
  updateSelectedContent,
  clearContent
} = contentSlice.actions;

export default contentSlice.reducer;
