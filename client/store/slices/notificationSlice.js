import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  unread: 0
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift({
        id: Date.now(),
        ...action.payload,
        read: false,
        timestamp: new Date().toISOString()
      });
      state.unread += 1;
    },
    markAsRead: (state, action) => {
      const notification = state.items.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unread -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(n => n.read = true);
      state.unread = 0;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unread = 0;
    }
  }
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;
