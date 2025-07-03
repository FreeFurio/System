import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';

// Helper function to get the current user from localStorage
// (Replace with your actual user fetching logic if needed)
const getUser = () => {
  // The backend should provide user info (including role) after login
  // Example: { name: 'Jane', role: 'admin' }
  const user = JSON.parse(localStorage.getItem('user'));
  return user;
};

// AdminRoute: Only allows access to children if user is an admin
const AdminRoute = ({ children }) => {
  const { user } = useUser();
  const localUser = getUser();
  if (!localUser || localUser.role !== 'admin' || !user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default AdminRoute; 