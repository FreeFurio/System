import React, { useState, useRef, useEffect } from "react";
import { FiBell, FiUser, FiSettings, FiLogOut, FiHome, FiUsers, FiCheckCircle, FiBarChart2, FiMenu, FiSend } from "react-icons/fi";
import { useUser } from './UserContext';
import "../../styles/Admin.css";
import { Link, useLocation, Outlet } from 'react-router-dom';
import NotificationBell from "./NotificationBell";
import AdminSettings from "../../pages/Admin/AdminSettings";
import { DarkModeProvider } from './DarkModeContext';
import { responsive } from '../../utils/responsive';

const DashboardLayout = () => {
  const { user, setUser } = useUser();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    console.log("User after logout (context):", user);
    console.log("User in localStorage after logout:", localStorage.getItem("user"));
    window.location.replace("/login");
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 768);

  return (
    <DarkModeProvider module="admin">
    <div className="admin-dashboard" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Full Width Header */}
      <div className="header" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        height: responsive.size(56, 64), 
        background: '#fff', 
        borderBottom: '1px solid #ececec', 
        padding: responsive.padding('0 16px', '0 32px'), 
        position: 'relative', 
        flexShrink: 0, 
        borderRadius: 0,
        width: '100vw',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Logo */}
          <img src="/assets/infinitylogo.png" alt="infinitysalon" style={{ height: responsive.size('32px', '40px'), width: 'auto' }} />
          {/* Hamburger Menu */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.target.style.background = '#f0f0f0'}
            onMouseLeave={e => e.target.style.background = 'none'}
          >
            <FiMenu size={20} color="#666" />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Notification Bell */}
          <NotificationBell role="Admin" style={{ marginRight: '20px' }} />
          {/* Profile Icon and Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={profileRef}>
            <button
              className="header-profile-btn"
              aria-label="Profile"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                marginLeft: '0px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '40px',
                width: '40px',
              }}
              onClick={() => setShowProfile((prev) => !prev)}
            >
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  style={{ 
                    width: 40, height: 40, borderRadius: '50%', 
                    objectFit: 'cover', flexShrink: 0
                  }} 
                />
              ) : (
                <span style={{ 
                  width: 40, height: 40, borderRadius: '50%', 
                  background: '#e74c3c',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  flexShrink: 0
                }}>
                  <FiUser size={24} color="#fff" />
                </span>
              )}
            </button>
            {showProfile && (
              <div style={{ position: 'absolute', right: 0, top: 44, background: '#fff', border: '1px solid #ececec', borderRadius: 10, minWidth: 200, zIndex: 10, boxShadow: 'none', padding: '12px 0' }}>
                <div style={{ padding: '0 16px 10px 16px', borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: '#222', fontSize: 16 }}>{user?.firstName} {user?.lastName}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{user?.role || 'Admin'}</div>
                </div>
                <button 
                  onClick={() => {
                    setShowSettings(true);
                    setShowProfile(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <FiSettings style={{ marginRight: 8 }} /> Settings
                </button>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}>
                  <FiLogOut style={{ marginRight: 8 }} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="dashboard-container" style={{ flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0 }}>
        {!sidebarCollapsed && (
          <div className="sidebar" style={{
            width: window.innerWidth <= 768 ? '100%' : '220px',
            background: '#ffffff',
            borderRight: window.innerWidth <= 768 ? 'none' : '1px solid #ececec',
            padding: responsive.padding('16px 0', '32px 0 24px 0'),
            borderRadius: 0,
            minWidth: window.innerWidth <= 768 ? 'auto' : '180px',
            fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            boxShadow: window.innerWidth <= 768 ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
            margin: 0,
            minHeight: 0,
            overflowY: 'auto',
            maxHeight: window.innerWidth <= 768 ? 'calc(100vh - 56px)' : 'calc(100vh - 124px)',
            position: window.innerWidth <= 768 ? 'fixed' : 'static',
            top: window.innerWidth <= 768 ? '56px' : 'auto',
            left: window.innerWidth <= 768 ? 0 : 'auto',
            zIndex: window.innerWidth <= 768 ? 1000 : 'auto'
          }}>
          {/* User Profile */}
          <div className="user-profile-divider-wrapper" style={{ position: 'relative', marginBottom: responsive.size(16, 32), padding: '0 12px' }}>
            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: responsive.gap(12, 16), padding: responsive.padding('16px', '20px 16px'), background: '#f8fafc', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  style={{ 
                    width: responsive.size(40, 48), height: responsive.size(40, 48), borderRadius: '50%', 
                    objectFit: 'cover', flexShrink: 0
                  }} 
                />
              ) : (
                <span style={{ 
                  width: responsive.size(40, 48), height: responsive.size(40, 48), borderRadius: '50%', 
                  background: '#e74c3c',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  flexShrink: 0
                }}>
                  <FiUser size={responsive.size(20, 28)} color="#fff" />
                </span>
              )}
              <div className="user-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                <div className="user-name" style={{ fontWeight: 700, fontSize: responsive.fontSize(16, 18), color: '#111827', lineHeight: '1.2', whiteSpace: 'normal', maxHeight: '2.4em', overflow: 'hidden' }}>{user?.firstName} {user?.lastName}</div>
                <div className="user-role" style={{ fontSize: responsive.fontSize(12, 13), color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{user?.role || 'Admin'}</div>
              </div>
            </div>
          </div>
          {/* Navigation - flat, modern */}
          <nav className="navigation" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, minHeight: 0, padding: '0 12px' }}>
            <Link
              to="/admin"
              className={`nav-item${location.pathname === '/admin' ? ' active' : ''}`}
              style={{ 
                padding: responsive.padding('12px 16px', '14px 20px'), 
                fontWeight: 600, 
                borderRadius: 12, 
                color: location.pathname === '/admin' ? '#fff' : '#374151', 
                background: location.pathname === '/admin' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent', 
                marginBottom: 6, 
                textDecoration: 'none', 
                transition: 'all 0.2s ease', 
                display: 'flex', 
                alignItems: 'center',
                boxShadow: location.pathname === '/admin' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none',
                fontSize: responsive.fontSize(14, 15)
              }}

            >
              <FiHome size={responsive.size(18, 20)} style={{ marginRight: responsive.gap(10, 14) }} />
              Dashboard
            </Link>
            <Link
              to="/admin/approval"
              className={`nav-item${location.pathname === '/admin/approval' ? ' active' : ''}`}
              style={{ 
                padding: responsive.padding('12px 16px', '14px 20px'), 
                fontWeight: 600, 
                borderRadius: 12, 
                color: location.pathname === '/admin/approval' ? '#fff' : '#374151', 
                background: location.pathname === '/admin/approval' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent', 
                marginBottom: 6, 
                textDecoration: 'none', 
                transition: 'all 0.2s ease', 
                display: 'flex', 
                alignItems: 'center',
                boxShadow: location.pathname === '/admin/approval' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none',
                fontSize: responsive.fontSize(14, 15)
              }}

            >
              <FiCheckCircle size={responsive.size(18, 20)} style={{ marginRight: responsive.gap(10, 14) }} />
              Approval of Accounts
            </Link>
            <Link
              to="/admin/manage"
              className={`nav-item${location.pathname === '/admin/manage' ? ' active' : ''}`}
              style={{ 
                padding: responsive.padding('12px 16px', '14px 20px'), 
                fontWeight: 600, 
                borderRadius: 12, 
                color: location.pathname === '/admin/manage' ? '#fff' : '#374151', 
                background: location.pathname === '/admin/manage' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent', 
                marginBottom: 6, 
                textDecoration: 'none', 
                transition: 'all 0.2s ease', 
                display: 'flex', 
                alignItems: 'center',
                boxShadow: location.pathname === '/admin/manage' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none',
                fontSize: responsive.fontSize(14, 15)
              }}

            >
              <FiUsers size={responsive.size(18, 20)} style={{ marginRight: responsive.gap(10, 14) }} />
              Manage Accounts
            </Link>
            <Link
              to="/admin/socials"
              className={`nav-item${location.pathname === '/admin/socials' ? ' active' : ''}`}
              style={{ 
                padding: responsive.padding('12px 16px', '14px 20px'), 
                fontWeight: 600, 
                borderRadius: 12, 
                color: location.pathname === '/admin/socials' ? '#fff' : '#374151', 
                background: location.pathname === '/admin/socials' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent', 
                marginBottom: 6, 
                textDecoration: 'none', 
                transition: 'all 0.2s ease', 
                display: 'flex', 
                alignItems: 'center',
                boxShadow: location.pathname === '/admin/socials' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none',
                fontSize: responsive.fontSize(14, 15)
              }}

            >
              <FiBarChart2 size={responsive.size(18, 20)} style={{ marginRight: responsive.gap(10, 14) }} />
              Socials & Insights
            </Link>
            <Link
              to="/admin/posted-contents"
              className={`nav-item${location.pathname === '/admin/posted-contents' ? ' active' : ''}`}
              style={{ 
                padding: responsive.padding('12px 16px', '14px 20px'), 
                fontWeight: 600, 
                borderRadius: 12, 
                color: location.pathname === '/admin/posted-contents' ? '#fff' : '#374151', 
                background: location.pathname === '/admin/posted-contents' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent', 
                marginBottom: 6, 
                textDecoration: 'none', 
                transition: 'all 0.2s ease', 
                display: 'flex', 
                alignItems: 'center',
                boxShadow: location.pathname === '/admin/posted-contents' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none',
                fontSize: responsive.fontSize(14, 15)
              }}

            >
              <FiSend size={responsive.size(18, 20)} style={{ marginRight: responsive.gap(10, 14) }} />
              Posted Contents
            </Link>
          </nav>
          </div>
        )}
        <div className="main-content" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 0, margin: 0, boxShadow: 'none', padding: '0 0 0 0' }}>
          <div className="content-area" style={{ flex: 1, padding: responsive.padding('16px', '24px'), overflowY: 'auto' }}>
            <Outlet />
          </div>
        </div>
      </div>
      {/* Admin Footer (self-contained, always at bottom) */}
      <footer className="admin-dashboard-footer" style={{ flexShrink: 0 }}>
        <div className="admin-dashboard-footer-container">
          <div className="admin-dashboard-footer-left">
            <img src="/assets/issalonnails.png" alt="infinitysalon" className="admin-dashboard-footer-logo" />
          </div>
        </div>
      </footer>
      
      <AdminSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
    </DarkModeProvider>
  );
};

export default DashboardLayout;