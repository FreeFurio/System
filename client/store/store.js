import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import workflowReducer from './slices/workflowSlice';
import notificationReducer from './slices/notificationSlice';
import socketReducer from './slices/socketSlice';
import contentReducer from './slices/contentSlice';
import designReducer from './slices/designSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['content', 'design']
};

const rootReducer = combineReducers({
  workflows: workflowReducer,
  notifications: notificationReducer,
  socket: socketReducer,
  content: contentReducer,
  design: designReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export const persistor = persistStore(store);
