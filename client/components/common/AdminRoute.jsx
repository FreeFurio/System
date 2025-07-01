import React from 'react';
import { Navigate } from 'react-router-dom';

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
  // const user = getUser();

  // if (!user || user.role !== 'admin') {
    // Not logged in or not an admin, show unauthorized message
    // return <div>Unauthorized: Admins only.</div>;
  // }

  // User is admin, allow access
  return children;
};

export default AdminRoute; 