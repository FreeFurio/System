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
// Marketing Lead imports
import MarketingLeadLayout from './pages/MarketingLead/MarketingLeadLayout';
import Dashboard from './pages/MarketingLead/Dashboard';
import ContentCalendar from './pages/MarketingLead/ContentCalendar';
import ApprovalOfContents from './pages/MarketingLead/ApprovalOfContents';
import ApprovedContents from './pages/MarketingLead/ApprovedContents';
import SetTask from './pages/MarketingLead/SetTask';
import OngoingTask from './pages/MarketingLead/OngoingTask';
import SetSchedule from './pages/MarketingLead/SetSchedule';
import OngoingSchedule from './pages/MarketingLead/OngoingSchedule';
import PostedContent from './pages/MarketingLead/PostedContent';
import SetTaskGraphicDesigner from './pages/MarketingLead/SetTaskGraphicDesigner';
import ContentCreatorLayout from './pages/ContentCreator/ContentCreatorLayout';
import ContentCreatorDashboard from './pages/ContentCreator/Dashboard';
import CreateContent from './pages/ContentCreator/CreateContent';
import ContentCreatorTask from './pages/ContentCreator/Task';
import GraphicDesignerLayout from './pages/GraphicDesigner/GraphicDesignerLayout';
import GraphicDesignerDashboard from './pages/GraphicDesigner/Dashboard';
import GraphicDesignerTask from './pages/GraphicDesigner/Task';
import GraphicCreation from './pages/GraphicDesigner/GraphicCreation';
import OutputContent from './pages/ContentCreator/OutputContent';

// Add global font import
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// Set base font-family globally
const style = document.createElement('style');
style.innerHTML = `body, html, #root {
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif !important;
  background: #f6f8fa;
  color: #222;
  letter-spacing: 0.01em;
}`;
document.head.appendChild(style);

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
        {/* Marketing Lead Routes */}
        <Route path="/marketing" element={<MarketingLeadLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="content-calendar" element={<ContentCalendar />} />
          <Route path="approval" element={<ApprovalOfContents />} />
          <Route path="approved" element={<ApprovedContents />} />
          <Route path="set-task" element={<SetTask />} />
          <Route path="set-task-graphic-designer" element={<SetTaskGraphicDesigner />} />
          <Route path="ongoing-task" element={<OngoingTask />} />
          <Route path="set-schedule" element={<SetSchedule />} />
          <Route path="ongoing-schedule" element={<OngoingSchedule />} />
          <Route path="posted-content" element={<PostedContent />} />
        </Route>
        {/* Content Creator Routes */}
        <Route path="/content" element={<ContentCreatorLayout />}>
          <Route index element={<ContentCreatorDashboard />} />
          <Route path="dashboard" element={<ContentCreatorDashboard />} />
          <Route path="create" element={<CreateContent />} />
          <Route path="output" element={<OutputContent />} />
          <Route path="task" element={<ContentCreatorTask />} />
        </Route>
        {/* Graphic Designer Routes */}
        <Route path="/graphic" element={<GraphicDesignerLayout />}>
          <Route path="creation" element={<GraphicCreation />} />
          <Route index element={<GraphicDesignerDashboard />} />
          <Route path="dashboard" element={<GraphicDesignerDashboard />} />
          <Route path="task" element={<GraphicDesignerTask />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;