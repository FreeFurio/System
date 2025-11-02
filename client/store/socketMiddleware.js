import io from 'socket.io-client';
import { setConnected, setDisconnected } from './slices/socketSlice';
import { addWorkflow, updateWorkflow, removeWorkflow } from './slices/workflowSlice';
import { addNotification } from './slices/notificationSlice';

let socket = null;

export const initializeSocket = (store) => {
  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
    withCredentials: true
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    store.dispatch(setConnected({ connected: true, socketId: socket.id }));
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
    store.dispatch(setDisconnected());
  });

  socket.on('workflow:created', (data) => {
    store.dispatch(addWorkflow(data));
    store.dispatch(addNotification({
      type: 'success',
      message: `New workflow created: ${data.workflow?.objectives || 'Task'}`
    }));
  });

  socket.on('workflow:content_submitted', (data) => {
    store.dispatch(updateWorkflow(data.workflow));
    store.dispatch(addNotification({
      type: 'info',
      message: data.message
    }));
  });

  socket.on('workflow:content_approved', (data) => {
    store.dispatch(updateWorkflow(data.workflow));
    store.dispatch(addNotification({
      type: 'success',
      message: data.message
    }));
  });

  socket.on('workflow:content_rejected', (data) => {
    store.dispatch(updateWorkflow(data.workflow));
    store.dispatch(addNotification({
      type: 'error',
      message: `${data.message}: ${data.feedback}`
    }));
  });

  socket.on('workflow:assigned_to_designer', (data) => {
    store.dispatch(updateWorkflow(data.workflow));
    store.dispatch(addNotification({
      type: 'info',
      message: data.message
    }));
  });

  socket.on('workflow:design_submitted', (data) => {
    store.dispatch(updateWorkflow(data.workflow));
    store.dispatch(addNotification({
      type: 'info',
      message: data.message
    }));
  });

  socket.on('workflow:design_approved', (data) => {
    store.dispatch(updateWorkflow(data.workflow));
    store.dispatch(addNotification({
      type: 'success',
      message: data.message
    }));
  });

  socket.on('workflow:design_rejected', (data) => {
    store.dispatch(updateWorkflow(data.workflow));
    store.dispatch(addNotification({
      type: 'error',
      message: `${data.message}: ${data.feedback}`
    }));
  });

  socket.on('workflow:deleted', (data) => {
    store.dispatch(removeWorkflow(data.workflowId));
    store.dispatch(addNotification({
      type: 'info',
      message: data.message
    }));
  });

  return socket;
};

export const getSocket = () => socket;
