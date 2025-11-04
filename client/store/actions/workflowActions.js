import axios from 'axios';
import { setLoading, setError, setWorkflows } from '../slices/workflowSlice';

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/v1/tasks`
  : (import.meta.env.PROD ? '/api/v1/tasks' : 'http://localhost:3000/api/v1/tasks');

export const fetchWorkflows = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${API_URL}/workflows`);
    dispatch(setWorkflows(response.data.data));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to fetch workflows'));
  }
};

export const createWorkflow = (workflowData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await axios.post(`${API_URL}/workflow`, workflowData);
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to create workflow'));
    throw error;
  }
};

export const approveContent = (workflowId, approvedBy) => async (dispatch) => {
  try {
    await axios.post(`${API_URL}/workflow/${workflowId}/approve-content`, { approvedBy });
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to approve content'));
    throw error;
  }
};

export const rejectContent = (workflowId, rejectedBy, feedback) => async (dispatch) => {
  try {
    await axios.post(`${API_URL}/workflow/${workflowId}/reject-content`, { rejectedBy, feedback });
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to reject content'));
    throw error;
  }
};

export const deleteWorkflow = (workflowId) => async (dispatch) => {
  try {
    await axios.delete(`${API_URL}/workflow/${workflowId}`);
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to delete workflow'));
    throw error;
  }
};
