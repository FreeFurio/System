import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './pages/Register/RegisterForm';
import AddressForm from './pages/Register/AddressForm';
import PasswordInput from './components/shared/PasswordInput';
import SuccessMessage from './components/shared/SuccessMessage';
import OTPModal from './components/common/OTPModal';
import LoginPage from './pages/Login/LoginPage';
import Layout from './components/common/Layout';
import LoginForm from './pages/Login/LoginForm';
import ForgotPassword from './pages/Login/ForgotPassword';
import ResetPassword from './pages/Login/ResetPassword';
import "./styles/Register.css";
import "./styles/LoginForm.css";
import AdminDashboard from './pages/Admin/AdminDashboard';
import ApprovalOfAccountsPage from './pages/Admin/ApprovalOfAccountsPage';
import AdminRoute from './components/common/AdminRoute';
import ManageAccountsPage from './pages/Admin/ManageAccountsPage';
import DashboardLayout from './components/common/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="approval" element={
            <AdminRoute>
              <ApprovalOfAccountsPage />
            </AdminRoute>
          } />
          <Route path="manage" element={
            <AdminRoute>
              <ManageAccountsPage />
            </AdminRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;